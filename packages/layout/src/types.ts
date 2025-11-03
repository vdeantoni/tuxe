/**
 * types.ts - Type definitions for @unblessed/layout
 */

import type { Element, Screen } from "@unblessed/core";
import type { Node as YogaNode } from "yoga-layout";
import { WidgetDescriptor } from "./widget-descriptor";

/**
 * Flexbox style properties supported by the layout engine.
 * These map to Yoga layout properties.
 */
export interface FlexboxProps {
  /**
   * Flex grow factor - how much the element should grow to fill available space.
   * @default 0
   */
  flexGrow?: number;

  /**
   * Flex shrink factor - how much the element should shrink when space is limited.
   * @default 1
   */
  flexShrink?: number;

  /**
   * Flex basis - initial size before flex grow/shrink is applied.
   */
  flexBasis?: number | string;

  /**
   * Direction of flex items in the container.
   * @default 'column'
   */
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";

  /**
   * How to wrap flex items.
   * @default 'nowrap'
   */
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse";

  /**
   * Alignment along the main axis.
   * @default 'flex-start'
   */
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";

  /**
   * Alignment along the cross axis.
   * @default 'stretch'
   */
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";

  /**
   * Override alignItems for this specific element.
   * @default 'auto'
   */
  alignSelf?: "auto" | "flex-start" | "center" | "flex-end" | "stretch";

  /**
   * Width of the element in terminal columns.
   * Can be a number or percentage string ('50%').
   */
  width?: number | string;

  /**
   * Height of the element in terminal rows.
   * Can be a number or percentage string ('50%').
   */
  height?: number | string;

  /**
   * Minimum width in terminal columns.
   */
  minWidth?: number | string;

  /**
   * Minimum height in terminal rows.
   */
  minHeight?: number | string;

  /**
   * Maximum width in terminal columns.
   */
  maxWidth?: number | string;

  /**
   * Maximum height in terminal rows.
   */
  maxHeight?: number | string;

  /**
   * Margin on all sides.
   */
  margin?: number;

  /**
   * Margin on horizontal sides (left and right).
   */
  marginX?: number;

  /**
   * Margin on vertical sides (top and bottom).
   */
  marginY?: number;

  /**
   * Top margin.
   */
  marginTop?: number;

  /**
   * Bottom margin.
   */
  marginBottom?: number;

  /**
   * Left margin.
   */
  marginLeft?: number;

  /**
   * Right margin.
   */
  marginRight?: number;

  /**
   * Padding on all sides.
   */
  padding?: number;

  /**
   * Padding on horizontal sides (left and right).
   */
  paddingX?: number;

  /**
   * Padding on vertical sides (top and bottom).
   */
  paddingY?: number;

  /**
   * Top padding.
   */
  paddingTop?: number;

  /**
   * Bottom padding.
   */
  paddingBottom?: number;

  /**
   * Left padding.
   */
  paddingLeft?: number;

  /**
   * Right padding.
   */
  paddingRight?: number;

  /**
   * Border on all sides.
   */
  border?: number;

  /**
   * Top border.
   */
  borderTop?: number;

  /**
   * Bottom border.
   */
  borderBottom?: number;

  /**
   * Left border.
   */
  borderLeft?: number;

  /**
   * Right border.
   */
  borderRight?: number;

  /**
   * Gap between flex items (applies to both row and column gap).
   */
  gap?: number;

  /**
   * Gap between columns.
   */
  columnGap?: number;

  /**
   * Gap between rows.
   */
  rowGap?: number;

  /**
   * Position type.
   * @default 'relative'
   */
  position?: "relative" | "absolute";

  /**
   * Display type.
   * @default 'flex'
   */
  display?: "flex" | "none";
}

/**
 * A layout node represents a virtual DOM node with Yoga layout.
 * It bridges React/framework layer to unblessed widgets.
 */
export interface LayoutNode {
  /**
   * Node type identifier.
   */
  type: string;

  /**
   * Yoga layout node - handles flexbox calculations.
   */
  yogaNode: YogaNode;

  /**
   * Flexbox properties for this node.
   */
  props: FlexboxProps;

  /**
   * Child layout nodes.
   */
  children: LayoutNode[];

  /**
   * Parent layout node.
   */
  parent: LayoutNode | null;

  /**
   * The created unblessed widget (set after layout calculation).
   */
  widget?: Element;

  /**
   * Additional unblessed widget options (non-layout props).
   */
  widgetOptions?: any;

  /**
   * Event handlers to bind to the widget (from React props like onClick, onFocus).
   */
  eventHandlers?: Record<string, Function>;

  /**
   * Currently bound event handlers (used for cleanup on update).
   */
  _boundHandlers?: Record<string, Function>;

  /**
   * Widget descriptor instance
   * This encapsulates all widget configuration and creation logic.
   */
  _descriptor?: WidgetDescriptor;
}

/**
 * Computed layout from Yoga.
 */
export interface ComputedLayout {
  /**
   * Top position in terminal rows.
   */
  top: number;

  /**
   * Left position in terminal columns.
   */
  left: number;

  /**
   * Width in terminal columns.
   */
  width: number;

  /**
   * Height in terminal rows.
   */
  height: number;
}

/**
 * Options for creating a layout manager.
 */
export interface LayoutManagerOptions {
  /**
   * The screen to attach widgets to.
   */
  screen: Screen;

  /**
   * Debug mode - logs layout calculations.
   * @default false
   */
  debug?: boolean;
}
