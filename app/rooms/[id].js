import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, ScrollView, Share, Switch, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Segmented from '../../components/Segmented';
import RoomViewer3D from '../../components/RoomViewer3D';
import FloorPlan from '../../components/FloorPlan';
import PointCloudViewer from '../../components/PointCloudViewer';
import { useHomes } from '../../lib/store';
import { deg } from '../../lib/utils';
import { absolutePath, deleteDir, frameImageUri, lidarAvailable, loadScan } from '../../lib/lidar';

export default function RoomScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { findRoom, clearFrames, deleteRoom } = useHomes();
  const found = findRoom(id);
  const room = found?.room;
  const hasLidar = !!room?.lidar;

  const [tab, setTab] = useState(hasLidar ? 'LiDAR' : '3D');
  const [scan, setScan] = useState(null);
  const [scanError, setScanError] = useState('');
  const [showMesh, setShowMesh] = useState(true);

  // Load the point cloud when the LiDAR tab is opened.
  useEffect(() => {
    if (tab !== 'LiDAR' || !room?.lidar || scan) return;
    let alive = true;
    loadScan(room.lidar)
      .then((d) => alive && setScan(d))
      .catch((e) => alive && setScanError(String(e?.message ?? e)));
    return () => { alive = false; };
  }, [tab, room?.lidar, scan]);

  if (!found) {
    return (
      <Screen className="flex-1 items-center justify-center bg-background">
        <Text className="text-primary/60">Room not found.</Text>
        <Button title="Go back" variant="secondary" onPress={() => router.back()} className="mt-4" />
      </Screen>
    );
  }
  const { home } = found;
  const tabs = hasLidar ? ['LiDAR', '3D', 'Plan', 'Frames'] : ['3D', 'Plan', 'Frames'];

  const exportJson = () =>
    Share.share({
      message: JSON.stringify(
        room.lidar
          ? { room: room.name, units: 'meters', frames: room.lidar.frames }
          : { room: room.name, size: [room.width, room.depth, room.height], frames: room.frames.map(({ id: fid, t, yaw, pitch, roll }) => ({ id: fid, t, yaw, pitch, roll })) },
        null,
        2
      ),
    });

  const frameList = room.lidar ? room.lidar.frames : room.frames;
  const hasAnything = frameList.length > 0;

  return (
    <Screen className="flex-1 bg-background px-5">
      <View className="mb-4 mt-2 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} className="size-11 items-center justify-center rounded-full border border-black/10 bg-white">
          <Text className="text-xl text-primary">‹</Text>
        </Pressable>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-primary" numberOfLines={1}>{room.name}</Text>
          <Text className="text-primary/60" numberOfLines={1}>{home.name}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-12">
        <Segmented options={tabs} value={tab} onChange={setTab} />
        <View className="my-5">
          {tab === 'LiDAR' && (
            <>
              {scan ? (
                <>
                  <PointCloudViewer data={scan} showMesh={showMesh} />
                  <View className="mt-3 flex-row items-center justify-between">
                    <Text className="text-primary/60">
                      {scan.total.toLocaleString()} points · {room.lidar.meshStats?.faces?.toLocaleString() ?? 0} mesh faces
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-primary/60">Mesh</Text>
                      <Switch value={showMesh} onValueChange={setShowMesh} />
                    </View>
                  </View>
                  <Text className="mt-1 text-center text-sm text-primary/60">Drag to orbit · pinch to zoom</Text>
                </>
              ) : scanError ? (
                <Text className="text-destructive">Could not load scan: {scanError}</Text>
              ) : (
                <View className="items-center py-16"><ActivityIndicator /><Text className="mt-3 text-primary/60">Building point cloud…</Text></View>
              )}
            </>
          )}
          {tab === '3D' && <RoomViewer3D room={room} />}
          {tab === 'Plan' && <FloorPlan room={room} />}
          {tab === 'Frames' && (
            <FlatList
              horizontal
              data={frameList}
              keyExtractor={(f, i) => f.id ?? String(i)}
              showsHorizontalScrollIndicator={false}
              ListEmptyComponent={<Text className="text-primary/60">No frames yet. Tap “Scan this room”.</Text>}
              renderItem={({ item }) => {
                const uri = room.lidar ? frameImageUri(room.lidar, item) : item.uri;
                return (
                  <View className="mr-3 items-center">
                    {uri ? (
                      <Image source={{ uri }} style={{ width: 110, height: 150, borderRadius: 16 }} />
                    ) : (
                      <View className="h-[150px] w-[110px] items-center justify-center rounded-2xl bg-muted"><Text className="text-2xl">🖼️</Text></View>
                    )}
                    <Text className="mt-1.5 text-xs text-primary/60">{room.lidar ? `${item.pointCount.toLocaleString()} pts` : deg(item.yaw)}</Text>
                  </View>
                );
              }}
            />
          )}
        </View>

        <View className="gap-2">
          <Button
            title={lidarAvailable ? (hasLidar ? 'Rescan with LiDAR' : 'Scan with LiDAR') : hasAnything ? 'Scan more' : 'Scan this room'}
            onPress={() => {
              const go = () => router.push(lidarAvailable ? `/lidar/${room.id}` : `/scan/${room.id}`);
              if (lidarAvailable && hasLidar) {
                Alert.alert('Replace the scan?', 'A new LiDAR scan starts a fresh coordinate system, so it replaces the old one.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Replace', style: 'destructive', onPress: () => { setScan(null); go(); } },
                ]);
              } else go();
            }}
          />
          {hasAnything && <Button title="Export frames.json" variant="secondary" onPress={exportJson} />}
          {hasAnything && (
            <Button
              title="Clear scan"
              variant="danger"
              onPress={async () => {
                if (room.lidar) await deleteDir(absolutePath(room.lidar.dir));
                setScan(null);
                setTab('3D');
                clearFrames(home.id, room.id);
              }}
            />
          )}
          <Button
            title="Delete room"
            variant="danger"
            onPress={() =>
              Alert.alert('Delete room?', room.name, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: async () => { if (room.lidar) await deleteDir(absolutePath(room.lidar.dir)); router.back(); deleteRoom(home.id, room.id); } },
              ])
            }
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
