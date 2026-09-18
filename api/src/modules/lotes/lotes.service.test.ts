import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Estagio } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import type { DadosNovoLote } from "./lotes.schema";
import { criarLote } from "./lotes.service";

// Roda contra o banco de desenvolvimento e cria o próprio conjunto de
// registros. O nome comum começa com Y, prefixo que nem o seed nem o teste
// de etiqueta usam, para não mexer no contador de ninguém.
const MARCA = "TESTE-LOTES";
const NOME_COMUM = "Yteste lotes";

let especieId: string;
let colaboradorId: string;
let colaboradorInativoId: string;
let substratoId: string;
let coletaId: string;
let coletaConcorrenciaId: string;

beforeAll(async () => {
  await limpar();

  const colaborador = await prisma.colaborador.create({ data: { nome: MARCA } });
  colaboradorId = colaborador.id;

  const inativo = await prisma.colaborador.create({
    data: { nome: `${MARCA} inativo`, ativo: false },
  });
  colaboradorInativoId = inativo.id;

  const substrato = await prisma.substrato.create({ data: { nome: MARCA } });
  substratoId = substrato.id;

  const especie = await prisma.especie.create({
    data: { nomeComum: NOME_COMUM, nomeCientifico: MARCA, familia: MARCA },
  });
  especieId = especie.id;

  const coleta = await prisma.coleta.create({
    data: {
      especieId,
      colaboradorId,
      matrizLat: -6.45,
      matrizLng: -37.09,
      qtdSementes: 100,
      dataColeta: new Date("2026-08-01"),
    },
  });
  coletaId = coleta.id;

  const outraColeta = await prisma.coleta.create({
    data: {
      especieId,
      colaboradorId,
      matrizLat: -6.46,
      matrizLng: -37.1,
      qtdSementes: 50,
      dataColeta: new Date("2026-08-02"),
    },
  });
  coletaConcorrenciaId = outraColeta.id;
});

afterAll(async () => {
  await limpar();
  await prisma.$disconnect();
});

async function limpar() {
  await prisma.historicoCrescimento.deleteMany({
    where: { lote: { especie: { nomeComum: NOME_COMUM } } },
  });
  await prisma.loteMudas.deleteMany({ where: { especie: { nomeComum: NOME_COMUM } } });
  await prisma.coleta.deleteMany({ where: { especie: { nomeComum: NOME_COMUM } } });
  await prisma.especie.deleteMany({ where: { nomeComum: NOME_COMUM } });
  await prisma.substrato.deleteMany({ where: { nome: MARCA } });
  await prisma.colaborador.deleteMany({ where: { nome: { startsWith: MARCA } } });
  await prisma.contadorTag.deleteMany({ where: { prefixo: "Y" } });
}

function dadosDoLote(sobrescrever: Partial<DadosNovoLote> = {}): DadosNovoLote {
  return {
    coletaId,
    qtdSementes: 60,
    dataPlantio: "2026-09-01",
    tipoRecipiente: "TUBETE",
    tratamentoSemente: "ESCARIFICACAO",
    substratoId,
    setor: "SEMENTEIRAS",
    colaboradorId,
    ...sobrescrever,
  };
}

describe("cadastro de lote", () => {
  it("gera a etiqueta, herda a espécie da coleta, nasce na etapa 1 e grava o histórico", async () => {
    const lote = await criarLote(dadosDoLote({ identificacaoFina: "bancada 9" }));

    expect(lote.tagUnica).toBe("Y-001");
    expect(lote.especieId).toBe(especieId);
    expect(lote.estagioAtual).toBe(Estagio.ESTAGIO_1);
    expect(lote.identificacaoFina).toBe("bancada 9");
    // O que a tela de confirmação mostra: a etiqueta, a espécie e quem registrou.
    expect(lote.especie.nomeComum).toBe(NOME_COMUM);
    expect(lote.colaborador.nome).toBe(MARCA);
    expect(lote.substrato.nome).toBe(MARCA);

    const historico = await prisma.historicoCrescimento.findMany({ where: { loteId: lote.id } });
    expect(historico).toHaveLength(1);
    expect(historico[0]).toMatchObject({
      estagioAnterior: null,
      estagioNovo: Estagio.ESTAGIO_1,
      recipienteNovo: "TUBETE",
      setorNovo: "SEMENTEIRAS",
      colaboradorId,
    });
  });

  it("RN-01: avança a etiqueta a cada cadastro", async () => {
    const lote = await criarLote(dadosDoLote({ qtdSementes: 30 }));
    expect(lote.tagUnica).toBe("Y-002");
  });

  it("RN-05: recusa lote acima do saldo da coleta com 409 e o saldo na resposta", async () => {
    // 100 coletadas, 60 + 30 já usadas: sobram 10.
    await expect(criarLote(dadosDoLote({ qtdSementes: 11 }))).rejects.toMatchObject({
      status: 409,
      erro: "conflito",
      detalhes: { saldo: 10 },
    });
    await expect(criarLote(dadosDoLote({ qtdSementes: 11 }))).rejects.toThrow("10");
  });

  it("RN-05: aceita exatamente o saldo e depois recusa qualquer quantidade", async () => {
    const lote = await criarLote(dadosDoLote({ qtdSementes: 10 }));
    expect(lote.tagUnica).toBe("Y-003");

    await expect(criarLote(dadosDoLote({ qtdSementes: 1 }))).rejects.toMatchObject({
      status: 409,
      detalhes: { saldo: 0 },
    });
  });

  it("RN-05 sob concorrência: cadastros simultâneos nunca passam do saldo juntos", async () => {
    // 50 sementes na coleta e cinco pedidos de 20 ao mesmo tempo: só dois cabem.
    const resultados = await Promise.allSettled(
      Array.from({ length: 5 }, () =>
        criarLote(dadosDoLote({ coletaId: coletaConcorrenciaId, qtdSementes: 20 })),
      ),
    );

    const criados = resultados.filter((r) => r.status === "fulfilled");
    const recusados = resultados.filter((r) => r.status === "rejected");
    expect(criados).toHaveLength(2);
    expect(recusados).toHaveLength(3);
    for (const recusado of recusados) {
      expect(recusado.reason).toMatchObject({ status: 409 });
    }

    const usadas = await prisma.loteMudas.aggregate({
      _sum: { qtdSementes: true },
      where: { coletaId: coletaConcorrenciaId },
    });
    expect(usadas._sum.qtdSementes).toBe(40);

    // Os dois que entraram receberam etiquetas diferentes (RN-01 na mesma transação).
    const etiquetas = criados.map((r) => (r.status === "fulfilled" ? r.value.tagUnica : ""));
    expect(new Set(etiquetas).size).toBe(2);
  });

  it("recusa com 422, apontando o campo, coleta que não existe e colaborador ou substrato inativo", async () => {
    const idQueNaoExiste = "00000000-0000-4000-8000-000000000000";

    await expect(criarLote(dadosDoLote({ coletaId: idQueNaoExiste }))).rejects.toMatchObject({
      status: 422,
      detalhes: [{ campo: "coletaId" }],
    });
    await expect(
      criarLote(dadosDoLote({ colaboradorId: colaboradorInativoId })),
    ).rejects.toMatchObject({ status: 422, detalhes: [{ campo: "colaboradorId" }] });
    await expect(criarLote(dadosDoLote({ substratoId: idQueNaoExiste }))).rejects.toMatchObject({
      status: 422,
      detalhes: [{ campo: "substratoId" }],
    });
  });
});
