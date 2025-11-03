#!/usr/bin/env tsx
/**
 * hello-react.tsx - Example showcasing @unblessed/react with various border styles
 *
 * Run with:
 *   tsx packages/react/examples/hello-react.tsx
 */
import * as React from "react";
import { Screen } from "../../node/dist/index.js";
import { BigText, Box, render, Text } from "../dist/index.js";

// WORKAROUND: In development, ensure runtime is initialized for source files too
import { initCore } from "@unblessed/core";
import { NodeRuntime } from "@unblessed/node";
import { List, Spacer } from "../src";
import { Button } from "../src/components/Button";
import { Input } from "../src/components/Input";
initCore(new NodeRuntime());

const screen = new Screen({ smartCSR: true, fullUnicode: true });

const App = () => (
  <Box flexDirection="column" padding={1} gap={1}>
    <BigText char="U">UNBLESSED</BigText>

    <Box flexDirection="column" padding={1} border={1} gap={1}>
      <Input borderColor="blue" />
      <Text>@unblessed/react Border Showcase</Text>
    </Box>

    {/* Border styles */}
    <Box flexDirection="row" gap={1}>
      <Box
        width={18}
        border={1}
        padding={1}
        hover={{ border: { color: "green", dim: true } }}
      >
        <Text>Single</Text>
      </Box>
      <Box
        width={18}
        border={1}
        borderStyle="double"
        borderColor="yellow"
        padding={1}
      >
        <Text>Double</Text>
      </Box>
      <Box
        width={18}
        border={1}
        borderStyle="round"
        borderColor="magenta"
        padding={1}
      >
        <Text>Round</Text>
      </Box>
      <Box
        width={18}
        border={1}
        borderStyle="bold"
        borderColor="red"
        padding={1}
      >
        <Text>Bold</Text>
      </Box>
    </Box>

    {/* Per-side border colors */}
    <Box flexDirection="row" gap={1}>
      <Box
        flexGrow={1}
        border={1}
        borderTopColor="red"
        borderBottomColor="blue"
        borderLeftColor="green"
        borderRightColor="yellow"
        padding={1}
      >
        <Text>Per-side colors (R/B/G/Y)</Text>
      </Box>

      <Box
        width={25}
        border={1}
        borderStyle="single"
        borderColor="cyan"
        borderDimColor={true}
        padding={1}
      >
        <Text>Dim border</Text>
      </Box>
    </Box>

    {/* Flexbox with borders and spacer */}
    <Box flexDirection="row" gap={1}>
      <Box width={20} border={1} borderColor="blue">
        <Button hover={{ bg: "red" }} focus={{ border: { fg: "yellow" } }}>
          {"{center}LEFT{/center}"}
        </Button>
      </Box>

      <Spacer />

      <Box
        width={30}
        flexDirection="column"
        border={1}
        borderStyle="single"
        borderColor="blue"
      >
        <List label="This is rad!" items={["Oi", "Tchau"]} height={10} />
      </Box>
    </Box>

    {/* Nested borders */}
    <Box border={1} borderStyle="double" borderColor="magenta" padding={1}>
      <Box border={1} borderStyle="single" borderColor="cyan" padding={1}>
        <Text>Nested borders (double outer, single inner)</Text>
      </Box>
    </Box>

    {/* Footer */}
    <Spacer />
    <Box
      border={1}
      borderStyle="single"
      borderBottomColor="gray"
      borderRightColor="gray"
      padding={1}
    >
      <Text color="gray" dim>
        Press q or Ctrl+C to quit
      </Text>
    </Box>
  </Box>
);

const instance = render(<App />, { screen, debug: true });

screen.key(["q", "C-c"], () => {
  console.log("React", React.version);
  instance.unmount();
  process.exit(0);
});
