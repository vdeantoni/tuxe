/**
 * Vite plugin for @unblessed/browser
 *
 * Optional plugin that provides optimized build configuration for @unblessed/browser in Vite projects.
 *
 * NOTE: This plugin is now OPTIONAL and provides minimal optimizations.
 * @unblessed/browser works fine without it since BrowserRuntime handles all polyfills.
 *
 * Usage:
 * ```ts
 * // vite.config.ts
 * import blessedBrowser from '@unblessed/browser/vite-plugin';
 *
 * export default defineConfig({
 *   plugins: [blessedBrowser()]
 * });
 * ```
 */

import type { Plugin, UserConfig } from "vite";

export interface BlessedBrowserPluginOptions {
  /**
   * Whether to optimize dependencies
   * @default true
   */
  optimizeDeps?: boolean;
}

export default function blessedBrowserPlugin(
  options: BlessedBrowserPluginOptions = {},
): Plugin {
  const { optimizeDeps = true } = options;

  return {
    name: "vite-plugin-unblessed-browser",

    config(): UserConfig {
      const optimizeDepsConfig = optimizeDeps
        ? {
            include: [
              "@unblessed/core",
              "@unblessed/react",
              "react",
              "buffer",
              "events",
              "path-browserify",
            ],
            esbuildOptions: {
              define: {
                global: "globalThis",
              },
            },
          }
        : undefined;

      return {
        optimizeDeps: optimizeDepsConfig,
      };
    },
  };
}

// Named export for convenience
export { blessedBrowserPlugin };
