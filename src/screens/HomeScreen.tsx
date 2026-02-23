import React from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

// Define a more specific type for items in APP_LIST_DATA
interface AppListItem {
  id: string;
  title: string;
  iconLib: 'MaterialCommunityIcons' | 'Ionicons';
  iconName: string;
  iconColor: string;
  screenName: Exclude<keyof AppStackParamList, "AuditChecklistMain">;
}

const APP_LIST_DATA: AppListItem[] = [
  { 
    id: "1", 
    title: "Health & Safety – Daily TBM", 
    screenName: "HealthSafetyDailyTBM" as any,
    iconLib: "MaterialCommunityIcons",
    iconName: "hard-hat",
    iconColor: "#F5A623" // Safety Orange
  },
  { 
    id: "2", 
    title: "FSM Periodic Inspection", 
    screenName: "FSMPeriodicInspection" as any,
    iconLib: "MaterialCommunityIcons",
    iconName: "fire-alert", // Fire safety related
    iconColor: "#FF3B30" // Fire Red
  },
  { 
    id: "3", 
    title: "Monthly Fire Extinguisher Inspection", 
    screenName: "BuildingInspectionsMonthly" as any,
    iconLib: "MaterialCommunityIcons",
    iconName: "fire-extinguisher",
    iconColor: "#FF3B30" // Fire Red
  },
  { 
    id: "4", 
    title: "Audit with Property Checklist", 
    screenName: "AuditCategories",
    iconLib: "Ionicons",
    iconName: "list-circle",
    iconColor: "#4A90E2"
  },
  { 
    id: "5", 
    title: "Property Inspection", 
    screenName: "BuildingInspectionsDaily" as any,
    iconLib: "Ionicons",
    iconName: "camera",
    iconColor: "#4A90E2"
  }, 
  { 
    id: "6", 
    title: "Building Inspections - Weekly", 
    screenName: "BuildingInspectionsWeekly" as any,
    iconLib: "Ionicons",
    iconName: "calendar",
    iconColor: "#4A90E2"
  },
  { 
    id: "7", 
    title: "Safety Site Inspection – FSM+Safety", 
    screenName: "SafetySiteInspection" as any,
    iconLib: "MaterialCommunityIcons",
    iconName: "shield-check",
    iconColor: "#4A90E2"
  },
];

interface ItemProps {
  item: AppListItem;
  onPress: () => void;
}

const Item = ({ item, onPress }: ItemProps) => (
  <TouchableOpacity onPress={onPress} style={styles.item}>
    <View style={styles.itemContent}>
      {item.iconLib === 'MaterialCommunityIcons' ? (
        <MaterialCommunityIcons name={item.iconName as any} size={60} color={item.iconColor} style={styles.icon} />
      ) : (
        <Ionicons name={item.iconName as any} size={60} color={item.iconColor} style={styles.icon} />
      )}
      <Text style={styles.title}>{item.title}</Text>
    </View>
  </TouchableOpacity>
);

type HomeScreenNavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const renderItem = ({ item }: { item: AppListItem }) => (
    <Item
      item={item}
      onPress={() => {
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
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
    color: '#333',
    lineHeight: 24,
  },
});
