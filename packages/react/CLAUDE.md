# Claude Context for @unblessed/react

This document provides architectural context and development guidelines for the `@unblessed/react` package.

## Overview

`@unblessed/react` is a **React renderer** for unblessed that enables building terminal UIs using JSX and React components, with automatic flexbox layouts powered by Yoga.

**Purpose:** Provide a modern, declarative API for building terminal UIs with React

**Status:** 🚀 **Alpha** - Core functionality complete, event handling implemented

## What This Package Does

Enables writing terminal UIs like this:

```tsx
import { Screen } from "@unblessed/node";
import { render, Box, Text, Button } from "@unblessed/react";

const screen = new Screen();

const App = () => {
  const [count, setCount] = React.useState(0);

  return (
    <Box flexDirection="column" gap={2}>
      <Box borderStyle="single" borderColor="cyan" padding={1}>
        <Text>Count: {count}</Text>
      </Box>
      <Button
        borderStyle="single"
        borderColor="green"
        padding={1}
        onClick={() => setCount((c) => c + 1)}
      >
        Click me!
      </Button>
    </Box>
  );
};

render(<App />, { screen });
```

Instead of imperative blessed-style code.

## Architecture

```
React Components (<Box>, <Text>)
    ↓
React Reconciler (creates/updates LayoutNodes)
    ↓
@unblessed/layout (Yoga calculations)
    ↓
unblessed widgets (positioned)
    ↓
Terminal rendering
```

### Key Components

**1. reconciler.ts** - React reconciler configuration

- Handles React component lifecycle (create, update, delete)
- Creates LayoutNodes via LayoutManager
- Triggers layout calculation on commit

**2. dom.ts** - Virtual DOM

- DOMNode wraps LayoutNode with React metadata
- TextNode for text content
- Tree manipulation (appendChild, removeChild, etc.)

**3. render.ts** - Main render() function

- Creates Screen and LayoutManager
- Mounts React tree
- Returns instance with unmount/rerender methods

**4. Components**

- Box.tsx - Container with flexbox props and event handlers
- Text.tsx - Text with styling
- Spacer.tsx - flexGrow={1} shorthand
- Button.tsx - Interactive button with hover/focus effects
- Input.tsx - Text input with submit/cancel events
- BigText.tsx - Large ASCII art text

## Event Handling

### Overview

All React components support event handling through React-style props (onClick, onFocus, etc.) that are automatically bound to unblessed widget events.

### Supported Events

**Mouse Events:**

- `onClick` → `click`
- `onMouseDown` → `mousedown`
- `onMouseUp` → `mouseup`
- `onMouseMove` → `mousemove`
- `onMouseOver` → `mouseover`
- `onMouseOut` → `mouseout`
- `onMouseWheel` → `mousewheel`

**Keyboard Events:**

- `onKeyPress` → `keypress`

**Focus Events:**

- `onFocus` → `focus`
- `onBlur` → `blur`

**Widget-Specific Events:**

- `onPress` → `press` (Button)
- `onSubmit` → `submit` (Input/Textarea)
- `onCancel` → `cancel` (Input/Textarea)

### Implementation

**1. Props Extraction (reconciler.ts)**

Event props are extracted and converted to unblessed event names:

```typescript
function propsToEventHandlers(props: Props): EventHandlers {
  const handlers: EventHandlers = {};
  if (props.onClick) handlers.click = props.onClick;
  if (props.onKeyPress) handlers.keypress = props.onKeyPress;
  // ... etc
  return handlers;
}
```

**2. Event Storage (LayoutNode)**

Handlers are stored on the LayoutNode:

```typescript
interface LayoutNode {
  eventHandlers?: Record<string, Function>;
  _boundHandlers?: Record<string, Function>; // For cleanup
  // ...
}
```

**3. Binding (widget-sync.ts)**

Events are bound when widgets are created/updated:

```typescript
function bindEventHandlers(
  widget: Element,
  handlers: Record<string, Function>,
) {
  for (const [event, handler] of Object.entries(handlers)) {
    widget.on(event, handler);
  }
}
```

**4. Cleanup**

Old handlers are unbound before binding new ones:

```typescript
function unbindEventHandlers(
  widget: Element,
  handlers: Record<string, Function>,
) {
  for (const [event, handler] of Object.entries(handlers)) {
    widget.removeListener(event, handler);
  }
}
```

### Usage Examples

**Click Handler:**

```tsx
<Box onClick={(data) => console.log("Clicked at", data.x, data.y)}>
  Click me
</Box>
```

**Keyboard Handler:**

```tsx
<Box
  onKeyPress={(ch, key) => {
    if (key.name === "enter") handleSubmit();
  }}
>
  Press Enter
</Box>
```

