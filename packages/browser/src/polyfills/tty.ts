/**
 * tty polyfill for browser
 * Mocks terminal detection
 */

export const isatty = () => true;

export class ReadStream {
  isRaw = false;
  isTTY = true;

  setRawMode(mode: boolean) {
    this.isRaw = mode;
    return this;
  }
}

export class WriteStream {
  isTTY = true;
  columns = 80;
  rows = 24;

  constructor() {}

  getWindowSize(): [number, number] {
    return [this.columns, this.rows];
  }
}

export function createTTY() {
  return {
    isatty,
    ReadStream,
    WriteStream,
  };
}

export default {
  isatty,
  ReadStream,
  WriteStream,
};
