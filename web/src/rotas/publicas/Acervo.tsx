import { Card } from "../../componentes/ui/Card";
import { useEffect, useState } from "react";
import { Botao } from "../../componentes/ui/Botao";
import type { Especie } from "../../lib/api";
import { CabecalhoPublico } from "../../componentes/publico/CabecalhoPublico";
import { RodapePublico } from "../../componentes/publico/RodapePublico";
import { ErroDaApi, listarEspeciesPublicas, type EspecieDoAcervo } from "../../lib/api";

// TEMPORÁRIO: lista temporária enquanto GET /publico/especies não existe
const especiesFixas: EspecieDoAcervo[] = [
  { id: "1", nomeComum: "Angico", nomeCientifico: "Anadenanthera colubrina", familia: "Fabaceae", fotoPrincipalUrl: null },
  { id: "2", nomeComum: "Mandacaru", nomeCientifico: "Cereus jamacaru", familia: "Cactaceae", fotoPrincipalUrl: null },
  { id: "3", nomeComum: "Umbuzeiro", nomeCientifico: "Spondias tuberosa", familia: "Anacardiaceae", fotoPrincipalUrl: null },
  { id: "4", nomeComum: "Aroeira", nomeCientifico: "Myracrodruon urundeuva", familia: "Anacardiaceae", fotoPrincipalUrl: null },
  { id: "5", nomeComum: "Juazeiro", nomeCientifico: "Ziziphus joazeiro", familia: "Rhamnaceae", fotoPrincipalUrl: null },
  { id: "6", nomeComum: "Jurema-preta", nomeCientifico: "Mimosa tenuiflora", familia: "Fabaceae", fotoPrincipalUrl: null },
];

/**Serve para normalizar o texto, tirando acentos e maiúsculas das palavras
 * Exemplo: "Umbuzeiro", "umbuzeiro" e "Úmbuzeiro" se igualam. */
