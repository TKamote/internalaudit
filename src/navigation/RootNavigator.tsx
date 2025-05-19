// filepath: /Users/davidonquit/Library/Mobile Documents/com~apple~CloudDocs/Year2025/developingforAppStore/internalaudit/src/navigation/RootNavigator.tsx
import React from "react";
// import { useAuth } from '../contexts/AuthContext'; // Placeholder for when you implement AuthContext
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";

const RootNavigator = () => {
  // const { isAuthenticated } = useAuth(); // This is how you'd use it with an AuthContext

  // For now, we'll use a simple flag.
  // Set to `true` to see the AppNavigator (main app screens).
  // Set to `false` to see the AuthNavigator (login screen).
  const isAuthenticated = true; // << CHANGE THIS TO true TO WORK ON THE MAIN APP PART

  if (isAuthenticated) {
    return <AppNavigator />;
  } else {
    return <AuthNavigator />;
  }
};

export default RootNavigator;
