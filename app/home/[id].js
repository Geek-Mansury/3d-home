import React, { useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Field from '../../components/Field';
import { useHomes } from '../../lib/store';
import { coverage, formatArea, roomArea } from '../../lib/utils';

const EMPTY = { name: '', width: '4', depth: '3.5', height: '2.6' };

export default function HomeDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { homes, addRoom, deleteHome } = useHomes();
  const home = homes.find((h) => h.id === id);

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  if (!home) {
    return (
      <Screen className="flex-1 items-center justify-center bg-background">
        <Text className="text-primary/60">Home not found.</Text>
        <Button title="Go back" variant="secondary" onPress={() => router.back()} className="mt-4" />
      </Screen>
    );
  }

  const save = () => {
    const e = {};
    const num = (k) => parseFloat(String(form[k]).replace(',', '.'));
    if (!form.name.trim()) e.name = 'Required';
    ['width', 'depth', 'height'].forEach((k) => {
      const n = num(k);
      if (!(n > 0 && n < 100)) e[k] = 'Metres';
    });
    setErrors(e);
    if (Object.keys(e).length) return;
    addRoom(home.id, { name: form.name.trim(), width: num('width'), depth: num('depth'), height: num('height') });
    setForm(EMPTY);
    setAdding(false);
  };

  const confirmDelete = () =>
    Alert.alert('Delete home?', `"${home.name}" and all its scans will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { router.back(); deleteHome(home.id); } },
    ]);

  return (
    <Screen className="flex-1 bg-background px-5">
      <View className="mb-4 mt-2 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} className="size-11 items-center justify-center rounded-full bg-white border border-black/10">
          <Text className="text-xl text-primary">‹</Text>
        </Pressable>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-primary" numberOfLines={1}>{home.name}</Text>
          {!!home.address && <Text className="text-primary/60" numberOfLines={1}>{home.address}</Text>}
        </View>
      </View>

      <FlatList
        data={home.rooms}
        keyExtractor={(r) => r.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-16"
        ListHeaderComponent={
          adding ? (
            <View className="mb-4 rounded-3xl border border-black/10 bg-white p-4">
              <Field label="Room name" value={form.name} onChangeText={set('name')} placeholder="Kitchen" error={errors.name} />
              <View className="flex-row gap-3">
                <Field className="flex-1" label="Width (m)" keyboardType="decimal-pad" value={form.width} onChangeText={set('width')} error={errors.width} />
                <Field className="flex-1" label="Depth (m)" keyboardType="decimal-pad" value={form.depth} onChangeText={set('depth')} error={errors.depth} />
                <Field className="flex-1" label="Height (m)" keyboardType="decimal-pad" value={form.height} onChangeText={set('height')} error={errors.height} />
              </View>
              <View className="flex-row gap-3">
                <Button title="Cancel" variant="secondary" onPress={() => setAdding(false)} className="flex-1" />
                <Button title="Add room" onPress={save} className="flex-1" />
              </View>
            </View>
          ) : (
            <Button title="＋ Add room" onPress={() => setAdding(true)} className="mb-4" />
          )
        }
        renderItem={({ item }) => {
          const pct = Math.round(coverage(item) * 100);
          return (
            <Pressable onPress={() => router.push(`/rooms/${item.id}`)} className="mb-3 flex-row items-center rounded-3xl p-4" style={{ backgroundColor: home.color }}>
              <View className="flex-1">
                <Text className="text-lg font-bold text-primary">{item.name}</Text>
                <Text className="text-primary/60">{item.width} × {item.depth} × {item.height} m · {formatArea(roomArea(item))}</Text>
              </View>
              <View className="rounded-full bg-white/70 px-3 py-1.5">
                <Text className="text-xs font-bold text-primary">{item.frames.length ? `${pct}% scanned` : 'Not scanned'}</Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={!adding && <Text className="text-primary/60">No rooms yet. Add one, then scan it.</Text>}
        ListFooterComponent={<Button title="Delete home" variant="danger" onPress={confirmDelete} className="mt-4" />}
      />
    </Screen>
  );
}
