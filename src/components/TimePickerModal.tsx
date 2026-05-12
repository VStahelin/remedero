import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme/theme";

export type TimePickerModalProps = {
  onCancel: () => void;
  onConfirm: (time: string) => void;
  value: string; // "HH:MM"
  visible: boolean;
};

const CLOCK = 280;
const CX = CLOCK / 2;       // 140
const CY = CLOCK / 2;       // 140
const OUTER_R = 108;        // radius for hours 0–11 and minutes
const INNER_R = 68;         // radius for hours 12–23
const NUM = 36;             // touchable number circle diameter
const NUM_INNER = 30;       // smaller inner ring numbers

const OUTER_HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const INNER_HOURS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function angleFor(index: number): number {
  return (index / 12) * 2 * Math.PI;
}

function posAt(index: number, r: number) {
  const a = angleFor(index);
  return { x: CX + Math.sin(a) * r, y: CY - Math.cos(a) * r };
}

export function TimePickerModal({ onCancel, onConfirm, value, visible }: TimePickerModalProps) {
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [mode, setMode] = useState<"hour" | "minute">("hour");

  useEffect(() => {
    if (visible) {
      const [h, m] = value.split(":").map(Number);
      setHour(h);
      setMinute(Math.round(m / 5) * 5 % 60);
      setMode("hour");
    }
  }, [visible, value]);

  function pickHour(h: number) {
    setHour(h);
    setMode("minute");
  }

  function pickMinute(m: number) {
    setMinute(m);
  }

  // Clock hand geometry — line from center to selected position
  const handIndex = mode === "hour" ? hour % 12 : minute / 5;
  const handAngle = angleFor(handIndex);
  const handR = mode === "hour" ? (hour >= 12 ? INNER_R : OUTER_R) : OUTER_R;
  const endX = CX + Math.sin(handAngle) * handR;
  const endY = CY - Math.cos(handAngle) * handR;
  const midX = (CX + endX) / 2;
  const midY = (CY + endY) / 2;

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Time display header */}
          <View style={styles.header}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setMode("hour")}
              style={[styles.headerSeg, mode === "hour" && styles.headerSegActive]}
            >
              <Text style={[styles.headerNum, mode !== "hour" && styles.headerNumDim]}>
                {String(hour).padStart(2, "0")}
              </Text>
            </TouchableOpacity>
            <Text style={styles.headerColon}>:</Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setMode("minute")}
              style={[styles.headerSeg, mode === "minute" && styles.headerSegActive]}
            >
              <Text style={[styles.headerNum, mode !== "minute" && styles.headerNumDim]}>
                {String(minute).padStart(2, "0")}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modeHint}>
            {mode === "hour" ? "hora" : "minutos"}
          </Text>

          {/* Clock face */}
          <View style={styles.clockWrap}>
            {/* Background circle */}
            <View style={styles.clockBg} />

            {/* Hand line */}
            <View style={{
              position: "absolute",
              backgroundColor: colors.primary,
              height: handR,
              left: midX - 1,
              top: midY - handR / 2,
              width: 2,
              transform: [{ rotate: `${handAngle}rad` }],
            }} />

            {/* Center dot */}
            <View style={styles.centerDot} />

            {/* Hour numbers — outer ring (0–11) */}
            {mode === "hour" && OUTER_HOURS.map((h, i) => {
              const p = posAt(i, OUTER_R);
              const sel = hour === h;
              return (
                <TouchableOpacity
                  key={h}
                  accessibilityRole="button"
                  onPress={() => pickHour(h)}
                  style={[
                    styles.numCell,
                    { left: p.x - NUM / 2, top: p.y - NUM / 2 },
                    sel && styles.numCellSel,
                  ]}
                >
                  <Text style={[styles.numText, sel && styles.numTextSel]}>{h}</Text>
                </TouchableOpacity>
              );
            })}

            {/* Hour numbers — inner ring (12–23) */}
            {mode === "hour" && INNER_HOURS.map((h, i) => {
              const p = posAt(i, INNER_R);
              const sel = hour === h;
              return (
                <TouchableOpacity
                  key={h}
                  accessibilityRole="button"
                  onPress={() => pickHour(h)}
                  style={[
                    styles.numCellInner,
                    { left: p.x - NUM_INNER / 2, top: p.y - NUM_INNER / 2 },
                    sel && styles.numCellSel,
                  ]}
                >
                  <Text style={[styles.numTextInner, sel && styles.numTextSel]}>{h}</Text>
                </TouchableOpacity>
              );
            })}

            {/* Minute numbers */}
            {mode === "minute" && MINUTES.map((m, i) => {
              const p = posAt(i, OUTER_R);
              const sel = minute === m;
              return (
                <TouchableOpacity
                  key={m}
                  accessibilityRole="button"
                  onPress={() => pickMinute(m)}
                  style={[
                    styles.numCell,
                    { left: p.x - NUM / 2, top: p.y - NUM / 2 },
                    sel && styles.numCellSel,
                  ]}
                >
                  <Text style={[styles.numText, sel && styles.numTextSel]}>
                    {String(m).padStart(2, "0")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity accessibilityRole="button" onPress={onCancel} style={styles.footerBtn}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() =>
                onConfirm(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`)
              }
              style={styles.footerBtn}
            >
              <Text style={styles.confirmText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cancelText: {
    color: colors.textMuted,
    ...typography.labelMd,
  },
  centerDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 8,
    left: CX - 4,
    position: "absolute",
    top: CY - 4,
    width: 8,
  },
  clockBg: {
    backgroundColor: colors.surfaceBright,
    borderRadius: radius.full,
    height: CLOCK - 20,
    left: 10,
    position: "absolute",
    top: 10,
    width: CLOCK - 20,
  },
  clockWrap: {
    alignSelf: "center",
    height: CLOCK,
    marginVertical: spacing.md,
    width: CLOCK,
  },
  confirmText: {
    color: colors.primarySoft,
    ...typography.labelMd,
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  footerBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: colors.border,
    borderRadius: radius.full,
    height: 4,
    marginBottom: spacing.md,
    width: 40,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  headerColon: {
    color: colors.text,
    fontSize: 48,
    fontWeight: "700",
    lineHeight: 60,
    marginBottom: 6,
  },
  headerNum: {
    color: colors.text,
    fontSize: 48,
    fontWeight: "700",
    letterSpacing: -1,
    lineHeight: 60,
  },
  headerNumDim: {
    opacity: 0.4,
  },
  headerSeg: {
    borderRadius: radius.base,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerSegActive: {
    backgroundColor: colors.primary,
  },
  modeHint: {
    color: colors.textSubtle,
    ...typography.labelSm,
    marginTop: spacing.xs,
    textAlign: "center",
    textTransform: "uppercase",
  },
  numCell: {
    alignItems: "center",
    borderRadius: radius.full,
    height: NUM,
    justifyContent: "center",
    position: "absolute",
    width: NUM,
  },
  numCellInner: {
    alignItems: "center",
    borderRadius: radius.full,
    height: NUM_INNER,
    justifyContent: "center",
    position: "absolute",
    width: NUM_INNER,
  },
  numCellSel: {
    backgroundColor: colors.primary,
  },
  numText: {
    color: colors.text,
    ...typography.labelMd,
    fontWeight: "600",
  },
  numTextInner: {
    color: colors.textSubtle,
    ...typography.labelSm,
    fontWeight: "600",
  },
  numTextSel: {
    color: colors.primaryText,
    fontWeight: "700",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.6)",
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surfaceDim,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
