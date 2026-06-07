import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth';
import { computeSaleStatus } from '@/lib/sale-status';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  delete body.status;

  const supabase = createAdminClient();

  let start_date = body.start_date as string | undefined;
  let end_date = body.end_date as string | undefined;
  if (!start_date || !end_date) {
    const { data: existing } = await supabase
      .from('sale_events')
      .select('start_date, end_date')
      .eq('id', id)
      .single();
    start_date = start_date ?? existing?.start_date;
    end_date = end_date ?? existing?.end_date;
  }

  const update = start_date && end_date
    ? { ...body, status: computeSaleStatus(start_date, end_date) }
    : body;

  const { data, error } = await supabase
    .from('sale_events')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[sale-events:patch] DB error:', error);
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from('sale_events').delete().eq('id', id);

  if (error) {
    console.error('[sale-events:delete] DB error:', error);
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
