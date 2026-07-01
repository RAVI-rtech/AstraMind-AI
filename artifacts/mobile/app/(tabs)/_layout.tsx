import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: 0,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : 60,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(10,10,10,0.85)" }]}
            />
          ) : isWeb ? (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}
            />
          ) : null,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Feather name="message-circle" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="voice"
        options={{
          tabBarIcon: ({ color }) => <Feather name="mic" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="image"
        options={{
          tabBarIcon: ({ color }) => <Feather name="image" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pdf"
        options={{
          tabBarIcon: ({ color }) => <Feather name="file-text" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => <Feather name="sliders" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
