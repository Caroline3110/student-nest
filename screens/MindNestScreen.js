import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';

const MESSAGES = [
  "Hey, you made it here. That counts. 💛",
  "No pressure today. Just check in with yourself.",
  "London is loud. Let's make this space quiet.",
  "One small reset can change the whole day.",
  "You're doing better than you think.",
  "It's okay to not be okay. Start here.",
];

const MOODS = [
  { label: 'Overwhelmed', emoji: '😰', bg: '#F5F0FF' },
  { label: 'Lonely',      emoji: '😔', bg: '#EFF6FF' },
  { label: 'Tired',       emoji: '😴', bg: '#F0F9FF' },
  { label: 'Anxious',     emoji: '😟', bg: '#FAF0FF' },
  { label: 'Motivated',   emoji: '💪', bg: '#F0FFF4' },
  { label: 'Numb',        emoji: '😶', bg: '#F9FAFB' },
  { label: 'Stressed',    emoji: '😤', bg: '#FFF0F0' },
  { label: 'Calm',        emoji: '😌', bg: '#F0FFF4' },
  { label: 'Homesick',    emoji: '🏠', bg: '#FFF7ED' },
  { label: 'Burnt out',   emoji: '🔥', bg: '#FFF0F0' },
];

const CAUSES = [
  'Uni work', 'Money', 'Friends', 'Family', 'Sleep',
  'Health', 'Homesickness', 'Job', 'Relationship', 'Future/career', "I don't know",
];

const getResponse = (mood, cause) => {
  const map = {
    'Anxious-Uni work':        "Your brain is trying to handle too many tabs at once. That's not a flaw — it's overload. Let's close one tab at a time.",
    'Anxious-Money':           "Money anxiety sits in your chest all day. You're not failing — you're dealing with something genuinely hard.",
    'Overwhelmed-Uni work':    "When everything feels urgent, nothing gets done. The goal right now isn't to do everything — it's to do one thing.",
    'Overwhelmed-Future/career': "Feeling overwhelmed about the future is almost universal for students. The future is built one day at a time.",
    'Lonely-Friends':          "London can feel isolating even with millions of people around you. You're not the only one feeling this right now.",
    'Lonely-Homesickness':     "Missing home is one of the most quietly painful feelings. Your roots are still yours — you haven't lost them.",
    'Homesick-Homesickness':   "Homesickness means you had something worth missing. That's beautiful, even when it hurts.",
    'Homesick-Family':         "Being far from family is genuinely hard. It doesn't mean you're weak — it means you love them.",
    'Burnt out-Uni work':      "Burnout isn't weakness — it's what happens when you've been pushing too hard for too long. You deserve real rest.",
    'Stressed-Uni work':       "Stress before deadlines is normal. Let's figure out what's actually due and what can wait.",
    'Stressed-Money':          "Financial stress is exhausting because it's always there. Let's find one thing to do about it today.",
    'Tired-Sleep':             "A tired brain can't think, focus, or feel okay. Sleep isn't lazy — it's the most productive thing you can do right now.",
    'Tired-Uni work':          "Studying when exhausted is like running with ankle weights. Rest first, then work shorter and smarter.",
    'Motivated-Uni work':      "That energy is gold. Let's channel it well so it lasts — not burn out in one burst.",
    'Numb-I don\'t know':      "Sometimes not knowing what we feel is a feeling in itself. You don't need to understand it — just be here.",
  };
  return map[`${mood}-${cause}`] ||
    `Feeling ${mood.toLowerCase()} because of ${cause.toLowerCase()} is completely valid. You don't have to fix everything today — just start with one small, gentle thing.`;
};

