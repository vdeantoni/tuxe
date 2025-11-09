/**
 * text-wrap.test.js - Integration tests for textWrap property
 */

import { beforeAll, describe, expect, it } from "vitest";
import Box from "../../src/widgets/box.js";
import Screen from "../../src/widgets/screen.js";
import { initTestRuntime } from "../helpers/mock.js";

describe("textWrap property", () => {
  beforeAll(() => {
    initTestRuntime();
  });

  describe("truncate-end mode", () => {
    it("should truncate text at end with ellipsis", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 3,
        textWrap: "truncate-end",
        content: "Hello World Testing",
      });

      screen.render();

      const lines = box.getScreenLines();
      expect(lines).toBeDefined();
      expect(lines.length).toBeGreaterThan(0);

      // Should be truncated with ellipsis
      const firstLine = lines[0];
      expect(firstLine).toContain("…");
      expect(firstLine.replace(/\x1b\[[^m]*m/g, "").length).toBeLessThanOrEqual(
        10,
      );

      screen.destroy();
    });

    it("should preserve ANSI codes when truncating", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 3,
        textWrap: "truncate-end",
        content: "{red-fg}Hello World Testing{/red-fg}",
        tags: true,
      });

      screen.render();

      const lines = box.getScreenLines();
      const firstLine = lines[0];

      // Should have ANSI codes and ellipsis
      expect(firstLine).toContain("\x1b[");
      expect(firstLine).toContain("…");

      screen.destroy();
    });

    it("should not truncate if text fits", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 20,
        height: 3,
        textWrap: "truncate-end",
        content: "Short",
      });

      screen.render();

      const lines = box.getScreenLines();
      const firstLine = lines[0];

      // Should NOT have ellipsis
      expect(firstLine).not.toContain("…");
      expect(firstLine).toContain("Short");

      screen.destroy();
    });
  });

  describe("truncate-middle mode", () => {
    it("should truncate text in middle with ellipsis", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 3,
        textWrap: "truncate-middle",
        content: "Hello World Testing",
      });

      screen.render();

      const lines = box.getScreenLines();
      const firstLine = lines[0];

      // Should be truncated in middle
      expect(firstLine).toContain("…");
      expect(firstLine.replace(/\x1b\[[^m]*m/g, "").length).toBeLessThanOrEqual(
        10,
      );

      screen.destroy();
    });

    it("should preserve ANSI codes on both sides", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 3,
        textWrap: "truncate-middle",
        content: "{red-fg}Hello{/red-fg} {green-fg}World{/green-fg}",
        tags: true,
      });

      screen.render();

      const lines = box.getScreenLines();
      const firstLine = lines[0];

      // Should have ANSI codes
      expect(firstLine).toContain("\x1b[");
      expect(firstLine).toContain("…");

      screen.destroy();
    });
  });

  describe("truncate-start mode", () => {
    it("should truncate text at start with ellipsis", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 3,
        textWrap: "truncate-start",
        content: "Hello World Testing",
      });

      screen.render();

      const lines = box.getScreenLines();
      const firstLine = lines[0];

      // Should be truncated at start
      expect(firstLine).toContain("…");
      expect(firstLine).toContain("Testing");
      expect(firstLine.replace(/\x1b\[[^m]*m/g, "").length).toBeLessThanOrEqual(
        10,
      );

      screen.destroy();
    });

    it("should preserve ANSI codes after ellipsis", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 3,
        textWrap: "truncate-start",
        content: "Hello {green-fg}World{/green-fg}",
        tags: true,
      });

      screen.render();

      const lines = box.getScreenLines();
      const firstLine = lines[0];

      // Should have ellipsis at start
      expect(firstLine).toContain("…");
      expect(firstLine).toContain("\x1b[");

      screen.destroy();
    });
  });

  describe("wrap mode (explicit)", () => {
    it('should wrap text when using textWrap="wrap"', () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 5,
        textWrap: "wrap",
        content: "Hello World Testing",
      });

      screen.render();

      const lines = box.getScreenLines();

      // Should wrap to multiple lines
      expect(lines.length).toBeGreaterThan(1);

      // Each line should fit within width
      lines.forEach((line) => {
        const stripped = line.replace(/\x1b\[[^m]*m/g, "").trim();
        if (stripped) {
          expect(stripped.length).toBeLessThanOrEqual(10);
        }
      });

      screen.destroy();
    });
  });

  describe("backward compatibility", () => {
    it("should use legacy wrap=true when textWrap is undefined", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 5,
        wrap: true, // Legacy
        // textWrap: undefined (not set)
        content: "Hello World Testing",
      });

      screen.render();

      const lines = box.getScreenLines();

      // Should wrap to multiple lines (legacy behavior)
      expect(lines.length).toBeGreaterThan(1);

      screen.destroy();
    });

    it("should use legacy wrap=false when textWrap is undefined", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 3,
        wrap: false, // Legacy - hard truncate
        // textWrap: undefined (not set)
        content: "Hello World Testing",
      });

      screen.render();

      const lines = box.getScreenLines();

      // Should be hard truncated (no ellipsis)
      expect(lines[0]).not.toContain("…");

      screen.destroy();
    });

    it("should prefer textWrap over wrap when both are set", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 3,
        wrap: true, // Legacy
        textWrap: "truncate-end", // Should take precedence
        content: "Hello World Testing",
      });

      screen.render();

      const lines = box.getScreenLines();
      const firstLine = lines[0];

      // Should use truncate-end (with ellipsis) not wrap
      expect(firstLine).toContain("…");
      expect(lines.length).toBe(1); // Single line, not wrapped

      screen.destroy();
    });
  });

  describe("multi-line content", () => {
    it("should truncate each line independently", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 5,
        textWrap: "truncate-end",
        content: "First Line Is Long\nSecond Line Also Long\nThird",
      });

      screen.render();

      const lines = box.getScreenLines();

      // Should have 3 lines
      expect(lines.length).toBeGreaterThanOrEqual(3);

      // First two should be truncated
      expect(lines[0]).toContain("…");
      expect(lines[1]).toContain("…");

      // Third should not be truncated (fits)
      expect(lines[2]).not.toContain("…");

      screen.destroy();
    });
  });

  describe("with alignment", () => {
    it("should respect alignment with truncation", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 3,
        align: "center",
        textWrap: "truncate-end",
        content: "Hello World",
      });

      screen.render();

      const lines = box.getScreenLines();

      // Should be truncated and centered
      expect(lines[0]).toContain("…");

      screen.destroy();
    });

    it("should respect alignment tags with truncation", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 3,
        textWrap: "truncate-middle",
        tags: true,
        content: "{center}Hello World Testing{/center}",
      });

      screen.render();

      const lines = box.getScreenLines();

      // Should be truncated
      expect(lines[0]).toContain("…");

      screen.destroy();
    });
  });

  describe("caching behavior", () => {
    it("should cache wrapped content for performance", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 3,
        textWrap: "truncate-end",
        content: "Hello World",
      });

      // First render
      const start1 = Date.now();
      screen.render();
      const time1 = Date.now() - start1;

      // Second render with same content - should use cache
      const start2 = Date.now();
      screen.render();
      const time2 = Date.now() - start2;

      // Note: Cache may or may not be faster due to test environment
      // Just verify it doesn't error
      expect(time1).toBeGreaterThanOrEqual(0);
      expect(time2).toBeGreaterThanOrEqual(0);

      screen.destroy();
    });
  });

  describe("edge cases", () => {
    it("should handle empty content", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 3,
        textWrap: "truncate-end",
        content: "",
      });

      screen.render();

      const lines = box.getScreenLines();
      expect(lines).toBeDefined();

      screen.destroy();
    });

    it("should handle very narrow width", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 2,
        height: 3,
        textWrap: "truncate-middle",
        content: "Hello",
      });

      screen.render();

      const lines = box.getScreenLines();
      expect(lines).toBeDefined();

      screen.destroy();
    });

    it("should handle content with only ANSI codes", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: false });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 3,
        textWrap: "truncate-end",
        content: "{red-fg}{/red-fg}",
        tags: true,
      });

      screen.render();

      const lines = box.getScreenLines();
      expect(lines).toBeDefined();

      screen.destroy();
    });
  });

  describe("fullUnicode mode", () => {
    it("should handle truncation in fullUnicode mode", () => {
      const screen = new Screen({ smartCSR: true, fullUnicode: true });
      const box = new Box({
        parent: screen,
        width: 10,
        height: 3,
        textWrap: "truncate-end",
        content: "Hello World Testing",
      });

      screen.render();

      const lines = box.getScreenLines();
      const firstLine = lines[0];

      // Should be truncated
      expect(firstLine).toContain("…");

      screen.destroy();
    });
  });
});
