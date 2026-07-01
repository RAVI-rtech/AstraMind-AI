import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { routeMessage } from "@/services/api";
import type { RouteResponse, AIModel } from "@/services/api";
import {
  saveConversation,
  saveMessage,
  loadConversations,
  loadMessages,
  deleteConversation as dbDeleteConversation,
} from "@/services/database";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  category?: string;
  suggestedActions?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  category: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ChatContextValue {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isTyping: boolean;
  createConversation: () => Conversation;
  selectConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearActiveConversation: () => void;
  lastRouteResponse: RouteResponse | null;
}

const ChatContext = createContext<ChatContextValue | null>(null);

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const { settings } = useSettings();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [lastRouteResponse, setLastRouteResponse] = useState<RouteResponse | null>(null);

  // ── Load conversations from SQLite on mount ───────────────────────────────

  useEffect(() => {
    loadConversations()
      .then((rows) => {
        const convs: Conversation[] = rows.map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          messages: [],
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
        setConversations(convs);
      })
      .catch(() => {/* SQLite unavailable on web — silent degradation */});
  }, []);

  // ── Create a new conversation ─────────────────────────────────────────────

  function createConversation(): Conversation {
    const now = new Date().toISOString();
    const conv: Conversation = {
      id: generateId(),
      title: "New Conversation",
      category: "chat",
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConversation(conv);

    saveConversation({
      id: conv.id,
      title: conv.title,
      category: conv.category,
      created_at: conv.createdAt,
      updated_at: conv.updatedAt,
    }).catch(() => {});

    return conv;
  }

  // ── Select a conversation (lazy-load its messages) ────────────────────────

  async function selectConversation(id: string) {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;

    // If messages already loaded, just activate
    if (conv.messages.length > 0) {
      setActiveConversation(conv);
      return;
    }

    // Load messages from SQLite
    try {
      const rows = await loadMessages(id);
      const messages: ChatMessage[] = rows.map((r) => ({
        id: r.id,
        role: r.role,
        content: r.content,
        timestamp: r.timestamp,
        category: r.category,
        suggestedActions: JSON.parse(r.suggested_actions || "[]"),
      }));
      const populated = { ...conv, messages };
      setConversations((prev) => prev.map((c) => (c.id === id ? populated : c)));
      setActiveConversation(populated);
    } catch {
      setActiveConversation(conv);
    }
  }

  // ── Delete a conversation ─────────────────────────────────────────────────

  async function deleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversation?.id === id) setActiveConversation(null);
    dbDeleteConversation(id).catch(() => {});
  }

  // ── Send a message ────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeConversation) return;

      const now = new Date().toISOString();

      // 1. Optimistically add user message + empty assistant placeholder
      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content,
        timestamp: now,
      };
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: now,
        isStreaming: true,
      };

      const isFirstMessage = activeConversation.messages.length === 0;
      const titleUpdate = isFirstMessage ? content.slice(0, 45) : activeConversation.title;

      const withUser: Conversation = {
        ...activeConversation,
        title: titleUpdate,
        messages: [...activeConversation.messages, userMsg, assistantMsg],
        updatedAt: now,
      };

      setActiveConversation(withUser);
      setConversations((prev) => prev.map((c) => (c.id === withUser.id ? withUser : c)));
      setIsTyping(true);

      // 2. Save user message to SQLite
      saveMessage({
        id: userMsg.id,
        conversation_id: activeConversation.id,
        role: "user",
        content,
        timestamp: now,
        category: "chat",
        suggested_actions: "[]",
      }).catch(() => {});

      // Update conversation title in SQLite when first message
      if (isFirstMessage) {
        saveConversation({
          id: activeConversation.id,
          title: titleUpdate,
          category: activeConversation.category,
          created_at: activeConversation.createdAt,
          updated_at: now,
        }).catch(() => {});
      }

      // 3. Build context (last 10 turns)
      const contextMsgs = activeConversation.messages
        .filter((m) => !m.isStreaming)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      // 4. Call AI router
      let reply = "";
      let category = "chat";
      let suggestedActions: string[] = [];
      let routeResponse: RouteResponse | null = null;

      try {
        routeResponse = await routeMessage(
          {
            message: content,
            model: settings.selectedModel as AIModel,
            context: contextMsgs,
            max_tokens: settings.maxTokens,
            temperature: settings.temperature,
          },
          token ?? undefined,
        );
        reply = routeResponse.content;
        category = routeResponse.classification.category;
        suggestedActions = routeResponse.suggested_actions ?? [];
        setLastRouteResponse(routeResponse);
      } catch (err) {
        reply = "I'm having trouble connecting right now. Please check your connection and try again.";
        console.warn("AI route error:", err);
      }

      // 5. Finalize with real AI response
      const newUpdatedAt = new Date().toISOString();
      const finalized: Conversation = {
        ...withUser,
        category,
        updatedAt: newUpdatedAt,
        messages: withUser.messages.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: reply, isStreaming: false, category, suggestedActions }
            : m,
        ),
      };

      setActiveConversation(finalized);
      setConversations((prev) => prev.map((c) => (c.id === finalized.id ? finalized : c)));
      setIsTyping(false);

      // 6. Save assistant message + update conversation in SQLite
      saveMessage({
        id: assistantMsg.id,
        conversation_id: activeConversation.id,
        role: "assistant",
        content: reply,
        timestamp: newUpdatedAt,
        category,
        suggested_actions: JSON.stringify(suggestedActions),
      }).catch(() => {});

      saveConversation({
        id: activeConversation.id,
        title: finalized.title,
        category,
        created_at: activeConversation.createdAt,
        updated_at: newUpdatedAt,
      }).catch(() => {});
    },
    [activeConversation, settings, token],
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
        lastRouteResponse,
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
