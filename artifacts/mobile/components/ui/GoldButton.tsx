import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { Typography } from "@/constants/theme";

interface GoldButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function GoldButton({
  label,
  onPress,
  isLoading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  style,
  textStyle,
}: GoldButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 300 });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  }

  async function handlePress() {
    if (disabled || isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 20 },
    md: { paddingVertical: 14, paddingHorizontal: 28 },
    lg: { paddingVertical: 18, paddingHorizontal: 36 },
  };

  const fontSizes = { sm: 13, md: 15, lg: 17 };

  const variantStyles: ViewStyle =
    variant === "primary"
      ? {
          backgroundColor: colors.gold,
          borderWidth: 0,
        }
      : variant === "outline"
      ? {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: colors.gold,
        }
      : {
          backgroundColor: "transparent",
          borderWidth: 0,
        };

  const textColor =
    variant === "primary" ? colors.primaryForeground : colors.gold;

  return (
    <AnimatedTouchable
      style={[styles.base, sizeStyles[size], variantStyles, animatedStyle, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      activeOpacity={1}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text
          style={[
            styles.label,
            { color: textColor, fontSize: fontSizes[size] },
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
