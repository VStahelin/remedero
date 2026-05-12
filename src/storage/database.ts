import * as SQLite from "expo-sqlite";

import {
  AlarmSettings,
  CheckIn,
  CheckInMedication,
  DEFAULT_ALARM_SETTINGS,
  Medication,
  MoodLog,
  Plan,
  PlanMedication,
  PlanMedicationSchedule,
  PlanNote,
  QuickLog,
  Weekday,
} from "@/types/domain";

export const database = SQLite.openDatabaseSync("remedero.db");

export function initializeDatabase() {
  database.execSync(`
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      start_date TEXT,
      duration_days INTEGER
    );

    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      type TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS plan_medications (
      id TEXT PRIMARY KEY NOT NULL,
      plan_id TEXT NOT NULL,
      medication_id TEXT NOT NULL,
      quantity INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS plan_medication_schedules (
      id TEXT PRIMARY KEY NOT NULL,
      plan_medication_id TEXT NOT NULL,
      weekday INTEGER NOT NULL,
      scheduled_time TEXT NOT NULL,
      UNIQUE (plan_medication_id, weekday, scheduled_time)
    );

    CREATE TABLE IF NOT EXISTS check_ins (
      id TEXT PRIMARY KEY NOT NULL,
      plan_id TEXT NOT NULL,
      date TEXT NOT NULL,
      scheduled_time TEXT NOT NULL,
      completed_at TEXT,
      photo_uri TEXT,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS check_in_medications (
      id TEXT PRIMARY KEY NOT NULL,
      check_in_id TEXT NOT NULL,
      medication_id TEXT NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      quantity INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS plan_notes (
      id TEXT PRIMARY KEY NOT NULL,
      plan_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      feeling TEXT NOT NULL,
      text TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quick_logs (
      id TEXT PRIMARY KEY NOT NULL,
      medication_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      taken_at TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS mood_logs (
      id TEXT PRIMARY KEY NOT NULL,
      created_at TEXT NOT NULL,
      feeling TEXT NOT NULL,
      text TEXT,
      plan_id TEXT
    );

    CREATE TABLE IF NOT EXISTS alarm_settings (
      id TEXT PRIMARY KEY NOT NULL,
      enabled INTEGER NOT NULL,
      snooze_minutes INTEGER NOT NULL,
      retry_count INTEGER NOT NULL
    );

    INSERT OR IGNORE INTO alarm_settings (id, enabled, snooze_minutes, retry_count)
    VALUES ('default', 1, 10, 6);
  `);

  // Migracao: adiciona colunas ao plano (ignora se ja existirem)
  try { database.execSync("ALTER TABLE plans ADD COLUMN start_date TEXT"); } catch {}
  try { database.execSync("ALTER TABLE plans ADD COLUMN duration_days INTEGER"); } catch {}
}

// Plans

export function dbGetPlans(): Plan[] {
  const today = new Date().toISOString().split("T")[0];
  return database
    .getAllSync<{
      id: string;
      name: string;
      description: string;
      is_active: number;
      start_date: string | null;
      duration_days: number | null;
    }>("SELECT * FROM plans ORDER BY rowid ASC")
    .map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      isActive: row.is_active === 1,
      startDate: row.start_date ?? today,
      durationDays: row.duration_days ?? null,
    }));
}

export function dbInsertPlan(plan: Plan): void {
  database.runSync(
    "INSERT INTO plans (id, name, description, is_active, start_date, duration_days) VALUES (?, ?, ?, ?, ?, ?)",
    plan.id,
    plan.name,
    plan.description,
    plan.isActive ? 1 : 0,
    plan.startDate,
    plan.durationDays ?? null,
  );
}

export function dbUpdatePlan(plan: Plan): void {
  database.runSync(
    "UPDATE plans SET name = ?, description = ?, is_active = ?, start_date = ?, duration_days = ? WHERE id = ?",
    plan.name,
    plan.description,
    plan.isActive ? 1 : 0,
    plan.startDate,
    plan.durationDays ?? null,
    plan.id,
  );
}

export function dbDeletePlan(planId: string): void {
  database.runSync("DELETE FROM plans WHERE id = ?", planId);
}

// Medications

export function dbGetMedications(): Medication[] {
  return database
    .getAllSync<{ id: string; name: string; dosage: string; type: string; notes: string | null }>(
      "SELECT * FROM medications ORDER BY rowid ASC",
    )
    .map((row) => ({
      id: row.id,
      name: row.name,
      dosage: row.dosage,
      type: row.type,
      description: row.notes ?? undefined,
    }));
}

export function dbInsertMedication(medication: Medication): void {
  database.runSync(
    "INSERT INTO medications (id, name, dosage, type, notes) VALUES (?, ?, ?, ?, ?)",
    medication.id,
    medication.name,
    medication.dosage,
    medication.type,
    medication.description ?? null,
  );
}

// PlanMedications

