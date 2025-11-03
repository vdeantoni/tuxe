import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    include: ["@unblessed/browser", "@unblessed/core", "xterm"],
  },
});
