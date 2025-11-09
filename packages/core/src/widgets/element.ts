/**
 * element.ts - base element for blessed
 */

/**
 * Modules
 */

import { getBorderChars } from "../lib/border-styles.js";
import colors from "../lib/colors.js";
import helpers from "../lib/helpers.js";
import { getEnvVar, getNextTick } from "../lib/runtime-helpers.js";
import { truncateText } from "../lib/text-utils.js";
import unicode from "../lib/unicode.js";
import { getGlobalWrapCache } from "../lib/wrap-cache.js";
import {
  makeAnimatable,
  type AnimatableMethods,
} from "../mixins/animatable.js";
import {
  makeScrollable,
  type ScrollableMethods,
} from "../mixins/scrollable.js";
import type {
  Border,
  ElementOptions,
  MouseEvent,
  Padding,
  RenderCoords,
  ScrollbarConfig,
  Style,
  TextWrapMode,
  TrackConfig,
} from "../types";
import Node from "./node.js";

const nextTick = getNextTick();

/**
 * Element
 */

/**
 * Wrapped content array with metadata
 */
interface WrappedContent extends Array<string> {
  rtof: number[];
  ftor: number[][];
  fake: string[];
  real: string[];
  mwidth: number;
}

class Element extends Node {
  override type = "element";
  declare options: ElementOptions;

  name?: string;
  /**
   * Position specification. Can be relative coordinates or keywords.
   * Kept as any due to complex internal position calculation system.
   */
  position: any;
  noOverflow?: boolean;
  dockBorders?: boolean;
  shadow?: boolean;
  /** Element style configuration (colors, attributes, hover/focus effects) */
  style: Style;
  hidden: boolean;
  fixed: boolean;
  align: string;
  valign: string;
  wrap: boolean;
  textWrap?: TextWrapMode;
  shrink?: boolean;
  ch: string;
  /** Padding configuration for all sides */
  padding: Padding;
  /** Border configuration */
  border?: Border;
  parseTags?: boolean;
  content: string = ""; // Initialize to empty string
  /** Last rendered position coordinates */
  lpos?: RenderCoords;
  _clines?: any;
  _pcontent?: string;
  _borderColors?: (string | number)[]; // Addressable border colors array
  _slisteners?: any[];
  _label?: any;
  _labelScroll?: () => void;
  _labelResize?: () => void;
  _hoverOptions?: any;
  _draggable?: boolean;
  _dragMD?: (data: MouseEvent) => void;
  _dragM?: (data: MouseEvent) => void;
  _drag?: any;
  _noFill?: boolean;
  _isLabel?: boolean;
  _isList?: boolean;
  childBase?: number;
  childOffset?: number;
  alwaysScroll?: boolean;
  baseLimit?: number;
  track?: TrackConfig;
  scrollbar?: ScrollbarConfig;
  items?: any[];

  // Scrollable mixin - flag indicating if element is scrollable
  scrollable?: boolean;

  // Scrollable mixin methods - added at runtime by makeScrollable()
  scroll?: ScrollableMethods["scroll"];
  scrollTo?: ScrollableMethods["scrollTo"];
  setScroll?: ScrollableMethods["setScroll"];
  getScroll?: ScrollableMethods["getScroll"];
  getScrollHeight?: ScrollableMethods["getScrollHeight"];
  getScrollPerc?: ScrollableMethods["getScrollPerc"];
  setScrollPerc?: ScrollableMethods["setScrollPerc"];
  resetScroll?: ScrollableMethods["resetScroll"];
  _scrollBottom?: ScrollableMethods["_scrollBottom"];
  _recalculateIndex?: ScrollableMethods["_recalculateIndex"];

  // Animatable mixin - flag indicating if element supports animations
  animatable?: boolean;

  // Animatable mixin methods - added at runtime by makeAnimatable()
  animateBorderColors?: AnimatableMethods["animateBorderColors"];
  pulse?: AnimatableMethods["pulse"];

  get focused(): boolean {
    return this.screen.focused === this;
  }

  constructor(options: ElementOptions = {}) {
    super(options);

    this.name = options.name;

    options.position = options.position || {
      left: options.left,
      right: options.right,
      top: options.top,
      bottom: options.bottom,
      width: options.width,
      height: options.height,
    };

    if (
      options.position.width === "shrink" ||
      options.position.height === "shrink"
    ) {
      if (options.position.width === "shrink") {
        delete options.position.width;
      }
      if (options.position.height === "shrink") {
        delete options.position.height;
      }
      options.shrink = true;
    }

    this.position = options.position;

    this.noOverflow = options.noOverflow;
    this.dockBorders = options.dockBorders;
    this.shadow = options.shadow;

    this.style = options.style;

    if (!this.style) {
      this.style = {};
      this.style.fg = options.fg;
      this.style.bg = options.bg;
      this.style.bold = options.bold;
      this.style.underline = options.underline;
      this.style.blink = options.blink;
      this.style.inverse = options.inverse;
      this.style.invisible = options.invisible;
      this.style.transparent = options.transparent;
    }

    this.hidden = options.hidden || false;
    this.fixed = options.fixed || false;
    this.align = options.align || "left";
    this.valign = options.valign || "top";
    this.wrap = options.wrap !== false;
    this.textWrap = options.textWrap;
    this.shrink = options.shrink;
    this.ch = options.ch || " ";

    if (typeof options.padding === "number" || !options.padding) {
      const paddingValue = options.padding || 0;
      options.padding = {
        left: paddingValue,
        top: paddingValue,
        right: paddingValue,
        bottom: paddingValue,
      };
    }

    this.padding = {
      left: options.padding.left ?? 0,
      top: options.padding.top ?? 0,
      right: options.padding.right ?? 0,
      bottom: options.padding.bottom ?? 0,
    };

    // Handle border configuration
    if (options.border) {
      let border: Border;
      if (typeof options.border === "string") {
        border = { type: options.border as "line" | "bg" };
      } else {
        border = options.border;
      }
      border.type = border.type || "bg";
      // 'ascii' is a legacy alias for 'line'
      if (border.type === ("ascii" as any)) border.type = "line";
      border.ch = border.ch || " ";
      // Backward compat: old Border objects may have had a 'style' property
      this.style.border = this.style.border || (border as any).style;
      if (!this.style.border) {
        this.style.border = {};
        this.style.border.fg = border.fg;
        this.style.border.bg = border.bg;
      }
      //border.style = this.style.border;
      if (border.left == null) border.left = true;
      if (border.top == null) border.top = true;
      if (border.right == null) border.right = true;
      if (border.bottom == null) border.bottom = true;
      this.border = border;

      // Initialize addressable border colors array if provided
      if (border.colors) {
        this._borderColors = [...border.colors];
      }
    }

    // if (options.mouse || options.clickable) {
    if (options.clickable) {
      this.screen._listenMouse(this);
    }

    if (options.input || options.keyable) {
      this.screen._listenKeys(this);
    }

    this.parseTags = options.parseTags || options.tags;

    this.setContent(options.content || "", true);

    if (options.label) {
      this.setLabel(options.label);
    }

    if (options.hoverText) {
      this.setHover(options.hoverText);
    }

    // TODO: Possibly move this to Node for onScreenEvent('mouse', ...).
    this.on("newListener", (type: string) => {
      // type = type.split(' ').slice(1).join(' ');
      if (
        type === "mouse" ||
        type === "click" ||
        type === "mouseover" ||
        type === "mouseout" ||
        type === "mousedown" ||
        type === "mouseup" ||
        type === "mousewheel" ||
        type === "wheeldown" ||
        type === "wheelup" ||
        type === "mousemove"
      ) {
        this.screen._listenMouse(this);
      } else if (type === "keypress" || type.indexOf("key ") === 0) {
        this.screen._listenKeys(this);
      }
    });

    this.on("resize", () => {
      this.parseContent();
    });

    this.on("attach", () => {
      this.parseContent();
    });

    this.on("detach", () => {
      delete this.lpos;
    });

    if (options.hoverBg != null) {
      options.hoverEffects = options.hoverEffects || {};
      options.hoverEffects.bg = options.hoverBg;
    }

    if (this.style.hover) {
      options.hoverEffects = this.style.hover;
    }

    if (this.style.focus) {
      options.focusEffects = this.style.focus;
    }

    if (options.effects) {
      if (options.effects.hover) options.hoverEffects = options.effects.hover;
      if (options.effects.focus) options.focusEffects = options.effects.focus;
    }

    [
      ["hoverEffects", "mouseover", "mouseout", "_htemp"],
      ["focusEffects", "focus", "blur", "_ftemp"],
    ].forEach((props: any) => {
      const pname = props[0],
        over = props[1],
        out = props[2],
        temp = props[3];
      this.screen.setEffects(
        this,
        this,
        over,
        out,
        (this.options as any)[pname],
        temp,
      );
    });

    if (options.draggable) {
      this.draggable = true;
    }

    if (options.focused) {
      this.focus();
    }

    // Apply scrollable behavior if requested (skip if already a ScrollableBox subclass)
    if (options.scrollable && options.type !== "scrollable-box") {
      makeScrollable(this, options);
    }

    // Apply animatable behavior if requested
    if (options.animatable) {
      makeAnimatable(this);
    }
  }

  sattr(style: any, fg?: any, bg?: any): number {
    let bold = style.bold;
    let dim = style.dim;
    let underline = style.underline;
    let blink = style.blink;
    let inverse = style.inverse;
    let invisible = style.invisible;

    // if (arguments.length === 1) {
    if (fg == null && bg == null) {
      fg = style.fg;
      bg = style.bg;
    }

    // This used to be a loop, but I decided
    // to unroll it for performance's sake.
    if (typeof bold === "function") bold = bold(this);
    if (typeof dim === "function") dim = dim(this);
    if (typeof underline === "function") underline = underline(this);
    if (typeof blink === "function") blink = blink(this);
    if (typeof inverse === "function") inverse = inverse(this);
    if (typeof invisible === "function") invisible = invisible(this);

    if (typeof fg === "function") fg = fg(this);
    if (typeof bg === "function") bg = bg(this);

    // return (this.uid << 24)
    //   | ((this.dockBorders ? 32 : 0) << 18)
    return (
      ((invisible ? 16 : 0) << 18) |
      ((inverse ? 8 : 0) << 18) |
      ((blink ? 4 : 0) << 18) |
      ((underline ? 2 : 0) << 18) |
      ((bold ? 1 : 0) << 18) |
      ((dim ? 32 : 0) << 18) |
      (colors.convert(fg) << 9) |
      colors.convert(bg)
    );
  }

  /**
   * Same as el.on('screen', ...) except this will automatically keep track of which listeners
   * are bound to the screen object. For use with removeScreenEvent(), free(), and destroy().
   * @param type - Event type
   * @param handler - Event handler function
   */
  onScreenEvent(type: string, handler: (...args: any[]) => void): void {
    const listeners = (this._slisteners = this._slisteners || []);
    listeners.push({ type: type, handler: handler });
    this.screen.on(type, handler);
  }

  /**
   * Same as onScreenEvent() but fires only once.
   * @param type - Event type
   * @param handler - Event handler function
   */
  onceScreenEvent(type: string, handler: (...args: any[]) => void): void {
    const listeners = (this._slisteners = this._slisteners || []);
    const entry = { type: type, handler: handler };
    listeners.push(entry);
    this.screen.once(type, (...args: any[]) => {
      const i = listeners.indexOf(entry);
      if (~i) listeners.splice(i, 1);
      return handler.apply(this, args);
    });
  }

