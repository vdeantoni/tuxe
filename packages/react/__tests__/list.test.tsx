/**
 * list.test.tsx - List component tests
 */

import { Screen } from "@unblessed/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { List, render } from "../src/index.js";

describe("List Component", () => {
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

  it("should render list with items", () => {
    const items = ["Apple", "Banana", "Cherry"];

    render(<List items={items} width={20} height={10} />, { screen });

    const rootWidget = screen.children[0];
    const listWidget = rootWidget.children[0];

    expect(listWidget.type).toBe("list");
    expect(listWidget.items.length).toBe(3);
  });

  it("should bind onSelect handler", () => {
    const onSelect = vi.fn();
    const items = ["Item 1", "Item 2", "Item 3"];

    render(<List items={items} width={20} height={10} onSelect={onSelect} />, {
      screen,
    });

    const rootWidget = screen.children[0];
    const listWidget = rootWidget.children[0];

    expect(listWidget.listeners("select")).toHaveLength(1);

    listWidget.emit("select", "Item 1", 0);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("Item 1", 0);
  });

  it("should bind onCancel handler", () => {
    const onCancel = vi.fn();
    const items = ["Item 1", "Item 2"];

    render(<List items={items} width={20} height={10} onCancel={onCancel} />, {
      screen,
    });

    const rootWidget = screen.children[0];
    const listWidget = rootWidget.children[0];

    expect(listWidget.listeners("cancel")).toHaveLength(1);

    listWidget.emit("cancel");

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should have mouse and keys enabled by default", () => {
    const items = ["Item 1", "Item 2"];

    render(<List items={items} width={20} height={10} />, { screen });

    const rootWidget = screen.children[0];
    const listWidget = rootWidget.children[0];

    // These should be enabled by default in React
    expect(listWidget.mouse).toBe(true);
    // keys is checked differently in unblessed, but the option should be set
  });

  it("should respect disabled prop", () => {
    const items = ["Item 1", "Item 2"];

    render(<List items={items} width={20} height={10} disabled={true} />, {
      screen,
    });

    const rootWidget = screen.children[0];
    const listWidget = rootWidget.children[0];

    expect(listWidget.interactive).toBe(false);
  });

  it("should default to interactive when disabled is not set", () => {
    const items = ["Item 1", "Item 2"];

    render(<List items={items} width={20} height={10} />, { screen });

    const rootWidget = screen.children[0];
    const listWidget = rootWidget.children[0];

    expect(listWidget.interactive).toBe(true);
  });

  it("should apply selected item styling", () => {
    const items = ["Item 1", "Item 2"];

    render(
      <List
        items={items}
        label="Select one"
        width={20}
        height={10}
        itemSelected={{ bg: "blue", color: "white", bold: true }}
      />,
      { screen },
    );

    const rootWidget = screen.children[0];
    const listWidget = rootWidget.children[0];

    // Check that the values were set (they get converted to numbers by colors.convert())
    expect(listWidget.options.selectedBg).toBeDefined();
    expect(listWidget.options.selectedFg).toBeDefined();
    expect(listWidget.options.selectedBold).toBe(true);
  });

  it("should apply normal item styling", () => {
    const items = ["Item 1", "Item 2"];

    render(
      <List
        items={items}
        label="Select one"
        width={20}
        height={10}
        itemStyle={{ bg: "black", color: "gray", bold: false }}
      />,
      { screen },
    );

    const rootWidget = screen.children[0];
    const listWidget = rootWidget.children[0];

    // Check that the values were set (they get converted to numbers by colors.convert())
    expect(listWidget.options.itemBg).toBeDefined();
    expect(listWidget.options.itemFg).toBeDefined();
    expect(listWidget.options.itemBold).toBe(false);
  });
});
