# Remedero - Definicao do Produto

## Visao

Remedero e um app pessoal e minimalista para organizar tratamentos com medicamentos e confirmar cada tomada por meio de check-in com foto obrigatoria.

O produto deve ser simples, rapido e focado em habito diario. Ele nao deve parecer um sistema hospitalar, clinico ou farmaceutico. A experiencia deve se aproximar mais de um rastreador de habito moderno com prova fotografica.

## Objetivo

Permitir que a pessoa:

- cadastre medicamentos;
- organize medicamentos dentro de planos de tratamento;
- receba lembretes;
- faca check-in dos medicamentos no horario certo;
- confirme o check-in somente depois de tirar uma foto;
- acompanhe consistencia ao longo dos dias.

## Conceito Central

O nucleo do app nao e o medicamento.

O nucleo do app e o check-in.

Um plano representa um tratamento, como "Tratamento de ansiedade 1", "Pos-cirurgia" ou "Vitaminas do mes".

Cada plano deve ter:

- nome;
- descricao longa;
- medicamentos;
- horarios de cada medicamento.

Varios medicamentos do mesmo plano e no mesmo horario devem ser agrupados em um unico check-in.

Exemplo:

- 08:00
- Vitamina D
- Magnesio
- Omega 3

Tudo isso vira um unico check-in das 08:00 dentro daquele plano.

## Fluxo Principal

1. Usuario cria um plano de tratamento, como "Tratamento de ansiedade 1".
2. Usuario escreve uma descricao longa para o plano.
3. Usuario adiciona medicamentos, quantidades e horarios ao plano.
4. App envia um lembrete no horario.
5. Usuario abre o check-in.
6. App mostra medicamentos e quantidades daquele plano naquele horario.
7. Usuario tira uma foto obrigatoria.
8. Usuario confirma a foto.
9. App salva timestamp, foto e status do check-in.
10. App atualiza progresso e consistencia.

## Telas Principais

### Home

Tela mais importante do app.

Deve mostrar:

- proximo check-in em card grande;
- horario e nome do plano de tratamento;
- medicamentos daquele horario;
- botao principal "Fazer check-in";
- progresso do dia;
- sequencia atual;
- porcentagem semanal;
- ultimos check-ins.

### Planos

Lista dos planos cadastrados.

Cada card deve mostrar:

- nome do plano;
- resumo da descricao;
- quantidade de horarios;
- quantidade de medicamentos;
- status do dia;
- proximo horario.

Criar plano deve ser extremamente simples:

- nome;
- descricao longa.

Ao criar um plano, o usuario deve ser levado para a tela do proprio plano.

### Tela do Plano

Cada plano deve ter uma tela propria para gerenciar o tratamento.

Essa tela deve mostrar:

- nome do plano;
- descricao longa;
- estatisticas do plano;
- medicamentos cadastrados;
- horarios e dias de cada medicamento;
- notas do plano;
- botao "Adicionar remedio";
- acao para editar plano;
- acao para excluir plano.

As estatisticas do plano devem usar apenas os dados locais existentes.
Exemplos de estatisticas possiveis:

- total de check-ins do plano;
- check-ins concluidos;
- check-ins perdidos;
- check-ins pendentes;
- taxa de conclusao;
- quantidade de medicamentos no plano;
- quantidade de horarios cadastrados.

Adicionar remedio dentro de um plano deve abrir uma tela propria de formulario.

A tela de adicionar remedio deve permitir:

- nome do medicamento;
- dosagem;
- tipo;
- quantidade;
- agenda por dia da semana e horario;
- um ou mais horarios para aquele remedio, podendo variar por dia.

A regularidade deve ser selecionada com 7 bolinhas, uma para cada dia da semana.
Essa selecao deve ser multi-selecao.
Para cada dia selecionado, o usuario deve conseguir informar os horarios daquele dia.

Os horarios pertencem ao remedio dentro do plano, nao ao plano inteiro.
Isso significa que um mesmo plano pode ter remedios em dias e horarios diferentes.

Exemplo:

- segunda a sexta: 08:00 e 20:00;
- sabado: 12:00;
- domingo: nenhum horario.

