// Interactive pseudo-3D room: drag to orbit. Pure react-native-svg, no GL needed.
import React, { useRef, useState } from 'react';
import { PanResponder, Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import { colors } from '../constants/theme';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export default function RoomViewer3D({ room, size = 340 }) {
  const [yaw, setYaw] = useState(0.7);
  const [pitch, setPitch] = useState(0.55);
  const cur = useRef({ yaw, pitch });
  cur.current = { yaw, pitch };
  const start = useRef({ yaw, pitch });

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => (start.current = { ...cur.current }),
      onPanResponderMove: (_, g) => {
        setYaw(start.current.yaw + g.dx * 0.01);
        setPitch(clamp(start.current.pitch - g.dy * 0.005, 0.15, 1.25));
      },
    })
  ).current;

  const { width: w, depth: d, height: h } = room;
  const scale = size / (Math.max(w, d, h) * 2.1);

  // 3D -> 2D: rotate around Y (yaw), tilt around X (pitch), orthographic projection.
  const project = (x, y, z) => {
    y -= h / 2;
    const x1 = x * Math.cos(yaw) - z * Math.sin(yaw);
    const z1 = x * Math.sin(yaw) + z * Math.cos(yaw);
    const y1 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
    const depth = y * Math.sin(pitch) + z1 * Math.cos(pitch);
    return { x: size / 2 + x1 * scale, y: size / 2 - y1 * scale, depth };
  };
  const pts = (arr) => arr.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const corners = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]];
  const walls = corners
    .map(([ax, az], i) => {
      const [bx, bz] = corners[(i + 1) % 4];
      const quad = [project(ax, 0, az), project(bx, 0, bz), project(bx, h, bz), project(ax, h, az)];
      const depth = project((ax + bx) / 2, h / 2, (az + bz) / 2).depth;
      return { quad, depth, near: depth > 0 };
    })
    .sort((p, q) => p.depth - q.depth);

  const grid = [];
  for (let gx = Math.ceil(-w / 2); gx <= w / 2; gx++) grid.push([project(gx, 0, -d / 2), project(gx, 0, d / 2)]);
  for (let gz = Math.ceil(-d / 2); gz <= d / 2; gz++) grid.push([project(-w / 2, 0, gz), project(w / 2, 0, gz)]);

  const r = Math.min(w, d) * 0.32;
  const c0 = project(0, 0.02, 0);

  return (
    <View>
      <View {...pan.panHandlers} style={{ width: size, height: size, alignSelf: 'center', backgroundColor: colors.ink, borderRadius: 24, overflow: 'hidden' }}>
        <Svg width={size} height={size}>
          <Polygon points={pts(corners.map(([x, z]) => project(x, 0, z)))} fill={colors.floor} stroke={colors.accent} strokeWidth={1.5} />
          {grid.map(([a, b], i) => (
            <Line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#fff" strokeOpacity={0.08} />
          ))}
          {walls.map((wl, i) => (
            <Polygon
              key={i}
              points={pts(wl.quad)}
              fill={colors.wall}
              fillOpacity={wl.near ? 0.1 : 0.55}
              stroke={wl.near ? colors.accent : '#9CC3F0'}
              strokeOpacity={wl.near ? 0.5 : 0.9}
              strokeWidth={1.5}
            />
          ))}
          {room.frames.map((f) => {
            const p = project(Math.sin(f.yaw) * r, 0.02, -Math.cos(f.yaw) * r);
            return (
              <React.Fragment key={f.id}>
                <Line x1={c0.x} y1={c0.y} x2={p.x} y2={p.y} stroke={colors.accent} strokeOpacity={0.35} />
                <Circle cx={p.x} cy={p.y} r={4} fill={colors.accent} />
              </React.Fragment>
            );
          })}
          <Circle cx={c0.x} cy={c0.y} r={5} fill="#fff" />
        </Svg>
      </View>
      <Text className="mt-3 text-center text-sm text-primary/60">Drag to orbit · {w} × {d} × {h} m</Text>
    </View>
  );
}
