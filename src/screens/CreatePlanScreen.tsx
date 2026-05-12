import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/theme/theme";

export type CreatePlanInput = {
  name: string;
  description: string;
};

type CreatePlanScreenProps = {
  initialValues?: CreatePlanInput;
  mode?: "create" | "edit";
  onCancel: () => void;
  onSubmit: (input: CreatePlanInput) => void;
};

export function CreatePlanScreen({
  initialValues,
  mode = "create",
  onCancel,
  onSubmit,
}: CreatePlanScreenProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [error, setError] = useState("");
  const isEditing = mode === "edit";

  function handleSubmit() {
    if (!name.trim() || !description.trim()) {
      setError("Preencha nome e descricao.");
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
    });
  }

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

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label={isEditing ? "Salvar alteracoes" : "Criar plano"}
          onPress={handleSubmit}
        />
        <PrimaryButton label="Cancelar" onPress={onCancel} variant="secondary" />
      </View>
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
});
