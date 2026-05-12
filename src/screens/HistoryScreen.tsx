import { ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme/theme";
import { CheckIn, MedicationDose, Plan } from "@/types/domain";

type HistoryScreenProps = {
  checkIns: CheckIn[];
  getDosesForCheckIn: (planId: string, scheduledTime: string) => MedicationDose[];
  plans: Plan[];
};

type DayStatus = "completed" | "missed" | "none" | "partial";

const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];
const monthNames = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCalendarDays(referenceDate: Date): Array<number | null> {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
}

function getDayStatus(checkIns: CheckIn[], date: string): DayStatus {
  const entries = checkIns.filter((checkIn) => checkIn.date === date);

  if (entries.length === 0) {
    return "none";
  }

  if (entries.every((checkIn) => checkIn.status === "completed")) {
    return "completed";
  }

  if (entries.every((checkIn) => checkIn.status === "missed")) {
    return "missed";
  }

  return "partial";
}

function formatCompletedAt(completedAt: string): string {
  if (completedAt.includes("T")) {
    const date = new Date(completedAt);
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");

    return `${h}:${m}`;
  }

  return completedAt;
}

function getStatusLabel(checkIn: CheckIn): string {
  if (checkIn.status === "completed" && checkIn.completedAt) {
    return `Concluido as ${formatCompletedAt(checkIn.completedAt)}`;
  }

  if (checkIn.status === "missed") {
    return "Perdido";
  }

  return "Aguardando check-in";
}

export function HistoryScreen({ checkIns, getDosesForCheckIn, plans }: HistoryScreenProps) {
  const today = new Date();
  const todayKey = formatDate(today);
  const todayCheckIns = checkIns.filter((checkIn) => checkIn.date === todayKey);
  const calendarDays = getCalendarDays(today);
  const monthLabel = `${monthNames[today.getMonth()]} ${today.getFullYear()}`;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View>
        <Text style={styles.eyebrow}>Historico</Text>
        <Text style={styles.title}>Hoje</Text>
        <Text style={styles.subtitle}>Tiles de hoje e consistencia do mes atual.</Text>
      </View>

      {todayCheckIns.map((checkIn) => {
        const plan = plans.find((item) => item.id === checkIn.planId);
        const doses = getDosesForCheckIn(checkIn.planId, checkIn.scheduledTime);
        const isCompleted = checkIn.status === "completed";
        const isMissed = checkIn.status === "missed";

        return (
          <View key={checkIn.id} style={styles.row}>
            <View
              style={[
                styles.statusDot,
                isCompleted ? styles.success : isMissed ? styles.danger : styles.pending,
              ]}
            />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>
                {checkIn.scheduledTime} - {plan?.name ?? "Plano"}
              </Text>
              <Text style={styles.rowMeta}>{getStatusLabel(checkIn)}</Text>
              <Text numberOfLines={1} style={styles.doseMeta}>
                {doses.map((dose) => dose.name).join(", ")}
              </Text>
            </View>
          </View>
        );
      })}

      <View style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <Text style={styles.sectionTitle}>Calendario</Text>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
        </View>

        <View style={styles.weekHeader}>
          {weekdays.map((weekday, index) => (
            <Text key={`${weekday}-${index}`} style={styles.weekday}>
              {weekday}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => {
            if (!day) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const date = formatDate(new Date(today.getFullYear(), today.getMonth(), day));
            const status = getDayStatus(checkIns, date);
            const isToday = date === todayKey;

            return (
              <View key={date} style={styles.dayCell}>
                <View style={[styles.dayNumberWrap, isToday && styles.todayWrap]}>
                  <Text style={[styles.dayNumber, isToday && styles.todayText]}>{day}</Text>
                </View>
                {status !== "none" ? (
                  <View
                    style={[
                      styles.calendarDot,
                      status === "completed"
                        ? styles.success
                        : status === "missed"
                          ? styles.danger
                          : styles.partial,
                    ]}
                  />
                ) : null}
              </View>
            );
          })}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.success]} />
            <Text style={styles.legendText}>Tudo tomado</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.danger]} />
            <Text style={styles.legendText}>Nada tomado</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.partial]} />
            <Text style={styles.legendText}>Faltou algum</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.emptyLegendDot} />
            <Text style={styles.legendText}>Sem plano</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  calendarDot: {
    borderRadius: radius.full,
    height: 7,
    marginTop: spacing.xs,
    width: 7,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: spacing.sm,
  },
  calendarHeader: {
    alignItems: "flex-start",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  content: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  dayCell: {
    alignItems: "center",
    flexBasis: "14.285%",
    minHeight: 48,
  },
  dayNumber: {
    color: colors.textMuted,
    ...typography.labelMd,
  },
  dayNumberWrap: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  doseMeta: {
    color: colors.textSubtle,
    ...typography.labelSm,
    marginTop: spacing.xs,
  },
  emptyLegendDot: {
    borderColor: colors.borderMuted,
    borderRadius: radius.full,
    borderWidth: 1,
    height: 8,
    width: 8,
  },
  eyebrow: {
    color: colors.primary,
    ...typography.labelSm,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  legendDot: {
    borderRadius: radius.full,
    height: 8,
    width: 8,
  },
  legendItem: {
    alignItems: "center",
    backgroundColor: colors.glass,
    borderRadius: radius.full,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  legendText: {
    color: colors.textMuted,
    ...typography.labelSm,
  },
  monthLabel: {
    color: colors.textSubtle,
    ...typography.labelMd,
    textTransform: "capitalize",
  },
  partial: {
    backgroundColor: colors.warning,
  },
  pending: {
    backgroundColor: colors.warning,
  },
  row: {
    alignItems: "center",
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
  },
  rowContent: {
    flex: 1,
  },
  rowMeta: {
    color: colors.textSubtle,
    ...typography.labelMd,
    marginTop: spacing.xs,
  },
  rowTitle: {
    color: colors.text,
    ...typography.headlineSm,
  },
  sectionTitle: {
    color: colors.text,
    ...typography.headlineSm,
  },
  statusDot: {
    borderRadius: 999,
    height: 14,
    width: 14,
  },
  success: {
    backgroundColor: colors.success,
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
  todayText: {
    color: colors.primaryText,
    fontWeight: "700",
  },
  todayWrap: {
    backgroundColor: colors.primary,
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  weekday: {
    color: colors.textSubtle,
    flexBasis: "14.285%",
    textAlign: "center",
    ...typography.labelSm,
  },
});
