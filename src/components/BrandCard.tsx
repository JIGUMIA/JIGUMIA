import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Brand } from '../types';
import { useAuthStore } from '../store/authStore';
import { useFavoriteStore } from '../store/favoriteStore';
import { useThemeColors } from '../hooks/useColorScheme';

const FALLBACK_COLOR = '#6C63FF';

interface BrandCardProps {
  brand: Brand;
  activeSaleCount: number;
  onPress: () => void;
}

export default function BrandCard({ brand, activeSaleCount, onPress }: BrandCardProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { isFavorite, toggleFavorite, userId: favoriteStoreUserId } = useFavoriteStore();
  const isFav = user && favoriteStoreUserId === user.id ? isFavorite(brand.id) : false;
  const brandColor = brand.color ?? FALLBACK_COLOR;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      accessibilityLabel={`${brand.name}, ${brand.category}${activeSaleCount > 0 ? `, ${activeSaleCount}개 세일 중` : ''}`}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 18,
        padding: 14,
        marginBottom: 10,
        overflow: 'hidden',
      }}
    >
      {/* left color accent bar */}
      <View style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3,
        backgroundColor: brandColor,
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
      }} />

      {/* brand logo or initial circle */}
      {brand.logo_url ? (
        <Image
          source={{ uri: brand.logo_url }}
          style={{ width: 44, height: 44, borderRadius: 13, marginLeft: 12, marginRight: 14 }}
          contentFit="cover"
        />
      ) : (
        <View style={{
          width: 44, height: 44, borderRadius: 13,
          backgroundColor: brandColor + '18',
          borderWidth: 1.5,
          borderColor: brandColor + '44',
          alignItems: 'center', justifyContent: 'center',
          marginLeft: 12, marginRight: 14,
        }}>
          <Text style={{ color: brandColor, fontSize: 18, fontWeight: '900' }}>
            {brand.name[0]}
          </Text>
        </View>
      )}

      {/* info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 2 }}>
          {brand.name}
        </Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '500' }}>
          {brand.category}
        </Text>
        {activeSaleCount > 0 && (
          <View style={{
            marginTop: 5, alignSelf: 'flex-start',
            paddingHorizontal: 7, paddingVertical: 2,
            backgroundColor: colors.accent,
            borderRadius: 6,
          }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 }}>
              세일 {activeSaleCount}개 진행 중
            </Text>
          </View>
        )}
      </View>

      {/* favorite */}
      {user && (
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={() => toggleFavorite(user.id, brand.id)}
          accessibilityLabel={isFav ? '관심 해제' : '관심 등록'}
          accessibilityRole="button"
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={20}
            color={isFav ? colors.accent : colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
