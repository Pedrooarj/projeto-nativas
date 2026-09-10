import { Estagio, TipoDestino } from "@prisma/client";
import { prisma } from "../../shared/prisma";

export type Metricas = {
  sementesColetadas: number;
  mudasNoViveiro: number;
  plantiosDefinitivos: number;
  visitasRecebidas: number;
  atualizadoEm: string;
};

const CINCO_MINUTOS = 5 * 60 * 1000;

let cache: { valor: Metricas; expiraEm: number } | null = null;

/**
 * RN-07 — contadores do portal.
 *
 * O cache de 5 minutos existe porque a home pública é a página mais visitada e
 * os quatro números não precisam ser instantâneos; precisam ser verdadeiros.
 * Quem grava um registro novo pode chamar limparCacheMetricas() para o número
 * subir na hora.
 */
export async function obterMetricas(): Promise<Metricas> {
  if (cache && Date.now() < cache.expiraEm) return cache.valor;

  const valor = await consultarMetricas();
  cache = { valor, expiraEm: Date.now() + CINCO_MINUTOS };
  return valor;
}

export function limparCacheMetricas() {
  cache = null;
}

async function consultarMetricas(): Promise<Metricas> {
  const [coletas, lotes, plantios, visitas] = await Promise.all([
    prisma.coleta.aggregate({
      _sum: { qtdSementes: true },
      where: { deletedAt: null },
    }),
    prisma.loteMudas.aggregate({
      _sum: { qtdMudasVivas: true },
      where: {
        deletedAt: null,
        estagioAtual: { in: [Estagio.ESTAGIO_1, Estagio.ESTAGIO_2] },
      },
    }),
    prisma.destinoFinal.count({ where: { tipo: TipoDestino.PLANTIO_DEFINITIVO } }),
    prisma.visita.count(),
  ]);

  return {
    sementesColetadas: coletas._sum.qtdSementes ?? 0,
    mudasNoViveiro: lotes._sum.qtdMudasVivas ?? 0,
    plantiosDefinitivos: plantios,
    visitasRecebidas: visitas,
    atualizadoEm: new Date().toISOString(),
  };
}
