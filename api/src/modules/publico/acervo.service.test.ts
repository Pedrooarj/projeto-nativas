import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  Estagio,
  MetodoQuebra,
  SetorViveiro,
  TipoDestino,
  TipoRecipiente,
} from "@prisma/client";
import { ErroApi } from "../../shared/erros";
import { prisma } from "../../shared/prisma";
import { buscarEspeciePublica, listarEspeciesPublicas } from "./acervo.service";

// Roda contra o banco de desenvolvimento e cria o próprio conjunto de
// registros, marcados pelo nome, apagados no fim.
const MARCA = "TESTE-ACERVO";

let colaboradorId: string;
let substratoId: string;
let especieId: string;
let especieSemRegistroId: string;
let especieExcluidaId: string;

beforeAll(async () => {
  await limpar();

  const colaborador = await prisma.colaborador.create({ data: { nome: MARCA, ativo: false } });
  colaboradorId = colaborador.id;

  const substrato = await prisma.substrato.create({ data: { nome: MARCA, ativo: false } });
  substratoId = substrato.id;

  const especie = await prisma.especie.create({
    data: {
      nomeComum: `${MARCA} com registros`,
      nomeCientifico: `${MARCA} um`,
      familia: MARCA,
      descricao: "Texto de teste.",
      usos: ["sombra"],
      fotoPrincipalUrl: "/fotos/teste.jpg",
    },
  });
  especieId = especie.id;

  const semRegistro = await prisma.especie.create({
    data: { nomeComum: `${MARCA} sem registros`, nomeCientifico: `${MARCA} dois`, familia: MARCA },
  });
  especieSemRegistroId = semRegistro.id;

  const excluida = await prisma.especie.create({
    data: {
      nomeComum: `${MARCA} excluída`,
      nomeCientifico: `${MARCA} tres`,
      familia: MARCA,
      deletedAt: new Date(),
    },
  });
  especieExcluidaId = excluida.id;

  // Duas coletas valem (300 + 200 sementes); a terceira foi excluída.
  const coleta = await criarColeta(300);
  await criarColeta(200);
  await criarColeta(999, new Date());

  // Lote 1: 100 sementes, 40 vivas, escarificação, levado a plantio definitivo.
  const plantado = await criarLote(coleta.id, "1", {
    qtdSementes: 100,
    qtdMudasVivas: 40,
    tratamentoSemente: MetodoQuebra.ESCARIFICACAO,
    estagioAtual: Estagio.FINALIZADO,
  });
  await prisma.destinoFinal.create({
    data: {
      loteId: plantado.id,
      tipo: TipoDestino.PLANTIO_DEFINITIVO,
      data: new Date("2026-08-01"),
      quantidade: 40,
      destinoLat: -6.46,
      destinoLng: -37.1,
      localDescricao: "Praça de teste",
      colaboradorId,
    },
  });

  // Lote 2: 50 sementes, 10 vivas, escarificação, doado (não conta como plantio).
  const doado = await criarLote(coleta.id, "2", {
    qtdSementes: 50,
    qtdMudasVivas: 10,
    tratamentoSemente: MetodoQuebra.ESCARIFICACAO,
    estagioAtual: Estagio.FINALIZADO,
  });
  await prisma.destinoFinal.create({
    data: {
      loteId: doado.id,
      tipo: TipoDestino.DOACAO,
      data: new Date("2026-08-02"),
      quantidade: 10,
      destinatario: "Escola de teste",
      colaboradorId,
    },
  });

  // Lote 3: 80 sementes, ainda sem contagem de mudas vivas, embebição.
  await criarLote(coleta.id, "3", {
    qtdSementes: 80,
    qtdMudasVivas: null,
    tratamentoSemente: MetodoQuebra.EMBEBICAO,
  });

  // Lote 4: excluído, fica fora de tudo.
  await criarLote(coleta.id, "4", {
    qtdSementes: 500,
    qtdMudasVivas: 500,
    tratamentoSemente: MetodoQuebra.N,
    deletedAt: new Date(),
  });
});

afterAll(async () => {
  await limpar();
  await prisma.$disconnect();
});

function criarColeta(qtdSementes: number, deletedAt: Date | null = null) {
  return prisma.coleta.create({
    data: {
      especieId,
      colaboradorId,
      matrizLat: -6.45,
      matrizLng: -37.09,
      qtdSementes,
      dataColeta: new Date("2026-05-02"),
      deletedAt,
    },
  });
}

