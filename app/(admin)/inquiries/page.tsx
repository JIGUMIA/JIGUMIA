import { createAdminClient } from '@/lib/supabase/server';
import InquiriesClient from '@/components/inquiries/InquiriesClient';

export default async function InquiriesPage() {
  const supabase = createAdminClient();
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  return <InquiriesClient initialInquiries={inquiries ?? []} />;
}
