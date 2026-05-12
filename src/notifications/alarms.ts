import Constants from "expo-constants";
import { requireNativeModule } from "expo-modules-core";

import { AlarmSettings, DEFAULT_ALARM_SETTINGS, Weekday } from "@/types/domain";
import { startAlarmSound, stopAlarmSound } from "./alarmSound";

export type AlarmSlot = {
  weekday: Weekday;
  scheduledTime: string;
};

export type AlarmNotificationData = {
  planId: string;
  scheduledTime: string;
  weekday: Weekday;
};

export type AlarmNotificationHandlers = {
  onForegroundAlarm?: () => void;
  onOpenAlarm: (alarmData: AlarmNotificationData) => void;
  onSnoozeAlarm?: (alarmData: AlarmNotificationData) => void;
};

type NotificationsModule = typeof import("expo-notifications");

const isExpoGo = Constants.appOwnership === "expo";
let notificationsModule: NotificationsModule | null = null;

function getNotificationsModule(): NotificationsModule | null {
  if (isExpoGo) {
    return null;
  }

  if (!notificationsModule) {
    notificationsModule = require("expo-notifications") as NotificationsModule;
  }

  return notificationsModule;
}

export function areMedicationAlarmsAvailable(): boolean {
  return !isExpoGo;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let AlarmManagerModule: any = null;

function getAlarmManagerModule() {
  if (isExpoGo) return null;
  if (!AlarmManagerModule) {
    try {
      AlarmManagerModule = requireNativeModule("AlarmManagerModule");
    } catch {
      AlarmManagerModule = null;
    }
  }
  return AlarmManagerModule;
}

export async function requestAlarmPermissions(): Promise<boolean> {
  const Notifications = getNotificationsModule();

  if (!Notifications) {
    return false;
  }

  const current = await Notifications.getPermissionsAsync();
  const finalStatus =
    current.status === "granted" ? current : await Notifications.requestPermissionsAsync();

  return finalStatus.status === "granted";
}

export async function getAlarmPermissionStatus(): Promise<string> {
  const Notifications = getNotificationsModule();

  if (!Notifications) {
    return "unavailable";
  }

  const permissions = await Notifications.getPermissionsAsync();
  return permissions.status;
}

export async function playForegroundAlarmSound(): Promise<void> {
  const module = getAlarmManagerModule();
  if (!module) return;

  try {
    const uri: string = await module.getAlarmSoundUri();
    await startAlarmSound(uri);
  } catch {
    // ignore errors
  }
}

export { stopAlarmSound as stopForegroundAlarmSound };

export async function scheduleAlarmsForPlan(
  planId: string,
  planName: string,
  slots: AlarmSlot[],
  settings: AlarmSettings = DEFAULT_ALARM_SETTINGS,
): Promise<void> {
  const module = getAlarmManagerModule();
  if (!module) return;

  if (!settings.enabled) {
    await cancelAlarmsForPlan(planId);
    return;
  }

  await cancelAlarmsForPlan(planId);

  const uniqueSlots = dedupeSlots(slots);

  await Promise.all(
    uniqueSlots.flatMap((slot) => {
      const { hour, minute } = parseScheduledTime(slot.scheduledTime);
      const calls: Promise<void>[] = [];

      for (let retryIndex = 0; retryIndex <= settings.retryCount; retryIndex++) {
        calls.push(
          module.scheduleWeeklyAlarm(
            planId,
            slot.weekday,
            hour,
            minute,
            retryIndex,
            settings.snoozeMinutes,
            planName,
          ) as Promise<void>,
        );
      }

      return calls;
    }),
  );
}

export async function cancelAlarmsForPlan(planId: string): Promise<void> {
  const module = getAlarmManagerModule();
  if (!module) return;

  await module.cancelAllAlarmsForPlan(planId);

  // Also dismiss any presented notifications for this plan
  const Notifications = getNotificationsModule();
  if (Notifications) {
    try {
      const presented = await Notifications.getPresentedNotificationsAsync();
      await Promise.all(
        presented
          .filter((n) => n.request.identifier.startsWith(`alarm-${planId}-`))
          .map((n) => Notifications.dismissNotificationAsync(n.request.identifier)),
      );
    } catch {
      // ignore
    }
  }
}

export async function cancelAlarmsForSlot(
  planId: string,
  weekday: Weekday,
  scheduledTime: string,
  settings: AlarmSettings = DEFAULT_ALARM_SETTINGS,
): Promise<void> {
  const module = getAlarmManagerModule();
  if (!module) return;

  const hhmm = scheduledTime.replace(":", "");
  await module.cancelAlarmsForSlot(planId, weekday, hhmm, settings.retryCount);

  // Dismiss presented notifications for this slot
  const Notifications = getNotificationsModule();
  if (Notifications) {
    try {
      const prefix = `alarm-${planId}-${weekday}-${hhmm}`;
      const presented = await Notifications.getPresentedNotificationsAsync();
      await Promise.all(
        presented
          .filter((n) => n.request.identifier.startsWith(prefix))
          .map((n) => Notifications.dismissNotificationAsync(n.request.identifier)),
      );
    } catch {
      // ignore
    }
  }
}

// No-op in JS: snooze is handled natively by SnoozeReceiver
export async function scheduleSnooze(
  _planId: string,
  _weekday: Weekday,
  _scheduledTime: string,
  _settings?: AlarmSettings,
): Promise<void> {
  return;
}

export function subscribeToAlarmNotifications(handlers: AlarmNotificationHandlers): () => void {
  const module = getAlarmManagerModule();
  if (!module) return () => undefined;

  // Check for a pending alarm that fired while the app was killed
  void (async () => {
    try {
      const pending = await module.getPendingAlarm();
      if (pending && isAlarmNotificationData(pending)) {
        await module.clearPendingAlarm();
        if (pending.weekday === -1) {
          handlers.onSnoozeAlarm?.(pending as AlarmNotificationData);
        } else {
          handlers.onOpenAlarm(pending as AlarmNotificationData);
        }
      }
    } catch {
      // ignore
    }
  })();

  // Subscribe to live events
  const subscription = module.addListener(
    "onAlarmFired",
    (e: { planId: string; scheduledTime: string; weekday: number }) => {
      if (!e || typeof e.planId !== "string") return;

      const data: AlarmNotificationData = {
        planId: e.planId,
        scheduledTime: e.scheduledTime,
        weekday: e.weekday as Weekday,
      };

      if (e.weekday === -1) {
        handlers.onSnoozeAlarm?.(data);
      } else {
        handlers.onOpenAlarm(data);
      }
    },
  );

  return () => {
    subscription.remove();
  };
}

export function parseAlarmNotificationData(
  data: Record<string, unknown> | undefined,
): AlarmNotificationData | null {
  const planId = typeof data?.planId === "string" ? data.planId : null;
  const scheduledTime = typeof data?.scheduledTime === "string" ? data.scheduledTime : null;
  const weekdayNumber =
    typeof data?.weekday === "number"
      ? data.weekday
      : typeof data?.weekday === "string"
        ? Number(data.weekday)
        : NaN;

  if (!planId || !scheduledTime || !isWeekday(weekdayNumber)) {
    return null;
  }

  return {
    planId,
    scheduledTime,
    weekday: weekdayNumber,
  };
}

function isAlarmNotificationData(obj: unknown): obj is AlarmNotificationData {
  if (typeof obj !== "object" || obj === null) return false;
  const d = obj as Record<string, unknown>;
  return typeof d.planId === "string" && typeof d.scheduledTime === "string";
}

function dedupeSlots(slots: AlarmSlot[]): AlarmSlot[] {
  const byKey = new Map<string, AlarmSlot>();

  slots.forEach((slot) => {
    byKey.set(`${slot.weekday}|${slot.scheduledTime}`, slot);
  });

  return [...byKey.values()];
}

function parseScheduledTime(scheduledTime: string): { hour: number; minute: number } {
  const [rawHour, rawMinute] = scheduledTime.split(":");

  return {
    hour: Number(rawHour),
    minute: Number(rawMinute),
  };
}

function isWeekday(value: number): value is Weekday {
  return Number.isInteger(value) && value >= 0 && value <= 6;
}
