import { Link, useParams } from "react-router-dom";
import { Card } from "../../componentes/ui/Card";

/**
 * PLACEHOLDER — tela reservada para a equipe (ver docs/escopo.md).
 *
 * Duas partes quando ficar pronta: as informações botânicas preenchidas pela
 * coordenação e os números que o projeto já fez com a espécie (RN-08),
 * calculados pela API em GET /publico/especies/:id.
 */
export function EspeciePublica() {
  const { id } = useParams();

  return (
    <main className="mx-auto max-w-conteudo px-5 py-16">
      <Link to="/acervo" className="text-15 text-verdeEscuro hover:underline">
        &larr; Voltar ao acervo
      </Link>

      <p className="rotulo-portal mt-8 text-madeira">Espécie</p>
      <h1 className="mt-4 text-subtitulo">Página da espécie</h1>
      <p className="etiqueta mt-2 text-cinzaMeta">id: {id}</p>

      <Card className="mt-8 border-dashed">
        <p className="rotulo">Em construção</p>
        <p className="mt-3 max-w-[70ch] text-16 text-cinza">
          Informações botânicas, galeria e os números do projeto para esta espécie. É aqui que
          entram as TAREFAS 6 e 7 de docs/aprendendo-react.md.
        </p>
      </Card>
    </main>
  );
}
