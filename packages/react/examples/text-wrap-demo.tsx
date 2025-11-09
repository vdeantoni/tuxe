#!/usr/bin/env tsx
/**
 * text-wrap-demo.tsx - Example showcasing textWrap property with ink-style truncation modes
 *
 * Demonstrates:
 * - truncate-end: Truncate at end with ellipsis ("Hello W…")
 * - truncate-middle: Truncate in middle with ellipsis ("Hel…rld")
 * - truncate-start: Truncate at start with ellipsis ("…World")
 * - wrap: Traditional word wrapping (default)
 * - Backward compatibility with wrap boolean
 * - ANSI code preservation during truncation
 * - Multi-line content truncation
 *
 * Run with:
 *   tsx packages/react/examples/text-wrap-demo.tsx
 *   or
 *   node --import tsx --no-warnings text-wrap-demo.tsx
 */
import { NodeRuntime } from "@unblessed/node";
import * as React from "react";
import { Box, render, Text } from "../dist/index.js";

const App: React.FC = () => {
  const longText = "The quick brown fox jumps over the lazy dog";
  const coloredText =
    "{red-fg}The quick{/red-fg} {green-fg}brown fox{/green-fg} {blue-fg}jumps over{/blue-fg} {yellow-fg}the lazy dog{/yellow-fg}";

  return (
    <Box
      flexDirection="column"
      padding={2}
      gap={1}
      width="100%"
      height="100%"
      minHeight={40}
      minWidth={80}
    >
      {/* Title */}
      <Box border={1} borderStyle="bold" borderColor="cyan" padding={1}>
        <Text bold>textWrap Property Demo - Ink-Style Text Truncation</Text>
      </Box>

      {/* Truncate-End */}
      <Box flexDirection="column" border={1} borderColor="blue" padding={1}>
        <Text bold underline>
          truncate-end
        </Text>
        <Box marginTop={1} width={30}>
          <Text color="gray">Width: 30 characters</Text>
        </Box>
        <Box
          marginTop={1}
          width={30}
          border={1}
          borderStyle="single"
          borderColor="gray"
          padding={1}
        >
          <Text textWrap="truncate-end">{longText}</Text>
        </Box>
        <Box marginTop={1}>
          <Text dim>Truncates at end: "The quick brown…"</Text>
        </Box>
      </Box>

      {/* Truncate-Middle */}
      <Box flexDirection="column" border={1} borderColor="magenta" padding={1}>
        <Text bold underline>
          truncate-middle
        </Text>
        <Box marginTop={1} width={30}>
          <Text color="gray">Width: 30 characters</Text>
        </Box>
        <Box
          marginTop={1}
          width={30}
          border={1}
          borderStyle="single"
          borderColor="gray"
          padding={1}
        >
          <Text textWrap="truncate-middle">{longText}</Text>
        </Box>
        <Box marginTop={1}>
          <Text dim>Truncates in middle: "The quick br…azy dog"</Text>
        </Box>
      </Box>

      {/* Truncate-Start */}
      <Box flexDirection="column" border={1} borderColor="yellow" padding={1}>
        <Text bold underline>
          truncate-start
        </Text>
        <Box marginTop={1} width={30}>
          <Text color="gray">Width: 30 characters</Text>
        </Box>
        <Box
          marginTop={1}
          width={30}
          border={1}
          borderStyle="single"
          borderColor="gray"
          padding={1}
        >
          <Text textWrap="truncate-start">{longText}</Text>
        </Box>
        <Box marginTop={1}>
          <Text dim>Truncates at start: "…ps over the lazy dog"</Text>
        </Box>
      </Box>

      {/* Wrap Mode */}
      <Box flexDirection="column" border={1} borderColor="green" padding={1}>
        <Text bold underline>
          wrap (default)
        </Text>
        <Box marginTop={1} width={30}>
          <Text color="gray">Width: 30 characters</Text>
        </Box>
        <Box
          marginTop={1}
          width={30}
          border={1}
          borderStyle="single"
          borderColor="gray"
          padding={1}
        >
          <Text textWrap="wrap">{longText}</Text>
        </Box>
        <Box marginTop={1}>
          <Text dim>Wraps to multiple lines at word boundaries</Text>
        </Box>
      </Box>

      {/* ANSI Code Preservation */}
      <Box flexDirection="row" gap={1}>
        <Box flexDirection="column" border={1} borderColor="cyan" padding={1}>
          <Text bold underline>
            ANSI Code Preservation
          </Text>
          <Box marginTop={1} width={25}>
            <Text color="gray">Width: 25 chars</Text>
          </Box>
          <Box
            marginTop={1}
            width={25}
            border={1}
            borderStyle="single"
            borderColor="gray"
            padding={1}
          >
            <Text textWrap="truncate-end" tags>
              {coloredText}
            </Text>
          </Box>
          <Box marginTop={1}>
            <Text dim>Colors preserved in truncation</Text>
          </Box>
        </Box>

        {/* Multi-line Content */}
        <Box flexDirection="column" border={1} borderColor="red" padding={1}>
          <Text bold underline>
            Multi-line Content
          </Text>
          <Box marginTop={1} width={20}>
            <Text color="gray">Width: 20 chars</Text>
          </Box>
          <Box
            marginTop={1}
            width={20}
            border={1}
            borderStyle="single"
            borderColor="gray"
            padding={1}
          >
            <Text textWrap="truncate-end">
              {"First line is long\nSecond line too\nShort"}
            </Text>
          </Box>
          <Box marginTop={1}>
            <Text dim>Each line truncated independently</Text>
          </Box>
        </Box>
      </Box>

      {/* Backward Compatibility */}
      <Box flexDirection="row" gap={1}>
        <Box flexDirection="column" border={1} borderColor="white" padding={1}>
          <Text bold underline>
            Legacy wrap=true
          </Text>
          <Box marginTop={1} width={20}>
            <Text color="gray">Width: 20 chars</Text>
          </Box>
          <Box
            marginTop={1}
            width={20}
            border={1}
            borderStyle="single"
            borderColor="gray"
            padding={1}
          >
            <Text wrap={true}>{longText}</Text>
          </Box>
          <Box marginTop={1}>
            <Text dim>Still works as before</Text>
          </Box>
        </Box>

        <Box flexDirection="column" border={1} borderColor="white" padding={1}>
          <Text bold underline>
            Legacy wrap=false
          </Text>
          <Box marginTop={1} width={20}>
            <Text color="gray">Width: 20 chars</Text>
          </Box>
          <Box
            marginTop={1}
            width={20}
            border={1}
            borderStyle="single"
            borderColor="gray"
            padding={1}
          >
            <Text wrap={false}>{longText}</Text>
          </Box>
          <Box marginTop={1}>
            <Text dim>Hard truncate (no ellipsis)</Text>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box border={1} borderColor="gray" padding={1} marginTop={1}>
        <Text dim>Press 'q' or Ctrl+C to quit</Text>
      </Box>
    </Box>
  );
};

// Render
render(<App />, {
  runtime: new NodeRuntime(),
  debug: false,
});
