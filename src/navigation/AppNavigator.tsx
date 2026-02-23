// filepath: /Users/davidonquit/Library/Mobile Documents/com~apple~CloudDocs/Year2025/developingforAppStore/internalaudit/src/navigation/AppNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import AuditCategoriesScreen from "../features/auditPropertyChecklist/screens/AuditCategoriesScreen";
import AuditChecklistMainScreen from "../features/auditPropertyChecklist/screens/AuditChecklistMainScreen";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Text, TouchableOpacity } from "react-native";
import DailyTBMScreen from "../features/tbm/screens/DailyTBMScreen";
import PropertyInspectionScreen from "../features/propertyInspection/screens/PropertyInspectionScreen";
import FSMPeriodicInspectionScreen from "../features/fsminspection/FSMPeriodicInspectionScreen";

import MonthlyFEInspectionScreen from "../features/fsminspection/Monthly_FE_Inspection";

// Define a type for our App Stack parameters
export type AppStackParamList = {
  AppHome: undefined;
  AuditCategories: undefined;
  AuditChecklistMain: { categoryId: string; categoryName: string };
  // Definitions for placeholder screens
  BuildingInspectionsDaily: undefined;
  MonthlyFEInspection: undefined;
  BuildingInspectionsMonthly: undefined; // Keeping for compatibility if needed, but route will point to new screen
  HealthSafetyDailyTBM: undefined;
  SafetySiteInspection: undefined;
  FSMPeriodicInspection: undefined;
};

const AppStack = createNativeStackNavigator<AppStackParamList>();

// A simple placeholder screen component
const PlaceholderScreen = (
  { route }: { route: { name: string } } // Added type for route prop
) => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Screen: {route.name}</Text>
    <Text>This screen is not yet implemented.</Text>
  </View>
);

const AppNavigator = () => {
  return (
    <AppStack.Navigator>
      <AppStack.Screen
        name="AppHome"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: "", // Keep title empty or remove if headerTitle is used
          headerLeft: () => null, // Remove the left icon or set to null if you want default back arrow behavior on other screens to be consistent
          headerTitleAlign: "center", // Ensure title alignment is center
          headerTitle: () => (
            // <<< USE headerTitle TO CENTER THE ICON
            <Ionicons
              name="home-outline"
              size={28}
              color="#020202"
              // No specific style needed here unless you want to adjust its position within the title container
            />
          ),
        })}
      />
      <AppStack.Screen
        name="AuditCategories"
        component={AuditCategoriesScreen}
        options={{
          title: "",
          headerRight: () => (
            <Ionicons
              name="list-outline"
              size={28}
              color="#020202"
              style={{ marginRight: 15 }}
            />
          ),
          headerBackTitle: "",
        }}
      />
      <AppStack.Screen
        name="AuditChecklistMain"
        component={AuditChecklistMainScreen}
        options={({ route }) => ({
          title: route.params?.categoryName || "Checklist",
          headerBackTitle: "",
        })}
      />
      {/* Placeholder screens for the other items from APP_LIST_DATA */}
      <AppStack.Screen
        name="BuildingInspectionsDaily"
        component={PropertyInspectionScreen}
        options={{ title: "Property Inspection" }}
      />
      <AppStack.Screen
        name="BuildingInspectionsWeekly"
        component={PlaceholderScreen}
        options={{ title: "Building Inspections Weekly" }}
      />
      <AppStack.Screen
        name="BuildingInspectionsMonthly"
        component={MonthlyFEInspectionScreen}
        options={{ title: "Monthly Fire Extinguisher Inspection" }}
      />
      <AppStack.Screen
        name="HealthSafetyDailyTBM"
        component={DailyTBMScreen}
        options={{ title: "Health & Safety TBM" }}
      />
      <AppStack.Screen
        name="SafetySiteInspection"
        component={PlaceholderScreen}
        options={{ title: "Safety Site Inspection" }}
      />
      {/* MODIFIED: Point to the new screen */}
      <AppStack.Screen
        name="FSMPeriodicInspection"
        component={FSMPeriodicInspectionScreen}
        options={{ title: "FSM Periodic Inspection" }}
      />
    </AppStack.Navigator>
  );
};

export default AppNavigator;
