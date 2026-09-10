type Opcao = {
  valor: string;
  rotulo: string;
};

type Props = {
  id: string;
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  opcoes: Opcao[];
  textoVazio?: string;
  obrigatorio?: boolean;
};

export function Select({
  id,
  rotulo,
  valor,
  aoMudar,
  opcoes,
  textoVazio = "Escolha uma opção",
  obrigatorio = false,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="rotulo">
        {rotulo}
        {obrigatorio ? " *" : ""}
      </label>

      <select
        id={id}
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        required={obrigatorio}
        className="min-h-toque w-full rounded-campo border border-bordaForte bg-white px-4 py-3 text-16 text-tinta focus:border-verdeEscuro"
      >
        <option value="">{textoVazio}</option>
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
    </div>
  );
}
