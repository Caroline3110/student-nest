import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { accommodationProviders, priceFilters } from '../../data/housingData';

export default function AccommodationScreen({ navigation }) {
  const [selectedFilter, setSelectedFilter] = useState(null);

  const filteredProviders = selectedFilter
    ? accommodationProviders.filter(p => p.priceMin >= selectedFilter.min && p.priceMin <= selectedFilter.max)
    : accommodationProviders;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accommodation</Text>
        <Text style={styles.headerSubtitle}>{filteredProviders.length} providers available</Text>
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.chip, !selectedFilter && styles.chipActive]}
            onPress={() => setSelectedFilter(null)}
          >
            <Text style={[styles.chipText, !selectedFilter && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>
          {priceFilters.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.chip, selectedFilter?.id === f.id && styles.chipActive]}
              onPress={() => setSelectedFilter(f)}
            >
              <Text style={[styles.chipText, selectedFilter?.id === f.id && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {filteredProviders.map(provider => (
            <TouchableOpacity
              key={provider.id}
              style={styles.card}
              onPress={() => navigation.navigate('ProviderDetail', { provider })}
              activeOpacity={0.7}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <Text style={styles.cardEmoji}>{provider.emoji}</Text>
                </View>
                <View style={styles.cardTopText}>
                  <Text style={styles.cardName}>{provider.name}</Text>
                  <Text style={styles.cardPrice}>{provider.priceRange}</Text>
                </View>
                {provider.billsIncluded && (
                  <View style={styles.billsBadge}>
                    <Text style={styles.billsBadgeText}>Bills incl.</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardBody}>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingStars}>{'★'.repeat(Math.floor(provider.rating))}</Text>
                  <Text style={styles.ratingText}>{provider.rating} · {provider.totalReviews} reviews</Text>
                </View>
                <Text style={styles.desc} numberOfLines={2}>{provider.description}</Text>
                <View style={styles.tags}>
                  {provider.amenities.slice(0, 4).map((a, i) => (
                    <View key={i} style={styles.tag}><Text style={styles.tagText}>{a}</Text></View>
                  ))}
                </View>
              </View>

              <View style={styles.cardFoot}>
                <Text style={styles.uniText} numberOfLines={1}>
                  {provider.nearbyUniversities.join(' · ')}
                </Text>
                <Text style={styles.viewLink}>View →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: { marginBottom: 12 },
  backButtonText: { fontSize: 14, color: Colors.textLight, fontWeight: '500' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.4, marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: Colors.textLight },
  filterBar: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 7 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },
  scroll: { flex: 1 },
  list: { padding: 16, gap: 10 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  cardIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  cardEmoji: { fontSize: 17 },
  cardTopText: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 1 },
  cardPrice: { fontSize: 12, color: Colors.textLight },
  billsBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  billsBadgeText: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary },
  cardBody: { padding: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 },
  ratingStars: { fontSize: 11, color: Colors.textPrimary, letterSpacing: 1 },
  ratingText: { fontSize: 12, color: Colors.textLight },
  desc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginBottom: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tag: { backgroundColor: Colors.background, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, color: Colors.textSecondary },
  cardFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  uniText: { fontSize: 11, color: Colors.textMuted, flex: 1 },
  viewLink: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, marginLeft: 10 },
});