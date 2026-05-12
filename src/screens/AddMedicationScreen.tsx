import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { SelectField } from "@/components/SelectField";
import { TimePickerModal } from "@/components/TimePickerModal";
import { colors, radius, spacing, typography } from "@/theme/theme";
import { Medication, Plan, Weekday } from "@/types/domain";

export type MedicationScheduleEntry = {
  weekday: Weekday;
  scheduledTime: string;
};

export type AddPlanMedicationInput = {
  medicationId: string;
  quantity: number;
  schedules: MedicationScheduleEntry[];
};

type AddMedicationScreenProps = {
  catalogMedications: Medication[];
  initialValues?: AddPlanMedicationInput;
  mode?: "create" | "edit";
  onCancel: () => void;
  onCreateMedication?: () => void;
  onSubmit: (input: AddPlanMedicationInput) => void;
  plan: Plan;
};

const weekdayOptions: Array<{ label: string; name: string; value: Weekday }> = [
  { label: "D", name: "Domingo", value: 0 },
  { label: "S", name: "Segunda", value: 1 },
  { label: "T", name: "Terca", value: 2 },
  { label: "Q", name: "Quarta", value: 3 },
  { label: "Q", name: "Quinta", value: 4 },
  { label: "S", name: "Sexta", value: 5 },
  { label: "S", name: "Sabado", value: 6 },
];

function buildInitialWeekdays(schedules: MedicationScheduleEntry[]): Weekday[] {
  return Array.from(new Set(schedules.map((s) => s.weekday))).sort(
    (a, b) => a - b,
  ) as Weekday[];
}

function buildInitialTimes(schedules: MedicationScheduleEntry[]): Record<Weekday, string[]> {
  const result: Record<Weekday, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  schedules.forEach((s) => {
    if (!result[s.weekday].includes(s.scheduledTime)) {
      result[s.weekday].push(s.scheduledTime);
    }
  });
  return result;
}

