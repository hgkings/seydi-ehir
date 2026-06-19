import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { api } from '@/src/api';
import { useAuth } from '@/src/auth';

const { width } = Dimensions.get('window');

export default function Akis() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([api.posts(), api.stories()]);
      setPosts(p);
      setStories(s);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const toggleLike = async (post: any) => {
    if (!user) {
      router.push('/welcome');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const res = await api.toggleLike(post.id);
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, liked_by_me: res.liked, like_count: res.like_count } : p))
      );
    } catch (e) {
      console.warn(e);
    }
  };

  const Header = () => (
    <View>
      <View style={styles.topBar}>
        <Text style={styles.brandTitle}>Akış</Text>
        <Pressable
          testID="create-post-btn"
          style={styles.createBtn}
          onPress={() => (user ? router.push('/yeni-gonderi') : router.push('/welcome'))}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesRow}>
        <Pressable
          style={styles.storyItem}
          testID="add-story-btn"
          onPress={() => (user ? router.push('/yeni-gonderi') : router.push('/welcome'))}
        >
          <View style={[styles.storyAvatarOuter, { borderColor: colors.border }]}>
            <View style={styles.addStoryInner}>
              <Ionicons name="add" size={24} color={colors.brandPrimary} />
            </View>
          </View>
          <Text style={styles.storyName} numberOfLines={1}>Hikayem</Text>
        </Pressable>
        {stories.map((s) => (
          <View key={s.id} style={styles.storyItem}>
            <View style={[styles.storyAvatarOuter, { borderColor: colors.brandPrimary }]}>
              <Image source={{ uri: s.avatar_url }} style={styles.storyAvatar} contentFit="cover" />
            </View>
            <Text style={styles.storyName} numberOfLines={1}>{s.username}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']} testID="feed-screen">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={Header}
        renderItem={({ item }) => (
          <View style={styles.post} testID={`post-${item.id}`}>
            <View style={styles.postHeader}>
              <Image source={{ uri: item.avatar_url }} style={styles.postAvatar} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.postUser}>{item.full_name}</Text>
                <Text style={styles.postHandle}>@{item.username}</Text>
              </View>
              <Pressable hitSlop={8}>
                <Ionicons name="ellipsis-horizontal" size={20} color={colors.muted} />
              </Pressable>
            </View>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.postImage} contentFit="cover" />
            ) : null}
            <View style={styles.actions}>
              <Pressable testID={`like-btn-${item.id}`} onPress={() => toggleLike(item)} hitSlop={8} style={styles.actionBtn}>
                <Ionicons
                  name={item.liked_by_me ? 'heart' : 'heart-outline'}
                  size={26}
                  color={item.liked_by_me ? colors.error : colors.onSurface}
                />
              </Pressable>
              <Pressable hitSlop={8} style={styles.actionBtn}>
                <Ionicons name="chatbubble-outline" size={24} color={colors.onSurface} />
              </Pressable>
              <Pressable hitSlop={8} style={styles.actionBtn}>
                <Ionicons name="paper-plane-outline" size={24} color={colors.onSurface} />
              </Pressable>
              <View style={{ flex: 1 }} />
              <Pressable hitSlop={8} style={styles.actionBtn}>
                <Ionicons name="bookmark-outline" size={24} color={colors.onSurface} />
              </Pressable>
            </View>
            <View style={styles.postFooter}>
              <Text style={styles.likeCount}>{item.like_count} beğeni</Text>
              <Text style={styles.postText}>
                <Text style={{ fontWeight: '700' }}>{item.username}</Text>  {item.text}
              </Text>
              {item.comment_count > 0 && (
                <Text style={styles.commentLink}>Tüm {item.comment_count} yorumu gör</Text>
              )}
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brandPrimary} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceSecondary },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  brandTitle: { ...typography.display, color: colors.onSurface },
  createBtn: {
    width: 36, height: 36, borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  storiesRow: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.md },
  storyItem: { alignItems: 'center', width: 72 },
  storyAvatarOuter: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2, padding: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  storyAvatar: { width: '100%', height: '100%', borderRadius: 30 },
  addStoryInner: {
    width: '100%', height: '100%',
    borderRadius: 30,
    backgroundColor: colors.brandTertiary,
    alignItems: 'center', justifyContent: 'center',
  },
  storyName: { fontSize: 11, color: colors.onSurface, marginTop: 4 },
  post: { backgroundColor: colors.surfaceSecondary },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  postAvatar: { width: 40, height: 40, borderRadius: 20 },
  postUser: { ...typography.bodyBold, color: colors.onSurface },
  postHandle: { color: colors.muted, fontSize: 12 },
  postImage: { width, height: width, backgroundColor: colors.surfaceTertiary },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  actionBtn: { padding: 2 },
  postFooter: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: 4 },
  likeCount: { ...typography.bodyBold, color: colors.onSurface, fontSize: 14 },
  postText: { color: colors.onSurface, fontSize: 14, lineHeight: 20 },
  commentLink: { color: colors.muted, fontSize: 13, marginTop: 2 },
});
