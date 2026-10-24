import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import { useHomes } from '../../lib/store';
import { coverage, formatArea, roomArea } from '../../lib/utils';

export default function Insights() {
  const { homes } = useHomes();
  const rooms = homes.flatMap((h) => h.rooms.map((r) => ({ ...r, color: h.color, homeName: h.name })));
  const scanned = rooms.filter((r) => r.frames.length).length;
  const avg = rooms.length ? Math.round((rooms.reduce((n, r) => n + coverage(r), 0) / rooms.length) * 100) : 0;
  const maxArea = Math.max(1, ...rooms.map(roomArea));

  return (
    <Screen className="flex-1 bg-background px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-36">
        <Text className="mb-4 mt-2 text-3xl font-bold text-primary">Insights</Text>

        <View className="mb-6 flex-row gap-3">
          <View className="flex-1 rounded-3xl bg-primary p-4">
            <Text className="text-white/60">Rooms scanned</Text>
            <Text className="mt-1 text-3xl font-extrabold text-white">{scanned}/{rooms.length}</Text>
          </View>
          <View className="flex-1 rounded-3xl bg-accent p-4">
            <Text className="text-primary/70">Avg. coverage</Text>
            <Text className="mt-1 text-3xl font-extrabold text-primary">{avg}%</Text>
          </View>
        </View>

        <Text className="mb-3 text-xl font-bold text-primary">Room size</Text>
        <View className="mb-6 gap-3 rounded-3xl border border-black/10 bg-white p-4">
          {rooms.length === 0 && <Text className="text-primary/60">Add rooms to see how they compare.</Text>}
          {rooms.map((r) => (
            <View key={r.id}>
              <View className="mb-1 flex-row justify-between">
                <Text className="font-semibold text-primary" numberOfLines={1}>{r.name} <Text className="font-normal text-primary/50">· {r.homeName}</Text></Text>
                <Text className="text-primary/60">{formatArea(roomArea(r))}</Text>
              </View>
              <View className="h-3 overflow-hidden rounded-full bg-muted">
                <View className="h-full rounded-full" style={{ width: `${(roomArea(r) / maxArea) * 100}%`, backgroundColor: r.color }} />
              </View>
            </View>
          ))}
        </View>

        <Text className="mb-3 text-xl font-bold text-primary">Scan coverage</Text>
        <View className="gap-3 rounded-3xl border border-black/10 bg-white p-4">
          {rooms.map((r) => {
            const pct = Math.round(coverage(r) * 100);
            return (
              <View key={r.id}>
                <View className="mb-1 flex-row justify-between">
                  <Text className="font-semibold text-primary">{r.name}</Text>
                  <Text className={pct === 100 ? 'font-bold text-success' : 'text-primary/60'}>{pct}%</Text>
                </View>
                <View className="h-3 overflow-hidden rounded-full bg-muted">
                  <View className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}
