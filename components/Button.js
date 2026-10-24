import React from 'react';
import { Pressable, Text } from 'react-native';

const box = { primary: 'bg-accent', dark: 'bg-primary', secondary: 'bg-white border border-black/10', danger: '' };
const label = { primary: 'text-primary', dark: 'text-white', secondary: 'text-primary', danger: 'text-destructive' };

export default function Button({ title, onPress, variant = 'primary', disabled, className = '' }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`rounded-2xl px-5 py-4 items-center ${box[variant]} ${disabled ? 'opacity-40' : 'active:opacity-80'} ${className}`}
    >
      <Text className={`text-base font-bold ${label[variant]}`}>{title}</Text>
    </Pressable>
  );
}
