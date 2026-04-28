import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '@/constants/Colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.gray[300]} />
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.text}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.foreground,
  },
  text: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
  },
  link: {
    marginTop: Spacing.lg,
  },
  linkText: {
    fontSize: FontSizes.base,
    color: Colors.primary[600],
    fontWeight: '600',
  },
});
