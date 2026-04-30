# App Icon Assets

Place the following files in this `assets/` directory before building:

| File | Size | Notes |
|---|---|---|
| `icon.png` | 1024×1024 px | Main app icon, no transparency |
| `splash.png` | 1284×2778 px | Splash screen image |
| `adaptive-icon.png` | 1024×1024 px | Android adaptive icon foreground, with transparency |

## Design Guidelines

- Background color: `#1a0f2e` (deep purple)
- Suggested icon: 🌙 moon on dark background with soft pink glow
- You can generate icons at https://www.appicon.co/ or https://icon.kitchen/

## Quick Generate with Expo

After placing `icon.png`:
```bash
npx expo-optimize
```

Or use EAS to auto-resize:
```bash
eas build --platform android --profile preview
```
EAS will use the 1024×1024 `icon.png` and auto-generate all required sizes.