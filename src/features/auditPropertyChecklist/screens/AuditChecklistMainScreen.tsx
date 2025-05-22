// filepath: /Users/davidonquit/Library/Mobile Documents/com~apple~CloudDocs/Year2025/developingforAppStore/internalaudit/src/features/auditPropertyChecklist/screens/AuditChecklistMainScreen.tsx
import React, { useState, useEffect } from "react";
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
import { NativeStackNavigationProp } from "@react-navigation/native-stack"; // For navigation prop type

import initialAuditDataImport from "../../../assets/data.json";
import { AppStackParamList } from "../../../navigation/AppNavigator"; // Assuming AppNavigator exports this

// --- Types ---
// <<< MODIFIED ConformityStatus type >>>
type ConformityStatus = "conformed" | "not-conformed" | "not-applicable" | null;

interface AuditItemData {
  id: string;
  serialNumber: string;
  description: string;
  type: "header" | "item"; // Added type
  conformity?: ConformityStatus; // Now optional
  auditorRemarks?: string; // Now optional
  photoUri?: string | null; // Now optional
  subItems?: AuditItemData[]; // Optional array of sub-items
}

// This now represents a section WITHIN a category
interface AuditSectionData {
  id: string;
  name: string;
  items: AuditItemData[];
}

// Define the structure of the imported JSON data
interface FullAuditData {
  auditCategories: Array<{
    id: string;
    name: string;
    sections: AuditSectionData[];
  }>;
}
const initialAuditData = initialAuditDataImport as FullAuditData;

interface AuditListItemProps {
  item: AuditItemData;
  onStatusChange: (
    itemId: string,
    sectionId: string,
    newStatus: ConformityStatus
  ) => void;
  onRemarkChange: (
    itemId: string,
    sectionId: string,
    newRemark: string
  ) => void;
  onPhotoTake: (
    itemId: string,
    sectionId: string,
    photoUri: string | null
  ) => void;
  sectionId: string;
}

// Define the type for the route prop for this screen
type AuditChecklistMainScreenRouteProp = RouteProp<
  AppStackParamList,
  "AuditChecklistMain"
>;

// If you need navigation prop here (e.g., to go back or to another screen)
// type AuditChecklistMainScreenNavigationProp = StackNavigationProp<AppStackParamList, 'AuditChecklistMain'>;

// Props for the screen component
// interface AuditChecklistMainScreenProps {
//   route: AuditChecklistMainScreenRouteProp;
//   navigation: AuditChecklistMainScreenNavigationProp; // If using navigation prop
// }

