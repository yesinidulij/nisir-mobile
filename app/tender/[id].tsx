import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/Colors';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTender } from '@/hooks/queries/useTenders';
import { extractTextFromLexical } from '@/lib/lexical';


const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
  switch (status?.toUpperCase()) {
    case 'OPEN': return 'success';
    case 'CLOSING_SOON': return 'warning';
    case 'CLOSED': return 'danger';
    default: return 'default';
  }
};

export default function TenderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: tender, isLoading, error } = useTender(id);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
        <Text style={styles.loadingText}>Loading tender...</Text>
      </View>
    );
  }

  if (error || !tender) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.red[500]} />
        <Text style={styles.errorTitle}>Tender not found</Text>
        <Button variant="outline" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Status & Deadline */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statusRow}>
        <Badge variant={getStatusVariant(tender.status)}>
          {tender.status}
        </Badge>
        <View style={styles.deadlineChip}>
          <Ionicons name="calendar-outline" size={14} color={Colors.primary[600]} />
          <Text style={styles.deadlineText}>
            Deadline: {formatDate(tender.deadline)}
          </Text>
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeInDown.delay(150).duration(400)}>
        <Text style={styles.title}>{tender.title}</Text>
      </Animated.View>

      {/* Category & Location */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.metaRow}>
        {tender.category && (
          <View style={styles.metaItem}>
            <Ionicons name="folder-outline" size={16} color={Colors.mutedForeground} />
            <Text style={styles.metaText}>{tender.category.category}</Text>
          </View>
        )}
        {tender.location && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color={Colors.mutedForeground} />
            <Text style={styles.metaText}>{tender.location}</Text>
          </View>
        )}
      </Animated.View>

      {/* Company Info */}
      {tender.companyName && (
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.companyCard}>
          <View style={styles.companyAvatar}>
            <Text style={styles.companyAvatarText}>
              {tender.companyName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{tender.companyName}</Text>
            {tender.companyWebsite && (
              <Pressable onPress={() => Linking.openURL(tender.companyWebsite!)}>
                <Text style={styles.companyWebsite}>{tender.companyWebsite}</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}

      {/* Description */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descriptionText}>
          {extractTextFromLexical(tender.description)}
        </Text>
      </Animated.View>


      {/* Requirements */}
      {tender.requirements && tender.requirements.length > 0 && (
        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          {tender.requirements.map((req, i) => (
            <View key={req.id} style={styles.listItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.listItemText}>{req.content}</Text>
            </View>
          ))}
        </Animated.View>
      )}

      {/* Specifications */}
      {tender.specifications && tender.specifications.length > 0 && (
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          {tender.specifications.map((spec) => (
            <View key={spec.id} style={styles.listItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.listItemText}>{spec.content}</Text>
            </View>
          ))}
        </Animated.View>
      )}

      {/* Documents */}
      {tender.documents && tender.documents.length > 0 && (
        <Animated.View entering={FadeInDown.delay(450).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          {tender.documents.map((doc) => (
            <Pressable
              key={doc.id}
              style={styles.documentItem}
              onPress={() => Linking.openURL(doc.fileUrl)}
            >
              <Ionicons name="document-outline" size={20} color={Colors.primary[600]} />
              <Text style={styles.documentText} numberOfLines={1}>
                {doc.fileName}
              </Text>
              <Ionicons name="download-outline" size={18} color={Colors.gray[400]} />
            </Pressable>
          ))}
        </Animated.View>
      )}

      {/* Contact Info */}
      {(tender.contactName || tender.contactEmail || tender.contactPhone) && (
        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactCard}>
            {tender.contactName && (
              <View style={styles.contactItem}>
                <Ionicons name="person-outline" size={16} color={Colors.gray[500]} />
                <Text style={styles.contactText}>{tender.contactName}</Text>
              </View>
            )}
            {tender.contactEmail && (
              <Pressable
                style={styles.contactItem}
                onPress={() => Linking.openURL(`mailto:${tender.contactEmail}`)}
              >
                <Ionicons name="mail-outline" size={16} color={Colors.gray[500]} />
                <Text style={[styles.contactText, styles.contactLink]}>
                  {tender.contactEmail}
                </Text>
              </Pressable>
            )}
            {tender.contactPhone && (
              <Pressable
                style={styles.contactItem}
                onPress={() => Linking.openURL(`tel:${tender.contactPhone}`)}
              >
                <Ionicons name="call-outline" size={16} color={Colors.gray[500]} />
                <Text style={[styles.contactText, styles.contactLink]}>
                  {tender.contactPhone}
                </Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}

      {/* Posted Date */}
      <View style={styles.postedDate}>
        <Text style={styles.postedDateText}>
          Posted: {formatDate(tender.createdAt)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
  },
  loadingText: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
  },
  errorTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.gray[600],
    marginBottom: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  deadlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.full,
  },
  deadlineText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: Colors.primary[700],
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    color: Colors.foreground,
    lineHeight: FontSizes['2xl'] * 1.3,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
  },
  companyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  companyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary[700],
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.foreground,
  },
  companyWebsite: {
    fontSize: FontSizes.xs,
    color: Colors.primary[600],
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.foreground,
    marginBottom: Spacing.md,
  },
  descriptionText: {
    fontSize: FontSizes.base,
    color: Colors.gray[700],
    lineHeight: FontSizes.base * 1.6,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary[500],
    marginTop: 7,
  },
  listItemText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.gray[700],
    lineHeight: FontSizes.sm * 1.5,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  documentText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.foreground,
  },
  contactCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  contactText: {
    fontSize: FontSizes.sm,
    color: Colors.gray[700],
  },
  contactLink: {
    color: Colors.primary[600],
  },
  postedDate: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    alignItems: 'center',
  },
  postedDateText: {
    fontSize: FontSizes.xs,
    color: Colors.gray[400],
  },
});
