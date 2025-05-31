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
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native"; // Import useNavigation
// import { NativeStackNavigationProp } from "@react-navigation/native-stack"; // Not used in current snippet, but keep if needed

import initialAuditDataImport from "../../../assets/data.json";
import { AppStackParamList } from "../../../navigation/AppNavigator";
import * as Print from "expo-print"; // Keep for potential actual printing later
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system"; // Import FileSystem
import { generatePdfWithJsPDF } from "../../../utils/pdfutils";

// --- Types ---
export type ConformityStatus =
  | "conformed"
  | "not-conformed"
  | "not-applicable"
  | null;
export type RiskLevel = "L" | "M" | "H" | null;

export interface AuditItemData {
  id: string;
  serialNumber: string;
  description: string;
  type: "header" | "item";
  conformity?: ConformityStatus;
  riskLevel?: RiskLevel;
  auditorRemarks?: string;
  photoUri?: string | null;
  subItems?: AuditItemData[];
  originalImageWidth?: number;
  originalImageHeight?: number;
}

export interface AuditSectionData {
  id: string;
  name: string;
  items: AuditItemData[];
}

export interface FullAuditData {
  auditCategories: Array<{
    id: string;
    name: string;
    sections: AuditSectionData[];
  }>;
}

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
    // MODIFIED: Add width and height parameters
    itemId: string,
    sectionId: string,
    photoUri: string | null,
    originalWidth?: number, // Add originalWidth
    originalHeight?: number // Add originalHeight
  ) => void;
  sectionId: string;
}

