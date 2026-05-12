import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/theme/theme";

type SettingsScreenProps = {
  onExport: () => void;
  onImport: () => void;
  onOpenCatalog: () => void;
};

export function SettingsScreen({ onExport, onImport, onOpenCatalog }: SettingsScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.glowOrb} />
      <View>
        <Text style={styles.eyebrow}>Config</Text>
        <Text style={styles.title}>Dados locais</Text>
        <Text style={styles.subtitle}>Controle e portabilidade sem servidor.</Text>
      </View>

      <TouchableOpacity accessibilityRole="button" onPress={onOpenCatalog} style={styles.card}>
        <Text style={styles.cardTitle}>Catalogo de remedios</Text>
        <Text style={styles.cardText}>
          Gerencie sua lista de remedios para uso rapido em registros avulsos e planos.
        </Text>
        <Text style={styles.cardAction}>Ver catalogo →</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Exportar backup</Text>
        <Text style={styles.cardText}>
          Gera um arquivo ZIP com todos os dados e as fotos dos check-ins.
        </Text>
        <PrimaryButton label="Exportar ZIP" onPress={onExport} variant="secondary" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Importar backup</Text>
        <Text style={styles.cardText}>
          Restaura um backup ZIP com dados e fotos. Todos os dados atuais serao substituidos.
        </Text>
        <PrimaryButton label="Importar ZIP" onPress={onImport} variant="secondary" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  cardAction: {
    color: colors.primarySoft,
    ...typography.labelMd,
  },
  cardText: {
    color: colors.textSubtle,
    ...typography.bodyMd,
  },
  cardTitle: {
    color: colors.text,
    ...typography.headlineMd,
  },
  content: {
    gap: spacing.lg,
    overflow: "hidden",
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  eyebrow: {
    color: colors.primary,
    ...typography.labelSm,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  glowOrb: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    height: 180,
    opacity: 0.12,
    position: "absolute",
    right: -80,
    top: -60,
    width: 180,
  },
  subtitle: {
    color: colors.textSubtle,
    ...typography.bodyMd,
    marginTop: spacing.sm,
  },
  title: {
    color: colors.text,
    ...typography.headlineLg,
    marginTop: spacing.xs,
  },
});
