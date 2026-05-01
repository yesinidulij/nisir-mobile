import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/Colors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { subscribeToNewsletter } from '@/lib/api/newsletter';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 'winning-tenders-ethiopia-2026',
    title: 'How to Win Tenders in Ethiopia: Complete Guide for 2026',
    excerpt: 'Discover proven strategies and insider tips to increase your chances of winning government and private tenders in Ethiopia. Learn about documentation, pricing, and compliance requirements.',
    author: 'Samuel Tadesse',
    date: 'February 10, 2026',
    readTime: '8 min read',
    category: 'Tender Strategy',
    image: 'business meeting ethiopia'
  },
  {
    id: 'ethiopia-procurement-law-guide',
    title: 'Understanding Ethiopia\'s Public Procurement Law: A Comprehensive Guide',
    excerpt: 'Navigate the complexities of Ethiopian procurement regulations. Learn about legal requirements, compliance standards, and recent updates to procurement directives.',
    author: 'Dr. Alem Bekele',
    date: 'February 8, 2026',
    readTime: '12 min read',
    category: 'Legal & Compliance',
    image: 'legal documents ethiopia'
  },
  {
    id: 'tender-bidding-process-step-by-step',
    title: 'The Complete Tender Bidding Process in Ethiopia: Step-by-Step',
    excerpt: 'From tender announcement to contract award, understand every phase of the bidding process. Includes timelines, documentation checklists, and common pitfalls to avoid.',
    author: 'Bethlehem Girma',
    date: 'February 5, 2026',
    readTime: '10 min read',
    category: 'Process Guide',
    image: 'construction project ethiopia'
  },
  {
    id: 'company-registration-tender-eligibility',
    title: 'Company Registration Requirements for Tender Eligibility in Ethiopia',
    excerpt: 'Essential documentation and registration steps required for companies to participate in tenders. Learn about tax compliance, business licenses, and certification requirements.',
    author: 'Yohannes Haile',
    date: 'February 3, 2026',
    readTime: '7 min read',
    category: 'Registration',
    image: 'office building ethiopia'
  },
  {
    id: 'construction-tender-pricing-strategies',
    title: '10 Proven Pricing Strategies for Construction Tenders in Ethiopia',
    excerpt: 'Master the art of competitive pricing without sacrificing profit margins. Learn cost estimation techniques, pricing psychology, and how to analyze competitor bids.',
    author: 'Engineer Dawit Mulugeta',
    date: 'January 30, 2026',
    readTime: '9 min read',
    category: 'Pricing',
    image: 'construction site ethiopia'
  },
  {
    id: 'digital-tender-platforms-ethiopia',
    title: 'The Rise of Digital Tender Platforms in Ethiopia: What You Need to Know',
    excerpt: 'Explore how technology is transforming tender management in Ethiopia. Benefits of online platforms, e-procurement systems, and tips for digital tender submission.',
    author: 'Hanna Tesfalem',
    date: 'January 28, 2026',
    readTime: '6 min read',
    category: 'Technology',
    image: 'laptop technology ethiopia'
  },
  {
    id: 'small-business-government-tenders',
    title: 'How Small Businesses Can Compete for Government Tenders in Ethiopia',
    excerpt: 'Level the playing field. Learn strategies small and medium enterprises can use to successfully bid on government contracts and compete with larger firms.',
    author: 'Meseret Abebe',
    date: 'January 25, 2026',
    readTime: '8 min read',
    category: 'SME Guide',
    image: 'small business ethiopia'
  },
  {
    id: 'tender-document-preparation-checklist',
    title: 'Essential Tender Document Preparation Checklist for Ethiopian Bidders',
    excerpt: 'Never miss a required document again. Complete checklist of technical, financial, and legal documents needed for successful tender submission in Ethiopia.',
    author: 'Zewdu Assefa',
    date: 'January 22, 2026',
    readTime: '11 min read',
    category: 'Documentation',
    image: 'documents checklist'
  },
  {
    id: 'common-tender-mistakes-avoid',
    title: '15 Common Tender Application Mistakes and How to Avoid Them',
    excerpt: 'Learn from the mistakes of others. Discover the most frequent errors that lead to tender rejection and how to ensure your application stands out for the right reasons.',
    author: 'Solomon Kebede',
    date: 'January 20, 2026',
    readTime: '7 min read',
    category: 'Best Practices',
    image: 'business warning sign'
  }
];

