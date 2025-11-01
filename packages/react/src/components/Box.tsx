/**
 * Box.tsx - Box component for @unblessed/react
 */

import type { FlexboxProps } from "@unblessed/layout";
import type { ReactNode } from "react";
import { forwardRef, type PropsWithChildren } from "react";

/**
 * Props for Box component (container with flexbox layout)
 */
export interface BoxProps extends FlexboxProps {
  /**
   * Content to display in the box
   */
  children?: ReactNode;

  /**
   * Border style (applied to all sides)
   */
  borderStyle?: "single" | "double" | "round" | "bold" | "classic";

  /**
   * Border color (applied to all sides)
   */
  borderColor?: string;

  /**
   * Dim all borders
   */
  borderDimColor?: boolean;

  /**
   * Per-side border colors
   */
  borderTopColor?: string;
  borderBottomColor?: string;
  borderLeftColor?: string;
  borderRightColor?: string;

  /**
   * Per-side border dim flags
   */
  borderTopDim?: boolean;
  borderBottomDim?: boolean;
  borderLeftDim?: boolean;
  borderRightDim?: boolean;

  /**
   * Background color
   */
  backgroundColor?: string;

  /**
   * Foreground color
   */
  color?: string;

  /**
   * Whether to parse {tags} in content
   */
  tags?: boolean;
}

/**
 * Box component - Container with flexbox layout support
 *
 * @example
 * ```tsx
 * <Box
 *   flexDirection="row"
 *   gap={2}
 *   padding={1}
 *   borderStyle="single"
 *   borderColor="cyan"
 * >
 *   <Box width={20}>Left</Box>
 *   <Box flexGrow={1}>Middle</Box>
 *   <Box width={20}>Right</Box>
 * </Box>
 * ```
 */
export const Box = forwardRef<any, PropsWithChildren<BoxProps>>(
  ({ children, ...props }, ref) => {
    return (
      <box ref={ref} {...props}>
        {children}
      </box>
    );
  },
);

Box.displayName = "Box";
