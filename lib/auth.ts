import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // admin_profiles는 service role로 조회 (GRANT 없이도 동작)
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile ? user : null;
}
