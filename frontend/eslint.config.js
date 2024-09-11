import eslintPlugnAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
    ...tseslint.configs.recommended,
    ...eslintPlugnAstro.configs.recommended,
    eslintConfigPrettier,
];
