import { MetodoQuebra, SetorViveiro, TipoDestino, TipoRecipiente } from "@prisma/client";
import { z } from "zod";
import { dataNaoFutura, hojeIso } from "../../shared/datas";

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
    dataPlantio: dataNaoFutura("do plantio").default(hojeIso),
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

// RN-03: o lote só avança. O schema aceita qualquer etapa para que a API possa
// responder 409 a quem tenta voltar, em vez de um 422 genérico; quem decide se
// a transição vale é o service, olhando a etapa atual do lote.
export const transicaoSchema = z.object({
  estagioNovo: z.enum(["ESTAGIO_1", "ESTAGIO_2", "FINALIZADO"], {
    errorMap: () => ({ message: "Escolha a etapa para onde o lote vai." }),
  }),
  tipoRecipiente: z.nativeEnum(TipoRecipiente, {
    errorMap: () => ({ message: "Escolha o recipiente: tubete, sementeira, saco ou cano." }),
  }),
  setor: z.nativeEnum(SetorViveiro, {
    errorMap: () => ({ message: "Escolha um dos quatro setores do viveiro." }),
  }),
  identificacaoFina: z.string().trim().min(1).optional(),
  // Contagem feita na hora da transferência. Opcional: nem toda troca de
  // recipiente tem recontagem.
  qtdMudasVivas: z
    .number({ invalid_type_error: "A contagem de mudas vivas precisa ser um número." })
    .int("A contagem de mudas vivas precisa ser um número inteiro.")
    .nonnegative("A contagem de mudas vivas não pode ser negativa.")
    .optional(),
  data: dataNaoFutura("da transferência").default(hojeIso),
  observacao: z.string().trim().min(1).optional(),
  // RN-06: quem registra vem no corpo, nunca do token.
  colaboradorId: z
    .string({ required_error: "Escolha quem está registrando." })
    .uuid("Escolha quem está registrando."),
});

export type DadosTransicao = z.infer<typeof transicaoSchema>;

// RN-04: no banco os campos por tipo são opcionais; quem exige é a API, aqui,
// conforme o tipo escolhido. A data anterior ao plantio só o service sabe.
export const destinoSchema = z
  .object({
    tipo: z.nativeEnum(TipoDestino, {
      errorMap: () => ({ message: "Escolha o destino: plantio definitivo, doação ou perda." }),
    }),
    data: dataNaoFutura("do destino"),
    quantidade: z
      .number({
        required_error: "Informe quantas mudas saíram do viveiro.",
        invalid_type_error: "A quantidade precisa ser um número.",
      })
      .int("A quantidade precisa ser um número inteiro.")
      .positive("A quantidade precisa ser de pelo menos uma muda."),
    latitude: z
      .number({ invalid_type_error: "A latitude precisa ser um número." })
      .min(-90, "A latitude fica entre -90 e 90.")
      .max(90, "A latitude fica entre -90 e 90.")
      .optional(),
    longitude: z
      .number({ invalid_type_error: "A longitude precisa ser um número." })
      .min(-180, "A longitude fica entre -180 e 180.")
      .max(180, "A longitude fica entre -180 e 180.")
      .optional(),
    localDescricao: z.string().trim().optional(),
    destinatario: z.string().trim().optional(),
    causa: z.string().trim().min(1).optional(),
    // RN-06: quem registra vem no corpo, nunca do token.
    colaboradorId: z
      .string({ required_error: "Escolha quem está registrando." })
      .uuid("Escolha quem está registrando."),
  })
  .superRefine((dados, ctx) => {
    if (dados.tipo === "PLANTIO_DEFINITIVO") {
      if (dados.latitude === undefined) {
        ctx.addIssue({ code: "custom", path: ["latitude"], message: "Informe a latitude do plantio." });
      }
      if (dados.longitude === undefined) {
        ctx.addIssue({ code: "custom", path: ["longitude"], message: "Informe a longitude do plantio." });
      }
      if (!dados.localDescricao || dados.localDescricao.length < 5) {
        ctx.addIssue({
          code: "custom",
          path: ["localDescricao"],
          message: "Descreva o local do plantio com pelo menos 5 caracteres.",
        });
      }
    }
    if (dados.tipo === "DOACAO" && !dados.destinatario) {
      ctx.addIssue({ code: "custom", path: ["destinatario"], message: "Informe quem recebeu a doação." });
    }
  });

export type DadosDestino = z.infer<typeof destinoSchema>;
