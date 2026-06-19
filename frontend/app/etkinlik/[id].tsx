import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { api } from '@/src/api';

export default function EtkinlikDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    api.etkinlik(id).then(setItem).catch(console.warn);
  }, [id]);

  if (!item) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={colors.brandPrimary} /></View>;

  return (
    <View style={styles.container} testID="etkinlik-detail">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Image source={{ uri: item.image_url }} style={styles.hero} contentFit="cover" />
        <SafeAreaView style={styles.topNav} edges={['top']}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>
        </SafeAreaView>
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.brandPrimary} />
              <Text style={styles.infoText}>{item.event_date} · {item.event_time}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.brandPrimary} />
              <Text style={styles.infoText}>{item.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={20} color={colors.brandPrimary} />
              <Text style={styles.infoText}>{item.attendees_count} katılımcı</Text>
            </View>
          </View>
          <Text style={styles.desc}>{item.description}</Text>
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <Pressable style={styles.joinBtn} testID="etkinlik-join-btn">
          <Text style={styles.joinText}>Katılıyorum</Text>
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
  infoCard: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoText: { color: colors.onSurface, fontSize: 14, fontWeight: '500' },
  desc: { color: colors.onSurface, fontSize: 15, lineHeight: 24 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, backgroundColor: colors.surfaceSecondary, borderTopWidth: 1, borderTopColor: colors.border },
  joinBtn: { backgroundColor: colors.brandPrimary, paddingVertical: 14, borderRadius: radius.lg, alignItems: 'center' },
  joinText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
