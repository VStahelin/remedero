export type Plan = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  startDate: string;           // "YYYY-MM-DD"
  durationDays: number | null; // null = tratamento em aberto
};

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  type: string;
  description?: string;
};

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Feeling =
  | "bem"
  | "mal"
  | "neutro"
  | "ansioso"
  | "cansado"
  | "calmo"
  | "triste"
  | "animado";

export type PlanMedication = {
  id: string;
  planId: string;
  medicationId: string;
  quantity: number;
};

export type PlanMedicationSchedule = {
  id: string;
  planMedicationId: string;
  weekday: Weekday;
  scheduledTime: string;
};

export type CheckInStatus = "completed" | "missed" | "pending";

export type CheckIn = {
  id: string;
  planId: string;
  date: string;
  scheduledTime: string;
  completedAt?: string;
  photoUri?: string;
  status: CheckInStatus;
};

export type PlanNote = {
  id: string;
  planId: string;
  createdAt: string;
  feeling: Feeling;
  text: string;
};

export type MedicationDose = Medication & {
  planMedicationId: string;
  quantity: number;
  scheduledTime: string;
  weekdays: Weekday[];
};

export type CheckInMedication = {
  id: string;
  checkInId: string;
  medicationId: string;
  name: string;
  dosage: string;
  quantity: number;
};

export type QuickLog = {
  id: string;
  medicationName: string;
  dosage: string;
  takenAt: string;
  notes?: string;
};

export type MoodLog = {
  id: string;
  createdAt: string;
  feeling: Feeling;
  text?: string;
  planId?: string;
};

export type AlarmSettings = {
  enabled: boolean;
  snoozeMinutes: number;
  retryCount: number;
};

export const DEFAULT_ALARM_SETTINGS: AlarmSettings = {
  enabled: true,
  retryCount: 6,
  snoozeMinutes: 10,
};
