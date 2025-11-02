/**
 * interactive-demo.tsx - Interactive demo showcasing event handling
 *
 * Demonstrates:
 * - Mouse events (click, move, hover)
 * - Keyboard events
 * - Button interactions
 * - Input handling
 * - State management
 * - Visual feedback
 */

import { NodeRuntime, Screen } from "@unblessed/node";
import React, { useState } from "react";

// WORKAROUND: In development, ensure runtime is initialized for source files too
import { initCore } from "@unblessed/core";
import { BigText, Box, Button, Input, render, Text } from "../src/index.js";

initCore(new NodeRuntime());

const InteractiveDemo = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lastClick, setLastClick] = useState({ x: 0, y: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [selectedColor, setSelectedColor] = useState("blue");
  const [message, setMessage] = useState("");
  const [lastKey, setLastKey] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Color palette
  const colors = ["red", "green", "blue", "yellow", "magenta", "cyan"];

  return (
    <Box flexDirection="column" gap={1}>
      {/* Title */}
      <Box justifyContent="center">
        <BigText color="cyan">EVENTS</BigText>
      </Box>

      {/* Mouse Tracking Panel */}
      <Box
        flexDirection="column"
        border={1}
        borderStyle="single"
        borderColor="green"
        padding={1}
        onMouseMove={(data) => setMousePos({ x: data.x, y: data.y })}
        onClick={(data) => {
          setLastClick({ x: data.x, y: data.y });
          setClickCount((c) => c + 1);
        }}
      >
        <Text bold color="green">
          🖱️ Mouse Tracker (move mouse & click here)
        </Text>
        <Text>
          Position: ({mousePos.x}, {mousePos.y})
        </Text>
        <Text>
          Last Click: ({lastClick.x}, {lastClick.y})
        </Text>
        <Text>Click Count: {clickCount}</Text>
      </Box>

      {/* Color Picker Panel */}
      <Box
        flexDirection="column"
        border={1}
        borderStyle="single"
        borderColor="yellow"
        padding={1}
        gap={1}
      >
        <Text bold color="yellow">
          🎨 Color Picker (click to select)
        </Text>
        <Box flexDirection="row" gap={1}>
          {colors.map((color) => (
            <Box
              key={color}
              width={8}
              height={3}
              border={1}
              borderStyle={selectedColor === color ? "double" : "single"}
              borderColor={color}
              backgroundColor={selectedColor === color ? color : undefined}
              onClick={() => setSelectedColor(color)}
            >
              <Text>{color === selectedColor ? "✓" : " "}</Text>
            </Box>
          ))}
        </Box>
        <Text>Selected: {selectedColor}</Text>
      </Box>

      {/* Interactive Buttons Panel */}
      <Box flexDirection="row" gap={2}>
        {/* Counter Button */}
        <Box
          flexDirection="column"
          flexGrow={1}
          border={1}
          borderStyle="single"
          borderColor="blue"
          padding={1}
          gap={1}
        >
          <Text bold color="blue">
            🔢 Counter
          </Text>
          <Box flexDirection="row" gap={1}>
            <Button
              width={8}
              height={3}
              border={1}
              borderColor="red"
              hoverBg="red"
              onPress={() => setClickCount((c) => Math.max(0, c - 1))}
            >
              {"{center}-{/center}"}
            </Button>
            <Box
              width={10}
              height={3}
              border={1}
              borderStyle="single"
              justifyContent="center"
              alignItems="center"
            >
              <Text bold>{clickCount}</Text>
            </Box>
            <Button
              width={8}
              height={3}
              border={1}
              borderColor="green"
              hoverBg="green"
              onPress={() => setClickCount((c) => c + 1)}
            >
              {"{center}+{/center}"}
            </Button>
          </Box>
        </Box>

        {/* Keyboard Input Panel */}
        <Box
          flexDirection="column"
          flexGrow={1}
          border={1}
          borderStyle="single"
          borderColor="magenta"
          padding={1}
          gap={1}
        >
          <Text bold color="magenta">
            ⌨️ Keyboard
          </Text>
          <Text>Last Key: {lastKey || "(none)"}</Text>
          <Box
            tabIndex={0}
            height={3}
            border={1}
            borderStyle="single"
            borderColor="white"
            onKeyPress={(ch, key) => {
              setLastKey(key.full || ch);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            <Text>
              {isFocused ? "🟢 Focused - Type!" : "⚪ Click to focus"}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Message Input Panel */}
      <Box
        flexDirection="column"
        border={1}
        borderStyle="single"
        borderColor="cyan"
        padding={1}
        gap={1}
      >
        <Text bold color="cyan">
          💬 Message Board (type and press Enter)
        </Text>
        <Input
          border={1}
          borderColor="cyan"
          autoFocus
          onSubmit={(value) => {
            setMessage(value || "");
          }}
          onCancel={() => setMessage("")}
          onKeyPress={(ch, key) => {
            if (key.ctrl && key.name === "c") {
              process.exit(0);
            }
          }}
        />
        {message && (
          <Box
            border={1}
            borderStyle="single"
            borderColor={selectedColor}
            padding={1}
          >
            <Text color={selectedColor} bold>
              {message}
            </Text>
          </Box>
        )}
      </Box>

      {/* Footer with instructions */}
      <Box justifyContent="center">
        <Text dim>Press Ctrl+C to exit</Text>
      </Box>
    </Box>
  );
};

// Create screen
const screen = new Screen({
  smartCSR: true,
  fullUnicode: true,
  mouse: true,
  keys: true,
});

// Handle Ctrl+C
screen.key(["C-c"], () => {
  console.log("React", React.version);
  process.exit(0);
});

// Render the app
render(<InteractiveDemo />, { screen, debug: false });

// Initial render
screen.render();
