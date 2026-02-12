import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

export default function ProviderDetailScreen({ navigation, route }) {
  const { provider } = route.params;
  const [savedFavourite, setSavedFavourite] = useState(false);

  const handleVisitWebsite = () => {
    Linking.openURL(provider.website).catch(() => {
      Alert.alert('Error', 'Could not open website');
    });
  };

  const handleSaveFavourite = () => {
    setSavedFavourite(!savedFavourite);
    Alert.alert(
      savedFavourite ? 'Removed!' : 'Saved! ⭐',
      savedFavourite 
        ? `${provider.name} removed from favourites`
        : `${provider.name} saved to your favourites!`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: provider.color }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.providerEmoji}>{provider.emoji}</Text>
          <View style={styles.headerText}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerPrice}>{provider.priceRange}</Text>
          </View>
          <TouchableOpacity
            style={styles.favouriteButton}
            onPress={handleSaveFavourite}
          >
            <Text style={styles.favouriteIcon}>
              {savedFavourite ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Text style={styles.ratingStars}>
            {'⭐'.repeat(Math.floor(provider.rating))}
          </Text>
          <Text style={styles.ratingText}>
            {provider.rating}/5 ({provider.totalReviews} reviews)
          </Text>
          {provider.billsIncluded && (
            <View style={styles.billsBadge}>
              <Text style={styles.billsBadgeText}>✅ Bills Included</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{provider.description}</Text>
        </View>

        {/* Room Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Room Types</Text>
          <View style={styles.tagsContainer}>
            {provider.roomTypes.map((room, index) => (
              <View 
                key={index} 
                style={[styles.tag, { backgroundColor: provider.color + '20' }]}
              >
                <Text style={[styles.tagText, { color: provider.color }]}>
                  🛏️ {room}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {provider.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Text style={styles.amenityIcon}>✓</Text>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Locations</Text>
          {provider.locations.map((location, index) => (
            <View key={index} style={styles.locationItem}>
              <View style={[styles.locationDot, { backgroundColor: provider.color }]} />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          ))}
        </View>

        {/* Nearby Universities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎓 Nearby Universities</Text>
          <View style={styles.tagsContainer}>
            {provider.nearbyUniversities.map((uni, index) => (
              <View key={index} style={styles.uniTag}>
                <Text style={styles.uniTagText}>{uni}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tiers (if Chapter) */}
        {provider.tiers && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Available Tiers</Text>
            <View style={styles.tiersContainer}>
              {provider.tiers.map((tier, index) => (
                <View 
                  key={index} 
                  style={[styles.tierCard, { borderColor: provider.color }]}
                >
                  <Text style={[styles.tierName, { color: provider.color }]}>
                    {tier}
                  </Text>
                  <Text style={styles.tierDesc}>Tap to explore</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: provider.color }]}
            onPress={handleVisitWebsite}
          >
            <Text style={styles.primaryButtonText}>🌐 Visit Website</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSaveFavourite}
          >
            <Text style={styles.secondaryButtonText}>
              {savedFavourite ? '⭐ Saved!' : '☆ Save to Favourites'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
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
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerEmoji: {
    fontSize: 50,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  providerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  providerPrice: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  favouriteButton: {
    padding: 8,
  },
  favouriteIcon: {
    fontSize: 30,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingStars: {
    fontSize: 14,
  },
  ratingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginRight: 10,
  },
  billsBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  billsBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    margin: 15,
    marginBottom: 0,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    marginBottom: 5,
  },
  amenityIcon: {
    fontSize: 16,
    color: Colors.success,
    marginRight: 8,
    fontWeight: 'bold',
  },
  amenityText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundDark,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  locationText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  uniTag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.backgroundDark,
  },
  uniTagText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  tiersContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  tierCard: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  tierName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tierDesc: {
    fontSize: 12,
    color: Colors.textLight,
  },
  actionButtons: {
    padding: 15,
    gap: 10,
  },
  primaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.backgroundDark,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});