import React from 'react';
import { Text, TextInput, View } from 'react-native';

export default function Field({ label, error, className = '', ...props }) {
  return (
    <View className={`mb-4 ${className}`}>
      <Text className="mb-1.5 text-sm font-semibold text-primary/60">{label}</Text>
      <TextInput
        placeholderTextColor="rgba(8,17,38,0.35)"
        className={`rounded-xl border bg-white px-4 py-3 text-base text-primary ${error ? 'border-destructive' : 'border-black/10'}`}
        {...props}
      />
      {!!error && <Text className="mt-1 text-xs text-destructive">{error}</Text>}
    </View>
  );
}
