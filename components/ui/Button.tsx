import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  PressableProps,
} from 'react-native';
import { Colors, BorderRadius, FontSizes, Spacing } from '@/constants/Colors';

interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  textStyle?: TextStyle;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  textStyle,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const buttonStyle: ViewStyle[] = [
    styles.base,
    styles[variant as keyof typeof styles],
    styles[`size_${size}` as keyof typeof styles],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textColor = variant === 'primary' || variant === 'destructive'
    ? Colors.white
    : variant === 'outline'
      ? Colors.primary[600]
      : Colors.gray[700];

  return (
    <Pressable
      style={({ pressed }) => [
        ...buttonStyle,
        pressed && !isDisabled && styles.pressed,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.white : Colors.primary[600]}
        />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, styles[`text_${size}` as keyof typeof styles] as TextStyle, { color: textColor }, textStyle]}>
            {children}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  primary: {
    backgroundColor: Colors.primary[600],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary[600],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: Colors.red[600],
  },
  size_sm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
  },
  size_md: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 44,
  },
  size_lg: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    minHeight: 52,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontWeight: '600',
  },
  text_sm: {
    fontSize: FontSizes.sm,
  },
  text_md: {
    fontSize: FontSizes.base,
  },
  text_lg: {
    fontSize: FontSizes.lg,
  },
});
