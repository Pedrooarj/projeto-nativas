/**
 * Enums e rótulos do domínio, duplicados aqui de propósito.
 *
 * FONTE DA VERDADE: api/prisma/schema.prisma. Mudou enum lá? Mude aqui também.
 * Não existe pacote compartilhado entre api/ e web/ neste projeto — a cópia é o
 * preço combinado por manter os dois projetos npm independentes.
 */

export type Papel = "ADMIN" | "EQUIPE";

export type MetodoQuebra = "ESCARIFICACAO" | "EMBEBICAO" | "N";

export type TipoRecipiente = "TUBETE" | "SEMENTEIRA" | "SACO" | "CANO";

export type SetorViveiro = "BANCO_SEMENTES" | "CANTEIROS" | "SEMENTEIRAS" | "RUSTIFICACAO";

export type Estagio = "ESTAGIO_1" | "ESTAGIO_2" | "FINALIZADO";

export type TipoDestino = "PLANTIO_DEFINITIVO" | "DOACAO" | "PERDA";

export const rotuloMetodoQuebra: Record<MetodoQuebra, string> = {
  ESCARIFICACAO: "Escarificação",
  EMBEBICAO: "Embebição",
  N: "Não necessita",
};

export const rotuloRecipiente: Record<TipoRecipiente, string> = {
  TUBETE: "Tubete",
  SEMENTEIRA: "Sementeira",
  SACO: "Saco",
  CANO: "Cano",
};

export const rotuloSetor: Record<SetorViveiro, string> = {
  BANCO_SEMENTES: "Banco de sementes",
  CANTEIROS: "Canteiros",
  SEMENTEIRAS: "Sementeiras",
  RUSTIFICACAO: "Rustificação",
};

/** Etapas são sempre nomeadas por número e nome na interface. */
export const rotuloEstagio: Record<Estagio, string> = {
  ESTAGIO_1: "Etapa 1 · Plantio inicial",
  ESTAGIO_2: "Etapa 2 · Crescimento",
  FINALIZADO: "Destino final",
};

export const rotuloTipoDestino: Record<TipoDestino, string> = {
  PLANTIO_DEFINITIVO: "Plantio definitivo",
  DOACAO: "Doação",
  PERDA: "Perda",
};

/** RN-03: cada etapa aceita apenas estes recipientes. */
export const recipientesPorEstagio: Record<"ESTAGIO_1" | "ESTAGIO_2", TipoRecipiente[]> = {
  ESTAGIO_1: ["TUBETE", "SEMENTEIRA"],
  ESTAGIO_2: ["SACO", "CANO"],
};

/** Lista sugerida pela coordenação. Pendência P6: confirmar se está completa. */
export const usosConhecidos = [
  "medicinal",
  "forrageiro",
  "madeireiro",
  "ornamental",
  "alimentício",
] as const;
