/**
 * keyboard-game.tsx - Simple keyboard-driven game demo
 *
 * A fun demonstration of keyboard event handling with real-time state updates.
 * Use arrow keys to move a player around and collect stars!
 */

import { NodeRuntime, Screen } from "@unblessed/node";
import React, { useEffect, useState } from "react";
import { BigText, Box, render, Text } from "../src/index.js";

const GRID_WIDTH = 20;
const GRID_HEIGHT = 10;

const KeyboardGame = () => {
  const [playerPos, setPlayerPos] = useState({ x: 10, y: 5 });
  const [stars, setStars] = useState([
    { x: 5, y: 3 },
    { x: 15, y: 7 },
    { x: 8, y: 2 },
  ]);
  const [score, setScore] = useState(0);
  const [lastKey, setLastKey] = useState("");
  const [gameMessage, setGameMessage] = useState("Use arrow keys to move!");

  // Check for star collection
  useEffect(() => {
    const collected = stars.findIndex(
      (star) => star.x === playerPos.x && star.y === playerPos.y,
    );
    if (collected !== -1) {
      setScore((s) => s + 1);
      setGameMessage("⭐ Star collected! +1 point");

      // Remove collected star and spawn new one
      const newStars = [...stars];
      newStars.splice(collected, 1);
      newStars.push({
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT),
      });
      setStars(newStars);

      // Clear message after delay
      setTimeout(() => setGameMessage("Keep collecting stars!"), 1000);
    }
  }, [playerPos, stars]);

  // Render the game grid
  const renderGrid = () => {
    const rows = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      let row = "";
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (x === playerPos.x && y === playerPos.y) {
          row += "🎮"; // Player
        } else if (stars.some((s) => s.x === x && s.y === y)) {
          row += "⭐"; // Star
        } else {
          row += " ·"; // Empty space
        }
      }
      rows.push(row);
    }
    return rows.join("\n");
  };

  return (
    <Box flexDirection="column" gap={1}>
      {/* Title */}
      <Box justifyContent="center">
        <BigText color="yellow">STAR COLLECTOR</BigText>
      </Box>

      {/* Score Panel */}
      <Box flexDirection="row" gap={2} justifyContent="center">
        <Box border={1} borderStyle="single" borderColor="green" padding={1}>
          <Text color="green" bold>
            Score: {score}
          </Text>
        </Box>
        <Box border={1} borderStyle="single" borderColor="cyan" padding={1}>
          <Text color="cyan">Stars: {stars.length}</Text>
        </Box>
      </Box>

      {/* Game Grid */}
      <Box
        tabIndex={0}
        flexGrow={1}
        border={1}
        borderStyle="double"
        borderColor="blue"
        padding={1}
        onKeyPress={(ch, key) => {
          setLastKey(key.name);

          // Arrow key movement
          if (key.name === "up" && playerPos.y > 0) {
            setPlayerPos((p) => ({ ...p, y: p.y - 1 }));
            setGameMessage("Moving up...");
          } else if (key.name === "down" && playerPos.y < GRID_HEIGHT - 1) {
            setPlayerPos((p) => ({ ...p, y: p.y + 1 }));
            setGameMessage("Moving down...");
          } else if (key.name === "left" && playerPos.x > 0) {
            setPlayerPos((p) => ({ ...p, x: p.x - 1 }));
            setGameMessage("Moving left...");
          } else if (key.name === "right" && playerPos.x < GRID_WIDTH - 1) {
            setPlayerPos((p) => ({ ...p, x: p.x + 1 }));
            setGameMessage("Moving right...");
          }

          // WASD movement
          if (key.name === "w" && playerPos.y > 0) {
            setPlayerPos((p) => ({ ...p, y: p.y - 1 }));
          } else if (key.name === "s" && playerPos.y < GRID_HEIGHT - 1) {
            setPlayerPos((p) => ({ ...p, y: p.y + 1 }));
          } else if (key.name === "a" && playerPos.x > 0) {
            setPlayerPos((p) => ({ ...p, x: p.x - 1 }));
          } else if (key.name === "d" && playerPos.x < GRID_WIDTH - 1) {
            setPlayerPos((p) => ({ ...p, x: p.x + 1 }));
          }

          // Reset
          if (key.name === "r") {
            setPlayerPos({ x: 10, y: 5 });
            setScore(0);
            setGameMessage("Game reset!");
          }

          // Quit
          if (key.name === "q" || (key.ctrl && key.name === "c")) {
            process.exit(0);
          }
        }}
      >
        <Text>{renderGrid()}</Text>
      </Box>

      {/* Status Panel */}
      <Box border={1} borderStyle="single" borderColor="magenta" padding={1}>
        <Text color="magenta">{gameMessage}</Text>
      </Box>

      {/* Instructions */}
      <Box
        flexDirection="column"
        border={1}
        borderStyle="single"
        borderColor="white"
        padding={1}
      >
        <Text bold>Controls:</Text>
        <Text>Arrow Keys / WASD - Move player 🎮</Text>
        <Text>R - Reset game</Text>
        <Text>Q / Ctrl+C - Quit</Text>
        <Text dim>Last Key: {lastKey}</Text>
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
screen.key(["C-c", "q"], () => {
  console.log("React", React.version);
  process.exit(0);
});

// Render the app
render(<KeyboardGame />, { runtime: new NodeRuntime() });

// Initial render
screen.render();
