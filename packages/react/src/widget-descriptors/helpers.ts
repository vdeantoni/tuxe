/**
 * helpers.ts - Helper functions for widget descriptor composition
 *
 * These functions provide reusable logic that descriptors can compose together,
 * avoiding the need for complex inheritance hierarchies.
 */

import { colors } from "@unblessed/core";
import type {
  BorderProps,
  FocusableProps,
  TextStyleProps,
} from "./common-props.js";

/**
 * Props that include border numbers (for Yoga)
 */
interface BorderNumberProps {
  border?: number;
  borderTop?: number;
  borderBottom?: number;
  borderLeft?: number;
  borderRight?: number;
}

/**
 * Builds border configuration from BorderProps
 * IMPORTANT: Only creates border if Yoga knows about it (border numbers are set)
 *
 * @param props - Props with border configuration
 * @returns Border object or null if no border numbers are set
 */
export function buildBorder(
  props: BorderProps & BorderNumberProps,
): any | null {
  // Only create border if Yoga knows about it (has border numbers)
  // This prevents creating borders that Yoga doesn't reserve space for
  if (
    !Number(props.border) &&
    !Number(props.borderTop) &&
    !Number(props.borderBottom) &&
    !Number(props.borderLeft) &&
    !Number(props.borderRight)
  ) {
    return null;
  }

  const border: any = {
    type: "line",
    style: props.borderStyle || "single",
  };

  // Per-side visibility
  border.top =
    props.borderTop !== undefined ? Number(props.borderTop) > 0 : true;
  border.bottom =
    props.borderBottom !== undefined ? Number(props.borderBottom) > 0 : true;
  border.left =
    props.borderLeft !== undefined ? Number(props.borderLeft) > 0 : true;
  border.right =
    props.borderRight !== undefined ? Number(props.borderRight) > 0 : true;

  // Border color (global or per-side)
  if (props.borderColor) {
    border.fg = colors.convert(props.borderColor);
  }

  if (props.borderTopColor) {
    border.topColor = colors.convert(props.borderTopColor);
  }
  if (props.borderBottomColor) {
    border.bottomColor = colors.convert(props.borderBottomColor);
  }
  if (props.borderLeftColor) {
    border.leftColor = colors.convert(props.borderLeftColor);
  }
  if (props.borderRightColor) {
    border.rightColor = colors.convert(props.borderRightColor);
  }

  // Border dim (global or per-side)
  if (props.borderDimColor !== undefined) {
    border.dim = props.borderDimColor;
  }

  if (props.borderTopDim !== undefined) {
    border.borderTopDim = props.borderTopDim;
  }
  if (props.borderBottomDim !== undefined) {
    border.borderBottomDim = props.borderBottomDim;
  }
  if (props.borderLeftDim !== undefined) {
    border.borderLeftDim = props.borderLeftDim;
  }
  if (props.borderRightDim !== undefined) {
    border.borderRightDim = props.borderRightDim;
  }

  return border;
}

/**
 * Pre-populates style.border.fg for unblessed compatibility
 *
 * @param border - Border configuration object
 * @returns Style object with border.fg set, or empty object if no border
 */
export function prepareBorderStyle(border: any): any {
  if (!border) return {};

  return {
    border: {
      fg: border.fg,
    },
  };
}

/**
 * Builds text style object from TextStyleProps
 *
 * @param props - Props with text styling
 * @returns Style object or null if no text styles are set
 */
export function buildTextStyles(props: TextStyleProps): any | null {
  if (
    !props.color &&
    !props.backgroundColor &&
    !props.bold &&
    !props.italic &&
    !props.underline &&
    !props.strikethrough &&
    !props.inverse &&
    !props.dim
  ) {
    return null;
  }

  const style: any = {};

  if (props.color) {
    style.fg = colors.convert(props.color);
  }
  if (props.backgroundColor) {
    style.bg = colors.convert(props.backgroundColor);
  }
  if (props.bold) style.bold = true;
  if (props.italic) style.italic = true;
  if (props.underline) style.underline = true;
  if (props.strikethrough) style.strikethrough = true;
  if (props.inverse) style.inverse = true;
  if (props.dim) style.dim = true;

  return style;
}

/**
 * Builds focusable widget options (tabIndex, autoFocus)
 *
 * @param props - Props with focus configuration
 * @param defaultTabIndex - Default tabIndex value (typically 0 for interactive widgets)
 * @returns Options object with focus properties
 */
export function buildFocusableOptions(
  props: FocusableProps,
  defaultTabIndex: number = 0,
): any {
  const options: any = {};

  // Set tabIndex (use provided value or default)
  options.tabIndex =
    props.tabIndex !== undefined ? props.tabIndex : defaultTabIndex;

  if (props.autoFocus !== undefined) {
    options.autoFocus = props.autoFocus;
  }

  return options;
}

/**
 * Merges multiple style objects, handling nested properties correctly
 *
 * @param styles - Array of style objects to merge
 * @returns Merged style object
 */
export function mergeStyles(...styles: any[]): any {
  const merged: any = {};

  for (const style of styles) {
    if (!style) continue;

    for (const [key, value] of Object.entries(style)) {
      if (key === "border" && merged.border) {
        // Merge border objects
        merged.border = { ...merged.border, ...value };
      } else {
        merged[key] = value;
      }
    }
  }

  return Object.keys(merged).length > 0 ? merged : null;
}
