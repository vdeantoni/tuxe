#!/usr/bin/env node

/**
 * Publish all packages to npm in dependency order
 *
 * This script is called by semantic-release during the publish step.
 * It publishes packages in the correct order to respect dependencies.
 *
 * All packages are published with:
 * - --provenance flag (cryptographic attestation)
 * - --access public (scoped packages)
 * - --no-git-checks (version already committed)
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";

/**
 * Package publish order (respects dependencies)
 * - Independent packages can be in any order
 * - Dependent packages must come after their dependencies
 */
const PUBLISH_ORDER = [
  // Core package
  "@unblessed/core",

  // Runtime adapters
  "@unblessed/node",
  "@unblessed/browser",

  // Renderers
  "@unblessed/layout",
  "@unblessed/react",

  // VRT tools
  "@unblessed/vrt",

  // Compatibility layer
  "@unblessed/blessed",

  // Create unblessed package
  "@unblessed/create-unblessed",
];

console.log("\n📦 Publishing all packages to npm...\n");

let successCount = 0;
let skipCount = 0;

PUBLISH_ORDER.forEach((pkgName) => {
  try {
    // Find package.json for this package
    const pkgPath = `packages/${pkgName.split("/").pop()}/package.json`;
    let pkg;

    try {
      pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    } catch (error) {
      // Package directory might not exist (e.g., renamed or removed)
      console.log(`  ⏭️  ${pkgName}: Package not found, skipping`);
      skipCount++;
      return;
    }

    console.log(`  📤 Publishing ${pkgName}@${pkg.version}...`);

    // Publish with provenance and public access
    const publishCmd = [
      "pnpm",
      "publish",
      "--filter",
      pkgName,
      "--provenance",
      "--access",
      "public",
      "--no-git-checks",
    ].join(" ");

    execSync(publishCmd, {
      stdio: "inherit",
      cwd: process.cwd(),
      env: {
        ...process.env,
        // Ensure npm token is available
        NODE_AUTH_TOKEN: process.env.NPM_TOKEN || process.env.NODE_AUTH_TOKEN,
      },
    });

    console.log(`  ✅ ${pkgName}@${pkg.version} published successfully\n`);
    successCount++;
  } catch (error) {
    console.error(`\n  ❌ Failed to publish ${pkgName}:`);
    console.error(`     ${error.message}\n`);
    process.exit(1);
  }
});

console.log(`\n✨ Publishing complete!`);
console.log(`   Published: ${successCount} packages`);
if (skipCount > 0) {
  console.log(`   Skipped: ${skipCount} packages`);
}
console.log("");

process.exit(0);
