import { describe, expect, it } from "vitest";
import { hojeIso } from "../../shared/datas";
import { criarVisitaSchema } from "./visitas.schema";

const UM_ID = "3f2b6e1a-0c4d-4b8e-9a1f-2d3c4b5a6e7f";

const corpoValido = {
  instituicao: "Escola Estadual",
  numeroPessoas: 20,
  colaboradorId: UM_ID,
};

function camposComErro(corpo: unknown): string[] {
  const resultado = criarVisitaSchema.safeParse(corpo);
  if (resultado.success) return [];
  return resultado.error.issues.map((problema) => problema.path.join("."));
}

describe("schema do registro de visita", () => {
  it("aceita o corpo mínimo e preenche a data de hoje", () => {
    expect(criarVisitaSchema.parse(corpoValido).data).toBe(hojeIso());
  });

  it("exige instituição, número de pessoas e quem está registrando", () => {
    expect(camposComErro({ ...corpoValido, instituicao: "  " })).toEqual(["instituicao"]);
    expect(camposComErro({ ...corpoValido, numeroPessoas: undefined })).toEqual(["numeroPessoas"]);
    expect(camposComErro({ ...corpoValido, colaboradorId: undefined })).toEqual(["colaboradorId"]);
  });

  it("recusa número de pessoas zero, negativo ou quebrado", () => {
    for (const numeroPessoas of [0, -3, 2.5]) {
      expect(camposComErro({ ...corpoValido, numeroPessoas })).toEqual(["numeroPessoas"]);
    }
  });

  it("recusa data no futuro", () => {
    expect(camposComErro({ ...corpoValido, data: "2999-01-01" })).toEqual(["data"]);
  });
});
