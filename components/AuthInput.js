import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

// Labelled text field for the login/signup forms; the border turns red while focused.
export default function AuthInput({ label, onFocus, onBlur, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused]}
        placeholderTextColor={Colors.textMuted}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 2,
    borderColor: Colors.surfaceMuted,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inputFocused: {
    backgroundColor: Colors.surface,
    borderColor: Colors.primary,
  },
});
