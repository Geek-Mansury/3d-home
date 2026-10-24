import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function Segmented({ options, value, onChange }) {
  return (
    <View className="flex-row rounded-2xl bg-muted p-1">
      {options.map((o) => (
        <Pressable key={o} onPress={() => onChange(o)} className={`flex-1 items-center rounded-xl py-2.5 ${value === o ? 'bg-primary' : ''}`}>
          <Text className={`font-bold ${value === o ? 'text-white' : 'text-primary/60'}`}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}
