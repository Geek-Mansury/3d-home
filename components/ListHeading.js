import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function ListHeading({ title, onViewAll }) {
  return (
    <View className="mb-3 mt-6 flex-row items-center justify-between">
      <Text className="text-xl font-bold text-primary">{title}</Text>
      {onViewAll && (
        <Pressable onPress={onViewAll} className="rounded-full border border-black/10 px-3 py-1.5">
          <Text className="text-sm font-semibold text-primary">View all</Text>
        </Pressable>
      )}
    </View>
  );
}
