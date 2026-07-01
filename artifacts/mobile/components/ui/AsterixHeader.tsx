import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Typography } from "@/constants/theme";

interface AsterixHeaderProps {
  title?: string;
  showLogo?: boolean;
  leftAction?: { icon: keyof typeof Feather.glyphMap; onPress: () => void };
  rightAction?: { icon: keyof typeof Feather.glyphMap; onPress: () => void };
}

export function AsterixHeader({
  title,
  showLogo = false,
  leftAction,
  rightAction,
}: AsterixHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: topPad + 8 },
      ]}
    >
      <View style={styles.row}>
        {leftAction ? (
          <TouchableOpacity onPress={leftAction.onPress} style={styles.iconBtn}>
            <Feather name={leftAction.icon} size={22} color={colors.foreground} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}

        <View style={styles.center}>
          {showLogo ? (
            <Text style={[styles.logo, { color: colors.gold }]}>✦ ASTRAMIND AI</Text>
          ) : (
            <Text style={[Typography.h3, { color: colors.foreground }]}>{title}</Text>
          )}
        </View>

        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.iconBtn}>
            <Feather name={rightAction.icon} size={22} color={colors.foreground} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
  },
  divider: {
    height: 0.5,
  },
});
