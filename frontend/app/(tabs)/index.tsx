import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '@/constants/theme';
import { api } from '@/src/api';
import { useAuth } from '@/src/auth';

const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [weather, setWeather] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [haberler, setHaberler] = useState<any[]>([]);
  const [etkinlikler, setEtkinlikler] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [w, c, h, e] = await Promise.all([
        api.weather(),
        api.categories(),
        api.haberler(),
        api.etkinlikler(),
      ]);
      setWeather(w);
      setCategories(c);
      setHaberler(h.slice(0, 5));
      setEtkinlikler(e.slice(0, 5));
    } catch (err) {
      console.warn(err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const quickActions = [
    { slug: 'eczane', label: 'Nöbetçi Eczane', icon: 'medkit' as const },
    { slug: 'etkinlikler', label: 'Etkinlikler', icon: 'calendar' as const },
    { slug: 'haberler', label: 'Haberler', icon: 'newspaper' as const },
    { slug: 'ilanlar', label: 'İlanlar', icon: 'pricetag' as const },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="home-screen">
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brandPrimary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.locationLabel}>Konum</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={18} color={colors.brandPrimary} />
              <Text style={styles.location}>Seydişehir</Text>
            </View>
          </View>
          <Pressable hitSlop={10} testID="home-notif-btn">
            <View style={styles.bellWrap}>
              <Ionicons name="notifications-outline" size={22} color={colors.onSurface} />
              <View style={styles.dot} />
            </View>
          </Pressable>
        </View>

        <Text style={styles.greeting}>
          Merhaba {user?.full_name?.split(' ')[0] || 'Hoş geldin'} 👋
        </Text>

        {/* Weather hero */}
        {weather && (
          <ImageBackground
            source={{ uri: 'https://images.pexels.com/photos/31673629/pexels-photo-31673629.jpeg?auto=compress&cs=tinysrgb&w=900' }}
            style={styles.weatherCard}
            imageStyle={{ borderRadius: radius.lg }}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.75)']}
              style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]}
            />
            <View style={styles.weatherInner}>
              <View>
                <Text style={styles.weatherCity}>{weather.city}</Text>
                <Text style={styles.weatherCond}>{weather.condition}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.weatherTemp}>{weather.temp}°</Text>
                <Text style={styles.weatherSub}>Y {weather.high}° · D {weather.low}°</Text>
              </View>
            </View>
          </ImageBackground>
        )}

        {/* Quick actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {quickActions.map((q) => (
            <Pressable
              key={q.slug}
              style={styles.chip}
              testID={`quick-${q.slug}`}
              onPress={() => router.push(`/kategori/${q.slug}` as any)}
            >
              <Ionicons name={q.icon} size={16} color={colors.brandPrimary} />
              <Text style={styles.chipText}>{q.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Featured news */}
        <SectionHeader title="Öne Çıkan Haberler" onSeeAll={() => router.push('/kategori/haberler' as any)} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizList}>
          {haberler.map((h) => (
            <Pressable
              key={h.id}
              style={styles.featureCard}
              testID={`feature-haber-${h.id}`}
              onPress={() => router.push(`/haber/${h.id}` as any)}
            >
              <Image source={{ uri: h.image_url }} style={styles.featureImage} contentFit="cover" transition={200} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={styles.featureScrim}
              />
              <View style={styles.featureContent}>
                <View style={styles.featureBadge}>
                  <Text style={styles.featureBadgeText}>{h.kategori}</Text>
                </View>
                <Text style={styles.featureTitle} numberOfLines={2}>{h.title}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Upcoming events */}
        <SectionHeader title="Yaklaşan Etkinlikler" onSeeAll={() => router.push('/kategori/etkinlikler' as any)} />
        <View style={{ gap: spacing.md, paddingHorizontal: spacing.lg }}>
          {etkinlikler.slice(0, 3).map((e) => (
            <Pressable
              key={e.id}
              style={styles.eventRow}
              testID={`event-${e.id}`}
              onPress={() => router.push(`/etkinlik/${e.id}` as any)}
            >
              <View style={styles.eventDate}>
                <Text style={styles.eventDay}>{e.event_date?.split('-')[2]}</Text>
                <Text style={styles.eventMonth}>{['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][parseInt(e.event_date?.split('-')[1] || '1', 10) - 1]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle} numberOfLines={1}>{e.title}</Text>
                <Text style={styles.eventMeta} numberOfLines={1}>{e.event_time} · {e.location}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        {/* Categories grid */}
        <SectionHeader title="Kategoriler" />
        <View style={styles.catGrid}>
          {categories.map((c) => (
            <Pressable
              key={c.slug}
              style={styles.catItem}
              testID={`category-${c.slug}`}
              onPress={() => router.push(`/kategori/${c.slug}` as any)}
            >
              <View style={[styles.catIconBox, { backgroundColor: colors.brandTertiary }]}>
                <Ionicons name={c.icon as any} size={22} color={colors.brandPrimary} />
              </View>
              <Text style={styles.catLabel} numberOfLines={2}>{c.name}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>Tümü</Text>
        </Pressable>
      )}
    </View>
  );
}

const cardW = width * 0.72;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  locationLabel: { fontSize: 11, color: colors.muted, fontWeight: '600', letterSpacing: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  location: { ...typography.h2, color: colors.onSurface },
  bellWrap: { padding: 6 },
  dot: {
    position: 'absolute',
    top: 6, right: 4,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.brandPrimary,
  },
  greeting: { ...typography.h1, paddingHorizontal: spacing.lg, marginBottom: spacing.md, color: colors.onSurface },
  weatherCard: {
    height: 160,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  weatherInner: {
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  weatherCity: { color: '#fff', fontSize: 20, fontWeight: '700' },
  weatherCond: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 2 },
  weatherTemp: { color: '#fff', fontSize: 44, fontWeight: '300', lineHeight: 48 },
  weatherSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  chipRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: 8,
  },
  chip: {
    flexShrink: 0,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brandTertiary,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  chipText: { color: colors.brandPrimary, fontWeight: '600', fontSize: 13 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h2, color: colors.onSurface },
  seeAll: { color: colors.brandPrimary, fontWeight: '600', fontSize: 14 },
  horizList: { paddingHorizontal: spacing.lg, gap: spacing.md },
  featureCard: {
    width: cardW,
    height: 200,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceTertiary,
  },
  featureImage: { ...StyleSheet.absoluteFillObject },
  featureScrim: { ...StyleSheet.absoluteFillObject },
  featureContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md, gap: 8 },
  featureBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  featureBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  featureTitle: { color: '#fff', fontSize: 16, fontWeight: '700', lineHeight: 20 },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: radius.md,
    ...shadow.soft,
  },
  eventDate: {
    width: 52, height: 52,
    backgroundColor: colors.brandTertiary,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDay: { color: colors.brandPrimary, fontSize: 20, fontWeight: '800', lineHeight: 22 },
  eventMonth: { color: colors.brandPrimary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  eventTitle: { ...typography.h3, color: colors.onSurface },
  eventMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  catGrid: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  catItem: {
    width: (width - spacing.lg * 2 - spacing.md * 3) / 4,
    alignItems: 'center',
    gap: 6,
  },
  catIconBox: {
    width: 56, height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: { fontSize: 11, color: colors.onSurfaceTertiary, textAlign: 'center', fontWeight: '500' },
});
