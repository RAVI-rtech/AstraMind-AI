import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ChatContextValue {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isTyping: boolean;
  createConversation: () => Conversation;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  clearActiveConversation: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);
const CONVERSATIONS_KEY = "@asterix_conversations";

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  function createConversation(): Conversation {
    const conv: Conversation = {
      id: generateId(),
      title: "New Conversation",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConversation(conv);
    return conv;
  }

  function selectConversation(id: string) {
    const conv = conversations.find((c) => c.id === id) ?? null;
    setActiveConversation(conv);
  }

  function deleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversation?.id === id) setActiveConversation(null);
  }

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeConversation) return;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };

      const updatedWithUser = {
        ...activeConversation,
        messages: [...activeConversation.messages, userMsg, assistantMsg],
        title:
          activeConversation.messages.length === 0
            ? content.slice(0, 40)
            : activeConversation.title,
        updatedAt: new Date().toISOString(),
      };

      setActiveConversation(updatedWithUser);
      setConversations((prev) =>
        prev.map((c) => (c.id === updatedWithUser.id ? updatedWithUser : c))
      );
      setIsTyping(true);

      // Stub — will be wired to /api/chat in next phase
      await new Promise((r) => setTimeout(r, 1200));
      const reply = "I'm Asterix AI. AI features will be wired in the next phase.";

      const finalized = {
        ...updatedWithUser,
        messages: updatedWithUser.messages.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: reply, isStreaming: false }
            : m
        ),
        updatedAt: new Date().toISOString(),
      };

      setActiveConversation(finalized);
      setConversations((prev) =>
        prev.map((c) => (c.id === finalized.id ? finalized : c))
      );
      setIsTyping(false);
    },
    [activeConversation]
  );

  function clearActiveConversation() {
    setActiveConversation(null);
  }

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        isTyping,
        createConversation,
        selectConversation,
        deleteConversation,
        sendMessage,
        clearActiveConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}
