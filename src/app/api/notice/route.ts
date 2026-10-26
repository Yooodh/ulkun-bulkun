import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
};

export async function GET() {
  const { data, error } = await supabase
    .from('notices')
    .select('version, date, title, content, highlight, link_url')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(null, { status: 500 });
  }

  return NextResponse.json(data, { headers: CACHE_HEADERS });
}
