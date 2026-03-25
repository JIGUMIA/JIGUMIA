import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSaleStore } from '../store/saleStore';
import CalendarSkeleton from './skeletons/CalendarSkeleton';
import { getMonthDates, getToday } from '../utils/date';
import { SaleEvent, Category } from '../types';

// 브랜드 color 값으로 bg(파스텔), text(원색) 생성
function hexToEventColor(hex: string | null | undefined): { bg: string; text: string } {
  const h = hex ?? '#6C63FF';
  return { bg: h + '30', text: h }; // 30 = ~19% opacity for bg
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const CATEGORY_OPTIONS: { label: string; value: Category | null }[] = [
  { label: '전체', value: null },
  { label: '패션', value: '패션' },
  { label: '뷰티', value: '뷰티' },
  { label: '식품', value: '식품' },
  { label: '전자기기', value: '전자기기' },
  { label: '라이프', value: '라이프' },
  { label: '종합', value: '종합' },
];

// ── 날짜 유틸 ────────────────────────────────────────────
function chunkIntoWeeks(dates: (string | null)[]): (string | null)[][] {
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    const week = [...dates.slice(i, i + 7)];
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

// ── 이벤트 바 계산 ───────────────────────────────────────
interface EventBar {
  event: SaleEvent;
  startCol: number;
  endCol: number;
  continuesFromPrev: boolean;
  continuesToNext: boolean;
}

function getEventBarsForWeek(week: (string | null)[], events: SaleEvent[]): EventBar[] {
  const validDates = week.filter(Boolean) as string[];
  if (validDates.length === 0) return [];
  const weekStart = validDates[0];
  const weekEnd = validDates[validDates.length - 1];

  return events
    .filter(e => e.start_date <= weekEnd && e.end_date >= weekStart)
    .map(e => {
      const continuesFromPrev = e.start_date < weekStart;
      const continuesToNext = e.end_date > weekEnd;
      let startCol = continuesFromPrev ? week.findIndex(d => d !== null) : week.indexOf(e.start_date);
      if (startCol === -1) startCol = 0;
      let endCol = continuesToNext ? 6 : week.indexOf(e.end_date);
      if (endCol === -1) endCol = 6;
      return { event: e, startCol, endCol, continuesFromPrev, continuesToNext };
    });
}

// ── 월 섹션 컴포넌트 ─────────────────────────────────────
interface MonthSectionProps {
  year: number;
  month: number;
  today: string;
  events: SaleEvent[];
  onSalePress: (sale: SaleEvent) => void;
}

const MonthSection = React.memo(({ year, month, today, events, onSalePress }: MonthSectionProps) => {
  const dates = useMemo(() => getMonthDates(year, month), [year, month]);
  const weeks = useMemo(() => chunkIntoWeeks(dates), [dates]);

  return (
    <View>
      {/* 월 타이틀 */}
      <View style={{
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#1E1B4B' }}>
          {year}년 {month + 1}월
        </Text>
        {year === parseInt(today.slice(0, 4)) && month === parseInt(today.slice(5, 7)) - 1 && (
          <View style={{
            marginLeft: 8,
            backgroundColor: '#6C63FF',
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>이번 달</Text>
          </View>
        )}
      </View>

      {/* 주 행들 */}
      {weeks.map((week, weekIdx) => {
        const eventBars = getEventBarsForWeek(week, events);
        const isLast = weekIdx === weeks.length - 1;

        return (
          <View
            key={weekIdx}
            style={{
              borderBottomWidth: isLast ? 0 : 1,
              borderBottomColor: '#F3F4F6',
            }}
          >
            {/* 날짜 행 */}
            <View style={{ flexDirection: 'row' }}>
              {week.map((date, dayIdx) => {
                const isToday = date === today;
                const dayNum = date ? parseInt(date.split('-')[2], 10) : null;
                return (
                  <View
                    key={dayIdx}
                    style={{ flex: 1, paddingVertical: 8, alignItems: 'center', minHeight: 44 }}
                  >
                    {dayNum !== null && (
                      <View style={{
                        width: 30, height: 30, borderRadius: 15,
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: isToday ? '#6C63FF' : 'transparent',
                      }}>
                        <Text style={{
                          fontSize: 13,
                          fontWeight: isToday ? '800' : '500',
                          color: isToday ? '#FFFFFF'
                            : dayIdx === 0 ? '#EF4444'
                            : dayIdx === 6 ? '#3B82F6'
                            : '#1E1B4B',
                        }}>
                          {dayNum}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* 이벤트 바 */}
            {eventBars.length > 0 && (
              <View style={{ paddingBottom: 6 }}>
                {eventBars.map(({ event, startCol, endCol, continuesFromPrev, continuesToNext }) => {
                  const color = hexToEventColor(event.brand?.color);
                  return (
                    <TouchableOpacity
                      key={event.id}
                      style={{ flexDirection: 'row', marginBottom: 3 }}
                      activeOpacity={0.8}
                      onPress={() => onSalePress(event)}
                    >
                      {startCol > 0 && <View style={{ flex: startCol }} />}
                      <View style={{
                        flex: endCol - startCol + 1,
                        height: 20,
                        backgroundColor: color.bg,
                        borderTopLeftRadius: continuesFromPrev ? 0 : 10,
                        borderBottomLeftRadius: continuesFromPrev ? 0 : 10,
                        borderTopRightRadius: continuesToNext ? 0 : 10,
                        borderBottomRightRadius: continuesToNext ? 0 : 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 5,
                        overflow: 'hidden',
                      }}>
                        {!continuesFromPrev && (
                          <View style={{
                            width: 13, height: 13, borderRadius: 7,
                            backgroundColor: color.text,
                            alignItems: 'center', justifyContent: 'center',
                            marginRight: 3, flexShrink: 0,
                          }}>
                            <Text style={{ color: '#FFF', fontSize: 7, fontWeight: '800' }}>
                              {event.brand?.name?.[0] ?? '?'}
                            </Text>
                          </View>
                        )}
                        <Text
                          style={{ fontSize: 9, fontWeight: '700', color: color.text }}
                          numberOfLines={1}
                        >
                          {event.title}
                        </Text>
                      </View>
                      {6 - endCol > 0 && <View style={{ flex: 6 - endCol }} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
});

// ── months 배열 생성 (현재 달 = index 0) ─────────────────
const MONTHS_TOTAL = 24; // 현재 달부터 24개월

function generateMonths() {
  const now = new Date();
  const baseYear = now.getFullYear();
  const baseMonth = now.getMonth();
  const result: { year: number; month: number; key: string }[] = [];
  for (let i = 0; i < MONTHS_TOTAL; i++) {
    let m = baseMonth + i;
    let y = baseYear;
    while (m > 11) { m -= 12; y++; }
    result.push({ year: y, month: m, key: `${y}-${m}` });
  }
  return result;
}

const ALL_MONTHS = generateMonths();

// ── 메인 컴포넌트 ────────────────────────────────────────
interface CalendarProps {
  onSalePress: (sale: SaleEvent) => void;
}

export default function Calendar({ onSalePress }: CalendarProps) {
  const today = getToday();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<string>>(new Set());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);

  const { saleEvents, brands, loading } = useSaleStore();

  // 카테고리가 바뀌면 이전에 선택한 "쇼핑몰(브랜드) 필터"는 의미가 없으므로 초기화
  useEffect(() => {
    setSelectedBrandIds(new Set());
  }, [selectedCategory]);

  const filteredEvents = useMemo(() => {
    let events = saleEvents;
    if (selectedCategory) {
      const brandIds = new Set(brands.filter(b => b.category === selectedCategory).map(b => b.id));
      events = events.filter(e => brandIds.has(e.brand_id));
    }
    if (selectedBrandIds.size > 0) {
      events = events.filter(e => selectedBrandIds.has(e.brand_id));
    }
    return events;
  }, [saleEvents, brands, selectedCategory, selectedBrandIds]);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 30 }).current;

  const brandLabel = selectedBrandIds.size > 0 ? `쇼핑몰 (${selectedBrandIds.size})` : '쇼핑몰';

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>

      {/* ── 고정 헤더 ── */}
      <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        {/* 타이틀 + 필터 */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E1B4B' }}>세일 일정</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => setShowCategoryModal(true)}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: selectedCategory ? '#6C63FF' : '#F3F4F6',
                borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: selectedCategory ? '#FFFFFF' : '#1E1B4B', marginRight: 3 }}>
                {selectedCategory ?? '카테고리'}
              </Text>
              <Ionicons name="chevron-down" size={12} color={selectedCategory ? '#FFFFFF' : '#9CA3AF'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowBrandModal(true)}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: selectedBrandIds.size > 0 ? '#6C63FF' : '#F3F4F6',
                borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: selectedBrandIds.size > 0 ? '#FFFFFF' : '#1E1B4B', marginRight: 3 }}>
                {brandLabel}
              </Text>
              <Ionicons name="chevron-down" size={12} color={selectedBrandIds.size > 0 ? '#FFFFFF' : '#9CA3AF'} />
            </TouchableOpacity>
          </View>
        </View>

      </View>

      {/* 헤더 아래 구분선 */}
      <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />

      {/* ── 월 스크롤 FlatList 또는 스켈레톤 ── */}
      {loading ? (
        <CalendarSkeleton />
      ) : (
        <FlatList
          data={ALL_MONTHS}
          keyExtractor={item => item.key}
          renderItem={({ item }) => (
            <MonthSection
              year={item.year}
              month={item.month}
              today={today}
              events={filteredEvents}
              onSalePress={onSalePress}
            />
          )}
          viewabilityConfig={viewabilityConfig}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 20 }} />
          )}
        />
      )}

      {/* ── 카테고리 모달 ── */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={{
            backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
            paddingHorizontal: 24, paddingTop: 16, paddingBottom: 36,
          }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 }} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E1B4B', marginBottom: 16 }}>카테고리 선택</Text>
            {CATEGORY_OPTIONS.map(opt => {
              const isActive = selectedCategory === opt.value;
              return (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
                  onPress={() => { setSelectedCategory(opt.value); setShowCategoryModal(false); }}
                >
                  <Text style={{ fontSize: 15, fontWeight: isActive ? '700' : '500', color: isActive ? '#6C63FF' : '#1E1B4B' }}>
                    {opt.label}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={18} color="#6C63FF" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── 쇼핑몰 모달 ── */}
      <Modal visible={showBrandModal} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setShowBrandModal(false)}
        >
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 16, maxHeight: '70%' }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E1B4B' }}>쇼핑몰 선택</Text>
              <TouchableOpacity onPress={() => setSelectedBrandIds(new Set())}>
                <Text style={{ fontSize: 13, color: '#EF5350', fontWeight: '700' }}>전체 해제</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={brands}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedBrandIds.has(item.id);
                return (
                  <TouchableOpacity
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
                    onPress={() => {
                      const next = new Set(selectedBrandIds);
                      if (isSelected) next.delete(item.id); else next.add(item.id);
                      setSelectedBrandIds(next);
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: isSelected ? '700' : '500', color: isSelected ? '#6C63FF' : '#1E1B4B' }}>
                      {item.name}
                    </Text>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color="#6C63FF" />}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={{ marginVertical: 20, paddingVertical: 16, borderRadius: 16, alignItems: 'center', backgroundColor: '#6C63FF' }}
              onPress={() => setShowBrandModal(false)}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>확인</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
