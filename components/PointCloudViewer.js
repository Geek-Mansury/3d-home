// Real 3D viewer (three.js on expo-gl): coloured LiDAR point cloud + scene mesh. Drag = orbit, pinch = zoom.
import React, { useEffect, useRef } from 'react';
import { PanResponder, View } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export default function PointCloudViewer({ data, size = 340, showMesh = true }) {
  const orbit = useRef({ theta: 0.8, phi: 1.15, radius: 4, target: new THREE.Vector3() });
  const grab = useRef(null);
  const raf = useRef(0);
  const meshRef = useRef(null);

  useEffect(() => {
    if (meshRef.current) meshRef.current.visible = showMesh;
  }, [showMesh]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const o = orbit.current;
        grab.current = { theta: o.theta, phi: o.phi, radius: o.radius, dist: null };
      },
      onPanResponderMove: (e, g) => {
        const s = grab.current;
        if (!s) return;
        const t = e.nativeEvent.touches;
        const o = orbit.current;
        if (t.length >= 2) {
          const d = Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);
          if (s.dist == null) {
            s.dist = d;
            s.radius = o.radius;
          }
          o.radius = clamp(s.radius * (s.dist / d), 0.3, 60);
        } else {
          o.theta = s.theta - g.dx * 0.008;
          o.phi = clamp(s.phi - g.dy * 0.008, 0.15, Math.PI - 0.15);
        }
      },
    })
  ).current;

  const onContextCreate = (gl) => {
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    const renderer = new THREE.WebGLRenderer({
      canvas: { width: w, height: h, clientWidth: w, clientHeight: h, style: {}, addEventListener() {}, removeEventListener() {}, getContext: () => gl },
      context: gl,
    });
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x0a0d12, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.05, 300);

    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    pg.setAttribute('color', new THREE.BufferAttribute(data.colors, 3, true));
    scene.add(new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.022, vertexColors: true, sizeAttenuation: true })));

    if (data.mesh) {
      const mg = new THREE.BufferGeometry();
      mg.setAttribute('position', new THREE.BufferAttribute(data.mesh.vertices, 3));
      mg.setIndex(new THREE.BufferAttribute(data.mesh.indices, 1));
      const mesh = new THREE.Mesh(mg, new THREE.MeshBasicMaterial({ color: 0x4aa3ff, wireframe: true, transparent: true, opacity: 0.12 }));
      mesh.visible = showMesh;
      meshRef.current = mesh;
      scene.add(mesh);
    }

    // frame the model
    const [minX, minY, minZ] = data.min;
    const [maxX, maxY, maxZ] = data.max;
    const o = orbit.current;
    if (data.total > 0) {
      o.target.set((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);
      o.radius = Math.max(maxX - minX, maxY - minY, maxZ - minZ) * 1.1 + 1;
      const grid = new THREE.GridHelper(Math.max(maxX - minX, maxZ - minZ) + 2, 20, 0xea7a53, 0x24324a);
      grid.position.set(o.target.x, minY, o.target.z);
      scene.add(grid);
    }

    const loop = () => {
      raf.current = requestAnimationFrame(loop);
      const { theta, phi, radius, target } = orbit.current;
      camera.position.set(
        target.x + radius * Math.sin(phi) * Math.sin(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(target);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    loop();
  };

  return (
    <View {...pan.panHandlers} style={{ width: size, height: size, alignSelf: 'center', borderRadius: 24, overflow: 'hidden', backgroundColor: '#0A0D12' }}>
      <GLView style={{ width: size, height: size }} pointerEvents="none" onContextCreate={onContextCreate} />
    </View>
  );
}
