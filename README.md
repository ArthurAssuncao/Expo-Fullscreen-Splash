# expo-fullscreen-splash

A React Native component to create fullscreen splash screens with smooth animations and precise control for Expo applications.

[![npm version](https://img.shields.io/npm/v/expo-fullscreen-splash.svg)](https://www.npmjs.com/package/expo-fullscreen-splash)
[![license](https://img.shields.io/npm/l/expo-fullscreen-splash.svg)](https://github.com/arthurassuncao/expo-fullscreen-splash/blob/main/LICENSE)

## Why this package?

Recently, Expo migrated to the SplashScreen API introduced in Android 12, as mentioned in their changelog:

> "We've migrated to the SplashScreen API introduced in Android 12, which resolves some long-standing issues on Android 12+, and helps to prevent layout jumps when transitioning from the splash screen. Splash screens for Android cannot be fullscreen with this API (and this did not work particularly well before either), so you may need to update your splash screen. Learn more in the Android Splash screen docs and the expo-splash-screen docs."

This migration has resulted in [significant issues for Expo users](https://github.com/expo/expo/issues/32515), especially those who need a consistent fullscreen splash screen experience across all platforms.

`expo-fullscreen-splash` was specifically created to solve this problem, allowing developers to create customizable fullscreen splash screens that work perfectly on all Android versions (including Android 12+) and iOS, regardless of the native Android API limitations.

## Features

- ✨ Fullscreen splash with manual or automatic control
- 🎭 Multiple transition animations (fade, scale, slide, bounce)
- 🎨 Complete color and style customization
- 📱 Integration with device safe area system
- 🔄 Automatic navigation bar management
- 🔌 Simple API with reference for external control
- 🛠️ Solution for Android 12+ fullscreen splash screen limitations

## Installation

```bash
npm install expo-fullscreen-splash
# or
yarn add expo-fullscreen-splash
```

## Dependencies

This package depends on:

- `react-native-reanimated`
- `react-native-safe-area-context`
- `expo-navigation-bar`

Make sure these dependencies are installed in your project.

## Basic Usage

```jsx
import React, { useRef } from "react";
import { View, Text, Image } from "react-native";
import ExpoFullscreenSplash, { SplashScreenRef } from "expo-fullscreen-splash";

const App = () => {
  const splashRef = useRef<SplashScreenRef>(null);

  // Custom Splash Component
  const MySplashComponent = () => (
    <View style={{ alignItems: "center" }}>
      <Image
        source={require("./assets/logo.png")}
        style={{ width: 200, height: 200 }}
      />
      <Text style={{ marginTop: 20, fontSize: 24 }}>My App</Text>
    </View>
  );

  return (
    <ExpoFullscreenSplash
      ref={splashRef}
      SplashComponent={<MySplashComponent />}
      backgroundColor="#ffffff"
      animationType="fade"
      autoHide={true}
      splashDuration={3000}
      onAnimationEnd={() => console.log("Splash screen ended")}
    >
      {/* Your app content goes here */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Main App Content</Text>
      </View>
    </ExpoFullscreenSplash>
  );
};

export default App;
```

## Manual Control

To manually control when the splash screen should disappear:

```jsx
import React, { useEffect, useRef } from "react";
import { View, Text } from "react-native";
import ExpoFullscreenSplash, { SplashScreenRef } from "expo-fullscreen-splash";

const App = () => {
  const splashRef = useRef<SplashScreenRef>(null);

  useEffect(() => {
    // Simulating data loading or initialization
    async function prepareApp() {
      await fetchInitialData();
      // Hide splash screen after initialization
      splashRef.current?.hide();
    }

    prepareApp();
  }, []);

  return (
    <ExpoFullscreenSplash
      ref={splashRef}
      SplashComponent={<YourSplashComponent />}
      backgroundColor="#f5f5f5"
      animationType="scale"
      autoHide={false} // Disable automatic hiding
    >
      <MainApp />
    </ExpoFullscreenSplash>
  );
};
```

## Integration with Font Loading

Many Expo apps need to load custom fonts before displaying the main content. The `ExpoFullscreenSplash` component is perfect for this use case:

```jsx
import React, { useRef, useEffect } from "react";
import { StatusBar } from "react-native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { FontAwesome } from "@expo/vector-icons";
import ExpoFullscreenSplash, { SplashScreenRef } from "expo-fullscreen-splash";

// Your Splash Component
const SplashScreenComponent = () => (
  <View style={{ alignItems: "center", justifyContent: "center" }}>
    <Image
      source={require("../assets/logo.png")}
      style={{ width: 200, height: 200 }}
    />
    <Text style={{ color: "white", fontSize: 24, marginTop: 20 }}>
      My Amazing App
    </Text>
  </View>
);

export default function RootLayout() {
  // Loading fonts
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const splashRef = useRef<SplashScreenRef>(null);

  // Close splash screen when fonts are loaded
  useEffect(() => {
    if (loaded) {
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        splashRef.current?.hide(() => {
          console.log("Splash screen was closed");
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  return (
    <ExpoFullscreenSplash
      ref={splashRef}
      SplashComponent={<SplashScreenComponent />}
      backgroundColor="#c54cdf"
      animationType="fade"
      autoHide={false}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style="light" animated={true} />
    </ExpoFullscreenSplash>
  );
}
```

This example shows how to integrate the `ExpoFullscreenSplash` component with:

- Custom font loading using `expo-font`
- Navigation with `expo-router`
- Custom StatusBar
- Callback for confirmation when the splash is closed

The splash screen remains visible until the fonts are loaded, providing a continuous user experience without blank screens or abrupt changes during initial loading.

## API

### Props

| Prop              | Type                 | Default     | Description                                                                                       |
| ----------------- | -------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `SplashComponent` | ReactNode            | _Required_  | React component to be rendered as splash                                                          |
| `backgroundColor` | string               | `"#ffffff"` | Background color of the splash screen                                                             |
| `splashDuration`  | number \| null       | `null`      | Duration (ms) of splash display (when `autoHide` is `true`). When `null`, requires manual control |
| `animationType`   | string               | `"none"`    | Type of exit animation (`"fade"`, `"scale"`, `"slide"`, `"bounce"`, `"none"`)                     |
| `onAnimationEnd`  | function             | `() => {}`  | Callback executed when the animation ends                                                         |
| `containerStyle`  | StyleProp<ViewStyle> | `undefined` | Additional styles for the splash container                                                        |
| `autoHide`        | boolean              | `false`     | If `true`, automatically hides after `splashDuration`                                             |
| `children`        | ReactNode            | _Required_  | Main application content to be displayed after the splash                                         |

### Methods

The component exposes the following methods via ref:

| Method | Parameters                        | Description                                                              |
| ------ | --------------------------------- | ------------------------------------------------------------------------ |
| `hide` | `(callback?: () => void) => void` | Hides the splash screen and executes the optional callback when finished |

## Examples

### Splash with Custom Loading

```jsx
const App = () => {
  const splashRef = useRef<SplashScreenRef>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 0.1;
        if (newProgress >= 1) {
          clearInterval(interval);
          splashRef.current?.hide();
          return 1;
        }
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const LoadingSplash = () => (
    <View style={{ alignItems: "center" }}>
      <Image source={require("./assets/logo.png")} />
      <Text>Loading: {Math.round(progress * 100)}%</Text>
      {/* Your custom progress bar */}
    </View>
  );

  return (
    <ExpoFullscreenSplash
      ref={splashRef}
      SplashComponent={<LoadingSplash />}
      animationType="fade"
      autoHide={false}
    >
      <MainApp />
    </ExpoFullscreenSplash>
  );
};
```

### Different Animation Types

```jsx
// Fade
<ExpoFullscreenSplash
  animationType="fade"
  splashDuration={2000}
  autoHide={true}
  // ...
/>

// Scale
<ExpoFullscreenSplash
  animationType="scale"
  splashDuration={2000}
  autoHide={true}
  // ...
/>

// Slide
<ExpoFullscreenSplash
  animationType="slide"
  splashDuration={2000}
  autoHide={true}
  // ...
/>

// Bounce
<ExpoFullscreenSplash
  animationType="bounce"
  splashDuration={2000}
  autoHide={true}
  // ...
/>
```

## Navigation Bar Management

The component automatically manages the visibility and color of the navigation bar, restoring the original settings when the splash screen is closed.

## Performance Considerations

- Use lightweight components in your splash screen to ensure fast loading
- For animation testing, use development mode
- For better performance in production, consider using `animationType="none"` if smooth transition is not essential

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

MIT
