/**
 * Options type definitions for blessed widgets
 */

import type { BufferType, ReadableType, WritableType } from "../runtime.js";
import type { Node } from "../widgets/node.js";
import type {
  Alignment,
  Border,
  Cursor,
  Padding,
  Position,
  PositionValue,
} from "./common.js";
import type { ListElementStyle, StyleListTable } from "./style.js";

/**
 * Text wrapping mode (inspired by ink)
 */
export type TextWrapMode =
  | "wrap" // Word wrap (default)
  | "truncate-end" // Truncate at end with ellipsis: "Hello W…"
  | "truncate-middle" // Truncate in middle with ellipsis: "Hel…rld"
  | "truncate-start"; // Truncate at start with ellipsis: "…World"

// Forward declarations for circular dependencies
export type Screen = any;
export type BlessedElement = any;

export interface NodeOptions {
  name?: string;
  screen?: Screen;
  parent?: Node;
  children?: Node[];
  focusable?: boolean;
  _isScreen?: boolean;
}

export interface ScrollbarConfig {
  ch?: string;
  style?: any;
  track?: TrackConfig;
  fg?: string;
  bg?: string;
  bold?: boolean;
  underline?: boolean;
  inverse?: boolean;
  invisible?: boolean;
  ignoreBorder?: boolean;
}

export interface TrackConfig {
  ch?: string;
  style?: any;
  fg?: string;
  bg?: string;
  bold?: boolean;
  underline?: boolean;
  inverse?: boolean;
  invisible?: boolean;
}

export interface ScrollableOptions {
  /**
   * Whether the element is scrollable or not.
   */
  scrollable?: boolean;

  /**
   * A limit to the childBase. Default is Infinity.
   */
  baseLimit?: number;

  /**
   * A option which causes the ignoring of childOffset. This in turn causes the
   * childBase to change every time the element is scrolled.
   */
  alwaysScroll?: boolean;

  /**
   * Object enabling a scrollbar.
   * Style of the scrollbar track if present (takes regular style options).
   */
  scrollbar?: ScrollbarConfig;

  track?: TrackConfig;

  /**
   * Whether to enable automatic mouse support for this element.
   */
  mouse?: boolean;

  /**
   * Use pre-defined keys (i or enter for insert, e for editor, C-e for editor while inserting).
   */
  keys?: boolean | string | string[];

  /**
   * Use vi keys with the keys option.
   */
  vi?: boolean;

  ignoreKeys?: boolean | string[];
}

export interface AnimatableOptions {
  /**
   * Whether the element supports animations (animateBorderColors, pulse, fade).
   * When true, adds animation methods via makeAnimatable mixin.
   */
  animatable?: boolean;
}

