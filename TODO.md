# TODO

Code modernization and cleanup tasks for @unblessed.

## Triage

1. Investigate why setRuntime(new NodeRuntime()); is needed by the vrt tests and can we improve it.
2. implement all remaining tags:
   Effect	On	Escape Code	Off	Escape Code	Output Example
   Bold	1	\x1b[1m	21	\x1b[21m	This is BOLD
   Dim	2	\x1b[2m	22	\x1b[22m	This is DIMMED
   Underline	4	\x1b[4m	24	\x1b[24m	This is UNDERLINED
   Blink	5	\x1b[5m	25	\x1b[25m	This is BLINKING
   Reverse	7	\x1b[7m	27	\x1b[27m	This is REVERSED
   Hide	8	\x1b[7m	28	\x1b[28m	This is HIDDEN
3. improve callback signature:
       39 +    const handleKeyPress = (_ch: string, key: any) => {
       40 +      if (key.name === "t") {
       41 +        handleToggleTheme();
       42 +      } else if (key.name === "q" || (key.ctrl && key.name === "c")) {
       43 +        process.exit(0);
       44 +      }
       45 +    };
       46


## High Priority

### 1. Remove `var self = this` pattern
**Effort:** Low (~1 hour)
**Priority:** High
**Status:** Ready to implement

**Description:**
Replace old JavaScript closure pattern `var self = this` with arrow functions to preserve `this` context. Modern ES6 approach that's cleaner and more maintainable.

**Current state:**
- 7 occurrences across 2 files:
  - `overlayimage.ts`: 1 occurrence
  - `tput.ts`: 6 occurrences

**Implementation approach:**
1. Identify callbacks/closures using `self` variable
2. Convert to arrow functions: `function() { ... }` → `() => { ... }`
3. Replace `self.property` with `this.property` throughout converted functions
4. Test to ensure `this` context is preserved correctly

**Example transformation:**
```typescript
// Before
var self = this;
something.on('event', function() {
  self.property = value;
});

// After
something.on('event', () => {
  this.property = value;
});
```

**Files to modify:**
- `packages/core/src/widgets/overlayimage.ts` (1 instance)
- `packages/core/src/lib/tput.ts` (6 instances)

**Benefits:**
- Modern ES6 pattern
- Less verbose, more readable
- Eliminates extra variable allocation
- Consistent with rest of codebase

---

## Medium Priority

### 2. Add automatic cursor restoration on exit
**Effort:** Low (~30 minutes)
**Priority:** Medium
**Status:** Ready to implement

**Description:**
Add automatic cursor restoration when the program exits, similar to [cli-cursor](https://github.com/sindresorhus/cli-cursor). This prevents the cursor from staying hidden if the program crashes or exits unexpectedly.

**Current state:**
- `program.showCursor()` and `program.hideCursor()` work correctly
- Exit handler flushes output but doesn't restore cursor state
- If program exits with cursor hidden, terminal cursor stays hidden

**Investigation:**
Investigated cli-cursor package. While it's a well-designed library, it's not useful for unblessed because:
- unblessed already has full cursor control via terminfo/termcap
- cli-cursor is designed for simple CLI apps, not full TUI frameworks
- Adding it would create dependency and mix two cursor control systems
- The core functionality (auto-restore) can be easily added directly

**Implementation approach:**
Enhance the existing exit handler in `program.ts` to restore cursor if hidden:

```typescript
// In Program._exitHandler (around line 258-272)
Program.instances.forEach((program) => {
  // Add cursor restoration
  if (program.cursorHidden) {
    program.showCursor();
  }

  // Existing cleanup
  program.flush();
  program._exiting = true;
});
```

**Files to modify:**
- `packages/core/src/lib/program.ts` - Update `_exitHandler` method

**Testing:**
1. Create test program that hides cursor and exits normally
2. Create test program that hides cursor and throws error
3. Verify cursor is visible after both scenarios
4. Test with Ctrl+C interrupt

**Benefits:**
- Better user experience - no stuck hidden cursor
- Matches behavior of modern CLI tools
- Simple, self-contained solution
- No external dependencies needed

---

### 3. Support additional border styles (like cli-boxes/boxen)
**Effort:** Medium (~4-6 hours)
**Priority:** Medium
**Status:** Investigation phase

**Description:**
Enhance the border system to support multiple border styles beyond the current `"line"` and `"bg"` types. Similar to how [cli-boxes](https://github.com/sindresorhus/cli-boxes) provides character sets and [boxen](https://github.com/sindresorhus/boxen) uses them for styled terminal boxes.

**Current state:**
- Only 2 border types supported:
  - `"line"` - Single-line Unicode box drawing (┌─┐│└┘)
  - `"bg"` - Background character (space by default)
- Hardcoded characters in `element.ts` rendering logic

**Proposed enhancement:**
Add support for additional border styles:
- `"double"` - Double-line borders (╔═╗║╚╝)
- `"round"` - Rounded corners (╭─╮│╰╯)
- `"bold"` - Thick/heavy borders (┏━┓┃┗┛)
- `"classic"` - ASCII fallback (+--+|+--+)
- `"single-double"` - Mixed styles
- `"double-single"` - Mixed styles

**API design options:**

**Option 1: Style property**
```typescript
const box = new Box({
  border: {
    type: 'line',
    style: 'double'  // or 'round', 'bold', 'classic'
  }
});
```

**Option 2: Type includes style**
```typescript
const box = new Box({
  border: { type: 'line-double' }  // or 'line-round', 'line-bold'
});
```

**Option 3: Use cli-boxes directly**
```typescript
import cliBoxes from 'cli-boxes';
const box = new Box({
  border: {
    type: 'line',
    chars: cliBoxes.double  // or custom character map
  }
});
```

**Implementation approach:**
1. Research cli-boxes character mappings
2. Define border character interface:
   ```typescript
   interface BorderChars {
     topLeft: string;
     topRight: string;
     bottomLeft: string;
     bottomRight: string;
     horizontal: string;
     vertical: string;
   }
   ```
3. Create border style registry/map
4. Update `element.ts` border rendering to use style lookup
5. Add tests for each border style
6. Update TypeScript types in `common.ts`
7. Document in API reference

**Files to modify:**
- `packages/core/src/types/common.ts` - Add BorderStyle type
- `packages/core/src/widgets/element.ts` - Update border rendering logic
- `packages/core/src/lib/border-styles.ts` - New file for style definitions
- Tests and documentation

**Benefits:**
- Visual variety for terminal UIs
- Better compatibility with modern CLI design trends
- Matches feature parity with popular libraries (boxen)
- Maintains backward compatibility (default to 'single')
- Easy to add custom border styles

**References:**
- cli-boxes: https://github.com/sindresorhus/cli-boxes
- boxen: https://github.com/sindresorhus/boxen
- Unicode box drawing: https://en.wikipedia.org/wiki/Box-drawing_character

---

### 4. Add text truncation utility function
**Effort:** Low (~2 hours)
**Priority:** Medium
**Status:** Ready to implement

**Description:**
Add a high-level text truncation utility function similar to [cli-truncate](https://github.com/sindresorhus/cli-truncate), but using unblessed's existing Unicode width handling instead of external dependencies.

**Current state:**
- unblessed has comprehensive Unicode width handling in `unicode.ts`:
  - `charWidth()` - calculates width of individual characters including fullwidth/emoji
  - `strWidth()` - calculates total string width
  - Handles CJK characters, emoji, surrogate pairs, combining characters
- No high-level API for truncating strings to fit specific widths
- Element rendering has internal truncation logic but not exposed as utility

**Investigation:**
Investigated cli-truncate package. While it's well-designed, it's not useful as a dependency because:
- unblessed already has superior Unicode width calculation built-in
- cli-truncate uses `string-width` which has different width tables
- Adding it would create dependencies (string-width, slice-ansi) conflicting with zero-dependency goal
- Different abstraction level (simple strings vs. complex TUI rendering)

**Implementation approach:**
Add a new exported function to `unicode.ts`:

```typescript
export function truncate(
  str: string,
  width: number,
  options?: {
    position?: 'start' | 'middle' | 'end';
    ellipsis?: string;
    tabSize?: number;
  }
): string {
  const {
    position = 'end',
    ellipsis = '…',
    tabSize = 8
  } = options || {};

  const strWidth = unicode.strWidth(str, tabSize);
  const ellipsisWidth = unicode.strWidth(ellipsis, tabSize);

  // If string fits, return as-is
  if (strWidth <= width) return str;

  // If width too small for ellipsis, return truncated ellipsis
  if (width <= ellipsisWidth) {
    // Truncate ellipsis to fit width
    let result = '';
    let w = 0;
    for (let i = 0; i < ellipsis.length; i++) {
      const charW = unicode.charWidth(ellipsis, i, tabSize);
      if (w + charW > width) break;
      result += ellipsis[i];
      if (unicode.isSurrogate(ellipsis, i)) {
        i++;
        if (i < ellipsis.length) result += ellipsis[i];
      }
      w += charW;
    }
    return result;
  }

  const targetWidth = width - ellipsisWidth;

  if (position === 'end') {
    // Truncate from end: "Hello World" -> "Hello W…"
    let result = '';
    let w = 0;
    for (let i = 0; i < str.length; i++) {
      const charW = unicode.charWidth(str, i, tabSize);
      if (w + charW > targetWidth) break;
      result += str[i];
      if (unicode.isSurrogate(str, i)) {
        i++;
        if (i < str.length) result += str[i];
      }
      w += charW;
    }
    return result + ellipsis;
  }

  if (position === 'start') {
    // Truncate from start: "Hello World" -> "…o World"
    // Work backwards from end
    let result = '';
    let w = 0;
    for (let i = str.length - 1; i >= 0; i--) {
      const charW = unicode.charWidth(str, i, tabSize);
      if (w + charW > targetWidth) break;
      result = str[i] + result;
      // Handle surrogate pairs (check if previous char is high surrogate)
      if (i > 0 && unicode.isSurrogate(str, i - 1)) {
        i--;
        result = str[i] + result;
      }
      w += charW;
    }
    return ellipsis + result;
  }

  if (position === 'middle') {
    // Truncate from middle: "Hello World" -> "Hell…rld"
    const halfWidth = Math.floor(targetWidth / 2);
    const leftWidth = halfWidth;
    const rightWidth = targetWidth - leftWidth;

    // Get left part
    let left = '';
    let w = 0;
    for (let i = 0; i < str.length; i++) {
      const charW = unicode.charWidth(str, i, tabSize);
      if (w + charW > leftWidth) break;
      left += str[i];
      if (unicode.isSurrogate(str, i)) {
        i++;
        if (i < str.length) left += str[i];
      }
      w += charW;
    }

    // Get right part
    let right = '';
    w = 0;
    for (let i = str.length - 1; i >= 0; i--) {
      const charW = unicode.charWidth(str, i, tabSize);
      if (w + charW > rightWidth) break;
      right = str[i] + right;
      if (i > 0 && unicode.isSurrogate(str, i - 1)) {
        i--;
        right = str[i] + right;
      }
      w += charW;
    }

    return left + ellipsis + right;
  }

  return str;
}
```

**Files to modify:**
- `packages/core/src/lib/unicode.ts` - Add truncate function
- `packages/core/src/index.ts` - Export truncate function
- `packages/core/__tests__/lib/unicode.test.js` - Add comprehensive tests

**Testing:**
1. Test with ASCII strings
2. Test with fullwidth characters (CJK, emoji)
3. Test with combining characters
4. Test with surrogate pairs
5. Test all three positions (start/middle/end)
6. Test edge cases (width < ellipsis, width = 0, empty string)
7. Test with different ellipsis characters
8. Test with tabs (different tabSize values)

**Benefits:**
- Provides cli-truncate-like functionality without dependencies
- Leverages unblessed's existing Unicode handling
- Consistent with unblessed's rendering behavior
- Useful utility for applications building on unblessed
- No external dependencies needed
- Simple, self-contained implementation

**Example usage:**
```typescript
import { truncate } from '@unblessed/core';

truncate('Hello World', 8);
// => 'Hello W…'

truncate('Hello World', 8, { position: 'middle' });
// => 'Hel…orld'

truncate('你好世界', 6);  // CJK characters (2 width each)
// => '你好世…'

truncate('Hello 🌍', 7);  // Emoji (2 width)
// => 'Hello…'
```

---

## Low Priority

### 5. Replace `var` with `const`/`let`
**Effort:** Medium (~3-4 hours)
**Priority:** Low
**Status:** Future improvement

**Description:**
Replace all `var` declarations with `const` (for immutable bindings) or `let` (for reassignable variables). Modern ES6 best practice with better scoping rules (block vs function scope).

**Current state:**
- 82 occurrences across 4 files:
  - `ansiimage.ts`: 2 instances
  - `overlayimage.ts`: 16 instances
  - `program.ts`: 12 instances
  - `tput.ts`: 52 instances

**Implementation approach:**
1. Start with smallest files first:
   - `ansiimage.ts` (2 vars) - easiest to validate
   - `program.ts` (12 vars) - medium complexity
   - `overlayimage.ts` (16 vars) - after removing var self pattern
   - `tput.ts` (52 vars) - largest, save for last
2. For each var declaration, analyze if variable is reassigned:
   - Never reassigned → use `const`
   - Reassigned → use `let`
3. Run tests after each file conversion to catch scope issues

**Example transformation:**
```typescript
// Before
var x = 5;
var y = 10;
y = 20;

// After
const x = 5;
let y = 10;
y = 20;
```

**Files to modify:**
- `packages/core/src/widgets/ansiimage.ts` (2 vars)
- `packages/core/src/lib/program.ts` (12 vars)
- `packages/core/src/widgets/overlayimage.ts` (16 vars)
- `packages/core/src/lib/tput.ts` (52 vars)

**Benefits:**
- Block scoping prevents subtle bugs
- `const` signals immutability intent
- Better alignment with TypeScript strict mode
- Modern ES6 standard
- Easier to reason about variable lifecycle

**Why Low Priority:**
- Current code works fine with `var`
- TypeScript strict mode already catches many issues
- Requires careful analysis of each case
- Not urgent, but good practice

---

## Not Recommended

These items from the old TODO list are **not recommended** for implementation:

### ❌ Add `this.runtime` to Node class
**Why Skip:**
- Marginal performance benefit (getRuntime() is already optimized)
- Adds memory overhead to every widget instance
- Current pattern better reflects singleton semantics
- Theoretical testing benefit doesn't materialize in practice
- Would add complexity without meaningful gain

**Current approach is cleaner:** Runtime as global singleton accessed via `getRuntime()` is explicit and appropriate for the architecture.

---

### ❌ Investigate EventEmitter replacement
**Why Skip:**
- Current custom EventEmitter is stable and battle-tested
- High risk of subtle behavior changes for minimal benefit
- Provides consistent behavior across all platforms (Node, browser, tests)
- Full control over implementation details
- No significant bundle size savings expected

**Current approach is stable:** The custom EventEmitter works well and provides predictable behavior.

---

### ⏸️ Refactor colors.ts to named exports
**Why Defer to v2.0.0:**
- Would be a breaking change for external consumers
- Current v1.x goal is 100% backward compatibility with blessed
- Functions benefit from namespace (match, blend, convert are generic names)
- Primarily used internally, so tree-shaking benefit is limited

**Consider for v2.0.0:** This would be a good modernization, but should wait for the next major version when breaking changes are acceptable.

**Alternative approach:** Could export both ways temporarily (default + named exports) to allow gradual migration without breaking changes.

---

## Summary

**Do now:** Item #1 (remove var self = this) - Quick win with clear benefits

**Do later:** Item #2 (replace var with const/let) - Good practice but not urgent

**Don't do:** Items #3-5 - Not worth the effort/risk, or deferred to v2.0.0

---

## Completed Tasks

For historical reference, these major refactoring efforts have been completed:

- ✅ Full TypeScript conversion with strict mode
- ✅ Runtime dependency injection pattern implemented
- ✅ Platform-agnostic core architecture
- ✅ 100% test coverage (1,987/1,987 tests passing)
- ✅ Browser support via XTerm.js integration
- ✅ Monorepo setup with Turborepo
- ✅ Modern build tooling (tsup, pnpm)
- ✅ Package rebranding from @tui to @unblessed
- ✅ Documentation consolidation and cleanup
