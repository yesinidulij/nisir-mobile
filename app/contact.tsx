import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createContactMessage, CreateContactMessageInput } from '@/lib/api/contact';

export default function ContactScreen() {
  const [formData, setFormData] = useState<CreateContactMessageInput>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    subject: '',
    message: '',
  });

  const contactMutation = useMutation({
    mutationFn: createContactMessage,
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Message Sent',
        text2: 'We will get back to you as soon as possible.',
      });
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        subject: '',
        message: '',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to send message',
        text2: error?.payload?.message || 'Please try again later.',
      });
    },
  });

  const handleInputChange = (field: keyof CreateContactMessageInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.firstName || !formData.email || !formData.message) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in required fields: First Name, Email, and Message.',
      });
      return;
    }
    contactMutation.mutate(formData);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'Contact Us', headerTitleStyle: { color: Colors.foreground } }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Get in Touch</Text>
          <Text style={styles.subtitle}>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Text>
        </View>

        <View style={styles.contactInfoCards}>
          <TouchableOpacity 
            style={styles.infoCard} 
            onPress={() => Linking.openURL('mailto:info@nisirchereta.com')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={24} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.infoTitle}>Email Us</Text>
              <Text style={styles.infoText}>info@nisirchereta.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.infoCard}
            onPress={() => Linking.openURL('tel:+251712134405')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="call-outline" size={24} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.infoTitle}>Call Us</Text>
              <Text style={styles.infoText}>+251 712 134 405</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Send a Message</Text>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="First Name"
                placeholder="John"
                value={formData.firstName}
                onChangeText={(val) => handleInputChange('firstName', val)}
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChangeText={(val) => handleInputChange('lastName', val)}
              />
            </View>
          </View>
          
          <Input
            label="Email Address"
            placeholder="john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(val) => handleInputChange('email', val)}
          />
          
          <Input
            label="Phone Number"
            placeholder="e.g. +251 911..."
            keyboardType="phone-pad"
            value={formData.phoneNumber}
            onChangeText={(val) => handleInputChange('phoneNumber', val)}
          />

          <Input
            label="Subject"
            placeholder="General Inquiry"
            value={formData.subject}
            onChangeText={(val) => handleInputChange('subject', val)}
          />

          <Input
            label="Message"
            placeholder="How can we help you?"
            multiline
            numberOfLines={5}
            value={formData.message}
            onChangeText={(val) => handleInputChange('message', val)}
            containerStyle={{ height: 120 }}
          />

          <Button
            onPress={handleSubmit}
            loading={contactMutation.isPending}
            fullWidth
            icon={<Ionicons name="send-outline" size={18} color={Colors.white} />}
            style={{ marginTop: Spacing.md }}
          >
            Send Message
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  subtitle: {
    fontSize: FontSizes.base,
    color: Colors.mutedForeground,
    textAlign: 'center',
    lineHeight: FontSizes.base * 1.5,
  },
  contactInfoCards: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
    gap: Spacing.md,
  },
  iconContainer: {
    backgroundColor: Colors.primary[600],
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  infoTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.foreground,
    marginBottom: 2,
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.gray[600],
  },
  formContainer: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
    gap: Spacing.md,
  },
  formTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.foreground,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
});
