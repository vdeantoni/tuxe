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

  constructor(terminal: Terminal, tui: any, tuiReact: any, React: any) {
    this.terminal = terminal;
    this.tui = tui;
    this.tuiReact = tuiReact;
    this.React = React;
  }

  /**
   * Execute user code
   */
  async execute(code: string, isJSX: boolean): Promise<void> {
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
    this.screen = new this.tui.Screen({
      terminal: this.terminal,
    });

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
      await this.executeReactMode(code, wrappedSetInterval, wrappedSetTimeout);
    } else {
      await this.executeClassicMode(
        code,
        wrappedSetInterval,
        wrappedSetTimeout,
      );
    }
  }

  /**
   * Execute code in React mode (JSX)
   */
  private async executeReactMode(
    code: string,
    wrappedSetInterval: Function,
    wrappedSetTimeout: Function,
  ): Promise<void> {
    // Merge tui with React components for convenience
    const tuiWithReact = {
      ...this.tui,
      ...this.tuiReact,
    };

    // Destructure React hooks explicitly
    const {
      useState,
      useEffect,
      useCallback,
      useMemo,
      useRef,
      useContext,
      useReducer,
      useLayoutEffect,
      useImperativeHandle,
      useDebugValue,
    } = this.React;

    // Create a function with access to all React hooks and tui
    const userFunction = new Function(
      "React",
      "tui",
      "screen",
      "setInterval",
      "setTimeout",
      "clearInterval",
      "clearTimeout",
      // React hooks as individual parameters
      "useState",
      "useEffect",
      "useCallback",
      "useMemo",
      "useRef",
      "useContext",
      "useReducer",
      "useLayoutEffect",
      "useImperativeHandle",
      "useDebugValue",
      code,
    );

    // Execute with all hooks available
    await userFunction(
      this.React,
      tuiWithReact,
      this.screen,
      wrappedSetInterval,
      wrappedSetTimeout,
      clearInterval,
      clearTimeout,
      // Pass hooks explicitly
      useState,
      useEffect,
      useCallback,
      useMemo,
      useRef,
      useContext,
      useReducer,
      useLayoutEffect,
      useImperativeHandle,
      useDebugValue,
    );
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
