/**
 * Commitlint Configuration
 *
 * Enforces Conventional Commits format for semantic-release automation.
 * Valid commit types determine version bumps:
 * - fix: → patch version (1.0.0 → 1.0.1)
 * - feat: → minor version (1.0.0 → 1.1.0)
 * - BREAKING CHANGE: → major version (1.0.0 → 2.0.0)
 */

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Valid commit types
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation only
        "style", // Code style (formatting, semicolons, etc)
        "refactor", // Code refactoring (no feat or fix)
        "perf", // Performance improvements
        "test", // Adding/updating tests
        "build", // Build system or dependencies
        "ci", // CI/CD changes
        "chore", // Other changes (no production code)
        "revert", // Reverts a previous commit
      ],
    ],

    // Valid scopes (optional but recommended)
    "scope-enum": [
      1,
      "always",
      [
        "core", // @unblessed/core
        "node", // @unblessed/node
        "blessed", // @unblessed/blessed
        "browser", // @unblessed/browser
        "deps", // Dependency updates
        "release", // Release-related
        "ci", // CI/CD
        "dx", // Developer experience
        "docs", // Documentation
        "layout", // Layout
        "react", // React
        "create", // Create unblessed package
      ],
    ],

    // Subject requirements
    "subject-case": [2, "never", ["upper-case"]],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],

    // Body/footer requirements
    "body-leading-blank": [2, "always"],
    "footer-leading-blank": [2, "always"],

    // Max lengths
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [1, "always", 100],
  },
};
