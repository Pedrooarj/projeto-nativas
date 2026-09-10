import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Estagio, MetodoQuebra, SetorViveiro, TipoRecipiente } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { limparCacheMetricas, obterMetricas } from "./publico.service";

// O teste roda contra o banco de desenvolvimento: cria um conjunto próprio de
// registros e confere que os contadores subiram exatamente o esperado, em vez
// de comparar com números fixos do seed.
const MARCA = "TESTE-METRICAS";

const SEMENTES_DA_COLETA = 137;
const MUDAS_VIVAS_DO_LOTE = 41;

let colaboradorId: string;
let especieId: string;
let substratoId: string;
let coletaId: string;
let loteId: string;
let visitaId: string;

beforeAll(async () => {
  await limpar();

  const colaborador = await prisma.colaborador.create({ data: { nome: MARCA, ativo: false } });
  colaboradorId = colaborador.id;

  const especie = await prisma.especie.create({
    data: { nomeComum: MARCA, nomeCientifico: MARCA, familia: MARCA },
  });
  especieId = especie.id;

  const substrato = await prisma.substrato.create({ data: { nome: MARCA, ativo: false } });
  substratoId = substrato.id;
});

afterAll(async () => {
  await limpar();
  limparCacheMetricas();
  await prisma.$disconnect();
});

async function limpar() {
  await prisma.loteMudas.deleteMany({ where: { especie: { nomeComum: MARCA } } });
  await prisma.coleta.deleteMany({ where: { especie: { nomeComum: MARCA } } });
  await prisma.visita.deleteMany({ where: { instituicao: MARCA } });
  await prisma.especie.deleteMany({ where: { nomeComum: MARCA } });
  await prisma.substrato.deleteMany({ where: { nome: MARCA } });
  await prisma.colaborador.deleteMany({ where: { nome: MARCA } });
}

describe("contadores públicos", () => {
  it("soma sementes, mudas em viveiro e visitas dos registros novos", async () => {
    limparCacheMetricas();
    const antes = await obterMetricas();

    const coleta = await prisma.coleta.create({
      data: {
        especieId,
        colaboradorId,
        matrizLat: -6.45,
        matrizLng: -37.09,
        qtdSementes: SEMENTES_DA_COLETA,
        dataColeta: new Date("2026-05-02"),
      },
    });
    coletaId = coleta.id;

    const lote = await prisma.loteMudas.create({
      data: {
        tagUnica: MARCA + "-1",
        especieId,
        coletaId,
        colaboradorId,
        substratoId,
        dataPlantio: new Date("2026-05-03"),
        qtdSementes: 100,
        qtdMudasVivas: MUDAS_VIVAS_DO_LOTE,
        tipoRecipiente: TipoRecipiente.TUBETE,
        tratamentoSemente: MetodoQuebra.N,
        setor: SetorViveiro.SEMENTEIRAS,
        estagioAtual: Estagio.ESTAGIO_1,
      },
    });
    loteId = lote.id;

    const visita = await prisma.visita.create({
      data: {
        data: new Date("2026-05-04"),
        instituicao: MARCA,
        numeroPessoas: 12,
        colaboradorId,
      },
    });
    visitaId = visita.id;

    limparCacheMetricas();
    const depois = await obterMetricas();

    expect(depois.sementesColetadas).toBe(antes.sementesColetadas + SEMENTES_DA_COLETA);
    expect(depois.mudasNoViveiro).toBe(antes.mudasNoViveiro + MUDAS_VIVAS_DO_LOTE);
    expect(depois.visitasRecebidas).toBe(antes.visitasRecebidas + 1);
    // Nenhum destino final foi criado: só plantio definitivo mexe neste número.
    expect(depois.plantiosDefinitivos).toBe(antes.plantiosDefinitivos);
  });

  it("não conta lote finalizado como muda no viveiro", async () => {
    limparCacheMetricas();
    const antes = await obterMetricas();

    await prisma.loteMudas.update({
      where: { id: loteId },
      data: { estagioAtual: Estagio.FINALIZADO },
    });

    limparCacheMetricas();
    const depois = await obterMetricas();

    expect(depois.mudasNoViveiro).toBe(antes.mudasNoViveiro - MUDAS_VIVAS_DO_LOTE);
  });

  it("segura o valor em cache até alguém limpar", async () => {
    limparCacheMetricas();
    const primeira = await obterMetricas();

    await prisma.visita.update({
      where: { id: visitaId },
      data: { numeroPessoas: 13 },
    });
    await prisma.visita.create({
      data: {
        data: new Date("2026-05-05"),
        instituicao: MARCA,
        numeroPessoas: 4,
        colaboradorId,
      },
    });

    const doCache = await obterMetricas();
    expect(doCache.visitasRecebidas).toBe(primeira.visitasRecebidas);

    limparCacheMetricas();
    const atualizada = await obterMetricas();
    expect(atualizada.visitasRecebidas).toBe(primeira.visitasRecebidas + 1);
  });
});
