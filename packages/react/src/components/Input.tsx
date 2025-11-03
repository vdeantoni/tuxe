/**
 * Input.tsx - Input component and descriptor for @unblessed/react
 */

import { type Screen, Textbox } from "@unblessed/core";
import {
  ComputedLayout,
  FlexboxProps,
  WidgetDescriptor,
} from "@unblessed/layout";
import { forwardRef } from "react";
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
 * Props interface for Input component
 * Inherits all interactive widget properties (layout, events, focus, borders)
 */
export interface InputProps extends InteractiveWidgetProps {
  /** Controlled value - when provided, input becomes controlled */
  value?: string;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
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

    // Input value: controlled (value) or uncontrolled (defaultValue)
    // In controlled mode, value is managed externally
    // In uncontrolled mode, defaultValue sets initial value only
    if (this.props.value !== undefined) {
      options.value = this.props.value;
    } else if (this.props.defaultValue !== undefined) {
      options.value = this.props.defaultValue;
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
      ...COMMON_WIDGET_OPTIONS,
      inputOnFocus: true,
      top: layout.top,
      left: layout.left,
      width: layout.width,
      height: layout.height,
      ...this.widgetOptions,
    });
  }

  override updateWidget(widget: Textbox, layout: ComputedLayout): void {
    // Call base implementation for position and options update
    super.updateWidget(widget, layout);

    // Input-specific: Update value in controlled mode
    // Only update if value is explicitly provided (controlled mode)
    if (this.props.value !== undefined) {
      widget.setValue(this.props.value);
    }
  }
}

/**
 * Input component - Text input field for user interaction
 *
 * Provides a single-line text input with submit/cancel events.
 * Users can type text and submit with Enter or cancel with Escape.
 * Automatically receives focus when tabbed to (tabIndex=0 by default).
 *
 * Supports both controlled and uncontrolled modes:
 * - Controlled: Provide `value` prop and update it via events
 * - Uncontrolled: Use `defaultValue` for initial value, or omit for empty input
 *
 * Default state styling uses direct props (color, bg, bold, etc.)
 * State variations use nested objects (hover, focus)
 *
 * @example Uncontrolled input (with default value)
 * ```tsx
 * <Input
 *   width={30}
 *   defaultValue="Initial text"
 *   color="white"
 *   focus={{ border: { color: "cyan" } }}
 *   onSubmit={(value) => console.log('Submitted:', value)}
 *   onCancel={() => console.log('Cancelled')}
 * />
 * ```
 *
 * @example Controlled input
 * ```tsx
 * const [text, setText] = useState('');
 * <Input
 *   width={40}
 *   value={text}
 *   onChange={(newValue) => setText(newValue)}
 *   onSubmit={(value) => handleSubmit(value)}
 * />
 * ```
 *
 * @example With auto-focus and styling
 * ```tsx
 * <Input
 *   width={40}
 *   defaultValue="Focus me!"
 *   color="white"
 *   bg="blue"
 *   focus={{ border: { color: "cyan" }, bg: "darkblue" }}
 *   onSubmit={(value) => handleSubmit(value)}
 * />
 * ```
 */
export const Input = forwardRef<any, InputProps>(({ ...props }, ref) => {
  return <textinput ref={ref} border={1} height={3} {...props} />;
});

Input.displayName = "Input";
