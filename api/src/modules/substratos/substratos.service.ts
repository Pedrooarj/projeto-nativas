import { prisma } from "../../shared/prisma";

/**
 * Alimenta o select de substrato do cadastro de lote. Um substrato desativado
 * some desta lista, mas continua ligado aos lotes antigos que o usaram.
 */
export async function listarSubstratosAtivos() {
  return prisma.substrato.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });
}
