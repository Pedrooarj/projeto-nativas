type Props = {
  id: string;
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  tipo?: "text" | "email" | "senha" | "numero" | "data";
  placeholder?: string;
  obrigatorio?: boolean;
  multilinha?: boolean;
  mono?: boolean;
  ajuda?: string;
};

const tipoHtml = {
  text: "text",
  email: "email",
  senha: "password",
  numero: "number",
  data: "date",
} as const;

export function Campo({
  id,
  rotulo,
  valor,
  aoMudar,
  tipo = "text",
  placeholder,
  obrigatorio = false,
  multilinha = false,
  mono = false,
  ajuda,
}: Props) {
  const classesDoCampo = [
    "w-full rounded-campo border border-bordaForte bg-white px-4 py-3 text-16",
    "text-tinta placeholder:text-placeholder focus:border-verdeEscuro",
    mono ? "font-mono" : "",
    multilinha ? "min-h-[120px]" : "min-h-toque",
  ].join(" ");

  return (
    <div className="flex flex-col gap-2">
      {/* Todo campo tem label de verdade, não só placeholder. */}
      <label htmlFor={id} className="rotulo">
        {rotulo}
        {obrigatorio ? " *" : ""}
      </label>

      {multilinha ? (
        <textarea
          id={id}
          value={valor}
          onChange={(evento) => aoMudar(evento.target.value)}
          placeholder={placeholder}
          required={obrigatorio}
          className={classesDoCampo}
        />
      ) : (
        <input
          id={id}
          type={tipoHtml[tipo]}
          value={valor}
          onChange={(evento) => aoMudar(evento.target.value)}
          placeholder={placeholder}
          required={obrigatorio}
          className={classesDoCampo}
        />
      )}

      {ajuda ? <p className="text-13 text-cinza">{ajuda}</p> : null}
    </div>
  );
}
