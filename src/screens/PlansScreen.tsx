import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/theme/theme";
import { Plan } from "@/types/domain";

type PlansScreenProps = {
  plans: Plan[];
  getMedicationCount: (planId: string) => number;
  getNextTime: (planId: string) => string;
  getScheduleCount: (planId: string) => number;
  onCreatePlan: () => void;
  onOpenPlan: (planId: string) => void;
};

export function PlansScreen({
  plans,
  getMedicationCount,
  getNextTime,
  getScheduleCount,
  onCreatePlan,
  onOpenPlan,
}: PlansScreenProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.blueOrb} />
      <View>
        <Text style={styles.eyebrow}>Planos</Text>
        <Text style={styles.title}>Tratamentos</Text>
        <Text style={styles.subtitle}>
          Crie planos com descricao, medicamentos e horarios de check-in.
        </Text>
      </View>

      <PrimaryButton label="Criar novo plano" onPress={onCreatePlan} />

      {plans.map((plan) => (
        <Pressable
          key={plan.id}
          accessibilityRole="button"
          onPress={() => onOpenPlan(plan.id)}
          style={({ pressed }) => [styles.card, pressed && styles.pressedCard]}
        >
          <View style={styles.planContent}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text numberOfLines={2} style={styles.description}>
              {plan.description}
            </Text>
            <Text style={styles.planMeta}>
              {getMedicationCount(plan.id)} medicamentos -{" "}
              {getScheduleCount(plan.id)} horarios
            </Text>
          </View>
          <View style={styles.timePill}>
            <Text style={styles.time}>{getNextTime(plan.id)}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "flex-start",
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  blueOrb: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    height: 160,
    left: -90,
    opacity: 0.12,
    position: "absolute",
    top: 120,
    width: 160,
  },
  content: {
    gap: spacing.md,
    overflow: "hidden",
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyAction: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.textSubtle,
    ...typography.bodyMd,
    marginTop: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    ...typography.headlineSm,
  },
  eyebrow: {
    color: colors.primary,
    ...typography.labelSm,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  planMeta: {
    color: colors.textSubtle,
    ...typography.labelMd,
    marginTop: spacing.xs,
  },
  description: {
    color: colors.textSubtle,
    ...typography.bodyMd,
    marginTop: spacing.xs,
  },
  planContent: {
    flex: 1,
    paddingRight: spacing.md,
  },
  planName: {
    color: colors.text,
    ...typography.headlineMd,
  },
  pressedCard: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  subtitle: {
    color: colors.textSubtle,
    ...typography.bodyMd,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  time: {
    color: colors.text,
    ...typography.labelMd,
    fontWeight: "700",
  },
  timePill: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primary,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    color: colors.text,
    ...typography.headlineLg,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
});
