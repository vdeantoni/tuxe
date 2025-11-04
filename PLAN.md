# React Support for unblessed - Implementation Plan

## Project Overview

**Goal**: Create `@unblessed/react` - a React renderer for unblessed that provides React components with Flexbox layout (via Yoga), working in both Node.js and browser environments.

**Inspiration**: Ink (React renderer for CLI) + unblessed's existing widget system

**Package**: `packages/react/` - new package parallel to core/node/browser

## Context & Background

### Why React for unblessed?

1. **Declarative UI**: React's component model is more intuitive than imperative widget APIs
2. **Flexbox Layout**: Modern layout system (Yoga) vs traditional terminal positioning
3. **Component Reusability**: Build reusable UI components
4. **Ecosystem**: Leverage React hooks, context, and patterns
5. **Developer Experience**: Familiar API for React developers

### How It Works

```
React Components → react-reconciler → Virtual DOM (Yoga nodes) → Layout Calculation → unblessed Widgets → Terminal Rendering
```

**Key Technologies**:
- `yoga-layout`: Facebook's Flexbox layout engine
- `react-reconciler`: React's renderer API
- `string-width`: ANSI-aware text width measurement

### Architecture Decisions

#### 1. Hybrid Layout API

Components support BOTH Flexbox and traditional positioning:

```tsx
// Flexbox layout (uses Yoga) - when any flex prop is present
<Box flexDirection="row" justifyContent="center" gap={2}>
  <Text>Flex child</Text>
</Box>

// Traditional positioning (uses unblessed positioning) - when no flex props
<Box top={5} left={10} width={20} height={3}>
  <Text>Positioned box</Text>
</Box>
```

**Detection Logic**: If component has any Flexbox props → use Yoga layout, otherwise → use traditional unblessed positioning.

#### 2. Widget Interoperability

React components ultimately render to unblessed widgets:

```tsx
<Box> → new Box({ top: <from Yoga>, left: <from Yoga>, width: <from Yoga> })
<Text> → new Text({ content: "...", fg: "...", bold: true })
```

**Later**: Create wrapper components for existing widgets:
```tsx
<List items={items} /> → wraps unblessed List widget
<Form> → wraps unblessed Form widget
```

#### 3. Border Props

Support both Ink-style and unblessed-style APIs:

```tsx
// Ink-style (converted internally to unblessed Border)
<Box borderStyle="single" borderColor="cyan" borderDimColor={true} />

// unblessed-style (passed through)
<Box border={{ type: 'line', fg: 'cyan', borderDim: true }} />
```

**Required Core Enhancements**:
- Add per-side border colors: `borderTopColor`, `borderBottomColor`, `borderLeftColor`, `borderRightColor`
- Add dim border support: `borderDim`, `borderTopDim`, `borderBottomDim`, `borderLeftDim`, `borderRightDim`

#### 4. Text Wrapping Strategy

**Approach**: Port Ink's text wrapping (Option A - wrap during Yoga measurement)

Yoga's measure function asks: "How big is this text with width X?"
Response: Wrap text to width X, return actual dimensions (width, height)

```tsx
yogaNode.setMeasureFunc((width) => {
  const wrappedText = wrapText(text, width, wrapMode);
  const lines = wrappedText.split('\n');
  return {
    width: Math.max(...lines.map(line => stringWidth(line))),
    height: lines.length
  };
});
```

**Why**: Accurate layout calculations. Yoga needs correct dimensions to position elements properly.

**Implementation**: Port `wrap-text.ts` and `measure-text.ts` from Ink.

## Package Structure

```
packages/react/
├── src/
│   ├── index.ts                 # Main exports (render, Box, Text, Spacer, hooks)
│   ├── render.tsx               # render(<App />) function
│   ├── reconciler.ts            # React reconciler configuration
│   ├── dom.ts                   # Virtual DOM (Yoga nodes + metadata)
│   ├── styles.ts                # Apply styles to Yoga nodes
│   ├── measure-text.ts          # Text measurement for Yoga (ANSI-aware)
│   ├── wrap-text.ts             # Text wrapping logic (port from Ink)
│   ├── components/
│   │   ├── Box.tsx             # Flexbox container component
│   │   ├── Text.tsx            # Text rendering component
│   │   └── Spacer.tsx          # Flexible space component
│   ├── hooks/
│   │   ├── useInput.ts         # Keyboard input hook (future)
│   │   ├── useFocus.ts         # Focus management (future)
│   │   └── useApp.ts           # App lifecycle (future)
│   └── types/
│       └── index.ts            # TypeScript types
├── package.json
├── tsconfig.json
├── tsup.config.ts              # Build configuration
└── README.md
```

