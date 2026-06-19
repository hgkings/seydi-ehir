import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '@/constants/theme';
import { api } from '@/src/api';

const SLUG_TO_TITLE: Record<string, string> = {
  firmalar: 'Firmalar', haberler: 'Haberler', etkinlikler: 'Etkinlikler',
  ilanlar: 'İlanlar', 'is-ilanlari': 'İş İlanları', eczane: 'Nöbetçi Eczane',
  indirimler: 'İndirimler', gezilecek: 'Gezilecek Yerler', 'alo-paket': 'Alo Paket',
  otobus: 'Otobüs Hatları', 'yer-bildirim': 'Yer Bildirimi', itiraflar: 'İtiraflar',
  'alo-taksi': 'Alo Taksi', konaklama: 'Konaklama', 'resmi-kurumlar': 'Resmi Kurumlar',
  anketler: 'Anketler',
};

export default function KategoriListesi() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let data: any[] = [];
      if (slug === 'firmalar') data = await api.firmalar();
      else if (slug === 'haberler') data = await api.haberler();
      else if (slug === 'etkinlikler') data = await api.etkinlikler();
      else if (slug === 'ilanlar') data = await api.ilanlar();
      else if (slug === 'is-ilanlari') data = await api.isIlanlari();
      else if (slug === 'eczane') data = await api.eczane();
      else data = [];
      setItems(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const renderItem = ({ item }: any) => {
    if (slug === 'firmalar') {
      return (
        <Pressable style={styles.row} onPress={() => router.push(`/firma/${item.id}` as any)} testID={`firma-${item.id}`}>
          <Image source={{ uri: item.image_url }} style={styles.thumb} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.rowSub} numberOfLines={1}>{item.kategori} · ⭐ {item.rating}</Text>
            <Text style={styles.rowMeta} numberOfLines={1}>{item.adres}</Text>
          </View>
          <Pressable hitSlop={8} onPress={(e) => { e.stopPropagation(); Linking.openURL(`tel:${item.telefon}`); }}>
            <View style={styles.callBtn}>
              <Ionicons name="call" size={16} color="#fff" />
            </View>
          </Pressable>
        </Pressable>
      );
    }
    if (slug === 'haberler') {
      return (
        <Pressable style={styles.row} onPress={() => router.push(`/haber/${item.id}` as any)} testID={`haber-${item.id}`}>
          <Image source={{ uri: item.image_url }} style={styles.thumb} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.rowMeta} numberOfLines={1}>{item.kategori} · {item.views} okuma</Text>
          </View>
        </Pressable>
      );
    }
    if (slug === 'etkinlikler') {
      return (
        <Pressable style={styles.row} onPress={() => router.push(`/etkinlik/${item.id}` as any)} testID={`etkinlik-${item.id}`}>
          <Image source={{ uri: item.image_url }} style={styles.thumb} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.rowMeta} numberOfLines={1}>{item.event_date} · {item.event_time}</Text>
            <Text style={styles.rowMeta} numberOfLines={1}>📍 {item.location}</Text>
          </View>
        </Pressable>
      );
    }
    if (slug === 'ilanlar') {
      return (
        <Pressable style={styles.row} onPress={() => router.push(`/ilan/${item.id}` as any)} testID={`ilan-${item.id}`}>
          <Image source={{ uri: item.image_url }} style={styles.thumb} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.priceText}>{item.price > 0 ? `${item.price.toLocaleString('tr-TR')} ₺` : 'Ücretsiz'}</Text>
            <Text style={styles.rowMeta} numberOfLines={1}>{item.kategori}</Text>
          </View>
        </Pressable>
      );
    }
    if (slug === 'is-ilanlari') {
      return (
        <View style={styles.row} testID={`is-${item.id}`}>
          <View style={styles.iconCircle}>
            <Ionicons name="briefcase" size={22} color={colors.brandPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.rowSub} numberOfLines={1}>{item.company} · {item.type}</Text>
            <Text style={styles.priceText}>{item.salary}</Text>
          </View>
        </View>
      );
    }
    if (slug === 'eczane') {
      return (
        <View style={styles.row} testID={`eczane-${item.id}`}>
          <View style={[styles.iconCircle, { backgroundColor: '#FBE7E7' }]}>
            <Ionicons name="medkit" size={22} color={colors.error} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{item.name}</Text>
            <Text style={styles.rowMeta}>📍 {item.adres}</Text>
            <Text style={styles.rowMeta}>🕒 {item.saat}</Text>
          </View>
          <Pressable onPress={() => Linking.openURL(`tel:${item.telefon}`)}>
            <View style={styles.callBtn}><Ionicons name="call" size={16} color="#fff" /></View>
          </Pressable>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="kategori-screen">
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} testID="back-btn">
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>{SLUG_TO_TITLE[slug || ''] || 'Kategori'}</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.brandPrimary} /></View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="cube-outline" size={48} color={colors.muted} />
          <Text style={{ color: colors.muted, marginTop: 8 }}>Bu kategoride henüz içerik yok.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { ...typography.h2, color: colors.onSurface },
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.md,
    alignItems: 'center',
    ...shadow.soft,
  },
  thumb: { width: 72, height: 72, borderRadius: radius.sm, backgroundColor: colors.surfaceTertiary },
  iconCircle: {
    width: 56, height: 56, borderRadius: radius.sm,
    backgroundColor: colors.brandTertiary,
    alignItems: 'center', justifyContent: 'center',
  },
  rowTitle: { ...typography.bodyBold, color: colors.onSurface },
  rowSub: { color: colors.onSurfaceTertiary, fontSize: 13, marginTop: 2 },
  rowMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  priceText: { color: colors.brandPrimary, fontWeight: '700', fontSize: 14, marginTop: 2 },
  callBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.success,
    alignItems: 'center', justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
