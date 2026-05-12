import { ScrollView, StyleSheet, Text, View } from "react-native";

import { MetricCard } from "@/components/MetricCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/theme/theme";
import { MedicationDose, Plan } from "@/types/domain";

type HomeScreenProps = {
  nextPlan: Plan | null;
  doses: MedicationDose[];
  onStartCheckIn: () => void;
  scheduledTime: string;
};

export function HomeScreen({ nextPlan, doses, onStartCheckIn, scheduledTime }: HomeScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.glowOrb} />
      <View>
        <Text style={styles.eyebrow}>Proximo check-in</Text>
        <Text style={styles.title}>
          {nextPlan ? `Hoje, ${scheduledTime}` : "Sem planos ativos"}
        </Text>
        <Text style={styles.subtitle}>
          {nextPlan
            ? "Um ritual rapido para manter sua sequencia."
            : "Crie um plano de tratamento para comecar."}
        </Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.planName}>{nextPlan ? nextPlan.name : "Nenhum plano"}</Text>
            <Text style={styles.planTime}>{nextPlan ? scheduledTime : "--:--"}</Text>
          </View>
        </View>

        <View style={styles.doseList}>
          {doses.map((dose) => (
            <View key={dose.id} style={styles.dosePill}>
              <View style={styles.doseDot} />
              <Text style={styles.dose}>
                {dose.name} - {dose.quantity} {dose.type}
              </Text>
            </View>
          ))}
        </View>

        <PrimaryButton
          label={nextPlan ? "Fazer check-in" : "Criar plano"}
          onPress={onStartCheckIn}
        />
      </View>

      <View style={styles.metrics}>
        <MetricCard label="Concluidos hoje" value="1/3" />
        <MetricCard label="Sequencia atual" value="4 dias" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ultimos check-ins</Text>
        <View style={styles.historyItem}>
          <Text style={styles.historyLine}>08:00 - concluido com foto</Text>
          <Text style={styles.historyStatus}>Completo</Text>
        </View>
        <View style={styles.historyItem}>
          <Text style={styles.historyLineMuted}>14:00 - aguardando</Text>
          <Text style={styles.historyStatusMuted}>Pendente</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    overflow: "hidden",
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  dose: {
    color: colors.text,
    ...typography.bodyMd,
    fontWeight: "600",
  },
  doseDot: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    height: 8,
    width: 8,
  },
  dosePill: {
    alignItems: "center",
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  doseList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  eyebrow: {
    color: colors.primary,
    ...typography.labelSm,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  glowOrb: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 180,
    opacity: 0.16,
    position: "absolute",
    right: -80,
    top: -60,
    width: 180,
  },
  heroCard: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  heroHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  historyItem: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  historyLine: {
    color: colors.text,
    ...typography.bodyMd,
    fontWeight: "600",
  },
  historyLineMuted: {
    color: colors.textSubtle,
    ...typography.bodyMd,
    fontWeight: "600",
  },
  historyStatus: {
    color: colors.success,
    ...typography.labelSm,
    textTransform: "uppercase",
  },
  historyStatusMuted: {
    color: colors.textSubtle,
    ...typography.labelSm,
    textTransform: "uppercase",
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.md,
  },
  planName: {
    color: colors.textMuted,
    ...typography.headlineSm,
  },
  planTime: {
    color: colors.text,
    fontSize: 64,
    fontWeight: "700",
    letterSpacing: -1.28,
    lineHeight: 72,
  },
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    ...typography.headlineSm,
    marginBottom: spacing.md,
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
