/**
 * ThemeProvider.tsx - Theme context and provider
 *
 * Internal component that manages theme state via React Context.
 * Users don't use this directly - it's automatically injected by render().
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { setCurrentTheme } from "../theme-registry.js";
import type { Theme } from "../theme.js";

/**
 * Theme context value interface.
 * Contains both the current theme and a setter function.
 */
interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme | ((prev: Theme) => Theme)) => void;
}

/**
 * React context for theme management.
 * Initialized as null to detect usage outside provider.
 */
const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Theme provider component (internal use only).
 * Manages theme state and provides it to all child components.
 *
 * @param theme - Initial theme to use
 * @param children - Child components to wrap
 *
 * @internal
 */
export function ThemeProvider({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  const [currentTheme, setTheme] = useState(theme);

  // Create a wrapper that updates registry BEFORE state update
  // This ensures reconciler always has the latest theme
  const setThemeWithRegistry = (newTheme: Theme | ((prev: Theme) => Theme)) => {
    if (typeof newTheme === "function") {
      setTheme((prevTheme) => {
        const resolvedTheme = newTheme(prevTheme);
        setCurrentTheme(resolvedTheme); // Update registry immediately
        return resolvedTheme;
      });
    } else {
      setCurrentTheme(newTheme); // Update registry immediately
      setTheme(newTheme);
    }
  };

  // Sync initial theme to registry
  useEffect(() => {
    setCurrentTheme(currentTheme);
  }, []); // Only on mount

  return (
    <ThemeContext.Provider
      value={{ theme: currentTheme, setTheme: setThemeWithRegistry }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access and update the current theme.
 * Returns a tuple similar to useState: [theme, setTheme].
 *
 * @returns Tuple of [currentTheme, setTheme]
 * @throws Error if used outside ThemeProvider
 *
 * @example
 * function App() {
 *   const [theme, setTheme] = useTheme();
 *
 *   // Direct value
 *   return (
 *     <Box onClick={() => setTheme(darkTheme)}>
 *       Click to set dark theme
 *     </Box>
 *   );
 *
 *   // Or use updater function
 *   return (
 *     <Box onClick={() => setTheme(currentTheme =>
 *       currentTheme === darkTheme ? lightTheme : darkTheme
 *     )}>
 *       Click to toggle theme
 *     </Box>
 *   );
 * }
 */
export function useTheme(): [
  Theme,
  (theme: Theme | ((prev: Theme) => Theme)) => void,
] {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used within a component rendered by @unblessed/react's render() function",
    );
  }

  return [context.theme, context.setTheme];
}

/**
 * Internal hook to access theme context directly.
 * Used by the reconciler to inject theme into descriptors.
 *
 * @returns Theme context value or null
 * @internal
 */
export function useThemeContext(): ThemeContextValue | null {
  return useContext(ThemeContext);
}
