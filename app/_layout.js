import '../global.css';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { HomesProvider } from '../lib/store';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
  // Friendly setup screen instead of a crash when the Clerk key is missing
  if (!publishableKey) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-8">
        <Text className="mb-3 text-3xl font-bold text-primary">3D Home</Text>
        <Text className="text-center text-base leading-6 text-primary/70">
          Add your Clerk publishable key to a <Text className="font-bold">.env</Text> file as{'\n'}
          EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY{'\n\n'}then restart with <Text className="font-bold">npx expo start -c</Text>.
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <HomesProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff9e3' } }} />
      </HomesProvider>
    </ClerkProvider>
  );
}
