/**
 * Input.tsx - Input component and descriptor for @unblessed/react
 */

import { type Screen, Textbox } from "@unblessed/core";
import type { ComputedLayout, FlexboxProps } from "@unblessed/layout";
import { forwardRef } from "react";
import { WidgetDescriptor } from "../widget-descriptors/base.js";
import type { InteractiveWidgetProps } from "../widget-descriptors/common-props.js";
import {
  buildBorder,
  buildFocusableOptions,
  prepareBorderStyle,
} from "../widget-descriptors/helpers.js";

/**
 * Props interface for Input component
 * Inherits all interactive widget properties (layout, events, focus, borders)
 */
export interface InputProps extends InteractiveWidgetProps {
  value?: string;
}

/**
 * Descriptor for Input/Textbox widgets
 */
export class InputDescriptor extends WidgetDescriptor<InputProps> {
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

    // Build border using helper function
    const border = buildBorder(this.props);
    if (border) {
      options.border = border;
      // Pre-populate style.border.fg
      options.style = prepareBorderStyle(border);
    } else {
      // Even without border, we need a style object
      options.style = {};
    }

    // Ensure input has visible text (set fg if not already set)
    // This prevents invisible text when only border colors are set
    if (!options.style.fg) {
      options.style.fg = 7; // White/default terminal foreground
    }

    // Build focusable options using helper function
    Object.assign(options, buildFocusableOptions(this.props, 0));

    // Input-specific options
    if (this.props.value !== undefined) options.value = this.props.value;

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
export const Input = forwardRef<any, InputProps>(({ ...props }, ref) => {
  return <textinput ref={ref} border={1} height={3} {...props} />;
});

Input.displayName = "Input";
