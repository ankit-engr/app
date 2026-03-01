import { useEffect } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppStateProvider } from '@/contexts/AppStateContext';
import { ToastProvider } from '@/contexts/ToastContext';

function StatusBarBackground() {
  const insets = useSafeAreaInsets();
  if (Platform.OS !== 'ios') return null;
  return <View style={[styles.statusBarBg, { height: insets.top }]} />;
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AppStateProvider>
      <ToastProvider>
        <StatusBarBackground />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" backgroundColor="#DC2626" />
      </ToastProvider>
    </AppStateProvider>
  );
}

const styles = StyleSheet.create({
  statusBarBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#DC2626',
    zIndex: 999,
  },
});
