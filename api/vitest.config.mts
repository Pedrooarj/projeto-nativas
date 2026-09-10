import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Os testes falam com o banco de verdade (docker compose up -d + npm run db:migrate).
    // Rodar em sequencia evita que dois arquivos disputem as mesmas linhas.
    fileParallelism: false,
    include: ["src/**/*.test.ts"],
  },
});
