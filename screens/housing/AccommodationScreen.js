import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useT } from '../../i18n';
import { accommodationProviders, priceFilters } from '../../data/housingData';
import Icon from '../../components/Icon';
import ScreenHeader from '../../components/ScreenHeader';
import PressableScale from '../../components/PressableScale';
import { useSaved } from '../../hooks/useSaved';

// Flats come from the big portals until Student Nest has its own listings,
// so each link opens a London search already limited to two bedrooms.
const FLAT_SITES = [
  { id: 'rightmove', name: 'Rightmove', url: 'https://www.rightmove.co.uk/property-to-rent/find.html?searchLocation=London&maxBedrooms=2' },
  { id: 'zoopla', name: 'Zoopla', url: 'https://www.zoopla.co.uk/to-rent/property/london/?beds_max=2' },
  { id: 'openrent', name: 'OpenRent', url: 'https://www.openrent.co.uk/properties-to-rent/london?term=London&bedrooms_max=2' },
  { id: 'spareroom', name: 'SpareRoom', url: 'https://www.spareroom.co.uk/flatshare/london' },
];

export default function AccommodationScreen({ navigation }) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const saved = useSaved();
  const [tab, setTab] = useState('halls');
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const q = search.trim().toLowerCase();
  const providers = accommodationProviders.filter(p => {
    const inPrice = !selectedFilter || (p.priceMin >= selectedFilter.min && p.priceMin <= selectedFilter.max);
    const inSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.locations.some(l => l.toLowerCase().includes(q)) ||
      p.nearbyUniversities.some(u => u.toLowerCase().includes(q));
    return inPrice && inSearch;
  });

  const open = (url) =>
    Linking.openURL(url).catch(() => Alert.alert(t('common.error'), t('housing.cantOpenWebsite')));

  const toggleSave = (provider) => saved.toggle(`place_${provider.id}`, {
    type: 'place',
    name: provider.name,
    area: provider.locations.slice(0, 2).join(' · '),
    priceRange: provider.priceRange,
    website: provider.website,
  });

  return (
    <View style={styles.root}>
      <ScreenHeader
        navigation={navigation}
        title={t('home.features.living.name')}
        subtitle={tab === 'halls'
          ? t('housing.providersAvailable', { count: providers.length })
          : t('housing.flatsSubtitle')}
        actions={tab === 'halls' ? [{
          icon: 'sliders',
          label: t('roommates.filters'),
          active: showFilters,
          onPress: () => setShowFilters(v => !v),
        }] : []}
      />

      <View style={styles.segment}>
        {[
          { key: 'halls', label: t('housing.tabs.halls') },
          { key: 'flats', label: t('housing.tabs.flats') },
        ].map(item => (
          <Pressable
            key={item.key}
            style={[styles.segmentBtn, tab === item.key && styles.segmentBtnActive]}
            onPress={() => setTab(item.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: tab === item.key }}
          >
            <Text style={[styles.segmentText, tab === item.key && styles.segmentTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {tab === 'halls' ? (
          <>
            <View style={styles.searchBar}>
              <Icon name="search" size={17} color={Colors.warmMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('housing.searchPlaceholder')}
                placeholderTextColor={Colors.warmMuted}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
            </View>

            {showFilters && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                <Pressable
                  style={[styles.chip, !selectedFilter && styles.chipActive]}
                  onPress={() => setSelectedFilter(null)}
                >
                  <Text style={[styles.chipText, !selectedFilter && styles.chipTextActive]}>
                    {t('common.all')}
                  </Text>
                </Pressable>
                {priceFilters.map(f => (
                  <Pressable
                    key={f.id}
                    style={[styles.chip, selectedFilter?.id === f.id && styles.chipActive]}
                    onPress={() => setSelectedFilter(f)}
                  >
                    <Text style={[styles.chipText, selectedFilter?.id === f.id && styles.chipTextActive]}>
                      {t(`housing.priceFilters.${f.id}`)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {providers.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Icon name="home" size={26} color={Colors.brandDeep} />
                </View>
                <Text style={styles.emptyTitle}>{t('housing.noneFound')}</Text>
                <Text style={styles.emptySub}>{t('roommates.tryDifferent')}</Text>
              </View>
            ) : providers.map(provider => (
              <PressableScale
                key={provider.id}
                style={styles.card}
                scaleTo={0.99}
                onPress={() => navigation.navigate('ProviderDetail', { provider })}
              >
                <View style={[styles.banner, { backgroundColor: `${provider.color}1A` }]}>
                  <Text style={styles.bannerEmoji}>{provider.emoji}</Text>
                  {provider.billsIncluded && (
                    <View style={styles.bannerBadge}>
                      <Text style={styles.bannerBadgeText}>{t('housing.billsIncl')}</Text>
                    </View>
                  )}
                  <Pressable
                    style={styles.heart}
                    onPress={() => toggleSave(provider)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={t('housing.savePlace')}
                  >
                    <Icon
                      name="heart"
                      size={18}
                      color={saved.ids.has(`place_${provider.id}`) ? Colors.brandDeep : Colors.warmMuted}
                    />
                  </Pressable>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardName}>{provider.name}</Text>
                  <View style={styles.factRow}>
                    <Icon name="map-pin" size={13} color={Colors.warmMuted} />
                    <Text style={styles.factText} numberOfLines={1}>
                      {provider.nearbyUniversities.join(' · ')}
                    </Text>
                  </View>
                  <Text style={styles.price}>{provider.priceRange}</Text>
                  <View style={styles.tagRow}>
                    {provider.amenities.slice(0, 4).map((a, i) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{a}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </PressableScale>
            ))}
          </>
        ) : (
          <>
            <View style={styles.noticeCard}>
              <View style={styles.noticeIcon}>
                <Icon name="key" size={20} color={Colors.brandDeep} />
              </View>
              <Text style={styles.noticeTitle}>{t('housing.flatsTitle')}</Text>
              <Text style={styles.noticeBody}>{t('housing.flatsBody')}</Text>
            </View>

            <Text style={styles.groupLabel}>{t('housing.searchNow')}</Text>
            <View style={styles.listCard}>
              {FLAT_SITES.map((site, i) => (
                <PressableScale
                  key={site.id}
                  style={[styles.row, i < FLAT_SITES.length - 1 && styles.rowBorder]}
                  scaleTo={0.99}
                  onPress={() => open(site.url)}
                >
                  <View style={styles.rowIcon}>
                    <Icon name="external-link" size={16} color={Colors.brandDeep} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowName}>{site.name}</Text>
                    <Text style={styles.rowDesc}>{t(`housing.flatSites.${site.id}`)}</Text>
                  </View>
                  <Icon name="chevron-right" size={19} color={Colors.warmMuted} />
                </PressableScale>
              ))}
            </View>

            <Text style={styles.footnote}>{t('housing.flatsFootnote')}</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },

  segment: {
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 4,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
  },
  segmentBtn: { flex: 1, paddingVertical: 9, borderRadius: 999, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: Colors.brandDeep },
  segmentText: { fontSize: 13.5, fontWeight: '600', color: Colors.warmGrey },
  segmentTextActive: { color: Colors.white, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14.5, color: Colors.textPrimary },

  chips: { gap: 8, paddingBottom: 14, paddingRight: 4 },
  chip: {
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.brandDeep, borderColor: Colors.brandDeep },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.warmGrey },
  chipTextActive: { color: Colors.white },

  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
  },
  banner: { height: 112, alignItems: 'center', justifyContent: 'center' },
  bannerEmoji: { fontSize: 44 },
  bannerBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    backgroundColor: Colors.surface,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  bannerBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.brandDeep },
  heart: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: 16 },
  cardName: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  factRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6 },
  factText: { flex: 1, fontSize: 12.5, color: Colors.warmGrey },
  price: { fontSize: 16, fontWeight: '800', color: Colors.brandDeep, marginTop: 9 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  tag: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  tagText: { fontSize: 11.5, fontWeight: '600', color: Colors.warmGrey },

  empty: { alignItems: 'center', paddingTop: 50 },
  emptyIcon: {
    width: 66, height: 66, borderRadius: 33,
    backgroundColor: Colors.blush,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: 13.5, color: Colors.warmGrey, textAlign: 'center', paddingHorizontal: 24 },

  noticeCard: {
    backgroundColor: Colors.blush,
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
  },
  noticeIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  noticeTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  noticeBody: { fontSize: 14, lineHeight: 21, color: Colors.textSecondary, marginTop: 7 },

  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.warmMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  listCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.creamBorder },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowName: { fontSize: 14.5, fontWeight: '700', color: Colors.textPrimary },
  rowDesc: { fontSize: 12.5, color: Colors.warmGrey, marginTop: 2 },
  footnote: {
    fontSize: 12.5,
    lineHeight: 19,
    color: Colors.warmMuted,
    marginTop: 16,
    paddingHorizontal: 4,
  },
});
