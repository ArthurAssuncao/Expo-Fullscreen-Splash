import * as NavigationBar from "expo-navigation-bar";
import React, {
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  StatusBar,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  EdgeInsets,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// Available animation types
export type ExpoFullscreenSplashAnimationType =
  | "fade"
  | "scale"
  | "slide"
  | "bounce"
  | "none"; // Added "none" type for no animation

// Interface for external reference
export interface SplashScreenRef {
  hide: (callback?: () => void) => void;
}

// Interface for component props
export interface ExpoFullscreenSplashProps extends ViewProps {
  SplashComponent: ReactNode;
  backgroundColor?: string;
  splashDuration?: number | null; // Can now be null for manual mode
  animationType?: ExpoFullscreenSplashAnimationType;
  onAnimationEnd?: () => void;
  children: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  autoHide?: boolean; // New prop to control if splash should automatically close
}

// Main Splash Screen component (with ref)
const ExpoFullscreenSplash = forwardRef<
  SplashScreenRef,
  ExpoFullscreenSplashProps
>((props, ref): JSX.Element => {
  const {
    SplashComponent,
    backgroundColor = "#ffffff",
    splashDuration = null, // Default is now null for manual mode
    animationType = "none", // Default is now "none"
    onAnimationEnd = () => {},
    containerStyle,
    children,
    autoHide = false, // By default, doesn't close automatically
  } = props;

  const [isAppReady, setIsAppReady] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const originalNavigationColorRef = useRef<string | null>(null);
  const originalNavigationVisibilityRef = useRef<string | null>(null);

  // Shared animated values
  const opacity = useSharedValue<number>(1);
  const scale = useSharedValue<number>(1);
  const translateY = useSharedValue<number>(0);
  const backgroundOpacity = useSharedValue<number>(1);

  // Function to finish the animation
  const finishAnimation = (callback?: () => void): void => {
    setIsAppReady(true);
    onAnimationEnd();
    callback?.();
  };

  // Exposes the hide method for external control through the ref
  useImperativeHandle(ref, () => ({
    hide: (callback?: () => void) => {
      if (animationType === "none") {
        // No animation - just closes immediately
        finishAnimation(callback);
      } else {
        // Starts the exit animation
        startExitAnimation(callback);
      }
    },
  }));

  // Get the original color when component mounts - no dependencies
  useEffect(() => {
    const getOriginalColor = async () => {
      try {
        const color = await NavigationBar.getBackgroundColorAsync();
        originalNavigationColorRef.current = color;
      } catch (error) {
        console.error("Error getting navigation bar color:", error);
      }
    };

    getOriginalColor();
  }, []);

  // Get the original visibility when component mounts - no dependencies
  useEffect(() => {
    const getOriginalVisibility = async () => {
      try {
        const visibility = await NavigationBar.getVisibilityAsync();
        originalNavigationVisibilityRef.current = visibility;
      } catch (error) {
        console.error("Error getting navigation bar visibility:", error);
      }
    };

    getOriginalVisibility();
  }, []);

  // Setup auto-animation timer if enabled
  useEffect(() => {
    if (autoHide && splashDuration !== null) {
      const timer = setTimeout(() => {
        startExitAnimation();
      }, splashDuration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, splashDuration]);

  // Add a separate useEffect to restore color when component unmounts or animation completes
  useEffect(() => {
    if (isAppReady && originalNavigationColorRef.current) {
      NavigationBar.setBackgroundColorAsync(originalNavigationColorRef.current);
    }
    if (
      isAppReady &&
      originalNavigationVisibilityRef &&
      originalNavigationVisibilityRef.current &&
      originalNavigationVisibilityRef.current != "hidden"
    ) {
      NavigationBar.setVisibilityAsync("visible");
    }
  }, [isAppReady]);

  // Function to start the exit animation
  const startExitAnimation = (callback?: () => void): void => {
    switch (animationType) {
      case "fade":
        opacity.value = withTiming(
          0,
          { duration: 500, easing: Easing.out(Easing.ease) },
          () => {
            runOnJS(finishAnimation)(callback);
          }
        );
        backgroundOpacity.value = withTiming(0, { duration: 600 });
        break;

      case "scale":
        scale.value = withTiming(0, { duration: 500 }, () => {
          runOnJS(finishAnimation)(callback);
        });
        backgroundOpacity.value = withTiming(0, { duration: 600 });
        break;

      case "slide":
        translateY.value = withTiming(
          -height,
          { duration: 500, easing: Easing.inOut(Easing.ease) },
          () => {
            runOnJS(finishAnimation)(callback);
          }
        );
        break;

      case "bounce":
        scale.value = withSequence(
          withTiming(1.1, { duration: 150 }),
          withTiming(
            0,
            { duration: 350, easing: Easing.out(Easing.ease) },
            () => {
              runOnJS(finishAnimation)(callback);
            }
          )
        );
        backgroundOpacity.value = withTiming(0, { duration: 500 });
        break;

      case "none":
      default:
        // No animation - just closes
        runOnJS(finishAnimation)(callback);
        break;
    }
  };

  // Animated styles
  const compAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
    };
  });

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
    };
  });

  const styles = getStyles(insets, backgroundColor);

  // Splash screen content
  const renderSplash = (): JSX.Element => {
    const styles = getStyles(insets, backgroundColor);

    if (
      originalNavigationVisibilityRef.current &&
      originalNavigationVisibilityRef.current != "hidden"
    ) {
      NavigationBar.setVisibilityAsync("hidden");
    }

    if (originalNavigationColorRef.current) {
      NavigationBar.setBackgroundColorAsync(backgroundColor);
    }

    return (
      <SafeAreaView edges={[]} style={styles.containerWrapper}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor,
            },
            containerStyle,
            backgroundAnimatedStyle,
          ]}
        >
          <Animated.View style={[styles.component, compAnimatedStyle]}>
            {SplashComponent}
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    );
  };

  // Conditional rendering: splash or app content
  return (
    <View style={styles.mainContainer}>
      <StatusBar translucent backgroundColor="transparent" />
      {isAppReady ? children : renderSplash()}
    </View>
  );
});

const getStyles = (insets: EdgeInsets, backgroundColor: string) => {
  return StyleSheet.create({
    containerWrapper: {
      flex: 1,
      backgroundColor: backgroundColor,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    mainContainer: {
      flex: 1,
    },
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      backgroundColor: backgroundColor,
    },
    component: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      width: "100%",
    },
    splashscreen: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
  });
};

export default ExpoFullscreenSplash;