export interface ElementOptions
  extends NodeOptions,
    ScrollableOptions,
    AnimatableOptions {
  /**
   * Parse tags in content (e.g. {bold}text{/bold}).
   */
  tags?: boolean;

  /**
   * Parse tags in content (alias for tags).
   */
  parseTags?: boolean;

  /**
   * Foreground color.
   */
  fg?: string;

  /**
   * Background color.
   */
  bg?: string;

  /**
   * Bold text attribute.
   */
  bold?: boolean;

  /**
   * Underline text attribute.
   */
  underline?: boolean;

  /**
   * Blinking text attribute.
   */
  blink?: boolean;

  /**
   * Inverse/reverse video attribute (swap foreground and background).
   */
  inverse?: boolean;

  /**
   * Invisible text attribute.
   */
  invisible?: boolean;

  /**
   * Lower element opacity to 50% using naive color blending.
   * Displays dimmed content with parent's background visible behind it.
   * Works best with 256-color terminals.
   *
   * @example
   * const box = blessed.box({ transparent: true });
   */
  transparent?: boolean;

  /**
   * Style object containing colors and attributes.
   */
  style?: any;

  /**
   * Border object, see below.
   */
  border?: Border | "line" | "bg";

  /**
   * Element's text content.
   */
  content?: string;

  /**
   * Element is clickable.
   */
  clickable?: boolean;

  /**
   * Element is focusable and can receive key input.
   */
  input?: boolean;

  /**
   * Element is focusable and can receive key input (alias for input).
   */
  keyable?: boolean;

  /**
   * Controls keyboard focus navigation (similar to HTML tabindex attribute).
   *
   * - `undefined`: Not focusable (default for Box, Text, etc.)
   * - `-1`: Programmatically focusable only, excluded from Tab order
   * - `0`: Focusable in natural document order (default for Input and List widgets)
   * - `1+`: Explicit tab order (focused before natural order elements)
   *
   * @example
   * // Make a box focusable in natural order
   * const box = new Box({ parent: screen, tabIndex: 0 });
   *
   * // Programmatic focus only (excluded from Tab navigation)
   * const modal = new Box({ parent: screen, tabIndex: -1 });
   *
   * // Explicit order (focused before natural order elements)
   * const importantBox = new Box({ parent: screen, tabIndex: 1 });
   */
  tabIndex?: number;

  /**
   * Element is focused.
   */
  focused?: BlessedElement;

  /**
   * Whether the element is hidden.
   */
  hidden?: boolean;

  /**
   * A simple text label for the element.
   */
  label?: string;

  /**
   * A floating text label for the element which appears on mouseover.
   */
  hoverText?: string;

  /**
   * Background color when element is hovered.
   */
  hoverBg?: string;

  /**
   * Effects to apply when element is hovered.
   */
  hoverEffects?: any;

  /**
   * Effects to apply when element is focused.
   */
  focusEffects?: any;

  /**
   * General effects to apply to the element.
   */
  effects?: any;

  /**
   * Text alignment: left, center, or right.
   */
  align?: "left" | "center" | "right";

  /**
   * Vertical text alignment: top, middle, or bottom.
   */
  valign?: "top" | "middle" | "bottom";

  /**
   * Shrink/flex/grow to content and child elements. Width/height during render.
   */
  shrink?: boolean;

  /**
   * Wrap text if it exceeds width.
   */
  wrap?: boolean;

  /**
   * Text wrapping/truncation mode (ink-style).
   * Takes precedence over wrap property if set.
   *
   * - 'wrap': Word wrap text to multiple lines (default behavior)
   * - 'truncate-end': Truncate at end with ellipsis: "Hello W…"
   * - 'truncate-middle': Truncate in middle with ellipsis: "Hel…rld"
   * - 'truncate-start': Truncate at start with ellipsis: "…World"
   *
   * If undefined, uses legacy wrap boolean behavior.
   */
  textWrap?: TextWrapMode;

  /**
   * Amount of padding on the inside of the element. Can be a number or an object containing
   * the properties: left, right, top, and bottom.
   */
  padding?: number | Partial<Padding>;

  /**
   * Offsets of the element relative to its parent. Can be a number, percentage (0-100%), or
   * keyword (center). right and bottom do not accept keywords. Percentages can also have
   * offsets (50%+1, 50%-1).
   */
  top?: PositionValue;

  /**
   * Offsets of the element relative to its parent. Can be a number, percentage (0-100%), or
   * keyword (center). right and bottom do not accept keywords. Percentages can also have
   * offsets (50%+1, 50%-1).
   */
  left?: PositionValue;

  /**
   * Right offset of the element relative to its parent. Can be a number or percentage (0-100%).
   * Percentages can also have offsets (50%+1, 50%-1).
   */
  right?: PositionValue;

  /**
   * Bottom offset of the element relative to its parent. Can be a number or percentage (0-100%).
   * Percentages can also have offsets (50%+1, 50%-1).
   */
  bottom?: PositionValue;

  /**
   * Width/height of the element, can be a number, percentage (0-100%), or keyword (half or shrink).
   * Percentages can also have offsets (50%+1, 50%-1).
   */
  width?: number | string;

  /**
   * Width/height of the element, can be a number, percentage (0-100%), or keyword (half or shrink).
   * Percentages can also have offsets (50%+1, 50%-1).
   */
  height?: number | string;

  /**
   * Can contain the above options.
   */
  position?: Position;

  /**
   * Background character (default is whitespace ).
   */
  ch?: string;

  /**
   * Allow the element to be dragged with the mouse.
   */
  draggable?: boolean;

  /**
   * Draw a translucent offset shadow behind the element.
   * Automatically darkens the background behind the shadow.
   *
   * @example
   * const box = blessed.box({ shadow: true });
   */
  shadow?: boolean;

  /**
   * Prevent content from overflowing the element boundaries.
   */
  noOverflow?: boolean;

  /**
   * Automatically "dock" borders with adjacent elements.
   * Instead of overlapping, borders connect seamlessly to neighboring elements.
   *
   * @example
   * const box1 = blessed.box({ dockBorders: true, top: 0, left: 0, width: 10, height: 5 });
   * const box2 = blessed.box({ dockBorders: true, top: 0, left: 10, width: 10, height: 5 });
   */
  dockBorders?: boolean;

  /**
   * Fixed position (does not scroll with parent).
   */
  fixed?: boolean;

  /**
   * Type identifier for the element.
   */
  type?: string;
}

