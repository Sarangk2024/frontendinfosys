import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Button, Card, Text, ActivityIndicator, useTheme, Portal, Modal, Title, Paragraph } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function DetectScreen() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { colors, roundness } = useTheme();

  const resultAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (result) {
      Animated.spring(resultAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  }, [result]);

  const pickImage = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setImage(pickerResult.assets[0].uri);
      setResult(null);
      resultAnim.setValue(0);
      setError(null);
    }
  };

  const handleDetect = async () => {
    if (!image) {
      setError('Please select an image first.');
      return;
    }
    setLoading(true);
    setResult(null);
    resultAnim.setValue(0);
    setError(null);

    const response = await fetch(image);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, 'photo.jpg');

    try {
      const fetchResponse = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });
      const responseData = await fetchResponse.json();
      if (fetchResponse.ok) {
        setResult(responseData);
      } else {
        throw new Error(responseData.error || 'Failed to get prediction.');
      }
    } catch (e) {
      console.error(e);
      setError(e.message || 'An unexpected error occurred. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const isHealthy = result && result.prediction && result.prediction.toLowerCase().includes('healthy');

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentContainer}>
        <Card style={[styles.card, { backgroundColor: colors.surface, borderRadius: 12 }]}>
          <Card.Content>
            <Title style={[styles.cardTitle, { color: colors.text }]}>Plant Disease Detection</Title>
            <TouchableOpacity onPress={pickImage}>
              <View style={[styles.imageContainer, { borderColor: colors.border, borderRadius: roundness }]}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.image} />
                ) : (
                  <Paragraph style={{ color: colors.placeholder }}>Tap to select an image</Paragraph>
                )}
              </View>
            </TouchableOpacity>
            <Button
              mode="contained"
              onPress={handleDetect}
              style={[styles.button, { backgroundColor: colors.primary }]}
              contentStyle={styles.buttonContent}
              disabled={!image || loading}
              loading={loading}
              labelStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
            >
              {!loading && 'Analyze Plant'}
            </Button>
          </Card.Content>
        </Card>

        {result && (
          <AnimatedCard style={[styles.card, { marginTop: 32, borderColor: isHealthy ? colors.success : colors.error, transform: [{ scale: resultAnim }] }]}>
            <Card.Content>
              <Title style={styles.cardTitle}>Analysis Result</Title>
              <View style={[styles.resultBanner, { backgroundColor: isHealthy ? colors.success : colors.error }]}>
                <Text style={styles.resultBannerText}>{result.prediction.replace('_', ' ')}</Text>
              </View>
              <Paragraph style={[styles.confidenceText, { color: colors.secondary }]}>
                Confidence: <Text style={{ fontWeight: 'bold', color: colors.text }}>{result.confidence}</Text>
              </Paragraph>
              <Paragraph style={[styles.disclaimer, { color: colors.secondary }]}>
                {isHealthy
                  ? 'No immediate action required. Continue monitoring your plant.'
                  : 'Action may be required. Please consult with a specialist for treatment options.'}
              </Paragraph>
            </Card.Content>
          </AnimatedCard>
        )}
      </View>
      <Portal>
        <Modal visible={!!error} onDismiss={() => setError(null)} contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.surface, borderRadius: 12 }]}>
          <Title style={{color: colors.error}}>Error</Title>
          <Paragraph style={{color: colors.text}}>{error}</Paragraph>
          <Button onPress={() => setError(null)} style={{ marginTop: 20 }} color={colors.primary}>OK</Button>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 20,
    fontWeight: '600',
  },
  imageContainer: {
    height: 250,
    width: '100%',
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  image: {
    height: '100%',
    width: '100%',
    borderRadius: 8,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 44,
    justifyContent: 'center',
  },
  resultBanner: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  resultBannerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  confidenceText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 8,
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 14,
  },
  modalContainer: {
    padding: 24,
    margin: 24,
  },
});