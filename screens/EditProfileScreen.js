import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../firebase';
import Colors from '../constants/Colors';
import { useT } from '../i18n';
import { useProfile, saveProfile, PROFILE_FIELDS } from '../hooks/useProfile';
import { FormField, ChipSelect } from '../components/FormField';
import { YEAR_OPTIONS } from './ProfileSetupScreen';

const REQUIRED = ['name', 'university', 'campus', 'major', 'year'];

export default function EditProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const t = useT();
  const profile = useProfile();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() =>
    Object.fromEntries(PROFILE_FIELDS.map(key => [key, profile?.[key] ?? ''])));
  const set = (key) => (value) => setForm(f => ({ ...f, [key]: value }));

  const canSave = REQUIRED.every(key => form[key].trim());

  const handleSave = async () => {
    if (!canSave) { Alert.alert(t('common.error'), t('common.fillAllFields')); return; }
    setSaving(true);
    try {
      await saveProfile(auth.currentUser.uid, form);
      navigation.goBack();
    } catch (e) {
      setSaving(false);
      Alert.alert(t('common.error'), t('setup.saveFailed'));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.editProfile')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <FormField label={t('profile.name')} value={form.name} onChangeText={set('name')} maxLength={80} />
        <FormField label={t('profile.university')} value={form.university} onChangeText={set('university')} maxLength={120} />
        <FormField label={t('profile.campus')} value={form.campus} onChangeText={set('campus')} maxLength={120} />
        <FormField label={t('profile.major')} value={form.major} onChangeText={set('major')} maxLength={120} />
        <ChipSelect
          label={t('profile.year')}
          options={YEAR_OPTIONS.map(v => ({ value: v, label: t(`profile.years.${v}`) }))}
          value={form.year}
          onChange={set('year')}
        />
        <FormField
          label={t('profile.bio')}
          placeholder={t('profile.bioPlaceholder')}
          value={form.bio}
          onChangeText={set('bio')}
          maxLength={300}
          multiline
          hint={t('profile.bioHint', { count: 300 - form.bio.length })}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.button, (!canSave || saving) && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={!canSave || saving}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>{saving ? t('common.saving') : t('common.save')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backText: { fontSize: 14, color: Colors.textLight, fontWeight: '500', marginBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  body: { padding: 20, gap: 18 },
  footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  button: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
