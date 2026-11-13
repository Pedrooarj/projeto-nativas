import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  Estagio,
  MetodoQuebra,
  SetorViveiro,
  TipoDestino,
  TipoRecipiente,
} from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { obterMapa } from "./mapa.service";

// Roda contra o banco de desenvolvimento e cria o próprio conjunto de
// registros, marcados pelo nome, apagados no fim.
const MARCA = "TESTE-MAPA";

let colaboradorId: string;
let substratoId: string;
let especieId: string;
let coletaId: string;
let coletaExcluidaId: string;
let plantioId: string;

beforeAll(async () => {
  await limpar();

  const colaborador = await prisma.colaborador.create({ data: { nome: MARCA, ativo: false } });
  colaboradorId = colaborador.id;

  const substrato = await prisma.substrato.create({ data: { nome: MARCA, ativo: false } });
  substratoId = substrato.id;

  const especie = await prisma.especie.create({
    data: { nomeComum: MARCA, nomeCientifico: MARCA, familia: MARCA },
  });
  especieId = especie.id;

  const coleta = await prisma.coleta.create({
    data: {
      especieId,
      colaboradorId,
      matrizLat: -6.4512,
      matrizLng: -37.0918,
      qtdSementes: 300,
      dataColeta: new Date("2026-05-02"),
      localDescricao: "Matriz de teste",
      fotoUrl: "/fotos/matriz.jpg",
    },
  });
  coletaId = coleta.id;

  const excluida = await prisma.coleta.create({
    data: {
      especieId,
      colaboradorId,
      matrizLat: -6.5,
      matrizLng: -37.2,
      qtdSementes: 10,
      dataColeta: new Date("2026-05-02"),
      deletedAt: new Date(),
    },
  });
  coletaExcluidaId = excluida.id;

  const plantado = await criarLote("1");
  const plantio = await prisma.destinoFinal.create({
    data: {
      loteId: plantado.id,
      tipo: TipoDestino.PLANTIO_DEFINITIVO,
      data: new Date("2026-08-01"),
      quantidade: 30,
      destinoLat: -6.4601,
      destinoLng: -37.1002,
      localDescricao: "Praça de teste",
      colaboradorId,
    },
  });
  plantioId = plantio.id;

  const doado = await criarLote("2");
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

  const perdido = await criarLote("3");
  await prisma.destinoFinal.create({
    data: {
      loteId: perdido.id,
      tipo: TipoDestino.PERDA,
      data: new Date("2026-08-03"),
      quantidade: 5,
      colaboradorId,
    },
  });

  const plantadoExcluido = await criarLote("4", new Date());
  await prisma.destinoFinal.create({
    data: {
      loteId: plantadoExcluido.id,
      tipo: TipoDestino.PLANTIO_DEFINITIVO,
      data: new Date("2026-08-04"),
      quantidade: 8,
      destinoLat: -6.47,
      destinoLng: -37.11,
      localDescricao: "Plantio de lote excluído",
      colaboradorId,
    },
  });
});

afterAll(async () => {
  await limpar();
  await prisma.$disconnect();
});

function criarLote(sufixo: string, deletedAt: Date | null = null) {
  return prisma.loteMudas.create({
    data: {
      tagUnica: `${MARCA}-${sufixo}`,
      especieId,
      coletaId,
      colaboradorId,
      substratoId,
      dataPlantio: new Date("2026-05-03"),
      qtdSementes: 50,
      tipoRecipiente: TipoRecipiente.TUBETE,
      tratamentoSemente: MetodoQuebra.N,
      setor: SetorViveiro.SEMENTEIRAS,
      estagioAtual: Estagio.FINALIZADO,
      fotoUrl: "/fotos/lote.jpg",
      deletedAt,
    },
  });
}

async function limpar() {
  const daMarca = { especie: { nomeComum: MARCA } };
  await prisma.destinoFinal.deleteMany({ where: { lote: daMarca } });
  await prisma.loteMudas.deleteMany({ where: daMarca });
  await prisma.coleta.deleteMany({ where: daMarca });
  await prisma.especie.deleteMany({ where: { nomeComum: MARCA } });
  await prisma.substrato.deleteMany({ where: { nome: MARCA } });
  await prisma.colaborador.deleteMany({ where: { nome: MARCA } });
}

describe("mapa público", () => {
  it("devolve a matriz de cada coleta com coordenada, espécie e data", async () => {
    const { matrizes } = await obterMapa();
    const daMarca = matrizes.filter((matriz) => matriz.especie.id === especieId);

    expect(daMarca).toEqual([
      {
        id: coletaId,
        lat: -6.4512,
        lng: -37.0918,
        data: "2026-05-02",
        localDescricao: "Matriz de teste",
        fotoUrl: "/fotos/matriz.jpg",
        especie: { id: especieId, nomeComum: MARCA, nomeCientifico: MARCA },
      },
    ]);
    expect(matrizes.map((matriz) => matriz.id)).not.toContain(coletaExcluidaId);
  });

  it("entre os destinos, só o plantio definitivo vira ponto (RN-04)", async () => {
    const { plantios } = await obterMapa();
    const daMarca = plantios.filter((plantio) => plantio.especie.id === especieId);

    expect(daMarca).toEqual([
      {
        id: plantioId,
        lat: -6.4601,
        lng: -37.1002,
        data: "2026-08-01",
        localDescricao: "Praça de teste",
        etiqueta: `${MARCA}-1`,
        quantidade: 30,
        fotoUrl: "/fotos/lote.jpg",
        especie: { id: especieId, nomeComum: MARCA, nomeCientifico: MARCA },
      },
    ]);
  });

  it("não expõe colaborador", async () => {
    const texto = JSON.stringify(await obterMapa());
    expect(texto).not.toContain("colaborador");
    expect(texto).not.toContain(colaboradorId);
  });
});