**Button Component:**

```tsx
<Button onPress={() => console.log("Pressed!")}>Submit</Button>
```

**Input Component:**

```tsx
<Input
  onSubmit={(value) => console.log("Submitted:", value)}
  onCancel={() => console.log("Cancelled")}
/>
```

### JSX Element Names

To avoid conflicts with HTML elements, custom element names are used:

- `<tbutton>` - Button (avoids HTML `<button>`)
- `<textinput>` - Input (avoids HTML `<input>`)

Components (`<Button>`, `<Input>`) internally use these custom elements.

## Critical Learnings

### Border Color Handling

**Problem:** unblessed expects border colors as numbers, React uses strings.

**Solution:** Convert color names to numbers using `colors.convert()`:

```typescript
// In reconciler.ts
import { colors } from "@unblessed/core";

// Convert border colors
if (props.borderColor) {
  border.fg = colors.convert(props.borderColor as string); // "cyan" → 6
}
```

**Border property mapping:**

- React prop → unblessed Border interface
- `borderTopColor` → `topColor` (NOT `borderTopColor`)
- `borderBottomColor` → `bottomColor`
- `borderLeftColor` → `leftColor`
- `borderRightColor` → `rightColor`
- `borderDimColor` → `dim` (NOT `borderDim`)
- `borderTopDim` → `topDim`

### style.border.fg Initialization

**Problem:** Border color not showing even when `border.fg` was set correctly.

**Cause:** unblessed copies `border.fg` to `style.border.fg` during initialization, but only if `style.border` is an object.

**Solution:** Pre-populate `style.border.fg` ourselves:

```typescript
// In propsToWidgetOptions()
if (widgetOptions.border) {
  widgetOptions.style = widgetOptions.style || {};
  widgetOptions.style.border = widgetOptions.style.border || {};

  // Copy border.fg to style.border.fg (where unblessed reads it from)
  if (widgetOptions.border.fg !== undefined) {
    widgetOptions.style.border.fg = widgetOptions.border.fg;
  }
}
```

### Coordinate System

**Critical Decision:** Use **absolute coordinates** from Yoga, not relative.

```typescript
// ✅ Correct
const widget = new Box({
  top: yogaLayout.top,    // Absolute
  left: yogaLayout.left,
  ...
});
parentWidget.append(widget);  // append() handles absolute coords

// ❌ Wrong
const widget = new Box({
  top: yogaTop - parentTop - parentBorder - parentPadding,  // Don't do this
  ...
});
```

**Why:** When using `widget.append()`, unblessed handles coordinate translation automatically. We tried converting to relative coordinates (subtracting parent position, border, padding) but it broke - absolute coordinates work.

### Text Color vs Border Color Conflict

**Problem:** Setting `style.fg` on Box widgets conflicts with border color initialization.

**Cause:** unblessed skips copying `border.fg` to `style.border.fg` if `style` already exists.

**Solution:** Only set `style.fg/bg` for Text widgets, not Box widgets:

```typescript
// In widget-sync.ts
if (!isTextWidget && widgetOpts.style) {
  delete widgetOpts.style.fg; // Remove text colors from Box widgets
  delete widgetOpts.style.bg;
}
```

Box widgets should only have border colors in `style.border.*`, not text colors in `style.*`.

### Text Content Concatenation

**Problem:** `<Text>X: {value}</Text>` creates multiple #text children, and calling `setContent()` for each one overwrites previous content.

**Solution:** Collect all #text children, concatenate their content, then call `setContent()` once:

```typescript
// In syncWidgetWithYoga(), after syncing all children:
if (node.children.length > 0) {
  const allTextNodes = node.children.every((c) => c.type === "#text");

  if (allTextNodes) {
    const fullContent = node.children
      .map((c) => c.widgetOptions?.content || "")
      .join("");

    node.widget.setContent(fullContent);
  }
}
```

This ensures "X: " + "42" → "X: 42" instead of just "42".

## Package Structure

```
packages/react/
├── src/
│   ├── index.ts              # Main exports
│   ├── types.ts              # TypeScript definitions (including EventHandlers)
│   ├── jsx.d.ts              # JSX element declarations
│   ├── dom.ts                # Virtual DOM (wraps LayoutNode)
│   ├── reconciler.ts         # React reconciler config + event extraction
│   ├── render.ts             # render() function
│   └── components/
│       ├── Box.tsx           # Box component
│       ├── Text.tsx          # Text component
│       ├── Spacer.tsx        # Spacer component
│       ├── Button.tsx        # Button component (with events)
│       ├── Input.tsx         # Input component (with events)
│       └── BigText.tsx       # BigText component
├── __tests__/
│   ├── setup.ts              # Test setup
│   ├── render.test.tsx       # Basic rendering tests (4 tests)
│   └── events.test.tsx       # Event handling tests (6 tests)
├── examples/
│   └── hello-react.tsx       # Example app
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

## How Props Flow

**React → Flexbox → Yoga:**

```tsx
<Box padding={1} border={1} borderColor="cyan">
```

**Reconciler splits props:**

```typescript
// flexboxProps (for Yoga layout)
{
  padding: 1,
  border: 1  // Tells Yoga to reserve space
}

