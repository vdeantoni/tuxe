/**
 * events.test.tsx - Event handling tests
 */

import { Screen } from "@unblessed/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Box, render } from "../src/index.js";

describe("Event Handling", () => {
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

  it("should bind onClick handler to Box widget", () => {
    const onClick = vi.fn();

    render(
      <Box width={10} height={5} onClick={onClick}>
        Click me
      </Box>,
      { screen },
    );

    const rootWidget = screen.children[0];
    const widget = rootWidget.children[0];

    expect(widget.listeners("click")).toHaveLength(1);

    widget.emit("click", { x: 1, y: 1, action: "mousedown", button: "left" });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should bind onKeyPress handler to Box widget", () => {
    const onKeyPress = vi.fn();

    render(
      <Box width={10} height={5} onKeyPress={onKeyPress}>
        Press me
      </Box>,
      { screen },
    );

    const widget = screen.children[0].children[0];

    expect(widget.listeners("keypress")).toHaveLength(1);

    widget.emit("keypress", "a", {
      full: "a",
      name: "a",
      shift: false,
      ctrl: false,
      meta: false,
      sequence: "a",
      ch: "a",
    });

    expect(onKeyPress).toHaveBeenCalledTimes(1);
    expect(onKeyPress).toHaveBeenCalledWith("a", expect.any(Object));
  });

  it("should bind onPress handler to Button widget", () => {
    const onPress = vi.fn();

    render(
      <tbutton width={10} height={3} onPress={onPress}>
        Button
      </tbutton>,
      { screen },
    );

    const widget = screen.children[0].children[0];

    expect(widget.listeners("press")).toHaveLength(1);

    widget.emit("press");

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should bind onSubmit handler to Input widget", () => {
    const onSubmit = vi.fn();

    render(<textinput width={20} height={3} onSubmit={onSubmit} />, { screen });

    const widget = screen.children[0].children[0];

    expect(widget.listeners("submit")).toHaveLength(1);

    widget.emit("submit", "test value");

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith("test value");
  });

  it("should unbind old handlers when props change", () => {
    const onClick1 = vi.fn();
    const onClick2 = vi.fn();

    const instance = render(
      <Box width={10} height={5} onClick={onClick1}>
        Click me
      </Box>,
      { screen },
    );

    const widget = screen.children[0].children[0];

    widget.emit("click", { x: 1, y: 1, action: "mousedown" });
    expect(onClick1).toHaveBeenCalledTimes(1);
    expect(onClick2).toHaveBeenCalledTimes(0);

    instance.rerender(
      <Box width={10} height={5} onClick={onClick2}>
        Click me
      </Box>,
    );

    widget.emit("click", { x: 1, y: 1, action: "mousedown" });

    expect(onClick1).toHaveBeenCalledTimes(1);
    expect(onClick2).toHaveBeenCalledTimes(1);
  });

  it("should unbind handlers on unmount", () => {
    const onClick = vi.fn();

    const instance = render(
      <Box width={10} height={5} onClick={onClick}>
        Click me
      </Box>,
      { screen },
    );

    const widget = screen.children[0].children[0];

    expect(widget.listeners("click")).toHaveLength(1);

    instance.unmount();

    expect(onClick).toHaveBeenCalledTimes(0);
  });
});