export default function BlogScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const categories = Array.from(new Set(blogPosts.map(post => post.category)));

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const subscribeMutation = useMutation({
    mutationFn: subscribeToNewsletter,
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Successfully subscribed!',
        text2: 'You\'ll receive our latest tender insights in your inbox.',
      });
      setEmail('');
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Subscription failed',
        text2: error?.payload?.message || "Please try again.",
      });
    },
  });

  const handleSubscribe = () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Email required', text2: 'Please enter your email address.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({ type: 'error', text1: 'Invalid email', text2: 'Please enter a valid email address.' });
      return;
    }
    subscribeMutation.mutate({ email });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Blog', headerTitleStyle: { color: Colors.foreground } }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={{ marginBottom: Spacing.sm }}>
            <Badge variant="default" label="Insights & Resources" />
          </View>
          <Text style={styles.title}>Tender Insights Blog</Text>
          <Text style={styles.subtitle}>
            Expert advice, guides, and industry insights to help you succeed in Ethiopia's tender marketplace
          </Text>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.mutedForeground} style={styles.searchIcon} />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={{ marginBottom: 0 }}
              style={{ paddingLeft: 40 }}
            />
          </View>
        </View>

        {/* Categories (Horizontal Scroll) */}
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}>
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onPress={() => setSelectedCategory(null)}
              style={styles.categoryBtn}
            >
              All Articles
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onPress={() => setSelectedCategory(category)}
                style={styles.categoryBtn}
              >
                {category}
              </Button>
            ))}
          </ScrollView>
        </View>

        {/* Posts */}
        <View style={styles.postsContainer}>
          {filteredPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No articles found. Try a different search term or category.</Text>
            </View>
          ) : (
            filteredPosts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.postCard}
                onPress={() => {
                  // In a real app, this would route to a detail view
                  // router.push(`/blog/${post.id}`)
                }}
              >
                <View style={styles.postImagePlaceholder}>
                  <Badge label={post.category} style={styles.postCategoryBadge} />
                  <Ionicons name="image-outline" size={32} color={Colors.gray[400]} />
                </View>
                <View style={styles.postContent}>
                  <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
                  <Text style={styles.postExcerpt} numberOfLines={3}>{post.excerpt}</Text>
                  
                  <View style={styles.postMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={14} color={Colors.mutedForeground} />
                      <Text style={styles.metaText}>{post.date}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={Colors.mutedForeground} />
                      <Text style={styles.metaText}>{post.readTime}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={18} color={Colors.primary[600]} style={{ marginLeft: 'auto' }} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Newsletter CTA */}
        <View style={styles.newsletterCard}>
          <Text style={styles.newsletterTitle}>Stay Updated with Tender Insights</Text>
          <Text style={styles.newsletterText}>
            Subscribe to our newsletter and get the latest articles, tender opportunities, and industry news delivered to your inbox weekly.
          </Text>
          <View style={styles.newsletterForm}>
            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={{ flex: 1, marginBottom: 0 }}
              style={{ backgroundColor: Colors.white }}
            />
            <Button
              onPress={handleSubscribe}
              loading={subscribeMutation.isPending}
              style={{ backgroundColor: Colors.white, marginTop: Spacing.sm }}
              textStyle={{ color: Colors.gray[900] }}
            >
              Subscribe Now
            </Button>
          </View>
        </View>
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  title: {
    fontSize: FontSizes['3xl'],
    fontWeight: '800',
    color: Colors.foreground,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.base,
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: FontSizes.base * 1.5,
  },
  searchContainer: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  categoryContainer: {
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  categoryBtn: {
    borderRadius: BorderRadius.full,
  },
  postsContainer: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    backgroundColor: Colors.gray[50],
  },
  emptyContainer: {
    paddingVertical: Spacing['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.mutedForeground,
    fontSize: FontSizes.base,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  postImagePlaceholder: {
    height: 160,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  postCategoryBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    zIndex: 1,
  },
  postContent: {
    padding: Spacing.lg,
  },
  postTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.foreground,
    marginBottom: Spacing.sm,
    lineHeight: FontSizes.lg * 1.3,
  },
  postExcerpt: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginBottom: Spacing.md,
    lineHeight: FontSizes.sm * 1.5,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    paddingTop: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FontSizes.xs,
    color: Colors.mutedForeground,
  },
  newsletterCard: {
    margin: Spacing.lg,
    marginTop: Spacing.xl,
    backgroundColor: '#404E3B',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    ...Shadows.lg,
  },
  newsletterTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  newsletterText: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: FontSizes.base * 1.4,
  },
  newsletterForm: {
    width: '100%',
  },
});
