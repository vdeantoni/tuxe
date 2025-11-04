/**
 * unblessed.ts - Default unblessed theme
 *
 * A professional dark theme with well-balanced colors optimized for
 * terminal readability. Color scales based on industry standards
 * (Tailwind CSS color system).
 */

import type { Theme } from "../theme.js";

export const unblessedTheme: Theme = {
  name: "unblessed",

  primitives: {
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },

    blue: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },

    green: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
    },

    yellow: {
      50: "#fefce8",
      100: "#fef9c3",
      200: "#fef08a",
      300: "#fde047",
      400: "#facc15",
      500: "#eab308",
      600: "#ca8a04",
      700: "#a16207",
      800: "#854d0e",
      900: "#713f12",
    },

    red: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },

    orange: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316",
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
    },

    purple: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7",
      600: "#9333ea",
      700: "#7e22ce",
      800: "#6b21a8",
      900: "#581c87",
    },

    cyan: {
      50: "#ecfeff",
      100: "#cffafe",
      200: "#a5f3fc",
      300: "#67e8f9",
      400: "#22d3ee",
      500: "#06b6d4",
      600: "#0891b2",
      700: "#0e7490",
      800: "#155e75",
      900: "#164e63",
    },

    teal: {
      50: "#f0fdfa",
      100: "#ccfbf1",
      200: "#99f6e4",
      300: "#5eead4",
      400: "#2dd4bf",
      500: "#14b8a6",
      600: "#0d9488",
      700: "#0f766e",
      800: "#115e59",
      900: "#134e4a",
    },
  },

  semantic: {
    // Base colors
    foreground: "#e5e7eb", // gray.200
    background: "#111827", // gray.900

    // Interactive states
    primary: "#3b82f6", // blue.500
    secondary: "#6b7280", // gray.500
    accent: "#a855f7", // purple.500
    muted: "#9ca3af", // gray.400

    // Intent colors
    success: "#22c55e", // green.500
    warning: "#eab308", // yellow.500
    error: "#ef4444", // red.500
    info: "#06b6d4", // cyan.500

    // UI elements
    border: "#374151", // gray.700
    borderFocus: "#3b82f6", // blue.500
    borderHover: "#4b5563", // gray.600
    shadow: "#000000",

    // Interactive elements
    hover: "#1f2937", // gray.800
    focus: "#1e40af", // blue.800
    active: "#1d4ed8", // blue.700
    disabled: "#4b5563", // gray.600

    // Selection
    selection: "#2563eb", // blue.600
    selectionForeground: "#ffffff",
  },

  components: {
    box: {
      bg: "transparent",
      fg: "$semantic.foreground",
      border: "$semantic.border",
    },

    button: {
      bg: "$semantic.primary",
      fg: "#ffffff",
      border: "$semantic.primary",
      bgHover: "$primitives.blue.600",
      bgActive: "$primitives.blue.700",
      bgDisabled: "$semantic.disabled",
    },

    input: {
      bg: "$primitives.gray.800",
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
      bg: "$primitives.gray.700",
      fg: "$semantic.foreground",
      bar: "$semantic.primary",
    },

    scrollbar: {
      track: "$primitives.gray.800",
      thumb: "$primitives.gray.600",
    },
  },
};
