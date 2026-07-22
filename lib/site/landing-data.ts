import { createAdminClient } from '@/lib/supabase/server';

export type LandingBrand = {
  id: string;
  name: string;
  category: string;
  color: string;
  logo_url: string | null;
};

/**
 * 랜딩의 "지원 브랜드" 섹션용 목록.
 *
 * 앱 화면 목업은 가상 데이터(lib/site/mock-screens)를 쓰고, 실제 DB는 지원 브랜드가
 * 무엇인지라는 사실 정보에만 사용한다.
 */
export async function getLandingBrands(): Promise<LandingBrand[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('brands')
    .select('id, name, category, color, logo_url')
    .order('name');

  return (data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    category: b.category ?? '종합',
    color: b.color || '#6C63FF',
    logo_url: b.logo_url,
  }));
}
