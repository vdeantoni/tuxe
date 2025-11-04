/**
 * theme-registry.ts - Shared theme state for reconciler and ThemeProvider
 *
 * This module provides a shared location for storing the current theme
 * that both the reconciler and ThemeProvider can access.
 */

import type { Theme } from "./theme.js";
import { unblessedTheme } from "./themes/index.js";

let currentTheme: Theme = unblessedTheme;

/**
 * Get the current theme.
 * Called by the reconciler when creating/updating descriptors.
 */
export function getCurrentTheme(): Theme {
  return currentTheme;
}

/**
 * Set the current theme.
 * Called by ThemeProvider when theme changes.
 */
export function setCurrentTheme(theme: Theme): void {
  currentTheme = theme;
}
