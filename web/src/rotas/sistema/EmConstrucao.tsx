import { Card } from "../../componentes/ui/Card";

type Props = {
  nome: string;
  descricao: string;
};

/** Tela reservada para a equipe. O que cada uma precisa fazer está em docs/escopo.md. */
export function EmConstrucao({ nome, descricao }: Props) {
  return (
    <div>
      <p className="rotulo">Sistema do viveiro</p>
      <h1 className="mt-3 text-30">{nome}</h1>

      <Card className="mt-6 border-dashed">
        <p className="rotulo">Em construção</p>
        <p className="mt-3 max-w-[70ch] text-16 text-cinza">{descricao}</p>
      </Card>
    </div>
  );
}