### Dependencies

**Bundled** (in package.json dependencies):
- `yoga-layout` - Flexbox layout engine
- `react-reconciler` - React renderer API
- `string-width` - ANSI-aware string width

**Peer** (in package.json peerDependencies):
- `react` (^18.0.0)
- `@unblessed/core` (workspace:^)
- Runtime: `@unblessed/node` OR `@unblessed/browser` (workspace:^)

## Implementation Phases

### Phase 1: Core Enhancements + Foundation (3-4 days)

#### A. Enhance @unblessed/core (2 days)

**File**: `packages/core/src/types/common.ts`
- Update `Border` interface:
  ```ts
  export interface Border {
    // ... existing props
    // New: Per-side colors
    borderTopColor?: string;
    borderBottomColor?: string;
    borderLeftColor?: string;
    borderRightColor?: string;
    // New: Dim border
    borderDim?: boolean;
    borderTopDim?: boolean;
    borderBottomDim?: boolean;
    borderLeftDim?: boolean;
    borderRightDim?: boolean;
  }
  ```

**File**: `packages/core/src/widgets/element.ts`
- Update border rendering to support per-side colors
- Implement dim border (50% opacity via color blending or chalk.dim)

**File**: `packages/core/src/widgets/spacer.ts` (NEW)
- Create Spacer widget:
  ```ts
  export class Spacer extends Box {
    constructor(options: BoxOptions = {}) {
      super({
        ...options,
        // Spacer grows to fill available space
        flexGrow: options.flexGrow ?? 1,
      });
      this.type = 'spacer';
    }
  }
  ```

**Tests**:
- `packages/core/__tests__/widgets/spacer.test.js`
- Update border tests for new features

**Deliverable**: ✅ Enhanced Border interface, Spacer widget, tests passing

#### B. Create @unblessed/react Package (1-2 days)

**Tasks**:
1. Create directory structure: `packages/react/`
2. Set up `package.json`:
   ```json
   {
     "name": "@unblessed/react",
     "version": "1.0.0-alpha.0",
     "type": "module",
     "dependencies": {
       "yoga-layout": "^3.1.0",
       "react-reconciler": "^0.29.0",
       "string-width": "^7.0.0"
     },
     "peerDependencies": {
       "react": "^18.0.0",
       "@unblessed/core": "workspace:^"
     }
   }
   ```
3. Set up `tsconfig.json` (extend from root)
4. Set up `tsup.config.ts` (ESM + CJS + DTS)
5. Create basic `src/index.ts` with placeholder exports
6. Add to monorepo workspace

**Deliverable**: ✅ Package builds successfully with `pnpm --filter @unblessed/react build`

---

### Phase 2: Box Component (3-4 days)

#### A. Virtual DOM Structure

**File**: `packages/react/src/dom.ts`

Create virtual DOM node types:
```ts
import Yoga, { type Node as YogaNode } from 'yoga-layout';

export type DOMNode = DOMElement | DOMText;

export interface DOMElement {
  type: 'box';
  yogaNode: YogaNode;
  props: BoxProps;
  children: DOMNode[];
  parentNode: DOMElement | null;
  // Link to created unblessed widget (after layout calculation)
  widget?: any;
}

export interface DOMText {
  type: 'text';
  yogaNode: YogaNode;
  content: string;
  props: TextProps;
  parentNode: DOMElement | null;
  widget?: any;
}
```

Functions:
- `createNode(type, props)` - Create virtual DOM node with Yoga node
- `appendChild(parent, child)` - Add child, update Yoga tree
- `removeChild(parent, child)` - Remove child, cleanup Yoga node

#### B. Styles Application

**File**: `packages/react/src/styles.ts`

