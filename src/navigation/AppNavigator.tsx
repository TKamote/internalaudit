// filepath: /Users/davidonquit/Library/Mobile Documents/com~apple~CloudDocs/Year2025/developingforAppStore/internalaudit/src/navigation/AppNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import AuditChecklistMainScreen from "../features/auditPropertyChecklist/screens/AuditChecklistMainScreen"; // Import the new screen

// Define a type for our App Stack parameters
export type AppStackParamList = {
  AppHome: undefined; // No params expected for HomeScreen
  AuditPropertyChecklist: undefined; // No params expected for this screen yet
  // Add other feature screen names here as you create them
  // e.g., BuildingInspectionsDaily: undefined;
};

const AppStack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <AppStack.Navigator>
      <AppStack.Screen
        name="AppHome"
        component={HomeScreen}
        options={{ title: "Dashboard" }}
      />
      <AppStack.Screen
        name="AuditPropertyChecklist" // This name must match screenName in HomeScreen's APP_LIST_DATA
        component={AuditChecklistMainScreen}
        options={{ title: "Audit Checklist" }} // Set a title for the header
      />
      {/*
      Screens for your other "apps" (features) will be added here later
      */}
    </AppStack.Navigator>
  );
};

export default AppNavigator;
