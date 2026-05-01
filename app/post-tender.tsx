import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import Toast from 'react-native-toast-message';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '@/constants/Colors';
import { useAuthState } from '@/hooks/useAuthState';
import { createTender, fetchCategories } from '@/lib/api/tenders';

export default function PostTenderScreen() {
  const router = useRouter();
  const { isAuthenticated, normalizedRole, isAdmin, isLoading: isAuthLoading } = useAuthState();

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    categoryId: '',
    location: '',
    description: '',
    requirements: '',
    status: 'DRAFT',
    companyName: '',
    companyWebsite: '',
  });

  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [documents, setDocuments] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [companyLogo, setCompanyLogo] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['tenderCategories'],
    queryFn: fetchCategories,
    enabled: isAuthenticated && (normalizedRole === 'COMPANY' || isAdmin),
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

  if (!isAuthenticated || (normalizedRole !== 'COMPANY' && !isAdmin)) {
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

  const pickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        multiple: true,
      });

      if (!result.canceled) {
        setDocuments((prev) => [...prev, ...result.assets]);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCompanyLogo(result.assets[0]);
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

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('summary', formData.summary);
    payload.append('description', formData.description);
    payload.append('categoryId', formData.categoryId);
    payload.append('location', formData.location);
    payload.append('deadline', deadline.toISOString());
    payload.append('status', formData.status);
    
    const requirements = formData.requirements ? formData.requirements.split('\n').filter(Boolean) : [];
    payload.append('requirements', JSON.stringify(requirements));

    if (isAdmin) {
      if (formData.companyName) payload.append('companyName', formData.companyName);
      if (formData.companyWebsite) payload.append('companyWebsite', formData.companyWebsite);
      if (companyLogo) {
        payload.append('companyLogo', {
          uri: companyLogo.uri,
          name: companyLogo.fileName || 'logo.jpg',
          type: companyLogo.mimeType || 'image/jpeg',
        } as any);
      }
    }

    documents.forEach((doc, index) => {
      payload.append('documents', {
        uri: doc.uri,
        name: doc.name,
        type: doc.mimeType || 'application/octet-stream',
      } as any);
    });

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

          <Select
            label="Category *"
            placeholder="Select a category"
            options={categories}
            value={formData.categoryId}
            onValueChange={(val) => handleInputChange('categoryId', val)}
          />

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
          <Text style={styles.sectionTitle}>Requirements</Text>
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
        </View>

        {isAdmin && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>External Company Information</Text>
            <Input
              label="Company Name"
              placeholder="e.g. Acme Corp"
              value={formData.companyName}
              onChangeText={(val) => handleInputChange('companyName', val)}
            />
            <Input
              label="Company Website"
              placeholder="https://example.com"
              value={formData.companyWebsite}
              onChangeText={(val) => handleInputChange('companyWebsite', val)}
              autoCapitalize="none"
              keyboardType="url"
            />
            
            <Text style={styles.label}>Company Logo</Text>
            <TouchableOpacity style={styles.filePickerButton} onPress={pickLogo}>
              <Ionicons name="image-outline" size={20} color={Colors.primary[600]} />
              <Text style={styles.filePickerButtonText}>
                {companyLogo ? 'Change Logo' : 'Upload Logo'}
              </Text>
            </TouchableOpacity>
            {companyLogo && (
              <View style={styles.logoPreviewContainer}>
                <Image source={{ uri: companyLogo.uri }} style={styles.logoPreview} />
                <TouchableOpacity onPress={() => setCompanyLogo(null)}>
                  <Ionicons name="close-circle" size={24} color={Colors.red[500]} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Supporting Documents</Text>
          <Text style={styles.sectionSubtitle}>PDF, DOC, DOCX (Max 10MB each)</Text>
          
          <TouchableOpacity style={styles.filePickerButton} onPress={pickDocuments}>
            <Ionicons name="cloud-upload-outline" size={20} color={Colors.primary[600]} />
            <Text style={styles.filePickerButtonText}>Select Documents</Text>
          </TouchableOpacity>

          {documents.length > 0 && (
            <View style={styles.documentList}>
              {documents.map((doc, index) => (
                <View key={`${doc.name}-${index}`} style={styles.documentItem}>
                  <Ionicons name="document-text-outline" size={20} color={Colors.gray[600]} />
                  <Text style={styles.documentName} numberOfLines={1}>{doc.name}</Text>
                  <TouchableOpacity onPress={() => removeDocument(index)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.red[500]} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.primary[600],
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[50],
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  filePickerButtonText: {
    color: Colors.primary[700],
    fontWeight: '600',
    fontSize: FontSizes.sm,
  },
  documentList: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  documentName: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.foreground,
  },
  logoPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  logoPreview: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
});

