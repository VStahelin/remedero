import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { MetricCard } from "@/components/MetricCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/theme/theme";
import { MedicationDose, Plan } from "@/types/domain";

type TodayEntry = {
  planName: string;
  scheduledTime: string;
  status: "completed" | "pending" | "missed";
};

type HomeScreenProps = {
  doses: MedicationDose[];
  nextPlan: Plan | null;
  onQuickLog: () => void;
  onStartCheckIn: () => void;
  scheduledTime: string;
  todayCompleted: number;
  todayEntries: TodayEntry[];
  todayTotal: number;
};

export function HomeScreen({
  doses,
  nextPlan,
  onQuickLog,
  onStartCheckIn,
  scheduledTime,
  todayCompleted,
  todayEntries,
  todayTotal,
}: HomeScreenProps) {
  const allDoneToday = todayTotal > 0 && todayCompleted === todayTotal;
  const hasPlans = todayTotal > 0 || nextPlan !== null;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.glowOrb} />
      <View>
        <Text style={styles.eyebrow}>
          {allDoneToday ? "Dia concluido" : "Proximo check-in"}
        </Text>
        <Text style={styles.title}>
          {!hasPlans
            ? "Sem planos"
            : allDoneToday
              ? "Tudo feito!"
              : scheduledTime}
        </Text>
        <Text style={styles.subtitle}>
          {!hasPlans
            ? "Crie um plano de tratamento para comecar."
            : allDoneToday
              ? "Todos os check-ins do dia foram concluidos."
              : "Um ritual rapido para manter sua sequencia."}
        </Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.planName}>
              {nextPlan ? nextPlan.name : allDoneToday ? "Ate amanha!" : "Nenhum plano"}
            </Text>
            <Text style={styles.planTime}>
              {allDoneToday ? "✓" : nextPlan ? scheduledTime : "--:--"}
            </Text>
          </View>
        </View>

        {doses.length > 0 && (
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
        )}

        <PrimaryButton
          label={!hasPlans ? "Criar plano" : allDoneToday ? "Ver planos" : "Fazer check-in"}
          onPress={onStartCheckIn}
        />
        <TouchableOpacity accessibilityRole="button" onPress={onQuickLog} style={styles.quickLogBtn}>
          <Text style={styles.quickLogText}>+ Registrar remedio avulso</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metrics}>
        <MetricCard
          label="Concluidos hoje"
          value={todayTotal === 0 ? "--" : `${todayCompleted}/${todayTotal}`}
        />
        <MetricCard
          label="Agendados hoje"
          value={String(todayTotal === 0 ? "--" : todayTotal)}
        />
      </View>

      {todayEntries.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check-ins de hoje</Text>
          {todayEntries.map((entry, i) => (
            <View key={`${entry.planName}-${entry.scheduledTime}-${i}`} style={styles.historyItem}>
              <View>
                <Text style={entry.status === "completed" ? styles.historyLine : styles.historyLineMuted}>
                  {entry.scheduledTime} · {entry.planName}
                </Text>
              </View>
              <Text
                style={
                  entry.status === "completed"
                    ? styles.historyStatus
                    : entry.status === "missed"
                      ? styles.historyStatusDanger
                      : styles.historyStatusMuted
                }
              >
                {entry.status === "completed"
                  ? "Completo"
                  : entry.status === "missed"
                    ? "Perdido"
                    : "Pendente"}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
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
  historyStatusDanger: {
    color: colors.danger,
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
  quickLogBtn: {
    alignItems: "center",
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  quickLogText: {
    color: colors.primarySoft,
    ...typography.labelMd,
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