Port Ink's style application functions:
```ts
import Yoga, { type Node as YogaNode } from 'yoga-layout';

export interface Styles {
  // Flexbox
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | string;

  // Spacing
  margin?: number;
  padding?: number;
  gap?: number;
  // ... all margin/padding variants

  // Dimensions
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;

  // Other
  position?: 'relative' | 'absolute';
  display?: 'flex' | 'none';
}

export function applyStyles(yogaNode: YogaNode, styles: Styles): void {
  // Apply all style props to Yoga node
  // Port logic from Ink's styles.ts
}
```

#### C. React Reconciler

**File**: `packages/react/src/reconciler.ts`

Implement React reconciler config:
```ts
import Reconciler from 'react-reconciler';
import { createNode, appendChild, removeChild } from './dom.js';
import { applyStyles } from './styles.js';

const reconciler = Reconciler({
  // Create instance when React creates element
  createInstance(type, props) {
    const node = createNode(type, props);
    applyStyles(node.yogaNode, props);
    return node;
  },

  // Create text instance
  createTextInstance(text) {
    return createNode('text', { content: text });
  },

  // Append child to parent
  appendChild(parent, child) {
    appendChild(parent, child);
  },

  // Remove child from parent
  removeChild(parent, child) {
    removeChild(parent, child);
  },

  // Update element props
  commitUpdate(instance, updatePayload, type, oldProps, newProps) {
    instance.props = newProps;
    applyStyles(instance.yogaNode, newProps);
  },

  // ... other reconciler methods (see Ink's reconciler.ts)
});
```

#### D. Box Component

**File**: `packages/react/src/components/Box.tsx`

```tsx
import React, { forwardRef, type PropsWithChildren } from 'react';
import type { Styles } from '../styles.js';

export interface BoxProps extends Styles {
  // unblessed position props (for hybrid API)
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;

  // Border props (Ink-style)
  borderStyle?: 'single' | 'double' | 'round' | 'bold' | 'classic';
  borderColor?: string;
  borderDimColor?: boolean;
  borderTopColor?: string;
  borderBottomColor?: string;
  borderLeftColor?: string;
  borderRightColor?: string;

  // unblessed border (alternative)
  border?: Border;
}

export const Box = forwardRef<any, PropsWithChildren<BoxProps>>(
  ({ children, ...props }, ref) => {
    return <box ref={ref} {...props}>{children}</box>;
  }
);

Box.displayName = 'Box';
```

#### E. Layout Calculation & Widget Creation

**File**: `packages/react/src/render.tsx` (partial implementation)

After reconciler creates virtual DOM:
1. Calculate Yoga layout: `rootYogaNode.calculateLayout()`
2. Traverse virtual DOM, create unblessed widgets with computed positions:
   ```ts
   function createWidget(node: DOMElement): any {
     const layout = node.yogaNode.getComputedLayout();

     // Create unblessed Box with Yoga-calculated position
     const widget = new Box({
       top: layout.top,
       left: layout.left,
       width: layout.width,
       height: layout.height,
       border: convertBorderProps(node.props), // Convert Ink-style → unblessed
       // ... other props
     });

     // Recursively create children
     node.children.forEach(child => {
       const childWidget = createWidget(child);
       childWidget.parent = widget;
     });

     return widget;
   }
   ```

**Tests**:
- Unit test: Box component renders
- Integration test: Flexbox layout calculates correctly
- Test border prop conversion

**Deliverable**: ✅ `<Box>` component with Flexbox layout working

---

### Phase 3: Text Component (3-4 days)

#### A. Text Wrapping

**File**: `packages/react/src/wrap-text.ts`

Port Ink's text wrapping logic:
```ts
import stringWidth from 'string-width';

export type WrapMode =
  | 'wrap'
  | 'truncate'
  | 'truncate-end'
  | 'truncate-start'
  | 'truncate-middle';

export function wrapText(
  text: string,
  maxWidth: number,
  mode: WrapMode = 'wrap'
): string {
  // Port logic from Ink's wrap-text.ts
  // Handle ANSI codes correctly (preserve styling across lines)
  // Support all wrap modes
}
```

#### B. Text Measurement

**File**: `packages/react/src/measure-text.ts`

ANSI-aware text measurement for Yoga:
```ts
import stringWidth from 'string-width';
import { wrapText } from './wrap-text.js';

export function measureText(
  text: string,
  maxWidth: number,
  wrapMode: WrapMode
): { width: number; height: number } {
  const wrapped = wrapText(text, maxWidth, wrapMode);
  const lines = wrapped.split('\n');

  return {
    width: Math.max(...lines.map(line => stringWidth(line))),
    height: lines.length
  };
}
```

