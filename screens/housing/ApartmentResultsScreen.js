import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useT } from '../../i18n';
import { apartmentListings } from '../../data/housingData';

export default function ApartmentResultsScreen({ navigation, route }) {
  const t = useT();
  const { searchParams } = route.params;
  const [results, setResults] = useState([]);
  const [sortBy, setSortBy] = useState('price');

  useEffect(() => { filterApartments(); }, [sortBy]);

  const filterApartments = () => {
    let filtered = [...apartmentListings];
    if (searchParams.bedrooms) filtered = filtered.filter(a => a.bedrooms === parseInt(searchParams.bedrooms));
    if (searchParams.priceMin) filtered = filtered.filter(a => a.price >= parseInt(searchParams.priceMin));
    if (searchParams.priceMax) filtered = filtered.filter(a => a.price <= parseInt(searchParams.priceMax));
    if (sortBy === 'price') filtered.sort((a, b) => a.price - b.price);
    else filtered.sort((a, b) => parseInt(a.size) - parseInt(b.size));
    setResults(filtered);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('housing.results')}</Text>
        <Text style={styles.headerSubtitle}>{t('housing.apartmentsFound', { count: results.length })}</Text>
      </View>

      <View style={styles.metaBar}>
        <Text style={styles.metaText}>
          {searchParams.location} · {t('housing.nBed', { count: searchParams.bedrooms })} · £{searchParams.priceMin || '0'}–{searchParams.priceMax ? `£${searchParams.priceMax}` : t('housing.any')}{t('housing.perWeek')}
        </Text>
      </View>

      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>{t('housing.sort')}</Text>
        {['price', 'size'].map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}
            onPress={() => setSortBy(s)}
          >
            <Text style={[styles.sortBtnText, sortBy === s && styles.sortBtnTextActive]}>
              {t(`housing.sortBy.${s}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {results.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{t('housing.noneFound')}</Text>
              <Text style={styles.emptyDesc}>{t('housing.adjustFilters')}</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.emptyBtnText}>← {t('housing.modifySearch')}</Text>
              </TouchableOpacity>
            </View>
          ) : results.map(apt => (
            <TouchableOpacity
              key={apt.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => Alert.alert(apt.title, `${apt.address}\n£${apt.price}${t('housing.perWeek')} · ${apt.size}\n${t('housing.available')}: ${apt.available}\n\n${apt.description}`)}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <Text style={styles.cardEmoji}>{apt.emoji}</Text>
                </View>
                <View style={styles.cardTopText}>
                  <Text style={styles.cardTitle}>{apt.title}</Text>
                  <Text style={styles.cardAddr}>{apt.address}</Text>
                </View>
                <View style={styles.priceBadge}>
                  <Text style={styles.priceBig}>£{apt.price}</Text>
                  <Text style={styles.priceSm}>{t('housing.perWeek')}</Text>
                </View>
              </View>

              <View style={styles.statsStrip}>
                {[
                  { label: t('housing.nBed', { count: apt.bedrooms }) },
                  { label: t('housing.nBath', { count: apt.bathrooms }) },
                  { label: apt.size },
                  { label: apt.available },
                ].map((s, i) => (
                  <View key={i} style={[styles.statItem, i < 3 && styles.statItemBorder]}>
                    <Text style={styles.statText}>{s.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.aptDesc} numberOfLines={2}>{apt.description}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.amenityRow}>
                  {apt.amenities.map((a, i) => (
                    <View key={i} style={styles.aTag}><Text style={styles.aTagText}>{a}</Text></View>
                  ))}
                </ScrollView>
                <Text style={styles.uniText}>{apt.nearbyUnis.join(' · ')}</Text>
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
  metaBar: { backgroundColor: Colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  metaText: { fontSize: 12, color: Colors.textLight, textAlign: 'center' },
  sortBar: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sortLabel: { fontSize: 12, color: Colors.textMuted, marginRight: 2 },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  sortBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sortBtnText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  sortBtnTextActive: { color: Colors.white },
  scroll: { flex: 1 },
  list: { padding: 16, gap: 10 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: Colors.textLight, marginBottom: 24 },
  emptyBtn: { backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 11 },
  emptyBtnText: { color: Colors.white, fontSize: 14, fontWeight: '500' },
  card: { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  cardIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  cardEmoji: { fontSize: 17 },
  cardTopText: { flex: 1 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  cardAddr: { fontSize: 11, color: Colors.textMuted },
  priceBadge: { alignItems: 'flex-end' },
  priceBig: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  priceSm: { fontSize: 10, color: Colors.textMuted },
  statsStrip: { flexDirection: 'row', backgroundColor: Colors.background },
  statItem: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  statItemBorder: { borderRightWidth: 1, borderRightColor: Colors.border },
  statText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  cardBody: { padding: 12 },
  aptDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginBottom: 9 },
  amenityRow: { marginBottom: 8 },
  aTag: { backgroundColor: Colors.background, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 4, marginRight: 6 },
  aTagText: { fontSize: 11, color: Colors.textSecondary },
  uniText: { fontSize: 11, color: Colors.textMuted },
});