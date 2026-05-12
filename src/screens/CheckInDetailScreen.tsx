import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "@/theme/theme";
import { CheckIn, CheckInMedication, Plan } from "@/types/domain";

type CheckInDetailScreenProps = {
  checkIn: CheckIn;
  medications: CheckInMedication[];
  onBack: () => void;
  plan: Plan | undefined;
};

function formatCompletedAt(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d}/${m}/${y}`;
}

export function CheckInDetailScreen({
  checkIn,
  medications,
  onBack,
  plan,
}: CheckInDetailScreenProps) {
  const isCompleted = checkIn.status === "completed";

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.glowOrb} />

      <View style={styles.topBar}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onBack}
          style={styles.navChip}
        >
          <Text style={styles.navChipText}>← Voltar</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text style={styles.eyebrow}>{formatDate(checkIn.date)}</Text>
        <Text style={styles.title}>{checkIn.scheduledTime}</Text>
        <Text style={styles.subtitle}>{plan?.name ?? "Plano removido"}</Text>
      </View>

      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusBadge,
            isCompleted ? styles.statusDone : styles.statusMissed,
          ]}
        >
          <Text style={styles.statusText}>
            {isCompleted
              ? "Concluido"
              : checkIn.status === "missed"
                ? "Perdido"
                : "Pendente"}
          </Text>
        </View>
        {isCompleted && checkIn.completedAt && (
          <Text style={styles.completedAt}>
            registrado as {formatCompletedAt(checkIn.completedAt)}
          </Text>
        )}
      </View>

      {medications.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Remedios</Text>
          {medications.map((med) => (
            <View key={med.id} style={styles.medRow}>
              <View style={styles.medDot} />
              <View style={styles.medInfo}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medMeta}>
                  {med.dosage} · {med.quantity}x
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {isCompleted && checkIn.photoUri ? (
        <View style={styles.photoCard}>
          <Text style={styles.cardLabel}>Foto do check-in</Text>
          <Image
            resizeMode="cover"
            source={{ uri: checkIn.photoUri }}
            style={styles.photo}
          />
        </View>
      ) : isCompleted ? (
        <View style={styles.card}>
          <Text style={styles.emptyPhoto}>Sem foto registrada.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  cardLabel: {
    color: colors.textSubtle,
    ...typography.labelSm,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  completedAt: {
    color: colors.textSubtle,
    ...typography.labelMd,
  },
  content: {
    gap: spacing.lg,
    overflow: "hidden",
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyPhoto: {
    color: colors.textSubtle,
    ...typography.bodyMd,
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
    opacity: 0.12,
    position: "absolute",
    right: -80,
    top: -40,
    width: 180,
  },
  medDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 8,
    marginTop: 6,
    width: 8,
  },
  medInfo: {
    flex: 1,
    gap: 2,
  },
  medMeta: {
    color: colors.textSubtle,
    ...typography.labelMd,
  },
  medName: {
    color: colors.text,
    ...typography.bodyMd,
    fontWeight: "600",
  },
  medRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
  navChip: {
    alignSelf: "flex-start",
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  navChipText: {
    color: colors.textMuted,
    ...typography.labelSm,
  },
  photo: {
    borderRadius: radius.lg,
    height: 280,
    width: "100%",
  },
  photoCard: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    overflow: "hidden",
    padding: spacing.lg,
  },
  statusBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusDone: {
    backgroundColor: colors.success,
  },
  statusMissed: {
    backgroundColor: colors.danger,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  statusText: {
    color: colors.primaryText,
    ...typography.labelSm,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textMuted,
    ...typography.bodyLg,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 72,
    fontWeight: "700",
    letterSpacing: -1.44,
    lineHeight: 80,
    marginTop: spacing.xs,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
  },
});
