import {
  CheckIn,
  CheckInMedication,
  Medication,
  MedicationDose,
  Plan,
  PlanMedication,
  PlanMedicationSchedule,
  PlanNote,
  Weekday,
} from "@/types/domain";

export const allWeekdays: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return formatDate(date);
}

function isoAt(daysBack: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  date.setHours(hour, minute, 0, 0);

  return date.toISOString();
}

export const plans: Plan[] = [
  {
    id: "anxiety-treatment",
    name: "Tratamento de ansiedade 1",
    description:
      "Rotina diaria para manter consistencia nos remedios principais e suplementos de apoio.",
    isActive: true,
  },
  {
    id: "vitamins",
    name: "Vitaminas do mes",
    description: "Plano simples de vitaminas para acompanhar energia e disposicao.",
    isActive: true,
  },
];

export const medications: Medication[] = [
  {
    id: "vitamin-d",
    name: "Vitamina D",
    dosage: "2000 UI",
    type: "capsula",
  },
  {
    id: "magnesium",
    name: "Magnesio",
    dosage: "500mg",
    type: "capsula",
  },
  {
    id: "omega-3",
    name: "Omega 3",
    dosage: "1000mg",
    type: "capsula",
  },
  {
    id: "sertraline",
    name: "Sertralina",
    dosage: "50mg",
    type: "comprimido",
  },
  {
    id: "melatonin",
    name: "Melatonina",
    dosage: "3mg",
    type: "comprimido",
  },
];

export const planMedications: PlanMedication[] = [
  {
    id: "anxiety-sertraline",
    planId: "anxiety-treatment",
    medicationId: "sertraline",
    quantity: 1,
  },
  {
    id: "anxiety-melatonin",
    planId: "anxiety-treatment",
    medicationId: "melatonin",
    quantity: 1,
  },
  {
    id: "vitamins-vitamin-d",
    planId: "vitamins",
    medicationId: "vitamin-d",
    quantity: 1,
  },
  {
    id: "vitamins-magnesium",
    planId: "vitamins",
    medicationId: "magnesium",
    quantity: 2,
  },
  {
    id: "vitamins-omega-3",
    planId: "vitamins",
    medicationId: "omega-3",
    quantity: 1,
  },
];

export const planMedicationSchedules: PlanMedicationSchedule[] = [
  ...[1, 2, 3, 4, 5].flatMap((weekday) =>
    ["08:00", "20:00"].map((scheduledTime) => ({
      id: `anxiety-sertraline-${weekday}-${scheduledTime}`,
      planMedicationId: "anxiety-sertraline",
      scheduledTime,
      weekday: weekday as Weekday,
    })),
  ),
  {
    id: "anxiety-sertraline-6-1200",
    planMedicationId: "anxiety-sertraline",
    scheduledTime: "12:00",
    weekday: 6,
  },
  ...allWeekdays.map((weekday) => ({
    id: `anxiety-melatonin-${weekday}-2200`,
    planMedicationId: "anxiety-melatonin",
    scheduledTime: "22:00",
    weekday,
  })),
  ...[1, 3, 5].map((weekday) => ({
    id: `vitamins-vitamin-d-${weekday}-0800`,
    planMedicationId: "vitamins-vitamin-d",
    scheduledTime: "08:00",
    weekday: weekday as Weekday,
  })),
  ...[1, 3, 5].map((weekday) => ({
    id: `vitamins-magnesium-${weekday}-0800`,
    planMedicationId: "vitamins-magnesium",
    scheduledTime: "08:00",
    weekday: weekday as Weekday,
  })),
  ...[1, 3, 5].map((weekday) => ({
    id: `vitamins-omega-3-${weekday}-0800`,
    planMedicationId: "vitamins-omega-3",
    scheduledTime: "08:00",
    weekday: weekday as Weekday,
  })),
];