export interface ScrollableBoxOptions extends ElementOptions {
  // All scrollable properties inherited from ScrollableOptions via ElementOptions
}

export interface ScrollableTextOptions extends ScrollableBoxOptions {
  // All scrollable properties inherited from ScrollableOptions via ElementOptions
}

export interface BoxOptions extends ScrollableTextOptions {
  bindings?: any;
}

export interface TextOptions extends ElementOptions {
  /**
   * Fill the entire line with chosen bg until parent bg ends, even if there
   * is not enough text to fill the entire width.
   */
  fill?: boolean;

  /**
   * Text alignment: left, center, or right.
   */
  align?: Alignment;
}

export interface LineOptions extends BoxOptions {
  /**
   * Line orientation. Can be vertical or horizontal.
   */
  orientation?: "vertical" | "horizontal";

  /**
   * Type of line. Treated the same as a border object (attributes can be contained in style).
   */
  type?: string;

  /**
   * Background color for the line.
   */
  bg?: string;

  /**
   * Foreground color for the line.
   */
  fg?: string;

  /**
   * Character to use for drawing the line.
   */
  ch?: string;
}

export interface BigTextOptions extends BoxOptions {
  /**
   * Path to bdf->json font file to use (see ttystudio for instructions on compiling BDFs to JSON).
   */
  font?: string;

  /**
   * Path to bdf->json bold font file to use (see ttystudio for instructions on compiling BDFs to JSON).
   */
  fontBold?: string;

  /**
   * Foreground character to use for rendering (default is space ' ').
   */
  fch?: string;
}

export interface ListOptions<TStyle extends ListElementStyle = ListElementStyle>
  extends BoxOptions {
  /**
   * Style for a selected item and an unselected item.
   */
  style?: TStyle;

  /**
   * An array of strings which become the list's items.
   */
  items?: string[];

  /**
   * A function that is called when vi mode is enabled and the key / is pressed. This function accepts a
   * callback function which should be called with the search string. The search string is then used to
   * jump to an item that is found in items.
   */
  search?(err: any, value?: string): void;

  /**
   * Whether the list is interactive and can have items selected (Default: true).
   */
  interactive?: boolean;

  /**
   * Whether to automatically override tags and invert fg of item when selected (Default: true).
   */
  invertSelected?: boolean;

  /**
   * Normal shrink behavior for list items.
   */
  normalShrink?: boolean;

  /**
   * Background color for selected items.
   */
  selectedBg?: string;

  /**
   * Foreground color for selected items.
   */
  selectedFg?: string;

  /**
   * Bold attribute for selected items.
   */
  selectedBold?: boolean;

  /**
   * Underline attribute for selected items.
   */
  selectedUnderline?: boolean;

  /**
   * Blink attribute for selected items.
   */
  selectedBlink?: boolean;

  /**
   * Inverse attribute for selected items.
   */
  selectedInverse?: boolean;

  /**
   * Invisible attribute for selected items.
   */
  selectedInvisible?: boolean;

  /**
   * Background color for unselected items.
   */
  itemBg?: string;

  /**
   * Foreground color for unselected items.
   */
  itemFg?: string;

  /**
   * Bold attribute for unselected items.
   */
  itemBold?: boolean;

  /**
   * Underline attribute for unselected items.
   */
  itemUnderline?: boolean;

  /**
   * Blink attribute for unselected items.
   */
  itemBlink?: boolean;

  /**
   * Inverse attribute for unselected items.
   */
  itemInverse?: boolean;

  /**
   * Invisible attribute for unselected items.
   */
  itemInvisible?: boolean;

  /**
   * Background color when hovering over items.
   */
  itemHoverBg?: string;

  /**
   * Effects to apply when hovering over items.
   */
  itemHoverEffects?: any;

  /**
   * Effects to apply when items are focused.
   */
  itemFocusEffects?: any;
}

