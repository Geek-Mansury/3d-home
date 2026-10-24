// Custom floating pill tab bar, protected by Clerk auth (as in the course).
import React from 'react';
import { View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, tabs } from '../../constants/theme';

const TabIcon = ({ focused, icon }) => (
  <View className={`size-12 items-center justify-center rounded-full ${focused ? 'bg-accent' : ''}`}>
    <Ionicons name={focused ? icon : `${icon}-outline`} size={22} color={focused ? colors.primary : '#fff'} />
  </View>
);

export default function TabLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(insets.bottom, 14),
          marginHorizontal: 20,
          height: 68,
          borderRadius: 34,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: { height: 68, alignItems: 'center', justifyContent: 'center' },
      }}
    >
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{ title: t.title, tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={t.icon} /> }}
        />
      ))}
    </Tabs>
  );
}
