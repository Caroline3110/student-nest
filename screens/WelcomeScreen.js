import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useT } from '../i18n';
import { LanguageToggle } from '../components/FormField';
import FadeIn from '../components/FadeIn';
import FloatingBubbles from '../components/FloatingBubbles';
import PressableScale from '../components/PressableScale';
import useReducedMotion from '../hooks/useReducedMotion';

const FEATURES = [
  { key: 'study',     emoji: '📚', color: Colors.playSky },
  { key: 'budget',    emoji: '💷', color: Colors.playMint },
  { key: 'housing',   emoji: '🏠', color: Colors.playPeach },
  { key: 'roommates', emoji: '🤝', color: Colors.playYellow },
  { key: 'jobs',      emoji: '💼', color: Colors.playLilac },
  { key: 'wellbeing', emoji: '🧘', color: Colors.playSky },
];

// First screen signed-out users see: pick Create account or Log in.
export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const t = useT();
  const reduceMotion = useReducedMotion();

  // Logo springs in, then gives a little wobble.
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoTilt = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const wobble = (toValue) =>
      Animated.timing(logoTilt, { toValue, duration: 110, easing: Easing.inOut(Easing.quad), useNativeDriver: true });
    const anim = Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, speed: 8, bounciness: 14, useNativeDriver: true }),
      ...(reduceMotion ? [] : [wobble(-1), wobble(1), wobble(-0.5), wobble(0)]),
    ]);
    anim.start();
    return () => anim.stop();
  }, []);
  const logoRotate = logoTilt.interpolate({ inputRange: [-1, 1], outputRange: ['-10deg', '10deg'] });

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 }]}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.langRow}>
          <LanguageToggle />
        </View>

        <View style={styles.hero}>
          <FloatingBubbles />
          <Animated.View style={[styles.logo, { transform: [{ scale: logoScale }, { rotate: logoRotate }] }]}>
            <Text style={styles.logoEmoji}>🏠</Text>
          </Animated.View>
        </View>

        <View style={styles.content}>
          <FadeIn delay={250}>
            <Text style={styles.headline}>
              {t('welcome.headline')}{'\n'}
              <Text style={styles.headlineAccent}>{t('welcome.headlineAccent')}</Text>
            </Text>
          </FadeIn>
          <FadeIn delay={350}>
            <Text style={styles.sub}>{t('welcome.sub')}</Text>
          </FadeIn>

          <View style={styles.chips}>
            {FEATURES.map((f, i) => (
              <FadeIn key={f.key} delay={450 + i * 70} variant="pop">
                <View style={[styles.chip, { backgroundColor: f.color }]}>
                  <Text style={styles.chipEmoji}>{f.emoji}</Text>
                  <Text style={styles.chipText}>{t(`welcome.features.${f.key}`)}</Text>
                </View>
              </FadeIn>
            ))}
          </View>
        </View>

        <FadeIn delay={850} style={styles.actions}>
          <PressableScale style={styles.primaryBtn} onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.primaryText}>{t('auth.createAccount')}  →</Text>
          </PressableScale>
          <PressableScale style={styles.secondaryBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.secondaryText}>{t('welcome.haveAccount')}</Text>
          </PressableScale>
          <Text style={styles.socialProof}>{t('welcome.socialProof')}</Text>
        </FadeIn>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  langRow: { alignItems: 'flex-end' },

  hero: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  logo: {
    width: 104,
    height: 104,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoEmoji: { fontSize: 52 },

  content: { flex: 1, paddingTop: 12 },
  headline: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1.2,
  },
  headlineAccent: { color: Colors.primary },
  sub: {
    fontSize: 16,
    lineHeight: 23,
    color: Colors.textLight,
    marginTop: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 22,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipEmoji: { fontSize: 15 },
  chipText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  actions: { marginTop: 28, gap: 12 },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryText: { color: Colors.white, fontSize: 17, fontWeight: '800' },
  secondaryBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  socialProof: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textLight,
    marginTop: 6,
  },
});
