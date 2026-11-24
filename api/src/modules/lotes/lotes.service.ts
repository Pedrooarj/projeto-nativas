import { Estagio, TipoDestino, TipoRecipiente } from "@prisma/client";
import { campoInvalido, conflito, naoEncontrado } from "../../shared/erros";
import { gerarTag } from "../../shared/gerarTag";
import { prisma } from "../../shared/prisma";
import { limparCacheMetricas } from "../publico/publico.service";
import type { DadosDestino, DadosNovoLote, DadosTransicao } from "./lotes.schema";

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

// O que o cartão do quadro mostra. Cada coluna vem em ordem de etiqueta, para
// o voluntário achar a bandeja pela plaqueta.
const camposDoCartao = {
  id: true,
  tagUnica: true,
  estagioAtual: true,
  dataPlantio: true,
  qtdSementes: true,
  qtdMudasVivas: true,
  tipoRecipiente: true,
  setor: true,
  identificacaoFina: true,
  especie: { select: { nomeComum: true, nomeCientifico: true } },
  destino: { select: { tipo: true, data: true, quantidade: true } },
} as const;

/** GET /lotes/quadro: as três colunas do quadro (RN-03). Lote excluído não aparece. */
export async function obterQuadro() {
  const lotes = await prisma.loteMudas.findMany({
    where: { deletedAt: null },
    select: camposDoCartao,
    orderBy: { tagUnica: "asc" },
  });

  return {
    etapa1: lotes.filter((lote) => lote.estagioAtual === Estagio.ESTAGIO_1),
    etapa2: lotes.filter((lote) => lote.estagioAtual === Estagio.ESTAGIO_2),
    destinoFinal: lotes.filter((lote) => lote.estagioAtual === Estagio.FINALIZADO),
  };
}

/** GET /lotes/:id: o lote com a linha do tempo inteira e o destino, se houver. */
export async function buscarLote(id: string) {
  const lote = await prisma.loteMudas.findFirst({
    where: { id, deletedAt: null },
    include: {
      especie: { select: { nomeComum: true, nomeCientifico: true } },
      coleta: { select: { id: true, dataColeta: true, localDescricao: true } },
      substrato: { select: { nome: true } },
      colaborador: { select: { nome: true } },
      historico: {
        orderBy: { dataTransferencia: "asc" },
        include: { colaborador: { select: { nome: true } } },
      },
      destino: { include: { colaborador: { select: { nome: true } } } },
    },
  });
  if (!lote) throw naoEncontrado("Lote não encontrado.");
  return lote;
}

const ORDEM_DA_ETAPA: Record<Estagio, number> = {
  ESTAGIO_1: 1,
  ESTAGIO_2: 2,
  FINALIZADO: 3,
};

function dataIso(data: Date) {
  return data.toISOString().slice(0, 10);
}

async function exigirColaboradorAtivo(colaboradorId: string) {
  const colaborador = await prisma.colaborador.findFirst({
    where: { id: colaboradorId, ativo: true },
  });
  if (!colaborador) {
    throw campoInvalido("colaboradorId", "Colaborador não está na lista de ativos.");
  }
}

/**
 * POST /lotes/:id/transicao (RN-03). Por aqui o lote vai da etapa 1 para a
 * etapa 2; o destino final tem rota própria porque exige outros campos.
 * Recipiente e setor mudam junto, e a linha do histórico nasce na mesma
 * transação.
 */
