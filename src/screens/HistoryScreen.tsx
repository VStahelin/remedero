import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "@/theme/theme";
import {
  CheckIn,
  MedicationDose,
  MoodLog,
  Plan,
  QuickLog,
} from "@/types/domain";

type HistoryScreenProps = {
  checkIns: CheckIn[];
  getDosesForCheckIn: (
    planId: string,
    scheduledTime: string,
  ) => MedicationDose[];
  moodLogs: MoodLog[];
  onAddMood: () => void;
  onOpenCheckIn: (checkInId: string) => void;
  onQuickLog: () => void;
  plans: Plan[];
  quickLogs: QuickLog[];
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

function extractTime(isoOrTime: string): string {
  if (isoOrTime.includes("T")) {
    const d = new Date(isoOrTime);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  return isoOrTime;
}

export function HistoryScreen({
  checkIns,
  getDosesForCheckIn,
  moodLogs,
  onAddMood,
  onOpenCheckIn,
  onQuickLog,
  plans,
  quickLogs,
}: HistoryScreenProps) {
  const today = new Date();
  const todayKey = formatDate(today);
  const todayCheckIns = checkIns.filter((checkIn) => checkIn.date === todayKey);

  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey);

  function toggleSelectedDate(date: string) {
    setSelectedDate((current) => (current === date ? null : date));
  }

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  const calendarDays = getCalendarDays(viewDate);
  const monthLabel = `${monthNames[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={styles.eyebrow}>Historico</Text>
        <Text style={styles.title}>Hoje</Text>
        <Text style={styles.subtitle}>
          Tiles de hoje e consistencia do mes.
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onQuickLog}
            style={styles.actionChip}
          >
            <Text style={styles.actionChipText}>+ Avulso</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onAddMood}
            style={styles.actionChip}
          >
            <Text style={styles.actionChipText}>+ Sentimento</Text>
          </TouchableOpacity>
        </View>
      </View>

      {todayCheckIns.map((checkIn) => {
        const plan = plans.find((item) => item.id === checkIn.planId);
        const doses = getDosesForCheckIn(checkIn.planId, checkIn.scheduledTime);
        const isCompleted = checkIn.status === "completed";
        const isMissed = checkIn.status === "missed";

        return (
          <TouchableOpacity
            key={checkIn.id}
            accessibilityRole="button"
            onPress={() => onOpenCheckIn(checkIn.id)}
            style={styles.row}
          >
            <View
              style={[
                styles.statusDot,
                isCompleted
                  ? styles.success
                  : isMissed
                    ? styles.danger
                    : styles.pending,
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
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
        );
      })}

      <View style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <Text style={styles.sectionTitle}>Calendario</Text>
          <View style={styles.monthNav}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={prevMonth}
              style={styles.monthNavBtn}
            >
              <Text style={styles.monthNavText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={nextMonth}
              style={styles.monthNavBtn}
            >
              <Text style={styles.monthNavText}>›</Text>
            </TouchableOpacity>
          </View>
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

            const date = formatDate(
              new Date(viewDate.getFullYear(), viewDate.getMonth(), day),
            );
            const status = getDayStatus(checkIns, date);
            const isToday = date === todayKey;

            const isSelected = date === selectedDate;

            return (
              <TouchableOpacity
                key={date}
                accessibilityRole="button"
                onPress={() => toggleSelectedDate(date)}
                style={styles.dayCell}
              >
                <View
                  style={[
                    styles.dayNumberWrap,
                    isToday && styles.todayWrap,
                    isSelected && !isToday && styles.selectedWrap,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      (isToday || isSelected) && styles.todayText,
                    ]}
                  >
                    {day}
                  </Text>
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
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedDate &&
          (() => {
            const dayCheckIns = checkIns.filter(
              (ci) => ci.date === selectedDate,
            );
            const dayQuickLogs = quickLogs.filter((ql) =>
              ql.takenAt.startsWith(selectedDate),
            );
            const dayMoodLogs = moodLogs.filter((ml) =>
              ml.createdAt.startsWith(selectedDate),
            );
            const [y, m, d] = selectedDate.split("-").map(Number);
            const label = `${d} de ${monthNames[m - 1]} ${y}`;

            type TimelineItem =
              | { kind: "checkin"; time: string; data: CheckIn }
              | { kind: "quicklog"; time: string; data: QuickLog }
              | { kind: "mood"; time: string; data: MoodLog };

            const timeline: TimelineItem[] = [
              ...dayCheckIns.map((ci) => ({
                kind: "checkin" as const,
                time: ci.completedAt
                  ? extractTime(ci.completedAt)
                  : ci.scheduledTime,
                data: ci,
              })),
              ...dayQuickLogs.map((ql) => ({
                kind: "quicklog" as const,
                time: extractTime(ql.takenAt),
                data: ql,
              })),
              ...dayMoodLogs.map((ml) => ({
                kind: "mood" as const,
                time: extractTime(ml.createdAt),
                data: ml,
              })),
            ].sort((a, b) => a.time.localeCompare(b.time));

            return (
              <View style={styles.dayDetail}>
                <Text style={styles.dayDetailTitle}>{label}</Text>
                {timeline.length === 0 ? (
                  <Text style={styles.dayDetailEmpty}>
                    Nenhum registro neste dia.
                  </Text>
                ) : (
                  timeline.map((item) => {
                    if (item.kind === "checkin") {
                      const ci = item.data;
                      const plan = plans.find((p) => p.id === ci.planId);
                      const doses = getDosesForCheckIn(
                        ci.planId,
                        ci.scheduledTime,
                      );
                      const isCompleted = ci.status === "completed";
                      const isMissed = ci.status === "missed";
                      return (
                        <TouchableOpacity
                          key={ci.id}
                          accessibilityRole="button"
                          onPress={() => onOpenCheckIn(ci.id)}
                          style={styles.dayDetailRow}
                        >
                          <View
                            style={[
                              styles.statusDot,
                              isCompleted
                                ? styles.success
                                : isMissed
                                  ? styles.danger
                                  : styles.pending,
                            ]}
                          />
                          <View style={styles.rowContent}>
                            <Text style={styles.rowTitle}>
                              {item.time} · {plan?.name ?? "Plano"}
                            </Text>
                            <Text style={styles.rowMeta}>
                              {getStatusLabel(ci)}
                            </Text>
                            {doses.length > 0 && (
                              <Text numberOfLines={1} style={styles.doseMeta}>
                                {doses
                                  .map(
                                    (dose) => `${dose.name} ${dose.quantity}x`,
                                  )
                                  .join(", ")}
                              </Text>
                            )}
                          </View>
                          <Text style={styles.rowChevron}>›</Text>
                        </TouchableOpacity>
                      );
                    }

                    if (item.kind === "quicklog") {
                      const ql = item.data;
                      return (
                        <View key={ql.id} style={styles.dayDetailRow}>
                          <View
                            style={[styles.statusDot, styles.quickLogDot]}
                          />
                          <View style={styles.rowContent}>
                            <Text style={styles.rowTitle}>
                              {item.time} · {ql.medicationName}
                            </Text>
                            <Text style={styles.rowMeta}>
                              {ql.dosage} · Avulso
                            </Text>
                            {ql.notes ? (
                              <Text style={styles.doseMeta}>{ql.notes}</Text>
                            ) : null}
                          </View>
                        </View>
                      );
                    }

                    const ml = item.data;
                    const linkedPlan = ml.planId
                      ? plans.find((p) => p.id === ml.planId)
                      : null;
                    return (
                      <View key={ml.id} style={styles.dayDetailRow}>
                        <View style={[styles.statusDot, styles.moodDot]} />
                        <View style={styles.rowContent}>
                          <Text style={styles.rowTitle}>
                            {item.time} · {ml.feeling}
                          </Text>
                          {linkedPlan && (
                            <Text style={styles.rowMeta}>
                              {linkedPlan.name}
                            </Text>
                          )}
                          {ml.text ? (
                            <Text style={styles.doseMeta}>{ml.text}</Text>
                          ) : null}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            );
          })()}

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
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.moodDot]} />
            <Text style={styles.legendText}>Sentimento</Text>
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
    borderRadius: radius.md,
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
  actionChip: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionChipText: {
    color: colors.textMuted,
    ...typography.labelSm,
  },
  headerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  moodDot: {
    backgroundColor: colors.secondary,
    marginTop: 4,
    opacity: 0.9,
  },
  quickLogDot: {
    backgroundColor: colors.secondary,
    marginTop: 4,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  legendDot: {
    borderRadius: radius.full,
    height: 6,
    width: 6,
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  legendText: {
    color: colors.textSubtle,
    fontSize: 11,
    lineHeight: 14,
  },
  monthLabel: {
    color: colors.text,
    ...typography.labelMd,
    textTransform: "capitalize",
  },
  monthNav: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  monthNavBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  monthNavText: {
    color: colors.primary,
    fontSize: 22,
    lineHeight: 24,
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
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
  },
  rowChevron: {
    color: colors.textSubtle,
    fontSize: 20,
    lineHeight: 24,
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
  dayDetail: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  dayDetailEmpty: {
    color: colors.textSubtle,
    ...typography.bodyMd,
  },
  dayDetailRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  dayDetailTitle: {
    color: colors.text,
    ...typography.labelMd,
    textTransform: "capitalize",
  },
  selectedWrap: {
    backgroundColor: colors.surfaceBright,
    borderColor: colors.primary,
    borderWidth: 1,
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
