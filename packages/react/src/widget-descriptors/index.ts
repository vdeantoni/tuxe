/**
 * index.ts - Widget descriptors exports
 * Re-exports descriptors from component files
 */

export { WidgetDescriptor } from "./base.js";
export type {
  BorderProps,
  FocusableProps,
  InteractiveWidgetProps,
  TextStyleProps,
} from "./common-props.js";
export { WidgetWithBordersDescriptor } from "./WidgetWithBordersDescriptor.js";

// Re-export descriptors from components
export { BigTextDescriptor, type BigTextProps } from "../components/BigText.js";
export { BoxDescriptor, type BoxProps } from "../components/Box.js";
export { ButtonDescriptor, type ButtonProps } from "../components/Button.js";
export { InputDescriptor, type InputProps } from "../components/Input.js";
export { SpacerDescriptor, type SpacerProps } from "../components/Spacer.js";
export { TextDescriptor, type TextProps } from "../components/Text.js";
export {
  createDescriptor,
  getRegisteredTypes,
  registerDescriptor,
} from "./factory.js";
