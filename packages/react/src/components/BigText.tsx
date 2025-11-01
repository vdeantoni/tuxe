/**
 * BigText.tsx - BigText component for @unblessed/react
 */

import { forwardRef, type PropsWithChildren } from "react";

/**
 * Props for BigText component
 */
export interface BigTextProps {
  /**
   * Text content
   */
  children?: string;

  /**
   * Text color
   */
  color?: string;

  /**
   * Background color
   */
  backgroundColor?: string;
}

/**
 * BigText component
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
