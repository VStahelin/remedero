import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, BackHandler, Linking, Platform, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import {
  AddMedicationScreen,
  AddPlanMedicationInput,
} from "@/screens/AddMedicationScreen";
import { exportBackupZip, importBackupZip } from "@/storage/backupZip";
import {
  AlarmSlot,
  areMedicationAlarmsAvailable,
  canScheduleExactAlarms,
  cancelAlarmsForPlan,
  cancelAlarmsForSlot,
  getAlarmPermissionStatus,
  openExactAlarmSettings,
  playForegroundAlarmSound,
  requestAlarmPermissions,
  scheduleAlarmsForPlan,
  scheduleTestAlarm,
  stopForegroundAlarmSound,
  subscribeToAlarmNotifications,
} from "@/notifications/alarms";
import { AlarmScreen } from "@/screens/AlarmScreen";
import { CheckInDetailScreen } from "@/screens/CheckInDetailScreen";
import { CheckInScreen } from "@/screens/CheckInScreen";
import { CreatePlanInput, CreatePlanScreen } from "@/screens/CreatePlanScreen";
import { HistoryScreen } from "@/screens/HistoryScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import {
  AddPlanNoteInput,
  PlanDetailScreen,
  PlanMedicationSummary,
  PlanStats,
} from "@/screens/PlanDetailScreen";
import { PlansScreen } from "@/screens/PlansScreen";
import {
  AddCatalogMedicationScreen,
  CatalogMedicationInput,
} from "@/screens/AddCatalogMedicationScreen";
import { AddMoodScreen, MoodLogInput } from "@/screens/AddMoodScreen";
import { MedicationCatalogScreen } from "@/screens/MedicationCatalogScreen";
import { QuickLogInput, QuickLogScreen } from "@/screens/QuickLogScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import {
  dbDeleteCheckInMedicationsByPlanId,
  dbDeleteCheckInsByPlanId,
  dbDeleteMedication,
  dbDeletePlanMedicationSchedulesByPlanMedicationIds,
  dbDeletePlanMedicationsByPlanId,
  dbDeletePlanNotesByPlanId,
  dbClearAllTables,
  dbDeletePlan,
  dbGetAlarmSettings,
  dbGetMoodLogs,
  dbGetQuickLogs,
  dbInsertMoodLog,
  dbInsertQuickLog,
  dbGetCheckInMedications,
  dbGetCheckIns,
  dbGetMedications,
  dbGetPlanMedicationSchedules,
  dbGetPlanMedications,
  dbGetPlanNotes,
  dbGetPlans,
  dbInsertCheckIn,
  dbInsertCheckInMedication,
  dbInsertMedication,
  dbInsertPlanMedication,
  dbInsertPlanMedicationSchedule,
  dbInsertPlanNote,
  dbInsertPlan,
  dbUpdateCheckIn,
  dbUpdateMedication,
  dbUpdateAlarmSettings,
  dbUpdatePlanMedication,
  dbUpdatePlan,
  initializeDatabase,
} from "@/storage/database";
import { TabBar, MainTab } from "@/components/TabBar";
import { colors, spacing } from "@/theme/theme";
import {
  AlarmSettings,
  CheckIn,
  CheckInMedication,
  DEFAULT_ALARM_SETTINGS,
  MedicationDose,
  MoodLog,
  QuickLog,
  Weekday,
} from "@/types/domain";

type AppView =
  | MainTab
  | "alarm"
  | "checkin"
  | "createPlan"
  | "editPlan"
  | "planDetail"
  | "addMedication"
  | "editMedication"
  | "quickLog"
  | "medicationCatalog"
  | "addCatalogMedication"
  | "editCatalogMedication"
  | "addMood"
  | "checkInDetail";

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

