import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { TextInput, Button, Text, useTheme, Card } from 'react-native-paper';
import { useAuth } from '../navigation/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogin = () => {
    if (email && password) {
      login(email, password);
    } else {
      alert('Please enter email and password.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.logo}>AgriDetectAI</Text>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>Welcome Back</Text>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                mode="outlined"
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
                mode="outlined"
              />
              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.button}
                labelStyle={{ fontWeight: 'bold' }}
              >
                Login
              </Button>
              <Button
                onPress={() => navigation.navigate('Register')}
                style={styles.button}
                color={colors.primary}
              >
                Create an account
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
    letterSpacing: 1,
  },
  card: {
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
