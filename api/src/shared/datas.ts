import { z } from "zod";

/** Hoje no formato AAAA-MM-DD, no fuso do servidor. */
export function hojeIso(): string {
  const agora = new Date();
  const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

/**
 * Data de registro (AAAA-MM-DD) que não pode estar no futuro. O rótulo entra
 * nas mensagens: "do plantio", "da coleta".
 */
export function dataNaoFutura(rotulo: string) {
  return z
    .string({ required_error: `Informe a data ${rotulo}.` })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a data no formato AAAA-MM-DD.")
    .refine((data) => data <= hojeIso(), `A data ${rotulo} não pode ser no futuro.`);
}