#### C. Text Component

**File**: `packages/react/src/components/Text.tsx`

```tsx
import React, { type PropsWithChildren } from 'react';
import type { WrapMode } from '../wrap-text.js';

export interface TextProps {
  // Styling
  color?: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  inverse?: boolean;

  // Wrapping
  wrap?: WrapMode;
}

export const Text = ({ children, ...props }: PropsWithChildren<TextProps>) => {
  return <text {...props}>{children}</text>;
};

Text.displayName = 'Text';
```

#### D. Yoga Measure Function Integration

**File**: `packages/react/src/dom.ts` (update)

When creating text nodes, set Yoga measure function:
```ts
export function createTextNode(text: string, props: TextProps): DOMText {
  const yogaNode = Yoga.Node.create();

  // Set measure function for Yoga
  yogaNode.setMeasureFunc((width) => {
    const { width: measuredWidth, height } = measureText(
      text,
      width,
      props.wrap || 'wrap'
    );
    return { width: measuredWidth, height };
  });

  return {
    type: 'text',
    yogaNode,
    content: text,
    props,
    parentNode: null
  };
}
```

**Tests**:
- Text wrapping (all modes)
- ANSI code preservation
- Text measurement accuracy
- Text component rendering

**Deliverable**: ✅ `<Text>` component with wrapping and styling

---

### Phase 4: Render Pipeline (2-3 days)

#### A. Render Function

**File**: `packages/react/src/render.tsx`

Main entry point:
```tsx
import { createElement } from 'react';
import { Screen } from '@unblessed/core';
import reconciler from './reconciler.js';

export interface RenderOptions {
  stdout?: any;
  stdin?: any;
  debug?: boolean;
}

export function render(
  element: React.ReactElement,
  options: RenderOptions = {}
): RenderInstance {
  // 1. Create Screen
  const screen = new Screen({
    smartCSR: true,
    fullUnicode: true,
    debug: options.debug,
    ...options
  });

  // 2. Create React container
  const container = reconciler.createContainer(
    screen,
    0, // tag
    null, // hydration callbacks
    false, // isStrictMode
    null, // concurrentUpdatesByDefaultOverride
    '', // identifierPrefix
    (error) => console.error(error), // onRecoverableError
    null // transitionCallbacks
  );

  // 3. Render React element
  reconciler.updateContainer(element, container, null, () => {
    // After initial render, calculate layout and create widgets
    performLayout(container, screen);
    screen.render();
  });

  return {
    screen,
    unmount: () => {
      reconciler.updateContainer(null, container, null, () => {});
      screen.destroy();
    },
    rerender: (newElement) => {
      reconciler.updateContainer(newElement, container, null, () => {
        performLayout(container, screen);
        screen.render();
      });
    }
  };
}

export interface RenderInstance {
  screen: Screen;
  unmount: () => void;
  rerender: (element: React.ReactElement) => void;
}
```

#### B. Layout Calculation

**File**: `packages/react/src/render.tsx` (continued)

```ts
function performLayout(container: any, screen: Screen): void {
  // 1. Get root virtual DOM node
  const rootNode = getRootNode(container);

  // 2. Calculate Yoga layout
  rootNode.yogaNode.calculateLayout(
    screen.width,
    screen.height,
    Yoga.DIRECTION_LTR
  );

  // 3. Traverse tree, create/update unblessed widgets
  const rootWidget = createOrUpdateWidget(rootNode, screen);

  // 4. Attach to screen if new
  if (!rootWidget.parent) {
    rootWidget.parent = screen;
  }
}

function createOrUpdateWidget(node: DOMNode, screen: Screen): any {
  const layout = node.yogaNode.getComputedLayout();

  // Reuse existing widget or create new
  let widget = node.widget;

  if (!widget) {
    if (node.type === 'box') {
      widget = new Box({
        screen,
        top: layout.top,
        left: layout.left,
        width: layout.width,
        height: layout.height,
        border: convertBorderProps(node.props),
        // ... other props
      });
      node.widget = widget;
    } else if (node.type === 'text') {
      widget = new Text({
        screen,
        top: layout.top,
        left: layout.left,
        content: node.content,
        // Convert color props
        fg: node.props.color,
        bg: node.props.backgroundColor,
        bold: node.props.bold,
        // ... other props
      });
      node.widget = widget;
    }
  } else {
    // Update existing widget
    widget.position.top = layout.top;
    widget.position.left = layout.left;
    widget.width = layout.width;
    widget.height = layout.height;
    // ... update other props
  }

  // Recursively process children
  if ('children' in node) {
    node.children.forEach(child => {
      const childWidget = createOrUpdateWidget(child, screen);
      childWidget.parent = widget;
    });
  }

  return widget;
}
```

