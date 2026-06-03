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
  if (messages.length === 0) return [];
  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept-encoding': 'gzip, deflate',
      ...(EXPO_TOKEN ? { Authorization: `Bearer ${EXPO_TOKEN}` } : {}),
    },
    body: JSON.stringify(messages),
  });
  const json = await res.json();
  return (json?.data ?? []) as Array<{ status: string; details?: { error?: string } }>;
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
    if (error) return NextResponse.json({ error: 'DB error (prefs)' }, { status: 500 });
    userIds = (data ?? []).map((r) => r.user_id as string);
  } else {
    const { data: favs, error: favErr } = await supabase
      .from('user_favorites')
      .select('user_id')
      .eq('brand_id', brandId!);
    if (favErr) return NextResponse.json({ error: 'DB error (favorites)' }, { status: 500 });

    const candidates = (favs ?? []).map((r) => r.user_id as string);
    if (candidates.length === 0) {
      return NextResponse.json({ sent: 0, dead: 0, target_count: 0 });
    }

    const { data: prefs, error: prefErr } = await supabase
      .from('user_notification_preferences')
      .select('user_id')
      .in('user_id', candidates)
      .eq('push_enabled', true);
    if (prefErr) return NextResponse.json({ error: 'DB error (prefs)' }, { status: 500 });

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
  if (tokErr) return NextResponse.json({ error: 'DB error (tokens)' }, { status: 500 });

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
  const responses: Array<{ status: string; details?: { error?: string } }> = [];
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const res = await pushBatch(chunk);
    responses.push(...res);
  }

  // 5) cleanup dead tokens
  const dead: string[] = [];
  responses.forEach((r, idx) => {
    if (r.status === 'error' && r.details?.error === 'DeviceNotRegistered') {
      dead.push(tokensSent[idx]);
    }
  });
  if (dead.length > 0) {
    await supabase.from('push_tokens').delete().in('expo_push_token', dead);
  }

  return NextResponse.json({
    sent: messages.length,
    dead: dead.length,
    target_count: targetCount,
  });
}
