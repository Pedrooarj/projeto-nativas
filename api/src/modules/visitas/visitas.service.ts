import { campoInvalido } from "../../shared/erros";
import { prisma } from "../../shared/prisma";
import { limparCacheMetricas } from "../publico/publico.service";
import type { DadosNovaVisita } from "./visitas.schema";

const camposDaVisita = {
  id: true,
  data: true,
  instituicao: true,
  numeroPessoas: true,
  observacao: true,
  colaborador: { select: { nome: true } },
} as const;

/** GET /visitas: da mais recente para a mais antiga. */
export async function listarVisitas() {
  return prisma.visita.findMany({
    select: camposDaVisita,
    orderBy: [{ data: "desc" }, { criadoEm: "desc" }],
  });
}

/** POST /visitas: alimenta o contador "visitas recebidas" do portal (RN-07). */
export async function criarVisita(dados: DadosNovaVisita) {
  const colaborador = await prisma.colaborador.findFirst({
    where: { id: dados.colaboradorId, ativo: true },
  });
  if (!colaborador) {
    throw campoInvalido("colaboradorId", "Colaborador não está na lista de ativos.");
  }

  const visita = await prisma.visita.create({
    data: {
      data: new Date(dados.data),
      instituicao: dados.instituicao,
      numeroPessoas: dados.numeroPessoas,
      observacao: dados.observacao,
      colaboradorId: colaborador.id,
    },
    select: camposDaVisita,
  });

  // O contador público sobe na hora, sem esperar o cache de 5 minutos.
  limparCacheMetricas();
  return visita;
}
