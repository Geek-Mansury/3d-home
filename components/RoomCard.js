// Compact card for horizontal lists (like the course's UpcomingSubscriptionCard)
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { coverage, formatArea, roomArea } from '../lib/utils';

export default function RoomCard({ room, color, onPress }) {
  const pct = Math.round(coverage(room) * 100);
  return (
    <Pressable onPress={onPress} className="mr-3 w-40 rounded-3xl border border-black/10 bg-white p-4">
      <View className="mb-3 size-11 items-center justify-center rounded-xl" style={{ backgroundColor: color }}>
        <Text className="text-xl">🛋️</Text>
      </View>
      <Text className="font-bold text-primary" numberOfLines={1}>{room.name}</Text>
      <Text className="text-sm text-primary/60" numberOfLines={1}>{formatArea(roomArea(room))}</Text>
      <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <View className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </View>
      <Text className="mt-1 text-xs text-primary/60">{pct}% scanned</Text>
    </Pressable>
  );
}
