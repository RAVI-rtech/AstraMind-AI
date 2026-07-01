import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { GoldButton } from "@/components/ui/GoldButton";
import { Typography } from "@/constants/theme";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topPad + 40, paddingBottom: bottomPad + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoSection}>
            <Text style={[styles.logoMark, { color: colors.gold }]}>✦</Text>
            <Text style={[styles.logoText, { color: colors.foreground }]}>ASTRAMIND AI</Text>
            <Text style={[Typography.body, { color: colors.mutedForeground, marginTop: 8 }]}>
              Your intelligent assistant
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[Typography.label, { color: colors.gold, marginBottom: 8 }]}>
              EMAIL
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Text style={[Typography.label, { color: colors.gold, marginBottom: 8, marginTop: 16 }]}>
              PASSWORD
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              autoComplete="password"
            />

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={[Typography.small, { color: colors.gold }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <GoldButton
              label="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
              size="lg"
              style={{ marginTop: 24 }}
            />

            <TouchableOpacity
              onPress={() => router.push("/auth/register")}
              style={styles.registerLink}
            >
              <Text style={[Typography.body, { color: colors.mutedForeground }]}>
                Don't have an account?{" "}
                <Text style={{ color: colors.gold }}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 28 },
  logoSection: { alignItems: "center", marginBottom: 48 },
  logoMark: { fontSize: 48 },
  logoText: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 6,
    marginTop: 8,
  },
  form: {},
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  forgotBtn: { alignSelf: "flex-end", marginTop: 8 },
  registerLink: { alignItems: "center", marginTop: 24 },
});
