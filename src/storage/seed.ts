import {
  checkInMedications,
  checkIns,
  medications,
  planMedicationSchedules,
  planMedications,
  planNotes,
  plans,
} from "@/data/mockData";
import {
  dbInsertCheckIn,
  dbInsertCheckInMedication,
  dbInsertMedication,
  dbInsertPlanMedication,
  dbInsertPlanMedicationSchedule,
  dbInsertPlanNote,
  dbInsertPlan,
} from "@/storage/database";

export function seedDatabase(): void {
  plans.forEach(dbInsertPlan);
  medications.forEach(dbInsertMedication);
  planMedications.forEach(dbInsertPlanMedication);
  planMedicationSchedules.forEach(dbInsertPlanMedicationSchedule);
  checkIns.forEach(dbInsertCheckIn);
  checkInMedications.forEach(dbInsertCheckInMedication);
  planNotes.forEach(dbInsertPlanNote);
}
