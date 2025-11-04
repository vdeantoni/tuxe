/**
 * ScreenContext.tsx - Screen context for accessing screen instance in components
 */

import type { Screen } from "@unblessed/core";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

/**
 * Screen context value
 */
interface ScreenContextValue {
  screen: Screen;
}

/**
 * React context for screen access
 */
const ScreenContext = createContext<ScreenContextValue | null>(null);

/**
 * Screen provider component (internal use only)
 *
 * @internal
 */
export function ScreenProvider({
  screen,
  children,
}: {
  screen: Screen;
  children: ReactNode;
}) {
  return (
    <ScreenContext.Provider value={{ screen }}>
      {children}
    </ScreenContext.Provider>
  );
}

/**
 * Hook to access the screen instance.
 * Useful for accessing screen properties or calling screen methods.
 *
 * @returns Screen instance
 * @throws Error if used outside render()
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const screen = useScreen();
 *
 *   return (
 *     <Box onClick={() => screen.render()}>
 *       Click to force re-render
 *     </Box>
 *   );
 * }
 * ```
 */
export function useScreen(): Screen {
  const context = useContext(ScreenContext);

  if (!context) {
    throw new Error(
      "useScreen must be used within a component rendered by @unblessed/react's render() function",
    );
  }

  return context.screen;
}

/**
 * Hook to get the current terminal window size.
 * Automatically updates when the terminal is resized.
 *
 * @returns Object with width and height
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { width, height } = useWindowSize();
 *
 *   return (
 *     <Box>
 *       <Text>Terminal size: {width}x{height}</Text>
 *     </Box>
 *   );
 * }
 * ```
 */
export function useWindowSize(): { width: number; height: number } {
  const screen = useScreen();
  const [size, setSize] = useState({
    width: screen.width || 80,
    height: screen.height || 24,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: screen.width || 80,
        height: screen.height || 24,
      });
    };

    screen.on("resize", handleResize);

    return () => {
      screen.off("resize", handleResize);
    };
  }, [screen]);

  return size;
}
