import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,

} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import Colors from '../../constants/Colors';

export default function StudentLivingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Living 🏠</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Find Your Perfect Home</Text>
        <Text style={styles.subtitle}>Choose how you want to search:</Text>

        {/* Student Accommodation Button */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('Accommodation')}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🏢</Text>
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Student Accommodation</Text>
            <Text style={styles.optionDescription}>
              Browse popular student housing providers like Scape, IQ, Chapter, and more
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Student Apartments Button */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('Apartments')}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔍</Text>
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Student Apartments</Text>
            <Text style={styles.optionDescription}>
              Search for apartments by price range, location, and number of bedrooms
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 30,
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 32,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  arrow: {
    fontSize: 32,
    color: Colors.textLight,
    marginLeft: 10,
  },
});