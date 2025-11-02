/**
 * jsx.d.ts - JSX type definitions for @unblessed/react
 *
 * Declares the custom intrinsic JSX elements that our reconciler handles.
 */

import type { BoxProps } from "./components/Box.js";
import type { TextProps } from "./components/Text.js";
import type { BigTextProps } from "./components/BigText.js";
import type { ButtonProps } from "./components/Button.js";
import type { InputProps } from "./components/Input.js";
import type { SpacerProps } from "./components/Spacer.js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      box: BoxProps & { ref?: any };
      text: TextProps & { ref?: any };
      bigtext: BigTextProps & { ref?: any };
      tbutton: ButtonProps & { ref?: any }; // Use 'tbutton' to avoid conflict with HTML button
      textinput: InputProps & { ref?: any }; // Use 'textinput' to avoid conflict with HTML input
      spacer: SpacerProps & { ref?: any };
      root: any;
    }
  }
}

export {};
