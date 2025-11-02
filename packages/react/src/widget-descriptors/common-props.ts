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

  /**
   * Whether this widget should receive focus on mount
   * @default false
   */
  autoFocus?: boolean;
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
 * Combines layout, events, and focus behavior
 */
export interface InteractiveWidgetProps
  extends FlexboxProps,
    ReactEventProps,
    FocusableProps,
    BorderProps {}

/**
 * Props for text styling
 */
export interface TextStyleProps {
  color?: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  inverse?: boolean;
  dim?: boolean;
}
