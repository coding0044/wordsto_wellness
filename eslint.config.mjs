import { defineConfig } from "eslint/config";

export default defineConfig({
  extends: ['plugin:@next/next/recommended'],
  ignorePatterns: [
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ],
});
