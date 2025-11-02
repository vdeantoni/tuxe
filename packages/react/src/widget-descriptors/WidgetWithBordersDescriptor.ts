/**
 * WidgetWithBordersDescriptor.ts - Base class for widgets with border support
 *
 * Provides shared border building logic for Box, Button, Input, and other
 * widgets that support borders.
 */

import { colors } from "@unblessed/core";
import { WidgetDescriptor } from "./base.js";
import type { BorderProps } from "./common-props.js";

/**
 * Base descriptor for widgets that support borders
 * Provides shared buildBorder() and prepareBorderStyle() methods
 */
export abstract class WidgetWithBordersDescriptor<
  TProps extends BorderProps & {
    border?: number;
    borderTop?: number;
    borderBottom?: number;
    borderLeft?: number;
    borderRight?: number;
  },
> extends WidgetDescriptor<TProps> {
  /**
   * Builds border object from inherited BorderProps
   * IMPORTANT: Only creates border if Yoga knows about it (border numbers set)
   *
   * @returns Border configuration or null if no border numbers are set
   */
  protected buildBorder(): any {
    const props = this.props;

    // Only create border if Yoga knows about it (has border numbers)
    // This prevents creating borders that Yoga doesn't reserve space for
    if (
      !Number(props.border) &&
      !Number(props.borderTop) &&
      !Number(props.borderBottom) &&
      !Number(props.borderLeft) &&
      !Number(props.borderRight)
    ) {
      return null;
    }

    const border: any = {
      type: "line",
      style: props.borderStyle || "single",
    };

    // Per-side visibility
    border.top =
      props.borderTop !== undefined ? Number(props.borderTop) > 0 : true;
    border.bottom =
      props.borderBottom !== undefined ? Number(props.borderBottom) > 0 : true;
    border.left =
      props.borderLeft !== undefined ? Number(props.borderLeft) > 0 : true;
    border.right =
      props.borderRight !== undefined ? Number(props.borderRight) > 0 : true;

    // Border color (global or per-side)
    if (props.borderColor) {
      border.fg = colors.convert(props.borderColor);
    }

    if (props.borderTopColor) {
      border.topColor = colors.convert(props.borderTopColor);
    }
    if (props.borderBottomColor) {
      border.bottomColor = colors.convert(props.borderBottomColor);
    }
    if (props.borderLeftColor) {
      border.leftColor = colors.convert(props.borderLeftColor);
    }
    if (props.borderRightColor) {
      border.rightColor = colors.convert(props.borderRightColor);
    }

    // Border dim (global or per-side)
    if (props.borderDimColor !== undefined) {
      border.dim = props.borderDimColor;
    }

    if (props.borderTopDim !== undefined) {
      border.borderTopDim = props.borderTopDim;
    }
    if (props.borderBottomDim !== undefined) {
      border.borderBottomDim = props.borderBottomDim;
    }
    if (props.borderLeftDim !== undefined) {
      border.borderLeftDim = props.borderLeftDim;
    }
    if (props.borderRightDim !== undefined) {
      border.borderRightDim = props.borderRightDim;
    }

    return border;
  }

  /**
   * Pre-populates style.border.fg for unblessed compatibility
   *
   * @param border - Border configuration object
   * @returns Style object with border.fg set
   */
  protected prepareBorderStyle(border: any): any {
    if (!border) return {};

    return {
      border: {
        fg: border.fg,
      },
    };
  }
}
