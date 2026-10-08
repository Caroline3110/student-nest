import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useT } from '../../i18n';

export default function StudentLivingScreen({ navigation }) {
  const t = useT();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('home.features.living.name')}</Text>
        <Text style={styles.headerSubtitle}>{t('housing.whereSearch')}</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('Accommodation')}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrap}>
            <Text style={styles.iconText}>🏢</Text>
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>{t('housing.accommodation')}</Text>
            <Text style={styles.optionDesc}>{t('housing.accommodationDesc')}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('Apartments')}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrap}>
            <Text style={styles.iconText}>🔍</Text>
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>{t('housing.apartments')}</Text>
            <Text style={styles.optionDesc}>{t('housing.apartmentsDesc')}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: { marginBottom: 14 },
  backButtonText: { fontSize: 14, color: Colors.textLight, fontWeight: '500' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.4, marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: Colors.textLight },
  content: { padding: 16 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 20 },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 3 },
  optionDesc: { fontSize: 12, color: Colors.textLight, lineHeight: 17 },
  arrow: { fontSize: 20, color: Colors.textMuted },
});