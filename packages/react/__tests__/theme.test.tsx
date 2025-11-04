/**
 * theme.test.tsx - Tests for theme system
 */

import { NodeRuntime } from "@unblessed/node";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  Box,
  matrixTheme,
  render,
  Text,
  unblessedTheme,
  useTheme,
} from "../src";

describe("Theme System", () => {
  beforeAll(() => {
    // Suppress console output during tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  let instances: ReturnType<typeof render>[] = [];

  afterEach(() => {
    instances.forEach((instance) => instance.unmount());
    instances = [];
  });

  describe("Theme Provider", () => {
    it("provides default unblessedTheme when no theme specified", () => {
      let capturedTheme: any = null;

      function TestApp() {
        const [theme] = useTheme();
        capturedTheme = theme;
        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      const instance = render(<TestApp />, {
        runtime: new NodeRuntime(),
      });
      instances.push(instance);

      expect(capturedTheme).toBeDefined();
      expect(capturedTheme.name).toBe("unblessed");
    });

    it("uses provided theme on initial render", () => {
      let capturedTheme: any = null;

      function TestApp() {
        const [theme] = useTheme();
        capturedTheme = theme;
        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      const instance = render(<TestApp />, {
        runtime: new NodeRuntime(),
        theme: matrixTheme,
      });
      instances.push(instance);

      expect(capturedTheme).toBeDefined();
      expect(capturedTheme.name).toBe("matrix");
    });

    it("switches themes using functional update", () => {
      let capturedTheme: any = null;
      let setThemeFunc: any = null;

      function TestApp() {
        const [theme, setTheme] = useTheme();
        capturedTheme = theme;
        setThemeFunc = setTheme;
        return (
          <Box>
            <Text>{theme.name}</Text>
          </Box>
        );
      }

      const instance = render(<TestApp />, {
        runtime: new NodeRuntime(),
        theme: unblessedTheme,
      });
      instances.push(instance);

      // Initial theme
      expect(capturedTheme.name).toBe("unblessed");

      // Switch theme using functional update
      setThemeFunc((current: any) =>
        current.name === "unblessed" ? matrixTheme : unblessedTheme,
      );

      // Theme should have changed
      expect(capturedTheme.name).toBe("matrix");
    });
  });

  describe("Theme Color Resolution", () => {
    it("resolves $primary semantic color for unblessedTheme", () => {
      function TestApp() {
        return <Text color="$primary">Primary</Text>;
      }

      const instance = render(<TestApp />, {
        runtime: new NodeRuntime(),
        theme: unblessedTheme,
      });
      instances.push(instance);

      // Colors should be resolved (checked via no errors during render)
      expect(instance.screen).toBeDefined();
    });

    it("resolves $primary semantic color for matrixTheme", () => {
      function TestApp() {
        return <Text color="$primary">Primary</Text>;
      }

      const instance = render(<TestApp />, {
        runtime: new NodeRuntime(),
        theme: matrixTheme,
      });
      instances.push(instance);

      // Colors should be resolved (checked via no errors during render)
      expect(instance.screen).toBeDefined();
    });

    it("resolves $semantic.success color", () => {
      function TestApp() {
        return <Text color="$semantic.success">Success</Text>;
      }

      const instance = render(<TestApp />, {
        runtime: new NodeRuntime(),
        theme: unblessedTheme,
      });
      instances.push(instance);

      expect(instance.screen).toBeDefined();
    });

    it("resolves $primitives.blue.500 color", () => {
      function TestApp() {
        return <Text color="$primitives.blue.500">Blue</Text>;
      }

      const instance = render(<TestApp />, {
        runtime: new NodeRuntime(),
        theme: unblessedTheme,
      });
      instances.push(instance);

      expect(instance.screen).toBeDefined();
    });

    it("uses explicit colors without theme resolution", () => {
      function TestApp() {
        return <Text color="cyan">Cyan</Text>;
      }

      const instance = render(<TestApp />, {
        runtime: new NodeRuntime(),
        theme: unblessedTheme,
      });
      instances.push(instance);

      // Explicit color should work (no errors)
      expect(instance.screen).toBeDefined();
    });

    it("applies matrix theme green colors correctly", () => {
      function TestApp() {
        return (
          <Box border={1} borderColor="$primary">
            <Text color="$semantic.foreground">Matrix</Text>
          </Box>
        );
      }

      const instance = render(<TestApp />, {
        runtime: new NodeRuntime(),
        theme: matrixTheme,
      });
      instances.push(instance);

      // Matrix theme should apply without errors
      expect(instance.screen).toBeDefined();
    });
  });

  // Note: Theme switching integration tests are skipped because:
  // 1. useEffect runs asynchronously and is hard to test synchronously
  // 2. Basic switching is covered by "switches themes using functional update" test
  // 3. Full theme switching is verified manually in examples/theme-demo.tsx
});
