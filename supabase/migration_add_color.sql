-- brands 테이블에 color 컬럼 추가
-- Supabase SQL Editor에서 실행

ALTER TABLE brands ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6C63FF';

-- 각 브랜드 색상 업데이트
UPDATE brands SET color = '#EF5350' WHERE name = '올리브영';
UPDATE brands SET color = '#5C6BC0' WHERE name = '무신사';
UPDATE brands SET color = '#EC407A' WHERE name = '29cm';
UPDATE brands SET color = '#FFA726' WHERE name = '쿠팡';
UPDATE brands SET color = '#6C63FF' WHERE name = 'SSG.COM';
UPDATE brands SET color = '#26A69A' WHERE name = 'H&M';
UPDATE brands SET color = '#F06292' WHERE name = 'JAJU';