// --- AuditListItem Component ---
const AuditListItem: React.FC<AuditListItemProps> = React.memo(
  ({ item, onStatusChange, onRemarkChange, onPhotoTake, sectionId }) => {
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
      if (item.type === "header") return; // Headers don't take photos

      if (item.conformity === "not-applicable") {
        Alert.alert(
          "Not Applicable",
          "Photo evidence is not required when the item is marked N/A."
        );
        return;
      }
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
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
          quality: 0.5, // Consider if higher quality is needed for PDF, but 0.5 is good for performance
          // You might want to explicitly set aspect if needed, but default should be fine
        });
        if (
          !pickerResult.canceled &&
          pickerResult.assets &&
          pickerResult.assets.length > 0
        ) {
          const asset = pickerResult.assets[0];
          // MODIFIED: Pass width and height to onPhotoTake
          onPhotoTake(item.id, sectionId, asset.uri, asset.width, asset.height);
        }
      } catch (error) {
        console.error("Error launching camera: ", error);
        Alert.alert("Camera Error", "Could not launch the camera.");
      }
    };

    // --- Logic for removing a photo ---
    const triggerRemovePhoto = () => {
      if (item.type === "header") return;
      // MODIFIED: When removing, pass null for URI and undefined for dimensions
      onPhotoTake(item.id, sectionId, null, undefined, undefined);
    };

    const isPhotoTakingDisabled =
      item.type === "header" || item.conformity === "not-applicable";

    if (item.type === "header") {
      return (
        <View style={styles.auditItemContainerHeader}>
          <Text style={styles.headerText}>
            {item.serialNumber} {item.description}
          </Text>
          {item.subItems && item.subItems.length > 0 && (
            <View style={styles.subItemsContainer}>
              {item.subItems.map((subItem) => (
                <AuditListItem
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

    return (
      <View style={styles.auditItemContainer}>
        <View style={styles.itemHeader}>
          <Text style={styles.serialNumber}>{item.serialNumber}. </Text>
          <Text style={styles.descriptionText}>
            {item.description}
            {item.riskLevel && (
              <Text style={styles.riskLevelDisplay}>
                {" "}
                (RL: {item.riskLevel})
              </Text>
            )}
          </Text>
        </View>

        <View style={styles.checkboxesRow}>
          <TouchableOpacity
            style={styles.checkboxWrapper}
            onPress={() => handleCheckboxChange("conformed")}
          >
            <Checkbox
              style={styles.checkbox}
              value={item.conformity === "conformed"}
              color={item.conformity === "conformed" ? "#007AFF" : undefined}
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
              color={
                item.conformity === "not-conformed" ? "#FF3B30" : undefined
              }
            />
            <Text style={styles.checkboxLabel}>Not Conformed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkboxWrapper}
            onPress={() => handleCheckboxChange("not-applicable")}
          >
            <Checkbox
              style={styles.checkbox}
              value={item.conformity === "not-applicable"}
              color={
                item.conformity === "not-applicable" ? "#FF9500" : undefined
              }
            />
            <Text style={styles.checkboxLabel}>N/A</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.remarksInput}
          placeholder="Auditor Remarks..."
          value={item.auditorRemarks || ""}
          onChangeText={(text) => onRemarkChange(item.id, sectionId, text)}
          multiline
        />
        <View style={styles.photoSection}>
          {item.photoUri && (
            <View style={styles.thumbnailContainer}>
              <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
              <TouchableOpacity
                onPress={triggerRemovePhoto}
                style={styles.removePhotoTouchable}
              >
                <Text style={styles.removePhotoText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.photoButton,
              isPhotoTakingDisabled && styles.photoButtonDisabled,
            ]}
            onPress={takePhoto}
            disabled={isPhotoTakingDisabled}
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
  }
);

// --- Main Screen Component ---
const AuditChecklistMainScreen = () => {
  const route = useRoute<AuditChecklistMainScreenRouteProp>();
  const navigation = useNavigation(); // Get navigation object
  const { categoryId, categoryName } = route.params;

  const [auditSections, setAuditSections] = useState<AuditSectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // State for unsaved changes

  useEffect(() => {
    // ... (existing useEffect for loading data remains the same) ...
    const allData = initialAuditDataImport as FullAuditData;
    const currentCategoryData = allData.auditCategories.find(
      (cat) => cat.id === categoryId
    );
    if (currentCategoryData) {
      const processedSections = currentCategoryData.sections.map((section) => ({
        ...section,
        items: section.items.map((item: any) => ({
          ...item,
          conformity: item.conformity || null,
          riskLevel: item.riskLevel || null,
          auditorRemarks: item.auditorRemarks || "",
          photoUri: item.photoUri || null,
          subItems: item.subItems
            ? item.subItems.map((subItem: any) => ({
                ...subItem,
                conformity: subItem.conformity || null,
                riskLevel: subItem.riskLevel || null,
                auditorRemarks: subItem.auditorRemarks || "",
                photoUri: subItem.photoUri || null,
              }))
            : [],
        })),
      }));
      setAuditSections(processedSections as AuditSectionData[]);
    } else {
      console.warn(`Category with ID "${categoryId}" not found.`);
    }
    setIsLoading(false);
    setHasUnsavedChanges(false); // Reset on initial load or category change
  }, [categoryId]);

  // --- Effect for handling 'beforeRemove' navigation event ---
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!hasUnsavedChanges) {
        // If no unsaved changes, allow navigation
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Prompt the user
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to discard them and leave the screen?",
        [
          { text: "Don't leave", style: "cancel", onPress: () => {} },
          {
            text: "Discard",
            style: "destructive",
            // If the user confirms, then dispatch the action they blocked
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe; // Cleanup listener on component unmount
  }, [navigation, hasUnsavedChanges]); // Re-subscribe if navigation or hasUnsavedChanges changes

  // --- Recursive helper to find and update an item/subItem ---
  const findItemAndUpdateRecursive = (
    items: AuditItemData[],
    itemId: string,
    updateFn: (item: AuditItemData) => AuditItemData
  ): AuditItemData[] => {
    return items.map((item) => {
      if (item.id === itemId) {
        return updateFn(item);
      }
      if (item.subItems && item.subItems.length > 0) {
        const updatedSubItems = findItemAndUpdateRecursive(
          item.subItems,
          itemId,
          updateFn
        );
        if (updatedSubItems !== item.subItems) {
          return { ...item, subItems: updatedSubItems };
        }
      }
      return item;
    });
  };

  const findSectionAndAndUpdateItems = (
    prevSections: AuditSectionData[],
    sectionId: string,
    itemId: string,
    updateFn: (item: AuditItemData) => AuditItemData
  ): AuditSectionData[] => {
    return prevSections.map((section) => {
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
  const handleItemStatusChange = useCallback(
    (itemId: string, sectionId: string, newStatus: ConformityStatus) => {
      setAuditSections((prevSections) => {
        // Check if the status is actually changing
        const section = prevSections.find((s) => s.id === sectionId);
        let itemChanged = false;
        if (section) {
          const findItem = (
            items: AuditItemData[]
          ): AuditItemData | undefined => {
            for (const i of items) {
              if (i.id === itemId) return i;
              if (i.subItems) {
                const sub = findItem(i.subItems);
                if (sub) return sub;
              }
            }
            return undefined;
          };
          const currentItem = findItem(section.items);
          if (currentItem && currentItem.conformity !== newStatus) {
            itemChanged = true;
          }
        }

        if (itemChanged) {
          setHasUnsavedChanges(true);
        }
        return findSectionAndAndUpdateItems(
          prevSections,
          sectionId,
          itemId,
          (item) => ({
            ...item,
            conformity: newStatus,
          })
        );
      });
    },
    [] // No direct dependencies for setAuditSections, findSectionAndAndUpdateItems is stable
  );

  const handleItemRemarkChange = useCallback(
    (itemId: string, sectionId: string, newRemark: string) => {
      setAuditSections((prevSections) => {
        const section = prevSections.find((s) => s.id === sectionId);
        let itemChanged = false;
        if (section) {
          const findItem = (
            items: AuditItemData[]
          ): AuditItemData | undefined => {
            for (const i of items) {
              if (i.id === itemId) return i;
              if (i.subItems) {
                const sub = findItem(i.subItems);
                if (sub) return sub;
              }
            }
            return undefined;
          };
          const currentItem = findItem(section.items);
          if (currentItem && (currentItem.auditorRemarks || "") !== newRemark) {
            itemChanged = true;
          }
        }
        if (itemChanged) {
          setHasUnsavedChanges(true);
        }
        return findSectionAndAndUpdateItems(
          prevSections,
          sectionId,
          itemId,
          (item) => ({
            ...item,
            auditorRemarks: newRemark,
          })
        );
      });
    },
    []
  );

  const handleItemPhotoTake = useCallback(
    (
      // MODIFIED: Add width and height parameters
      itemId: string,
      sectionId: string,
      photoUri: string | null,
      originalWidth?: number,
      originalHeight?: number
    ) => {
      setAuditSections((prevSections) => {
        const section = prevSections.find((s) => s.id === sectionId);
        let itemChanged = false;
        if (section) {
          const findItem = (
            items: AuditItemData[]
          ): AuditItemData | undefined => {
            for (const i of items) {
              if (i.id === itemId) return i;
              if (i.subItems) {
                const sub = findItem(i.subItems);
                if (sub) return sub;
              }
            }
            return undefined;
          };
          const currentItem = findItem(section.items);
          if (
            currentItem &&
            ((currentItem.photoUri || null) !== (photoUri || null) ||
              currentItem.originalImageWidth !== originalWidth || // Check dimensions change
              currentItem.originalImageHeight !== originalHeight)
          ) {
            itemChanged = true;
          }
        }

        if (itemChanged) {
          setHasUnsavedChanges(true);
        }
        return findSectionAndAndUpdateItems(
          prevSections,
          sectionId,
          itemId,
          (item) => ({
            ...item,
            photoUri: photoUri,
            // MODIFIED: Update originalImageWidth and originalImageHeight
            originalImageWidth: photoUri ? originalWidth : undefined,
            originalImageHeight: photoUri ? originalHeight : undefined,
          })
        );
      });
    },
    []
  );

  // --- PDF Generation Handler ---
  const handleGeneratePdf = async () => {
    if (!auditSections.length) {
      Alert.alert("No Data", "No audit data available to generate PDF.");
      return;
    }
    if (isGeneratingPdf) return;

    setIsGeneratingPdf(true);
    try {
      // 1. Generate the PDF using jsPDF, get the base64 data URI
      const pdfDataUri = await generatePdfWithJsPDF(
        categoryName || "Unnamed Category",
        auditSections
      );

      // 2. Extract the base64 part from the data URI
      const extractedBase64 = pdfDataUri.split(",")[1];

      if (typeof extractedBase64 !== "string" || extractedBase64.length === 0) {
        throw new Error(
          "Could not extract valid base64 content from PDF data URI."
        );
      }
      const base64Pdf: string = extractedBase64;

      // 3. Save the base64 PDF string to a temporary file using FileSystem
      const pdfFileName = `audit-report-${Date.now()}.pdf`;
      // Use cacheDirectory for temporary files that can be cleared by the OS
      const fileUri = FileSystem.cacheDirectory + pdfFileName;

      await FileSystem.writeAsStringAsync(fileUri, base64Pdf, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log("PDF (from jsPDF) saved to file at:", fileUri);

      // 4. Share the generated file URI
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing Not Available", "PDF generated at: " + fileUri);
        // setIsGeneratingPdf(false); // Already in finally block
        return;
      }
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/pdf",
        dialogTitle: `Share Audit: ${categoryName || "Report"}`,
      });
    } catch (error) {
      console.error("Error during PDF generation or sharing:", error);
      Alert.alert(
        "PDF Error",
        "Could not generate or share the PDF. " + (error as Error).message
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // --- Submit Logic ---
  const handleSubmitCategory = () => {
    console.log(
      "Submitting audit data for category:",
      categoryId,
      auditSections
    );
    const logItemsRecursive = (items: AuditItemData[], indent = "") => {
      items.forEach((item) => {
        if (item.type === "item") {
          console.log(
            `${indent}  Item ID: ${item.id}, SN: ${
              item.serialNumber
            }, Conformity: ${item.conformity}, Risk: ${
              item.riskLevel || "N/A"
            }, Remarks: ${item.auditorRemarks}, Photo: ${item.photoUri}`
          );
        } else if (item.type === "header") {
          console.log(
            `${indent}  Header: ${item.serialNumber} ${item.description}`
          );
          if (item.subItems && item.subItems.length > 0) {
            logItemsRecursive(item.subItems, indent + "    ");
          }
        }
      });
    };
    auditSections.forEach((section) => {
      console.log(`Section: ${section.name} (ID: ${section.id})`);
      logItemsRecursive(section.items);
    });
    Alert.alert(
      "Data Logged",
      "Current audit data for this category has been logged to the console."
    );
    // If this were a real save, you might do:
    // setHasUnsavedChanges(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }
  if (!auditSections.length && !isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>No audit items found for: {categoryName}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitleText}>
          {categoryName || "Checklist"}
        </Text>
        <TouchableOpacity
          onPress={handleGeneratePdf}
          disabled={isGeneratingPdf}
          style={styles.pdfButton}
        >
          {isGeneratingPdf ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
              style={{ paddingHorizontal: 5 }}
            />
          ) : (
            <Text style={styles.pdfButtonText}>PDF</Text>
          )}
        </TouchableOpacity>
      </View>
      <SectionList
        sections={auditSections.map((section) => ({
          ...section,
          title: section.name,
          data: section.items,
        }))}
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
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeaderText}>{title}</Text>
        )}
        ListFooterComponent={
          <View style={styles.footerButtonContainer}>
            <Button
              title="Submit Audit Category"
              onPress={handleSubmitCategory}
            />
          </View>
        }
        stickySectionHeadersEnabled={true}
      />
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F4F8" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  screenTitleText: { fontSize: 18, fontWeight: "bold", flex: 1 },
  sectionHeaderText: {
    fontSize: 16,
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
  auditItemContainerHeader: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginHorizontal: 10,
    marginTop: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#EDEDED",
  },
  headerText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subItemsContainer: {
    marginLeft: 20,
    borderLeftWidth: 2,
    borderLeftColor: "#E0E0E0",
    paddingLeft: 10,
    marginTop: 5,
  },
  itemHeader: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-start",
  },
  serialNumber: {
    fontWeight: "bold",
    marginRight: 5,
    color: "#333",
    fontSize: 14,
    lineHeight: 18,
  },
  descriptionText: { flex: 1, fontSize: 14, color: "#333", lineHeight: 18 },
  riskLevelDisplay: {
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
  },
  checkboxesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginVertical: 10,
  },
  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    marginBottom: 5,
  },
  checkbox: { marginRight: 8, width: 20, height: 20 },
  checkboxLabel: { fontSize: 13, color: "#444" },
  remarksInput: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
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
  photoSection: { marginTop: 15, alignItems: "flex-start" },
  photoButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  photoButtonDisabled: { backgroundColor: "#B0B0B0" },
  photoButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "500" },
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
    borderWidth: 1,
    borderColor: "#ddd",
  },
  removePhotoTouchable: { padding: 5 },
  removePhotoText: { color: "#FF3B30", fontSize: 12 },
  pdfButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10,
    minWidth: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  pdfButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});

// Add or uncomment this type definition
type AuditChecklistMainScreenRouteProp = RouteProp<
  AppStackParamList,
  "AuditChecklistMain"
>;

export default AuditChecklistMainScreen;
