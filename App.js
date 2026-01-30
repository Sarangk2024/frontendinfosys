import React from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './navigation/AuthContext';

const theme = {
  ...DefaultTheme,
  roundness: 8,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0A6ED1',    // professional deep blue
    accent: '#00BFA6',     // subtle teal accent
    background: '#F3F6FA', // very light background
    surface: '#FFFFFF',    // white cards / surfaces
    text: '#1F2D3D',       // dark text for contrast
    placeholder: '#90A4AE',
    primary_variant: '#0957A1',
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: DefaultTheme.fonts.regular?.fontFamily || 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: DefaultTheme.fonts.medium?.fontFamily || 'System',
      fontWeight: '500',
    },
  },
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