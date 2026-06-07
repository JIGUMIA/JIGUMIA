import type { SaleStatus } from '@/types';

function todayInKST(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

export function computeSaleStatus(startDate: string, endDate: string): SaleStatus {
  const today = todayInKST();
  if (today < startDate) return 'upcoming';
  if (today > endDate) return 'ended';
  return 'active';
}
