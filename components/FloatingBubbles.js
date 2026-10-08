import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Colors from '../constants/Colors';
import useReducedMotion from '../hooks/useReducedMotion';

// Decorative emoji bubbles that drift up and down behind the welcome hero.
// Each has its own speed and phase so they never move in sync.
const BUBBLES = [
  { emoji: '📚', size: 58, top: '8%',  left: '6%',  color: Colors.playSky,    drift: 10, duration: 3200, delay: 0 },
  { emoji: '💸', size: 50, top: '14%', right: '8%', color: Colors.playMint,   drift: 12, duration: 2800, delay: 400 },
  { emoji: '🎓', size: 46, top: '58%', left: '4%',  color: Colors.playYellow, drift: 9,  duration: 3600, delay: 200 },
  { emoji: '☕️', size: 44, top: '62%', right: '6%', color: Colors.playLilac,  drift: 11, duration: 3000, delay: 700 },
  { emoji: null, size: 18, top: '4%',  left: '46%', color: Colors.playPeach,  drift: 8,  duration: 2600, delay: 300 },
  { emoji: null, size: 12, top: '42%', left: '22%', color: Colors.playYellow, drift: 6,  duration: 2400, delay: 900 },
  { emoji: null, size: 14, top: '40%', right: '24%', color: Colors.playSky,   drift: 7,  duration: 3400, delay: 100 },
];

function Bubble({ emoji, size, color, drift, duration, delay, still, ...position }) {
  const float = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (still) { float.setValue(0.5); return; }
    const ease = Easing.inOut(Easing.sin);
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(Animated.sequence([
        Animated.timing(float, { toValue: 1, duration, easing: ease, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration, easing: ease, useNativeDriver: true }),
      ])),
    ]);
    anim.start();
    return () => anim.stop();
  }, [still]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [-drift, drift] });
  const rotate = float.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] });

  return (
    <Animated.View
      style={[
        styles.bubble,
        position,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        { transform: [{ translateY }, { rotate }] },
      ]}
    >
      {emoji && <Text style={{ fontSize: size * 0.48 }}>{emoji}</Text>}
    </Animated.View>
  );
}

export default function FloatingBubbles() {
  const still = useReducedMotion();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {BUBBLES.map((b, i) => <Bubble key={i} {...b} still={still} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
