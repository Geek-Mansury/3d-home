// JS side of the native LiDAR module (modules/lidar-scan). Safe in Expo Go: everything is null/false there.
import { requireOptionalNativeModule, requireNativeView } from 'expo';

const Native = requireOptionalNativeModule('LidarScan');

export const lidarModulePresent = !!Native; // true only in a development build
export const lidarAvailable = (() => {
  try {
    return !!Native && Native.isSupported();
  } catch {
    return false;
  }
})(); // true only on a LiDAR iPhone/iPad inside a development build

export const LidarScanView = lidarAvailable ? requireNativeView('LidarScan') : null;

export const absolutePath = (rel) => `${Native.documentsPath()}/${rel}`;
export const captureFrame = (absDir, index, step = 2) => Native.captureFrame(absDir, index, step);
export const exportMesh = (absPath) => Native.exportMesh(absPath);
export const writeText = (absPath, text) => Native.writeText(absPath, text);
export const deleteDir = (absPath) => (Native ? Native.deleteDir(absPath) : Promise.resolve());

const b64ToArrayBuffer = (b64) => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
};

// Reads every frame's points_NNN.bin (16 bytes per point: float32 x,y,z + uint8 r,g,b,a) and merges them.
export async function loadScan(lidar) {
  const dir = absolutePath(lidar.dir);
  const chunks = [];
  let total = 0;
  for (const f of lidar.frames) {
    if (!f.pointCount) continue;
    const ab = b64ToArrayBuffer(await Native.readBase64(`${dir}/${f.points}`));
    chunks.push({ ab, count: f.pointCount });
    total += f.pointCount;
  }

  const positions = new Float32Array(total * 3);
  const colors = new Uint8Array(total * 3);
  let o = 0;
  for (const { ab, count } of chunks) {
    const f32 = new Float32Array(ab);
    const u8 = new Uint8Array(ab);
    for (let i = 0; i < count; i++, o++) {
      positions[o * 3] = f32[i * 4];
      positions[o * 3 + 1] = f32[i * 4 + 1];
      positions[o * 3 + 2] = f32[i * 4 + 2];
      colors[o * 3] = u8[i * 16 + 12];
      colors[o * 3 + 1] = u8[i * 16 + 13];
      colors[o * 3 + 2] = u8[i * 16 + 14];
    }
  }

  // bounds (used to frame the camera)
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < total; i++) {
    for (let a = 0; a < 3; a++) {
      const v = positions[i * 3 + a];
      if (v < min[a]) min[a] = v;
      if (v > max[a]) max[a] = v;
    }
  }

  let mesh = null;
  if (lidar.mesh) {
    try {
      const ab = b64ToArrayBuffer(await Native.readBase64(`${dir}/${lidar.mesh}`));
      const head = new Uint32Array(ab, 0, 2);
      const vc = head[0];
      const fc = head[1];
      mesh = { vertices: new Float32Array(ab, 8, vc * 3), indices: new Uint32Array(ab, 8 + vc * 12, fc * 3) };
    } catch (e) {
      console.warn('Mesh load failed', e);
    }
  }

  return { positions, colors, total, min, max, mesh };
}

export const frameImageUri = (lidar, frame) => `file://${absolutePath(lidar.dir)}/${frame.image}`;
