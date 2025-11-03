/**
 * @unblessed/react - React renderer for unblessed
 *
 * Build terminal UIs with React and flexbox layouts.
 *
 * @example
 * ```tsx
 * import { render, Box, Text } from '@unblessed/react';
 *
 * const App = () => (
 *   <Box flexDirection="row" gap={2} padding={1}>
 *     <Box width={20} borderStyle="single">
 *       <Text color="green">Left</Text>
 *     </Box>
 *     <Box flexGrow={1} borderStyle="single">
 *       <Text>Middle (fills space)</Text>
 *     </Box>
 *     <Box width={20} borderStyle="single">
 *       <Text color="blue">Right</Text>
 *     </Box>
 *   </Box>
 * );
 *
 * render(<App />);
 * ```
 *
 * @packageDocumentation
 */

export { BigText, type BigTextProps } from "./components/BigText.js";
export { Box, type BoxProps } from "./components/Box.js";
export { Button, type ButtonProps } from "./components/Button.js";
export { Input, type InputProps } from "./components/Input.js";
export { List, type ListProps } from "./components/List.js";
export { Spacer } from "./components/Spacer.js";
export { Text, type TextProps } from "./components/Text.js";
export { render } from "./render.js";

export type {
  EventHandlers,
  ReactEventProps,
  RenderInstance,
  RenderOptions,
} from "./types.js";
