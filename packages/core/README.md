# @unblessed/core

Platform-agnostic TUI (Text User Interface) core library with runtime dependency injection.

> ⚠️ **ALPHA SOFTWARE** - This package is part of the unblessed alpha release. API may change between alpha versions.

## Overview

`@unblessed/core` is a modern, TypeScript-based terminal UI library that provides a complete set of widgets and terminal control primitives. Unlike traditional terminal libraries, it's designed to be truly platform-agnostic through runtime dependency injection, allowing it to run in Node.js, browsers, and other JavaScript environments.

## Features

- **Platform-Agnostic**: Zero runtime dependencies on Node.js - works anywhere JavaScript runs
- **Runtime Injection**: Platform-specific implementations (fs, process, etc.) provided via dependency injection
- **Rich Widget Library**: Full set of interactive widgets (boxes, lists, forms, inputs, etc.)
- **Terminal Control**: Complete terminal manipulation (colors, cursor, mouse, keyboard)
- **Text Wrapping**: Ink-style truncation modes (end, middle, start) with ANSI code preservation
- **Image Rendering**: PNG and GIF support with terminal rendering
- **TypeScript**: Full type safety with comprehensive type definitions
- **Terminfo Support**: Complete terminfo/termcap database integration

## Installation

**Important**: `@unblessed/core` is a low-level package. Most users should install a platform adapter instead:

```bash
# For Node.js applications (recommended)
npm install @unblessed/node@alpha

# For browser applications (recommended)
npm install @unblessed/browser@alpha

# For backward compatibility with blessed
npm install @unblessed/blessed@alpha
```

Only install `@unblessed/core` directly if you're creating a custom runtime adapter.

## Quick Start

### Node.js (Recommended)

Use `@unblessed/node` which includes the runtime and auto-initializes:

```typescript
import { Screen, Box } from "@unblessed/node";

// No initialization needed - runtime auto-initializes on import!

const screen = new Screen({
  smartCSR: true,
  title: "My App",
});

const box = new Box({
  parent: screen,
  top: "center",
  left: "center",
  width: "50%",
  height: "50%",
  content: "Hello {bold}world{/bold}!",
  tags: true,
  border: { type: "line" },
  style: {
    fg: "white",
    bg: "blue",
    border: { fg: "#f0f0f0" },
  },
});

screen.key(["escape", "q", "C-c"], () => {
  process.exit(0);
});

screen.render();
```

### Browser (Recommended)

Use `@unblessed/browser` with xterm.js:

```typescript
import { Terminal } from "xterm";
import { Screen, Box } from "@unblessed/browser";

// Runtime auto-initializes on import

const term = new Terminal();
term.open(document.getElementById("terminal")!);

const screen = new Screen({ terminal: term });

const box = new Box({
  parent: screen,
  content: "Hello from browser!",
});

screen.render();
```

### Using @unblessed/core Directly (Advanced)

Only needed if you're building a custom runtime adapter:

```typescript
import { Screen, Box } from "@unblessed/core";
import { setRuntime } from "@unblessed/core";

// Provide your custom runtime implementation
const myRuntime = {
  fs: {
    /* your fs implementation */
  },
  process: {
    /* your process implementation */
  },
  // ... other required APIs
};

setRuntime(myRuntime);

// Now you can use widgets
const screen = new Screen();
```

## Architecture

### Runtime Dependency Injection

`@unblessed/core` uses a runtime abstraction layer that defines interfaces for all platform-specific operations:

```typescript
interface Runtime {
  fs: FileSystemAPI; // File system operations
  path: PathAPI; // Path manipulation
  process: ProcessAPI; // Process information and I/O
  childProcess: ChildProcessAPI;
  tty: TtyAPI;
  buffer: BufferAPI;
  stream: StreamAPI;
  // ... and more
}
```

Platform adapters (`@unblessed/node`, `@unblessed/browser`) provide concrete implementations:

```typescript
// @unblessed/node provides Node.js implementations
import { createNodeRuntime } from "@unblessed/node";
createNodeRuntime();

// @unblessed/browser provides browser polyfills
import { createBrowserRuntime } from "@unblessed/browser";
createBrowserRuntime();
```

## Available Widgets

### Layout Widgets

- `Screen` - Root container and terminal manager
- `Box` - Basic rectangular container
- `Layout` - Grid-based layout manager
- `Line` - Horizontal or vertical line

### Interactive Widgets