export interface FileManagerOptions extends ListOptions<ListElementStyle> {
  /**
   * Current working directory.
   */
  cwd?: string;
}

export interface ListTableOptions extends ListOptions<StyleListTable> {
  /**
   * Array of array of strings representing rows.
   */
  rows?: string[];

  /**
   * Array of array of strings representing rows (same as rows).
   */
  data?: string[][];

  /**
   * Spaces to attempt to pad on the sides of each cell. 2 by default: one space on each side
   * (only useful if the width is shrunken).
   */
  pad?: number;

  /**
   * Do not draw inner cells.
   */
  noCellBorders?: boolean;

  /**
   * Fill cell borders with the adjacent background color.
   */
  fillCellBorders?: boolean;

  /**
   * Style configuration for the list table including header and cell styles.
   */
  style?: StyleListTable;
}

export interface ListbarOptions extends BoxOptions {
  /**
   * Style configuration for the listbar.
   */
  style?: ListElementStyle;

  /**
   * Set buttons using an array of command objects containing keys and callbacks.
   */
  commands?: any[];

  /**
   * Array of items for the listbar (same as commands).
   */
  items?: any[];

  /**
   * Automatically bind list buttons to keys 0-9.
   */
  autoCommandKeys?: boolean;
}

export interface FormOptions extends BoxOptions {
  /**
   * Allow default keys (tab, vi keys, enter).
   */
  keys?: any;

  /**
   * Allow vi keys for navigation.
   */
  vi?: boolean;

  /**
   * Automatically focus next element after submission.
   */
  autoNext?: boolean;
}

export interface InputOptions extends BoxOptions {}

export interface TextareaOptions extends InputOptions {
  /**
   * Call readInput() when the element is focused. Automatically unfocus.
   */
  inputOnFocus?: boolean;

  /**
   * Initial value of the textarea.
   */
  value?: string;

  /**
   * Enable key support (can be boolean, string, or array of strings).
   */
  keys?: boolean | string | string[];

  /**
   * Enable vi key bindings.
   */
  vi?: boolean;
}

export interface TextboxOptions extends TextareaOptions {
  /**
   * Completely hide text.
   */
  secret?: boolean;

  /**
   * Replace text with asterisks (*).
   */
  censor?: boolean;
}

export interface ButtonOptions extends BoxOptions {
  /**
   * Background color when button is hovered.
   */
  hoverBg?: string;

  /**
   * Automatically focus this button when parent is shown.
   */
  autoFocus?: boolean;
}

export interface CheckboxOptions extends BoxOptions {
  /**
   * Whether the element is checked or not.
   */
  checked?: boolean;

  /**
   * Enable mouse support for clicking the checkbox.
   */
  mouse?: boolean;

  /**
   * Text to display next to the checkbox.
   */
  text?: string;
}

export interface RadioSetOptions extends BoxOptions {}

export interface RadioButtonOptions extends CheckboxOptions {}

export interface PromptOptions extends BoxOptions {}

export interface QuestionOptions extends BoxOptions {}

export interface MessageOptions extends BoxOptions {
  // vi and ignoreKeys inherited from ScrollableOptions
  // mouse inherited from ScrollableOptions
}

export interface LoadingOptions extends BoxOptions {}

export interface ProgressBarOptions extends BoxOptions {
  /**
   * Bar orientation. Can be horizontal or vertical.
   */
  orientation?: string;

  /**
   * The character to fill the bar with (default is space).
   */
  pch?: string;

  /**
   * The amount filled (0 - 100).
   */
  filled?: number | string;

  /**
   * Same as filled. The current progress value.
   */
  value?: number;

  /**
   * Enable key support for controlling the progress bar.
   */
  keys?: boolean;

  /**
   * Enable mouse support for controlling the progress bar.
   */
  mouse?: boolean;

  /**
   * Foreground color for the filled portion of the bar.
   */
  barFg?: string;

  /**
   * Background color for the filled portion of the bar.
   */
  barBg?: string;

  /**
   * Character to use for the filled portion (same as pch).
   */
  bch?: string;

