import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth';

export async function GET() {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('brands').select('*').order('name');
  if (error) {
    console.error('[brands:get] DB error:', error);
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, category, website_url, color, logo_url, description } = body;

  if (!name || !category || !website_url) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('brands')
    .insert({ name, category, website_url, color, logo_url, description })
    .select()
    .single();

  if (error) {
    console.error('[brands:post] DB error:', error);
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
