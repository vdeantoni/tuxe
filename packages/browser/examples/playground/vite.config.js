import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: [
      "util",
      "stream-browserify",
      "path-browserify",
      "buffer",
      "events",
    ],
  },
  resolve: {
    alias: {
      // Ensure util and stream use bundled versions
      util: "util",
      stream: "stream-browserify",
    },
  },
  // Handle TypeScript with ESM imports from CDN
  esbuild: {
    // Keep JSX preservation since we transform at runtime
    jsx: "preserve",
  },
});
