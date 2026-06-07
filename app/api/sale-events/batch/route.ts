import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth';
import { computeSaleStatus } from '@/lib/sale-status';

export async function POST(req: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { events } = await req.json();

  if (!Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ error: 'events array is required' }, { status: 400 });
  }

  for (const e of events) {
    if (!e.brand_id || !e.title || !e.start_date || !e.end_date) {
      return NextResponse.json(
        { error: `Missing required fields in event: ${e.title ?? '(no title)'}` },
        { status: 400 }
      );
    }
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('sale_events')
    .insert(
      events.map((e: Record<string, unknown>) => ({
        brand_id: e.brand_id,
        title: e.title,
        start_date: e.start_date,
        end_date: e.end_date,
        discount_rate: e.discount_rate ?? null,
        description: e.description ?? null,
        status: computeSaleStatus(e.start_date as string, e.end_date as string),
      }))
    )
    .select();

  if (error) return NextResponse.json({ error: 'DB error' }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
