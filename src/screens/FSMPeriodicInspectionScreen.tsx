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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/AppNavigator";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Import for the autoTable plugin
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

type FSMPeriodicInspectionScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  "FSMPeriodicInspection"
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

export default function FSMPeriodicInspectionScreen() {
  const navigation = useNavigation<FSMPeriodicInspectionScreenNavigationProp>();

  const [inspector, setInspector] = useState("");
  const [inspectionDate, setInspectionDate] = useState("");
  const [location, setLocation] = useState("");
  const [reference, setReference] = useState("");

  const choiceOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
    { label: "NA", value: "na" },
  ];

  // --- State for Section A ---
  const [stateA1, setStateA1] = useState(""); // MODIFIED: Was 'no'
  const [stateA2, setStateA2] = useState(""); // MODIFIED: Was 'na'
  const [stateA3, setStateA3] = useState(""); // MODIFIED: Was 'yes'
  const [commentsA, setCommentsA] = useState("");

  // --- State for Section B ---
  const [stateB1, setStateB1] = useState(""); // MODIFIED: Was 'no'
  const [stateB2, setStateB2] = useState(""); // MODIFIED: Was 'no'
  const [stateB3, setStateB3] = useState(""); // MODIFIED: Was 'no'
  const [stateB4, setStateB4] = useState(""); // MODIFIED: Was 'no'
  const [stateB5, setStateB5] = useState(""); // MODIFIED: Was 'no'
  const [commentsB, setCommentsB] = useState("");

  // --- State for Section C ---
  const [stateC1, setStateC1] = useState(""); // MODIFIED: Was 'no'
  const [stateC2, setStateC2] = useState(""); // MODIFIED: Was 'no'
  const [stateC3, setStateC3] = useState(""); // MODIFIED: Was 'no'
  const [stateC4, setStateC4] = useState(""); // MODIFIED: Was 'no'
  const [stateC5, setStateC5] = useState(""); // MODIFIED: Was 'no'
  const [stateC6, setStateC6] = useState(""); // MODIFIED: Was 'no'
  const [stateC7, setStateC7] = useState(""); // MODIFIED: Was 'no'
  const [stateC8, setStateC8] = useState(""); // MODIFIED: Was 'no'
  const [stateC9, setStateC9] = useState(""); // MODIFIED: Was 'no'
  const [commentsC, setCommentsC] = useState("");

  // --- State for Section D ---
  const [stateD1, setStateD1] = useState(""); // MODIFIED: Was 'no'
  const [stateD2, setStateD2] = useState(""); // MODIFIED: Was 'na'
  const [stateD3, setStateD3] = useState(""); // MODIFIED: Was 'yes'
  const [commentsD, setCommentsD] = useState("");

  // --- State for Section E ---
  const [stateE1, setStateE1] = useState(""); // MODIFIED: Was 'no'
  const [stateE2, setStateE2] = useState(""); // MODIFIED: Was 'na'
  const [stateE3, setStateE3] = useState(""); // MODIFIED: Was 'yes'
  const [stateE4, setStateE4] = useState(""); // MODIFIED: Was 'yes'
  const [stateE5, setStateE5] = useState(""); // MODIFIED: Was 'yes'
  const [commentsE, setCommentsE] = useState("");

  // --- State for Section F ---
  const [stateF1, setStateF1] = useState(""); // MODIFIED: Was 'no'
  const [stateF2, setStateF2] = useState(""); // MODIFIED: Was 'na'
  const [stateF3, setStateF3] = useState(""); // MODIFIED: Was 'yes'
  const [stateF4, setStateF4] = useState(""); // MODIFIED: Was 'yes'
  const [stateF5, setStateF5] = useState(""); // MODIFIED: Was 'yes'
  const [stateF6, setStateF6] = useState(""); // MODIFIED: Was 'yes'
  const [stateF7, setStateF7] = useState(""); // MODIFIED: Was 'yes'
  const [commentsF, setCommentsF] = useState("");

  // --- State for Section G ---
  const [stateG1, setStateG1] = useState(""); // MODIFIED: Was 'no'
  const [stateG2, setStateG2] = useState(""); // MODIFIED: Was 'na'
  const [stateG3, setStateG3] = useState(""); // MODIFIED: Was 'yes'
  const [commentsG, setCommentsG] = useState("");

  // --- State for Section H ---
  const [stateH1, setStateH1] = useState(""); // MODIFIED: Was 'no'
  const [stateH2, setStateH2] = useState(""); // MODIFIED: Was 'na'
  const [stateH3, setStateH3] = useState(""); // MODIFIED: Was 'yes'
  const [stateH4, setStateH4] = useState(""); // MODIFIED: Was 'yes'
  const [commentsH, setCommentsH] = useState("");

  // --- State for Section I ---
  const [stateI1, setStateI1] = useState(""); // MODIFIED: Was 'no'
  const [stateI2, setStateI2] = useState(""); // MODIFIED: Was 'na'
  const [stateI3, setStateI3] = useState(""); // MODIFIED: Was 'yes'
  const [commentsI, setCommentsI] = useState("");

  // --- State for Section J ---
  const [stateJ1, setStateJ1] = useState(""); // MODIFIED: Was 'no'
  const [stateJ2, setStateJ2] = useState(""); // MODIFIED: Was 'na'
  const [stateJ3, setStateJ3] = useState(""); // MODIFIED: Was 'yes'
  const [commentsJ, setCommentsJ] = useState("");

  // --- State for Section K ---
  const [stateK1, setStateK1] = useState(""); // MODIFIED: Was 'no'
  const [stateK2, setStateK2] = useState(""); // MODIFIED: Was 'na'
  const [commentsK, setCommentsK] = useState("");

  const getStatusText = (value: string) => {
    if (!value) return "Not Selected"; // Handle empty string for unselected
    const option = choiceOptions.find((opt) => opt.value === value);
    return option ? option.label : "Not Selected";
  };

  const handleSaveInspection = async () => {
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm", // Using mm for easier margin setting
      format: "a4",
    });

    const margin = 20; // 20mm margin
    let currentY = margin;
    const lineSpacing = 7; // mm
    const sectionTitleFontSize = 12;
    const regularFontSize = 10;
    const tableHeaderFontSize = 9;
    const tableCellFontSize = 8;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - 2 * margin;

    // --- Document Title ---
    doc.setFontSize(16);
    doc.text("FSM Monthly Inspection Report", pageWidth / 2, currentY, {
      align: "center",
    });
    currentY += lineSpacing * 1.5;

    // --- Form Title ---
    doc.setFontSize(14);
    doc.text("Fire Safety Inspection Checklist", pageWidth / 2, currentY, {
      align: "center",
    });
    currentY += lineSpacing * 1.5;

    // --- Basic Details (Inline) ---
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

    // --- Sections Data Structure (CRITICAL: Ensure all string properties are actual strings) ---
    const sectionsData = [
      {
        title:
          "A. PROTECTED AREA / CORRIDORS / LOBBIES / PASSAGEWAYS / STAIRCASES", // Ensure this is a string
        items: [
          {
            no: "i.",
            desc: "Such areas are clear of obstruction",
            status: getStatusText(stateA1),
          },
          {
            no: "ii.",
            desc: "Services pipes (gas, oil) are not passing through the protected zones",
            status: getStatusText(stateA2),
          },
          {
            no: "iii.",
            desc: "Escape routes plans are provided at the lobbies",
            status: getStatusText(stateA3),
          },
        ],
        comments: commentsA || "", // Ensure comments is a string, even if empty
      },
      {
        title: "B. ESCAPE ROUTES", // Ensure this is a string
        items: [
          {
            no: "i.",
            desc: "Exit signs and directional signs are sufficiently provided",
            status: getStatusText(stateB1),
          },
          {
            no: "ii.",
            desc: "Final exit discharge points not obstructed",
            status: getStatusText(stateB2),
          },
          {
            no: "iii.",
            desc: "Door release devices are in good working condition",
            status: getStatusText(stateB3),
          },
          {
            no: "iv.",
            desc: "The lightings and illumination of staircases are good.",
            status: getStatusText(stateB4),
          },
          {
            no: "v.",
            desc: "The passageways and office configuration are maintained with at least 1.2m clearance",
            status: getStatusText(stateB5),
          },
        ],
        comments: commentsB || "", // Ensure comments is a string
      },
      {
        title: "C. FIRE DOORS" /* इंश्योर this is a string */,
        items: [
          {
            no: "i.",
            desc: "Door closers are provided and are in good condition",
            status: getStatusText(stateC1),
          },
          {
            no: "ii.",
            desc: "PSB labels provided for all fire doors and frames",
            status: getStatusText(stateC2),
          },
          {
            no: "iii.",
            desc: "No door stopper devices installed",
            status: getStatusText(stateC3),
          },
          {
            no: "iv.",
            desc: "Doors are close-fitting.",
            status: getStatusText(stateC4),
          },
          {
            no: "v.",
            desc: "Swing of doors in direction of escape",
            status: getStatusText(stateC5),
          },
          {
            no: "vi.",
            desc: "Clear of obstruction",
            status: getStatusText(stateC6),
          },
          {
            no: "vii.",
            desc: "Vision panels are provided",
            status: getStatusText(stateC7),
          },
          {
            no: "viii.",
            desc: "Fire doors are not locked",
            status: getStatusText(stateC8),
          },
          {
            no: "ix.",
            desc: "Door handles, door closers, door bodies are in good condition",
            status: getStatusText(stateC9),
          },
        ],
        comments: commentsC || "",
      },
      {
        title:
          "D. EMERGENCY / EXIT AND LIGHTING" /* इंश्योर this is a string */,
        items: [
          {
            no: "i.",
            desc: "Exit signs and emergency lighting adequately provided along escape routes, public areas, staircase, and essential services areas",
            status: getStatusText(stateD1),
          },
          {
            no: "ii.",
            desc: "Exit signs are visible",
            status: getStatusText(stateD2),
          },
          {
            no: "iii.",
            desc: "Exit signs are functioning well",
            status: getStatusText(stateD3),
          },
        ],
        comments: commentsD || "",
      },
      {
        title: "E. HOSEREELS" /* इंश्योर this is a string */,
        items: [
          {
            no: "i.",
            desc: "Nozzle condition satisfactory",
            status: getStatusText(stateE1),
          },
          {
            no: "ii.",
            desc: "Stopcock condition satisfactory",
            status: getStatusText(stateE2),
          },
          {
            no: "iii.",
            desc: "Clear of obstruction",
            status: getStatusText(stateE3),
          },
          {
            no: "iv.",
            desc: "Servicing labeling provided for cabinet",
            status: getStatusText(stateE4),
          },
          {
            no: "v.",
            desc: "Date service is shown and has not expired",
            status: getStatusText(stateE5),
          },
        ],
        comments: commentsE || "",
      },
      {
        title: "F. FIRE EXTINGUISHERS" /* इंश्योर this is a string */,
        items: [
          {
            no: "i.",
            desc: "Properly hung on bracket/ inside labeled cabinet",
            status: getStatusText(stateF1),
          },
          {
            no: "ii.",
            desc: "Date service is shown and has not expired",
            status: getStatusText(stateF2),
          },
          {
            no: "iii.",
            desc: "Clear of obstruction",
            status: getStatusText(stateF3),
          },
          {
            no: "iv.",
            desc: "Bears SISIR label",
            status: getStatusText(stateF4),
          },
          {
            no: "v.",
            desc: "Pressure gauge of Fire Extinguishers within functional range",
            status: getStatusText(stateF5),
          },
          {
            no: "vi.",
            desc: "Fire Extinguishers seal not broken",
            status: getStatusText(stateF6),
          },
          {
            no: "vii.",
            desc: "Fire Extinguishers body not rusty",
            status: getStatusText(stateF7),
          },
        ],
        comments: commentsF || "",
      },
      {
        title: "G. HYDRANT" /* इंश्योर this is a string */,
        items: [
          {
            no: "i.",
            desc: "Clear of obstruction",
            status: getStatusText(stateG1),
          },
          {
            no: "ii.",
            desc: "Cover for spindle chamber visible",
            status: getStatusText(stateG2),
          },
          {
            no: "iii.",
            desc: "Blank caps provided to outlets",
            status: getStatusText(stateG3),
          },
        ],
        comments: commentsG || "",
      },
      {
        title:
          "H. Dry Riser Breeching Inlet / Dry Riser Landing Valves" /* इंश्योर this is a string */,
        items: [
          {
            no: "i.",
            desc: "Clear of dirt or corrosion",
            status: getStatusText(stateH1),
          },
          {
            no: "ii.",
            desc: "Clear of obstruction or blockage to the inlets",
            status: getStatusText(stateH2),
          },
          {
            no: "iii.",
            desc: "Valves are strap-locked",
            status: getStatusText(stateH3),
          },
          {
            no: "iv.",
            desc: "Compartment free of foreign objects",
            status: getStatusText(stateH4),
          },
        ],
        comments: commentsH || "",
      },
      {
        title: "I. Fire Command Centre" /* इंश्योर this is a string */,
        items: [
          {
            no: "i.",
            desc: "PA system functioning",
            status: getStatusText(stateI1),
          },
          {
            no: "ii.",
            desc: "Battery working properly",
            status: getStatusText(stateI2),
          },
          {
            no: "iii.",
            desc: "Lift panel control functioning",
            status: getStatusText(stateI3),
          },
        ],
        comments: commentsI || "",
      },
      {
        title: "J. Main / Sub Fire Alarm panel" /* इंश्योर this is a string */,
        items: [
          {
            no: "i.",
            desc: "Battery working properly",
            status: getStatusText(stateJ1),
          },
          {
            no: "ii.",
            desc: "All LED lights working - lamp test",
            status: getStatusText(stateJ2),
          },
          {
            no: "iii.",
            desc: "Any alerts (warnings), alarms or faults indicated in the panel",
            status: getStatusText(stateJ3),
          },
        ],
        comments: commentsJ || "",
      },
      {
        title:
          "K. Fireman Access Panel, Fire Engine & Fire Hydrant" /* इंश्योर this is a string */,
        items: [
          {
            no: "i.",
            desc: "No obstruction to Fire men accesses panel windows",
            status: getStatusText(stateK1),
          },
          {
            no: "ii.",
            desc: "No obstruction to fire engine parking lot",
            status: getStatusText(stateK2),
          },
        ],
        comments: commentsK || "",
      },
    ];

    for (const section of sectionsData) {
      if (currentY > doc.internal.pageSize.getHeight() - margin - 20) {
        doc.addPage();
        currentY = margin;
      }
      doc.setFontSize(sectionTitleFontSize);
      doc.setFont("helvetica", "bold");
      // section.title should be a string from sectionsData. Fallback is defensive.
      doc.text(section.title || "Untitled Section", margin, currentY);
      currentY += lineSpacing * 0.8;
      doc.setFont("helvetica", "normal");

      // item.no, item.desc, item.status are expected to be strings here
      const tableBody = section.items.map(item => [item.no || "", item.desc || "", item.status || ""]);

      doc.autoTable({
        startY: currentY,
        head: [["S/No", "Description", "Status"]],
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

      // section.comments should be a string from sectionsData (e.g., commentsA || "")
      if (section.comments.trim() !== "") {
        if (currentY > doc.internal.pageSize.getHeight() - margin - 15) {
          doc.addPage();
          currentY = margin;
        }
        doc.setFontSize(regularFontSize - 1);
        doc.setFont("helvetica", "bold");
        doc.text("Additional Comments:", margin, currentY);
        currentY += lineSpacing * 0.6;
        doc.setFont("helvetica", "normal");

        // section.comments is already confirmed to be a non-empty string here
        const commentLines = doc.splitTextToSize(
          section.comments,
          contentWidth
        );
        commentLines.forEach((line: string) => {
          // line is string
          if (
            currentY >
            doc.internal.pageSize.getHeight() - margin - lineSpacing * 0.5
          ) {
            doc.addPage();
            currentY = margin;
          }
          doc.text(line, margin, currentY); // line is already a string here
          currentY += lineSpacing * 0.5;
        });
        currentY += lineSpacing * 0.5;
      }
      currentY += lineSpacing * 0.5;
    }

    try {
      const pdfData = doc.output("datauristring");
      const base64Code = pdfData.substring(pdfData.indexOf(",") + 1);

      const dateForFilename = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      // Ensure inspector is a string before calling .replace, though useState('') should handle this.
      const currentInspector = inspector || ""; // inspector is from useState('')
      const filenameInspector =
        currentInspector.replace(/[^a-zA-Z0-9]/g, "_") || "UnknownInspector";
      const filename =
        FileSystem.documentDirectory +
        `FSM_Inspection_${filenameInspector}_${dateForFilename}.pdf`;

      await FileSystem.writeAsStringAsync(filename, base64Code, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filename);
        // Alert.alert("Success", "PDF generated and shared!"); // Use Alert from react-native
      } else {
        Alert.alert(
          "Sharing Not Available",
          "Sharing is not available on this device. PDF saved to: " + filename
        );
      }
    } catch (error) {
      console.error("Error generating or sharing PDF:", error);
      Alert.alert(
        "Error",
        "Failed to generate or share PDF. See console for details."
      );
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

          {/* --- Section A --- */}
          <Text style={styles.sectionHeader}>
            A. PROTECTED AREA / CORRIDORS / LOBBIES / PASSAGEWAYS / STAIRCASES
          </Text>
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
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>i.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Such areas are clear of obstruction
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateA1}
                  onValueChange={setStateA1}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>ii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Services pipes (gas, oil) are not passing through the protected
                zones
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateA2}
                  onValueChange={setStateA2}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>iii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Escape routes plans are provided at the lobbies
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateA3}
                  onValueChange={setStateA3}
                />
              </View>
            </View>
          </View>
          <View style={styles.commentsSection}>
            <Text style={styles.label}>Additional Comments:</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={commentsA}
              onChangeText={setCommentsA}
              placeholder="See annex for remarks"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* --- Section B --- */}
          <Text style={styles.sectionHeader}>B. ESCAPE ROUTES</Text>
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
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>i.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Exit signs and directional signs are sufficiently provided
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateB1}
                  onValueChange={setStateB1}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>ii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Final exit discharge points not obstructed
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateB2}
                  onValueChange={setStateB2}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>iii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Door release devices are in good working condition
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateB3}
                  onValueChange={setStateB3}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>iv.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                The lightings and illumination of staircases are good.
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateB4}
                  onValueChange={setStateB4}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>v.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                The passageways and office configuration are maintained with at
                least 1.2m clearance
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateB5}
                  onValueChange={setStateB5}
                />
              </View>
            </View>
          </View>
          <View style={styles.commentsSection}>
            <Text style={styles.label}>Additional Comments:</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={commentsB}
              onChangeText={setCommentsB}
              placeholder="See annex for remarks"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* --- Section C --- */}
          <Text style={styles.sectionHeader}>C. FIRE DOORS</Text>
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
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>i.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Door closers are provided and are in good condition
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateC1}
                  onValueChange={setStateC1}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>ii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                PSB labels provided for all fire doors and frames
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateC2} // CORRECTED
                  onValueChange={setStateC2}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>iii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                No door stopper devices installed
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateC3} // CORRECTED
                  onValueChange={setStateC3}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>iv.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Doors are close-fitting.
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateC4} // CORRECTED
                  onValueChange={setStateC4}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>v.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Swing of doors in direction of escape
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateC5} // CORRECTED
                  onValueChange={setStateC5}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>vi.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Clear of obstruction
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateC6} // CORRECTED
                  onValueChange={setStateC6}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>vii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Vision panels are provided
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateC7} // CORRECTED
                  onValueChange={setStateC7}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>viii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Fire doors are not locked
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateC8} // CORRECTED
                  onValueChange={setStateC8}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>ix.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Door handles, door closers, door bodies are in good condition
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateC9} // CORRECTED
                  onValueChange={setStateC9}
                />
              </View>
            </View>
          </View>
          <View style={styles.commentsSection}>
            <Text style={styles.label}>Additional Comments:</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={commentsC}
              onChangeText={setCommentsC}
              placeholder="See annex for remarks"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* --- Section D --- */}
          <Text style={styles.sectionHeader}>
            D. EMERGENCY / EXIT AND LIGHTING
          </Text>
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
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>i.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Exit signs and emergency lighting adequately provided along
                escape routes, public areas, staircase, and essential services
                areas
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateD1}
                  onValueChange={setStateD1}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>ii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Exit signs are visible
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateD2} // CORRECTED
                  onValueChange={setStateD2}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>iii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Exit signs are functioning well
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateD3} // CORRECTED
                  onValueChange={setStateD3}
                />
              </View>
            </View>
          </View>
          <View style={styles.commentsSection}>
            <Text style={styles.label}>Additional Comments:</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={commentsD}
              onChangeText={setCommentsD}
              placeholder="See annex for remarks"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* --- Section E --- */}
          <Text style={styles.sectionHeader}>E. HOSEREELS</Text>
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
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>i.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Nozzle condition satisfactory
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateE1}
                  onValueChange={setStateE1}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>ii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Stopcock condition satisfactory
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateE2}
                  onValueChange={setStateE2}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>iii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Clear of obstruction
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateE3}
                  onValueChange={setStateE3}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>iv.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Servicing labeling provided for cabinet
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateE4}
                  onValueChange={setStateE4}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>v.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Date service is shown and has not expired
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateE5}
                  onValueChange={setStateE5}
                />
              </View>
            </View>
          </View>
          <View style={styles.commentsSection}>
            <Text style={styles.label}>Additional Comments:</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={commentsE}
              onChangeText={setCommentsE}
              placeholder="See annex for remarks"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* --- Section F --- */}
          <Text style={styles.sectionHeader}>F. FIRE EXTINGUISHERS</Text>
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
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>i.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Properly hung on bracket/ inside labeled cabinet
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateF1}
                  onValueChange={setStateF1}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>ii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Date service is shown and has not expired
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateF2}
                  onValueChange={setStateF2}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>iii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Clear of obstruction
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateF3}
                  onValueChange={setStateF3}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>iv.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Bears SISIR label
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateF4}
                  onValueChange={setStateF4}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>v.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Pressure gauge of Fire Extinguishers within functional range
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateF5}
                  onValueChange={setStateF5}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>vi.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Fire Extinguishers seal not broken
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateF6}
                  onValueChange={setStateF6}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>vii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Fire Extinguishers body not rusty
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateF7}
                  onValueChange={setStateF7}
                />
              </View>
            </View>
          </View>
          <View style={styles.commentsSection}>
            <Text style={styles.label}>Additional Comments:</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={commentsF}
              onChangeText={setCommentsF}
              placeholder="See annex for remarks"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* --- Section G --- */}
          <Text style={styles.sectionHeader}>G. HYDRANT</Text>
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
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>i.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Clear of obstruction
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateG1}
                  onValueChange={setStateG1}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>ii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Cover for spindle chamber visible
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateG2}
                  onValueChange={setStateG2}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>iii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Blank caps provided to outlets
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateG3}
                  onValueChange={setStateG3}
                />
              </View>
            </View>
          </View>
          <View style={styles.commentsSection}>
            <Text style={styles.label}>Additional Comments:</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={commentsG}
              onChangeText={setCommentsG}
              placeholder="See annex for remarks"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* --- Section H --- */}
          <Text style={styles.sectionHeader}>
            H. Dry Riser Breeching Inlet / Dry Riser Landing Valves
          </Text>
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
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>i.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Clear of dirt or corrosion
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateH1}
                  onValueChange={setStateH1}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>ii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Clear of obstruction or blockage to the inlets
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateH2}
                  onValueChange={setStateH2}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>iii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Valves are strap-locked
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateH3}
                  onValueChange={setStateH3}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>iv.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Compartment free of foreign objects
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateH4}
                  onValueChange={setStateH4}
                />
              </View>
            </View>
          </View>
          <View style={styles.commentsSection}>
            <Text style={styles.label}>Additional Comments:</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={commentsH}
              onChangeText={setCommentsH}
              placeholder="See annex for remarks"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* --- Section I --- */}
          <Text style={styles.sectionHeader}>I. Fire Command Centre</Text>
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
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>i.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                PA system functioning
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateI1}
                  onValueChange={setStateI1}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>ii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Battery working properly
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateI2}
                  onValueChange={setStateI2}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>iii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Lift panel control functioning
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateI3}
                  onValueChange={setStateI3}
                />
              </View>
            </View>
          </View>
          <View style={styles.commentsSection}>
            <Text style={styles.label}>Additional Comments:</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={commentsI}
              onChangeText={setCommentsI}
              placeholder="See annex for remarks"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* --- Section J --- */}
          <Text style={styles.sectionHeader}>
            J. Main / Sub Fire Alarm panel
          </Text>
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
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>i.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Battery working properly
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateJ1}
                  onValueChange={setStateJ1}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>ii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                All LED lights working - lamp test
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateJ2}
                  onValueChange={setStateJ2}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>iii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                Any alerts (warnings), alarms or faults indicated in the panel
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateJ3}
                  onValueChange={setStateJ3}
                />
              </View>
            </View>
          </View>
          <View style={styles.commentsSection}>
            <Text style={styles.label}>Additional Comments:</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={commentsJ}
              onChangeText={setCommentsJ}
              placeholder="See annex for remarks"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* --- Section K --- */}
          <Text style={styles.sectionHeader}>
            K. Fireman Access Panel, Fire Engine & Fire Hydrant
          </Text>
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
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>i.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                No obstruction to Fire men accesses panel windows
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateK1}
                  onValueChange={setStateK1}
                />
              </View>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tdSNo]}>ii.</Text>
              <Text style={[styles.tableCell, styles.tdDescription]}>
                No obstruction to fire engine parking lot
              </Text>
              <View style={[styles.tableCell, styles.tdStatus]}>
                <CheckboxGroup
                  options={choiceOptions}
                  selectedValue={stateK2}
                  onValueChange={setStateK2}
                />
              </View>
            </View>
          </View>
          <View style={styles.commentsSection}>
            <Text style={styles.label}>Additional Comments:</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={commentsK}
              onChangeText={setCommentsK}
              placeholder="See annex for remarks"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.submitRow}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSaveInspection}
            >
              <Text style={styles.submitButtonText}>Save Inspection</Text>
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
