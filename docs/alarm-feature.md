# Alarme de Medicamentos (Android)

## Comportamento esperado

- No horário agendado de um plano, o dispositivo dispara um alarme: som de alarme padrão do sistema, tela acende mesmo com o telefone bloqueado
- O alarme só para quando o usuário abre o app e registra o check-in daquele horário
- Se não registrar em 10 minutos, o alarme dispara de novo — repete por até 1 hora (6 reforços de 10 em 10 min)
- O usuário pode dar snooze de 10 minutos pelo botão direto na notificação

---

## Stack técnica

| Biblioteca | Função |
|---|---|
| `expo-notifications` | Agendar notificações locais, categorias com botões de ação, cancelar por ID |
| `expo-av` | Tocar o som de alarme quando o app está em foreground |
| `expo-task-manager` | Task de background para lidar com notificações recebidas com o app morto |

Tudo local no device, sem servidor.

---

## Permissões necessárias (`app.json`)

```json
{
  "android": {
    "permissions": [
      "android.permission.USE_FULL_SCREEN_INTENT",
      "android.permission.WAKE_LOCK",
      "android.permission.VIBRATE",
      "android.permission.SCHEDULE_EXACT_ALARM",
      "android.permission.POST_NOTIFICATIONS"
    ]
  }
}
```

**`SCHEDULE_EXACT_ALARM` no Android 12+**: o usuário precisa autorizar manualmente em Configurações → Alarmes e lembretes. O app deve detectar se a permissão não foi concedida e redirecionar.

---

## Canal de notificação

```typescript
await Notifications.setNotificationChannelAsync("medication-alarm", {
  name: "Alarme de medicamentos",
  importance: Notifications.AndroidImportance.MAX,
  sound: "default",
  vibrationPattern: [0, 500, 250, 500],
  lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  bypassDnd: true,
  enableVibrate: true,
});
```

`bypassDnd: true` garante que toca mesmo no modo não perturbe.

---

## Botões de ação na notificação

```typescript
await Notifications.setNotificationCategoryAsync("medication-alarm", [
  {
    identifier: "CHECKIN",
    buttonTitle: "Registrar ✓",
    options: { opensAppToForeground: true },
  },
  {
    identifier: "SNOOZE",
    buttonTitle: "Snooze 10min",
    options: { opensAppToForeground: false },
  },
]);
```

---

## IDs de notificação

```
alarm-{planId}-{weekday}-{HHmm}           ← alarme semanal recorrente
alarm-{planId}-{weekday}-{HHmm}-retry-1   ← reforço +10min
alarm-{planId}-{weekday}-{HHmm}-retry-2   ← reforço +20min
...até retry-5 (+50min)
```

Ao completar o check-in, cancela todos os IDs com o prefixo `alarm-{planId}-{weekday}-{HHmm}`.

---

## Fluxo

```
Plano criado/editado
       │
       ▼
scheduleAlarmsForPlan()
  └─ para cada (weekday, scheduledTime):
     ├─ agenda notificação semanal recorrente  ← alarme principal
     └─ agenda 5 notificações de reforço       ← retry +10min cada

       │ (horário chega)
       ▼
Notificação dispara
  ├─ Tela acende, som de alarme
  ├─ [Registrar ✓] → abre check-in no app
  └─ [Snooze 10min] → cancela retries existentes, agenda nova notif em +10min

       │ (usuário não interage em 10 min)
       ▼
Retry-1 dispara → mesmo comportamento
       │
       ▼ (até retry-5, depois silencia)

       │ (usuário completa check-in)
       ▼
cancelAlarmsForSlot(planId, weekday, scheduledTime)
  └─ cancela todos os IDs do slot (principal + retries pendentes)
```

---

## API central — `src/notifications/alarms.ts`

```typescript
// Agendar todos os alarmes de um plano
export async function scheduleAlarmsForPlan(
  planId: string,
  slots: Array<{ weekday: Weekday; scheduledTime: string }>,
): Promise<void>

// Cancelar todos os alarmes de um plano (ao deletar)
export async function cancelAlarmsForPlan(planId: string): Promise<void>

// Cancelar alarmes de um slot específico (ao fazer check-in)
export async function cancelAlarmsForSlot(
  planId: string,
  weekday: Weekday,
  scheduledTime: string,
): Promise<void>

// Agendar snooze manual de 10min
export async function scheduleSnooze(
  planId: string,
  weekday: Weekday,
  scheduledTime: string,
): Promise<void>
```

---

## Integração com App.tsx

### Pedir permissões (na inicialização)

```typescript
const { status } = await Notifications.requestPermissionsAsync();
// Android 12+: verificar SCHEDULE_EXACT_ALARM separadamente e redirecionar para Configurações se negada
```

### Ao criar/editar plano

```typescript
await scheduleAlarmsForPlan(planId, slots); // slots = todos os (weekday, scheduledTime) do plano
```

### Ao deletar plano

```typescript
await cancelAlarmsForPlan(planId);
```

### Ao completar check-in

```typescript
const weekday = new Date().getDay() as Weekday;
await cancelAlarmsForSlot(planId, weekday, scheduledTime);
```

### Handler de notificação (abrir via tap)

```typescript
useEffect(() => {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const { planId, scheduledTime } = response.notification.request.content.data;

    if (response.actionIdentifier === "SNOOZE") {
      scheduleSnooze(planId, new Date().getDay() as Weekday, scheduledTime);
      return;
    }

    // CHECKIN ou tap padrão → navegar para check-in
    setSelectedPlanId(planId);
    navigateTo("checkin");
  });
  return () => sub.remove();
}, []);
```

---

## Casos especiais

| Caso | Comportamento |
|---|---|
| App aberto quando alarme dispara | `expo-notifications` chama o listener em foreground; tocar áudio via `expo-av` |
| App morto (killed) | Notificação dispara normalmente pelo sistema; ao abrir via tap, usar `getLastNotificationResponseAsync()` para recuperar o payload |
| Device reiniciado | `expo-notifications` reagenda automaticamente as notificações persistentes no Android |
| Múltiplos planos no mesmo horário | Um alarme por plano, IDs separados |
| Plano sem horários definidos | Não agendar nada |

---

## Fases de implementação

1. **Setup**: instalar dependências, configurar canal, pedir permissões
2. **`alarms.ts`**: implementar schedule/cancel/snooze
3. **Integração planos**: schedule ao criar/editar, cancel ao deletar
4. **Check-in**: `cancelAlarmsForSlot` ao completar
5. **Handler de tap**: navegação direta para check-in ao abrir via notificação
6. **App em foreground**: detectar notificação chegando com app aberto e tocar áudio via `expo-av`
7. **Android 12+ SCHEDULE_EXACT_ALARM**: detectar permissão negada e mostrar dialog redirecionando para Configurações
