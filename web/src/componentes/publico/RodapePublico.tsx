import { Link } from "react-router-dom";

/** Rodapé curto das páginas públicas internas, como no protótipo. */
export function RodapePublico() {
  return (
    <footer className="bg-verdeEscuro">
      <div className="mx-auto flex max-w-conteudo flex-wrap items-center justify-between gap-4 px-5 py-6">
        <p className="font-mono text-12 text-verdeClaro">© 2026 Projeto Nativas · CERES/UFRN</p>
        <Link to="/" className="font-mono text-12 text-areia hover:underline">
          Voltar ao início
        </Link>
      </div>
    </footer>
  );
}