const HELP_CARDS = [
  { label: "I feel lonely in London", emoji: "🌆", bg: '#EFF6FF', border: '#BFDBFE',
    tips: ["Join a uni society — even one session changes things", "Visit your student union for free weekly events", "Try a 'study with strangers' session at a local café", "Your international office runs regular social events", "Volunteering is one of the best ways to meet people in London"] },
  { label: "I'm stressed about money", emoji: "💸", bg: '#FFFBEB', border: '#FDE68A',
    tips: ["Ask your university about the hardship fund — most have one", "Lidl and Aldi cut food bills by up to 40%", "UNiDAYS and TOTUM give student discounts everywhere", "Too Good To Go gets restaurant food for under £3", "Open Budget Buddy in this app for a full money plan"] },
  { label: "I can't focus", emoji: "🧠", bg: '#F0FFF4', border: '#BBF7D0',
    tips: ["Change location: library, café, or sit outside", "Phone in another room for just 25 minutes", "Brain dump everything on paper first", "Try lo-fi music or brown noise on YouTube", "Open Study Planner in this app for a Pomodoro session"] },
  { label: "I'm homesick", emoji: "🏠", bg: '#FFF7ED', border: '#FED7AA',
    tips: ["Cook a meal from home — familiar food is deeply comforting", "Find your country's cultural society at your university", "Schedule regular video calls home — consistency helps", "Create a small comfort corner in your room", "Write a letter to someone back home, even if unsent"] },
  { label: "I feel burnt out", emoji: "🔥", bg: '#FFF0F0', border: '#FECACA',
    tips: ["Burnout needs real rest — not just a short break", "Make a list of what can actually wait until next week", "Sleep before studying — rested brain learns 3× faster", "Talk to your personal tutor or academic advisor", "Your university counselling service is free — use it"] },
];

const THOUGHTS = [
  { label: "I'm so behind",            reframe: "Feeling behind usually means your tasks are unclear or too big — not that you're failing.",                           plan: ["Find your ONE most urgent task", "Break it into 20-minute steps", "Ignore everything else until it's done"] },
  { label: "I'm lazy",                 reframe: "What looks like laziness is almost always exhaustion or lack of clarity. Your brain is protecting itself.",           plan: ["Take a proper 20-min break (guilt-free)", "Write ONE thing to do today", "Start with the easiest task to build momentum"] },
  { label: "Everyone's doing better",  reframe: "You're comparing your inside to everyone else's outside. No one's Instagram shows the panic and all-nighters.",      plan: ["Close Instagram for 24 hours", "Write 3 things you've done this week, however small", "Check in on a friend — they're probably struggling too"] },
  { label: "I'm going to fail",        reframe: "That thought is your anxiety talking, not a fact. Most students who feel this way don't fail.",                       plan: ["Write down exactly what's due and when", "Identify the ONE thing that matters most this week", "Email your tutor — asking for help is strength"] },
  { label: "I can't focus",            reframe: "Unfocused doesn't mean permanently unproductive. It means your brain needs a different condition to work in.",        plan: ["Change your environment (library, café, outside)", "Try 25-minute Pomodoro sprints", "Phone on silent for just one session"] },
  { label: "I'm not good enough",      reframe: "You got into university. You're still here. That says something real about who you are.",                             plan: ["Name one thing you're genuinely good at", "Talk to a friend or your uni counsellor", "Remember: being here is enough for today"] },
];

const GARDEN_ITEMS = ['🌱','🌿','🌸','🌻','🌳','⭐','🕯️','📚','☁️','🦊','🌙','🌺','🍀','🌈','✨','🐝','🦋','🌾','🪴','🌏'];
const GARDEN_KEY = 'mindnest_garden_count';

const BREATH_PHASES = ['Breathe in...', 'Hold...', 'Breathe out...', 'Rest...'];
const BREATH_DURATIONS = [4000, 2000, 4000, 2000];
const BREATH_CYCLES = 4;

const RESET_OPTIONS = [
  { duration: '~50 sec', label: 'Breathing exercise',   emoji: '🫁', dest: 'breathing' },
  { duration: '~5 min',  label: 'Mini journal',          emoji: '📓', dest: 'journal'   },
  { duration: '~10 min', label: 'London calm walk',      emoji: '🚶', dest: 'walk'      },
  { duration: '~20 min', label: 'Burnout reset plan',    emoji: '🔥', dest: 'translator'},
];

