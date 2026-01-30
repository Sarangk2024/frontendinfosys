import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { Text, useTheme, Card, Title, Paragraph, Avatar } from 'react-native-paper';
import { useAuth } from '../navigation/AuthContext';

const AnimatedCard = Animated.createAnimatedComponent(Card);

const InfoCard = ({ title, content, delay = 0, style, titleColor }) => {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 450,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <AnimatedCard style={[styles.card, style, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Avatar.Icon size={40} icon="leaf" style={{ backgroundColor: 'transparent' }} color={colors.primary} />
          <Title style={[styles.cardTitle, titleColor ? { color: titleColor } : { color: colors.text }]}>{title}</Title>
        </View>
        <Paragraph style={{ color: titleColor ? 'white' : colors.placeholder }}>{content}</Paragraph>
      </Card.Content>
    </AnimatedCard>
  );
};

export default function LandingScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
        <Paragraph style={[styles.subtitle, { color: colors.placeholder }]}>Welcome, {user?.email || 'User'}</Paragraph>
      </View>

      <InfoCard
        title="Get Started"
        content="Navigate to the 'Detect' tab to upload an image and get an instant analysis of your crops."
        delay={100}
        style={{ backgroundColor: colors.primary, marginTop: 8 }}
        titleColor="white"
      />

      <InfoCard
        title="How It Works"
        content="Our AI model analyzes plant leaf images to detect common diseases quickly and accurately."
        delay={250}
      />
      
      <InfoCard
        title="Supported Plants"
        content="Optimized for several crops including Wheat and Pumpkin; we keep adding more plants."
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
    paddingTop: 18,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
  },
  card: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    elevation: 3,
    paddingVertical: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '600',
  },
});