import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { MetricCard } from "@/components/MetricCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/theme/theme";
import { MedicationDose, Plan } from "@/types/domain";

type TodayEntry = {
  checkInId: string | null;
  planName: string;
  scheduledTime: string;
  status: "completed" | "pending" | "missed";
};

type PlanProgress = {
  completionRate: number;
  progressPercent: number | null;
  daysElapsed: number;
  totalDays: number | null;
};

type HomeScreenProps = {
  doses: MedicationDose[];
  nextPlan: Plan | null;
  nextPlanProgress: PlanProgress | null;
  onAddMood: () => void;
  onOpenCheckIn: (checkInId: string) => void;
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
  nextPlanProgress,
  onAddMood,
  onOpenCheckIn,
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
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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
              {nextPlan
                ? nextPlan.name
                : allDoneToday
                  ? "Ate amanha!"
                  : "Nenhum plano"}
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

        {nextPlanProgress && (
          <View style={styles.progressBlock}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Adesao</Text>
              <Text style={styles.progressValue}>{nextPlanProgress.completionRate}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${nextPlanProgress.completionRate}%` }]} />
            </View>

            {nextPlanProgress.totalDays != null && (
              <>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Progresso</Text>
                  <Text style={styles.progressValue}>
                    {nextPlanProgress.progressPercent}%
                    {"  "}
                    <Text style={styles.progressMeta}>
                      dia {Math.min(nextPlanProgress.daysElapsed + 1, nextPlanProgress.totalDays)}/{nextPlanProgress.totalDays}
                    </Text>
                  </Text>
                </View>
                <View style={styles.track}>
                  <View
                    style={[styles.fillGreen, { width: `${nextPlanProgress.progressPercent}%` }]}
                  />
                </View>
              </>
            )}
          </View>
        )}

        <PrimaryButton
          label={
            !hasPlans
              ? "Criar plano"
              : allDoneToday
                ? "Ver planos"
                : "Fazer check-in"
          }
          onPress={onStartCheckIn}
        />
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onQuickLog}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>+ Remedio avulso</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onAddMood}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>+ Sentimento</Text>
          </TouchableOpacity>
        </View>
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
            <TouchableOpacity
              key={`${entry.planName}-${entry.scheduledTime}-${i}`}
              accessibilityRole="button"
              disabled={!entry.checkInId}
              onPress={() => entry.checkInId && onOpenCheckIn(entry.checkInId)}
              style={styles.historyItem}
            >
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                style={
                  entry.status === "completed"
                    ? styles.historyLine
                    : styles.historyLineMuted
                }
              >
                {entry.scheduledTime} · {entry.planName}
              </Text>
              <View style={styles.historyRight}>
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
                {entry.checkInId && (
                  <Text style={styles.historyChevron}>›</Text>
                )}
              </View>
            </TouchableOpacity>
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
  fill: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: "100%",
  },
  fillGreen: {
    backgroundColor: colors.success,
    borderRadius: radius.full,
    height: "100%",
  },
  progressBlock: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  progressLabel: {
    color: colors.textSubtle,
    ...typography.labelSm,
    textTransform: "uppercase",
  },
  progressMeta: {
    color: colors.textSubtle,
    ...typography.labelSm,
    fontWeight: "400",
  },
  progressRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  progressValue: {
    color: colors.textMuted,
    ...typography.labelSm,
    fontWeight: "700",
  },
  track: {
    backgroundColor: colors.surfaceBright,
    borderRadius: radius.full,
    height: 4,
    overflow: "hidden",
    width: "100%",
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
  historyChevron: {
    color: colors.textSubtle,
    fontSize: 18,
    lineHeight: 20,
  },
  historyItem: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  historyRight: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: spacing.xs,
  },
  historyLine: {
    color: colors.text,
    ...typography.bodyMd,
    flex: 1,
    fontWeight: "600",
    marginRight: spacing.sm,
  },
  historyLineMuted: {
    color: colors.textSubtle,
    ...typography.bodyMd,
    flex: 1,
    fontWeight: "600",
    marginRight: spacing.sm,
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
  secondaryActions: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  secondaryBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  secondaryBtnText: {
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
