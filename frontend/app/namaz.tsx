// Namaz Vakitleri detay ekranı
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '@/constants/theme';
import { api } from '@/src/api';

export default function NamazScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.namaz().then(setData).catch(console.warn);
  }, []);

  if (!data) {
    return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={colors.brandPrimary} /></View>;
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container} testID="namaz-screen">
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} testID="back-btn">
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Namaz Vakitleri</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="moon" size={28} color="#fff" />
          </View>
          <Text style={styles.heroCity}>{data.city}</Text>
          <Text style={styles.heroDate}>{data.date}</Text>
          <View style={styles.heroDivider} />
          <Text style={styles.heroSub}>Sıradaki vakit</Text>
          <Text style={styles.heroNext}>{data.next_name} · {data.next_time}</Text>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>{data.next_in} kaldı</Text>
          </View>
        </View>

        <View style={styles.list}>
          {data.times.map((t: any, idx: number) => (
            <View
              key={t.name}
              style={[styles.timeRow, idx !== data.times.length - 1 && styles.divider, idx === data.next_index && styles.timeRowActive]}
            >
              <View style={[styles.dot, idx === data.next_index && styles.dotActive]} />
              <Text style={[styles.timeName, idx === data.next_index && styles.timeNameActive]}>{t.name}</Text>
              <View style={{ flex: 1 }} />
              <Text style={[styles.timeValue, idx === data.next_index && styles.timeValueActive]}>{t.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  headerTitle: { ...typography.h2, color: colors.onSurface },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  heroCard: {
    backgroundColor: '#1F7A4D',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  heroIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroCity: { color: '#fff', fontSize: 22, fontWeight: '800' },
  heroDate: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
  heroDivider: { width: 40, height: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: spacing.lg },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  heroNext: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 4 },
  heroPill: { marginTop: spacing.md, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.pill },
  heroPillText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  list: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  timeRowActive: { backgroundColor: '#DFF3E6' },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border },
  dotActive: { backgroundColor: '#1F7A4D' },
  timeName: { fontSize: 16, fontWeight: '600', color: colors.onSurface },
  timeNameActive: { color: '#1F7A4D', fontWeight: '800' },
  timeValue: { fontSize: 17, fontWeight: '700', color: colors.onSurface },
  timeValueActive: { color: '#1F7A4D' },
});
