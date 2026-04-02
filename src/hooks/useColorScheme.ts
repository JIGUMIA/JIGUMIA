import { useColorScheme as useRNColorScheme } from 'react-native';
import { Colors } from '../constants/colors';

export function useThemeColors() {
  const scheme = useRNColorScheme();
  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}

export { useRNColorScheme as useColorScheme };
