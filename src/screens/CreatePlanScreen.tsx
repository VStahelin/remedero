import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { DatePickerModal } from "@/components/DatePickerModal";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/theme/theme";

export type CreatePlanInput = {
  name: string;
  description: string;
  startDate: string;           // "YYYY-MM-DD"
  durationDays: number | null; // null = tratamento contínuo
};

type CreatePlanScreenProps = {
  initialValues?: CreatePlanInput;
  mode?: "create" | "edit";
  onCancel: () => void;
  onSubmit: (input: CreatePlanInput) => void;
};

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function diffDays(from: string, to: string): number {
  const a = new Date(from + "T00:00:00").getTime();
  const b = new Date(to + "T00:00:00").getTime();
  return Math.round((b - a) / 86400000);
}

export function CreatePlanScreen({
  initialValues,
  mode = "create",
  onCancel,
  onSubmit,
}: CreatePlanScreenProps) {
  const isEditing = mode === "edit";
  const today = todayIso();

  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? today);

  // Determine initial "has end date" state and derive endDate from durationDays
  const initHasEnd = (initialValues?.durationDays ?? null) !== null;
  const initEndDate = initHasEnd
    ? addDays(initialValues!.startDate, initialValues!.durationDays! - 1)
    : addDays(today, 29); // default: 30-day duration

  const [hasEndDate, setHasEndDate] = useState(initHasEnd);
  const [endDate, setEndDate] = useState(initEndDate);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name.trim() || !description.trim()) {
      setError("Preencha nome e descricao.");
      return;
    }

    if (hasEndDate && endDate <= startDate) {
      setError("A data de fim deve ser depois da data de inicio.");
      return;
    }

    const durationDays = hasEndDate ? diffDays(startDate, endDate) + 1 : null;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      startDate,
      durationDays,
    });
  }

  // Keep endDate consistent when startDate changes
  function handleStartDateConfirm(date: string) {
    setStartDate(date);
    setShowStartPicker(false);
    // If end date is before or equal to new start date, push it forward
    if (hasEndDate && endDate <= date) {
      setEndDate(addDays(date, 29));
    }
  }

  const durationLabel = hasEndDate
    ? `${diffDays(startDate, endDate) + 1} dias`
    : null;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.glowOrb} />

      <View>
        <Text style={styles.eyebrow}>{isEditing ? "Editar plano" : "Novo plano"}</Text>
        <Text style={styles.title}>{isEditing ? "Ajustar tratamento" : "Tratamento"}</Text>
        <Text style={styles.subtitle}>
          {isEditing
            ? "Atualize nome e descricao do tratamento."
            : "Comece pelo tratamento. Depois voce adiciona remedios, dias e horarios na tela do plano."}
        </Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.field}>
          <Text style={styles.label}>Nome do tratamento</Text>
          <TextInput
            onChangeText={setName}
            placeholder="Tratamento de ansiedade 1"
            placeholderTextColor={colors.textSubtle}
            style={styles.input}
            value={name}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Descricao longa</Text>
          <TextInput
            multiline
            onChangeText={setDescription}
            placeholder="Observacoes, contexto do tratamento e instrucoes pessoais."
            placeholderTextColor={colors.textSubtle}
            style={[styles.input, styles.textArea]}
            textAlignVertical="top"
            value={description}
          />
        </View>

        {/* Start date */}
        <View style={styles.field}>
          <Text style={styles.label}>Inicio</Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setShowStartPicker(true)}
            style={styles.dateBtn}
          >
            <Text style={styles.dateBtnText}>{formatDate(startDate)}</Text>
            <Text style={styles.dateBtnChevron}>▾</Text>
          </TouchableOpacity>
        </View>

        {/* Toggle: contínuo vs com duração */}
        <View style={styles.field}>
          <Text style={styles.label}>Tipo de tratamento</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setHasEndDate(false)}
              style={[styles.typePill, !hasEndDate && styles.typePillActive]}
            >
              <Text style={[styles.typePillText, !hasEndDate && styles.typePillTextActive]}>
                Continuo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setHasEndDate(true)}
              style={[styles.typePill, hasEndDate && styles.typePillActive]}
            >
              <Text style={[styles.typePillText, hasEndDate && styles.typePillTextActive]}>
                Com duracao
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* End date (only when hasEndDate) */}
        {hasEndDate && (
          <View style={styles.field}>
            <Text style={styles.label}>Data de fim</Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setShowEndPicker(true)}
              style={styles.dateBtn}
            >
              <Text style={styles.dateBtnText}>{formatDate(endDate)}</Text>
              {durationLabel && (
                <Text style={styles.dateBtnMeta}>{durationLabel}</Text>
              )}
              <Text style={styles.dateBtnChevron}>▾</Text>
            </TouchableOpacity>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label={isEditing ? "Salvar alteracoes" : "Criar plano"}
          onPress={handleSubmit}
        />
        <PrimaryButton label="Cancelar" onPress={onCancel} variant="secondary" />
      </View>

      <DatePickerModal
        onCancel={() => setShowStartPicker(false)}
        onConfirm={handleStartDateConfirm}
        value={startDate}
        visible={showStartPicker}
      />

      <DatePickerModal
        onCancel={() => setShowEndPicker(false)}
        onConfirm={(date) => { setEndDate(date); setShowEndPicker(false); }}
        value={endDate}
        visible={showEndPicker}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
  },
  content: {
    gap: spacing.lg,
    overflow: "hidden",
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  dateBtn: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.base,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateBtnChevron: {
    color: colors.textSubtle,
    fontSize: 16,
  },
  dateBtnMeta: {
    color: colors.primarySoft,
    ...typography.labelSm,
    flex: 1,
    textAlign: "right",
  },
  dateBtnText: {
    color: colors.text,
    ...typography.bodyMd,
  },
  error: {
    color: colors.danger,
    ...typography.labelMd,
  },
  eyebrow: {
    color: colors.primary,
    ...typography.labelSm,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  field: {
    gap: spacing.xs,
  },
  formCard: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  glowOrb: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 180,
    opacity: 0.12,
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
  label: {
    color: colors.textMuted,
    ...typography.labelSm,
    textTransform: "uppercase",
  },
  subtitle: {
    color: colors.textSubtle,
    ...typography.bodyMd,
    marginTop: spacing.sm,
  },
  textArea: {
    minHeight: 124,
  },
  title: {
    color: colors.text,
    ...typography.headlineLg,
    marginTop: spacing.xs,
  },
  typePill: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  typePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typePillText: {
    color: colors.textMuted,
    ...typography.labelSm,
  },
  typePillTextActive: {
    color: colors.primaryText,
    fontWeight: "700",
  },
  typeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
