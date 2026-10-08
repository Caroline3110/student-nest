import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import { LANGUAGES, useLanguage } from '../i18n';

export function FormField({ label, hint, style, ...inputProps }) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, inputProps.multiline && styles.multiline, style]}
        placeholderTextColor={Colors.textMuted}
        {...inputProps}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function ChipSelect({ label, options, value, onChange }) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.chips}>
        {options.map(opt => {
          const active = opt.value === value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Compact EN / 中文 switch for screens shown before Settings is reachable.
export function LanguageToggle({ onChange }) {
  const { lang, setLang } = useLanguage();
  return (
    <View style={styles.toggle}>
      {LANGUAGES.map(l => (
        <TouchableOpacity
          key={l.code}
          onPress={() => { setLang(l.code); onChange?.(l.code); }}
          style={[styles.toggleBtn, lang === l.code && styles.toggleBtnActive]}
        >
          <Text style={[styles.toggleText, lang === l.code && styles.toggleTextActive]}>
            {l.code === 'en' ? 'EN' : '中文'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  hint: { fontSize: 12, color: Colors.textMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: Colors.white, fontWeight: '600' },
  toggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'flex-end',
  },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  toggleBtnActive: { backgroundColor: Colors.primary },
  toggleText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  toggleTextActive: { color: Colors.white },
});
