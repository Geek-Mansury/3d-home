// LiDAR capture screen: walk around the room, tap the shutter from different spots/angles, then finish.
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { useHomes } from '../../lib/store';
import { LidarScanView, absolutePath, captureFrame, deleteDir, exportMesh, lidarAvailable, writeText } from '../../lib/lidar';

export default function LidarScan() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { findRoom, setLidar } = useHomes();
  const found = findRoom(id);
  const [perm, requestPerm] = useCameraPermissions();

  const [frames, setFrames] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [showMesh, setShowMesh] = useState(true);

  if (!found) return null;
  const { home, room } = found;
  const relDir = `scans/${room.id}`;
  const points = frames.reduce((n, f) => n + f.pointCount, 0);

  if (!lidarAvailable) {
    return (
      <Screen className="flex-1 items-center justify-center bg-background p-8">
        <Text className="mb-2 text-2xl font-bold text-primary">No LiDAR on this device</Text>
        <Text className="mb-6 text-center text-primary/60">LiDAR scanning needs an iPhone 12 Pro or newer Pro model (or a Pro iPad), running a development build.</Text>
        <Button title="Use photo scan instead" onPress={() => router.replace(`/scan/${room.id}`)} />
        <Button title="Back" variant="danger" onPress={() => router.back()} />
      </Screen>
    );
  }
  if (!perm) return <ActivityIndicator className="flex-1" />;
  if (!perm.granted) {
    return (
      <Screen className="flex-1 items-center justify-center bg-background p-8">
        <Text className="mb-2 text-2xl font-bold text-primary">Camera access needed</Text>
        <Text className="mb-6 text-center text-primary/60">The LiDAR scan records colour photos together with depth.</Text>
        <Button title="Allow camera" onPress={requestPerm} />
      </Screen>
    );
  }

  const capture = async () => {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      const meta = await captureFrame(absolutePath(relDir), frames.length, 2);
      setFrames((f) => [...f, meta]);
    } catch (e) {
      setMessage(String(e?.message ?? e).replace(/^.*?:\s*/, ''));
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    if (!frames.length) return router.back();
    setBusy(true);
    setMessage('Saving scan…');
    try {
      const meshStats = await exportMesh(`${absolutePath(relDir)}/mesh.bin`);
      const lidar = { dir: relDir, mesh: 'mesh.bin', meshStats, frames, createdAt: Date.now() };
      // frames.json: where the phone was (4x4 camera pose, column-major) + intrinsics for every shot
      await writeText(`${absolutePath(relDir)}/frames.json`, JSON.stringify({ room: room.name, units: 'meters', frames }, null, 2));
      setLidar(home.id, room.id, lidar);
      router.back();
    } catch (e) {
      setMessage(String(e?.message ?? e));
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (frames.length) await deleteDir(absolutePath(relDir));
    router.back();
  };

  return (
    <View className="flex-1 bg-black">
      <LidarScanView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} showMesh={showMesh} />
      <View className="absolute inset-x-0 top-0 bg-black/55 px-5 pb-4 pt-16">
        <Text className="text-xl font-extrabold text-white">{room.name} · LiDAR</Text>
        <Text className="my-1.5 text-sm text-white/80">Walk slowly. The blue mesh shows what the sensor has seen. Tap the shutter from different spots, covering walls, floor and corners.</Text>
        <Text className="text-sm font-semibold text-accent">{frames.length} frames · {points.toLocaleString()} points</Text>
        {!!message && <Text className="mt-1 text-sm text-white">{message}</Text>}
      </View>
      <View className="absolute inset-x-0 bottom-11 flex-row items-center justify-between px-8">
        <Pressable onPress={cancel} className="w-20"><Text className="text-lg font-bold text-white">Cancel</Text></Pressable>
        <Pressable onPress={capture} disabled={busy} className={`size-20 items-center justify-center rounded-full border-4 border-white ${busy ? 'opacity-50' : ''}`}>
          <View className="size-14 rounded-full bg-accent" />
        </Pressable>
        <View className="w-20 items-end">
          <Pressable onPress={finish} disabled={busy}><Text className="text-lg font-bold text-white">Finish</Text></Pressable>
          <Pressable onPress={() => setShowMesh((s) => !s)} className="mt-3"><Text className="text-xs text-white/70">{showMesh ? 'Hide mesh' : 'Show mesh'}</Text></Pressable>
        </View>
      </View>
    </View>
  );
}