- `List` - Scrollable list with selection
- `Form` - Form container with input handling
- `Input` / `Textbox` - Text input field
- `Textarea` - Multi-line text editor
- `Button` - Clickable button
- `Checkbox` - Toggle checkbox
- `RadioSet` / `RadioButton` - Radio button group
- `ProgressBar` - Progress indicator
- `FileManager` - File browser

### Display Widgets

- `Text` - Static text display
- `Log` - Scrollable log viewer
- `Table` - Data table with rows/columns
- `ListTable` - List displayed as table
- `Listbar` - Horizontal list/menu bar
- `Image` / `ANSIImage` / `OverlayImage` - Image rendering
- `Video` - Video playback
- `BigText` - Large ASCII art text
- `Terminal` - Embedded terminal emulator

### Specialized Widgets

- `ScrollableBox` - Box with scrolling
- `ScrollableText` - Text with scrolling
- `Message` / `Question` / `Loading` - Dialog helpers

## Core APIs

### Program API

Low-level terminal control:

```typescript
import { Program } from "@unblessed/core";

const program = new Program({
  input: process.stdin,
  output: process.stdout,
});

program.alternateBuffer();
program.hideCursor();
program.enableMouse();
program.clear();
```

### Terminfo/Termcap

Terminal capability database:

```typescript
import { Tput } from "@unblessed/core";

const tput = new Tput({
  terminal: "xterm-256color",
  extended: true,
});

// Use terminal capabilities
tput.cup(10, 20); // Move cursor to row 10, col 20
tput.setaf(4); // Set foreground color to blue
```

### Colors

Color conversion and manipulation:

```typescript
import { colors } from "@unblessed/core";

// Convert hex to terminal color
const color = colors.convert("#ff0000"); // Returns closest terminal color

// Reduce color to palette
const reduced = colors.reduce(196, 256); // Reduce to 256-color palette
```

## Styling

Widgets support comprehensive styling:

```typescript
const box = new Box({
  style: {
    fg: "white", // Foreground color
    bg: "blue", // Background color
    bold: true,
    underline: false,
    border: {
      fg: "yellow",
      bg: "black",
    },
    scrollbar: {
      bg: "blue",
    },
    focus: {
      border: {
        fg: "green",
      },
    },
    hover: {
      bg: "cyan",
    },
  },
});
```

Colors can be:

- Named colors: `'red'`, `'blue'`, `'green'`
- Hex colors: `'#ff0000'`, `'#00ff00'`
- RGB: `'rgb(255, 0, 0)'`
- 256-color indices: `196`

## Events

All widgets emit events:

```typescript
box.on("click", (data) => {
  console.log("Clicked at", data.x, data.y);
});

box.on("keypress", (ch, key) => {
  if (key.name === "enter") {
    // Handle enter key
  }
});

box.on("focus", () => {
  box.style.border.fg = "green";
  screen.render();
});

box.on("blur", () => {
  box.style.border.fg = "white";
  screen.render();
});
```

## Mouse Support

Enable mouse tracking:

```typescript
const screen = new Screen({
  mouse: true,
  sendFocus: true,
});

box.on("mouse", (data) => {
  if (data.action === "mousedown") {
    console.log("Mouse down at", data.x, data.y);
  }
});
```

## Keyboard Handling

```typescript
// Global key handling
screen.key(["escape", "q", "C-c"], (ch, key) => {
  process.exit(0);
});

// Widget-specific keys
box.key("enter", () => {
  console.log("Enter pressed on box");
});

// Key combinations
screen.key("C-s", () => {
  // Ctrl+S
});

screen.key("M-x", () => {
  // Alt+X
});
```

## Advanced Features

### Image Rendering

```typescript
import { ANSIImage } from "@unblessed/core";

const image = new ANSIImage({
  parent: screen,
  file: "./image.png",
  width: "50%",
  height: "50%",
  ascii: true, // Use ASCII characters for better fidelity
});
```

### Forms and Input Validation

```typescript
import { Form, Textbox, Button } from "@unblessed/core";

const form = new Form({
  parent: screen,
});

const username = new Textbox({
  parent: form,
  name: "username",
  label: "Username:",
  inputOnFocus: true,
});

const password = new Textbox({
  parent: form,
  name: "password",
  label: "Password:",
  censor: true,
});

const submit = new Button({
  parent: form,
  content: "Submit",
  top: 10,
});

submit.on("press", () => {
  form.submit();
});

form.on("submit", (data) => {
  console.log("Form data:", data);
  // { username: '...', password: '...' }
});
```

### Scrollable Content

