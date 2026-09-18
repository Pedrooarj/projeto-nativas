import { describe, expect, it } from "vitest";
import { criarLoteSchema, hojeIso } from "./lotes.schema";

// Aqui ninguém consulta o banco: o schema só olha a forma dos dados.
// O id tem o formato que o Prisma gera (uuid v4).
const UM_ID = "3f2b6e1a-0c4d-4b8e-9a1f-2d3c4b5a6e7f";

const corpoValido = {
  coletaId: UM_ID,
  qtdSementes: 100,
  dataPlantio: "2026-09-01",
  tipoRecipiente: "TUBETE",
  tratamentoSemente: "ESCARIFICACAO",
  substratoId: UM_ID,
  setor: "SEMENTEIRAS",
  colaboradorId: UM_ID,
};

/** Devolve os campos com problema; lista vazia significa corpo aceito. */
function camposComErro(corpo: unknown): string[] {
  const resultado = criarLoteSchema.safeParse(corpo);
  if (resultado.success) return [];
  return resultado.error.issues.map((problema) => problema.path.join("."));
}

describe("schema do cadastro de lote", () => {
  it("aceita o corpo completo", () => {
    expect(camposComErro(corpoValido)).toEqual([]);
  });

  it("preenche a data de hoje quando ela não vem", () => {
    const dados = criarLoteSchema.parse({ ...corpoValido, dataPlantio: undefined });
    expect(dados.dataPlantio).toBe(hojeIso());
  });

  it("recusa data de plantio no futuro", () => {
    expect(camposComErro({ ...corpoValido, dataPlantio: "2999-01-01" })).toEqual(["dataPlantio"]);
  });

  it("RN-03: na etapa 1 o recipiente é só tubete ou sementeira", () => {
    expect(camposComErro({ ...corpoValido, tipoRecipiente: "SACO" })).toEqual(["tipoRecipiente"]);
    expect(camposComErro({ ...corpoValido, tipoRecipiente: "CANO" })).toEqual(["tipoRecipiente"]);
    expect(camposComErro({ ...corpoValido, tipoRecipiente: "SEMENTEIRA" })).toEqual([]);
  });

  it("RN-02: tratamento de dormência é só escarificação, embebição ou N", () => {
    expect(camposComErro({ ...corpoValido, tratamentoSemente: "CHOQUE_TERMICO" })).toEqual([
      "tratamentoSemente",
    ]);
    for (const metodo of ["ESCARIFICACAO", "EMBEBICAO", "N"]) {
      expect(camposComErro({ ...corpoValido, tratamentoSemente: metodo })).toEqual([]);
    }
  });

  it("RN-05: ignora especieId, porque a espécie do lote é a da coleta", () => {
    const dados = criarLoteSchema.parse({ ...corpoValido, especieId: UM_ID });
    expect("especieId" in dados).toBe(false);
  });

  it("RN-06: exige quem está registrando", () => {
    expect(camposComErro({ ...corpoValido, colaboradorId: undefined })).toEqual(["colaboradorId"]);
  });

  it("mudas vivas não passam as sementes plantadas", () => {
    expect(camposComErro({ ...corpoValido, qtdMudasVivas: 101 })).toEqual(["qtdMudasVivas"]);
    expect(camposComErro({ ...corpoValido, qtdMudasVivas: 100 })).toEqual([]);
  });

  it("exige pelo menos uma semente, em número inteiro", () => {
    expect(camposComErro({ ...corpoValido, qtdSementes: 0 })).toEqual(["qtdSementes"]);
    expect(camposComErro({ ...corpoValido, qtdSementes: 1.5 })).toEqual(["qtdSementes"]);
  });
});
