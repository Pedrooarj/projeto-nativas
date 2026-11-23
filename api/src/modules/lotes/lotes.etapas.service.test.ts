import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Estagio } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import type { DadosDestino, DadosTransicao } from "./lotes.schema";
import {
  buscarLote,
  criarLote,
  obterQuadro,
  registrarDestino,
  transicionarLote,
} from "./lotes.service";

// Roda contra o banco de desenvolvimento com registros próprios. O nome comum
// começa com W, prefixo que nem o seed nem os outros testes usam.
const MARCA = "TESTE-ETAPAS";
const NOME_COMUM = "Wteste etapas";
const ID_QUE_NAO_EXISTE = "3f2b6e1a-0c4d-4b8e-9a1f-2d3c4b5a6e7f";

let colaboradorId: string;
let colaboradorInativoId: string;
let substratoId: string;
let coletaId: string;

beforeAll(async () => {
  await limpar();

  colaboradorId = (await prisma.colaborador.create({ data: { nome: MARCA } })).id;
  colaboradorInativoId = (
    await prisma.colaborador.create({ data: { nome: `${MARCA} inativo`, ativo: false } })
  ).id;
  substratoId = (await prisma.substrato.create({ data: { nome: MARCA } })).id;

  const especie = await prisma.especie.create({
    data: { nomeComum: NOME_COMUM, nomeCientifico: MARCA, familia: MARCA },
  });
  const coleta = await prisma.coleta.create({
    data: {
      especieId: especie.id,
      colaboradorId,
      matrizLat: -6.45,
      matrizLng: -37.09,
      qtdSementes: 2000,
      dataColeta: new Date("2026-08-01"),
    },
  });
  coletaId = coleta.id;
});

afterAll(async () => {
  await limpar();
  await prisma.$disconnect();
});

async function limpar() {
  const doTeste = { lote: { especie: { nomeComum: NOME_COMUM } } };
  await prisma.destinoFinal.deleteMany({ where: doTeste });
  await prisma.historicoCrescimento.deleteMany({ where: doTeste });
  await prisma.loteMudas.deleteMany({ where: { especie: { nomeComum: NOME_COMUM } } });
  await prisma.coleta.deleteMany({ where: { especie: { nomeComum: NOME_COMUM } } });
  await prisma.especie.deleteMany({ where: { nomeComum: NOME_COMUM } });
  await prisma.substrato.deleteMany({ where: { nome: MARCA } });
  await prisma.colaborador.deleteMany({ where: { nome: { startsWith: MARCA } } });
  await prisma.contadorTag.deleteMany({ where: { prefixo: "W" } });
}

/** Um lote novo na etapa 1, plantado em 2026-09-01. */
async function novoLote(qtdMudasVivas?: number) {
  return criarLote({
    coletaId,
    qtdSementes: 50,
    qtdMudasVivas,
    dataPlantio: "2026-09-01",
    tipoRecipiente: "TUBETE",
    tratamentoSemente: "N",
    substratoId,
    setor: "SEMENTEIRAS",
    identificacaoFina: "bancada 1",
    colaboradorId,
  });
}

function transicao(sobrescrever: Partial<DadosTransicao> = {}): DadosTransicao {
  return {
    estagioNovo: "ESTAGIO_2",
    tipoRecipiente: "SACO",
    setor: "CANTEIROS",
    data: "2026-10-01",
    colaboradorId,
    ...sobrescrever,
  };
}

function plantio(sobrescrever: Partial<DadosDestino> = {}): DadosDestino {
  return {
    tipo: "PLANTIO_DEFINITIVO",
    data: "2026-10-15",
    quantidade: 30,
    latitude: -6.46,
    longitude: -37.1,
    localDescricao: "Margem do açude Itans",
    colaboradorId,
    ...sobrescrever,
  };
}

