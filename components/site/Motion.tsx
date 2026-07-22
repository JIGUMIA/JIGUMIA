'use client';

import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'motion/react';
import { useRef } from 'react';

/** 페이지 전체가 같은 리듬으로 움직이도록 이징/거리를 한곳에서 정한다. */
const EASE = [0.22, 1, 0.36, 1] as const;
const DISTANCE = 28;

type Direction = 'up' | 'left' | 'right';

function offset(direction: Direction, distance: number) {
  if (direction === 'left') return { x: -distance, y: 0 };
  if (direction === 'right') return { x: distance, y: 0 };
  return { x: 0, y: distance };
}

/**
 * 뷰포트에 들어올 때 한 번 나타난다.
 *
 * 스크롤을 되감아도 다시 재생하지 않는다(once) — 랜딩을 오르내릴 때
 * 요소가 껌뻑이면 읽기 흐름이 끊긴다.
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  distance = DISTANCE,
  className,
}: {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  distance?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const from = reduced ? { x: 0, y: 0 } : offset(direction, distance);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** 자식들을 순서대로 흘려보낸다. 직계 자식은 StaggerItem 이어야 한다. */
export function Stagger({
  children,
  className,
  delay = 0,
  gap = 0.12,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  gap?: number;
}) {
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: gap, delayChildren: delay } },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
}) {
  const reduced = useReducedMotion();
  const from = reduced ? { x: 0, y: 0 } : offset(direction, DISTANCE);

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, ...from },
        show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.65, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * 앱 목업 전용 등장.
 *
 * 옆에서 미끄러져 들어오며 기울기가 펴지고, 이후 스크롤에 따라 살짝 떠오른다.
 * 네 개 섹션이 번갈아 좌/우에서 들어오면서 화면이 이어지는 이야기처럼 읽힌다.
 */
export function PhoneReveal({
  children,
  from = 'left',
}: {
  children: React.ReactNode;
  from?: 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // 섹션을 지나는 동안 위로 흐르게 해 정지 화면에 깊이를 준다.
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -40]);

  const sign = from === 'left' ? -1 : 1;

  return (
    <div ref={ref}>
      <motion.div
        style={{ y }}
        initial={
          reduced
            ? { opacity: 0 }
            : { opacity: 0, x: sign * 70, rotate: sign * 6, scale: 0.94 }
        }
        whileInView={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** 히어로 — 로드 직후 한 번 재생 (뷰포트 진입 대기 없이) */
export function HeroStagger({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } } }}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function HeroItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : 22 },
        show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}
