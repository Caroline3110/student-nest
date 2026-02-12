import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  // Animation values
  const logoOpacity = new Animated.Value(0);
  const logoScale = new Animated.Value(0.3);
  const textOpacity = new Animated.Value(0);
  const taglineOpacity = new Animated.Value(0);

  useEffect(() => {
    // Run animations in sequence
    Animated.sequence([
      // Step 1: Fade in and scale up logo
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Step 2: Fade in app name
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Step 3: Fade in tagline
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After animations finish, wait 1 second then go to app
      setTimeout(() => {
        onFinish();
      }, 1000);
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Background circles for visual interest */}
      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />

      {/* Logo */}
      <Animated.View style={[
        styles.logoContainer,
        {
          opacity: logoOpacity,
          transform: [{ scale: logoScale }]
        }
      ]}>
        <Text style={styles.logoEmoji}>🏠</Text>
      </Animated.View>

      {/* App Name */}
      <Animated.Text style={[
        styles.appName,
        { opacity: textOpacity }
      ]}>
        Student Nest
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[
        styles.tagline,
        { opacity: taglineOpacity }
      ]}>
        Your home away from home
      </Animated.Text>

      {/* Loading dots */}
      <Animated.View style={[
        styles.loadingContainer,
        { opacity: taglineOpacity }
      ]}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circleBottom: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  logoEmoji: {
    fontSize: 64,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 12,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 60,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});