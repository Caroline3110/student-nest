import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

export default function ApartmentsScreen({ navigation }) {
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState('1');

const handleSearch = () => {
  if (!location) {
    Alert.alert('Missing Information', 'Please enter a location (postcode)');
    return;
  }

  // Navigate to results screen with search params
  navigation.navigate('ApartmentResults', {
    searchParams: {
      location,
      bedrooms,
      priceMin,
      priceMax,
    }
  });
};

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
        <Text style={styles.headerTitle}>Student Apartments</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Search for student apartments by entering your preferences below
          </Text>
        </View>

        {/* Location Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Location (Postcode) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., SW1A 1AA"
            value={location}
            onChangeText={setLocation}
            autoCapitalize="characters"
          />
          <Text style={styles.hint}>Enter a London postcode</Text>
        </View>

        {/* Bedrooms Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Number of Bedrooms</Text>
          <View style={styles.bedroomButtons}>
            <TouchableOpacity
              style={[
                styles.bedroomButton,
                bedrooms === '1' && styles.bedroomButtonActive
              ]}
              onPress={() => setBedrooms('1')}
            >
              <Text style={[
                styles.bedroomButtonText,
                bedrooms === '1' && styles.bedroomButtonTextActive
              ]}>
                1 Bedroom
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.bedroomButton,
                bedrooms === '2' && styles.bedroomButtonActive
              ]}
              onPress={() => setBedrooms('2')}
            >
              <Text style={[
                styles.bedroomButtonText,
                bedrooms === '2' && styles.bedroomButtonTextActive
              ]}>
                2 Bedrooms
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Price Range (per week)</Text>
          <View style={styles.priceInputRow}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>£</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                value={priceMin}
                onChangeText={setPriceMin}
                keyboardType="number-pad"
              />
            </View>

            <Text style={styles.priceSeparator}>to</Text>

            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>£</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                value={priceMax}
                onChangeText={setPriceMax}
                keyboardType="number-pad"
              />
            </View>
          </View>
          <Text style={styles.hint}>Leave blank for no limit</Text>
        </View>

        {/* Search Button */}
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>🔍 Search Apartments</Text>
        </TouchableOpacity>

        {/* Popular Searches */}
        <View style={styles.popularSection}>
          <Text style={styles.popularTitle}>Popular Searches</Text>
          <TouchableOpacity 
            style={styles.popularChip}
            onPress={() => {
              setLocation('WC1E 6BT');
              setBedrooms('1');
              setPriceMin('150');
              setPriceMax('250');
            }}
          >
            <Text style={styles.popularChipText}>Near UCL - 1 bed - £150-250</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.popularChip}
            onPress={() => {
              setLocation('SE1 7EH');
              setBedrooms('2');
              setPriceMin('200');
              setPriceMax('300');
            }}
          >
            <Text style={styles.popularChipText}>Near King's College - 2 bed - £200-300</Text>
          </TouchableOpacity>
        </View>
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
  },
  infoBox: {
    backgroundColor: Colors.white,
    padding: 15,
    margin: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  inputSection: {
    backgroundColor: Colors.white,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.background,
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.backgroundDark,
  },
  hint: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 5,
  },
  bedroomButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  bedroomButton: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.backgroundDark,
  },
  bedroomButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bedroomButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  bedroomButtonTextActive: {
    color: Colors.white,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.backgroundDark,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginRight: 5,
  },
  priceInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  priceSeparator: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: Colors.primary,
    margin: 15,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  popularSection: {
    padding: 15,
    paddingTop: 5,
  },
  popularTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  popularChip: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.backgroundDark,
  },
  popularChipText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
});