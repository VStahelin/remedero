import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/theme/theme";
import { Feeling, Plan } from "@/types/domain";

export type MoodLogInput = {
  feeling: Feeling;
  text: string;
  planId: string | null;
};

type AddMoodScreenProps = {
  onCancel: () => void;
  onSubmit: (input: MoodLogInput) => void;
  plans: Plan[];
};

const feelingRows: Array<Array<{ label: string; value: Feeling }>> = [
  [
    { label: "Bem", value: "bem" },
    { label: "Animado", value: "animado" },
    { label: "Calmo", value: "calmo" },
    { label: "Neutro", value: "neutro" },
  ],
  [
    { label: "Ansioso", value: "ansioso" },
    { label: "Cansado", value: "cansado" },
    { label: "Triste", value: "triste" },
    { label: "Mal", value: "mal" },
  ],
];

export function AddMoodScreen({ onCancel, onSubmit, plans }: AddMoodScreenProps) {
  const [selectedFeeling, setSelectedFeeling] = useState<Feeling | null>(null);
  const [text, setText] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  function handleSubmit() {
    if (!selectedFeeling) return;
    onSubmit({ feeling: selectedFeeling, text: text.trim(), planId: selectedPlanId });
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.glowOrb} />

      <View style={styles.topBar}>
        <TouchableOpacity accessibilityRole="button" onPress={onCancel} style={styles.navChip}>
          <Text style={styles.navChipText}>← Cancelar</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text style={styles.title}>Como estou me sentindo?</Text>
        <Text style={styles.subtitle}>Registre seu estado agora. Vai aparecer na timeline do dia.</Text>
      </View>

      <View style={styles.feelingCard}>
        {feelingRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.feelingRow}>
            {row.map((opt) => {
              const isSelected = selectedFeeling === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  accessibilityRole="button"
                  onPress={() => setSelectedFeeling(opt.value)}
                  style={[styles.feelingChip, isSelected && styles.feelingChipSelected]}
                >
                  <Text style={[styles.feelingChipText, isSelected && styles.feelingChipTextSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Nota</Text>
        <TextInput
          multiline
          onChangeText={setText}
          placeholder="O que esta acontecendo... (opcional)"
          placeholderTextColor={colors.textSubtle}
          style={[styles.input, styles.inputMultiline]}
          textAlignVertical="top"
          value={text}
        />
      </View>

      {plans.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.label}>Vincular a um plano</Text>
          <View style={styles.planRow}>
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <TouchableOpacity
                  key={plan.id}
                  accessibilityRole="button"
                  onPress={() => setSelectedPlanId(isSelected ? null : plan.id)}
                  style={[styles.planChip, isSelected && styles.planChipSelected]}
                >
                  <Text style={[styles.planChipText, isSelected && styles.planChipTextSelected]}>
                    {plan.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <PrimaryButton
        disabled={!selectedFeeling}
        label="Registrar sentimento"
        onPress={handleSubmit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  content: {
    gap: spacing.lg,
    overflow: "hidden",
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  feelingCard: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  feelingChip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.base,
    borderWidth: 1,
    flex: 1,
    paddingVertical: spacing.md,
  },
  feelingChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  feelingChipText: {
    color: colors.textMuted,
    ...typography.labelMd,
  },
  feelingChipTextSelected: {
    color: colors.primaryText,
    fontWeight: "700",
  },
  feelingRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  glowOrb: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 180,
    opacity: 0.1,
    position: "absolute",
    right: -80,
    top: -40,
    width: 180,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.base,
    borderWidth: 1,
    color: colors.text,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyMd,
  },
  inputMultiline: {
    minHeight: 80,
  },
  label: {
    color: colors.textMuted,
    ...typography.labelSm,
    textTransform: "uppercase",
  },
  navChip: {
    alignSelf: "flex-start",
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  navChipText: {
    color: colors.textMuted,
    ...typography.labelSm,
  },
  planChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  planChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  planChipText: {
    color: colors.textMuted,
    ...typography.labelMd,
  },
  planChipTextSelected: {
    color: colors.primaryText,
  },
  planRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  subtitle: {
    color: colors.textSubtle,
    ...typography.bodyMd,
    marginTop: spacing.xs,
  },
  title: {
    color: colors.text,
    ...typography.headlineLg,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
  },
});
