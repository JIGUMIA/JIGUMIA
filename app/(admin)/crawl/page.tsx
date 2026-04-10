import { createAdminClient } from '@/lib/supabase/server';
import CrawlClient from '@/components/crawl/CrawlClient';

export default async function CrawlPage() {
  const supabase = createAdminClient();
  const { data: brands } = await supabase
    .from('brands')
    .select('id, name, color')
    .order('name');

  return <CrawlClient brands={brands ?? []} />;
}
