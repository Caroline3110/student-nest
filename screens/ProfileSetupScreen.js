import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, Alert, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Colors from '../constants/Colors';
import { useLanguage } from '../i18n';
import { saveProfile } from '../hooks/useProfile';
import { FormField, ChipSelect, LanguageToggle } from '../components/FormField';

export const YEAR_OPTIONS = ['year1', 'year2', 'year3', 'year4', 'postgrad'];

// Shown once after signup (and to existing users without a profile).
// App.js swaps to the main app as soon as profileComplete is saved.
export default function ProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  const { t, lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', university: '', campus: '', major: '', year: '', bio: '',
  });
  const set = (key) => (value) => setForm(f => ({ ...f, [key]: value }));

  const steps = [
    { title: t('setup.nameTitle'), sub: t('setup.nameSub'), required: ['name'] },
    { title: t('setup.uniTitle'), sub: t('setup.uniSub'), required: ['university', 'campus'] },
    { title: t('setup.majorTitle'), sub: t('setup.majorSub'), required: ['major', 'year'] },
    { title: t('setup.bioTitle'), sub: t('setup.bioSub'), required: [] },
  ];
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const canContinue = current.required.every(key => form[key].trim());

  const handleNext = async () => {
    if (!canContinue) return;
    if (!isLast) { setStep(step + 1); return; }
    setSaving(true);
    try {
      await saveProfile(auth.currentUser.uid, { ...form, language: lang, profileComplete: true });
    } catch (e) {
      setSaving(false);
      Alert.alert(t('common.error'), t('setup.saveFailed'));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topRow}>
          {step > 0 ? (
            <TouchableOpacity onPress={() => setStep(step - 1)}>
              <Text style={styles.backText}>← {t('common.back')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => signOut(auth)}>
              <Text style={styles.backText}>{t('settings.logout')}</Text>
            </TouchableOpacity>
          )}
          <LanguageToggle />
        </View>
        <View style={styles.progress}>
          {steps.map((_, i) => (
            <View key={i} style={[styles.progressBar, i <= step && styles.progressBarActive]} />
          ))}
        </View>
        <Text style={styles.stepCount}>{t('setup.step', { current: step + 1, total: steps.length })}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.sub}>{current.sub}</Text>

        <View style={styles.fields}>
          {step === 0 && (
            <FormField
              label={t('profile.name')}
              placeholder={t('profile.namePlaceholder')}
              value={form.name}
              onChangeText={set('name')}
              maxLength={80}
              autoFocus
            />
          )}
          {step === 1 && (
            <>
              <FormField
                label={t('profile.university')}
                placeholder={t('profile.universityPlaceholder')}
                value={form.university}
                onChangeText={set('university')}
                maxLength={120}
              />
              <FormField
                label={t('profile.campus')}
                placeholder={t('profile.campusPlaceholder')}
                value={form.campus}
                onChangeText={set('campus')}
                maxLength={120}
              />
            </>
          )}
          {step === 2 && (
            <>
              <FormField
                label={t('profile.major')}
                placeholder={t('profile.majorPlaceholder')}
                value={form.major}
                onChangeText={set('major')}
                maxLength={120}
              />
              <ChipSelect
                label={t('profile.year')}
                options={YEAR_OPTIONS.map(v => ({ value: v, label: t(`profile.years.${v}`) }))}
                value={form.year}
                onChange={set('year')}
              />
            </>
          )}
          {step === 3 && (
            <FormField
              label={t('profile.bio')}
              placeholder={t('profile.bioPlaceholder')}
              value={form.bio}
              onChangeText={set('bio')}
              maxLength={300}
              multiline
              hint={t('profile.bioHint', { count: 300 - form.bio.length })}
            />
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.button, (!canContinue || saving) && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!canContinue || saving}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {saving ? t('common.saving') : isLast ? t('setup.finish') : t('common.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  top: { paddingHorizontal: 24 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backText: { fontSize: 14, color: Colors.textLight, fontWeight: '500' },
  progress: { flexDirection: 'row', gap: 6 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  progressBarActive: { backgroundColor: Colors.primary },
  stepCount: { fontSize: 12, color: Colors.textMuted, marginTop: 10 },
  body: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 6 },
  sub: { fontSize: 14, color: Colors.textLight, lineHeight: 20, marginBottom: 28 },
  fields: { gap: 18 },
  footer: { paddingHorizontal: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  button: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
