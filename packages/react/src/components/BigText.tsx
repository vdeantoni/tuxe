/**
 * BigText.tsx - BigText component and descriptor for @unblessed/react
 */

import { BigText as BigTextWidget, type Screen } from "@unblessed/core";
import { ComputedLayout, FlexboxProps } from "@unblessed/layout";
import { forwardRef, type PropsWithChildren } from "react";
import { StyleObject } from "../widget-descriptors";
import { BoxDescriptor, COMMON_WIDGET_OPTIONS } from "./Box";

/**
 * Props interface for BigText component
 */
export interface BigTextProps
  extends FlexboxProps,
    Pick<StyleObject, "color" | "backgroundColor"> {
  font?: string;
  fontBold?: boolean;
  char?: string;
  content?: string;
  children?: string;
}

/**
 * Descriptor for BigText widgets
 */
export class BigTextDescriptor extends BoxDescriptor<BigTextProps> {
  override readonly type = "bigtext";

  override get widgetOptions() {
    const options = super.widgetOptions;
    if (this.props.font) options.font = this.props.font;
    if (this.props.fontBold) options.fontBold = this.props.fontBold;
    if (this.props.char) options.fch = this.props.char;
    if (this.props.content !== undefined) options.content = this.props.content;

    return options;
  }

  override createWidget(layout: ComputedLayout, screen: Screen): BigTextWidget {
    return new BigTextWidget({
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
 * BigText component - Renders large ASCII art text
 *
 * Uses terminal fonts to render large text. Each character is 14 rows × 8 columns.
 * Supports all BoxProps including flexbox layout, borders, and event handling.
 *
 * @example
 * ```tsx
 * <BigText color="cyan">
 *   HELLO
 * </BigText>
 * ```
 *
 * @example With border and events
 * ```tsx
 * <BigText
 *   color="green"
 *   borderStyle="single"
 *   padding={1}
 *   onClick={() => console.log('Big text clicked!')}
 * >
 *   WELCOME
 * </BigText>
 * ```
 */
export const BigText = forwardRef<any, PropsWithChildren<BigTextProps>>(
  ({ children, ...props }, ref) => {
    const fontHeight = 14;
    const fontWidth = 8;

    return (
      <bigtext
        ref={ref}
        color="white"
        height={fontHeight}
        width={(children?.length || 0) * fontWidth}
        {...props}
      >
        {children}
      </bigtext>
    );
  },
);

BigText.displayName = "BigText";
