import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '@/constants/theme';
import { api } from '@/src/api';

const GROUP_ORDER = ['Günlük ihtiyaçlar', 'Şehir gündemi', 'İlan, alışveriş ve fırsatlar', 'Şehir & yaşam', 'Hizmetler', 'Sosyal'];
const GROUP_SUB: Record<string, string> = {
  'Günlük ihtiyaçlar': 'Her gün bakabileceğin pratik bilgiler',
  'Şehir gündemi': 'Haberler ve etkinlikler',
  'İlan, alışveriş ve fırsatlar': 'Alım-satım, iş ve indirimler',
  'Şehir & yaşam': 'Gezi, konaklama ve şehir deneyimi',
  'Hizmetler': 'Usta, noter ve resmi kurumlar',
  'Sosyal': 'Şehirden insanlarla etkileşim',
};

export default function Kategoriler() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setCategories(await api.categories()); } catch (e) { console.warn(e); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    categories.forEach((c) => {
      const g = c.group || 'Diğer';
      map[g] = map[g] || [];
      map[g].push(c);
    });
    return GROUP_ORDER.map((g) => ({ group: g, items: map[g] || [] })).filter((x) => x.items.length > 0);
  }, [categories]);

  return (
    <View style={styles.container} testID="categories-screen">
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <View style={styles.header}>
          <Text style={styles.title}>Kategoriler</Text>
        </View>
      </SafeAreaView>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 64 + insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brandPrimary} />}
      >
        {grouped.map(({ group, items }) => (
          <View key={group} style={styles.section}>
            <Text style={styles.groupTitle}>{group}</Text>
            <Text style={styles.groupSub}>{GROUP_SUB[group] || ''}</Text>

            <View style={styles.card}>
              {items.map((c, idx) => (
                <Pressable
                  key={c.slug}
                  testID={`category-${c.slug}`}
                  style={[styles.row, idx !== items.length - 1 && styles.rowDivider]}
                  onPress={() => router.push(`/kategori/${c.slug}` as any)}
                >
                  <View style={[styles.icon, { backgroundColor: c.bg }]}>
                    <Ionicons name={c.icon as any} size={22} color={c.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{c.name}</Text>
                    <Text style={styles.rowSub} numberOfLines={1}>{c.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  safeTop: { backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { ...typography.display, color: colors.onSurface, fontSize: 30 },
  scroll: { paddingHorizontal: spacing.lg },
  section: { marginBottom: spacing.xl },
  groupTitle: { fontSize: 19, fontWeight: '800', color: colors.onSurface, marginTop: spacing.md },
  groupSub: { fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  icon: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  rowTitle: { fontSize: 16, fontWeight: '700', color: colors.onSurface },
  rowSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
