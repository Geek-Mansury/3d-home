export const SECTORS = 12;
const TWO_PI = Math.PI * 2;

export const sectorOf = (yaw) => Math.floor(((((yaw % TWO_PI) + TWO_PI) % TWO_PI) / TWO_PI) * SECTORS);
export const deg = (r) => `${Math.round((((r * 180) / Math.PI) % 360 + 360) % 360)}°`;
export const formatArea = (m2) => `${m2.toFixed(1)} m²`;
export const roomArea = (r) => r.width * r.depth;
export const homeArea = (h) => h.rooms.reduce((n, r) => n + roomArea(r), 0);
export const homeFrames = (h) => h.rooms.reduce((n, r) => n + r.frames.length + (r.lidar ? r.lidar.frames.length : 0), 0);
export const coverage = (room) =>
  room.lidar ? Math.min(1, room.lidar.frames.length / SECTORS) : new Set(room.frames.map((f) => sectorOf(f.yaw))).size / SECTORS;
export const formatDate = (t) => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
