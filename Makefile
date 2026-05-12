
PORT ?= 8082
HOST ?= lan



.PHONY: help install install-deps install-dev expo-install start start-port start-clear start-tunnel start-tunnel-clear android-reverse start-localhost ios android web typecheck expo-config validate audit

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
	@printf "  make validate      Run typecheck and Expo config validation\n"
	@printf "  make audit         Run npm audit without auto-fixing\n"

install:
	npm install

install-deps:
	npm install expo react react-native expo-sqlite expo-image-picker

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

validate: typecheck expo-config

audit:
	npm audit