  /**
   * Same as el.removeListener('screen', ...) except this will automatically keep track of which
   * listeners are bound to the screen object. For use with onScreenEvent(), free(), and destroy().
   * @param type - Event type
   * @param handler - Event handler function
   */
  removeScreenEvent(type: string, handler: (...args: any[]) => void): void {
    const listeners = (this._slisteners = this._slisteners || []);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      if (listener.type === type && listener.handler === handler) {
        listeners.splice(i, 1);
        if (this._slisteners.length === 0) {
          delete this._slisteners;
        }
        break;
      }
    }
    this.screen.removeListener(type, handler);
  }

  /**
   * Free up the element. Automatically unbind all events that may have been bound to the screen
   * object. This prevents memory leaks. For use with onScreenEvent(), removeScreenEvent(),
   * and destroy().
   */
  override free(): void {
    const listeners = (this._slisteners = this._slisteners || []);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      this.screen.removeListener(listener.type, listener.handler);
    }
    delete this._slisteners;
  }

  /**
   * Hide element.
   */
  hide(): void {
    if (this.hidden) return;
    this.clearPos();
    this.hidden = true;
    this.emit("hide");
    if (this.screen.focused === this) {
      this.screen.rewindFocus();
    }
  }

  /**
   * Show element.
   */
  show(): void {
    if (!this.hidden) return;
    this.hidden = false;
    this.emit("show");
  }

  /**
   * Toggle hidden/shown.
   */
  toggle(): void {
    return this.hidden ? this.show() : this.hide();
  }

  /**
   * Focus element.
   */
  focus(): any {
    return (this.screen.focused = this);
  }

  /**
   * Check if this element can receive keyboard focus.
   * Elements are focusable if they have tabIndex >= -1.
   */
  isFocusable(): boolean {
    return this.options.tabIndex !== undefined && this.options.tabIndex >= -1;
  }

  /**
   * Check if element participates in Tab key navigation.
   * Elements with tabIndex=-1 are focusable but excluded from Tab order.
   */
  isInTabOrder(): boolean {
    if (!this.isFocusable()) return false;
    if (this.options.tabIndex === -1) return false;
    return true;
  }

  /**
   * Get effective tab index for focus navigation ordering.
   */
  getTabIndex(): number {
    if (this.options.tabIndex !== undefined && this.options.tabIndex >= 0) {
      return this.options.tabIndex;
    }
    return Infinity;
  }

  /**
   * Set or get the content. Note: When text is input, it will be stripped of all non-SGR
   * escape codes, tabs will be replaced with 8 spaces, and tags will be replaced
   * with SGR codes (if enabled).
   */
  setContent(content: string, noClear?: boolean, noTags?: boolean): void {
    if (!noClear) this.clearPos();
    this.content = content || "";
    this.parseContent(noTags);
    this.emit("set content");
  }

  /**
   * Return content, slightly different from el.content. Assume the above formatting.
   */
  getContent(): string {
    if (!this._clines) return "";
    return this._clines.fake.join("\n");
  }

  /**
   * Get the border perimeter length (number of border cells).
   * Useful for creating colors arrays for addressable border animations.
   * @returns Number of border cells, or 0 if no border
   * @example
   * const box = new Box({ width: 20, height: 10, border: { type: 'line' } });
   * console.log(box.getBorderLength()); // 56 (2 * (20 + 10) - 4)
   */
  getBorderLength(): number {
    if (!this.border) return 0;
    const w = this.width || 0;
    const h = this.height || 0;
    return 2 * (w + h) - 4;
  }

  /**
   * Get the current border colors array (for addressable border animations).
   * Returns a copy to prevent external mutations.
   * @returns Copy of colors array, or empty array if not set
   * @example
   * const colors = box.getBorderColors();
   * const rotated = rotateColors(colors, 1);
   * box.setBorderColors(rotated);
   */
  getBorderColors(): (string | number)[] {
    return this._borderColors ? [...this._borderColors] : [];
  }

  /**
   * Set border colors array for addressable border animations.
   * Stores an internal copy to prevent external mutations.
   * Call screen.render() after to see changes.
   * @param colors - Array of colors (names, hex codes, or numeric codes)
   * @example
   * // Rainbow animation
   * const colors = generateRainbow(box.getBorderLength());
   * box.setBorderColors(colors);
   * screen.render();
   *
   * // Later, animate
   * setInterval(() => {
   *   const rotated = rotateColors(box.getBorderColors(), 1);
   *   box.setBorderColors(rotated);
   *   screen.render();
   * }, 100);
   */
  setBorderColors(colors: (string | number)[]): void {
    this._borderColors = [...colors];
  }

  /**
   * Similar to setContent, but ignore tags and remove escape codes.
   */
  setText(content: string, noClear?: boolean): void {
    content = content || "";
    content = content.replace(/\x1b\[[\d;]*m/g, "");
    return this.setContent(content, noClear, true);
  }

  /**
   * Similar to getContent, but return content with tags and escape codes removed.
   */
  getText(): string {
    return this.getContent().replace(/\x1b\[[\d;]*m/g, "");
  }

  parseContent(noTags?: boolean): boolean {
    if (this.detached) return false;

    const width = this.width - this.iwidth;
    if (
      this._clines == null ||
      this._clines.width !== width ||
      this._clines.content !== this.content
    ) {
      let content = this.content;

      content = content
        .replace(/[\x00-\x08\x0b-\x0c\x0e-\x1a\x1c-\x1f\x7f]/g, "")
        .replace(/\x1b(?!\[[\d;]*m)/g, "")
        .replace(/\r\n|\r/g, "\n")
        .replace(/\t/g, this.screen.tabc);

      if (this.screen.fullUnicode) {
        // double-width chars will eat the next char after render. create a
        // blank character after it so it doesn't eat the real next char.
        // For XTerm.js in browsers, we still need padding but use a space instead of \x03
        // because XTerm will handle the wide char natively and we don't want \x03 to render.
        if (getEnvVar("TERM") === "xterm-256color") {
          // For XTerm: Add space padding (XTerm will skip it visually)
          content = unicode.padWideChars(content).replace(/\x03/g, " ");
        } else {
          // For traditional terminals: Add \x03 padding
          content = unicode.padWideChars(content);
        }

        // iTerm2 cannot render combining characters properly.
        if (this.screen.program.isiTerm2) {
          content = content.replace(unicode.chars.combining, "");
        }
      } else {
        // no double-width: replace them with question-marks.
        content = unicode.replaceWideChars(content);
        // delete combining characters since they're 0-width anyway.
        // NOTE: We could drop this, the non-surrogates would get changed to ? by
        // the unicode filter, and surrogates changed to ? by the surrogate
        // regex. however, the user might expect them to be 0-width.
        // NOTE: Might be better for performance to drop!
        content = content.replace(unicode.chars.combining, "");
        // no surrogate pairs: replace them with question-marks.
        content = content.replace(unicode.chars.surrogate, "?");
        // XXX Deduplicate code here:
        // content = helpers.dropUnicode(content);
      }

      if (!noTags) {
        content = this._parseTags(content);
      }

      this._clines = this._wrapContent(content, width);
      this._clines.width = width;
      this._clines.content = this.content;
      this._clines.attr = this._parseAttr(this._clines);
      this._clines.ci = [];
      this._clines.reduce((total: number, line: string) => {
        this._clines.ci.push(total);
        return total + line.length + 1;
      }, 0);

      this._pcontent = this._clines.join("\n");
      this.emit("parsed content");

      return true;
    }

    // Need to calculate this every time because the default fg/bg may change.
    this._clines.attr = this._parseAttr(this._clines) || this._clines.attr;

    return false;
  }

  // Convert `{red-fg}foo{/red-fg}` to `\x1b[31mfoo\x1b[39m`.
  _parseTags(text: string): string {
    if (!this.parseTags) return text;
    if (!/{\/?[\w\-,;!#]*}/.test(text)) return text;

    const program = this.screen.program;
    let out = "";
    let state: any;
    const bg: any[] = [];
    const fg: any[] = [];
    const flag: any[] = [];
    let cap: any;
    let slash: boolean;
    let param: string;
    let attr: any;
    let esc: boolean = false;

    for (;;) {
      if (!esc && (cap = /^{escape}/.exec(text))) {
        text = text.substring(cap[0].length);
        esc = true;
        continue;
      }

      if (esc && (cap = /^([\s\S]+?){\/escape}/.exec(text))) {
        text = text.substring(cap[0].length);
        out += cap[1];
        esc = false;
        continue;
      }

      if (esc) {
        // throw new Error('Unterminated escape tag.');
        out += text;
        break;
      }

      if ((cap = /^{(\/?)([\w\-,;!#]*)}/.exec(text))) {
        text = text.substring(cap[0].length);
        slash = cap[1] === "/";
        param = cap[2].replace(/-/g, " ");

        if (param === "open") {
          out += "{";
          continue;
        } else if (param === "close") {
          out += "}";
          continue;
        }

        if (param.slice(-3) === " bg") state = bg;
        else if (param.slice(-3) === " fg") state = fg;
        else state = flag;

        if (slash) {
          if (!param) {
            out += program._attr("normal");
            bg.length = 0;
            fg.length = 0;
            flag.length = 0;
          } else {
            attr = program._attr(param, false);
            if (attr == null) {
              out += cap[0];
            } else {
              // if (param !== state[state.length - 1]) {
              //   throw new Error('Misnested tags.');
              // }
              state.pop();
              if (state.length) {
                out += program._attr(state[state.length - 1]);
              } else {
                out += attr;
              }
            }
          }
        } else {
          if (!param) {
            out += cap[0];
          } else {
            attr = program._attr(param);
            if (attr == null) {
              out += cap[0];
            } else {
              state.push(param);
              out += attr;
            }
          }
        }

        continue;
      }

      if ((cap = /^[\s\S]+?(?={\/?[\w\-,;!#]*})/.exec(text))) {
        text = text.substring(cap[0].length);
        out += cap[0];
        continue;
      }

      out += text;
      break;
    }

    return out;
  }

  _parseAttr(lines: any): any {
    const dattr = this.sattr(this.style);
    let attr = dattr;
    const attrs: any[] = [];
    let line: string;
    let i: number;
    let j: number;
    let c: any;

    if (lines[0].attr === attr) {
      return;
    }

    for (j = 0; j < lines.length; j++) {
      line = lines[j];
      attrs[j] = attr;
      for (i = 0; i < line.length; i++) {
        if (line[i] === "\x1b") {
          if ((c = /^\x1b\[[\d;]*m/.exec(line.substring(i)))) {
            attr = this.screen.attrCode(c[0], attr, dattr);
            i += c[0].length - 1;
          }
        }
      }
    }

    return attrs;
  }

  _align(line: string, width: number, align?: string): string {
    if (!align) return line;
    //if (!align && !~line.indexOf('{|}')) return line;

    const cline = line.replace(/\x1b\[[\d;]*m/g, "");
    const len = cline.length;
    let s = width - len;

    if (this.shrink) {
      s = 0;
    }

    if (len === 0) return line;
    if (s < 0) return line;

    if (align === "center") {
      const spaces = Array(((s / 2) | 0) + 1).join(" ");
      return spaces + line + spaces;
    } else if (align === "right") {
      const spaces = Array(s + 1).join(" ");
      return spaces + line;
    } else if (this.parseTags && ~line.indexOf("{|}")) {
      const parts = line.split("{|}");
      const cparts = cline.split("{|}");
      s = Math.max(width - cparts[0].length - cparts[1].length, 0);
      const spaces = Array(s + 1).join(" ");
      return parts[0] + spaces + parts[1];
    }

    return line;
  }

  _wrapContent(content: string, width: number): WrappedContent {
    const tags = this.parseTags;
    let state = this.align;
    let margin = 0;

    // Determine wrapping mode
    // textWrap takes precedence over legacy wrap boolean
    let wrapMode: TextWrapMode | boolean;
    if (this.textWrap) {
      wrapMode = this.textWrap;
    } else {
      wrapMode = this.wrap;
    }

    // Check cache
    const cache = getGlobalWrapCache();
    const cacheKey = {
      content,
      width,
      wrapMode,
      fullUnicode: this.screen.fullUnicode,
      align: this.align,
      parseTags: !!this.parseTags,
    };

    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Early return for empty content
    if (!content) {
      const lines = content.split("\n");
      const out: string[] = [];
      out.push(content);
      const wrappedOut = out as WrappedContent;
      wrappedOut.rtof = [0];
      wrappedOut.ftor = [[0]];
      wrappedOut.fake = lines;
      wrappedOut.real = out;
      wrappedOut.mwidth = 0;
      cache.set(cacheKey, wrappedOut);
      return wrappedOut;
    }

    // Account for scrollbar and textarea margin
    if (this.scrollbar) margin++;
    if (this.type === "textarea") margin++;
    if (width > margin) width -= margin;

    const lines = content.split("\n");
    const rtof: any[] = [];
    const ftor: any[] = [];
    const out: string[] = [];

    // Handle truncation modes (ink-style)
    if (
      wrapMode === "truncate-end" ||
      wrapMode === "truncate-middle" ||
      wrapMode === "truncate-start"
    ) {
      // Simple truncation: each line is truncated independently
      for (let no = 0; no < lines.length; no++) {
        let line = lines[no];
        let align = state;

        ftor.push([]);

        // Handle alignment tags
        if (tags) {
          let cap: any;
          if ((cap = /^{(left|center|right)}/.exec(line))) {
            line = line.substring(cap[0].length);
            align = state = cap[1] !== "left" ? cap[1] : null;
          }
          if ((cap = /{\/(left|center|right)}$/.exec(line))) {
            line = line.slice(0, -cap[0].length);
            state = this.align;
          }
        }

        // Truncate line
        const position =
          wrapMode === "truncate-end"
            ? "end"
            : wrapMode === "truncate-middle"
              ? "middle"
              : "start";

        const truncated = truncateText(line, width, {
          position,
          fullUnicode: this.screen.fullUnicode,
        });

        out.push(this._align(truncated, width, align));
        ftor[no].push(out.length - 1);
        rtof.push(no);
      }
    } else {
      // Legacy wrapping logic (word wrap or hard truncate)
      const wrap = wrapMode === "wrap" || wrapMode === true;
      let no = 0;
      let line: string;
      let align: any;
      let cap: any;
      let total: number;
      let i: number;
      let part: string;
      let j: number;
      let rest: any;

      main: for (; no < lines.length; no++) {
        line = lines[no];
        align = state;

        ftor.push([]);

        // Handle alignment tags.
        if (tags) {
          if ((cap = /^{(left|center|right)}/.exec(line))) {
            line = line.substring(cap[0].length);
            align = state = cap[1] !== "left" ? cap[1] : null;
          }
          if ((cap = /{\/(left|center|right)}$/.exec(line))) {
            line = line.slice(0, -cap[0].length);
            //state = null;
            state = this.align;
          }
        }

        // If the string is apparently too long, wrap it.
        while (line.length > width) {
          // Measure the real width of the string.
          for (i = 0, total = 0; i < line.length; i++) {
            while (line[i] === "\x1b") {
              while (line[i] && line[i++] !== "m");
            }
            if (!line[i]) break;
            if (++total === width) {
              // If we're not wrapping the text, we have to finish up the rest of
              // the control sequences before cutting off the line.
              i++;
              if (!wrap) {
                rest = line.substring(i).match(/\x1b\[[^m]*m/g);
                rest = rest ? rest.join("") : "";
                out.push(
                  this._align(line.substring(0, i) + rest, width, align),
                );
                ftor[no].push(out.length - 1);
                rtof.push(no);
                continue main;
              }
              if (!this.screen.fullUnicode) {
                // Try to find a space to break on.
                if (i !== line.length) {
                  j = i;
                  while (j > i - 10 && j > 0 && line[--j] !== " ");
                  if (line[j] === " ") i = j + 1;
                }
              } else {
                // Try to find a character to break on.
                if (i !== line.length) {
                  // <XXX>
                  // Compensate for surrogate length
                  // counts on wrapping (experimental):
                  // NOTE: Could optimize this by putting
                  // it in the parent for loop.
                  if (unicode.isSurrogate(line, i)) i--;
                  let s = 0,
                    n = 0;
                  for (; n < i; n++) {
                    if (unicode.isSurrogate(line, n)) {
                      s++;
                      n++;
                    }
                  }
                  i += s;
                  // </XXX>
                  j = i;
                  // Break _past_ space.
                  // Break _past_ double-width chars.
                  // Break _past_ surrogate pairs.
                  // Break _past_ combining chars.
                  while (j > i - 10 && j > 0) {
                    j--;
                    if (
                      line[j] === " " ||
                      line[j] === "\x03" ||
                      (unicode.isSurrogate(line, j - 1) &&
                        line[j + 1] !== "\x03") ||
                      unicode.isCombining(line, j)
                    ) {
                      break;
                    }
                  }
                  if (
                    line[j] === " " ||
                    line[j] === "\x03" ||
                    (unicode.isSurrogate(line, j - 1) &&
                      line[j + 1] !== "\x03") ||
                    unicode.isCombining(line, j)
                  ) {
                    i = j + 1;
                  }
                }
              }
              break;
            }
          }

          part = line.substring(0, i);
          line = line.substring(i);

          out.push(this._align(part, width, align));
          ftor[no].push(out.length - 1);
          rtof.push(no);

          // Make sure we didn't wrap the line to the very end, otherwise
          // we get a pointless empty line after a newline.
          if (line === "") continue main;

          // If only an escape code got cut off, at it to `part`.
          if (/^(?:\x1b[\[\d;]*m)+$/.test(line)) {
            out[out.length - 1] += line;
            continue main;
          }
        }

        out.push(this._align(line, width, align));
        ftor[no].push(out.length - 1);
        rtof.push(no);
      }
    }

    // Build result
    const wrappedOut = out as WrappedContent;
    wrappedOut.rtof = rtof;
    wrappedOut.ftor = ftor;
    wrappedOut.fake = lines;
    wrappedOut.real = out;

    wrappedOut.mwidth = out.reduce((current: number, line: string) => {
      line = line.replace(/\x1b\[[\d;]*m/g, "");
      return line.length > current ? line.length : current;
    }, 0);

    // Store in cache
    cache.set(cacheKey, wrappedOut);

    return wrappedOut;
  }

  get visible(): boolean {
    let el: any = this;
    do {
      if (el.detached) return false;
      if (el.hidden) return false;
      // if (!el.lpos) return false;
      // if (el.position.width === 0 || el.position.height === 0) return false;
    } while ((el = el.parent));
    return true;
  }

  get _detached(): boolean {
    let el: any = this;
    do {
      if (el.type === "screen") return false;
      if (!el.parent) return true;
    } while ((el = el.parent));
    return false;
  }

  /**
   * Enable mouse events for the element (automatically called when a form of on('mouse') is bound).
   * Registers the element as clickable with the screen.
   */
  enableMouse(): void {
    this.screen._listenMouse(this);
  }

  /**
   * Enable keypress events for the element (automatically called when a form of on('keypress') is bound).
   * Registers the element as keyable with the screen.
   */
  enableKeys(): void {
    this.screen._listenKeys(this);
  }

  /**
   * Enable key and mouse events. Calls both enableMouse() and enableKeys().
   */
  enableInput(): void {
    this.screen._listenMouse(this);
    this.screen._listenKeys(this);
  }

  get draggable(): boolean {
    return this._draggable === true;
  }

  set draggable(draggable: any) {
    if (draggable) {
      this.enableDrag(draggable);
    } else {
      this.disableDrag();
    }
  }

  /**
   * Enable dragging of the element.
   * Allows the element to be dragged with the mouse. Automatically calls enableMouse().
   * @param verify - Optional callback function to verify if dragging should start (receives mouse data)
   * @returns True if dragging was enabled
   */
  enableDrag(verify?: any): boolean {
    if (this._draggable) return true;

    if (typeof verify !== "function") {
      verify = () => true;
    }

    this.enableMouse();

    this.on(
      "mousedown",
      (this._dragMD = (data: MouseEvent) => {
        if (this.screen._dragging) return;
        if (!verify(data)) return;
        this.screen._dragging = this;
        this._drag = {
          x: data.x - this.aleft,
          y: data.y - this.atop,
        };
        this.setFront();
      }),
    );

    this.onScreenEvent(
      "mouse",
      (this._dragM = (data: MouseEvent) => {
        if (this.screen._dragging !== this) return;

        if (data.action !== "mousedown" && data.action !== "mousemove") {
          delete this.screen._dragging;
          delete this._drag;
          return;
        }

        // This can happen in edge cases where the user is
        // already dragging and element when it is detached.
        if (!this.parent) return;

        const ox = this._drag.x;
        const oy = this._drag.y;
        const px = this.parent.aleft;
        const py = this.parent.atop;
        const x = data.x - px - ox;
        const y = data.y - py - oy;

        if (this.position.right != null) {
          if (this.position.left != null) {
            this.width = "100%-" + (this.parent.width - this.width);
          }
          this.position.right = null;
        }

        if (this.position.bottom != null) {
          if (this.position.top != null) {
            this.height = "100%-" + (this.parent.height - this.height);
          }
          this.position.bottom = null;
        }

        this.rleft = x;
        this.rtop = y;

        this.screen.render();
      }),
    );

    return (this._draggable = true);
  }

  /**
   * Disable dragging of the element.
   * Removes drag event handlers and resets dragging state.
   * @returns True if dragging was disabled
   */
  disableDrag(): boolean {
    if (!this._draggable) return false;
    delete this.screen._dragging;
    delete this._drag;
    this.removeListener("mousedown", this._dragMD!);
    this.removeScreenEvent("mouse", this._dragM!);
    return (this._draggable = false);
  }

  /**
   * Bind a key event handler.
   * @param args - Arguments to pass to program.key()
   * @returns The bound key handler
   */
  key(...args: any[]): any {
    return this.screen.program.key.apply(this, args);
  }

  /**
   * Bind a key event handler that fires only once.
   * @param args - Arguments to pass to program.onceKey()
   * @returns The bound key handler
   */
  onceKey(...args: any[]): any {
    return this.screen.program.onceKey.apply(this, args);
  }

  /**
   * Unbind a key event handler.
   * @param args - Arguments to pass to program.unkey()
   * @returns Result of unbinding
   */
  unkey(...args: any[]): any {
    return this.screen.program.unkey.apply(this, args);
  }

  /**
   * Remove a key event handler.
   * Alias for unkey().
   * @param args - Arguments to pass to program.unkey()
   * @returns Result of removing
   */
  removeKey(...args: any[]): any {
    return this.screen.program.unkey.apply(this, args);
  }

  /**
   * Set the z-index of the element (changes rendering order).
   * Higher indices are rendered later (on top). Negative indices count from the end.
   * @param index - New z-index value
   */
  setIndex(index: number): void {
    if (!this.parent) return;

    if (index < 0) {
      index = this.parent.children.length + index;
    }

    index = Math.max(index, 0);
    index = Math.min(index, this.parent.children.length - 1);

    const i = this.parent.children.indexOf(this);
    if (!~i) return;

    const item = this.parent.children.splice(i, 1)[0];
    this.parent.children.splice(index, 0, item);
  }

  /**
   * Put the element in front of its siblings.
   * Sets the element's z-index to the highest value (renders last/on top).
   */
  setFront(): void {
    return this.setIndex(-1);
  }

  /**
   * Put the element in back of its siblings.
   * Sets the element's z-index to the lowest value (renders first/at bottom).
   */
  setBack(): void {
    return this.setIndex(0);
  }

  /**
   * Clear the element's position in the screen buffer.
   * Fills the region with spaces, used when moving or hiding elements.
   * @param get - Whether to use _getCoords (default: false)
   * @param override - If true, always clear even if cell hasn't changed
   */
  clearPos(get?: boolean, override?: any): void {
    if (this.detached) return;
    const lpos = this._getCoords(get);
    if (!lpos) return;
    this.screen.clearRegion(lpos.xi, lpos.xl, lpos.yi, lpos.yl, override);
  }

  /**
   * Set the label text for the top-left (or top-right) corner.
   * Creates or updates a label that appears on the top border of the element.
   * @param options - Label text (string) or options object with text and side properties
   * @example
   * element.setLabel('My Label');
   * element.setLabel({ text: 'My Label', side: 'right' });
   */
  setLabel(options: any): void {
    if (typeof options === "string") {
      options = { text: options };
    }

    if (this._label) {
      this._label.setContent(options.text);
      if (options.side !== "right") {
        this._label.rleft = 2 + (this.border ? -1 : 0);
        this._label.position.right = undefined;
        if (!this.screen.autoPadding) {
          this._label.rleft = 2;
        }
      } else {
        this._label.rright = 2 + (this.border ? -1 : 0);
        this._label.position.left = undefined;
        if (!this.screen.autoPadding) {
          this._label.rright = 2;
        }
      }
      return;
    }

    this._label = new Element({
      screen: this.screen,
      parent: this,
      content: options.text,
      top: -this.itop,
      tags: this.parseTags,
      shrink: true,
      style: this.style.label,
    });

    if (options.side !== "right") {
      this._label.rleft = 2 - this.ileft;
    } else {
      this._label.rright = 2 - this.iright;
    }

    this._label._isLabel = true;

    if (!this.screen.autoPadding) {
      if (options.side !== "right") {
        this._label.rleft = 2;
      } else {
        this._label.rright = 2;
      }
      this._label.rtop = 0;
    }

    const reposition = () => {
      this._label.rtop = (this.childBase || 0) - this.itop;
      if (!this.screen.autoPadding) {
        this._label.rtop = this.childBase || 0;
      }
      this.screen.render();
    };

    this.on(
      "scroll",
      (this._labelScroll = () => {
        reposition();
      }),
    );

    this.on(
      "resize",
      (this._labelResize = () => {
        nextTick(() => {
          reposition();
        });
      }),
    );
  }

  /**
   * Remove the label completely.
   * Detaches the label element and removes associated event listeners.
   */
  removeLabel(): void {
    if (!this._label) return;
    this.removeListener("scroll", this._labelScroll!);
    this.removeListener("resize", this._labelResize!);
    this._label.detach();
    delete this._labelScroll;
    delete this._labelResize;
    delete this._label;
  }

  /**
   * Set a hover text box to follow the cursor. Similar to the "title" DOM attribute in the browser.
   * @param options - Hover text (string) or options object with text property
   * @example
   * element.setHover('Hover text here');
   * element.setHover({ text: 'Hover text here' });
   */
  setHover(options: any): void {
    if (typeof options === "string") {
      options = { text: options };
    }

    this._hoverOptions = options;
    this.enableMouse();
    this.screen._initHover();
  }

  /**
   * Remove the hover label completely.
   * Detaches the hover text box if it's currently displayed.
   */
  removeHover(): void {
    delete this._hoverOptions;
    if (!this.screen._hoverText || this.screen._hoverText.detached) return;
    this.screen._hoverText.detach();
    this.screen.render();
  }

  /**
   * Positioning
   */

  // The below methods are a bit confusing: basically
  // whenever Box.render is called `lpos` gets set on
  // the element, an object containing the rendered
  // coordinates. Since these don't update if the
  // element is moved somehow, they're unreliable in
  // that situation. However, if we can guarantee that
  // lpos is good and up to date, it can be more
  // accurate than the calculated positions below.
  // In this case, if the element is being rendered,
  // it's guaranteed that the parent will have been
  // rendered first, in which case we can use the
  // parant's lpos instead of recalculating it's
  // position (since that might be wrong because
  // it doesn't handle content shrinkage).

  _getPos(): any {
    const pos = this.lpos;

    if (!pos) throw new Error("Position is required");

    if (pos.aleft != null) return pos;

    pos.aleft = pos.xi;
    pos.atop = pos.yi;
    pos.aright = this.screen.cols - pos.xl;
    pos.abottom = this.screen.rows - pos.yl;
    pos.width = pos.xl - pos.xi;
    pos.height = pos.yl - pos.yi;

    return pos;
  }

  /**
   * Position Getters
   */

  _getWidth(get?: boolean): number {
    const parent = get ? this.parent._getPos() : this.parent;
    let width: any = this.position.width;
    let left: any;
    let expr: any;

    if (typeof width === "string") {
      if (width === "half") width = "50%";
      expr = width.split(/(?=\+|-)/);
      width = expr[0];
      width = +width.slice(0, -1) / 100;
      width = (parent.width * width) | 0;
      width += +(expr[1] || 0);
      return width;
    }

    // This is for if the element is being streched or shrunken.
    // Although the width for shrunken elements is calculated
    // in the render function, it may be calculated based on
    // the content width, and the content width is initially
    // decided by the width the element, so it needs to be
    // calculated here.
    if (width == null) {
      left = this.position.left || 0;
      if (typeof left === "string") {
        if (left === "center") left = "50%";
        expr = left.split(/(?=\+|-)/);
        left = expr[0];
        left = +left.slice(0, -1) / 100;
        left = (parent.width * left) | 0;
        left += +(expr[1] || 0);
      }
      width = parent.width - (this.position.right || 0) - left;
      if (this.screen.autoPadding) {
        if (
          (this.position.left != null || this.position.right == null) &&
          this.position.left !== "center"
        ) {
          width -= this.parent.ileft;
        }
        width -= this.parent.iright;
      }
    }

    return width;
  }

  get width(): number {
    return this._getWidth(false);
  }

  _getHeight(get?: boolean): number {
    const parent = get ? this.parent._getPos() : this.parent;
    let height: any = this.position.height;
    let top: any;
    let expr: any;

    if (typeof height === "string") {
      if (height === "half") height = "50%";
      expr = height.split(/(?=\+|-)/);
      height = expr[0];
      height = +height.slice(0, -1) / 100;
      height = (parent.height * height) | 0;
      height += +(expr[1] || 0);
      return height;
    }

    // This is for if the element is being streched or shrunken.
    // Although the width for shrunken elements is calculated
    // in the render function, it may be calculated based on
    // the content width, and the content width is initially
    // decided by the width the element, so it needs to be
    // calculated here.
    if (height == null) {
      top = this.position.top || 0;
      if (typeof top === "string") {
        if (top === "center") top = "50%";
        expr = top.split(/(?=\+|-)/);
        top = expr[0];
        top = +top.slice(0, -1) / 100;
        top = (parent.height * top) | 0;
        top += +(expr[1] || 0);
      }
      height = parent.height - (this.position.bottom || 0) - top;
      if (this.screen.autoPadding) {
        if (
          (this.position.top != null || this.position.bottom == null) &&
          this.position.top !== "center"
        ) {
          height -= this.parent.itop;
        }
        height -= this.parent.ibottom;
      }
    }

    return height;
  }

  get height(): number {
    return this._getHeight(false);
  }

  _getLeft(get?: boolean): number {
    const parent = get ? this.parent._getPos() : this.parent;
    let left: any = this.position.left || 0;
    let expr: any;

    if (typeof left === "string") {
      if (left === "center") left = "50%";
      expr = left.split(/(?=\+|-)/);
      left = expr[0];
      left = +left.slice(0, -1) / 100;
      left = ((parent?.width || 0) * left) | 0;
      left += +(expr[1] || 0);
      if (this.position.left === "center") {
        left -= (this._getWidth(get) / 2) | 0;
      }
    }

    if (this.position.left == null && this.position.right != null) {
      return this.screen.cols - this._getWidth(get) - this._getRight(get);
    }

    if (this.screen.autoPadding) {
      if (
        (this.position.left != null || this.position.right == null) &&
        this.position.left !== "center"
      ) {
        left += this.parent?.ileft || 0;
      }
    }

    return (parent?.aleft || 0) + left;
  }

  get aleft(): number {
    return this._getLeft(false);
  }

  _getRight(get?: boolean): number {
    const parent = get ? this.parent._getPos() : this.parent;
    let right: number;

    if (this.position.right == null && this.position.left != null) {
      right = this.screen.cols - (this._getLeft(get) + this._getWidth(get));
      if (this.screen.autoPadding) {
        right += this.parent.iright;
      }
      return right;
    }

    right = (parent.aright || 0) + (this.position.right || 0);

    if (this.screen.autoPadding) {
      right += this.parent.iright;
    }

    return right;
  }

  get aright(): number {
    return this._getRight(false);
  }

  _getTop(get?: boolean): number {
    const parent = get ? this.parent._getPos() : this.parent;
    let top: any = this.position.top || 0;
    let expr: any;

    if (typeof top === "string") {
      if (top === "center") top = "50%";
      expr = top.split(/(?=\+|-)/);
      top = expr[0];
      top = +top.slice(0, -1) / 100;
      top = ((parent?.height || 0) * top) | 0;
      top += +(expr[1] || 0);
      if (this.position.top === "center") {
        top -= (this._getHeight(get) / 2) | 0;
      }
    }

    if (this.position.top == null && this.position.bottom != null) {
      return this.screen.rows - this._getHeight(get) - this._getBottom(get);
    }

    if (this.screen.autoPadding) {
      if (
        (this.position.top != null || this.position.bottom == null) &&
        this.position.top !== "center"
      ) {
        top += this.parent?.itop || 0;
      }
    }

    return (parent?.atop || 0) + top;
  }

  get atop(): number {
    return this._getTop(false);
  }

  _getBottom(get?: boolean): number {
    const parent = get ? this.parent._getPos() : this.parent;
    let bottom: number;

    if (this.position.bottom == null && this.position.top != null) {
      bottom = this.screen.rows - (this._getTop(get) + this._getHeight(get));
      if (this.screen.autoPadding) {
        bottom += this.parent.ibottom;
      }
      return bottom;
    }

    bottom = (parent.abottom || 0) + (this.position.bottom || 0);

    if (this.screen.autoPadding) {
      bottom += this.parent.ibottom;
    }

    return bottom;
  }

  get abottom(): number {
    return this._getBottom(false);
  }

  get rleft(): number {
    return this.aleft - this.parent.aleft;
  }

  get rright(): number {
    return this.aright - this.parent.aright;
  }

  get rtop(): number {
    return this.atop - this.parent.atop;
  }

  get rbottom(): number {
    return this.abottom - this.parent.abottom;
  }

  /**
   * Position Setters
   */

  // NOTE:
  // For aright, abottom, right, and bottom:
  // If position.bottom is null, we could simply set top instead.
  // But it wouldn't replicate bottom behavior appropriately if
  // the parent was resized, etc.
  set width(val: any) {
    if (this.position.width === val) return;
    if (/^\d+$/.test(val)) val = +val;
    this.emit("resize");
    this.clearPos();
    this.position.width = val;
  }

  set height(val: any) {
    if (this.position.height === val) return;
    if (/^\d+$/.test(val)) val = +val;
    this.emit("resize");
    this.clearPos();
    this.position.height = val;
  }

  set aleft(val: any) {
    let expr: any;
    if (typeof val === "string") {
      if (val === "center") {
        val = (this.screen.width / 2) | 0;
        val -= (this.width / 2) | 0;
      } else {
        expr = val.split(/(?=\+|-)/);
        val = expr[0];
        val = +val.slice(0, -1) / 100;
        val = (this.screen.width * val) | 0;
        val += +(expr[1] || 0);
      }
    }
    val -= this.parent.aleft;
    if (this.position.left === val) return;
    this.emit("move");
    this.clearPos();
    this.position.left = val;
  }

  set aright(val: any) {
    val -= this.parent.aright;
    if (this.position.right === val) return;
    this.emit("move");
    this.clearPos();
    this.position.right = val;
  }

  set atop(val: any) {
    let expr: any;
    if (typeof val === "string") {
      if (val === "center") {
        val = (this.screen.height / 2) | 0;
        val -= (this.height / 2) | 0;
      } else {
        expr = val.split(/(?=\+|-)/);
        val = expr[0];
        val = +val.slice(0, -1) / 100;
        val = (this.screen.height * val) | 0;
        val += +(expr[1] || 0);
      }
    }
    val -= this.parent.atop;
    if (this.position.top === val) return;
    this.emit("move");
    this.clearPos();
    this.position.top = val;
  }

  set abottom(val: any) {
    val -= this.parent.abottom;
    if (this.position.bottom === val) return;
    this.emit("move");
    this.clearPos();
    this.position.bottom = val;
  }

  set rleft(val: any) {
    if (this.position.left === val) return;
    if (/^\d+$/.test(val)) val = +val;
    this.emit("move");
    this.clearPos();
    this.position.left = val;
  }

  set rright(val: any) {
    if (this.position.right === val) return;
    this.emit("move");
    this.clearPos();
    this.position.right = val;
  }

  set rtop(val: any) {
    if (this.position.top === val) return;
    if (/^\d+$/.test(val)) val = +val;
    this.emit("move");
    this.clearPos();
    this.position.top = val;
  }

  set rbottom(val: any) {
    if (this.position.bottom === val) return;
    this.emit("move");
    this.clearPos();
    this.position.bottom = val;
  }

  get ileft(): number {
    return (this.border ? 1 : 0) + this.padding.left;
    // return (this.border && this.border.left ? 1 : 0) + this.padding.left;
  }

  get itop(): number {
    return (this.border ? 1 : 0) + this.padding.top;
    // return (this.border && this.border.top ? 1 : 0) + this.padding.top;
  }

  get iright(): number {
    return (this.border ? 1 : 0) + this.padding.right;
    // return (this.border && this.border.right ? 1 : 0) + this.padding.right;
  }

  get ibottom(): number {
    return (this.border ? 1 : 0) + this.padding.bottom;
    // return (this.border && this.border.bottom ? 1 : 0) + this.padding.bottom;
  }

  get iwidth(): number {
    // return (this.border
    //   ? ((this.border.left ? 1 : 0) + (this.border.right ? 1 : 0)) : 0)
    //   + this.padding.left + this.padding.right;
    return (this.border ? 2 : 0) + this.padding.left + this.padding.right;
  }

  get iheight(): number {
    // return (this.border
    //   ? ((this.border.top ? 1 : 0) + (this.border.bottom ? 1 : 0)) : 0)
    //   + this.padding.top + this.padding.bottom;
    return (this.border ? 2 : 0) + this.padding.top + this.padding.bottom;
  }

  get tpadding(): number {
    return (
      this.padding.left +
      this.padding.top +
      this.padding.right +
      this.padding.bottom
    );
  }

  /**
   * Relative coordinates as default properties
   */

  get left(): number {
    return this.rleft;
  }

  get right(): number {
    return this.rright;
  }

  get top(): number {
    return this.rtop;
  }

  get bottom(): number {
    return this.rbottom;
  }

  set left(val: any) {
    this.rleft = val;
  }

  set right(val: any) {
    this.rright = val;
  }

  set top(val: any) {
    this.rtop = val;
  }

  set bottom(val: any) {
    this.rbottom = val;
  }

  /**
   * Rendering - here be dragons
   */

  _getShrinkBox(
    xi: number,
    xl: number,
    yi: number,
    yl: number,
    get?: boolean,
  ): any {
    if (!this.children.length) {
      return { xi: xi, xl: xi + 1, yi: yi, yl: yi + 1 };
    }

    let i: number,
      el: any,
      ret: any,
      mxi = xi,
      mxl = xi + 1,
      myi = yi,
      myl = yi + 1;

    // This is a chicken and egg problem. We need to determine how the children
    // will render in order to determine how this element renders, but it in
    // order to figure out how the children will render, they need to know
    // exactly how their parent renders, so, we can give them what we have so
    // far.
    let _lpos: RenderCoords | undefined;
    if (get) {
      _lpos = this.lpos;
      this.lpos = {
        xi: xi,
        xl: xl,
        yi: yi,
        yl: yl,
        base: 0,
        noleft: false,
        noright: false,
        notop: false,
        nobot: false,
        renders: 0,
      };
      //this.shrink = false;
    }

    for (i = 0; i < this.children.length; i++) {
      el = this.children[i];

      ret = el._getCoords(get);

      // Or just (seemed to work, but probably not good):
      // ret = el.lpos || this.lpos;

      if (!ret) continue;

      // Since the parent element is shrunk, and the child elements think it's
      // going to take up as much space as possible, an element anchored to the
      // right or bottom will inadvertantly make the parent's shrunken size as
      // large as possible. So, we can just use the height and/or width the of
      // element.
      // if (get) {
      if (el.position.left == null && el.position.right != null) {
        ret.xl = xi + (ret.xl - ret.xi);
        ret.xi = xi;
        if (this.screen.autoPadding) {
          // Maybe just do this no matter what.
          ret.xl += this.ileft;
          ret.xi += this.ileft;
        }
      }
      if (el.position.top == null && el.position.bottom != null) {
        ret.yl = yi + (ret.yl - ret.yi);
        ret.yi = yi;
        if (this.screen.autoPadding) {
          // Maybe just do this no matter what.
          ret.yl += this.itop;
          ret.yi += this.itop;
        }
      }

      if (ret.xi < mxi) mxi = ret.xi;
      if (ret.xl > mxl) mxl = ret.xl;
      if (ret.yi < myi) myi = ret.yi;
      if (ret.yl > myl) myl = ret.yl;
    }

    if (get) {
      this.lpos = _lpos;
      //this.shrink = true;
    }

    if (
      this.position.width == null &&
      (this.position.left == null || this.position.right == null)
    ) {
      if (this.position.left == null && this.position.right != null) {
        xi = xl - (mxl - mxi);
        if (!this.screen.autoPadding) {
          xi -= this.padding.left + this.padding.right;
        } else {
          xi -= this.ileft;
        }
      } else {
        xl = mxl;
        if (!this.screen.autoPadding) {
          xl += this.padding.left + this.padding.right;
          // XXX Temporary workaround until we decide to make autoPadding default.
          // See widget-listtable.js for an example of why this is necessary.
          // XXX Maybe just to this for all this being that this would affect
          // width shrunken normal shrunken lists as well.
          // if (this._isList) {
          if (this.type === "list-table") {
            xl -= this.padding.left + this.padding.right;
            xl += this.iright;
          }
        } else {
          //xl += this.padding.right;
          xl += this.iright;
        }
      }
    }

    if (
      this.position.height == null &&
      (this.position.top == null || this.position.bottom == null) &&
      (!this.scrollable || this._isList)
    ) {
      // NOTE: Lists get special treatment if they are shrunken - assume they
      // want all list items showing. This is one case we can calculate the
      // height based on items/boxes.
      if (this._isList) {
        myi = 0 - this.itop;
        myl = this.items!.length + this.ibottom;
      }
      if (this.position.top == null && this.position.bottom != null) {
        yi = yl - (myl - myi);
        if (!this.screen.autoPadding) {
          yi -= this.padding.top + this.padding.bottom;
        } else {
          yi -= this.itop;
        }
      } else {
        yl = myl;
        if (!this.screen.autoPadding) {
          yl += this.padding.top + this.padding.bottom;
        } else {
          yl += this.ibottom;
        }
      }
    }

    return { xi: xi, xl: xl, yi: yi, yl: yl };
  }

  _getShrinkContent(
    xi: number,
    xl: number,
    yi: number,
    yl: number,
    _get?: boolean,
  ): any {
    const h = this._clines.length;
    const w = this._clines.mwidth || 1;

    if (
      this.position.width == null &&
      (this.position.left == null || this.position.right == null)
    ) {
      if (this.position.left == null && this.position.right != null) {
        xi = xl - w - this.iwidth;
      } else {
        xl = xi + w + this.iwidth;
      }
    }

    if (
      this.position.height == null &&
      (this.position.top == null || this.position.bottom == null) &&
      (!this.scrollable || this._isList)
    ) {
      if (this.position.top == null && this.position.bottom != null) {
        yi = yl - h - this.iheight;
      } else {
        yl = yi + h + this.iheight;
      }
    }

    return { xi: xi, xl: xl, yi: yi, yl: yl };
  }

  _getShrink(
    xi: number,
    xl: number,
    yi: number,
    yl: number,
    get?: boolean,
  ): any {
    const shrinkBox = this._getShrinkBox(xi, xl, yi, yl, get);
    const shrinkContent = this._getShrinkContent(xi, xl, yi, yl, get);
    let xll = xl;
    let yll = yl;

    // Figure out which one is bigger and use it.
    if (shrinkBox.xl - shrinkBox.xi > shrinkContent.xl - shrinkContent.xi) {
      xi = shrinkBox.xi;
      xl = shrinkBox.xl;
    } else {
      xi = shrinkContent.xi;
      xl = shrinkContent.xl;
    }

    if (shrinkBox.yl - shrinkBox.yi > shrinkContent.yl - shrinkContent.yi) {
      yi = shrinkBox.yi;
      yl = shrinkBox.yl;
    } else {
      yi = shrinkContent.yi;
      yl = shrinkContent.yl;
    }

    // Recenter shrunken elements.
    if (xl < xll && this.position.left === "center") {
      xll = ((xll - xl) / 2) | 0;
      xi += xll;
      xl += xll;
    }

    if (yl < yll && this.position.top === "center") {
      yll = ((yll - yl) / 2) | 0;
      yi += yll;
      yl += yll;
    }

    return { xi: xi, xl: xl, yi: yi, yl: yl };
  }

  _getCoords(get?: boolean, noscroll?: boolean): RenderCoords | undefined {
    if (this.hidden) return;

    // if (this.parent._rendering) {
    //   get = true;
    // }

    let xi = this._getLeft(get);
    let xl = xi + this._getWidth(get);
    let yi = this._getTop(get);
    let yl = yi + this._getHeight(get);
    let base = this.childBase || 0;
    let el: any = this;
    let fixed = this.fixed;
    let coords: any;
    let v: number;
    let noleft: boolean = false;
    let noright: boolean = false;
    let notop: boolean = false;
    let nobot: boolean = false;
    let ppos: RenderCoords | undefined;
    let b: number;

    // Attempt to shrink the element base on the
    // size of the content and child elements.
    if (this.shrink) {
      coords = this._getShrink(xi, xl, yi, yl, get);
      xi = coords.xi;
      xl = coords.xl;
      yi = coords.yi;
      yl = coords.yl;
    }

    // Find a scrollable ancestor if we have one.
    while ((el = el.parent)) {
      if (el.scrollable) {
        if (fixed) {
          fixed = false;
          continue;
        }
        break;
      }
    }

    // Check to make sure we're visible and
    // inside of the visible scroll area.
    // NOTE: Lists have a property where only
    // the list items are obfuscated.

    // Old way of doing things, this would not render right if a shrunken element
    // with lots of boxes in it was within a scrollable element.
    // See: $ node test/widget-shrink-fail.js
    // var thisparent = this.parent;

    const thisparent = el;
    if (el && !noscroll) {
      ppos = thisparent.lpos;

      // The shrink option can cause a stack overflow
      // by calling _getCoords on the child again.
      // if (!get && !thisparent.shrink) {
      //   ppos = thisparent._getCoords();
      // }

      if (!ppos) return;

      // TODO: Figure out how to fix base (and cbase to only
      // take into account the *parent's* padding.

      yi -= ppos.base;
      yl -= ppos.base;

      b = thisparent.border ? 1 : 0;

      // XXX
      // Fixes non-`fixed` labels to work with scrolling (they're ON the border):
      // if (this.position.left < 0
      //     || this.position.right < 0
      //     || this.position.top < 0
      //     || this.position.bottom < 0) {
      if (this._isLabel) {
        b = 0;
      }

      if (yi < ppos.yi + b) {
        if (yl - 1 < ppos.yi + b) {
          // Is above.
          return;
        } else {
          // Is partially covered above.
          notop = true;
          v = ppos.yi - yi;
          if (this.border) v--;
          if (thisparent.border) v++;
          base += v;
          yi += v;
        }
      } else if (yl > ppos.yl - b) {
        if (yi > ppos.yl - 1 - b) {
          // Is below.
          return;
        } else {
          // Is partially covered below.
          nobot = true;
          v = yl - ppos.yl;
          if (this.border) v--;
          if (thisparent.border) v++;
          yl -= v;
        }
      }

      // Shouldn't be necessary.
      // assert.ok(yi < yl);
      if (yi >= yl) return;

      // Could allow overlapping stuff in scrolling elements
      // if we cleared the pending buffer before every draw.
      if (xi < el.lpos.xi) {
        xi = el.lpos.xi;
        noleft = true;
        if (this.border) xi--;
        if (thisparent.border) xi++;
      }
      if (xl > el.lpos.xl) {
        xl = el.lpos.xl;
        noright = true;
        if (this.border) xl++;
        if (thisparent.border) xl--;
      }
      //if (xi > xl) return;
      if (xi >= xl) return;
    }

    if (this.noOverflow && this.parent.lpos) {
      if (xi < this.parent.lpos.xi + this.parent.ileft) {
        xi = this.parent.lpos.xi + this.parent.ileft;
      }
      if (xl > this.parent.lpos.xl - this.parent.iright) {
        xl = this.parent.lpos.xl - this.parent.iright;
      }
      if (yi < this.parent.lpos.yi + this.parent.itop) {
        yi = this.parent.lpos.yi + this.parent.itop;
      }
      if (yl > this.parent.lpos.yl - this.parent.ibottom) {
        yl = this.parent.lpos.yl - this.parent.ibottom;
      }
    }

    // if (this.parent.lpos) {
    //   this.parent.lpos._scrollBottom = Math.max(
    //     this.parent.lpos._scrollBottom, yl);
    // }

    return {
      xi: xi,
      xl: xl,
      yi: yi,
      yl: yl,
      base: base,
      noleft: noleft,
      noright: noright,
      notop: notop,
      nobot: nobot,
      renders: this.screen.renders,
    };
  }

  /**
   * Write content and children to the screen buffer.
   * This is the main rendering method that draws the element, its border, scrollbar,
   * and all child elements to the screen buffer. Returns the rendered coordinates.
   * @returns Rendered coordinates object, or undefined if hidden/invalid
   */
  render(): any {
    this._emit("prerender", []);

    this.parseContent();

    if (!this._clines) {
      return;
    }

    const coords = this._getCoords(true);
    if (!coords) {
      delete this.lpos;
      return;
    }

    if (coords.xl - coords.xi <= 0) {
      coords.xl = Math.max(coords.xl, coords.xi);
      return;
    }

    if (coords.yl - coords.yi <= 0) {
      coords.yl = Math.max(coords.yl, coords.yi);
      return;
    }

    const lines = this.screen.lines;
    let xi = coords.xi;
    let xl = coords.xl;
    let yi = coords.yi;
    let yl = coords.yl;
    let x: number;
    let y: number;
    let cell: any;
    let attr: number;
    let ch: string = "";
    const content = this._pcontent;
    let ci = (this._clines.ci && this._clines.ci[coords.base]) || 0;
    let dattr: number;
    let c: any;
    let visible: number;
    let i: number = 0;
    const bch = this.ch;

    // Clip content if it's off the edge of the screen
    // if (xi + this.ileft < 0 || yi + this.itop < 0) {
    //   var clines = this._clines.slice();
    //   if (xi + this.ileft < 0) {
    //     for (var i = 0; i < clines.length; i++) {
    //       var t = 0;
    //       var csi = '';
    //       var csis = '';
    //       for (var j = 0; j < clines[i].length; j++) {
    //         while (clines[i][j] === '\x1b') {
    //           csi = '\x1b';
    //           while (clines[i][j++] !== 'm') csi += clines[i][j];
    //           csis += csi;
    //         }
    //         if (++t === -(xi + this.ileft) + 1) break;
    //       }
    //       clines[i] = csis + clines[i].substring(j);
    //     }
    //   }
    //   if (yi + this.itop < 0) {
    //     clines = clines.slice(-(yi + this.itop));
    //   }
    //   content = clines.join('\n');
    // }

    if (coords.base >= this._clines.ci.length) {
      ci = this._pcontent!.length;
    }

    this.lpos = coords;

    if (this.border && this.border.type === "line") {
      this.screen._borderStops[coords.yi] = true;
      this.screen._borderStops[coords.yl - 1] = true;
      // if (!this.screen._borderStops[coords.yi]) {
      //   this.screen._borderStops[coords.yi] = { xi: coords.xi, xl: coords.xl };
      // } else {
      //   if (this.screen._borderStops[coords.yi].xi > coords.xi) {
      //     this.screen._borderStops[coords.yi].xi = coords.xi;
      //   }
      //   if (this.screen._borderStops[coords.yi].xl < coords.xl) {
      //     this.screen._borderStops[coords.yi].xl = coords.xl;
      //   }
      // }
      // this.screen._borderStops[coords.yl - 1] = this.screen._borderStops[coords.yi];
    }

    dattr = this.sattr(this.style);
    attr = dattr;

    // If we're in a scrollable text box, check to
    // see which attributes this line starts with.
    if (ci > 0) {
      attr = this._clines.attr[Math.min(coords.base, this._clines.length - 1)];
    }

    if (this.border) {
      xi++;
      xl--;
      yi++;
      yl--;
    }

    // If we have padding/valign, that means the
    // content-drawing loop will skip a few cells/lines.
    // To deal with this, we can just fill the whole thing
    // ahead of time. This could be optimized.
    if (this.tpadding || (this.valign && this.valign !== "top")) {
      if (this.style.transparent) {
        for (y = Math.max(yi, 0); y < yl; y++) {
          if (!lines[y]) break;
          for (x = Math.max(xi, 0); x < xl; x++) {
            if (!lines[y][x]) break;
            lines[y][x][0] = colors.blend(attr, lines[y][x][0]);
            // lines[y][x][1] = bch;
            lines[y].dirty = true;
          }
        }
      } else {
        this.screen.fillRegion(dattr, bch, xi, xl, yi, yl);
      }
    }

    if (this.tpadding) {
      xi += this.padding.left;
      xl -= this.padding.right;
      yi += this.padding.top;
      yl -= this.padding.bottom;
    }

    // Determine where to place the text if it's vertically aligned.
    if (this.valign === "middle" || this.valign === "bottom") {
      visible = yl - yi;
      if (this._clines.length < visible) {
        if (this.valign === "middle") {
          visible = (visible / 2) | 0;
          visible -= (this._clines.length / 2) | 0;
        } else if (this.valign === "bottom") {
          visible -= this._clines.length;
        }
        ci -= visible * (xl - xi);
      }
    }

    // Draw the content and background.
    for (y = yi; y < yl; y++) {
      if (!lines[y]) {
        if (y >= this.screen.height || yl < this.ibottom) {
          break;
        } else {
          continue;
        }
      }
      for (x = xi; x < xl; x++) {
        cell = lines[y][x];
        if (!cell) {
          if (x >= this.screen.width || xl < this.iright) {
            break;
          } else {
            continue;
          }
        }

        ch = content![ci++] || bch;

        // if (!content[ci] && !coords._contentEnd) {
        //   coords._contentEnd = { x: x - xi, y: y - yi };
        // }

        // Handle escape codes.
        while (ch === "\x1b") {
          if ((c = /^\x1b\[[\d;]*m/.exec(content!.substring(ci - 1)))) {
            ci += c[0].length - 1;
            attr = this.screen.attrCode(c[0], attr, dattr);
            // Ignore foreground changes for selected items.
            if (
              this.parent._isList &&
              this.parent.interactive &&
              this.parent.items[this.parent.selected] === this &&
              this.parent.options.invertSelected !== false
            ) {
              attr = (attr & ~(0x1ff << 9)) | (dattr & (0x1ff << 9));
            }
            ch = content![ci] || bch;
            ci++;
          } else {
            break;
          }
        }

        // Handle newlines.
        if (ch === "\t") ch = bch;
        if (ch === "\n") {
          // If we're on the first cell and we find a newline and the last cell
          // of the last line was not a newline, let's just treat this like the
          // newline was already "counted".
          if (x === xi && y !== yi && content![ci - 2] !== "\n") {
            x--;
            continue;
          }
          // We could use fillRegion here, name the
          // outer loop, and continue to it instead.
          ch = bch;
          for (; x < xl; x++) {
            cell = lines[y][x];
            if (!cell) break;
            if (this.style.transparent) {
              lines[y][x][0] = colors.blend(attr, lines[y][x][0]);
              if (content![ci]) lines[y][x][1] = ch;
              lines[y].dirty = true;
            } else {
              if (attr !== cell[0] || ch !== cell[1]) {
                lines[y][x][0] = attr;
                lines[y][x][1] = ch;
                lines[y].dirty = true;
              }
            }
          }
          continue;
        }

        if (this.screen.fullUnicode && content![ci - 1]) {
          const point = unicode.codePointAt(content!, ci - 1);
          // Handle combining chars:
          // Make sure they get in the same cell and are counted as 0.
          if (unicode.combining[point]) {
            if (point > 0x00ffff) {
              ch = content![ci - 1] + content![ci];
              ci++;
            }
            if (x - 1 >= xi) {
              lines[y][x - 1][1] += ch;
            } else if (y - 1 >= yi) {
              lines[y - 1][xl - 1][1] += ch;
            }
            x--;
            continue;
          }
          // Handle surrogate pairs:
          // Make sure we put surrogate pair chars in one cell.
          if (point > 0x00ffff) {
            ch = content![ci - 1] + content![ci];
            ci++;
          }
        }

        if (this._noFill) continue;

        if (this.style.transparent) {
          lines[y][x][0] = colors.blend(attr, lines[y][x][0]);
          if (content![ci]) lines[y][x][1] = ch;
          lines[y].dirty = true;
        } else {
          if (attr !== cell[0] || ch !== cell[1]) {
            lines[y][x][0] = attr;
            lines[y][x][1] = ch;
            lines[y].dirty = true;
          }
        }
      }
    }

    // Draw the scrollbar.
    // Could possibly draw this after all child elements.
    if (this.scrollbar) {
      // XXX
      // i = this.getScrollHeight();
      i = Math.max(this._clines.length, this._scrollBottom?.() || 0);
    }
    if (coords.notop || coords.nobot) i = -Infinity;
    if (this.scrollbar && yl - yi < i) {
      x = xl - 1;
      if (this.scrollbar.ignoreBorder && this.border) x++;
      if (this.alwaysScroll) {
        y = (this.childBase || 0) / (i - (yl - yi));
      } else {
        y = ((this.childBase || 0) + (this.childOffset || 0)) / (i - 1);
      }
      y = yi + (((yl - yi) * y) | 0);
      if (y >= yl) y = yl - 1;
      cell = lines[y]?.[x];
      if (cell) {
        if (this.track) {
          ch = this.track.ch || " ";
          attr = this.sattr(
            this.style.track,
            this.style.track?.fg || this.style.fg,
            this.style.track?.bg || this.style.bg,
          );
          this.screen.fillRegion(attr, ch, x, x + 1, yi, yl);
        }
        ch = this.scrollbar.ch || " ";
        attr = this.sattr(
          this.style.scrollbar,
          this.style.scrollbar?.fg || this.style.fg,
          this.style.scrollbar?.bg || this.style.bg,
        );
        if (attr !== cell[0] || ch !== cell[1]) {
          lines[y][x][0] = attr;
          lines[y][x][1] = ch;
          lines[y].dirty = true;
        }
      }
    }

    if (this.border) {
      xi--;
      xl++;
      yi--;
      yl++;
    }

    if (this.tpadding) {
      xi -= this.padding.left!;
      xl += this.padding.right!;
      yi -= this.padding.top!;
      yl += this.padding.bottom!;
    }

    // Draw the border.
    if (this.border) {
      // Helper to get border attribute for a specific side (with per-side color and dim support)
      const getBorderAttr = (
        side: "top" | "bottom" | "left" | "right",
      ): number => {
        const baseStyle = this.style.border || {};
        const sideStyle: any = { ...baseStyle };

        // Apply per-side color if specified
        const sideColorKey = `${side}Color` as keyof typeof this.border;
        const sideColor = this.border?.[sideColorKey];
        if (sideColor !== undefined) {
          // Convert color (supports names like "cyan", hex like "#00ff00", or numeric codes)
          if (typeof sideColor === "string") {
            sideStyle.fg = colors.convert(sideColor);
          } else {
            sideStyle.fg = sideColor;
          }
        }

        // Apply dim effect if specified (using dim attribute flag)
        const dimKey = `${side}Dim` as keyof typeof this.border;
        const sideDim = this.border?.[dimKey] ?? this.border?.dim;
        if (sideDim) {
          sideStyle.dim = true;
        }

        // Get final attribute with potentially dimmed color
        return this.sattr(sideStyle);
      };

      // Helper: get color for specific cell index (addressable border colors)
      const getBorderColorAt = (
        cellIndex: number,
        side: "top" | "bottom" | "left" | "right",
      ): number => {
        let colorValue: string | number | null = null;

        // Priority 1: colors array (addressable border)
        if (this._borderColors && this._borderColors.length > 0) {
          const repeatColors = this.border?.repeatColors !== false; // default: true
          let colorIndex = cellIndex;

          if (repeatColors) {
            colorIndex = cellIndex % this._borderColors.length;
          }

          if (colorIndex < this._borderColors.length) {
            colorValue = this._borderColors[colorIndex];
          }
        }

        // Priority 2-4: Use existing getBorderAttr() for fallback
        if (colorValue === null || colorValue === undefined) {
          return getBorderAttr(side);
        }

        // Convert color from array
        const baseStyle = this.style.border || {};
        const sideStyle: any = { ...baseStyle };
        sideStyle.fg =
          typeof colorValue === "string"
            ? colors.convert(colorValue)
            : colorValue;

        // Apply dim for this side (using dim attribute flag)
        const dimKey = `${side}Dim` as keyof typeof this.border;
        const sideDim = this.border?.[dimKey] ?? this.border?.dim;
        if (sideDim) {
          sideStyle.dim = true;
        }

        return this.sattr(sideStyle);
      };

      // Determine corner color mode (default to 'vertical')
      const cornerMode = this.border.cornerColorMode || "vertical";

      // Track cell index for addressable colors
      let cellIndex = 0;

      // Get border characters for the selected style
      const borderChars = getBorderChars(this.border.style || "single");

      // Top border (left to right, cellIndex: 0 to width-1)
      y = yi;
      if (coords.notop) y = -1;
      for (x = xi; x < xl; x++) {
        if (!lines[y]) break;
        if (coords.noleft && x === xi) continue;
        if (coords.noright && x === xl - 1) continue;
        cell = lines[y][x];
        if (!cell) continue;

        // Determine which side's fallback to use for corners
        let fallbackSide: "top" | "left" | "right" = "top";
        if (x === xi) {
          fallbackSide = cornerMode === "vertical" ? "left" : "top";
        } else if (x === xl - 1) {
          fallbackSide = cornerMode === "vertical" ? "right" : "top";
        }

        // Get color for this specific cell (addressable or fallback)
        const currentAttr = getBorderColorAt(cellIndex++, fallbackSide);

        if (this.border.type === "line") {
          if (x === xi) {
            ch = borderChars.topLeft;
            if (!this.border.left) {
              if (this.border.top) {
                ch = borderChars.top;
              } else {
                continue;
              }
            } else {
              if (!this.border.top) {
                ch = borderChars.left;
              }
            }
          } else if (x === xl - 1) {
            ch = borderChars.topRight;
            if (!this.border.right) {
              if (this.border.top) {
                ch = borderChars.top;
              } else {
                continue;
              }
            } else {
              if (!this.border.top) {
                ch = borderChars.right;
              }
            }
          } else {
            ch = borderChars.top;
          }
        } else if (this.border.type === "bg") {
          ch = this.border.ch || " ";
        }
        if (!this.border.top && x !== xi && x !== xl - 1) {
          ch = " ";
          if (dattr !== cell[0] || ch !== cell[1]) {
            lines[y][x][0] = dattr;
            lines[y][x][1] = ch;
            lines[y].dirty = true;
            continue;
          }
        }
        if (currentAttr !== cell[0] || ch !== cell[1]) {
          lines[y][x][0] = currentAttr;
          lines[y][x][1] = ch;
          lines[y].dirty = true;
        }
      }

      // Right border (top to bottom, excluding corners)
      y = yi + 1;
      for (; y < yl - 1; y++) {
        if (!lines[y]) continue;
        cell = lines[y][xl - 1];
        if (cell) {
          if (this.border.right) {
            // Get color for this specific cell
            const currentAttr = getBorderColorAt(cellIndex++, "right");

            if (this.border.type === "line") {
              ch = borderChars.right;
            } else if (this.border.type === "bg") {
              ch = this.border.ch || " ";
            }
            if (!coords.noright)
              if (currentAttr !== cell[0] || ch !== cell[1]) {
                lines[y][xl - 1][0] = currentAttr;
                lines[y][xl - 1][1] = ch;
                lines[y].dirty = true;
              }
          } else {
            ch = " ";
            if (dattr !== cell[0] || ch !== cell[1]) {
              lines[y][xl - 1][0] = dattr;
              lines[y][xl - 1][1] = ch;
              lines[y].dirty = true;
            }
          }
        }
      }

      // Bottom border (right to left for clockwise order)
      y = yl - 1;
      if (coords.nobot) y = -1;
      for (x = xl - 1; x >= xi; x--) {
        if (!lines[y]) break;
        if (coords.noleft && x === xi) continue;
        if (coords.noright && x === xl - 1) continue;
        cell = lines[y][x];
        if (!cell) continue;

        // Determine which side's fallback to use for corners
        let fallbackSide: "bottom" | "left" | "right" = "bottom";
        if (x === xi) {
          fallbackSide = cornerMode === "vertical" ? "left" : "bottom";
        } else if (x === xl - 1) {
          fallbackSide = cornerMode === "vertical" ? "right" : "bottom";
        }

        // Get color for this specific cell (addressable or fallback)
        const currentAttr = getBorderColorAt(cellIndex++, fallbackSide);

        if (this.border.type === "line") {
          if (x === xi) {
            ch = borderChars.bottomLeft;
            if (!this.border.left) {
              if (this.border.bottom) {
                ch = borderChars.bottom;
              } else {
                continue;
              }
            } else {
              if (!this.border.bottom) {
                ch = borderChars.left;
              }
            }
          } else if (x === xl - 1) {
            ch = borderChars.bottomRight;
            if (!this.border.right) {
              if (this.border.bottom) {
                ch = borderChars.bottom;
              } else {
                continue;
              }
            } else {
              if (!this.border.bottom) {
                ch = borderChars.right;
              }
            }
          } else {
            ch = borderChars.bottom;
          }
        } else if (this.border.type === "bg") {
          ch = this.border.ch || " ";
        }
        if (!this.border.bottom && x !== xi && x !== xl - 1) {
          ch = " ";
          if (dattr !== cell[0] || ch !== cell[1]) {
            lines[y][x][0] = dattr;
            lines[y][x][1] = ch;
            lines[y].dirty = true;
          }
          continue;
        }
        if (currentAttr !== cell[0] || ch !== cell[1]) {
          lines[y][x][0] = currentAttr;
          lines[y][x][1] = ch;
          lines[y].dirty = true;
        }
      }

      // Left border (bottom to top for clockwise order, excluding corners)
      y = yl - 2;
      for (; y > yi; y--) {
        if (!lines[y]) continue;
        cell = lines[y][xi];
        if (cell) {
          if (this.border.left) {
            // Get color for this specific cell
            const currentAttr = getBorderColorAt(cellIndex++, "left");

            if (this.border.type === "line") {
              ch = borderChars.left;
            } else if (this.border.type === "bg") {
              ch = this.border.ch || " ";
            }
            if (!coords.noleft)
              if (currentAttr !== cell[0] || ch !== cell[1]) {
                lines[y][xi][0] = currentAttr;
                lines[y][xi][1] = ch;
                lines[y].dirty = true;
              }
          } else {
            ch = " ";
            if (dattr !== cell[0] || ch !== cell[1]) {
              lines[y][xi][0] = dattr;
              lines[y][xi][1] = ch;
              lines[y].dirty = true;
            }
          }
        }
      }
    }

    if (this.shadow) {
      // right
      y = Math.max(yi + 1, 0);
      for (; y < yl + 1; y++) {
        if (!lines[y]) break;
        x = xl;
        for (; x < xl + 2; x++) {
          if (!lines[y][x]) break;
          // lines[y][x][0] = colors.blend(this.dattr, lines[y][x][0]);
          lines[y][x][0] = colors.blend(lines[y][x][0]);
          lines[y].dirty = true;
        }
      }
      // bottom
      y = yl;
      for (; y < yl + 1; y++) {
        if (!lines[y]) break;
        for (x = Math.max(xi + 1, 0); x < xl; x++) {
          if (!lines[y][x]) break;
          // lines[y][x][0] = colors.blend(this.dattr, lines[y][x][0]);
          lines[y][x][0] = colors.blend(lines[y][x][0]);
          lines[y].dirty = true;
        }
      }
    }

    this.children.forEach((el: any) => {
      if (el.screen._ci !== -1) {
        el.index = el.screen._ci++;
      }
      // if (el.screen._rendering) {
      //   el._rendering = true;
      // }
      el.render();
      // if (el.screen._rendering) {
      //   el._rendering = false;
      // }
    });

    this._emit("render", [coords]);

    return coords;
  }

  /**
   * Internal alias for render().
   * @returns Rendered coordinates object
   */
  _render(): any {
    return this.render();
  }

  /**
   * Content Methods
   */

  /**
   * Insert a line into the box's content.
   * Handles wrapped content by inserting at the specified fake line index.
   * @param i - Line index to insert at (fake line number)
   * @param line - Line or array of lines to insert
   */
  insertLine(i: number, line: string | string[]): void {
    if (typeof line === "string") line = line.split("\n");

    if (i !== i || i == null) {
      i = this._clines.ftor.length;
    }

    i = Math.max(i, 0);

    while (this._clines.fake.length < i) {
      this._clines.fake.push("");
      this._clines.ftor.push([this._clines.push("") - 1]);
      this._clines.rtof(this._clines.fake.length - 1);
    }

    // NOTE: Could possibly compare the first and last ftor line numbers to see
    // if they're the same, or if they fit in the visible region entirely.
    const start = this._clines.length;
    let diff: number;
    let real: any;

    if (i >= this._clines.ftor.length) {
      real = this._clines.ftor[this._clines.ftor.length - 1];
      real = real[real.length - 1] + 1;
    } else {
      real = this._clines.ftor[i][0];
    }

    for (let j = 0; j < line.length; j++) {
      this._clines.fake.splice(i + j, 0, line[j]);
    }

    this.setContent(this._clines.fake.join("\n"), true);

    diff = this._clines.length - start;

    if (diff > 0) {
      const pos = this._getCoords();
      if (!pos) return;

      const height = pos.yl - pos.yi - this.iheight;
      const base = this.childBase || 0;
      const visible = real >= base && real - base < height;

      if (pos && visible && this.screen.cleanSides(this)) {
        this.screen.insertLine(
          diff,
          pos.yi + this.itop + real - base,
          pos.yi,
          pos.yl - this.ibottom - 1,
        );
      }
    }
  }

  /**
   * Delete a line from the box's content.
   * Handles wrapped content by deleting at the specified fake line index.
   * @param i - Line index to delete (fake line number)
   * @param n - Number of lines to delete (default: 1)
   */
  deleteLine(i: number, n?: number): void {
    n = n || 1;

    if (i !== i || i == null) {
      i = this._clines.ftor.length - 1;
    }

    i = Math.max(i, 0);
    i = Math.min(i, this._clines.ftor.length - 1);

    // NOTE: Could possibly compare the first and last ftor line numbers to see
    // if they're the same, or if they fit in the visible region entirely.
    const start = this._clines.length;
    let diff: number;
    const real = this._clines.ftor[i][0];

    while (n--) {
      this._clines.fake.splice(i, 1);
    }

    this.setContent(this._clines.fake.join("\n"), true);

    diff = start - this._clines.length;

    // XXX clearPos() without diff statement?
    let height = 0;

    if (diff > 0) {
      const pos = this._getCoords();
      if (!pos) return;

      height = pos.yl - pos.yi - this.iheight;

      const base = this.childBase || 0;
      const visible = real >= base && real - base < height;

      if (pos && visible && this.screen.cleanSides(this)) {
        this.screen.deleteLine(
          diff,
          pos.yi + this.itop + real - base,
          pos.yi,
          pos.yl - this.ibottom - 1,
        );
      }
    }

    if (this._clines.length < height) {
      this.clearPos();
    }
  }

  /**
   * Insert a line at the top of the box.
   * Inserts at the first visible line based on childBase.
   * @param line - Line or array of lines to insert
   */
  insertTop(line: string | string[]): void {
    const fake = this._clines.rtof[this.childBase || 0];
    return this.insertLine(fake, line);
  }

  /**
   * Insert a line at the bottom of the box.
   * Inserts after the last visible line based on height and childBase.
   * @param line - Line or array of lines to insert
   */
  insertBottom(line: string | string[]): void {
    const h = (this.childBase || 0) + this.height - this.iheight;
    const i = Math.min(h, this._clines.length);
    const fake = this._clines.rtof[i - 1] + 1;

    return this.insertLine(fake, line);
  }

  /**
   * Delete a line at the top of the box.
   * Deletes from the first visible line based on childBase.
   * @param n - Number of lines to delete (default: 1)
   */
  deleteTop(n?: number): void {
    const fake = this._clines.rtof[this.childBase || 0];
    return this.deleteLine(fake, n);
  }

  /**
   * Delete a line at the bottom of the box.
   * Deletes from the last visible line based on height and childBase.
   * @param n - Number of lines to delete (default: 1)
   */
  deleteBottom(n?: number): void {
    const h = (this.childBase || 0) + this.height - 1 - this.iheight;
    const i = Math.min(h, this._clines.length - 1);
    const fake = this._clines.rtof[i];

    n = n || 1;

    return this.deleteLine(fake - (n - 1), n);
  }

  /**
   * Set a line in the box's content.
   * @param i - Line index to set (fake line number)
   * @param line - Line content to set
   */
  setLine(i: number, line: string): void {
    i = Math.max(i, 0);
    while (this._clines.fake.length < i) {
      this._clines.fake.push("");
    }
    this._clines.fake[i] = line;
    return this.setContent(this._clines.fake.join("\n"), true);
  }

  /**
   * Set a line in the box's content from the visible top.
   * @param i - Line offset from visible top
   * @param line - Line content to set
   */
  setBaseLine(i: number, line: string): void {
    const fake = this._clines.rtof[this.childBase || 0];
    return this.setLine(fake + i, line);
  }

  /**
   * Get a line from the box's content.
   * @param i - Line index to get (fake line number)
   * @returns Line content
   */
  getLine(i: number): string {
    i = Math.max(i, 0);
    i = Math.min(i, this._clines.fake.length - 1);
    return this._clines.fake[i];
  }

  /**
   * Get a line from the box's content from the visible top.
   * @param i - Line offset from visible top
   * @returns Line content
   */
  getBaseLine(i: number): string {
    const fake = this._clines.rtof[this.childBase || 0];
    return this.getLine(fake + i);
  }

  /**
   * Clear a line from the box's content.
   * @param i - Line index to clear (fake line number)
   */
  clearLine(i: number): void {
    i = Math.min(i, this._clines.fake.length - 1);
    return this.setLine(i, "");
  }

  /**
   * Clear a line from the box's content from the visible top.
   * @param i - Line offset from visible top
   */
  clearBaseLine(i: number): void {
    const fake = this._clines.rtof[this.childBase || 0];
    return this.clearLine(fake + i);
  }

  /**
   * Unshift a line onto the top of the content.
   * @param line - Line or array of lines to insert
   */
  unshiftLine(line: string | string[]): void {
    return this.insertLine(0, line);
  }

  /**
   * Shift a line off the top of the content.
   * @param i - Line index to remove (default: 0)
   * @param n - Number of lines to remove (default: 1)
   */
  shiftLine(i?: number, n?: number): void {
    return this.deleteLine(i ?? 0, n);
  }

  /**
   * Push a line onto the bottom of the content.
   * @param line - Line or array of lines to insert
   */
  pushLine(line: string | string[]): void {
    if (!this.content) return this.setLine(0, line as string);
    return this.insertLine(this._clines.fake.length, line);
  }

  /**
   * Pop a line off the bottom of the content.
   * @param n - Number of lines to remove (default: 1)
   */
  popLine(n?: number): void {
    return this.deleteLine(this._clines.fake.length - 1, n);
  }

  /**
   * An array containing the content lines.
   * @returns Array of fake (unwrapped) lines
   */
  getLines(): string[] {
    return this._clines.fake.slice();
  }

  /**
   * An array containing the lines as they are displayed on the screen.
   * @returns Array of real (wrapped) lines
   */
  getScreenLines(): string[] {
    return this._clines.slice();
  }

  /**
   * Get a string's displayed width, taking into account double-width, surrogate pairs,
   * combining characters, tags, and SGR escape codes.
   * @param text - Text to measure
   * @returns Displayed width in cells
   */
  strWidth(text: string): number {
    text = this.parseTags ? helpers.stripTags(text) : text;
    return this.screen.fullUnicode
      ? unicode.strWidth(text, this.screen.tabc.length)
      : helpers.dropUnicode(text).length;
  }

  /**
   * Take an SGR screenshot of the element within the region. Returns a string containing only
   * characters and SGR codes. Can be displayed by simply echoing it in a terminal.
   * @param xi - Left X offset from element's inner left (default: 0)
   * @param xl - Right X offset from element's inner left (default: element width)
   * @param yi - Top Y offset from element's inner top (default: 0)
   * @param yl - Bottom Y offset from element's inner top (default: element height)
   * @returns SGR-encoded screenshot string
   */
  screenshot(xi?: number, xl?: number, yi?: number, yl?: number): string {
    if (!this.lpos) {
      throw new Error("Cannot take screenshot of element without position");
    }
    xi = this.lpos.xi + this.ileft + (xi || 0);
    if (xl != null) {
      xl = this.lpos.xi + this.ileft + (xl || 0);
    } else {
      xl = this.lpos.xl - this.iright;
    }
    yi = this.lpos.yi + this.itop + (yi || 0);
    if (yl != null) {
      yl = this.lpos.yi + this.itop + (yl || 0);
    } else {
      yl = this.lpos.yl - this.ibottom;
    }
    return this.screen.screenshot(xi, xl, yi, yl);
  }
}

/**
 * Expose
 */

export default Element;
export { Element };
