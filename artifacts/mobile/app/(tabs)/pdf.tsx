import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { AsterixHeader } from "@/components/ui/AsterixHeader";
import { GlossyCard } from "@/components/ui/GlossyCard";
import { GoldButton } from "@/components/ui/GoldButton";
import { Typography } from "@/constants/theme";

type PDFAction = "summarize" | "qa" | "extract" | "translate";

const PDF_ACTIONS: { id: PDFAction; icon: keyof typeof Feather.glyphMap; label: string }[] = [
  { id: "summarize", icon: "list", label: "Summarize" },
  { id: "qa", icon: "help-circle", label: "Q&A" },
  { id: "extract", icon: "scissors", label: "Extract Data" },
  { id: "translate", icon: "globe", label: "Translate" },
];

interface MockDocument {
  id: string;
  name: string;
  pages: number;
  size: string;
}

export default function PDFScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [selectedAction, setSelectedAction] = useState<PDFAction>("summarize");
  const [question, setQuestion] = useState<string>("");
  const [documents] = useState<MockDocument[]>([]);

  function handleSelectAction(id: PDFAction) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAction(id);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AsterixHeader title="PDF AI" />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {documents.length === 0 ? (
          <GlossyCard style={styles.uploadCard} bordered>
            <Feather name="file-plus" size={40} color={colors.gold} />
            <Text style={[Typography.h3, { color: colors.foreground, marginTop: 12 }]}>
              No Documents
            </Text>
            <Text
              style={[
                Typography.small,
                { color: colors.mutedForeground, textAlign: "center", marginTop: 6 },
              ]}
            >
              Upload a PDF to start analyzing it with AI
            </Text>
            <GoldButton
              label="Upload PDF"
              onPress={() => {}}
              style={{ marginTop: 16 }}
              size="sm"
            />
          </GlossyCard>
        ) : (
          documents.map((doc) => (
            <GlossyCard key={doc.id} bordered style={styles.docCard}>
              <View style={styles.docRow}>
                <Feather name="file-text" size={28} color={colors.gold} />
                <View style={styles.docInfo}>
                  <Text style={[Typography.bodyMedium, { color: colors.foreground }]}>
                    {doc.name}
                  </Text>
                  <Text style={[Typography.small, { color: colors.mutedForeground }]}>
                    {doc.pages} pages · {doc.size}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Feather name="trash-2" size={18} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            </GlossyCard>
          ))
        )}

        <Text style={[Typography.label, { color: colors.gold, marginTop: 16, marginBottom: 8 }]}>
          ACTION
        </Text>
        <View style={styles.actionsRow}>
          {PDF_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              onPress={() => handleSelectAction(action.id)}
              style={[
                styles.actionChip,
                {
                  backgroundColor:
                    selectedAction === action.id ? colors.gold : colors.secondary,
                  borderColor: selectedAction === action.id ? colors.gold : colors.border,
                },
              ]}
            >
              <Feather
                name={action.icon}
                size={14}
                color={
                  selectedAction === action.id
                    ? colors.primaryForeground
                    : colors.mutedForeground
                }
              />
              <Text
                style={[
                  Typography.smallMedium,
                  {
                    color:
                      selectedAction === action.id
                        ? colors.primaryForeground
                        : colors.mutedForeground,
                  },
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedAction === "qa" && (
          <View
            style={[
              styles.questionInput,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[
                Typography.body,
                { color: colors.foreground, fontFamily: "Inter_400Regular" },
              ]}
              placeholder="Ask a question about the document..."
              placeholderTextColor={colors.mutedForeground}
              value={question}
              onChangeText={setQuestion}
              multiline
            />
          </View>
        )}

        <GlossyCard style={styles.infoCard} goldBorder>
          <Text style={[Typography.label, { color: colors.gold, marginBottom: 6 }]}>
            PDF MODULE
          </Text>
          <Text style={[Typography.small, { color: colors.mutedForeground, lineHeight: 18 }]}>
            Full PDF parsing, vector embedding, and semantic search will be enabled
            when the FastAPI backend is connected.
          </Text>
        </GlossyCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 10 },
  uploadCard: {
    alignItems: "center",
    paddingVertical: 36,
    marginBottom: 8,
  },
  docCard: { marginBottom: 0 },
  docRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  docInfo: { flex: 1 },
  actionsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  questionInput: {
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 14,
    minHeight: 80,
    marginTop: 8,
  },
  infoCard: { marginTop: 8 },
});
