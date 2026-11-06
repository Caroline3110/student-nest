import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

// Animating the Pressable itself, rather than wrapping it, keeps `style` on
// the element the parent lays out. With a wrapper in between, a width set
// here applied to the inner box while the Pressable sized itself to its
// content, which collapsed any card placed in a row.
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// A button that shrinks slightly while pressed and springs back on release.
export default function PressableScale({ style, children, scaleTo = 0.96, disabled, ...props }) {
  const scale = useRef(new Animated.Value(1)).current;

  const springTo = (toValue) =>
    Animated.spring(scale, {
      toValue,
      speed: 40,
      bounciness: toValue === 1 ? 10 : 0,
      useNativeDriver: true,
    }).start();

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPressIn={() => springTo(scaleTo)}
      onPressOut={() => springTo(1)}
      {...props}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}
