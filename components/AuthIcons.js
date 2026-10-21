import { View, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

// Line icons for the sign-in screens, drawn with borders since the app has
// no icon library. Both fit a size × size box.

export function MailIcon({ color = Colors.warmGrey, size = 18 }) {
  const stroke = size * 0.1;
  const w = size;
  const h = size * 0.74;
  const inner = w - stroke * 2;
  // A square showing its bottom and right edges, turned 45°, makes the flap.
  const d = size * 0.5;
  const tip = inner * 0.42;
  return (
    <View style={[styles.box, { width: size, height: size }]}>
      <View style={{
        width: w, height: h, borderWidth: stroke, borderColor: color,
        borderRadius: size * 0.16, overflow: 'hidden', alignItems: 'center',
      }}>
        <View style={{
          width: d, height: d, marginTop: tip - d * 0.707 - d / 2,
          borderRightWidth: stroke, borderBottomWidth: stroke, borderColor: color,
          transform: [{ rotate: '45deg' }],
        }} />
      </View>
    </View>
  );
}

export function LockIcon({ color = Colors.warmGrey, size = 18 }) {
  const stroke = size * 0.1;
  return (
    <View style={[styles.box, { width: size, height: size }]}>
      <View style={{
        width: size * 0.5, height: size * 0.4,
        borderWidth: stroke, borderBottomWidth: 0, borderColor: color,
        borderTopLeftRadius: size * 0.25, borderTopRightRadius: size * 0.25,
      }} />
      <View style={{
        width: size * 0.78, height: size * 0.56,
        borderWidth: stroke, borderColor: color, borderRadius: size * 0.14,
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
});
