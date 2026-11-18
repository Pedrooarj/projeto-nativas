import { describe, expect, it } from "vitest";
import { hojeIso } from "../../shared/datas";
import { criarLoteSchema, destinoSchema, transicaoSchema } from "./lotes.schema";

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

describe("schema da transição de etapa", () => {
  const transicaoValida = {
    estagioNovo: "ESTAGIO_2",
    tipoRecipiente: "SACO",
    setor: "CANTEIROS",
    colaboradorId: UM_ID,
  };

  function errosDaTransicao(corpo: unknown): string[] {
    const resultado = transicaoSchema.safeParse(corpo);
    return resultado.success ? [] : resultado.error.issues.map((p) => p.path.join("."));
  }

  it("aceita o corpo mínimo e preenche a data de hoje", () => {
    expect(transicaoSchema.parse(transicaoValida).data).toBe(hojeIso());
  });

  it("recusa setor, recipiente e etapa fora da lista, e responsável ausente", () => {
    expect(errosDaTransicao({ ...transicaoValida, setor: "ESTUFA" })).toEqual(["setor"]);
    expect(errosDaTransicao({ ...transicaoValida, tipoRecipiente: "VASO" })).toEqual([
      "tipoRecipiente",
    ]);
    expect(errosDaTransicao({ ...transicaoValida, estagioNovo: "ETAPA_3" })).toEqual(["estagioNovo"]);
    expect(errosDaTransicao({ ...transicaoValida, colaboradorId: undefined })).toEqual([
      "colaboradorId",
    ]);
  });

  it("recusa data de transferência no futuro", () => {
    expect(errosDaTransicao({ ...transicaoValida, data: "2999-01-01" })).toEqual(["data"]);
  });
});

describe("schema do destino final (RN-04)", () => {
  const base = { data: "2026-10-01", quantidade: 10, colaboradorId: UM_ID };

  function errosDoDestino(corpo: unknown): string[] {
    const resultado = destinoSchema.safeParse(corpo);
    return resultado.success ? [] : resultado.error.issues.map((p) => p.path.join("."));
  }

  it("plantio definitivo exige latitude, longitude e descrição com 5 caracteres", () => {
    expect(errosDoDestino({ ...base, tipo: "PLANTIO_DEFINITIVO" })).toEqual([
      "latitude",
      "longitude",
      "localDescricao",
    ]);
    expect(
      errosDoDestino({
        ...base,
        tipo: "PLANTIO_DEFINITIVO",
        latitude: -6.4,
        longitude: -37.1,
        localDescricao: "Açu",
      }),
    ).toEqual(["localDescricao"]);
    expect(
      errosDoDestino({
        ...base,
        tipo: "PLANTIO_DEFINITIVO",
        latitude: -6.4,
        longitude: -37.1,
        localDescricao: "Praça central",
      }),
    ).toEqual([]);
  });

  it("recusa coordenada fora da faixa", () => {
    const plantio = { ...base, tipo: "PLANTIO_DEFINITIVO", localDescricao: "Praça central" };
    expect(errosDoDestino({ ...plantio, latitude: -91, longitude: 0 })).toEqual(["latitude"]);
    expect(errosDoDestino({ ...plantio, latitude: 0, longitude: 181 })).toEqual(["longitude"]);
  });

  it("doação exige destinatário; perda aceita sem causa", () => {
    expect(errosDoDestino({ ...base, tipo: "DOACAO" })).toEqual(["destinatario"]);
    expect(errosDoDestino({ ...base, tipo: "DOACAO", destinatario: "Escola" })).toEqual([]);
    expect(errosDoDestino({ ...base, tipo: "PERDA" })).toEqual([]);
  });

  it("exige data não futura, quantidade positiva e tipo conhecido", () => {
    expect(errosDoDestino({ ...base, tipo: "PERDA", data: undefined })).toEqual(["data"]);
    expect(errosDoDestino({ ...base, tipo: "PERDA", data: "2999-01-01" })).toEqual(["data"]);
    expect(errosDoDestino({ ...base, tipo: "PERDA", quantidade: 0 })).toEqual(["quantidade"]);
    expect(errosDoDestino({ ...base, tipo: "VENDA" })).toEqual(["tipo"]);
  });
});
