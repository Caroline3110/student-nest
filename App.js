import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import * as Notifications from 'expo-notifications';
import { LanguageProvider, useLanguage } from './i18n';
import { ProfileProvider, useProfile } from './hooks/useProfile';
// Import screens
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import StudentLivingScreen from './screens/housing/StudentLivingScreen';
import AccommodationScreen from './screens/housing/AccommodationScreen';
import ApartmentsScreen from './screens/housing/ApartmentsScreen';
import SplashScreen from './screens/SplashScreen';
import ProviderDetailScreen from './screens/housing/ProviderDetailScreen';
import ApartmentResultsScreen from './screens/housing/ApartmentResultsScreen';
import BudgetBuddyScreen from './screens/budget/BudgetBuddyScreen';
import StudyDashboardScreen from './screens/study/StudyDashboardScreen';
import PomodoroScreen from './screens/study/PomodoroScreen';
import TodoScreen from './screens/study/TodoScreen';
import ExamsScreen from './screens/study/ExamsScreen';
import TimetableScreen from './screens/study/TimetableScreen';
import TutorFinderScreen from './screens/TutorFinderScreen';
import RoommateFinderScreen from './screens/RoommateFinderScreen';
import HousekeeperScreen from './screens/HousekeeperScreen';
import PartTimeJobsScreen from './screens/PartTimeJobsScreen';
import MindNestScreen from './screens/MindNestScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import SettingsScreen from './screens/SettingsScreen';
import EditProfileScreen from './screens/EditProfileScreen';

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
  useEffect(() => {
  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    } catch (e) {
      // Not supported on web.
      console.log('Notifications unavailable:', e.message);
    }
  };

  requestPermissions();
}, []);

  return (
    <LanguageProvider>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : loading ? null : (
        <ProfileProvider uid={user?.uid}>
          <NavigationContainer>
            <AppStack signedIn={!!user} />
          </NavigationContainer>
        </ProfileProvider>
      )}
    </LanguageProvider>
  );
}

function AppStack({ signedIn }) {
  const profile = useProfile();
  const { lang, setLang } = useLanguage();

  // Use the language saved on the profile when signing in on a new device.
  useEffect(() => {
    if (profile?.language && profile.language !== lang) setLang(profile.language);
  }, [profile?.language]);

  // Wait for the profile so new users don't see Home flash before setup.
  if (signedIn && profile === undefined) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!signedIn ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ animation: 'slide_from_right' }} />
        </>
      ) : !profile?.profileComplete ? (
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="StudentLiving" component={StudentLivingScreen} />
          <Stack.Screen name="Accommodation" component={AccommodationScreen} />
          <Stack.Screen name="Apartments" component={ApartmentsScreen} />
          <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
          <Stack.Screen name="ApartmentResults" component={ApartmentResultsScreen} />
          <Stack.Screen name="BudgetTracker" component={BudgetBuddyScreen} />
          <Stack.Screen name="StudyDashboard" component={StudyDashboardScreen} />
          <Stack.Screen name="Pomodoro" component={PomodoroScreen} />
          <Stack.Screen name="Todo" component={TodoScreen} />
          <Stack.Screen name="Exams" component={ExamsScreen} />
          <Stack.Screen name="Timetable" component={TimetableScreen} />
          <Stack.Screen name="TutorFinder" component={TutorFinderScreen} />
          <Stack.Screen name="RoommateFinder" component={RoommateFinderScreen} />
          <Stack.Screen name="Housekeeper" component={HousekeeperScreen} />
          <Stack.Screen name="PartTimeJobs" component={PartTimeJobsScreen} />
          <Stack.Screen name="Wellbeing" component={MindNestScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
