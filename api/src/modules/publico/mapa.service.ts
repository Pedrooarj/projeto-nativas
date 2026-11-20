import { TipoDestino } from "@prisma/client";
import { prisma } from "../../shared/prisma";

type EspecieDoPonto = { id: string; nomeComum: string; nomeCientifico: string };

/** Árvore matriz: a coordenada registrada na coleta (RN-05). */
export type Matriz = {
  id: string;
  lat: number;
  lng: number;
  data: string;
  localDescricao: string | null;
  fotoUrl: string | null;
  especie: EspecieDoPonto;
};

export type Plantio = {
  id: string;
  lat: number;
  lng: number;
  data: string;
  localDescricao: string | null;
  etiqueta: string;
  quantidade: number;
  fotoUrl: string | null;
  especie: EspecieDoPonto;
};

const especieDoPonto = { select: { id: true, nomeComum: true, nomeCientifico: true } };

/**
 * Pontos do mapa do portal. Entre os destinos finais, só o plantio definitivo
 * aparece (RN-04): doação e perda ficam no sistema.
 */
export async function obterMapa(): Promise<{ matrizes: Matriz[]; plantios: Plantio[] }> {
  const [coletas, destinos] = await Promise.all([
    prisma.coleta.findMany({
      where: { deletedAt: null },
      orderBy: { dataColeta: "desc" },
      select: {
        id: true,
        matrizLat: true,
        matrizLng: true,
        dataColeta: true,
        localDescricao: true,
        fotoUrl: true,
        especie: especieDoPonto,
      },
    }),
    prisma.destinoFinal.findMany({
      where: {
        tipo: TipoDestino.PLANTIO_DEFINITIVO,
        destinoLat: { not: null },
        destinoLng: { not: null },
        lote: { deletedAt: null },
      },
      orderBy: { data: "desc" },
      select: {
        id: true,
        destinoLat: true,
        destinoLng: true,
        data: true,
        localDescricao: true,
        quantidade: true,
        lote: { select: { tagUnica: true, fotoUrl: true, especie: especieDoPonto } },
      },
    }),
  ]);

  return {
    matrizes: coletas.map((coleta) => ({
      id: coleta.id,
      lat: coleta.matrizLat.toNumber(),
      lng: coleta.matrizLng.toNumber(),
      data: soODia(coleta.dataColeta),
      localDescricao: coleta.localDescricao,
      fotoUrl: coleta.fotoUrl,
      especie: coleta.especie,
    })),
    plantios: destinos.map((destino) => ({
      id: destino.id,
      // O filtro da consulta já garante a coordenada; o banco é que deixa o campo opcional.
      lat: destino.destinoLat!.toNumber(),
      lng: destino.destinoLng!.toNumber(),
      data: soODia(destino.data),
      localDescricao: destino.localDescricao,
      etiqueta: destino.lote.tagUnica,
      quantidade: destino.quantidade,
      fotoUrl: destino.lote.fotoUrl,
      especie: destino.lote.especie,
    })),
  };
}

function soODia(data: Date) {
  return data.toISOString().slice(0, 10);
}
