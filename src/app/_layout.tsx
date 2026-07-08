import {
  Lilex_400Regular,
  Lilex_500Medium,
  Lilex_600SemiBold,
  useFonts,
} from '@expo-google-fonts/lilex';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { CartProvider } from '../cart/CartContext';

// Keep the splash up until Lilex is ready so text never flashes in a system
// font first. Called at module scope so it runs before the tree mounts.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Lilex_400Regular,
    Lilex_500Medium,
    Lilex_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <CartProvider>
      {/* headerShown off — screens render their own headers. */}
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </CartProvider>
  );
}
