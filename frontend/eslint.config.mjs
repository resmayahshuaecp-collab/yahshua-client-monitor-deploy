import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

// eslint-config-next@15.5.13 still ships a legacy eslintrc-shaped config
// (extends/plugins/parser), not a spreadable flat-config array. Wrapping it
// with FlatCompat is the officially documented way to use it under ESLint 9
// flat config until eslint-config-next itself ships a flat export.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { ignores: [".next/**", "node_modules/**", "test-results/**", "playwright-report/**"] },
];

export default eslintConfig;
