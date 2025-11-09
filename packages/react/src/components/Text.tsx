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
import type { TextAnimationConfig } from "../animations/types.js";
import type { Theme } from "../themes/theme.js";
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

  /**
   * Wrap text if it exceeds width (legacy boolean).
   */
  wrap?: boolean;

  /**
   * Text wrapping/truncation mode (ink-style).
   *
   * - 'wrap': Word wrap text to multiple lines (default)
   * - 'truncate-end': Truncate at end with ellipsis: "Hello W…"
   * - 'truncate-middle': Truncate in middle with ellipsis: "Hel…rld"
   * - 'truncate-start': Truncate at start with ellipsis: "…World"
   *
   * @example
   * ```tsx
   * <Text textWrap="truncate-end" width={20}>
   *   This is a very long text that will be truncated
   * </Text>
   * ```
   */
  textWrap?: "wrap" | "truncate-end" | "truncate-middle" | "truncate-start";

  /**
   * Declarative text color animation configuration
   *
   * @example
   * ```tsx
   * <Text
   *   animateColor={{
   *     type: "pulse",
   *     colors: ["red", "yellow", "red"],
   *     duration: 1000,
   *   }}
   * >
   *   Pulsing text!
   * </Text>
   * ```
   */
  animateColor?: TextAnimationConfig;
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

    // Track which style props were explicitly provided by user
    // This prevents inheritance from overriding user choices
    widgetOptions._explicitProps = {
      fg: this.props.color !== undefined || this.props.fg !== undefined,
      bg:
        this.props.backgroundColor !== undefined || this.props.bg !== undefined,
    };

    // Build text styles using helper function (pass 'text' as component type)
    const textStyles = buildTextStyles(this, "text");
    if (textStyles) {
      widgetOptions.style = textStyles;
    }

    if (this.props.content !== undefined) {
      widgetOptions.content = this.props.content;
    }

    // Text wrapping support
    if (this.props.wrap !== undefined) {
      widgetOptions.wrap = this.props.wrap;
    }

    if (this.props.textWrap !== undefined) {
      widgetOptions.textWrap = this.props.textWrap;
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
 *
 * @example With ref for direct widget manipulation
 * ```tsx
 * const App = () => {
 *   const textRef = useRef<TextWidget>(null);
 *
 *   useEffect(() => {
 *     if (textRef.current) {
 *       // Direct access to unblessed Text widget
 *       textRef.current.setContent('Updated!');
 *     }
 *   }, []);
 *
 *   return <Text ref={textRef}>Initial</Text>;
 * };
 * ```
 */
export const Text = forwardRef<TextWidget, PropsWithChildren<TextProps>>(
  ({ children, ...props }, ref) => {
    return (
      <text ref={ref} minHeight={1} {...props}>
        {children}
      </text>
    );
  },
);

Text.displayName = "Text";
