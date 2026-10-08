import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Colors from '../constants/Colors';
import { useT } from '../i18n';

export default function SplashScreen({ onFinish }) {
  const t = useT();
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(12);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(onFinish, 1200);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inner, { opacity, transform: [{ translateY }] }]}>
        <View style={styles.logoMark}>
          <View style={styles.logoInner} />
        </View>
        <Text style={styles.wordmark}>Student Nest</Text>
        <Text style={styles.tagline}>{t('splash.tagline')}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: { alignItems: 'center' },
  logoMark: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  logoInner: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  wordmark: {
    fontSize: 26, fontWeight: '700', color: Colors.primary,
    letterSpacing: -0.5, marginBottom: 8,
  },
  tagline: {
    fontSize: 13, color: Colors.textLight, letterSpacing: 0.2,
  },
});