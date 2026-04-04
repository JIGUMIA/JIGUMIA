-- 문의하기 테이블
create table if not exists inquiries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  user_email text not null,
  title text not null,
  content text not null,
  status text not null default 'pending' check (status in ('pending', 'answered')),
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz default now() not null
);

-- 인덱스
create index if not exists idx_inquiries_user_id on inquiries(user_id);
create index if not exists idx_inquiries_status on inquiries(status);
create index if not exists idx_inquiries_created_at on inquiries(created_at desc);

-- RLS
alter table inquiries enable row level security;

-- 유저는 자기 문의만 조회/생성 가능
create policy "Users can view own inquiries"
  on inquiries for select
  using (auth.uid() = user_id);

create policy "Users can create own inquiries"
  on inquiries for insert
  with check (auth.uid() = user_id);
