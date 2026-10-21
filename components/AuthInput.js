import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import { useT } from '../i18n';

// Text field for the sign-in forms: optional label and left icon, and a
// Show/Hide toggle on password fields. The border turns red while focused.
export default function AuthInput({ label, icon, secureTextEntry, onFocus, onBlur, ...props }) {
  const t = useT();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, focused && styles.fieldFocused]}>
        {icon}
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.warmMuted}
          accessibilityLabel={label || props.placeholder}
          secureTextEntry={secureTextEntry && !revealed}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          {...props}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setRevealed(r => !r)} hitSlop={10} accessibilityRole="button">
            <Text style={styles.reveal}>{revealed ? t('auth.hide') : t('auth.show')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.warmGrey,
    marginLeft: 4,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.creamBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  fieldFocused: { borderColor: Colors.brandDeep },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  reveal: { fontSize: 13, fontWeight: '700', color: Colors.warmGrey },
});
