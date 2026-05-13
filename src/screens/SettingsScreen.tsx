import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/theme/theme";
import { AlarmSettings } from "@/types/domain";

export type SettingsScreenProps = {
  alarmPermissionStatus: string;
  alarmSettings: AlarmSettings;
  exactAlarmGranted: boolean;
  onCheckUpdate: () => void;
  onClearData: () => void;
  onExport: () => void;
  onImport: () => void;
  onOpenAlarmSystemSettings: () => void;
  onOpenCatalog: () => void;
  onRequestAlarmPermission: () => void;
  onTestAlarm: () => void;
  onUpdateAlarmSettings: (settings: AlarmSettings) => void;
};

const snoozeOptions = [5, 10, 15, 30];
const retryOptions = [
  { label: "Sem reforco", value: 0 },
  { label: "3x", value: 3 },
  { label: "6x", value: 6 },
];

function getPermissionLabel(status: string): string {
  if (status === "unavailable") return "Indisponiveis no Expo Go";
  if (status === "granted") return "Permitidas";
  if (status === "denied") return "Bloqueadas";
  return "Ainda nao pedidas";
}

export function SettingsScreen({
  alarmPermissionStatus,
  alarmSettings,
  exactAlarmGranted,
  onCheckUpdate,
  onClearData,
  onExport,
  onImport,
  onOpenAlarmSystemSettings,
  onOpenCatalog,
  onRequestAlarmPermission,
  onTestAlarm,
  onUpdateAlarmSettings,
}: SettingsScreenProps) {
  function handleClearData() {
    Alert.alert(
      "Limpar dados locais",
      "Isso vai apagar todos os planos, remedios, check-ins, registros e sentimentos. Nao da para desfazer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Continuar",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Tem certeza mesmo?",
              "Todos os dados serao perdidos permanentemente.",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Apagar tudo",
                  style: "destructive",
                  onPress: onClearData,
                },
              ],
            );
          },
        },
      ],
    );
  }

  function updateAlarmSettings(partial: Partial<AlarmSettings>) {
    onUpdateAlarmSettings({ ...alarmSettings, ...partial });
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.glowOrb} />
      <View>
        <Text style={styles.eyebrow}>Config</Text>
        <Text style={styles.title}>Dados locais</Text>
        <Text style={styles.subtitle}>
          Controle e portabilidade sem servidor.
        </Text>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        onPress={onOpenCatalog}
        style={styles.card}
      >
        <Text style={styles.cardTitle}>Catalogo de remedios</Text>
        <Text style={styles.cardText}>
          Gerencie sua lista de remedios para uso rapido em registros avulsos e
          planos.
        </Text>
        <Text style={styles.cardAction}>Ver catalogo →</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>Alarmes</Text>
            <Text style={styles.cardText}>
              Ajuste como o Remedero lembra voce dos check-ins.
            </Text>
          </View>
          <View
            style={[
              styles.statusPill,
              alarmSettings.enabled ? styles.statusOn : styles.statusOff,
            ]}
          >
            <Text style={styles.statusText}>
              {alarmSettings.enabled ? "Ativo" : "Pausado"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={() =>
            updateAlarmSettings({ enabled: !alarmSettings.enabled })
          }
          style={styles.settingRow}
        >
          <View style={styles.settingRowText}>
            <Text style={styles.settingTitle}>Alarmes de medicamentos</Text>
            <Text style={styles.settingMeta}>
              {alarmSettings.enabled
                ? "Notificacoes agendadas"
                : "Nenhum alarme sera agendado"}
            </Text>
          </View>
          <View
            style={[
              styles.toggleButton,
              alarmSettings.enabled && styles.toggleButtonOn,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                alarmSettings.enabled && styles.toggleTextOn,
              ]}
            >
              {alarmSettings.enabled ? "ON" : "OFF"}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.settingBlock}>
          <Text style={styles.settingTitle}>Snooze</Text>
          <Text style={styles.settingMeta}>
            Tempo ate lembrar de novo pelo botao da notificacao.
          </Text>
          <View style={styles.pillRow}>
            {snoozeOptions.map((minutes) => {
              const isSelected = alarmSettings.snoozeMinutes === minutes;

              return (
                <TouchableOpacity
                  key={minutes}
                  accessibilityRole="button"
                  onPress={() =>
                    updateAlarmSettings({ snoozeMinutes: minutes })
                  }
                  style={[
                    styles.optionPill,
                    isSelected && styles.optionPillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {minutes} min
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.settingBlock}>
          <Text style={styles.settingTitle}>Reforcos automaticos</Text>
          <Text style={styles.settingMeta}>
            Quantas vezes o app insiste depois do horario, usando o intervalo do
            snooze.
          </Text>
          <View style={styles.pillRow}>
            {retryOptions.map((option) => {
              const isSelected = alarmSettings.retryCount === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  accessibilityRole="button"
                  onPress={() =>
                    updateAlarmSettings({ retryCount: option.value })
                  }
                  style={[
                    styles.optionPill,
                    isSelected && styles.optionPillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.permissionBox}>
          <Text style={styles.settingTitle}>Permissoes do Android</Text>
          <View style={styles.permissionHeader}>
            <Text style={styles.settingMeta}>Notificacoes</Text>
            <View
              style={[
                styles.permissionBadge,
                alarmPermissionStatus === "granted"
                  ? styles.permissionGranted
                  : styles.permissionDenied,
              ]}
            >
              <Text style={styles.permissionBadgeText}>
                {getPermissionLabel(alarmPermissionStatus)}
              </Text>
            </View>
          </View>
          <View style={styles.permissionHeader}>
            <Text style={styles.settingMeta}>Alarmes e lembretes</Text>
            <View
              style={[
                styles.permissionBadge,
                exactAlarmGranted
                  ? styles.permissionGranted
                  : styles.permissionDenied,
              ]}
            >
              <Text style={styles.permissionBadgeText}>
                {exactAlarmGranted ? "Permitido" : "Bloqueado"}
              </Text>
            </View>
          </View>
          <Text style={styles.settingMeta}>
            Ambas sao necessarias para os alarmes funcionarem.
          </Text>
          <View style={styles.permissionActions}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onRequestAlarmPermission}
              style={styles.permissionLink}
            >
              <Text style={styles.permissionLinkText}>Pedir permissao</Text>
            </TouchableOpacity>
            <Text style={styles.permissionDivider}>·</Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onOpenAlarmSystemSettings}
              style={styles.permissionLink}
            >
              <Text style={styles.permissionLinkText}>Configs do sistema</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.testAlarmBox}>
          <Text style={styles.settingMeta}>
            Dispara um alarme de teste em 5 segundos para verificar som,
            notificacao e tela de check-in.
          </Text>
          <PrimaryButton
            label="Testar alarme"
            onPress={onTestAlarm}
            variant="secondary"
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Exportar backup</Text>
        <Text style={styles.cardText}>
          Gera um arquivo ZIP com todos os dados e as fotos dos check-ins.
        </Text>
        <PrimaryButton
          label="Exportar ZIP"
          onPress={onExport}
          variant="secondary"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Importar backup</Text>
        <Text style={styles.cardText}>
          Restaura um backup ZIP com dados e fotos. Todos os dados atuais serao
          substituidos.
        </Text>
        <PrimaryButton
          label="Importar ZIP"
          onPress={onImport}
          variant="secondary"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Atualizacoes</Text>
        <Text style={styles.cardText}>
          Verifica se ha uma nova versao do Remedero disponivel.
        </Text>
        <PrimaryButton
          label="Verificar atualizacoes"
          onPress={onCheckUpdate}
          variant="secondary"
        />
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        onPress={handleClearData}
        style={styles.deleteLink}
      >
        <Text style={styles.deleteLinkText}>Limpar todos os dados locais</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  cardHeaderText: {
    flex: 1,
    gap: spacing.xs,
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
  cardAction: {
    color: colors.primarySoft,
    ...typography.labelMd,
  },
  cardText: {
    color: colors.textSubtle,
    ...typography.bodyMd,
  },
  cardTitle: {
    color: colors.text,
    ...typography.headlineMd,
  },
  content: {
    gap: spacing.lg,
    overflow: "hidden",
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  optionPill: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.textMuted,
    ...typography.labelSm,
  },
  optionTextSelected: {
    color: colors.primaryText,
  },
  permissionActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  permissionBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  permissionBadgeText: {
    ...typography.labelSm,
    color: colors.primaryText,
  },
  permissionBox: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  permissionDenied: {
    backgroundColor: colors.surfaceBright,
  },
  permissionDivider: {
    color: colors.textSubtle,
    ...typography.labelSm,
  },
  permissionGranted: {
    backgroundColor: colors.success,
  },
  permissionHeader: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  permissionLink: {
    paddingVertical: spacing.xs,
  },
  permissionLinkText: {
    color: colors.primarySoft,
    ...typography.labelSm,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.primary,
    ...typography.labelSm,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  glowOrb: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    height: 180,
    opacity: 0.12,
    position: "absolute",
    right: -80,
    top: -60,
    width: 180,
  },
  settingBlock: {
    gap: spacing.sm,
  },
  settingMeta: {
    color: colors.textSubtle,
    ...typography.labelMd,
  },
  settingRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    padding: spacing.md,
  },
  settingRowText: {
    flex: 1,
    gap: 4,
  },
  settingTitle: {
    color: colors.text,
    ...typography.labelMd,
    fontWeight: "700",
  },
  statusOff: {
    backgroundColor: colors.surfaceBright,
  },
  statusOn: {
    backgroundColor: colors.primary,
  },
  statusPill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusText: {
    color: colors.primaryText,
    ...typography.labelSm,
  },
  subtitle: {
    color: colors.textSubtle,
    ...typography.bodyMd,
    marginTop: spacing.sm,
  },
  title: {
    color: colors.text,
    ...typography.headlineLg,
    marginTop: spacing.xs,
  },
  testAlarmBox: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  toggleButton: {
    backgroundColor: colors.surfaceBright,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  toggleButtonOn: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    color: colors.textSubtle,
    ...typography.labelSm,
  },
  toggleTextOn: {
    color: colors.primaryText,
  },
});
