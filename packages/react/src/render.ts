/**
 * render.ts - Main render function for @unblessed/react
 *
 * This module provides the main `render()` function that users call to
 * mount React components to an unblessed Screen.
 */

import { LayoutManager } from "@unblessed/layout";
import type { ReactNode } from "react";
import { BoxDescriptor } from "./components/Box.js";
import { createElement } from "./dom.js";
import reconciler, { setLayoutManager } from "./reconciler.js";
import type { RenderInstance, RenderOptions } from "./types.js";

/**
 * Render a React element to an unblessed Screen
 *
 * @example
 * ```tsx
 * import { Screen } from '@unblessed/node';
 * import { render, Box, Text } from '@unblessed/react';
 *
 * const screen = new Screen();
 *
 * const App = () => (
 *   <Box flexDirection="row" gap={2}>
 *     <Box width={20}>Left</Box>
 *     <Box flexGrow={1}>Middle</Box>
 *     <Box width={20}>Right</Box>
 *   </Box>
 * );
 *
 * const instance = render(<App />, { screen });
 *
 * // Later:
 * instance.unmount();
 * ```
 */
export function render(
  element: ReactNode,
  options: RenderOptions,
): RenderInstance {
  const screen = options.screen;

  if (!screen) {
    throw new Error("render() requires options.screen");
  }

  // Create LayoutManager
  const manager = new LayoutManager({
    screen,
    debug: options.debug,
  });

  // Set layout manager for reconciler to use
  setLayoutManager(manager);

  // Create root layout node using BoxDescriptor (treat root like a box)
  const rootDescriptor = new BoxDescriptor({
    width: screen.width || 80,
    height: screen.height || 24,
  });

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

  // Render the React element
  reconciler.updateContainer(element, container, null, () => {
    // Initial render complete
  });

  return {
    unmount: () => {
      // Unmount React tree
      reconciler.updateContainer(null, container, null, () => {});

      // Cleanup layout
      manager.destroy(rootLayoutNode);

      // Cleanup screen
      screen.destroy();

      // Resolve exit promise
      resolveExitPromise();
    },

    rerender: (newElement: ReactNode) => {
      reconciler.updateContainer(newElement, container, null, () => {});
    },

    waitUntilExit: () => exitPromise,
  };
}
