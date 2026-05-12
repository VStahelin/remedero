# AGENTS.md

## Projeto

Nome oficial: Remedero.

## Idioma

Responda e documente preferencialmente em portugues.

## Contexto do Projeto

Este projeto ainda esta em fase de definicao de produto.

Antes de implementar qualquer funcionalidade, leia:

- `docs/product-definition.md`

## Produto

O app e um rastreador pessoal de habito para check-in de medicamentos com foto obrigatoria.

O nucleo do produto e o check-in, nao o medicamento.

O app deve ajudar o usuario a:

- criar planos de medicamentos;
- receber lembretes por horario;
- ver todos os medicamentos de um mesmo horario em um unico check-in;
- confirmar a tomada com foto obrigatoria;
- acompanhar consistencia diaria.

## Principios de Produto

- Simplicidade acima de completude.
- Check-in rapido, idealmente em menos de 5 segundos.
- Foto obrigatoria como principal mecanismo de responsabilidade.
- Poucos botoes, poucas telas e baixa carga cognitiva.
- Medicamentos no mesmo horario pertencem ao mesmo check-in.
- Nao adicionar IA no MVP.
- Evitar escopo clinico, hospitalar, farmaceutico ou social.

## UX e UI

O app deve parecer um rastreador de habito moderno com prova fotografica.

Referencias visuais:

- BeReal;
- Headspace;
- Apple Health.
- Stitch project `3153066838236221040`.

Direcao:

- mobile-first;
- minimalista;
- premium;
- clean;
- cards grandes;
- tipografia forte;
- muito espaco;
- dark mode elegante ou branco limpo.

## Estrutura Funcional Inicial

Telas principais:

- Home;
- Planos;
- Check-in;
- Historico;
- Config.

Entidades principais:

- Plano;
- Medicamento;
- PlanoMedicamento;
- Check-in.

## Decisoes Tecnicas

- Usar Expo como base do app mobile.
- O app deve ser local-first.
- Nao deve haver servidor no MVP.
- Usar SQLite local para persistencia.
- Salvar fotos no storage local e guardar no banco apenas a URI/caminho.
- Permitir exportacao dos dados em dump JSON.
- Projetar os dados para futura importacao, backup ou sincronizacao manual.

## Regras Para Decisoes Futuras

- Se houver duvida entre simplicidade e configurabilidade, escolha simplicidade.
- Se uma funcionalidade nao melhora o check-in diario, deixe para depois.
- Se medicamentos compartilharem o mesmo horario, agrupe em um unico check-in.
- Se uma confirmacao puder acontecer sem foto, esta errada para o MVP.
- Se uma tela exigir explicacao longa, simplifique o fluxo.
- Se uma decisao tecnica dificultar exportar o banco em JSON, reavalie.

## Fora do MVP

Nao priorizar inicialmente:

- login;
- rede social;
- IA para validar foto;
- relatorios complexos;
- gestao medica avancada;
- prescricoes;
- integrações clinicas;
- dashboards extensos.
