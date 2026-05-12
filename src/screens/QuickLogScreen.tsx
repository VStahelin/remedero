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
import { SelectField } from "@/components/SelectField";
import { colors, radius, spacing, typography } from "@/theme/theme";
import { Medication } from "@/types/domain";

export type QuickLogInput = {
  medicationName: string;
  dosage: string;
  takenAt: string;
  notes: string;
};

type QuickLogScreenProps = {
  catalogMedications: Medication[];
  onCancel: () => void;
  onSubmit: (input: QuickLogInput) => void;
};

const dosageUnitOptions = ["mg", "g", "ml", "UI", "%"];

const monthNames = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function formatDateLabel(date: Date): string {
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) return "Hoje";

  return `${date.getDate()} de ${monthNames[date.getMonth()]} de ${date.getFullYear()}`;
}

function formatTimeLabel(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function parseDosage(raw: string): { amount: string; unit: string } {
  const match = raw.match(/^([\d.,]+)\s*([a-zA-Z%]+)$/);
  if (match) {
    const unit = dosageUnitOptions.includes(match[2]) ? match[2] : "mg";
    return { amount: match[1], unit };
  }
  return { amount: raw.replace(/[^0-9.,]/g, ""), unit: "mg" };
}

export function QuickLogScreen({ catalogMedications, onCancel, onSubmit }: QuickLogScreenProps) {
  const [medicationName, setMedicationName] = useState("");
  const [dosageAmount, setDosageAmount] = useState("");
  const [dosageUnit, setDosageUnit] = useState("mg");
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [takenAt, setTakenAt] = useState(new Date());
  const [error, setError] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerTemp, setPickerTemp] = useState(new Date());

  function selectFromCatalog(med: Medication) {
    if (selectedCatalogId === med.id) {
      setSelectedCatalogId(null);
      return;
    }
    setSelectedCatalogId(med.id);
    setMedicationName(med.name);
    const parsed = parseDosage(med.dosage);
    setDosageAmount(parsed.amount);
    setDosageUnit(parsed.unit);
  }

  function openDatePicker() {
    setPickerTemp(takenAt);
    setShowDatePicker(true);
  }

  function openTimePicker() {
    setPickerTemp(takenAt);
    setShowTimePicker(true);
  }

  function confirmDate(date?: Date) {
    const d = date ?? pickerTemp;
    const merged = new Date(takenAt);
    merged.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
    setTakenAt(merged);
    setShowDatePicker(false);
  }

  function confirmTime(date?: Date) {
    const d = date ?? pickerTemp;
    const merged = new Date(takenAt);
    merged.setHours(d.getHours(), d.getMinutes(), 0, 0);
    setTakenAt(merged);
    setShowTimePicker(false);
  }

  function handleSubmit() {
    if (!medicationName.trim()) {
      setError("Preencha o nome do remedio.");
      return;
    }

    onSubmit({
      medicationName: medicationName.trim(),
      dosage: dosageAmount.trim() ? `${dosageAmount.trim()}${dosageUnit}` : "Sem dosagem",
      takenAt: takenAt.toISOString(),
      notes: notes.trim(),
    });
  }

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
          <Text style={styles.title}>Registro avulso</Text>
          <Text style={styles.subtitle}>Registre um remedio fora do plano de tratamento.</Text>
        </View>

        <View style={styles.card}>
          {catalogMedications.length > 0 && (
            <View style={styles.field}>
              <Text style={styles.label}>Do catalogo</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.catalogRow}>
                  {catalogMedications.map((med) => {
                    const isSelected = selectedCatalogId === med.id;
                    return (
                      <TouchableOpacity
                        key={med.id}
                        accessibilityRole="button"
                        onPress={() => selectFromCatalog(med)}
                        style={[styles.catalogChip, isSelected && styles.catalogChipSelected]}
                      >
                        <Text style={[styles.catalogChipText, isSelected && styles.catalogChipTextSelected]}>
                          {med.name}
                        </Text>
                        <Text style={[styles.catalogChipMeta, isSelected && styles.catalogChipMetaSelected]}>
                          {med.dosage}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Remedio</Text>
            <TextInput
              autoFocus
              onChangeText={(v) => { setMedicationName(v); setSelectedCatalogId(null); }}
              placeholder="Dipirona, Ibuprofeno..."
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
              value={medicationName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Dosagem</Text>
            <View style={styles.dosageRow}>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setDosageAmount}
                placeholder="500"
                placeholderTextColor={colors.textSubtle}
                style={[styles.input, styles.dosageInput]}
                value={dosageAmount}
              />
              <View style={styles.dosageUnit}>
                <SelectField
                  onChange={setDosageUnit}
                  options={dosageUnitOptions.map((u) => ({ label: u, value: u }))}
                  value={dosageUnit}
                />
              </View>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Notas</Text>
            <TextInput
              multiline
              onChangeText={setNotes}
              placeholder="Dor de cabeca, febre..."
              placeholderTextColor={colors.textSubtle}
              style={[styles.input, styles.inputMultiline]}
              textAlignVertical="top"
              value={notes}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quando tomei</Text>

          <View style={styles.whenRow}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={openDatePicker}
              style={styles.whenChip}
            >
              <Text style={styles.whenChipLabel}>Data</Text>
              <Text style={styles.whenChipValue}>{formatDateLabel(takenAt)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={openTimePicker}
              style={styles.whenChip}
            >
              <Text style={styles.whenChipLabel}>Hora</Text>
              <Text style={styles.whenChipValue}>{formatTimeLabel(takenAt)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton label="Registrar" onPress={handleSubmit} />
      </ScrollView>

      {/* Date picker — Android: native dialog direto; iOS: bottom sheet */}
      {Platform.OS === "ios" ? (
        <Modal animationType="slide" transparent visible={showDatePicker}>
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHandle} />
              <Text style={styles.pickerTitle}>Data</Text>
              <DateTimePicker
                display="spinner"
                maximumDate={new Date()}
                mode="date"
                onChange={(_, date) => { if (date) setPickerTemp(date); }}
                style={styles.picker}
                value={pickerTemp}
              />
              <View style={styles.pickerActions}>
                <PrimaryButton label="Cancelar" onPress={() => setShowDatePicker(false)} variant="secondary" />
                <PrimaryButton label="Confirmar" onPress={() => confirmDate()} />
              </View>
            </View>
          </View>
        </Modal>
      ) : showDatePicker ? (
        <DateTimePicker
          display="default"
          maximumDate={new Date()}
          mode="date"
          onChange={(event, date) => {
            if (event.type === "set") confirmDate(date ?? undefined);
            else setShowDatePicker(false);
          }}
          value={pickerTemp}
        />
      ) : null}

      {/* Time picker — Android: native dialog direto; iOS: bottom sheet */}
      {Platform.OS === "ios" ? (
        <Modal animationType="slide" transparent visible={showTimePicker}>
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHandle} />
              <Text style={styles.pickerTitle}>Hora</Text>
              <DateTimePicker
                display="spinner"
                is24Hour
                mode="time"
                onChange={(_, date) => { if (date) setPickerTemp(date); }}
                style={styles.picker}
                value={pickerTemp}
              />
              <View style={styles.pickerActions}>
                <PrimaryButton label="Cancelar" onPress={() => setShowTimePicker(false)} variant="secondary" />
                <PrimaryButton label="Confirmar" onPress={() => confirmTime()} />
              </View>
            </View>
          </View>
        </Modal>
      ) : showTimePicker ? (
        <DateTimePicker
          display="default"
          is24Hour
          mode="time"
          onChange={(event, date) => {
            if (event.type === "set") confirmTime(date ?? undefined);
            else setShowTimePicker(false);
          }}
          value={pickerTemp}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
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
  dosageInput: {
    flex: 1,
  },
  dosageRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  dosageUnit: {
    width: 90,
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
    minHeight: 80,
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
  subtitle: {
    color: colors.textSubtle,
    ...typography.bodyMd,
    marginTop: spacing.xs,
  },
  title: {
    color: colors.text,
    ...typography.headlineLg,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
  },
  whenChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.base,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  whenChipLabel: {
    color: colors.textSubtle,
    ...typography.labelSm,
    textTransform: "uppercase",
  },
  whenChipValue: {
    color: colors.text,
    ...typography.bodyMd,
    fontWeight: "700",
  },
  whenRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  catalogRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  catalogChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  catalogChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catalogChipText: {
    color: colors.text,
    ...typography.labelMd,
    fontWeight: "700",
  },
  catalogChipTextSelected: {
    color: colors.primaryText,
  },
  catalogChipMeta: {
    color: colors.textSubtle,
    ...typography.labelSm,
  },
  catalogChipMetaSelected: {
    color: colors.primaryText,
    opacity: 0.8,
  },
});