function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function Acervo() {
  const [especies, setEspecies] = useState<EspecieDoAcervo[]>([]);    // A lista começa vazia
  const [carregando, setCarregando] = useState(true);                 // Começa com True para aparecer "Carregando espécies" quando entrar na página
  const [erro, setErro] = useState<string | null>(null);              // Começa null e guarda a mensagem quando houver
  const [busca, setBusca] = useState("");                             // A busca começa vazia
  const [familia, setFamilia] = useState("");                         // A escolha começa vazia

  useEffect(() => {
    let ativo = true;
    listarEspeciesPublicas()
      .then((lista) => { if (ativo) setEspecies(lista); })
      .catch((problema: ErroDaApi) => { if (ativo) setErro(problema.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [] );                                                            // O [] significa "rode só uma vez, quando a página abrir"

  /**
   * especies.map((especie) => especie.familia) cria uma lista só com as famílias
   * new Set() remove os repetidos
   * [...] transforma o Set de volta em lista
   * .sort(...) ordena a lista alfabeticamente
   */
  const familias = [...new Set(especies.map((especie) => especie.familia))].sort((a, b) => a.localeCompare(b, "pt-br"),
  );


  const termo = normalizar(busca.trim());
  const filtradas = especies.filter((especie) => {
    const bateFamilia = familia === "" || especie.familia === familia;
    const bateBusca =
      termo === "" ||
      normalizar(especie.nomeComum).includes(termo) ||
      normalizar(especie.nomeCientifico).includes(termo);
    return bateFamilia && bateBusca;
  });

  // É true se tiver algum filtro
  // Serve para escolher a mensagem de "nada encontrado"
  const temFiltro = busca !== "" || familia !== "";

  function limparFiltros() {
    setBusca("");
    setFamilia("");
  }

  return (
    <div className="flex min-h-screen flex-col bg-areia">
    <CabecalhoPublico ativa="acervo" />
    <main className="mx-auto w-full max-w-conteudo flex-1 px-5 py-14">
      <p className="rotulo-portal text-madeira">
        Acervo{carregando ? "" : ` · ${especies.length} espécies nativas da Caatinga`}
      </p>
      <h1 className="mt-4 text-titulo tracking-tituloForte">
        Acervo de <span className="destaque">espécies</span>
      </h1>

      {/* Busca e filtro numa linha só, como no protótipo; os rótulos ficam para leitor de tela. */}
      <div className="mt-8 grid gap-3 sistema:grid-cols-[1fr_auto]">
        <div className="relative">
          <label htmlFor="busca" className="sr-only">Buscar por nome comum ou científico</label>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cinza"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input 
            id = "busca"
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Buscar por nome comum ou científico"
            className="min-h-toque w-full rounded-campo border border-bordaForte bg-white pl-11 pr-4 text-16 text-tintaCard"
            />
        </div>

        <div>
          <label htmlFor="familia" className="sr-only">Família botânica</label>
          <select 
            id="familia"
            value={familia}
            onChange={(evento) => setFamilia(evento.target.value)}
            className="min-h-toque w-full rounded-campo border border-bordaForte bg-white px-4 font-mono text-14 text-verdeEscuro sistema:w-auto"
          >
            <option value="">Todas as famílias</option>
            {familias.map((nome) => (
              <option key={nome} value={nome}>{nome}</option>
            ))}
            </select>
        </div>
      </div>

      {erro ? (
        <p className="mt-8 rounded-campo bg-madeiraTint px-4 py-3 text-15 text-madeira">{erro}</p>
      ) : null} 

      <div className="mt-8"> 
        {/** 
        * Abaixo se encontram vários tenários encadeados
        * 
        * O mesmo código escrito em if / else para facilitar compreensão
        * 
        * if (carregando) {
        *   mostre "Carregando espécies..."
        * } else if (erro) {
        * não mostre nada (o erro já foi mostrado mais acima)
        * } else if (filtradas.length === 0) {
        * mostre o cartão de "nada encontrado"
        * } else {
        * mostre a contagem e a lista de cartões
        * }
        */}
        {carregando ? (
          <p className="text-16 text-cinza">Carregando espécies...</p>
        ) : erro ? null : filtradas.length === 0 ? (
          <Card>
            <p className="max-w-[60ch] text-16 text-cinza">
              {temFiltro
                ? "Nenhuma espécie encontrada com esses filtros. Tente outro nome ou outra família."
                : "O acervo ainda não tem espécies publicadas."}
            </p>
            {temFiltro ? (
              <div className="mt-4">
                <Botao variante="secundario" onClick={limparFiltros}>
                  Limpar filtros
                </Botao>
              </div>
            ) : null}
          </Card>
        ) : (
          <>
            <p className="text-14 text-cinzaMeta" aria-live="polite">
              {filtradas.length === 1
                ? "1 espécie encontrada"
                : `${filtradas.length} espécies encontradas`}
            </p>

            <ul className="mt-4 grid gap-4 sistema:grid-cols-3">
              {filtradas.map((especie) => (
                <li key={especie.id}>
                  <Card className="h-full">
                    {especie.fotoPrincipalUrl ? (
                      <img
                        src={especie.fotoPrincipalUrl}
                        alt={especie.nomeComum}
                        loading="lazy"
                        className="mb-4 h-40 w-full rounded-campo object-cover"
                      />
                    ) : (
                      <div
                        className="mb-4 h-40 rounded-campo bg-areiaEscura"
                        aria-hidden="true"
                      />
                    )}
                    <p className="rotulo-portal text-madeira">{especie.familia}</p>
                    <p className="mt-2 font-display text-24 tracking-titulo text-verdeEscuro">
                      {especie.nomeComum}
                    </p>
                    <p className="mt-1 text-14 italic text-cinzaMeta">{especie.nomeCientifico}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
    <RodapePublico />
    </div>
  );
}
