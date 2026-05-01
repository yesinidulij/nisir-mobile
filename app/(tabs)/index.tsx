import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Pressable,
  Dimensions,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { useAuthState } from '@/hooks/useAuthState';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, normalizedRole } = useAuthState();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header Bar */}
      <View style={[styles.headerBar, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.logoRow}>
          <Image 
            source={require('../../assets/images/nisir-chereta-logo-new.png')} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
        </View>
        {!isAuthenticated ? (
          <Pressable
            onPress={() => router.push('/(auth)/signin')}
            style={styles.signInBtn}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.avatarBtn}
          >
            <Ionicons name="person-circle-outline" size={32} color={Colors.primary[600]} />
          </Pressable>
        )}
      </View>

      {/* Hero Section */}
      <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.heroSection}>
        <Text style={styles.heroTitle}>
          Get bidders that fulfill your requirements fast
        </Text>
        <Text style={styles.heroSubtitle}>
          Start connecting with high-quality bidders and unlock new opportunities today.
        </Text>

        <View style={styles.heroCtas}>
          <Button
            size="lg"
            fullWidth
            onPress={() => isAuthenticated ? router.push('/post-tender') : router.push('/(auth)/signin')}
          >
            Post Tender
          </Button>
          <Button
            size="lg"
            variant="outline"
            fullWidth
            onPress={() => router.push('/(tabs)/tenders')}
          >
            Find Tender
          </Button>
        </View>
      </Animated.View>

      {/* Why Choose Section */}
      <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.section}>
        <Text style={styles.sectionTitle}>Why Choose Nisir?</Text>
        <View style={styles.featureGrid}>
          <FeatureCard
            icon="flash-outline"
            title="Fast & Easy"
            description="Post and find tenders in minutes"
            delay={400}
          />
          <FeatureCard
            icon="shield-checkmark-outline"
            title="Verified Companies"
            description="All companies are verified"
            delay={500}
          />
          <FeatureCard
            icon="people-outline"
            title="Connect"
            description="Direct messaging with bidders"
            delay={600}
          />
          <FeatureCard
            icon="notifications-outline"
            title="Alerts"
            description="Get notified about new tenders"
            delay={700}
          />
        </View>
      </Animated.View>

      {/* CTA Section */}
      {!isAuthenticated && (
        <Animated.View entering={FadeInUp.delay(500).duration(600)} style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <Ionicons name="rocket-outline" size={40} color={Colors.primary[600]} />
            <Text style={styles.ctaTitle}>Ready to get started?</Text>
            <Text style={styles.ctaSubtitle}>
              Join thousands of businesses on Nisir Chereta.
            </Text>
            <Button
              size="lg"
              fullWidth
              onPress={() => router.push('/(auth)/signup')}
            >
              Create Free Account
            </Button>
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.featureCard}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon as any} size={24} color={Colors.primary[600]} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{description}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoImage: {
    height: 32,
    width: 140, // Adjust width based on aspect ratio
  },
  signInBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary[600],
  },
  signInText: {
    color: Colors.primary[600],
    fontWeight: '600',
    fontSize: FontSizes.sm,
  },
  avatarBtn: {
    padding: Spacing.xs,
  },
  heroSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
    backgroundColor: Colors.gray[50],
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.foreground,
    lineHeight: 40,
    marginBottom: Spacing.lg,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: FontSizes.lg,
    color: Colors.gray[500],
    lineHeight: 26,
    marginBottom: Spacing['2xl'],
  },
  heroCtas: {
    gap: Spacing.md,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['3xl'],
  },
  sectionTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    color: Colors.foreground,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  featureCard: {
    width: (width - Spacing.xl * 2 - Spacing.md) / 2,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  featureTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.foreground,
    marginBottom: Spacing.xs,
  },
  featureDesc: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
    lineHeight: FontSizes.xs * 1.5,
  },
  ctaSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  ctaCard: {
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  ctaTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.foreground,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  ctaSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: FontSizes.sm * 1.5,
  },
});
