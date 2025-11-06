/**
 * BrowserRuntime - Browser implementation of Runtime interface
 *
 * Provides browser-compatible implementations of Node.js APIs needed by @unblessed/core.
 * Automatically sets up global polyfills (process, Buffer) when instantiated.
 */

// IMPORTANT: Set up minimal globals FIRST, before any other imports
import "./globals.js";

import type { Runtime } from "@unblessed/core";
import { Buffer } from "buffer";
import { EventEmitter } from "events";
import path from "path-browserify";
import { StringDecoder } from "string_decoder";
import { createFilesystem } from "../polyfills/fs-helper.js";
import { createProcess } from "../polyfills/process.js";
import { createTTY } from "../polyfills/tty.js";
import { fileURLToPath } from "../polyfills/url.js";

// Simple util implementation (avoid importing util package which causes Vite issues)
const browserUtil = {
  inspect: (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  },
  format: (format: string, ...args: any[]): string => {
    let i = 0;
    return format.replace(/%[sdj%]/g, (match) => {
      if (match === "%%") return "%";
      if (i >= args.length) return match;
      const arg = args[i++];
      switch (match) {
        case "%s":
          return String(arg);
        case "%d":
          return String(Number(arg));
        case "%j":
          return JSON.stringify(arg);
        default:
          return match;
      }
    });
  },
  inherits: () => {},
  deprecate: (fn: Function) => fn,
};

// Simple stream stubs (avoid importing stream-browserify which causes issues)
class Readable extends EventEmitter {
  constructor() {
    super();
  }
}

class Writable extends EventEmitter {
  constructor() {
    super();
  }
}

/**
 * Browser runtime implementation
 *
 * Automatically sets up global polyfills (process, Buffer, global) when instantiated.
 * This allows @unblessed/core to work in browser environments.
 */
export class BrowserRuntime implements Runtime {
  fs: Runtime["fs"];
  path: Runtime["path"];
  process: Runtime["process"];
  buffer: Runtime["buffer"];
  url: Runtime["url"];
  util: Runtime["util"];
  stream: Runtime["stream"];
  stringDecoder: Runtime["stringDecoder"];
  events: Runtime["events"];

  // Optional APIs
  images?: Runtime["images"];
  processes?: Runtime["processes"];
  networking?: Runtime["networking"];

  constructor() {
    // Globals are already set up by globals.ts import
    // Now set up the full runtime with complete process implementation

    const fsImpl = createFilesystem();
    const processImpl = createProcess();

    // Update global process with full implementation
    if (globalThis.process) {
      Object.assign(globalThis.process, processImpl);
    }

    this.fs = {
      ...fsImpl,
      // Fix statSync and lstatSync to pass fs reference
      statSync: ((filePath: any) => fsImpl.statSync(filePath, fsImpl)) as any,
      lstatSync: ((filePath: any) => fsImpl.lstatSync(filePath, fsImpl)) as any,
    };

    this.path = path as Runtime["path"];
    this.process = processImpl;
    this.buffer = { Buffer };
    // @ts-ignore - url API partial implementation
    this.url = { fileURLToPath };
    // @ts-ignore - util API partial implementation
    this.util = browserUtil as Runtime["util"];
    // @ts-ignore - stream stubs, not full implementation
    this.stream = { Readable, Writable };
    this.stringDecoder = { StringDecoder };
    this.events = { EventEmitter };

    // Optional: Image support (throws errors in browser)
    this.images = {
      png: {
        PNG: class PNG {
          constructor() {
            throw new Error("PNG images are not supported in browser");
          }
        } as any,
      },
      gif: {
        GifReader: class GifReader {
          constructor() {
            throw new Error("GIF images are not supported in browser");
          }
        } as any,
      },
    };

    // Optional: Child processes (not available in browser)
    this.processes = {
      childProcess: {
        spawn: () => {
          throw new Error("child_process.spawn is not available in browser");
        },
        exec: () => {
          throw new Error("child_process.exec is not available in browser");
        },
        execFile: () => {
          throw new Error("child_process.execFile is not available in browser");
        },
        fork: () => {
          throw new Error("child_process.fork is not available in browser");
        },
      } as any,
    };

    // Optional: Networking (TTY only)
    this.networking = {
      net: {
        createServer: () => {
          throw new Error("net.createServer is not available in browser");
        },
        connect: () => {
          throw new Error("net.connect is not available in browser");
        },
      } as any,
      tty: createTTY(),
    };
  }
}
