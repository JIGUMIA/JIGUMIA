export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
}

export function getToday(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function getWeekDates(date: Date): string[] {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(start.getDate() - day);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function getMonthDates(year: number, month: number): (string | null)[] {
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);

  const dates: (string | null)[] = [];

  // 첫째 주 빈 칸
  for (let i = 0; i < firstDay; i++) {
    dates.push(null);
  }

  // 날짜 채우기
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    dates.push(dateStr);
  }

  return dates;
}

export function getSaleStatusLabel(status: string): string {
  switch (status) {
    case 'active': return '진행 중';
    case 'upcoming': return '예정';
    case 'ended': return '종료';
    default: return status;
  }
}

export function formatEndDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}.${day}`;
}

export function getRemainingLabel(endDate: string): string {
  const today = new Date(getToday());
  const target = new Date(endDate + 'T00:00:00');
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return '오늘 마감';
  if (diff === 1) return '내일 마감';
  if (diff > 0) return `${diff}일 남음`;
  return '종료됨';
}

export function getDday(targetDate: string): string {
  const today = new Date(getToday());
  const target = new Date(targetDate);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'D-DAY';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}
