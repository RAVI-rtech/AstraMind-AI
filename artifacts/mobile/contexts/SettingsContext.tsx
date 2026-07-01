import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AIModel = "gpt-4o" | "gpt-4o-mini" | "claude-3-5-sonnet" | "gemini-pro";
export type Language = "en" | "es" | "fr" | "de" | "pt" | "ja" | "zh";

export interface AppSettings {
  selectedModel: AIModel;
  language: Language;
  voiceEnabled: boolean;
  voiceSpeed: number;
  hapticFeedback: boolean;
  streamingEnabled: boolean;
  systemPrompt: string;
  maxTokens: number;
  temperature: number;
  darkMode: boolean;
  fontSize: "small" | "medium" | "large";
  autoSaveChats: boolean;
}

interface SettingsContextValue {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SETTINGS_KEY = "@astramind_settings";

const defaultSettings: AppSettings = {
  selectedModel: "gpt-4o",
  language: "en",
  voiceEnabled: true,
  voiceSpeed: 1.0,
  hapticFeedback: true,
  streamingEnabled: true,
  systemPrompt: "You are AstraMind AI, a helpful, precise, and professional AI assistant.",
  maxTokens: 2048,
  temperature: 0.7,
  darkMode: true,
  fontSize: "medium",
  autoSaveChats: true,
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch {
      // ignore
    }
  }

  async function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  async function resetSettings() {
    setSettings(defaultSettings);
    await AsyncStorage.removeItem(SETTINGS_KEY);
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
