import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, BorderRadius, FontSizes, Spacing } from '@/constants/Colors';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ children, variant = 'default', style, textStyle }: BadgeProps) {
  return (
    <View style={[styles.badge, variantStyles[variant], style]}>
      <Text style={[styles.text, variantTextStyles[variant], textStyle]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
});

const variantStyles = StyleSheet.create({
  default: { backgroundColor: Colors.gray[100] },
  success: { backgroundColor: Colors.primary[100] },
  warning: { backgroundColor: Colors.yellow[100] },
  danger: { backgroundColor: Colors.red[100] },
  info: { backgroundColor: Colors.blue[100] },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border },
});

const variantTextStyles = StyleSheet.create({
  default: { color: Colors.gray[700] },
  success: { color: Colors.primary[700] },
  warning: { color: Colors.yellow[800] as string },
  danger: { color: Colors.red[700] },
  info: { color: Colors.blue[700] as string },
  outline: { color: Colors.gray[600] },
});
