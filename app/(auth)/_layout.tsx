import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.primary[600],
        headerShadowVisible: false,
        headerBackTitle: 'Back',
        contentStyle: { backgroundColor: Colors.white },
      }}
    >
      <Stack.Screen
        name="signin"
        options={{ headerTitle: 'Sign In' }}
      />
      <Stack.Screen
        name="signup"
        options={{ headerTitle: 'Create Account' }}
      />
    </Stack>
  );
}
