import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { getCrawler, PLATFORMS, Platform } from '@/lib/crawlers';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { platform } = await params;

  if (!PLATFORMS.includes(platform as Platform)) {
    return NextResponse.json(
      { error: `Invalid platform: ${platform}. Must be one of: ${PLATFORMS.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const crawler = getCrawler(platform as Platform);
    const results = await crawler.crawl();
    return NextResponse.json({ results, errors: [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ results: [], errors: [message] }, { status: 200 });
  }
}