export function AddMedicationScreen({
  catalogMedications,
  initialValues,
  mode = "create",
  onCancel,
  onCreateMedication,
  onSubmit,
  plan,
}: AddMedicationScreenProps) {
  const isEditing = mode === "edit";

  const [selectedMedicationId, setSelectedMedicationId] = useState(initialValues?.medicationId ?? "");
  const [quantity, setQuantity] = useState(String(initialValues?.quantity ?? 1));
  const [selectedWeekdays, setSelectedWeekdays] = useState<Weekday[]>(
    initialValues ? buildInitialWeekdays(initialValues.schedules) : [],
  );
  const [timesByWeekday, setTimesByWeekday] = useState<Record<Weekday, string[]>>(
    initialValues
      ? buildInitialTimes(initialValues.schedules)
      : { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
  );
  const [error, setError] = useState("");

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerWeekday, setPickerWeekday] = useState<Weekday>(0);
  const [pickerTimeStr, setPickerTimeStr] = useState("08:00");

  function toggleWeekday(weekday: Weekday) {
    setSelectedWeekdays((current) =>
      current.includes(weekday)
        ? current.filter((w) => w !== weekday)
        : ([...current, weekday].sort((a, b) => a - b) as Weekday[]),
    );
  }

  function openTimePicker(weekday: Weekday) {
    setPickerWeekday(weekday);
    setPickerTimeStr("08:00");
    setShowTimePicker(true);
  }

  function confirmTime(timeStr: string) {
    setTimesByWeekday((current) => {
      if (current[pickerWeekday].includes(timeStr)) return current;
      return { ...current, [pickerWeekday]: [...current[pickerWeekday], timeStr].sort() };
    });
    setShowTimePicker(false);
  }

  function removeTime(weekday: Weekday, time: string) {
    setTimesByWeekday((current) => ({
      ...current,
      [weekday]: current[weekday].filter((t) => t !== time),
    }));
  }

  function handleSubmit() {
    const parsedQuantity = Number(quantity);

    const schedules = selectedWeekdays.flatMap((weekday) =>
      timesByWeekday[weekday].map((scheduledTime) => ({ scheduledTime, weekday })),
    );

    if (!selectedMedicationId) {
      setError("Selecione um remedio do catalogo.");
      return;
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      setError("Quantidade precisa ser um numero inteiro maior que zero.");
      return;
    }

    if (schedules.length === 0) {
      setError("Selecione pelo menos um dia e adicione ao menos um horario.");
      return;
    }

    onSubmit({ medicationId: selectedMedicationId, quantity: parsedQuantity, schedules });
  }

  const selectedMedication = catalogMedications.find((m) => m.id === selectedMedicationId);

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.glowOrb} />

        <View style={styles.topBar}>
          <TouchableOpacity accessibilityRole="button" onPress={onCancel} style={styles.navChip}>
            <Text style={styles.navChipText}>← Cancelar</Text>
          </TouchableOpacity>
        </View>

        <View>
          <Text style={styles.title}>{plan.name}</Text>
          <Text style={styles.subtitle}>
            {isEditing
              ? "Altere o remedio e os horarios."
              : "Selecione um remedio do catalogo e configure os horarios."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Remedio</Text>

          {catalogMedications.length === 0 ? (
            <Text style={styles.emptyHint}>Nenhum remedio no catalogo.</Text>
          ) : (
            <SelectField
              onChange={setSelectedMedicationId}
              options={catalogMedications.map((m) => ({
                label: `${m.name} ${m.dosage}`,
                value: m.id,
              }))}
              placeholder="Selecione um remedio"
              value={selectedMedicationId}
            />
          )}

          {onCreateMedication && (
            <TouchableOpacity accessibilityRole="button" onPress={onCreateMedication} style={styles.createLink}>
              <Text style={styles.createLinkText}>+ Criar novo remedio</Text>
            </TouchableOpacity>
          )}

          {selectedMedication?.description ? (
            <Text style={styles.selectedDesc}>{selectedMedication.description}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Quantidade</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setQuantity}
              placeholder="1"
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
              value={quantity}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dias e horarios</Text>

          <View style={styles.weekdayRow}>
            {weekdayOptions.map((wd) => {
              const isSelected = selectedWeekdays.includes(wd.value);
              return (
                <Pressable
                  key={wd.value}
                  accessibilityRole="button"
                  onPress={() => toggleWeekday(wd.value)}
                  style={[styles.weekdayDot, isSelected && styles.weekdayDotSelected]}
                >
                  <Text style={[styles.weekdayLabel, isSelected && styles.weekdayLabelSelected]}>
                    {wd.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {selectedWeekdays.length === 0 && (
            <Text style={styles.emptyHint}>Selecione os dias acima.</Text>
          )}

          {selectedWeekdays.map((weekday) => {
            const option = weekdayOptions.find((w) => w.value === weekday)!;
            const times = timesByWeekday[weekday];

            return (
              <View key={weekday} style={styles.dayBlock}>
                <Text style={styles.dayName}>{option.name}</Text>
                <View style={styles.timesRow}>
                  {times.map((time) => (
                    <View key={time} style={styles.timePill}>
                      <Text style={styles.timePillText}>{time}</Text>
                      <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => removeTime(weekday, time)}
                        style={styles.timePillRemove}
                      >
                        <Text style={styles.timePillRemoveText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => openTimePicker(weekday)}
                    style={styles.addTimeChip}
                  >
                    <Text style={styles.addTimeChipText}>+ horario</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          label={isEditing ? "Salvar alteracoes" : "Adicionar remedio"}
          onPress={handleSubmit}
        />
      </ScrollView>

      <TimePickerModal
        onCancel={() => setShowTimePicker(false)}
        onConfirm={confirmTime}
        value={pickerTimeStr}
        visible={showTimePicker}
      />
    </>
  );
}

const styles = StyleSheet.create({
  addTimeChip: {
    backgroundColor: colors.glass,
    borderColor: colors.primary,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addTimeChipText: {
    color: colors.primarySoft,
    ...typography.labelSm,
  },
  card: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  cardTitle: {
    color: colors.text,
    ...typography.headlineSm,
  },
  content: {
    gap: spacing.lg,
    overflow: "hidden",
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  dayBlock: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  dayName: {
    color: colors.textMuted,
    ...typography.labelSm,
    textTransform: "uppercase",
  },
  emptyHint: {
    color: colors.textSubtle,
    ...typography.bodyMd,
  },
  error: {
    color: colors.danger,
    ...typography.labelMd,
  },
  field: {
    gap: spacing.xs,
  },
  glowOrb: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    height: 180,
    opacity: 0.1,
    position: "absolute",
    right: -80,
    top: 80,
    width: 180,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.base,
    borderWidth: 1,
    color: colors.text,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyMd,
  },
  label: {
    color: colors.textMuted,
    ...typography.labelSm,
    textTransform: "uppercase",
  },
  createLink: {
    alignSelf: "flex-start",
  },
  createLinkText: {
    color: colors.primarySoft,
    ...typography.labelMd,
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
  selectedDesc: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    color: colors.textSubtle,
    ...typography.labelSm,
    paddingTop: spacing.sm,
  },
  subtitle: {
    color: colors.textSubtle,
    ...typography.bodyMd,
    marginTop: spacing.xs,
  },
  timePill: {
    alignItems: "center",
    backgroundColor: colors.surfaceBright,
    borderRadius: radius.full,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  timePillRemove: {
    paddingHorizontal: 2,
  },
  timePillRemoveText: {
    color: colors.textSubtle,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 18,
  },
  timePillText: {
    color: colors.text,
    ...typography.labelMd,
    fontWeight: "700",
  },
  timesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    ...typography.headlineLg,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekdayDot: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    flex: 1,
    height: 40,
    justifyContent: "center",
  },
  weekdayDotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  weekdayLabel: {
    color: colors.textMuted,
    ...typography.labelSm,
  },
  weekdayLabelSelected: {
    color: colors.primaryText,
  },
  weekdayRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
});
