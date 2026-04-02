import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useColorScheme';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  const colors = useThemeColors();

  return (
    <View
      style={{
        backgroundColor: colors.accent + '14',
        borderRadius: 14,
        padding: 14,
        marginHorizontal: 20,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.accent + '30',
      }}
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <Ionicons name="alert-circle" size={18} color={colors.accent} style={{ marginRight: 10 }} />
      <Text style={{ flex: 1, fontSize: 13, color: colors.text, fontWeight: '600' }}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            backgroundColor: colors.accent,
            borderRadius: 8,
            marginLeft: 8,
          }}
          accessibilityLabel="다시 시도"
          accessibilityRole="button"
        >
          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>재시도</Text>
        </TouchableOpacity>
      )}
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          style={{ marginLeft: 8 }}
          accessibilityLabel="닫기"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}
