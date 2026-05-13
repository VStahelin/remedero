# Release — Remedero

## Pré-requisitos (apenas na primeira vez)

- `gh` CLI instalado e autenticado: `gh auth login`
- `.env` preenchido com as variáveis de keystore (ver `.env.example`)
- Pasta `android/` gerada: `make prebuild`
- Keystore criada: `make create-keystore` (backup obrigatório!)

## Fluxo de release

### 1. Bumpar a versão

Editar **três arquivos**:

**`package.json`** — o Makefile lê a versão daqui para nomear o APK e a tag do GitHub
```json
"version": "0.1.X"
```

**`app.json`**
```json
"version": "0.1.X"
```

**`android/app/build.gradle`**
```groovy
versionCode X        // sempre maior que o anterior (Google Play rejeita repetição)
versionName "0.1.X"
```

### 2. Commitar e fazer push

```bash
git add app.json android/app/build.gradle
git commit -m "chore: bump version to 0.1.X"
git push origin main
```

### 3. Gerar release

```bash
make create-release
```

Esse comando faz tudo de uma vez:
- Valida que o working tree está limpo
- Roda `typecheck` + `expo-doctor`
- Gera o APK de release assinado em `dist/releases/`
- Faz push para o `main`
- Cria o GitHub Release com o APK anexado

---

## Comandos úteis

| Comando | O que faz |
|---|---|
| `make validate` | typecheck + expo config + expo-doctor |
| `make android-debug-apk` | APK de debug local (sem assinar) |
| `make release-apk` | APK de release assinado (sem criar Release no GitHub) |
| `make create-release` | Fluxo completo: validar → APK → GitHub Release |
| `make doctor` | Só o expo-doctor |

## Observações

- O aviso de "non-CNG project" do expo-doctor é estrutural (temos código nativo customizado) e não bloqueia o build.
- O APK gerado fica em `dist/releases/remedero-vX.X.X.apk`.
- Para instalar via USB: `adb install dist/releases/remedero-vX.X.X.apk`
