import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

const chat = httpsCallable(functions, 'chat');

const SUGGESTIONS = [
  { emoji: '📅', label: 'Weekend work', prompt: 'I am a student in London looking for part-time weekend work. What are my best options and where should I apply?' },
  { emoji: '☀️', label: 'Summer jobs', prompt: 'What are the best short-term summer jobs for students in the UK? I want to earn as much as possible.' },
  { emoji: '🎓', label: 'Graduate schemes', prompt: 'I am in my final year and looking for graduate schemes and internships. Where do I start?' },
  { emoji: '💻', label: 'Remote jobs', prompt: 'Are there good remote or work from home jobs for students with flexible hours around lectures?' },
  { emoji: '🍺', label: 'Hospitality & bars', prompt: 'I want to work in a bar or restaurant. How do I find hospitality jobs near my university?' },
  { emoji: '👨‍💻', label: 'Tech internships', prompt: 'I study Computer Science and I am looking for tech internships or junior developer roles. Where should I apply?' },
];

const JOB_BOARDS = [
  { name: 'Indeed UK', url: 'https://uk.indeed.com', emoji: '🔍' },
  { name: 'StudentJob UK', url: 'https://www.studentjob.co.uk', emoji: '🎓' },
  { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs', emoji: '💼' },
  { name: 'Totaljobs', url: 'https://www.totaljobs.com', emoji: '📋' },
  { name: 'Milkround', url: 'https://www.milkround.com', emoji: '🥛' },
  { name: 'Prospects', url: 'https://www.prospects.ac.uk', emoji: '📈' },
];

export default function PartTimeJobsScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { id: Date.now(), role: 'user', content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInputText('');
    setIsLoading(true);

    try {
      const { data } = await chat({
        bot: 'jobs',
        messages: next.map(m => ({ role: m.role, content: m.content })),
      });
      const reply = data?.reply ?? "Sorry, I didn't get a response. Please try again.";
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Job Buddy error:', error.message);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I couldn't connect right now. Please check your internet and try again.",
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  };

  const hasMessages = messages.length > 0;

  const suggestionRows = [];
  for (let i = 0; i < SUGGESTIONS.length; i += 2) {
    suggestionRows.push(SUGGESTIONS.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarEmoji}>💼</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Job Buddy</Text>
            <Text style={styles.headerSub}>AI student job assistant</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >

          {/* Welcome screen */}
          {!hasMessages && (
            <View style={styles.welcome}>
              <View style={styles.bigAvatar}>
                <Text style={styles.bigAvatarEmoji}>💼</Text>
              </View>
              <Text style={styles.welcomeTitle}>Hi, I'm Job Buddy!</Text>
              <Text style={styles.welcomeSub}>
                Tell me what you're looking for — part-time work, summer jobs, internships or graduate schemes — and I'll point you in the right direction.
              </Text>

              {/* Suggestion grid */}
              {suggestionRows.map((row, rowIdx) => (
                <View key={rowIdx} style={styles.cardRow}>
                  {row.map((s, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.card}
                      onPress={() => sendMessage(s.prompt)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.cardEmoji}>{s.emoji}</Text>
                      <Text style={styles.cardLabel}>{s.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              {/* Job boards quick links */}
              <Text style={styles.boardsTitle}>Quick links — job boards</Text>
              <View style={styles.boardsGrid}>
                {JOB_BOARDS.map((b, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.boardCard}
                    onPress={() => Linking.openURL(b.url)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.boardEmoji}>{b.emoji}</Text>
                    <Text style={styles.boardName}>{b.name}</Text>
                    <Text style={styles.boardArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Chat messages */}
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[styles.msgRow, msg.role === 'user' ? styles.msgRowUser : styles.msgRowAI]}
            >
              {msg.role === 'assistant' && (
                <View style={styles.msgAvatar}>
                  <Text style={styles.msgAvatarEmoji}>💼</Text>
                </View>
              )}
              <View style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                {msg.role === 'assistant' && <Text style={styles.aiLabel}>Job Buddy</Text>}
                <Text style={msg.role === 'user' ? styles.userText : styles.aiText}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <View style={styles.msgRowAI}>
              <View style={styles.msgAvatar}>
                <Text style={styles.msgAvatarEmoji}>💼</Text>
              </View>
              <View style={[styles.bubble, styles.aiBubble, styles.typingRow]}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.typingText}>Thinking...</Text>
              </View>
            </View>
          )}

          {/* Quick chips after conversation starts */}
          {hasMessages && !isLoading && (
            <View style={styles.chipsWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                {SUGGESTIONS.map((s, i) => (
                  <TouchableOpacity key={i} style={styles.chip} onPress={() => sendMessage(s.prompt)} activeOpacity={0.75}>
                    <Text style={styles.chipEmoji}>{s.emoji}</Text>
                    <Text style={styles.chipText}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

        </ScrollView>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="What kind of work are you looking for?"
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage(inputText)}
            multiline
            maxLength={500}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnOff]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },

  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 14, color: Colors.textLight, fontWeight: '500' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  headerAvatarEmoji: { fontSize: 18 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 },
  headerSub: { fontSize: 11, color: Colors.textLight, marginTop: 1 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 12 },

  welcome: { paddingTop: 16, paddingBottom: 12 },
  bigAvatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: 14,
  },
  bigAvatarEmoji: { fontSize: 34 },
  welcomeTitle: {
    fontSize: 22, fontWeight: '700', color: Colors.textPrimary,
    letterSpacing: -0.3, textAlign: 'center', marginBottom: 8,
  },
  welcomeSub: {
    fontSize: 14, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 21, marginBottom: 24, paddingHorizontal: 8,
  },
  cardRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, padding: 14,
  },
  cardEmoji: { fontSize: 24, marginBottom: 8 },
  cardLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, lineHeight: 18 },

  boardsTitle: {
    fontSize: 11, fontWeight: '600', color: Colors.textLight,
    letterSpacing: 0.8, textTransform: 'uppercase',
    marginTop: 8, marginBottom: 12,
  },
  boardsGrid: { gap: 8 },
  boardCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    gap: 10,
  },
  boardEmoji: { fontSize: 18 },
  boardName: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  boardArrow: { fontSize: 20, color: Colors.textLight },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  msgRowUser: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, justifyContent: 'flex-end' },
  msgRowAI: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, justifyContent: 'flex-start' },
  msgAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8, marginBottom: 2, flexShrink: 0,
  },
  msgAvatarEmoji: { fontSize: 14 },
  bubble: { maxWidth: '78%', borderRadius: 16, padding: 12 },
  userBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  aiBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  aiLabel: {
    fontSize: 10, fontWeight: '700', color: Colors.primary,
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 5,
  },
  userText: { fontSize: 14, lineHeight: 22, color: Colors.white },
  aiText: { fontSize: 14, lineHeight: 22, color: Colors.textPrimary },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  typingText: { fontSize: 13, color: Colors.textMuted },

  chipsWrap: { marginTop: 4, marginBottom: 4, marginHorizontal: -16 },
  chips: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primaryLight,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
  },
  chipEmoji: { fontSize: 13 },
  chipText: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  input: {
    flex: 1, backgroundColor: Colors.background,
    borderRadius: 22, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, maxHeight: 110, color: Colors.textPrimary,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnOff: { opacity: 0.3 },
  sendIcon: { color: Colors.white, fontSize: 20, fontWeight: '700' },
});
