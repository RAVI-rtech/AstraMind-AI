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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Registration failed. Please try again.");
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
            { paddingTop: topPad + 24, paddingBottom: bottomPad + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[Typography.bodyMedium, { color: colors.gold }]}>← Back</Text>
          </TouchableOpacity>

          <Text style={[Typography.h1, { color: colors.foreground, marginTop: 24 }]}>
            Create Account
          </Text>
          <Text style={[Typography.body, { color: colors.mutedForeground, marginTop: 6, marginBottom: 32 }]}>
            Join AstraMind AI today
          </Text>

          {([
            { label: "FULL NAME", value: name, setter: setName, placeholder: "John Doe", type: "default" as const, secure: false },
            { label: "EMAIL", value: email, setter: setEmail, placeholder: "you@example.com", type: "email-address" as const, secure: false },
            { label: "PASSWORD", value: password, setter: setPassword, placeholder: "Min. 8 characters", type: "default" as const, secure: true },
            { label: "CONFIRM PASSWORD", value: confirm, setter: setConfirm, placeholder: "Repeat your password", type: "default" as const, secure: true },
          ] as const).map((field, i) => (
            <View key={i} style={{ marginBottom: 16 }}>
              <Text style={[Typography.label, { color: colors.gold, marginBottom: 8 }]}>
                {field.label}
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
                value={field.value}
                onChangeText={field.setter}
                placeholder={field.placeholder}
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={field.secure}
                keyboardType={field.type}
                autoCapitalize={field.type === "email-address" ? "none" : "words"}
              />
            </View>
          ))}

          <GoldButton
            label="Create Account"
            onPress={handleRegister}
            isLoading={isLoading}
            size="lg"
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity onPress={() => router.back()} style={styles.loginLink}>
            <Text style={[Typography.body, { color: colors.mutedForeground }]}>
              Already have an account?{" "}
              <Text style={{ color: colors.gold }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 28 },
  backBtn: { alignSelf: "flex-start" },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  loginLink: { alignItems: "center", marginTop: 24 },
});
