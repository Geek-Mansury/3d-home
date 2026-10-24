import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../../components/Screen';
import HomeCard from '../../components/HomeCard';
import CreateHomeModal from '../../components/CreateHomeModal';
import { useHomes } from '../../lib/store';

export default function Homes() {
  const router = useRouter();
  const { homes } = useHomes();
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [modal, setModal] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? homes.filter((h) => `${h.name} ${h.address}`.toLowerCase().includes(q)) : homes;
  }, [homes, query]);

  return (
    <Screen className="flex-1 bg-background px-5">
      <View className="mb-4 mt-2 flex-row items-center justify-between">
        <Text className="text-3xl font-bold text-primary">Homes</Text>
        <Pressable onPress={() => setModal(true)} className="size-11 items-center justify-center rounded-full bg-primary">
          <Text className="text-2xl leading-7 text-white">＋</Text>
        </Pressable>
      </View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search homes"
        placeholderTextColor="rgba(8,17,38,0.35)"
        className="mb-4 rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-primary"
      />
      <FlatList
        data={filtered}
        keyExtractor={(h) => h.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-36"
        renderItem={({ item }) => (
          <HomeCard
            home={item}
            expanded={expandedId === item.id}
            onPress={() => setExpandedId((id) => (id === item.id ? null : item.id))}
            onOpen={() => router.push(`/home/${item.id}`)}
          />
        )}
        ListEmptyComponent={<Text className="mt-10 text-center text-primary/60">{query ? 'No homes match your search.' : 'No homes yet. Tap ＋ to add one.'}</Text>}
      />
      <CreateHomeModal visible={modal} onClose={() => setModal(false)} />
    </Screen>
  );
}
