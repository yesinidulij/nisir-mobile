import { Button } from '@/components/ui/Button';
import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/Colors';
import { useLogout } from '@/hooks/mutations/useLogout';
import { useAuthState } from '@/hooks/useAuthState';
import { getUserFullName } from '@/lib/auth/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, user, normalizedRole, isLoading } = useAuthState();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutMutation.mutateAsync(undefined);
          } catch (e) {
            // Still handle locally
          }
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <View style={styles.guestIcon}>
          <Ionicons name="person-outline" size={48} color={Colors.gray[400]} />
        </View>
        <Text style={styles.guestTitle}>Welcome to Nisir</Text>
        <Text style={styles.guestText}>
          Sign in to manage your tenders, save favorites, and more.
        </Text>
        <View style={styles.guestButtons}>
          <Button
            fullWidth
            onPress={() => router.push('/(auth)/signin')}
          >
            Sign In
          </Button>
          <Button
            fullWidth
            variant="outline"
            onPress={() => router.push('/(auth)/signup')}
          >
            Create Account
          </Button>
        </View>
      </View>
    );
  }

  const fullName = getUserFullName(user);
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>{initials}</Text>
        </View>
        <Text style={styles.profileName}>{fullName || 'User'}</Text>
        {user?.email && <Text style={styles.profileEmail}>{user.email}</Text>}
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {normalizedRole === 'COMPANY' ? '🏢 Company' : normalizedRole === 'ADMIN' ? '🔒 Admin' : '👤 Individual'}
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Account</Text>

        <MenuItem
          icon="person-outline"
          label="Edit Profile"
          onPress={() => { }}
        />
        <MenuItem
          icon="bookmark-outline"
          label="Saved Tenders"
          onPress={() => router.push('/(tabs)/saved')}
        />
        {normalizedRole === 'COMPANY' && (
          <MenuItem
            icon="briefcase-outline"
            label="My Tenders"
            onPress={() => { }}
          />
        )}
        <MenuItem
          icon="chatbubbles-outline"
          label="Messages"
          onPress={() => { }}
        />
      </View>
      {/* 
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>General</Text>

        <MenuItem
          icon="newspaper-outline"
          label="Blog"
          onPress={() => router.push('/blog')}
        />
        <MenuItem
          icon="help-circle-outline"
          label="FAQ"
          onPress={() => router.push('/faq')}
        /> 
        <MenuItem
          icon="information-circle-outline"
          label="About Nisir"
          onPress={() => {}}
        />
        <MenuItem
          icon="shield-outline"
          label="Privacy Policy"
          onPress={() => {}}
        />
        <MenuItem
          icon="document-text-outline"
          label="Terms of Service"
          onPress={() => {}}
        />
        <MenuItem
          icon="mail-outline"
          label="Contact Us"
          onPress={() => router.push('/contact')}
        /> 
      </View>
 */}
      {/* Sign Out */}
      <View style={styles.signOutSection}>
        <Button
          variant="destructive"
          fullWidth
          onPress={handleLogout}
          loading={logoutMutation.isPending}
          icon={<Ionicons name="log-out-outline" size={18} color={Colors.white} />}
        >
          Sign Out
        </Button>
      </View>

      <Text style={styles.versionText}>Nisir Chereta v1.0.0</Text>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons
          name={icon as any}
          size={22}
          color={danger ? Colors.red[600] : Colors.gray[600]}
        />
        <Text style={[styles.menuItemText, danger && styles.menuItemTextDanger]}>
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.gray[400]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    backgroundColor: Colors.white,
    gap: Spacing.md,
  },
  guestIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  guestTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    color: Colors.foreground,
  },
  guestText: {
    fontSize: FontSizes.base,
    color: Colors.mutedForeground,
    textAlign: 'center',
    lineHeight: FontSizes.base * 1.5,
    maxWidth: 300,
  },
  guestButtons: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarLargeText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary[700],
  },
  profileName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.foreground,
  },
  profileEmail: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginTop: Spacing.xs,
  },
  roleBadge: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  roleBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.primary[700],
  },
  menuSection: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  menuSectionTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray[100],
  },
  menuItemPressed: {
    backgroundColor: Colors.gray[50],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuItemText: {
    fontSize: FontSizes.base,
    color: Colors.foreground,
  },
  menuItemTextDanger: {
    color: Colors.red[600],
  },
  signOutSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing['2xl'],
  },
  versionText: {
    textAlign: 'center',
    fontSize: FontSizes.xs,
    color: Colors.gray[400],
    marginTop: Spacing.xl,
  },
});
