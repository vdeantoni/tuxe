/**
 * BlessedPlayground - Main orchestrator for the interactive playground
 */

import { transform } from "https://esm.sh/@babel/standalone@7.23.5";
import React from "https://esm.sh/react@18.3.1";
import * as tuiReact from "../../../../react/dist/index.js";
import * as tui from "../../../dist/index.js";

import { CodeExecutor } from "./code-executor.js";
import { JSXTransformer } from "./jsx-transformer.js";
import { TerminalManager } from "./terminal-manager.js";
import type { PlaygroundOptions } from "./types.js";

/**
 * Interactive playground for @unblessed/browser
 */
export class BlessedPlayground {
  private terminalManager: TerminalManager;
  private jsxTransformer: JSXTransformer;
  private codeExecutor: CodeExecutor | null = null;
  private runtime: any;
  private debounceDelay: number;
  private debounceTimer: number | null = null;

  constructor(terminalElement: HTMLElement, options: PlaygroundOptions = {}) {
    this.debounceDelay = options.debounceDelay ?? 300;

    // Initialize terminal manager
    this.terminalManager = new TerminalManager(terminalElement);

    // Initialize JSX transformer
    this.jsxTransformer = new JSXTransformer(transform);

    // Initialize BrowserRuntime once for the playground
    this.runtime = new tui.BrowserRuntime();

    // Set the runtime globally so Screen can access it
    const { setRuntime } = tui;
    setRuntime(this.runtime);
  }

  /**
   * Initialize the playground
   */
  init(): void {
    const terminal = this.terminalManager.init();

    // Initialize code executor with terminal
    this.codeExecutor = new CodeExecutor(terminal!, tui, tuiReact, React);
  }

  /**
   * Run user code with debouncing
   */
  debounceRun(code: string): void {
    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new debounce timer
    this.debounceTimer = setTimeout(() => {
      this.run(code);
      this.debounceTimer = null;
    }, this.debounceDelay);
  }

  /**
   * Run user code immediately
   */
  async run(code: string): Promise<void> {
    if (!this.codeExecutor) {
      throw new Error("Playground not initialized. Call init() first.");
    }

    try {
      // Clear terminal
      this.terminalManager.clear();

      // Transform code if it contains JSX
      const { code: transformedCode, isJSX } =
        this.jsxTransformer.process(code);

      // Execute the code
      await this.codeExecutor.execute(transformedCode, isJSX);
    } catch (error: any) {
      // Display error
      this.terminalManager.showError(error);
    }
  }

  /**
   * Clear the terminal and cleanup
   */
  clear(): void {
    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Cleanup executor
    if (this.codeExecutor) {
      this.codeExecutor.cleanup();
    }

    // Dispose and reinitialize terminal
    this.terminalManager.dispose();
    this.init();
  }

  /**
   * Destroy and cleanup all resources
   */
  destroy(): void {
    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Cleanup executor
    if (this.codeExecutor) {
      this.codeExecutor.cleanup();
      this.codeExecutor = null;
    }

    // Dispose terminal
    this.terminalManager.dispose();
  }
}
