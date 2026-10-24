import React from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useClerk, useUser } from '@clerk/clerk-expo';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { useHomes } from '../../lib/store';

export default function Settings() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { homes, seedDemo, reset } = useHomes();
  const email = user?.primaryEmailAddress?.emailAddress ?? '';

  return (
    <Screen className="flex-1 bg-background px-5">
      <ScrollView contentContainerClassName="pb-36" showsVerticalScrollIndicator={false}>
        <Text className="mb-4 mt-2 text-3xl font-bold text-primary">Settings</Text>

        <View className="mb-6 flex-row items-center gap-4 rounded-3xl border border-black/10 bg-white p-4">
          <View className="size-14 items-center justify-center rounded-full bg-primary">
            <Text className="text-xl font-bold text-white">{email[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-primary" numberOfLines={1}>{user?.fullName ?? 'Your account'}</Text>
            <Text className="text-primary/60" numberOfLines={1}>{email}</Text>
          </View>
        </View>

        <View className="gap-3">
          <Button title="Load demo home" variant="secondary" onPress={seedDemo} />
          <Button
            title="Erase all local data"
            variant="secondary"
            disabled={!homes.length}
            onPress={() => Alert.alert('Erase everything?', 'All homes, rooms and scans on this phone will be removed.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Erase', style: 'destructive', onPress: reset },
            ])}
          />
          <Button title="Sign out" variant="dark" onPress={() => signOut()} />
        </View>
        <Text className="mt-8 text-center text-sm text-primary/40">3D Home · v1.0.0</Text>
      </ScrollView>
    </Screen>
  );
}
