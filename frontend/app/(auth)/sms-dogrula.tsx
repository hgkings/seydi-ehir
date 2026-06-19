import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { api } from '@/src/api';
import { useAuth } from '@/src/auth';

export default function SmsDogrula() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { signInWithToken } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!phone) {
      setError('Telefon bilgisi eksik');
      return;
    }
    setLoading(true);
    try {
      const res = await api.verifyOtp(phone, otp.trim());
      await signInWithToken(res.token, res.user);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.message || 'OTP doğrulanamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} hitSlop={12} testID="back-btn">
            <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>SMS Doğrulama</Text>
          <Text style={styles.subtitle}>
            <Text style={{ fontWeight: '600' }}>{phone}</Text> numarasına bir kod gönderdik.
          </Text>

          <View style={styles.demoNote}>
            <Ionicons name="key-outline" size={18} color={colors.warning} />
            <Text style={styles.demoNoteText}>Demo OTP: 123456</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>6 haneli kod</Text>
            <TextInput
              testID="otp-input"
              style={styles.input}
              placeholder="• • • • • •"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            testID="otp-verify-btn"
            style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>{loading ? 'Doğrulanıyor...' : 'Doğrula ve Giriş Yap'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.xl, gap: spacing.md },
  title: { ...typography.display, color: colors.onSurface, marginTop: spacing.md },
  subtitle: { color: colors.muted, fontSize: 15, marginBottom: spacing.lg },
  field: { gap: 6 },
  label: { ...typography.caption, color: colors.onSurfaceTertiary, fontWeight: '600' },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 18,
    fontSize: 24,
    letterSpacing: 8,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    fontWeight: '700',
  },
  primaryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.brandPrimary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  error: { color: colors.error, fontSize: 13 },
  demoNote: {
    backgroundColor: '#FFF7E6',
    padding: spacing.md,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  demoNoteText: { color: colors.warning, fontSize: 13, fontWeight: '600' },
});
