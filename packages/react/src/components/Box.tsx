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
import type { InteractiveWidgetProps } from "../widget-descriptors/common-props.js";
import {
  buildBorder,
  buildFocusableOptions,
  buildStyleObject,
  extractStyleProps,
  mergeStyles,
  prepareBorderStyle,
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
  tags?: boolean;
  content?: string;
  children?: ReactNode;
}

/**
 * Descriptor for Box widgets
 */
export class BoxDescriptor<T extends BoxProps> extends WidgetDescriptor<T> {
  readonly type: string = "box";

  get flexProps(): FlexboxProps {
    // Extract all flexbox-related properties
    const {
      flexGrow,
      flexShrink,
      flexBasis,
      flexDirection,
      flexWrap,
      justifyContent,
      alignItems,
      alignSelf,
      width,
      height,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      padding,
      paddingX,
      paddingY,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
      border,
      borderTop,
      borderBottom,
      borderLeft,
      borderRight,
      margin,
      marginX,
      marginY,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      gap,
      rowGap,
      columnGap,
      position,
      display,
    } = this.props;

    const flexboxProps: FlexboxProps = {};

    // Only include defined properties
    if (flexGrow !== undefined) flexboxProps.flexGrow = flexGrow;
    if (flexShrink !== undefined) flexboxProps.flexShrink = flexShrink;
    if (flexBasis !== undefined) flexboxProps.flexBasis = flexBasis;
    if (flexDirection !== undefined) flexboxProps.flexDirection = flexDirection;
    if (flexWrap !== undefined) flexboxProps.flexWrap = flexWrap;
    if (justifyContent !== undefined)
      flexboxProps.justifyContent = justifyContent;
    if (alignItems !== undefined) flexboxProps.alignItems = alignItems;
    if (alignSelf !== undefined) flexboxProps.alignSelf = alignSelf;
    if (width !== undefined) flexboxProps.width = width;
    if (height !== undefined) flexboxProps.height = height;
    if (minWidth !== undefined) flexboxProps.minWidth = minWidth;
    if (minHeight !== undefined) flexboxProps.minHeight = minHeight;
    if (maxWidth !== undefined) flexboxProps.maxWidth = maxWidth;
    if (maxHeight !== undefined) flexboxProps.maxHeight = maxHeight;
    if (padding !== undefined) flexboxProps.padding = padding;
    if (paddingX !== undefined) flexboxProps.paddingX = paddingX;
    if (paddingY !== undefined) flexboxProps.paddingY = paddingY;
    if (paddingTop !== undefined) flexboxProps.paddingTop = paddingTop;
    if (paddingBottom !== undefined) flexboxProps.paddingBottom = paddingBottom;
    if (paddingLeft !== undefined) flexboxProps.paddingLeft = paddingLeft;
    if (paddingRight !== undefined) flexboxProps.paddingRight = paddingRight;
    if (border !== undefined) flexboxProps.border = border ? 1 : 0;
    if (borderTop !== undefined) flexboxProps.borderTop = borderTop;
    if (borderBottom !== undefined) flexboxProps.borderBottom = borderBottom;
    if (borderLeft !== undefined) flexboxProps.borderLeft = borderLeft;
    if (borderRight !== undefined) flexboxProps.borderRight = borderRight;
    if (margin !== undefined) flexboxProps.margin = margin;
    if (marginX !== undefined) flexboxProps.marginX = marginX;
    if (marginY !== undefined) flexboxProps.marginY = marginY;
    if (marginTop !== undefined) flexboxProps.marginTop = marginTop;
    if (marginBottom !== undefined) flexboxProps.marginBottom = marginBottom;
    if (marginLeft !== undefined) flexboxProps.marginLeft = marginLeft;
    if (marginRight !== undefined) flexboxProps.marginRight = marginRight;
    if (gap !== undefined) flexboxProps.gap = gap;
    if (rowGap !== undefined) flexboxProps.rowGap = rowGap;
    if (columnGap !== undefined) flexboxProps.columnGap = columnGap;
    if (position !== undefined) flexboxProps.position = position;
    if (display !== undefined) flexboxProps.display = display;

    return flexboxProps;
  }

  get widgetOptions(): Record<string, any> {
    const widgetOptions: any = {};

    // Build border using helper function
    const border = buildBorder(this.props);
    if (border) {
      widgetOptions.border = border;
      // Pre-populate style.border.fg
      widgetOptions.style = prepareBorderStyle(border);
    } else {
      widgetOptions.style = {};
    }

    // Ensure style.border exists if hover/focus have border effects
    // This prevents errors when setEffects tries to save original border values
    if (this.props.hover?.border || this.props.focus?.border) {
      widgetOptions.style.border = widgetOptions.style.border || {};
    }

    // Build focusable options using helper function
    // Box is not focusable by default (no defaultTabIndex)
    Object.assign(widgetOptions, buildFocusableOptions(this.props));

    // Base/default state styling from direct props
    const defaultStyle = extractStyleProps(this.props);
    const baseStyle = buildStyleObject(defaultStyle);
    if (Object.keys(baseStyle).length > 0) {
      widgetOptions.style = mergeStyles(widgetOptions.style, baseStyle);
    }

    // Hover effects
    if (this.props.hover) {
      widgetOptions.hoverEffects = buildStyleObject(this.props.hover);
    }

    // Focus effects
    if (this.props.focus) {
      widgetOptions.focusEffects = buildStyleObject(this.props.focus);
    }

    // Content
    if (this.props.content !== undefined) {
      widgetOptions.content = this.props.content;
    }

    // Tags
    if (this.props.tags !== undefined) {
      widgetOptions.tags = this.props.tags;
    }

    return widgetOptions;
  }

  get eventHandlers(): Record<string, Function> {
    const handlers: Record<string, Function> = {};

    // Mouse events
    if (this.props.onClick) handlers.click = this.props.onClick;
    if (this.props.onMouseDown) handlers.mousedown = this.props.onMouseDown;
    if (this.props.onMouseUp) handlers.mouseup = this.props.onMouseUp;
    if (this.props.onMouseMove) handlers.mousemove = this.props.onMouseMove;
    if (this.props.onMouseOver) handlers.mouseover = this.props.onMouseOver;
    if (this.props.onMouseOut) handlers.mouseout = this.props.onMouseOut;
    if (this.props.onMouseWheel) handlers.mousewheel = this.props.onMouseWheel;
    if (this.props.onWheelDown) handlers.wheeldown = this.props.onWheelDown;
    if (this.props.onWheelUp) handlers.wheelup = this.props.onWheelUp;

    // Keyboard events
    if (this.props.onKeyPress) handlers.keypress = this.props.onKeyPress;

    // Focus events
    if (this.props.onFocus) handlers.focus = this.props.onFocus;
    if (this.props.onBlur) handlers.blur = this.props.onBlur;

    return handlers;
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
 */
export const Box = forwardRef<any, PropsWithChildren<BoxProps>>(
  ({ children, ...props }, ref) => {
    return (
      <box ref={ref} {...props}>
        {children}
      </box>
    );
  },
);

Box.displayName = "Box";
