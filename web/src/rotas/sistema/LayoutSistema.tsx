import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../lib/auth";

const itensDeNavegacao = [
  { para: "/sistema", texto: "Visão geral", fim: true },
  { para: "/sistema/coletas", texto: "Sementes", fim: false },
  { para: "/sistema/lotes", texto: "Lotes", fim: false },
  { para: "/sistema/especies", texto: "Espécies", fim: false },
  { para: "/sistema/visitas", texto: "Visitas", fim: false },
  { para: "/sistema/configuracoes", texto: "Ajustes", fim: false },
];

/**
 * Navegação inferior fixa no celular, sidebar de 236px a partir de 900px.
 * A sidebar usa o verde da marca com texto verdeTinta — nunca branco.
 */
export function LayoutSistema() {
  const { usuario, sair } = useAuth();

  return (
    <div className="min-h-screen bg-areia sistema:flex">
      <aside className="hidden w-sidebar shrink-0 flex-col justify-between bg-verde px-5 py-6 sistema:flex">
        <div>
          <img
            src="/marca/logo-preto.svg"
            alt="Projeto Nativas"
            role="img"
            className="h-9 w-auto"
          />

          <nav aria-label="Telas do sistema" className="mt-8 flex flex-col gap-1">
            {itensDeNavegacao.map((item) => (
              <NavLink
                key={item.para}
                to={item.para}
                end={item.fim}
                className={({ isActive }) =>
                  [
                    "flex min-h-toque items-center rounded-botao px-3 text-16 text-verdeTinta",
                    isActive ? "bg-verdeTinta/15" : "hover:bg-verdeTinta/10",
                  ].join(" ")
                }
              >
                {item.texto}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 text-verdeTinta">
          <p className="font-mono text-11 uppercase tracking-rotulo">{usuario?.papel}</p>
          <p className="text-14">{usuario?.email}</p>
          <button
            type="button"
            onClick={sair}
            className="min-h-toque rounded-botao border border-verdeTinta/30 text-15 text-verdeTinta hover:bg-verdeTinta/10"
          >
            Sair
          </button>
          <Link to="/" className="text-14 text-verdeTinta underline">
            Voltar ao portal
          </Link>
        </div>
      </aside>

      <div className="flex-1 pb-24 sistema:pb-0">
        <header className="flex items-center justify-between border-b border-borda bg-white px-5 py-4 sistema:hidden">
          <img src="/marca/logo-verde.svg" alt="Projeto Nativas" role="img" className="h-8 w-auto" />
          <div className="flex items-center gap-3">
            <Link to="/" className="text-14 text-verdeEscuro underline">
              Portal
            </Link>
            <button type="button" onClick={sair} className="text-14 text-verdeEscuro underline">
              Sair
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-conteudo px-5 py-6 sistema:py-10">
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Telas do sistema"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-borda bg-white sistema:hidden"
      >
        {itensDeNavegacao.map((item) => (
          <NavLink
            key={item.para}
            to={item.para}
            end={item.fim}
            className={({ isActive }) =>
              [
                "flex min-h-toque flex-col items-center justify-center px-1 py-2 text-center font-mono text-11 uppercase tracking-rotulo",
                isActive ? "text-verdeEscuro" : "text-cinza",
              ].join(" ")
            }
          >
            {item.texto}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
