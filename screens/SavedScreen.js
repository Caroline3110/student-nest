import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useT } from '../i18n';
import Icon from '../components/Icon';
import PressableScale from '../components/PressableScale';
import { useSaved } from '../hooks/useSaved';

const initials = (name) =>
  (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

// Everything the student hearted: roommate profiles for now, places later.
export default function SavedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const t = useT();
  const { items, loading, toggle } = useSaved();

  const byNewest = (a, b) => (b.savedAt?.seconds || 0) - (a.savedAt?.seconds || 0);
  const roommates = items.filter(i => i.type === 'roommate').sort(byNewest);
  const places = items.filter(i => i.type === 'place').sort(byNewest);
  const total = roommates.length + places.length;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>{t('tabs.saved')}</Text>
        <Text style={styles.subtitle}>
          {loading
            ? t('saved.subtitle')
            : t(total === 1 ? 'saved.countOne' : 'saved.count', { count: total })}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.brandDeep} style={{ marginTop: 48 }} />
        ) : total === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Icon name="bookmark" size={28} color={Colors.brandDeep} />
            </View>
            <Text style={styles.emptyTitle}>{t('saved.emptyTitle')}</Text>
            <Text style={styles.emptyBody}>{t('saved.emptyBody')}</Text>
            <PressableScale style={styles.button} onPress={() => navigation.navigate('RoommateFinder')}>
              <Text style={styles.buttonText}>{t('messages.findRoommates')}</Text>
            </PressableScale>
          </View>
        ) : (
          <>
          {roommates.length > 0 && <Text style={styles.groupLabel}>{t('saved.profiles')}</Text>}
          {roommates.map(item => (
          <PressableScale
            key={item.id}
            style={styles.card}
            scaleTo={0.99}
            onPress={() => navigation.navigate('RoommateFinder', { focus: item.id })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(item.name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta} numberOfLines={1}>
                {[item.university, item.year].filter(Boolean).join(' · ')}
              </Text>
              {item.area ? (
                <View style={styles.metaRow}>
                  <Icon name="map-pin" size={12} color={Colors.warmMuted} />
                  <Text style={styles.metaSmall} numberOfLines={1}>{item.area}</Text>
                </View>
              ) : null}
            </View>
            <Pressable
              onPress={() => toggle(item.id)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={t('saved.remove')}
            >
              <Icon name="heart" size={20} color={Colors.brandDeep} />
            </Pressable>
          </PressableScale>
          ))}

          {places.length > 0 && (
            <Text style={[styles.groupLabel, roommates.length > 0 && { marginTop: 14 }]}>
              {t('saved.places')}
            </Text>
          )}
          {places.map(item => (
            <PressableScale
              key={item.id}
              style={styles.card}
              scaleTo={0.99}
              onPress={() => navigation.navigate('Accommodation')}
            >
              <View style={styles.avatar}>
                <Icon name="home" size={19} color={Colors.brandDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                {item.priceRange ? <Text style={styles.meta}>{item.priceRange}</Text> : null}
                {item.area ? (
                  <View style={styles.metaRow}>
                    <Icon name="map-pin" size={12} color={Colors.warmMuted} />
                    <Text style={styles.metaSmall} numberOfLines={1}>{item.area}</Text>
                  </View>
                ) : null}
              </View>
              <Pressable
                onPress={() => toggle(item.id)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={t('saved.remove')}
              >
                <Icon name="heart" size={20} color={Colors.brandDeep} />
              </Pressable>
            </PressableScale>
          ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  header: { paddingHorizontal: 20, paddingBottom: 6 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13.5, color: Colors.warmGrey, marginTop: 4 },

  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.warmMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  empty: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 12 },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  emptyBody: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.warmGrey,
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    backgroundColor: Colors.brandDeep,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 22,
  },
  buttonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 11,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: Colors.brandDeep },
  name: { fontSize: 15.5, fontWeight: '700', color: Colors.textPrimary },
  meta: { fontSize: 12.5, color: Colors.warmGrey, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  metaSmall: { flex: 1, fontSize: 12, color: Colors.warmMuted },
});
