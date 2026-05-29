import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

export default function ApartmentsScreen({ navigation }) {
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState('1');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const handleSearch = () => {
    if (!location.trim()) {
      Alert.alert('Missing location', 'Please enter a postcode to search.');
      return;
    }
    navigation.navigate('ApartmentResults', { searchParams: { location, bedrooms, priceMin, priceMax } });
  };

  const fillSearch = (loc, beds, min, max) => {
    setLocation(loc); setBedrooms(beds); setPriceMin(min); setPriceMax(max);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apartments</Text>
        <Text style={styles.headerSubtitle}>Search by your preferences</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={styles.formCard}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. WC1E 6BT"
              placeholderTextColor={Colors.textMuted}
              value={location}
              onChangeText={setLocation}
              autoCapitalize="characters"
            />
            <Text style={styles.hint}>Enter a London postcode</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Bedrooms</Text>
            <View style={styles.bedRow}>
              {['1', '2'].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.bedBtn, bedrooms === n && styles.bedBtnActive]}
                  onPress={() => setBedrooms(n)}
                >
                  <Text style={[styles.bedBtnText, bedrooms === n && styles.bedBtnTextActive]}>
                    {n} bedroom{n === '2' ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Weekly budget</Text>
            <View style={styles.priceRow}>
              <View style={styles.priceWrap}>
                <Text style={styles.currency}>£</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min"
                  placeholderTextColor={Colors.textMuted}
                  value={priceMin}
                  onChangeText={setPriceMin}
                  keyboardType="number-pad"
                />
              </View>
              <Text style={styles.priceSep}>–</Text>
              <View style={styles.priceWrap}>
                <Text style={styles.currency}>£</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max"
                  placeholderTextColor={Colors.textMuted}
                  value={priceMax}
                  onChangeText={setPriceMax}
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <Text style={styles.hint}>Leave blank for no limit</Text>
          </View>

          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
            <Text style={styles.searchBtnText}>Search apartments</Text>
          </TouchableOpacity>

          <Text style={styles.popularLabel}>Popular searches</Text>
          <TouchableOpacity style={styles.popularChip} onPress={() => fillSearch('WC1E 6BT', '1', '150', '250')}>
            <Text style={styles.popularChipText}>Near UCL · 1 bed · £150–250/week</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.popularChip} onPress={() => fillSearch('SE1 7EH', '2', '200', '300')}>
            <Text style={styles.popularChipText}>Near King's College · 2 bed · £200–300/week</Text>
          </TouchableOpacity>
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
  scroll: { flex: 1 },
  body: { padding: 16, gap: 10 },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  label: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10 },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  hint: { fontSize: 11, color: Colors.textMuted, marginTop: 6 },
  bedRow: { flexDirection: 'row', gap: 8 },
  bedBtn: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  bedBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  bedBtnText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  bedBtnTextActive: { color: Colors.white },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
  },
  currency: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, marginRight: 3 },
  priceInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: Colors.textPrimary },
  priceSep: { fontSize: 13, color: Colors.textMuted },
  searchBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 2,
  },
  searchBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  popularLabel: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 6 },
  popularChip: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  popularChipText: { fontSize: 13, color: Colors.textPrimary },
});