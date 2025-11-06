/**
 * @unblessed/browser - Browser runtime for unblessed
 *
 * Provides browser-compatible runtime for @unblessed/core with XTerm.js integration.
 *
 * ## Usage
 *
 * ```typescript
 * import { BrowserRuntime } from '@unblessed/browser';
 * import { render, Box, Text } from '@unblessed/react';
 * import { Terminal } from 'xterm';
 *
 * // Create terminal
 * const term = new Terminal();
 * term.open(document.getElementById('terminal')!);
 *
 * // Create runtime
 * const runtime = new BrowserRuntime();
 *
 * // Render your app
 * render(
 *   <Box>
 *     <Text>Hello from unblessed in the browser!</Text>
 *   </Box>,
 *   { runtime }
 * );
 * ```
 */

// CRITICAL: Set up minimal globals BEFORE any imports
import "./runtime/globals.js";

// Export BrowserRuntime for explicit initialization
export type { Runtime } from "@unblessed/core";
export { BrowserRuntime } from "./runtime/browser-runtime.js";

// Re-export everything from core EXCEPT Screen
export * from "@unblessed/core";

// Export browser-specific Screen (overrides core Screen)
export { Screen } from "./screen.js";
export type { BrowserScreenOptions } from "./screen.js";

// Export browser-specific adapters
export { XTermAdapter } from "./adapters/xterm-adapter.js";
export type { XTermAdapterOptions } from "./adapters/xterm-adapter.js";
