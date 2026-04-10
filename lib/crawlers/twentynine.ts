import * as cheerio from 'cheerio';
import { CrawlResult, Crawler } from './types';

const TWENTYNINE_SALE_URL = 'https://www.29cm.co.kr/collections/sale';

export class TwentynineCrawler implements Crawler {
  async crawl(): Promise<CrawlResult[]> {
    const res = await fetch(TWENTYNINE_SALE_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      throw new Error(`29cm 페이지 접속 실패: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const results: CrawlResult[] = [];

    $('.exhibition-item, .sale-item, [class*="promotion"] li, [class*="exhibition"] li').each(
      (_, el) => {
        const title = $(el).find('.title, .tit, h3, [class*="title"]').first().text().trim();
        const dateText = $(el).find('.date, .period, [class*="date"]').first().text().trim();
        const description = $(el).find('.desc, .txt, p').first().text().trim();
        const link = $(el).find('a').attr('href') ?? '';
        const sourceUrl = link.startsWith('http')
          ? link
          : `https://www.29cm.co.kr${link}`;

        if (!title) return;

        const { startDate, endDate } = parseDateRange(dateText);

        results.push({
          platform: '29cm',
          title,
          start_date: startDate,
          end_date: endDate,
          discount_rate: extractDiscount($(el).text()),
          description: description || title,
          source_url: sourceUrl || TWENTYNINE_SALE_URL,
        });
      }
    );

    return results;
  }
}

function parseDateRange(text: string): { startDate: string | null; endDate: string | null } {
  const match = text.match(
    /(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})\s*[~\-]\s*(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/
  );
  if (match) {
    const [, y1, m1, d1, y2, m2, d2] = match;
    return {
      startDate: `${y1}-${m1.padStart(2, '0')}-${d1.padStart(2, '0')}`,
      endDate: `${y2}-${m2.padStart(2, '0')}-${d2.padStart(2, '0')}`,
    };
  }
  return { startDate: null, endDate: null };
}

function extractDiscount(text: string): string | null {
  const match = text.match(/(최대\s*)?\d+%/);
  return match ? match[0] : null;
}