const AuditListItem = ({
  item,
  onStatusChange,
  onRemarkChange,
  onPhotoTake,
  sectionId,
}: AuditListItemProps) => {
  const handleCheckboxChange = (statusToSet: ConformityStatus) => {
    if (item.conformity === statusToSet) {
      onStatusChange(item.id, sectionId, null);
    } else {
      onStatusChange(item.id, sectionId, statusToSet);
    }
  };

  const takePhoto = async () => {
    // <<< MODIFIED CHECK: If NA or no conformity selected, do not proceed >>>
    if (item.conformity === "not-applicable") {
      Alert.alert(
        "Not Applicable",
        "Photo evidence is not required when the item is marked N/A."
      );
      return;
    }
    if (item.conformity === null) {
      Alert.alert(
        "Select Status",
        "Please select a conformity status (Conform/Not Conformed) before taking a photo."
      );
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Camera permission is required for evidence."
      );
      return;
    }
    try {
      const pickerResult = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.5,
      });
      if (
        !pickerResult.canceled &&
        pickerResult.assets &&
        pickerResult.assets.length > 0
      ) {
        onPhotoTake(item.id, sectionId, pickerResult.assets[0].uri);
      }
    } catch (error) {
      console.error("Error launching camera: ", error);
      Alert.alert("Camera Error", "Could not launch the camera.");
    }
  };

  const triggerRemovePhoto = () => {
    onPhotoTake(item.id, sectionId, null);
  };

  // <<< MODIFIED isPhotoTakingDisabled logic >>>
  const isPhotoTakingDisabled =
    item.conformity === null || item.conformity === "not-applicable";

  return (
    <View style={styles.auditItemContainer}>
      <View style={styles.itemHeader}>
        <Text style={styles.serialNumber}>{item.serialNumber}. </Text>
        <Text style={styles.descriptionText}>{item.description}</Text>
      </View>
      {/* <<< MODIFIED checkboxesRow for three checkboxes >>> */}
      <View style={styles.checkboxesRow}>
        <TouchableOpacity
          style={styles.checkboxWrapper}
          onPress={() => handleCheckboxChange("conformed")}
        >
          <Checkbox
            style={styles.checkbox}
            value={item.conformity === "conformed"}
            onValueChange={() => handleCheckboxChange("conformed")} // Direct call
            color={item.conformity === "conformed" ? "#007AFF" : "#ccc"}
          />
          <Text style={styles.checkboxLabel}>Conform</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.checkboxWrapper}
          onPress={() => handleCheckboxChange("not-conformed")}
        >
          <Checkbox
            style={styles.checkbox}
            value={item.conformity === "not-conformed"}
            onValueChange={() => handleCheckboxChange("not-conformed")} // Direct call
            color={item.conformity === "not-conformed" ? "#FF3B30" : "#ccc"}
          />
          <Text style={styles.checkboxLabel}>Not Conformed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.checkboxWrapper} // You might need to adjust marginRight for this one or the container
          onPress={() => handleCheckboxChange("not-applicable")}
        >
          <Checkbox
            style={styles.checkbox}
            value={item.conformity === "not-applicable"}
            onValueChange={() => handleCheckboxChange("not-applicable")} // Direct call
            color={item.conformity === "not-applicable" ? "#FF9500" : "#ccc"} // Orange for NA
          />
          <Text style={styles.checkboxLabel}>N/A</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.remarksInput}
        placeholder="Auditor Remarks..."
        value={item.auditorRemarks}
        onChangeText={(text) => onRemarkChange(item.id, sectionId, text)}
        multiline
      />
      <View style={styles.photoSection}>
        {item.photoUri && ( // Only show thumbnail and remove if photoUri exists
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
            {/* Remove button is always active if photo exists, regardless of NA status */}
            <TouchableOpacity
              onPress={triggerRemovePhoto}
              style={styles.removePhotoTouchable}
            >
              <Text style={styles.removePhotoText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* <<< MODIFIED TouchableOpacity for Take Photo button >>> */}
        <TouchableOpacity
          style={[
            styles.photoButton,
            isPhotoTakingDisabled && styles.photoButtonDisabled, // Apply disabled style
          ]}
          onPress={takePhoto}
          disabled={isPhotoTakingDisabled} // Standard disabled prop
        >
          <Text style={styles.photoButtonText}>
            {item.photoUri && !isPhotoTakingDisabled
              ? "Retake Photo"
              : "Take Photo"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AuditChecklistMainScreen = () => {
  // Removed props for now, using useRoute hook
  const route = useRoute<AuditChecklistMainScreenRouteProp>(); // Get route params
  const { categoryId, categoryName } = route.params;

  // State now holds sections for the CURRENT category
  const [currentCategorySections, setCurrentCategorySections] = useState<
    AuditSectionData[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const category = initialAuditData.auditCategories.find(
      (cat) => cat.id === categoryId
    );
    if (category) {
      // Process items within this category's sections
      const processedSections = category.sections.map((section) => ({
        ...section,
        items: section.items.map((item) => ({
          ...item,
          photoUri: item.photoUri || null, // Ensure photoUri is at least null
          conformity: item.conformity || null, // Ensure conformity is at least null
          auditorRemarks: item.auditorRemarks || "", // Ensure remarks is at least empty string
        })),
      }));
      setCurrentCategorySections(processedSections);
    } else {
      console.warn(`Category with ID "${categoryId}" not found.`);
      // Optionally, navigate back or show an error message
    }
    setIsLoading(false);
  }, [categoryId]); // Reload if categoryId changes

  const handleItemStatusChange = (
    itemId: string,
    sectionId: string,
    newStatus: ConformityStatus
  ) => {
    setCurrentCategorySections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, conformity: newStatus } : item
              ),
            }
          : section
      )
    );
  };

  const handleItemRemarkChange = (
    itemId: string,
    sectionId: string,
    newRemark: string
  ) => {
    setCurrentCategorySections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId
                  ? { ...item, auditorRemarks: newRemark }
                  : item
              ),
            }
          : section
      )
    );
  };

  const handleItemPhotoTake = (
    itemId: string,
    sectionId: string,
    photoUri: string | null
  ) => {
    setCurrentCategorySections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, photoUri: photoUri } : item
              ),
            }
          : section
      )
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!currentCategorySections.length && !isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>No audit items found for category: {categoryName}</Text>
        {/* Optionally add a button to go back */}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenHeader}>
        {/* The title is now set by the navigator options, but you can add it here if preferred */}
        <Text style={styles.screenTitleText}>
          {categoryName || "Checklist"}
        </Text>
      </View>
      <SectionList
        // Use currentCategorySections for the SectionList
        sections={currentCategorySections.map((section) => ({
          ...section,
          data: section.items,
        }))}
        keyExtractor={(item) => item.id} // item is now correctly typed from AuditItemData
        renderItem={(
          { item, section } // section is now correctly typed
        ) => (
          <AuditListItem
            item={item}
            onStatusChange={handleItemStatusChange}
            onRemarkChange={handleItemRemarkChange}
            onPhotoTake={handleItemPhotoTake}
            sectionId={section.id} // section.id comes from AuditSectionData
          />
        )}
        renderSectionHeader={(
          { section: { name } } // name comes from AuditSectionData
        ) => <Text style={styles.sectionHeaderText}>{name}</Text>}
        ListFooterComponent={<View style={{ height: 20 }} />}
        stickySectionHeadersEnabled={true}
      />
      <View style={styles.footerButtonContainer}>
        <Button
          title="Submit Audit Category"
          onPress={() =>
            console.log(
              `Audit for ${categoryName} Submitted:`,
              JSON.stringify(currentCategorySections, null, 2)
            )
          }
        />
      </View>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F4F8",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  screenHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  screenTitleText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    backgroundColor: "#E8E8F0",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  auditItemContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginHorizontal: 10,
    marginTop: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#EDEDED",
  },
  itemHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  serialNumber: {
    fontWeight: "bold",
    marginRight: 5,
    color: "#333",
  },
  descriptionText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
  },
  checkboxesRow: {
    flexDirection: "row",
    // justifyContent: 'space-between', // May need to adjust this for three items
    flexWrap: "wrap", // Allow checkboxes to wrap if not enough space
    alignItems: "center",
    marginVertical: 10,
  },
  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15, // Adjusted marginRight for potentially tighter spacing
    marginBottom: 5, // Added in case they wrap
  },
  checkbox: {
    marginRight: 8,
    width: 20,
    height: 20,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#444",
  },
  remarksInput: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 50,
    textAlignVertical: "top",
    backgroundColor: "#FAFAFA",
    marginTop: 5,
  },
  footerButtonContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  photoSection: {
    marginTop: 15,
    alignItems: "flex-start",
  },
  photoButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  photoButtonDisabled: {
    // <<< ADD THIS NEW STYLE
    backgroundColor: "#B0B0B0", // Greyed out background for disabled state
  },
  photoButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  thumbnailContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 10,
    borderWidth: 1, // <<< ADDED borderWidth
    borderColor: "#ddd", // <<< ADDED borderColor
  },
  removePhotoTouchable: {
    padding: 5,
  },
  removePhotoText: {
    color: "#FF3B30",
    fontSize: 13,
  },
});

export default AuditChecklistMainScreen;
