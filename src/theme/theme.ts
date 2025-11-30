// src/theme/theme.ts
import { TextStyle, ViewStyle } from "react-native";

export const COLORS = {
  light: {
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#333333',
    subText: '#666666',
    primary: '#FF8C00', // Orange
    border: '#FF8C00',
    shadow: '#C06600', // Darker Orange for 3D effect
    danger: '#FF4500',
    dangerShadow: '#C03500',
    success: '#32CD32',
    neutral: '#E0E0E0',
    neutralShadow: '#999999',
    neutralText: '#555555'
  },
  dark: {
    background: '#0F172A', // Deep Space Blue
    card: '#1E293B',       // Slate Blue
    text: '#E2E8F0',       // Light Grey
    subText: '#94A3B8',
    primary: '#8B5CF6',    // Neon Violet
    border: '#7C3AED',
    shadow: '#5B21B6',     // Deep Violet
    danger: '#D946EF',     // Hot Pink
    dangerShadow: '#A21CAF',
    success: '#4ADE80',
    neutral: '#334155',
    neutralShadow: '#1E293B',
    neutralText: '#CBD5E1'
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40
};

export const TEXT: Record<string, TextStyle> = {
  header: {
    fontSize: 22,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  body: {
    fontSize: 16,
    fontWeight: '500',
  }
};

export const LAYOUT: Record<string, ViewStyle> = {
  card3D: {
    borderRadius: 20,
    borderWidth: 3,
    borderBottomWidth: 6,
    elevation: 5,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  }
};