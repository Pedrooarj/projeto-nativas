import { Link } from "react-router-dom";
import { Card } from "../../componentes/ui/Card";

/**
 * PLACEHOLDER — tela reservada para a equipe (ver docs/escopo.md).
 *
 * O que falta: lista com busca por nome, filtro por família e cartão por
 * espécie, consumindo GET /publico/especies.
 */
export function Acervo() {
  return (
    <main className="mx-auto max-w-conteudo px-5 py-16">
      <Link to="/" className="text-15 text-verdeEscuro hover:underline">
        &larr; Voltar ao portal
      </Link>

      <p className="rotulo-portal mt-8 text-madeira">Acervo</p>
      <h1 className="mt-4 text-subtitulo">Espécies da Caatinga</h1>

      <Card className="mt-8 border-dashed">
        <p className="rotulo">Em construção</p>
        <p className="mt-3 max-w-[70ch] text-16 text-cinza">
          Lista do acervo com busca por nome e filtro por família. Depende do endpoint
          GET /publico/especies, que ainda vai ser construído.
        </p>
      </Card>
    </main>
  );
}
