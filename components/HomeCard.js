// Expandable card (same pattern as the course's SubscriptionCard)
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { formatArea, formatDate, homeArea, homeFrames } from '../lib/utils';

const Row = ({ label, value }) => (
  <View className="flex-row justify-between">
    <Text className="text-primary/60">{label}</Text>
    <Text className="font-semibold text-primary">{value}</Text>
  </View>
);

export default function HomeCard({ home, expanded, onPress, onOpen }) {
  return (
    <Pressable onPress={onPress} className="mb-3 rounded-3xl p-4" style={{ backgroundColor: home.color }}>
      <View className="flex-row items-center gap-3">
        <View className="size-14 items-center justify-center rounded-2xl bg-white/60">
          <Text className="text-2xl">🏠</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-primary" numberOfLines={1}>{home.name}</Text>
          <Text className="text-primary/60" numberOfLines={1}>{home.address || 'No address'}</Text>
        </View>
        <View className="items-end">
          <Text className="font-bold text-primary">{formatArea(homeArea(home))}</Text>
          <Text className="text-xs text-primary/60">{home.rooms.length} rooms</Text>
        </View>
      </View>
      {expanded && (
        <View className="mt-4 gap-2 border-t border-black/10 pt-4">
          <Row label="Added" value={formatDate(home.createdAt)} />
          <Row label="Frames captured" value={String(homeFrames(home))} />
          <Row label="Scanned rooms" value={`${home.rooms.filter((r) => r.frames.length).length}/${home.rooms.length}`} />
          <Pressable onPress={onOpen} className="mt-2 items-center rounded-xl bg-primary py-3">
            <Text className="font-bold text-white">Open home</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}
