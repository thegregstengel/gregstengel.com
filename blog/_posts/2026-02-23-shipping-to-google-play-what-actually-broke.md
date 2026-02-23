---
title: "Shipping to Google Play: What Actually Broke (And How We Fixed It)"
date: 2026-02-23 17:00:00 -0500
categories: [Game Dev, Big Bang Smugglers]
tags: [react-native, expo, eas, google-play, android, firebase, google-signin, adb]
authors: [stengel, joshua]
description: Six builds, three root causes, and one working production app. The full story of getting Big Bang Smugglers onto the Google Play Store.
---

Today, Build 10 of Big Bang Smugglers published to Google Play internal testing. The app launches. Google Sign-In works. It's real.

Getting here took six broken builds and several sessions of ADB log archaeology. This post is the full story — what broke, why it broke, and what actually fixed it.

## The Setup

Big Bang Smugglers is built on Expo SDK 54 with React Native 0.81.5. We use Firebase Web SDK for auth and Firestore, `@react-native-google-signin/google-signin` for native Google auth, and EAS Build for production AAB generation. The app targets Android initially with Google Play distribution.

On paper, this is a well-supported stack. In practice, we hit three completely distinct production bugs that looked like one problem.

## Six Builds, Three Problems

### Build 3 — The First AAB (Never Tested)

Our first production build went straight to Play Console without device testing. Mistake. It had `expo-dev-client` in production `dependencies` (not devDependencies). That package injects Expo's developer menu into the app. In a production binary, it tries to initialize and fails hard.

The symptom was a `kotlin.UninitializedPropertyAccessException: lateinit property devMenuHost has not been initialized` crash in `expo.modules.devmenu.DevMenuActivity`. We didn't know this at the time. We couldn't get useful ADB logs.

### Builds 4-6 — Chasing the Wrong Problem

We saw "crashes on open" and started modifying the Firebase native SDK configuration, toggling `newArchEnabled`, removing `@react-native-firebase` entirely. Each change introduced a new failure mode. Build 6 (Firebase completely removed) crashed *faster* than Build 3 — immediate crash with zero logcat output.

```
# The regression chart
Build 3: crash after splash (devMenuHost)
Build 4: same crash
Build 5: crash after opening (different cause)
Build 6: immediate crash, no logs at all
```

We had lost ground while fixing the wrong thing.

### Getting Useful ADB Logs

The key to breaking through was finally getting a clean ADB capture. Three previous attempts produced nothing but Samsung system service noise (`SLPASVC`, `EuiccConnector`, etc.) because the app process wasn't spawning during the capture window.

The working sequence:

```bash
adb shell am force-stop com.bbsgames.bigbangsmugglers
adb logcat -c
adb logcat > C:\Users\gregs\launch.log
# NOW open the app
```

Force-stopping first is critical. Without it, the app may already be running from a previous hang — no new process spawns, logcat captures nothing relevant.

### Root Cause #1: expo-dev-client in Production

The first ADB log that actually captured our app (Build 8, which had Firebase restored) showed the `devMenuHost` crash clearly in entries from weeks prior. Once we confirmed `expo-dev-client` was in production `dependencies`, we removed it and kept it out.

```json
// package.json — wrong
"dependencies": {
  "expo-dev-client": "~6.0.20"  // ❌ production crash
}

// either remove entirely or move to devDependencies
```

Also check `eas.json`:

```json
{
  "build": {
    "production": {
      "developmentClient": false  // must be false or absent
    }
  }
}
```

### Root Cause #2: Missing EAS Environment Variable

Build 8 launched. That was progress. But the app showed a loading screen and never progressed — the classic "sits there forever" hang.

The culprit was in `AuthContext.tsx`:

```typescript
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});

const unsubscribe = onAuthStateChanged(auth, async (user) => {
  // ...
});
```

`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` was in `.env.local` for local development but **never set as an EAS production environment variable**. In the production build, it was `undefined`. When `GoogleSignin.configure({ webClientId: undefined })` threw a native exception synchronously, the entire `useEffect` aborted before `onAuthStateChanged` was ever subscribed. `loading` stayed `true` forever.

Fix: set the variable in EAS and add a defensive try/catch:

```bash
npx eas-cli env:create \
  --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID \
  --value "YOUR_WEB_CLIENT_ID_HERE" \
  --environment production \
  --type string \
  --visibility plaintext \
  --non-interactive
```

```typescript
// AuthContext.tsx — defensive configure
try {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
  });
} catch (e) {
  console.warn('GoogleSignin.configure failed:', e);
}

// Safety net: if Firebase Auth never fires, unblock after 10s
const loadingTimeout = setTimeout(() => setLoading(false), 10000);

const unsubscribe = onAuthStateChanged(auth, async (user) => {
  clearTimeout(loadingTimeout);
  // ...
});

return () => {
  clearTimeout(loadingTimeout);
  unsubscribe();
};
```

Build 9 launched and reached the sign-in screen. 🎉

### Root Cause #3: Play App Signing SHA-1

Google Sign-In failed. The sign-in flow opened, but authentication was rejected. This is a classic Play App Signing gotcha.

Google Play re-signs your app with its own certificate when you use Play App Signing (the default for new apps). The SHA-1 fingerprint that Firebase and Google Sign-In validate against is **Google's signing certificate**, not your upload certificate. If you only register the EAS build keystore fingerprint in Firebase, it won't work in production.

The fix:

1. Go to Play Console → Your App → **Release → Setup → App integrity**
2. Find **"App signing key certificate"** — copy the SHA-1 (not the upload key)
3. Go to Firebase Console → Project Settings → Your Android app → **Add fingerprint**
4. Paste the SHA-1, save, download the updated `google-services.json`
5. Commit and rebuild

```bash
# After updating google-services.json
git add app/google-services.json
git commit -m "fix: add Play App Signing SHA-1 fingerprint for Google Sign-In"
git push
npx eas-cli build --platform android --profile production --non-interactive
```

Build 10 shipped. Google Sign-In works. App is live on internal testing.

## The Three-Problem Summary

| Problem | Symptom | Fix |
|---|---|---|
| `expo-dev-client` in prod deps | Crash on `devMenuHost` | Remove from `dependencies` |
| Missing EAS env var | Infinite loading screen | Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in EAS production |
| Play App Signing SHA-1 not in Firebase | Google Sign-In rejected | Add Play signing cert SHA-1 to Firebase |

## Lessons

**Test on a real device before uploading to Play Console.** Build 3 went straight to the store untested. Three problems would have been caught immediately.

**ADB is your friend, but timing is everything.** Force-stop the app, clear the buffer, start logcat, *then* launch. In that order, every time.

**EAS env vars are not your local env vars.** Anything in `.env.local` needs to be explicitly set in EAS environments. Check all `EXPO_PUBLIC_*` variables before any production build.

**Play App Signing changes the signing identity.** If you're using Play App Signing (you probably are), the SHA-1 in Firebase must come from Play Console's App integrity page, not from your keystore.

---

Big Bang Smugglers is a space trading game currently in internal testing. If you want early access, it'll be on the Play Store soon. Follow along at [bigbangsmugglers.com](https://bigbangsmugglers.com).
