/**
 * render.ts - Main render function for @unblessed/react
 *
 * This module provides the main `render()` function that users call to
 * mount React components to an unblessed Screen.
 */

import { Screen, setRuntime } from "@unblessed/core";
import { LayoutManager, syncTreeAndRender } from "@unblessed/layout";
import React, { type ReactNode } from "react";
import { BoxDescriptor } from "./components/Box.js";
import { ThemeProvider } from "./components/ThemeProvider.js";
import { createElement } from "./dom.js";
import { ScreenProvider } from "./hooks/ScreenContext.js";
import reconciler, { setLayoutManager } from "./reconciler.js";
import { setCurrentTheme } from "./theme-registry.js";
import { unblessedTheme } from "./themes/index.js";
import type { RenderInstance, RenderOptions } from "./types.js";

/**
 * Render a React element to an unblessed Screen
 *
 * @example
 * Basic usage (render() creates screen automatically):
 * ```tsx
 * import { NodeRuntime } from '@unblessed/node';
 * import { render, Box, Text } from '@unblessed/react';
 *
 * const App = () => (
 *   <Box flexDirection="row" gap={2}>
 *     <Box width={20}>Left</Box>
 *     <Box flexGrow={1}>Middle</Box>
 *     <Box width={20}>Right</Box>
 *   </Box>
 * );
 *
 * const instance = render(<App />, { runtime: new NodeRuntime() });
 *
 * // Later:
 * instance.unmount();  // Automatically destroys screen
 * ```
 *
 * @example
 * Advanced usage (provide custom screen):
 * ```tsx
 * import { Screen, NodeRuntime } from '@unblessed/node';
 * import { render, Box, Text } from '@unblessed/react';
 *
 * const screen = new Screen({
 *   smartCSR: false,
 *   debug: true,
 *   log: './debug.log'
 * });
 *
 * const instance = render(<App />, {
 *   runtime: new NodeRuntime(),
 *   screen
 * });
 *
 * // Later:
 * instance.unmount();
 * screen.destroy();  // You must destroy screen manually
 * ```
 */
export function render(
  element: ReactNode,
  options: RenderOptions,
): RenderInstance {
  setRuntime(options.runtime);

  // Use provided theme or default to unblessed theme
  const theme = options.theme || unblessedTheme;

  // Initialize theme registry with the initial theme
  setCurrentTheme(theme);

  // Use provided screen or create default
  const screen =
    options.screen ||
    new Screen({
      smartCSR: true,
      fullUnicode: true,
    });

  // Track whether screen was provided by user
  const screenCreatedByRender = !options.screen;

  // Create LayoutManager
  const manager = new LayoutManager({
    screen,
    debug: options.debug,
  });

  // Set layout manager for reconciler to use
  setLayoutManager(manager);

  // Create root layout node using BoxDescriptor (treat root like a box)
  // Pass theme to descriptor (even though root doesn't use it for colors)
  const rootDescriptor = new BoxDescriptor(
    {
      width: screen.width || 80,
      height: screen.height || 24,
    },
    theme,
  );

  const rootLayoutNode = manager.createNode(
    "root",
    rootDescriptor.flexProps,
    rootDescriptor.widgetOptions,
  );
  rootLayoutNode._descriptor = rootDescriptor;

  // Create root DOM node
  const rootDOMNode = createElement("root", rootLayoutNode, {});
  rootDOMNode.screen = screen;

  // Set up layout calculation callback
  rootDOMNode.onComputeLayout = () => {
    // Calculate layout using LayoutManager
    manager.performLayout(rootLayoutNode);
  };

  // Create React container
  const container = reconciler.createContainer(
    rootDOMNode,
    0, // LegacyRoot
    null, // hydration callbacks
    false, // isStrictMode
    null, // concurrentUpdatesByDefaultOverride
    "", // identifierPrefix
    (error: Error) => console.error(error), // onRecoverableError
    null, // transitionCallbacks
  );

  // Promise that resolves when unmounted
  let resolveExitPromise: () => void = () => {};
  const exitPromise = new Promise<void>((resolve) => {
    resolveExitPromise = resolve;
  });

  // Wrap user element in ScreenProvider and ThemeProvider
  const wrappedElement = React.createElement(ScreenProvider, {
    screen,
    children: React.createElement(ThemeProvider, { theme, children: element }),
  });

  // Render the React element
  reconciler.updateContainer(wrappedElement, container, null, () => {
    // Initial render complete
  });

  // Handle terminal resize
  const handleResize = () => {
    // Update root layout node dimensions
    rootLayoutNode.yogaNode.setWidth(screen.width || 80);
    rootLayoutNode.yogaNode.setHeight(screen.height || 24);
    rootLayoutNode.props.width = screen.width || 80;
    rootLayoutNode.props.height = screen.height || 24;

    // Recalculate layout with new dimensions
    manager.performLayout(rootLayoutNode);

    // Sync updated layout to widgets and render
    syncTreeAndRender(rootLayoutNode, screen);
  };

  screen.on("resize", handleResize);

  // Register default quit shortcuts (q and Ctrl+C)
  // Users can override these with useKeyboard() if needed
  const defaultQuitHandler = () => {
    if (screenCreatedByRender) {
      screen.destroy();
    }
    process.exit(0);
  };

  screen.key(["q", "C-c"], defaultQuitHandler);

  return {
    screen,
    unmount: () => {
      // Remove resize listener
      screen.off("resize", handleResize);

      // Remove default quit shortcuts
      screen.unkey(["q", "C-c"], defaultQuitHandler);

      // Unmount React tree
      reconciler.updateContainer(null, container, null, () => {});

      // Cleanup layout
      manager.destroy(rootLayoutNode);

      // Cleanup screen only if we created it
      if (screenCreatedByRender) {
        screen.destroy();
      }

      // Resolve exit promise
      resolveExitPromise();
    },

    rerender: (newElement: ReactNode) => {
      // Also wrap rerender element in ScreenProvider and ThemeProvider
      const wrappedNewElement = React.createElement(ScreenProvider, {
        screen,
        children: React.createElement(ThemeProvider, {
          theme,
          children: newElement,
        }),
      });
      reconciler.updateContainer(wrappedNewElement, container, null, () => {});
    },

    waitUntilExit: () => exitPromise,
  };
}
