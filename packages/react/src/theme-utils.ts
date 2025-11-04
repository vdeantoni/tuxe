/**
 * theme-utils.ts - Theme color resolution utilities
 *
 * Provides functions to resolve color values from theme references.
 * Supports:
 * - Explicit colors: "cyan", "#ff0000", 123
 * - Theme references: "$primary", "$semantic.success", "$primitives.blue.500"
 * - Fallbacks when resolution fails
 */

import type { Theme } from "./theme.js";

/**
 * Check if a string is a theme reference (starts with $).
 *
 * @param color - Color value to check
 * @returns True if it's a theme reference
 *
 * @example
 * isThemeReference("$primary") // true
 * isThemeReference("cyan") // false
 * isThemeReference("#ff0000") // false
 */
export function isThemeReference(color: string | number | undefined): boolean {
  return typeof color === "string" && color.startsWith("$");
}

/**
 * Resolve a theme reference to its actual color value.
 * Supports dot-notation paths into the theme object.
 *
 * @param ref - Theme reference (e.g., "$primary", "$semantic.success")
 * @param theme - Theme object to resolve from
 * @returns Resolved color value or undefined if path invalid
 *
 * @example
 * resolveThemeReference("$primary", theme)
 * // → theme.semantic.primary
 *
 * resolveThemeReference("$semantic.success", theme)
 * // → theme.semantic.success
 *
 * resolveThemeReference("$primitives.blue.500", theme)
 * // → theme.primitives.blue["500"]
 */
export function resolveThemeReference(
  ref: string,
  theme: Theme,
): string | undefined {
  // Remove leading $
  const path = ref.slice(1);

  // Split into parts
  const parts = path.split(".");

  // Handle shorthand (no layer specified)
  // "$primary" → "semantic.primary"
  if (parts.length === 1) {
    const key = parts[0];
    // Try semantic first (most common)
    if (key in theme.semantic) {
      const value = theme.semantic[key as keyof typeof theme.semantic];
      // Recursively resolve if it's also a reference
      if (isThemeReference(value)) {
        return resolveThemeReference(value as string, theme);
      }
      return value as string;
    }
    return undefined;
  }

  // Navigate the path
  let current: any = theme;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  // If result is still a reference, resolve it recursively
  if (isThemeReference(current)) {
    return resolveThemeReference(current, theme);
  }

  return typeof current === "string" ? current : undefined;
}

/**
 * Resolve a color value, handling explicit colors, theme references, and fallbacks.
 *
 * Resolution order:
 * 1. If color is explicit (not $reference), return as-is
 * 2. If color is $reference, resolve from theme
 * 3. If resolution fails or color undefined, return fallback
 * 4. If fallback is also $reference, resolve it
 * 5. Return "transparent" if all else fails
 *
 * @param color - Color value (explicit, reference, or undefined)
 * @param theme - Theme object to resolve references from
 * @param fallback - Fallback color if resolution fails
 * @returns Resolved color value
 *
 * @example
 * resolveColor("cyan", theme) // → "cyan"
 * resolveColor("$primary", theme) // → "#3b82f6"
 * resolveColor("$invalid", theme, "red") // → "red"
 * resolveColor(undefined, theme, "$semantic.foreground") // → "#e5e7eb"
 */
export function resolveColor(
  color: string | number | undefined,
  theme: Theme,
  fallback?: string,
): string | number {
  // If color is provided and not a reference, use it as-is
  if (color !== undefined && !isThemeReference(color)) {
    return color;
  }

  // If color is a reference, try to resolve it
  if (color !== undefined && isThemeReference(color)) {
    const resolved = resolveThemeReference(color as string, theme);
    if (resolved !== undefined) {
      return resolved;
    }
  }

  // Color is undefined or couldn't be resolved, try fallback
  if (fallback !== undefined) {
    // If fallback is also a reference, resolve it
    if (isThemeReference(fallback)) {
      const resolved = resolveThemeReference(fallback, theme);
      if (resolved !== undefined) {
        return resolved;
      }
    }
    return fallback;
  }

  // No color, no fallback - return transparent
  return "transparent";
}
