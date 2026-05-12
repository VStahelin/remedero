import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/theme/theme";
import { Medication } from "@/types/domain";

type MedicationCatalogScreenProps = {
  medications: Medication[];
  onAdd: () => void;
  onBack: () => void;
  onDelete: (id: string) => void;
  onEdit: (medication: Medication) => void;
};

export function MedicationCatalogScreen({
  medications,
  onAdd,
  onBack,
  onDelete,
  onEdit,
}: MedicationCatalogScreenProps) {
  function confirmDelete(med: Medication) {
    Alert.alert(
      "Remover remedio",
      `Remover "${med.name}" do catalogo?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => onDelete(med.id) },
      ],
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.glowOrb} />

      <View style={styles.topBar}>
        <TouchableOpacity accessibilityRole="button" onPress={onBack} style={styles.navChip}>
          <Text style={styles.navChipText}>← Voltar</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text style={styles.title}>Catalogo</Text>
        <Text style={styles.subtitle}>Remedios salvos para uso rapido nos registros e planos.</Text>
      </View>

      <PrimaryButton label="+ Novo remedio" onPress={onAdd} />

      {medications.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum remedio no catalogo ainda.</Text>
      ) : (
        <View style={styles.list}>
          {medications.map((med) => (
            <View key={med.id} style={styles.card}>
              <View style={styles.cardBody}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medMeta}>
                  {med.dosage} · {med.type}
                </Text>
                {med.description ? (
                  <Text numberOfLines={2} style={styles.medDesc}>{med.description}</Text>
                ) : null}
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => onEdit(med)}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionBtnText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => confirmDelete(med)}
                  style={[styles.actionBtn, styles.actionBtnDanger]}
                >
                  <Text style={styles.actionBtnDangerText}>Remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actionBtn: {
    backgroundColor: colors.surfaceBright,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  actionBtnDanger: {
    backgroundColor: "transparent",
  },
  actionBtnDangerText: {
    color: colors.danger,
    ...typography.labelSm,
    opacity: 0.8,
  },
  actionBtnText: {
    color: colors.primarySoft,
    ...typography.labelSm,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  cardActions: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  cardBody: {
    gap: spacing.xs,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyText: {
    color: colors.textSubtle,
    ...typography.bodyMd,
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
  list: {
    gap: spacing.sm,
  },
  medDesc: {
    color: colors.textSubtle,
    ...typography.labelSm,
    marginTop: spacing.xs,
  },
  medMeta: {
    color: colors.textSubtle,
    ...typography.labelMd,
  },
  medName: {
    color: colors.text,
    ...typography.headlineSm,
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
