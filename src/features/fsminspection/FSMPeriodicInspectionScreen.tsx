import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppNavigator"; // Ensure this path is correct
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable'; // Import it this way

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

// Import the JSON data
import inspectionData from "./fsminspection.json"; // Corrected import name

type FSMPeriodicInspectionScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  "FSMPeriodicInspection" // Make sure this matches your navigator's screen name
>;

const CheckboxGroup = ({
  options,
  selectedValue,
  onValueChange,
}: {
  options: { label: string; value: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}) => {
  return (
    <View style={styles.checkboxGroupContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={styles.checkboxOption}
          onPress={() => onValueChange(option.value)}
        >
          <View
            style={[
              styles.checkboxSquare,
              selectedValue === option.value && styles.checkboxSquareSelected,
            ]}
          >
            {selectedValue === option.value && (
              <Text style={styles.checkboxCheckmark}>✓</Text>
            )}
          </View>
          <Text style={styles.checkboxLabel}>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Extend jsPDF interface if TypeScript complains about autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Define types for our inspection data for better type safety
interface InspectionItem {
  key: string;
  no: string;
  desc: string;
}

interface InspectionSection {
  id: string;
  title: string;
  items: InspectionItem[];
  commentKey: string;
}

export default function FSMPeriodicInspectionScreen() {
  const navigation = useNavigation<FSMPeriodicInspectionScreenNavigationProp>();

  const [inspector, setInspector] = useState("");
  const [inspectionDate, setInspectionDate] = useState("");
  const [location, setLocation] = useState("");
  const [reference, setReference] = useState("");
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator

  const choiceOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
    { label: "NA", value: "na" },
  ];

  // Consolidated state for all checklist item statuses
  const [itemStates, setItemStates] = useState<Record<string, string>>(() => {
    const initialState: Record<string, string> = {};
    inspectionData.forEach((section) => {
      section.items.forEach((item) => {
        initialState[item.key] = ""; // Initialize all item states to empty
      });
    });
    return initialState;
  });

  // Consolidated state for all section comments
  const [commentStates, setCommentStates] = useState<Record<string, string>>(() => {
    const initialState: Record<string, string> = {};
    inspectionData.forEach((section) => {
      initialState[section.commentKey] = ""; // Initialize all comment states to empty
    });
    return initialState;
  });

  const handleItemValueChange = (itemKey: string, value: string) => {
    setItemStates((prev) => ({ ...prev, [itemKey]: value }));
  };

  const handleCommentChange = (commentKey: string, text: string) => {
    setCommentStates((prev) => ({ ...prev, [commentKey]: text }));
  };

  const getStatusText = (value: string) => {
    if (!value) return "Not Selected";
    const option = choiceOptions.find((opt) => opt.value === value);
    return option ? option.label : "Not Selected";
  };

  const handleSaveInspection = async () => {
    if (isLoading) return; // Prevent multiple simultaneous operations
    setIsLoading(true); // Set loading to true at the beginning
    console.log("handleSaveInspection started");

    // It's good practice to wrap the entire async operation in a try/finally
    // to ensure isLoading is reset even if an unexpected error occurs early.
    try {
      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });
      console.log("jsPDF instance created");

      const margin = 20;
      let currentY = margin;
      const lineSpacing = 7;
      const sectionTitleFontSize = 12;
      const regularFontSize = 10;
      const tableHeaderFontSize = 9;
      const tableCellFontSize = 8;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - 2 * margin;

      doc.setFontSize(16);
      doc.text("FSM Monthly Inspection Report", pageWidth / 2, currentY, {
        align: "center",
      });
      currentY += lineSpacing * 1.5;

      doc.setFontSize(14);
      doc.text("Fire Safety Inspection Checklist", pageWidth / 2, currentY, {
        align: "center",
      });
      currentY += lineSpacing * 1.5;
      console.log("Titles and Subtitles added");

      doc.setFontSize(regularFontSize);
      const details = [
        `Inspector Name: ${inspector || "N/A"}`,
        `Inspection Date: ${inspectionDate || "N/A"}`,
        `Building/Location: ${location || "N/A"}`,
        `Reference No.: ${reference || "N/A"}`,
      ];
      details.forEach((detail) => {
        if (currentY > doc.internal.pageSize.getHeight() - margin - lineSpacing) {
          doc.addPage();
          currentY = margin;
        }
        doc.text(detail, margin, currentY);
        currentY += lineSpacing * 0.8;
      });
      currentY += lineSpacing;
      console.log("Inspector details added");

      const sectionsDataForPdf = inspectionData.map((section) => ({
        title: section.title,
        items: section.items.map((item) => ({
          no: item.no,
          desc: item.desc,
          status: getStatusText(itemStates[item.key] || ""),
        })),
        comments: commentStates[section.commentKey] || "",
      }));
      console.log("sectionsDataForPdf prepared");

      console.log("Starting to loop through sectionsDataForPdf");
      let sectionCounter = 0;
      for (const section of sectionsDataForPdf) {
        sectionCounter++;
        console.log(`Processing Section ${sectionCounter}: ${section.title.substring(0,30)}`);

        if (currentY > doc.internal.pageSize.getHeight() - margin - 20) {
          doc.addPage();
          currentY = margin;
        }
        doc.setFontSize(sectionTitleFontSize);
        doc.setFont("helvetica", "bold");
        doc.text(section.title || "Untitled Section", margin, currentY);
        currentY += lineSpacing * 0.8;
        doc.setFont("helvetica", "normal");
        console.log(`Added title for Section ${sectionCounter}`);

        const tableBody = section.items.map((item) => [
          item.no || "",
          item.desc || "",
          item.status || "",
        ]);
        console.log(`Prepared tableBody for Section ${sectionCounter}. Items: ${tableBody.length}`);
        
        // Inner try-catch for autoTable specific errors
        try {
          console.log(`TRYING autoTable for Section ${sectionCounter}`);
          autoTable(doc, { 
            startY: currentY,
            head: [["S/N", "Description", "Status"]],
            body: tableBody,
            theme: "grid",
            margin: { left: margin, right: margin },
            styles: { fontSize: tableCellFontSize, cellPadding: 1.5 },
            headStyles: {
              fontSize: tableHeaderFontSize,
              fillColor: [230, 230, 230],
              textColor: 20,
              fontStyle: "bold",
              halign: "center",
            },
            columnStyles: {
              0: { cellWidth: contentWidth * 0.1, halign: "center" },
              1: { cellWidth: contentWidth * 0.65 },
              2: { cellWidth: contentWidth * 0.25, halign: "center" },
            },
          });
          currentY = (doc as any).lastAutoTable.finalY + lineSpacing * 0.7; 
          console.log(`autoTable SUCCEEDED for Section ${sectionCounter}. New Y: ${currentY}`);
        } catch (autoTableError: any) {
          console.error(`Error during autoTable for Section ${sectionCounter}:`, autoTableError);
          Alert.alert("Error", `PDF Generation Failed: Could not create table for section "${section.title.substring(0,30)}...". ${autoTableError.message}.`);
          setIsLoading(false); // Reset loading on specific error
          return; 
        }

        if (section.comments && section.comments.trim() !== "") {
          console.log(`Processing comments for Section ${sectionCounter}`);
          if (currentY > doc.internal.pageSize.getHeight() - margin - 15) {
            doc.addPage();
            currentY = margin;
          }
          doc.setFontSize(regularFontSize - 1);
          doc.setFont("helvetica", "bold");
          doc.text("Additional Comments:", margin, currentY);
          currentY += lineSpacing * 0.6;
          doc.setFont("helvetica", "normal");

          const commentLines = doc.splitTextToSize(
            section.comments,
            contentWidth
          );
          commentLines.forEach((line: string) => {
            if (
              currentY >
              doc.internal.pageSize.getHeight() - margin - lineSpacing * 0.5
            ) {
              doc.addPage();
              currentY = margin;
            }
            doc.text(line, margin, currentY);
            currentY += lineSpacing * 0.5;
          });
          currentY += lineSpacing * 0.5;
          console.log(`Finished adding comments for Section ${sectionCounter}`);
        } else {
          console.log(`No comments to process for Section ${sectionCounter}`);
        }
        currentY += lineSpacing * 0.5;
      }
      console.log("All sections and tables ADDED to PDF (loop finished)");

      // This 'try' block is for the final PDF output, saving, and sharing
      // It's nested inside the outer try so that the finally block of the outer try always runs
      try {
        console.log("Attempting doc.output()");
        const pdfData = doc.output("datauristring");
        console.log("doc.output() successful. Data length: " + pdfData.length);

        const base64Code = pdfData.substring(pdfData.indexOf(",") + 1);

        const dateForFilename = new Date()
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "");
        const currentInspector = inspector || "";
        const filenameInspector =
          currentInspector.replace(/[^a-zA-Z0-9]/g, "_") || "UnknownInspector";
        const filename =
          FileSystem.documentDirectory +
          `FSM_Inspection_${filenameInspector}_${dateForFilename}.pdf`;
        console.log("Filename generated: " + filename);

        console.log("Attempting to write file");
        await FileSystem.writeAsStringAsync(filename, base64Code, {
          encoding: FileSystem.EncodingType.Base64,
        });
        console.log("File written successfully");

        console.log("Checking if sharing is available");
        if (await Sharing.isAvailableAsync()) {
          console.log("Sharing is available. Attempting to share.");
          await Sharing.shareAsync(filename);
          Alert.alert("Success", "PDF generated and ready for sharing!");
        } else {
          console.log("Sharing not available");
          Alert.alert(
            "Sharing Not Available",
            "Sharing is not available on this device. The PDF has been saved to the app's document directory, but you'll need a file manager app to access it directly."
          );
        }
      } catch (error: any) { 
        console.error("Error in PDF output/saving/sharing process:", error);
        Alert.alert(
          "Error",
          `Failed to finalize or share PDF: ${error.message || "An unknown error occurred."}`
        );
      }
    } catch (generalError: any) {
        // Catch any other unexpected errors from the main try block
        console.error("General error during PDF generation:", generalError);
        Alert.alert("Error", `An unexpected error occurred: ${generalError.message || "Unknown error"}`);
    } finally {
        setIsLoading(false); // Set loading to false in the finally block
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.checklistForm}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>
              Fire Safety Inspection Checklist
            </Text>
          </View>

          <View style={styles.formMeta}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Inspector Name:</Text>
              <TextInput
                style={styles.input}
                value={inspector}
                onChangeText={setInspector}
                placeholder="Enter inspector name"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Inspection Date:</Text>
              <TextInput
                style={styles.input}
                value={inspectionDate}
                onChangeText={setInspectionDate}
                placeholder="YYYY-MM-DD"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Building/Location:</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Enter building/location"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Reference No.:</Text>
              <TextInput
                style={styles.input}
                value={reference}
                onChangeText={setReference}
                placeholder="Enter reference no."
              />
            </View>
          </View>

          {/* Dynamically render sections and items from JSON */}
          {(inspectionData as InspectionSection[]).map((section) => (
            <View key={section.id}>
              <Text style={styles.sectionHeader}>{section.title}</Text>
              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, styles.thSNo]}>S/N</Text>
                  <Text style={[styles.tableHeaderCell, styles.thDescription]}>
                    Description
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.thStatus]}>
                    Status
                  </Text>
                </View>
                {section.items.map((item) => (
                  <View style={styles.tableRow} key={item.key}>
                    <Text style={[styles.tableCell, styles.tdSNo]}>{item.no}</Text>
                    <Text style={[styles.tableCell, styles.tdDescription]}>
                      {item.desc}
                    </Text>
                    <View style={[styles.tableCell, styles.tdStatus]}>
                      <CheckboxGroup
                        options={choiceOptions}
                        selectedValue={itemStates[item.key] || ""}
                        onValueChange={(value) => handleItemValueChange(item.key, value)}
                      />
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.commentsSection}>
                <Text style={styles.label}>Additional Comments:</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={commentStates[section.commentKey] || ""}
                  onChangeText={(text) => handleCommentChange(section.commentKey, text)}
                  placeholder="See annex for remarks"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          ))}

          <View style={styles.submitRow}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSaveInspection}
              disabled={isLoading} // Disable button while loading
            >
              {isLoading ? ( // Show loading indicator or button text
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Save Inspection in PDF
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    paddingRight: 15,
  },
  backButtonText: {
    fontSize: 18,
    color: "#007bff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },
  checklistForm: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 20,
  },
  formHeader: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  formMeta: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  commentsSection: {
    // Style for the comments group after each table
    padding: 15, // As per HTML: <div class="form-group" style="padding: 15px">
    marginBottom: 15, // Standard form group margin
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    backgroundColor: "#e9ecef",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    marginBottom: 0, // Removed bottom margin as comments section follows immediately
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 2,
    borderBottomColor: "#dee2e6",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
  },
  tableHeaderCell: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontWeight: "bold",
    fontSize: 13,
    color: "#212529",
    textAlign: "left",
    borderRightWidth: 1,
    borderRightColor: "#dee2e6",
  },
  tableCell: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 13,
    color: "#212529",
    borderRightWidth: 1,
    borderRightColor: "#dee2e6",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  thSNo: { width: "12.5%" },
  thDescription: { flex: 1 },
  thStatus: { width: "22%" }, // User confirmed 20%
  tdSNo: { width: "12.5%", textAlign: "center" },
  tdDescription: { flex: 1, alignItems: "flex-start" },
  tdStatus: { width: "22%", paddingVertical: 5 }, // User confirmed 20%

  checkboxGroupContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    flexWrap: "wrap",
  },
  checkboxOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    paddingVertical: 5,
  },
  checkboxSquare: {
    height: 20,
    width: 20,
    borderWidth: 2,
    borderColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    borderRadius: 3,
  },
  checkboxSquareSelected: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  checkboxCheckmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 13,
    color: "#333",
  },
  submitRow: {
    marginTop: 20,
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
