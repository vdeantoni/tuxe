/**
 * Text.tsx - Text component and descriptor for @unblessed/react
 */

import { colors, type Screen, Text as TextWidget } from "@unblessed/core";
import type { ComputedLayout } from "@unblessed/layout";
import type { ReactNode } from "react";
import { forwardRef, type PropsWithChildren } from "react";
import { WidgetDescriptor } from "../widget-descriptors/base.js";
import type { TextStyleProps } from "../widget-descriptors/common-props.js";

/**
 * Props interface for Text component
 */
export interface TextProps extends TextStyleProps {
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

    // Build style object
    if (
      this.props.color ||
      this.props.backgroundColor ||
      this.props.bold ||
      this.props.italic ||
      this.props.underline ||
      this.props.strikethrough ||
      this.props.inverse ||
      this.props.dim
    ) {
      widgetOptions.style = {};

      if (this.props.color) {
        widgetOptions.style.fg = colors.convert(this.props.color);
      }
      if (this.props.backgroundColor) {
        widgetOptions.style.bg = colors.convert(this.props.backgroundColor);
      }
      if (this.props.bold) widgetOptions.style.bold = true;
      if (this.props.italic) widgetOptions.style.italic = true;
      if (this.props.underline) widgetOptions.style.underline = true;
      if (this.props.strikethrough) widgetOptions.style.strikethrough = true;
      if (this.props.inverse) widgetOptions.style.inverse = true;
      if (this.props.dim) widgetOptions.style.dim = true;
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
