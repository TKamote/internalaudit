import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  StatusBar,
} from "react-native";

const APP_LIST_DATA = [
  { id: "1", title: "Audit with Property Checklist" },
  { id: "2", title: "Building Inspections - Daily" },
  { id: "3", title: "Building Inspections - Weekly" },
  { id: "4", title: "Building Inspections - Monthly" },
  { id: "5", title: "Health & Safety – Daily TBM" },
  { id: "6", title: "Safety Site Inspection – FSM+Safety" },
  { id: "7", title: "FSM Periodic Inspection" },
];

const Item = ({ title }: { title: string }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

export default function App() {
  const renderItem = ({ item }: { item: { title: string } }) => (
    <Item title={item.title} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>App List</Text>
      <FlatList
        data={APP_LIST_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: "#f4f4f4",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  item: {
    backgroundColor: "#ffffff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  title: {
    fontSize: 18,
  },
});
