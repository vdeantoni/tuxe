# @unblessed/react

React renderer for unblessed with flexbox layout support.

[![npm version](https://img.shields.io/npm/v/@unblessed/react)](https://www.npmjs.com/package/@unblessed/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

> ⚠️ **ALPHA SOFTWARE / WORK IN PROGRESS** - This package is under active development. Core functionality is implemented but not all features are complete yet.

## Overview

`@unblessed/react` enables building terminal UIs using React components and JSX, with automatic flexbox layout powered by Yoga.

**Features:**

- 🎨 **React components** - Build UIs with familiar JSX syntax
- 📦 **Flexbox layout** - Automatic positioning via Yoga layout engine
- 🎯 **TypeScript first** - Full type safety
- 🌐 **Platform-agnostic** - Works in Node.js and browsers
- 🖱️ **Event handling** - onClick, onKeyPress, onSubmit, and more

## Installation

```bash
npm install @unblessed/react@alpha react
# or
pnpm add @unblessed/react@alpha react
```

**Also install a runtime:**

```bash
# For Node.js
npm install @unblessed/node@alpha

# For browser
npm install @unblessed/browser@alpha
```

**Requirements:**

- Node.js >= 22.0.0
- React ^18.0.0 or ^19.0.0

## Quick Start

```tsx
import { render, Box, Text, Spacer } from "@unblessed/react";

const App = () => (
  <Box flexDirection="column" padding={1} gap={1}>
    <Box border={1} borderStyle="single" padding={1}>
      <Text color="green" bold>
        Hello from React!
      </Text>
    </Box>

    <Box flexDirection="row" gap={2}>
      <Box width={20}>Left</Box>
      <Spacer />
      <Box width={20}>Right</Box>
    </Box>
  </Box>
);

render(<App />);
```

**Note:** The runtime (`@unblessed/node` or `@unblessed/browser`) auto-initializes when imported, so you don't need explicit initialization.

**Important:** Borders require `border={1}` (or `borderTop={1}`, etc.) so that Yoga reserves space for them. Without this, only `borderStyle` and `borderColor` won't work properly.

## Components

### Box

Container component with flexbox layout support.

```tsx
<Box
  flexDirection="row" // Layout direction
  gap={2} // Gap between children
  padding={1} // Padding
  border={1} // Enable border (required for Yoga layout)
  borderStyle="single" // Border style
  borderColor="cyan" // Border color
  width={40} // Fixed width
  flexGrow={1} // Grow to fill space
>
  {/* children */}
</Box>
```

**Flexbox Props:**

- `flexDirection`: 'row' | 'column' | 'row-reverse' | 'column-reverse'
- `justifyContent`: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'
- `alignItems`: 'flex-start' | 'center' | 'flex-end' | 'stretch'
- `flexGrow`, `flexShrink`, `flexBasis`
- `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`
- `padding`, `paddingX`, `paddingY`, `paddingTop`, etc.
- `margin`, `marginX`, `marginY`, `marginTop`, etc.
- `gap`, `rowGap`, `columnGap`

**Styling Props:**

- `borderStyle`: 'single' | 'double' | 'round' | 'bold' | 'classic'
- `borderColor`, `borderTopColor`, `borderBottomColor`, etc.
- `color` - Text color
- `backgroundColor` - Background color

### Text

Text component with styling support.

```tsx
<Text
  color="green" // Text color
  bold // Bold text
  italic // Italic text
  dim // Dim text
>
  Hello World!
</Text>
```

**Props:**

- `color`, `backgroundColor`
- `bold`, `italic`, `underline`, `strikethrough`
- `inverse`, `dim`

### Spacer

Flexible space component that expands to fill available space.

```tsx
<Box flexDirection="row">
  <Box width={20}>Left</Box>
  <Spacer /> {/* Fills remaining space */}
  <Box width={20}>Right</Box>
</Box>
```

Equivalent to `<Box flexGrow={1} />`.

### BigText

Large ASCII art text component using terminal fonts.

```tsx
<BigText color="cyan">HELLO</BigText>
```

**Props:**

- `color` - Text color
- `backgroundColor` - Background color

Automatically calculates dimensions based on font (14 rows × 8 columns per character).

### Button

Interactive button component with hover and focus effects.

```tsx
<Button
  border={1}
  borderStyle="single"
  hoverBg="blue"
  focusBg="cyan"
  padding={1}
>
  Click Me
</Button>
```

**Props:**

- All Box props (flexbox, border, colors, events, etc.)
- `hoverBg` - Background color on hover
- `focusBg` - Border color when focused
- `onClick` - Click handler
- `onPress` - Press handler (Enter key or click)
- `tabIndex` - Focus order (default: 0)
- `autoFocus` - Auto-focus on mount

**Note:** Inherits all interactive properties including borders, events, and focus management.

### Input

Text input component for user interaction.

```tsx
<Input
  border={1}
  borderStyle="single"
  borderColor="blue"
  height={3}
  autoFocus
  onSubmit={(value) => console.log("Submitted:", value)}
  onCancel={() => console.log("Cancelled")}
/>
```

**Props:**

- All Box props (flexbox, border, colors, events, etc.)
- `autoFocus` - Automatically focus on mount
- `value` - Input value
- `onSubmit` - Submit handler (Enter key)
- `onCancel` - Cancel handler (Escape key)
- `onKeyPress` - Key press handler
- `tabIndex` - Focus order (default: 0)

**Note:** Inherits all interactive properties including borders, events, and focus management.

## Examples

### Dashboard Layout

```tsx
const Dashboard = () => (
  <Box flexDirection="column" width={80} height={24}>
    {/* Header */}
    <Box height={3} border={1} borderStyle="single">
      <Text bold>Dashboard</Text>
    </Box>

    {/* Content area */}
    <Box flexDirection="row" flexGrow={1}>
      {/* Sidebar */}
      <Box width={20} border={1} borderStyle="single">
        <Text>Menu</Text>
      </Box>

      {/* Main content */}
      <Box flexGrow={1} border={1} borderStyle="single">
        <Text>Content area</Text>
      </Box>
    </Box>
  </Box>
);

render(<Dashboard />);
```

### Centered Content

```tsx
const Centered = () => (
  <Box justifyContent="center" alignItems="center" width={80} height={24}>
    <Box border={1} borderStyle="double" padding={2}>
      <Text color="cyan" bold>
        Centered!
      </Text>
    </Box>
  </Box>
);
```

### Interactive Form

```tsx
import { BigText, Box, Text, Button, Input } from "@unblessed/react";

const LoginForm = () => (
  <Box flexDirection="column" padding={2} gap={1}>
    <BigText color="cyan">LOGIN</BigText>

    <Box flexDirection="column" gap={1}>
      <Text>Username:</Text>
      <Input border={1} borderColor="blue" autoFocus />

      <Text>Password:</Text>
      <Input border={1} borderColor="blue" />

      <Button border={1} hoverBg="green" focusBg="cyan" padding={1}>
        <Text>Login</Text>
      </Button>
    </Box>
  </Box>
);
```

## Event Handling

All components support React-style event handlers that are automatically bound to unblessed widget events.

### Mouse Events

```tsx
<Box
  onClick={(data) => {
    console.log(`Clicked at ${data.x}, ${data.y}`);
  }}
  onMouseMove={(data) => {
    console.log(`Mouse moved to ${data.x}, ${data.y}`);
  }}
>
  Interactive Box
</Box>
```

**Available:**

- `onClick`, `onMouseDown`, `onMouseUp`
- `onMouseMove`, `onMouseOver`, `onMouseOut`
- `onMouseWheel`, `onWheelDown`, `onWheelUp`

### Keyboard Events

```tsx
<Box
  onKeyPress={(ch, key) => {
    if (key.name === "enter") {
      console.log("Enter pressed!");
    }
    if (key.ctrl && key.name === "c") {
      process.exit(0);
    }
  }}
>
  Press keys
</Box>
```

### Focus Events

```tsx
<Button
  onFocus={() => console.log("Button focused")}
  onBlur={() => console.log("Button blurred")}
>
  Focus me
</Button>
```

### Widget-Specific Events

**Button:**

```tsx
<Button onPress={() => console.log("Button pressed!")}>Submit</Button>
```

**Input:**

```tsx
<Input
  onSubmit={(value) => console.log("Submitted:", value)}
  onCancel={() => console.log("Cancelled")}
  onKeyPress={(ch, key) => console.log("Key:", key.name)}
/>
```

### Interactive Example

```tsx
import React, { useState } from "react";
import { render, Box, Text, Button, Input } from "@unblessed/react";

const Counter = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  return (
    <Box flexDirection="column" gap={1} padding={2}>
      <Box border={1} borderStyle="single" padding={1}>
        <Text>Count: {count}</Text>
      </Box>

      <Button
        border={1}
        borderStyle="single"
        borderColor="green"
        padding={1}
        onClick={() => setCount((c) => c + 1)}
        onPress={() => setCount((c) => c + 1)}
      >
        Increment
      </Button>

      <Input
        border={1}
        borderColor="blue"
        onSubmit={(value) => {
          setName(value);
          console.log("Name set to:", value);
        }}
      />

      {name && (
        <Box padding={1}>
          <Text>Hello, {name}!</Text>
        </Box>
      )}
    </Box>
  );
};

render(<Counter />);
```

## Architecture

@unblessed/react builds on top of:

- **@unblessed/core** - Widget library and terminal rendering
- **@unblessed/layout** - Yoga flexbox layout engine
- **react-reconciler** - React's custom renderer API

### Widget Descriptor Pattern

The implementation uses a **descriptor pattern** for type-safe widget configuration:

```typescript
// Each widget has a descriptor that encapsulates its behavior
class BoxDescriptor extends WidgetDescriptor<BoxProps> {
  get flexProps(); // Extract layout props for Yoga
  get widgetOptions(); // Extract visual/behavioral props for unblessed
  get eventHandlers(); // Extract event handlers
  createWidget(); // Create unblessed widget instance
  updateWidget(); // Update widget on re-render
}
```

**Benefits:**

- ✅ Type-safe props per widget type
- ✅ No string-based type discrimination
- ✅ Easy to extend with new widgets
- ✅ Composition via helper functions (buildBorder, buildTextStyles, etc.)

### High-Level Flow

```
React Components
    ↓
React Reconciler (creates LayoutNodes)
    ↓
LayoutManager (Yoga calculations)
    ↓
unblessed Widgets (positioned)
    ↓
Terminal Rendering
```

### Understanding the Node Types

The architecture uses several different "node" types, each with a specific responsibility:

#### 1. **YogaNode** (from `yoga-layout`)

The low-level flexbox layout engine (C++/WASM). Calculates positions and sizes based on flexbox properties.

```typescript
// Created internally - you don't use this directly
yogaNode.setWidth(100);
yogaNode.setHeight(50);
yogaNode.calculateLayout(); // Computes layout
```

#### 2. **LayoutNode** (from `@unblessed/layout`)

Wraps YogaNode with metadata, bridging React props to Yoga calculations and unblessed widgets.

```typescript
interface LayoutNode {
  type: string; // 'box', 'text', 'button', etc.
  yogaNode: YogaNode; // The Yoga layout engine
  props: FlexboxProps; // width, height, padding, gap, etc.
  widgetOptions: any; // border, colors, content, etc.
  widget?: Element; // The final unblessed widget
  eventHandlers?: Record<string, Function>; // Event handlers to bind
}
```

#### 3. **DOMNode** (from `@unblessed/react`)

Virtual DOM element used by React reconciler. Wraps LayoutNode with React-specific data.

```typescript
interface DOMNode {
  type: ElementType; // 'box', 'text', 'root'
  layoutNode: LayoutNode; // References the layout layer
  props: BoxProps; // React component props
  childNodes: AnyNode[]; // Virtual DOM children
}
```

#### 4. **Widget/Element** (from `@unblessed/core`)

The actual terminal UI widget that renders to screen. Created after Yoga calculates layout.

```typescript
// Box, Text, Button, etc.
new Box({
  top: 10, // From Yoga calculations
  left: 20,
  width: 50,
  height: 30,
  border: { type: "line" },
  content: "Hello",
});
```

### Data Flow Example

When you write:

```tsx
<Box padding={1} gap={2} borderColor="cyan" onClick={handleClick}>
  <Text>Hello</Text>
</Box>
```

Here's what happens:

```
1. React Component
   <Box padding={1} gap={2} borderColor="cyan" onClick={handleClick}>
      ↓
2. React Reconciler creates DOMNode
   DOMNode { type: 'box', props: {...}, layoutNode: LayoutNode }
      ↓
3. LayoutNode splits props
   LayoutNode {
     props: { padding: 1, gap: 2 },        → Sent to YogaNode
     widgetOptions: { borderColor: 'cyan' } → Saved for widget
     eventHandlers: { click: handleClick } → Saved for widget
     yogaNode: YogaNode
   }
      ↓
4. Yoga calculates layout
   YogaNode.calculateLayout()
   Result: { top: 0, left: 0, width: 100, height: 50 }
      ↓
5. Widget created/updated with positions and events
   Box {
     top: 0, left: 0, width: 100, height: 50,
     border: { type: 'line', fg: 6 }  // cyan converted to color code
   }
   box.on('click', handleClick)  // Event bound
      ↓
6. Rendered to terminal
```

### Why Multiple Layers?

Each layer has a specific responsibility:

| Layer          | Responsibility                                        |
| -------------- | ----------------------------------------------------- |
| **DOMNode**    | React reconciler - manages virtual DOM tree           |
| **LayoutNode** | Bridge between React props, layout engine, and events |
| **YogaNode**   | Pure flexbox calculations (no UI concerns)            |
| **Widget**     | Terminal rendering (no layout concerns)               |

This separation allows:

- React to handle component lifecycle
- Yoga to handle layout calculations
- unblessed to handle terminal rendering
- Each layer can be tested independently

## Current Status

**✅ Implemented:**

- React reconciler with full lifecycle support
- Yoga flexbox layout engine integration
- Components: Box, Text, Spacer, BigText, Button, Input
- `render()` function with unmount/rerender support
- Border styles and colors (per-side support)
- Flexbox properties (gap, padding, margin, alignment, etc.)
- Color conversion (string colors → terminal color codes)
- Focus effects (hover, focus states)
- **Event handling (onClick, onKeyPress, onSubmit, etc.)**
- **Event cleanup on update/unmount**
- **Content updates on state changes**
- **14 tests passing (4 render + 6 event + 2 content update + 2 text width tests)**

**🚧 In Progress:**

- Hooks (useInput, useApp, useFocus)
- Text wrapping and overflow handling
- Comprehensive integration tests
- Performance optimization

**📋 Planned:**

- More component wrappers (List, ListTable, ProgressBar, etc.)
- Animation support
- Context-based theming
- Comprehensive documentation and examples

## Contributing

See the main [unblessed repository](https://github.com/vdeantoni/unblessed) for contribution guidelines.

## License

MIT © [Vinicius De Antoni](https://github.com/vdeantoni)

## Related

- [@unblessed/core](../core) - Core TUI library
- [@unblessed/layout](../layout) - Flexbox layout engine
- [@unblessed/node](../node) - Node.js runtime
- [@unblessed/browser](../browser) - Browser runtime
