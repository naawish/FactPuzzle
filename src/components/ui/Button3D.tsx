import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../theme/theme';

interface Button3DProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'neutral' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  // NEW: Accessibility Props
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Button3D: React.FC<Button3DProps> = ({ 
  label, 
  onPress, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  // Default the label to the text content if not provided
  accessibilityLabel = label, 
  accessibilityHint
}) => {
  const { isDark } = useTheme();
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  let bgColor = themeColors.primary;
  let shadowColor = themeColors.shadow;
  let textColor = '#FFFFFF';

  switch (variant) {
    case 'danger':
      bgColor = themeColors.danger;
      shadowColor = themeColors.dangerShadow;
      break;
    case 'neutral':
      bgColor = themeColors.neutral;
      shadowColor = themeColors.neutralShadow;
      textColor = themeColors.neutralText;
      break;
    case 'success':
      bgColor = themeColors.success;
      shadowColor = '#15803d';
      break;
  }

  let paddingV = 16;
  let fontSize = 18;
  if (size === 'sm') {
    paddingV = 10;
    fontSize = 14;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      // --- NEW ACCESSIBILITY ATTRIBUTES ---
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel} // Reads "Login Button"
      accessibilityHint={accessibilityHint}   // Reads "Double tap to sign in"
      accessibilityState={{ disabled, busy: loading }}
      // ------------------------------------
      style={[
        styles.base,
        { 
          backgroundColor: bgColor,
          borderColor: bgColor,
          borderBottomColor: shadowColor,
          paddingVertical: paddingV,
          opacity: disabled ? 0.6 : 1
        },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize }, textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderBottomWidth: 6,
    minWidth: 100,
  },
  text: {
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  }
});