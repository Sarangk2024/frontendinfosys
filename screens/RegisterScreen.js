import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Animated, Text } from 'react-native';
import { TextInput, Button, useTheme, Card, Title, Paragraph } from 'react-native-paper';
import { useAuth } from '../navigation/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const { colors, roundness } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleRegister = () => {
    if (name && email && password) {
      register(name, email, password);
    } else {
      alert('Please fill all fields.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          <Title style={[styles.logo, { color: colors.text }]}>AgriDetectAI</Title>
          <Paragraph style={[styles.subtitle, { color: colors.secondary }]}>
            Create Your Account
          </Paragraph>
          <Card style={[styles.card, { backgroundColor: colors.surface, borderRadius: 12 }]}>
            <Card.Content>
              <TextInput
                label="Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                mode="outlined"
                theme={{ roundness: roundness }}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                mode="outlined"
                autoCapitalize="none"
                keyboardType="email-address"
                theme={{ roundness: roundness }}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
                mode="outlined"
                theme={{ roundness: roundness }}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
              <Button
                mode="contained"
                onPress={handleRegister}
                style={[styles.button, { backgroundColor: colors.primary }]}n                contentStyle={styles.buttonContent}
                labelStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
              >
                Create Account
              </Button>
              <Button
                onPress={() => navigation.navigate('Login')}
                style={[styles.button, styles.secondaryButton, { borderColor: colors.primary }]}>
                labelStyle={{ color: colors.primary }}
              >
                Already have an account?
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
  },
  contentContainer: {
    padding: 24, // from layout.padding
  },
  logo: {
    fontSize: 32, // h1
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16, // body
    textAlign: 'center',
    marginBottom: 32, // section_spacing
  },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB', // border_color
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginTop: 8,
    borderRadius: 8, // from layout.border_radius
  },
  buttonContent: {
    height: 44, // from inputs.height
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
});