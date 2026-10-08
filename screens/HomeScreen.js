import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Colors from '../constants/Colors';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

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
      desc: 'Find your perfect home',
    },
    {
      id: 2,
      name: 'Budget Tracker',
      emoji: '💰',
      screen: 'BudgetTracker',
      desc: 'Manage your finances',
    },
    {
      id: 3,
      name: 'Study Planner',
      emoji: '📚',
      screen: 'Calendar',
      desc: 'Organise your work',
    },
    {
      id: 4,
      name: 'Tutor Finder',
      emoji: '🎓',
      screen: 'TutorFinder',
      desc: 'Get academic support',
    },
    {
      id: 5,
      name: 'Roommates',
      emoji: '🤝',
      screen: 'RoommateFinder',
      desc: 'Find flatmates',
    },
    {
      id: 6,
      name: 'Housekeeper',
      emoji: '✨',
      screen: 'Housekeeper',
      desc: 'Book cleaning',
    },
    {
      id: 7,
      name: 'Part-time Jobs',
      emoji: '💼',
      screen: 'PartTimeJobs',
      desc: 'Student-friendly work',
    },
    {
      id: 8,
      name: 'MindNest',
      emoji: '🌿',
      screen: 'Wellbeing',
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
              style={styles.card}
              onPress={() => handleFeaturePress(feature)}
              activeOpacity={0.75}
            >
              <View style={styles.emojiWrap}>
                <Text style={styles.emoji}>{feature.emoji}</Text>
              </View>
              <Text style={styles.cardName}>{feature.name}</Text>
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  logoutText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 22,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 16,
  },
});
