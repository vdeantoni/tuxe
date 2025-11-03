/**
 * effects-bug.test.js - Test for effects vs event handler conflicts
 */

import { beforeEach, describe, expect, it } from "vitest";
import { Box } from "../../src/widgets/box.js";
import { Screen } from "../../src/widgets/screen.js";
import { initTestRuntime } from "../helpers/mock.js";

describe("Effects vs Event Handlers Bug", () => {
  beforeEach(() => {
    initTestRuntime();
  });

  it("hoverEffects should work without onMouseMove", () => {
    const screen = new Screen({ width: 80, height: 24 });

    const box = new Box({
      parent: screen,
      top: 0,
      left: 0,
      width: 10,
      height: 5,
      hoverEffects: {
        bg: "green",
      },
    });

    // Store original bg
    const originalBg = box.style.bg;

    // Simulate mouseover
    box.emit("mouseover");

    // Effect should be applied
    expect(box.style.bg).toBe("green");

    // Simulate mouseover
    box.emit("mousemove");

    // Effect should be applied
    expect(box.style.bg).toBe("green");

    // Simulate mouseout
    box.emit("mouseout");

    // Effect should be removed
    expect(box.style.bg).toBe(originalBg);

    screen.destroy();
  });

  it("BUG: hoverEffects should work WITH onMouseMove", () => {
    const screen = new Screen({ width: 80, height: 24 });

    let mouseMoveCount = 0;

    const box = new Box({
      parent: screen,
      top: 0,
      left: 0,
      width: 10,
      height: 5,
      hoverEffects: {
        bg: "green",
      },
    });

    // Add onMouseMove handler AFTER widget creation
    box.on("mousemove", () => {
      mouseMoveCount++;
    });

    // Store original bg
    const originalBg = box.style.bg;

    // Simulate mouseover
    box.emit("mouseover");

    // Effect should STILL be applied (this is the bug)
    expect(box.style.bg).toBe("green");

    // Simulate mousemove
    box.emit("mousemove");
    expect(mouseMoveCount).toBe(1);

    // Simulate mouseout
    box.emit("mouseout");

    // Effect should be removed
    expect(box.style.bg).toBe(originalBg);

    screen.destroy();
  });

  it("BUG: focusEffects should work WITH onFocus", () => {
    const screen = new Screen({ width: 80, height: 24 });

    let focusCount = 0;

    const box = new Box({
      parent: screen,
      top: 0,
      left: 0,
      width: 10,
      height: 5,
      keyable: true,
      focusEffects: {
        bg: "blue",
      },
    });

    // Add onFocus handler AFTER widget creation
    box.on("focus", () => {
      focusCount++;
    });

    // Store original bg
    const originalBg = box.style.bg;

    // Simulate focus
    box.emit("focus");

    // Both handlers should run
    expect(focusCount).toBe(1);

    // Effect should STILL be applied (this is the bug)
    expect(box.style.bg).toBe("blue");

    // Simulate blur
    box.emit("blur");

    // Effect should be removed
    expect(box.style.bg).toBe(originalBg);

    screen.destroy();
  });
});
