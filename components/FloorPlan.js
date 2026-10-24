// Top-down floor plan. Each captured frame is drawn as a view cone from the room centre.
import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '../constants/theme';

const FOV = (65 * Math.PI) / 180;

export default function FloorPlan({ room, size = 340 }) {
  const pad = 32;
  const s = Math.min((size - pad * 2) / room.width, (size - pad * 2) / room.depth);
  const rw = room.width * s;
  const rd = room.depth * s;
  const ox = (size - rw) / 2;
  const oy = (size - rd) / 2;
  const c = size / 2;
  const len = Math.min(rw, rd) * 0.45;

  const wedge = (yaw) => {
    const pt = (a) => `${(c + Math.sin(a) * len).toFixed(1)},${(c - Math.cos(a) * len).toFixed(1)}`;
    return `${c},${c} ${pt(yaw - FOV / 2)} ${pt(yaw)} ${pt(yaw + FOV / 2)}`;
  };

  return (
    <View>
      <View style={{ width: size, height: size, alignSelf: 'center', backgroundColor: colors.ink, borderRadius: 24, overflow: 'hidden' }}>
        <Svg width={size} height={size}>
          <Rect x={ox} y={oy} width={rw} height={rd} fill={colors.floor} stroke={colors.accent} strokeWidth={3} rx={2} />
          {room.frames.map((f) => (
            <Polygon key={f.id} points={wedge(f.yaw)} fill={colors.accent} fillOpacity={0.14} stroke={colors.accent} strokeOpacity={0.5} />
          ))}
          <Circle cx={c} cy={c} r={5} fill="#fff" />
          <SvgText x={c} y={oy - 8} fill="#8B95A7" fontSize={12} textAnchor="middle">{room.width} m</SvgText>
          <SvgText x={ox - 8} y={c} fill="#8B95A7" fontSize={12} textAnchor="end">{room.depth} m</SvgText>
          <SvgText x={size - 12} y={22} fill="#8B95A7" fontSize={12} textAnchor="end">N ↑</SvgText>
        </Svg>
      </View>
      <Text className="mt-3 text-center text-sm text-primary/60">Cones show where the phone pointed for each frame</Text>
    </View>
  );
}
