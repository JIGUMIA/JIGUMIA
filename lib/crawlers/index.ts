import { Platform, Crawler } from './types';
import { OliveyoungCrawler } from './oliveyoung';
import { MusinsaCrawler } from './musinsa';
import { TwentynineCrawler } from './twentynine';

const crawlers: Record<Platform, () => Crawler> = {
  oliveyoung: () => new OliveyoungCrawler(),
  musinsa: () => new MusinsaCrawler(),
  '29cm': () => new TwentynineCrawler(),
};

export function getCrawler(platform: Platform): Crawler {
  const factory = crawlers[platform];
  if (!factory) throw new Error(`Unknown platform: ${platform}`);
  return factory();
}

export const PLATFORMS: Platform[] = ['oliveyoung', 'musinsa', '29cm'];

export type { Platform, CrawlResult, Crawler } from './types';
