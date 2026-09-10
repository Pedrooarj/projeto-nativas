import type { ReactNode } from "react";

export type Coluna<Linha> = {
  chave: string;
  titulo: string;
  renderizar: (linha: Linha) => ReactNode;
};

type Props<Linha> = {
  colunas: Coluna<Linha>[];
  linhas: Linha[];
  chaveDaLinha: (linha: Linha) => string;
  vazio?: ReactNode;
};

export function Tabela<Linha>({ colunas, linhas, chaveDaLinha, vazio }: Props<Linha>) {
  if (linhas.length === 0) {
    return (
      <div className="rounded-cartao border border-borda bg-white p-8 text-center text-15 text-cinza">
        {vazio ?? "Nada por aqui ainda."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-cartao border border-borda bg-white">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-borda">
            {colunas.map((coluna) => (
              <th key={coluna.chave} className="rotulo px-4 py-3">
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={chaveDaLinha(linha)} className="border-b border-borda last:border-b-0">
              {colunas.map((coluna) => (
                <td key={coluna.chave} className="px-4 py-4 text-15 text-tintaCard">
                  {coluna.renderizar(linha)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
