import { naoEncontrado } from "../../shared/erros";
import { prisma } from "../../shared/prisma";
import type { DadosEdicaoEspecie, DadosNovaEspecie } from "./especies.schema";

export async function listarEspecies(busca?: string) {
  return prisma.especie.findMany({
    where: {
      deletedAt: null,
      ...(busca
        ? {
            OR: [
              { nomeComum: { contains: busca, mode: "insensitive" as const } },
              { nomeCientifico: { contains: busca, mode: "insensitive" as const } },
              { familia: { contains: busca, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { nomeComum: "asc" },
  });
}

export async function buscarEspecie(id: string) {
  const especie = await prisma.especie.findFirst({ where: { id, deletedAt: null } });
  if (!especie) throw naoEncontrado("Espécie não encontrada.");
  return especie;
}

export async function criarEspecie(dados: DadosNovaEspecie) {
  return prisma.especie.create({ data: dados });
}

export async function atualizarEspecie(id: string, dados: DadosEdicaoEspecie) {
  await buscarEspecie(id);
  return prisma.especie.update({ where: { id }, data: dados });
}
