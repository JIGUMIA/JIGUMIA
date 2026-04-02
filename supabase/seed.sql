-- JIGUMIA 초기 브랜드 데이터
-- schema.sql 실행 후 이 파일을 Supabase SQL Editor에서 실행

INSERT INTO brands (name, category, website_url, color) VALUES
  ('올리브영', '뷰티',  'https://www.oliveyoung.co.kr', '#EF5350'),
  ('무신사',   '패션',  'https://www.musinsa.com',      '#5C6BC0'),
  ('29cm',     '패션',  'https://www.29cm.co.kr',       '#EC407A'),
  ('쿠팡',     '종합',  'https://www.coupang.com',      '#FFA726'),
  ('SSG.COM',  '종합',  'https://www.ssg.com',          '#6C63FF'),
  ('H&M',      '패션',  'https://www.hm.com/ko',        '#26A69A'),
  ('JAJU',     '라이프', 'https://www.jaju.co.kr',      '#F06292');

-- 샘플 세일 이벤트 (테스트용)
INSERT INTO sale_events (brand_id, title, start_date, end_date, discount_rate, description, status)
SELECT
  b.id,
  '올영세일',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '5 days',
  '최대 50%',
  '화장품, 건강식품, 바디케어 등 전 카테고리 할인',
  'active'
FROM brands b WHERE b.name = '올리브영';

INSERT INTO sale_events (brand_id, title, start_date, end_date, discount_rate, description, status)
SELECT
  b.id,
  '무신사 데이',
  CURRENT_DATE + INTERVAL '3 days',
  CURRENT_DATE + INTERVAL '10 days',
  '최대 70%',
  '패션 브랜드 대규모 할인 행사',
  'upcoming'
FROM brands b WHERE b.name = '무신사';

INSERT INTO sale_events (brand_id, title, start_date, end_date, discount_rate, description, status)
SELECT
  b.id,
  '29스타일위크',
  CURRENT_DATE - INTERVAL '2 days',
  CURRENT_DATE + INTERVAL '4 days',
  '최대 60%',
  '패션/라이프스타일 시즌 세일',
  'active'
FROM brands b WHERE b.name = '29cm';

INSERT INTO sale_events (brand_id, title, start_date, end_date, discount_rate, description, status)
SELECT
  b.id,
  '로켓배송 특가',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 day',
  '최대 40%',
  '로켓배송 상품 타임딜 특가',
  'active'
FROM brands b WHERE b.name = '쿠팡';

INSERT INTO sale_events (brand_id, title, start_date, end_date, discount_rate, description, status)
SELECT
  b.id,
  '쓱세일',
  CURRENT_DATE + INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '14 days',
  '최대 50%',
  'SSG.COM 월간 대형 할인 행사',
  'upcoming'
FROM brands b WHERE b.name = 'SSG.COM';

INSERT INTO sale_events (brand_id, title, start_date, end_date, discount_rate, description, status)
SELECT
  b.id,
  '시즌 세일',
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '7 days',
  '최대 50%',
  'S/S 시즌 오프 세일',
  'active'
FROM brands b WHERE b.name = 'H&M';

INSERT INTO sale_events (brand_id, title, start_date, end_date, discount_rate, description, status)
SELECT
  b.id,
  '자주 세일위크',
  CURRENT_DATE + INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '12 days',
  '최대 30%',
  '라이프스타일 상품 할인',
  'upcoming'
FROM brands b WHERE b.name = 'JAJU';
