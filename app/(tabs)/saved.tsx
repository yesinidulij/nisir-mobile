import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes } from '@/constants/Colors';
import { TenderCard } from '@/components/TenderCard';
import { useSavedTenders } from '@/hooks/queries/useTenders';
import { useAuthState } from '@/hooks/useAuthState';
import { Button } from '@/components/ui/Button';

export default function SavedScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthState();
  const { data: tenders = [], isLoading, isRefetching, refetch } = useSavedTenders(
    {},
    { enabled: isAuthenticated },
  );

  const onRefresh = useCallback(() => { refetch(); }, [refetch]);

  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <Ionicons name="bookmark-outline" size={64} color={Colors.gray[300]} />
        <Text style={styles.emptyTitle}>Sign in to see saved tenders</Text>
        <Text style={styles.emptyText}>
          Save tenders you're interested in and access them anytime.
        </Text>
        <Button
          onPress={() => router.push('/(auth)/signin')}
          style={{ marginTop: Spacing.xl }}
        >
          Sign In
        </Button>
      </View>
    );
  }

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      );
    }
    return (
      <View style={styles.centered}>
        <Ionicons name="bookmark-outline" size={64} color={Colors.gray[300]} />
        <Text style={styles.emptyTitle}>No saved tenders</Text>
        <Text style={styles.emptyText}>
          Tap the bookmark icon on any tender to save it for later.
        </Text>
        <Button
          variant="outline"
          onPress={() => router.push('/(tabs)/tenders')}
          style={{ marginTop: Spacing.xl }}
        >
          Browse Tenders
        </Button>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tenders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TenderCard
            tender={item}
            onPress={() => router.push(`/tender/${item.id}`)}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={Colors.primary[600]}
            colors={[Colors.primary[600]]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['5xl'],
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: FontSizes.sm * 1.5,
  },
});
