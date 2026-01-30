import React from 'react';
import { Provider as PaperProvider, configureFonts, DefaultTheme } from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './navigation/AuthContext';

// Define font configurations based on the design system
const fontConfig = {
  default: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: '600',
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: '100',
    },
  },
};

// Create the new theme based on the provided JSON design system
const theme = {
  ...DefaultTheme,
  roundness: 8, // from layout.border_radius
  colors: {
    ...DefaultTheme.colors,
    primary: '#2563EB',
    accent: '#6366F1',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    secondary: '#6B7280', // for secondary text
    placeholder: '#9CA3AF',
    backdrop: 'rgba(0,0,0,0.5)',
    onSurface: '#111827',
    error: '#DC2626',
    // Custom colors
    success: '#16A34A',
    warning: '#F59E0B',
    border: '#E5E7EB',
  },
  fonts: configureFonts(fontConfig),
};


export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}