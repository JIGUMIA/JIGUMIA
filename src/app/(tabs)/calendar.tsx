import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Calendar from '../../components/Calendar';
import { useSheetStore } from '../../store/sheetStore';
import { SaleEvent } from '../../types';
import { useThemeColors } from '../../hooks/useColorScheme';

export default function CalendarScreen() {
  const colors = useThemeColors();
  const { openSheet } = useSheetStore();

  const handleSalePress = (sale: SaleEvent) => {
    openSheet(sale);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <Calendar onSalePress={handleSalePress} />
    </SafeAreaView>
  );
}
