# @unblessed/react Examples

Interactive examples demonstrating @unblessed/react features.

## Running Examples

From the monorepo root:

```bash
# Build packages first
pnpm build

# Run an example
cd packages/react/examples
tsx hello-react.tsx
tsx interactive-demo.tsx
tsx keyboard-game.tsx
```

## Examples

### hello-react.tsx

Basic demonstration of components and layouts:

- Box layouts with flexbox
- Border styles and colors (per-side)
- Text styling
- BigText for large ASCII text
- Button and Input components
- Gap and padding

**Features:**

- Static layout showcase
- Border color examples
- Component composition

### interactive-demo.tsx 🎮

Comprehensive interactive demo showcasing event handling:

**Panels:**

1. **Mouse Tracker** 🖱️
   - `onMouseMove` - Real-time mouse position tracking
   - `onClick` - Click counting with position
   - Visual feedback

2. **Color Picker** 🎨
   - Multiple clickable color buttons
   - `onClick` handlers on each button
   - Visual selection state (double border, background)
   - Dynamic border colors

3. **Counter** 🔢
   - Increment/decrement buttons
   - Button hover effects (`hoverBg`)
   - State management with React hooks

4. **Keyboard Input** ⌨️
   - `onKeyPress` - Capture any key
   - `onFocus`/`onBlur` - Visual focus state
   - Real-time key display

5. **Message Board** 💬
   - Text input with `onSubmit`
   - `onCancel` on Escape
   - Display submitted message with selected color
   - Ctrl+C handling

**Controls:**

- Move mouse to track position
- Click anywhere in mouse tracker
- Click color swatches to select
- Click +/- buttons for counter
- Type in any panel to see keys
- Type message and press Enter
- Press Ctrl+C to exit

### keyboard-game.tsx 🎮

A simple game demonstrating keyboard event handling:

**Gameplay:**

- Move player (🎮) around grid
- Collect stars (⭐) for points
- Real-time score tracking
- New stars spawn after collection

**Controls:**

- **Arrow Keys** or **WASD** - Move player
- **R** - Reset game
- **Q** or **Ctrl+C** - Quit

**Event Features:**

- `onKeyPress` for movement and controls
- `useState` for game state
- `useEffect` for collision detection
- Dynamic message updates
- Real-time grid rendering

## Development

## Creating New Examples

Template:

```tsx
import { NodeRuntime } from "@unblessed/node";
import { render, Box, Text } from "../src/index.js";

const MyExample = () => {
  return (
    <Box padding={2}>
      <Text>Hello World!</Text>
    </Box>
  );
};

const screen = new Screen({
  smartCSR: true,
  fullUnicode: true,
  mouse: true, // Enable if using mouse events
  keys: true, // Enable if using keyboard events
});

screen.key(["C-c"], () => process.exit(0));

render(<MyExample />, { runtime: new NodeRuntime() });
screen.render();
```

## Tips

- Enable `mouse: true` in Screen options for click/hover events
- Enable `keys: true` for keyboard event handling
- Always provide a way to exit (Ctrl+C handler)
- Use React state hooks for interactive UIs
- Check `screen.width` and `screen.height` for responsive layouts

## Troubleshooting

**Events not firing:**

- Verify `mouse: true` in Screen options for mouse events
- Verify `keys: true` in Screen options for keyboard events
- Check that widgets have `mouse: true` and `keys: true` (automatically set in widget-sync)

**Display issues:**

- Run `screen.render()` after the initial render
- Use `smartCSR: true` for better performance
- Set explicit width/height on root Box for consistent layouts
