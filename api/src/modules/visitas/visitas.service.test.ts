import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../shared/prisma";
import { limparCacheMetricas, obterMetricas } from "../publico/publico.service";
import { criarVisitaSchema } from "./visitas.schema";
import { criarVisita, listarVisitas } from "./visitas.service";

// Roda contra o banco de desenvolvimento com registros próprios, marcados pelo
// nome da instituição e do colaborador.
const MARCA = "TESTE-VISITAS";

let colaboradorId: string;
let colaboradorInativoId: string;

beforeAll(async () => {
  await limpar();
  colaboradorId = (await prisma.colaborador.create({ data: { nome: MARCA } })).id;
  colaboradorInativoId = (
    await prisma.colaborador.create({ data: { nome: `${MARCA} inativo`, ativo: false } })
  ).id;
});

afterAll(async () => {
  await limpar();
  await prisma.$disconnect();
});

async function limpar() {
  await prisma.visita.deleteMany({ where: { instituicao: { startsWith: MARCA } } });
  await prisma.colaborador.deleteMany({ where: { nome: { startsWith: MARCA } } });
}

describe("registro de visita", () => {
  it("grava a visita com quem registrou e o contador público sobe na hora", async () => {
    limparCacheMetricas();
    const antes = await obterMetricas();

    const visita = await criarVisita(
      criarVisitaSchema.parse({
        data: "2026-11-10",
        instituicao: `${MARCA} Escola Estadual`,
        numeroPessoas: 32,
        observacao: "Turma do 7º ano.",
        colaboradorId,
      }),
    );

    expect(visita).toMatchObject({
      instituicao: `${MARCA} Escola Estadual`,
      numeroPessoas: 32,
      observacao: "Turma do 7º ano.",
      colaborador: { nome: MARCA },
    });

    // Sem limpar o cache aqui: quem limpa é o criarVisita.
    const depois = await obterMetricas();
    expect(depois.visitasRecebidas).toBe(antes.visitasRecebidas + 1);
  });

  it("lista da mais recente para a mais antiga", async () => {
    await criarVisita(
      criarVisitaSchema.parse({
        data: "2026-11-12",
        instituicao: `${MARCA} Mais recente`,
        numeroPessoas: 5,
        colaboradorId,
      }),
    );

    const doTeste = (await listarVisitas()).filter((v) => v.instituicao.startsWith(MARCA));
    expect(doTeste.map((v) => v.instituicao)).toEqual([
      `${MARCA} Mais recente`,
      `${MARCA} Escola Estadual`,
    ]);
  });

  it("RN-06: recusa colaborador inativo com 422 apontando o campo", async () => {
    await expect(
      criarVisita(
        criarVisitaSchema.parse({
          instituicao: `${MARCA} Recusada`,
          numeroPessoas: 3,
          colaboradorId: colaboradorInativoId,
        }),
      ),
    ).rejects.toMatchObject({ status: 422, detalhes: [{ campo: "colaboradorId" }] });
  });
});
