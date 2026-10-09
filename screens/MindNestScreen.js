import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, TextInput, KeyboardAvoidingView, Platform, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { useT } from '../i18n';
import { SUPPORT_SECTIONS, HEAVY_MOODS } from '../data/supportLines';

// All wording lives in i18n under mindnest.*; these lists only hold ids and emoji.
const MESSAGE_COUNT = 6;

const MOODS = [
  { id: 'overwhelmed', emoji: '😰' },
  { id: 'lonely',      emoji: '😔' },
  { id: 'tired',       emoji: '😴' },
  { id: 'anxious',     emoji: '😟' },
  { id: 'motivated',   emoji: '💪' },
  { id: 'numb',        emoji: '😶' },
  { id: 'stressed',    emoji: '😤' },
  { id: 'calm',        emoji: '😌' },
  { id: 'homesick',    emoji: '🏠' },
  { id: 'burntOut',    emoji: '🔥' },
];

const CAUSES = [
  'uni', 'money', 'friends', 'family', 'sleep',
  'health', 'homesickness', 'job', 'relationship', 'future', 'dontKnow',
];

// Specific responses exist for some mood + cause pairs (mindnest.responses.<mood>_<cause>).
const RESPONSES = new Set([
  'anxious_uni', 'anxious_money', 'overwhelmed_uni', 'overwhelmed_future',
  'lonely_friends', 'lonely_homesickness', 'homesick_homesickness', 'homesick_family',
  'burntOut_uni', 'stressed_uni', 'stressed_money', 'tired_sleep', 'tired_uni',
  'motivated_uni', 'numb_dontKnow',
]);

const HELP_CARDS = [
  { id: 'lonely',   emoji: '🌆' },
  { id: 'money',    emoji: '💸' },
  { id: 'focus',    emoji: '🧠' },
  { id: 'homesick', emoji: '🏠' },
  { id: 'burnout',  emoji: '🔥' },
];

const THOUGHTS = ['behind', 'lazy', 'comparison', 'fail', 'focus', 'notEnough'];

const GARDEN_ITEMS = ['🌱','🌿','🌸','🌻','🌳','⭐','🕯️','📚','☁️','🦊','🌙','🌺','🍀','🌈','✨','🐝','🦋','🌾','🪴','🌏'];
const GARDEN_KEY = 'mindnest_garden_count';

const BREATH_DURATIONS = [4000, 2000, 4000, 2000];
const BREATH_CYCLES = 4;

const RESET_OPTIONS = [
  { id: 'breathing', emoji: '🫁', dest: 'breathing' },
  { id: 'journal',   emoji: '📓', dest: 'journal'   },
  { id: 'walk',      emoji: '🚶', dest: 'walk'      },
  { id: 'burnout',   emoji: '🔥', dest: 'translator'},
];

