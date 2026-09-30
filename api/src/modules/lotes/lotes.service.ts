import { Estagio } from "@prisma/client";
import { campoInvalido, conflito } from "../../shared/erros";
import { gerarTag } from "../../shared/gerarTag";
import { prisma } from "../../shared/prisma";
import { limparCacheMetricas } from "../publico/publico.service";
import type { DadosNovoLote } from "./lotes.schema";

/**
 * Cadastro do lote: RN-01 (etiqueta), RN-05 (procedência e saldo) e RN-06
 * (responsável no corpo). Etiqueta, lote e a primeira linha do histórico
 * nascem na mesma transação, ou não nascem.
 */
export async function criarLote(dados: DadosNovoLote) {
  const [colaborador, substrato] = await Promise.all([
    prisma.colaborador.findFirst({ where: { id: dados.colaboradorId, ativo: true } }),
    prisma.substrato.findFirst({ where: { id: dados.substratoId, ativo: true } }),
  ]);
  if (!colaborador) {
    throw campoInvalido("colaboradorId", "Colaborador não está na lista de ativos.");
  }
  if (!substrato) {
    throw campoInvalido("substratoId", "Substrato não está na lista de ativos.");
  }

  const lote = await prisma.$transaction(async (tx) => {
    // RN-05 sob concorrência: trava a linha da coleta até o fim da transação.
    // Dois cadastros simultâneos na mesma coleta passam a rodar um depois do
    // outro, e o segundo já enxerga as sementes que o primeiro usou.
    const travadas = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM coleta
      WHERE id = ${dados.coletaId} AND deleted_at IS NULL
      FOR UPDATE
    `;
    if (travadas.length === 0) throw campoInvalido("coletaId", "Coleta não encontrada.");

    const coleta = await tx.coleta.findUniqueOrThrow({
      where: { id: dados.coletaId },
      include: { especie: { select: { nomeComum: true } } },
    });

    const usadas = await tx.loteMudas.aggregate({
      _sum: { qtdSementes: true },
      where: { coletaId: coleta.id, deletedAt: null },
    });
    const saldo = coleta.qtdSementes - (usadas._sum.qtdSementes ?? 0);

    if (dados.qtdSementes > saldo) {
      throw conflito(
        `Saldo disponível na coleta: ${saldo} sementes. O lote pede ${dados.qtdSementes}.`,
        { saldo },
      );
    }

    const tagUnica = await gerarTag(coleta.especie.nomeComum, tx);
    const dataPlantio = new Date(dados.dataPlantio);

    const novo = await tx.loteMudas.create({
      data: {
        tagUnica,
        especieId: coleta.especieId,
        coletaId: coleta.id,
        dataPlantio,
        qtdSementes: dados.qtdSementes,
        qtdMudasVivas: dados.qtdMudasVivas,
        tipoRecipiente: dados.tipoRecipiente,
        tratamentoSemente: dados.tratamentoSemente,
        substratoId: substrato.id,
        setor: dados.setor,
        identificacaoFina: dados.identificacaoFina,
        colaboradorId: colaborador.id,
      },
      include: {
        especie: { select: { nomeComum: true, nomeCientifico: true } },
        colaborador: { select: { nome: true } },
        substrato: { select: { nome: true } },
      },
    });

    // A linha do tempo do lote começa no cadastro (RN-03).
    await tx.historicoCrescimento.create({
      data: {
        loteId: novo.id,
        estagioAnterior: null,
        estagioNovo: Estagio.ESTAGIO_1,
        recipienteNovo: dados.tipoRecipiente,
        setorNovo: dados.setor,
        observacao: "Cadastro do lote.",
        dataTransferencia: dataPlantio,
        colaboradorId: colaborador.id,
      },
    });

    return novo;
  });

  // Só mexe nos contadores se veio a contagem de mudas vivas, mas limpar é barato (RN-07).
  limparCacheMetricas();
  return lote;
}
