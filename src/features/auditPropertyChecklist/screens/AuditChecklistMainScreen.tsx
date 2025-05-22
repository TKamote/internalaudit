// filepath: /Users/davidonquit/Library/Mobile Documents/com~apple~CloudDocs/Year2025/developingforAppStore/internalaudit/src/features/auditPropertyChecklist/screens/AuditChecklistMainScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  SectionList,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import Checkbox from "expo-checkbox";
import * as ImagePicker from "expo-image-picker";
import { RouteProp, useRoute } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack"; // Not used in current snippet, but keep if needed

import initialAuditDataImport from "../../../assets/data.json";
import { AppStackParamList } from "../../../navigation/AppNavigator";

// Import PDF generation utilities and services
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateHtmlForPdf } from '../../../utils/pdfutils'; // Adjusted path: up one from 'screens', up one from 'auditPropertyChecklist', up one from 'features', then into 'utils'

// --- Types ---
// Ensure these are exported so pdfutils.ts can import them if it's configured that way
export type ConformityStatus = "conformed" | "not-conformed" | "not-applicable" | null;

export interface AuditItemData {
  id: string;
  serialNumber: string;
  description: string;
  type: "header" | "item";
  conformity?: ConformityStatus;
  auditorRemarks?: string;
  photoUri?: string | null;
  subItems?: AuditItemData[];
}

export interface AuditSectionData {
  id: string;
  name: string;
  items: AuditItemData[];
}

// Export FullAuditData if pdfutils needs to know its structure (e.g. if it were to process all categories)
// For now, pdfutils.ts only receives AuditSectionData[]
export interface FullAuditData {
  auditCategories: Array<{
    id: string;
    name: string;
    sections: AuditSectionData[];
  }>;
}

interface AuditListItemProps {
  item: AuditItemData;
  onStatusChange: (itemId: string, sectionId: string, newStatus: ConformityStatus) => void;
  onRemarkChange: (itemId: string, sectionId: string, newRemark: string) => void;
  onPhotoTake: (itemId: string, sectionId: string, photoUri: string | null) => void;
  sectionId: string;
}

type AuditChecklistMainScreenRouteProp = RouteProp<
  AppStackParamList,
  "AuditChecklistMain"
>;

