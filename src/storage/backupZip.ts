import * as FileSystem from "expo-file-system/legacy";
import JSZip from "jszip";

import { createJsonDumpFromSnapshot, parseAndValidateDump, RemederoDump } from "./exportDump";
import {
  CheckIn,
  CheckInMedication,
  Medication,
  Plan,
  PlanMedication,
  PlanMedicationSchedule,
  PlanNote,
} from "@/types/domain";

const PHOTOS_DIR = `${FileSystem.documentDirectory}checkin-photos/`;
const JSON_ENTRY = "remedero.json";
const PHOTOS_FOLDER = "photos/";

type Snapshot = {
  plans: Plan[];
  medications: Medication[];
  planMedications: PlanMedication[];
  planMedicationSchedules: PlanMedicationSchedule[];
  planNotes: PlanNote[];
  checkIns: CheckIn[];
  checkInMedications: CheckInMedication[];
};

export async function exportBackupZip(snapshot: Snapshot): Promise<string> {
  const zip = new JSZip();

  zip.file(JSON_ENTRY, createJsonDumpFromSnapshot(snapshot));

  for (const checkIn of snapshot.checkIns) {
    if (!checkIn.photoUri) continue;

    const info = await FileSystem.getInfoAsync(checkIn.photoUri);
    if (!info.exists) continue;

    const base64 = await FileSystem.readAsStringAsync(checkIn.photoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const fileName = checkIn.photoUri.split("/").pop() ?? `${checkIn.id}.jpg`;
    zip.file(`${PHOTOS_FOLDER}${fileName}`, base64, { base64: true });
  }

  const zipBase64 = await zip.generateAsync({ type: "base64" });

  const date = new Date().toISOString().slice(0, 10);
  const zipUri = `${FileSystem.cacheDirectory}remedero-backup-${date}.zip`;

  await FileSystem.writeAsStringAsync(zipUri, zipBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return zipUri;
}

export type RestoreResult = {
  dump: RemederoDump;
  photoCount: number;
};

export async function importBackupZip(zipUri: string): Promise<RestoreResult | null> {
  const zipBase64 = await FileSystem.readAsStringAsync(zipUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const zip = await JSZip.loadAsync(zipBase64, { base64: true });

  const jsonFile = zip.file(JSON_ENTRY);
  if (!jsonFile) return null;

  const jsonString = await jsonFile.async("string");
  const dump = parseAndValidateDump(jsonString);
  if (!dump) return null;

  const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }

  let photoCount = 0;

  const photoFiles = zip.folder(PHOTOS_FOLDER);
  if (photoFiles) {
    const entries: Array<{ name: string; file: JSZip.JSZipObject }> = [];

    photoFiles.forEach((relativePath, file) => {
      if (!file.dir) {
        entries.push({ name: relativePath, file });
      }
    });

    for (const { name, file } of entries) {
      const base64 = await file.async("base64");
      await FileSystem.writeAsStringAsync(`${PHOTOS_DIR}${name}`, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      photoCount++;
    }
  }

  return { dump, photoCount };
}
