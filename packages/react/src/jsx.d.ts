/**
 * jsx.d.ts - JSX type definitions for @unblessed/react
 *
 * Declares the custom intrinsic JSX elements (box, text, bigtext) that our reconciler handles.
 */

import type { BigTextProps, BoxProps, TextProps } from "./types.js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      box: BoxProps & { ref?: any };
      text: TextProps & { ref?: any };
      bigtext: BigTextProps & { ref?: any };
      root: any;
    }
  }
}

export {};
