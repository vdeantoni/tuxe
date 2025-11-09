/**
 * Box.tsx - Box component and descriptor for @unblessed/react
 */

import { Box as BoxWidget, type Screen } from "@unblessed/core";
import {
  ComputedLayout,
  FlexboxProps,
  WidgetDescriptor,
} from "@unblessed/layout";
import type { ReactNode } from "react";
import { forwardRef, type PropsWithChildren } from "react";
import type { Theme } from "../themes/theme.js";
import { InteractiveWidgetProps } from "../widget-descriptors";
import {
  buildFocusableOptions,
  buildFocusEffects,
  buildHoverEffects,
  buildStyleObject,
  extractEventHandlers,
  extractFlexboxProps,
  extractStyleProps,
  getComponentDefaults,
  initializeBorderStyle,
  mergeStyles,
} from "../widget-descriptors/helpers.js";

export const COMMON_WIDGET_OPTIONS = {
  tags: true,
  mouse: true,
  keys: true,
};

/**
 * Props interface for Box component
 * Combines flexbox layout props with box-specific visual properties
 *
 * Inherits all interactive widget properties including:
 * - Layout (flexbox, width, height, padding, margin, etc.)
 * - Events (onClick, onKeyPress, onFocus, etc.)
 * - Styling (color, bg, bold, etc.)
 * - State styling (hover, focus)
 * - Borders (borderStyle, borderColor, etc.)
 */
export interface BoxProps extends InteractiveWidgetProps {
  content?: string;
  children?: ReactNode;

  /**
   * Wrap text if it exceeds width (legacy boolean).
   */
  wrap?: boolean;

  /**
   * Text wrapping/truncation mode (ink-style).
   *
   * - 'wrap': Word wrap text to multiple lines (default)
   * - 'truncate-end': Truncate at end with ellipsis: "Hello W…"
   * - 'truncate-middle': Truncate in middle with ellipsis: "Hel…rld"
   * - 'truncate-start': Truncate at start with ellipsis: "…World"
   */
  textWrap?: "wrap" | "truncate-end" | "truncate-middle" | "truncate-start";
}

/**
 * Descriptor for Box widgets
 */
export class BoxDescriptor<T extends BoxProps> extends WidgetDescriptor<
  T,
  Theme
> {
  readonly type: string = "box";

  get flexProps(): FlexboxProps {
    return extractFlexboxProps(this.props);
  }

  get widgetOptions(): Record<string, any> {
    const widgetOptions: any = {};

    // Initialize border and style.border in one clean step
    const borderInit = initializeBorderStyle(
      this,
      !!this.props.hover?.border,
      !!this.props.focus?.border,
    );
    if (borderInit.border) {
      widgetOptions.border = borderInit.border;
    }
    widgetOptions.style = borderInit.style;

    // Build focusable options using helper function
    // Box is not focusable by default (no defaultTabIndex)
    Object.assign(widgetOptions, buildFocusableOptions(this.props));

    // Get theme defaults for this component type
    const defaults = getComponentDefaults(this);

    // Base/default state styling from direct props
    const defaultStyle = extractStyleProps(this.props);
    const baseStyle = buildStyleObject(this, defaultStyle);
    if (Object.keys(baseStyle).length > 0) {
      widgetOptions.style = mergeStyles(widgetOptions.style, baseStyle);
    }

    // Build hover effects - use props or fall back to theme defaults
    let hoverEffects = null;
    if (this.props.hover) {
      hoverEffects = buildHoverEffects(this, this.props.hover);
    } else if (defaults.hoverFg || defaults.hoverBg) {
      // Apply theme defaults for hover
      const themeHover: any = {};
      if (defaults.hoverFg) themeHover.fg = defaults.hoverFg;
      if (defaults.hoverBg) themeHover.bg = defaults.hoverBg;
      hoverEffects = buildHoverEffects(this, themeHover);
    }
    if (hoverEffects) {
      widgetOptions.hoverEffects = hoverEffects;
    }

    // Build focus effects - automatically applies focusBorderColor from theme
    const focusEffects = buildFocusEffects(this, this.props.focus);
    if (focusEffects) {
      widgetOptions.focusEffects = focusEffects;
    }

    // Content
    if (this.props.content !== undefined) {
      widgetOptions.content = this.props.content;
    }

    // Text wrapping support
    if (this.props.wrap !== undefined) {
      widgetOptions.wrap = this.props.wrap;
    }

    if (this.props.textWrap !== undefined) {
      widgetOptions.textWrap = this.props.textWrap;
    }

    return widgetOptions;
  }

  get eventHandlers(): Record<string, Function> {
    return extractEventHandlers(this.props);
  }

  createWidget(layout: ComputedLayout, screen: Screen): BoxWidget {
    return new BoxWidget({
      screen,
      ...COMMON_WIDGET_OPTIONS,
      top: layout.top,
      left: layout.left,
      width: layout.width,
      height: layout.height,
      ...this.widgetOptions,
    });
  }
}

/**
 * Box component - Container with flexbox layout support
 *
 * Supports flexbox properties, borders, colors, event handling, and state styling.
 * Default state styling uses direct props (color, bg, bold, etc.)
 * State variations use nested objects (hover, focus)
 *
 * @example Basic layout
 * ```tsx
 * <Box
 *   flexDirection="row"
 *   gap={2}
 *   padding={1}
 *   border={1}
 *   borderStyle="single"
 *   borderColor="cyan"
 * >
 *   <Box width={20}>Left</Box>
 *   <Box flexGrow={1}>Middle</Box>
 *   <Box width={20}>Right</Box>
 * </Box>
 * ```
 *
 * @example With styling and state effects
 * ```tsx
 * <Box
 *   padding={1}
 *   border={1}
 *   borderStyle="single"
 *   borderColor="white"
 *   color="gray"
 *   hover={{ border: { color: "cyan" }, color: "white" }}
 *   focus={{ border: { color: "yellow" } }}
 * >
 *   Interactive Box
 * </Box>
 * ```
 *
 * @example With event handling
 * ```tsx
 * <Box
 *   padding={1}
 *   border={1}
 *   borderStyle="single"
 *   tabIndex={0}
 *   onClick={(data) => console.log('Clicked!', data)}
 *   onKeyPress={(ch, key) => {
 *     if (key.name === 'enter') handleSubmit();
 *   }}
 * >
 *   Click or press Enter
 * </Box>
 * ```
 *
 * @example With ref for direct widget manipulation
 * ```tsx
 * const App = () => {
 *   const boxRef = useRef<BoxWidget>(null);
 *
 *   useEffect(() => {
 *     if (boxRef.current) {
 *       // Direct access to unblessed Box widget
 *       makeAnimatable(boxRef.current);
 *       boxRef.current.animateBorderColors(...);
 *     }
 *   }, []);
 *
 *   return <Box ref={boxRef} border={1}>Animated!</Box>;
 * };
 * ```
 */
export const Box = forwardRef<BoxWidget, PropsWithChildren<BoxProps>>(
  ({ children, ...props }, ref) => {
    return (
      <box ref={ref} {...props}>
        {children}
      </box>
    );
  },
);

Box.displayName = "Box";
