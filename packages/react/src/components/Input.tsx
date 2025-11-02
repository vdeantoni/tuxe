/**
 * Input.tsx - Input component and descriptor for @unblessed/react
 */

import { type Screen, Textbox } from "@unblessed/core";
import type { ComputedLayout, FlexboxProps } from "@unblessed/layout";
import type { ReactNode } from "react";
import { forwardRef, type PropsWithChildren } from "react";
import type { InteractiveWidgetProps } from "../widget-descriptors/common-props.js";
import { WidgetWithBordersDescriptor } from "../widget-descriptors/WidgetWithBordersDescriptor.js";

/**
 * Props interface for Input component
 * Inherits all interactive widget properties (layout, events, focus, borders)
 */
export interface InputProps extends InteractiveWidgetProps {
  value?: string;
  children?: ReactNode;
}

/**
 * Descriptor for Input/Textbox widgets
 */
export class InputDescriptor extends WidgetWithBordersDescriptor<InputProps> {
  readonly type = "input";

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

    // Input-specific options
    if (this.props.value !== undefined) options.value = this.props.value;

    // Focusable options (inherited from FocusableProps)
    // Default tabIndex = 0 for inputs
    options.tabIndex =
      this.props.tabIndex !== undefined ? this.props.tabIndex : 0;
    if (this.props.autoFocus !== undefined) {
      options.autoFocus = this.props.autoFocus;
    }

    return options;
  }

  get eventHandlers() {
    const handlers: Record<string, Function> = {};
    if (this.props.onSubmit) handlers.submit = this.props.onSubmit;
    if (this.props.onCancel) handlers.cancel = this.props.onCancel;
    if (this.props.onKeyPress) handlers.keypress = this.props.onKeyPress;
    if (this.props.onFocus) handlers.focus = this.props.onFocus;
    if (this.props.onBlur) handlers.blur = this.props.onBlur;
    return handlers;
  }

  createWidget(layout: ComputedLayout, screen: Screen): Textbox {
    return new Textbox({
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
 * Input component - Text input field for user interaction
 *
 * Provides a single-line text input with submit/cancel events.
 * Users can type text and submit with Enter or cancel with Escape.
 * Automatically receives focus when tabbed to (tabIndex=0 by default).
 *
 * @example Basic input
 * ```tsx
 * <Input
 *   width={30}
 *   onSubmit={(value) => console.log('Submitted:', value)}
 *   onCancel={() => console.log('Cancelled')}
 * />
 * ```
 *
 * @example With auto-focus
 * ```tsx
 * <Input
 *   width={40}
 *   autoFocus={true}
 *   onSubmit={(value) => handleSubmit(value)}
 * />
 * ```
 */
export const Input = forwardRef<any, PropsWithChildren<InputProps>>(
  ({ children, ...props }, ref) => {
    return <textinput ref={ref} border={1} height={3} {...props} />;
  },
);

Input.displayName = "Input";