  /**
   * Character to use for rendering the bar.
   */
  ch?: string;
}

export interface LogOptions extends ScrollableTextOptions {
  /**
   * Amount of scrollback allowed. Default: Infinity.
   */
  scrollback?: number;

  /**
   * Scroll to bottom on input even if the user has scrolled up.
   *
   * @default false
   */
  scrollOnInput?: boolean;

  /**
   * Static header text that doesn't scroll with log content.
   * Always visible at the top of the log widget.
   *
   * @example
   * const log = new Log({
   *   staticHeader: '=== Application Logs ===',
   *   scrollback: 1000
   * });
   */
  staticHeader?: string;

  /**
   * Static footer text that doesn't scroll with log content.
   * Always visible at the bottom of the log widget.
   *
   * @example
   * const log = new Log({
   *   staticFooter: '[Scroll: ↑/↓ | Quit: q]',
   *   scrollback: 1000
   * });
   */
  staticFooter?: string;
}

export interface StaticOptions<T = any> extends BoxOptions {
  /**
   * Array of items to render.
   * Items are immutable once rendered - new items added to the array will be
   * rendered, but previous items will never be re-rendered.
   */
  items?: T[];

  /**
   * Function to render each item to a string.
   * Receives the item and its index in the items array.
   *
   * @param item - The item to render
   * @param index - The index of the item in the items array
   * @returns String representation of the item
   *
   * @example
   * ```typescript
   * renderItem: (task, index) => `${index + 1}. ${task.name} - ${task.status}`
   * ```
   */
  renderItem?: (item: T, index: number) => string;
}

export interface DialogOptions extends BoxOptions {
  /**
   * Whether the dialog is initially hidden.
   *
   * @default true
   */
  hidden?: boolean;
}

export interface TableOptions extends BoxOptions {
  /**
   * Array of array of strings representing rows (same as data).
   */
  rows?: string[][];

  /**
   * Array of array of strings representing rows (same as rows).
   */
  data?: string[][];

  /**
   * Spaces to attempt to pad on the sides of each cell. 2 by default: one space on each side
   * (only useful if the width is shrunken).
   */
  pad?: number;

  /**
   * Do not draw inner cells.
   */
  noCellBorders?: boolean;

  /**
   * Fill cell borders with the adjacent background color.
   */
  fillCellBorders?: boolean;
}

export interface TerminalOptions extends BoxOptions {
  /**
   * Handler function for processing user input data.
   */
  handler?(userInput: BufferType): void;

  /**
   * Name of shell to use. Defaults to $SHELL environment variable.
   */
  shell?: string;

  /**
   * Arguments to pass to the shell.
   */
  args?: any;

  /**
   * Cursor style. Can be line, underline, or block.
   */
  cursor?: "line" | "underline" | "block";

  /**
   * Terminal type identifier.
   */
  terminal?: string;

  /**
   * Alias for terminal property.
   */
  term?: string;

  /**
   * Environment variables object for the terminal process.
   */
  env?: any;

  /**
   * Whether the cursor should blink.
   */
  cursorBlink?: boolean;

  /**
   * Enable screen keys for terminal interaction.
   */
  screenKeys?: boolean;
}

export interface ImageOptions extends BoxOptions {
  /**
   * Path to image file to display.
   */
  file?: string;

  /**
   * Image rendering type: ansi, overlay, or w3m.
   */
  type?: "ansi" | "overlay" | "w3m";

  /**
   * Image rendering type (alias for type).
   */
  itype?: "ansi" | "overlay" | "w3m";
}

export interface ANSIImageOptions extends BoxOptions {
  /**
   * URL or path to PNG/GIF file. Can also be a buffer.
   */
  file?: string;

  /**
   * Scale cellmap down (0-1.0) from its original pixel width/height (Default: 1.0).
   */
  scale?: number;

  /**
   * This differs from other element's width or height in that only one
   * of them is needed: blessed will maintain the aspect ratio of the image
   * as it scales down to the proper number of cells. NOTE: PNG/GIF's are
   * always automatically shrunken to size (based on scale) if a width or
   * height is not given.
   */
  width?: number | string;

  /**
   * This differs from other element's width or height in that only one
   * of them is needed: blessed will maintain the aspect ratio of the image
   * as it scales down to the proper number of cells. NOTE: PNG/GIF's are
   * always automatically shrunken to size (based on scale) if a width or
   * height is not given.
   */
  height?: number | string;

