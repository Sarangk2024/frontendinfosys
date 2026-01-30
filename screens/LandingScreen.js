import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { Text, useTheme, Card, Title, Paragraph } from 'react-native-paper';
import { useAuth } from '../navigation/AuthContext';

const AnimatedCard = Animated.createAnimatedComponent(Card);

const InfoCard = ({ title, content, delay, style, titleColor, contentColor }) => {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300, // Faster animation
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200, // Faster animation
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <AnimatedCard style={[styles.card, style, { borderColor: colors.border, opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
      <Card.Content>
        <Title style={[styles.cardTitle, { color: titleColor || colors.text }]}>{title}</Title>
        <Paragraph style={{ color: contentColor || colors.secondary, lineHeight: 22 }}>{content}</Paragraph>
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
        <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
        <Paragraph style={[styles.subtitle, { color: colors.secondary }]}>
          Welcome, {user?.email || 'User'}
        </Paragraph>
      </View>

      <InfoCard
        title="Get Started"
        content="Ready to check your crops? Navigate to the 'Detect' tab to upload an image and get an instant analysis."
        delay={100}
        style={{ backgroundColor: colors.primary }}
        titleColor="#FFFFFF"
        contentColor="#E0E0E0"
      />

      <InfoCard
        title="How It Works"
        content="Our advanced AI model analyzes the leaves of your plants to detect common diseases with high accuracy."
        delay={200}
      />
      
      <InfoCard
        title="Supported Plants"
        content="This version is optimized for analyzing various diseases affecting Wheat and Pumpkin plants."
        delay={300}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24, // from layout.padding
    paddingBottom: 12,
  },
  title: {
    fontSize: 32, // h1
    fontWeight: '600',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16, // body
    marginTop: 4,
  },
  card: {
    marginHorizontal: 24, // from layout.padding
    marginVertical: 8,
    borderRadius: 12, // from cards.border_radius
    borderWidth: 1,
    elevation: 0, // Use border instead of shadow for minimal look
    shadowColor: 'transparent',
  },
  cardTitle: {
    fontSize: 20, // h3
    fontWeight: '600',
    marginBottom: 8,
  },
});