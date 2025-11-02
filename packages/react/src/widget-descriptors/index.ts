/**
 * index.ts - Widget descriptors exports
 * Re-exports descriptors from component files
 */

export { WidgetDescriptor } from "./base.js";
export { WidgetWithBordersDescriptor } from "./WidgetWithBordersDescriptor.js";
export type {
  FocusableProps,
  BorderProps,
  InteractiveWidgetProps,
  TextStyleProps,
} from "./common-props.js";

// Re-export descriptors from components
export { BoxDescriptor, type BoxProps } from "../components/Box.js";
export { TextDescriptor, type TextProps } from "../components/Text.js";
export { ButtonDescriptor, type ButtonProps } from "../components/Button.js";
export { InputDescriptor, type InputProps } from "../components/Input.js";
export { BigTextDescriptor, type BigTextProps } from "../components/BigText.js";
export { SpacerDescriptor, type SpacerProps } from "../components/Spacer.js";
export {
  createDescriptor,
  registerDescriptor,
  getRegisteredTypes,
} from "./factory.js";
