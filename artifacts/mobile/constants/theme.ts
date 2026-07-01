export const Typography = {
  display: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  body: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  small: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  smallMedium: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  caption: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.4,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Shadows = {
  gold: {
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dark: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};
