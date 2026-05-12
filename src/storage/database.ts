import * as SQLite from "expo-sqlite";

import {
  CheckIn,
  CheckInMedication,
  Medication,
  Plan,
  PlanMedication,
  PlanMedicationSchedule,
  PlanNote,
  Weekday,
} from "@/types/domain";

export const database = SQLite.openDatabaseSync("remedero.db");

export function initializeDatabase() {
  database.execSync(`
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
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
  `);
}

// Plans

export function dbGetPlans(): Plan[] {
  return database
    .getAllSync<{ id: string; name: string; description: string; is_active: number }>(
      "SELECT * FROM plans ORDER BY rowid ASC",
    )
    .map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      isActive: row.is_active === 1,
    }));
}

export function dbInsertPlan(plan: Plan): void {
  database.runSync(
    "INSERT INTO plans (id, name, description, is_active) VALUES (?, ?, ?, ?)",
    plan.id,
    plan.name,
    plan.description,
    plan.isActive ? 1 : 0,
  );
}

export function dbUpdatePlan(plan: Plan): void {
  database.runSync(
    "UPDATE plans SET name = ?, description = ?, is_active = ? WHERE id = ?",
    plan.name,
    plan.description,
    plan.isActive ? 1 : 0,
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
    "UPDATE plan_medications SET quantity = ? WHERE id = ?",
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

export function dbClearAllTables(): void {
  database.execSync(`
    DELETE FROM check_in_medications;
    DELETE FROM check_ins;
    DELETE FROM plan_medication_schedules;
    DELETE FROM plan_medications;
    DELETE FROM plan_notes;
    DELETE FROM medications;
    DELETE FROM plans;
  `);
}