  /**
   * Add various "density" ASCII characters over the rendering to give the
   * image more detail, similar to libcaca/libcucul (the library mplayer uses
   * to display videos in the terminal).
   */
  ascii?: boolean;

  /**
   * Whether to animate if the image is an APNG/animating GIF. If false, only
   * display the first frame or IDAT (Default: true).
   */
  animate?: boolean;

  /**
   * Set the speed of animation. Slower: 0.0-1.0. Faster: 1-1000. It cannot go
   * faster than 1 frame per millisecond, so 1000 is the fastest. (Default: 1.0)
   */
  speed?: number;

  /**
   * mem or cpu. If optimizing for memory, animation frames will be rendered to
   * bitmaps as the animation plays, using less memory. Optimizing for cpu will
   * precompile all bitmaps beforehand, which may be faster, but might also OOM
   * the process on large images. (Default: mem).
   */
  optimization?: "mem" | "cpu";
}

export interface OverlayImageOptions extends BoxOptions {
  /**
   * Path to image file to display.
   */
  file?: string;

  /**
   * Render the file as ANSI art instead of using w3m to overlay. Internally uses the
   * ANSIImage element. See the ANSIImage element for more information/options. (Default: true).
   */
  ansi?: boolean;

  /**
   * Path to w3mimgdisplay. If a proper w3mimgdisplay path is not given, blessed will
   * search the entire disk for the binary.
   */
  w3m?: string;

  /**
   * Whether to search /usr, /bin, and /lib for w3mimgdisplay (Default: true).
   */
  search?: boolean;

  /**
   * Image data or path (alternative to file property).
   */
  img?: string;

  /**
   * Automatically fit the image to the element size.
   */
  autofit?: boolean;
}

export interface VideoOptions extends BoxOptions {
  /**
   * Path to video file to play.
   */
  file?: string;

  /**
   * Start time in seconds for video playback.
   */
  start?: number;
}

export interface LayoutOptions extends ElementOptions {
  /**
   * A callback which is called right before the children are iterated over to be rendered. Should return an
   * iterator callback which is called on each child element: iterator(el, i).
   */
  renderer?(coords: any): (el: any, i: number) => any;

  /**
   * Using the default renderer, it provides two layouts: inline, and grid. inline is the default and will render
   * akin to inline-block. grid will create an automatic grid based on element dimensions. The grid cells'
   * width and height are always determined by the largest children in the layout.
   */
  layout?: "inline" | "inline-block" | "grid";
}

export interface ScreenOptions extends NodeOptions {
  /**
   * The blessed Program to be associated with. Will be automatically instantiated if none is provided.
   */
  program?: any;

  /**
   * Attempt to perform CSR optimization on all possible elements (not just full-width ones, elements with
   * uniform cells to their sides). This is known to cause flickering with elements that are not full-width,
   * however, it is more optimal for terminal rendering.
   */
  smartCSR?: boolean;

  /**
   * Do CSR on any element within 20 cols of the screen edge on either side. Faster than smartCSR,
   * but may cause flickering depending on what is on each side of the element.
   */
  fastCSR?: boolean;

  /**
   * Attempt to perform back_color_erase optimizations for terminals that support it. It will also work
   * with terminals that don't support it, but only on lines with the default background color. As it
   * stands with the current implementation, it's uncertain how much terminal performance this adds at
   * the cost of overhead within node.
   */
  useBCE?: boolean;

  /**
   * Amount of time (in ms) to redraw the screen after the terminal is resized (Default: 300).
   */
  resizeTimeout?: number;

  /**
   * The width of tabs within an element's content.
   */
  tabSize?: number;

  /**
   * Automatically position child elements with border and padding in mind (NOTE: this is a recommended
   * option. It may become default in the future).
   */
  autoPadding?: boolean;

  cursor?: Cursor;

  /**
   * Create a log file. See log method.
   */
  log?: string;

  /**
   * Dump all output and input to desired file. Can be used together with log option if set as a boolean.
   */
  dump?: string | boolean;

  /**
   * Debug mode. Enables usage of the debug method. Also creates a debug console which will display when
   * pressing F12. It will display all log and debug messages.
   */
  debug?: boolean;

