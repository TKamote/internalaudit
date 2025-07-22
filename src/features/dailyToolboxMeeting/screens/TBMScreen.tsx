import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Checkbox } from "expo-checkbox";
import * as ImagePicker from "expo-image-picker";
import { jsPDF } from "jspdf";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useNavigation } from "@react-navigation/native";

const TOPICS = [
  {
    title: "Slips, Trips, and Falls",
    items: [
      "Clean up spills immediately.",
      "Use warning signs for wet floors.",
      "Keep walkways clear of clutters.",
    ],
  },
  {
    title: "Personal Protective Equipment (PPE)",
    items: [
      "Wear N95 mask for dusty works.",
      "Wear anticut gloves for works that has rough surface and / or with sharp edges.",
      "Wear safety shoes.",
      "Wear any other PPE as per RA of specific work.",
    ],
  },
  {
    title: "Electrical Safety",
    items: [
      "Check that extension cords have no damage before using.",
      "Avoid overloading electrical outlets by using hi jet or pressure washer on ordinary power points (13A).",
      "Use ELCB when plugging drills, power tools to power points etc...",
      "Keep electrical equipment away from water.",
    ],
  },
  {
    title: "Fire Prevention and Preparedness",
    items: [
      "Check that exit signage are illuminated during your site walks. Special attention to spaces not available to most building users.",
      "Keep flammable materials away from heat sources.",
      "Ensure you know your role in case of emergency. On 1st alarm be on standby, on 2nd alarm evacuate or as your pre-defined role.",
    ],
  },
  {
    title: "Work at Height",
    items: [
      "Be aware of any contractors that are doing WAH to ask them if they applied ePTW. If no ePTW, ask to stop and feedback to supervisor.",
      "Ensure ladders are securely positioned before going up.",
      "Maintain three points contact on ladders.",
      "Ensure to use ladders that are EN 131 standard compliance. Look for the sticker at the ladder to confirm.",
    ],
  },
  {
    title: "Machinery Safety",
    items: [
      "Follow lockout/tagout procedure during maintenance.",
      "Wear personal protective equipment (PPE) specific to the machine.",
    ],
  },
  {
    title: "Mental Well-being",
    items: [
      "Take regular breaks to reduce stress and stay refreshed.",
      "Stay hydrated throughout the day.",
      "If you're feeling overwhelmed or struggling, don’t hesitate to talk to your supervisor or someone you trust.",
      "If you're feeling unwell see a doctor.",
    ],
  },
];

