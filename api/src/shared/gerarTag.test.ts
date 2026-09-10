import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { formatarEtiqueta, gerarTag, prefixoDaEtiqueta } from "./gerarTag";
import { prisma } from "./prisma";

// Prefixos que o seed não usa, para o teste não mexer no contador de ninguém.
const PREFIXOS_DO_TESTE = ["Q", "X"];

async function zerarContadores() {
  await prisma.contadorTag.deleteMany({ where: { prefixo: { in: PREFIXOS_DO_TESTE } } });
}

beforeAll(zerarContadores);

afterAll(async () => {
  await zerarContadores();
  await prisma.$disconnect();
});

describe("prefixo da etiqueta", () => {
  it("usa a primeira letra do nome comum, maiúscula e sem acento", () => {
    expect(prefixoDaEtiqueta("Angico")).toBe("A");
    expect(prefixoDaEtiqueta("Ipê-roxo")).toBe("I");
    expect(prefixoDaEtiqueta("Ipê-roxo")).toBe("I");
    expect(prefixoDaEtiqueta("umbuzeiro")).toBe("U");
  });

  it("formata o sequencial com três dígitos", () => {
    expect(formatarEtiqueta("A", 1)).toBe("A-001");
    expect(formatarEtiqueta("M", 45)).toBe("M-045");
    expect(formatarEtiqueta("A", 102)).toBe("A-102");
  });
});

describe("geração de etiqueta", () => {
  it("começa em 1 e avança a cada chamada", async () => {
    expect(await gerarTag("Quixaba")).toBe("Q-001");
    expect(await gerarTag("Quixaba")).toBe("Q-002");
  });

  it("não repete etiqueta em chamadas concorrentes com o mesmo prefixo", async () => {
    const QUANTAS = 10;

    const etiquetas = await Promise.all(
      Array.from({ length: QUANTAS }, () => gerarTag("Xiquexique")),
    );

    expect(new Set(etiquetas).size).toBe(QUANTAS);

    // Além de não repetir, a sequência não pode ter buraco: 001 até 010.
    const sequenciais = etiquetas.map((etiqueta) => Number(etiqueta.split("-")[1])).sort((a, b) => a - b);
    expect(sequenciais).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("compartilha o contador entre espécies com a mesma inicial", async () => {
    // O prefixo é ajuda de leitura, não chave: Quixaba e Quipa dividem o Q.
    const primeira = await gerarTag("Quixaba");
    const segunda = await gerarTag("Quipa");

    expect(Number(segunda.split("-")[1])).toBe(Number(primeira.split("-")[1]) + 1);
  });
});