#### C. Update Handling

When React props change:
1. Reconciler calls `commitUpdate`
2. Update virtual DOM node props
3. Re-apply Yoga styles
4. Recalculate layout
5. Update widgets
6. Call `screen.render()`

**Tests**:
- Initial render
- Re-render with prop changes
- Unmount cleanup
- State updates

**Deliverable**: ✅ Full render pipeline working

---

### Phase 5: Testing & Examples (2-3 days)

#### A. Unit Tests

**Files**: `packages/react/__tests__/`
- `components/Box.test.tsx` - Box component
- `components/Text.test.tsx` - Text component
- `components/Spacer.test.tsx` - Spacer component
- `wrap-text.test.ts` - Text wrapping
- `measure-text.test.ts` - Text measurement
- `styles.test.ts` - Style application

#### B. Integration Tests

**Files**: `packages/react/__tests__/integration/`
- `basic-render.test.tsx` - Render simple app
- `layout.test.tsx` - Flexbox layout calculations
- `updates.test.tsx` - Re-render and state updates
- `unmount.test.tsx` - Cleanup

#### C. Example Apps

**Files**: `packages/react/examples/`

1. **Hello World** (`hello-world.tsx`):
   ```tsx
   import { render, Box, Text } from '@unblessed/react';

   const App = () => (
     <Box>
       <Text color="green">Hello World!</Text>
     </Box>
   );

   render(<App />);
   ```

2. **Layout Demo** (`layout-demo.tsx`):
   ```tsx
   const App = () => (
     <Box flexDirection="column" gap={1} padding={2}>
       <Text bold>Flexbox Layout Demo</Text>

       <Box flexDirection="row" gap={2}>
         <Box borderStyle="single" padding={1} flexGrow={1}>
           <Text>Left (flexGrow: 1)</Text>
         </Box>
         <Box borderStyle="single" padding={1} width={20}>
           <Text>Right (fixed width)</Text>
         </Box>
       </Box>

       <Box justifyContent="space-between" flexDirection="row">
         <Text>Start</Text>
         <Text>End</Text>
       </Box>
     </Box>
   );
   ```

3. **Counter** (`counter.tsx`):
   ```tsx
   import { useState } from 'react';
   import { render, Box, Text, useInput } from '@unblessed/react';

   const Counter = () => {
     const [count, setCount] = useState(0);

     useInput((input, key) => {
       if (key.upArrow) setCount(c => c + 1);
       if (key.downArrow) setCount(c => c - 1);
     });

     return (
       <Box flexDirection="column" padding={1}>
         <Text>Count: {count}</Text>
         <Text color="gray">Use ↑↓ to change</Text>
       </Box>
     );
   };

   render(<Counter />);
   ```

#### D. Documentation

**File**: `packages/react/README.md`

Include:
- Installation
- Quick start
- API reference (Box, Text, Spacer props)
- Examples
- Differences from Ink
- Integration with unblessed widgets

**Deliverable**: ✅ Tests passing, examples working, docs complete

---

### Phase 6: Hooks & Advanced Features (Future)

#### Hooks

**File**: `packages/react/src/hooks/useInput.ts`
```ts
export function useInput(
  handler: (input: string, key: Key) => void,
  options?: { isActive?: boolean }
): void {
  // Listen to stdin, call handler
  // Port from Ink's useInput
}
```

**File**: `packages/react/src/hooks/useApp.ts`
```ts
export function useApp(): {
  exit: (code?: number) => void;
} {
  // Access to app lifecycle
}
```

**File**: `packages/react/src/hooks/useFocus.ts`
```ts
export function useFocus(options?: { autoFocus?: boolean }): {
  isFocused: boolean;
} {
  // Focus management for Tab navigation
}
```

