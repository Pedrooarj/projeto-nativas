import { describe, expect, it } from "vitest";
import { lerCsv } from "./lerCsv";

describe("leitura de CSV", () => {
  it("descobre o ponto e vírgula do Excel em português", () => {
    expect(lerCsv("a;b;c\r\n1;2;3\r\n")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("descobre a vírgula do Google Planilhas", () => {
    expect(lerCsv("a,b\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("respeita aspas com separador, quebra de linha e aspas escapadas dentro", () => {
    const texto = 'nome;descricao\nAngico;"Árvore de até 15 m; casca ""rugosa""\ncom espinhos"';
    expect(lerCsv(texto)).toEqual([
      ["nome", "descricao"],
      ["Angico", 'Árvore de até 15 m; casca "rugosa"\ncom espinhos'],
    ]);
  });

  it("ignora o BOM do início e as linhas vazias", () => {
    expect(lerCsv("﻿a;b\n\n1;2\n;\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});
