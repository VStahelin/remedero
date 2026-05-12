import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme/theme";

type AlarmScreenProps = {
  planName: string;
  scheduledTime: string;
  onRegister: () => void;
  onSnooze: () => void;
};

export function AlarmScreen({ planName, scheduledTime, onRegister, onSnooze }: AlarmScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Hora do check-in</Text>
        <Text style={styles.time}>{scheduledTime}</Text>
        <Text style={styles.planName}>{planName}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={onRegister}
          style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>Registrar agora</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onSnooze}
          style={({ pressed }) => [styles.button, styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryButtonText}>Snooze 10min</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    width: "100%",
  },
  button: {
    alignItems: "center",
    borderRadius: radius.full,
    minHeight: 56,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "space-between",
    paddingTop: spacing.xxl,
  },
  content: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  label: {
    ...typography.bodyMd,
    color: colors.textSubtle,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  planName: {
    ...typography.headlineMd,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.75,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    ...typography.labelMd,
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: colors.surfaceBright,
    borderColor: colors.border,
    borderWidth: 1,
  },
  secondaryButtonText: {
    ...typography.labelMd,
    color: colors.textMuted,
    fontSize: 16,
  },
  time: {
    ...typography.display,
    color: colors.text,
    fontSize: 72,
    letterSpacing: -2,
    lineHeight: 80,
  },
});
