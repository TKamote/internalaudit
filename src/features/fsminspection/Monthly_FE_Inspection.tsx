import '../../utils/polyfills';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SignatureScreen from 'react-native-signature-canvas';

// --- Checklist Items ---
const CHECKLIST_ITEMS = [
  "Location: The extinguisher is in its designated place.",
  "Accessibility: There is no obstruction to access or visibility.",
  "Operating Instructions: Instructions on the nameplate are legible and face outward.",
  "Seal & Tamper Indicators: Safety seals and tamper indicators are not broken or missing.",
  "Weight/Fullness: Determined by weighing or \"hefting\" (lifting it).",
  "Physical Condition: Look for obvious physical damage, corrosion, leakage, or clogged nozzles.",
  "Pressure Gauge: The pressure gauge reading or indicator is in the operable range (the green zone)."
];

interface InspectionItem {
  id: string;
  locationSN: string;
  checklistStatus: boolean[];
  photos: string[];
  remarks: string;
}

export default function MonthlyFEInspectionScreen() {
  // --- State ---
  const [siteName, setSiteName] = useState('');
  
  // Inspection Cards
  const [inspections, setInspections] = useState<InspectionItem[]>([{
    id: Date.now().toString(),
    locationSN: '',
    checklistStatus: new Array(CHECKLIST_ITEMS.length).fill(true),
    photos: [],
    remarks: ''
  }]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  
  // Footer State
  const [inspectorName, setInspectorName] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [isSignatureModalVisible, setIsSignatureModalVisible] = useState(false);
  const signatureRef = useRef<any>(null);

  // --- Effects ---
  useEffect(() => {
    loadInspectorName();
  }, []);

  const loadInspectorName = async () => {
    try {
      const savedName = await AsyncStorage.getItem('inspectorName');
      if (savedName) {
        setInspectorName(savedName);
      }
    } catch (e) {
      console.error("Failed to load inspector name", e);
    }
  };

  const saveInspectorName = async (name: string) => {
    setInspectorName(name);
    try {
      await AsyncStorage.setItem('inspectorName', name);
    } catch (e) {
      console.error("Failed to save inspector name", e);
    }
  };

  // --- Helpers ---
  const currentItem = inspections[currentIndex];

  const updateCurrentItem = (field: keyof InspectionItem, value: any) => {
    const newInspections = [...inspections];
    newInspections[currentIndex] = { ...newInspections[currentIndex], [field]: value };
    setInspections(newInspections);
  };

  // --- Handlers ---

  const toggleChecklist = (index: number) => {
    const newStatus = [...currentItem.checklistStatus];
    newStatus[index] = !newStatus[index];
    updateCurrentItem('checklistStatus', newStatus);
  };

  const processImage = async (uri: string) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 400 } }], // Reduced to 400px for smaller file size
        { compress: 0.2, format: ImageManipulator.SaveFormat.JPEG } // High compression
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error("Error processing image:", error);
      return uri;
    }
  };

  const handleTakePhoto = async () => {
    if (currentItem.photos.length >= 2) {
      Alert.alert('Limit Reached', 'You can only take up to 2 photos.');
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const processedUri = await processImage(result.assets[0].uri);
      updateCurrentItem('photos', [...currentItem.photos, processedUri]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...currentItem.photos];
    newPhotos.splice(index, 1);
    updateCurrentItem('photos', newPhotos);
  };

  // Navigation Handlers
  const handleAddCard = () => {
    if (inspections.length >= 8) {
      Alert.alert("Limit Reached", "Maximum 8 inspections allowed.");
      return;
    }
    setInspections([...inspections, {
      id: Date.now().toString(),
      locationSN: '',
      checklistStatus: new Array(CHECKLIST_ITEMS.length).fill(true),
      photos: [],
      remarks: ''
    }]);
    setCurrentIndex(inspections.length); // Move to new card
  };

  const handleDeleteCard = () => {
    if (inspections.length === 1) {
      Alert.alert("Cannot Delete", "You must have at least one inspection.");
      return;
    }
    Alert.alert("Delete Inspection", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: () => {
          const newInspections = inspections.filter((_, i) => i !== currentIndex);
          setInspections(newInspections);
          setCurrentIndex(Math.max(0, currentIndex - 1));
        }
      }
    ]);
  };

  // Signature Handlers
  const handleSignatureOK = (signatureBase64: string) => {
    setSignature(signatureBase64.replace('data:image/png;base64,', ''));
    setIsSignatureModalVisible(false);
  };

  const handleGeneratePDF = async () => {
    if (!siteName.trim()) {
      Alert.alert('Missing Data', 'Please enter the Site Name.');
      return;
    }
    if (!inspectorName.trim()) {
      Alert.alert('Missing Data', 'Please enter Inspector Name.');
      return;
    }
    if (!signature) {
      Alert.alert('Missing Signature', 'Please sign the inspection.');
      return;
    }

    // Validate all cards
    for (let i = 0; i < inspections.length; i++) {
        if (!inspections[i].locationSN.trim()) {
            Alert.alert('Missing Data', `Please enter Location / FE S/N for Extinguisher #${i + 1}.`);
            setCurrentIndex(i);
            return;
        }
        if (inspections[i].photos.length === 0) {
            Alert.alert('Missing Photo', `Please take at least 1 photo for Extinguisher #${i + 1}.`);
            setCurrentIndex(i);
            return;
        }
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 25; // Increased margin for more padding

      for (let i = 0; i < inspections.length; i++) {
        const item = inspections[i];
        
        if (i > 0) {
            doc.addPage();
        }

        let yPos = margin;

        // --- 1. Title (Top) ---
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('MONTHLY FIRE EXTINGUISHER INSPECTION', pageWidth / 2, yPos + 5, { align: 'center' });
        yPos += 15;

        // --- 2. Photos Section (Full Width Alignment) ---
        // Calculate width to match the margins exactly
        const availableWidth = pageWidth - (margin * 2);
        const gap = 5;
        const photoWidth = (availableWidth - gap) / 2;
        const photoHeight = photoWidth * 0.75; // 4:3 aspect ratio
        
        // Cap height to ensure it doesn't push footer off page
        const maxPhotoHeight = 60; 
        const actualPhotoHeight = Math.min(photoHeight, maxPhotoHeight);
        // Recalculate width to maintain aspect ratio if height was capped, 
        // OR keep width and crop/stretch. Better to keep width for alignment.
        // For alignment priority, we keep the calculated width.

        for (let p = 0; p < item.photos.length; p++) {
            try {
            const base64Img = await FileSystem.readAsStringAsync(item.photos[p], {
                encoding: "base64",
            });
            
            const xPos = margin + (p * (photoWidth + gap));
            doc.addImage(
                `data:image/jpeg;base64,${base64Img}`,
                'JPEG',
                xPos,
                yPos,
                photoWidth,
                actualPhotoHeight
            );
            } catch (e) {
            console.error("Error adding image to PDF", e);
            }
        }

        yPos += actualPhotoHeight + 10;

        // --- 3. Header Info Box ---
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const now = new Date();
        const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // Draw Header Box
        doc.setDrawColor(0);
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, yPos, pageWidth - (margin * 2), 18, 'F'); 
        doc.rect(margin, yPos, pageWidth - (margin * 2), 18, 'S');

        doc.text(`Site: ${siteName}`, margin + 5, yPos + 6);
        doc.text(`Location / FE S/N: ${item.locationSN}`, margin + 5, yPos + 13);
        doc.text(`Date: ${dateStr}`, pageWidth - margin - 50, yPos + 6);

        yPos += 25;

        // --- 4. Checklist Table ---
        const tableBody = CHECKLIST_ITEMS.map((chkItem, index) => [
            index + 1,
            chkItem,
            item.checklistStatus[index] ? 'Yes' : 'No'
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['No.', 'Inspection Item', 'Status']],
            body: tableBody,
            theme: 'grid',
            headStyles: {
            fillColor: [220, 220, 220],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
            },
            styles: {
            fontSize: 10, // Increased to 10
            cellPadding: 3, 
            valign: 'middle',
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
            },
            columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 20, halign: 'center' }
            },
            margin: { left: margin, right: margin }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10; // Increased gap before remarks

        // --- 5. Footer ---
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Remarks:', margin, yPos + 4);
        
        doc.setFont('helvetica', 'normal');
        // Single line for remarks
        doc.setDrawColor(0);
        doc.line(margin + 20, yPos + 4, pageWidth - margin, yPos + 4);
        
        if (item.remarks) {
            doc.text(item.remarks, margin + 22, yPos + 3);
        }

        yPos += 15;

        // Footer Block - Side by Side
        const footerY = yPos;
        
        // Left: Inspector Name
        doc.text(`Inspected By: ${inspectorName}`, margin, footerY + 10);
        doc.line(margin, footerY + 11, margin + 60, footerY + 11);

        // Right: Signature (Compact)
        if (signature) {
            try {
                doc.addImage(
                    `data:image/png;base64,${signature}`,
                    'PNG',
                    pageWidth - margin - 40, 
                    footerY, 
                    30, 
                    15 
                );
                doc.text('Signature', pageWidth - margin - 35, footerY + 18);
            } catch (e) {
                console.error("Error adding signature", e);
            }
        } else {
             doc.text('Signature: ________________', pageWidth - margin - 50, footerY + 10);
        }
      }

      // --- Save & Share ---
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const filename = `Monthly_FE_Inspection_${Date.now()}.pdf`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: "base64",
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('PDF Saved', `File saved to: ${fileUri}`);
      }

    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', `Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.headerTitle}>Monthly FE Inspection</Text>

          {/* Global Header Inputs */}
          <View style={styles.card}>
            <Text style={styles.label}>Site Name (Global):</Text>
            <TextInput
              style={styles.input}
              value={siteName}
              onChangeText={setSiteName}
              placeholder="e.g. Building A"
            />
          </View>

          {/* Inspection Card Navigation Header */}
          <View style={[styles.navHeader, { marginBottom: 20 }]}> 
            <Text style={styles.navTitle}>Extinguisher #{currentIndex + 1} of {inspections.length}</Text>
            {inspections.length > 1 && (
                <TouchableOpacity onPress={handleDeleteCard}>
                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            )}
          </View>

          {/* Current Inspection Card */}
          <View style={styles.card}>
            <Text style={[styles.label, { fontSize: 16, fontWeight: '700' }]}>Location / FE S/N:</Text>
            <TextInput
              style={[styles.input, { fontSize: 18 }]} 
              value={currentItem.locationSN}
              onChangeText={(text) => updateCurrentItem('locationSN', text)}
              placeholder="e.g. Lobby / FE-001"
            />

            <Text style={styles.sectionHeader}>Photos (Max 2)</Text>
            <View style={styles.photoContainer}>
              {currentItem.photos.map((uri, index) => (
                <View key={index} style={styles.photoWrapper}>
                  <Image source={{ uri }} style={styles.photo} />
                  <TouchableOpacity 
                    style={styles.removePhotoBtn}
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
              
              {currentItem.photos.length < 2 && (
                <TouchableOpacity style={styles.addPhotoBtn} onPress={handleTakePhoto}>
                  <Ionicons name="camera" size={32} color="#007AFF" />
                  <Text style={styles.addPhotoText}>Take Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Checklist</Text>
            {CHECKLIST_ITEMS.map((item, index) => (
              <View key={index} style={styles.checklistItem}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.itemText}>{index + 1}. {item}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    { backgroundColor: currentItem.checklistStatus[index] ? '#34C759' : '#FF3B30' }
                  ]}
                  onPress={() => toggleChecklist(index)}
                >
                  <Text style={styles.toggleText}>
                    {currentItem.checklistStatus[index] ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            <Text style={[styles.label, { marginTop: 16 }]}>Remarks:</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={currentItem.remarks}
              onChangeText={(text) => updateCurrentItem('remarks', text)}
              placeholder="Enter any remarks..."
              multiline
            />
          </View>

          {/* Navigation Controls */}
          <View style={styles.navControls}>
            <TouchableOpacity 
                style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]} 
                onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
            >
                <Ionicons name="chevron-back" size={24} color={currentIndex === 0 ? "#ccc" : "#007AFF"} />
                <Text style={[styles.navBtnText, currentIndex === 0 && styles.navBtnTextDisabled]}>Prev</Text>
            </TouchableOpacity>

            {inspections.length < 8 && (
                <TouchableOpacity style={styles.addCardBtn} onPress={handleAddCard}>
                    <Ionicons name="add" size={24} color="white" />
                    <Text style={styles.addCardBtnText}>Add New</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity 
                style={[styles.navBtn, currentIndex === inspections.length - 1 && styles.navBtnDisabled]} 
                onPress={() => setCurrentIndex(Math.min(inspections.length - 1, currentIndex + 1))}
                disabled={currentIndex === inspections.length - 1}
            >
                <Text style={[styles.navBtnText, currentIndex === inspections.length - 1 && styles.navBtnTextDisabled]}>Next</Text>
                <Ionicons name="chevron-forward" size={24} color={currentIndex === inspections.length - 1 ? "#ccc" : "#007AFF"} />
            </TouchableOpacity>
          </View>

          {/* Footer Section: Inspector & Signature */}
          <View style={[styles.card, { marginTop: 20 }]}>
            <Text style={styles.sectionHeader}>Inspector Details (Global)</Text>
            
            <Text style={styles.label}>Inspected By:</Text>
            <TextInput
              style={styles.input}
              value={inspectorName}
              onChangeText={saveInspectorName}
              placeholder="Enter your name"
            />

            <Text style={styles.label}>Signature:</Text>
            {signature ? (
              <View style={styles.signaturePreviewContainer}>
                <Image 
                  source={{ uri: `data:image/png;base64,${signature}` }} 
                  style={styles.signaturePreview} 
                  resizeMode="contain"
                />
                <TouchableOpacity onPress={() => setSignature(null)} style={styles.clearSignatureBtn}>
                    <Text style={styles.clearSignatureText}>Clear</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.signButton} 
                onPress={() => setIsSignatureModalVisible(true)}
              >
                <Ionicons name="pencil" size={24} color="#007AFF" style={{ marginRight: 8 }} />
                <Text style={styles.signButtonText}>Tap to Sign</Text>
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
              <Text style={styles.submitButtonText}>Generate PDF Report</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 20 }} /> 
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Signature Modal */}
      <Modal
        visible={isSignatureModalVisible}
        animationType="slide"
        onRequestClose={() => setIsSignatureModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sign Here</Text>
                <TouchableOpacity onPress={() => setIsSignatureModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
            </View>
            <View style={styles.signatureCanvasContainer}>
                <SignatureScreen
                    ref={signatureRef}
                    onOK={handleSignatureOK}
                    onEmpty={() => console.log("Empty signature")}
                    descriptionText="Sign above"
                    clearText="Clear"
                    confirmText="Save"
                    webStyle={`.m-signature-pad--footer {display: none; margin: 0px;}`} 
                    autoClear={true}
                    imageType="image/png"
                />
            </View>
            <View style={styles.signatureButtons}>
                 <TouchableOpacity style={styles.modalBtnCancel} onPress={() => signatureRef.current?.clearSignature()}>
                    <Text style={styles.modalBtnTextCancel}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnSave} onPress={() => signatureRef.current?.readSignature()}>
                    <Text style={styles.modalBtnTextSave}>Save Signature</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
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
  // Navigation Header
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  // Navigation Controls
  navControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginHorizontal: 4,
  },
  navBtnTextDisabled: {
    color: '#ccc',
  },
  addCardBtn: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addCardBtnText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  // Photo Styles
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoWrapper: {
    position: 'relative',
    width: '48%',
    aspectRatio: 4/3,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addPhotoBtn: {
    width: '48%',
    aspectRatio: 4/3,
    backgroundColor: '#F0F0F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    marginTop: 8,
    color: '#007AFF',
    fontWeight: '600',
  },
  // Checklist Styles
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    width: '95%', // Slightly reduced width to center content better
    alignSelf: 'center',
  },
  itemText: {
    fontSize: 16, // Increased font size
    color: '#333',
    lineHeight: 22,
    fontWeight: '500', // Added weight for better readability
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  toggleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Signature Styles
  signButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#E5F1FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  signButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signaturePreviewContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 4,
    alignItems: 'center',
  },
  signaturePreview: {
    width: '100%',
    height: 100,
  },
  clearSignatureBtn: {
    marginTop: 8,
    padding: 8,
  },
  clearSignatureText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  signatureCanvasContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 16,
  },
  signatureButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalBtnCancel: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    minWidth: 100,
    alignItems: 'center',
  },
  modalBtnSave: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    minWidth: 100,
    alignItems: 'center',
  },
  modalBtnTextCancel: {
    color: '#333',
    fontWeight: '600',
  },
  modalBtnTextSave: {
    color: 'white',
    fontWeight: '600',
  },
  // Submit Button
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
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
