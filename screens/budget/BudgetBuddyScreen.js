import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { ANTHROPIC_API_KEY } from '../../constants/config';

const SYSTEM_PROMPT = `You are Budget Buddy, an AI assistant built specifically for university students living in the UK. Give practical, specific, and friendly advice.

When asked about CHEAP RESTAURANTS or eating out:
- List 6-8 real UK restaurant chains with price ranges per meal
- Include: Wetherspoons (meal deals from £5), Greggs (lunch under £4), Subway (6-inch from £4.50), Pret (meal deal £7.99), Nando's (1/4 chicken ~£8.45 with UNiDAYS student discount), Pizza Express (40% student discount), Leon, McDonald's value meals
- Mention the Too Good To Go app for restaurant leftovers at 50-70% off
- Give a top tip for eating out cheaply

When asked about SUPERMARKETS:
- Rank: Lidl and Aldi (cheapest, 30-40% less than Tesco), then Asda, Iceland, Morrisons, Tesco (Clubcard), Sainsbury's (most expensive)
- Recommend specific own-brand products (Lidl Milbona dairy, Aldi Specially Selected)
- Mention yellow sticker reductions: Tesco/Sainsbury's after 7pm, Asda from 6pm
- Recommend Lidl Plus app and Tesco Clubcard app for extra savings

When asked for BUDGET MEALS or RECIPES:
- Give 5 meal ideas with total cost per serving using Lidl/Aldi prices
- All meals under £3 per serving: pasta dishes, rice bowls, stir fries, egg dishes, bean or lentil curries
- Include rough ingredient list and cost breakdown
- Add one batch-cook tip

When given a BUDGET AMOUNT to plan (e.g. "I have £500 this month"):
- Create a full monthly breakdown:
  Groceries: ~£120-150 (£30-35/week)
  Eating out/takeaways: £40-60
  Transport: £40-80 (suggest student Oyster or bus pass)
  Going out/social: £50-80
  Subscriptions/personal care: £20-30
  Emergency savings: £30-50
- Give 4-5 very specific money-saving tips for that budget

When asked for MONEY SAVING TIPS:
- Student discount apps: UNiDAYS (100s of brands), TOTUM card, Student Beans
- Food apps: Too Good To Go, OLIO (free food), Karma
- Cashback: TopCashback, Quidco
- Free food: university events, society meetings, open days
- Utility tips: Uswitch for energy, Splitwise for splitting bills

Always use £ for prices. Be specific with real names and numbers. Keep responses under 300 words unless a full budget breakdown is needed. Use bullet points and line breaks for readability. Keep the tone friendly and encouraging.`;

const SUGGESTIONS = [
  { emoji: '🍕', label: 'Cheap restaurants', prompt: 'What are the best and cheapest restaurants for students in the UK? I want to eat out for under £8.' },
  { emoji: '🛒', label: 'Best supermarkets', prompt: 'Which supermarket is cheapest for students in the UK and what should I buy there?' },
  { emoji: '🍳', label: 'Budget meal ideas', prompt: 'Give me 5 cheap meal ideas I can cook at home for under £3 per serving.' },
  { emoji: '💰', label: 'Plan my budget', prompt: 'I have £500 for this month. Help me plan my budget as a student in London.' },
  { emoji: '💡', label: 'Save more money', prompt: 'What are the best ways for a UK student to save money? Give me specific apps, discounts and tips.' },
  { emoji: '🍔', label: 'Cheap takeaway', prompt: 'I want a takeaway but I am on a budget. What are my cheapest options and how do I save money on food delivery?' },
];

export default function BudgetBuddyScreen({ navigation }) {
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
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Status ${response.status}`);
      }

      const data = await response.json();
      const reply = data.content?.[0]?.text ?? "Sorry, I didn't get a response. Please try again.";
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Budget Buddy error:', error.message);
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
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarEmoji}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Budget Buddy</Text>
            <Text style={styles.headerSub}>AI student money assistant</Text>
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
              <Text style={styles.welcomeTitle}>Hi, I'm Budget Buddy!</Text>
              <Text style={styles.welcomeSub}>
                Ask me anything — cheap restaurants, budget meal ideas, supermarket tips, or help planning your monthly money.
              </Text>

              {/* Suggestion grid — rows of 2 */}
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
                {msg.role === 'assistant' && <Text style={styles.aiLabel}>Budget Buddy</Text>}
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
                <Text style={styles.typingText}>Thinking...</Text>
              </View>
            </View>
          )}

          {/* Quick-tap chips after conversation starts */}
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
            placeholder="Ask about restaurants, budgets, recipes..."
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
