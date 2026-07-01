import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Typography } from "@/constants/theme";

interface EmptyStateProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={28} color={colors.gold} />
      </View>
      <Text style={[Typography.h3, styles.title, { color: colors.foreground }]}>
        {title}
      </Text>
      {description && (
        <Text style={[Typography.body, styles.desc, { color: colors.mutedForeground }]}>
          {description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    textAlign: "center",
  },
  desc: {
    textAlign: "center",
    lineHeight: 22,
  },
});