export async function transicionarLote(id: string, dados: DadosTransicao) {
  const lote = await prisma.loteMudas.findFirst({ where: { id, deletedAt: null } });
  if (!lote) throw naoEncontrado("Lote não encontrado.");

  if (lote.estagioAtual === Estagio.FINALIZADO) {
    throw conflito("Este lote já tem destino final e não muda mais de etapa.");
  }
  if (dados.estagioNovo === Estagio.FINALIZADO) {
    throw conflito("Para finalizar o lote, registre o destino final.");
  }
  if (ORDEM_DA_ETAPA[dados.estagioNovo] <= ORDEM_DA_ETAPA[lote.estagioAtual]) {
    throw conflito("O lote só avança de etapa: não dá para voltar nem repetir a etapa atual.");
  }

  // Daqui para baixo o destino é sempre a etapa 2.
  if (dados.tipoRecipiente !== TipoRecipiente.SACO && dados.tipoRecipiente !== TipoRecipiente.CANO) {
    throw campoInvalido("tipoRecipiente", "Na etapa 2 o recipiente é saco ou cano.");
  }
  if (dados.qtdMudasVivas !== undefined && dados.qtdMudasVivas > lote.qtdSementes) {
    throw campoInvalido("qtdMudasVivas", "As mudas vivas não podem passar as sementes plantadas.");
  }
  if (dados.data < dataIso(lote.dataPlantio)) {
    throw campoInvalido("data", "A data da transferência não pode ser anterior ao plantio do lote.");
  }
  await exigirColaboradorAtivo(dados.colaboradorId);

  await prisma.$transaction(async (tx) => {
    // A condição na etapa atual protege de duas transições simultâneas: só a
    // primeira encontra o lote na etapa de origem.
    const { count } = await tx.loteMudas.updateMany({
      where: { id, deletedAt: null, estagioAtual: lote.estagioAtual },
      data: {
        estagioAtual: dados.estagioNovo,
        tipoRecipiente: dados.tipoRecipiente,
        setor: dados.setor,
        // Mudou de lugar: a identificação antiga ("bancada 3") deixa de valer.
        identificacaoFina: dados.identificacaoFina ?? null,
        ...(dados.qtdMudasVivas !== undefined ? { qtdMudasVivas: dados.qtdMudasVivas } : {}),
      },
    });
    if (count === 0) {
      throw conflito("O lote mudou de etapa enquanto você registrava. Recarregue o quadro.");
    }

    await tx.historicoCrescimento.create({
      data: {
        loteId: id,
        estagioAnterior: lote.estagioAtual,
        estagioNovo: dados.estagioNovo,
        recipienteNovo: dados.tipoRecipiente,
        setorNovo: dados.setor,
        observacao: dados.observacao,
        dataTransferencia: new Date(dados.data),
        colaboradorId: dados.colaboradorId,
      },
    });
  });

  // A contagem de mudas vivas entra no contador "mudas no viveiro" (RN-07).
  limparCacheMetricas();
  return buscarLote(id);
}

const ROTULO_DO_DESTINO: Record<TipoDestino, string> = {
  PLANTIO_DEFINITIVO: "plantio definitivo",
  DOACAO: "doação",
  PERDA: "perda",
};

/**
 * POST /lotes/:id/destino (RN-04). Atômico: destino, estágio FINALIZADO e
 * histórico nascem juntos, ou nada muda. Só os campos do tipo escolhido são
 * gravados, para um plantio não carregar destinatário de doação.
 */
export async function registrarDestino(id: string, dados: DadosDestino) {
  const lote = await prisma.loteMudas.findFirst({ where: { id, deletedAt: null } });
  if (!lote) throw naoEncontrado("Lote não encontrado.");

  if (lote.estagioAtual === Estagio.FINALIZADO) {
    throw conflito("Este lote já tem destino final.");
  }
  if (dados.data < dataIso(lote.dataPlantio)) {
    throw campoInvalido("data", "A data do destino não pode ser anterior ao plantio do lote.");
  }
  // Não sai do viveiro mais muda do que o lote tem. Sem contagem registrada,
  // o teto é o número de sementes plantadas.
  const maximo = lote.qtdMudasVivas ?? lote.qtdSementes;
  if (dados.quantidade > maximo) {
    throw conflito(`O lote tem ${maximo} mudas. O destino pede ${dados.quantidade}.`, { maximo });
  }
  await exigirColaboradorAtivo(dados.colaboradorId);

  const plantio = dados.tipo === TipoDestino.PLANTIO_DEFINITIVO;

  await prisma.$transaction(async (tx) => {
    const { count } = await tx.loteMudas.updateMany({
      where: { id, deletedAt: null, estagioAtual: lote.estagioAtual },
      data: { estagioAtual: Estagio.FINALIZADO },
    });
    if (count === 0) {
      throw conflito("O lote mudou de etapa enquanto você registrava. Recarregue o quadro.");
    }

    await tx.destinoFinal.create({
      data: {
        loteId: id,
        tipo: dados.tipo,
        data: new Date(dados.data),
        quantidade: dados.quantidade,
        destinoLat: plantio ? dados.latitude : null,
        destinoLng: plantio ? dados.longitude : null,
        localDescricao: plantio ? dados.localDescricao : null,
        destinatario: dados.tipo === TipoDestino.DOACAO ? dados.destinatario : null,
        causa: dados.tipo === TipoDestino.PERDA ? (dados.causa ?? null) : null,
        colaboradorId: dados.colaboradorId,
      },
    });

    await tx.historicoCrescimento.create({
      data: {
        loteId: id,
        estagioAnterior: lote.estagioAtual,
        estagioNovo: Estagio.FINALIZADO,
        observacao: `Destino final: ${ROTULO_DO_DESTINO[dados.tipo]}.`,
        dataTransferencia: new Date(dados.data),
        colaboradorId: dados.colaboradorId,
      },
    });
  });

  // Plantio definitivo sobe o contador público e o lote sai de "mudas no viveiro" (RN-07).
  limparCacheMetricas();
  return buscarLote(id);
}
