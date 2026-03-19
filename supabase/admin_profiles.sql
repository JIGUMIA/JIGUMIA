-- admin_profiles 테이블 생성
-- Supabase SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화 (service_role 키로만 접근)
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- 본인 프로필만 읽기 허용 (미들웨어에서 service_role로 접근하므로 실질적으로 사용 안 됨)
CREATE POLICY "admin can read own profile"
  ON admin_profiles FOR SELECT
  USING (auth.uid() = id);

-- 첫 번째 관리자 계정 추가 방법:
-- 1. Supabase Dashboard → Authentication → Users에서 이메일/비밀번호로 사용자 생성
-- 2. 아래 쿼리에서 user_id를 해당 사용자의 UUID로 교체 후 실행
-- INSERT INTO admin_profiles (id, role) VALUES ('your-user-uuid-here', 'super_admin');
