import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { api } from '@/src/api';

export default function IlanDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [ilan, setIlan] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    api.ilan(id).then(setIlan).catch(console.warn);
  }, [id]);

  if (!ilan) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={colors.brandPrimary} /></View>;

  return (
    <View style={styles.container} testID="ilan-detail">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Image source={{ uri: ilan.image_url }} style={styles.hero} contentFit="cover" />
        <SafeAreaView style={styles.topNav} edges={['top']}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
        </SafeAreaView>
        <View style={styles.content}>
          <View style={styles.badge}><Text style={styles.badgeText}>{ilan.kategori}</Text></View>
          <Text style={styles.title}>{ilan.title}</Text>
          <Text style={styles.price}>{ilan.price > 0 ? `${ilan.price.toLocaleString('tr-TR')} ₺` : 'Ücretsiz'}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={colors.muted} />
            <Text style={styles.metaText}>{ilan.location}</Text>
          </View>
          <Text style={styles.desc}>{ilan.description}</Text>
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <Pressable style={styles.contactBtn} testID="ilan-contact-btn">
          <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
          <Text style={styles.contactText}>Satıcıyla İletişim</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  hero: { width: '100%', height: 280, backgroundColor: colors.surfaceTertiary },
  topNav: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: spacing.lg },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, gap: spacing.sm },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.brandTertiary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, marginBottom: 4 },
  badgeText: { color: colors.brandPrimary, fontSize: 12, fontWeight: '700' },
  title: { ...typography.h1, color: colors.onSurface },
  price: { ...typography.display, color: colors.brandPrimary, marginTop: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: { color: colors.muted, fontSize: 14 },
  desc: { color: colors.onSurface, fontSize: 15, lineHeight: 24, marginTop: spacing.md },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, backgroundColor: colors.surfaceSecondary, borderTopWidth: 1, borderTopColor: colors.border },
  contactBtn: { backgroundColor: colors.brandPrimary, paddingVertical: 14, borderRadius: radius.lg, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  contactText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
