export type Category = '패션' | '뷰티' | '식품' | '전자기기' | '라이프' | '종합';
export type SaleStatus = 'upcoming' | 'active' | 'ended';
export type AdminRole = 'admin' | 'super_admin';

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

export interface AdminProfile {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
}

export type InquiryStatus = 'pending' | 'answered';

export interface Inquiry {
  id: string;
  user_id: string;
  user_email: string;
  title: string;
  content: string;
  status: InquiryStatus;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}
