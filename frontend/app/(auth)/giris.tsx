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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { api } from '@/src/api';

export default function Giris() {
  const router = useRouter();
  const [phone, setPhone] = useState('+90 ');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 10) {
      setError('Geçerli bir telefon girin.');
      return;
    }
    setLoading(true);
    try {
      await api.login(cleaned);
      router.push({ pathname: '/(auth)/sms-dogrula', params: { phone: cleaned } });
    } catch (e: any) {
      setError(e?.message || 'Giriş başarısız');
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
          <Text style={styles.title}>Tekrar hoş geldin</Text>
          <Text style={styles.subtitle}>Numaranı gir, SMS kodu ile giriş yap.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Telefon Numarası</Text>
            <TextInput
              testID="login-phone-input"
              style={styles.input}
              placeholder="+90 555 123 4567"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            testID="login-submit-btn"
            style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>{loading ? 'Gönderiliyor...' : 'SMS Kodu Gönder'}</Text>
          </Pressable>

          <Pressable onPress={() => router.replace('/(auth)/kayit')} style={{ marginTop: spacing.lg }}>
            <Text style={styles.linkText}>
              Hesabım yok · <Text style={{ color: colors.brandPrimary, fontWeight: '700' }}>Kayıt ol</Text>
            </Text>
          </Pressable>

          <View style={styles.demoBox}>
            <Ionicons name="information-circle-outline" size={18} color={colors.info} />
            <Text style={styles.demoText}>
              Demo modda. Kayıttan sonra ekranda gösterilen OTP'yi (123456) girin.
            </Text>
          </View>
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
    paddingVertical: 14,
    fontSize: 16,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.border,
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
  linkText: { color: colors.onSurfaceTertiary, textAlign: 'center' },
  demoBox: {
    marginTop: spacing.xl,
    backgroundColor: '#EEF3F5',
    padding: spacing.md,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  demoText: { color: colors.info, fontSize: 12, flex: 1, lineHeight: 18 },
});
