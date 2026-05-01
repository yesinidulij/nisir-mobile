import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';

import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/Colors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is Nisir and how does it work?',
    answer: 'Nisir is a professional tender platform that connects companies with qualified bidders through secure and transparent tender management. Companies can post tenders, review bidder profiles, and manage the entire tender process from start to finish in one centralized platform.'
  },
  {
    question: 'How do I create an account?',
    answer: 'Click on the "Sign Up" button in the top right corner and choose whether you\'re a Company posting tenders or a Bidder bidding on tenders. Fill in your basic information, verify your email, and complete your profile. Company accounts require additional verification before posting tenders.'
  },
  {
    question: 'Is Nisir free to use?',
    answer: 'Browsing tenders and creating an account is completely free. We offer simple pricing plans for posting tenders only. Check our Pricing page for detailed information about our plans.'
  },
  {
    question: 'How do I post a tender?',
    answer: 'After your company account is verified, click "Post Tender" in the navigation. Fill out our multi-step form with tender details including project description, requirements, timeline, and required documents. Once submitted, your tender will be reviewed by our admin team before being published.'
  },
  {
    question: 'How long does it take for a tender to be approved?',
    answer: 'Our admin team reviews all tender submissions within 24-48 hours. We verify that the tender meets our quality standards and contains all necessary information. You\'ll receive a notification once your tender is approved and published.'
  },
  {
    question: 'Can I edit or cancel a tender after posting?',
    answer: 'Yes, you can edit tender details or cancel a tender from your "Manage Tenders" dashboard at any time. If bidders have already started communicating about the tender, they will be notified of significant changes.'
  },
  {
    question: 'How do I communicate with interested bidders?',
    answer: 'When bidders express interest in your tender, you can communicate with them through our built-in messaging system. Go to Messages in the navigation to view all conversations related to your tenders.'
  },
  {
    question: 'How do I find relevant tenders?',
    answer: 'Browse all available tenders on the "Browse Tenders" page. Use our advanced filters to narrow down by category, location and deadline. You can also save tenders for later review.'
  },
];

function FAQAccordionItem({ item, isOpen, onPress }: { item: FAQItem; isOpen: boolean; onPress: () => void }) {
  return (
    <View style={styles.accordionContainer}>
      <Pressable onPress={onPress} style={styles.accordionHeader}>
        <Text style={styles.accordionTitle}>{item.question}</Text>
        <View style={[styles.iconContainer, isOpen && styles.iconContainerOpen]}>
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color={isOpen ? Colors.white : Colors.gray[600]} 
            style={isOpen ? { transform: [{ rotate: '180deg' }] } : undefined}
          />
        </View>
      </Pressable>
      {isOpen && (
        <View style={styles.accordionContent}>
          <Text style={styles.accordionText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
}

export default function FAQScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'FAQ', headerTitleStyle: { color: Colors.foreground } }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Frequently Asked Questions</Text>
          <Text style={styles.subtitle}>
            Everything you need to know about Nisir's tender platform
          </Text>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.primary[600]} style={styles.searchIcon} />
            <Input
              placeholder="Search for answers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={{ marginBottom: 0, flex: 1 }}
              style={{ paddingLeft: 40 }}
            />
          </View>
          {searchQuery ? (
            <Text style={styles.resultText}>
              {filteredFAQs.length} {filteredFAQs.length === 1 ? 'result' : 'results'} found
            </Text>
          ) : null}
        </View>

        <View style={styles.faqList}>
          {filteredFAQs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="search-outline" size={32} color={Colors.mutedForeground} />
              </View>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyText}>
                We couldn't find any FAQs matching your search. Try different keywords.
              </Text>
              <Button onPress={() => setSearchQuery('')} variant="outline" style={{ marginTop: Spacing.md }}>
                Clear Search
              </Button>
            </View>
          ) : (
            filteredFAQs.map((faq, index) => (
              <FAQAccordionItem
                key={index}
                item={faq}
                isOpen={openIndex === index}
                onPress={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))
          )}
        </View>

        {filteredFAQs.length > 0 && (
          <View style={styles.contactSupportCard}>
            <View style={styles.supportIcon}>
              <Ionicons name="mail" size={32} color={Colors.white} />
            </View>
            <Text style={styles.supportTitle}>Still have questions?</Text>
            <Text style={styles.supportText}>
              Can't find the answer you're looking for? Our support team is here to help you.
            </Text>
            <Button 
              onPress={() => router.push('/contact')}
              style={{ backgroundColor: Colors.white }}
              textStyle={{ color: Colors.gray[900] }}
            >
              Contact Support
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes['2xl'],
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
  resultText: {
    marginTop: Spacing.sm,
    color: Colors.mutedForeground,
    fontSize: FontSizes.sm,
    alignSelf: 'flex-start',
  },
  faqList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  accordionContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  accordionTitle: {
    flex: 1,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.foreground,
    paddingRight: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerOpen: {
    backgroundColor: Colors.gray[900],
  },
  accordionContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  accordionText: {
    color: Colors.mutedForeground,
    lineHeight: FontSizes.base * 1.5,
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing['2xl'],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.foreground,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.base,
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  contactSupportCard: {
    backgroundColor: '#404E3B',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    alignItems: 'center',
    ...Shadows.lg,
  },
  supportIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  supportTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  supportText: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: FontSizes.base * 1.4,
  },
});
