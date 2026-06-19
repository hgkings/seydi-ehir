import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { api } from '@/src/api';
import { useAuth } from '@/src/auth';

const { width } = Dimensions.get('window');
const gridSize = (width - spacing.lg * 2 - 4) / 3;

export default function Profil() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [tab, setTab] = useState<'posts' | 'saved'>('posts');

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const p = await api.userPosts(user.id);
      setPosts(p);
    } catch (e) {
      console.warn(e);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.guestWrap}>
          <View style={[styles.guestIcon, { backgroundColor: colors.brandTertiary }]}>
            <Ionicons name="person" size={36} color={colors.brandPrimary} />
          </View>
          <Text style={styles.guestTitle}>Profilini oluştur</Text>
          <Text style={styles.guestText}>Etkileşime girmek için giriş yap.</Text>
          <Pressable
            testID="profile-login-btn"
            style={styles.primaryBtn}
            onPress={() => router.push('/welcome')}
          >
            <Text style={styles.primaryBtnText}>Giriş Yap / Kayıt Ol</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="profile-screen">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.topBar}>
          <Text style={styles.username}>@{user.username}</Text>
          <Pressable hitSlop={8} testID="profile-settings-btn" onPress={signOut}>
            <Ionicons name="log-out-outline" size={24} color={colors.onSurface} />
          </Pressable>
        </View>

        {/* Header */}
        <View style={styles.profHeader}>
          <Image
            source={{ uri: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }}
            style={styles.avatar}
            contentFit="cover"
          />
          <View style={styles.stats}>
            <StatBlock value={user.posts_count} label="Gönderi" />
            <StatBlock value={user.followers_count} label="Takipçi" />
            <StatBlock value={user.following_count} label="Takip" />
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.lg }}>
          <Text style={styles.fullName}>{user.full_name}</Text>
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
          <View style={styles.actionRow}>
            <Pressable style={styles.editBtn}>
              <Text style={styles.editBtnText}>Profili Düzenle</Text>
            </Pressable>
            <Pressable style={styles.shareBtn}>
              <Ionicons name="share-outline" size={18} color={colors.onSurface} />
            </Pressable>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tabBtn, tab === 'posts' && styles.tabBtnActive]}
            onPress={() => setTab('posts')}
            testID="profile-tab-posts"
          >
            <Ionicons name="grid-outline" size={20} color={tab === 'posts' ? colors.onSurface : colors.muted} />
          </Pressable>
          <Pressable
            style={[styles.tabBtn, tab === 'saved' && styles.tabBtnActive]}
            onPress={() => setTab('saved')}
            testID="profile-tab-saved"
          >
            <Ionicons name="bookmark-outline" size={20} color={tab === 'saved' ? colors.onSurface : colors.muted} />
          </Pressable>
        </View>

        {tab === 'posts' ? (
          posts.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="camera-outline" size={48} color={colors.muted} />
              <Text style={styles.emptyTitle}>Henüz fotoğraf paylaşmadın</Text>
              <Pressable style={styles.primaryBtn} onPress={() => router.push('/yeni-gonderi')}>
                <Text style={styles.primaryBtnText}>İlk Gönderini Oluştur</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={posts}
              keyExtractor={(it) => it.id}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 2 }}
              columnWrapperStyle={{ gap: 2 }}
              renderItem={({ item }) => (
                <View style={[styles.gridItem, { width: gridSize, height: gridSize }]}>
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                  ) : (
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.brandTertiary, padding: 8 }]}>
                      <Text style={{ color: colors.brandPrimary, fontSize: 11 }} numberOfLines={6}>{item.text}</Text>
                    </View>
                  )}
                </View>
              )}
            />
          )
        ) : (
          <View style={styles.emptyWrap}>
            <Ionicons name="bookmark-outline" size={48} color={colors.muted} />
            <Text style={styles.emptyTitle}>Kaydedilen gönderi yok</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBlock({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  username: { ...typography.h1, color: colors.onSurface },
  profHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
    marginBottom: spacing.md,
  },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.surfaceTertiary },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  statBlock: { alignItems: 'center' },
  statValue: { ...typography.h2, color: colors.onSurface },
  statLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
  fullName: { ...typography.bodyBold, color: colors.onSurface, fontSize: 16 },
  bio: { color: colors.onSurfaceTertiary, fontSize: 14, marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: spacing.md },
  editBtn: {
    flex: 1,
    backgroundColor: colors.surfaceTertiary,
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  editBtnText: { fontWeight: '600', color: colors.onSurface, fontSize: 14 },
  shareBtn: {
    width: 40,
    height: 40,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    marginTop: spacing.lg,
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: colors.onSurface },
  gridItem: { backgroundColor: colors.surfaceTertiary, overflow: 'hidden' },
  emptyWrap: { alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { color: colors.muted, fontSize: 15 },
  guestWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  guestIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  guestTitle: { ...typography.h1, color: colors.onSurface },
  guestText: { color: colors.muted, textAlign: 'center' },
  primaryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.brandPrimary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
