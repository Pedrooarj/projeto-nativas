import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Cabeçalho das páginas públicas internas (acervo e página da espécie), igual
 * ao do protótipo: logo, as âncoras do portal e os atalhos "Início" e "Entrar".
 * O portal (/) ainda usa o cabeçalho próprio em Portal.tsx; unificar depois que
 * o PR #49 entrar, para não conflitar com ele.
 */
const ancoras = [
  { id: "sobre", texto: "Sobre" },
  { id: "acoes", texto: "Ações" },
  { id: "contadores", texto: "Números" },
  { id: "acervo", texto: "Acervo" },
  { id: "mapa", texto: "Mapa" },
  { id: "parceiros", texto: "Parceiros" },
];

type Props = {
  /** Âncora destacada na navegação (ex.: "acervo"). */
  ativa?: string;
  /** Link de volta mostrado à direita. */
  voltar?: { para: string; texto: string };
};

export function CabecalhoPublico({ ativa, voltar = { para: "/", texto: "Início" } }: Props) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-borda bg-areia/95 backdrop-blur">
      <div className="mx-auto flex max-w-conteudo items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/marca/logo-verde.svg" alt="Projeto Nativas" role="img" className="h-9 w-auto" />
        </Link>

        <nav aria-label="Seções do portal" className="hidden items-center gap-6 sistema:flex">
          {ancoras.map((ancora) => (
            <a
              key={ancora.id}
              href={`/#${ancora.id}`}
              aria-current={ativa === ancora.id ? "page" : undefined}
              className={
                ativa === ancora.id
                  ? "border-b-2 border-verde pb-0.5 text-15 text-verdeEscuro"
                  : "text-15 text-verdeEscuro hover:underline"
              }
            >
              {ancora.texto}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to={voltar.para} className="hidden text-15 text-verdeEscuro hover:underline sistema:inline">
            &larr; {voltar.texto}
          </Link>
          <Link
            to="/sistema"
            className="inline-flex min-h-toque items-center rounded-botao border border-verdeEscuro px-4 text-15 text-verdeEscuro hover:bg-areiaEscura"
          >
            Entrar
          </Link>
          <button
            type="button"
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            aria-controls="menu-publico"
            onClick={() => setMenuAberto(!menuAberto)}
            className="min-h-toque min-w-toque rounded-botao border border-bordaForte text-verdeEscuro sistema:hidden"
          >
            ≡
          </button>
        </div>
      </div>

      {menuAberto && (
        <nav id="menu-publico" aria-label="Seções do portal" className="bg-verdeTinta px-5 py-4 sistema:hidden">
          <ul className="mx-auto flex max-w-conteudo flex-col">
            <li>
              <Link to={voltar.para} className="block py-3 text-16 text-areia hover:underline">
                &larr; {voltar.texto}
              </Link>
            </li>
            {ancoras.map((ancora) => (
              <li key={ancora.id}>
                <a href={`/#${ancora.id}`} className="block py-3 text-16 text-areia hover:underline">
                  {ancora.texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
