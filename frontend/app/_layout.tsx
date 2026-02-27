import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'BGOT': require('../assets/fonts/BGOT___.TTF'),
    'BGOTB': require('../assets/fonts/BGOTB__.TTF'),
    'GOENG': require('../assets/fonts/GOENG__.TTF'),
    'GOENGB': require('../assets/fonts/GOENGB_.TTF'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(main)" />
      </Stack>
    </>
  );
}
