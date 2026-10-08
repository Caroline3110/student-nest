import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  // Home has a dark header, so use light status bar text only while it's
  // focused and restore dark text for the light-headed screens.
  useFocusEffect(useCallback(() => {
    StatusBar.setBarStyle('light-content');
    return () => StatusBar.setBarStyle('dark-content');
  }, []));

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const features = [
    {
      id: 1,
      name: 'Student Living',
      emoji: '🏠',
      screen: 'StudentLiving',
      color: '#F97316',
      bg: '#FFF7ED',
      desc: 'Find your perfect home',
    },
    {
      id: 2,
      name: 'Budget Tracker',
      emoji: '💰',
      screen: 'BudgetTracker',
      color: '#10B981',
      bg: '#ECFDF5',
      desc: 'Manage your finances',
    },
    {
      id: 3,
      name: 'Study Planner',
      emoji: '📚',
      screen: 'Calendar',
      color: '#6366F1',
      bg: '#EEF2FF',
      desc: 'Organise your work',
    },
    {
      id: 4,
      name: 'Tutor Finder',
      emoji: '🎓',
      screen: 'TutorFinder',
      color: '#D97706',
      bg: '#FFFBEB',
      desc: 'Get academic support',
    },
    {
      id: 5,
      name: 'Roommates',
      emoji: '🤝',
      screen: 'RoommateFinder',
      color: '#EC4899',
      bg: '#FDF2F8',
      desc: 'Find flatmates',
    },
    {
      id: 6,
      name: 'Housekeeper',
      emoji: '✨',
      screen: 'Housekeeper',
      color: '#0EA5E9',
      bg: '#F0F9FF',
      desc: 'Book cleaning',
    },
    {
      id: 7,
      name: 'Part-time Jobs',
      emoji: '💼',
      screen: 'PartTimeJobs',
      color: '#8B5CF6',
      bg: '#F5F3FF',
      desc: 'Student-friendly work',
    },
    {
      id: 8,
      name: 'MindNest',
      emoji: '🌿',
      screen: 'Wellbeing',
      color: '#14B8A6',
      bg: '#F0FDFA',
      desc: 'Wellbeing & support',
    },
  ];

  const handleFeaturePress = (feature) => {
    const routes = {
      StudentLiving: 'StudentLiving',
      BudgetTracker: 'BudgetTracker',
      Calendar: 'StudyDashboard',
      TutorFinder: 'TutorFinder',
      RoommateFinder: 'RoommateFinder',
      Housekeeper: 'Housekeeper',
      PartTimeJobs: 'PartTimeJobs',
      Wellbeing: 'Wellbeing',
    };
    const route = routes[feature.screen];
    if (route) {
      navigation.navigate(route);
    } else {
      Alert.alert(feature.name, 'This feature is coming soon.', [{ text: 'OK' }]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.headerTitle}>Student Nest</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
      >
        <Text style={styles.sectionLabel}>Your features</Text>

        <View style={styles.grid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[styles.card, { backgroundColor: feature.bg }]}
              onPress={() => handleFeaturePress(feature)}
              activeOpacity={0.75}
            >
              <View style={[styles.emojiWrap, { backgroundColor: feature.color + '20' }]}>
                <Text style={styles.emoji}>{feature.emoji}</Text>
              </View>
              <Text style={[styles.cardName, { color: feature.color }]}>{feature.name}</Text>
              <Text style={styles.cardDesc}>{feature.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  logoutText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8F7FF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47.5%',
    borderRadius: 20,
    padding: 16,
    minHeight: 150,
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 18,
  },
  cardDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});
