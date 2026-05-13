# Remedero

App Android pessoal de acompanhamento de medicamentos. Tudo local — sem conta, sem servidor, sem assinatura.

---

## O que é

Remedero organiza tratamentos médicos em **planos**. Cada plano representa um tratamento (ex: "Ansiedade", "Pós-cirurgia") e contém os medicamentos, horários, check-ins com foto e notas pessoais sobre o período.

---

## Funcionalidades

### Planos de tratamento

Crie um plano para cada tratamento em andamento. Dentro do plano, cadastre os remédios com dose, dias da semana e horários. Um check-in pode conter vários remédios ao mesmo tempo — tudo que está agendado para o mesmo horário aparece junto.

Cada plano tem um painel com estatísticas derivadas dos dados locais: taxa de conclusão, check-ins realizados, perdidos e pendentes.

### Check-in com foto

Registrar um check-in exige uma foto. É uma confirmação visual de que o medicamento foi realmente tomado, não só uma marcação.

### Alarmes

Remedero agenda alarmes exatos para cada horário do plano. Quando o alarme dispara, a tela de check-in abre diretamente — mesmo com o celular bloqueado. O botão de snooze na notificação adia o lembrete pelo intervalo configurado.

Os alarmes são reagendados automaticamente após reinicialização do dispositivo.

### Histórico

Calendário mensal com indicação visual por dia:

- Verde — todos os check-ins do dia concluídos
- Amarelo — check-ins parciais (alguns perdidos)
- Vermelho — nenhum check-in realizado

### Notas e sentimentos

Cada plano aceita notas com data, texto livre e um sentimento associado (bem, mal, neutro, ansioso, cansado, calmo, triste, animado). Útil para registrar reações, contexto ou observações do período de tratamento.

### Registro avulso

Registre um medicamento fora de um plano — útil para uso pontual ou remédios de demanda.

### Catálogo de remédios

Lista de remédios pré-cadastrados para agilizar a criação de planos e registros avulsos.

### Backup e restauração

Exporte todos os dados e fotos como um arquivo ZIP. Importe para restaurar em outro dispositivo ou após reinstalação.

---

## Privacidade

Nenhum dado sai do dispositivo. Não há servidor, conta ou telemetria. O backup é um arquivo local que você controla.

---

## Instalar

Baixe o APK da [última versão](https://github.com/VStahelin/remedero/releases/latest) e instale diretamente no Android.

> É necessário permitir instalação de fontes desconhecidas em **Configurações > Segurança > Instalar apps desconhecidos**.

---

## Desenvolvimento

Veja [docs/project.md](docs/project.md) para visão geral do projeto e [docs/RELEASING.md](docs/RELEASING.md) para o processo de build e release.
