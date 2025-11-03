/**
 * index.ts - Widget descriptors exports
 * Re-exports descriptors from component files
 */

export type {
  BorderProps,
  FocusableProps,
  InteractiveWidgetProps,
  StyleObject,
} from "./common-props.js";
export { createDescriptor } from "./factory.js";
export {
  buildBorder,
  buildFocusableOptions,
  buildTextStyles,
  mergeStyles,
  prepareBorderStyle,
} from "./helpers.js";

// Re-export descriptors from components
export { BigTextDescriptor, type BigTextProps } from "../components/BigText.js";
export { BoxDescriptor, type BoxProps } from "../components/Box.js";
export { ButtonDescriptor, type ButtonProps } from "../components/Button.js";
export { InputDescriptor, type InputProps } from "../components/Input.js";
export { ListDescriptor, type ListProps } from "../components/List.js";
export { SpacerDescriptor, type SpacerProps } from "../components/Spacer.js";
export { TextDescriptor, type TextProps } from "../components/Text.js";
