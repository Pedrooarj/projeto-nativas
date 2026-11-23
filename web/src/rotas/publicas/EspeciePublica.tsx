import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { buscarEspeciePublica, ErroDaApi, type EspeciePublicaDados } from "../../lib/api";
import { Card } from "../../componentes/ui/Card";

/** A API manda a taxa como fração (0,78); a tela mostra porcentagem (78,6%). */
function formatarTaxa(taxa: number) {
  return `${(taxa * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

export function EspeciePublica() {
  const { id } = useParams();

  const [dados, setDados] = useState<EspeciePublicaDados | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let ativo = true;
    setCarregando(true);
    setErro(null);

    buscarEspeciePublica(id)
      .then((resposta) => {
        if (ativo) setDados(resposta);
      })
      .catch((problema: ErroDaApi) => {
        if (ativo) setErro(problema.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [id]);

  const metricas = [
    { rotulo: "Coletas", valor: dados?.numeros.coletas },
    { rotulo: "Sementes coletadas", valor: dados?.numeros.sementesColetadas },
    { rotulo: "Mudas produzidas", valor: dados?.numeros.mudasProduzidas },
    { rotulo: "Plantios", valor: dados?.numeros.plantiosDefinitivos },
  ];

  return (
    <main className="mx-auto max-w-conteudo px-5 py-16">
      <Link to="/acervo" className="text-15 text-verdeEscuro hover:underline">
        &larr; Voltar ao acervo
      </Link>

      <p className="rotulo-portal mt-8 text-madeira">Espécie</p>
      <h1 className="mt-4 text-subtitulo">{dados ? dados.nomeComum : "Página da espécie"}</h1>

      <h2 className="mt-12 text-18 text-verdeEscuro">O que o projeto já fez</h2>

      {carregando ? (
        <p className="mt-4 text-16 text-cinza">Carregando números...</p>
      ) : erro ? (
        <p className="mt-4 rounded-campo bg-madeiraTint px-4 py-3 text-15 text-madeira">
          Não consegui carregar os números agora: {erro}
        </p>
      ) : (
        <>
          <ul className="mt-4 grid gap-4 sistema:grid-cols-4">
            {metricas.map((metrica) => (
              <li key={metrica.rotulo}>
                <div className="h-full rounded-cartao bg-verdeEscuro p-5">
                  <p className="font-display text-30 tracking-tituloForte text-areia sistema:text-[44px]">
                    {metrica.valor === undefined ? "—" : metrica.valor.toLocaleString("pt-BR")}
                  </p>
                  <p className="mt-2 font-mono text-12 uppercase tracking-rotuloPortal text-verdePalido">
                    {metrica.rotulo}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {dados ? (
            <div className="mt-4 grid gap-4 sistema:grid-cols-2">
              <Card>
                <p className="rotulo">Taxa de germinação</p>
                {dados.numeros.germinacao.taxa === null ||
                dados.numeros.germinacao.lotesConsiderados === 0 ? (
                  <p className="mt-2 text-16 text-cinza">
                    Ainda não há lotes desta espécie para calcular a taxa.
                  </p>
                ) : (
                  <p className="mt-2 text-16 text-tintaCard">
                    <span className="text-30 text-verdeEscuro">
                      {formatarTaxa(dados.numeros.germinacao.taxa)}
                    </span>{" "}
                    com base em {dados.numeros.germinacao.lotesConsiderados}{" "}
                    {dados.numeros.germinacao.lotesConsiderados === 1 ? "lote" : "lotes"}
                  </p>
                )}
              </Card>

              <Card>
                <p className="rotulo">Tratamentos aplicados</p>
                {dados.numeros.tratamentos.length === 0 ? (
                  <p className="mt-2 text-16 text-cinza">Nenhum tratamento registrado.</p>
                ) : (
                  <ul className="mt-2 text-16 text-tintaCard">
                    {dados.numeros.tratamentos.map((item) => (
                      <li key={item.tratamento}>
                        {item.tratamento} · {item.lotes} {item.lotes === 1 ? "lote" : "lotes"}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}