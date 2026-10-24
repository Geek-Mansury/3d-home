# 3D Home

Scan rooms with your phone, then explore them as 3D models and floor plans.
Built following the **React Native full course** (Expo Router + Nativewind + Clerk, "Recurly" subscription-tracker style) and applied to a room-scanning idea.

## Run
```bash
npm install
npx expo install --fix            # aligns versions with your Expo SDK
cp .env.example .env              # add your Clerk publishable key
npx expo start -c                 # open in Expo Go
```
Clerk: create a free app at clerk.com, enable **Email + Password** (with email code verification), copy the Publishable key into `.env`.

## Course topic -> where it lives
| Course topic | File(s) |
|---|---|
| Expo project + Expo Router file-based routing | `app/` |
| Nativewind / Tailwind styling (`className`) | `tailwind.config.js`, `babel.config.js`, `metro.config.js`, `global.css` |
| Route groups `(auth)` and `(tabs)`, dynamic routes `[id]` | `app/(auth)`, `app/(tabs)`, `app/home/[id].js`, `app/rooms/[id].js`, `app/scan/[id].js` |
| Custom floating pill tab bar | `app/(tabs)/_layout.js` |
| Safe-area handling | `components/Screen.js` |
| Design tokens / constants | `constants/theme.js` |
| Reusable components, FlatList, expandable cards | `components/HomeCard.js`, `RoomCard.js`, `ListHeading.js` |
| Create modal + form validation | `components/CreateHomeModal.js`, `app/home/[id].js` |
| Clerk auth: sign-up with email code, sign-in, protected routes, sign-out | `app/(auth)/*`, `app/(tabs)/_layout.js`, `app/(tabs)/settings.js` |
| State management + persistence | `lib/store.js` (Context + useReducer + AsyncStorage) |
| Device features | `app/scan/[id].js` (camera + motion sensors) |

Not included from the course: PostHog analytics, Sentry, custom fonts, EAS build config. Add them when you are ready to ship.

## How scanning works
Each frame stores the phone orientation (yaw/pitch/roll) from `DeviceMotion`, like a `frames.json`. The 3D view and floor plan combine the room size you enter with the direction of each frame.
This is not LiDAR or point-cloud reconstruction. That needs native ARKit/ARCore code and a development build.
