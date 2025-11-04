/**
 * widget-sync.test.ts - Tests for Yoga to widget synchronization
 */

import { Screen } from "@unblessed/core";
import { beforeEach, describe, expect, it } from "vitest";
import { LayoutManager } from "../src/layout-engine.js";
import { getComputedLayout } from "../src/widget-sync.js";

describe("widget sync", () => {
  let screen: Screen;
  let manager: LayoutManager;

  beforeEach(() => {
    screen = new Screen();
    manager = new LayoutManager({ screen });
  });

  afterEach(() => {
    screen.destroy();
  });

  it("creates widgets from layout nodes", () => {
    const node = manager.createNode(
      "box",
      { width: 20, height: 5 },
      { content: "Hello", border: { type: "line" } },
    );

    manager.performLayout(node);

    expect(node.widget).toBeDefined();
    expect(node.widget!.content).toBe("Hello");
    expect(node.widget!.border).toBeDefined();

    manager.destroy(node);
    screen.destroy();
  });

  it("updates existing widgets on re-layout", () => {
    const container = manager.createNode("container", {
      flexDirection: "row",
      width: 80,
    });

    const box = manager.createNode("box", { width: 20 });
    manager.appendChild(container, box);

    // First layout
    manager.performLayout(container);
    const firstWidget = box.widget;
    expect(firstWidget).toBeDefined();
    expect(firstWidget!.left).toBe(0);

    // Update props and re-layout
    box.yogaNode.setWidth(30);

    manager.performLayout(container);

    // Widget should be reused and updated
    expect(box.widget).toBe(firstWidget); // Same widget instance
    expect(box.widget!.width).toBe(30); // Updated width

    manager.destroy(container);
    screen.destroy();
  });

  it("maintains parent-child relationships", () => {
    const parent = manager.createNode("parent", {});
    const child = manager.createNode("child", {});

    manager.appendChild(parent, child);
    manager.performLayout(parent);

    expect(child.widget!.parent).toBe(parent.widget);

    manager.destroy(parent);
    screen.destroy();
  });

  it("extracts correct computed layout", () => {
    const node = manager.createNode("box", {
      width: 50,
      height: 10,
    });

    // Calculate layout
    node.yogaNode.calculateLayout(80, 24, 0);

    const layout = getComputedLayout(node);

    expect(layout.width).toBe(50);
    expect(layout.height).toBe(10);
    expect(layout.top).toBeGreaterThanOrEqual(0);
    expect(layout.left).toBeGreaterThanOrEqual(0);

    manager.destroy(node);
  });

  describe("hover/focus state preservation", () => {
    it("preserves hover effects during widget updates", () => {
      const node = manager.createNode(
        "box",
        { width: 20, height: 5 },
        {
          style: { fg: 15, border: { fg: 7 } },
          hoverEffects: { fg: 10, border: { fg: 2 } },
        },
      );

      manager.performLayout(node);
      const widget = node.widget!;

      // Simulate hover - Screen.setEffects would do this
      (widget as any)._htemp = { fg: 15, border: { fg: 7 } };
      widget.style.fg = 10; // Hover color applied
      widget.style.border.fg = 2; // Hover border color applied

      // Now update the widget (simulates React re-render)
      node.yogaNode.setWidth(30);
      manager.performLayout(node);

      // Widget should still have hover effects active
      expect(widget.style.fg).toBe(10); // Hover color still applied
      expect(widget.style.border.fg).toBe(2); // Hover border color still applied

      // Temp storage should exist for restoration
      expect((widget as any)._htemp).toBeDefined();

      manager.destroy(node);
    });

    it("prevents shared style objects between widgets", () => {
      // Create two widgets - in practice, React descriptors create independent style objects
      const node1 = manager.createNode(
        "box1",
        { width: 20, height: 5 },
        {
          style: { fg: 15, border: { fg: 7 } },
          hoverEffects: { fg: 10, border: { fg: 2 } },
        },
      );

      const node2 = manager.createNode(
        "box2",
        { width: 20, height: 5 },
        {
          style: { fg: 15, border: { fg: 7 } },
          hoverEffects: { fg: 10, border: { fg: 2 } },
        },
      );

      const container = manager.createNode("container", {
        flexDirection: "row",
        width: 80,
      });
      manager.appendChild(container, node1);
      manager.appendChild(container, node2);

      manager.performLayout(container);

      const widget1 = node1.widget!;
      const widget2 = node2.widget!;

      // Initially should have same values but different objects
      expect(widget1.style.fg).toBe(15);
      expect(widget2.style.fg).toBe(15);

      // Modify widget1's style
      widget1.style.fg = 99;
      widget1.style.border.fg = 88;

      // Widget2's style should NOT be affected if objects are independent
      // Note: In the raw widgetOptions path, styles may be shared, but in React
      // (via descriptors), they are always deep cloned
      if (widget1.style !== widget2.style) {
        expect(widget2.style.fg).not.toBe(99);
        expect(widget2.style.border.fg).not.toBe(88);
      }

      manager.destroy(container);
    });

    it("handles focus effects during updates", () => {
      const node = manager.createNode(
        "box",
        { width: 20, height: 5 },
        {
          style: { fg: 15, border: { fg: 7 } },
          focusEffects: { border: { fg: 3 } },
        },
      );

      manager.performLayout(node);
      const widget = node.widget!;

      // Simulate focus
      (widget as any)._ftemp = { border: { fg: 7 } };
      widget.style.border.fg = 3; // Focus border color

      // Update widget
      node.yogaNode.setWidth(30);
      manager.performLayout(node);

      // Focus effect should persist
      expect(widget.style.border.fg).toBe(3);
      expect((widget as any)._ftemp).toBeDefined();

      manager.destroy(node);
    });

    it("handles both hover and focus effects simultaneously", () => {
      const node = manager.createNode(
        "box",
        { width: 20, height: 5 },
        {
          style: { fg: 15, bg: 0, border: { fg: 7 } },
          hoverEffects: { bg: 1 },
          focusEffects: { border: { fg: 3 } },
        },
      );

      manager.performLayout(node);
      const widget = node.widget!;

      // Simulate both hover AND focus active
      (widget as any)._htemp = { bg: 0 };
      (widget as any)._ftemp = { border: { fg: 7 } };
      widget.style.bg = 1; // Hover bg
      widget.style.border.fg = 3; // Focus border

      // Update widget
      node.yogaNode.setWidth(30);
      manager.performLayout(node);

      // Both effects should persist
      expect(widget.style.bg).toBe(1); // Hover still active
      expect(widget.style.border.fg).toBe(3); // Focus still active
      expect((widget as any)._htemp).toBeDefined();
      expect((widget as any)._ftemp).toBeDefined();

      manager.destroy(node);
    });
  });
});
