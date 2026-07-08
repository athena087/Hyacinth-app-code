import { useColorScheme } from 'react-native';
import { ColorTokens, dark, light } from './tokens';

/** Returns the active color token set following the system light/dark scheme. */
export function useTokens(): ColorTokens {
  return useColorScheme() === 'dark' ? dark : light;
}
