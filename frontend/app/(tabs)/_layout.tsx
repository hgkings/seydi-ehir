import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow } from '@/constants/theme';

function CenterFab() {
  const router = useRouter();
  return (
    <Pressable
      testID="tab-create-fab"
      onPress={() => router.push('/yeni-gonderi')}
      style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
      hitSlop={12}
    >
      <Ionicons name="add" size={28} color="#fff" />
    </Pressable>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.onSurface,
        tabBarInactiveTintColor: '#9B9690',
        tabBarStyle: {
          backgroundColor: colors.surfaceSecondary,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          position: 'absolute',
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
          tabBarTestID: 'tab-home',
        }}
      />
      <Tabs.Screen
        name="kategoriler"
        options={{
          title: 'Kategoriler',
          tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />,
          tabBarTestID: 'tab-categories',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: () => <CenterFab />,
          tabBarButton: (props) => (
            <View style={styles.fabWrap} pointerEvents="box-none">
              <CenterFab />
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => { e.preventDefault(); },
        }}
      />
      <Tabs.Screen
        name="buradayim"
        options={{
          title: 'Buradayım',
          tabBarIcon: ({ color }) => <Ionicons name="location-outline" size={22} color={color} />,
          tabBarTestID: 'tab-buradayim',
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
          tabBarTestID: 'tab-profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    ...Platform.select({
      ios: { ...shadow.card },
      android: { elevation: 8 },
    }),
  },
});