Cada item da agenda deve representar uma combinacao de remedio no plano, dia da semana e horario.

### Notas do Plano

O usuario deve poder adicionar notas livres dentro de um plano.

Cada nota deve registrar:

- plano relacionado;
- data e hora de criacao;
- texto livre;
- como o usuario esta se sentindo.

A selecao "como estou me sentindo" deve ser simples e rapida.
Lista inicial de sentimentos:

- bem;
- mal;
- neutro;
- ansioso;
- cansado;
- calmo;
- triste;
- animado.

As notas ajudam o usuario a contextualizar o tratamento sem transformar o app em diario complexo.

### Editar Plano

Cada plano deve ter uma tela de edicao.

A edicao do plano deve permitir alterar:

- nome do plano;
- descricao longa;
- medicamentos do plano;
- quantidade de cada medicamento;
- regularidade por dia da semana;
- horarios de cada medicamento.

O usuario tambem deve poder excluir um plano.
Excluir um plano deve remover suas relacoes locais, como medicamentos vinculados ao plano, agendas, notas e check-ins daquele plano.
No MVP, a exclusao pode pedir confirmacao simples antes de apagar.

A edicao deve preservar a simplicidade do fluxo. O usuario deve conseguir ajustar rapidamente um tratamento sem precisar recriar o plano.

### Medicamentos

Cadastro basico e sem complexidade.

Campos:

- nome;
- dosagem;
- tipo;
- observacoes opcionais.

No MVP, medicamentos tambem podem ser cadastrados dentro do fluxo de criacao de plano para reduzir atrito.

### Check-in

Tela principal do produto.

Deve mostrar:

- titulo no formato "Check-in 08:00";
- nome do plano de tratamento;
- lista dos medicamentos do horario;
- quantidades;
- botao grande "Tirar foto";
- preview da foto;
- acoes "Refazer" e "Confirmar";
- estado final de check-in concluido.

O check-in so pode ser concluido depois da foto.

### Historico

Historico deve combinar o estado do dia atual com uma visao mensal simples.

No topo, manter tiles com os medicamentos/check-ins planejados para hoje:

- horario;
- plano de tratamento;
- medicamentos daquele horario;
- status do check-in.

Logo abaixo, mostrar um calendario sempre no mes atual.

Cada dia do calendario deve ter uma bolinha com uma das quatro possibilidades:

- sem bolinha: nao havia remedio planejado para aquele dia;
- verde: tomou todos os remedios planejados do dia;
- vermelho: nao tomou nenhum remedio planejado do dia;
- amarelo: faltou tomar algum remedio planejado do dia.

Ao abrir um check-in historico, mostrar:

- foto;
- horario salvo;
- medicamentos;
- status.

## Navegacao

Bottom tabs recomendadas:

- Home;
- Planos;
- Historico;
- Config.

No Android, o botao/gesto de voltar do sistema deve navegar pelas telas anteriores ate chegar na Home. Ao chegar na Home, o comportamento pode seguir o padrao do sistema.

Aba separada de medicamentos nao e obrigatoria no MVP. Medicamentos podem ficar dentro do cadastro de plano.

## Experiencia Ideal

O usuario deve conseguir concluir o fluxo em menos de 5 segundos:

1. abrir a notificacao;
2. tirar foto;
3. confirmar.

Principios de UX:

- interface limpa;
- poucos botoes;
- cards grandes;
- tipografia forte;
- muito espaco;
- fluxo direto;
- sem menus complexos.

## Estilo Visual

Referencias:

- BeReal;
- Headspace;
- Apple Health.
- Stitch project `3153066838236221040`.

Direcao visual:

- minimalista;
- premium;
- clean;
- dark mode elegante ou branco limpo;
- bordas arredondadas;
- foco em velocidade e simplicidade.

## MVP

Nao usar IA no inicio.

A foto ja resolve a maior parte do valor do produto:

- responsabilidade;
- confirmacao visual;
- habito;
- prova pessoal.

O MVP deve apenas:

- salvar imagem;
- salvar timestamp;
- salvar medicamentos;
- marcar check-in como concluido.

