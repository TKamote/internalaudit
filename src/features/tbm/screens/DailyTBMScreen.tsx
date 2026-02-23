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
} from 'react-native';
import Checkbox from 'expo-checkbox';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { jsPDF } from 'jspdf';
import { TBM_CONTENT } from '../data/tbmContent';

export default function DailyTBMScreen() {
  // --- State ---
  const [supervisorName, setSupervisorName] = useState('');
  const [workers, setWorkers] = useState<string[]>(['', '', '', '']);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Handlers ---

  const handleWorkerChange = (text: string, index: number) => {
    const newWorkers = [...workers];
    newWorkers[index] = text;
    setWorkers(newWorkers);
  };

  const addWorkerField = () => {
    setWorkers([...workers, '']);
  };

  const toggleCheckbox = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Camera permission is required to take the group photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9], // Force Landscape 16:9
      quality: 0.6,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleGeneratePDF = async () => {
    // 1. Validation
    if (!photoUri) {
      Alert.alert('Missing Photo', 'A group photo is mandatory before submission.');
      return;
    }
    const activeWorkers = workers.filter((w) => w.trim() !== '');
    if (!supervisorName.trim()) {
      Alert.alert('Missing Data', 'Please enter the Supervisor Name.');
      return;
    }

    setIsGenerating(true);

    try {
      // 2. Initialize jsPDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      // 3. Add Photo (Top) - Layout Inversion
      // Read file as base64
      const base64Photo = await FileSystem.readAsStringAsync(photoUri, {
        encoding: "base64",
      });

      const imgHeight = (contentWidth * 9) / 16; // 16:9 ratio
      doc.addImage(`data:image/jpeg;base64,${base64Photo}`, 'JPEG', margin, yPos, contentWidth, imgHeight);
      yPos += imgHeight + 10;

      // 4. Add Metadata
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Daily Tool Box Meeting (TBM)', margin, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const dateStr = new Date().toLocaleDateString();
      const timeStr = new Date().toLocaleTimeString();
      
      doc.text(`Date: ${dateStr}`, margin, yPos);
      doc.text(`Time: ${timeStr}`, margin + 60, yPos);
      yPos += 6;
      doc.text(`Supervisor: ${supervisorName}`, margin, yPos);
      yPos += 10;

      // Workers List
      doc.setFont('helvetica', 'bold');
      doc.text('Attendees:', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      
      if (activeWorkers.length > 0) {
        // Print workers in 2 columns
        activeWorkers.forEach((worker, index) => {
          const colX = index % 2 === 0 ? margin : margin + contentWidth / 2;
          doc.text(`• ${worker}`, colX, yPos);
          if (index % 2 !== 0) yPos += 6; // New line after every 2nd item
        });
        if (activeWorkers.length % 2 !== 0) yPos += 6; // Adjust if odd number
      } else {
        doc.text('(No other attendees recorded)', margin, yPos);
        yPos += 6;
      }
      yPos += 5;

      // 5. Add Checklist Content
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos); // Separator line
      yPos += 10;

      TBM_CONTENT.forEach((section) => {
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, margin, yPos);
        yPos += 7;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        section.items.forEach((item) => {
          const isChecked = checkedItems[item.id];
          const checkMark = isChecked ? '[X]' : '[  ]';
          const text = `${checkMark} ${item.text}`;
          
          // Handle text wrapping
          const splitText = doc.splitTextToSize(text, contentWidth);
          
          // Check page break for items
          if (yPos + splitText.length * 5 > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            yPos = margin;
          }

          doc.text(splitText, margin, yPos);
          yPos += splitText.length * 5 + 2;
        });
        yPos += 5; // Space between sections
      });

      // 6. Footer
      if (yPos > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        yPos = margin;
      }
      yPos += 10;
      doc.line(margin, yPos, margin + 80, yPos);
      yPos += 5;
      doc.text('Supervisor Signature / Submitted By', margin, yPos);

      // 7. Save and Share
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileUri = `${FileSystem.cacheDirectory}TBM_Report_${Date.now()}.pdf`;

      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: "base64",
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('PDF Saved', `File saved to: ${fileUri}`);
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Daily Tool Box Meeting</Text>

        {/* Supervisor Section */}
        <View style={styles.card}>
          <Text style={styles.label}>Supervisor Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Name"
            value={supervisorName}
            onChangeText={setSupervisorName}
          />
        </View>

        {/* Workers Section */}
        <View style={styles.card}>
          <Text style={styles.label}>Attendees (Workers):</Text>
          {workers.map((worker, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder={`Worker Name ${index + 1}`}
              value={worker}
              onChangeText={(text) => handleWorkerChange(text, index)}
            />
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addWorkerField}>
            <Text style={styles.addButtonText}>+ Add Worker</Text>
          </TouchableOpacity>
        </View>

        {/* Checklist Sections */}
        {TBM_CONTENT.map((section) => (
          <View key={section.id} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.checkboxRow}
                onPress={() => toggleCheckbox(item.id)}
              >
                <Checkbox
                  value={checkedItems[item.id] || false}
                  onValueChange={() => toggleCheckbox(item.id)}
                  color={checkedItems[item.id] ? '#007AFF' : undefined}
                />
                <Text style={styles.checkboxLabel}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Photo Section */}
        <View style={styles.photoContainer}>
          <Text style={styles.label}>Group Photo (Mandatory)</Text>
          {photoUri ? (
            <View>
              <Image source={{ uri: photoUri }} style={styles.previewImage} />
              <TouchableOpacity onPress={handleTakePhoto} style={styles.retakeButton}>
                <Text style={styles.retakeText}>Retake Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.cameraButton} onPress={handleTakePhoto}>
              <Text style={styles.cameraButtonText}>Take Group Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isGenerating && styles.disabledButton]}
          onPress={handleGeneratePDF}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit & Generate PDF</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1C1C1E',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#3A3A3C',
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  addButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E5F1FF',
    borderRadius: 6,
  },
  addButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 10,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
    flex: 1,
  },
  photoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    marginBottom: 10,
  },
  retakeButton: {
    alignSelf: 'center',
    padding: 10,
  },
  retakeText: {
    color: '#FF3B30',
    fontSize: 16,
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
});