// widgetOptions (for unblessed widget)
{
  border: {
    type: "line",
    style: "single",
    fg: 6  // Cyan converted to number
  },
  style: {
    border: { fg: 6 }  // Pre-populate for unblessed
  }
}
```

**LayoutManager:**

- Creates LayoutNode with flexbox props
- Stores widgetOptions for later

**Yoga calculates layout:**

- Accounts for border (1 char) in positioning

**widget-sync.ts:**

- Creates widget with Yoga coordinates + widgetOptions
- Spreads widgetOptions into widget constructor

## Current State

**✅ Working:**

- React reconciler integration
- Box, Text, Spacer, BigText, Button, Input components
- Flexbox layout (flexGrow, justifyContent, gap, etc.)
- Border styles and colors (per-side support)
- Absolute positioning from Yoga
- **Event handling (onClick, onKeyPress, onSubmit, etc.)**
- **Event cleanup on update/unmount**
- **Handler rebinding on prop changes**
- **Content updates on state changes (text concatenation)**
- 12 tests passing (4 render + 6 event + 2 content update tests)

**📋 TODO:**

- Text wrapping support
- Yoga measure function for text
- Hooks (useInput, useApp, useFocus)
- More component wrappers (List, ListTable, ProgressBar, Checkbox, RadioButton, etc.)
- Comprehensive integration tests
- Performance optimization

## Testing

**Current tests (10):**

**Render tests (4):**

- Basic rendering without crashing
- Box component rendering
- Flexbox layout with flexGrow
- Spacer component

**Event tests (6):**

- onClick handler binding
- onKeyPress handler binding
- onPress handler binding (Button)
- onSubmit handler binding (Input)
- Handler updates (rebinding on prop change)
- Cleanup on unmount

**Content update tests (2):**

- Text content updates on state changes
- Multiple text widgets update independently

**To run:**

```bash
pnpm --filter @unblessed/react test
```

**Example to run:**

```bash
cd packages/react/examples
node --import tsx --no-warnings interactive-demo.tsx
node --import tsx --no-warnings keyboard-game.tsx
```

## Development Tips

### Running Examples in Development

Due to monorepo dual-package issues (source vs dist), examples need explicit runtime init:

```tsx
// WORKAROUND: In development
import { initCore } from "@unblessed/core";
import { NodeRuntime } from "@unblessed/node";
initCore(new NodeRuntime());
```

This won't be needed in production when packages are installed from npm.

### Debug Mode

Enable debug logging:

```tsx
render(<App />, {
  screen,
  debug: true, // Logs layout calculations
});
```

And in LayoutManager:

```tsx
const manager = new LayoutManager({ screen, debug: true });
```

### Border Props Checklist

When adding border support, remember:

1. ✅ Convert color strings to numbers (`colors.convert()`)
2. ✅ Map to correct Border interface names (`topColor` not `borderTopColor`)
3. ✅ Set `style.border.fg` explicitly (don't rely on unblessed copying)
4. ✅ Tell Yoga about border (`border: 1` in flexbox props)
5. ✅ Don't set `style.fg` on Box widgets (conflicts with border colors)

## Future Work

### Phase 1: Hooks ⚠️ **Next Priority**

- useInput hook for keyboard
- useApp hook for lifecycle
- useFocus hook for Tab navigation

### Phase 2: Text Rendering

- Implement text wrapping
- Add Yoga measure function for text
- Support multi-line text

### Phase 3: More Components

- List component wrapper
- ListTable component wrapper
- ProgressBar component
- Checkbox component
- RadioButton/RadioSet components
- Form component
- FileManager component

## Summary

**@unblessed/react** brings React's declarative component model to terminal UIs. It integrates React's reconciler with @unblessed/layout's Yoga engine and unblessed's rendering capabilities.

**Key insights:**

- The reconciler manages LayoutNodes, not widgets directly
- LayoutManager handles Yoga calculations and widget synchronization
- Event props are extracted and bound to unblessed EventEmitter
- Custom JSX elements avoid conflicts with HTML elements

**Status:** Core functionality complete with event handling. Ready for hooks and additional components.
