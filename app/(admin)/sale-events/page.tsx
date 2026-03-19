import { createAdminClient } from '@/lib/supabase/server';
import SaleEventsClient from '@/components/sale-events/SaleEventsClient';

export default async function SaleEventsPage() {
  const supabase = createAdminClient();
  const [{ data: events }, { data: brands }] = await Promise.all([
    supabase
      .from('sale_events')
      .select('*, brand:brands(id, name, color)')
      .order('start_date', { ascending: false }),
    supabase.from('brands').select('id, name, color').order('name'),
  ]);

  return <SaleEventsClient initialEvents={events ?? []} brands={brands ?? []} />;
}
