import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface GlossyCardProps {
  children: ReactNode;
  style?: ViewStyle;
  bordered?: boolean;
  goldBorder?: boolean;
}

export function GlossyCard({
  children,
  style,
  bordered = false,
  goldBorder = false,
}: GlossyCardProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: goldBorder
            ? colors.gold
            : bordered
            ? colors.border
            : "transparent",
          borderWidth: goldBorder ? 1 : bordered ? 0.5 : 0,
          shadowColor: goldBorder ? colors.gold : "#000",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
