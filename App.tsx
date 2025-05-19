import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
// import { AuthProvider } from './src/contexts/AuthContext'; // We'll add this later for authentication

export default function App() {
  return (
    // <AuthProvider> // Uncomment when AuthProvider is implemented
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    // </AuthProvider> // Uncomment when AuthProvider is implemented
  );
}