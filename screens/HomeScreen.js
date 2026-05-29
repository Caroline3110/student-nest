import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Colors from '../constants/Colors';

export default function HomeScreen({ navigation }) {

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
      icon: 'H',
      screen: 'StudentLiving',
      description: 'Find your perfect home',
    },
    {
      id: 2,
      name: 'Budget Tracker',
      icon: 'B',
      screen: 'BudgetTracker',
      description: 'Manage your finances',
    },
    {
      id: 3,
      name: 'Study Planner',
      icon: 'S',
      screen: 'Calendar',
      description: 'Organise your academic work',
    },
    {
      id: 4,
      name: 'Tutor Finder',
      icon: 'T',
      screen: 'TutorFinder',
      description: 'Get academic support',
    },
    {
      id: 5,
      name: 'Roommate Finder',
      icon: 'R',
      screen: 'RoommateFinder',
      description: 'Find compatible flatmates',
    },
    {
      id: 6,
      name: 'Housekeeper',
      icon: 'K',
      screen: 'HousekeeperFinder',
      description: 'Book cleaning services',
    },
    {
      id: 7,
      name: 'Bus & Tube',
      icon: 'T',
      screen: 'Transport',
      description: 'Get around London',
    },
    {
      id: 8,
      name: 'Discounts',
      icon: 'D',
      screen: 'Discounts',
      description: 'Save money as a student',
    },
  ];

  const handleFeaturePress = (feature) => {
    if (feature.screen === 'StudentLiving') {
      navigation.navigate('StudentLiving');
      return;
    }
    if (feature.screen === 'BudgetTracker') {
      navigation.navigate('BudgetTracker');
      return;
    }
    if (feature.screen === 'Calendar') {
      navigation.navigate('StudyDashboard');
      return;
    }
    if (feature.screen === 'TutorFinder') {
      navigation.navigate('TutorFinder');
      return;
    }
    Alert.alert(feature.name, 'This feature is coming soon.', [{ text: 'OK' }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Good to see you</Text>
          <Text style={styles.headerTitle}>Student Nest</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionLabel}>Features</Text>

        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={styles.featureCard}
            onPress={() => handleFeaturePress(feature)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>{feature.icon}</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureName}>{feature.name}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: 8,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerLeft: {},
  greeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  featureText: {
    flex: 1,
  },
  featureName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  arrow: {
    fontSize: 22,
    color: Colors.textLight,
    marginLeft: 8,
  },
});
