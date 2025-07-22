// filepath: /Users/davidonquit/Library/Mobile Documents/com~apple~CloudDocs/Year2025/developingforAppStore/internalaudit/src/screens/HomeScreen.tsx
import React from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';

// Define a more specific type for items in APP_LIST_DATA
interface AppListItem {
  id: string;
  title: string;
  // Ensure screenName is one of the keys from AppStackParamList that expects no parameters
  // when navigated to from HomeScreen.
  // AuditChecklistMain is excluded here because it expects params and is not directly navigated to from APP_LIST_DATA.
  screenName: Exclude<keyof AppStackParamList, "AuditChecklistMain">;
}

const APP_LIST_DATA: AppListItem[] = [
  { id: "1", title: "Audit with Property Checklist", screenName: "AuditCategories" },
  // Assuming these other screens are defined in your AppStackParamList and don't require params from HomeScreen
  // { id: "2", title: "Building Inspections - Daily", screenName: "BuildingInspectionsDaily" as any }, // Cast to any if not in AppStackParamList yet
  // { id: "3", title: "Building Inspections - Weekly", screenName: "BuildingInspectionsWeekly" as any },// Cast to any if not in AppStackParamList yet
  // { id: "4", title: "Building Inspections - Monthly", screenName: "BuildingInspectionsMonthly" as any },// Cast to any if not in AppStackParamList yet
  { id: "5", title: "Health & Safety – Daily TBM", screenName: "HealthSafetyDailyTBM" as any },// Cast to any if not in AppStackParamList yet
  // { id: "6", title: "Safety Site Inspection – FSM+Safety", screenName: "SafetySiteInspection" as any },// Cast to any if not in AppStackParamList yet
  // { id: "7", title: "FSM Periodic Inspection", screenName: "FSMPeriodicInspection" as any },// Cast to any if not in AppStackParamList yet
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

type HomeScreenNavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const renderItem = ({ item }: { item: AppListItem }) => (
    <Item
      title={item.title}
      onPress={() => {
        // The type of item.screenName is now correctly constrained by AppListItem
        navigation.navigate(item.screenName);
      }}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Checklist Forms</Text>
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
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 18,
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