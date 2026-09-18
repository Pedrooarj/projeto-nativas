import { MetodoQuebra, SetorViveiro } from "@prisma/client";
import { z } from "zod";

/** Hoje no formato AAAA-MM-DD, no fuso do servidor. */
export function hojeIso(): string {
  const agora = new Date();
  const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

const dataIso = z
  .string({ required_error: "Informe a data do plantio." })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a data no formato AAAA-MM-DD.")
  .refine((data) => data <= hojeIso(), "A data do plantio não pode ser no futuro.");

// O corpo não tem especieId de propósito: a espécie do lote é a da coleta
// (RN-05) e o service copia de lá. A etiqueta também não vem do cliente (RN-01).
export const criarLoteSchema = z
  .object({
    coletaId: z
      .string({ required_error: "Escolha a coleta de origem." })
      .uuid("Escolha a coleta de origem."),
    qtdSementes: z
      .number({
        required_error: "Informe quantas sementes foram plantadas.",
        invalid_type_error: "A quantidade de sementes precisa ser um número.",
      })
      .int("A quantidade de sementes precisa ser um número inteiro.")
      .positive("Plante pelo menos uma semente."),
    qtdMudasVivas: z
      .number({ invalid_type_error: "A contagem de mudas vivas precisa ser um número." })
      .int("A contagem de mudas vivas precisa ser um número inteiro.")
      .nonnegative("A contagem de mudas vivas não pode ser negativa.")
      .optional(),
    dataPlantio: dataIso.default(hojeIso),
    // RN-03: o lote nasce na etapa 1, e a etapa 1 só aceita estes dois.
    tipoRecipiente: z.enum(["TUBETE", "SEMENTEIRA"], {
      errorMap: () => ({ message: "Na etapa 1 o recipiente é tubete ou sementeira." }),
    }),
    // RN-02: três métodos, e nenhum outro.
    tratamentoSemente: z.nativeEnum(MetodoQuebra, {
      errorMap: () => ({
        message: "Tratamento de dormência: escarificação, embebição ou não necessita.",
      }),
    }),
    substratoId: z.string({ required_error: "Escolha o substrato." }).uuid("Escolha o substrato."),
    setor: z.nativeEnum(SetorViveiro, {
      errorMap: () => ({ message: "Escolha um dos quatro setores do viveiro." }),
    }),
    identificacaoFina: z.string().trim().min(1).optional(),
    // RN-06: quem registra vem no corpo, nunca do token.
    colaboradorId: z
      .string({ required_error: "Escolha quem está registrando." })
      .uuid("Escolha quem está registrando."),
  })
  .refine(
    (dados) => dados.qtdMudasVivas === undefined || dados.qtdMudasVivas <= dados.qtdSementes,
    { path: ["qtdMudasVivas"], message: "As mudas vivas não podem passar as sementes plantadas." },
  );

export type DadosNovoLote = z.infer<typeof criarLoteSchema>;
