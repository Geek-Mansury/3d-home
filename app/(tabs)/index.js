import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import Screen from '../../components/Screen';
import ListHeading from '../../components/ListHeading';
import HomeCard from '../../components/HomeCard';
import RoomCard from '../../components/RoomCard';
import CreateHomeModal from '../../components/CreateHomeModal';
import Button from '../../components/Button';
import { useHomes } from '../../lib/store';
import { formatArea, homeArea, homeFrames } from '../../lib/utils';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useUser();
  const { homes, seedDemo } = useHomes();
  const [expandedId, setExpandedId] = useState(null);
  const [modal, setModal] = useState(false);

  const stats = useMemo(
    () => ({
      area: homes.reduce((n, h) => n + homeArea(h), 0),
      rooms: homes.reduce((n, h) => n + h.rooms.length, 0),
      frames: homes.reduce((n, h) => n + homeFrames(h), 0),
    }),
    [homes]
  );
  const rooms = useMemo(() => homes.flatMap((h) => h.rooms.map((r) => ({ room: r, color: h.color }))).slice(0, 8), [homes]);
  const name = user?.firstName ?? user?.primaryEmailAddress?.emailAddress?.split('@')[0] ?? 'there';

  return (
    <Screen className="flex-1 bg-background px-5">
      <FlatList
        data={homes}
        keyExtractor={(h) => h.id}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-36"
        ListHeaderComponent={
          <>
            <View className="mb-5 mt-2 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="size-12 items-center justify-center rounded-full bg-primary">
                  <Text className="text-lg font-bold text-white">{name[0]?.toUpperCase()}</Text>
                </View>
                <View>
                  <Text className="text-primary/60">Welcome back</Text>
                  <Text className="text-lg font-bold text-primary">{name}</Text>
                </View>
              </View>
              <Pressable onPress={() => setModal(true)} className="size-11 items-center justify-center rounded-full bg-primary">
                <Text className="text-2xl leading-7 text-white">＋</Text>
              </Pressable>
            </View>

            <View className="rounded-3xl bg-accent p-5">
              <Text className="font-semibold text-primary/70">Total mapped area</Text>
              <Text className="mt-1 text-4xl font-extrabold text-primary">{formatArea(stats.area)}</Text>
              <View className="mt-4 flex-row justify-between">
                <Text className="font-semibold text-primary">{homes.length} homes</Text>
                <Text className="font-semibold text-primary">{stats.rooms} rooms</Text>
                <Text className="font-semibold text-primary">{stats.frames} frames</Text>
              </View>
            </View>

            {rooms.length > 0 && (
              <>
                <ListHeading title="Rooms" onViewAll={() => router.push('/homes')} />
                <FlatList
                  horizontal
                  data={rooms}
                  keyExtractor={(i) => i.room.id}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => <RoomCard room={item.room} color={item.color} onPress={() => router.push(`/rooms/${item.room.id}`)} />}
                />
              </>
            )}
            <ListHeading title="All homes" onViewAll={homes.length ? () => router.push('/homes') : undefined} />
          </>
        }
        renderItem={({ item }) => (
          <HomeCard
            home={item}
            expanded={expandedId === item.id}
            onPress={() => setExpandedId((id) => (id === item.id ? null : item.id))}
            onOpen={() => router.push(`/home/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center rounded-3xl bg-muted p-6">
            <Text className="text-5xl">🏠</Text>
            <Text className="mt-2 text-lg font-bold text-primary">No homes yet</Text>
            <Text className="mb-4 mt-1 text-center text-primary/60">Add a home, or load a demo to try the 3D viewer.</Text>
            <Button title="Load demo home" variant="dark" onPress={seedDemo} />
          </View>
        }
      />
      <CreateHomeModal visible={modal} onClose={() => setModal(false)} />
    </Screen>
  );
}
