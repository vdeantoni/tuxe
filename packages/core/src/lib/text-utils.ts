/**
 * text-utils.ts - Text truncation and wrapping utilities
 *
 * Provides utilities for text manipulation with proper handling of:
 * - ANSI escape codes (SGR sequences)
 * - Wide characters (CJK, emoji)
 * - Surrogate pairs
 * - Unicode combining characters
 */

import unicode from "./unicode.js";

/**
 * Truncation position options
 */
export type TruncatePosition = "start" | "middle" | "end";

/**
 * Options for text truncation
 */
export interface TruncateOptions {
  /** Where to place the ellipsis */
  position: TruncatePosition;
  /** Ellipsis string (default: '…') */
  ellipsis?: string;
  /** Whether to handle surrogates and wide chars */
  fullUnicode?: boolean;
}

/**
 * Options for text wrapping
 */
export interface WrapOptions {
  /** Maximum width in visual characters */
  width: number;
  /** Whether to handle surrogates and wide chars */
  fullUnicode?: boolean;
  /** How far back to look for break points */
  lookBackDistance?: number;
}

/**
 * ANSI escape code regex - matches SGR (Select Graphic Rendition) codes
 * Format: ESC [ <params> m
 */
const ANSI_REGEX = /\x1b\[[^m]*m/g;

/**
 * Strip all ANSI escape codes from text
 */
export function stripAnsi(text: string): string {
  return text.replace(ANSI_REGEX, "");
}

/**
 * Measure the visual width of text (excluding ANSI codes)
 * Accounts for wide characters if fullUnicode is true
 */
export function measureVisualWidth(
  text: string,
  fullUnicode: boolean = false,
): number {
  if (!fullUnicode) {
    // Simple: strip ANSI and count characters
    return stripAnsi(text).length;
  }

  // Complex: use unicode.strWidth to account for wide chars
  const stripped = stripAnsi(text);
  return unicode.strWidth(stripped);
}

/**
 * Find all ANSI escape codes and their positions in the text
 * Returns array of {start, end, code} for each ANSI sequence
 */
function findAnsiCodes(
  text: string,
): Array<{ start: number; end: number; code: string }> {
  const codes: Array<{ start: number; end: number; code: string }> = [];
  let match: RegExpExecArray | null;

  // Reset regex state
  ANSI_REGEX.lastIndex = 0;

  while ((match = ANSI_REGEX.exec(text)) !== null) {
    codes.push({
      start: match.index,
      end: match.index + match[0].length,
      code: match[0],
    });
  }

  return codes;
}

/**
 * Get all active ANSI codes at a given position in the text
 * Returns the codes that should be active at that position
 */
export function getActiveAnsiCodes(text: string, position: number): string {
  const codes = findAnsiCodes(text);

  // Track SGR state
  const state: {
    bold?: boolean;
    dim?: boolean;
    italic?: boolean;
    underline?: boolean;
    blink?: boolean;
    inverse?: boolean;
    hidden?: boolean;
    strikethrough?: boolean;
    fg?: number;
    bg?: number;
  } = {};

  // Process codes up to position
  for (const { start, code } of codes) {
    if (start >= position) break;

    // Parse SGR parameters
    const params = code
      .slice(2, -1)
      .split(";")
      .map((p) => parseInt(p) || 0);

    for (let i = 0; i < params.length; i++) {
      const param = params[i];

      // Reset
      if (param === 0) {
        Object.keys(state).forEach((k) => delete (state as any)[k]);
      }
      // Bold
      else if (param === 1) state.bold = true;
      else if (param === 22) delete state.bold;
      // Dim
      else if (param === 2) state.dim = true;
      else if (param === 22) delete state.dim;
      // Italic
      else if (param === 3) state.italic = true;
      else if (param === 23) delete state.italic;
      // Underline
      else if (param === 4) state.underline = true;
      else if (param === 24) delete state.underline;
      // Blink
      else if (param === 5) state.blink = true;
      else if (param === 25) delete state.blink;
      // Inverse
      else if (param === 7) state.inverse = true;
      else if (param === 27) delete state.inverse;
      // Hidden
      else if (param === 8) state.hidden = true;
      else if (param === 28) delete state.hidden;
      // Strikethrough
      else if (param === 9) state.strikethrough = true;
      else if (param === 29) delete state.strikethrough;
      // Foreground color
      else if (param >= 30 && param <= 37) state.fg = param;
      else if (param === 38) {
        // 256 color or RGB
        if (params[i + 1] === 5) {
          state.fg = 38; // Mark as custom
          i += 2;
        } else if (params[i + 1] === 2) {
          state.fg = 38; // Mark as custom
          i += 4;
        }
      } else if (param === 39) delete state.fg;
      // Background color
      else if (param >= 40 && param <= 47) state.bg = param;
      else if (param === 48) {
        // 256 color or RGB
        if (params[i + 1] === 5) {
          state.bg = 48; // Mark as custom
          i += 2;
        } else if (params[i + 1] === 2) {
          state.bg = 48; // Mark as custom
          i += 4;
        }
      } else if (param === 49) delete state.bg;
    }
  }

  // Build active codes string
  const result: string[] = [];
  if (state.bold) result.push("\x1b[1m");
  if (state.dim) result.push("\x1b[2m");
  if (state.italic) result.push("\x1b[3m");
  if (state.underline) result.push("\x1b[4m");
  if (state.blink) result.push("\x1b[5m");
  if (state.inverse) result.push("\x1b[7m");
  if (state.hidden) result.push("\x1b[8m");
  if (state.strikethrough) result.push("\x1b[9m");

  return result.join("");
}

/**
 * Get closing ANSI codes to reset all active styles
 */
function getClosingAnsiCodes(text: string, position: number): string {
  // Check if there are any active codes at this position
  const codes = findAnsiCodes(text);
  let hasActiveCodes = false;

  for (const { start, end } of codes) {
    if (start < position && end <= position) {
      hasActiveCodes = true;
      break;
    }
  }

  // If any codes were active before this position, add reset
  return hasActiveCodes ? "\x1b[0m" : "";
}

/**
 * Find the truncation point that respects character boundaries
 * Returns the actual position in the string accounting for ANSI codes
 */
export function findTruncationPoint(
  text: string,
  targetWidth: number,
  fullUnicode: boolean = false,
): number {
  let visualWidth = 0;
  let position = 0;

  while (position < text.length) {
    // Skip ANSI codes
    if (text[position] === "\x1b") {
      while (position < text.length && text[position++] !== "m");
      continue;
    }

    // Check if we've reached target width
    if (visualWidth >= targetWidth) {
      break;
    }

    // Calculate character width
    const charWidth = fullUnicode ? unicode.charWidth(text, position) : 1;

    // Skip surrogates if needed
    if (fullUnicode && unicode.isSurrogate(text, position)) {
      position += 2;
    } else {
      position++;
    }

    visualWidth += charWidth;
  }

  return position;
}

/**
 * Truncate text with ellipsis at the specified position
 * Preserves ANSI escape codes properly
 */
export function truncateText(
  text: string,
  width: number,
  options: TruncateOptions,
): string {
  const { position = "end", ellipsis = "…", fullUnicode = false } = options;

  // Check if truncation is needed
  const visualWidth = measureVisualWidth(text, fullUnicode);
  if (visualWidth <= width) {
    return text;
  }

  // Ellipsis takes up space
  const ellipsisWidth = measureVisualWidth(ellipsis, fullUnicode);
  const availableWidth = width - ellipsisWidth;

  // If width is too small, just return ellipsis trimmed to fit
  if (availableWidth <= 0) {
    const ellipsisOnly = ellipsis.substring(0, Math.max(0, width));
    return ellipsisOnly || ellipsis.substring(0, ellipsis.length);
  }

  if (position === "end") {
    return truncateEnd(text, availableWidth, ellipsis, fullUnicode);
  } else if (position === "start") {
    return truncateStart(text, availableWidth, ellipsis, fullUnicode);
  } else {
    return truncateMiddle(text, availableWidth, ellipsis, fullUnicode);
  }
}

/**
 * Truncate at end: "Hello World" -> "Hello W…"
 */
function truncateEnd(
  text: string,
  width: number,
  ellipsis: string,
  fullUnicode: boolean,
): string {
  const cutPoint = findTruncationPoint(text, width, fullUnicode);
  const truncated = text.substring(0, cutPoint);

  // Get any ANSI codes that need to be closed
  const closing = getClosingAnsiCodes(text, cutPoint);

  return truncated + closing + ellipsis;
}

/**
 * Truncate at start: "Hello World" -> "…o World"
 */
function truncateStart(
  text: string,
  width: number,
  ellipsis: string,
  fullUnicode: boolean,
): string {
  // Work backwards from the end
  const visualWidth = measureVisualWidth(text, fullUnicode);
  const startWidth = visualWidth - width;
  const startPoint = findTruncationPoint(text, startWidth, fullUnicode);

  const truncated = text.substring(startPoint);

  // Get active ANSI codes at start point to reopen them
  const active = getActiveAnsiCodes(text, startPoint);

  return ellipsis + active + truncated;
}

/**
 * Truncate in middle: "Hello World" -> "Hel…rld"
 */
function truncateMiddle(
  text: string,
  width: number,
  ellipsis: string,
  fullUnicode: boolean,
): string {
  // Split available width between start and end
  const startWidth = Math.ceil(width / 2);
  const endWidth = Math.floor(width / 2);

  // Get start portion
  const startPoint = findTruncationPoint(text, startWidth, fullUnicode);
  const startPart = text.substring(0, startPoint);
  const startClosing = getClosingAnsiCodes(text, startPoint);

  // Get end portion by working backwards
  const visualWidth = measureVisualWidth(text, fullUnicode);
  const endStartWidth = visualWidth - endWidth;
  const endPoint = findTruncationPoint(text, endStartWidth, fullUnicode);
  const endPart = text.substring(endPoint);
  const endActive = getActiveAnsiCodes(text, endPoint);

  return startPart + startClosing + ellipsis + endActive + endPart;
}

/**
 * Wrap text into multiple lines respecting word boundaries
 * This is a simplified version - full implementation would be in _wrapContent
 */
export function wrapTextLines(text: string, options: WrapOptions): string[] {
  const { width, fullUnicode = false, lookBackDistance = 10 } = options;

  // Handle empty string - return array with one empty string
  if (text.length === 0) {
    return [""];
  }

  const lines: string[] = [];
  let currentLine = text;

  while (currentLine.length > 0) {
    const visualWidth = measureVisualWidth(currentLine, fullUnicode);

    if (visualWidth <= width) {
      // Fits on one line
      lines.push(currentLine);
      break;
    }

    // Find break point
    let breakPoint = findTruncationPoint(currentLine, width, fullUnicode);

    // Try to find a space to break on
    if (breakPoint !== currentLine.length) {
      let searchStart = Math.max(0, breakPoint - lookBackDistance);
      let lastSpace = -1;

      for (let i = breakPoint - 1; i >= searchStart; i--) {
        if (currentLine[i] === " ") {
          lastSpace = i;
          break;
        }
      }

      if (lastSpace !== -1) {
        breakPoint = lastSpace + 1;
      }
    }

    // Split line
    const part = currentLine.substring(0, breakPoint);
    lines.push(part);
    currentLine = currentLine.substring(breakPoint);
  }

  return lines;
}

/**
 * Calculate visual width accounting for ANSI codes and wide characters
 * This is a convenience wrapper around measureVisualWidth
 */
export function getVisualWidth(
  text: string,
  fullUnicode: boolean = false,
): number {
  return measureVisualWidth(text, fullUnicode);
}

/**
 * Check if text needs wrapping at the given width
 */
export function needsWrapping(
  text: string,
  width: number,
  fullUnicode: boolean = false,
): boolean {
  return measureVisualWidth(text, fullUnicode) > width;
}
