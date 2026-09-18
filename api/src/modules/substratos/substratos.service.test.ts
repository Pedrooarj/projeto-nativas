import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../shared/prisma";
import { listarSubstratosAtivos } from "./substratos.service";

// Roda contra o banco de desenvolvimento, como os outros testes: cria os
// próprios registros com uma marca no nome e apaga tudo no fim.
const MARCA = "TESTE-SUBSTRATOS";

async function limpar() {
  await prisma.substrato.deleteMany({ where: { nome: { startsWith: MARCA } } });
}

beforeAll(async () => {
  await limpar();
  await prisma.substrato.createMany({
    data: [
      { nome: `${MARCA} B areia`, ativo: true },
      { nome: `${MARCA} A terra`, ativo: true },
      { nome: `${MARCA} C desativado`, ativo: false },
    ],
  });
});

afterAll(async () => {
  await limpar();
  await prisma.$disconnect();
});

describe("lista de substratos", () => {
  it("devolve só os ativos, em ordem alfabética, com id e nome", async () => {
    const lista = await listarSubstratosAtivos();
    const doTeste = lista.filter((substrato) => substrato.nome.startsWith(MARCA));

    expect(doTeste.map((substrato) => substrato.nome)).toEqual([
      `${MARCA} A terra`,
      `${MARCA} B areia`,
    ]);
    expect(Object.keys(doTeste[0]).sort()).toEqual(["id", "nome"]);
  });
});
