import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useT } from '../i18n';
import Icon from './Icon';

const ICONS = {
  Home: 'home',
  Explore: 'compass',
  Messages: 'message-circle',
  Saved: 'bookmark',
  Profile: 'user',
};

// The five main sections. Drawn by hand rather than using the default tab bar
// so the labels, spacing and colours match the rest of the app.
export default function AppTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const t = useT();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable
            key={route.key}
            style={styles.item}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={t(`tabs.${route.name.toLowerCase()}`)}
          >
            <Icon
              name={ICONS[route.name]}
              size={22}
              color={focused ? Colors.brandDeep : Colors.warmMuted}
            />
            <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
              {t(`tabs.${route.name.toLowerCase()}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.creamBorder,
    paddingTop: 9,
  },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  label: { fontSize: 10.5, fontWeight: '600', color: Colors.warmMuted },
  labelActive: { color: Colors.brandDeep },
});
