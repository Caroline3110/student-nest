import React, { useState } from 'react';
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
import { accommodationProviders, priceFilters } from '../../data/housingData';

export default function AccommodationScreen({ navigation }) {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);

  // Filter providers based on selected price filter
  const filteredProviders = selectedFilter
    ? accommodationProviders.filter(
        p => p.priceMin >= selectedFilter.min && p.priceMin <= selectedFilter.max
      )
    : accommodationProviders;

  const handleProviderPress = (provider) => {
  navigation.navigate('ProviderDetail', { provider });
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
        <Text style={styles.headerTitle}>Student Accommodation</Text>
        <Text style={styles.headerSubtitle}>
          {filteredProviders.length} providers available
        </Text>
      </View>

      {/* Price Filter */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {/* All button */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              !selectedFilter && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(null)}
          >
            <Text style={[
              styles.filterChipText,
              !selectedFilter && styles.filterChipTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>

          {/* Price filter buttons */}
          {priceFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter?.id === filter.id && styles.filterChipActive
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter?.id === filter.id && styles.filterChipTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Provider List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {filteredProviders.map((provider) => (
          <TouchableOpacity
            key={provider.id}
            style={styles.providerCard}
            onPress={() => handleProviderPress(provider)}
            activeOpacity={0.8}
          >
            {/* Card Header */}
            <View style={[styles.cardHeader, { backgroundColor: provider.color }]}>
              <Text style={styles.providerEmoji}>{provider.emoji}</Text>
              <View style={styles.cardHeaderText}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <Text style={styles.providerPrice}>{provider.priceRange}</Text>
              </View>
              {provider.billsIncluded && (
                <View style={styles.billsBadge}>
                  <Text style={styles.billsBadgeText}>Bills Inc.</Text>
                </View>
              )}
            </View>

            {/* Card Body */}
            <View style={styles.cardBody}>
              {/* Rating */}
              <View style={styles.ratingRow}>
                <Text style={styles.ratingStars}>
                  {'⭐'.repeat(Math.floor(provider.rating))}
                </Text>
                <Text style={styles.ratingText}>
                  {provider.rating} ({provider.totalReviews} reviews)
                </Text>
              </View>

              {/* Description */}
              <Text style={styles.providerDescription} numberOfLines={2}>
                {provider.description}
              </Text>

              {/* Locations */}
              <View style={styles.locationsRow}>
                <Text style={styles.locationsLabel}>📍 </Text>
                <Text style={styles.locationsText} numberOfLines={1}>
                  {provider.locations.join(' • ')}
                </Text>
              </View>

              {/* Amenities */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.amenitiesRow}
              >
                {provider.amenities.slice(0, 4).map((amenity, index) => (
                  <View key={index} style={styles.amenityTag}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <Text style={styles.nearbyText}>
                🎓 Near: {provider.nearbyUniversities.join(', ')}
              </Text>
              <Text style={styles.viewMore}>View More ›</Text>
            </View>
          </TouchableOpacity>
        ))}

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
  filterSection: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundDark,
  },
  filterContainer: {
    paddingHorizontal: 15,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.backgroundDark,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  providerCard: {
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
  providerEmoji: {
    fontSize: 36,
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  providerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 2,
  },
  providerPrice: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  billsBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  billsBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 15,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingStars: {
    fontSize: 12,
    marginRight: 6,
  },
  ratingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  providerDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  locationsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationsLabel: {
    fontSize: 14,
  },
  locationsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  amenitiesRow: {
    marginTop: 5,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.backgroundDark,
  },
  nearbyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  viewMore: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});