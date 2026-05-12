import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/theme/theme";
import { MedicationDose, Plan } from "@/types/domain";

type CheckInScreenProps = {
  plan: Plan;
  doses: MedicationDose[];
  onCancel: () => void;
  onComplete: (photoUri: string) => Promise<void>;
  scheduledTime: string;
};

export function CheckInScreen({
  plan,
  doses,
  onCancel,
  onComplete,
  scheduledTime,
}: CheckInScreenProps) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permissao necessaria",
        "Precisamos de acesso a camera para confirmar o check-in.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.glowOrb} />
      <View>
        <Text style={styles.eyebrow}>Check-in</Text>
        <Text style={styles.title}>{scheduledTime}</Text>
        <Text style={styles.subtitle}>{plan.name}</Text>
      </View>

      <View style={styles.card}>
        {doses.map((dose) => (
          <View key={dose.id} style={styles.doseRow}>
            <View style={styles.check} />
            <Text style={styles.doseText}>
              {dose.name} - {dose.quantity} {dose.type}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.photoBox}>
        {photoUri ? (
          <Image
            resizeMode="cover"
            source={{ uri: photoUri }}
            style={styles.photoPreview}
          />
        ) : (
          <>
            <Text style={styles.photoTitle}>Foto obrigatoria</Text>
            <Text style={styles.photoText}>
              O check-in so pode ser concluido depois da foto.
            </Text>
          </>
        )}
      </View>

      {!photoUri ? (
        <PrimaryButton label="Tirar foto" onPress={handleTakePhoto} />
      ) : (
        <View style={styles.actions}>
          <PrimaryButton
            disabled={isSubmitting}
            label="Refazer"
            onPress={() => setPhotoUri(null)}
            variant="secondary"
          />
          <PrimaryButton
            disabled={isSubmitting}
            label={isSubmitting ? "Salvando..." : "Confirmar"}
            onPress={async () => {
              setIsSubmitting(true);
              await onComplete(photoUri);
            }}
          />
        </View>
      )}

      <PrimaryButton label="Voltar" onPress={onCancel} variant="secondary" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  check: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 12,
    width: 12,
  },
  content: {
    gap: spacing.lg,
    overflow: "hidden",
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  doseRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  doseText: {
    color: colors.text,
    ...typography.bodyLg,
    fontWeight: "600",
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
    height: 220,
    opacity: 0.14,
    position: "absolute",
    right: -120,
    top: 160,
    width: 220,
  },
  photoBox: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 220,
    overflow: "hidden",
    padding: spacing.lg,
  },
  photoPreview: {
    borderRadius: radius.lg,
    height: 220,
    width: "100%",
  },
  photoText: {
    color: colors.textSubtle,
    ...typography.bodyMd,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  photoTitle: {
    color: colors.text,
    ...typography.headlineMd,
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
});
