import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useT } from '../i18n';
import Icon from './Icon';

// Top of the inner screens: a back chevron, an optional action button on the
// right, then the screen title underneath.
export default function ScreenHeader({ navigation, title, subtitle, actions = [], onBack }) {
  const insets = useSafeAreaInsets();
  const t = useT();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        <Pressable
          onPress={onBack || (() => navigation.goBack())}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Icon name="chevron-left" size={26} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.actions}>
          {actions.map(action => (
            <Pressable
              key={action.icon}
              onPress={action.onPress}
              style={[styles.actionBtn, action.active && styles.actionBtnActive]}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              accessibilityState={{ selected: !!action.active }}
            >
              <Icon
                name={action.icon}
                size={17}
                color={action.active ? Colors.white : Colors.brandDeep}
              />
            </Pressable>
          ))}
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.brandDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnActive: { backgroundColor: Colors.brandDeep },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: 10,
  },
  subtitle: { fontSize: 13.5, color: Colors.warmGrey, marginTop: 4 },
});
