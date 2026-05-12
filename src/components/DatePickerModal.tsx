import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme/theme";

export type DatePickerModalProps = {
  onCancel: () => void;
  onConfirm: (date: string) => void;
  value: string; // "YYYY-MM-DD"
  visible: boolean;
};

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const MONTHS_SHORT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];
const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

type DayCell = { date: string; day: number; current: boolean };

function buildCalendar(year: number, month: number): DayCell[][] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: DayCell[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    cells.push({
      date: `${py}-${String(pm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      day: d,
      current: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      day: d,
      current: true,
    });
  }

  const rem = cells.length % 7;
  if (rem !== 0) {
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    for (let d = 1; d <= 7 - rem; d++) {
      cells.push({
        date: `${ny}-${String(nm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        day: d,
        current: false,
      });
    }
  }

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function DatePickerModal({ onCancel, onConfirm, value, visible }: DatePickerModalProps) {
  const [selected, setSelected] = useState(value);
  const [viewYear, setViewYear] = useState(0);
  const [viewMonth, setViewMonth] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (visible) {
      setSelected(value);
      const [y, m] = value.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    }
  }, [visible, value]);

  const calendar = buildCalendar(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const [sy, sm, sd] = selected.split("-").map(Number);

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <TouchableOpacity activeOpacity={1} onPress={onCancel} style={styles.overlay}>
        <TouchableOpacity activeOpacity={1} style={styles.card}>

          {/* Header */}
          <Text style={styles.headerDate}>
            {sd} {MONTHS_SHORT[sm - 1]} {sy}
          </Text>

          {/* Month navigation */}
          <View style={styles.monthRow}>
            <TouchableOpacity accessibilityRole="button" onPress={prevMonth} style={styles.navBtn}>
              <Text style={styles.navArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
            <TouchableOpacity accessibilityRole="button" onPress={nextMonth} style={styles.navBtn}>
              <Text style={styles.navArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Weekday headers */}
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((d, i) => (
              <Text key={i} style={styles.weekdayLabel}>{d}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          {calendar.map((week, wi) => (
            <View key={wi} style={styles.week}>
              {week.map((cell, di) => {
                const isSel = cell.date === selected;
                const isToday = cell.date === today;
                return (
                  <TouchableOpacity
                    key={di}
                    accessibilityRole="button"
                    onPress={() => {
                      setSelected(cell.date);
                      if (!cell.current) {
                        const [cy, cm] = cell.date.split("-").map(Number);
                        setViewYear(cy);
                        setViewMonth(cm - 1);
                      }
                    }}
                    style={styles.dayCell}
                  >
                    <View style={[
                      styles.dayInner,
                      isSel && styles.dayInnerSelected,
                      !isSel && isToday && styles.dayInnerToday,
                    ]}>
                      <Text style={[
                        styles.dayText,
                        !cell.current && styles.dayTextOther,
                        isSel && styles.dayTextSelected,
                        !isSel && isToday && styles.dayTextToday,
                      ]}>
                        {cell.day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity accessibilityRole="button" onPress={onCancel} style={styles.footerBtn}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => onConfirm(selected)}
              style={styles.footerBtn}
            >
              <Text style={styles.confirmText}>OK</Text>
            </TouchableOpacity>
          </View>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const CELL = 38;

const styles = StyleSheet.create({
  cancelText: {
    color: colors.textMuted,
    ...typography.labelMd,
  },
  card: {
    backgroundColor: colors.surfaceDim,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    width: "100%",
  },
  confirmText: {
    color: colors.primarySoft,
    ...typography.labelMd,
    fontWeight: "700",
  },
  dayCell: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingVertical: 2,
  },
  dayInner: {
    alignItems: "center",
    borderRadius: radius.full,
    height: CELL,
    justifyContent: "center",
    width: CELL,
  },
  dayInnerSelected: {
    backgroundColor: colors.primary,
  },
  dayInnerToday: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  dayText: {
    color: colors.text,
    ...typography.labelMd,
  },
  dayTextOther: {
    color: colors.textSubtle,
    opacity: 0.4,
  },
  dayTextSelected: {
    color: colors.primaryText,
    fontWeight: "700",
  },
  dayTextToday: {
    color: colors.primarySoft,
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  footerBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerDate: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: spacing.md,
  },
  monthLabel: {
    color: colors.textMuted,
    ...typography.labelMd,
    flex: 1,
    textAlign: "center",
  },
  monthRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  navArrow: {
    color: colors.textMuted,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  navBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  overlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.75)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  week: {
    flexDirection: "row",
  },
  weekdayLabel: {
    color: colors.textSubtle,
    flex: 1,
    ...typography.labelSm,
    textAlign: "center",
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
});
