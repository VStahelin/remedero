# Remedero - Progresso

Documento vivo para acompanhar a construcao do projeto.

## Decisoes Ja Tomadas

- [x] Nome do projeto: Remedero.
- [x] Produto focado em check-in de medicamentos com foto obrigatoria.
- [x] App local-first.
- [x] Sem servidor no MVP.
- [x] Stack inicial: Expo.
- [x] Persistencia local com SQLite.
- [x] Exportacao futura dos dados em dump JSON.
- [x] Layout de referencia criado no Stitch: `3153066838236221040`.

## Fase Atual: Base Do Projeto

- [x] Criar arquivos base do projeto Expo com TypeScript.
- [x] Instalar dependencias Expo.
- [x] Criar Makefile usando registry publico do npm.
- [x] Configurar estrutura inicial de pastas.
- [x] Configurar navegacao base.
- [x] Configurar tema visual inicial seguindo `docs/DESIGN.md`.
- [x] Configurar SQLite local.
- [x] Criar schema inicial do banco.
- [x] Criar camada inicial de exportacao JSON.
- [x] Criar telas base do MVP.
- [x] Validar arquivos JSON e diagnosticos do editor.
- [x] Validar que o app inicia.

## Bloqueios

- [x] Resolvido: dependencias instaladas via registry publico usando configuracao local do comando.

## MVP Funcional

- [x] Home com proximo check-in.
- [x] Lista de planos.
- [ ] Criacao de plano.
- [ ] Cadastro simples de medicamentos dentro do plano.
- [x] Agrupamento de medicamentos por horario.
- [x] Tela de check-in.
- [ ] Captura de foto obrigatoria.
- [x] Confirmacao do check-in.
- [x] Historico em timeline.
- [ ] Visualizacao de foto de check-in passado.
- [x] Exportacao dos dados em JSON.

## Fora Do MVP

- [ ] Login.
- [ ] Servidor.
- [ ] Sincronizacao automatica.
- [ ] IA para validar foto.
- [ ] Relatorios complexos.
- [ ] Integracoes clinicas.

## Historico

- 2026-05-11: Criada definicao inicial do produto.
- 2026-05-11: Definido Expo, SQLite local e exportacao JSON como base tecnica.
- 2026-05-11: Criado checklist de progresso do projeto.
- 2026-05-11: Criada primeira base de codigo com telas, tema, schema SQLite e dump JSON.
- 2026-05-11: Validados `package.json`, `app.json`, `tsconfig.json` e diagnosticos do editor.
- 2026-05-11: Instaladas dependencias Expo pelo registry publico.
- 2026-05-11: Validado `npm run typecheck`, configuracao Expo e inicializacao do Metro em `localhost:8082`.
- 2026-05-11: Criado `Makefile` para comandos com `NPM_CONFIG_USERCONFIG=/dev/null` e registry publico.
- 2026-05-11: App atualizado para seguir o design system Obsidian Health System em `docs/DESIGN.md`.
