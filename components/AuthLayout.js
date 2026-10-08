import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useT } from '../i18n';
import { LanguageToggle } from './FormField';
import FadeIn from './FadeIn';
import PressableScale from './PressableScale';

// Shared frame for Login, Signup and Forgot Password: back button, emoji badge, big heading, then the form.
export default function AuthLayout({ navigation, emoji, badgeColor, title, subtitle, children }) {
  const insets = useSafeAreaInsets();
  const t = useT();
  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom + 16, 40) }]}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <PressableScale
            style={styles.backBtn}
            scaleTo={0.9}
            onPress={() => navigation.goBack()}
            accessibilityLabel={t('common.back')}
            hitSlop={8}
          >
            <Text style={styles.backText}>←</Text>
          </PressableScale>
          <View>
            <LanguageToggle />
          </View>
        </View>

        <FadeIn variant="pop" delay={50}>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeEmoji}>{emoji}</Text>
          </View>
        </FadeIn>
        <FadeIn delay={120}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </FadeIn>

        <FadeIn delay={220}>{children}</FadeIn>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles the screens reuse for their submit button and footer link.
export const authStyles = StyleSheet.create({
  form: { gap: 16 },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: Colors.white, fontSize: 17, fontWeight: '800' },
  link: { marginTop: 28, alignItems: 'center', paddingVertical: 6 },
  linkText: { fontSize: 14, color: Colors.textLight },
  linkBold: { color: Colors.primary, fontWeight: '800' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeEmoji: { fontSize: 36 },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
    marginBottom: 28,
  },
});
