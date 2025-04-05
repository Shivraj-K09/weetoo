// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  // 1) pull in all of Next.js’s TS + Core‑Web‑Vitals rules
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
  }),

  // 2) override just the `any` rule
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
