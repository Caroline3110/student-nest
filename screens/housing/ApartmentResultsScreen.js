import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { apartmentListings } from '../../data/housingData';

export default function ApartmentResultsScreen({ navigation, route }) {
  const { searchParams } = route.params;
  const [results, setResults] = useState([]);
  const [sortBy, setSortBy] = useState('price');

  useEffect(() => {
    filterApartments();
  }, [sortBy]);

  const filterApartments = () => {
    let filtered = [...apartmentListings];

    // Filter by bedrooms
    if (searchParams.bedrooms) {
      filtered = filtered.filter(
        apt => apt.bedrooms === parseInt(searchParams.bedrooms)
      );
    }

    // Filter by min price
    if (searchParams.priceMin) {
      filtered = filtered.filter(
        apt => apt.price >= parseInt(searchParams.priceMin)
      );
    }

    // Filter by max price
    if (searchParams.priceMax) {
      filtered = filtered.filter(
        apt => apt.price <= parseInt(searchParams.priceMax)
      );
    }

    // Sort results
    if (sortBy === 'price') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'size') {
      filtered.sort((a, b) => parseInt(a.size) - parseInt(b.size));
    }

    setResults(filtered);
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
        <Text style={styles.headerTitle}>Search Results</Text>
        <Text style={styles.headerSubtitle}>
          {results.length} apartments found
        </Text>
      </View>

      {/* Search Summary */}
      <View style={styles.searchSummary}>
        <Text style={styles.searchSummaryText}>
          📍 {searchParams.location}  
          🛏️ {searchParams.bedrooms} bed  
          💰 £{searchParams.priceMin || '0'} - £{searchParams.priceMax || 'Any'}/week
        </Text>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'price' && styles.sortButtonActive
          ]}
          onPress={() => setSortBy('price')}
        >
          <Text style={[
            styles.sortButtonText,
            sortBy === 'price' && styles.sortButtonTextActive
          ]}>
            Price
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'size' && styles.sortButtonActive
          ]}
          onPress={() => setSortBy('size')}
        >
          <Text style={[
            styles.sortButtonText,
            sortBy === 'size' && styles.sortButtonTextActive
          ]}>
            Size
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {results.length === 0 ? (
          // No results found
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No apartments found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search filters
            </Text>
            <TouchableOpacity
              style={styles.backToSearchButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backToSearchText}>← Modify Search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          results.map((apartment) => (
            <TouchableOpacity
              key={apartment.id}
              style={styles.apartmentCard}
              onPress={() => Alert.alert(
                apartment.title,
                `${apartment.description}\n\n` +
                `📍 ${apartment.address}\n` +
                `💰 £${apartment.price}/week\n` +
                `📐 ${apartment.size}\n` +
                `🎓 Near: ${apartment.nearbyUnis.join(', ')}\n` +
                `📅 Available: ${apartment.available}`,
                [{ text: 'Close' }]
              )}
              activeOpacity={0.8}
            >
              {/* Card Header */}
              <View style={[
                styles.cardHeader,
                { backgroundColor: apartment.color }
              ]}>
                <Text style={styles.apartmentEmoji}>{apartment.emoji}</Text>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.apartmentTitle}>{apartment.title}</Text>
                  <Text style={styles.apartmentAddress}>
                    📍 {apartment.address}
                  </Text>
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>£{apartment.price}</Text>
                  <Text style={styles.priceSubtext}>/week</Text>
                </View>
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>🛏️</Text>
                    <Text style={styles.statText}>
                      {apartment.bedrooms} bed
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>🚿</Text>
                    <Text style={styles.statText}>
                      {apartment.bathrooms} bath
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>📐</Text>
                    <Text style={styles.statText}>{apartment.size}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>📅</Text>
                    <Text style={styles.statText}>{apartment.available}</Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.apartmentDescription} numberOfLines={2}>
                  {apartment.description}
                </Text>

                {/* Amenities */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.amenitiesRow}
                >
                  {apartment.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityTag}>
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </ScrollView>

                {/* Nearby Unis */}
                <Text style={styles.nearbyText}>
                  🎓 {apartment.nearbyUnis.join(' • ')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 20 }} />
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  searchSummary: {
    backgroundColor: Colors.white,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundDark,
  },
  searchSummaryText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundDark,
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 5,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.backgroundDark,
  },
  sortButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortButtonText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 25,
  },
  backToSearchButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backToSearchText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  apartmentCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  apartmentEmoji: {
    fontSize: 36,
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  apartmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 3,
  },
  apartmentAddress: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  priceTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  priceSubtext: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
  },
  cardBody: {
    padding: 15,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 16,
    marginBottom: 3,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.backgroundDark,
  },
  apartmentDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  amenitiesRow: {
    marginBottom: 10,
  },
  amenityTag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
  },
  amenityText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  nearbyText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});