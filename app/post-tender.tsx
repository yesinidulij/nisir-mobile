import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/Colors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createTender, fetchCategories } from '@/lib/api/tenders';
import { useAuthState } from '@/hooks/useAuthState';

export default function PostTenderScreen() {
  const router = useRouter();
  const { isAuthenticated, normalizedRole, isLoading: isAuthLoading } = useAuthState();

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    categoryId: '',
    location: '',
    description: '',
    requirements: '',
    specifications: '',
    status: 'DRAFT',
  });
  
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['tenderCategories'],
    queryFn: fetchCategories,
    enabled: isAuthenticated && normalizedRole === 'COMPANY',
  });

  const createTenderMutation = useMutation({
    mutationFn: createTender,
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Tender Created',
        text2: 'Your tender has been successfully submitted.',
      });
      router.back();
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to create tender',
        text2: error?.payload?.message || error.message || 'Please try again.',
      });
    },
  });

  if (isAuthLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </View>
    );
  }

  if (!isAuthenticated || normalizedRole !== 'COMPANY') {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Post Tender', headerTitleStyle: { color: Colors.foreground } }} />
        <Ionicons name="lock-closed-outline" size={64} color={Colors.gray[400]} />
        <Text style={styles.errorTitle}>Access Denied</Text>
        <Text style={styles.errorText}>
          You must be logged in as a verified Company to post a tender.
        </Text>
        <Button onPress={() => router.back()} style={{ marginTop: Spacing.xl }}>
          Go Back
        </Button>
      </View>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.categoryId || !formData.location || !formData.description || !deadline) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all required fields (Title, Category, Location, Description, Deadline).',
      });
      return;
    }

    const payload = {
      title: formData.title,
      summary: formData.summary,
      description: formData.description,
      categoryId: formData.categoryId,
      location: formData.location,
      deadline: deadline.toISOString(),
      status: formData.status,
      requirements: formData.requirements ? formData.requirements.split('\n').filter(Boolean) : [],
      specifications: formData.specifications ? formData.specifications.split('\n').filter(Boolean) : [],
    };

    createTenderMutation.mutate(payload);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: 'Post Tender', headerTitleStyle: { color: Colors.foreground } }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={32} color={Colors.primary[600]} />
          </View>
          <Text style={styles.title}>Create New Tender</Text>
          <Text style={styles.subtitle}>Fill out the details below to post a new tender to the marketplace.</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Input
            label="Tender Title *"
            placeholder="e.g. Office Equipment Supply"
            value={formData.title}
            onChangeText={(val) => handleInputChange('title', val)}
          />

          <Input
            label="Summary"
            placeholder="Brief description of the tender"
            value={formData.summary}
            onChangeText={(val) => handleInputChange('summary', val)}
            multiline
            numberOfLines={3}
            containerStyle={{ height: 80 }}
          />

          {/* Simple Category Picker (In a real app, use a proper Picker component) */}
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.categoryChip,
                  formData.categoryId === c.id && styles.categoryChipActive
                ]}
                onPress={() => handleInputChange('categoryId', c.id)}
              >
                <Text style={[
                  styles.categoryChipText,
                  formData.categoryId === c.id && styles.categoryChipTextActive
                ]}>{c.category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input
            label="Location *"
            placeholder="e.g. Addis Ababa, Ethiopia"
            value={formData.location}
            onChangeText={(val) => handleInputChange('location', val)}
          />

          <View style={styles.dateContainer}>
            <Text style={styles.label}>Deadline *</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={Colors.gray[600]} />
              <Text style={styles.dateText}>
                {deadline ? deadline.toLocaleDateString() : 'Select Deadline Date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={deadline || new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={handleDateChange}
              />
            )}
          </View>

          <Input
            label="Detailed Description *"
            placeholder="Enter full details about the tender requirements..."
            value={formData.description}
            onChangeText={(val) => handleInputChange('description', val)}
            multiline
            numberOfLines={6}
            containerStyle={{ height: 140 }}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Requirements & Specifications</Text>
          <Text style={styles.sectionSubtitle}>Enter each item on a new line.</Text>
          
          <Input
            label="Bidder Requirements"
            placeholder="e.g. Must have renewed trade license..."
            value={formData.requirements}
            onChangeText={(val) => handleInputChange('requirements', val)}
            multiline
            numberOfLines={4}
            containerStyle={{ height: 100 }}
          />

          <Input
            label="Technical Specifications"
            placeholder="e.g. Intel Core i7, 16GB RAM..."
            value={formData.specifications}
            onChangeText={(val) => handleInputChange('specifications', val)}
            multiline
            numberOfLines={4}
            containerStyle={{ height: 100 }}
          />
        </View>

        <Button
          onPress={handleSubmit}
          loading={createTenderMutation.isPending}
          fullWidth
          size="lg"
          style={styles.submitBtn}
          icon={<Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />}
        >
          Publish Tender
        </Button>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
    backgroundColor: Colors.white,
  },
  errorTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    color: Colors.foreground,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: FontSizes.base,
    color: Colors.mutedForeground,
    textAlign: 'center',
    lineHeight: FontSizes.base * 1.5,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    backgroundColor: Colors.gray[50],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '800',
    color: Colors.foreground,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.base,
    color: Colors.mutedForeground,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  formSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.foreground,
    marginBottom: Spacing.lg,
  },
  sectionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
    marginBottom: Spacing.md,
    marginTop: -Spacing.sm,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.foreground,
    marginBottom: Spacing.xs,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    marginRight: Spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  categoryChipText: {
    fontSize: FontSizes.sm,
    color: Colors.gray[600],
  },
  categoryChipTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  dateContainer: {
    marginBottom: Spacing.md,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  dateText: {
    fontSize: FontSizes.base,
    color: Colors.foreground,
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
});
