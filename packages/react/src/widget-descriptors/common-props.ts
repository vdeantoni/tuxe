/**
 * common-props.ts - Shared prop interfaces for widget inheritance
 *
 * This module defines common prop interfaces that are composed/extended
 * by specific widget descriptors, avoiding duplication.
 */

import type { FlexboxProps } from "@unblessed/layout";
import type { ReactEventProps } from "../types.js";

/**
 * Props for widgets that can receive focus
 */
export interface FocusableProps {
  /**
   * Tab index for focus navigation (0 = can be focused, -1 = skip)
   * @default 0 for interactive widgets
   */
  tabIndex?: number;
}

/**
 * Props for widgets with borders
 */
export interface BorderProps {
  borderStyle?: "single" | "double" | "round" | "bold" | "classic";
  borderColor?: string;
  borderDimColor?: boolean;
  borderTopColor?: string;
  borderBottomColor?: string;
  borderLeftColor?: string;
  borderRightColor?: string;
  borderTopDim?: boolean;
  borderBottomDim?: boolean;
  borderLeftDim?: boolean;
  borderRightDim?: boolean;
}

/**
 * Props for interactive widgets (buttons, inputs, etc.)
 * Combines layout, events, focus behavior, and styling
 * Default state style properties are direct props (inherited from StyleObject)
 * State variations use nested objects (hover, focus)
 */
export interface InteractiveWidgetProps
  extends FlexboxProps,
    ReactEventProps,
    FocusableProps,
    BorderProps,
    Omit<StyleObject, "border"> {
  hover?: StyleObject;
  focus?: StyleObject;
}

/**
 * Border state styling object
 * Used for styling borders in different states (hover, focus, etc.)
 */
export interface BorderStyleObject {
  // Primary names
  color?: string; // Border line color (maps to fg in unblessed)
  backgroundColor?: string; // Border background color (maps to bg)

  // Shorthands
  fg?: string; // Shorthand for color
  bg?: string; // Shorthand for backgroundColor
  background?: string; // Alternative shorthand for backgroundColor

  // Per-side colors
  topColor?: string;
  bottomColor?: string;
  leftColor?: string;
  rightColor?: string;

  // Dim properties
  dim?: boolean;
  topDim?: boolean;
  bottomDim?: boolean;
  leftDim?: boolean;
  rightDim?: boolean;
}

/**
 * Complete style object for widget state styling
 * Supports both primary names and shorthands (like CSS)
 */
export interface StyleObject {
  // Primary names
  color?: string; // Text color
  backgroundColor?: string; // Background color

  // Shorthands
  fg?: string; // Shorthand for color
  bg?: string; // Shorthand for backgroundColor
  background?: string; // Alternative shorthand for backgroundColor

  // Text styles
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  reverse?: boolean;
  dim?: boolean;
  blink?: boolean;
  hide?: boolean;

  border?: BorderStyleObject;
}
