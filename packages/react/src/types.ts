/**
 * types.ts - Type definitions for @unblessed/react
 */

import type { KeyEvent, MouseEvent, Runtime, Screen } from "@unblessed/core";
import type { ReactNode } from "react";
import type { Theme } from "./theme.js";

/**
 * Options for the render() function
 */
export interface RenderOptions {
  /**
   * Runtime instance
   * Create this from @unblessed/node or @unblessed/browser
   */
  runtime: Runtime;

  /**
   * Screen instance (optional)
   * If not provided, render() will create a default Screen.
   * If provided, you are responsible for calling screen.destroy().
   */
  screen?: Screen;

  /**
   * Theme instance (optional)
   * If not provided, defaults to unblessedTheme.
   */
  theme?: Theme;

  /**
   * Debug mode - logs render cycles
   */
  debug?: boolean;
}

/**
 * Instance returned by render()
 */
export interface RenderInstance {
  /**
   * The screen instance.
   */
  screen: Screen;

  /**
   * Unmount the React tree and clean up
   */
  unmount: () => void;

  /**
   * Re-render with new element
   */
  rerender: (element: ReactNode) => void;

  /**
   * Wait for exit (Promise that resolves when unmounted)
   */
  waitUntilExit: () => Promise<void>;
}

/**
 * Event handler map for wiring React props to unblessed widget events
 */
export interface EventHandlers {
  // Mouse events
  click?: (data: MouseEvent) => void;
  mousedown?: (data: MouseEvent) => void;
  mouseup?: (data: MouseEvent) => void;
  mousemove?: (data: MouseEvent) => void;
  mouseover?: (data: MouseEvent) => void;
  mouseout?: (data: MouseEvent) => void;
  mousewheel?: (data: MouseEvent) => void;
  wheeldown?: (data: MouseEvent) => void;
  wheelup?: (data: MouseEvent) => void;

  // Keyboard events
  keypress?: (ch: string, key: KeyEvent) => void;

  // Focus events
  focus?: () => void;
  blur?: () => void;

  // Widget-specific events
  press?: () => void; // Button
  submit?: (value?: string) => void; // Input/Textarea
  cancel?: () => void; // Input/Textarea
  action?: () => void; // Generic action event
}

/**
 * React event props that map to unblessed widget events
 */
export interface ReactEventProps {
  // Mouse events
  onClick?: (data: MouseEvent) => void;
  onMouseDown?: (data: MouseEvent) => void;
  onMouseUp?: (data: MouseEvent) => void;
  onMouseMove?: (data: MouseEvent) => void;
  onMouseOver?: (data: MouseEvent) => void;
  onMouseOut?: (data: MouseEvent) => void;
  onMouseWheel?: (data: MouseEvent) => void;
  onWheelDown?: (data: MouseEvent) => void;
  onWheelUp?: (data: MouseEvent) => void;

  // Keyboard events
  onKeyPress?: (ch: string, key: KeyEvent) => void;

  // Focus events
  onFocus?: () => void;
  onBlur?: () => void;

  // Widget-specific events
  onPress?: () => void; // Button
  onSubmit?: (value?: string) => void; // Input/Textarea
  onCancel?: () => void; // Input/Textarea
  onAction?: () => void; // Generic action event
}