export function dbGetPlanMedications(): PlanMedication[] {
  return database
    .getAllSync<{ id: string; plan_id: string; medication_id: string; quantity: number }>(
      "SELECT * FROM plan_medications ORDER BY rowid ASC",
    )
    .map((row) => ({
      id: row.id,
      planId: row.plan_id,
      medicationId: row.medication_id,
      quantity: row.quantity,
    }));
}

export function dbInsertPlanMedication(pm: PlanMedication): void {
  database.runSync(
    "INSERT INTO plan_medications (id, plan_id, medication_id, quantity) VALUES (?, ?, ?, ?)",
    pm.id,
    pm.planId,
    pm.medicationId,
    pm.quantity,
  );
}

export function dbDeleteMedication(medicationId: string): void {
  database.runSync("DELETE FROM medications WHERE id = ?", medicationId);
}

export function dbUpdateMedication(medication: Medication): void {
  database.runSync(
    "UPDATE medications SET name = ?, dosage = ?, type = ?, notes = ? WHERE id = ?",
    medication.name,
    medication.dosage,
    medication.type,
    medication.description ?? null,
    medication.id,
  );
}

export function dbUpdatePlanMedication(pm: PlanMedication): void {
  database.runSync(
    "UPDATE plan_medications SET medication_id = ?, quantity = ? WHERE id = ?",
    pm.medicationId,
    pm.quantity,
    pm.id,
  );
}

export function dbDeletePlanMedicationsByPlanId(planId: string): void {
  database.runSync("DELETE FROM plan_medications WHERE plan_id = ?", planId);
}

// PlanMedicationSchedules

export function dbGetPlanMedicationSchedules(): PlanMedicationSchedule[] {
  return database
    .getAllSync<{
      id: string;
      plan_medication_id: string;
      weekday: number;
      scheduled_time: string;
    }>("SELECT * FROM plan_medication_schedules ORDER BY rowid ASC")
    .map((row) => ({
      id: row.id,
      planMedicationId: row.plan_medication_id,
      weekday: row.weekday as Weekday,
      scheduledTime: row.scheduled_time,
    }));
}

export function dbInsertPlanMedicationSchedule(schedule: PlanMedicationSchedule): void {
  database.runSync(
    "INSERT OR IGNORE INTO plan_medication_schedules (id, plan_medication_id, weekday, scheduled_time) VALUES (?, ?, ?, ?)",
    schedule.id,
    schedule.planMedicationId,
    schedule.weekday,
    schedule.scheduledTime,
  );
}

export function dbDeletePlanMedicationSchedulesByPlanMedicationIds(ids: string[]): void {
  if (ids.length === 0) {
    return;
  }

  const placeholders = ids.map(() => "?").join(", ");

  database.runSync(
    `DELETE FROM plan_medication_schedules WHERE plan_medication_id IN (${placeholders})`,
    ...ids,
  );
}

// CheckIns

export function dbGetCheckIns(): CheckIn[] {
  return database
    .getAllSync<{
      id: string;
      plan_id: string;
      date: string;
      scheduled_time: string;
      completed_at: string | null;
      photo_uri: string | null;
      status: string;
    }>("SELECT * FROM check_ins ORDER BY date DESC, scheduled_time ASC")
    .map((row) => ({
      id: row.id,
      planId: row.plan_id,
      date: row.date,
      scheduledTime: row.scheduled_time,
      completedAt: row.completed_at ?? undefined,
      photoUri: row.photo_uri ?? undefined,
      status: row.status as CheckIn["status"],
    }));
}

export function dbInsertCheckIn(checkIn: CheckIn): void {
  database.runSync(
    "INSERT INTO check_ins (id, plan_id, date, scheduled_time, completed_at, photo_uri, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    checkIn.id,
    checkIn.planId,
    checkIn.date,
    checkIn.scheduledTime,
    checkIn.completedAt ?? null,
    checkIn.photoUri ?? null,
    checkIn.status,
  );
}

export function dbUpdateCheckIn(checkIn: CheckIn): void {
  database.runSync(
    "UPDATE check_ins SET completed_at = ?, photo_uri = ?, status = ? WHERE id = ?",
    checkIn.completedAt ?? null,
    checkIn.photoUri ?? null,
    checkIn.status,
    checkIn.id,
  );
}

export function dbDeleteCheckInsByPlanId(planId: string): void {
  database.runSync("DELETE FROM check_ins WHERE plan_id = ?", planId);
}

// CheckInMedications

export function dbGetCheckInMedications(): CheckInMedication[] {
  return database
    .getAllSync<{
      id: string;
      check_in_id: string;
      medication_id: string;
      name: string;
      dosage: string;
      quantity: number;
    }>("SELECT * FROM check_in_medications ORDER BY rowid ASC")
    .map((row) => ({
      id: row.id,
      checkInId: row.check_in_id,
      medicationId: row.medication_id,
      name: row.name,
      dosage: row.dosage,
      quantity: row.quantity,
    }));
}

export function dbInsertCheckInMedication(item: CheckInMedication): void {
  database.runSync(
    "INSERT INTO check_in_medications (id, check_in_id, medication_id, name, dosage, quantity) VALUES (?, ?, ?, ?, ?, ?)",
    item.id,
    item.checkInId,
    item.medicationId,
    item.name,
    item.dosage,
    item.quantity,
  );
}