describe("transição de etapa (RN-03)", () => {
  it("leva o lote da etapa 1 para a 2, atualiza recipiente e setor e grava o histórico", async () => {
    const lote = await novoLote();
    const depois = await transicionarLote(
      lote.id,
      transicao({ qtdMudasVivas: 42, identificacaoFina: "fileira 4", observacao: "Repicagem." }),
    );

    expect(depois.estagioAtual).toBe(Estagio.ESTAGIO_2);
    expect(depois.tipoRecipiente).toBe("SACO");
    expect(depois.setor).toBe("CANTEIROS");
    expect(depois.identificacaoFina).toBe("fileira 4");
    expect(depois.qtdMudasVivas).toBe(42);

    // Append-only: a linha do cadastro continua lá e a da transição vem depois.
    expect(depois.historico).toHaveLength(2);
    expect(depois.historico[1]).toMatchObject({
      estagioAnterior: Estagio.ESTAGIO_1,
      estagioNovo: Estagio.ESTAGIO_2,
      recipienteNovo: "SACO",
      setorNovo: "CANTEIROS",
      observacao: "Repicagem.",
      colaboradorId,
    });
    expect(depois.historico[1].colaborador.nome).toBe(MARCA);
  });

  it("sem identificação fina nova, apaga a antiga, porque o lote mudou de lugar", async () => {
    const lote = await novoLote();
    const depois = await transicionarLote(lote.id, transicao());
    expect(depois.identificacaoFina).toBeNull();
  });

  it("recusa voltar ou repetir etapa com 409", async () => {
    const lote = await novoLote();
    await expect(
      transicionarLote(lote.id, transicao({ estagioNovo: "ESTAGIO_1", tipoRecipiente: "TUBETE" })),
    ).rejects.toMatchObject({ status: 409 });

    await transicionarLote(lote.id, transicao());
    await expect(transicionarLote(lote.id, transicao())).rejects.toMatchObject({ status: 409 });
    await expect(
      transicionarLote(lote.id, transicao({ estagioNovo: "ESTAGIO_1", tipoRecipiente: "TUBETE" })),
    ).rejects.toMatchObject({ status: 409 });

    // Nada novo no histórico depois das recusas.
    const historico = await prisma.historicoCrescimento.count({ where: { loteId: lote.id } });
    expect(historico).toBe(2);
  });

  it("manda finalizar pelo destino final, não pela transição", async () => {
    const lote = await novoLote();
    await expect(
      transicionarLote(lote.id, transicao({ estagioNovo: "FINALIZADO" })),
    ).rejects.toMatchObject({ status: 409 });
  });

  it("na etapa 2 o recipiente é só saco ou cano (422)", async () => {
    const lote = await novoLote();
    for (const recipiente of ["TUBETE", "SEMENTEIRA"] as const) {
      await expect(
        transicionarLote(lote.id, transicao({ tipoRecipiente: recipiente })),
      ).rejects.toMatchObject({ status: 422, detalhes: [{ campo: "tipoRecipiente" }] });
    }
    const comCano = await transicionarLote(lote.id, transicao({ tipoRecipiente: "CANO" }));
    expect(comCano.tipoRecipiente).toBe("CANO");
  });

  it("recusa data anterior ao plantio, mudas vivas acima das sementes e colaborador inativo", async () => {
    const lote = await novoLote();
    await expect(
      transicionarLote(lote.id, transicao({ data: "2026-08-31" })),
    ).rejects.toMatchObject({ status: 422, detalhes: [{ campo: "data" }] });
    await expect(
      transicionarLote(lote.id, transicao({ qtdMudasVivas: 51 })),
    ).rejects.toMatchObject({ status: 422, detalhes: [{ campo: "qtdMudasVivas" }] });
    await expect(
      transicionarLote(lote.id, transicao({ colaboradorId: colaboradorInativoId })),
    ).rejects.toMatchObject({ status: 422, detalhes: [{ campo: "colaboradorId" }] });
  });

  it("duas transições simultâneas do mesmo lote: só uma passa", async () => {
    const lote = await novoLote();
    const resultados = await Promise.allSettled([
      transicionarLote(lote.id, transicao()),
      transicionarLote(lote.id, transicao()),
    ]);
    expect(resultados.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const historico = await prisma.historicoCrescimento.count({ where: { loteId: lote.id } });
    expect(historico).toBe(2);
  });

  it("devolve 404 para lote que não existe ou foi excluído", async () => {
    await expect(transicionarLote(ID_QUE_NAO_EXISTE, transicao())).rejects.toMatchObject({
      status: 404,
    });
    const lote = await novoLote();
    await prisma.loteMudas.update({ where: { id: lote.id }, data: { deletedAt: new Date() } });
    await expect(transicionarLote(lote.id, transicao())).rejects.toMatchObject({ status: 404 });
  });
});

describe("destino final (RN-04)", () => {
  it("plantio definitivo: cria o destino, finaliza o lote e grava o histórico", async () => {
    const lote = await novoLote(40);
    const depois = await registrarDestino(lote.id, plantio());

    expect(depois.estagioAtual).toBe(Estagio.FINALIZADO);
    expect(depois.destino).toMatchObject({
      tipo: "PLANTIO_DEFINITIVO",
      quantidade: 30,
      localDescricao: "Margem do açude Itans",
      destinatario: null,
    });
    expect(Number(depois.destino?.destinoLat)).toBeCloseTo(-6.46);
    expect(depois.historico.at(-1)).toMatchObject({
      estagioAnterior: Estagio.ESTAGIO_1,
      estagioNovo: Estagio.FINALIZADO,
      observacao: "Destino final: plantio definitivo.",
    });
  });

  it("aceita destino a partir da etapa 2 e grava só os campos do tipo", async () => {
    const lote = await novoLote();
    await transicionarLote(lote.id, transicao());
    const depois = await registrarDestino(lote.id, {
      tipo: "DOACAO",
      data: "2026-10-20",
      quantidade: 10,
      destinatario: "Escola Municipal de Caicó",
      // Veio coordenada por engano: doação não guarda ponto no mapa.
      latitude: -6.4,
      longitude: -37.0,
      colaboradorId,
    });
    expect(depois.destino).toMatchObject({
      tipo: "DOACAO",
      destinatario: "Escola Municipal de Caicó",
      destinoLat: null,
      destinoLng: null,
    });
    expect(depois.historico.at(-1)?.estagioAnterior).toBe(Estagio.ESTAGIO_2);
  });

  it("perda aceita causa opcional", async () => {
    const lote = await novoLote();
    const depois = await registrarDestino(lote.id, {
      tipo: "PERDA",
      data: "2026-10-02",
      quantidade: 50,
      colaboradorId,
    });
    expect(depois.destino).toMatchObject({ tipo: "PERDA", causa: null });
  });

  it("estado terminal: lote finalizado não recebe outro destino nem transição (409)", async () => {
    const lote = await novoLote();
    await registrarDestino(lote.id, plantio());
    await expect(registrarDestino(lote.id, plantio())).rejects.toMatchObject({ status: 409 });
    await expect(transicionarLote(lote.id, transicao())).rejects.toMatchObject({ status: 409 });
  });

  it("recusa quantidade acima das mudas do lote, com o máximo em detalhes", async () => {
    const lote = await novoLote(20);
    await expect(registrarDestino(lote.id, plantio({ quantidade: 21 }))).rejects.toMatchObject({
      status: 409,
      detalhes: { maximo: 20 },
    });
  });

  it("recusa data anterior ao plantio do lote", async () => {
    const lote = await novoLote();
    await expect(
      registrarDestino(lote.id, plantio({ data: "2026-08-15" })),
    ).rejects.toMatchObject({ status: 422, detalhes: [{ campo: "data" }] });
  });

  it("é atômico: se o destino falha, o lote continua na etapa e sem histórico novo", async () => {
    const lote = await novoLote();
    // Força a falha dentro da transação: o lote já tem uma linha de destino
    // (loteId é único), então o create do destino quebra depois do update.
    await prisma.destinoFinal.create({
      data: { loteId: lote.id, tipo: "PERDA", data: new Date("2026-10-01"), quantidade: 1, colaboradorId },
    });
    await expect(registrarDestino(lote.id, plantio())).rejects.toBeTruthy();

    const depois = await buscarLote(lote.id);
    expect(depois.estagioAtual).toBe(Estagio.ESTAGIO_1);
    expect(depois.historico).toHaveLength(1);
  });
});

describe("quadro e detalhe do lote", () => {
  it("separa os lotes nas três colunas e deixa os excluídos de fora", async () => {
    const naEtapa1 = await novoLote();
    const naEtapa2 = await novoLote();
    await transicionarLote(naEtapa2.id, transicao());
    const finalizado = await novoLote();
    await registrarDestino(finalizado.id, plantio());
    const excluido = await novoLote();
    await prisma.loteMudas.update({ where: { id: excluido.id }, data: { deletedAt: new Date() } });

    const quadro = await obterQuadro();
    const ids = (coluna: { id: string }[]) => coluna.map((lote) => lote.id);

    expect(ids(quadro.etapa1)).toContain(naEtapa1.id);
    expect(ids(quadro.etapa2)).toContain(naEtapa2.id);
    expect(ids(quadro.destinoFinal)).toContain(finalizado.id);
    expect([...ids(quadro.etapa1), ...ids(quadro.etapa2), ...ids(quadro.destinoFinal)]).not.toContain(
      excluido.id,
    );

    const cartao = quadro.destinoFinal.find((lote) => lote.id === finalizado.id);
    expect(cartao?.especie.nomeComum).toBe(NOME_COMUM);
    expect(cartao?.destino?.tipo).toBe("PLANTIO_DEFINITIVO");
  });

  it("GET /lotes/:id devolve 404 para id que não existe", async () => {
    await expect(buscarLote(ID_QUE_NAO_EXISTE)).rejects.toMatchObject({ status: 404 });
  });
});
