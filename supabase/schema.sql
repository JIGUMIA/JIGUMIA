-- JIGUMIA 데이터베이스 스키마
-- Supabase SQL Editor에서 실행

-- 1. brands 테이블
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('패션', '뷰티', '식품', '전자기기', '라이프', '종합')),
  website_url TEXT NOT NULL,
  color TEXT DEFAULT '#6C63FF',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. sale_events 테이블
CREATE TABLE IF NOT EXISTS sale_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  discount_rate TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. user_favorites 테이블
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, brand_id)
);

-- 4. user_notification_settings 테이블
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  notify_day_before BOOLEAN DEFAULT TRUE,
  notify_on_start BOOLEAN DEFAULT TRUE,
  notify_day_before_end BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, brand_id)
);

-- RLS (Row Level Security) 활성화
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

-- brands, sale_events: 모든 사용자 읽기 가능
CREATE POLICY "brands_read_all" ON brands FOR SELECT USING (true);
CREATE POLICY "sale_events_read_all" ON sale_events FOR SELECT USING (true);

-- anon 롤에 읽기 권한 부여
GRANT SELECT ON brands TO anon;
GRANT SELECT ON sale_events TO anon;

-- user_favorites: 본인만 읽기/쓰기
CREATE POLICY "favorites_read_own" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert_own" ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete_own" ON user_favorites FOR DELETE USING (auth.uid() = user_id);

-- RLS 정책과 별개로, 테이블 자체에 대한 권한(Grant)이 필요합니다.
-- Supabase에서 anon key로 접속하는 앱에서도 auth가 세션을 주입하면 authenticated로 동작합니다.
GRANT SELECT, INSERT, DELETE ON user_favorites TO authenticated;

-- user_notification_settings: 본인만 읽기/쓰기
CREATE POLICY "notifications_read_own" ON user_notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_own" ON user_notification_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON user_notification_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON user_notification_settings FOR DELETE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON user_notification_settings TO authenticated;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_sale_events_brand_id ON sale_events(brand_id);
CREATE INDEX IF NOT EXISTS idx_sale_events_dates ON sale_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_sale_events_status ON sale_events(status);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notification_settings(user_id);
