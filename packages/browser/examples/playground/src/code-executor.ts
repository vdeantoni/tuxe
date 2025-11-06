/**
 * CodeExecutor - Executes user code with proper sandboxing and cleanup
 */

import type { Terminal } from "xterm";
import type { TimerTracker } from "./types.js";

/**
 * Manages code execution in a sandboxed environment
 */
export class CodeExecutor {
  private intervals: number[] = [];
  private timeouts: number[] = [];
  private screen: any = null;
  private terminal: Terminal;
  private tui: any;
  private tuiReact: any;
  private React: any;
  private runtime: any;

  constructor(
    terminal: Terminal,
    tui: any,
    tuiReact: any,
    React: any,
    runtime: any,
  ) {
    this.terminal = terminal;
    this.tui = tui;
    this.tuiReact = tuiReact;
    this.React = React;
    this.runtime = runtime;
  }

  /**
   * Execute user code
   */
  async execute(code: string, isJSX: boolean): Promise<void> {
    console.log("[CodeExecutor] Starting execution, isJSX:", isJSX);

    // Clear previous timers
    this.clearTimers();

    // Destroy previous screen if exists
    if (this.screen) {
      try {
        this.screen.destroy();
      } catch (e) {
        // Ignore errors during cleanup
      }
      this.screen = null;
    }

    // Create new screen for the playground
    console.log("[CodeExecutor] Creating screen...");
    this.screen = new this.tui.Screen({
      terminal: this.terminal,
    });
    console.log("[CodeExecutor] Screen created:", !!this.screen);

    // Handle quit key
    this.screen.key(["escape", "q", "C-c"], () => {
      this.cleanup();
    });

    // Create wrapped timer functions for tracking
    const wrappedSetInterval = (fn: Function, delay: number): number => {
      const id = setInterval(fn, delay);
      this.intervals.push(id);
      return id;
    };

    const wrappedSetTimeout = (fn: Function, delay: number): number => {
      const id = setTimeout(fn, delay);
      this.timeouts.push(id);
      return id;
    };

    if (isJSX) {
      console.log("[CodeExecutor] Executing in React mode");
      await this.executeReactMode(code, wrappedSetInterval, wrappedSetTimeout);
    } else {
      console.log("[CodeExecutor] Executing in classic mode");
      await this.executeClassicMode(
        code,
        wrappedSetInterval,
        wrappedSetTimeout,
      );
    }

    console.log("[CodeExecutor] Execution completed");
  }

  /**
   * Execute code in React mode (JSX)
   */
  private async executeReactMode(
    code: string,
    wrappedSetInterval: Function,
    wrappedSetTimeout: Function,
  ): Promise<void> {
    console.log("[CodeExecutor] executeReactMode: Starting");

    // Merge tui with React components for convenience
    const tuiWithReact = {
      ...this.tui,
      ...this.tuiReact,
    };
    console.log("[CodeExecutor] executeReactMode: Merged tui with React");

    // Create a function with access to React and tui
    console.log("[CodeExecutor] executeReactMode: Creating user function");
    const userFunction = new Function(
      "React",
      "tui",
      "screen",
      "runtime",
      "setInterval",
      "setTimeout",
      "clearInterval",
      "clearTimeout",
      code,
    );

    // Execute user code
    console.log("[CodeExecutor] executeReactMode: Executing user function");
    await userFunction(
      this.React,
      tuiWithReact,
      this.screen,
      this.runtime,
      wrappedSetInterval,
      wrappedSetTimeout,
      clearInterval,
      clearTimeout,
    );
    console.log("[CodeExecutor] executeReactMode: User function executed");
  }

  /**
   * Execute code in classic mode (no React)
   */
  private async executeClassicMode(
    code: string,
    wrappedSetInterval: Function,
    wrappedSetTimeout: Function,
  ): Promise<void> {
    const userFunction = new Function(
      "tui",
      "screen",
      "setInterval",
      "setTimeout",
      "clearInterval",
      "clearTimeout",
      code,
    );

    await userFunction(
      this.tui,
      this.screen,
      wrappedSetInterval,
      wrappedSetTimeout,
      clearInterval,
      clearTimeout,
    );
  }

  /**
   * Clear all tracked timers
   */
  clearTimers(): void {
    this.intervals.forEach((id) => clearInterval(id));
    this.timeouts.forEach((id) => clearTimeout(id));
    this.intervals = [];
    this.timeouts = [];
  }

  /**
   * Cleanup screen and timers
   */
  cleanup(): void {
    this.clearTimers();

    if (this.screen) {
      try {
        this.screen.destroy();
      } catch (e) {
        // Ignore errors
      }
      this.screen = null;
    }
  }

  /**
   * Get timer tracker for debugging
   */
  getTimerTracker(): TimerTracker {
    return {
      intervals: [...this.intervals],
      timeouts: [...this.timeouts],
    };
  }
}