export default function MindNestScreen({ navigation }) {
  const t = useT();
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

  // Where "Get help now" was opened from, so Back returns there with
  // nothing lost (e.g. a half-written journal entry).
  const helpReturnView = useRef('home');

  const breathAnim = useRef(new Animated.Value(1)).current;
  const breathTimers = useRef([]);
  const breathSeq = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem(GARDEN_KEY).then(v => { if (v) setGardenCount(parseInt(v, 10)); });
  }, []);

  useEffect(() => {
    if (view !== 'home') return;
    const id = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGE_COUNT), 4000);
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

  const openHelpNow = () => {
    helpReturnView.current = view;
    setView('helpNow');
  };

  const contactLine = (line) => {
    let url = line.url;
    if (line.call) url = `tel:${line.call.replace(/\s/g, '')}`;
    // iOS and Android expect different separators before a prefilled SMS body.
    if (line.text) url = `sms:${line.text}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(line.body)}`;
    const contact = line.call || line.text || line.url;
    Linking.openURL(url).catch(() =>
      Alert.alert(t('mindnest.crisis.cantOpen'), t('mindnest.crisis.contactDirectly', { contact })));
  };

  const mood = selectedMood ? MOODS.find(m => m.id === selectedMood) : null;
  const bgColor = Colors.background;
  const moodLabel = (id) => t(`mindnest.moods.${id}`);
  const causeLabel = (id) => t(`mindnest.causes.${id}`);
  const getResponse = (moodId, causeId) => {
    const key = `${moodId}_${causeId}`;
    if (RESPONSES.has(key)) return t(`mindnest.responses.${key}`);
    return t('mindnest.responses.fallback', {
      mood: moodLabel(moodId).toLowerCase(),
      cause: causeLabel(causeId).toLowerCase(),
    });
  };

  // ── HOME ────────────────────────────────────────────────
  const renderHome = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.messageCard}>
        <Text style={styles.messageFox}>🦊</Text>
        <Text style={styles.messageText}>{t(`mindnest.messages.${msgIdx}`)}</Text>
      </View>

      <View style={styles.gardenCard}>
        <View style={styles.gardenHeader}>
          <Text style={styles.gardenTitle}>{t('mindnest.garden')}</Text>
          <Text style={styles.gardenCountText}>{t(gardenCount === 1 ? 'mindnest.oneCheckin' : 'mindnest.nCheckins', { count: gardenCount })}</Text>
        </View>
        {gardenCount === 0 ? (
          <Text style={styles.gardenEmpty}>{t('mindnest.gardenEmpty')} 🌱</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gardenRow}>
            {GARDEN_ITEMS.slice(0, Math.min(gardenCount, GARDEN_ITEMS.length)).map((item, i) => (
              <Text key={i} style={styles.gardenItem}>{item}</Text>
            ))}
            {gardenCount > GARDEN_ITEMS.length && (
              <Text style={styles.gardenMore}>{t('mindnest.more', { count: gardenCount - GARDEN_ITEMS.length })}</Text>
            )}
          </ScrollView>
        )}
      </View>

      <Text style={styles.sectionLabel}>{t('mindnest.needNow')}</Text>

      {[
        { emoji: '💭', id: 'checkin',    dest: 'checkin'    },
        { emoji: '🔄', id: 'reset',      dest: 'reset'      },
        { emoji: '🌆', id: 'help',       dest: 'help'       },
        { emoji: '🔀', id: 'translator', dest: 'translator' },
      ].map((card, i) => (
        <TouchableOpacity key={i} style={styles.mainCard} onPress={() => setView(card.dest)} activeOpacity={0.8}>
          <Text style={styles.mainCardEmoji}>{card.emoji}</Text>
          <View style={styles.mainCardText}>
            <Text style={styles.mainCardTitle}>{t(`mindnest.menu.${card.id}.title`)}</Text>
            <Text style={styles.mainCardSub}>{t(`mindnest.menu.${card.id}.sub`)}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.disclaimer}>{t('mindnest.crisis.disclaimer')}</Text>
      <View style={{ height: 32 }} />
    </ScrollView>
  );

  // ── CHECK-IN ─────────────────────────────────────────────
  const renderCheckin = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.viewTitle}>{t('mindnest.howFeeling')}</Text>
      <Text style={styles.viewSub}>{t('mindnest.tapBest')}</Text>
      <View style={styles.moodGrid}>
        {MOODS.map(m => (
          <TouchableOpacity key={m.id} style={styles.moodPill} onPress={() => { setSelectedMood(m.id); setView('followup'); }} activeOpacity={0.75}>
            <Text style={styles.moodEmoji}>{m.emoji}</Text>
            <Text style={styles.moodLabel}>{moodLabel(m.id)}</Text>
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
        <Text style={styles.moodConfirmLabel}>{moodLabel(selectedMood)}</Text>
      </View>
      <Text style={styles.viewTitle}>{t('mindnest.causing')}</Text>
      <View style={styles.causeGrid}>
        {CAUSES.map(c => (
          <TouchableOpacity key={c} style={styles.causePill} onPress={() => { setSelectedCause(c); setView('response'); }} activeOpacity={0.75}>
            <Text style={styles.causePillText}>{causeLabel(c)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );

  // ── RESPONSE ─────────────────────────────────────────────
  const renderResponse = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.responseCard, { backgroundColor: Colors.surfaceMuted }]}>
        <Text style={styles.responseEmoji}>{mood?.emoji}</Text>
        <Text style={styles.responseText}>{getResponse(selectedMood, selectedCause)}</Text>
      </View>

      {HEAVY_MOODS.has(selectedMood) && (
        <TouchableOpacity style={styles.heavyCard} onPress={openHelpNow} activeOpacity={0.8}>
          <Text style={styles.heavyCardText}>{t('mindnest.crisis.heavyCard')}</Text>
          <Text style={styles.heavyCardCta}>{t('mindnest.crisis.heavyCardCta')} ›</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionLabel}>{t('mindnest.mightHelp')}</Text>

      {[
        { emoji: '🫁', id: 'breathing',  dest: 'breathing'  },
        { emoji: '📓', id: 'journal',    dest: 'journal'    },
        { emoji: '🔀', id: 'reframe',    dest: 'translator' },
        { emoji: '🌆', id: 'help',       dest: 'help'       },
      ].map((a, i) => (
        <TouchableOpacity key={i} style={styles.actionCard} onPress={() => setView(a.dest)} activeOpacity={0.8}>
          <Text style={styles.actionEmoji}>{a.emoji}</Text>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>{t(`mindnest.actions.${a.id}.title`)}</Text>
            <Text style={styles.actionSub}>{t(`mindnest.actions.${a.id}.sub`)}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.gardenBtn} onPress={() => { addToGarden(); goHome(); }} activeOpacity={0.8}>
        <Text style={styles.gardenBtnTitle}>{t('mindnest.addToGarden')} 🌱</Text>
        <Text style={styles.gardenBtnSub}>{t('mindnest.plantsSeed')}</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // ── RESET MENU ───────────────────────────────────────────
  const renderReset = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.viewTitle}>{t('mindnest.howMuchTime')}</Text>
      <Text style={styles.viewSub}>{t('mindnest.pickReset')}</Text>
      {RESET_OPTIONS.map((opt, i) => (
        <TouchableOpacity key={i} style={styles.resetCard} onPress={() => setView(opt.dest)} activeOpacity={0.8}>
          <Text style={styles.resetEmoji}>{opt.emoji}</Text>
          <View style={styles.resetMeta}>
            <Text style={styles.resetLabel}>{t(`mindnest.resets.${opt.id}.label`)}</Text>
            <Text style={styles.resetDuration}>{t(`mindnest.resets.${opt.id}.duration`)}</Text>
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
          <Text style={styles.doneTitle}>{t('mindnest.wellDone')}</Text>
          <Text style={styles.doneSub}>{t('mindnest.wellDoneSub')}</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => { addToGarden(); goHome(); }} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>{t('mindnest.addToGarden')} 🌱</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.breathTitle}>{t('mindnest.resets.breathing.label')}</Text>
          <Text style={styles.breathSub}>{t('mindnest.breathSub', { count: BREATH_CYCLES })}</Text>
          <View style={styles.circleWrap}>
            <Animated.View style={[styles.outerCircle, { transform: [{ scale: breathAnim }] }]} />
            <View style={styles.innerCircle}>
              <Text style={styles.phaseText}>{isBreathing ? t(`mindnest.breathPhases.${breathPhase}`) : t('mindnest.ready')}</Text>
            </View>
          </View>
          {!isBreathing
            ? <TouchableOpacity style={styles.startBtn} onPress={startBreathing} activeOpacity={0.8}><Text style={styles.startBtnText}>{t('mindnest.startBreathing')}</Text></TouchableOpacity>
            : <Text style={styles.followText}>{t('mindnest.followCircle')}</Text>
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
            <Text style={styles.doneTitle}>{t('mindnest.released')}</Text>
            <Text style={styles.doneSub}>{t('mindnest.releasedSub')}</Text>
            <TouchableOpacity style={styles.doneBtn} onPress={() => { addToGarden(); goHome(); }} activeOpacity={0.8}>
              <Text style={styles.doneBtnText}>{t('mindnest.addToGarden')} 🌱</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.viewTitle}>{t('mindnest.resets.journal.label')}</Text>
            <Text style={styles.viewSub}>{t('mindnest.writeFreely')}</Text>
            <View style={styles.promptCard}>
              <Text style={styles.promptText}>💭  {t('mindnest.journalPrompt')}</Text>
            </View>
            <TextInput
              style={styles.journalInput}
              placeholder={t('mindnest.journalPlaceholder')}
              placeholderTextColor={Colors.textMuted}
              value={journalText}
              onChangeText={setJournalText}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity style={[styles.submitBtn, !journalText.trim() && styles.submitBtnOff]} onPress={() => journalText.trim() && setJournalDone(true)} activeOpacity={0.8}>
              <Text style={styles.submitBtnText}>{t('mindnest.doneWriting')}</Text>
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
      <Text style={styles.viewTitle}>{t('mindnest.menu.help.title')}</Text>
      <Text style={styles.viewSub}>{t('mindnest.tapGoingThrough')}</Text>
      {HELP_CARDS.map((card, i) => (
        <TouchableOpacity key={i} style={styles.helpCard} onPress={() => setExpandedHelp(expandedHelp === i ? null : i)} activeOpacity={0.8}>
          <View style={styles.helpHeader}>
            <Text style={styles.helpEmoji}>{card.emoji}</Text>
            <Text style={styles.helpLabel}>{t(`mindnest.help.${card.id}.label`)}</Text>
            <Text style={styles.helpChevron}>{expandedHelp === i ? '∧' : '›'}</Text>
          </View>
          {expandedHelp === i && (
            <View style={styles.helpBody}>
              {t(`mindnest.help.${card.id}.tips`).map((tip, j) => (
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
            <Text style={styles.translateThought}>“{t(`mindnest.thoughts.${selectedThought}.label`)}”</Text>
            <Text style={styles.translateArrow}>↓</Text>
            <Text style={styles.translateReframe}>{t(`mindnest.thoughts.${selectedThought}.reframe`)}</Text>
          </View>
          <Text style={styles.sectionLabel}>{t('mindnest.plan')}</Text>
          {t(`mindnest.thoughts.${selectedThought}.plan`).map((step, i) => (
            <View key={i} style={styles.planRow}>
              <View style={styles.planNum}><Text style={styles.planNumText}>{i + 1}</Text></View>
              <Text style={styles.planStep}>{step}</Text>
            </View>
          ))}
          <TouchableOpacity style={[styles.submitBtn, { marginTop: 24 }]} onPress={() => setSelectedThought(null)} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>{t('mindnest.anotherThought')}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.viewTitle}>{t('mindnest.menu.translator.title')}</Text>
          <Text style={styles.viewSub}>{t('mindnest.tapThought')}</Text>
          {THOUGHTS.map((id) => (
            <TouchableOpacity key={id} style={styles.thoughtPill} onPress={() => setSelectedThought(id)} activeOpacity={0.8}>
              <Text style={styles.thoughtEmoji}>💭</Text>
              <Text style={styles.thoughtText}>“{t(`mindnest.thoughts.${id}.label`)}”</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  );

  // ── GET HELP NOW ─────────────────────────────────────────
  const renderHelpNow = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.viewTitle}>{t('mindnest.crisis.title')}</Text>
      <Text style={styles.viewSub}>{t('mindnest.crisis.sub')}</Text>
      {SUPPORT_SECTIONS.map(section => (
        <View key={section.id} style={styles.crisisSection}>
          <Text style={styles.sectionLabel}>{t(`mindnest.crisis.sections.${section.id}`)}</Text>
          {section.lines.map(line => {
            const action = line.call ? 'call' : line.text ? 'text' : line.url ? 'open' : null;
            const shown = line.call || line.text || line.url?.replace(/^https?:\/\//, '');
            return (
              <View key={line.id} style={[styles.crisisCard, line.urgent && styles.crisisCardUrgent]}>
                <View style={styles.crisisInfo}>
                  <Text style={styles.crisisName}>{t(`mindnest.crisis.lines.${line.id}.name`)}</Text>
                  {shown ? <Text style={styles.crisisNumber} selectable>{shown}</Text> : null}
                  <Text style={styles.crisisDetail}>{t(`mindnest.crisis.lines.${line.id}.detail`)}</Text>
                </View>
                {action && (
                  <TouchableOpacity
                    style={[styles.crisisBtn, line.urgent && styles.crisisBtnUrgent]}
                    onPress={() => contactLine(line)}
                    activeOpacity={0.8}
                    accessibilityLabel={`${t(`mindnest.crisis.actions.${action}`)} ${t(`mindnest.crisis.lines.${line.id}.name`)}`}
                  >
                    <Text style={[styles.crisisBtnText, line.urgent && styles.crisisBtnTextUrgent]}>
                      {action === 'call' ? '📞' : action === 'text' ? '💬' : '🔗'} {t(`mindnest.crisis.actions.${action}`)}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      ))}
      <View style={{ height: 32 }} />
    </ScrollView>
  );

  // ── WALK ────────────────────────────────────────────────
  const renderWalk = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.viewTitle}>{t('mindnest.walkTitle')}</Text>
      <Text style={styles.viewSub}>{t('mindnest.walkSub')}</Text>
      {[
        { n: '1', text: t('mindnest.walkSteps.0') },
        { n: '2', text: t('mindnest.walkSteps.1') },
        { n: '3', text: t('mindnest.walkSteps.2') },
        { n: '4', text: t('mindnest.walkSteps.3') },
        { n: '✓', text: t('mindnest.walkSteps.4') },
      ].map((s, i) => (
        <View key={i} style={styles.walkRow}>
          <View style={[styles.walkNum, s.n === '✓' && styles.walkNumDone]}>
            <Text style={styles.walkNumText}>{s.n}</Text>
          </View>
          <Text style={styles.walkText}>{s.text}</Text>
        </View>
      ))}
      <TouchableOpacity style={[styles.submitBtn, { marginTop: 24 }]} onPress={() => { addToGarden(); goHome(); }} activeOpacity={0.8}>
        <Text style={styles.submitBtnText}>{t('mindnest.didIt')} 🌱</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const isHome = view === 'home';
  const onBack = isHome
    ? () => navigation.goBack()
    : view === 'helpNow' ? () => setView(helpReturnView.current) : goHome;

  return (
    <SafeAreaView style={[styles.container, isHome && { backgroundColor: bgColor }]}>
      <View style={[styles.header, { backgroundColor: isHome ? bgColor : Colors.surface }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>{isHome ? `← ${t('common.back')}` : '← MindNest'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MindNest 🦊</Text>
        {view !== 'helpNow' && (
          <TouchableOpacity style={styles.helpPill} onPress={openHelpNow} activeOpacity={0.8} hitSlop={8}>
            <Text style={styles.helpPillText}>🆘 {t('mindnest.crisis.pill')}</Text>
          </TouchableOpacity>
        )}
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
      {view === 'helpNow'    && renderHelpNow()}
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
  helpPill: {
    backgroundColor: Colors.primaryLight, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  helpPillText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

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
    borderWidth: 1, borderColor: Colors.border,
  },
  gardenBtnTitle: { fontSize: 15, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  gardenBtnSub: { fontSize: 12, color: Colors.textLight },

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

  disclaimer: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 16, lineHeight: 16 },

  heavyCard: {
    backgroundColor: Colors.playYellow, borderRadius: 14,
    padding: 16, marginBottom: 24,
  },
  heavyCardText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21, marginBottom: 8 },
  heavyCardCta: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  crisisSection: { marginBottom: 12 },
  crisisCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  crisisCardUrgent: { backgroundColor: Colors.primaryLight, borderColor: Colors.primaryLight },
  crisisInfo: { flex: 1 },
  crisisName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  crisisNumber: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginTop: 2, marginBottom: 4 },
  crisisDetail: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  crisisBtn: {
    backgroundColor: Colors.surfaceMuted, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  crisisBtnUrgent: { backgroundColor: Colors.primary },
  crisisBtnText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  crisisBtnTextUrgent: { color: Colors.white },

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
