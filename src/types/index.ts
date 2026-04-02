export type Category = '패션' | '뷰티' | '식품' | '전자기기' | '라이프' | '종합';

export type SaleStatus = 'upcoming' | 'active' | 'ended';

export interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  category: Category;
  website_url: string;
  color: string | null;
  created_at: string;
}

export interface SaleEvent {
  id: string;
  brand_id: string;
  title: string;
  start_date: string;
  end_date: string;
  discount_rate: string;
  description: string | null;
  status: SaleStatus;
  created_at: string;
  brand?: Brand;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  brand_id: string;
  created_at: string;
}

export interface UserNotificationSettings {
  id: string;
  user_id: string;
  brand_id: string;
  notify_day_before: boolean;
  notify_on_start: boolean;
  notify_day_before_end: boolean;
}
