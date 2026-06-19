import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { api } from '@/src/api';

export default function FirmaDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [firma, setFirma] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    api.firma(id).then(setFirma).catch(console.warn);
  }, [id]);

  if (!firma) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={colors.brandPrimary} /></View>;

  return (
    <View style={styles.container} testID="firma-detail">
      <ScrollView contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
        <Image source={{ uri: firma.image_url }} style={styles.hero} contentFit="cover" />
        <SafeAreaView style={styles.topNav} edges={['top']}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
        </SafeAreaView>
        <View style={styles.content}>
          <Text style={styles.title}>{firma.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>{firma.kategori}</Text></View>
            <Text style={styles.rating}>⭐ {firma.rating} ({firma.reviews_count})</Text>
          </View>
          <Text style={styles.desc}>{firma.description}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={colors.brandPrimary} />
            <Text style={styles.infoText}>{firma.adres}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={colors.brandPrimary} />
            <Text style={styles.infoText}>{firma.telefon}</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <Pressable style={styles.callBtn} onPress={() => Linking.openURL(`tel:${firma.telefon}`)} testID="firma-call-btn">
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.callText}>Hemen Ara</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  hero: { width: '100%', height: 280, backgroundColor: colors.surfaceTertiary },
  topNav: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: spacing.lg },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { ...typography.display, color: colors.onSurface },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  badge: { backgroundColor: colors.brandTertiary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { color: colors.brandPrimary, fontSize: 12, fontWeight: '700' },
  rating: { color: colors.onSurfaceTertiary, fontSize: 14, fontWeight: '600' },
  desc: { color: colors.onSurface, fontSize: 15, lineHeight: 22 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 8 },
  infoText: { color: colors.onSurfaceTertiary, fontSize: 14, flex: 1 },
  bottomBar: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surfaceSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  callBtn: {
    backgroundColor: colors.success,
    paddingVertical: 14, borderRadius: radius.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  callText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
