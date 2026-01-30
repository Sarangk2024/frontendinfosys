import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { Text, useTheme, Card, Title, Paragraph } from 'react-native-paper';
import { useAuth } from '../navigation/AuthContext';

const AnimatedCard = Animated.createAnimatedComponent(Card);

const InfoCard = ({ title, content, delay, style, titleColor }) => {
  const { colors } = useTheme(); // <-- FIX: Get colors from the theme here
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <AnimatedCard style={[styles.card, style, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
      <Card.Content>
        <Title style={[styles.cardTitle, { color: titleColor }]}>{title}</Title>
        <Paragraph style={{ color: titleColor ? 'white' : colors.text }}>{content}</Paragraph>
      </Card.Content>
    </AnimatedCard>
  );
};

export default function LandingScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Paragraph style={styles.subtitle}>Welcome, {user?.email || 'User'}</Paragraph>
      </View>

      <InfoCard
        title="Get Started"
        content="Ready to check your crops? Navigate to the 'Detect' tab to upload an image and get an instant analysis."
        delay={100}
        style={{ backgroundColor: colors.primary }}
        titleColor="white"
      />

      <InfoCard
        title="How It Works"
        content="Our advanced AI model analyzes the leaves of your plants to detect common diseases with high accuracy."
        delay={250}
      />
      
      <InfoCard
        title="Supported Plants"
        content="This version is optimized for analyzing various diseases affecting Wheat and Pumpkin plants."
        delay={400}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 4,
  },
  card: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
});