function criarLote(
  coletaId: string,
  sufixo: string,
  dados: {
    qtdSementes: number;
    qtdMudasVivas: number | null;
    tratamentoSemente: MetodoQuebra;
    estagioAtual?: Estagio;
    deletedAt?: Date;
  },
) {
  return prisma.loteMudas.create({
    data: {
      tagUnica: `${MARCA}-${sufixo}`,
      especieId,
      coletaId,
      colaboradorId,
      substratoId,
      dataPlantio: new Date("2026-05-03"),
      tipoRecipiente: TipoRecipiente.TUBETE,
      setor: SetorViveiro.SEMENTEIRAS,
      ...dados,
    },
  });
}

async function limpar() {
  const daMarca = { especie: { familia: MARCA } };
  await prisma.destinoFinal.deleteMany({ where: { lote: daMarca } });
  await prisma.loteMudas.deleteMany({ where: daMarca });
  await prisma.coleta.deleteMany({ where: daMarca });
  await prisma.especie.deleteMany({ where: { familia: MARCA } });
  await prisma.substrato.deleteMany({ where: { nome: MARCA } });
  await prisma.colaborador.deleteMany({ where: { nome: MARCA } });
}

describe("lista pública de espécies", () => {
  it("devolve só os campos do cartão do acervo, sem espécie excluída", async () => {
    const lista = await listarEspeciesPublicas();
    const daMarca = lista.filter((especie) => especie.familia === MARCA);

    expect(daMarca.map((especie) => especie.id)).toEqual([especieId, especieSemRegistroId]);
    expect(daMarca.map((especie) => especie.id)).not.toContain(especieExcluidaId);
    expect(daMarca[0]).toEqual({
      id: especieId,
      nomeComum: `${MARCA} com registros`,
      nomeCientifico: `${MARCA} um`,
      familia: MARCA,
      fotoPrincipalUrl: "/fotos/teste.jpg",
    });
  });

  it("vem em ordem alfabética de nome comum", async () => {
    const nomes = (await listarEspeciesPublicas()).map((especie) => especie.nomeComum);
    const ordenados = [...nomes].sort((a, b) => a.localeCompare(b, "pt-BR"));
    expect(nomes).toEqual(ordenados);
  });
});

describe("página pública da espécie (RN-08)", () => {
  it("devolve o conteúdo botânico da coordenação", async () => {
    const especie = await buscarEspeciePublica(especieId);

    expect(especie.nomeComum).toBe(`${MARCA} com registros`);
    expect(especie.descricao).toBe("Texto de teste.");
    expect(especie.usos).toEqual(["sombra"]);
    expect(especie.fotoPrincipalUrl).toBe("/fotos/teste.jpg");
  });

  it("conta coletas e sementes sem as coletas excluídas", async () => {
    const { numeros } = await buscarEspeciePublica(especieId);

    expect(numeros.coletas).toBe(2);
    expect(numeros.sementesColetadas).toBe(500);
  });

  it("soma as sementes dos lotes como mudas produzidas, sem lote excluído", async () => {
    const { numeros } = await buscarEspeciePublica(especieId);
    expect(numeros.mudasProduzidas).toBe(230);
  });

  it("conta só plantio definitivo, não doação", async () => {
    const { numeros } = await buscarEspeciePublica(especieId);
    expect(numeros.plantiosDefinitivos).toBe(1);
  });

  it("calcula a germinação só com os lotes que têm contagem", async () => {
    const { numeros } = await buscarEspeciePublica(especieId);

    // (40 + 10) vivas sobre (100 + 50) sementes; o lote sem contagem fica de fora.
    expect(numeros.germinacao.lotesConsiderados).toBe(2);
    expect(numeros.germinacao.taxa).toBeCloseTo(50 / 150, 4);
  });

  it("lista os tratamentos aplicados com a contagem de lotes", async () => {
    const { numeros } = await buscarEspeciePublica(especieId);

    expect(numeros.tratamentos).toEqual([
      { tratamento: MetodoQuebra.ESCARIFICACAO, lotes: 2 },
      { tratamento: MetodoQuebra.EMBEBICAO, lotes: 1 },
    ]);
  });

  it("espécie sem registro devolve zeros e taxa nula, não erro", async () => {
    const { numeros } = await buscarEspeciePublica(especieSemRegistroId);

    expect(numeros).toEqual({
      coletas: 0,
      sementesColetadas: 0,
      mudasProduzidas: 0,
      plantiosDefinitivos: 0,
      germinacao: { taxa: null, lotesConsiderados: 0 },
      tratamentos: [],
    });
  });

  it("não expõe colaborador", async () => {
    const texto = JSON.stringify(await buscarEspeciePublica(especieId));
    expect(texto).not.toContain("colaborador");
    expect(texto).not.toContain(colaboradorId);
  });

  it("devolve 404 para espécie excluída ou inexistente", async () => {
    await expect(buscarEspeciePublica(especieExcluidaId)).rejects.toMatchObject({ status: 404 });
    await expect(buscarEspeciePublica("nao-existe")).rejects.toBeInstanceOf(ErroApi);
  });
});
