// Global state: Context + useReducer, persisted with AsyncStorage.
import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cardColors } from '../constants/theme';

const KEY = '3dhome:v2';
const Ctx = createContext(null);

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const mapHome = (state, homeId, fn) => state.map((h) => (h.id === homeId ? fn(h) : h));
const mapRoom = (state, homeId, roomId, fn) =>
  mapHome(state, homeId, (h) => ({ ...h, rooms: h.rooms.map((r) => (r.id === roomId ? fn(r) : r)) }));

function reducer(state, a) {
  switch (a.type) {
    case 'load':
      return a.payload;
    case 'addHome':
      return [{ id: a.id, name: a.name, address: a.address, color: cardColors[state.length % cardColors.length], createdAt: Date.now(), rooms: [] }, ...state];
    case 'deleteHome':
      return state.filter((h) => h.id !== a.id);
    case 'addRoom':
      return mapHome(state, a.homeId, (h) => ({ ...h, rooms: [...h.rooms, { ...a.room, frames: [] }] }));
    case 'deleteRoom':
      return mapHome(state, a.homeId, (h) => ({ ...h, rooms: h.rooms.filter((r) => r.id !== a.roomId) }));
    case 'addFrame':
      return mapRoom(state, a.homeId, a.roomId, (r) => ({ ...r, frames: [...r.frames, a.frame] }));
    case 'clearFrames':
      return mapRoom(state, a.homeId, a.roomId, (r) => ({ ...r, frames: [], lidar: null }));
    case 'setLidar':
      return mapRoom(state, a.homeId, a.roomId, (r) => ({ ...r, lidar: a.lidar }));
    default:
      return state;
  }
}

function demoHome(index) {
  const ring = (n) =>
    Array.from({ length: n }, (_, i) => ({ id: uid() + i, uri: null, t: Date.now(), yaw: (i / n) * Math.PI * 2, pitch: 1.4, roll: 0 }));
  return {
    id: uid(),
    name: 'Demo Apartment',
    address: '12 Sample Street',
    color: cardColors[index % cardColors.length],
    createdAt: Date.now(),
    rooms: [
      { id: uid(), name: 'Living room', width: 5.2, depth: 4.1, height: 2.6, frames: ring(9) },
      { id: uid(), name: 'Bedroom', width: 3.6, depth: 3.2, height: 2.6, frames: ring(5) },
      { id: uid(), name: 'Kitchen', width: 3.0, depth: 2.8, height: 2.6, frames: ring(11) },
    ],
  };
}

export function HomesProvider({ children }) {
  const [homes, dispatch] = useReducer(reducer, []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && dispatch({ type: 'load', payload: JSON.parse(raw) }))
      .catch((e) => console.warn('Failed to load homes', e))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(homes)).catch(() => {});
  }, [homes, ready]);

  const api = useMemo(
    () => ({
      homes,
      ready,
      findRoom: (roomId) => {
        for (const home of homes) {
          const room = home.rooms.find((r) => r.id === roomId);
          if (room) return { home, room };
        }
        return null;
      },
      addHome: (name, address) => {
        const id = uid();
        dispatch({ type: 'addHome', id, name, address });
        return id;
      },
      deleteHome: (id) => dispatch({ type: 'deleteHome', id }),
      addRoom: (homeId, room) => dispatch({ type: 'addRoom', homeId, room: { ...room, id: uid() } }),
      deleteRoom: (homeId, roomId) => dispatch({ type: 'deleteRoom', homeId, roomId }),
      addFrame: (homeId, roomId, frame) => dispatch({ type: 'addFrame', homeId, roomId, frame }),
      clearFrames: (homeId, roomId) => dispatch({ type: 'clearFrames', homeId, roomId }),
      setLidar: (homeId, roomId, lidar) => dispatch({ type: 'setLidar', homeId, roomId, lidar }),
      seedDemo: () => dispatch({ type: 'load', payload: [demoHome(homes.length), ...homes] }),
      reset: () => dispatch({ type: 'load', payload: [] }),
    }),
    [homes, ready]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useHomes = () => useContext(Ctx);
