import * as cheerio from 'cheerio';
import { CrawlResult, Crawler } from './types';

const OLIVEYOUNG_SALE_URL = 'https://www.oliveyoung.co.kr/store/main/getPromotionList.do';

export class OliveyoungCrawler implements Crawler {
  async crawl(): Promise<CrawlResult[]> {
    const res = await fetch(OLIVEYOUNG_SALE_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      throw new Error(`올리브영 페이지 접속 실패: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const results: CrawlResult[] = [];

    // 프로모션 리스트 항목 파싱
    // 실제 셀렉터는 HTML 구조 확인 후 조정 필요
    $('.promo-item, .exhibition-item, .plan_list li').each((_, el) => {
      const title = $(el).find('.title, .tit, h3').first().text().trim();
      const dateText = $(el).find('.date, .period, .txt_date').first().text().trim();
      const description = $(el).find('.desc, .txt, p').first().text().trim();
      const link = $(el).find('a').attr('href') ?? '';
      const sourceUrl = link.startsWith('http')
        ? link
        : `https://www.oliveyoung.co.kr${link}`;

      if (!title) return;

      const { startDate, endDate } = parseDateRange(dateText);

      results.push({
        platform: 'oliveyoung',
        title,
        start_date: startDate,
        end_date: endDate,
        discount_rate: extractDiscount($(el).text()),
        description: description || title,
        source_url: sourceUrl || OLIVEYOUNG_SALE_URL,
      });
    });

    return results;
  }
}

/** "2026.04.10 ~ 2026.04.20" 같은 형식 파싱 */
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

/** 텍스트에서 할인율 추출 (예: "최대 50%") */
function extractDiscount(text: string): string | null {
  const match = text.match(/(최대\s*)?\d+%/);
  return match ? match[0] : null;
}
