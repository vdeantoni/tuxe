/**
 * hooks.test.tsx - Tests for useScreen and useWindowSize hooks
 */

import { NodeRuntime } from "@unblessed/node";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Box, render, Text, useScreen, useWindowSize } from "../src";

describe("Screen Hooks", () => {
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

  describe("useScreen", () => {
    it("provides access to screen instance", () => {
      let capturedScreen: any = null;

      function TestApp() {
        capturedScreen = useScreen();
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

      expect(capturedScreen).toBeDefined();
      expect(capturedScreen).toBe(instance.screen);
    });

    it("provides same screen instance across components", () => {
      const screens: any[] = [];

      function ComponentA() {
        screens.push(useScreen());
        return (
          <Box>
            <Text>A</Text>
          </Box>
        );
      }

      function ComponentB() {
        screens.push(useScreen());
        return (
          <Box>
            <Text>B</Text>
          </Box>
        );
      }

      function TestApp() {
        return (
          <Box>
            <ComponentA />
            <ComponentB />
          </Box>
        );
      }

      const instance = render(<TestApp />, {
        runtime: new NodeRuntime(),
      });
      instances.push(instance);

      expect(screens.length).toBe(2);
      expect(screens[0]).toBe(screens[1]); // Same screen instance
    });
  });

  describe("useWindowSize", () => {
    it("returns current screen dimensions", () => {
      let capturedSize: any = null;

      function TestApp() {
        capturedSize = useWindowSize();
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

      expect(capturedSize).toBeDefined();
      expect(capturedSize.width).toBe(instance.screen.width);
      expect(capturedSize.height).toBe(instance.screen.height);
    });

    // Note: Testing resize updates is difficult because:
    // 1. useEffect dependencies on object properties don't trigger re-renders
    // 2. Screen resize in tests happens synchronously but React updates are async
    // The functionality is verified manually in examples/theme-demo.tsx
  });
});
