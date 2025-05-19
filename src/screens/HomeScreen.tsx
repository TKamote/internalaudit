// filepath: /Users/davidonquit/Library/Mobile Documents/com~apple~CloudDocs/Year2025/developingforAppStore/internalaudit/src/screens/HomeScreen.tsx
import React from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Import for type
import { AppStackParamList } from '../navigation/AppNavigator'; // Import the ParamList type

const APP_LIST_DATA = [
  { id: "1", title: "Audit with Property Checklist", screenName: "AuditPropertyChecklist" as keyof AppStackParamList },
  { id: "2", title: "Building Inspections - Daily", screenName: "BuildingInspectionsDaily" as keyof AppStackParamList },
  { id: "3", title: "Building Inspections - Weekly", screenName: "BuildingInspectionsWeekly" as keyof AppStackParamList },
  { id: "4", title: "Building Inspections - Monthly", screenName: "BuildingInspectionsMonthly" as keyof AppStackParamList },
  { id: "5", title: "Health & Safety – Daily TBM", screenName: "HealthSafetyDailyTBM" as keyof AppStackParamList },
  { id: "6", title: "Safety Site Inspection – FSM+Safety", screenName: "SafetySiteInspection" as keyof AppStackParamList },
  { id: "7", title: "FSM Periodic Inspection", screenName: "FSMPeriodicInspection" as keyof AppStackParamList },
];

interface ItemProps {
  title: string;
  onPress: () => void;
}

const Item = ({ title, onPress }: ItemProps) => (
  <TouchableOpacity onPress={onPress} style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </TouchableOpacity>
);

// Define the type for the navigation prop using the ParamList
type HomeScreenNavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>(); // Use the typed navigation

  const renderItem = ({ item }: { item: typeof APP_LIST_DATA[0] }) => (
    <Item
      title={item.title}
      onPress={() => {
        if (item.screenName && navigation) {
          navigation.navigate(item.screenName);
        } else {
          console.warn("Screen name not defined or navigation not available for:", item.title);
        }
      }}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Applications</Text>
      <FlatList
        data={APP_LIST_DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#f4f4f4',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  item: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
    shadowColor: '#000',
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