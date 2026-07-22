import type { SupabaseClient } from '@supabase/supabase-js';

export type Target = 'all' | 'brand';

/**
 * 발송 대상 user_id 목록을 계산한다. 미리보기(recipients)와 실제 발송(send)이
 * 항상 동일한 대상을 쓰도록 이 헬퍼를 공유한다.
 * - all:   푸시 켠(push_enabled) 전체 유저
 * - brand: 해당 브랜드 관심 등록 + 푸시 켬 + 브랜드별 알림 끄지 않은 유저
 */
export async function resolveTargetUserIds(
  supabase: SupabaseClient,
  target: Target,
  brandId?: string,
): Promise<string[]> {
  if (target === 'all') {
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('user_id')
      .eq('push_enabled', true);
    if (error) throw new Error(`prefs: ${error.message}`);
    return (data ?? []).map((r) => r.user_id as string);
  }

  if (!brandId) return [];

  const { data: favs, error: favErr } = await supabase
    .from('user_favorites')
    .select('user_id')
    .eq('brand_id', brandId);
  if (favErr) throw new Error(`favorites: ${favErr.message}`);

  const candidates = (favs ?? []).map((r) => r.user_id as string);
  if (candidates.length === 0) return [];

  const { data: prefs, error: prefErr } = await supabase
    .from('user_notification_preferences')
    .select('user_id')
    .in('user_id', candidates)
    .eq('push_enabled', true);
  if (prefErr) throw new Error(`prefs: ${prefErr.message}`);

  const { data: disabled } = await supabase
    .from('user_notification_settings')
    .select('user_id')
    .in('user_id', candidates)
    .eq('brand_id', brandId)
    .eq('enabled', false);
  const disabledSet = new Set((disabled ?? []).map((r) => r.user_id as string));

  return (prefs ?? [])
    .map((r) => r.user_id as string)
    .filter((id) => !disabledSet.has(id));
}

export interface RecipientStats {
  users: number;
  devices: number;
  ios: number;
  android: number;
  unknown: number;
}

/** 대상 유저들의 기기(토큰) 수를 플랫폼별로 집계한다. */
export async function countRecipients(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<RecipientStats> {
  if (userIds.length === 0) {
    return { users: 0, devices: 0, ios: 0, android: 0, unknown: 0 };
  }
  const { data: tokens, error } = await supabase
    .from('push_tokens')
    .select('platform')
    .in('user_id', userIds);
  if (error) throw new Error(`tokens: ${error.message}`);

  const rows = (tokens ?? []) as Array<{ platform: string | null }>;
  let ios = 0, android = 0, unknown = 0;
  for (const r of rows) {
    if (r.platform === 'ios') ios++;
    else if (r.platform === 'android') android++;
    else unknown++;
  }
  return { users: userIds.length, devices: rows.length, ios, android, unknown };
}
