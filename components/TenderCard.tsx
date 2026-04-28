import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, FontSizes, Shadows } from '@/constants/Colors';
import { Badge } from '@/components/ui/Badge';
import { TenderSummary } from '@/lib/api/tenders';

interface TenderCardProps {
  tender: TenderSummary;
  onPress?: () => void;
}

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
  switch (status?.toUpperCase()) {
    case 'OPEN': return 'success';
    case 'CLOSING_SOON': return 'warning';
    case 'CLOSED': return 'danger';
    default: return 'default';
  }
};

const getDaysRemaining = (deadline: Date | string) => {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
};

export function TenderCard({ tender, onPress }: TenderCardProps) {
  const daysRemaining = getDaysRemaining(tender.deadline);
  const isExpired = daysRemaining === 'Expired';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Badge variant={getStatusVariant(tender.status)}>
            {tender.status}
          </Badge>
          {tender.isSaved && (
            <Ionicons name="bookmark" size={16} color={Colors.primary[600]} />
          )}
        </View>
        <Text style={[styles.deadline, isExpired && styles.deadlineExpired]}>
          {daysRemaining}
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {tender.title}
      </Text>

      {/* Category */}
      {tender.category && (
        <View style={styles.categoryRow}>
          <Ionicons name="folder-outline" size={14} color={Colors.mutedForeground} />
          <Text style={styles.categoryText}>{tender.category.category}</Text>
        </View>
      )}

      {/* Summary */}
      {tender.summary && (
        <Text style={styles.summary} numberOfLines={2}>
          {tender.summary}
        </Text>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="location-outline" size={14} color={Colors.mutedForeground} />
          <Text style={styles.footerText} numberOfLines={1}>
            {tender.location || 'N/A'}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={14} color={Colors.mutedForeground} />
          <Text style={styles.footerText}>
            {formatDate(tender.deadline)}
          </Text>
        </View>
      </View>

      {/* Company */}
      {tender.companyName && (
        <View style={styles.companyRow}>
          <View style={styles.companyAvatar}>
            <Text style={styles.companyAvatarText}>
              {tender.companyName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.companyName} numberOfLines={1}>
            {tender.companyName}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  pressed: {
    backgroundColor: Colors.gray[50],
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deadline: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: Colors.primary[600],
  },
  deadlineExpired: {
    color: Colors.red[600],
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.foreground,
    marginBottom: Spacing.sm,
    lineHeight: FontSizes.lg * 1.3,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  categoryText: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
  },
  summary: {
    fontSize: FontSizes.sm,
    color: Colors.gray[600],
    lineHeight: FontSizes.sm * 1.5,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  companyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyAvatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary[700],
  },
  companyName: {
    fontSize: FontSizes.xs,
    color: Colors.gray[600],
    flex: 1,
  },
});
