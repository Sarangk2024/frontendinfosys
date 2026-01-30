import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { Button, Card, Text, ActivityIndicator, useTheme, Portal, Modal, Paragraph, Title } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function DetectScreen() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { colors } = useTheme();

  const resultAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (result) {
      Animated.spring(resultAnim, {
        toValue: 1,
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
    <View style={styles.container}>
      <Card style={styles.uploadCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Upload an Image</Title>
          <TouchableOpacity onPress={pickImage}>
            <View style={[styles.imageContainer, { borderColor: colors.placeholder }]}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <Text style={{ color: colors.placeholder }}>Tap to select an image</Text>
              )}
            </View>
          </TouchableOpacity>
          <Button
            mode="contained"
            onPress={handleDetect}
            style={styles.button}
            disabled={!image || loading}
            loading={loading}
          >
            {!loading && 'Analyze Plant'}
          </Button>
        </Card.Content>
      </Card>

      {result && (
        <AnimatedCard style={[styles.resultCard, { transform: [{ scale: resultAnim }] }]}>
          <Card.Content>
            <Title style={styles.cardTitle}>Analysis Result</Title>
            <View style={[styles.resultBanner, { backgroundColor: isHealthy ? '#2ecc71' : '#e74c3c' }]}>
              <Text style={styles.resultBannerText}>{result.prediction.replace('_', ' ')}</Text>
            </View>
            <Paragraph style={styles.confidenceText}>
              Confidence: <Text style={{ fontWeight: 'bold' }}>{result.confidence}</Text>
            </Paragraph>
            <Paragraph style={styles.disclaimer}>
              {isHealthy
                ? 'No immediate action required. Continue monitoring your plant.'
                : 'Action may be required. Please consult with a specialist for treatment options.'}
            </Paragraph>
          </Card.Content>
        </AnimatedCard>
      )}

      <Portal>
        <Modal visible={!!error} onDismiss={() => setError(null)} contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          <Title>Error</Title>
          <Paragraph>{error}</Paragraph>
          <Button onPress={() => setError(null)} style={{ marginTop: 10 }}>OK</Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  uploadCard: {
    borderRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  imageContainer: {
    height: 250,
    width: '100%',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f8f9f9',
  },
  image: {
    height: '100%',
    width: '100%',
    borderRadius: 10,
  },
  button: {
    paddingVertical: 6,
    borderRadius: 8,
  },
  resultCard: {
    marginTop: 20,
    borderRadius: 12,
    elevation: 4,
  },
  resultBanner: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  resultBannerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  confidenceText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 14,
    color: '#7f8c8d',
  },
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
});
