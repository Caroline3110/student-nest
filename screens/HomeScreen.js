import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
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
      icon: '🏠', 
      screen: 'StudentLiving',
      color: '#4A90E2',
      description: 'Find your perfect home'
    },
    { 
      id: 2, 
      name: 'Budget Tracker', 
      icon: '💰', 
      screen: 'BudgetTracker',
      color: '#50C878',
      description: 'Manage your money'
    },
    { 
      id: 3, 
      name: 'Tutor Finder', 
      icon: '📚', 
      screen: 'TutorFinder',
      color: '#9B59B6',
      description: 'Get academic help'
    },
    { 
      id: 4, 
      name: 'Roommate Finder', 
      icon: '👥', 
      screen: 'RoommateFinder',
      color: '#E67E22',
      description: 'Find your perfect match'
    },
    { 
      id: 5, 
      name: 'Housekeeper', 
      icon: '🧹', 
      screen: 'HousekeeperFinder',
      color: '#E74C3C',
      description: 'Keep your space clean'
    },
    { 
      id: 6, 
      name: 'Calendar', 
      icon: '📅', 
      screen: 'Calendar',
      color: '#1ABC9C',
      description: 'Plan your studies'
    },
    { 
      id: 7, 
      name: 'Bus & Tube', 
      icon: '🚌', 
      screen: 'Transport',
      color: '#E74C3C',
      description: 'Get around London'
    },
    { 
      id: 8, 
      name: 'Discounts', 
      icon: '🎫', 
      screen: 'Discounts',
      color: '#F39C12',
      description: 'Save money as a student'
    },
  ];

  const handleFeaturePress = (feature) => {
    if (feature.screen === 'StudentLiving') {
      navigation.navigate('StudentLiving');
      return;
    }
    Alert.alert(
      feature.name,
      'This feature is coming soon! 🚀',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back! 👋</Text>
          <Text style={styles.headerTitle}>Student Nest</Text>
          <Text style={styles.headerSubtitle}>What do you need today?</Text>
        </View>
        <TouchableOpacity 
          onPress={handleLogout} 
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Features</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>50+</Text>
          <Text style={styles.statLabel}>Listings</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>🇬🇧</Text>
          <Text style={styles.statLabel}>London</Text>
        </View>
      </View>

      {/* Features Grid */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      >
        <Text style={styles.sectionTitle}>All Features</Text>
        
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={styles.featureCard}
            onPress={() => handleFeaturePress(feature)}
            activeOpacity={0.8}
          >
            {/* Left colored bar */}
            <View style={[styles.colorBar, { backgroundColor: feature.color }]} />
            
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: feature.color + '20' }]}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
            </View>

            {/* Text */}
            <View style={styles.featureText}>
              <Text style={styles.featureName}>{feature.name}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>

            {/* Arrow */}
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Bottom padding */}
        <View style={{ height: 20 }} />
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
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 5,
  },
  logoutText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statsBar: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundDark,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.backgroundDark,
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
    marginLeft: 5,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  colorBar: {
    width: 5,
    height: '100%',
  },
  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 12,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureText: {
    flex: 1,
    paddingVertical: 15,
  },
  featureName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  arrow: {
    fontSize: 28,
    color: Colors.textLight,
    paddingRight: 15,
  },
});