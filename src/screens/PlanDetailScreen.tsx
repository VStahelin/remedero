import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/theme/theme";
import { Feeling, Medication, Plan, PlanNote, Weekday } from "@/types/domain";

type MedicationScheduleEntry = {
  weekday: Weekday;
  scheduledTime: string;
};

export type PlanMedicationSummary = Medication & {
  planMedicationId: string;
  quantity: number;
  schedules: MedicationScheduleEntry[];
};

export type PlanStats = {
  totalCheckIns: number;
  completedCheckIns: number;
  missedCheckIns: number;
  pendingCheckIns: number;
  completionRate: number;
  medicationCount: number;
  scheduleCount: number;
};

export type AddPlanNoteInput = {
  feeling: Feeling;
  text: string;
};

type PlanDetailScreenProps = {
  medications: PlanMedicationSummary[];
  notes: PlanNote[];
  onAddMedicationPress: () => void;
  onAddNote: (input: AddPlanNoteInput) => void;
  onBack: () => void;
  onDeletePlan: () => void;
  onEditMedication: (planMedicationId: string) => void;
  onEditPlan: () => void;
  plan: Plan;
  stats: PlanStats;
};

const weekdayOptions: Array<{ label: string; value: Weekday }> = [
  { label: "D", value: 0 },
  { label: "S", value: 1 },
  { label: "T", value: 2 },
  { label: "Q", value: 3 },
  { label: "Q", value: 4 },
  { label: "S", value: 5 },
  { label: "S", value: 6 },
];

const weekdayNames: Record<Weekday, string> = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sab",
};

const feelingOptions: Array<{ label: string; value: Feeling }> = [
  { label: "Bem", value: "bem" },
  { label: "Mal", value: "mal" },
  { label: "Neutro", value: "neutro" },
  { label: "Ansioso", value: "ansioso" },
  { label: "Cansado", value: "cansado" },
  { label: "Calmo", value: "calmo" },
  { label: "Triste", value: "triste" },
  { label: "Animado", value: "animado" },
];

