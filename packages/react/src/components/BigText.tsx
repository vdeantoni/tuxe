/**
 * BigText.tsx - BigText component and descriptor for @unblessed/react
 */

import { BigText as BigTextWidget, type Screen } from "@unblessed/core";
import type { ComputedLayout, FlexboxProps } from "@unblessed/layout";
import { forwardRef, type PropsWithChildren } from "react";
import { WidgetDescriptor } from "../widget-descriptors/base.js";
import type { TextStyleProps } from "../widget-descriptors/common-props.js";
import { buildTextStyles } from "../widget-descriptors/helpers.js";

/**
 * Props interface for BigText component
 */
export interface BigTextProps extends FlexboxProps, TextStyleProps {
  font?: string;
  fontBold?: boolean;
  fch?: string;
  content?: string;
  children?: string;
}

/**
 * Descriptor for BigText widgets
 */
export class BigTextDescriptor extends WidgetDescriptor<BigTextProps> {
  readonly type = "bigtext";

  get flexProps(): FlexboxProps {
    const { width, height, margin } = this.props;
    const flexProps: FlexboxProps = {};
    if (width !== undefined) flexProps.width = width;
    if (height !== undefined) flexProps.height = height;
    if (margin !== undefined) flexProps.margin = margin;
    return flexProps;
  }

  get widgetOptions() {
    const options: any = {};
    if (this.props.font) options.font = this.props.font;
    if (this.props.fontBold) options.fontBold = this.props.fontBold;
    if (this.props.fch) options.fch = this.props.fch;
    if (this.props.content !== undefined) options.content = this.props.content;

    // Build text styles using helper function
    const textStyles = buildTextStyles(this.props);
    if (textStyles) {
      options.style = textStyles;
    }

    return options;
  }

  get eventHandlers() {
    return {};
  }

  createWidget(layout: ComputedLayout, screen: Screen): BigTextWidget {
    return new BigTextWidget({
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
