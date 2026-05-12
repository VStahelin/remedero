# Alarme de Medicamentos

## Comportamento esperado

- No horário agendado de um plano, o dispositivo toca um alarme agressivo (som de alarme padrão do sistema, tela acende)
- O alarme só para quando o usuário abre o app e registra o check-in daquele horário
- Se não registrar em 10 minutos, o alarme dispara de novo — indefinidamente até registrar (ou até um limite razoável, ex: 6x = 1h)
- O usuário pode dar "snooze" de exatamente 10 minutos manualmente (botão na notificação ou no app)

---

## Stack técnica

| Biblioteca | Função |
|---|---|
| `expo-notifications` | Agendar notificações locais, categorias com botões de ação, cancelar por ID |
| `expo-av` | Tocar o som de alarme em foreground (quando o app está aberto) |
| `expo-task-manager` | Registrar task de background para lidar com notificações recebidas em background |

Nenhuma dependência de servidor — tudo local no device.

---

## Plataformas

### Android

- Canal de notificação com `importance: MAX` e `sound: "default"` (usa ringtone de alarme do sistema)
- Permissão `USE_FULL_SCREEN_INTENT` → exibe a notificação em tela cheia mesmo com o telefone bloqueado, acendendo a tela
- Permissão `SCHEDULE_EXACT_ALARM` (Android 12+) → necessário para disparar exatamente no horário
- Permissão `WAKE_LOCK` → mantém CPU ativa o tempo suficiente para disparar o som
- `vibrate: true` no canal

### iOS

- Notificações locais com `sound: "default"` — iOS não permite forçar acender tela nem tocar em loop contínuo sem uma Apple Critical Alert entitlement (processo de aprovação separado pela Apple)
- Sem Critical Alerts: comportamento é notificação normal de alta prioridade (banner, som uma vez, sem wake screen)
- Com Critical Alerts (entitlement especial): bypass do modo silencioso, som obrigatório — mas exige aprovação da Apple e justificativa médica
- **Decisão**: implementar o melhor possível no iOS com notificação padrão; avisar o usuário para não silenciar o app

---

## Fluxo principal

```
Plano salvo/editado
       │
       ▼
scheduleAlarmsForPlan()
  ├─ para cada (weekday, scheduledTime) do plano
  └─ agenda notificação recorrente semanal com ID: alarm-{planId}-{weekday}-{HHmm}

       │ (no horário agendado)
       ▼
Notificação dispara
  ├─ Som de alarme + tela acende (Android)
  ├─ Botão: "Registrar ✓"  → abre check-in
  └─ Botão: "Snooze 10min" → agenda nova notif em +10min, cancela a atual

       │ (se usuário não interagir em 10 min)
       ▼
Notificação de reforço dispara (agendada junto com a principal)
  └─ mesmo comportamento, repete até 6x ou até check-in registrado

       │ (usuário abre o app e conclui check-in)
       ▼
cancelAlarmsForSlot(planId, scheduledTime)
  └─ cancela todas as notificações pendentes daquele slot
```

---

## IDs de notificação

Cada slot tem um ID canônico baseado no plano + horário:

```
alarm-{planId}-{weekday}-{HHmm}          ← alarme semanal recorrente
alarm-{planId}-{weekday}-{HHmm}-retry-1  ← reforço +10min
alarm-{planId}-{weekday}-{HHmm}-retry-2  ← reforço +20min
...até retry-5
```

Ao completar o check-in de um slot, cancela todos os IDs que começam com `alarm-{planId}-{weekday}-{HHmm}`.

---

## Agendamento

### Quando agendar

- Ao criar um plano
- Ao editar medicamentos/horários de um plano
- Ao restaurar um backup

### Quando cancelar

- Ao deletar um plano → cancelar todos os alarmes do plano
- Ao remover um medicamento/horário → recalcular alarmes do plano
- Ao completar um check-in → cancelar alarmes daquele slot do dia

### Função central

```typescript
// src/notifications/alarms.ts

export async function scheduleAlarmsForPlan(
  plan: Plan,
  slots: Array<{ weekday: Weekday; scheduledTime: string }>,
): Promise<void>

export async function cancelAlarmsForPlan(planId: string): Promise<void>

export async function cancelAlarmsForSlot(
  planId: string,
  weekday: Weekday,
  scheduledTime: string,
): Promise<void>
```

---

## Canal de notificação Android

```typescript
await Notifications.setNotificationChannelAsync("medication-alarm", {
  name: "Alarme de medicamentos",
  importance: Notifications.AndroidImportance.MAX,
  sound: "default",
  vibrationPattern: [0, 500, 250, 500],
  lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  bypassDnd: true, // bypass do modo não perturbe
});
```

---

## Categorias de ação (botões na notificação)

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

O handler de `SNOOZE` agenda uma nova notificação para `now + 10min` com o mesmo payload e cancela os IDs de retry existentes para aquele slot.

---

## Integração com o App

### Permissões (pedir no primeiro uso)

```typescript
const { status } = await Notifications.requestPermissionsAsync({
  ios: { allowAlert: true, allowSound: true, allowBadge: true },
});
```

No Android 13+: `android.permission.POST_NOTIFICATIONS` já é gerenciada automaticamente pelo Expo.

Para `SCHEDULE_EXACT_ALARM` (Android 12+): o usuário precisa autorizar manualmente em Configurações → Alarmes e lembretes. Detectar e redirecionar.

### Navegação ao abrir pelo alarme

Quando o app abre via tap na notificação, o payload contém `planId` e `scheduledTime`. O App deve:

1. Detectar o notification response no `useEffect` inicial
2. Navegar direto para a tela de check-in do plano/horário correto
3. Após completar, chamar `cancelAlarmsForSlot`

```typescript
useEffect(() => {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const { planId, scheduledTime } = response.notification.request.content.data;
    if (response.actionIdentifier === "CHECKIN" || 
        response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      // navegar para check-in
    }
    if (response.actionIdentifier === "SNOOZE") {
      scheduleSnooze(planId, scheduledTime);
    }
  });
  return () => sub.remove();
}, []);
```

---

## Permissões no app.json

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

---

## Limitações conhecidas

| Limitação | Impacto |
|---|---|
| iOS sem Critical Alerts | Alarme silenciável, sem wake screen — experiência degradada no iOS |
| Android 12+ SCHEDULE_EXACT_ALARM | Usuário precisa autorizar manualmente em Configurações |
| App morto (killed) no Android | Notificações ainda disparam — mas o handler JS de SNOOZE pode não executar; solução: usar `expo-task-manager` com `BACKGROUND_NOTIFICATION_TASK` |
| Múltiplos planos no mesmo horário | Gerar um alarme por plano, cada um com seu próprio ID |
| Reboot do device | `expo-notifications` reagenda automaticamente no Android; no iOS as notificações persistem |

---

## Fases de implementação

1. **Setup**: instalar `expo-notifications` e `expo-av`, configurar canal Android, pedir permissões
2. **Core**: implementar `src/notifications/alarms.ts` com schedule/cancel
3. **Integração com planos**: chamar schedule ao criar/editar plano, cancel ao deletar
4. **Check-in**: chamar `cancelAlarmsForSlot` ao completar
5. **Retry**: agendar notificações de reforço com delay de 10min
6. **Snooze**: handler do botão "Snooze 10min" na notificação
7. **Deep link**: ao abrir app via notificação, navegar direto para check-in correto
8. **iOS**: testar limitações e adicionar aviso para o usuário não silenciar o app
