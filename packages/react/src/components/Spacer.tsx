/**
 * Spacer.tsx - Spacer component and descriptor for @unblessed/react
 *
 * Spacer is a special Box that grows to fill available space (flexGrow: 1)
 */

import { Box as BoxWidget, Screen } from "@unblessed/core";
import {
  ComputedLayout,
  FlexboxProps,
  WidgetDescriptor,
} from "@unblessed/layout";
import { COMMON_WIDGET_OPTIONS } from "./Box";

/**
 * Props interface for Spacer component
 */
export interface SpacerProps extends FlexboxProps {}

/**
 * Descriptor for Spacer widgets
 */
export class SpacerDescriptor extends WidgetDescriptor<SpacerProps> {
  readonly type = "spacer";

  get flexProps(): FlexboxProps {
    // Spacer is just a box with flexGrow: 1
    return {
      ...this.props,
      flexGrow: this.props.flexGrow !== undefined ? this.props.flexGrow : 1,
    };
  }

  get widgetOptions() {
    return {};
  }

  get eventHandlers() {
    return {};
  }

  createWidget(layout: ComputedLayout, screen: Screen): BoxWidget {
    return new BoxWidget({
      screen,
      ...COMMON_WIDGET_OPTIONS,
      top: layout.top,
      left: layout.left,
      width: layout.width,
      height: layout.height,
    });
  }
}

/**
 * Spacer component - Flexible space that expands to fill available space
 *
 * This is a convenience component that renders a Box with flexGrow={1}.
 * It's useful for creating space-between layouts.
 *
 * @example
 * ```tsx
 * <Box flexDirection="row">
 *   <Box width={20}>Left</Box>
 *   <Spacer />
 *   <Box width={20}>Right</Box>
 * </Box>
 * ```
 *
 * @example With custom flexGrow
 * ```tsx
 * <Box flexDirection="row">
 *   <Spacer flexGrow={2} />
 *   <Box width={30}>Content</Box>
 *   <Spacer flexGrow={1} />
 * </Box>
 * ```
 */
export const Spacer = (props: SpacerProps) => {
  return <spacer {...props} />;
};

Spacer.displayName = "Spacer";
