/**
 * types.ts - Type definitions for @unblessed/react
 */

import { Screen } from "@unblessed/core";
import type { ReactNode } from "react";

/**
 * Options for the render() function
 */
export interface RenderOptions {
  /**
   * Screen instance to render to (required)
   * Create this from @unblessed/node or @unblessed/browser
   */
  screen: Screen;

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
