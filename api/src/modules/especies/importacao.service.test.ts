import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../shared/prisma";
import { importarAcervo } from "./importacao.service";

// Roda contra o banco de desenvolvimento. As espécies do teste têm nome
// científico começando com a marca, para a limpeza não tocar em mais nada.
const MARCA = "Testeimport";
const CABECALHO =
  "nome_comum;nome_cientifico;familia;descricao;porte;epoca_floracao;epoca_frutificacao;usos;foto_principal_url;galeria";

beforeAll(limpar);
afterAll(async () => {
  await limpar();
  await prisma.$disconnect();
});

async function limpar() {
  await prisma.especie.deleteMany({ where: { nomeCientifico: { startsWith: MARCA } } });
}

function planilha(...linhas: string[]) {
  return [CABECALHO, ...linhas].join("\r\n");
}

describe("importação do acervo por planilha", () => {
  it("cria espécies novas com listas separadas por barra vertical", async () => {
    const relatorio = await importarAcervo(
      planilha(
        `Espécie A;${MARCA} alfa;Fabaceae;Texto da coordenação;Arbóreo;;;medicinal | ornamental;;`,
        `Espécie B;${MARCA} beta;Cactaceae;;;;;;;`,
      ),
    );

    expect(relatorio).toEqual({
      simulacao: false,
      linhasLidas: 2,
      criadas: [`${MARCA} alfa`, `${MARCA} beta`],
      atualizadas: [],
    });
    const alfa = await prisma.especie.findUniqueOrThrow({ where: { nomeCientifico: `${MARCA} alfa` } });
    expect(alfa).toMatchObject({
      nomeComum: "Espécie A",
      familia: "Fabaceae",
      porte: "Arbóreo",
      usos: ["medicinal", "ornamental"],
    });
  });

  it("roda de novo: atualiza pelo nome científico e célula vazia não apaga o que já existe", async () => {
    const relatorio = await importarAcervo(
      planilha(`Espécie A;${MARCA} alfa;Fabaceae;;;Março a maio;;;;`),
    );
    expect(relatorio.atualizadas).toEqual([`${MARCA} alfa`]);
    expect(relatorio.criadas).toEqual([]);

    const alfa = await prisma.especie.findUniqueOrThrow({ where: { nomeCientifico: `${MARCA} alfa` } });
    expect(alfa).toMatchObject({
      descricao: "Texto da coordenação",
      porte: "Arbóreo",
      epocaFloracao: "Março a maio",
      usos: ["medicinal", "ornamental"],
    });
  });

  it("simulação mostra o que faria e não grava nada", async () => {
    const relatorio = await importarAcervo(planilha(`Espécie C;${MARCA} gama;Malvaceae;;;;;;;`), {
      simular: true,
    });
    expect(relatorio).toMatchObject({ simulacao: true, criadas: [`${MARCA} gama`] });
    expect(await prisma.especie.count({ where: { nomeCientifico: `${MARCA} gama` } })).toBe(0);
  });

  it("tudo ou nada: com uma linha errada, nenhuma é gravada e o 422 diz linha e campo", async () => {
    const tentativa = importarAcervo(
      planilha(
        `Espécie D;${MARCA} delta;Fabaceae;;;;;;;`,
        `;${MARCA} epsilon;Fabaceae;;;;;;nao-e-url;`,
        `Espécie D2;${MARCA} delta;Fabaceae;;;;;;;`,
      ),
    );

    await expect(tentativa).rejects.toMatchObject({
      status: 422,
      detalhes: [
        { linha: 3, campo: "nomeComum", mensagem: "Campo obrigatório." },
        { linha: 3, campo: "fotoPrincipalUrl", mensagem: "Informe uma URL válida." },
        { linha: 4, campo: "nomeCientifico" },
      ],
    });
    expect(await prisma.especie.count({ where: { nomeCientifico: `${MARCA} delta` } })).toBe(0);
  });

  it("recusa cabeçalho fora do modelo antes de ler as linhas", async () => {
    await expect(
      importarAcervo("nome_comum;nome_cientifico;cor_da_flor\nA;B;C"),
    ).rejects.toMatchObject({
      status: 422,
      detalhes: [
        { linha: 1, campo: "cor_da_flor", mensagem: "Coluna desconhecida." },
        { linha: 1, campo: "familia", mensagem: "Coluna obrigatória ausente." },
      ],
    });
  });

  it("aceita cabeçalho com acento e maiúscula, como a coordenação costuma escrever", async () => {
    const relatorio = await importarAcervo(
      `Nome comum;Nome científico;Família\nEspécie E;${MARCA} eta;Anacardiaceae`,
    );
    expect(relatorio.criadas).toEqual([`${MARCA} eta`]);
  });

  it("recusa planilha vazia e espécie excluída do acervo", async () => {
    await expect(importarAcervo(CABECALHO)).rejects.toMatchObject({ status: 422 });

    await prisma.especie.update({
      where: { nomeCientifico: `${MARCA} beta` },
      data: { deletedAt: new Date() },
    });
    await expect(
      importarAcervo(planilha(`Espécie B;${MARCA} beta;Cactaceae;;;;;;;`)),
    ).rejects.toMatchObject({ status: 422, detalhes: [{ linha: 2, campo: "nomeCientifico" }] });
  });
});
