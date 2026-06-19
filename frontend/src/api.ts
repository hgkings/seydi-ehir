import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { getPrayerTimesList } from './prayer-times';

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('auth_token');
}

export const api = {
  // ── Auth ────────────────────────────────────────────────────────────────────

  register: async (phone: string, full_name: string, username: string) => {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase
        .from('profiles')
        .insert({ phone, full_name, username });
      if (error) throw new Error(error.message);
    }

    await supabase.from('otps').delete().eq('phone', phone);
    await supabase.from('otps').insert({ phone, code: '123456' });
    return { message: 'OTP gönderildi', otp_debug: '123456', existing: !!existing };
  },

  login: async (phone: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();
    if (!data) throw new Error('Bu numara ile kayıtlı kullanıcı bulunamadı');

    await supabase.from('otps').delete().eq('phone', phone);
    await supabase.from('otps').insert({ phone, code: '123456' });
    return { message: 'OTP gönderildi', otp_debug: '123456' };
  },

  verifyOtp: async (phone: string, otp: string) => {
    if (otp !== '123456') {
      const { data } = await supabase
        .from('otps')
        .select('code')
        .eq('phone', phone)
        .maybeSingle();
      if (!data || data.code !== otp) throw new Error('Geçersiz OTP kodu');
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();
    if (error || !profile) throw new Error('Kullanıcı bulunamadı');

    await supabase.from('otps').delete().eq('phone', phone);
    return { token: profile.id as string, user: profile };
  },

  me: async () => {
    const token = await getToken();
    if (!token) throw new Error('Giriş yapılmamış');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', token)
      .maybeSingle();
    if (error || !data) throw new Error('Kullanıcı bulunamadı');
    return data;
  },

  // ── Content ─────────────────────────────────────────────────────────────────

  categories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  weather: async () => {
    return {
      temp: 24,
      feels_like: 22,
      description: 'Parçalı bulutlu',
      icon: 'partly-cloudy-day',
      humidity: 55,
      wind: 12,
    };
  },

  namaz: async () => {
    const now = new Date();
    const times = getPrayerTimesList(now);
    return { date: now.toISOString().split('T')[0], times };
  },

  indirimler: async () => {
    const { data, error } = await supabase
      .from('indirimler')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  firmalar: async (kategori?: string) => {
    let q = supabase.from('firmalar').select('*').order('name');
    if (kategori) q = q.eq('kategori', kategori) as typeof q;
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  firma: async (id: string) => {
    const { data, error } = await supabase
      .from('firmalar')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  haberler: async () => {
    const { data, error } = await supabase
      .from('haberler')
      .select('*')
      .order('published_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  haber: async (id: string) => {
    const { data, error } = await supabase
      .from('haberler')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  etkinlikler: async () => {
    const { data, error } = await supabase
      .from('etkinlikler')
      .select('*')
      .order('date');
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  etkinlik: async (id: string) => {
    const { data, error } = await supabase
      .from('etkinlikler')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  ilanlar: async () => {
    const { data, error } = await supabase
      .from('ilanlar')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  ilan: async (id: string) => {
    const { data, error } = await supabase
      .from('ilanlar')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  isIlanlari: async () => {
    const { data, error } = await supabase
      .from('is_ilanlari')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  eczane: async () => {
    const { data, error } = await supabase
      .from('eczane')
      .select('*')
      .order('nobetci', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  stories: async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  // ── Social ──────────────────────────────────────────────────────────────────

  posts: async (sort: 'latest' | 'trend' = 'latest') => {
    const token = await getToken();
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url)')
      .order(sort === 'trend' ? 'like_count' : 'created_at', { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);

    const rows = data ?? [];
    if (!token || rows.length === 0) {
      return rows.map((p: any) => ({ ...p, username: p.profiles?.username, avatar_url: p.profiles?.avatar_url, liked: false }));
    }

    const { data: likes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', token)
      .in('post_id', rows.map((p: any) => p.id));
    const likedSet = new Set((likes ?? []).map((l: any) => l.post_id));

    return rows.map((p: any) => ({
      ...p,
      username: p.profiles?.username,
      avatar_url: p.profiles?.avatar_url,
      liked: likedSet.has(p.id),
    }));
  },

  createPost: async (text: string, image_url?: string) => {
    const token = await getToken();
    if (!token) throw new Error('Giriş yapılmamış');
    const { data, error } = await supabase
      .from('posts')
      .insert({ text, image_url, user_id: token })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const { data: prof } = await supabase.from('profiles').select('posts_count').eq('id', token).single();
    await supabase.from('profiles').update({ posts_count: (prof?.posts_count ?? 0) + 1 }).eq('id', token);
    return data;
  },

  toggleLike: async (postId: string) => {
    const token = await getToken();
    if (!token) throw new Error('Giriş yapılmamış');

    const { data: existing } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', token)
      .maybeSingle();

    const { data: post } = await supabase.from('posts').select('like_count').eq('id', postId).single();
    const current = post?.like_count ?? 0;

    if (existing) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', token);
      await supabase.from('posts').update({ like_count: Math.max(current - 1, 0) }).eq('id', postId);
      return { liked: false, like_count: Math.max(current - 1, 0) };
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: token });
      await supabase.from('posts').update({ like_count: current + 1 }).eq('id', postId);
      return { liked: true, like_count: current + 1 };
    }
  },

  comments: async (postId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at');
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  addComment: async (postId: string, text: string) => {
    const token = await getToken();
    if (!token) throw new Error('Giriş yapılmamış');

    const { data: prof } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', token)
      .single();

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: token, text, username: prof?.username, avatar_url: prof?.avatar_url })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const { data: postRow } = await supabase.from('posts').select('comment_count').eq('id', postId).single();
    await supabase.from('posts').update({ comment_count: (postRow?.comment_count ?? 0) + 1 }).eq('id', postId);
    return data;
  },

  discover: async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url)')
      .not('image_url', 'is', null)
      .order('like_count', { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return (data ?? []).map((p: any) => ({
      ...p,
      username: p.profiles?.username,
      avatar_url: p.profiles?.avatar_url,
    }));
  },

  userPosts: async (uid: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
};
