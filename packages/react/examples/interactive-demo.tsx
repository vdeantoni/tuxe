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
 * - useKeyboard() hook for shortcuts
 * - Theme color references
 *
 * Run with:
 *   node --import tsx --no-warnings interactive-demo.tsx
 */

import { NodeRuntime } from "@unblessed/node";
import { useState } from "react";

import {
  BigText,
  Box,
  Button,
  Input,
  render,
  Text,
  unblessedTheme,
} from "../dist/index.js";

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
    <Box
      flexDirection="column"
      gap={1}
      padding={2}
      width="100%"
      height="100%"
      minHeight={50}
      minWidth={80}
    >
      {/* Title */}
      <Box justifyContent="center" minHeight={6}>
        <BigText color="$primary">EVENTS</BigText>
      </Box>

      {/* Mouse Tracking Panel */}
      <Box
        tabIndex={0}
        flexDirection="column"
        border={1}
        borderStyle="single"
        borderColor="$semantic.border"
        padding={1}
        focus={{ bg: "blue", border: { color: "blue" } }}
        hover={{ bg: "green", border: { color: "green" } }}
        onMouseMove={(data) => setMousePos({ x: data.x, y: data.y })}
        onClick={(data) => {
          setLastClick({ x: data.x, y: data.y });
          setClickCount((c) => c + 1);
        }}
        minHeight={9}
      >
        <Text bold color="$semantic.success">
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
        borderColor="$semantic.warning"
        padding={1}
        gap={1}
        minHeight={11}
      >
        <Text bold color="$semantic.warning">
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
      <Box flexDirection="row" gap={2} minHeight={12}>
        {/* Counter Button */}
        <Box
          flexDirection="column"
          flexGrow={1}
          border={1}
          borderStyle="single"
          borderColor="$primary"
          padding={1}
          gap={1}
          minHeight={10}
        >
          <Text bold color="$primary">
            🔢 Counter
          </Text>
          <Box flexDirection="row" gap={1}>
            <Button
              width={8}
              height={3}
              border={1}
              borderColor="$semantic.error"
              hover={{ bg: "red" }}
              onPress={() => setClickCount((c) => Math.max(0, c - 1))}
              tabIndex={0}
            >
              {"{center}-{/center}"}
            </Button>
            <Box
              width={10}
              height={3}
              border={1}
              borderStyle="single"
              borderColor="$semantic.border"
              justifyContent="center"
              alignItems="center"
            >
              <Text bold>{clickCount}</Text>
            </Box>
            <Button
              width={8}
              height={3}
              border={1}
              borderColor="$semantic.success"
              hover={{ bg: "green" }}
              onPress={() => setClickCount((c) => c + 1)}
              tabIndex={1}
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
          minHeight={10}
        >
          <Text bold color="magenta">
            ⌨️ Keyboard
          </Text>
          <Text>Last Key: {lastKey || "(none)"}</Text>
          <Box
            tabIndex={2}
            height={3}
            border={1}
            borderStyle="single"
            borderColor="$semantic.border"
            hover={{ bg: "magenta" }}
            focus={{ bg: "green" }}
            onKeyPress={(ch, key) => {
              setLastKey(key.full || ch);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            {isFocused ? "🟢 Focused - Type!" : "⚪ Click to focus"}
          </Box>
        </Box>
      </Box>

      {/* Message Input Panel */}
      <Box
        flexDirection="column"
        border={1}
        borderStyle="single"
        borderColor="$semantic.info"
        padding={1}
        gap={1}
        minHeight={13}
      >
        <Text bold color="$semantic.info">
          💬 Message Board (type and press Enter)
        </Text>
        <Input
          border={1}
          borderColor="$semantic.info"
          padding={1}
          onSubmit={(value) => {
            setMessage(value || "");
          }}
          onCancel={() => setMessage("")}
          tabIndex={3}
          minHeight={5}
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
      <Box justifyContent="center" minHeight={3}>
        <Text color="$semantic.muted" dim>
          Press 'q' or Ctrl+C to exit
        </Text>
      </Box>
    </Box>
  );
};

// Render the app with unblessed theme
render(<InteractiveDemo />, {
  runtime: new NodeRuntime(),
  theme: unblessedTheme,
  debug: false,
});
