import { z } from "zod";
import { dataNaoFutura, hojeIso } from "../../shared/datas";

export const criarVisitaSchema = z.object({
  data: dataNaoFutura("da visita").default(hojeIso),
  instituicao: z
    .string({ required_error: "Informe a instituição." })
    .trim()
    .min(2, "Informe a instituição."),
  numeroPessoas: z
    .number({
      required_error: "Informe quantas pessoas vieram.",
      invalid_type_error: "O número de pessoas precisa ser um número.",
    })
    .int("O número de pessoas precisa ser um número inteiro.")
    .positive("A visita precisa ter pelo menos uma pessoa."),
  observacao: z.string().trim().min(1).optional(),
  // RN-06: quem registra vem no corpo, nunca do token.
  colaboradorId: z
    .string({ required_error: "Escolha quem está registrando." })
    .uuid("Escolha quem está registrando."),
});

export type DadosNovaVisita = z.infer<typeof criarVisitaSchema>;
