import { createAdminClient } from '@/lib/supabase/server';
import BrandsClient from '@/components/brands/BrandsClient';

export default async function BrandsPage() {
  const supabase = createAdminClient();
  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  return <BrandsClient initialBrands={brands ?? []} />;
}
