import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile ? user : null;
}

export async function GET() {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('brands').select('*').order('name');
  if (error) return NextResponse.json({ error: 'DB error' }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, category, website_url, color, logo_url } = body;

  if (!name || !category || !website_url) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('brands')
    .insert({ name, category, website_url, color, logo_url })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'DB error' }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
