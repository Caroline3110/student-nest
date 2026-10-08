import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

export default function ProviderDetailScreen({ navigation, route }) {
  const { provider } = route.params;
  const [saved, setSaved] = useState(false);

  const handleWebsite = () => {
    Linking.openURL(provider.website).catch(() => Alert.alert('Error', 'Could not open website'));
  };

  const toggleSave = () => {
    setSaved(!saved);
    Alert.alert(saved ? 'Removed' : 'Saved', saved ? `${provider.name} removed from favourites` : `${provider.name} saved to your favourites`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>{provider.emoji}</Text>
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroName}>{provider.name}</Text>
            <Text style={styles.heroPrice}>{provider.priceRange}</Text>
          </View>
          <TouchableOpacity style={styles.favBtn} onPress={toggleSave}>
            <Text style={styles.favIcon}>{saved ? '★' : '☆'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.stars}>{'★'.repeat(Math.floor(provider.rating))}</Text>
          <Text style={styles.ratingText}>{provider.rating}/5 · {provider.totalReviews} reviews</Text>
          {provider.billsIncluded && (
            <View style={styles.billsBadge}><Text style={styles.billsBadgeText}>Bills included</Text></View>
          )}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>{provider.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Room types</Text>
            <View style={styles.tagRow}>
              {provider.roomTypes.map((r, i) => (
                <View key={i} style={styles.roomTag}><Text style={styles.roomTagText}>{r}</Text></View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenityGrid}>
              {provider.amenities.map((a, i) => (
                <View key={i} style={styles.amenityItem}>
                  <View style={styles.amenityDot} />
                  <Text style={styles.amenityText}>{a}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Locations</Text>
            {provider.locations.map((l, i) => (
              <View key={i} style={[styles.locRow, i < provider.locations.length - 1 && styles.locRowBorder]}>
                <View style={styles.locDot} />
                <Text style={styles.locText}>{l}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nearby universities</Text>
            <View style={styles.tagRow}>
              {provider.nearbyUniversities.map((u, i) => (
                <View key={i} style={styles.uniTag}><Text style={styles.uniTagText}>{u}</Text></View>
              ))}
            </View>
          </View>

          {provider.tiers && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available tiers</Text>
              <View style={styles.tierRow}>
                {provider.tiers.map((t, i) => (
                  <View key={i} style={styles.tierCard}>
                    <Text style={styles.tierName}>{t}</Text>
                    <Text style={styles.tierSub}>Tap to explore</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleWebsite} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Visit website</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={toggleSave} activeOpacity={0.85}>
              <Text style={styles.secondaryBtnText}>{saved ? '★ Saved' : '☆ Save to favourites'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },
  backButton: { marginBottom: 14 },
  backButtonText: { fontSize: 14, color: Colors.textLight, fontWeight: '500' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  heroIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  heroEmoji: { fontSize: 24 },
  heroText: { flex: 1 },
  heroName: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3, marginBottom: 2 },
  heroPrice: { fontSize: 13, color: Colors.textLight },
  favBtn: { backgroundColor: Colors.primaryLight, borderRadius: 9, padding: 9 },
  favIcon: { fontSize: 18, color: Colors.primary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  stars: { fontSize: 12, color: Colors.warning, letterSpacing: 1 },
  ratingText: { fontSize: 12, color: Colors.textLight },
  billsBadge: { backgroundColor: Colors.primaryLight, borderRadius: 5, paddingHorizontal: 9, paddingVertical: 3 },
  billsBadgeText: { fontSize: 10, color: Colors.primary, fontWeight: '600' },
  scroll: { flex: 1 },
  body: { padding: 16, gap: 10 },
  section: { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14 },
  sectionTitle: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 12 },
  aboutText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  roomTag: { backgroundColor: Colors.background, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  roomTagText: { fontSize: 12, fontWeight: '500', color: Colors.textPrimary },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 7, width: '45%' },
  amenityDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.textPrimary },
  amenityText: { fontSize: 13, color: Colors.textPrimary },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  locRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  locDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textPrimary },
  locText: { fontSize: 14, color: Colors.textPrimary },
  uniTag: { borderRadius: 20, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 13, paddingVertical: 6 },
  uniTagText: { fontSize: 12, color: Colors.textPrimary },
  tierRow: { flexDirection: 'row', gap: 8 },
  tierCard: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 14, alignItems: 'center' },
  tierName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 3 },
  tierSub: { fontSize: 11, color: Colors.textMuted },
  actions: { gap: 8, paddingBottom: 8 },
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  secondaryBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: Colors.surface },
  secondaryBtnText: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
});