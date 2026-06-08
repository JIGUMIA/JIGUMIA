import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, category, website_url, color, logo_url, description } = body;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('brands')
    .update({ name, category, website_url, color, logo_url, description })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[brands:patch] DB error:', error);
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from('brands').delete().eq('id', id);

  if (error) {
    console.error('[brands:delete] DB error:', error);
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
