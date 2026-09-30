import { z } from "zod";
import { dataNaoFutura, hojeIso } from "../../shared/datas";

export const listarColetasQuerySchema = z.object({
  especieId: z.string().uuid().optional(),
});

export const criarColetaSchema = z.object({
  especieId: z.string({ required_error: "Escolha a espécie." }).uuid("Escolha a espécie."),
  qtdSementes: z
    .number({
      required_error: "Informe quantas sementes foram coletadas.",
      invalid_type_error: "A quantidade de sementes precisa ser um número.",
    })
    .int("A quantidade de sementes precisa ser um número inteiro.")
    .positive("Registre pelo menos uma semente."),
  dataColeta: dataNaoFutura("da coleta").default(hojeIso),
  // RN-05: sem a coordenada da matriz ninguém volta à mesma árvore no ano seguinte.
  matrizLat: z
    .number({
      required_error: "Informe a latitude da matriz.",
      invalid_type_error: "A latitude precisa ser um número.",
    })
    .min(-90, "A latitude fica entre -90 e 90.")
    .max(90, "A latitude fica entre -90 e 90."),
  matrizLng: z
    .number({
      required_error: "Informe a longitude da matriz.",
      invalid_type_error: "A longitude precisa ser um número.",
    })
    .min(-180, "A longitude fica entre -180 e 180.")
    .max(180, "A longitude fica entre -180 e 180."),
  localDescricao: z.string().trim().min(1).optional(),
  // RN-06: quem registra vem no corpo, nunca do token.
  colaboradorId: z
    .string({ required_error: "Escolha quem está registrando." })
    .uuid("Escolha quem está registrando."),
});

export type DadosNovaColeta = z.infer<typeof criarColetaSchema>;
