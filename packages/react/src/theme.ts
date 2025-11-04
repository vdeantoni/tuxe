/**
 * theme.ts - Theme type system for @unblessed/react
 *
 * Three-layer design token architecture:
 * 1. Primitives - Color scales (gray50-900, blue50-900, etc.)
 * 2. Semantic - Intent-based colors (primary, success, error, etc.)
 * 3. Components - Widget-specific defaults (box.bg, button.fg, etc.)
 */

/**
 * Color primitive scale from lightest (50) to darkest (900).
 * Based on standard design system conventions (Tailwind, Material, etc.)
 */
export interface ColorPrimitive {
  50: string; // Lightest
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Base
  600: string;
  700: string;
  800: string;
  900: string; // Darkest
}

/**
 * Complete set of color primitives.
 * These are the foundational colors that semantic and component colors reference.
 */
export interface ThemePrimitives {
  // Grayscale (for text, borders, backgrounds)
  gray: ColorPrimitive;

  // Brand colors
  blue: ColorPrimitive;
  purple: ColorPrimitive;
  cyan: ColorPrimitive;
  teal: ColorPrimitive;

  // Semantic intent colors
  green: ColorPrimitive; // Success
  yellow: ColorPrimitive; // Warning
  red: ColorPrimitive; // Error/Danger
  orange: ColorPrimitive; // Info
}

/**
 * Semantic colors that map intent to specific primitive colors.
 * These provide meaning and should be used instead of primitives when possible.
 */
export interface ThemeSemantic {
  // Base colors
  foreground: string; // Default text color
  background: string; // Default background

  // Interactive states
  primary: string; // Primary actions/highlights
  secondary: string; // Secondary actions
  accent: string; // Accent/emphasis
  muted: string; // De-emphasized text

  // Intent colors
  success: string; // Success states
  warning: string; // Warning states
  error: string; // Error states
  info: string; // Info states

  // UI elements
  border: string; // Default border color
  borderFocus: string; // Focused border color
  borderHover: string; // Hovered border color
  shadow: string; // Shadow/overlay color

  // Interactive elements
  hover: string; // Hover background
  focus: string; // Focus background
  active: string; // Active/pressed state
  disabled: string; // Disabled state

  // Selection
  selection: string; // Selected items
  selectionForeground: string; // Text on selection
}

/**
 * Component-specific color defaults.
 * Each widget type can define its default color scheme.
 */
export interface ComponentColors {
  box: {
    bg: string;
    fg: string;
    border: string;
  };
  button: {
    bg: string;
    fg: string;
    border: string;
    bgHover: string;
    bgActive: string;
    bgDisabled: string;
  };
  input: {
    bg: string;
    fg: string;
    border: string;
    borderFocus: string;
    placeholder: string;
  };
  text: {
    fg: string;
    fgMuted: string;
  };
  list: {
    bg: string;
    fg: string;
    selected: string;
    selectedFg: string;
    item: {
      hover: string;
      hoverFg: string;
    };
  };
  progressBar: {
    bg: string;
    fg: string;
    bar: string;
  };
  scrollbar: {
    track: string;
    thumb: string;
  };
}

/**
 * Complete theme definition combining all three layers.
 */
export interface Theme {
  name: string;
  primitives: ThemePrimitives;
  semantic: ThemeSemantic;
  components: ComponentColors;
}
