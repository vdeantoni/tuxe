/**
 * focus-effects.test.tsx - Test focus effects functionality
 */

import { describe, expect, it } from "vitest";
import { Box, render } from "../src/index.js";
import { testRuntime } from "./setup.js";

describe("Focus Effects", () => {
  it("should set keyable=true when element has tabIndex", () => {
    const instance = render(
      <Box width={10} height={5} tabIndex={0} focus={{ bg: "green" }}>
        Focus me
      </Box>,
      { runtime: testRuntime },
    );

    const rootWidget = instance.screen.children[0];
    const widget = rootWidget.children[0];

    // Widget should be keyable to receive focus/blur events
    expect(widget.keyable).toBe(true);
    // tabIndex is internal to blessed, not exposed as widget.tabIndex
    expect(widget.options.tabIndex).toBe(0);

    // Focus effects should be set
    expect(widget.options.focusEffects).toBeDefined();
    expect(widget.options.focusEffects.bg).toBeDefined();

    instance.unmount();
  });

  it("should apply focus effects when widget receives focus", () => {
    const instance = render(
      <Box width={10} height={5} tabIndex={0} focus={{ bg: "green" }}>
        Focus me
      </Box>,
      { runtime: testRuntime },
    );

    const rootWidget = instance.screen.children[0];
    const widget = rootWidget.children[0];

    // Focus the widget
    widget.focus();

    // Widget should be focused
    expect(instance.screen.focused).toBe(widget);

    instance.unmount();
  });

  it("should work with both hover and focus effects", () => {
    const instance = render(
      <Box
        width={10}
        height={5}
        tabIndex={0}
        hover={{ bg: "magenta" }}
        focus={{ bg: "green" }}
      >
        Interactive
      </Box>,
      { runtime: testRuntime },
    );

    const rootWidget = instance.screen.children[0];
    const widget = rootWidget.children[0];

    // Both effects should be set
    expect(widget.options.hoverEffects).toBeDefined();
    expect(widget.options.hoverEffects.bg).toBeDefined();
    expect(widget.options.focusEffects).toBeDefined();
    expect(widget.options.focusEffects.bg).toBeDefined();

    // Widget should be keyable for focus effects to work
    expect(widget.keyable).toBe(true);

    instance.unmount();
  });

  it("should set keyable=true for Button by default", () => {
    const instance = render(
      <tbutton width={10} height={3} focus={{ bg: "green" }}>
        Button
      </tbutton>,
      { runtime: testRuntime },
    );

    const rootWidget = instance.screen.children[0];
    const widget = rootWidget.children[0];

    // Button should have keyable=true by default
    expect(widget.keyable).toBe(true);

    instance.unmount();
  });

  it("should set keyable=true for Input by default", () => {
    const instance = render(
      <textinput width={20} height={3} focus={{ bg: "green" }} />,
      { runtime: testRuntime },
    );

    const rootWidget = instance.screen.children[0];
    const widget = rootWidget.children[0];

    // Input should have keyable=true by default
    expect(widget.keyable).toBe(true);

    instance.unmount();
  });

  it("should not set keyable for Box without tabIndex", () => {
    const instance = render(
      <Box width={10} height={5}>
        No focus
      </Box>,
      { runtime: testRuntime },
    );

    const rootWidget = instance.screen.children[0];
    const widget = rootWidget.children[0];

    // Box without tabIndex should not be keyable
    expect(widget.keyable).toBeUndefined();
    expect(widget.tabIndex).toBeUndefined();

    instance.unmount();
  });
});
