import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';
import { useT, useLanguage } from '../i18n';
import FadeIn from '../components/FadeIn';
import PressableScale from '../components/PressableScale';

const RED = '#8B1A28';
const SERIF = Platform.select({ ios: 'Georgia', default: 'serif' });

// Short labels for the pill; LANGUAGES in i18n has the long ones used in Settings.
const PILL = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
];

// First screen signed-out users see.
export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const t = useT();
  const { lang, setLang } = useLanguage();
  // Welcome stays mounted under Login, so only ask for white status-bar text while it's on top.
  const focused = useIsFocused();

  return (
    <View style={styles.root}>
      {focused && <StatusBar style="light" />}
      <Image
        source={require('../assets/welcome-skyline.png')}
        style={[styles.skyline, { bottom: insets.bottom + 175 }]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 16 }]}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <FadeIn variant="pop">
            <HouseMark />
          </FadeIn>
          <FadeIn delay={150}>
            {/* The brand name isn't translated. */}
            <Text style={styles.logo} accessibilityRole="header">student{'\n'}nest.</Text>
          </FadeIn>
          <FadeIn delay={300}>
            <Text style={styles.tagline}>{t('welcome.tagline')}</Text>
          </FadeIn>
        </View>

        <FadeIn delay={450} style={styles.actions}>
          <View style={styles.pill}>
            {PILL.map(l => {
              const active = lang === l.code;
              return (
                <Pressable
                  key={l.code}
                  style={({ pressed }) => [styles.pillOption, active && styles.pillOptionActive, pressed && { opacity: 0.8 }]}
                  onPress={() => setLang(l.code)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{l.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <PressableScale style={styles.button} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.buttonText}>{t('welcome.getStarted')}  →</Text>
          </PressableScale>

          <Text style={styles.footer}>{t('welcome.footer')}</Text>
        </FadeIn>
      </ScrollView>
    </View>
  );
}

// Outline house drawn with borders, since the app has no icon library:
// a square showing only two edges, turned 45°, makes the roof.
function HouseMark() {
  return (
    <View style={house.wrap}>
      <View style={house.roof} />
      <View style={house.body}>
        <View style={house.door} />
      </View>
    </View>
  );
}

const STROKE = 3.5;

const house = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 8, marginBottom: 22 },
  roof: {
    width: 36,
    height: 36,
    borderTopWidth: STROKE,
    borderLeftWidth: STROKE,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
  body: {
    width: 36,
    height: 26,
    marginTop: -25,
    borderLeftWidth: STROKE,
    borderRightWidth: STROKE,
    borderBottomWidth: STROKE,
    borderColor: '#FFFFFF',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  door: {
    width: 11,
    height: 13,
    borderWidth: STROKE,
    borderBottomWidth: 0,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: RED },
  // Faint line drawing behind the content; wider than the screen, so the
  // right side (St Paul's) is cropped and Big Ben and the Eye stay in view.
  skyline: { position: 'absolute', left: -12, width: 690, height: 230, opacity: 0.35 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'space-between' },

  hero: { alignItems: 'center' },
  logo: {
    fontFamily: SERIF,
    fontSize: 60,
    lineHeight: 62,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 17,
    lineHeight: 25,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    marginTop: 18,
    maxWidth: 270,
  },

  actions: { marginTop: 48 },
  pill: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  pillOption: { flex: 1, paddingVertical: 14, borderRadius: 999, alignItems: 'center' },
  pillOptionActive: { backgroundColor: '#FFFFFF' },
  pillText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  pillTextActive: { color: '#1A1A1A', fontWeight: '700' },

  button: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: { color: RED, fontSize: 17, fontWeight: '700' },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.3,
    marginTop: 18,
  },
});