export const checkIns: CheckIn[] = [
  {
    id: "today-anxiety-morning",
    planId: "anxiety-treatment",
    date: daysAgo(0),
    scheduledTime: "08:00",
    completedAt: isoAt(0, 8, 3),
    photoUri: "local://checkins/today-anxiety-morning.jpg",
    status: "completed",
  },
  {
    id: "today-vitamins",
    planId: "vitamins",
    date: daysAgo(0),
    scheduledTime: "08:00",
    status: "pending",
  },
  {
    id: "today-anxiety-night",
    planId: "anxiety-treatment",
    date: daysAgo(0),
    scheduledTime: "22:00",
    status: "pending",
  },
  {
    id: "yesterday-anxiety-morning",
    planId: "anxiety-treatment",
    date: daysAgo(1),
    scheduledTime: "08:00",
    completedAt: isoAt(1, 8, 1),
    photoUri: "local://checkins/yesterday-anxiety-morning.jpg",
    status: "completed",
  },
  {
    id: "yesterday-vitamins",
    planId: "vitamins",
    date: daysAgo(1),
    scheduledTime: "08:00",
    completedAt: isoAt(1, 8, 5),
    photoUri: "local://checkins/yesterday-vitamins.jpg",
    status: "completed",
  },
  {
    id: "yesterday-anxiety-night",
    planId: "anxiety-treatment",
    date: daysAgo(1),
    scheduledTime: "22:00",
    completedAt: isoAt(1, 22, 2),
    photoUri: "local://checkins/yesterday-anxiety-night.jpg",
    status: "completed",
  },
  {
    id: "two-days-anxiety-morning",
    planId: "anxiety-treatment",
    date: daysAgo(2),
    scheduledTime: "08:00",
    status: "missed",
  },
  {
    id: "two-days-anxiety-night",
    planId: "anxiety-treatment",
    date: daysAgo(2),
    scheduledTime: "22:00",
    status: "missed",
  },
  {
    id: "three-days-anxiety-morning",
    planId: "anxiety-treatment",
    date: daysAgo(3),
    scheduledTime: "08:00",
    completedAt: isoAt(3, 8, 7),
    photoUri: "local://checkins/three-days-anxiety-morning.jpg",
    status: "completed",
  },
  {
    id: "three-days-anxiety-night",
    planId: "anxiety-treatment",
    date: daysAgo(3),
    scheduledTime: "22:00",
    status: "missed",
  },
];

export const checkInMedications: CheckInMedication[] = [
  { id: "cim-1", checkInId: "today-anxiety-morning", medicationId: "sertraline", name: "Sertralina", dosage: "50mg", quantity: 1 },
  { id: "cim-2", checkInId: "yesterday-anxiety-morning", medicationId: "sertraline", name: "Sertralina", dosage: "50mg", quantity: 1 },
  { id: "cim-3", checkInId: "yesterday-vitamins", medicationId: "vitamin-d", name: "Vitamina D", dosage: "2000 UI", quantity: 1 },
  { id: "cim-4", checkInId: "yesterday-vitamins", medicationId: "magnesium", name: "Magnesio", dosage: "500mg", quantity: 2 },
  { id: "cim-5", checkInId: "yesterday-vitamins", medicationId: "omega-3", name: "Omega 3", dosage: "1000mg", quantity: 1 },
  { id: "cim-6", checkInId: "yesterday-anxiety-night", medicationId: "melatonin", name: "Melatonina", dosage: "3mg", quantity: 1 },
  { id: "cim-7", checkInId: "three-days-anxiety-morning", medicationId: "sertraline", name: "Sertralina", dosage: "50mg", quantity: 1 },
];

export const planNotes: PlanNote[] = [
  {
    id: "note-anxiety-today",
    planId: "anxiety-treatment",
    createdAt: new Date().toISOString(),
    feeling: "ansioso",
    text: "Acordei mais acelerado hoje, mas consegui manter o check-in da manha.",
  },
  {
    id: "note-anxiety-yesterday",
    planId: "anxiety-treatment",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    feeling: "calmo",
    text: "Dia mais estavel, sem dificuldade para seguir o tratamento.",
  },
];

export function getMedicationDosesForPlan(planId: string, scheduledTime?: string): MedicationDose[] {
  return planMedications
    .filter((item) => item.planId === planId)
    .map((item) => {
      const medication = medications.find((entry) => entry.id === item.medicationId);
      const schedules = planMedicationSchedules.filter(
        (schedule) =>
          schedule.planMedicationId === item.id &&
          (!scheduledTime || schedule.scheduledTime === scheduledTime),
      );

      if (!medication || schedules.length === 0) {
        return undefined;
      }

      return {
        ...medication,
        planMedicationId: item.id,
        quantity: item.quantity,
        scheduledTime: schedules[0].scheduledTime,
        weekdays: Array.from(new Set(schedules.map((schedule) => schedule.weekday))).sort(),
      };
    })
    .filter((item): item is MedicationDose => Boolean(item));
}
