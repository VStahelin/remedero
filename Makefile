
-include .env

PORT ?= 8082
HOST ?= lan
ANDROID_SDK ?= C:/Users/Dicks/AppData/Local/Android/Sdk
VERSION ?= $(shell node -p "require('./package.json').version")
RELEASE_TAG ?= v$(VERSION)
RELEASE_DIR ?= dist/releases
RELEASE_APK_NAME ?= remedero-$(RELEASE_TAG).apk
RELEASE_APK ?= $(RELEASE_DIR)/$(RELEASE_APK_NAME)



.PHONY: help install install-deps install-dev expo-install start start-port start-clear start-tunnel start-tunnel-clear android-reverse start-localhost ios android web typecheck expo-config doctor validate audit android-debug-apk setup-signing release-apk release-check-clean create-release

help:
	@printf "Remedero commands:\n"
	@printf "  make install       Install packages using the public npm registry\n"
	@printf "  make install-deps  Install Expo runtime dependencies\n"
	@printf "  make install-dev   Install TypeScript dev dependencies\n"
	@printf "  make expo-install  Align React and React Native versions with Expo\n"
	@printf "  make start         Start Expo\n"
	@printf "  make start-port    Start Expo on PORT=$(PORT) and HOST=$(HOST)\n"
	@printf "  make start-clear   Start Expo with cache reset\n"
	@printf "  make start-tunnel  Start Expo using tunnel mode\n"
	@printf "  make start-tunnel-clear Start Expo tunnel mode with cache reset\n"
	@printf "  make android-reverse Reverse PORT=$(PORT) over USB with adb\n"
	@printf "  make start-localhost Start Expo for USB reverse usage\n"
	@printf "  make ios           Start Expo for iOS\n"
	@printf "  make android       Start Expo for Android\n"
	@printf "  make web           Start Expo for web\n"
	@printf "  make typecheck     Run TypeScript typecheck\n"
	@printf "  make expo-config   Validate Expo public config\n"
	@printf "  make doctor        Run Expo Doctor\n"
	@printf "  make validate      Run typecheck, Expo config validation and Expo Doctor\n"
	@printf "  make audit         Run npm audit without auto-fixing\n"
	@printf "  make android-debug-apk Generate local debug APK\n"
	@printf "  make setup-signing Write android/keystore.properties from .env\n"
	@printf "  make release-apk   Generate signed release APK at $(RELEASE_APK)\n"
	@printf "  make create-release VERSION=$(VERSION) Create GitHub Release and upload APK\n"

install:
	npm install

install-deps:
	npx expo install react react-native expo-sqlite expo-image-picker expo-document-picker expo-file-system expo-sharing expo-notifications expo-task-manager expo-av @react-native-community/datetimepicker react-native-safe-area-context

install-dev:
	npm install --save-dev typescript @types/react

expo-install:
	npx expo install react react-native

start:
	npx expo start --host $(HOST)

start-port:
	npx expo start --host $(HOST) --port $(PORT)

start-clear:
	npx expo start --host $(HOST) --port $(PORT) --clear

start-tunnel:
	@test -d node_modules/@expo/ngrok || (echo "Missing node_modules/@expo/ngrok. Install it locally before using tunnel; avoiding Expo global npm install."; exit 1)
	npx expo start --tunnel --port $(PORT)

start-tunnel-clear:
	@test -d node_modules/@expo/ngrok || (echo "Missing node_modules/@expo/ngrok. Install it locally before using tunnel; avoiding Expo global npm install."; exit 1)
	npx expo start --tunnel --port $(PORT) --clear

android-reverse:
	adb reverse tcp:$(PORT) tcp:$(PORT)

start-localhost:
	npx expo start --host localhost --port $(PORT) --clear

ios:
	npm run ios

android:
	npm run android

web:
	npm run web

typecheck:
	npm run typecheck

expo-config:
	npx expo config --type public

doctor:
	npx expo-doctor@latest

validate: typecheck expo-config doctor

audit:
	npm audit

android-debug-apk:
	@test -d android || (echo "Missing android/. Run: ANDROID_HOME=\"$(ANDROID_SDK)\" ANDROID_SDK_ROOT=\"$(ANDROID_SDK)\" npx expo prebuild --platform android"; exit 1)
	cd android && ANDROID_HOME="$(ANDROID_SDK)" ANDROID_SDK_ROOT="$(ANDROID_SDK)" PATH="$(ANDROID_SDK)/platform-tools:$$PATH" ./gradlew assembleDebug
	@printf "Debug APK: android/app/build/outputs/apk/debug/app-debug.apk\n"

setup-signing:
	@test -n "$(KEYSTORE_STORE_FILE)" || (printf "Missing KEYSTORE_STORE_FILE. Copy .env.example to .env and fill the values.\n"; exit 1)
	@test -n "$(KEYSTORE_STORE_PASSWORD)" || (printf "Missing KEYSTORE_STORE_PASSWORD in .env\n"; exit 1)
	@test -n "$(KEYSTORE_KEY_ALIAS)" || (printf "Missing KEYSTORE_KEY_ALIAS in .env\n"; exit 1)
	@test -n "$(KEYSTORE_KEY_PASSWORD)" || (printf "Missing KEYSTORE_KEY_PASSWORD in .env\n"; exit 1)
	@printf 'storeFile=%s\nstorePassword=%s\nkeyAlias=%s\nkeyPassword=%s\n' "$(KEYSTORE_STORE_FILE)" "$(KEYSTORE_STORE_PASSWORD)" "$(KEYSTORE_KEY_ALIAS)" "$(KEYSTORE_KEY_PASSWORD)" > android/keystore.properties
	@printf "android/keystore.properties written from .env\n"

release-apk: setup-signing
	@test -d android || (echo "Missing android/. Run: ANDROID_HOME=\"$(ANDROID_SDK)\" ANDROID_SDK_ROOT=\"$(ANDROID_SDK)\" npx expo prebuild --platform android"; exit 1)
	cd android && ANDROID_HOME="$(ANDROID_SDK)" ANDROID_SDK_ROOT="$(ANDROID_SDK)" PATH="$(ANDROID_SDK)/platform-tools:$$PATH" ./gradlew assembleRelease
	@mkdir -p "$(RELEASE_DIR)"
	cp android/app/build/outputs/apk/release/app-release.apk "$(RELEASE_APK)"
	@printf "Release APK: $(RELEASE_APK)\n"

release-check-clean:
	@test -z "$$(git status --porcelain)" || (echo "Working tree has uncommitted changes. Commit before creating a GitHub Release."; git status --short; exit 1)
	@gh auth status >/dev/null
	@test -n "$(VERSION)" || (echo "VERSION is required. Example: make create-release VERSION=0.1.0"; exit 1)
	@! gh release view "$(RELEASE_TAG)" >/dev/null 2>&1 || (echo "GitHub Release $(RELEASE_TAG) already exists."; exit 1)

create-release: release-check-clean validate release-apk
	gh release create "$(RELEASE_TAG)" "$(RELEASE_APK)" --target "$$(git rev-parse HEAD)" --title "Remedero $(RELEASE_TAG)" --notes "APK privado do Remedero $(RELEASE_TAG)."
	@printf "GitHub Release created: $(RELEASE_TAG)\n"