export function dbDeleteCheckInMedicationsByPlanId(planId: string): void {
  database.runSync(
    "DELETE FROM check_in_medications WHERE check_in_id IN (SELECT id FROM check_ins WHERE plan_id = ?)",
    planId,
  );
}

// PlanNotes

export function dbGetPlanNotes(): PlanNote[] {
  return database
    .getAllSync<{
      id: string;
      plan_id: string;
      created_at: string;
      feeling: string;
      text: string;
    }>("SELECT * FROM plan_notes ORDER BY created_at DESC")
    .map((row) => ({
      id: row.id,
      planId: row.plan_id,
      createdAt: row.created_at,
      feeling: row.feeling as PlanNote["feeling"],
      text: row.text,
    }));
}

export function dbInsertPlanNote(note: PlanNote): void {
  database.runSync(
    "INSERT INTO plan_notes (id, plan_id, created_at, feeling, text) VALUES (?, ?, ?, ?, ?)",
    note.id,
    note.planId,
    note.createdAt,
    note.feeling,
    note.text,
  );
}

export function dbDeletePlanNotesByPlanId(planId: string): void {
  database.runSync("DELETE FROM plan_notes WHERE plan_id = ?", planId);
}

// QuickLogs

export function dbGetQuickLogs(): QuickLog[] {
  return database
    .getAllSync<{
      id: string;
      medication_name: string;
      dosage: string;
      taken_at: string;
      notes: string | null;
    }>("SELECT * FROM quick_logs ORDER BY taken_at DESC")
    .map((row) => ({
      id: row.id,
      medicationName: row.medication_name,
      dosage: row.dosage,
      takenAt: row.taken_at,
      notes: row.notes ?? undefined,
    }));
}

export function dbInsertQuickLog(log: QuickLog): void {
  database.runSync(
    "INSERT INTO quick_logs (id, medication_name, dosage, taken_at, notes) VALUES (?, ?, ?, ?, ?)",
    log.id,
    log.medicationName,
    log.dosage,
    log.takenAt,
    log.notes ?? null,
  );
}

// MoodLogs

export function dbGetMoodLogs(): MoodLog[] {
  return database
    .getAllSync<{
      id: string;
      created_at: string;
      feeling: string;
      text: string | null;
      plan_id: string | null;
    }>("SELECT * FROM mood_logs ORDER BY created_at DESC")
    .map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      feeling: row.feeling as MoodLog["feeling"],
      text: row.text ?? undefined,
      planId: row.plan_id ?? undefined,
    }));
}

export function dbInsertMoodLog(log: MoodLog): void {
  database.runSync(
    "INSERT INTO mood_logs (id, created_at, feeling, text, plan_id) VALUES (?, ?, ?, ?, ?)",
    log.id,
    log.createdAt,
    log.feeling,
    log.text ?? null,
    log.planId ?? null,
  );
}

// AlarmSettings

function ensureAlarmSettingsTable(): void {
  database.execSync(`
    CREATE TABLE IF NOT EXISTS alarm_settings (
      id TEXT PRIMARY KEY NOT NULL,
      enabled INTEGER NOT NULL,
      snooze_minutes INTEGER NOT NULL,
      retry_count INTEGER NOT NULL
    );

    INSERT OR IGNORE INTO alarm_settings (id, enabled, snooze_minutes, retry_count)
    VALUES ('default', 1, 10, 6);
  `);
}

export function dbGetAlarmSettings(): AlarmSettings {
  ensureAlarmSettingsTable();

  const row = database.getFirstSync<{
    enabled: number;
    retry_count: number;
    snooze_minutes: number;
  }>("SELECT enabled, snooze_minutes, retry_count FROM alarm_settings WHERE id = 'default'");

  if (!row) {
    return DEFAULT_ALARM_SETTINGS;
  }

  return {
    enabled: row.enabled === 1,
    retryCount: row.retry_count,
    snoozeMinutes: row.snooze_minutes,
  };
}

export function dbUpdateAlarmSettings(settings: AlarmSettings): void {
  ensureAlarmSettingsTable();

  database.runSync(
    "INSERT OR REPLACE INTO alarm_settings (id, enabled, snooze_minutes, retry_count) VALUES ('default', ?, ?, ?)",
    settings.enabled ? 1 : 0,
    settings.snoozeMinutes,
    settings.retryCount,
  );
}

export function dbClearAllTables(): void {
  database.execSync(`
    DELETE FROM check_in_medications;
    DELETE FROM check_ins;
    DELETE FROM plan_medication_schedules;
    DELETE FROM plan_medications;
    DELETE FROM plan_notes;
    DELETE FROM medications;
    DELETE FROM plans;
    DELETE FROM quick_logs;
    DELETE FROM mood_logs;
    DELETE FROM alarm_settings;

    INSERT OR REPLACE INTO alarm_settings (id, enabled, snooze_minutes, retry_count)
    VALUES ('default', 1, 10, 6);
  `);
}
