import type { ReactNode } from "react";

type Variante = "primario" | "secundario" | "azul";

type Props = {
  children: ReactNode;
  variante?: Variante;
  type?: "button" | "submit";
  onClick?: () => void;
  desabilitado?: boolean;
  larguraTotal?: boolean;
};

// Texto sobre o verde da marca é verdeTinta, nunca branco (regra de contraste).
const porVariante: Record<Variante, string> = {
  primario: "bg-verde text-verdeTinta hover:bg-verdeHover",
  secundario: "bg-white text-verdeEscuro border border-bordaForte hover:bg-areiaEscura",
  azul: "bg-azul text-white hover:bg-azulHover",
};

export function Botao({
  children,
  variante = "primario",
  type = "button",
  onClick,
  desabilitado = false,
  larguraTotal = false,
}: Props) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-botao px-5 text-17",
    "min-h-toque transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    porVariante[variante],
    larguraTotal ? "w-full min-h-[56px]" : "",
  ].join(" ");

  return (
    <button type={type} onClick={onClick} disabled={desabilitado} className={classes}>
      {children}
    </button>
  );
}
