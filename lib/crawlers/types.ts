export type Platform = 'oliveyoung' | 'musinsa' | '29cm';

export interface CrawlResult {
  platform: Platform;
  title: string;
  start_date: string | null;
  end_date: string | null;
  discount_rate: string | null;
  description: string;
  source_url: string;
}

export interface Crawler {
  crawl(): Promise<CrawlResult[]>;
}
