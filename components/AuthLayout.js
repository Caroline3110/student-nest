import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useT } from '../i18n';
import { LanguageToggle } from './FormField';
import FadeIn from './FadeIn';
import PressableScale from './PressableScale';

// Shared frame for Login, Signup and Forgot Password: back button and language
// toggle (unless showTopRow is false), an emoji badge or a custom hero, a big
// heading, then the form.
export default function AuthLayout({ navigation, emoji, hero, title, subtitle, showTopRow = true, children }) {
  const insets = useSafeAreaInsets();
  const t = useT();
  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + (showTopRow ? 12 : 28), paddingBottom: Math.max(insets.bottom + 16, 40) },
        ]}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {showTopRow && (
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
        )}

        <FadeIn variant="pop" delay={50}>
          {hero || (
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>{emoji}</Text>
            </View>
          )}
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
  form: { gap: 14 },
  button: {
    backgroundColor: Colors.brandDeep,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: Colors.brandDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.white, fontSize: 16.5, fontWeight: '700' },
  link: { marginTop: 28, alignItems: 'center', paddingVertical: 6 },
  linkText: { fontSize: 14, color: Colors.warmGrey },
  linkBold: { color: Colors.brandDeep, fontWeight: '800' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.blush,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeEmoji: { fontSize: 34 },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.warmGrey,
    marginTop: 8,
    marginBottom: 24,
  },
});
