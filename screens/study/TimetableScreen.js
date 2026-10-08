import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import * as DocumentPicker from 'expo-document-picker';
import ICAL from 'ical.js';
import { db, auth } from '../../firebase';
import {
  collection, addDoc, query, onSnapshot, deleteDoc, doc,
} from 'firebase/firestore';

const IMPORT_COLORS = [
  '#DC2626', '#111111', '#71717A', '#D97706', '#16A34A', '#2563EB',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetableScreen({ navigation }) {
  const [timetable, setTimetable] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newClass, setNewClass] = useState({
    subject: '', day: 'Monday', startTime: '09:00',
    endTime: '11:00', location: '', lecturer: '', color: IMPORT_COLORS[0],
  });

  useEffect(() => {
    if (!auth.currentUser) return;
    const ref = collection(db, 'users', auth.currentUser.uid, 'timetable');
    const q = query(ref);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = [];
      snapshot.forEach((d) => {
        loaded.push({ id: d.id, ...d.data() });
      });
      console.log('Loaded classes:', loaded.length);
      setTimetable(loaded);
    }, (error) => {
      console.error('Error loading timetable:', error);
    });
    return unsubscribe;
  }, []);

  const resetNewClass = () => setNewClass({
    subject: '', day: 'Monday', startTime: '09:00',
    endTime: '11:00', location: '', lecturer: '', color: IMPORT_COLORS[0],
  });

  const parseEvents = (vevents) => {
    const imported = [];
    vevents.forEach((vevent, index) => {
      const event = new ICAL.Event(vevent);
      const summary = event.summary || 'Untitled Class';
      const location = event.location || 'TBA';
      const description = event.description || '';
      const startDate = event.startDate.toJSDate();
      const endDate = event.endDate.toJSDate();
      const startTimeStr = startDate.toTimeString().slice(0, 5);
      const endTimeStr = endDate.toTimeString().slice(0, 5);
      const dayFull = startDate.toLocaleDateString('en-US', { weekday: 'long' });

      if (!DAYS.includes(dayFull)) return;

      let lecturer = 'TBA';
      if (description.includes('Lecturer:'))
        lecturer = description.split('Lecturer:')[1].split('\n')[0].trim();
      else if (description.includes('Staff:'))
        lecturer = description.split('Staff:')[1].split('\n')[0].trim();

      const duplicate = imported.some(
        c => c.subject === summary && c.day === dayFull && c.startTime === startTimeStr
      );
      if (!duplicate) {
        imported.push({
          subject: summary, day: dayFull,
          startTime: startTimeStr, endTime: endTimeStr,
          location, lecturer,
          color: IMPORT_COLORS[index % IMPORT_COLORS.length],
          createdAt: new Date().toISOString(),
        });
      }
    });
    return imported;
  };

  const addClass = async () => {
    if (!newClass.subject.trim()) {
      Alert.alert('Missing subject', 'Please enter a subject name'); return;
    }
    try {
      const ref = collection(db, 'users', auth.currentUser.uid, 'timetable');
      await addDoc(ref, {
        ...newClass,
        location: newClass.location || 'TBA',
        lecturer: newClass.lecturer || 'TBA',
        createdAt: new Date().toISOString(),
      });
      setModalVisible(false);
      resetNewClass();
      console.log('Class added');
    } catch (error) {
      console.error('Error adding class:', error);
      Alert.alert('Error', 'Could not save class');
    }
  };

  const deleteClass = (id) => {
    Alert.alert('Delete class', 'Remove this class from your timetable?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'timetable', id));
            console.log('Class deleted');
          } catch (error) {
            console.error('Error deleting class:', error);
            Alert.alert('Error', 'Could not delete class');
          }
        },
      },
    ]);
  };

  const importFromFile = async () => {
    try {
      setImportModalVisible(false);
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) return;
      const icsText = await (await fetch(result.assets[0].uri)).text();
      const comp = new ICAL.Component(ICAL.parse(icsText));
      const vevents = comp.getAllSubcomponents('vevent');
      if (!vevents.length) { Alert.alert('No events found', 'This .ics file contains no calendar events'); return; }
      const imported = parseEvents(vevents);
      if (!imported.length) { Alert.alert('No classes found', 'Could not find any weekday classes in the .ics file'); return; }
      const ref = collection(db, 'users', auth.currentUser.uid, 'timetable');
      await Promise.all(imported.map(cls => addDoc(ref, cls)));
      Alert.alert('Import successful', `Imported ${imported.length} classes`);
    } catch {
      Alert.alert('Import failed', "Could not read the file. Make sure it's a valid .ics calendar file.");
    }
  };

  const importFromURL = async () => {
    if (!urlInput.trim()) return;
    setIsLoading(true);
    try {
      const cleanUrl = urlInput.trim().replace(/^webcal:\/\//i, 'https://');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(cleanUrl, {
        signal: controller.signal,
        headers: { Accept: 'text/calendar, text/plain, */*' },
      });
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const icsText = await response.text();
      if (!icsText.trim().startsWith('BEGIN:VCALENDAR')) {
        Alert.alert('Link not working', 'This link redirected to a login page. Look for a "Subscribe" or "Export" button in your timetable portal and copy that direct link.');
        return;
      }
      const comp = new ICAL.Component(ICAL.parse(icsText));
      const vevents = comp.getAllSubcomponents('vevent');
      if (!vevents.length) { Alert.alert('No events found', 'This link contains no calendar events'); return; }
      const imported = parseEvents(vevents);
      if (!imported.length) { Alert.alert('No classes found', 'Could not find any weekday classes'); return; }
      const ref = collection(db, 'users', auth.currentUser.uid, 'timetable');
      await Promise.all(imported.map(cls => addDoc(ref, cls)));
      setImportModalVisible(false);
      setUrlInput('');
      Alert.alert('Import successful', `Imported ${imported.length} classes`);
    } catch (error) {
      let msg = 'Could not fetch the timetable. ';
      if (error.name === 'AbortError') msg += 'Request timed out after 30s.';
      else if (error.message.includes('401') || error.message.includes('403'))
        msg = 'This link requires login. Look for a "Subscribe" or "Export" option to get a direct .ics link.';
      else if (error.message.includes('HTTP')) msg += error.message;
      else msg += 'Check the URL and your internet connection.';
      Alert.alert('Import failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getClassesForDay = (day) =>
    timetable.filter(c => c.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Timetable</Text>
        <Text style={styles.headerSubtitle}>Weekly class schedule</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {DAYS.map(day => {
          const classes = getClassesForDay(day);
          const isToday = day === today;
          return (
            <View key={day} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
                  {day}{isToday ? ' · Today' : ''}
                </Text>
                <Text style={[styles.classCount, isToday && styles.classCountToday]}>
                  {classes.length} {classes.length === 1 ? 'class' : 'classes'}
                </Text>
              </View>

              {classes.length === 0 ? (
                <View style={styles.emptyDay}>
                  <Text style={styles.emptyDayText}>No classes</Text>
                </View>
              ) : classes.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.classCard}
                  onLongPress={() => deleteClass(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.colorBar, { backgroundColor: item.color || Colors.primary }]} />
                  <View style={styles.classContent}>
                    <View style={styles.classRow}>
                      <Text style={styles.classSubject} numberOfLines={1}>{item.subject}</Text>
                      <Text style={styles.classTime}>{item.startTime} – {item.endTime}</Text>
                    </View>
                    <Text style={styles.classMeta}>{item.location} · {item.lecturer}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Import FAB */}
      <TouchableOpacity style={styles.importFab} onPress={() => setImportModalVisible(true)} activeOpacity={0.85}>
        <Text style={styles.importFabText}>↗</Text>
      </TouchableOpacity>

      {/* Add FAB */}
      <TouchableOpacity style={styles.addFab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Text style={styles.addFabText}>+</Text>
      </TouchableOpacity>

      {/* Import Modal */}
      <Modal
        visible={importModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => { setImportModalVisible(false); setUrlInput(''); }}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Import timetable</Text>

            <Text style={styles.fieldLabel}>Paste timetable link (.ics / webcal)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://... or webcal://..."
              placeholderTextColor={Colors.textMuted}
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              editable={!isLoading}
            />
            {isLoading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>Fetching timetable...</Text>
              </View>
            )}
            <View style={styles.sheetBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setImportModalVisible(false); setUrlInput(''); }}
                disabled={isLoading}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, isLoading && { opacity: 0.5 }]}
                onPress={importFromURL}
                disabled={isLoading}
              >
                <Text style={styles.confirmText}>Import URL</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.fileBtn} onPress={importFromFile} disabled={isLoading}>
              <Text style={styles.fileBtnText}>Choose .ics file from device</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Class Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={{ justifyContent: 'flex-end' }} showsVerticalScrollIndicator={false}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Add class</Text>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Subject *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Operating Systems"
                  placeholderTextColor={Colors.textMuted}
                  value={newClass.subject}
                  onChangeText={t => setNewClass({ ...newClass, subject: t })}
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Day</Text>
                <View style={styles.dayBtns}>
                  {DAYS.map(d => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.dayBtn, newClass.day === d && styles.dayBtnActive]}
                      onPress={() => setNewClass({ ...newClass, day: d })}
                    >
                      <Text style={[styles.dayBtnText, newClass.day === d && styles.dayBtnTextActive]}>
                        {d.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeWrap}>
                  <Text style={styles.fieldLabel}>Start</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="09:00"
                    placeholderTextColor={Colors.textMuted}
                    value={newClass.startTime}
                    onChangeText={t => setNewClass({ ...newClass, startTime: t })}
                  />
                </View>
                <View style={styles.timeWrap}>
                  <Text style={styles.fieldLabel}>End</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="11:00"
                    placeholderTextColor={Colors.textMuted}
                    value={newClass.endTime}
                    onChangeText={t => setNewClass({ ...newClass, endTime: t })}
                  />
                </View>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeWrap}>
                  <Text style={styles.fieldLabel}>Location</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Room 3.14"
                    placeholderTextColor={Colors.textMuted}
                    value={newClass.location}
                    onChangeText={t => setNewClass({ ...newClass, location: t })}
                  />
                </View>
                <View style={styles.timeWrap}>
                  <Text style={styles.fieldLabel}>Lecturer</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Dr. Smith"
                    placeholderTextColor={Colors.textMuted}
                    value={newClass.lecturer}
                    onChangeText={t => setNewClass({ ...newClass, lecturer: t })}
                  />
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Colour</Text>
                <View style={styles.colorRow}>
                  {IMPORT_COLORS.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorDot,
                        { backgroundColor: c },
                        newClass.color === c && styles.colorDotSelected,
                      ]}
                      onPress={() => setNewClass({ ...newClass, color: c })}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.sheetBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={addClass}>
                  <Text style={styles.confirmText}>Add class</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  scroll: { flex: 1 },
  daySection: { marginBottom: 4 },
  dayHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  dayName: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  dayNameToday: { color: Colors.primary },
  classCount: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  classCountToday: { color: Colors.primary },
  emptyDay: {
    marginHorizontal: 20, paddingVertical: 16,
    backgroundColor: Colors.surface, borderRadius: 12,
    alignItems: 'center', borderWidth: 1,
    borderColor: Colors.border, borderStyle: 'dashed',
  },
  emptyDayText: { fontSize: 12, color: Colors.textMuted },
  classCard: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 8,
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  colorBar: { width: 4 },
  classContent: { flex: 1, padding: 14 },
  classRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5, gap: 8 },
  classSubject: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  classTime: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, flexShrink: 0 },
  classMeta: { fontSize: 12, color: Colors.textMuted },
  addFab: {
    position: 'absolute', right: 20, bottom: 28,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  addFabText: { fontSize: 26, color: Colors.white, fontWeight: '300', lineHeight: 30 },
  importFab: {
    position: 'absolute', left: 20, bottom: 28,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  importFabText: { fontSize: 20, color: Colors.textPrimary, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 40,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 18,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 18 },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 10, fontWeight: '600', color: Colors.textMuted,
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 7,
  },
  input: {
    backgroundColor: Colors.background, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 13, paddingVertical: 11,
    fontSize: 14, color: Colors.textPrimary,
  },
  dayBtns: { flexDirection: 'row', gap: 6 },
  dayBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 8,
    backgroundColor: Colors.background, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  dayBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayBtnText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  dayBtnTextActive: { color: Colors.white, fontWeight: '700' },
  timeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  timeWrap: { flex: 1 },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  colorDotSelected: { borderColor: Colors.textPrimary, borderWidth: 3 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  loadingText: { fontSize: 13, color: Colors.textSecondary },
  sheetBtns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  confirmBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center' },
  confirmText: { fontSize: 14, fontWeight: '600', color: Colors.white },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  fileBtn: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingVertical: 13, alignItems: 'center', backgroundColor: Colors.background,
  },
  fileBtnText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
});
