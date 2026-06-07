import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth';
import { computeSaleStatus } from '@/lib/sale-status';

export async function GET() {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('sale_events')
    .select('*, brand:brands(id, name, color)')
    .order('start_date', { ascending: false });

  if (error) return NextResponse.json({ error: 'DB error' }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { brand_id, title, start_date, end_date, description } = body;

  if (!brand_id || !title || !start_date || !end_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const status = computeSaleStatus(start_date, end_date);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('sale_events')
    .insert({ brand_id, title, start_date, end_date, description, status })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'DB error' }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
