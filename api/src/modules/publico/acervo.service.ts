import { MetodoQuebra, TipoDestino } from "@prisma/client";
import { naoEncontrado } from "../../shared/erros";
import { prisma } from "../../shared/prisma";

export type EspecieDoAcervo = {
  id: string;
  nomeComum: string;
  nomeCientifico: string;
  familia: string;
  fotoPrincipalUrl: string | null;
};

export type NumerosDaEspecie = {
  coletas: number;
  sementesColetadas: number;
  mudasProduzidas: number;
  plantiosDefinitivos: number;
  /** `taxa` vai de 0 a 1 e é null enquanto nenhum lote tiver contagem de mudas vivas. */
  germinacao: { taxa: number | null; lotesConsiderados: number };
  tratamentos: { tratamento: MetodoQuebra; lotes: number }[];
};

/** Lista do acervo: só o que o cartão mostra. O resto vem na página da espécie. */
export async function listarEspeciesPublicas(): Promise<EspecieDoAcervo[]> {
  const especies = await prisma.especie.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      nomeComum: true,
      nomeCientifico: true,
      familia: true,
      fotoPrincipalUrl: true,
    },
  });

  // Ordenado aqui e não no banco: a ordem do Postgres depende da collation da
  // instalação e pode separar "Ipê" de "Imburana".
  return especies.sort((a, b) => a.nomeComum.localeCompare(b.nomeComum, "pt-BR"));
}

/**
 * RN-08 — conteúdo botânico da coordenação mais os números que o projeto já fez
 * com a espécie. Nenhum número é digitado: tudo sai das coletas e dos lotes.
 */
export async function buscarEspeciePublica(id: string) {
  const especie = await prisma.especie.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      nomeComum: true,
      nomeCientifico: true,
      familia: true,
      descricao: true,
      porte: true,
      epocaFloracao: true,
      epocaFrutificacao: true,
      usos: true,
      fotoPrincipalUrl: true,
      galeria: true,
    },
  });
  if (!especie) throw naoEncontrado("Espécie não encontrada.");

  return { ...especie, numeros: await calcularNumeros(id) };
}

async function calcularNumeros(especieId: string): Promise<NumerosDaEspecie> {
  const lotesDaEspecie = { especieId, deletedAt: null };

  const [coletas, lotes, comContagem, plantios, porTratamento] = await Promise.all([
    prisma.coleta.aggregate({
      _count: true,
      _sum: { qtdSementes: true },
      where: { especieId, deletedAt: null },
    }),
    prisma.loteMudas.aggregate({
      _sum: { qtdSementes: true },
      where: lotesDaEspecie,
    }),
    prisma.loteMudas.aggregate({
      _count: true,
      _sum: { qtdSementes: true, qtdMudasVivas: true },
      where: { ...lotesDaEspecie, qtdMudasVivas: { not: null } },
    }),
    prisma.destinoFinal.count({
      where: { tipo: TipoDestino.PLANTIO_DEFINITIVO, lote: lotesDaEspecie },
    }),
    prisma.loteMudas.groupBy({
      by: ["tratamentoSemente"],
      _count: true,
      where: lotesDaEspecie,
    }),
  ]);

  const sementesComContagem = comContagem._sum.qtdSementes ?? 0;
  const mudasVivas = comContagem._sum.qtdMudasVivas ?? 0;

  return {
    coletas: coletas._count,
    sementesColetadas: coletas._sum.qtdSementes ?? 0,
    mudasProduzidas: lotes._sum.qtdSementes ?? 0,
    plantiosDefinitivos: plantios,
    germinacao: {
      taxa: sementesComContagem > 0 ? mudasVivas / sementesComContagem : null,
      lotesConsiderados: comContagem._count,
    },
    tratamentos: porTratamento
      .map((grupo) => ({ tratamento: grupo.tratamentoSemente, lotes: grupo._count }))
      .sort((a, b) => b.lotes - a.lotes || a.tratamento.localeCompare(b.tratamento)),
  };
}