  /**
   * Array of keys in their full format (e.g. C-c) to ignore when keys are locked or grabbed. Useful
   * for creating a key that will always exit no matter whether the keys are locked.
   */
  ignoreLocked?: string[];

  /**
   * Automatically "dock" borders with other elements instead of overlapping, depending on position
   * (experimental). For example: These border-overlapped elements:
   */
  dockBorders?: boolean;

  /**
   * Normally, dockable borders will not dock if the colors or attributes are different. This option
   * will allow them to dock regardless. It may produce some odd looking multi-colored borders though.
   */
  ignoreDockContrast?: boolean;

  /**
   * Allow for rendering of East Asian double-width characters, utf-16 surrogate pairs, and unicode
   * combining characters. This allows you to display text above the basic multilingual plane. This
   * is behind an option because it may affect performance slightly negatively. Without this option
   * enabled, all double-width, surrogate pair, and combining characters will be replaced by '??',
   * '?', '' respectively. (NOTE: iTerm2 cannot display combining characters properly. Blessed simply
   * removes them from an element's content if iTerm2 is detected).
   */
  fullUnicode?: boolean;

  /**
   * Send focus events after mouse is enabled.
   */
  sendFocus?: boolean;

  /**
   * Display warnings (such as the output not being a TTY, similar to ncurses).
   */
  warnings?: boolean;

  /**
   * Force blessed to use unicode even if it is not detected via terminfo, env variables, or windows code page.
   * If value is true unicode is forced. If value is false non-unicode is forced (default: null).
   */
  forceUnicode?: boolean;

  /**
   * Input and output streams. process.stdin/process.stdout by default, however, it could be a
   * net.Socket if you want to make a program that runs over telnet or something of that nature.
   */
  input?: WritableType;

  /**
   * Input and output streams. process.stdin/process.stdout by default, however, it could be a
   * net.Socket if you want to make a program that runs over telnet or something of that nature.
   */
  output?: ReadableType;

  /**
   * The blessed Tput object (only available if you passed tput: true to the Program constructor.)
   */
  tput?: any;

  /**
   * Top of the focus history stack.
   */
  focused?: BlessedElement;

  /**
   * Width of the screen (same as program.cols).
   */
  width?: PositionValue;

  /**
   * Height of the screen (same as program.rows).
   */
  height?: PositionValue;

  /**
   * Same as screen.width.
   */
  cols?: number;

  /**
   * Same as screen.height.
   */
  rows?: number;

  /**
   * Relative top offset, always zero.
   */
  top?: PositionValue;

  /**
   * Relative left offset, always zero.
   */
  left?: PositionValue;

  /**
   * Relative right offset, always zero.
   */
  right?: PositionValue;

  /**
   * Relative bottom offset, always zero.
   */
  bottom?: PositionValue;

  /**
   * Absolute top offset, always zero.
   */
  atop?: PositionValue;

  /**
   * Absolute left offset, always zero.
   */
  aleft?: PositionValue;

  /**
   * Absolute right offset, always zero.
   */
  aright?: PositionValue;

  /**
   * Absolute bottom offset, always zero.
   */
  abottom?: PositionValue;

  /**
   * Whether the focused element grabs all keypresses.
   */
  grabKeys?: boolean;

  /**
   * Prevent keypresses from being received by any element.
   */
  lockKeys?: boolean;

  /**
   * The currently hovered element. Only set if mouse events are bound.
   */
  hover?: any;

  /**
   * Set or get terminal name. Set calls screen.setTerminal() internally.
   */
  terminal?: string;

  /**
   * Set or get window title.
   */
  title?: string;

  /**
   * Reset y position on resize.
   */
  rsety?: boolean;

  /**
   * Listen for events on the screen.
   */
  listen?: boolean;

  /**
   * Terminal type (alias for terminal property).
   */
  term?: string;

  /**
   * Use an artificial cursor instead of the terminal's cursor.
   */
  artificialCursor?: boolean;

  /**
   * Shape of the cursor (block, underline, or line).
   */
  cursorShape?: string;

  /**
   * Whether the cursor should blink.
   */
  cursorBlink?: boolean;

  /**
   * Color of the cursor. Set to null for default color.
   */
  cursorColor?: string | null;
}
