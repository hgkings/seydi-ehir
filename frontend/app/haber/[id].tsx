import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { api } from '@/src/api';

export default function HaberDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [haber, setHaber] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    api.haber(id).then(setHaber).catch(console.warn);
  }, [id]);

  if (!haber) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={colors.brandPrimary} /></View>;

  return (
    <View style={styles.container} testID="haber-detail">
      <ScrollView contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
        <Image source={{ uri: haber.image_url }} style={styles.hero} contentFit="cover" />
        <SafeAreaView style={styles.topNav} edges={['top']}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
        </SafeAreaView>
        <View style={styles.content}>
          <View style={styles.badge}><Text style={styles.badgeText}>{haber.kategori}</Text></View>
          <Text style={styles.title}>{haber.title}</Text>
          <Text style={styles.meta}>{haber.author} · {haber.views} okuma</Text>
          <Text style={styles.body}>{haber.content}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  hero: { width: '100%', height: 260, backgroundColor: colors.surfaceTertiary },
  topNav: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: spacing.lg },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: spacing.lg, gap: spacing.md },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.brandTertiary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { color: colors.brandPrimary, fontSize: 12, fontWeight: '700' },
  title: { ...typography.display, color: colors.onSurface, fontSize: 26, lineHeight: 32 },
  meta: { color: colors.muted, fontSize: 13 },
  body: { color: colors.onSurface, fontSize: 16, lineHeight: 26, marginTop: spacing.md },
});