function AppShell() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [navigationStack, setNavigationStack] = useState<AppView[]>(["home"]);
  const [plans, setPlans] = useState<ReturnType<typeof dbGetPlans>>([]);
  const [medications, setMedications] = useState<ReturnType<typeof dbGetMedications>>([]);
  const [planMedications, setPlanMedications] = useState<ReturnType<typeof dbGetPlanMedications>>([]);
  const [planMedicationSchedules, setPlanMedicationSchedules] = useState<
    ReturnType<typeof dbGetPlanMedicationSchedules>
  >([]);
  const [checkIns, setCheckIns] = useState<ReturnType<typeof dbGetCheckIns>>([]);
  const [checkInMedications, setCheckInMedications] = useState<
    ReturnType<typeof dbGetCheckInMedications>
  >([]);
  const [planNotes, setPlanNotes] = useState<ReturnType<typeof dbGetPlanNotes>>([]);
  const [quickLogs, setQuickLogs] = useState<ReturnType<typeof dbGetQuickLogs>>([]);
  const [moodLogs, setMoodLogs] = useState<ReturnType<typeof dbGetMoodLogs>>([]);
  const [alarmSettings, setAlarmSettings] =
    useState<AlarmSettings>(DEFAULT_ALARM_SETTINGS);
  const [alarmPermissionStatus, setAlarmPermissionStatus] = useState("undetermined");
  const [exactAlarmGranted, setExactAlarmGranted] = useState(false);
  const [alarmInfo, setAlarmInfo] = useState<{ planId: string; scheduledTime: string; planName: string } | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(null);
  const [selectedPlanMedicationId, setSelectedPlanMedicationId] = useState<string | null>(null);
  const [selectedCatalogMedicationId, setSelectedCatalogMedicationId] = useState<string | null>(null);
  const [selectedCheckInSlot, setSelectedCheckInSlot] = useState<{
    planId: string;
    scheduledTime: string;
  } | null>(null);
  const insets = useSafeAreaInsets();
  const view = navigationStack[navigationStack.length - 1] ?? "home";

  useEffect(() => {
    initializeDatabase();

    setPlans(dbGetPlans());
    setMedications(dbGetMedications());
    setPlanMedications(dbGetPlanMedications());
    setPlanMedicationSchedules(dbGetPlanMedicationSchedules());
    setCheckIns(dbGetCheckIns());
    setCheckInMedications(dbGetCheckInMedications());
    setPlanNotes(dbGetPlanNotes());
    setQuickLogs(dbGetQuickLogs());
    setMoodLogs(dbGetMoodLogs());
    setAlarmSettings(dbGetAlarmSettings());

    setIsDbReady(true);
  }, []);

  useEffect(() => {
    if (!areMedicationAlarmsAvailable()) {
      setAlarmPermissionStatus("unavailable");
      return;
    }

    void (async () => {
      const granted = alarmSettings.enabled ? await requestAlarmPermissions() : true;
      setAlarmPermissionStatus(await getAlarmPermissionStatus());
      setExactAlarmGranted(await canScheduleExactAlarms());

      if (alarmSettings.enabled && !granted) {
        Alert.alert(
          "Permissao de notificacao",
          "Ative as notificacoes para receber os alarmes dos check-ins.",
        );
      }
    })().catch(() => {
      Alert.alert("Alarmes indisponiveis", "Nao foi possivel configurar os alarmes agora.");
    });
  }, [alarmSettings]);

  useEffect(() => {
    if (isDbReady && plans.length > 0 && selectedPlanId === null) {
      setSelectedPlanId(plans[0].id);
    }
  }, [isDbReady, plans, selectedPlanId]);

  const today = formatDate(new Date());
  const todayWeekday = new Date().getDay() as Weekday;

  // All { planId, scheduledTime } slots scheduled for today's weekday
  const todaySlots = useMemo(() => {
    return plans
      .flatMap((plan) => {
        const planMedIds = new Set(
          planMedications.filter((pm) => pm.planId === plan.id).map((pm) => pm.id),
        );
        const times = Array.from(
          new Set(
            planMedicationSchedules
              .filter((s) => planMedIds.has(s.planMedicationId) && s.weekday === todayWeekday)
              .map((s) => s.scheduledTime),
          ),
        );
        return times.map((time) => ({ planId: plan.id, scheduledTime: time }));
      })
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [plans, planMedications, planMedicationSchedules, todayWeekday]);

  const todayCheckIns = useMemo(
    () => checkIns.filter((ci) => ci.date === today),
    [checkIns, today],
  );

  const completedSlotKeys = useMemo(
    () =>
      new Set(
        todayCheckIns
          .filter((ci) => ci.status === "completed")
          .map((ci) => `${ci.planId}|${ci.scheduledTime}`),
      ),
    [todayCheckIns],
  );

  const nextSlot = useMemo(
    () => todaySlots.find((s) => !completedSlotKeys.has(`${s.planId}|${s.scheduledTime}`)),
    [todaySlots, completedSlotKeys],
  );

  const nextPlan = useMemo(
    () => (nextSlot ? (plans.find((p) => p.id === nextSlot.planId) ?? null) : null),
    [nextSlot, plans],
  );

  const nextScheduledTime = nextSlot?.scheduledTime ?? "--:--";

  const todayEntries = useMemo(
    () =>
      todaySlots.map((slot) => {
        const plan = plans.find((p) => p.id === slot.planId);
        const checkIn = todayCheckIns.find(
          (ci) => ci.planId === slot.planId && ci.scheduledTime === slot.scheduledTime,
        );
        return {
          checkInId: checkIn?.id ?? null,
          planName: plan?.name ?? "",
          scheduledTime: slot.scheduledTime,
          status: (checkIn?.status ?? "pending") as "completed" | "pending" | "missed",
        };
      }),
    [todaySlots, plans, todayCheckIns],
  );

  const todayCompleted = useMemo(
    () => todayEntries.filter((e) => e.status === "completed").length,
    [todayEntries],
  );

  const getMedicationDosesForPlan = useCallback(
    (planId: string, scheduledTime?: string): MedicationDose[] =>
      planMedications
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
            weekdays: Array.from(new Set(schedules.map((schedule) => schedule.weekday))).sort(
              (first, second) => first - second,
            ),
          } satisfies MedicationDose;
        })
        .filter((item): item is MedicationDose => Boolean(item)),
    [medications, planMedicationSchedules, planMedications],
  );

  const getPlanScheduleTimes = useCallback(
    (planId: string) => {
      const planMedicationIds = new Set(
        planMedications.filter((item) => item.planId === planId).map((item) => item.id),
      );

      return Array.from(
        new Set(
          planMedicationSchedules
            .filter((schedule) => planMedicationIds.has(schedule.planMedicationId))
            .map((schedule) => schedule.scheduledTime),
        ),
      ).sort();
    },
    [planMedicationSchedules, planMedications],
  );

  const getAlarmSlotsForPlan = useCallback(
    (planId: string): AlarmSlot[] => {
      const planMedicationIds = new Set(
        planMedications.filter((item) => item.planId === planId).map((item) => item.id),
      );
      const slotMap = new Map<string, AlarmSlot>();

      planMedicationSchedules
        .filter((schedule) => planMedicationIds.has(schedule.planMedicationId))
        .forEach((schedule) => {
          slotMap.set(`${schedule.weekday}|${schedule.scheduledTime}`, {
            scheduledTime: schedule.scheduledTime,
            weekday: schedule.weekday,
          });
        });

      return [...slotMap.values()];
    },
    [planMedicationSchedules, planMedications],
  );

  const getPlanMedicationSummaries = useCallback(
    (planId: string): PlanMedicationSummary[] =>
      planMedications
        .filter((item) => item.planId === planId)
        .map((item) => {
          const medication = medications.find((entry) => entry.id === item.medicationId);
          const schedules = planMedicationSchedules.filter(
            (schedule) => schedule.planMedicationId === item.id,
          );

          if (!medication || schedules.length === 0) {
            return undefined;
          }

          return {
            ...medication,
            planMedicationId: item.id,
            quantity: item.quantity,
            schedules: schedules
              .map((schedule) => ({
                scheduledTime: schedule.scheduledTime,
                weekday: schedule.weekday,
              }))
              .sort(
                (first, second) =>
                  first.weekday - second.weekday ||
                  first.scheduledTime.localeCompare(second.scheduledTime),
              ),
          } satisfies PlanMedicationSummary;
        })
        .filter((item): item is PlanMedicationSummary => Boolean(item)),
    [medications, planMedicationSchedules, planMedications],
  );

  const getPlanStats = useCallback(
    (planId: string): PlanStats => {
      const plan = plans.find((p) => p.id === planId);
      const planCheckIns = checkIns.filter((checkIn) => checkIn.planId === planId);
      const completedCheckIns = planCheckIns.filter(
        (checkIn) => checkIn.status === "completed",
      ).length;
      const missedCheckIns = planCheckIns.filter((checkIn) => checkIn.status === "missed").length;
      const pendingCheckIns = planCheckIns.filter((checkIn) => checkIn.status === "pending").length;
      const finishedCheckIns = completedCheckIns + missedCheckIns;
      const planMedicationIds = new Set(
        planMedications.filter((item) => item.planId === planId).map((item) => item.id),
      );
      const medicationCount = planMedicationIds.size;
      const scheduleCount = planMedicationSchedules.filter((schedule) =>
        planMedicationIds.has(schedule.planMedicationId),
      ).length;

      const startDate = plan?.startDate ?? new Date().toISOString().split("T")[0];
      const totalDays = plan?.durationDays ?? null;

      const todayMs = new Date().setHours(0, 0, 0, 0);
      const startMs = new Date(startDate + "T00:00:00").getTime();
      const daysElapsed = Math.max(0, Math.floor((todayMs - startMs) / 86400000));

      const progressPercent =
        totalDays != null ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : null;

      const endDate =
        totalDays != null
          ? (() => {
              const d = new Date(startDate + "T00:00:00");
              d.setDate(d.getDate() + totalDays - 1);
              return d.toISOString().split("T")[0];
            })()
          : null;

      return {
        totalCheckIns: planCheckIns.length,
        completedCheckIns,
        missedCheckIns,
        pendingCheckIns,
        completionRate:
          finishedCheckIns === 0 ? 0 : Math.round((completedCheckIns / finishedCheckIns) * 100),
        medicationCount,
        scheduleCount,
        progressPercent,
        daysElapsed,
        totalDays,
        endDate,
        startDate,
      };
    },
    [checkIns, planMedicationSchedules, planMedications, plans],
  );

  const nextDoses = useMemo(
    () => (nextPlan && nextSlot ? getMedicationDosesForPlan(nextPlan.id, nextSlot.scheduledTime) : []),
    [getMedicationDosesForPlan, nextPlan, nextSlot],
  );

  const nextPlanProgress = useMemo(() => {
    if (!nextPlan) return null;
    const s = getPlanStats(nextPlan.id);
    return {
      completionRate: s.completionRate,
      progressPercent: s.progressPercent,
      daysElapsed: s.daysElapsed,
      totalDays: s.totalDays,
    };
  }, [nextPlan, getPlanStats]);

  const activeCheckInSlot = selectedCheckInSlot ?? nextSlot ?? null;
  const activeCheckInPlan = useMemo(
    () =>
      activeCheckInSlot
        ? (plans.find((plan) => plan.id === activeCheckInSlot.planId) ?? null)
        : null,
    [activeCheckInSlot, plans],
  );
  const activeCheckInDoses = useMemo(
    () =>
      activeCheckInSlot
        ? getMedicationDosesForPlan(activeCheckInSlot.planId, activeCheckInSlot.scheduledTime)
        : [],
    [activeCheckInSlot, getMedicationDosesForPlan],
  );


  const navigateTo = useCallback((nextView: AppView) => {
    setNavigationStack((currentStack) => {
      const currentView = currentStack[currentStack.length - 1] ?? "home";

      if (nextView === currentView) {
        return currentStack;
      }

      if (nextView === "home") {
        return ["home"];
      }

      return [...currentStack, nextView];
    });
  }, []);

  const openCheckInSlot = useCallback(
    (slot: { planId: string; scheduledTime: string }) => {
      setSelectedCheckInSlot(slot);
      setSelectedPlanId(slot.planId);
      navigateTo("checkin");
    },
    [navigateTo],
  );

  const goBack = useCallback(() => {
    setNavigationStack((currentStack) => {
      if (currentStack.length <= 1) {
        return currentStack;
      }

      return currentStack.slice(0, -1);
    });
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (view === "home") {
        return false;
      }

      goBack();
      return true;
    });

    return () => subscription.remove();
  }, [goBack, view]);

  useEffect(() => {
    if (view !== "checkin" && selectedCheckInSlot) {
      setSelectedCheckInSlot(null);
    }
  }, [selectedCheckInSlot, view]);

  useEffect(() => {
    return subscribeToAlarmNotifications({
      onOpenAlarm: (alarmData) => {
        const plan = plans.find((p) => p.id === alarmData.planId);
        setAlarmInfo({
          planId: alarmData.planId,
          scheduledTime: alarmData.scheduledTime,
          planName: plan?.name ?? "",
        });
        navigateTo("alarm");
        void playForegroundAlarmSound();
      },
      onSnoozeAlarm: (_alarmData) => {
        void stopForegroundAlarmSound();
        setAlarmInfo(null);
        navigateTo("home");
      },
    });
  }, [navigateTo, plans]);

  useEffect(() => {
    if (!isDbReady) {
      return;
    }

    if (!alarmSettings.enabled) {
      void Promise.all(plans.map((plan) => cancelAlarmsForPlan(plan.id))).catch(() => undefined);
      return;
    }

    void Promise.all(
      plans
        .filter((plan) => plan.isActive)
        .map((plan) =>
          scheduleAlarmsForPlan(plan.id, plan.name, getAlarmSlotsForPlan(plan.id), alarmSettings),
        ),
    ).catch(() => undefined);
  }, [alarmSettings, getAlarmSlotsForPlan, isDbReady, plans]);

  async function handleExport() {
    const zipUri = await exportBackupZip({
      checkInMedications,
      checkIns,
      medications,
      planMedications,
      planMedicationSchedules,
      planNotes,
      plans,
    });

    const date = new Date().toISOString().slice(0, 10);
    const fileName = `remedero-backup-${date}.zip`;

    if (Platform.OS === "android") {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) return;

      const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        "application/zip",
      );

      const zipBase64 = await FileSystem.readAsStringAsync(zipUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await FileSystem.writeAsStringAsync(destUri, zipBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert("Backup salvo", `Arquivo salvo como ${fileName}`);
    } else {
      await Sharing.shareAsync(zipUri, {
        mimeType: "application/zip",
        dialogTitle: "Salvar backup Remedero",
      });
    }
  }

  async function handleImport() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/zip", "application/x-zip-compressed"],
      copyToCacheDirectory: true,
    });

    if (result.canceled || result.assets.length === 0) return;

    const restored = await importBackupZip(result.assets[0].uri);

    if (!restored) {
      Alert.alert("Arquivo invalido", "O arquivo selecionado nao e um backup valido do Remedero.");
      return;
    }

    const { dump, photoCount } = restored;

    Alert.alert(
      "Importar backup",
      `${dump.data.plans.length} planos, ${dump.data.checkIns.length} check-ins e ${photoCount} fotos encontrados.\n\nTodos os dados atuais serao substituidos.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Importar",
          style: "destructive",
          onPress: () => {
            dbClearAllTables();

            dump.data.plans.forEach(dbInsertPlan);
            dump.data.medications.forEach(dbInsertMedication);
            dump.data.planMedications.forEach(dbInsertPlanMedication);
            dump.data.planMedicationSchedules.forEach(dbInsertPlanMedicationSchedule);
            dump.data.checkIns.forEach(dbInsertCheckIn);
            dump.data.checkInMedications.forEach(dbInsertCheckInMedication);
            dump.data.planNotes.forEach(dbInsertPlanNote);

            setPlans(dbGetPlans());
            setMedications(dbGetMedications());
            setPlanMedications(dbGetPlanMedications());
            setPlanMedicationSchedules(dbGetPlanMedicationSchedules());
            setCheckIns(dbGetCheckIns());
            setCheckInMedications(dbGetCheckInMedications());
            setPlanNotes(dbGetPlanNotes());
            setAlarmSettings(dbGetAlarmSettings());

            setSelectedPlanId(null);
            setNavigationStack(["home"]);
          },
        },
      ],
    );
  }

  function handleUpdateAlarmSettings(nextSettings: AlarmSettings) {
    dbUpdateAlarmSettings(nextSettings);
    setAlarmSettings(nextSettings);
  }

  async function handleRequestAlarmPermission() {
    if (!areMedicationAlarmsAvailable()) {
      setAlarmPermissionStatus("unavailable");
      Alert.alert(
        "Alarmes no Expo Go",
        "O Expo Go nao suporta esses alarmes no Android. Instale uma development build ou APK para testar notificacoes.",
      );
      return;
    }

    const granted = await requestAlarmPermissions();
    setAlarmPermissionStatus(await getAlarmPermissionStatus());
    setExactAlarmGranted(await canScheduleExactAlarms());

    if (!granted) {
      Alert.alert(
        "Permissao necessaria",
        "Ative as notificacoes para receber os alarmes dos check-ins.",
      );
    }
  }

  function handleOpenAlarmSystemSettings() {
    void Linking.openSettings();
  }

  async function handleTestAlarm() {
    const hasExactPermission = await canScheduleExactAlarms();
    if (!hasExactPermission) {
      Alert.alert(
        "Permissao necessaria",
        'Ative "Alarmes e lembretes" para o Remedero nas configuracoes do Android. Isso e diferente da permissao de notificacoes.',
        [
          { text: "Fechar", style: "cancel" },
          { text: "Abrir configuracoes", onPress: () => void openExactAlarmSettings() },
        ],
      );
      return;
    }

    const scheduled = await scheduleTestAlarm(5);
    if (scheduled) {
      Alert.alert(
        "Alarme de teste",
        "O alarme vai disparar em 5 segundos. Pode fechar o app para testar a notificacao.",
        [{ text: "OK" }],
      );
    } else {
      Alert.alert(
        "Nao foi possivel agendar",
        "Permissao concedida mas o agendamento falhou. Verifique se o app nao esta sendo bloqueado pela otimizacao de bateria do fabricante.",
        [
          { text: "Fechar", style: "cancel" },
          { text: "Configs de bateria", onPress: () => void Linking.openSettings() },
        ],
      );
    }
  }

  function handleClearData() {
    void Promise.all(plans.map((plan) => cancelAlarmsForPlan(plan.id)));
    dbClearAllTables();
    setPlans([]);
    setMedications([]);
    setPlanMedications([]);
    setPlanMedicationSchedules([]);
    setCheckIns([]);
    setCheckInMedications([]);
    setPlanNotes([]);
    setQuickLogs([]);
    setMoodLogs([]);
    setAlarmSettings(DEFAULT_ALARM_SETTINGS);
    setSelectedPlanId(null);
    setNavigationStack(["home"]);
  }

  function handleCreatePlan(input: CreatePlanInput) {
    const timestamp = Date.now();
    const planId = `plan-${timestamp}`;
    const plan = {
      id: planId,
      name: input.name,
      description: input.description,
      isActive: true,
      startDate: input.startDate,
      durationDays: input.durationDays,
    };

    dbInsertPlan(plan);
    setPlans((currentPlans) => [...currentPlans, plan]);
    setSelectedPlanId(planId);
    setNavigationStack(["home", "plans", "planDetail"]);
  }

  function handleEditSelectedPlan(input: CreatePlanInput) {
    if (!selectedPlanId) {
      return;
    }

    setPlans((currentPlans) =>
      currentPlans.map((plan) => {
        if (plan.id !== selectedPlanId) {
          return plan;
        }

        const updated = {
          ...plan,
          name: input.name,
          description: input.description,
          startDate: input.startDate,
          durationDays: input.durationDays,
        };
        dbUpdatePlan(updated);

        return updated;
      }),
    );
    setNavigationStack(["home", "plans", "planDetail"]);
  }

  function handleAddMedicationToSelectedPlan(input: AddPlanMedicationInput) {
    if (!selectedPlanId) return;

    const planMedicationId = `plan-medication-${Date.now()}`;
    const planMedication = {
      id: planMedicationId,
      planId: selectedPlanId,
      medicationId: input.medicationId,
      quantity: input.quantity,
    };

    const schedules = input.schedules.map((schedule) => ({
      id: `${planMedicationId}-${schedule.weekday}-${schedule.scheduledTime}`,
      planMedicationId,
      scheduledTime: schedule.scheduledTime,
      weekday: schedule.weekday,
    }));

    dbInsertPlanMedication(planMedication);
    schedules.forEach(dbInsertPlanMedicationSchedule);

    setPlanMedications((current) => [...current, planMedication]);
    setPlanMedicationSchedules((current) => [...current, ...schedules]);
    setNavigationStack(["home", "plans", "planDetail"]);
  }

  function handleDeleteSelectedPlan() {
    if (!selectedPlanId) {
      return;
    }

    const planIdToDelete = selectedPlanId;

    Alert.alert("Excluir plano", "Deseja excluir este plano e suas relacoes locais?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          void cancelAlarmsForPlan(planIdToDelete);

          const planMedicationIds = new Set(
            planMedications
              .filter((item) => item.planId === planIdToDelete)
              .map((item) => item.id),
          );

          dbDeleteCheckInMedicationsByPlanId(planIdToDelete);
          dbDeleteCheckInsByPlanId(planIdToDelete);
          dbDeletePlanMedicationSchedulesByPlanMedicationIds([...planMedicationIds]);
          dbDeletePlanMedicationsByPlanId(planIdToDelete);
          dbDeletePlanNotesByPlanId(planIdToDelete);
          dbDeletePlan(planIdToDelete);

          setPlans((current) => current.filter((plan) => plan.id !== planIdToDelete));
          setPlanMedications((current) =>
            current.filter((item) => item.planId !== planIdToDelete),
          );
          setPlanMedicationSchedules((current) =>
            current.filter((schedule) => !planMedicationIds.has(schedule.planMedicationId)),
          );
          setPlanNotes((current) => current.filter((note) => note.planId !== planIdToDelete));
          setCheckIns((current) => current.filter((ci) => ci.planId !== planIdToDelete));
          setCheckInMedications((current) =>
            current.filter(
              (cim) =>
                !checkIns.some(
                  (ci) => ci.id === cim.checkInId && ci.planId === planIdToDelete,
                ),
            ),
          );
          setSelectedPlanId(null);
          setNavigationStack(["home", "plans"]);
        },
      },
    ]);
  }

  function handleAddNoteToSelectedPlan(input: AddPlanNoteInput) {
    if (!selectedPlanId) {
      return;
    }

    const note = {
      id: `plan-note-${Date.now()}`,
      planId: selectedPlanId,
      createdAt: new Date().toISOString(),
      feeling: input.feeling,
      text: input.text,
    };

    dbInsertPlanNote(note);
    setPlanNotes((current) => [note, ...current]);
  }

  async function handleCompleteCheckIn(
    planId: string,
    scheduledTime: string,
    tempPhotoUri: string,
    doses: MedicationDose[],
  ) {
    const checkInId = (() => {
      const pending = checkIns.find(
        (ci) =>
          ci.planId === planId &&
          ci.scheduledTime === scheduledTime &&
          ci.date === formatDate(new Date()) &&
          ci.status === "pending",
      );
      return pending?.id ?? `checkin-${Date.now()}`;
    })();

    const photosDir = `${FileSystem.documentDirectory}checkin-photos/`;
    const dirInfo = await FileSystem.getInfoAsync(photosDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });
    }

    const permanentUri = `${photosDir}${checkInId}.jpg`;
    await FileSystem.copyAsync({ from: tempPhotoUri, to: permanentUri });

    const todayStr = formatDate(new Date());
    const completedAt = new Date().toISOString();

    const pendingCheckIn = checkIns.find((ci) => ci.id === checkInId);

    if (pendingCheckIn) {
      const updated: CheckIn = {
        ...pendingCheckIn,
        completedAt,
        photoUri: permanentUri,
        status: "completed",
      };
      dbUpdateCheckIn(updated);
      setCheckIns((current) => current.map((ci) => (ci.id === checkInId ? updated : ci)));
    } else {
      const newCheckIn: CheckIn = {
        id: checkInId,
        planId,
        date: todayStr,
        scheduledTime,
        completedAt,
        photoUri: permanentUri,
        status: "completed",
      };
      dbInsertCheckIn(newCheckIn);
      setCheckIns((current) => [...current, newCheckIn]);
    }

    const snapshots: CheckInMedication[] = doses.map((dose, index) => ({
      id: `cim-${Date.now()}-${index}`,
      checkInId,
      medicationId: dose.id,
      name: dose.name,
      dosage: dose.dosage,
      quantity: dose.quantity,
    }));

    snapshots.forEach(dbInsertCheckInMedication);
    setCheckInMedications((current) => [...current, ...snapshots]);
    await cancelAlarmsForSlot(planId, new Date().getDay() as Weekday, scheduledTime, alarmSettings);
  }

  function handleEditMedicationInSelectedPlan(input: AddPlanMedicationInput) {
    if (!selectedPlanMedicationId) return;

    const planMedication = planMedications.find((pm) => pm.id === selectedPlanMedicationId);
    if (!planMedication) return;

    const updatedPlanMedication = {
      ...planMedication,
      medicationId: input.medicationId,
      quantity: input.quantity,
    };

    dbUpdatePlanMedication(updatedPlanMedication);
    setPlanMedications((current) =>
      current.map((pm) => (pm.id === selectedPlanMedicationId ? updatedPlanMedication : pm)),
    );

    dbDeletePlanMedicationSchedulesByPlanMedicationIds([selectedPlanMedicationId]);
    setPlanMedicationSchedules((current) =>
      current.filter((s) => s.planMedicationId !== selectedPlanMedicationId),
    );

    const newSchedules = input.schedules.map((schedule) => ({
      id: `${selectedPlanMedicationId}-${schedule.weekday}-${schedule.scheduledTime}`,
      planMedicationId: selectedPlanMedicationId,
      scheduledTime: schedule.scheduledTime,
      weekday: schedule.weekday,
    }));

    newSchedules.forEach(dbInsertPlanMedicationSchedule);
    setPlanMedicationSchedules((current) => [...current, ...newSchedules]);

    setNavigationStack(["home", "plans", "planDetail"]);
  }

  function openEditMedication(planMedicationId: string) {
    setSelectedPlanMedicationId(planMedicationId);
    navigateTo("editMedication");
  }

  function openPlan(planId: string) {
    setSelectedPlanId(planId);
    navigateTo("planDetail");
  }

  function handleAddCatalogMedication(input: CatalogMedicationInput) {
    const id = `medication-${Date.now()}`;
    const medication = {
      id,
      name: input.name,
      dosage: input.dosage,
      type: input.type,
      description: input.description || undefined,
    };

    dbInsertMedication(medication);
    setMedications((current) => [...current, medication]);
    navigateTo("medicationCatalog");
  }

  function handleEditCatalogMedication(input: CatalogMedicationInput) {
    if (!selectedCatalogMedicationId) return;

    setMedications((current) =>
      current.map((m) => {
        if (m.id !== selectedCatalogMedicationId) return m;
        const updated = {
          ...m,
          name: input.name,
          dosage: input.dosage,
          type: input.type,
          description: input.description || undefined,
        };
        dbUpdateMedication(updated);
        return updated;
      }),
    );
    setSelectedCatalogMedicationId(null);
    navigateTo("medicationCatalog");
  }

  function handleDeleteCatalogMedication(medicationId: string) {
    const inUseCount = planMedications.filter((pm) => pm.medicationId === medicationId).length;

    if (inUseCount > 0) {
      Alert.alert(
        "Remedio em uso",
        `Este remedio esta vinculado a ${inUseCount} plano${inUseCount > 1 ? "s" : ""}. Remova-o dos planos antes de excluir do catalogo.`,
      );
      return;
    }

    dbDeleteMedication(medicationId);
    setMedications((current) => current.filter((m) => m.id !== medicationId));
  }

  function handleAddMood(input: MoodLogInput) {
    const log: MoodLog = {
      id: `mood-${Date.now()}`,
      createdAt: new Date().toISOString(),
      feeling: input.feeling,
      text: input.text || undefined,
      planId: input.planId ?? undefined,
    };

    dbInsertMoodLog(log);
    setMoodLogs((current) => [log, ...current]);
    goBack();
  }

  function handleQuickLog(input: QuickLogInput) {
    const log: QuickLog = {
      id: `quicklog-${Date.now()}`,
      medicationName: input.medicationName,
      dosage: input.dosage,
      takenAt: input.takenAt,
      notes: input.notes || undefined,
    };

    dbInsertQuickLog(log);
    setQuickLogs((current) => [log, ...current]);
    navigateTo("home");
  }

  if (!isDbReady) {
    return null;
  }

  function renderContent() {
    if (view === "alarm" && alarmInfo) {
      return (
        <AlarmScreen
          planName={alarmInfo.planName}
          scheduledTime={alarmInfo.scheduledTime}
          onRegister={async () => {
            await stopForegroundAlarmSound();
            setAlarmInfo(null);
            openCheckInSlot({ planId: alarmInfo.planId, scheduledTime: alarmInfo.scheduledTime });
          }}
          onSnooze={() => {
            void stopForegroundAlarmSound();
            setAlarmInfo(null);
            navigateTo("home");
          }}
        />
      );
    }

    if (view === "checkin" && activeCheckInPlan && activeCheckInSlot) {
      return (
        <CheckInScreen
          doses={activeCheckInDoses}
          onCancel={() => {
            setSelectedCheckInSlot(null);
            navigateTo("home");
          }}
          onComplete={async (photoUri) => {
            await handleCompleteCheckIn(
              activeCheckInPlan.id,
              activeCheckInSlot.scheduledTime,
              photoUri,
              activeCheckInDoses,
            );
            setSelectedCheckInSlot(null);
            navigateTo("home");
          }}
          plan={activeCheckInPlan}
          scheduledTime={activeCheckInSlot.scheduledTime}
        />
      );
    }

    if (view === "quickLog") {
      return <QuickLogScreen catalogMedications={medications} onCancel={goBack} onSubmit={handleQuickLog} />;
    }

    if (view === "addMood") {
      return <AddMoodScreen onCancel={goBack} onSubmit={handleAddMood} plans={plans} />;
    }

    if (view === "createPlan") {
      return <CreatePlanScreen onCancel={goBack} onSubmit={handleCreatePlan} />;
    }

    if (view === "editPlan") {
      const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

      if (!selectedPlan) {
        return null;
      }

      return (
        <CreatePlanScreen
          initialValues={{
            description: selectedPlan.description,
            durationDays: selectedPlan.durationDays,
            name: selectedPlan.name,
            startDate: selectedPlan.startDate,
          }}
          mode="edit"
          onCancel={goBack}
          onSubmit={handleEditSelectedPlan}
        />
      );
    }

    if (view === "addMedication") {
      const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

      if (!selectedPlan) {
        return null;
      }

      return (
        <AddMedicationScreen
          catalogMedications={medications}
          onCancel={goBack}
          onCreateMedication={() => navigateTo("addCatalogMedication")}
          onSubmit={handleAddMedicationToSelectedPlan}
          plan={selectedPlan}
        />
      );
    }

    if (view === "editMedication") {
      const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
      const planMedSummary = selectedPlanMedicationId
        ? getPlanMedicationSummaries(selectedPlanId ?? "").find(
            (m) => m.planMedicationId === selectedPlanMedicationId,
          )
        : undefined;

      if (!selectedPlan || !planMedSummary) {
        return null;
      }

      return (
        <AddMedicationScreen
          catalogMedications={medications}
          initialValues={{
            medicationId: planMedSummary.id,
            quantity: planMedSummary.quantity,
            schedules: planMedSummary.schedules,
          }}
          mode="edit"
          onCancel={goBack}
          onCreateMedication={() => navigateTo("addCatalogMedication")}
          onSubmit={handleEditMedicationInSelectedPlan}
          plan={selectedPlan}
        />
      );
    }

    if (view === "medicationCatalog") {
      return (
        <MedicationCatalogScreen
          medications={medications}
          onAdd={() => navigateTo("addCatalogMedication")}
          onBack={goBack}
          onDelete={handleDeleteCatalogMedication}
          onEdit={(med) => {
            setSelectedCatalogMedicationId(med.id);
            navigateTo("editCatalogMedication");
          }}
        />
      );
    }

    if (view === "addCatalogMedication") {
      return (
        <AddCatalogMedicationScreen
          onCancel={goBack}
          onSubmit={handleAddCatalogMedication}
        />
      );
    }

    if (view === "editCatalogMedication") {
      const med = medications.find((m) => m.id === selectedCatalogMedicationId);
      if (!med) return null;

      return (
        <AddCatalogMedicationScreen
          initialValues={{
            name: med.name,
            dosage: med.dosage,
            type: med.type,
            description: med.description ?? "",
          }}
          mode="edit"
          onCancel={goBack}
          onSubmit={handleEditCatalogMedication}
        />
      );
    }

    if (view === "planDetail") {
      const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

      if (!selectedPlan) {
        return null;
      }

      return (
        <PlanDetailScreen
          medications={getPlanMedicationSummaries(selectedPlan.id)}
          notes={planNotes.filter((note) => note.planId === selectedPlan.id)}
          onAddMedicationPress={() => navigateTo("addMedication")}
          onAddNote={handleAddNoteToSelectedPlan}
          onBack={goBack}
          onDeletePlan={handleDeleteSelectedPlan}
          onEditMedication={openEditMedication}
          onEditPlan={() => navigateTo("editPlan")}
          plan={selectedPlan}
          stats={getPlanStats(selectedPlan.id)}
        />
      );
    }

    if (view === "plans") {
      return (
        <PlansScreen
          getMedicationCount={(planId) =>
            new Set(
              planMedications
                .filter((item) => item.planId === planId)
                .map((item) => item.medicationId),
            ).size
          }
          getNextTime={(planId) => getPlanScheduleTimes(planId)[0] ?? "--:--"}
          getScheduleCount={(planId) => getPlanScheduleTimes(planId).length}
          onCreatePlan={() => navigateTo("createPlan")}
          onOpenPlan={openPlan}
          plans={plans}
        />
      );
    }

    if (view === "checkInDetail") {
      const checkIn = checkIns.find((ci) => ci.id === selectedCheckInId);
      if (!checkIn) return null;
      const ciPlan = plans.find((p) => p.id === checkIn.planId);
      const ciMedications = checkInMedications.filter((m) => m.checkInId === checkIn.id);
      return (
        <CheckInDetailScreen
          checkIn={checkIn}
          medications={ciMedications}
          onBack={goBack}
          plan={ciPlan}
        />
      );
    }

    if (view === "history") {
      return (
        <HistoryScreen
          checkIns={checkIns}
          getDosesForCheckIn={(planId, scheduledTime) =>
            getMedicationDosesForPlan(planId, scheduledTime)
          }
          moodLogs={moodLogs}
          onAddMood={() => navigateTo("addMood")}
          onOpenCheckIn={(id) => {
            setSelectedCheckInId(id);
            navigateTo("checkInDetail");
          }}
          onQuickLog={() => navigateTo("quickLog")}
          plans={plans}
          quickLogs={quickLogs}
        />
      );
    }

    if (view === "settings") {
      return (
        <SettingsScreen
          alarmPermissionStatus={alarmPermissionStatus}
          alarmSettings={alarmSettings}
          exactAlarmGranted={exactAlarmGranted}
          onClearData={handleClearData}
          onExport={handleExport}
          onImport={handleImport}
          onOpenAlarmSystemSettings={handleOpenAlarmSystemSettings}
          onOpenCatalog={() => navigateTo("medicationCatalog")}
          onRequestAlarmPermission={handleRequestAlarmPermission}
          onTestAlarm={handleTestAlarm}
          onUpdateAlarmSettings={handleUpdateAlarmSettings}
        />
      );
    }

    return (
      <HomeScreen
        doses={nextDoses}
        nextPlan={nextPlan}
        nextPlanProgress={nextPlanProgress}
        onAddMood={() => navigateTo("addMood")}
        onOpenCheckIn={(id) => { setSelectedCheckInId(id); navigateTo("checkInDetail"); }}
        onQuickLog={() => navigateTo("quickLog")}
        onStartCheckIn={() => (nextSlot ? openCheckInSlot(nextSlot) : navigateTo("plans"))}
        scheduledTime={nextScheduledTime}
        todayCompleted={todayCompleted}
        todayEntries={todayEntries}
        todayTotal={todaySlots.length}
      />
    );
  }

  return (
    <View
      style={[
        styles.safeArea,
        {
          paddingBottom: Math.max(insets.bottom, spacing.sm),
          paddingTop: insets.top,
        },
      ]}
    >
      <StatusBar backgroundColor={colors.background} barStyle="light-content" />
      <View style={styles.container}>{renderContent()}</View>
      {(view === "home" || view === "plans" || view === "history" || view === "settings") && (
        <TabBar activeTab={view} onPress={navigateTo} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
