import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Estagio, MetodoQuebra, SetorViveiro, TipoRecipiente } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { limparCacheMetricas, obterMetricas } from "../publico/publico.service";
import type { DadosNovaColeta } from "./coletas.schema";
import { criarColeta, listarColetas } from "./coletas.service";

// Roda contra o banco de desenvolvimento e cria o próprio conjunto de
// registros, marcados pelo nome, apagados no fim.
const MARCA = "TESTE-COLETAS";

let especieId: string;
let colaboradorId: string;
let colaboradorInativoId: string;
let substratoId: string;

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
    data: { nomeComum: MARCA, nomeCientifico: MARCA, familia: MARCA },
  });
  especieId = especie.id;
});

afterAll(async () => {
  await limpar();
  limparCacheMetricas();
  await prisma.$disconnect();
});

async function limpar() {
  await prisma.historicoCrescimento.deleteMany({
    where: { lote: { especie: { nomeComum: MARCA } } },
  });
  await prisma.loteMudas.deleteMany({ where: { especie: { nomeComum: MARCA } } });
  await prisma.coleta.deleteMany({ where: { especie: { nomeComum: MARCA } } });
  await prisma.especie.deleteMany({ where: { nomeComum: MARCA } });
  await prisma.substrato.deleteMany({ where: { nome: MARCA } });
  await prisma.colaborador.deleteMany({ where: { nome: { startsWith: MARCA } } });
}

function dadosDaColeta(sobrescrever: Partial<DadosNovaColeta> = {}): DadosNovaColeta {
  return {
    especieId,
    qtdSementes: 300,
    dataColeta: "2026-09-01",
    matrizLat: -6.4512,
    matrizLng: -37.0918,
    localDescricao: "Trilha do Seridó, atrás do CERES",
    colaboradorId,
    ...sobrescrever,
  };
}

describe("registro de coleta", () => {
  it("cria com saldo igual às sementes, dados da espécie e de quem registrou, e coordenada em número", async () => {
    const coleta = await criarColeta(dadosDaColeta());

    expect(coleta.qtdSementes).toBe(300);
    expect(coleta.sementesUsadas).toBe(0);
    expect(coleta.saldo).toBe(300);
    expect(coleta.especie.nomeComum).toBe(MARCA);
    expect(coleta.colaborador.nome).toBe(MARCA);
    // Decimal do banco vira número na resposta: é o que o Leaflet e o formulário esperam.
    expect(coleta.matrizLat).toBe(-6.4512);
    expect(coleta.matrizLng).toBe(-37.0918);
  });

  it("RN-07: o contador público de sementes sobe na hora, sem esperar o cache", async () => {
    limparCacheMetricas();
    const antes = await obterMetricas();

    await criarColeta(dadosDaColeta({ qtdSementes: 120, dataColeta: "2026-09-05" }));

    const depois = await obterMetricas();
    expect(depois.sementesColetadas).toBe(antes.sementesColetadas + 120);
  });

  it("RN-05: lista com o saldo descontando os lotes vivos, mais recentes primeiro, e filtra por espécie", async () => {
    const [maisAntiga] = await prisma.coleta.findMany({
      where: { especieId },
      orderBy: { dataColeta: "asc" },
    });

    // Um lote de 30 conta no saldo; um lote excluído (soft delete) de 50 não conta.
    for (const [sufixo, sementes, deletedAt] of [
      ["1", 30, null],
      ["2", 50, new Date()],
    ] as const) {
      await prisma.loteMudas.create({
        data: {
          tagUnica: `${MARCA}-${sufixo}`,
          especieId,
          coletaId: maisAntiga.id,
          colaboradorId,
          substratoId,
          dataPlantio: new Date("2026-09-10"),
          qtdSementes: sementes,
          tipoRecipiente: TipoRecipiente.TUBETE,
          tratamentoSemente: MetodoQuebra.N,
          setor: SetorViveiro.SEMENTEIRAS,
          estagioAtual: Estagio.ESTAGIO_1,
          deletedAt,
        },
      });
    }

    const daEspecie = await listarColetas(especieId);
    expect(daEspecie.map((coleta) => coleta.dataColeta.toISOString().slice(0, 10))).toEqual([
      "2026-09-05",
      "2026-09-01",
    ]);
    expect(daEspecie[1]).toMatchObject({ qtdSementes: 300, sementesUsadas: 30, saldo: 270 });
    expect(daEspecie[0]).toMatchObject({ qtdSementes: 120, sementesUsadas: 0, saldo: 120 });
    expect("lotes" in daEspecie[0]).toBe(false);

    const todas = await listarColetas();
    expect(todas.filter((coleta) => coleta.especieId === especieId)).toHaveLength(2);

    expect(await listarColetas("00000000-0000-4000-8000-000000000000")).toEqual([]);
  });

  it("recusa com 422, apontando o campo, espécie que não existe e colaborador inativo", async () => {
    const idQueNaoExiste = "00000000-0000-4000-8000-000000000000";

    await expect(criarColeta(dadosDaColeta({ especieId: idQueNaoExiste }))).rejects.toMatchObject({
      status: 422,
      detalhes: [{ campo: "especieId" }],
    });
    await expect(
      criarColeta(dadosDaColeta({ colaboradorId: colaboradorInativoId })),
    ).rejects.toMatchObject({ status: 422, detalhes: [{ campo: "colaboradorId" }] });
  });
});
