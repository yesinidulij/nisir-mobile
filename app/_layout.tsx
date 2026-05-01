import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Custom Nisir theme
const NisirTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#16a34a',
    background: '#ffffff',
    card: '#ffffff',
    text: '#111827',
    border: '#e5e7eb',
    notification: '#ef4444',
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={NisirTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="(auth)"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="tender/[id]"
            options={{
              headerShown: true,
              headerTitle: 'Tender Detail',
              headerTintColor: '#16a34a',
              headerBackTitle: 'Back',
              headerStyle: { backgroundColor: '#fff' },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="post-tender"
            options={{
              headerShown: true,
              headerTitle: 'Post Tender',
              headerTintColor: '#16a34a',
              headerBackTitle: 'Back',
              headerStyle: { backgroundColor: '#fff' },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="contact"
            options={{
              headerShown: true,
              headerTitle: 'Contact Us',
              headerTintColor: '#16a34a',
              headerBackTitle: 'Back',
              headerStyle: { backgroundColor: '#fff' },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="faq"
            options={{
              headerShown: true,
              headerTitle: 'FAQ',
              headerTintColor: '#16a34a',
              headerBackTitle: 'Back',
              headerStyle: { backgroundColor: '#fff' },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="blog"
            options={{
              headerShown: true,
              headerTitle: 'Blog',
              headerTintColor: '#16a34a',
              headerBackTitle: 'Back',
              headerStyle: { backgroundColor: '#fff' },
              headerShadowVisible: false,
            }}
          />
        </Stack>
        <Toast />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
