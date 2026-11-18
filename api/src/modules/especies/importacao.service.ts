import { invalido } from "../../shared/erros";
import { lerCsv } from "../../shared/lerCsv";
import { prisma } from "../../shared/prisma";
import { criarEspecieSchema } from "./especies.schema";

/**
 * Importação do acervo por planilha (RN-08). A coordenação preenche o conteúdo
 * botânico numa planilha e salva como CSV; esta função cria as espécies novas
 * e atualiza as que já existem, usando o nome científico como chave. Pode rodar
 * quantas vezes for preciso, conforme o conteúdo chega.
 *
 * Tudo ou nada: se uma linha tiver erro, nenhuma é gravada e o 422 lista
 * a linha e o campo de cada problema. Meia planilha importada é mais difícil de
 * conferir do que nenhuma.
 */

// Coluna da planilha → campo da espécie. A ordem é a da planilha-modelo.
const COLUNAS = {
  nome_comum: "nomeComum",
  nome_cientifico: "nomeCientifico",
  familia: "familia",
  descricao: "descricao",
  porte: "porte",
  epoca_floracao: "epocaFloracao",
  epoca_frutificacao: "epocaFrutificacao",
  usos: "usos",
  foto_principal_url: "fotoPrincipalUrl",
  galeria: "galeria",
} as const;

type Coluna = keyof typeof COLUNAS;
const OBRIGATORIAS: Coluna[] = ["nome_comum", "nome_cientifico", "familia"];
// Células com mais de um valor usam a barra vertical: "medicinal | ornamental".
const COLUNAS_DE_LISTA: Coluna[] = ["usos", "galeria"];

export type ErroDeLinha = { linha: number; campo: string; mensagem: string };

export type RelatorioImportacao = {
  simulacao: boolean;
  linhasLidas: number;
  criadas: string[];
  atualizadas: string[];
};

function normalizarCabecalho(texto: string) {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "_");
}

export async function importarAcervo(
  texto: string,
  opcoes: { simular?: boolean } = {},
): Promise<RelatorioImportacao> {
  const linhas = lerCsv(texto);
  if (linhas.length < 2) {
    throw invalido("A planilha está vazia: precisa do cabeçalho e de pelo menos uma espécie.");
  }

  const cabecalho = linhas[0].map(normalizarCabecalho);
  const errosDoCabecalho: ErroDeLinha[] = [];
  for (const nome of cabecalho) {
    if (nome !== "" && !(nome in COLUNAS)) {
      errosDoCabecalho.push({ linha: 1, campo: nome, mensagem: "Coluna desconhecida." });
    }
  }
  for (const nome of OBRIGATORIAS) {
    if (!cabecalho.includes(nome)) {
      errosDoCabecalho.push({ linha: 1, campo: nome, mensagem: "Coluna obrigatória ausente." });
    }
  }
  if (errosDoCabecalho.length > 0) {
    throw invalido("O cabeçalho da planilha não confere com o modelo.", errosDoCabecalho);
  }

  const erros: ErroDeLinha[] = [];
  const validas: { linha: number; dados: ReturnType<typeof criarEspecieSchema.parse> }[] = [];
  const vistos = new Map<string, number>();

  linhas.slice(1).forEach((celulas, indice) => {
    const numeroDaLinha = indice + 2;
    const bruto: Record<string, string | string[] | undefined> = {};

    cabecalho.forEach((nome, coluna) => {
      if (!(nome in COLUNAS)) return;
      const valor = (celulas[coluna] ?? "").trim();
      const campo = COLUNAS[nome as Coluna];
      if (COLUNAS_DE_LISTA.includes(nome as Coluna)) {
        const itens = valor.split("|").map((item) => item.trim()).filter(Boolean);
        bruto[campo] = itens.length > 0 ? itens : undefined;
      } else {
        // Célula vazia não apaga o que já está no banco: só não mexe no campo.
        bruto[campo] = valor === "" ? undefined : valor;
      }
    });

    const resultado = criarEspecieSchema.safeParse(bruto);
    if (!resultado.success) {
      for (const problema of resultado.error.issues) {
        const campo = problema.path.join(".");
        const mensagem =
          problema.code === "invalid_type" && problema.received === "undefined"
            ? "Campo obrigatório."
            : problema.message;
        erros.push({ linha: numeroDaLinha, campo, mensagem });
      }
      return;
    }

    const chave = resultado.data.nomeCientifico.toLowerCase();
    const anterior = vistos.get(chave);
    if (anterior) {
      erros.push({
        linha: numeroDaLinha,
        campo: "nomeCientifico",
        mensagem: `Nome científico repetido: já aparece na linha ${anterior}.`,
      });
      return;
    }
    vistos.set(chave, numeroDaLinha);
    validas.push({ linha: numeroDaLinha, dados: resultado.data });
  });

  const existentes = await prisma.especie.findMany({
    where: { nomeCientifico: { in: validas.map((v) => v.dados.nomeCientifico) } },
    select: { id: true, nomeCientifico: true, deletedAt: true },
  });
  const porNome = new Map(existentes.map((e) => [e.nomeCientifico, e]));

  for (const { linha, dados } of validas) {
    if (porNome.get(dados.nomeCientifico)?.deletedAt) {
      erros.push({
        linha,
        campo: "nomeCientifico",
        mensagem: "Esta espécie foi excluída do acervo. Fale com o admin antes de reimportar.",
      });
    }
  }

  if (erros.length > 0) {
    throw invalido(
      `A planilha tem ${erros.length} problema(s). Nada foi gravado; corrija e envie de novo.`,
      erros,
    );
  }

  const relatorio: RelatorioImportacao = {
    simulacao: Boolean(opcoes.simular),
    linhasLidas: linhas.length - 1,
    criadas: [],
    atualizadas: [],
  };

  for (const { dados } of validas) {
    if (porNome.has(dados.nomeCientifico)) relatorio.atualizadas.push(dados.nomeCientifico);
    else relatorio.criadas.push(dados.nomeCientifico);
  }

  if (opcoes.simular) return relatorio;

  await prisma.$transaction(async (tx) => {
    for (const { dados } of validas) {
      const existente = porNome.get(dados.nomeCientifico);
      if (existente) {
        // Lista vazia na planilha também não apaga a lista que já existe.
        const { usos, galeria, ...resto } = dados;
        await tx.especie.update({
          where: { id: existente.id },
          data: {
            ...resto,
            ...(usos.length > 0 ? { usos } : {}),
            ...(galeria.length > 0 ? { galeria } : {}),
          },
        });
      } else {
        await tx.especie.create({ data: dados });
      }
    }
  });

  return relatorio;
}
