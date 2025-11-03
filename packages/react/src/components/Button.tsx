/**
 * Button.tsx - Button component and descriptor for @unblessed/react
 */

import { Button as ButtonWidget, type Screen } from "@unblessed/core";
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
import { COMMON_WIDGET_OPTIONS } from "./Box";

/**
 * Props interface for Button component
 * Inherits all interactive widget properties (layout, events, focus, borders, styling)
 */
export interface ButtonProps extends InteractiveWidgetProps {
  content?: string;
  children?: ReactNode;
}

/**
 * Descriptor for Button widgets
 */
export class ButtonDescriptor extends WidgetDescriptor<ButtonProps> {
  readonly type = "button";

  get flexProps(): FlexboxProps {
    const { padding, width, height, margin } = this.props;
    const flexProps: FlexboxProps = {};
    if (padding !== undefined) flexProps.padding = padding;
    if (width !== undefined) flexProps.width = width;
    if (height !== undefined) flexProps.height = height;
    if (margin !== undefined) flexProps.margin = margin;
    return flexProps;
  }

  get widgetOptions() {
    const options: any = {};

    // Build border using helper function
    const border = buildBorder(this.props);
    if (border) {
      options.border = border;
      // Pre-populate style.border.fg
      options.style = prepareBorderStyle(border);
    } else {
      options.style = {};
    }

    // Ensure style.border exists if hover/focus have border effects
    // This prevents errors when setEffects tries to save original border values
    if (this.props.hover?.border || this.props.focus?.border) {
      options.style.border = options.style.border || {};
    }

    // Build focusable options using helper function
    Object.assign(options, buildFocusableOptions(this.props, 0));

    // Base/default state styling from direct props
    const defaultStyle = extractStyleProps(this.props);
    const baseStyle = buildStyleObject(defaultStyle);
    if (Object.keys(baseStyle).length > 0) {
      options.style = mergeStyles(options.style, baseStyle);
    }

    // Hover effects
    if (this.props.hover) {
      options.hoverEffects = buildStyleObject(this.props.hover);
    }

    // Focus effects
    if (this.props.focus) {
      options.focusEffects = buildStyleObject(this.props.focus);
    }

    // Button-specific options
    if (this.props.content !== undefined) options.content = this.props.content;

    return options;
  }

  get eventHandlers() {
    const handlers: Record<string, Function> = {};
    if (this.props.onClick) handlers.click = this.props.onClick;
    if (this.props.onPress) handlers.press = this.props.onPress;
    if (this.props.onKeyPress) handlers.keypress = this.props.onKeyPress;
    if (this.props.onFocus) handlers.focus = this.props.onFocus;
    if (this.props.onBlur) handlers.blur = this.props.onBlur;
    return handlers;
  }

  createWidget(layout: ComputedLayout, screen: Screen): ButtonWidget {
    return new ButtonWidget({
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
 * Button component - Interactive button with hover and focus effects
 *
 * Supports mouse clicks, keyboard press (Enter), and visual state changes.
 * Automatically receives focus when tabbed to.
 *
 * Default state styling uses direct props (color, bg, bold, etc.)
 * State variations use nested objects (hover, focus)
 *
 * @example Basic button
 * ```tsx
 * <Button
 *   borderStyle="single"
 *   borderColor="green"
 *   padding={1}
 *   onClick={() => console.log('Clicked!')}
 * >
 *   Click Me
 * </Button>
 * ```
 *
 * @example With hover and focus effects
 * ```tsx
 * <Button
 *   borderStyle="single"
 *   borderColor="blue"
 *   color="white"
 *   bg="blue"
 *   bold={true}
 *   hover={{ bg: "darkblue" }}
 *   focus={{ border: { color: "cyan" } }}
 *   padding={1}
 *   onPress={() => handleSubmit()}
 * >
 *   Submit
 * </Button>
 * ```
 *
 * @example Interactive counter
 * ```tsx
 * const [count, setCount] = useState(0);
 *
 * <Button onClick={() => setCount(c => c + 1)}>
 *   Count: {count}
 * </Button>
 * ```
 */
export const Button = forwardRef<any, PropsWithChildren<ButtonProps>>(
  ({ children, ...props }, ref) => {
    return (
      <tbutton ref={ref} border={1} minHeight={3} {...props}>
        {children}
      </tbutton>
    );
  },
);

Button.displayName = "Button";
