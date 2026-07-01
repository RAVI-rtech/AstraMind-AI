import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ChatMessage } from "@/contexts/ChatContext";
import { useColors } from "@/hooks/useColors";
import { Typography } from "@/constants/theme";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const colors = useColors();
  const isUser = message.role === "user";

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Animated.View
      entering={FadeInUp.duration(200).springify()}
      style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperAssistant]}
    >
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.gold }]}>
          <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>✦</Text>
        </View>
      )}
      <View style={styles.bubbleColumn}>
        <View
          style={[
            styles.bubble,
            isUser
              ? { backgroundColor: colors.gold, borderBottomRightRadius: 4 }
              : {
                  backgroundColor: colors.card,
                  borderWidth: 0.5,
                  borderColor: colors.border,
                  borderBottomLeftRadius: 4,
                },
          ]}
        >
          <Text
            style={[
              Typography.body,
              {
                color: isUser ? colors.primaryForeground : colors.foreground,
              },
            ]}
          >
            {message.content}
            {message.isStreaming && (
              <Text style={{ color: colors.gold }}> ▋</Text>
            )}
          </Text>
        </View>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>{time}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  wrapperUser: {
    justifyContent: "flex-end",
  },
  wrapperAssistant: {
    justifyContent: "flex-start",
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  avatarText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  bubbleColumn: {
    maxWidth: "75%",
    gap: 4,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  time: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 4,
  },
});
