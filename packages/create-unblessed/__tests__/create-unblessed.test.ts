import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const cliPath = path.resolve(__dirname, "..", "dist", "index.js");
const tempDir = path.resolve(__dirname, "temp");

const run = (args, options = {}) => {
  return execa(cliPath, args, { cwd: tempDir, ...options });
};

describe("create-unblessed", () => {
  beforeEach(async () => {
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it("should create a node-react project", async () => {
    const { stdout } = await run(["my-node-react-app"]);

    expect(stdout).toContain("Creating a new unblessed app");

    const packageJsonPath = path.join(
      tempDir,
      "my-node-react-app",
      "package.json",
    );
    const packageJson = await fs.readJson(packageJsonPath);

    expect(packageJson.name).toBe("my-node-react-app");
    expect(packageJson.dependencies).toHaveProperty("@unblessed/react");
  });

  it("should create a browser-blessed project", async () => {
    const { stdout } = await run([
      "my-browser-blessed-app",
      "--platform",
      "browser",
      "--renderer",
      "blessed",
    ]);

    expect(stdout).toContain("Creating a new unblessed app");

    const packageJsonPath = path.join(
      tempDir,
      "my-browser-blessed-app",
      "package.json",
    );
    const packageJson = await fs.readJson(packageJsonPath);

    expect(packageJson.name).toBe("my-browser-blessed-app");
    expect(packageJson.dependencies).toHaveProperty("@unblessed/core");
  });
});
