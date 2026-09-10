import "dotenv/config";
import { z } from "zod";

const esquema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().default(3333),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

const resultado = esquema.safeParse(process.env);

if (!resultado.success) {
  const faltando = Object.keys(resultado.error.flatten().fieldErrors).join(", ");
  throw new Error(
    `Variaveis de ambiente invalidas ou ausentes: ${faltando}. Copie api/.env.example para api/.env.`,
  );
}

export const env = resultado.data;
