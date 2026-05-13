# Processo de release — Remedero

## Pré-requisitos

- Node.js instalado
- EAS CLI: `npm install -g eas-cli`
- Logado no EAS: `eas login` (conta: vstahelin)
- Android Studio com SDK instalado (para builds locais)
- Arquivo `.env` com as variáveis de keystore preenchidas

## 1. Bumpar a versão

Editar **dois arquivos** antes de cada release:

### `app.json`
```json
"version": "0.1.X"
```

### `android/app/build.gradle`
```groovy
versionCode X        // incrementar sempre, nunca repetir
versionName "0.1.X"
```

> `versionCode` deve ser sempre maior que o anterior. O Google Play rejeita se repetir.

## 2. Rodar os checks

```bash
# TypeScript — zero erros obrigatório
npx tsc --noEmit --skipLibCheck

# Expo Doctor — 17/18 mínimo (o aviso de pasta nativa é estrutural)
npx expo-doctor

# Compilar Kotlin
cd android && ./gradlew compileDebugKotlin
```

## 3. Commit e push

```bash
git add app.json android/app/build.gradle <demais arquivos>
git commit -m "chore: bump version to 0.1.X"
git push origin main
```

## 4. Gerar o build

### APK de preview (instalação direta via arquivo)
```bash
eas build --platform android --profile preview
```

### AAB de produção (Google Play)
```bash
eas build --platform android --profile production
```

O EAS exibe um link da build ao final. Aguardar conclusão (~10 min).

## 5. Baixar e instalar o APK (preview)

Após a build terminar, o EAS fornece um link direto. Para instalar:

```bash
# Verificar dispositivos conectados
adb devices

# Instalar APK
adb install caminho/para/arquivo.apk
```

Ou acesse o link no próprio celular e instale pelo browser (habilitar "Fontes desconhecidas" se necessário).

## 6. Publicar no Google Play (produção)

1. Baixar o `.aab` gerado pelo EAS
2. Acessar [Google Play Console](https://play.google.com/console)
3. Criar nova versão em **Produção** (ou **Teste interno**)
4. Fazer upload do `.aab`
5. Preencher notas da versão e publicar

---

## Perfis EAS (`eas.json`)

| Perfil | Formato | Uso |
|---|---|---|
| `preview` | APK | Teste rápido em dispositivo físico |
| `production` | AAB | Publicação no Google Play |

## Variáveis de ambiente necessárias (`.env`)

```
KEYSTORE_KEY_ALIAS=...
KEYSTORE_KEY_PASSWORD=...
KEYSTORE_STORE_FILE=...
KEYSTORE_STORE_PASSWORD=...
```