function formatSchedules(schedules: MedicationScheduleEntry[]): string {
  const grouped = schedules.reduce<Record<Weekday, string[]>>(
    (acc, s) => {
      acc[s.weekday].push(s.scheduledTime);
      return acc;
    },
    { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
  );

  return weekdayOptions
    .map((wd) => {
      const times = Array.from(new Set(grouped[wd.value])).sort();
      return times.length ? `${weekdayNames[wd.value]} ${times.join(", ")}` : "";
    })
    .filter(Boolean)
    .join(" · ");
}

export function PlanDetailScreen({
  medications,
  notes,
  onAddMedicationPress,
  onAddNote,
  onBack,
  onDeletePlan,
  onEditMedication,
  onEditPlan,
  plan,
  stats,
}: PlanDetailScreenProps) {
  const [noteText, setNoteText] = useState("");
  const [selectedFeeling, setSelectedFeeling] = useState<Feeling>("neutro");
  const [noteError, setNoteError] = useState("");

  function handleAddNote() {
    if (!noteText.trim()) {
      setNoteError("Escreva uma nota antes de salvar.");
      return;
    }

    onAddNote({ feeling: selectedFeeling, text: noteText.trim() });
    setNoteText("");
    setSelectedFeeling("neutro");
    setNoteError("");
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.glowOrb} />

      {/* Nav */}
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityRole="button" onPress={onBack} style={styles.navChip}>
          <Text style={styles.navChipText}>← Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={onEditPlan} style={styles.navChip}>
          <Text style={styles.navChipText}>Editar</Text>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{plan.name}</Text>
        <Text style={styles.subtitle}>{plan.description}</Text>
      </View>

      {/* Estatísticas */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Estatisticas</Text>

        <View style={styles.completionHero}>
          <Text style={styles.completionRate}>{stats.completionRate}%</Text>
          <Text style={styles.completionLabel}>de conclusao</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${stats.completionRate}%` }]} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.completedCheckIns}</Text>
            <Text style={styles.statLabel}>concluidos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, stats.missedCheckIns > 0 && styles.statDanger]}>
              {stats.missedCheckIns}
            </Text>
            <Text style={styles.statLabel}>perdidos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.pendingCheckIns}</Text>
            <Text style={styles.statLabel}>pendentes</Text>
          </View>
        </View>

        <Text style={styles.statsMeta}>
          {stats.medicationCount} {stats.medicationCount === 1 ? "remedio" : "remedios"} ·{" "}
          {stats.scheduleCount} {stats.scheduleCount === 1 ? "horario" : "horarios"}
        </Text>
      </View>

      {/* Remédios */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Remedios do plano</Text>

        {medications.length === 0 ? (
          <Text style={styles.emptyText}>Ainda nao ha remedios neste tratamento.</Text>
        ) : (
          medications.map((med) => (
            <View key={med.planMedicationId} style={styles.medicationCard}>
              <View style={styles.medicationAccent} />
              <View style={styles.medicationBody}>
                <View style={styles.medicationHeader}>
                  <Text style={styles.medicationName}>{med.name}</Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => onEditMedication(med.planMedicationId)}
                    style={styles.chip}
                  >
                    <Text style={styles.chipText}>Editar</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.medicationMeta}>
                  {med.quantity}x · {med.dosage} · {med.type}
                </Text>
                {formatSchedules(med.schedules) ? (
                  <Text style={styles.medicationSchedule}>{formatSchedules(med.schedules)}</Text>
                ) : null}
              </View>
            </View>
          ))
        )}

        <PrimaryButton label="Adicionar remedio" onPress={onAddMedicationPress} />
      </View>

      {/* Notas */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Notas do plano</Text>

        <View style={styles.noteForm}>
          <View style={styles.feelingRow}>
            {feelingOptions.map((feeling) => {
              const isSelected = selectedFeeling === feeling.value;

              return (
                <Pressable
                  key={feeling.value}
                  accessibilityRole="button"
                  onPress={() => setSelectedFeeling(feeling.value)}
                  style={[styles.feelingPill, isSelected && styles.feelingPillSelected]}
                >
                  <Text style={[styles.feelingText, isSelected && styles.feelingTextSelected]}>
                    {feeling.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            multiline
            onChangeText={setNoteText}
            placeholder="Como foi o tratamento hoje?"
            placeholderTextColor={colors.textSubtle}
            style={[styles.input, styles.noteInput]}
            textAlignVertical="top"
            value={noteText}
          />

          {noteError ? <Text style={styles.error}>{noteError}</Text> : null}

          <PrimaryButton label="Salvar nota" onPress={handleAddNote} />
        </View>

        {notes.length > 0 && (
          <View style={styles.notesList}>
            {notes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteFeeling}>{note.feeling}</Text>
                  <Text style={styles.noteDate}>
                    {new Date(note.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <Text style={styles.noteText}>{note.text}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Zona de perigo */}
      <TouchableOpacity
        accessibilityRole="button"
        onPress={onDeletePlan}
        style={styles.deleteLink}
      >
        <Text style={styles.deleteLinkText}>Excluir plano</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surfaceBright,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  chipText: {
    color: colors.primarySoft,
    ...typography.labelSm,
  },
  completionHero: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  completionLabel: {
    color: colors.textSubtle,
    ...typography.labelMd,
  },
  completionRate: {
    color: colors.primarySoft,
    fontSize: 52,
    fontWeight: "700",
    letterSpacing: -1.5,
    lineHeight: 56,
  },
  content: {
    gap: spacing.lg,
    overflow: "hidden",
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  deleteLink: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  deleteLinkText: {
    color: colors.danger,
    ...typography.labelMd,
    opacity: 0.7,
  },
  emptyText: {
    color: colors.textSubtle,
    ...typography.bodyMd,
  },
  error: {
    color: colors.danger,
    ...typography.labelMd,
  },
  feelingPill: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  feelingPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  feelingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  feelingText: {
    color: colors.textMuted,
    ...typography.labelSm,
    textTransform: "capitalize",
  },
  feelingTextSelected: {
    color: colors.primaryText,
  },
  glowOrb: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    height: 200,
    opacity: 0.1,
    position: "absolute",
    right: -80,
    top: 80,
    width: 200,
  },
  header: {
    gap: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderMuted,
    borderRadius: radius.base,
    borderWidth: 1,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyMd,
  },
  medicationAccent: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    width: 4,
  },
  medicationBody: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  medicationCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  medicationHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  medicationMeta: {
    color: colors.textSubtle,
    ...typography.labelMd,
  },
  medicationName: {
    color: colors.text,
    ...typography.headlineSm,
  },
  medicationSchedule: {
    color: colors.primarySoft,
    ...typography.labelSm,
    marginTop: spacing.xs,
  },
  navChip: {
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
  noteCard: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
  noteDate: {
    color: colors.textSubtle,
    ...typography.labelSm,
  },
  noteFeeling: {
    color: colors.primarySoft,
    ...typography.labelSm,
    textTransform: "capitalize",
  },
  noteForm: {
    gap: spacing.md,
  },
  noteHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  noteInput: {
    minHeight: 96,
  },
  notesList: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  noteText: {
    color: colors.text,
    ...typography.bodyMd,
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 4,
  },
  progressTrack: {
    backgroundColor: colors.surfaceBright,
    borderRadius: radius.full,
    height: 4,
    marginTop: spacing.xs,
    overflow: "hidden",
    width: "100%",
  },
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  sectionLabel: {
    color: colors.textSubtle,
    ...typography.labelSm,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  statDanger: {
    color: colors.danger,
  },
  statDivider: {
    backgroundColor: colors.border,
    width: 1,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    gap: spacing.xs,
  },
  statLabel: {
    color: colors.textSubtle,
    ...typography.labelSm,
  },
  statsMeta: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    color: colors.textSubtle,
    ...typography.labelMd,
    paddingTop: spacing.md,
    textAlign: "center",
  },
  statsRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    paddingVertical: spacing.md,
  },
  statValue: {
    color: colors.text,
    ...typography.headlineMd,
  },
  subtitle: {
    color: colors.textSubtle,
    ...typography.bodyMd,
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
});
