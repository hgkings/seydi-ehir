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

export default function Kayit() {
  const router = useRouter();
  const [phone, setPhone] = useState('+90 ');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 10 || !fullName.trim() || !username.trim()) {
      setError('Tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      await api.register(cleaned, fullName.trim(), username.trim().toLowerCase());
      router.push({ pathname: '/(auth)/sms-dogrula', params: { phone: cleaned } });
    } catch (e: any) {
      setError(e?.message || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} hitSlop={12} testID="back-btn">
            <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Hesap oluştur</Text>
          <Text style={styles.subtitle}>Seydişehir'in dijital ailesine katıl.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              testID="register-fullname-input"
              style={styles.input}
              placeholder="Adınız Soyadınız"
              placeholderTextColor={colors.muted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <TextInput
              testID="register-username-input"
              style={styles.input}
              placeholder="kullanici_adiniz"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Telefon Numarası</Text>
            <TextInput
              testID="register-phone-input"
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
            testID="register-submit-btn"
            style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>{loading ? 'Gönderiliyor...' : 'SMS Kodu Gönder'}</Text>
          </Pressable>

          <Pressable onPress={() => router.replace('/(auth)/giris')} style={{ marginTop: spacing.lg }}>
            <Text style={styles.linkText}>
              Zaten hesabım var · <Text style={{ color: colors.brandPrimary, fontWeight: '700' }}>Giriş yap</Text>
            </Text>
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
});
