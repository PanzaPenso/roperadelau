import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "dist/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["src/**/*.{js,jsx,ts,tsx}", "*.{js,jsx,ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@next/next/no-img-element": "error",
    },
  },
];

export default eslintConfig;
