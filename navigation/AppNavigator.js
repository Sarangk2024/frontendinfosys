import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from './AuthContext';
import { Appbar, useTheme, Button } from 'react-native-paper';

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

function MainAppTabs() {
    const { colors } = useTheme();
    const auth = useAuth();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: 'gray',
                header: () => (
                    <Appbar.Header>
                        <Appbar.Content title="AgriDetectAI" />
                        <Button color="#ffffff" onPress={() => auth.logout()}>Logout</Button>
                    </Appbar.Header>
                ),
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
