// filepath: /Users/davidonquit/Library/Mobile Documents/com~apple~CloudDocs/Year2025/developingforAppStore/internalaudit/src/navigation/AppNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import AuditCategoriesScreen from "../features/auditPropertyChecklist/screens/AuditCategoriesScreen"; // <<< 1. IMPORT AuditCategoriesScreen
import AuditChecklistMainScreen from "../features/auditPropertyChecklist/screens/AuditChecklistMainScreen";

// Define a type for our App Stack parameters
export type AppStackParamList = {
  AppHome: undefined;
  // This route will now lead to the list of audit categories
  AuditCategories: undefined; // <<< 2. ADD/RENAME route for categories
  // This route is for the detailed checklist, now expecting parameters
  AuditChecklistMain: { categoryId: string; categoryName: string }; // <<< 3. MODIFY for params
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
      {/* 
        This is the screen your HomeScreen should navigate to when the user wants to start an audit.
        Previously, you might have had a route like "AuditPropertyChecklist" going directly to AuditChecklistMainScreen.
        Now, that initial navigation from HomeScreen should go to "AuditCategories".
      */}
      <AppStack.Screen
        name="AuditCategories" // <<< 4. USE AuditCategoriesScreen here
        component={AuditCategoriesScreen}
        options={{ title: "Audit Categories" }}
      />
      {/* 
        AuditCategoriesScreen will navigate to this screen, passing categoryId and categoryName.
      */}
      <AppStack.Screen
        name="AuditChecklistMain"
        component={AuditChecklistMainScreen}
        // You can make the title dynamic based on the categoryName passed in route params
        options={({ route }) => ({ title: route.params?.categoryName || "Checklist" })}
      />
    </AppStack.Navigator>
  );
};

export default AppNavigator;
