import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;
const API = `${BASE}/api`;

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('auth_token');
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text();
    let detail = text;
    try {
      const j = JSON.parse(text);
      detail = j.detail || text;
    } catch {}
    throw new Error(detail || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  register: (phone: string, full_name: string, username: string) =>
    request<{ message: string; otp_debug: string; existing: boolean }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ phone, full_name, username }),
    }),
  login: (phone: string) =>
    request<{ message: string; otp_debug: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
  verifyOtp: (phone: string, otp: string) =>
    request<{ token: string; user: any }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    }),
  me: () => request<any>('/auth/me'),

  // Content
  categories: () => request<any[]>('/categories'),
  weather: () => request<any>('/weather'),
  namaz: () => request<any>('/namaz'),
  indirimler: () => request<any[]>('/indirimler'),
  firmalar: (kategori?: string) =>
    request<any[]>(`/firmalar${kategori ? `?kategori=${encodeURIComponent(kategori)}` : ''}`),
  firma: (id: string) => request<any>(`/firmalar/${id}`),
  haberler: () => request<any[]>('/haberler'),
  haber: (id: string) => request<any>(`/haberler/${id}`),
  etkinlikler: () => request<any[]>('/etkinlikler'),
  etkinlik: (id: string) => request<any>(`/etkinlikler/${id}`),
  ilanlar: () => request<any[]>('/ilanlar'),
  ilan: (id: string) => request<any>(`/ilanlar/${id}`),
  isIlanlari: () => request<any[]>('/is-ilanlari'),
  eczane: () => request<any[]>('/eczane'),
  stories: () => request<any[]>('/stories'),
  posts: (sort: 'latest' | 'trend' = 'latest') => request<any[]>(`/posts?sort=${sort}`),
  createPost: (text: string, image_url?: string) =>
    request<any>('/posts', { method: 'POST', body: JSON.stringify({ text, image_url }) }),
  toggleLike: (postId: string) =>
    request<{ liked: boolean; like_count: number }>(`/posts/${postId}/like`, { method: 'POST' }),
  comments: (postId: string) => request<any[]>(`/posts/${postId}/comments`),
  addComment: (postId: string, text: string) =>
    request<any>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  discover: () => request<any[]>('/discover'),
  userPosts: (uid: string) => request<any[]>(`/users/${uid}/posts`),
};
