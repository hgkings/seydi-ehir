import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, RefreshControl, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { api } from '@/src/api';

const { width } = Dimensions.get('window');
const colW = (width - spacing.lg * 2 - spacing.md) / 2;

export default function Kesfet() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const d = await api.discover();
      setItems(d);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = items.filter((i) =>
    !search || i.title?.toLowerCase().includes(search.toLowerCase()) || i.subtitle?.toLowerCase().includes(search.toLowerCase())
  );

  // Split into 2 columns for masonry-like
  const left: any[] = [];
  const right: any[] = [];
  filtered.forEach((it, idx) => (idx % 2 === 0 ? left : right).push(it));

  const renderCard = (it: any, idx: number) => {
    const heights = [180, 220, 260, 200, 240];
    const h = heights[idx % heights.length];
    return (
      <Pressable
        key={it.id}
        testID={`discover-item-${it.id}`}
        style={[styles.card, { height: h }]}
        onPress={() => {
          if (it.type === 'ilan') router.push(`/ilan/${it.id}` as any);
          // posts: open feed (handled by feed tab)
        }}
      >
        {it.image_url ? (
          <Image source={{ uri: it.image_url }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.brandTertiary }]} />
        )}
        <View style={styles.cardFooter}>
          <Text style={styles.cardTitle} numberOfLines={2}>{it.title}</Text>
          <Text style={styles.cardSub} numberOfLines={1}>{it.subtitle}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="discover-screen">
      <View style={styles.header}>
        <Text style={styles.title}>Keşfet</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          testID="discover-search-input"
          style={styles.searchInput}
          placeholder="Ara: ilan, gönderi, başlık..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brandPrimary} />}
      >
        <View style={styles.masonry}>
          <View style={styles.col}>{left.map((it, i) => renderCard(it, i))}</View>
          <View style={styles.col}>{right.map((it, i) => renderCard(it, i + 1))}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { ...typography.display, color: colors.onSurface },
  searchWrap: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.onSurface },
  scroll: { paddingBottom: spacing.xl },
  masonry: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.md },
  col: { width: colW, gap: spacing.md },
  card: {
    width: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceTertiary,
  },
  cardFooter: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '600', lineHeight: 18 },
  cardSub: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 2 },
});
