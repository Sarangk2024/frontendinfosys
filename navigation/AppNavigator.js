import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from './AuthContext';
import { Appbar, useTheme, Menu, IconButton } from 'react-native-paper';

// Import Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LandingScreen from '../screens/LandingScreen';
import DetectScreen from '../screens/DetectScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppHeader({ title }) {
  const { colors } = useTheme();
  const auth = useAuth();
  const [visible, setVisible] = useState(false);

  return (
    <Appbar.Header elevated style={{ backgroundColor: colors.surface }}>
      <Appbar.Content title={title} titleStyle={{ color: colors.text, fontWeight: '600' }} />
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <IconButton
            icon="dots-vertical"
            color={colors.placeholder}
            onPress={() => setVisible(true)}
            accessibilityLabel="Open menu"
          />
        }
      >
        <Menu.Item onPress={() => { auth.logout(); setVisible(false); }} title="Logout" />
      </Menu>
    </Appbar.Header>
  );
}

function MainAppTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        header: () => <AppHeader title="AgriDetectAI" />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9aa5b1',
        tabBarStyle: { backgroundColor: colors.surface },
        headerStyle: { backgroundColor: colors.surface },
      }}
    >
      <Tab.Screen name="Home" component={LandingScreen} />
      <Tab.Screen name="Detect" component={DetectScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      {user ? <MainAppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}