import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useLanguage } from '../../i18n';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

const chat = httpsCallable(functions, 'chat');

const SUGGESTIONS = [
  { key: 'restaurants', emoji: '🍕' },
  { key: 'supermarkets', emoji: '🛒' },
  { key: 'meals', emoji: '🍳' },
  { key: 'plan', emoji: '💰' },
  { key: 'save', emoji: '💡' },
  { key: 'takeaway', emoji: '🍔' },
];

export default function BudgetBuddyScreen({ navigation }) {
  const { t, lang } = useLanguage();
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
        bot: 'budget',
        lang,
        messages: next.map(m => ({ role: m.role, content: m.content })),
      });
      const reply = data?.reply ?? t('chat.noResponse');
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Budget Buddy error:', error.message);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: error.code === 'functions/resource-exhausted' ? t('chat.busy') : t('chat.connectionError'),
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  };

  const hasMessages = messages.length > 0;

  // Pair up suggestions into rows of 2
  const suggestionRows = [];
  for (let i = 0; i < SUGGESTIONS.length; i += 2) {
    suggestionRows.push(SUGGESTIONS.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarEmoji}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>{t('budget.title')}</Text>
            <Text style={styles.headerSub}>{t('budget.subtitle')}</Text>
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

          {/* Welcome screen — shown before any messages */}
          {!hasMessages && (
            <View style={styles.welcome}>
              <View style={styles.bigAvatar}>
                <Text style={styles.bigAvatarEmoji}>🤖</Text>
              </View>
              <Text style={styles.welcomeTitle}>{t('budget.welcome')}</Text>
              <Text style={styles.welcomeSub}>
                {t('budget.welcomeSub')}
              </Text>

              {/* Suggestion grid — rows of 2 */}
              {suggestionRows.map((row, rowIdx) => (
                <View key={rowIdx} style={styles.cardRow}>
                  {row.map((s, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.card}
                      onPress={() => sendMessage(t(`budget.suggestions.${s.key}.prompt`))}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.cardEmoji}>{s.emoji}</Text>
                      <Text style={styles.cardLabel}>{t(`budget.suggestions.${s.key}.label`)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
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
                  <Text style={styles.msgAvatarEmoji}>🤖</Text>
                </View>
              )}
              <View style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                {msg.role === 'assistant' && <Text style={styles.aiLabel}>{t('budget.title')}</Text>}
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
                <Text style={styles.msgAvatarEmoji}>🤖</Text>
              </View>
              <View style={[styles.bubble, styles.aiBubble, styles.typingRow]}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.typingText}>{t('chat.thinking')}</Text>
              </View>
            </View>
          )}

          {/* Quick-tap chips after conversation starts */}
          {hasMessages && !isLoading && (
            <View style={styles.chipsWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                {SUGGESTIONS.map((s, i) => (
                  <TouchableOpacity key={i} style={styles.chip} onPress={() => sendMessage(t(`budget.suggestions.${s.key}.prompt`))} activeOpacity={0.75}>
                    <Text style={styles.chipEmoji}>{s.emoji}</Text>
                    <Text style={styles.chipText}>{t(`budget.suggestions.${s.key}.label`)}</Text>
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
            placeholder={t('budget.placeholder')}
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

  /* Header */
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

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 12 },

  /* Welcome */
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

  /* Messages */
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

  /* Chips */
  chipsWrap: { marginTop: 4, marginBottom: 4, marginHorizontal: -16 },
  chips: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primaryLight,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
  },
  chipEmoji: { fontSize: 13 },
  chipText: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  /* Input */
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
