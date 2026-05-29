import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

const MODES = {
  focus: { label: 'Focus', duration: 25 * 60, sub: '25 min session' },
  break: { label: 'Break', duration: 5 * 60, sub: '5 min break' },
};

export default function PomodoroScreen({ navigation }) {
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    if (mode === 'focus') {
      setSessions(s => s + 1);
      Alert.alert('Session complete', 'Take a 5-minute break.', [
        { text: 'Start break', onPress: () => switchMode('break') },
      ]);
    } else {
      Alert.alert('Break over', 'Ready to focus?', [
        { text: 'Start focus', onPress: () => switchMode('focus') },
      ]);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setTimeLeft(MODES[m].duration);
    setIsActive(true);
  };

  const handleModePress = (m) => {
    setIsActive(false);
    setMode(m);
    setTimeLeft(MODES[m].duration);
  };

  const reset = () => { setIsActive(false); setTimeLeft(MODES[mode].duration); };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const total = MODES[mode].duration;
  const progress = ((total - timeLeft) / total) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Focus timer</Text>
        <Text style={styles.headerSubtitle}>Pomodoro technique</Text>
      </View>

      <View style={styles.content}>
        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{sessions}</Text>
            <Text style={styles.statLabel}>Sessions today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{sessions * 25}</Text>
            <Text style={styles.statLabel}>Minutes focused</Text>
          </View>
        </View>

        {/* Timer */}
        <View style={styles.timerArea}>
          <View style={styles.timerRing}>
            <Text style={styles.timerMode}>{MODES[mode].label.toUpperCase()}</Text>
            <Text style={styles.timerDisplay}>{fmt(timeLeft)}</Text>
            <Text style={styles.timerSub}>{MODES[mode].sub}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.primaryBtn, isActive && styles.pauseBtn]}
            onPress={() => setIsActive(!isActive)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>{isActive ? 'Pause' : 'Start'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={reset} activeOpacity={0.7}>
            <Text style={styles.secondaryBtnText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Mode toggle */}
        <View style={styles.modeRow}>
          {Object.entries(MODES).map(([key, val]) => (
            <TouchableOpacity
              key={key}
              style={[styles.modeBtn, mode === key && styles.modeBtnActive]}
              onPress={() => handleModePress(key)}
            >
              <Text style={[styles.modeBtnText, mode === key && styles.modeBtnTextActive]}>
                {val.label} · {val.duration / 60} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips</Text>
          {[
            'Remove all distractions before starting',
            'Focus on one task per session',
            'Use breaks to rest, not scroll',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface, paddingHorizontal: 20,
    paddingTop: 12, paddingBottom: 18,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backButton: { marginBottom: 12 },
  backButtonText: { fontSize: 14, fontWeight: '500', color: Colors.textLight },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.4, marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: Colors.textLight },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  statsCard: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    padding: 18, marginBottom: 28,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
  statNum: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5, marginBottom: 3 },
  statLabel: { fontSize: 12, color: Colors.textLight },
  timerArea: { alignItems: 'center', marginBottom: 28 },
  timerRing: {
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: Colors.surface,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  timerMode: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 6 },
  timerDisplay: { fontSize: 52, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -2, marginBottom: 6 },
  timerSub: { fontSize: 12, color: Colors.textMuted },
  progressTrack: { width: 180, height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.textPrimary, borderRadius: 2 },
  controls: { gap: 9, marginBottom: 14 },
  primaryBtn: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  pauseBtn: { backgroundColor: Colors.textSecondary },
  primaryBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  secondaryBtn: {
    backgroundColor: Colors.surface, paddingVertical: 13,
    borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  secondaryBtnText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '500' },
  modeRow: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: 10, padding: 4, gap: 4,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 16,
  },
  modeBtn: { flex: 1, paddingVertical: 9, borderRadius: 7, alignItems: 'center' },
  modeBtnActive: { backgroundColor: Colors.primary },
  modeBtnText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  modeBtnTextActive: { color: Colors.white, fontWeight: '600' },
  tipsCard: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, padding: 14,
  },
  tipsTitle: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  tipDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  tipText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
});