#### Widget Wrappers

Create React wrappers for existing unblessed widgets:

**Pattern**:
```tsx
// packages/react/src/components/wrappers/List.tsx
import { List as ListWidget } from '@unblessed/core';

export const List = ({ items, onSelect, ...props }) => {
  // Create wrapper that bridges React → unblessed widget
  // Handle props conversion, events, refs, etc.
  return <widget type="list" items={items} onSelect={onSelect} {...props} />;
};
```

**Widgets to wrap**:
- List
- Form
- Button
- Checkbox
- RadioButton
- Table
- ProgressBar
- Input
- Textarea

## Success Criteria

### MVP Complete When:

This code works in **both Node.js and browser**:

```tsx
import { render, Box, Text } from '@unblessed/react';

const App = () => (
  <Box flexDirection="column" padding={1} gap={1}>
    {/* Flexbox layout */}
    <Box borderStyle="single" borderColor="cyan" padding={1}>
      <Text bold color="green">Hello from React + unblessed!</Text>
    </Box>

    {/* Space-between layout */}
    <Box flexDirection="row" justifyContent="space-between">
      <Text>Left side</Text>
      <Text>Right side</Text>
    </Box>

    {/* Text wrapping */}
    <Box width={40} marginTop={1}>
      <Text wrap="truncate" color="yellow">
        This is a very long text that will be truncated if it exceeds the available width
      </Text>
    </Box>
  </Box>
);

render(<App />);
```

**Expected output**: Properly laid out terminal UI with Flexbox positioning, borders, colors, and text wrapping.

## Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1** | 3-4 days | Core enhancements (Border, Spacer) + React package setup |
| **Phase 2** | 3-4 days | Box component with Flexbox layout |
| **Phase 3** | 3-4 days | Text component with wrapping |
| **Phase 4** | 2-3 days | Render pipeline (layout → widgets) |
| **Phase 5** | 2-3 days | Testing, examples, documentation |
| **Total** | **3-4 weeks** | MVP complete |

**Phase 6** (Hooks, widget wrappers): TBD, post-MVP

## Current Status

**Last Updated**: 2025-11-01
**Current Phase**: Phase 5 - Polish & Production Readiness

### Phase 0: Layout Foundation ✅ **COMPLETE**
- [x] ✅ Create @unblessed/layout package
  - Yoga integration for flexbox layouts
  - LayoutManager API for creating and managing layout nodes
  - Yoga → unblessed widget synchronization
  - 34 tests passing (yoga-node, layout-engine, widget-sync)
  - Location: `packages/layout/`

### Phase 1: Core Enhancements + Foundation ✅ **COMPLETE**
- [x] ✅ Enhance Border interface (per-side colors, dim)
  - Added `borderTopColor`, `borderBottomColor`, `borderLeftColor`, `borderRightColor`
  - Added `borderDim`, `borderTopDim`, `borderBottomDim`, `borderLeftDim`, `borderRightDim`
  - Updated rendering in `element.ts` with `getBorderAttr()` helper
  - 10 new comprehensive tests added
  - All tests passing
- [x] ✅ Create @unblessed/react package
  - Package structure set up
  - Build config (tsup with ESM/CJS)
  - Dependencies installed (yoga-layout, react-reconciler)
  - Location: `packages/react/`

### Phase 2: Box Component ✅ **COMPLETE**
- [x] ✅ Create virtual DOM structure (dom.ts)
  - DOMNode and TextNode interfaces
  - Tree manipulation (appendChild, removeChild, etc.)
- [x] ✅ Implement React reconciler (reconciler.ts)
  - Full React reconciler configuration
  - LayoutManager integration
  - Props splitting (flexbox vs widget options)
- [x] ✅ Create Box component
  - Full flexbox props support
  - Border props (Ink-style API)
  - Color conversion
- [x] ✅ Layout calculation & widget creation
  - Yoga calculations working
  - widget-sync.ts for syncing LayoutNode → Widget
  - Absolute positioning from Yoga

### Phase 3: Text Component ✅ **MOSTLY COMPLETE**
- [x] ✅ Create Text component (Text.tsx)
  - Styling props (color, bold, italic, etc.)
  - Basic text rendering working
- [x] ✅ Create Spacer component (Spacer.tsx)
  - Simple flexGrow={1} wrapper
