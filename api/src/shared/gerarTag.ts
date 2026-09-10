import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * RN-01 — etiqueta única do lote, no formato <PREFIXO>-<SEQUENCIAL> (A-102).
 *
 * O prefixo é a primeira letra do nome comum, sem acento e maiúscula. Espécies
 * com a mesma inicial compartilham o contador: o prefixo é ajuda de leitura,
 * não chave.
 */
export function prefixoDaEtiqueta(nomeComum: string): string {
  const semAcento = nomeComum
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  const letra = semAcento.charAt(0).toUpperCase();

  if (!/[A-Z]/.test(letra)) {
    throw new Error(`Não consegui tirar um prefixo de etiqueta de "${nomeComum}".`);
  }

  return letra;
}

export function formatarEtiqueta(prefixo: string, sequencial: number): string {
  return `${prefixo}-${String(sequencial).padStart(3, "0")}`;
}

/**
 * Reserva o próximo sequencial do prefixo e devolve a etiqueta.
 *
 * O UPSERT abaixo é a defesa contra concorrência: duas requisições simultâneas
 * com o mesmo prefixo disputam a MESMA linha de contador_tag, e o Postgres
 * serializa as duas no lock da linha. A linha guarda o PRÓXIMO valor livre, por
 * isso o RETURNING devolve `proximo - 1`, que é o valor que acabou de ser
 * consumido. Sequencial nunca é reaproveitado, nem se o lote for excluído.
 *
 * Passe `tx` quando a etiqueta fizer parte de uma transacao maior (o cadastro
 * de lote, por exemplo); sem `tx` ela abre a própria transação.
 */
export async function gerarTag(
  nomeComum: string,
  tx?: Prisma.TransactionClient,
): Promise<string> {
  const prefixo = prefixoDaEtiqueta(nomeComum);

  async function reservar(cliente: Prisma.TransactionClient) {
    const linhas = await cliente.$queryRaw<{ sequencial: number }[]>`
      INSERT INTO contador_tag (prefixo, proximo)
      VALUES (${prefixo}, 2)
      ON CONFLICT (prefixo)
      DO UPDATE SET proximo = contador_tag.proximo + 1
      RETURNING contador_tag.proximo - 1 AS sequencial
    `;
    return linhas[0].sequencial;
  }

  const sequencial = tx
    ? await reservar(tx)
    : await prisma.$transaction((cliente) => reservar(cliente));

  return formatarEtiqueta(prefixo, sequencial);
}