```typescript
import { ScrollableBox } from "@unblessed/core";

const box = new ScrollableBox({
  parent: screen,
  scrollable: true,
  alwaysScroll: true,
  scrollbar: {
    ch: " ",
    style: {
      bg: "blue",
    },
  },
  keys: true, // Enable vi-style scrolling keys
  mouse: true, // Enable mouse wheel scrolling
});

// Programmatic scrolling
box.scroll(10); // Scroll down 10 lines
box.scroll(-5); // Scroll up 5 lines
box.scrollTo(0); // Scroll to top
box.setScrollPerc(50); // Scroll to 50%
```

### Text Wrapping and Truncation

Control how text is wrapped or truncated when it exceeds the widget width:

```typescript
import { Box, Text } from "@unblessed/core";

// Traditional word wrapping (default)
const wrappedBox = new Box({
  parent: screen,
  width: 20,
  wrap: true, // Default behavior
  content: "This is a very long line that will wrap to multiple lines",
});

// Truncate at end with ellipsis (ink-style)
const truncatedEnd = new Box({
  parent: screen,
  width: 20,
  textWrap: "truncate-end",
  content: "This is a very long line",
});
// Result: "This is a very lo…"

// Truncate in middle with ellipsis
const truncatedMiddle = new Box({
  parent: screen,
  width: 20,
  textWrap: "truncate-middle",
  content: "This is a very long line",
});
// Result: "This is a…ng line"

// Truncate at start with ellipsis
const truncatedStart = new Box({
  parent: screen,
  width: 20,
  textWrap: "truncate-start",
  content: "This is a very long line",
});
// Result: "…a very long line"

// ANSI codes are preserved during truncation
const coloredText = new Box({
  parent: screen,
  width: 15,
  textWrap: "truncate-end",
  content: "{red-fg}Hello{/red-fg} {green-fg}World{/green-fg}",
  tags: true,
});
// Colors are preserved in truncated output
```

**Features:**
- Four modes: `wrap`, `truncate-end`, `truncate-middle`, `truncate-start`
- ANSI escape code preservation during truncation
- Wide character support (CJK, emoji)
- LRU caching for performance (1000 entry default)
- Backward compatible (legacy `wrap: boolean` still works)

**Text Utilities:**
```typescript
import { truncateText } from "@unblessed/core/lib/text-utils";

// Use truncation utilities directly
const truncated = truncateText("Long text", 10, {
  position: "end",
  ellipsis: "…",
  fullUnicode: true,
});
```

### Terminal Emulation

```typescript
import { Terminal } from "@unblessed/core";

const terminal = new Terminal({
  parent: screen,
  shell: "/bin/bash",
  args: [],
  env: process.env,
  cwd: process.cwd(),
  width: "100%",
  height: "100%",
});

terminal.on("exit", (code) => {
  console.log("Terminal exited with code", code);
});
```

## API Documentation

For complete API documentation, see the TypeScript definitions included with the package. The library is fully typed with comprehensive JSDoc comments.

## Package Structure

```
@unblessed/core/
├── dist/
│   ├── index.js          # Main entry point
│   ├── runtime.js        # Runtime interfaces
│   └── widgets/          # Widget exports
├── data/
│   ├── terminfo/         # Terminfo database
│   └── fonts/            # Terminal fonts
└── types/                # TypeScript definitions
```

## Testing

The library includes comprehensive tests covering:

- All widget types and behaviors
- Terminal control primitives
- Color conversion and manipulation
- Image rendering (PNG/GIF)
- Keyboard and mouse event handling
- Layout and positioning
- Scrolling and content management

## Browser Support

When using `@unblessed/browser`, the library provides browser-compatible implementations using:

- Canvas rendering for terminal output
- WebSocket connections for PTY
- IndexedDB for file system operations
- Browser APIs for all platform operations

## Related Packages

- [`@unblessed/node`](../node) - Node.js runtime adapter
- [`@unblessed/browser`](../browser) - Browser runtime adapter with xterm.js integration
- [`@unblessed/blessed`](../blessed) - Backward-compatible blessed API

## Acknowledgments

This project is a modern TypeScript rewrite and enhancement of [blessed](https://github.com/chjj/blessed), the excellent terminal UI library by Christopher Jeffrey. While the architecture has been completely redesigned for platform-agnosticism, the core widget concepts and terminal handling draw inspiration from blessed's proven design.

## License

MIT

## Contributing

Contributions are welcome! Please see the [main repository](https://github.com/vdeantoni/unblessed) for contribution guidelines.

## Support

- GitHub Issues: https://github.com/vdeantoni/unblessed/issues
- Documentation: https://github.com/vdeantoni/unblessed/tree/master/packages/core