## Decisao Tecnica Inicial

O Remedero sera desenvolvido com Expo.

Caracteristicas tecnicas do produto:

- app local-first;
- sem servidor no MVP;
- sem login no MVP;
- banco local em SQLite;
- fotos salvas no storage local do app;
- banco deve guardar apenas a URI/caminho da foto;
- dados devem poder ser exportados como dump JSON.

A exportacao JSON e uma caracteristica importante do produto. Ela deve permitir que o usuario salve, sincronize ou leve seus dados para fora do app quando quiser.

O dump JSON deve representar os dados principais:

- planos;
- medicamentos;
- relacao entre planos e medicamentos;
- relacao entre medicamentos do plano, dias da semana e horarios;
- notas dos planos;
- check-ins;
- metadados das fotos, como caminho local, horario, plano relacionado e medicamentos daquele check-in.

No MVP, a exportacao nao precisa resolver sincronizacao automatica. O objetivo inicial e permitir backup e portabilidade dos dados.

## Estrutura de Dados Inicial

### Plano

```json
{
  "id": "1",
  "nome": "Tratamento de ansiedade 1",
  "descricao": "Descricao longa do tratamento, observacoes pessoais, contexto e instrucoes importantes."
}
```

### Medicamento

```json
{
  "id": "1",
  "nome": "Magnesio",
  "dosagem": "500mg",
  "tipo": "capsula"
}
```

### PlanoMedicamento

```json
{
  "id": "pm1",
  "planoId": "1",
  "medicamentoId": "1",
  "quantidade": 2
}
```

### PlanoMedicamentoHorario

```json
{
  "id": "pmh1",
  "planoMedicamentoId": "pm1",
  "diaSemana": 1,
  "horario": "08:00"
}
```

Cada linha de `PlanoMedicamentoHorario` representa uma tomada planejada daquele remedio em um dia e horario especificos.
O conjunto `planoMedicamentoId`, `diaSemana` e `horario` deve ser unico.

### PlanoNota

```json
{
  "id": "nota1",
  "planoId": "1",
  "criadoEm": "2026-05-12T09:34:00.000Z",
  "sentimento": "ansioso",
  "texto": "Hoje acordei mais agitado, mas consegui seguir o tratamento."
}
```

### Entidade Check-in

```json
{
  "id": "123",
  "planoId": "1",
  "horarioProgramado": "08:00",
  "horarioRealizado": "08:03",
  "foto": "/storage/checkin.jpg",
  "concluido": true
}
```

## Prompt Base Para UI/UX

Crie a interface mobile completa de um aplicativo minimalista de check-in de medicamentos.

O conceito principal do app e: o usuario possui planos de tratamento, cada um com descricao longa, medicamentos e horarios especificos. Em cada horario, ele precisa fazer um check-in obrigatorio com foto para confirmar que tomou os remedios.

O aplicativo e pessoal, sem login e sem funcionalidades sociais.

Objetivo: criar um sistema extremamente simples, rapido e focado em habito diario.

Telas necessarias:

- Home com proximo check-in, cards grandes, progresso do dia, sequencia de dias e ultimos check-ins;
- Lista de Planos com nome do tratamento, resumo da descricao, quantidade de horarios, quantidade de medicamentos e status do dia;
- Criar Plano com nome do tratamento e descricao longa;
- Tela do Plano com descricao, estatisticas, lista de remedios, botao para adicionar remedio, 7 bolinhas de regularidade, horarios por remedio e notas com sentimento;
- Tela de Check-in com lista dos medicamentos, botao grande "Tirar Foto", preview da imagem e botao confirmar;
- Historico com tiles dos check-ins planejados para hoje e calendario do mes atual com bolinhas de status diario.

Estilo visual:

- minimalista;
- premium;
- clean;
- inspirado em Apple Health, Headspace e BeReal;
- poucos elementos na tela;
- muito espaco em branco;
- bordas arredondadas;
- dark mode elegante;
- foco em velocidade e simplicidade.

Importante: o app deve parecer um rastreador de habito moderno, nao um sistema hospitalar.
