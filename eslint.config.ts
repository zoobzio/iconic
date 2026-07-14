import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettierPlugin,
  {
    ignores: [
      "**/dist/",
      "**/.dist/",
      "**/.nuxt/",
      "**/.output/",
      "**/.generated/",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    /* Generator scripts run under node, whose runtime globals the browserless
       default config does not declare. */
    files: ["**/scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        URL: "readonly",
        console: "readonly",
        process: "readonly",
      },
    },
  },
);
