import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { DeviceMotion } from 'expo-sensors';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { uid, useHomes } from '../../lib/store';
import { SECTORS, sectorOf } from '../../lib/utils';

export default function ScanScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { findRoom, addFrame } = useHomes();
  const found = findRoom(id);

  const [perm, requestPerm] = useCameraPermissions();
  const cam = useRef(null);
  const rot = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const [heading, setHeading] = useState(0);
  const [busy, setBusy] = useState(false);

  // Phone orientation = the "where was the phone pointing" data stored with each frame.
  useEffect(() => {
    DeviceMotion.setUpdateInterval(150);
    const sub = DeviceMotion.addListener((d) => {
      if (d.rotation) {
        rot.current = d.rotation;
        setHeading(d.rotation.alpha);
      }
    });
    return () => sub.remove();
  }, []);

  if (!found) return null;
  const { home, room } = found;

  if (!perm) return <ActivityIndicator className="flex-1" />;
  if (!perm.granted) {
    return (
      <Screen className="flex-1 items-center justify-center bg-background p-8">
        <Text className="mb-2 text-2xl font-bold text-primary">Camera access needed</Text>
        <Text className="mb-6 text-center text-primary/60">3D Home captures frames while you turn around in the room.</Text>
        <Button title="Allow camera" onPress={requestPerm} />
        <Button title="Not now" variant="danger" onPress={() => router.back()} />
      </Screen>
    );
  }

  const covered = new Set(room.frames.map((f) => sectorOf(f.yaw)));
  const here = sectorOf(heading);

  const capture = async () => {
    if (busy || !cam.current) return;
    setBusy(true);
    try {
      const photo = await cam.current.takePictureAsync({ quality: 0.4, skipProcessing: true });
      const { alpha, beta, gamma } = rot.current;
      addFrame(home.id, room.id, { id: uid(), uri: photo.uri, t: Date.now(), yaw: alpha, pitch: beta, roll: gamma });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cam} style={StyleSheet.absoluteFill} facing="back" />
      <View className="absolute inset-x-0 top-0 bg-black/50 px-5 pb-4 pt-16">
        <Text className="text-xl font-extrabold text-white">{room.name}</Text>
        <Text className="my-1.5 text-sm text-white/80">Stand in the centre and turn slowly. Fill every sector.</Text>
        <View className="my-1.5 flex-row gap-1">
          {Array.from({ length: SECTORS }, (_, i) => (
            <View key={i} className={`h-2 flex-1 rounded-full ${covered.has(i) ? 'bg-accent' : 'bg-white/25'} ${i === here ? 'border-2 border-white' : ''}`} />
          ))}
        </View>
        <Text className="text-sm text-white/80">{covered.size}/{SECTORS} sectors · {room.frames.length} frames</Text>
      </View>
      <View className="absolute inset-x-0 bottom-11 flex-row items-center justify-between px-8">
        <Pressable onPress={() => router.back()} className="w-20"><Text className="text-lg font-bold text-white">Done</Text></Pressable>
        <Pressable onPress={capture} className={`size-20 items-center justify-center rounded-full border-4 border-white ${busy ? 'opacity-50' : ''}`}>
          <View className="size-14 rounded-full bg-accent" />
        </Pressable>
        <View className="w-20" />
      </View>
    </View>
  );
}
