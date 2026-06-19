import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '@/constants/theme';
import { api } from '@/src/api';

const { width } = Dimensions.get('window');

const TOP_THREE = [
  { slug: 'eczane', name: 'Nöbetçi Eczane', sub: 'Bugün nöbetçi eczaneler', icon: 'medkit', color: '#B83A3A', bg: '#FBE7E7', accent: '#B83A3A' },
  { slug: 'otobus', name: 'Ulaşım', sub: 'Otobüs hatları ve ulaşım', icon: 'bus', color: '#2F7DD1', bg: '#E3EEFB', accent: '#2F7DD1' },
  { slug: 'alo-taksi', name: 'Alo Taksi', sub: 'Taksi / Alo Taksi', icon: 'car-sport', color: '#D9A82C', bg: '#FFF6DC', accent: '#D9A82C' },
];

const DARK_SERVICE_SLUGS = ['haberler', 'etkinlikler', 'yeme-icme', 'ilanlar', 'ikinci-el', 'indirimler'];
const LIGHT_SERVICE_SLUGS = ['gezilecek', 'piknik', 'konaklama', 'is-ilanlari', 'firmalar', 'noter'];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<any[]>([]);
  const [namaz, setNamaz] = useState<any>(null);
  const [ilanlar, setIlanlar] = useState<any[]>([]);
  const [indirimler, setIndirimler] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    try {
      const [c, n, i, ind] = await Promise.all([
        api.categories(),
        api.namaz(),
        api.ilanlar(),
        api.indirimler(),
      ]);
      setCategories(c);
      setNamaz(n);
      setIlanlar(i);
      setIndirimler(ind);
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

  const darkServices = useMemo(
    () => DARK_SERVICE_SLUGS.map((s) => categories.find((c) => c.slug === s)).filter(Boolean),
    [categories]
  );
  const lightServices = useMemo(
    () => LIGHT_SERVICE_SLUGS.map((s) => categories.find((c) => c.slug === s)).filter(Boolean),
    [categories]
  );

  return (
    <View style={styles.container} testID="home-screen">
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <View style={styles.cityPin}>
              <View style={styles.cityDot} />
              <Text style={styles.cityText}>Seydişehir</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable hitSlop={8} testID="home-search-btn" style={styles.iconBtn}>
              <Ionicons name="search" size={20} color={colors.onSurface} />
            </Pressable>
            <Pressable hitSlop={8} testID="home-notif-btn" style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={20} color={colors.onSurface} />
              <View style={styles.bellDot} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 64 + insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brandPrimary} />}
      >
        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            testID="home-search-input"
            style={styles.searchInput}
            placeholder="Bu hafta etkinlik var mı?"
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
          />
          <View style={styles.searchFilterBtn}>
            <Ionicons name="options-outline" size={18} color={colors.onSurface} />
          </View>
        </View>

        {/* Top 3 cards */}
        <View style={styles.topThreeRow}>
          {TOP_THREE.map((t) => (
            <Pressable
              key={t.slug}
              testID={`home-top-${t.slug}`}
              style={[styles.topCard, { backgroundColor: t.bg }]}
              onPress={() => router.push(`/kategori/${t.slug}` as any)}
            >
              <View style={[styles.topAccent, { backgroundColor: t.accent }]} />
              <View style={[styles.topIcon, { backgroundColor: '#fff' }]}>
                <Ionicons name={t.icon as any} size={20} color={t.color} />
              </View>
              <Text style={styles.topName} numberOfLines={1}>{t.name}</Text>
              <Text style={styles.topSub} numberOfLines={1}>{t.sub}</Text>
            </Pressable>
          ))}
        </View>

        {/* Hizmetler */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Hizmetler</Text>
          <Pressable onPress={() => router.push('/(tabs)/kategoriler')} testID="home-services-all">
            <Text style={styles.seeAll}>Tümünü Gör</Text>
          </Pressable>
        </View>

        <View style={styles.servicesGrid}>
          {darkServices.map((s: any) => (
            <Pressable
              key={s.slug}
              testID={`service-${s.slug}`}
              style={styles.darkServiceCard}
              onPress={() => router.push(`/kategori/${s.slug}` as any)}
            >
              <Image source={{ uri: s.image_url }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.85)']}
                style={StyleSheet.absoluteFillObject}
              />
              {s.count > 0 && (
                <View style={[styles.countBadge, { backgroundColor: s.color }]}>
                  <Text style={styles.countBadgeText}>{s.count}</Text>
                </View>
              )}
              <View style={styles.darkCardContent}>
                <Text style={styles.darkCardTitle}>{s.name}</Text>
                <Text style={styles.darkCardSub} numberOfLines={1}>{s.subtitle}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.servicesGrid}>
          {lightServices.map((s: any) => (
            <Pressable
              key={s.slug}
              testID={`service-${s.slug}`}
              style={styles.lightServiceCard}
              onPress={() => router.push(`/kategori/${s.slug}` as any)}
            >
              <View style={[styles.lightIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon as any} size={22} color={s.color} />
              </View>
              <Text style={styles.lightTitle} numberOfLines={1}>{s.name}</Text>
              <Text style={styles.lightSub} numberOfLines={2}>{s.subtitle}</Text>
            </Pressable>
          ))}
        </View>

        {/* Namaz Vakitleri */}
        {namaz && (
          <Pressable
            style={styles.namazCard}
            testID="home-namaz-card"
            onPress={() => router.push('/namaz' as any)}
          >
            <View style={styles.namazHeader}>
              <View style={styles.namazIconBox}>
                <Ionicons name="moon" size={20} color="#1F7A4D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.namazLabel}>Namaz Vakitleri</Text>
                <Text style={styles.namazNext}>
                  Seydişehir · Sıradaki: <Text style={{ fontWeight: '700' }}>{namaz.next_name} {namaz.next_time}</Text>
                </Text>
              </View>
              <View style={styles.namazPill}>
                <Text style={styles.namazPillText}>{namaz.next_in}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#1F7A4D" style={{ marginLeft: 4 }} />
            </View>
            <View style={styles.namazTimesRow}>
              {namaz.times.map((t: any, idx: number) => (
                <View
                  key={t.name}
                  style={[styles.namazTimeChip, idx === namaz.next_index && styles.namazTimeChipActive]}
                >
                  <Text style={[styles.namazTimeLabel, idx === namaz.next_index && styles.namazTimeLabelActive]}>
                    {t.name}
                  </Text>
                  <Text style={[styles.namazTimeValue, idx === namaz.next_index && styles.namazTimeValueActive]}>
                    {t.time}
                  </Text>
                </View>
              ))}
            </View>
          </Pressable>
        )}

        {/* Fırsatlar */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionLead}>
            <View style={[styles.sectionIconBox, { backgroundColor: '#FFF1D6' }]}>
              <Ionicons name="pricetag" size={16} color="#D98C2C" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Fırsatlar</Text>
              <Text style={styles.sectionSub}>İndirim ve kampanyalar</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/kategori/indirimler' as any)}>
            <Text style={[styles.seeAll, { color: '#D98C2C' }]}>Tümü</Text>
          </Pressable>
        </View>

        {indirimler.length > 0 && (
          <Pressable
            style={styles.featureDiscount}
            testID={`indirim-${indirimler[0].id}`}
            onPress={() => router.push('/kategori/indirimler' as any)}
          >
            <Image source={{ uri: indirimler[0].image_url }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
            <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']} style={StyleSheet.absoluteFillObject} />
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeBig}>%{indirimler[0].discount_pct}</Text>
              <Text style={styles.discountBadgeSmall}>indirim</Text>
            </View>
            <View style={styles.featureDiscountFooter}>
              <Text style={styles.featureFirma}>{indirimler[0].firma_name}</Text>
              <Text style={styles.featureTitle}>{indirimler[0].title}</Text>
              <Text style={styles.featureMeta}>Son: {formatDate(indirimler[0].valid_until)}</Text>
            </View>
          </Pressable>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.discountRow}>
          {indirimler.slice(1).map((d) => (
            <Pressable
              key={d.id}
              style={styles.discountCard}
              testID={`indirim-${d.id}`}
              onPress={() => router.push('/kategori/indirimler' as any)}
            >
              <Image source={{ uri: d.image_url }} style={styles.discountImage} contentFit="cover" />
              <View style={styles.discountBadgeSmallTopLeft}>
                <Text style={styles.discountBadgeSmallTopLeftText}>%{d.discount_pct}</Text>
              </View>
              <View style={styles.discountBody}>
                <Text style={styles.discountFirma}>{d.firma_name}</Text>
                <Text style={styles.discountTitle} numberOfLines={1}>{d.title}</Text>
                <Text style={styles.discountMeta}>Son: {formatDate(d.valid_until)}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Son İlanlar */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionLead}>
            <View style={[styles.sectionIconBox, { backgroundColor: '#FFF1D6' }]}>
              <Ionicons name="pricetag" size={16} color="#D98C2C" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Son İlanlar</Text>
              <Text style={styles.sectionSub}>Kiralık, satılık ve daha fazlası</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/kategori/ilanlar' as any)}>
            <Text style={[styles.seeAll, { color: '#D98C2C' }]}>Tümü</Text>
          </Pressable>
        </View>

        {ilanlar[0] && (
          <Pressable
            style={styles.featureIlan}
            testID={`featured-ilan-${ilanlar[0].id}`}
            onPress={() => router.push(`/ilan/${ilanlar[0].id}` as any)}
          >
            <Image source={{ uri: ilanlar[0].image_url }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
            <View style={styles.ilanBadgeTopLeft}>
              <Text style={styles.ilanBadgeText}>Satılık</Text>
            </View>
            <View style={styles.ilanBadgeTopRight}>
              <Ionicons name="star" size={11} color="#1A1A1A" />
              <Text style={styles.ilanBadgeText}>Öne çıkan</Text>
            </View>
            <View style={styles.featureIlanFooter}>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureIlanTitle} numberOfLines={1}>{ilanlar[0].title}</Text>
                <View style={styles.featureIlanLocRow}>
                  <Ionicons name="location" size={12} color="#fff" />
                  <Text style={styles.featureIlanLoc}>{ilanlar[0].location?.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>
                  {ilanlar[0].price > 0 ? `₺${ilanlar[0].price.toLocaleString('tr-TR')}` : 'Ücretsiz'}
                </Text>
              </View>
            </View>
          </Pressable>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ilanRow}>
          {ilanlar.slice(1).map((it) => (
            <Pressable
              key={it.id}
              style={styles.ilanCard}
              testID={`ilan-card-${it.id}`}
              onPress={() => router.push(`/ilan/${it.id}` as any)}
            >
              <Image source={{ uri: it.image_url }} style={styles.ilanImage} contentFit="cover" />
              <View style={styles.ilanBadgeSmall}>
                <Text style={styles.ilanBadgeSmallText}>Satılık</Text>
              </View>
              <View style={styles.ilanBody}>
                <Text style={styles.ilanTitle} numberOfLines={1}>{it.title}</Text>
                <View style={styles.ilanFooterRow}>
                  <View style={styles.ilanPricePill}>
                    <Text style={styles.ilanPriceText} numberOfLines={1}>
                      {it.price > 0 ? `₺${it.price.toLocaleString('tr-TR')}` : 'Ücretsiz'}
                    </Text>
                  </View>
                  <Text style={styles.ilanLoc} numberOfLines={1}>{it.location?.toUpperCase()}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

function formatDate(d?: string) {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]}`;
}

const HALF = (width - spacing.lg * 2 - spacing.md) / 2;
const THIRD = (width - spacing.lg * 2 - spacing.sm * 2) / 3;
const FEATURE_DISCOUNT_W = width - spacing.lg * 2;
const ILAN_CARD_W = width * 0.62;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  safeTop: { backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logoBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#0A0A0A',
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  cityPin: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cityDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.brandPrimary,
  },
  cityText: { fontSize: 17, fontWeight: '700', color: colors.onSurface },
  headerActions: { flexDirection: 'row', gap: 4 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute', top: 8, right: 8,
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: colors.brandPrimary,
  },
  scroll: { paddingTop: spacing.md },

  searchBar: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.onSurface },
  searchFilterBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: colors.surfaceTertiary,
    alignItems: 'center', justifyContent: 'center',
  },

  topThreeRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  topCard: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 116,
    overflow: 'hidden',
  },
  topAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  topIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  topName: { fontSize: 13, fontWeight: '800', color: colors.onSurface },
  topSub: { fontSize: 10, color: colors.muted, marginTop: 2 },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionLead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { ...typography.h1, color: colors.onSurface, fontSize: 22 },
  sectionSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  seeAll: { color: colors.brandPrimary, fontWeight: '700', fontSize: 14 },

  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  darkServiceCard: {
    width: HALF,
    height: 100,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    justifyContent: 'flex-end',
  },
  darkCardContent: { padding: spacing.md },
  darkCardTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  darkCardSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
  countBadge: {
    position: 'absolute', top: 8, right: 8,
    minWidth: 24, height: 24, borderRadius: 12,
    paddingHorizontal: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  countBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  lightServiceCard: {
    width: HALF,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 6,
    ...shadow.soft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lightIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  lightTitle: { fontSize: 14, fontWeight: '800', color: colors.onSurface },
  lightSub: { fontSize: 11, color: colors.muted, lineHeight: 14 },

  namazCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: '#DFF3E6',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#C5E5D2',
  },
  namazHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  namazIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  namazLabel: { color: '#1F7A4D', fontSize: 12, opacity: 0.85 },
  namazNext: { color: '#0F3D26', fontSize: 14, marginTop: 2 },
  namazPill: {
    backgroundColor: '#1F7A4D',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill,
  },
  namazPillText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  namazTimesRow: { flexDirection: 'row', gap: 6 },
  namazTimeChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: radius.sm,
    paddingVertical: 8, paddingHorizontal: 2,
    alignItems: 'center',
  },
  namazTimeChipActive: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#1F7A4D' },
  namazTimeLabel: { fontSize: 10, color: '#3E7D59', fontWeight: '600' },
  namazTimeLabelActive: { color: '#1F7A4D' },
  namazTimeValue: { fontSize: 12, color: '#3E7D59', fontWeight: '700', marginTop: 2 },
  namazTimeValueActive: { color: '#1F7A4D', fontWeight: '800' },

  featureDiscount: {
    height: 200,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceTertiary,
    justifyContent: 'flex-end',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.md, right: spacing.md,
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FF8A3D',
    alignItems: 'center', justifyContent: 'center',
  },
  discountBadgeBig: { color: '#fff', fontSize: 22, fontWeight: '900', lineHeight: 24 },
  discountBadgeSmall: { color: '#fff', fontSize: 10, fontWeight: '600' },
  featureDiscountFooter: { padding: spacing.md },
  featureFirma: { color: '#fff', fontSize: 12, opacity: 0.85, marginBottom: 2 },
  featureTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  featureMeta: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4 },

  discountRow: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingTop: spacing.md },
  discountCard: {
    width: HALF,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.soft,
  },
  discountImage: { width: '100%', height: 100, backgroundColor: colors.surfaceTertiary },
  discountBadgeSmallTopLeft: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#D98C2C',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeSmallTopLeftText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  discountBody: { padding: spacing.sm, gap: 2 },
  discountFirma: { fontSize: 11, color: colors.muted },
  discountTitle: { fontSize: 13, fontWeight: '700', color: colors.onSurface },
  discountMeta: { fontSize: 10, color: '#D98C2C', fontWeight: '600', marginTop: 2 },

  featureIlan: {
    height: 220,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceTertiary,
  },
  ilanBadgeTopLeft: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: '#F5C12C',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: radius.pill,
  },
  ilanBadgeTopRight: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: '#F5C12C',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  ilanBadgeText: { color: '#1A1A1A', fontSize: 11, fontWeight: '800' },
  featureIlanFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.md,
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  featureIlanTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  featureIlanLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  featureIlanLoc: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600' },
  priceBadge: {
    backgroundColor: '#F5C12C',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.pill,
  },
  priceBadgeText: { color: '#1A1A1A', fontWeight: '900', fontSize: 13 },

  ilanRow: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingTop: spacing.md },
  ilanCard: {
    width: ILAN_CARD_W,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.soft,
  },
  ilanImage: { width: '100%', height: 110, backgroundColor: colors.surfaceTertiary },
  ilanBadgeSmall: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#F5C12C',
    paddingHorizontal: 10, paddingVertical: 2,
    borderRadius: radius.pill,
  },
  ilanBadgeSmallText: { color: '#1A1A1A', fontSize: 10, fontWeight: '800' },
  ilanBody: { padding: spacing.sm, gap: 6 },
  ilanTitle: { fontSize: 13, fontWeight: '700', color: colors.onSurface },
  ilanFooterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ilanPricePill: {
    backgroundColor: '#FFF1D6',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  ilanPriceText: { color: '#A86F1F', fontSize: 11, fontWeight: '800' },
  ilanLoc: { color: colors.muted, fontSize: 10, fontWeight: '600', maxWidth: 90 },
});
