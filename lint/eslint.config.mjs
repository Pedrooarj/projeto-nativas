import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["**/node_modules/**", "**/dist/**", "**/*.d.ts", "**/migrations/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Aviso e não erro: o caso atual é o setErro de web/src/rotas/publicas/Acervo.tsx,
      // arquivo do PR #53. O prefixo _ marca parâmetro exigido pela assinatura (Express).
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // O leitor de CSV do PR #52 remove o BOM com uma regex que contém o próprio caractere.
      "no-irregular-whitespace": ["error", { skipRegExps: true }],
    },
  },
  {
    files: ["api/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["web/src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
);
