import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/Colors';
import { TenderCard } from '@/components/TenderCard';
import { useTenders } from '@/hooks/queries/useTenders';
import { TenderListParams } from '@/lib/api/tenders';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Deadline', value: 'deadline' },
  { label: 'A-Z', value: 'title' },
];

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'OPEN' },
  { label: 'Closing Soon', value: 'CLOSING_SOON' },
  { label: 'Closed', value: 'CLOSED' },
];

export default function TendersScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('');
  const [activeSort, setActiveSort] = useState('newest');

  const params: TenderListParams = {
    search: search || undefined,
    status: activeStatus || undefined,
    sort: activeSort || undefined,
    limit: 50,
  };

  const { data: tenders = [], isLoading, isRefetching, refetch } = useTenders(params);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tenders..."
          placeholderTextColor={Colors.gray[400]}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={Colors.gray[400]} />
          </Pressable>
        )}
      </View>

      {/* Status Filter Chips */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((filter) => (
          <Pressable
            key={filter.value}
            style={[
              styles.filterChip,
              activeStatus === filter.value && styles.filterChipActive,
            ]}
            onPress={() => setActiveStatus(filter.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                activeStatus === filter.value && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {tenders.length} {tenders.length === 1 ? 'tender' : 'tenders'} found
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
          <Text style={styles.emptyText}>Loading tenders...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color={Colors.gray[300]} />
        <Text style={styles.emptyTitle}>No tenders found</Text>
        <Text style={styles.emptyText}>
          {search
            ? `No results for "${search}". Try a different search term.`
            : 'Check back later for new tenders.'}
        </Text>
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
        ListHeaderComponent={renderHeader}
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
    paddingBottom: Spacing['3xl'],
  },
  headerContainer: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.base,
    color: Colors.foreground,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  filterChipText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.gray[600],
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  resultsRow: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  resultsText: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
  },
  emptyContainer: {
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
