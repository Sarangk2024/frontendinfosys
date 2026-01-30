import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Animated, useWindowDimensions } from 'react-native';
import { TextInput, Button, Text, useTheme, Card, Title, Avatar } from 'react-native-paper';
import { useAuth } from '../navigation/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const containerWidth = Math.min(480, width * 0.95); // responsive max width

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleRegister = () => {
    if (name && email && password) {
      register(name, email, password);
    } else {
      // Replace with inline helper UI if desired
      alert('Please fill all fields.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.outer, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.center, { opacity: fadeAnim, width: containerWidth }]}>
          <View style={styles.brandRow}>
            <Avatar.Icon size={56} icon="leaf" style={{ backgroundColor: 'transparent' }} color={colors.primary} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.appName, { color: colors.text }]}>AgriDetectAI</Text>
              <Text style={[styles.appSubtitle, { color: colors.placeholder }]}>Create your account</Text>
            </View>
          </View>

          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <Title style={[styles.title, { color: colors.text }]}>Create an Account</Title>

              <TextInput
                label="Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                mode="outlined"
                outlineColor={colors.placeholder}
                activeOutlineColor={colors.primary}
                autoCapitalize="words"
              />

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                mode="outlined"
                autoCapitalize="none"
                keyboardType="email-address"
                outlineColor={colors.placeholder}
                activeOutlineColor={colors.primary}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
                mode="outlined"
                outlineColor={colors.placeholder}
                activeOutlineColor={colors.primary}
              />

              <Button
                mode="contained"
                onPress={handleRegister}
                style={[styles.button, { backgroundColor: colors.primary }]}
                labelStyle={{ fontWeight: '700' }}
                contentStyle={{ height: 48 }}
              >
                Register
              </Button>

              <Button
                onPress={() => navigation.navigate('Login')}
                style={styles.linkButton}
                textColor={colors.primary}
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
  outer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  center: {
    alignSelf: 'center',
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 14,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
  },
  appSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    borderRadius: 12,
    elevation: 6,
    paddingVertical: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  linkButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
});