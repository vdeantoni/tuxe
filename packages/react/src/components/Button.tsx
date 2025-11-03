/**
 * Button.tsx - Button component and descriptor for @unblessed/react
 */

import { Button as ButtonWidget, type Screen } from "@unblessed/core";
import { ComputedLayout } from "@unblessed/layout";
import type { ReactNode } from "react";
import { forwardRef, type PropsWithChildren } from "react";
import type { InteractiveWidgetProps } from "../widget-descriptors/common-props.js";
import { buildFocusableOptions } from "../widget-descriptors/helpers.js";
import { BoxDescriptor, COMMON_WIDGET_OPTIONS } from "./Box";

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
export class ButtonDescriptor extends BoxDescriptor<ButtonProps> {
  override readonly type = "button";

  override get widgetOptions() {
    const options = super.widgetOptions;

    // Build focusable options using helper function
    Object.assign(options, buildFocusableOptions(this.props, 0));

    // Button-specific options
    if (this.props.content !== undefined) options.content = this.props.content;

    return options;
  }

  override get eventHandlers() {
    const handlers: Record<string, Function> = super.eventHandlers;
    if (this.props.onPress) handlers.press = this.props.onPress;
    return handlers;
  }

  override createWidget(layout: ComputedLayout, screen: Screen): ButtonWidget {
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
