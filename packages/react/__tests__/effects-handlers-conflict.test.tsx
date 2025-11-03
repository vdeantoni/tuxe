/**
 * effects-handlers-conflict.test.tsx - Test for effects vs event handler conflicts
 *
 * Bug: Using onMouseMove breaks hoverEffects. Using onFocus breaks focusEffects.
 */

import { colors } from "@unblessed/core";
import { describe, expect, it, vi } from "vitest";
import { Box, render } from "../src/index.js";
import { testRuntime } from "./setup.js";

describe("Effects vs Event Handlers Conflict", () => {
  it("hoverEffects should work WITHOUT onMouseMove", () => {
    const instance = render(
      <Box width={10} height={5} hover={{ bg: "green" }}>
        Hover me
      </Box>,
      { runtime: testRuntime },
    );

    const rootWidget = instance.screen.children[0];
    const widget = rootWidget.children[0];

    // Store original bg
    const originalBg = widget.style.bg;

    // Simulate mouseover
    widget.emit("mouseover");

    // Effect should be applied
    expect(widget.style.bg).toBe(colors.colorNames.green);

    // Simulate mouseout
    widget.emit("mouseout");

    // Effect should be removed
    expect(widget.style.bg).toBe(originalBg);

    instance.unmount();
  });

  it("BUG: hoverEffects should work WITH onMouseMove", () => {
    const onMouseMove = vi.fn();

    const instance = render(
      <Box
        width={10}
        height={5}
        hover={{ bg: "green" }}
        onMouseMove={onMouseMove}
      >
        Hover me
      </Box>,
      { runtime: testRuntime },
    );

    const rootWidget = instance.screen.children[0];
    const widget = rootWidget.children[0];

    // Store original bg
    const originalBg = widget.style.bg;

    // Simulate mouseover (triggers hover effect)
    widget.emit("mouseover");

    // Effect should be applied (THIS IS THE BUG - might fail)
    expect(widget.style.bg).toBe(colors.colorNames.green);

    // Simulate mousemove (triggers user handler)
    widget.emit("mousemove", { x: 5, y: 2 });
    expect(onMouseMove).toHaveBeenCalled();

    // Effect should still be applied (THIS IS THE BUG - might fail)
    expect(widget.style.bg).toBe(colors.colorNames.green);

    // Simulate mouseout (removes hover effect)
    widget.emit("mouseout");

    // Effect should be removed
    expect(widget.style.bg).toBe(originalBg);

    instance.unmount();
  });

  it("focusEffects should work WITHOUT onFocus", () => {
    const instance = render(
      <Box width={10} height={5} tabIndex={0} focus={{ bg: "blue" }}>
        Focus me
      </Box>,
      { runtime: testRuntime },
    );

    const rootWidget = instance.screen.children[0];
    const widget = rootWidget.children[0];

    // Store original bg
    const originalBg = widget.style.bg;

    // Simulate focus
    widget.emit("focus");

    // Effect should be applied
    expect(widget.style.bg).toBe(colors.colorNames.blue);

    // Simulate blur
    widget.emit("blur");

    // Effect should be removed
    expect(widget.style.bg).toBe(originalBg);

    instance.unmount();
  });

  it("BUG: focusEffects should work WITH onFocus", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();

    const instance = render(
      <Box
        width={10}
        height={5}
        tabIndex={0}
        focus={{ bg: "blue" }}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        Focus me
      </Box>,
      { runtime: testRuntime },
    );

    const rootWidget = instance.screen.children[0];
    const widget = rootWidget.children[0];

    // Store original bg
    const originalBg = widget.style.bg;

    // Simulate focus (triggers BOTH effect handler AND user handler)
    widget.emit("focus");

    // User handler should be called
    expect(onFocus).toHaveBeenCalled();

    // Effect should STILL be applied (THIS IS THE BUG - might fail)
    expect(widget.style.bg).toBe(colors.colorNames.blue);

    // Simulate blur
    widget.emit("blur");
    expect(onBlur).toHaveBeenCalled();

    // Effect should be removed
    expect(widget.style.bg).toBe(originalBg);

    instance.unmount();
  });

  it("BUG: both hoverEffects and focusEffects with handlers", () => {
    const onMouseMove = vi.fn();
    const onFocus = vi.fn();

    const instance = render(
      <Box
        width={10}
        height={5}
        tabIndex={0}
        hover={{ bg: "magenta" }}
        focus={{ bg: "green" }}
        onMouseMove={onMouseMove}
        onFocus={onFocus}
      >
        Interactive
      </Box>,
      { runtime: testRuntime },
    );

    const rootWidget = instance.screen.children[0];
    const widget = rootWidget.children[0];

    const originalBg = widget.style.bg;

    // Test hover effect
    widget.emit("mouseover");
    expect(widget.style.bg).toBe(colors.colorNames.magenta);

    widget.emit("mousemove", { x: 5, y: 2 });
    expect(onMouseMove).toHaveBeenCalled();

    widget.emit("mouseout");
    expect(widget.style.bg).toBe(originalBg);

    // Test focus effect
    widget.emit("focus");
    expect(onFocus).toHaveBeenCalled();
    expect(widget.style.bg).toBe(colors.colorNames.green);

    widget.emit("blur");
    expect(widget.style.bg).toBe(originalBg);

    instance.unmount();
  });
});
