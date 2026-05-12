# Relacao do Banco de Dados

```mermaid
erDiagram
  PLANS {
    TEXT id PK
    TEXT name
    TEXT description
    INTEGER is_active
  }

  MEDICATIONS {
    TEXT id PK
    TEXT name
    TEXT dosage
    TEXT type
    TEXT notes
  }

  PLAN_MEDICATIONS {
    TEXT id PK
    TEXT plan_id FK
    TEXT medication_id FK
    INTEGER quantity
  }

  PLAN_MEDICATION_SCHEDULES {
    TEXT id PK
    TEXT plan_medication_id FK
    INTEGER weekday
    TEXT scheduled_time
  }

  CHECK_INS {
    TEXT id PK
    TEXT plan_id FK
    TEXT date
    TEXT scheduled_time
    TEXT completed_at
    TEXT photo_uri
    TEXT status
  }

  PLAN_NOTES {
    TEXT id PK
    TEXT plan_id FK
    TEXT created_at
    TEXT feeling
    TEXT text
  }

  PLANS ||--o{ PLAN_MEDICATIONS : tem
  MEDICATIONS ||--o{ PLAN_MEDICATIONS : aparece_em
  PLAN_MEDICATIONS ||--o{ PLAN_MEDICATION_SCHEDULES : agenda
  PLANS ||--o{ CHECK_INS : gera
  PLANS ||--o{ PLAN_NOTES : registra
```

Notas:

- `plans` representa o tratamento.
- `plan_medications` representa um remedio dentro de um plano, incluindo a quantidade.
- `plan_medication_schedules` guarda uma linha por combinacao de remedio no plano, dia da semana e horario.
- Essa estrutura permite agendas diferentes por dia. Exemplo: segunda a sexta `08:00` e `20:00`, sabado apenas `12:00`.
- `plan_medication_schedules` deve ser unico por `plan_medication_id`, `weekday` e `scheduled_time`.
- `check_ins` registra o status de um check-in para um plano, data e horario.
- `plan_notes` registra notas livres do plano com data/hora e sentimento.
