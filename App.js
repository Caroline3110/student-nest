import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import * as Notifications from 'expo-notifications';
import { LanguageProvider, useLanguage } from './i18n';
import { ProfileProvider, useProfile } from './hooks/useProfile';
// Import screens
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import ExploreScreen from './screens/ExploreScreen';
import MessagesScreen from './screens/MessagesScreen';
import SavedScreen from './screens/SavedScreen';
import ProfileScreen from './screens/ProfileScreen';
import AppTabBar from './components/AppTabBar';
import AccommodationScreen from './screens/housing/AccommodationScreen';
import SplashScreen from './screens/SplashScreen';
import ProviderDetailScreen from './screens/housing/ProviderDetailScreen';
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

// Without a handler a reminder that arrives while the app is open is
// delivered silently. shouldShowAlert was replaced by shouldShowBanner and
// shouldShowList, so the old field would now be ignored.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// The five sections along the bottom. Everything else is pushed on top of
// these by the stack below, so the bar stays put while you move around.
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={props => <AppTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

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
    const setUpNotifications = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Notification permissions not granted');
          return;
        }
        // Android only shows a scheduled notification if its channel exists.
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('reminders', {
            name: 'Reminders',
            // HIGH so an exam reminder appears on screen rather than
            // waiting silently in the shade.
            importance: Notifications.AndroidImportance.HIGH,
          });
        }
      } catch (e) {
        // Not supported on web.
        console.log('Notifications unavailable:', e.message);
      }
    };

    setUpNotifications();
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

// Firebase's own translations for the verification and password-reset emails.
const EMAIL_LANGUAGES = { en: 'en', zh: 'zh-CN' };

function AppStack({ signedIn }) {
  const profile = useProfile();
  const { lang, setLang } = useLanguage();

  // Every email Firebase sends follows the app's language.
  useEffect(() => {
    auth.languageCode = EMAIL_LANGUAGES[lang] || 'en';
  }, [lang]);

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
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ animation: 'slide_from_right' }} />
        </>
      ) : !profile?.profileComplete ? (
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Accommodation" component={AccommodationScreen} />
          <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
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
