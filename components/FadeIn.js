import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

// Fades its children in on mount. variant 'up' slides up a little,
// 'pop' scales in with a small overshoot. Use delay to stagger siblings.
export default function FadeIn({ delay = 0, variant = 'up', style, children }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = variant === 'pop'
      ? Animated.spring(progress, { toValue: 1, delay, speed: 14, bounciness: 10, useNativeDriver: true })
      : Animated.timing(progress, {
          toValue: 1, delay, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        });
    anim.start();
    return () => anim.stop();
  }, []);

  const transform = variant === 'pop'
    ? [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }]
    : [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }];

  return (
    <Animated.View
      style={[style, { opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }), transform }]}
    >
      {children}
    </Animated.View>
  );
}
