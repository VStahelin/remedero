import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme/theme";

type MetricCardProps = {
  label: string;
  value: string;
};

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    padding: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    ...typography.labelSm,
    marginTop: spacing.xs,
  },
  value: {
    color: colors.primarySoft,
    ...typography.headlineMd,
  },
});