// --- AuditListItem Component (React.memo wrapper is important) ---
const AuditListItem: React.FC<AuditListItemProps> = React.memo(({
  item,
  onStatusChange,
  onRemarkChange,
  onPhotoTake,
  sectionId,
}) => {
  // --- Logic for handling checkbox changes ---
  const handleCheckboxChange = (statusToSet: ConformityStatus) => {
    // If current status is same as statusToSet, toggle to null, else set to statusToSet
    if (item.conformity === statusToSet) {
      onStatusChange(item.id, sectionId, null);
    } else {
      onStatusChange(item.id, sectionId, statusToSet);
    }
  };

  // --- Logic for taking a photo ---
  const takePhoto = async () => {
    if (item.type === 'header') return; // Headers don't take photos

    if (item.conformity === "not-applicable") {
      Alert.alert("Not Applicable", "Photo evidence is not required when the item is marked N/A.");
      return;
    }
    // Allow photo even if not conformed, but not if N/A or null status
    // if (item.conformity === null) {
    //   Alert.alert("Select Status", "Please select a conformity status before taking a photo.");
    //   return;
    // }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Camera permission is required for evidence.");
      return;
    }
    try {
      const pickerResult = await ImagePicker.launchCameraAsync({
        allowsEditing: false, // Or true, depending on your needs
        quality: 0.5,
      });
      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        onPhotoTake(item.id, sectionId, pickerResult.assets[0].uri);
      }
    } catch (error) {
      console.error("Error launching camera: ", error);
      Alert.alert("Camera Error", "Could not launch the camera.");
    }
  };

  // --- Logic for removing a photo ---
  const triggerRemovePhoto = () => {
    if (item.type === 'header') return;
    onPhotoTake(item.id, sectionId, null); // Call onPhotoTake with null URI
  };
  
  const isPhotoTakingDisabled = item.type === 'header' || item.conformity === "not-applicable";


  // --- Rendering logic for header type items ---
  if (item.type === 'header') {
    return (
      <View style={styles.auditItemContainerHeader}>
        <Text style={styles.headerText}>{item.serialNumber} {item.description}</Text>
        {item.subItems && item.subItems.length > 0 && (
          <View style={styles.subItemsContainer}>
            {item.subItems.map(subItem => (
              <AuditListItem // Recursive call
                key={subItem.id}
                item={subItem}
                onStatusChange={onStatusChange}
                onRemarkChange={onRemarkChange}
                onPhotoTake={onPhotoTake}
                sectionId={sectionId}
              />
            ))}
          </View>
        )}
      </View>
    );
  }

  // --- Rendering logic for 'item' type (actionable items) ---
  return (
    <View style={styles.auditItemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.serialNumber}>{item.serialNumber}. </Text>
        <Text style={styles.descriptionText}>{item.description}</Text>
      </View>
      
      <View style={styles.checkboxesRow}>
        <TouchableOpacity style={styles.checkboxWrapper} onPress={() => handleCheckboxChange("conformed")}>
          <Checkbox style={styles.checkbox} value={item.conformity === "conformed"} color={item.conformity === "conformed" ? "#007AFF" : undefined} />
          <Text style={styles.checkboxLabel}>Conform</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkboxWrapper} onPress={() => handleCheckboxChange("not-conformed")}>
          <Checkbox style={styles.checkbox} value={item.conformity === "not-conformed"} color={item.conformity === "not-conformed" ? "#FF3B30" : undefined} />
          <Text style={styles.checkboxLabel}>Not Conformed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkboxWrapper} onPress={() => handleCheckboxChange("not-applicable")}>
          <Checkbox style={styles.checkbox} value={item.conformity === "not-applicable"} color={item.conformity === "not-applicable" ? "#FF9500" : undefined} />
          <Text style={styles.checkboxLabel}>N/A</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.remarksInput}
        placeholder="Auditor Remarks..."
        value={item.auditorRemarks || ''}
        onChangeText={(text) => onRemarkChange(item.id, sectionId, text)}
        multiline
      />

      <View style={styles.photoSection}>
        {item.photoUri && (
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
            <TouchableOpacity onPress={triggerRemovePhoto} style={styles.removePhotoTouchable}>
              <Text style={styles.removePhotoText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={[styles.photoButton, isPhotoTakingDisabled && styles.photoButtonDisabled]}
          onPress={takePhoto}
          disabled={isPhotoTakingDisabled}
        >
          <Text style={styles.photoButtonText}>
            {item.photoUri && !isPhotoTakingDisabled ? "Retake Photo" : "Take Photo"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}); // <<< END React.memo for AuditListItem


// --- Main Screen Component ---
const AuditChecklistMainScreen = () => {
  const route = useRoute<AuditChecklistMainScreenRouteProp>();
  const { categoryId, categoryName } = route.params;

  const [auditSections, setAuditSections] = useState<AuditSectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false); // State for PDF generation

  useEffect(() => {
    const allData = initialAuditDataImport as FullAuditData; // Make sure this import is correct
    const currentCategoryData = allData.auditCategories.find(cat => cat.id === categoryId);
    if (currentCategoryData) {
      // Initialize items with default values if not present
      const processedSections = currentCategoryData.sections.map(section => ({
        ...section,
        items: section.items.map(item => ({
          ...item,
          conformity: item.conformity || null,
          auditorRemarks: item.auditorRemarks || "",
          photoUri: item.photoUri || null,
          // Ensure subItems are also processed if they exist, or are at least an empty array
          subItems: item.subItems ? item.subItems.map(subItem => ({
            ...subItem,
            conformity: subItem.conformity || null,
            auditorRemarks: subItem.auditorRemarks || "",
            photoUri: subItem.photoUri || null,
          })) : [],
        })),
      }));
      setAuditSections(processedSections);
    } else {
      console.warn(`Category with ID "${categoryId}" not found.`);
    }
    setIsLoading(false);
  }, [categoryId]);

  // --- Recursive helper to find and update an item/subItem ---
  const findItemAndUpdateRecursive = (
    items: AuditItemData[],
    itemId: string,
    updateFn: (item: AuditItemData) => AuditItemData
  ): AuditItemData[] => {
    return items.map(item => {
      if (item.id === itemId) {
        return updateFn(item);
      }
      if (item.subItems && item.subItems.length > 0) {
        // If the item itself isn't the target, check its subItems
        const updatedSubItems = findItemAndUpdateRecursive(item.subItems, itemId, updateFn);
        // If subItems changed, return the item with updated subItems
        if (updatedSubItems !== item.subItems) {
          return { ...item, subItems: updatedSubItems };
        }
      }
      return item; // Return original item if no change
    });
  };
  
  const findSectionAndAndUpdateItems = (
    prevSections: AuditSectionData[],
    sectionId: string,
    itemId: string,
    updateFn: (item: AuditItemData) => AuditItemData
  ): AuditSectionData[] => {
    return prevSections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: findItemAndUpdateRecursive(section.items, itemId, updateFn),
        };
      }
      return section;
    });
  };


  // --- Callback Handlers ---
  // <<< WRAP handler functions with useCallback >>>
  const handleItemStatusChange = useCallback((itemId: string, sectionId: string, newStatus: ConformityStatus) => {
    setAuditSections(prevSections =>
      findSectionAndAndUpdateItems(prevSections, sectionId, itemId, item => ({
        ...item,
        conformity: newStatus,
        // Logic for photoUri based on conformity (optional, adjust as needed)
        // photoUri: (newStatus === "conformed" || newStatus === "not-applicable") ? null : item.photoUri,
      }))
    );
  }, []); // Empty dependency array: function is stable

  const handleItemRemarkChange = useCallback((itemId: string, sectionId: string, newRemark: string) => {
    setAuditSections(prevSections =>
      findSectionAndAndUpdateItems(prevSections, sectionId, itemId, item => ({
        ...item,
        auditorRemarks: newRemark,
      }))
    );
  }, []);

  const handleItemPhotoTake = useCallback((itemId: string, sectionId: string, photoUri: string | null) => {
    setAuditSections(prevSections =>
      findSectionAndAndUpdateItems(prevSections, sectionId, itemId, item => ({
        ...item,
        photoUri: photoUri,
      }))
    );
  }, []);

  // --- PDF Generation Handler ---
  const handleGeneratePdf = async () => {
    if (!auditSections.length) {
      Alert.alert("No Data", "No audit data available to generate PDF.");
      return;
    }
    if (isGeneratingPdf) return;

    setIsGeneratingPdf(true);
    try {
      const htmlContent = await generateHtmlForPdf(categoryName || "Unnamed Category", auditSections);
      
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log('PDF generated at:', uri);

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing Not Available", "PDF generated: " + uri);
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Share Audit: ${categoryName || "Report"}`,
        UTI: '.pdf'
      });
    } catch (error) {
      console.error("Error during PDF generation or sharing:", error);
      Alert.alert("PDF Error", "Could not generate or share the PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // --- Submit Logic ---
  const handleSubmitCategory = () => {
    console.log("Submitting audit data for category:", categoryId, auditSections);
    // Recursive logging function
    const logItemsRecursive = (items: AuditItemData[], indent = "") => {
      items.forEach(item => {
        if (item.type === 'item') {
          console.log(`${indent}  Item ID: ${item.id}, SN: ${item.serialNumber}, Conformity: ${item.conformity}, Remarks: ${item.auditorRemarks}, Photo: ${item.photoUri}`);
        } else if (item.type === 'header') {
          console.log(`${indent}  Header: ${item.serialNumber} ${item.description}`);
          if (item.subItems && item.subItems.length > 0) {
            logItemsRecursive(item.subItems, indent + "    ");
          }
        }
      });
    };
    auditSections.forEach(section => {
      console.log(`Section: ${section.name} (ID: ${section.id})`);
      logItemsRecursive(section.items);
    });
    Alert.alert("Data Logged", "Current audit data for this category has been logged to the console.");
  };


  if (isLoading) {
    return <SafeAreaView style={styles.centered}><ActivityIndicator size="large" /></SafeAreaView>;
  }
  if (!auditSections.length && !isLoading) {
    return <SafeAreaView style={styles.centered}><Text>No audit items found for: {categoryName}</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitleText}>{categoryName || "Checklist"}</Text>
        {/* PDF Generation Button */}
        <TouchableOpacity onPress={handleGeneratePdf} disabled={isGeneratingPdf} style={styles.pdfButton}>
          {isGeneratingPdf ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ paddingHorizontal: 5 }}/>
          ) : (
            <Text style={styles.pdfButtonText}>PDF</Text>
          )}
        </TouchableOpacity>
      </View>
      <SectionList
        sections={auditSections.map(section => ({ ...section, title: section.name, data: section.items }))}
        keyExtractor={(item) => item.id}
        renderItem={({ item, section }) => (
          <AuditListItem
            item={item}
            onStatusChange={handleItemStatusChange}
            onRemarkChange={handleItemRemarkChange}
            onPhotoTake={handleItemPhotoTake}
            sectionId={section.id}
          />
        )}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeaderText}>{title}</Text>}
        ListFooterComponent={<View style={styles.footerButtonContainer}><Button title="Submit Audit Category" onPress={handleSubmitCategory} /></View>}
        stickySectionHeadersEnabled={true}
      />
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  // ... (Your existing styles from the previous step, including pdfButton and pdfButtonText)
  safeArea: { flex: 1, backgroundColor: "#F4F4F8" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  screenHeader: { paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#E0E0E0", backgroundColor: "#FFFFFF", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  screenTitleText: { fontSize: 18, fontWeight: "bold", flex: 1 }, // Added flex: 1 to allow button to not be pushed out
  sectionHeaderText: { fontSize: 16, fontWeight: "600", backgroundColor: "#E8E8F0", paddingVertical: 10, paddingHorizontal: 15, marginTop: 10, },
  auditItemContainer: { backgroundColor: "#FFFFFF", padding: 15, marginHorizontal: 10, marginTop: 1, borderBottomWidth: 1, borderBottomColor: "#EDEDED", },
  auditItemContainerHeader: { backgroundColor: "#FFFFFF", padding: 15, marginHorizontal: 10, marginTop: 1, borderBottomWidth: 1, borderBottomColor: "#EDEDED", },
  headerText: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8, },
  subItemsContainer: { marginLeft: 20, borderLeftWidth: 2, borderLeftColor: '#E0E0E0', paddingLeft: 10, marginTop: 5, },
  itemHeader: { flexDirection: "row", marginBottom: 10, },
  serialNumber: { fontWeight: "bold", marginRight: 5, color: "#333", fontSize: 14 },
  descriptionText: { flex: 1, fontSize: 14, color: "#333", lineHeight: 18, },
  checkboxesRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginVertical: 10, },
  checkboxWrapper: { flexDirection: "row", alignItems: "center", marginRight: 15, marginBottom: 5, },
  checkbox: { marginRight: 8, width: 20, height: 20, },
  checkboxLabel: { fontSize: 13, color: "#444", },
  remarksInput: { borderWidth: 1, borderColor: "#D0D0D0", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, minHeight: 50, textAlignVertical: "top", backgroundColor: "#FAFAFA", marginTop: 5, },
  footerButtonContainer: { padding: 15, borderTopWidth: 1, borderTopColor: "#E0E0E0", backgroundColor: "#FFFFFF", },
  photoSection: { marginTop: 15, alignItems: "flex-start", },
  photoButton: { backgroundColor: "#007AFF", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 5, alignSelf: "flex-start", },
  photoButtonDisabled: { backgroundColor: "#B0B0B0", },
  photoButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "500", },
  thumbnailContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10, },
  thumbnail: { width: 80, height: 80, borderRadius: 4, marginRight: 10, borderWidth: 1, borderColor: "#ddd", },
  removePhotoTouchable: { padding: 5, },
  removePhotoText: { color: "#FF3B30", fontSize: 12, },
  // Styles for PDF Button
  pdfButton: {
    backgroundColor: '#007AFF', // Or your theme color
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10, // Space from title
    minWidth: 50, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  pdfButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AuditChecklistMainScreen;