- [x] ✅ Create BigText component (BigText.tsx)
  - Large ASCII art text
  - Auto font size calculations
- [x] ✅ Create Button component (Button.tsx)
  - Interactive button with hover/focus states
- [x] ✅ Create Input component (Input.tsx)
  - Text input with autoFocus support
- [ ] ⚠️ Port text wrapping logic (DEFERRED)
  - Basic text works, wrapping not critical for MVP
- [ ] ⚠️ Yoga measure function integration (DEFERRED)

### Phase 4: Render Pipeline ✅ **COMPLETE**
- [x] ✅ Implement render() function (render.ts)
  - Creates Screen and LayoutManager
  - Mounts React tree
  - Returns instance with unmount/rerender
- [x] ✅ Layout calculation
  - Yoga calculates on each commit
  - Border adjustment for unblessed coordinate system
- [x] ✅ Widget creation/update
  - syncWidgetWithYoga() creates/updates widgets
  - Props flow: React → LayoutNode → YogaNode → Widget
- [x] ✅ Update handling
  - commitUpdate updates both DOM and Yoga
  - Re-renders on state changes

### Phase 5: Testing & Examples 🚧 **IN PROGRESS**
- [x] ✅ Example app (hello-react.tsx)
  - Comprehensive example with all features
  - Border showcase, buttons, inputs
- [x] ✅ Documentation (README.md, CLAUDE.md)
  - Installation guide
  - Component API reference
  - Architecture explanation
  - Event handling documentation
  - Examples
