import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useT } from '../i18n';
import Icon from '../components/Icon';
import PressableScale from '../components/PressableScale';

// In-app chat isn't built yet. Until it is, students swap WhatsApp or email
// from a roommate profile, so this explains that instead of showing a fake inbox.
export default function MessagesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const t = useT();

  const steps = ['browse', 'contact', 'safe'];

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>{t('tabs.messages')}</Text>
        <Text style={styles.subtitle}>{t('messages.subtitle')}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Icon name="message-circle" size={30} color={Colors.brandDeep} />
          </View>
          <Text style={styles.heroTitle}>{t('messages.emptyTitle')}</Text>
          <Text style={styles.heroBody}>{t('messages.emptyBody')}</Text>
        </View>

        <Text style={styles.groupLabel}>{t('messages.howItWorks')}</Text>
        <View style={styles.card}>
          {steps.map((step, i) => (
            <View key={step} style={[styles.row, i < steps.length - 1 && styles.rowBorder]}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.rowText}>{t(`messages.steps.${step}`)}</Text>
            </View>
          ))}
        </View>

        <PressableScale style={styles.button} onPress={() => navigation.navigate('RoommateFinder')}>
          <Text style={styles.buttonText}>{t('messages.findRoommates')}</Text>
        </PressableScale>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  header: { paddingHorizontal: 20, paddingBottom: 6 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13.5, color: Colors.warmGrey, marginTop: 4 },

  scroll: { paddingHorizontal: 20, paddingTop: 24 },
  hero: { alignItems: 'center', paddingHorizontal: 12, marginBottom: 32 },
  heroIcon: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  heroTitle: { fontSize: 19, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  heroBody: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.warmGrey,
    textAlign: 'center',
    marginTop: 8,
  },

  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.warmMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.creamBorder },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontSize: 12.5, fontWeight: '800', color: Colors.brandDeep },
  rowText: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },

  button: {
    backgroundColor: Colors.brandDeep,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 22,
  },
  buttonText: { color: Colors.white, fontSize: 15.5, fontWeight: '700' },
});
