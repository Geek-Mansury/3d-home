import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useHomes } from '../lib/store';
import Button from './Button';
import Field from './Field';

export default function CreateHomeModal({ visible, onClose }) {
  const router = useRouter();
  const { addHome } = useHomes();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const close = () => {
    setName('');
    setAddress('');
    setError('');
    onClose();
  };

  const submit = () => {
    if (!name.trim()) return setError('Give your home a name');
    const id = addHome(name.trim(), address.trim());
    close();
    router.push(`/home/${id}`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={close} />
        <View className="rounded-t-3xl bg-background p-5 pb-8">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-primary">New home</Text>
            <Pressable onPress={close} className="size-9 items-center justify-center rounded-full bg-muted">
              <Text className="text-lg text-primary">✕</Text>
            </Pressable>
          </View>
          <Field label="Name" value={name} onChangeText={(t) => { setName(t); setError(''); }} placeholder="e.g. My apartment" error={error} />
          <Field label="Address (optional)" value={address} onChangeText={setAddress} placeholder="Street, city" />
          <Button title="Create home" onPress={submit} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
