import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
  useWindowDimensions,
  Linking,
  ScrollView,
} from 'react-native';
import {
  Button,
  Card,
  Text,
  useTheme,
  Portal,
  Modal,
  Paragraph,
  Title,
  Divider,
  IconButton,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

// ====== Update these to reflect your model/classes ======
const LABELS = [
  'Healthy',
  'Wheat - Rust',
  'Wheat - Leaf Blight',
  'Pumpkin - Powdery Mildew',
  // ... add all model classes in order
];

// Map label substrings (lowercase) to severity.
// Keys are substrings to match against the mapped label; adjust to your classes.
const SEVERITY_MAP = [
  { match: ['healthy'], severity: 'safe', color: '#2ecc71', title: 'No action needed', message: 'Plant looks healthy. Continue regular monitoring.' },
  { match: ['mild', 'minor', 'monitor'], severity: 'monitor', color: '#f1c40f', title: 'Monitor plant', message: 'Minor symptoms detected. Monitor regularly and consider preventive care.' },
  { match: ['rust', 'blight', 'powdery', 'severe', 'late blight'], severity: 'urgent', color: '#e74c3c', title: 'Immediate action required', message: 'Serious disease detected. Consider treatment options and consult an expert immediately.' },
];

// Platform-aware dev server host (used for requests; not shown in UI)
const DEFAULT_LOCALHOST = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const SERVER_HOST = DEFAULT_LOCALHOST;

const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function DetectScreen() {
  const { width } = useWindowDimensions();
  const containerWidth = Math.min(720, width * 0.95);

  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tipsVisible, setTipsVisible] = useState(false);

  const { colors } = useTheme();
  const resultAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (result) Animated.spring(resultAnim, { toValue: 1, useNativeDriver: true }).start();
  }, [result]);

  // ---------- Image picker compatibility ----------
  const getMediaTypesOption = () => {
    if ('MediaType' in ImagePicker && ImagePicker.MediaType && ImagePicker.MediaType.Images) return ImagePicker.MediaType.Images;
    if ('MediaTypeOptions' in ImagePicker && ImagePicker.MediaTypeOptions && ImagePicker.MediaTypeOptions.Images) {
      console.warn('[expo-image-picker] ImagePicker.MediaTypeOptions is deprecated. Consider upgrading.');
      return ImagePicker.MediaTypeOptions.Images;
    }
    return 'Images';
  };

  const pickImage = async () => {
    try {
      const mediaTypes = getMediaTypesOption();
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!pickerResult.canceled) {
        const uri = pickerResult.assets?.[0]?.uri ?? pickerResult.uri;
        setImage(uri);
        setResult(null);
        resultAnim.setValue(0);
        setError(null);
      }
    } catch (e) {
      console.error('pickImage error', e);
      setError('Could not open image picker: ' + (e.message || e));
    }
  };

  // ---------- Helpers for label / confidence ----------
  const mapPredictionToLabel = (pred) => {
    if (pred === null || pred === undefined) return '';
    if (typeof pred === 'number') return LABELS[pred] ?? `Class ${pred}`;
    const s = String(pred).trim();
    const m = s.match(/(\d+)/);
    if (m) {
      const idx = parseInt(m[1], 10);
      return LABELS[idx] ?? `Class ${idx}`;
    }
    // convert snake_case to Title Case
    const cleaned = s.replace(/_/g, ' ');
    return cleaned.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatConfidence = (c) => {
    if (c == null) return null;
    if (typeof c === 'number') {
      return c <= 1 ? (c * 100).toFixed(2) + '%' : c.toFixed(2) + '%';
    }
    return String(c);
  };

  // Determine severity by matching substrings in the label
  const determineSeverity = (label) => {
    if (!label) return { severity: 'unknown', color: '#95a5a6', title: 'Unknown', message: 'No guidance available.' };
    const l = label.toLowerCase();
    for (let m of SEVERITY_MAP) {
      for (let key of m.match) {
        if (l.includes(key)) return { severity: m.severity, color: m.color, title: m.title, message: m.message };
      }
    }
    // default fallback
    return { severity: 'monitor', color: '#f39c12', title: 'Monitor plant', message: 'Review the result and monitor the plant closely.' };
  };

  // ---------- Upload & predict ----------
  const handleDetect = async () => {
    if (!image) {
      setError('Please select an image first.');
      return;
    }
    setLoading(true);
    setResult(null);
    resultAnim.setValue(0);
    setError(null);

    try {
      const url = `${SERVER_HOST}/predict`;

      const response = await fetch(image);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, 'photo.jpg');

      const fetchResponse = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!fetchResponse.ok) {
        const body = await fetchResponse.text().catch(() => null);
        throw new Error(`Server error ${fetchResponse.status}: ${body ?? fetchResponse.statusText}`);
      }

      const responseData = await fetchResponse.json();
      setResult(responseData);
    } catch (e) {
      console.error('handleDetect error', e);
      if (e.message && (e.message.includes('Network request failed') || e.message.includes('Failed to fetch'))) {
        setError(`Network error: could not reach ${SERVER_HOST}. Ensure backend is running and reachable from this device/emulator.`);
      } else {
        setError(e.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------- Render helpers ----------
  const renderResultDetails = (res) => {
    if (!res || typeof res !== 'object') return <Text>{String(res)}</Text>;

    const main = [];
    if ('prediction' in res) {
      main.push(
        <View key="pred" style={{ marginBottom: 8 }}>
          <Text style={styles.labelTitle}>Prediction</Text>
          <Text style={styles.labelValue}>{mapPredictionToLabel(res.prediction) || String(res.prediction)}</Text>
        </View>
      );
    }
    if ('confidence' in res) {
      main.push(
        <View key="conf" style={{ marginBottom: 8 }}>
          <Text style={styles.metaTitle}>Confidence</Text>
          <Text style={styles.metaValue}>{formatConfidence(res.confidence)}</Text>
        </View>
      );
    }

    const details = Object.keys(res)
      .filter(k => k !== 'prediction' && k !== 'confidence')
      .map((k) => {
        const v = res[k];
        let formatted;
        if (typeof v === 'object') formatted = JSON.stringify(v, null, 2);
        else formatted = String(v);
        return (
          <View key={k} style={{ marginBottom: 8 }}>
            <Text style={styles.metaTitle}>{k}</Text>
            <ScrollView horizontal contentContainerStyle={{ paddingVertical: 4 }}>
              <Text style={styles.jsonText}>{formatted}</Text>
            </ScrollView>
          </View>
        );
      });

    return (
      <View>
        {main}
        {details.length ? <Divider style={{ marginVertical: 8 }} /> : null}
        {details}
      </View>
    );
  };

  // Open mail client to contact an expert (prefilled subject)
  const contactExpert = async (label, confidence) => {
    const subject = encodeURIComponent(`AgriDetectAI - Expert help requested (${label || 'unknown'})`);
    const body = encodeURIComponent(`Prediction: ${label || 'unknown'}\nConfidence: ${confidence || 'n/a'}\n\nPlease advise on treatment options.`);
    const mailto = `mailto:expert@example.com?subject=${subject}&body=${body}`;
    try {
      await Linking.openURL(mailto);
    } catch (e) {
      setError('Could not open mail client.');
    }
  };

  const predictedLabel = result ? mapPredictionToLabel(result.prediction) : null;
  const confidenceText = result ? formatConfidence(result.confidence) : null;
  const severity = determineSeverity(predictedLabel);

  return (
    <View style={styles.page}>
      <View style={[styles.centered, { width: containerWidth }]}>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Title style={[styles.cardTitle, { color: colors.text }]}>Upload an Image</Title>

            <TouchableOpacity onPress={pickImage}>
              <View style={[styles.imageContainer, { borderColor: colors.placeholder, backgroundColor: '#faf9fb' }]}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
                ) : (
                  <Text style={{ color: colors.placeholder }}>Tap to select an image</Text>
                )}
              </View>
            </TouchableOpacity>

            <Button
              mode="contained"
              onPress={handleDetect}
              style={[styles.button, { backgroundColor: colors.primary }]}
              disabled={!image || loading}
              loading={loading}
              contentStyle={{ height: 48 }}
            >
              Analyze Plant
            </Button>
          </Card.Content>
        </Card>

        {result && (
          <AnimatedCard style={[styles.resultCard, { transform: [{ scale: resultAnim }], backgroundColor: colors.surface }]}>
            <Card.Content>
              <Title style={[styles.cardTitle, { color: colors.text }]}>Analysis Result</Title>

              <View style={[styles.resultBanner, { backgroundColor: severity.color }]}>
                <Text style={styles.resultBannerText}>{predictedLabel || `Class ${result.prediction}`}</Text>
              </View>

              {confidenceText ? (
                <Paragraph style={styles.confidenceText}>
                  Confidence: <Text style={{ fontWeight: 'bold' }}>{confidenceText}</Text>
                </Paragraph>
              ) : null}

              {/* Severity action box */}
              <View style={[styles.severityBox, { borderColor: severity.color }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.severityTitle, { color: severity.color }]}>{severity.title}</Text>
                  <Text style={styles.severityMessage}>{severity.message}</Text>
                </View>
                <View style={{ justifyContent: 'center' }}>
                  <IconButton icon="alert-circle-outline" size={36} iconColor={severity.color} />
                </View>
              </View>

              {/* Action buttons */}
              <View style={styles.actionRow}>
                <Button
                  mode="outlined"
                  onPress={() => setTipsVisible(true)}
                  style={styles.actionButton}
                  textColor={colors.primary}
                >
                  Treatment Tips
                </Button>
                <Button
                  mode="contained"
                  onPress={() => contactExpert(predictedLabel, confidenceText)}
                  style={[styles.actionButton, { backgroundColor: '#2866e0' }]}
                  contentStyle={{ height: 44 }}
                >
                  Contact Expert
                </Button>
              </View>

              {/* Full result details */}
              <View style={{ marginTop: 10 }}>
                {renderResultDetails(result)}
              </View>

              <Paragraph style={styles.disclaimer}>
                {severity.severity === 'safe'
                  ? 'Plant appears healthy.'
                  : 'This is an automated suggestion. For treatment, consult a specialist.'}
              </Paragraph>
            </Card.Content>
          </AnimatedCard>
        )}
      </View>

      {/* Treatment tips modal */}
      <Portal>
        <Modal visible={tipsVisible} onDismiss={() => setTipsVisible(false)} contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          <Title>Treatment Tips</Title>
          <ScrollView style={{ maxHeight: 300, marginTop: 8 }}>
            {/* Provide simple tips per severity; adjust as needed */}
            {severity.severity === 'safe' && (
              <Paragraph>Plant appears healthy. Keep monitoring and follow standard watering and nutrient schedule.</Paragraph>
            )}
            {severity.severity === 'monitor' && (
              <>
                <Paragraph>Observe affected leaves for progression. Consider removing a few affected leaves and improving airflow.</Paragraph>
                <Paragraph style={{ marginTop: 8 }}>Use mild fungicides or organic remedies if symptoms increase. Keep records of changes.</Paragraph>
              </>
            )}
            {severity.severity === 'urgent' && (
              <>
                <Paragraph>Important: spread may be rapid. Isolate affected plants if possible and avoid sharing tools between plants.</Paragraph>
                <Paragraph style={{ marginTop: 8 }}>Contact an agricultural expert for diagnosis. Consider targeted fungicide/insecticide treatments recommended by a specialist.</Paragraph>
              </>
            )}
            {severity.severity === 'unknown' && <Paragraph>No specific tips available for this result.</Paragraph>}
          </ScrollView>

          <Button onPress={() => setTipsVisible(false)} style={{ marginTop: 12 }}>
            Close
          </Button>
        </Modal>
      </Portal>

      {/* Error modal */}
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
  page: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  centered: { alignItems: 'stretch' },
  card: {
    borderRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '700',
  },
  imageContainer: {
    height: 260,
    width: '100%',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: { height: '100%', width: '100%' },
  button: { borderRadius: 8, marginTop: 6 },
  resultCard: { borderRadius: 12, elevation: 4 },
  resultBanner: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  resultBannerText: { color: 'white', fontSize: 18, fontWeight: '700' },
  confidenceText: { textAlign: 'center', fontSize: 15, marginBottom: 8 },
  disclaimer: { textAlign: 'center', fontSize: 13, color: '#7f8c8d', marginTop: 8 },
  modalContainer: { padding: 20, margin: 20, borderRadius: 8 },
  labelTitle: { fontSize: 13, color: '#666', marginBottom: 2 },
  labelValue: { fontSize: 16, fontWeight: '700', color: '#222' },
  metaTitle: { fontSize: 12, color: '#666' },
  metaValue: { fontSize: 14, color: '#222' },
  jsonText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, color: '#222' },

  /* severity box */
  severityBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  severityMessage: { fontSize: 13, color: '#444' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  actionButton: { flex: 1, marginHorizontal: 6 },

});