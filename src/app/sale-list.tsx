import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSaleStore } from '../store/saleStore';
import { useSheetStore } from '../store/sheetStore';
import { SaleEvent } from '../types';
import { formatDate, getDday } from '../utils/date';

const FALLBACK_COLOR = '#6C63FF';

function SaleRow({ event, onPress }: { event: SaleEvent; onPress: () => void }) {
  const color = event.brand?.color ?? FALLBACK_COLOR;
  const dday = event.status === 'upcoming'
    ? `시작 ${getDday(event.start_date)}`
    : `종료 ${getDday(event.end_date)}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      {/* 브랜드 컬러 아이콘 */}
      <View style={{
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: color,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 14,
      }}>
        <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900' }}>
          {event.brand?.name?.[0] ?? '?'}
        </Text>
      </View>

      {/* 정보 */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, color: '#9CA3AF', fontWeight: '500', marginBottom: 2 }}>
          {event.brand?.name}
        </Text>
        <Text style={{ fontSize: 15, fontWeight: '800', color: '#1E1B4B', marginBottom: 3 }} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
          {formatDate(event.start_date)} ~ {formatDate(event.end_date)}
        </Text>
      </View>

      {/* D-day */}
      <Text style={{ fontSize: 13, fontWeight: '800', color, marginLeft: 8 }}>
        {dday}
      </Text>
    </TouchableOpacity>
  );
}

export default function SaleListScreen() {
  const { type } = useLocalSearchParams<{ type: 'active' | 'upcoming' }>();
  const { saleEvents } = useSaleStore();
  const { openSheet } = useSheetStore();

  const isActive = type === 'active';

  const list = saleEvents
    .filter((e) => e.status === type)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  const title = isActive ? '🔥 지금 세일 중' : '📌 예정된 세일';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EEEDF8' }}>
      {/* 헤더 */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color="#1E1B4B" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '900', color: '#1E1B4B' }}>{title}</Text>
        <Text style={{ marginLeft: 8, fontSize: 14, color: '#9CA3AF', fontWeight: '600' }}>
          {list.length}개
        </Text>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <SaleRow event={item} onPress={() => openSheet(item)} />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ fontSize: 40 }}>🛒</Text>
            <Text style={{ fontSize: 16, color: '#9CA3AF', marginTop: 12, fontWeight: '600' }}>
              세일 정보가 없어요
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
