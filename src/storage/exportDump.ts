import {
  CheckIn,
  CheckInMedication,
  Medication,
  Plan,
  PlanMedication,
  PlanMedicationSchedule,
  PlanNote,
} from "@/types/domain";

export type RemederoDump = {
  app: "remedero";
  exportedAt: string;
  version: 1;
  data: {
    plans: Plan[];
    medications: Medication[];
    planMedications: PlanMedication[];
    planMedicationSchedules: PlanMedicationSchedule[];
    planNotes: PlanNote[];
    checkIns: CheckIn[];
    checkInMedications: CheckInMedication[];
  };
};

type Snapshot = RemederoDump["data"];

export function createJsonDumpFromSnapshot(snapshot: Snapshot): string {
  const dump: RemederoDump = {
    app: "remedero",
    exportedAt: new Date().toISOString(),
    version: 1,
    data: snapshot,
  };

  return JSON.stringify(dump, null, 2);
}

export function parseAndValidateDump(json: string): RemederoDump | null {
  try {
    const parsed = JSON.parse(json);

    if (
      parsed?.app !== "remedero" ||
      parsed?.version !== 1 ||
      !parsed?.data
    ) {
      return null;
    }

    return parsed as RemederoDump;
  } catch {
    return null;
  }
}