export default function MindNestScreen({ navigation }) {
  const [view, setView] = useState('home');
  const [msgIdx, setMsgIdx] = useState(0);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedCause, setSelectedCause] = useState(null);
  const [gardenCount, setGardenCount] = useState(0);
  const [journalText, setJournalText] = useState('');
  const [journalDone, setJournalDone] = useState(false);
  const [selectedThought, setSelectedThought] = useState(null);
  const [expandedHelp, setExpandedHelp] = useState(null);
  const [breathPhase, setBreathPhase] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathDone, setBreathDone] = useState(false);

  const breathAnim = useRef(new Animated.Value(1)).current;
  const breathTimers = useRef([]);
  const breathSeq = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem(GARDEN_KEY).then(v => { if (v) setGardenCount(parseInt(v, 10)); });
  }, []);

  useEffect(() => {
    if (view !== 'home') return;
    const id = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 4000);
    return () => clearInterval(id);
  }, [view]);

  const addToGarden = () => {
    setGardenCount(prev => {
      const next = prev + 1;
      AsyncStorage.setItem(GARDEN_KEY, String(next)).catch(() => {});
      return next;
    });
  };

  const goHome = () => {
    stopBreathing();
    setSelectedMood(null);
    setSelectedCause(null);
    setSelectedThought(null);
    setExpandedHelp(null);
    setJournalDone(false);
    setJournalText('');
    setBreathDone(false);
    setView('home');
  };

  const startBreathing = () => {
    breathTimers.current.forEach(clearTimeout);
    breathTimers.current = [];
    breathAnim.setValue(1);
    setBreathDone(false);
    setIsBreathing(true);
    setBreathPhase(0);

    const cycleMs = BREATH_DURATIONS.reduce((a, b) => a + b, 0);
    for (let c = 0; c < BREATH_CYCLES; c++) {
      let offset = c * cycleMs;
      BREATH_DURATIONS.forEach((dur, p) => {
        breathTimers.current.push(setTimeout(() => setBreathPhase(p), offset));
        offset += dur;
      });
    }
    breathTimers.current.push(setTimeout(() => {
      setIsBreathing(false);
      setBreathDone(true);
    }, BREATH_CYCLES * cycleMs));

    const seq = [];
    for (let c = 0; c < BREATH_CYCLES; c++) {
      seq.push(
        Animated.timing(breathAnim, { toValue: 1.45, duration: 4000, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(breathAnim, { toValue: 1,    duration: 4000, useNativeDriver: true }),
        Animated.delay(2000),
      );
    }
    breathSeq.current = Animated.sequence(seq);
    breathSeq.current.start();
  };

  const stopBreathing = () => {
    breathTimers.current.forEach(clearTimeout);
    breathSeq.current?.stop();
    setIsBreathing(false);
    breathAnim.setValue(1);
  };

  const mood = selectedMood ? MOODS.find(m => m.label === selectedMood) : null;
  const bgColor = mood?.bg || Colors.background;

  // ── HOME ────────────────────────────────────────────────
  const renderHome = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.messageCard}>
        <Text style={styles.messageFox}>🦊</Text>
        <Text style={styles.messageText}>{MESSAGES[msgIdx]}</Text>
      </View>

      <View style={styles.gardenCard}>
        <View style={styles.gardenHeader}>
          <Text style={styles.gardenTitle}>Your MindNest Garden</Text>
          <Text style={styles.gardenCountText}>{gardenCount} check-in{gardenCount !== 1 ? 's' : ''}</Text>
        </View>
        {gardenCount === 0 ? (
          <Text style={styles.gardenEmpty}>Complete your first check-in to plant your first seed 🌱</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gardenRow}>
            {GARDEN_ITEMS.slice(0, Math.min(gardenCount, GARDEN_ITEMS.length)).map((item, i) => (
              <Text key={i} style={styles.gardenItem}>{item}</Text>
            ))}
            {gardenCount > GARDEN_ITEMS.length && (
              <Text style={styles.gardenMore}>+{gardenCount - GARDEN_ITEMS.length} more</Text>
            )}
          </ScrollView>
        )}
      </View>

      <Text style={styles.sectionLabel}>What do you need right now?</Text>

      {[
        { bg: '#EEF5FF', emoji: '💭', title: 'Daily check-in',             sub: 'How are you feeling today?',              dest: 'checkin'    },
        { bg: '#F0FFF4', emoji: '🔄', title: 'I need a reset',             sub: 'Quick tools to feel better now',          dest: 'reset'      },
        { bg: '#FFF7ED', emoji: '🌆', title: 'London student help',        sub: 'Lonely, stressed, homesick, burnt out',   dest: 'help'       },
        { bg: '#FAF0FF', emoji: '🔀', title: 'Study pressure translator',  sub: 'Reframe negative thoughts',               dest: 'translator' },
      ].map((card, i) => (
        <TouchableOpacity key={i} style={[styles.mainCard, { backgroundColor: card.bg }]} onPress={() => setView(card.dest)} activeOpacity={0.8}>
          <Text style={styles.mainCardEmoji}>{card.emoji}</Text>
          <View style={styles.mainCardText}>
            <Text style={styles.mainCardTitle}>{card.title}</Text>
            <Text style={styles.mainCardSub}>{card.sub}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}
      <View style={{ height: 32 }} />
    </ScrollView>
  );

  // ── CHECK-IN ─────────────────────────────────────────────
  const renderCheckin = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.viewTitle}>How are you feeling?</Text>
      <Text style={styles.viewSub}>Tap the one that fits best right now.</Text>
      <View style={styles.moodGrid}>
        {MOODS.map(m => (
          <TouchableOpacity key={m.label} style={styles.moodPill} onPress={() => { setSelectedMood(m.label); setView('followup'); }} activeOpacity={0.75}>
            <Text style={styles.moodEmoji}>{m.emoji}</Text>
            <Text style={styles.moodLabel}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );

  // ── FOLLOW-UP ────────────────────────────────────────────
  const renderFollowup = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.moodConfirm}>
        <Text style={styles.moodConfirmEmoji}>{mood?.emoji}</Text>
        <Text style={styles.moodConfirmLabel}>{selectedMood}</Text>
      </View>
      <Text style={styles.viewTitle}>What's causing it today?</Text>
      <View style={styles.causeGrid}>
        {CAUSES.map(c => (
          <TouchableOpacity key={c} style={styles.causePill} onPress={() => { setSelectedCause(c); setView('response'); }} activeOpacity={0.75}>
            <Text style={styles.causePillText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );

  // ── RESPONSE ─────────────────────────────────────────────
  const renderResponse = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.responseCard, { backgroundColor: mood?.bg || '#EEF5FF' }]}>
        <Text style={styles.responseEmoji}>{mood?.emoji}</Text>
        <Text style={styles.responseText}>{getResponse(selectedMood, selectedCause)}</Text>
      </View>

      <Text style={styles.sectionLabel}>What might help</Text>

      {[
        { emoji: '🫁', title: '2-min breathing reset',   sub: 'Calm your nervous system now',          dest: 'breathing'  },
        { emoji: '📓', title: '5-min mini journal',       sub: 'Put it into words, then let it go',     dest: 'journal'    },
        { emoji: '🔀', title: 'Reframe the thought',      sub: 'Turn pressure into a 3-step plan',      dest: 'translator' },
        { emoji: '🌆', title: 'London student help',      sub: 'Resources for your situation',          dest: 'help'       },
      ].map((a, i) => (
        <TouchableOpacity key={i} style={styles.actionCard} onPress={() => setView(a.dest)} activeOpacity={0.8}>
          <Text style={styles.actionEmoji}>{a.emoji}</Text>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>{a.title}</Text>
            <Text style={styles.actionSub}>{a.sub}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.gardenBtn} onPress={() => { addToGarden(); goHome(); }} activeOpacity={0.8}>
        <Text style={styles.gardenBtnTitle}>Add to my garden 🌱</Text>
        <Text style={styles.gardenBtnSub}>Completing this check-in plants a seed</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // ── RESET MENU ───────────────────────────────────────────
  const renderReset = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.viewTitle}>How much time do you have?</Text>
      <Text style={styles.viewSub}>Pick a reset that fits your moment.</Text>
      {RESET_OPTIONS.map((opt, i) => (
        <TouchableOpacity key={i} style={styles.resetCard} onPress={() => setView(opt.dest)} activeOpacity={0.8}>
          <Text style={styles.resetEmoji}>{opt.emoji}</Text>
          <View style={styles.resetMeta}>
            <Text style={styles.resetLabel}>{opt.label}</Text>
            <Text style={styles.resetDuration}>{opt.duration}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}
      <View style={{ height: 32 }} />
    </ScrollView>
  );

  // ── BREATHING ────────────────────────────────────────────
  const renderBreathing = () => (
    <View style={styles.breathContainer}>
      {breathDone ? (
        <View style={styles.doneCard}>
          <Text style={styles.doneEmoji}>✨</Text>
          <Text style={styles.doneTitle}>Well done.</Text>
          <Text style={styles.doneSub}>Your nervous system just got a reset. Carry that calm with you.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => { addToGarden(); goHome(); }} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Add to my garden 🌱</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.breathTitle}>Breathing exercise</Text>
          <Text style={styles.breathSub}>{BREATH_CYCLES} cycles · about 50 seconds</Text>
          <View style={styles.circleWrap}>
            <Animated.View style={[styles.outerCircle, { transform: [{ scale: breathAnim }] }]} />
            <View style={styles.innerCircle}>
              <Text style={styles.phaseText}>{isBreathing ? BREATH_PHASES[breathPhase] : 'Ready?'}</Text>
            </View>
          </View>
          {!isBreathing
            ? <TouchableOpacity style={styles.startBtn} onPress={startBreathing} activeOpacity={0.8}><Text style={styles.startBtnText}>Start breathing</Text></TouchableOpacity>
            : <Text style={styles.followText}>Follow the circle</Text>
          }
        </>
      )}
    </View>
  );

  // ── JOURNAL ──────────────────────────────────────────────
  const renderJournal = () => (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {journalDone ? (
          <View style={styles.doneCard}>
            <Text style={styles.doneEmoji}>📓</Text>
            <Text style={styles.doneTitle}>Written and released.</Text>
            <Text style={styles.doneSub}>Putting feelings into words is one of the most powerful things you can do for your mind.</Text>
            <TouchableOpacity style={styles.doneBtn} onPress={() => { addToGarden(); goHome(); }} activeOpacity={0.8}>
              <Text style={styles.doneBtnText}>Add to my garden 🌱</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.viewTitle}>Mini journal</Text>
            <Text style={styles.viewSub}>Write freely. No one else will see this.</Text>
            <View style={styles.promptCard}>
              <Text style={styles.promptText}>💭  What's on your mind right now, honestly?</Text>
            </View>
            <TextInput
              style={styles.journalInput}
              placeholder="Start writing... there's no wrong answer here."
              placeholderTextColor={Colors.textMuted}
              value={journalText}
              onChangeText={setJournalText}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity style={[styles.submitBtn, !journalText.trim() && styles.submitBtnOff]} onPress={() => journalText.trim() && setJournalDone(true)} activeOpacity={0.8}>
              <Text style={styles.submitBtnText}>I'm done writing</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ── LONDON HELP ──────────────────────────────────────────
  const renderHelp = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.viewTitle}>London student help</Text>
      <Text style={styles.viewSub}>Tap what you're going through.</Text>
      {HELP_CARDS.map((card, i) => (
        <TouchableOpacity key={i} style={[styles.helpCard, { backgroundColor: card.bg, borderColor: card.border }]} onPress={() => setExpandedHelp(expandedHelp === i ? null : i)} activeOpacity={0.8}>
          <View style={styles.helpHeader}>
            <Text style={styles.helpEmoji}>{card.emoji}</Text>
            <Text style={styles.helpLabel}>{card.label}</Text>
            <Text style={styles.helpChevron}>{expandedHelp === i ? '∧' : '›'}</Text>
          </View>
          {expandedHelp === i && (
            <View style={styles.helpBody}>
              {card.tips.map((tip, j) => (
                <View key={j} style={styles.helpTipRow}>
                  <Text style={styles.helpDot}>·</Text>
                  <Text style={styles.helpTip}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      ))}
      <View style={{ height: 32 }} />
    </ScrollView>
  );

  // ── TRANSLATOR ───────────────────────────────────────────
  const renderTranslator = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {selectedThought ? (
        <>
          <View style={styles.translateCard}>
            <Text style={styles.translateThought}>"{selectedThought.label}"</Text>
            <Text style={styles.translateArrow}>↓</Text>
            <Text style={styles.translateReframe}>{selectedThought.reframe}</Text>
          </View>
          <Text style={styles.sectionLabel}>Your 3-step plan</Text>
          {selectedThought.plan.map((step, i) => (
            <View key={i} style={styles.planRow}>
              <View style={styles.planNum}><Text style={styles.planNumText}>{i + 1}</Text></View>
              <Text style={styles.planStep}>{step}</Text>
            </View>
          ))}
          <TouchableOpacity style={[styles.submitBtn, { marginTop: 24 }]} onPress={() => setSelectedThought(null)} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>Try another thought</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.viewTitle}>Study pressure translator</Text>
          <Text style={styles.viewSub}>Tap the thought that's been in your head.</Text>
          {THOUGHTS.map((t, i) => (
            <TouchableOpacity key={i} style={styles.thoughtPill} onPress={() => setSelectedThought(t)} activeOpacity={0.8}>
              <Text style={styles.thoughtEmoji}>💭</Text>
              <Text style={styles.thoughtText}>"{t.label}"</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  );

  // ── WALK ────────────────────────────────────────────────
  const renderWalk = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.viewTitle}>10-minute London walk</Text>
      <Text style={styles.viewSub}>Step outside. Leave your phone in your pocket. Follow this.</Text>
      {[
        { n: '1', text: "Walk out and turn in any direction. Don't plan it." },
        { n: '2', text: "First 3 minutes: only notice what you can see — colours, signs, sky." },
        { n: '3', text: "Next 3 minutes: only notice what you can hear — traffic, birds, voices." },
        { n: '4', text: "Last 4 minutes: walk slowly and breathe deeper than normal. Feel the ground." },
        { n: '✓', text: "When you're back, sit for one minute before picking up your phone. That was your reset." },
      ].map((s, i) => (
        <View key={i} style={styles.walkRow}>
          <View style={[styles.walkNum, s.n === '✓' && styles.walkNumDone]}>
            <Text style={styles.walkNumText}>{s.n}</Text>
          </View>
          <Text style={styles.walkText}>{s.text}</Text>
        </View>
      ))}
      <TouchableOpacity style={[styles.submitBtn, { marginTop: 24 }]} onPress={() => { addToGarden(); goHome(); }} activeOpacity={0.8}>
        <Text style={styles.submitBtnText}>I did it — add to garden 🌱</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const isHome = view === 'home';

  return (
    <SafeAreaView style={[styles.container, isHome && { backgroundColor: bgColor }]}>
      <View style={[styles.header, { backgroundColor: isHome ? bgColor : Colors.surface }]}>
        <TouchableOpacity onPress={isHome ? () => navigation.goBack() : goHome} style={styles.backBtn}>
          <Text style={styles.backText}>{isHome ? '← Back' : '← MindNest'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MindNest 🦊</Text>
        {gardenCount > 0
          ? <Text style={styles.headerGarden}>{GARDEN_ITEMS[Math.min(gardenCount - 1, GARDEN_ITEMS.length - 1)]}</Text>
          : <View style={{ width: 24 }} />
        }
      </View>

      {view === 'home'       && renderHome()}
      {view === 'checkin'    && renderCheckin()}
      {view === 'followup'   && renderFollowup()}
      {view === 'response'   && renderResponse()}
      {view === 'reset'      && renderReset()}
      {view === 'breathing'  && renderBreathing()}
      {view === 'journal'    && renderJournal()}
      {view === 'help'       && renderHelp()}
      {view === 'translator' && renderTranslator()}
      {view === 'walk'       && renderWalk()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { marginRight: 10 },
  backText: { fontSize: 14, color: Colors.textLight, fontWeight: '500' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  headerGarden: { fontSize: 22 },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 16 },

  messageCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  messageFox: { fontSize: 28 },
  messageText: { flex: 1, fontSize: 15, color: Colors.textPrimary, lineHeight: 22, fontWeight: '500' },

  gardenCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  gardenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  gardenTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  gardenCountText: { fontSize: 12, color: Colors.textLight, fontWeight: '500' },
  gardenEmpty: { fontSize: 13, color: Colors.textMuted, fontStyle: 'italic' },
  gardenRow: { gap: 6, paddingVertical: 4 },
  gardenItem: { fontSize: 26 },
  gardenMore: { fontSize: 12, color: Colors.textLight, alignSelf: 'center', marginLeft: 6 },

  sectionLabel: {
    fontSize: 11, fontWeight: '600', color: Colors.textLight,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
  },

  mainCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  mainCardEmoji: { fontSize: 26 },
  mainCardText: { flex: 1 },
  mainCardTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  mainCardSub: { fontSize: 12, color: Colors.textSecondary },
  arrow: { fontSize: 22, color: Colors.textLight },

  viewTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6, letterSpacing: -0.3 },
  viewSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20, lineHeight: 19 },

  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moodPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    minWidth: '46%', flexGrow: 1,
  },
  moodEmoji: { fontSize: 20 },
  moodLabel: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },

  moodConfirm: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 14, marginBottom: 20, borderWidth: 1, borderColor: Colors.border,
  },
  moodConfirmEmoji: { fontSize: 28 },
  moodConfirmLabel: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },

  causeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  causePill: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9,
  },
  causePillText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },

  responseCard: {
    borderRadius: 16, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  responseEmoji: { fontSize: 36, marginBottom: 12 },
  responseText: { fontSize: 16, color: Colors.textPrimary, lineHeight: 25, textAlign: 'center', fontWeight: '500' },

  actionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  actionEmoji: { fontSize: 24 },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  actionSub: { fontSize: 12, color: Colors.textSecondary },

  gardenBtn: {
    marginTop: 8, backgroundColor: Colors.successLight,
    borderRadius: 14, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  gardenBtnTitle: { fontSize: 15, fontWeight: '700', color: '#16A34A', marginBottom: 4 },
  gardenBtnSub: { fontSize: 12, color: '#4ADE80' },

  resetCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  resetEmoji: { fontSize: 26 },
  resetMeta: { flex: 1 },
  resetLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  resetDuration: { fontSize: 12, color: Colors.textLight },

  breathContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  breathTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  breathSub: { fontSize: 13, color: Colors.textLight, marginBottom: 48 },
  circleWrap: { width: 220, height: 220, justifyContent: 'center', alignItems: 'center', marginBottom: 48 },
  outerCircle: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: Colors.primaryLight,
  },
  innerCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  phaseText: { fontSize: 14, fontWeight: '600', color: Colors.white, textAlign: 'center' },
  startBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 36 },
  startBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
  followText: { fontSize: 14, color: Colors.textMuted, fontStyle: 'italic', marginTop: 8 },

  doneCard: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 24 },
  doneEmoji: { fontSize: 48, marginBottom: 16 },
  doneTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  doneSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  doneBtn: { backgroundColor: Colors.success, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 28 },
  doneBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },

  promptCard: {
    backgroundColor: Colors.primaryLight, borderRadius: 12,
    padding: 14, marginBottom: 16,
  },
  promptText: { fontSize: 14, color: Colors.primary, lineHeight: 21, fontWeight: '500' },
  journalInput: {
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, fontSize: 14, color: Colors.textPrimary,
    minHeight: 200, lineHeight: 22, marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  submitBtnOff: { opacity: 0.4 },
  submitBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },

  helpCard: { borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1 },
  helpHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  helpEmoji: { fontSize: 22 },
  helpLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  helpChevron: { fontSize: 18, color: Colors.textLight, fontWeight: '600' },
  helpBody: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  helpTipRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  helpDot: { fontSize: 16, color: Colors.textMuted, lineHeight: 22 },
  helpTip: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  translateCard: {
    backgroundColor: Colors.primaryLight, borderRadius: 14,
    padding: 20, marginBottom: 24, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  translateThought: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center', marginBottom: 12 },
  translateArrow: { fontSize: 20, color: Colors.textMuted, marginBottom: 12 },
  translateReframe: { fontSize: 15, color: Colors.textPrimary, lineHeight: 24, textAlign: 'center', fontStyle: 'italic' },
  thoughtPill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  thoughtEmoji: { fontSize: 18 },
  thoughtText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary, fontStyle: 'italic' },
  planRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  planNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  planNumText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  planStep: { flex: 1, fontSize: 14, color: Colors.textPrimary, lineHeight: 22, paddingTop: 3 },

  walkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16 },
  walkNum: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
    borderWidth: 1, borderColor: Colors.border,
  },
  walkNumDone: { backgroundColor: Colors.successLight },
  walkNumText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  walkText: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 22, paddingTop: 4 },
});
