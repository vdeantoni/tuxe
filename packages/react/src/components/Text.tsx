/**
 * Text.tsx - Text component for @unblessed/react
 */

import type { ReactNode } from "react";
import { forwardRef, type PropsWithChildren } from "react";

/**
 * Props for Text component (text rendering with styling)
 */
export interface TextProps {
  /**
   * Text content
   */
  children?: ReactNode;

  /**
   * Text color
   */
  color?: string;

  /**
   * Background color
   */
  backgroundColor?: string;

  /**
   * Bold text
   */
  bold?: boolean;

  /**
   * Italic text
   */
  italic?: boolean;

  /**
   * Underline text
   */
  underline?: boolean;

  /**
   * Strikethrough text
   */
  strikethrough?: boolean;

  /**
   * Inverse colors
   */
  inverse?: boolean;

  /**
   * Dim text
   */
  dim?: boolean;
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
