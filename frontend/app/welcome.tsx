import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '@/constants/theme';

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container} testID="welcome-screen">
      <ImageBackground
        source={{ uri: 'https://images.pexels.com/photos/31673629/pexels-photo-31673629.jpeg?auto=compress&cs=tinysrgb&w=1080' }}
        style={styles.bg}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(26,26,26,0.85)', 'rgba(26,26,26,0.98)']}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.topBadge}>
            <Text style={styles.topBadgeText}>SEYDİŞEHİR</Text>
          </View>

          <View style={styles.bottomBlock}>
            <Text style={styles.title}>Şehrinin nabzını{'\n'}cebinde taşı.</Text>
            <Text style={styles.subtitle}>
              Esnaflar, etkinlikler, haberler ve sosyal akış — hepsi tek uygulamada.
            </Text>

            <Pressable
              testID="welcome-register-btn"
              style={styles.primaryBtn}
              onPress={() => router.push('/(auth)/kayit')}
            >
              <Text style={styles.primaryBtnText}>Hesap Oluştur</Text>
            </Pressable>
            <Pressable
              testID="welcome-login-btn"
              style={styles.secondaryBtn}
              onPress={() => router.push('/(auth)/giris')}
            >
              <Text style={styles.secondaryBtnText}>Zaten hesabım var</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },
  safe: { flex: 1, justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.xl },
  topBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  topBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  bottomBlock: { gap: spacing.md },
  title: { ...typography.display, color: '#fff', fontSize: 34, lineHeight: 40 },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 22, marginBottom: spacing.lg },
  primaryBtn: {
    backgroundColor: colors.brandPrimary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '500' },
});
