import { Card } from "./Card";

type Props = {
    titulo: string;
    descricao: string;

};

export function CardAcao({ titulo, descricao}: Props) {
    return (
        <Card>
            <p className="text-18 text-verdeEscuro">{titulo}</p>
            <p className="mt-1 text-14 text-cinzaMeta">{descricao}</p>
        </Card>
    )
}