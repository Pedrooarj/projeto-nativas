import { Prisma } from "@prisma/client";
import { campoInvalido } from "../../shared/erros";
import { prisma } from "../../shared/prisma";
import { limparCacheMetricas } from "../publico/publico.service";
import type { DadosNovaColeta } from "./coletas.schema";

// O que toda resposta de coleta carrega: os nomes que a tela mostra e os
// lotes vivos, que viram o saldo (RN-05).
const inclusao = {
  especie: { select: { nomeComum: true, nomeCientifico: true } },
  colaborador: { select: { nome: true } },
  lotes: { where: { deletedAt: null }, select: { qtdSementes: true } },
} satisfies Prisma.ColetaInclude;

type ColetaComLotes = Prisma.ColetaGetPayload<{ include: typeof inclusao }>;

/**
 * Decimal do banco vira número (o Leaflet e o formulário esperam número) e a
 * lista de lotes vira dois campos: sementesUsadas e saldo.
 */
function formatarColeta(coleta: ColetaComLotes) {
  const { lotes, ...resto } = coleta;
  const sementesUsadas = lotes.reduce((soma, lote) => soma + lote.qtdSementes, 0);

  return {
    ...resto,
    matrizLat: coleta.matrizLat.toNumber(),
    matrizLng: coleta.matrizLng.toNumber(),
    sementesUsadas,
    saldo: coleta.qtdSementes - sementesUsadas,
  };
}

/** Banco de sementes: mais recentes primeiro. O filtro por espécie serve ao select do lote. */
export async function listarColetas(especieId?: string) {
  const coletas = await prisma.coleta.findMany({
    where: { deletedAt: null, ...(especieId ? { especieId } : {}) },
    include: inclusao,
    orderBy: [{ dataColeta: "desc" }, { criadoEm: "desc" }],
  });

  return coletas.map(formatarColeta);
}

export async function criarColeta(dados: DadosNovaColeta) {
  const [especie, colaborador] = await Promise.all([
    prisma.especie.findFirst({ where: { id: dados.especieId, deletedAt: null } }),
    prisma.colaborador.findFirst({ where: { id: dados.colaboradorId, ativo: true } }),
  ]);
  if (!especie) throw campoInvalido("especieId", "Espécie não encontrada.");
  if (!colaborador) {
    throw campoInvalido("colaboradorId", "Colaborador não está na lista de ativos.");
  }

  const coleta = await prisma.coleta.create({
    data: {
      especieId: especie.id,
      qtdSementes: dados.qtdSementes,
      dataColeta: new Date(dados.dataColeta),
      matrizLat: dados.matrizLat,
      matrizLng: dados.matrizLng,
      localDescricao: dados.localDescricao,
      colaboradorId: colaborador.id,
    },
    include: inclusao,
  });

  // RN-07: o contador de sementes coletadas sobe na hora.
  limparCacheMetricas();
  return formatarColeta(coleta);
}
