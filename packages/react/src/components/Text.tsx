/**
 * Text.tsx - Text component and descriptor for @unblessed/react
 */

import { type Screen, Text as TextWidget } from "@unblessed/core";
import { ComputedLayout, WidgetDescriptor } from "@unblessed/layout";
import type { ReactNode } from "react";
import { forwardRef, type PropsWithChildren } from "react";
import type { StyleObject } from "../widget-descriptors/common-props.js";
import { buildTextStyles } from "../widget-descriptors/helpers.js";
import { COMMON_WIDGET_OPTIONS } from "./Box";

/**
 * Props interface for Text component
 */
export interface TextProps extends StyleObject {
  content?: string;
  children?: ReactNode;
}

/**
 * Descriptor for Text widgets
 */
export class TextDescriptor extends WidgetDescriptor<TextProps> {
  readonly type = "text";

  get flexProps() {
    // Text widgets don't have flex props - dimensions are calculated from content
    return {};
  }

  get widgetOptions() {
    const widgetOptions: any = {};

    // Build text styles using helper function
    const textStyles = buildTextStyles(this.props);
    if (textStyles) {
      widgetOptions.style = textStyles;
    }

    if (this.props.content !== undefined) {
      widgetOptions.content = this.props.content;
    }

    widgetOptions.tags = true;

    return widgetOptions;
  }

  get eventHandlers() {
    // Text widgets don't have event handlers
    return {};
  }

  createWidget(layout: ComputedLayout, screen: Screen): TextWidget {
    return new TextWidget({
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
 * Text component - Renders text with styling
 *
 * @example
 * ```tsx
 * <Text color="green" bold>
 *   Hello World!
 * </Text>
 * ```
 *
 * @example With nested text
 * ```tsx
 * <Text>
 *   Hello <Text color="red">World</Text>!
 * </Text>
 * ```
 */
export const Text = forwardRef<any, PropsWithChildren<TextProps>>(
  ({ children, ...props }, ref) => {
    return (
      <text ref={ref} {...props}>
        {children}
      </text>
    );
  },
);

Text.displayName = "Text";
