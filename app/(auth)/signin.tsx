import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLoginUser } from '@/hooks/mutations/useLoginUser';
import { ApiError } from '@/lib/api/client';

export default function SignInScreen() {
  const router = useRouter();
  const loginMutation = useLoginUser();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!email.includes('@')) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    try {
      await loginMutation.mutateAsync({ email: email.trim(), password });
      Toast.show({ type: 'success', text1: 'Welcome back!', text2: 'You have signed in successfully.' });
      router.replace('/(tabs)');
    } catch (error) {
      const message = error instanceof ApiError
        ? (error.payload as any)?.message || 'Invalid credentials'
        : 'Something went wrong. Please try again.';
      Toast.show({ type: 'error', text1: 'Sign In Failed', text2: message });
    }
  };

  const content = (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/nisir-chereta-logo-new.png')} 
          style={styles.logoImage} 
          resizeMode="contain" 
        />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to your Nisir Chereta account
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.gray[400]} />}
        />

        <Input
          ref={passwordRef}
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="password"
          returnKeyType="done"
          blurOnSubmit={true}
          onSubmitEditing={handleSignIn}
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

        <Button
          fullWidth
          size="lg"
          onPress={handleSignIn}
          loading={loginMutation.isPending}
        >
          Sign In
        </Button>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don't have an account?{' '}
        </Text>
        <Pressable onPress={() => router.replace('/(auth)/signup')}>
          <Text style={styles.footerLink}>Sign Up</Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        {content}
      </KeyboardAvoidingView>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['5xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logoImage: {
    width: 180,
    height: 56,
    marginBottom: Spacing.lg,
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
  },
  form: {
    gap: Spacing.xs,
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
