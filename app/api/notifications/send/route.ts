import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_TOKEN = process.env.EXPO_ACCESS_TOKEN;
const TITLE_MAX = 65;
const BODY_MAX = 240;

type Target = 'all' | 'brand';

interface SendBody {
  title: string;
  body: string;
  deep_link?: string;
  target: Target;
  brand_id?: string;
}

interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  data: Record<string, string>;
  sound: 'default';
}

async function pushBatch(messages: ExpoMessage[]) {
  if (messages.length === 0) return { tickets: [], raw: null, ok: true, status: 0 };
  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept-encoding': 'gzip, deflate',
      ...(EXPO_TOKEN ? { Authorization: `Bearer ${EXPO_TOKEN}` } : {}),
    },
    body: JSON.stringify(messages),
  });
  const json = await res.json().catch(() => null);
  console.log('[notify] expo response', res.status, JSON.stringify(json));
  const tickets = (json?.data ?? []) as Array<{ status: string; id?: string; details?: { error?: string } }>;
  return { tickets, raw: json, ok: res.ok, status: res.status };
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: SendBody;
  try {
    body = (await req.json()) as SendBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const title = (body.title ?? '').trim();
  const text = (body.body ?? '').trim();
  const target = body.target;
  const brandId = body.brand_id;
  const deepLink = body.deep_link?.trim() || null;

  if (!title || title.length > TITLE_MAX) {
    return NextResponse.json({ error: `title required, max ${TITLE_MAX} chars` }, { status: 400 });
  }
  if (!text || text.length > BODY_MAX) {
    return NextResponse.json({ error: `body required, max ${BODY_MAX} chars` }, { status: 400 });
  }
  if (target !== 'all' && target !== 'brand') {
    return NextResponse.json({ error: 'target must be "all" or "brand"' }, { status: 400 });
  }
  if (target === 'brand' && !brandId) {
    return NextResponse.json({ error: 'brand_id required when target=brand' }, { status: 400 });
  }
  if (deepLink && !deepLink.startsWith('jigumia://')) {
    return NextResponse.json({ error: 'deep_link must start with jigumia://' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 1) target user_ids
  let userIds: string[] = [];

  if (target === 'all') {
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('user_id')
      .eq('push_enabled', true);
    if (error) {
      console.error('[notify] prefs (all)', error);
      return NextResponse.json({ error: `DB error (prefs): ${error.message}`, code: error.code, hint: error.hint }, { status: 500 });
    }
    userIds = (data ?? []).map((r) => r.user_id as string);
  } else {
    const { data: favs, error: favErr } = await supabase
      .from('user_favorites')
      .select('user_id')
      .eq('brand_id', brandId!);
    if (favErr) {
      console.error('[notify] favorites', favErr);
      return NextResponse.json({ error: `DB error (favorites): ${favErr.message}`, code: favErr.code, hint: favErr.hint }, { status: 500 });
    }

    const candidates = (favs ?? []).map((r) => r.user_id as string);
    if (candidates.length === 0) {
      return NextResponse.json({ sent: 0, dead: 0, target_count: 0 });
    }

    const { data: prefs, error: prefErr } = await supabase
      .from('user_notification_preferences')
      .select('user_id')
      .in('user_id', candidates)
      .eq('push_enabled', true);
    if (prefErr) {
      console.error('[notify] prefs (brand)', prefErr);
      return NextResponse.json({ error: `DB error (prefs): ${prefErr.message}`, code: prefErr.code, hint: prefErr.hint }, { status: 500 });
    }

    const { data: disabled } = await supabase
      .from('user_notification_settings')
      .select('user_id')
      .in('user_id', candidates)
      .eq('brand_id', brandId!)
      .eq('enabled', false);
    const disabledSet = new Set((disabled ?? []).map((r) => r.user_id as string));

    userIds = (prefs ?? [])
      .map((r) => r.user_id as string)
      .filter((id) => !disabledSet.has(id));
  }

  if (userIds.length === 0) {
    return NextResponse.json({ sent: 0, dead: 0, target_count: 0 });
  }

  // 2) tokens
  const { data: tokens, error: tokErr } = await supabase
    .from('push_tokens')
    .select('user_id, expo_push_token')
    .in('user_id', userIds);
  if (tokErr) {
    console.error('[notify] tokens', tokErr);
    return NextResponse.json({ error: `DB error (tokens): ${tokErr.message}`, code: tokErr.code, hint: tokErr.hint }, { status: 500 });
  }

  const targetCount = userIds.length;
  const rows = (tokens ?? []) as Array<{ user_id: string; expo_push_token: string }>;
  if (rows.length === 0) {
    return NextResponse.json({ sent: 0, dead: 0, target_count: targetCount });
  }

  // 3) messages + history rows
  const messages: ExpoMessage[] = [];
  const historyRows: Array<Record<string, unknown>> = [];
  const tokensSent: string[] = [];

  for (const t of rows) {
    messages.push({
      to: t.expo_push_token,
      title,
      body: text,
      data: {
        url: deepLink ?? 'jigumia://',
        source: 'server',
        type: 'marketing',
      },
      sound: 'default',
    });
    historyRows.push({
      user_id: t.user_id,
      brand_id: target === 'brand' ? brandId : null,
      type: 'marketing',
      title,
      body: text,
      deep_link: deepLink,
    });
    tokensSent.push(t.expo_push_token);
  }

  if (historyRows.length > 0) {
    await supabase.from('notification_history').insert(historyRows);
  }

  // 4) batch send (chunks of 100)
  const responses: Array<{ status: string; id?: string; details?: { error?: string } }> = [];
  const errorMessages: string[] = [];
  let firstFailedRaw: unknown = null;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const { tickets, raw, ok, status } = await pushBatch(chunk);
    if (!ok) {
      errorMessages.push(`Expo API HTTP ${status}`);
      if (!firstFailedRaw) firstFailedRaw = raw;
    }
    responses.push(...tickets);
  }

  // 5) cleanup dead tokens + collect ticket errors
  const dead: string[] = [];
  const ticketErrors: string[] = [];
  responses.forEach((r, idx) => {
    if (r.status === 'error') {
      ticketErrors.push(r.details?.error ?? 'unknown');
      if (r.details?.error === 'DeviceNotRegistered') {
        dead.push(tokensSent[idx]);
      }
    }
  });
  if (dead.length > 0) {
    await supabase.from('push_tokens').delete().in('expo_push_token', dead);
  }

  const okTickets = responses.filter((r) => r.status === 'ok').length;
  console.log('[notify] summary', { attempted: messages.length, okTickets, dead: dead.length, ticketErrors, httpErrors: errorMessages });

  return NextResponse.json({
    sent: okTickets,
    attempted: messages.length,
    dead: dead.length,
    ticket_errors: ticketErrors.length > 0 ? ticketErrors : undefined,
    http_errors: errorMessages.length > 0 ? errorMessages : undefined,
    debug_raw: firstFailedRaw ?? undefined,
    target_count: targetCount,
  });
}
