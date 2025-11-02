/**
 * content-update.test.tsx - Test content updates on state changes
 */

import { Screen } from "@unblessed/core";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Box, render, Text } from "../src/index.js";

describe("Content Updates", () => {
  let screen: Screen;

  beforeEach(() => {
    screen = new Screen({
      smartCSR: true,
      fullUnicode: true,
      input: undefined,
      output: undefined,
    });
  });

  afterEach(() => {
    screen.destroy();
  });

  it("should update text content when state changes", () => {
    let setCount: (c: number) => void;

    const Counter = () => {
      const [count, _setCount] = useState(0);
      setCount = _setCount;

      return (
        <Box width={20} height={5}>
          <Text>Count: {count}</Text>
        </Box>
      );
    };

    render(<Counter />, { screen });

    const rootWidget = screen.children[0];
    const boxWidget = rootWidget.children[0];
    const textWidget = boxWidget.children[0];

    expect(textWidget.content).toContain("Count: 0");

    setCount(5);
    expect(textWidget.content).toContain("Count: 5");

    setCount(42);
    expect(textWidget.content).toContain("Count: 42");
  });

  it("should update multiple text widgets independently", () => {
    let setX: (n: number) => void;
    let setY: (n: number) => void;

    const Coords = () => {
      const [x, _setX] = useState(0);
      const [y, _setY] = useState(0);
      setX = _setX;
      setY = _setY;

      return (
        <Box flexDirection="column" width={30} height={10}>
          <Text>X: {x}</Text>
          <Text>Y: {y}</Text>
        </Box>
      );
    };

    render(<Coords />, { screen });

    const rootWidget = screen.children[0];
    const boxWidget = rootWidget.children[0];
    const textWidget1 = boxWidget.children[0];
    const textWidget2 = boxWidget.children[1];

    expect(textWidget1.content).toContain("X: 0");
    expect(textWidget2.content).toContain("Y: 0");

    setX(10);
    expect(textWidget1.content).toContain("X: 10");
    expect(textWidget2.content).toContain("Y: 0");

    setY(20);
    expect(textWidget1.content).toContain("X: 10");
    expect(textWidget2.content).toContain("Y: 20");
  });
});
