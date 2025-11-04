/**
 * useKeyboard.ts - Hook for global keyboard shortcuts
 */

import { useEffect, useRef } from "react";
import { useScreen } from "./ScreenContext.js";

/**
 * Keyboard handler function type
 */
export type KeyboardHandler = (ch?: string, key?: any) => void;

/**
 * Keyboard shortcuts mapping
 */
export interface KeyboardShortcuts {
  [key: string]: KeyboardHandler;
}

/**
 * Hook to register global keyboard shortcuts.
 * Uses screen.key() behind the scenes for app-wide keyboard handling.
 *
 * Handlers are automatically kept fresh (no stale closures) and cleaned up on unmount.
 *
 * @param shortcuts - Object mapping key names to handler functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [count, setCount] = useState(0);
 *
 *   useKeyboard({
 *     't': () => console.log('Toggle pressed'),
 *     'space': () => setCount(c => c + 1),
 *     'r': () => setCount(0),
 *   });
 *
 *   return <Box>Count: {count}</Box>;
 * }
 * ```
 *
 * @example Override default quit shortcuts
 * ```tsx
 * useKeyboard({
 *   'q': () => {
 *     if (confirm('Really quit?')) {
 *       process.exit(0);
 *     }
 *   },
 *   'C-c': () => {
 *     console.log('Use q to quit');
 *   }
 * });
 * ```
 */
export function useKeyboard(shortcuts: KeyboardShortcuts): void {
  const screen = useScreen();

  // Store handlers in a ref that always points to the latest version
  const handlersRef = useRef<KeyboardShortcuts>(shortcuts);

  // Always update ref to latest handlers (runs on every render)
  handlersRef.current = shortcuts;

  useEffect(() => {
    // Get array of key names to register
    const keys = Object.keys(shortcuts);

    if (keys.length === 0) {
      return; // Nothing to register
    }

    // Create stable wrapper functions that call through the ref
    // This ensures we always call the latest handler version
    const wrappers = new Map<string, KeyboardHandler>();

    keys.forEach((key) => {
      const wrapper: KeyboardHandler = (ch, keyObj) => {
        handlersRef.current[key]?.(ch, keyObj);
      };
      wrappers.set(key, wrapper);
    });

    // Register all shortcuts with screen
    keys.forEach((key) => {
      const wrapper = wrappers.get(key)!;
      screen.key([key], wrapper as any);
    });

    // Cleanup: unregister all shortcuts
    return () => {
      keys.forEach((key) => {
        const wrapper = wrappers.get(key)!;
        screen.unkey([key], wrapper as any);
      });
    };
  }, [screen, ...Object.keys(shortcuts)]); // Re-register if key names change
}
