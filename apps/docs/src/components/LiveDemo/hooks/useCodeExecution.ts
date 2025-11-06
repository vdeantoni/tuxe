import { transform } from "@babel/standalone";
import { useCallback, useRef, useState } from "react";
import type { Terminal } from "xterm";

type ErrorDisplayFn = (
  errorType: "Syntax Error" | "Runtime Error",
  error: Error,
  code?: string,
) => Promise<void>;

export function useCodeExecution(
  terminal: React.RefObject<Terminal | null>,
  screen: React.RefObject<any>,
  onError: ErrorDisplayFn,
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const lastExecutedCodeRef = useRef<string>("");

  const cleanup = useCallback(() => {
    if (screen.current) {
      screen.current.destroy();
      screen.current = null;
    }
  }, [screen]);

  const runDemo = useCallback(
    async (code: string) => {
      try {
        cleanup();

        if (!terminal.current) return;

        terminal.current.clear();

        // Check if code contains JSX/React
        const isReact =
          code.includes("@unblessed/react") ||
          code.includes("<Box") ||
          code.includes("<Text") ||
          code.includes("React.createElement");

        const tui = await import("@unblessed/browser");

        // Initialize BrowserRuntime and set it globally
        const runtime = new tui.BrowserRuntime();
        tui.setRuntime(runtime);

        screen.current = new tui.Screen({ terminal: terminal.current });

        // For React code, we need to handle it differently
        if (isReact) {
          // Import React and @unblessed/react
          const ReactModule = await import("react");
          // React can be default export or named exports
          const React = ReactModule.default || ReactModule;

          console.log("[LiveDemo] React module:", ReactModule);
          console.log("[LiveDemo] React:", React);
          console.log("[LiveDemo] React.useState:", React?.useState);
          console.log("[LiveDemo] React.createElement:", React?.createElement);
          console.log(
            "[LiveDemo] React internals:",
            React?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
          );

          // CRITICAL: Set React globally so react-reconciler can find it
          if (typeof window !== "undefined") {
            (window as any).React = React;
          }
          (globalThis as any).React = React;

          const tuiReact = await import("@unblessed/react");
          console.log("[LiveDemo] tuiReact:", Object.keys(tuiReact));

          // Transform JSX to JavaScript
          const transformed = transform(code, {
            presets: ["react"],
            filename: "demo.tsx",
          }).code;

          console.log(
            "[LiveDemo] Transformed code (first 300 chars):",
            transformed.substring(0, 300),
          );

          // Remove imports from transformed code
          const cleanCode = transformed
            .replace(/import\s*\{[^}]+\}\s*from\s*['"][^'"]+['"];?\s*/gs, "")
            .replace(/import\s+\w+\s+from\s*['"][^'"]+['"];?\s*/gs, "")
            .replace(/export\s+const\s+/g, "const ")
            .replace(/export\s+/g, "")
            .replace(/export\s*\{[^}]+\}\s*;?\s*/g, "");

          // Build scope with React, tui, tuiReact, runtime, and screen
          const scope = {
            React,
            useState: React.useState,
            useEffect: React.useEffect,
            useCallback: React.useCallback,
            useMemo: React.useMemo,
            useRef: React.useRef,
            tui: { ...tui, ...tuiReact },
            screen: screen.current,
            runtime,
            BrowserRuntime: tui.BrowserRuntime,
            render: tuiReact.render,
            Box: tuiReact.Box,
            Text: tuiReact.Text,
            Button: tuiReact.Button,
            Input: tuiReact.Input,
            List: tuiReact.List,
            Spacer: tuiReact.Spacer,
          };

          console.log("[LiveDemo] Scope keys:", Object.keys(scope));
          console.log("[LiveDemo] Scope.React:", scope.React);

          const paramNames = Object.keys(scope);
          const paramValues = Object.values(scope);

          console.log("[LiveDemo] Creating function with params:", paramNames);
          const userFunction = new Function(...paramNames, cleanCode);

          console.log("[LiveDemo] Executing user function...");
          await userFunction(...paramValues);
          console.log("[LiveDemo] User function executed");
        } else {
          // Classic mode - parse imports and create scope
          const importMatches = code.matchAll(
            /import\s*\{([^}]+)\}\s*from\s*['"]@unblessed\/browser['"]/gs,
          );
          const importedNames = new Set<string>();

          for (const match of importMatches) {
            const names = match[1]
              .split(",")
              .map((n) => n.trim())
              .filter((n) => n.length > 0);
            names.forEach((name) => importedNames.add(name));
          }

          // Remove import and export statements
          let cleanCode = code
            .replace(/import\s*\{[^}]+\}\s*from\s*['"][^'"]+['"];?\s*/gs, "")
            .replace(/export\s+const\s+/g, "const ")
            .replace(/export\s+/g, "")
            .replace(/export\s*\{[^}]+\}\s*;?\s*/g, "");

          // Build scope with screen and individual imports
          const scope: Record<string, any> = {
            screen: screen.current,
            tui,
          };

          // Add each imported widget to scope
          for (const name of importedNames) {
            if (name in tui) {
              scope[name] = (tui as any)[name];
            }
          }

          // Create function with dynamic scope
          const paramNames = Object.keys(scope);
          const paramValues = Object.values(scope);
          const userFunction = new Function(...paramNames, cleanCode);

          await userFunction(...paramValues);

          // Render the screen
          screen.current.render();
        }

        setIsLoaded(true);
      } catch (error: any) {
        console.error("Runtime error:", error);

        // Display runtime error in terminal with unblessed UI
        await onError("Runtime Error", error);
      }
    },
    [cleanup, terminal, screen, onError],
  );

  return { runDemo, isLoaded, setIsLoaded, lastExecutedCodeRef, cleanup };
}
