import { describe, expect, it } from "vitest";
import { hojeIso } from "../../shared/datas";
import { criarColetaSchema } from "./coletas.schema";

// Aqui ninguém consulta o banco: o schema só olha a forma dos dados.
const UM_ID = "3f2b6e1a-0c4d-4b8e-9a1f-2d3c4b5a6e7f";

// Uma matriz no entorno de Caicó-RN, como as do seed.
const corpoValido = {
  especieId: UM_ID,
  qtdSementes: 300,
  dataColeta: "2026-09-01",
  matrizLat: -6.4512,
  matrizLng: -37.0918,
  colaboradorId: UM_ID,
};

/** Devolve os campos com problema; lista vazia significa corpo aceito. */
function camposComErro(corpo: unknown): string[] {
  const resultado = criarColetaSchema.safeParse(corpo);
  if (resultado.success) return [];
  return resultado.error.issues.map((problema) => problema.path.join("."));
}

describe("schema do registro de coleta", () => {
  it("aceita o corpo completo", () => {
    expect(camposComErro(corpoValido)).toEqual([]);
  });

  it("preenche a data de hoje quando ela não vem", () => {
    const dados = criarColetaSchema.parse({ ...corpoValido, dataColeta: undefined });
    expect(dados.dataColeta).toBe(hojeIso());
  });

  it("recusa data de coleta no futuro", () => {
    expect(camposComErro({ ...corpoValido, dataColeta: "2999-01-01" })).toEqual(["dataColeta"]);
  });

  it("RN-05: a coordenada da matriz é obrigatória", () => {
    expect(camposComErro({ ...corpoValido, matrizLat: undefined })).toEqual(["matrizLat"]);
    expect(camposComErro({ ...corpoValido, matrizLng: undefined })).toEqual(["matrizLng"]);
  });

  it("latitude entre -90 e 90, longitude entre -180 e 180", () => {
    expect(camposComErro({ ...corpoValido, matrizLat: -90.5 })).toEqual(["matrizLat"]);
    expect(camposComErro({ ...corpoValido, matrizLat: 91 })).toEqual(["matrizLat"]);
    expect(camposComErro({ ...corpoValido, matrizLng: -180.1 })).toEqual(["matrizLng"]);
    expect(camposComErro({ ...corpoValido, matrizLng: 181 })).toEqual(["matrizLng"]);
    expect(camposComErro({ ...corpoValido, matrizLat: -90, matrizLng: 180 })).toEqual([]);
  });

  it("exige pelo menos uma semente, em número inteiro", () => {
    expect(camposComErro({ ...corpoValido, qtdSementes: 0 })).toEqual(["qtdSementes"]);
    expect(camposComErro({ ...corpoValido, qtdSementes: 2.5 })).toEqual(["qtdSementes"]);
  });

  it("RN-06: exige quem está registrando", () => {
    expect(camposComErro({ ...corpoValido, colaboradorId: undefined })).toEqual(["colaboradorId"]);
  });

  it("descrição do local é opcional e sem espaços sobrando", () => {
    const dados = criarColetaSchema.parse({ ...corpoValido, localDescricao: "  Trilha do Seridó " });
    expect(dados.localDescricao).toBe("Trilha do Seridó");
    expect(camposComErro(corpoValido)).toEqual([]);
  });
});
