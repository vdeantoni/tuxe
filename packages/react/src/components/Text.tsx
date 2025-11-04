/**
 * Text.tsx - Text component and descriptor for @unblessed/react
 */

import { type Screen, Text as TextWidget } from "@unblessed/core";
import {
  ComputedLayout,
  FlexboxProps,
  WidgetDescriptor,
} from "@unblessed/layout";
import type { ReactNode } from "react";
import { forwardRef, type PropsWithChildren } from "react";
import type { Theme } from "../theme.js";
import type { StyleObject } from "../widget-descriptors/common-props.js";
import { buildTextStyles } from "../widget-descriptors/helpers.js";
import { COMMON_WIDGET_OPTIONS } from "./Box";

/**
 * Props interface for Text component
 */
export interface TextProps
  extends StyleObject,
    Pick<
      FlexboxProps,
      "minHeight" | "height" | "width" | "minWidth" | "maxWidth" | "maxHeight"
    > {
  content?: string;
  children?: ReactNode;
}

/**
 * Descriptor for Text widgets
 */
export class TextDescriptor extends WidgetDescriptor<TextProps, Theme> {
  readonly type = "text";

  get flexProps() {
    const { width, height, minWidth, maxWidth, minHeight, maxHeight } =
      this.props;

    const flexboxProps: FlexboxProps = {};

    if (width !== undefined) flexboxProps.width = width;
    if (height !== undefined) flexboxProps.height = height;
    if (minWidth !== undefined) flexboxProps.minWidth = minWidth;
    if (minHeight !== undefined) flexboxProps.minHeight = minHeight;
    if (maxWidth !== undefined) flexboxProps.maxWidth = maxWidth;
    if (maxHeight !== undefined) flexboxProps.maxHeight = maxHeight;

    return flexboxProps;
  }

  get widgetOptions() {
    const widgetOptions: any = {};

    // Build text styles using helper function (pass theme for color resolution)
    const textStyles = buildTextStyles(this.props, this.theme);
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
      clickable: false,
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
      <text ref={ref} minHeight={1} {...props}>
        {children}
      </text>
    );
  },
);

Text.displayName = "Text";
