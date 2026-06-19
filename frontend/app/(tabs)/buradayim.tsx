import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography, shadow } from '@/constants/theme';
import { api } from '@/src/api';
import { useAuth } from '@/src/auth';

const { width } = Dimensions.get('window');

export default function Buradayim() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [tab, setTab] = useState<'trend' | 'latest'>('trend');
  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setPosts(await api.posts(tab)); } catch (e) { console.warn(e); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const toggleLike = async (post: any) => {
    if (!user) { router.push('/welcome'); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const res = await api.toggleLike(post.id);
      setPosts((prev) => prev.map((p) =>
        p.id === post.id ? { ...p, liked_by_me: res.liked, like_count: res.like_count } : p
      ));
    } catch (e) { console.warn(e); }
  };

  return (
    <View style={styles.container} testID="buradayim-screen">
      <View style={styles.headerBg}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Buradayım</Text>
            <Pressable
              testID="buradayim-share-btn"
              style={styles.shareBtn}
              onPress={() => (user ? router.push('/yeni-gonderi') : router.push('/welcome'))}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.shareBtnText}>Paylaş</Text>
            </Pressable>
          </View>
          <View style={styles.tabPill}>
            <Pressable
              testID="buradayim-tab-trend"
              style={[styles.tabBtn, tab === 'trend' && styles.tabBtnActive]}
              onPress={() => setTab('trend')}
            >
              <Text style={[styles.tabText, tab === 'trend' && styles.tabTextActive]}>Trend</Text>
            </Pressable>
            <Pressable
              testID="buradayim-tab-latest"
              style={[styles.tabBtn, tab === 'latest' && styles.tabBtnActive]}
              onPress={() => setTab('latest')}
            >
              <Text style={[styles.tabText, tab === 'latest' && styles.tabTextActive]}>Son Paylaşılanlar</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.post} testID={`buradayim-post-${item.id}`}>
            <View style={styles.postHeaderRow}>
              <View style={styles.postAvatar}>
                {item.avatar_url ? (
                  <Image source={{ uri: item.avatar_url }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                ) : (
                  <Text style={styles.postAvatarText}>{(item.username || 'U')[0].toUpperCase()}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.postUser}>@{item.username}</Text>
                <View style={styles.locRow}>
                  <Ionicons name="location" size={11} color="#E03864" />
                  <Text style={styles.locText}>Seydişehir</Text>
                  <Ionicons name="chevron-forward" size={11} color="#E03864" />
                </View>
              </View>
              <Text style={styles.postDate}>{formatRelative(item.created_at)}</Text>
            </View>

            <Text style={styles.postText}>{item.text}</Text>

            {item.image_url && (
              <View style={styles.postImageWrap}>
                <Image source={{ uri: item.image_url }} style={styles.postImage} contentFit="cover" />
              </View>
            )}

            <View style={styles.actionRow}>
              <Pressable
                testID={`buradayim-like-${item.id}`}
                onPress={() => toggleLike(item)}
                style={styles.actionBtn}
                hitSlop={8}
              >
                <Ionicons
                  name={item.liked_by_me ? 'heart' : 'heart-outline'}
                  size={22}
                  color={item.liked_by_me ? '#E03864' : colors.onSurfaceTertiary}
                />
                <Text style={styles.actionCount}>{item.like_count}</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} hitSlop={8}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.onSurfaceTertiary} />
                <Text style={styles.actionCount}>{item.comment_count}</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} hitSlop={8}>
                <Ionicons name="flag-outline" size={20} color={colors.onSurfaceTertiary} />
              </Pressable>
              <View style={{ flex: 1 }} />
              <Pressable hitSlop={8}>
                <Text style={styles.yorumlarLink}>Yorumlar</Text>
              </Pressable>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: 64 + insets.bottom + 24,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E03864" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={40} color={colors.muted} />
            <Text style={styles.emptyText}>Henüz paylaşım yok. İlk sen paylaş!</Text>
          </View>
        }
      />
    </View>
  );
}

function formatRelative(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'Mayıs', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  headerBg: { backgroundColor: '#E03864' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '800' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  tabPill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  tabBtnActive: { backgroundColor: '#fff' },
  tabText: { color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: 14 },
  tabTextActive: { color: '#E03864' },

  post: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.soft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  postHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  postAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FCE4EC',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  postAvatarText: { color: '#E03864', fontWeight: '800', fontSize: 16 },
  postUser: { color: colors.onSurface, fontSize: 15, fontWeight: '700' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  locText: { color: '#E03864', fontSize: 11, fontWeight: '600' },
  postDate: { color: colors.muted, fontSize: 12 },
  postText: { color: colors.onSurface, fontSize: 15, lineHeight: 21 },
  postImageWrap: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceTertiary,
  },
  postImage: { width: '100%', height: (width - spacing.lg * 2 - spacing.md * 2) * 0.6 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { color: colors.onSurfaceTertiary, fontWeight: '600', fontSize: 13 },
  yorumlarLink: { color: '#E03864', fontWeight: '700', fontSize: 13 },
  empty: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyText: { color: colors.muted, fontSize: 14 },
});
