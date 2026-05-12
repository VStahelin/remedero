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
import { SelectField } from "@/components/SelectField";
import { colors, radius, spacing, typography } from "@/theme/theme";

export type CatalogMedicationInput = {
  name: string;
  dosage: string;
  type: string;
  description: string;
};

type AddCatalogMedicationScreenProps = {
  initialValues?: CatalogMedicationInput;
  mode?: "create" | "edit";
  onCancel: () => void;
  onSubmit: (input: CatalogMedicationInput) => void;
};

const medicationTypeOptions = [
  { label: "Comprimido", value: "comprimido" },
  { label: "Capsula", value: "capsula" },
  { label: "Liquido", value: "liquido" },
  { label: "Injecao", value: "injecao" },
  { label: "Patch", value: "patch" },
  { label: "Outro", value: "outro" },
];

const dosageUnitOptions = ["mg", "g", "ml", "UI", "%"];

function parseDosage(raw: string): { amount: string; unit: string } {
  const match = raw.match(/^([\d.,]+)\s*([a-zA-Z%]+)$/);
  if (match) {
    const unit = dosageUnitOptions.includes(match[2]) ? match[2] : "mg";
    return { amount: match[1], unit };
  }
  return { amount: raw.replace(/[^0-9.,]/g, ""), unit: "mg" };
}

export function AddCatalogMedicationScreen({
  initialValues,
  mode = "create",
  onCancel,
  onSubmit,
}: AddCatalogMedicationScreenProps) {
  const isEditing = mode === "edit";
  const initialDosage = parseDosage(initialValues?.dosage ?? "");

  const [name, setName] = useState(initialValues?.name ?? "");
  const [dosageAmount, setDosageAmount] = useState(initialDosage.amount);
  const [dosageUnit, setDosageUnit] = useState(initialDosage.unit);
  const [type, setType] = useState(
    medicationTypeOptions.some((o) => o.value === initialValues?.type)
      ? initialValues!.type
      : "comprimido",
  );
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name.trim()) {
      setError("Preencha o nome do remedio.");
      return;
    }

    onSubmit({
      name: name.trim(),
      dosage: dosageAmount.trim() ? `${dosageAmount.trim()}${dosageUnit}` : "Sem dosagem",
      type,
      description: description.trim(),
    });
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
        <Text style={styles.title}>{isEditing ? "Editar remedio" : "Novo remedio"}</Text>
        <Text style={styles.subtitle}>
          {isEditing
            ? "Altere as informacoes do remedio no catalogo."
            : "Adicione um remedio ao catalogo para uso rapido."}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            autoFocus={!isEditing}
            onChangeText={setName}
            placeholder="Sertralina, Dipirona..."
            placeholderTextColor={colors.textSubtle}
            style={styles.input}
            value={name}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Dosagem</Text>
          <View style={styles.dosageRow}>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={setDosageAmount}
              placeholder="50"
              placeholderTextColor={colors.textSubtle}
              style={[styles.input, styles.dosageInput]}
              value={dosageAmount}
            />
            <View style={styles.dosageUnit}>
              <SelectField
                onChange={setDosageUnit}
                options={dosageUnitOptions.map((u) => ({ label: u, value: u }))}
                value={dosageUnit}
              />
            </View>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Tipo</Text>
          <SelectField
            onChange={setType}
            options={medicationTypeOptions}
            value={type}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Descricao</Text>
          <TextInput
            multiline
            onChangeText={setDescription}
            placeholder="Observacoes, instrucoes de uso..."
            placeholderTextColor={colors.textSubtle}
            style={[styles.input, styles.inputMultiline]}
            textAlignVertical="top"
            value={description}
          />
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label={isEditing ? "Salvar alteracoes" : "Adicionar ao catalogo"}
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
    gap: spacing.md,
    padding: spacing.lg,
  },
  content: {
    gap: spacing.lg,
    overflow: "hidden",
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  dosageInput: {
    flex: 1,
  },
  dosageRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  dosageUnit: {
    width: 90,
  },
  error: {
    color: colors.danger,
    ...typography.labelMd,
  },
  field: {
    gap: spacing.xs,
  },
  glowOrb: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    height: 180,
    opacity: 0.1,
    position: "absolute",
    right: -80,
    top: 80,
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
    minHeight: 88,
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
