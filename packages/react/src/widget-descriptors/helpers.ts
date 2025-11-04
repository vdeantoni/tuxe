/**
 * helpers.ts - Helper functions for widget descriptor composition
 *
 * These functions provide reusable logic that descriptors can compose together,
 * avoiding the need for complex inheritance hierarchies.
 */

import { colors } from "@unblessed/core";
import { resolveColor } from "../theme-utils.js";
import type { Theme } from "../theme.js";
import type {
  BorderProps,
  BorderStyleObject,
  FocusableProps,
  StyleObject,
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
 * @param theme - Theme for color resolution
 * @returns Border object or null if no border numbers are set
 */
export function buildBorder(
  props: BorderProps & BorderNumberProps,
  theme: Theme,
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

  // Border color (global or per-side) - resolve from theme
  if (props.borderColor) {
    const resolved = resolveColor(props.borderColor, theme);
    border.fg = colors.convert(resolved);
  }

  if (props.borderTopColor) {
    const resolved = resolveColor(props.borderTopColor, theme);
    border.topColor = colors.convert(resolved);
  }
  if (props.borderBottomColor) {
    const resolved = resolveColor(props.borderBottomColor, theme);
    border.bottomColor = colors.convert(resolved);
  }
  if (props.borderLeftColor) {
    const resolved = resolveColor(props.borderLeftColor, theme);
    border.leftColor = colors.convert(resolved);
  }
  if (props.borderRightColor) {
    const resolved = resolveColor(props.borderRightColor, theme);
    border.rightColor = colors.convert(resolved);
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
 * @param theme - Theme for color resolution
 * @returns Style object or null if no text styles are set
 */
export function buildTextStyles(props: StyleObject, theme: Theme): any | null {
  if (
    !props.color &&
    !props.backgroundColor &&
    !props.bold &&
    !props.italic &&
    !props.underline &&
    !props.strikethrough &&
    !props.reverse &&
    !props.blink &&
    !props.hide &&
    !props.dim
  ) {
    return null;
  }

  const style: any = {};

  if (props.color) {
    const resolved = resolveColor(props.color, theme);
    style.fg = colors.convert(resolved);
  }
  if (props.backgroundColor) {
    const resolved = resolveColor(props.backgroundColor, theme);
    style.bg = colors.convert(resolved);
  }
  if (props.bold) style.bold = true;
  if (props.italic) style.italic = true;
  if (props.underline) style.underline = true;
  if (props.strikethrough) style.strikethrough = true;
  if (props.reverse) style.inverse = true;
  if (props.blink) style.blink = true;
  if (props.hide) style.invisible = true;
  if (props.dim) style.dim = true;

  return style;
}

/**
 * Builds focusable widget options
 *
 * **IMPORTANT**: For focus effects to work, elements must be keyable.
 * This ensures they receive focus/blur events from the screen.
 *
 * @param props - Props with focus configuration
 * @param defaultTabIndex - Default tabIndex value if not provided (typically 0 for interactive widgets, undefined for non-interactive)
 * @returns Options object with focus properties
 */
export function buildFocusableOptions(
  props: FocusableProps,
  defaultTabIndex?: number,
): any {
  const options: any = {};

  // Only set tabIndex if explicitly provided by user, or if we have a default to apply
  if (props.tabIndex !== undefined) {
    options.tabIndex = props.tabIndex;
  } else if (defaultTabIndex !== undefined) {
    options.tabIndex = defaultTabIndex;
  }

  // CRITICAL: Set keyable=true if element has tabIndex
  // This ensures the element receives keyboard input and focus/blur events
  // Without this, focusEffects won't work!
  if (options.tabIndex !== undefined) {
    options.keyable = true;
    options.clickable = true;
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
        merged.border = { ...merged.border, ...(value as any) };
      } else {
        merged[key] = value;
      }
    }
  }

  return Object.keys(merged).length > 0 ? merged : null;
}

/**
 * Builds border style object from BorderStyleObject
 * Converts color names to numbers and normalizes shorthands
 *
 * @param borderStyle - Border style configuration
 * @param theme - Theme for color resolution
 * @returns Unblessed border style object
 */
function buildBorderStyleObject(
  borderStyle: BorderStyleObject,
  theme: Theme,
): any {
  const border: any = {};

  // Normalize color shorthands
  const fg = borderStyle.color ?? borderStyle.fg;
  const bg =
    borderStyle.bg ?? borderStyle.background ?? borderStyle.backgroundColor;

  // Main colors - resolve from theme
  if (fg) {
    const resolved = resolveColor(fg, theme);
    border.fg = colors.convert(resolved);
  }
  if (bg) {
    const resolved = resolveColor(bg, theme);
    border.bg = colors.convert(resolved);
  }

  // Per-side colors - resolve from theme
  if (borderStyle.topColor) {
    const resolved = resolveColor(borderStyle.topColor, theme);
    border.topColor = colors.convert(resolved);
  }
  if (borderStyle.bottomColor) {
    const resolved = resolveColor(borderStyle.bottomColor, theme);
    border.bottomColor = colors.convert(resolved);
  }
  if (borderStyle.leftColor) {
    const resolved = resolveColor(borderStyle.leftColor, theme);
    border.leftColor = colors.convert(resolved);
  }
  if (borderStyle.rightColor) {
    const resolved = resolveColor(borderStyle.rightColor, theme);
    border.rightColor = colors.convert(resolved);
  }

  // Dim properties
  if (borderStyle.dim !== undefined) border.dim = borderStyle.dim;
  if (borderStyle.topDim !== undefined) border.topDim = borderStyle.topDim;
  if (borderStyle.bottomDim !== undefined)
    border.bottomDim = borderStyle.bottomDim;
  if (borderStyle.leftDim !== undefined) border.leftDim = borderStyle.leftDim;
  if (borderStyle.rightDim !== undefined)
    border.rightDim = borderStyle.rightDim;

  return border;
}

/**
 * Builds style object from StyleObject
 * Converts StyleObject (React props) to unblessed style format
 * Handles color conversion and shorthand normalization
 *
 * @param styleObj - Style configuration object
 * @param theme - Theme for color resolution
 * @returns Unblessed style object
 */
export function buildStyleObject(
  styleObj: StyleObject | undefined,
  theme: Theme,
): any {
  if (!styleObj) return {};

  const style: any = {};

  // Normalize color shorthands (priority: shorthand > full name)
  const fg = styleObj.fg ?? styleObj.color;
  const bg = styleObj.bg ?? styleObj.background ?? styleObj.backgroundColor;

  // Text colors - resolve from theme
  if (fg) {
    const resolved = resolveColor(fg, theme);
    style.fg = colors.convert(resolved);
  }
  if (bg) {
    const resolved = resolveColor(bg, theme);
    style.bg = colors.convert(resolved);
  }

  // Text styles
  if (styleObj.bold !== undefined) style.bold = styleObj.bold;
  if (styleObj.italic !== undefined) style.italic = styleObj.italic;
  if (styleObj.underline !== undefined) style.underline = styleObj.underline;
  if (styleObj.strikethrough !== undefined)
    style.strikethrough = styleObj.strikethrough;
  if (styleObj.reverse !== undefined) style.inverse = styleObj.reverse;
  if (styleObj.dim !== undefined) style.dim = styleObj.dim;
  if (styleObj.blink !== undefined) style.blink = styleObj.blink;
  if (styleObj.hide !== undefined) style.invisible = styleObj.hide;

  // Border styling (nested) - pass theme through
  if (styleObj.border) {
    style.border = buildBorderStyleObject(styleObj.border, theme);
  }

  return style;
}

/**
 * Extracts StyleObject properties from component props
 * Used to get default state styling from direct component props
 *
 * @param props - Component props object
 * @returns StyleObject extracted from props
 */
export function extractStyleProps(props: any): StyleObject {
  const styleObj: StyleObject = {};

  // Extract color properties
  if (props.color !== undefined) styleObj.color = props.color;
  if (props.fg !== undefined) styleObj.fg = props.fg;
  if (props.backgroundColor !== undefined)
    styleObj.backgroundColor = props.backgroundColor;
  if (props.bg !== undefined) styleObj.bg = props.bg;
  if (props.background !== undefined) styleObj.background = props.background;

  // Extract text style properties
  if (props.bold !== undefined) styleObj.bold = props.bold;
  if (props.italic !== undefined) styleObj.italic = props.italic;
  if (props.underline !== undefined) styleObj.underline = props.underline;
  if (props.strikethrough !== undefined)
    styleObj.strikethrough = props.strikethrough;
  if (props.reverse !== undefined) styleObj.reverse = props.reverse;
  if (props.dim !== undefined) styleObj.dim = props.dim;
  if (props.blink !== undefined) styleObj.blink = props.blink;
  if (props.hide !== undefined) styleObj.hide = props.hide;

  // Note: We don't extract border here because StyleObject.border is a BorderStyleObject,
  // not the same as BorderProps.border (which is a number for Yoga layout)

  return styleObj;
}
