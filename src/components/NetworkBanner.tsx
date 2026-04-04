import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

let NetInfo: any = null;
try { NetInfo = require('@react-native-community/netinfo').default; } catch {}

export default function NetworkBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (!NetInfo) return;
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      setIsOffline(!(state.isConnected && state.isInternetReachable !== false));
    });
    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  return (
    <View
      style={{
        backgroundColor: '#FF6B35',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        gap: 6,
      }}
      accessibilityRole="alert"
      accessibilityLabel="인터넷 연결 없음"
    >
      <Ionicons name="cloud-offline-outline" size={14} color="#FFFFFF" />
      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
        인터넷에 연결되어 있지 않아요
      </Text>
    </View>
  );
}
