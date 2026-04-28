import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRegisterUser } from '@/hooks/mutations/useRegisterUser';
import { ApiError } from '@/lib/api/client';

type AccountType = 'COMPANY' | 'INDIVIDUAL';

export default function SignUpScreen() {
  const router = useRouter();
  const registerMutation = useRegisterUser();

  const [accountType, setAccountType] = useState<AccountType>('COMPANY');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!email.includes('@')) newErrors.email = 'Enter a valid email';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    try {
      await registerMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phone.trim(),
        password,
        role: accountType,
      });
      Toast.show({ type: 'success', text1: 'Account Created!', text2: 'Please check your email to verify your account.' });
      router.replace('/(tabs)');
    } catch (error) {
      const message = error instanceof ApiError
        ? (error.payload as any)?.message || 'Registration failed'
        : 'Something went wrong. Please try again.';
      Toast.show({ type: 'error', text1: 'Registration Failed', text2: message });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join Nisir Chereta and start connecting with bidders
          </Text>
        </View>

        {/* Account Type Toggle */}
        <View style={styles.typeToggle}>
          <Pressable
            style={[styles.typeOption, accountType === 'COMPANY' && styles.typeOptionActive]}
            onPress={() => setAccountType('COMPANY')}
          >
            <Ionicons
              name="business-outline"
              size={20}
              color={accountType === 'COMPANY' ? Colors.white : Colors.gray[600]}
            />
            <Text style={[styles.typeText, accountType === 'COMPANY' && styles.typeTextActive]}>
              Company
            </Text>
          </Pressable>
          <Pressable
            style={[styles.typeOption, accountType === 'INDIVIDUAL' && styles.typeOptionActive]}
            onPress={() => setAccountType('INDIVIDUAL')}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={accountType === 'INDIVIDUAL' ? Colors.white : Colors.gray[600]}
            />
            <Text style={[styles.typeText, accountType === 'INDIVIDUAL' && styles.typeTextActive]}>
              Individual
            </Text>
          </Pressable>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Input
                label="First Name"
                placeholder="John"
                value={firstName}
                onChangeText={(t) => { setFirstName(t); clearError('firstName'); }}
                error={errors.firstName}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.halfField}>
              <Input
                label="Last Name"
                placeholder="Doe"
                value={lastName}
                onChangeText={(t) => { setLastName(t); clearError('lastName'); }}
                error={errors.lastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={(t) => { setEmail(t); clearError('email'); }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.gray[400]} />}
          />

          <Input
            label="Phone Number"
            placeholder="0912345678"
            value={phone}
            onChangeText={(t) => { setPhone(t); clearError('phone'); }}
            error={errors.phone}
            keyboardType="phone-pad"
            leftIcon={<Ionicons name="call-outline" size={20} color={Colors.gray[400]} />}
          />

          <Input
            label="Password"
            placeholder="Min. 6 characters"
            value={password}
            onChangeText={(t) => { setPassword(t); clearError('password'); }}
            error={errors.password}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Colors.gray[400]} />}
            rightIcon={
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.gray[400]}
                />
              </Pressable>
            }
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); clearError('confirmPassword'); }}
            error={errors.confirmPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Colors.gray[400]} />}
          />

          <Button
            fullWidth
            size="lg"
            onPress={handleSignUp}
            loading={registerMutation.isPending}
          >
            Create Account
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
          </Text>
          <Pressable onPress={() => router.replace('/(auth)/signin')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  header: {
    marginBottom: Spacing['2xl'],
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    color: Colors.foreground,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.base,
    color: Colors.mutedForeground,
    lineHeight: FontSizes.base * 1.5,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.xl,
    padding: 4,
    marginBottom: Spacing['2xl'],
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  typeOptionActive: {
    backgroundColor: Colors.primary[600],
  },
  typeText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  typeTextActive: {
    color: Colors.white,
  },
  form: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing['2xl'],
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: Colors.mutedForeground,
  },
  footerLink: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary[600],
  },
});
