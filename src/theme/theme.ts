export const colors = {
  background: "#0A0A0A",
  surface: "#1C1C1E",
  surfaceDim: "#14121C",
  surfaceMuted: "#211E28",
  surfaceBright: "#36333E",
  glass: "rgba(255, 255, 255, 0.10)",
  primary: "#7C4DFF",
  primarySoft: "#CDBDFF",
  primaryText: "#FFFFFF",
  secondary: "#00E5FF",
  secondaryText: "#00363D",
  text: "#E6E0EE",
  textMuted: "#CAC3D8",
  textSubtle: "#948EA1",
  border: "rgba(255, 255, 255, 0.15)",
  borderMuted: "#494455",
  success: "#30D158",
  warning: "#FFD60A",
  danger: "#FF453A",
};

export const spacing = {
  unit: 8,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 48,
};

export const radius = {
  sm: 8,
  base: 16,
  md: 24,
  lg: 32,
  xl: 48,
  full: 9999,
};

export const typography = {
  display: {
    fontSize: 40,
    fontWeight: "700" as const,
    letterSpacing: -0.8,
    lineHeight: 48,
  },
  headlineLg: {
    fontSize: 32,
    fontWeight: "600" as const,
    letterSpacing: -0.32,
    lineHeight: 40,
  },
  headlineMd: {
    fontSize: 24,
    fontWeight: "600" as const,
    lineHeight: 32,
  },
  headlineSm: {
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 28,
  },
  bodyLg: {
    fontSize: 18,
    fontWeight: "400" as const,
    lineHeight: 28,
  },
  bodyMd: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  labelMd: {
    fontSize: 14,
    fontWeight: "500" as const,
    letterSpacing: 0.14,
    lineHeight: 20,
  },
  labelSm: {
    fontSize: 12,
    fontWeight: "600" as const,
    lineHeight: 16,
  },
};