- [x] ✅ Event handling system
  - React event props (onClick, onKeyPress, etc.)
  - Event binding/unbinding in widget-sync
  - Event cleanup on update/unmount
  - Text content concatenation fix (multiple #text children)
  - 6 event tests + 2 content update tests passing
- [x] ✅ Hover/focus state preservation during re-renders
  - **Critical fix**: Hover effects now persist during React re-renders
  - Deep cloning prevents shared style object mutations between widgets
  - Temp storage updates ensure correct restoration on mouseout/blur
  - Enables hover effects with onMouseMove handlers (critical for interactive UIs)
  - 5 comprehensive tests added (hover persistence, focus persistence, simultaneous effects, etc.)
  - All 45 layout tests passing
  - Location: `packages/layout/src/widget-descriptor.ts`
- [ ] ⚠️ Unit tests (PARTIAL)
  - 17 tests total (4 render + 6 event + 2 content update + 5 hover/focus)
  - Need more component tests (layout, props, edge cases)
- [ ] ⚠️ Integration tests (NEEDED)
  - Layout calculations
  - State updates
  - Complex event scenarios
- [ ] ⚠️ Test coverage target (NEEDED)
  - Goal: 70%+ coverage
  - Current: ~35% (estimated)

### Phase 6: Future Enhancements 📋 **PLANNED**
- [ ] Hooks (useInput, useApp, useFocus) - **NEXT PRIORITY**
- [ ] Text wrapping and overflow handling
- [ ] More widget wrappers (List, ListTable, ProgressBar, etc.)
- [ ] Performance optimization
- [ ] Animation support
- [ ] Context-based theming

## Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `packages/core/src/types/common.ts` | Border interface (add per-side colors, dim) |
| `packages/core/src/widgets/element.ts` | Border rendering (update for new props) |
| `packages/core/src/widgets/spacer.ts` | NEW - Spacer widget |
| `packages/react/src/index.ts` | Main exports |
| `packages/react/src/render.tsx` | render() function, layout pipeline |
| `packages/react/src/reconciler.ts` | React reconciler config |
| `packages/react/src/dom.ts` | Virtual DOM (Yoga nodes) |
| `packages/react/src/styles.ts` | Apply styles to Yoga |
| `packages/react/src/wrap-text.ts` | Text wrapping logic |
| `packages/react/src/measure-text.ts` | Text measurement for Yoga |
| `packages/react/src/components/Box.tsx` | Box component |
| `packages/react/src/components/Text.tsx` | Text component |
| `packages/react/src/components/Spacer.tsx` | Spacer component |

## References

- **Ink source**: `/Users/vdeantoni/workspace/vdeantoni/ink/src/`
  - `reconciler.ts` - React reconciler implementation
  - `dom.ts` - Virtual DOM structure
  - `styles.ts` - Yoga style application
  - `wrap-text.ts` - Text wrapping logic
  - `measure-text.ts` - Text measurement
  - `components/Box.tsx`, `components/Text.tsx` - Component implementations
- **React Reconciler API**: https://github.com/facebook/react/tree/main/packages/react-reconciler
- **Yoga Layout**: https://yogalayout.com/docs

## What's Next?

### Immediate Priorities (Next 1-2 weeks)

#### 1. **Testing** 🎯 **HIGH PRIORITY**
The React package has event handling and content updates working:

**Current:** 12 tests (4 render + 6 event + 2 content update)
**Goal:** 70%+ coverage

**Tasks:**
- [x] ✅ Event handling tests (6 tests)
- [x] ✅ Content update tests (2 tests)
- [ ] Component tests (Box, Text, BigText, Button, Input, Spacer)
- [ ] Layout calculation tests (flexbox, gap, padding, borders)
- [ ] Props conversion tests (flexbox props → Yoga, widget props → options)
- [ ] Focus navigation tests (Button, Input interactions)
- [ ] Border color tests (per-side colors, dim, conversion)

**Location:** `packages/react/__tests__/`

#### 2. **Hooks** 🎯 **HIGH PRIORITY** ✅ **Foundation Complete**
Event system foundation is complete. Now implement hooks for global event handling:

**Foundation complete:**
- [x] ✅ Event prop types (ReactEventProps, EventHandlers)
- [x] ✅ Props extraction (propsToEventHandlers in reconciler)
- [x] ✅ Event binding/unbinding (widget-sync.ts)
- [x] ✅ Event cleanup on update/unmount
- [x] ✅ Component support (Box, Button, Input)
- [x] ✅ Tests (6 event tests passing)

**Hooks to implement:**
- [ ] `useInput(handler)` - Keyboard input handling (screen-level)
- [ ] `useApp()` - App lifecycle (exit, etc.)
- [ ] `useFocus()` - Focus management for Tab navigation

**Reference:** Ink's hooks implementation (`ink/src/hooks/`)

**Location:** `packages/react/src/hooks/`

#### 3. **Text Wrapping** 🔧 **MEDIUM PRIORITY**
- [ ] Support wrap modes (wrap, truncate, truncate-middle, etc.)
- [ ] Handle ANSI codes correctly

**Reference:** `ink/src/wrap-text.ts`, `ink/src/measure-text.ts`

**Location:** `packages/react/src/wrap-text.ts`, `packages/react/src/measure-text.ts`

#### 4. **Bug Fixes** 🐛
- [x] ✅ Fix hover/focus effects lost on re-render (2025-11-03)
  - Fixed widget style being overwritten during React re-renders
  - Added deep cloning to prevent shared style object mutations
  - 5 comprehensive tests ensure effects persist correctly
- [ ] Fix focus navigation edge cases (seen in focus-navigation.test.js)
- [ ] Verify padding calculations are correct
- [ ] Test with different terminal sizes

### Future Work (Next 1-2 months)

#### 5. **More Component Wrappers**
Wrap existing unblessed widgets as React components:

**Priority widgets:**
- [ ] List - Scrollable list with selection
- [ ] ListTable - Table with rows/columns
- [ ] ProgressBar - Progress indicator
- [ ] Checkbox - Checkbox input
- [ ] RadioButton/RadioSet - Radio buttons
- [ ] FileManager - File picker
- [ ] Table - Data table

**Pattern:** Create React components that internally use unblessed widgets

#### 6. **Performance Optimization**
- [ ] Minimize re-renders
- [ ] Optimize Yoga calculations (only recalc dirty nodes)
- [ ] Widget pooling/reuse
- [ ] Benchmark against Ink

#### 7. **Developer Experience**
- [ ] Better error messages
- [ ] Debug mode improvements
- [ ] DevTools integration?
- [ ] Hot reload support

#### 8. **Advanced Features**
- [ ] Animation support
- [ ] Context-based theming
- [ ] Suspense support
- [ ] Portal support
- [ ] Custom renderers

---

**Last Updated**: 2025-11-03
**Status**: MVP functionally complete with event handling and state management
**Recent**: Fixed critical hover/focus state preservation bug
**Next Milestone**: Hooks + comprehensive tests → v1.0.0 release candidate