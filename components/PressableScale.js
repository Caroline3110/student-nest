import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

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
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPressIn={() => springTo(scaleTo)}
      onPressOut={() => springTo(1)}
      {...props}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
