import { createAdminClient } from '@/lib/supabase/server';
import SendPushClient from '@/components/notifications/SendPushClient';

export default async function NotificationsPage() {
  const supabase = createAdminClient();
  const [{ data: brands }, { count: tokenCount }, { count: userCount }, { data: recent }] = await Promise.all([
    supabase.from('brands').select('id, name, color').order('name'),
    supabase.from('push_tokens').select('id', { count: 'exact', head: true }),
    supabase
      .from('user_notification_preferences')
      .select('user_id', { count: 'exact', head: true })
      .eq('push_enabled', true),
    supabase
      .from('notification_history')
      .select('id, title, body, type, sent_at, brand_id')
      .eq('type', 'marketing')
      .order('sent_at', { ascending: false })
      .limit(10),
  ]);

  return (
    <SendPushClient
      brands={brands ?? []}
      tokenCount={tokenCount ?? 0}
      userCount={userCount ?? 0}
      recentMarketing={recent ?? []}
    />
  );
}
