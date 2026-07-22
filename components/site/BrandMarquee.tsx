/* eslint-disable @next/next/no-img-element -- 브랜드 로고는 외부 CDN(logo_url) 이미지 */
import type { LandingBrand } from '@/lib/site/landing-data';

function Chip({ brand }: { brand: LandingBrand }) {
  return (
    <span className="flex shrink-0 items-center gap-2 rounded-full border border-gray-100 bg-white py-1.5 pl-1.5 pr-3.5 text-[13px] font-semibold text-[#111111] shadow-sm">
      {brand.logo_url ? (
        // 마퀴는 대부분 뷰포트 밖에 있어 lazy 로 두면 로고가 비어 보인다.
        <img src={brand.logo_url} alt="" className="h-6 w-6 rounded-md object-contain" />
      ) : (
        <span
          className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-extrabold text-white"
          style={{ backgroundColor: brand.color }}
        >
          {brand.name.slice(0, 1)}
        </span>
      )}
      {brand.name}
    </span>
  );
}

/** 한 줄 — 같은 목록을 두 번 이어 붙여 끊김 없이 순환시킨다. */
function Row({
  brands,
  reverse = false,
  duration,
}: {
  brands: LandingBrand[];
  reverse?: boolean;
  duration: number;
}) {
  return (
    <div className="flex w-max gap-2.5 [.brand-marquee:hover_&]:[animation-play-state:paused]"
      style={{
        animation: `brand-scroll ${duration}s linear infinite`,
        animationDirection: reverse ? 'reverse' : 'normal',
      }}
    >
      {[0, 1].map((copy) => (
        <div key={copy} className="flex gap-2.5" aria-hidden={copy === 1}>
          {brands.map((b) => (
            <Chip key={`${copy}-${b.id}`} brand={b} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * 브랜드가 45개라 그리드로 깔면 세로로 너무 길어진다.
 * 두 줄로 나눠 반대 방향으로 흘려보내 높이를 고정한다.
 */
export function BrandMarquee({ brands }: { brands: LandingBrand[] }) {
  const half = Math.ceil(brands.length / 2);
  const top = brands.slice(0, half);
  const bottom = brands.slice(half);

  return (
    <div className="brand-marquee relative space-y-3">
      <Row brands={top} duration={44} />
      <Row brands={bottom} duration={52} reverse />

      {/* 양 끝 페이드 — 잘리는 지점을 감춘다 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}
