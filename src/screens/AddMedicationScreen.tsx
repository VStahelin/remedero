import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/theme/theme";
import { Plan, Weekday } from "@/types/domain";

export type MedicationScheduleEntry = {
  weekday: Weekday;
  scheduledTime: string;
};

export type AddPlanMedicationInput = {
  medicationName: string;
  dosage: string;
  medicationType: string;
  description: string;
  quantity: number;
  schedules: MedicationScheduleEntry[];
};

type AddMedicationScreenProps = {
  initialValues?: AddPlanMedicationInput;
  mode?: "create" | "edit";
  onCancel: () => void;
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
  initialValues,
  mode = "create",
  onCancel,
  onSubmit,
  plan,
}: AddMedicationScreenProps) {
  const isEditing = mode === "edit";

  const [medicationName, setMedicationName] = useState(initialValues?.medicationName ?? "");
  const [dosage, setDosage] = useState(initialValues?.dosage ?? "");
  const [medicationType, setMedicationType] = useState(
    initialValues?.medicationType ?? "comprimido",
  );
  const [description, setDescription] = useState(initialValues?.description ?? "");
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

  const [showPicker, setShowPicker] = useState(false);
  const [pickerWeekday, setPickerWeekday] = useState<Weekday>(0);
  const [pickerTime, setPickerTime] = useState(new Date());

  function toggleWeekday(weekday: Weekday) {
    setSelectedWeekdays((current) =>
      current.includes(weekday)
        ? current.filter((w) => w !== weekday)
        : ([...current, weekday].sort((a, b) => a - b) as Weekday[]),
    );
  }

  function openTimePicker(weekday: Weekday) {
    setPickerWeekday(weekday);
    const now = new Date();
    now.setHours(8, 0, 0, 0);
    setPickerTime(now);
    setShowPicker(true);
  }

  function confirmTime(date?: Date) {
    const d = date ?? pickerTime;
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    const timeStr = `${h}:${m}`;

    setTimesByWeekday((current) => {
      if (current[pickerWeekday].includes(timeStr)) {
        return current;
      }

      return {
        ...current,
        [pickerWeekday]: [...current[pickerWeekday], timeStr].sort(),
      };
    });

    setShowPicker(false);
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

    if (!medicationName.trim()) {
      setError("Preencha o nome do remedio.");
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

    onSubmit({
      medicationName: medicationName.trim(),
      dosage: dosage.trim() || "Sem dosagem",
      medicationType: medicationType.trim() || "medicamento",
      description: description.trim(),
      quantity: parsedQuantity,
      schedules,
    });
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.glowOrb} />

        {/* Nav */}
        <View style={styles.topBar}>
          <TouchableOpacity accessibilityRole="button" onPress={onCancel} style={styles.navChip}>
            <Text style={styles.navChipText}>← Cancelar</Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View>
          <Text style={styles.title}>{plan.name}</Text>
          <Text style={styles.subtitle}>
            {isEditing ? "Altere as informacoes do remedio." : "Adicione o remedio e configure os dias e horarios."}
          </Text>
        </View>

        {/* Campos básicos */}
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              onChangeText={setMedicationName}
              placeholder="Sertralina"
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
              value={medicationName}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowField}>
              <Text style={styles.label}>Dosagem</Text>
              <TextInput
                onChangeText={setDosage}
                placeholder="50mg"
                placeholderTextColor={colors.textSubtle}
                style={styles.input}
                value={dosage}
              />
            </View>

            <View style={styles.rowField}>
              <Text style={styles.label}>Tipo</Text>
              <TextInput
                onChangeText={setMedicationType}
                placeholder="comprimido"
                placeholderTextColor={colors.textSubtle}
                style={styles.input}
                value={medicationType}
              />
            </View>
          </View>

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

          <View style={styles.field}>
            <Text style={styles.label}>Descricao</Text>
            <TextInput
              multiline
              onChangeText={setDescription}
              placeholder="Observacoes, instrucoes de uso..."
              placeholderTextColor={colors.textSubtle}
              style={[styles.input, styles.inputMultiline]}
              textAlignVertical="top"
              value={description}
            />
          </View>
        </View>

        {/* Dias e horários */}
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

      {/* Time picker modal */}
      <Modal animationType="slide" transparent visible={showPicker}>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHandle} />
            <Text style={styles.pickerTitle}>
              {weekdayOptions.find((w) => w.value === pickerWeekday)?.name}
            </Text>
            <DateTimePicker
              display="spinner"
              is24Hour
              mode="time"
              onChange={(event, date) => {
                if (date) setPickerTime(date);
                if (Platform.OS === "android") {
                  if (event.type === "set") {
                    confirmTime(date);
                  } else {
                    setShowPicker(false);
                  }
                }
              }}
              style={styles.picker}
              value={pickerTime}
            />
            <View style={styles.pickerActions}>
              <PrimaryButton
                label="Cancelar"
                onPress={() => setShowPicker(false)}
                variant="secondary"
              />
              <PrimaryButton label="Adicionar" onPress={confirmTime} />
            </View>
          </View>
        </View>
      </Modal>
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
  inputMultiline: {
    minHeight: 88,
  },
  label: {
    color: colors.textMuted,
    ...typography.labelSm,
    textTransform: "uppercase",
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
  picker: {
    height: 150,
    width: "100%",
  },
  pickerActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  pickerHandle: {
    alignSelf: "center",
    backgroundColor: colors.border,
    borderRadius: radius.full,
    height: 4,
    width: 40,
  },
  pickerOverlay: {
    backgroundColor: "rgba(0,0,0,0.6)",
    flex: 1,
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: colors.surfaceDim,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  pickerTitle: {
    color: colors.text,
    ...typography.headlineSm,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  rowField: {
    flex: 1,
    gap: spacing.xs,
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