export default function TBMScreen() {
  const navigation = useNavigation();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [conductor, setConductor] = useState<string>("");
  const [designation, setDesignation] = useState<string>("");
  const [attendees, setAttendees] = useState(["", "", ""]);
  const [topicsChecked, setTopicsChecked] = useState(
    TOPICS.map((topic) => topic.items.map(() => false))
  );
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert(
        "Permission required",
        "Camera permission is required to take a photo."
      );
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri ?? null);
      setImageBase64(result.assets[0].base64 ?? null);
    }
  };

  const handleAttendeeChange = (idx: number, value: string) => {
    const newAttendees = [...attendees];
    newAttendees[idx] = value;
    setAttendees(newAttendees);
  };

  const handleTopicCheck = (topicIdx: number, itemIdx: number) => {
    const newChecked = topicsChecked.map((topic, tIdx) =>
      topic.map((checked, iIdx) =>
        tIdx === topicIdx && iIdx === itemIdx ? !checked : checked
      )
    );
    setTopicsChecked(newChecked);
  };

  const generatePDF = async () => {
    try {
      const doc = new jsPDF({ unit: "mm" });
      const margin = 20; // Reduced left margin by 5px
      const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
      const pageHeight = doc.internal.pageSize.getHeight();
      const topMargin = 30; // Increased top margin
      const bottomMargin = 15;
      let y = topMargin;
      const lineHeight = 6;
      doc.setFont("helvetica", "normal");
      // Helper for pagination
      function checkPageSpace(linesCount: number) {
        if (y + lineHeight * linesCount > pageHeight - bottomMargin) {
          doc.addPage();
          y = topMargin;
        }
      }
      // Title
      checkPageSpace(1);
      doc.setFontSize(14);
      doc.text("Daily Toolbox Meeting for Summit", margin, y);
      y += 10;
      doc.setFontSize(10);
      // Date, Conductor, Designation
      [
        `Date: ${date}`,
        `Briefing Conducted By: ${conductor}`,
        `Designation: ${designation}`,
        "Attendees:",
      ].forEach((line) => {
        checkPageSpace(1);
        doc.text(line, margin, y);
        y += lineHeight + 1;
      });
      // Attendees
      attendees.forEach((name, idx) => {
        checkPageSpace(1);
        doc.text(`${idx + 1}. ${name}`, margin + 5, y);
        y += lineHeight + 1;
      });
      y += 2;
      // Topics
      TOPICS.forEach((topic, tIdx) => {
        checkPageSpace(1);
        doc.setFont("helvetica", "bold");
        doc.text(topic.title, margin, y);
        doc.setFont("helvetica", "normal");
        y += lineHeight;
        topic.items.forEach((item, iIdx) => {
          const checked = topicsChecked[tIdx][iIdx];
          const mark = checked ? "[x]" : "[ ]"; // Revert to x
          const text = `${mark} ${item}`;
          const lines = doc.splitTextToSize(text, maxWidth);
          lines.forEach((line: string) => {
            checkPageSpace(1); // Check before every line
            doc.text(line, margin + 5, y);
            y += lineHeight;
          });
        });
        y += 2;
      });
      // Photo
      if (imageBase64) {
        // Set image size to 90x120 mm and center horizontally
        const imgWidth = 90;
        const imgHeight = 120;
        const pageWidth = doc.internal.pageSize.getWidth();
        const imgX = (pageWidth - imgWidth) / 2;
        // Check if there is enough space left on the current page
        if (y + 10 + imgHeight > pageHeight - bottomMargin) {
          doc.addPage();
          y = topMargin;
        }
        doc.text("Photo of attendees:", margin, y);
        y += 10;
        doc.addImage(
          `data:image/jpeg;base64,${imageBase64}`,
          "JPEG",
          imgX,
          y,
          imgWidth,
          imgHeight
        );
        // Draw a subtle border 20mm below the photo, centered, and wider than the photo by 20mm
        const borderY = y + imgHeight + 20;
        const borderWidth = imgWidth + 20;
        const borderX = (pageWidth - borderWidth) / 2;
        doc.setDrawColor(180, 180, 180); // subtle gray
        doc.setLineWidth(0.7);
        doc.line(borderX, borderY, borderX + borderWidth, borderY);
      }
      const pdfUri = FileSystem.cacheDirectory + `TBM_Report_${date}.pdf`;
      await FileSystem.writeAsStringAsync(
        pdfUri,
        doc.output("datauristring").split(",")[1],
        { encoding: FileSystem.EncodingType.Base64 }
      );
      await Sharing.shareAsync(pdfUri);
    } catch (e) {
      Alert.alert("Error", "Failed to generate PDF.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
       
        <Text style={styles.header}>Daily Toolbox Meeting for Summit</Text>
        <View style={styles.sectionRow}>
          <Text style={styles.inputLabel}>Date:</Text>
          <TextInput
            style={styles.inputDate}
            value={date ?? ""}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />
        </View>
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Briefing Conducted By:</Text>
          <View style={styles.inputGroupRow}>
            <Text style={styles.inputLabel}>Name:</Text>
            <TextInput
              style={styles.input}
              value={conductor}
              onChangeText={setConductor}
              placeholder=""
            />
          </View>
          <View style={styles.inputGroupRow}>
            <Text style={styles.inputLabel}>Designation:</Text>
            <TextInput
              style={styles.input}
              value={designation}
              onChangeText={setDesignation}
              placeholder=""
            />
          </View>
        </View>
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Attendees:</Text>
          {[0, 1, 2].map((idx) => (
            <View key={idx} style={styles.attendeeGroup}>
              <View style={styles.inputGroupRow}>
                <Text style={styles.inputLabel}>S/N:</Text>
                <TextInput
                  style={[styles.input, styles.serialInput]}
                  value={`${idx + 1}`}
                  editable={false}
                />
              </View>
              <View style={styles.inputGroupRow}>
                <Text style={styles.inputLabel}>Name:</Text>
                <TextInput
                  style={styles.input}
                  value={attendees[idx] ?? ""}
                  onChangeText={(v) => handleAttendeeChange(idx, v)}
                  placeholder=""
                />
              </View>
            </View>
          ))}
        </View>
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Topics Discussed</Text>
          {TOPICS.map((topic, tIdx) => (
            <View key={topic.title} style={styles.topicGroup}>
              <View style={styles.topicHeaderRow}>
                <Text style={styles.topicHeader}>{topic.title}</Text>
                <Text style={styles.tickLabel}>Tick</Text>
              </View>
              {topic.items.map((item, iIdx) => (
                <View key={item} style={styles.topicItemRow}>
                  <Text style={styles.topicItemText}>{item}</Text>
                  <Checkbox
                    value={topicsChecked[tIdx][iIdx]}
                    onValueChange={() => handleTopicCheck(tIdx, iIdx)}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Photo of attendees</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
            <Text style={styles.uploadBtnText}>📷 Take Photo</Text>
          </TouchableOpacity>
          {image && (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          )}
        </View>
        <TouchableOpacity style={styles.downloadBtn} onPress={generatePDF}>
          <Text style={styles.downloadBtnText}>⬇️ Download PDF</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f4f4f4",
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    width: "100%",
    maxWidth: 600,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  backBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#e0c6ad",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  backBtnText: {
    color: "#444",
    fontWeight: "bold",
    fontSize: 15,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 8,
    color: "#222",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  inputDate: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 6,
    minWidth: 120,
    backgroundColor: "#fafafa",
  },
  sectionBox: {
    backgroundColor: "#fafafa",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    fontSize: 15,
  },
  inputGroupRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  inputLabel: {
    minWidth: 70,
    fontWeight: "600",
    color: "#444",
    fontSize: 14,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 7,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  serialInput: {
    maxWidth: 40,
    textAlign: "center",
    backgroundColor: "#f4f4f4",
  },
  attendeeGroup: {
    marginBottom: 8,
  },
  topicGroup: {
    marginBottom: 12,
  },
  topicHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  topicHeader: {
    fontWeight: "bold",
    color: "#222",
    fontSize: 14,
  },
  tickLabel: {
    fontWeight: "bold",
    color: "#222",
    fontSize: 13,
    marginRight: 8,
  },
  topicItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingLeft: 4,
    borderBottomWidth: 2,
    borderBottomColor: "#eee",
  },
  topicItemText: {
    flex: 1,
    color: "#333",
    fontSize: 13,
  },
  uploadBtn: {
    backgroundColor: "#e6f0f3",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#bcdbe6",
  },
  uploadBtnText: {
    color: "#003e51",
    fontWeight: "bold",
    fontSize: 15,
  },
  imagePreview: {
    width: 200,
    height: 150,
    borderRadius: 4,
    alignSelf: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  downloadBtn: {
    backgroundColor: "#e6f0f3",
    padding: 14,
    borderRadius: 4,
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#bcdbe6",
  },
  downloadBtnText: {
    color: "#003e51",
    fontWeight: "bold",
    fontSize: 16,
  },
});
