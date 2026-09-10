import { prisma } from "../../shared/prisma";

/**
 * RN-06: esta lista alimenta o campo "quem está registrando" de todo formulário.
 * Colaborador não faz login — quem faz login é o Usuario.
 */
export async function listarColaboradoresAtivos() {
  return prisma.colaborador.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });
}
