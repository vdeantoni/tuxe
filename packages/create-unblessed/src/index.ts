#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs-extra";
import path from "path";

const program = new Command();

program
  .name("create-unblessed")
  .description("Create a new unblessed project")
  .argument("[app-name]", "The name of the app to create")
  .option(
    "--platform <platform>",
    "The platform to target (node or browser)",
    "node",
  )
  .option(
    "--renderer <renderer>",
    "The renderer to use (react or blessed)",
    "react",
  )
  .action(async (appName, options) => {
    const targetDir = appName ? path.resolve(appName) : process.cwd();
    const { platform, renderer } = options;
    const templateDir = path.resolve(
      __dirname,
      "..",
      "templates",
      `${platform}-${renderer}`,
    );

    console.log(`Creating a new unblessed app in ${targetDir}`);

    try {
      if (!fs.existsSync(templateDir)) {
        console.error(`Template not found: ${platform}-${renderer}`);
        process.exit(1);
      }

      await fs.copy(templateDir, targetDir);

      const packageJsonPath = path.join(targetDir, "package.json");
      const packageJson = await fs.readJson(packageJsonPath);

      const newPackageName = appName
        ? path.basename(targetDir)
        : "my-unblessed-app";
      packageJson.name = newPackageName;

      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

      console.log("Project created successfully!");
      console.log("To get started:");
      if (appName) {
        console.log(`  cd ${appName}`);
      }
      console.log("  pnpm install");
      if (platform === "browser") {
        console.log("  pnpm dev");
      } else {
        console.log("  pnpm start");
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  });

program.parse(process.argv);
