import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Calendar from '../../components/Calendar';
import { useSheetStore } from '../../store/sheetStore';
import { SaleEvent } from '../../types';

export default function CalendarScreen() {
  const { openSheet } = useSheetStore();

  const handleSalePress = (sale: SaleEvent) => {
    openSheet(sale);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Calendar onSalePress={handleSalePress} />
    </SafeAreaView>
  );
}
