# 3D Home – LiDAR update

## What was added
- `modules/lidar-scan/` – native iOS module (Swift, ARKit). Captures, for every shot:
  colour photo, raw LiDAR depth + confidence, 4x4 camera pose, camera intrinsics, and a coloured
  world-space point cloud. At the end it exports the fused scene mesh. Same idea as the demo's `frames.json`.
- `app/lidar/[id].js` – the LiDAR scan screen (live camera + mesh overlay, shutter, finish).
- `components/PointCloudViewer.js` – real three.js viewer (expo-gl): coloured point cloud + mesh, orbit + pinch zoom.
- `lib/lidar.js` – JS wrapper. In Expo Go or on a phone without LiDAR it reports "not available" and the app
  falls back to the photo scan, so nothing breaks.
- `app/rooms/[id].js`, `lib/store.js`, `lib/utils.js` – updated (new "LiDAR" tab, scan stored per room).

## Requirements (please read)
1. A LiDAR device: iPhone 12 Pro / 12 Pro Max, 13 Pro / 13 Pro Max, 14 Pro / 14 Pro Max, 15 Pro / 15 Pro Max,
   16 Pro / 16 Pro Max (and newer Pros), or an iPad Pro (2020+). The iPhone 13 (non-Pro) has NO LiDAR.
2. A development build. LiDAR/ARKit code cannot run in Expo Go.
3. Apple Developer Program membership (paid, about $99/year) to install a build on a real iPhone.
   You do not need a Mac: EAS builds in the cloud.

## Install the new packages (in your project folder)
    npx expo install expo-gl expo-dev-client
    npm install three@0.166.1

## Make your bundle id unique (app.json -> ios.bundleIdentifier), for example:
    "bundleIdentifier": "com.yourname.threedhome"

## Build and install
    npm install -g eas-cli
    eas login
    eas device:create          # register each iPhone that will run the app (needs the Apple account)
    eas build --profile development --platform ios
    # open the install link on the iPhone, then:
    npx expo start --dev-client

## Using it
Open a room -> "Scan with LiDAR". Walk slowly; the blue mesh shows what the sensor has covered.
Tap the shutter from different spots (aim for 15-30 frames covering walls, floor, corners), then Finish.
The room's LiDAR tab shows the coloured point cloud and mesh.
Scans are saved under the app's Documents/scans/<roomId>/ (frames.json, JPEGs, depth, points, mesh.bin).

## Not tested yet
This module could not be compiled or run where it was written (no Mac or LiDAR device). The first EAS build may
show Swift compile errors, and the first scan may need small fixes. Send the exact error text and I will fix it.
