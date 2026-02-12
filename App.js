import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Import screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import StudentLivingScreen from './screens/housing/StudentLivingScreen';
import AccommodationScreen from './screens/housing/AccommodationScreen';
import ApartmentsScreen from './screens/housing/ApartmentsScreen';
import SplashScreen from './screens/SplashScreen';
import ProviderDetailScreen from './screens/housing/ProviderDetailScreen';
import ApartmentResultsScreen from './screens/housing/ApartmentResultsScreen';
const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true); 

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

  if (loading) {
    return null;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
  {user ? (
    <>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="StudentLiving" component={StudentLivingScreen} />
      <Stack.Screen name="Accommodation" component={AccommodationScreen} />
      <Stack.Screen name="Apartments" component={ApartmentsScreen} />
      <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
      <Stack.Screen name="ApartmentResults" component={ApartmentResultsScreen} />
    </>
  ) : (
    <>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </>
  )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}