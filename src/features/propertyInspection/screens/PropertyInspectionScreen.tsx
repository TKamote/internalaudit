import '../../../utils/polyfills'; // Import polyfills first
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { uploadFileToFirebase, saveObservationToFirestore } from '../../../utils/firebaseUtils'; 
import Ionicons from '@expo/vector-icons/Ionicons';

// Defined Categories in order
const CATEGORIES = [
  "1. Landscape",
  "2. Fire Safety",
  "3. Lift",
  "4. Common Area",
  "5. Lift and Lift Lobby",
  "6. Escalators",
  "7. Mosquito Breeding",
  "8. Building",
  "9. M & E",
  "10. Carpark"
];

interface Observation {
  id: string;
  category: string; // The selected category string
  location: string;
  description: string;
  photoUri: string | null;
  timestamp: number;
}

export default function PropertyInspectionScreen() {
  // --- State ---
  
  const [observations, setObservations] = useState<Observation[]>([
    { id: Date.now().toString(), category: CATEGORIES[0], location: '', description: '', photoUri: null, timestamp: Date.now() },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [activeObsId, setActiveObsId] = useState<string | null>(null);

  // --- Handlers ---

  const handleAddObservation = () => {
    setObservations([
      ...observations,
      // Default to the first category, user can change it
      { id: Date.now().toString(), category: CATEGORIES[0], location: '', description: '', photoUri: null, timestamp: Date.now() },
    ]);
  };

  const handleRemoveObservation = (id: string) => {
    if (observations.length === 1) {
      Alert.alert('Cannot Remove', 'You must have at least one observation.');
      return;
    }
    setObservations(observations.filter((obs) => obs.id !== id));
  };

  const updateObservation = (id: string, field: keyof Observation, value: string | number | null) => {
    setObservations(
      observations.map((obs) => (obs.id === id ? { ...obs, [field]: value } : obs))
    );
  };

  const openCategoryModal = (id: string) => {
    setActiveObsId(id);
    setModalVisible(true);
  };

  const selectCategory = (category: string) => {
    if (activeObsId) {
      updateObservation(activeObsId, 'category', category);
    }
    setModalVisible(false);
    setActiveObsId(null);
  };

  const processImage = async (uri: string) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }], // Resize to max width 1024px
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG } // Compress to 50% quality
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error("Error processing image:", error);
      return uri; // Fallback to original if manipulation fails
    }
  };

  const handleTakePhoto = async (id: string) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3], // Standard photo aspect ratio
      quality: 0.5, // Initial quality
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const processedUri = await processImage(result.assets[0].uri);
      setObservations(prev => prev.map(obs => 
        obs.id === id 
          ? { ...obs, photoUri: processedUri, timestamp: Date.now() }
          : obs
      ));
    }
  };

  const handlePickImage = async (id: string) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Gallery permission is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const processedUri = await processImage(result.assets[0].uri);
      setObservations(prev => prev.map(obs => 
        obs.id === id 
          ? { ...obs, photoUri: processedUri, timestamp: Date.now() }
          : obs
      ));
    }
  };

  const handleSubmit = async () => {
    // Check if all observations have data
    for (let i = 0; i < observations.length; i++) {
      const obs = observations[i];
      if (!obs.location.trim()) {
        Alert.alert('Missing Data', `Please enter a location for Observation #${i + 1}.`);
        return;
      }
      if (!obs.description.trim()) {
        Alert.alert('Missing Data', `Please enter a description for Observation #${i + 1}.`);
        return;
      }
      if (!obs.photoUri) {
        Alert.alert('Missing Photo', `Please take/select a photo for Observation #${i + 1}.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const collectionPath = `inspections/${dateStr}_PropertyInspection/items`;

      let successCount = 0;

      for (let i = 0; i < observations.length; i++) {
        const obs = observations[i];
        let downloadUrl = null;

        if (obs.photoUri) {
          // Upload to Firebase Storage
          downloadUrl = await uploadFileToFirebase(obs.photoUri, 'inspections');
        }

        // Save to Firestore
        await saveObservationToFirestore(collectionPath, {
          category: obs.category,
          location: obs.location,
          description: obs.description,
          photoUrl: downloadUrl,
          timestamp: obs.timestamp,
          localId: obs.id
        });

        successCount++;
      }

      Alert.alert(
        "Success", 
        `Successfully uploaded ${successCount} observations to the cloud.`,
        [
            { 
                text: "OK", 
                onPress: () => {
                    // Reset form
                    setObservations([{ id: Date.now().toString(), category: CATEGORIES[0], location: '', description: '', photoUri: null, timestamp: Date.now() }]);
                } 
            }
        ]
      );

    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', `Failed to submit inspection: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Observations List */}
        <Text style={styles.sectionTitle}>Observations Log</Text>
        
        {observations.map((obs, index) => (
          <View key={obs.id} style={styles.observationCard}>
            <View style={styles.obsHeader}>
              <Text style={styles.obsTitle}>Observation #{index + 1}</Text>
              <TouchableOpacity onPress={() => handleRemoveObservation(obs.id)}>
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            {/* Category Selector */}
            <Text style={styles.label}>Category:</Text>
            <TouchableOpacity 
              style={styles.selector} 
              onPress={() => openCategoryModal(obs.id)}
            >
              <Text style={styles.selectorText}>{obs.category}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            <Text style={styles.label}>Location:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Main Lobby"
              value={obs.location}
              onChangeText={(text) => updateObservation(obs.id, 'location', text)}
            />

            <Text style={styles.label}>Description:</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the issue..."
              value={obs.description}
              onChangeText={(text) => updateObservation(obs.id, 'description', text)}
              multiline
            />

            <Text style={styles.label}>Photo:</Text>
            {obs.photoUri ? (
              <View>
                <Image source={{ uri: obs.photoUri }} style={styles.previewImage} />
                <View style={styles.photoActions}>
                    <TouchableOpacity onPress={() => handleTakePhoto(obs.id)} style={styles.retakeButton}>
                    <Text style={styles.retakeText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handlePickImage(obs.id)} style={styles.retakeButton}>
                    <Text style={styles.retakeText}>Pick New</Text>
                    </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.photoButtonsContainer}>
                <TouchableOpacity style={styles.cameraButton} onPress={() => handleTakePhoto(obs.id)}>
                    <Ionicons name="camera-outline" size={24} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.cameraButtonText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cameraButton, { backgroundColor: '#5856D6' }]} onPress={() => handlePickImage(obs.id)}>
                    <Ionicons name="images-outline" size={24} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.cameraButtonText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={handleAddObservation}>
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" style={{ marginRight: 8 }} />
          <Text style={styles.addButtonText}>Add Another Observation</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Inspection</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem} 
                  onPress={() => selectCategory(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {activeObsId && observations.find(o => o.id === activeObsId)?.category === item && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1C1C1E',
    textAlign: 'center'
  },
  observationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  obsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  obsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#3A3A3C',
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F0F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cameraButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  retakeButton: {
    padding: 8,
  },
  retakeText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#E5F1FF',
    borderRadius: 10,
    marginBottom: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
});
