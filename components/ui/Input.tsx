import React, { forwardRef, useState } from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, BorderRadius, FontSizes, Spacing } from '@/constants/Colors';

interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<RNTextInput, InputProps>(function Input(
  {
    label,
    error,
    containerStyle,
    leftIcon,
    rightIcon,
    style,
    ...props
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <RNTextInput
          ref={ref}
          blurOnSubmit={false}
          {...props}
          style={[styles.input, leftIcon ? styles.inputWithLeftIcon : null, rightIcon ? styles.inputWithRightIcon : null, style]}
          placeholderTextColor={Colors.gray[400]}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.gray[700],
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.red[500],
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.foreground,
  },
  inputWithLeftIcon: {
    paddingLeft: Spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: Spacing.xs,
  },
  iconLeft: {
    paddingLeft: Spacing.md,
  },
  iconRight: {
    paddingRight: Spacing.md,
  },
  errorText: {
    fontSize: FontSizes.xs,
    color: Colors.red[600],
    marginTop: Spacing.xs,
  },
});
