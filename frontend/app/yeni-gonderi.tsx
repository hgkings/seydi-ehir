import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { api } from '@/src/api';

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=900',
  'https://images.unsplash.com/photo-1551632811-561732d1e306?w=900',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900',
  'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=900',
];

export default function YeniGonderi() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!text.trim()) { setErr('Bir şeyler yazın'); return; }
    setLoading(true);
    setErr(null);
    try {
      await api.createPost(text.trim(), imageUrl || undefined);
      router.replace('/(tabs)/buradayim');
    } catch (e: any) {
      setErr(e?.message || 'Gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']} testID="new-post-screen">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} testID="back-btn">
            <Ionicons name="close" size={26} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Yeni Gönderi</Text>
          <Pressable onPress={submit} disabled={loading || !text.trim()} testID="post-submit-btn">
            <Text style={[styles.postBtn, (loading || !text.trim()) && { opacity: 0.4 }]}>
              {loading ? '...' : 'Paylaş'}
            </Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
          <TextInput
            testID="post-text-input"
            style={styles.input}
            placeholder="Bugün ne paylaşıyorsun?"
            placeholderTextColor={colors.muted}
            value={text}
            onChangeText={setText}
            multiline
          />

          <Text style={styles.label}>Bir görsel seç (opsiyonel)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <Pressable
              style={[styles.imgChoice, !imageUrl && styles.imgChoiceActive]}
              onPress={() => setImageUrl(null)}
            >
              <Ionicons name="close" size={20} color={colors.onSurface} />
            </Pressable>
            {SAMPLE_IMAGES.map((u) => (
              <Pressable
                key={u}
                style={[styles.imgChoice, imageUrl === u && styles.imgChoiceActive]}
                onPress={() => setImageUrl(u)}
                testID={`img-choice-${u.slice(-10)}`}
              >
                <View style={styles.imgInner}>
                  <View style={{ width: '100%', height: '100%', backgroundColor: colors.surfaceTertiary }} />
                </View>
              </Pressable>
            ))}
          </ScrollView>

          {err ? <Text style={styles.err}>{err}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.lg, borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  title: { ...typography.h2, color: colors.onSurface },
  postBtn: { color: colors.brandPrimary, fontWeight: '700', fontSize: 15 },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 140,
    color: colors.onSurface,
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 1, borderColor: colors.border,
  },
  label: { ...typography.caption, color: colors.onSurfaceTertiary, fontWeight: '600' },
  imgChoice: {
    width: 80, height: 80, borderRadius: radius.md,
    backgroundColor: colors.surfaceTertiary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
    overflow: 'hidden',
  },
  imgChoiceActive: { borderColor: colors.brandPrimary },
  imgInner: { width: '100%', height: '100%' },
  err: { color: colors.error, fontSize: 13 },
});
