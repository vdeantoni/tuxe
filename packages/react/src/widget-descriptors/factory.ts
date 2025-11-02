/**
 * factory.ts - Widget descriptor factory and registry
 *
 * Maps type strings to descriptor classes and creates descriptor instances
 * from React props.
 */

import { WidgetDescriptor } from "./base.js";
import { BigTextDescriptor } from "../components/BigText.js";
import { BoxDescriptor } from "../components/Box.js";
import { ButtonDescriptor } from "../components/Button.js";
import { InputDescriptor } from "../components/Input.js";
import { SpacerDescriptor } from "../components/Spacer.js";
import { TextDescriptor } from "../components/Text.js";

/**
 * Registry mapping type strings to descriptor class constructors
 */
const descriptorRegistry = new Map<
  string,
  new (props: any) => WidgetDescriptor
>([
  ["box", BoxDescriptor],
  ["text", TextDescriptor],
  ["button", ButtonDescriptor],
  ["tbutton", ButtonDescriptor], // Alias to avoid conflict with HTML <button>
  ["input", InputDescriptor],
  ["textinput", InputDescriptor], // Alias to avoid conflict with HTML <input>
  ["bigtext", BigTextDescriptor],
  ["spacer", SpacerDescriptor],
]);

/**
 * Creates a descriptor instance for the given widget type and props.
 *
 * @param type - Widget type string (e.g., 'box', 'text', 'button')
 * @param props - Props to pass to the descriptor
 * @returns A WidgetDescriptor instance
 * @throws Error if the widget type is not registered
 */
export function createDescriptor(
  type: string,
  props: any = {},
): WidgetDescriptor {
  const DescriptorClass = descriptorRegistry.get(type);

  if (!DescriptorClass) {
    throw new Error(
      `Unknown widget type: "${type}". Available types: ${Array.from(descriptorRegistry.keys()).join(", ")}`,
    );
  }

  return new DescriptorClass(props);
}

/**
 * Registers a custom widget descriptor.
 * Allows users to extend the system with their own widget types.
 *
 * @param type - Widget type string
 * @param descriptorClass - Descriptor class constructor
 *
 * @example
 * ```typescript
 * class MyCustomDescriptor extends WidgetDescriptor<MyCustomProps> {
 *   // ... implementation
 * }
 *
 * registerDescriptor('mycustom', MyCustomDescriptor);
 * ```
 */
export function registerDescriptor(
  type: string,
  descriptorClass: new (props: any) => WidgetDescriptor,
): void {
  descriptorRegistry.set(type, descriptorClass);
}

/**
 * Gets the list of registered widget types.
 *
 * @returns Array of registered type strings
 */
export function getRegisteredTypes(): string[] {
  return Array.from(descriptorRegistry.keys());
}
