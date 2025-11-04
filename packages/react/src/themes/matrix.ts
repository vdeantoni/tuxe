/**
 * matrix.ts - Matrix movie-inspired theme
 *
 * A cyber-punk theme inspired by The Matrix with dominant green colors,
 * dark background, and accent colors for warnings/errors.
 * Perfect for terminal animations and the Matrix rain effect.
 */

import type { Theme } from "../theme.js";

export const matrixTheme: Theme = {
  name: "matrix",

  primitives: {
    // Green scale - the heart of Matrix aesthetic
    gray: {
      50: "#e8ffe8", // Lightest green tint
      100: "#d0ffd0",
      200: "#a0ffa0",
      300: "#70ff70",
      400: "#40ff40",
      500: "#00ff00", // Classic Matrix green
      600: "#00cc00",
      700: "#009900",
      800: "#006600",
      900: "#003300", // Darkest green
    },

    // Blue scale - for info/highlights (cyan tint)
    blue: {
      50: "#e0ffff",
      100: "#b0ffff",
      200: "#80ffff",
      300: "#50ffff",
      400: "#20ffff",
      500: "#00ffff", // Bright cyan
      600: "#00cccc",
      700: "#009999",
      800: "#006666",
      900: "#003333",
    },

    // Green scale (alternative, darker greens)
    green: {
      50: "#d0ffe0",
      100: "#a0ffb0",
      200: "#70ff80",
      300: "#40ff50",
      400: "#10ff20",
      500: "#00ff00", // Matrix green
      600: "#00dd00",
      700: "#00bb00",
      800: "#008800",
      900: "#005500",
    },

    // Yellow scale - for warnings (amber tint)
    yellow: {
      50: "#fffde0",
      100: "#fffbb0",
      200: "#fff980",
      300: "#fff750",
      400: "#fff520",
      500: "#ffb000", // Amber warning
      600: "#cc8800",
      700: "#996600",
      800: "#664400",
      900: "#332200",
    },

    // Red scale - for errors (dark red)
    red: {
      50: "#ffe0e0",
      100: "#ffb0b0",
      200: "#ff8080",
      300: "#ff5050",
      400: "#ff2020",
      500: "#ff0000",
      600: "#cc0000",
      700: "#990000",
      800: "#660000",
      900: "#330000", // Dark blood red
    },

    // Orange scale - limited use
    orange: {
      50: "#fff0e0",
      100: "#ffd0b0",
      200: "#ffb080",
      300: "#ff9050",
      400: "#ff7020",
      500: "#ff5500",
      600: "#cc4400",
      700: "#993300",
      800: "#662200",
      900: "#331100",
    },

    // Purple scale - minimal use (magenta accent)
    purple: {
      50: "#ffe0ff",
      100: "#ffb0ff",
      200: "#ff80ff",
      300: "#ff50ff",
      400: "#ff20ff",
      500: "#ff00ff",
      600: "#cc00cc",
      700: "#990099",
      800: "#660066",
      900: "#330033",
    },

    // Cyan scale - for special highlights
    cyan: {
      50: "#e0ffff",
      100: "#b0ffff",
      200: "#80ffff",
      300: "#50ffff",
      400: "#20ffff",
      500: "#00ffff",
      600: "#00cccc",
      700: "#009999",
      800: "#006666",
      900: "#003333",
    },

    // Teal - greenish cyan
    teal: {
      50: "#e0fff8",
      100: "#b0fff0",
      200: "#80ffe8",
      300: "#50ffe0",
      400: "#20ffd8",
      500: "#00ffd0",
      600: "#00cca0",
      700: "#009970",
      800: "#006640",
      900: "#003310",
    },
  },

  semantic: {
    foreground: "#00ff40",
    background: "#0a0e0a",
    primary: "#00ff40",
    secondary: "#009900",
    accent: "#00ffff",
    muted: "#027a02",
    success: "#00ff41",
    warning: "#ffb000",
    error: "#a54242",
    info: "#00ffff",
    border: "#006600",
    borderFocus: "#00ff00",
    borderHover: "#009900",
    shadow: "#000000",
    hover: "#001100",
    focus: "#00cc00",
    active: "#00dd00",
    disabled: "#004400",
    selection: "#009900",
    selectionForeground: "#00ff00",
  },

  components: {
    box: {
      bg: "transparent",
      fg: "$semantic.foreground",
      border: "$semantic.border",
    },

    button: {
      bg: "$semantic.primary",
      fg: "#000000", // Black text on bright green
      border: "$semantic.primary",
      bgHover: "$primitives.green.600",
      bgActive: "$primitives.green.700",
      bgDisabled: "$semantic.disabled",
    },

    input: {
      bg: "#001100", // Very dark green background
      fg: "$semantic.foreground",
      border: "$semantic.border",
      borderFocus: "$semantic.borderFocus",
      placeholder: "$semantic.muted",
    },

    text: {
      fg: "$semantic.foreground",
      fgMuted: "$semantic.muted",
    },

    list: {
      bg: "transparent",
      fg: "$semantic.foreground",
      selected: "$semantic.selection",
      selectedFg: "$semantic.selectionForeground",
      item: {
        hover: "$semantic.hover",
        hoverFg: "$semantic.foreground",
      },
    },

    progressBar: {
      bg: "#002200", // Dark green background
      fg: "$semantic.foreground",
      bar: "$semantic.primary",
    },

    scrollbar: {
      track: "#001100",
      thumb: "#003300",
    },
  },
};
