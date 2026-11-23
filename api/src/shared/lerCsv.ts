/**
 * Lê um CSV simples e devolve as linhas como listas de células.
 *
 * O separador é descoberto pela primeira linha: o Excel em português salva com
 * ponto e vírgula, o Google Planilhas com vírgula. Aspas duplas protegem
 * separador e quebra de linha dentro da célula, e "" dentro de aspas vira ".
 * Linhas totalmente vazias são descartadas.
 */
export function lerCsv(texto: string): string[][] {
  const limpo = texto.replace(/^﻿/, "");
  const primeiraLinha = limpo.split(/\r?\n/, 1)[0] ?? "";
  const separador = contar(primeiraLinha, ";") > contar(primeiraLinha, ",") ? ";" : ",";

  const linhas: string[][] = [];
  let linha: string[] = [];
  let celula = "";
  let entreAspas = false;

  for (let i = 0; i < limpo.length; i++) {
    const caractere = limpo[i];

    if (entreAspas) {
      if (caractere === '"' && limpo[i + 1] === '"') {
        celula += '"';
        i++;
      } else if (caractere === '"') {
        entreAspas = false;
      } else {
        celula += caractere;
      }
      continue;
    }

    if (caractere === '"') {
      entreAspas = true;
    } else if (caractere === separador) {
      linha.push(celula);
      celula = "";
    } else if (caractere === "\n" || caractere === "\r") {
      if (caractere === "\r" && limpo[i + 1] === "\n") i++;
      linha.push(celula);
      linhas.push(linha);
      linha = [];
      celula = "";
    } else {
      celula += caractere;
    }
  }
  linha.push(celula);
  linhas.push(linha);

  return linhas.filter((cells) => cells.some((c) => c.trim() !== ""));
}

function contar(texto: string, caractere: string) {
  return texto.split(caractere).length - 1;
}
