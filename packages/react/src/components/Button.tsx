/**
 * Button.tsx - Button component and descriptor for @unblessed/react
 */

import { Button as ButtonWidget, type Screen } from "@unblessed/core";
import type { ComputedLayout, FlexboxProps } from "@unblessed/layout";
import type { ReactNode } from "react";
import { forwardRef, type PropsWithChildren } from "react";
import type { InteractiveWidgetProps } from "../widget-descriptors/common-props.js";
import { WidgetWithBordersDescriptor } from "../widget-descriptors/WidgetWithBordersDescriptor.js";

/**
 * Props interface for Button component
 * Inherits all interactive widget properties (layout, events, focus, borders)
 */
export interface ButtonProps extends InteractiveWidgetProps {
  hoverBg?: string;
  focusBg?: string;
  content?: string;
  children?: ReactNode;
}

/**
 * Descriptor for Button widgets
 */
export class ButtonDescriptor extends WidgetWithBordersDescriptor<ButtonProps> {
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

    // Build border from inherited BorderProps
    const border = this.buildBorder();
    if (border) {
      options.border = border;
      // Pre-populate style.border.fg
      options.style = this.prepareBorderStyle(border);
    }

    // Button-specific options
    if (this.props.hoverBg) options.hoverBg = this.props.hoverBg;
    if (this.props.focusBg) {
      options.focusEffects = { border: { fg: this.props.focusBg } };
    }
    if (this.props.content !== undefined) options.content = this.props.content;

    // Focusable options (inherited from FocusableProps)
    // Default tabIndex = 0 for buttons
    options.tabIndex =
      this.props.tabIndex !== undefined ? this.props.tabIndex : 0;
    if (this.props.autoFocus !== undefined) {
      options.autoFocus = this.props.autoFocus;
    }

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
      tags: true,
      mouse: true,
      keys: true,
      inputOnFocus: true,
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
 *   hoverBg="blue"
 *   focusBg="cyan"
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
      <tbutton ref={ref} border={1} {...props}>
        {children}
      </tbutton>
    );
  },
);

Button.displayName = "Button";
