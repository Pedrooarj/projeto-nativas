import type { ReactNode } from "react";

type Cor = "broto" | "verde" | "madeira" | "azul" | "cinza";

type Props = {
  children: ReactNode;
  cor?: Cor;
};

const porCor: Record<Cor, string> = {
  broto: "bg-broto text-verdeEscuro border-[#B5C48A]",
  verde: "bg-verde text-verdeTinta border-verde",
  madeira: "bg-madeiraTint text-madeira border-madeiraTint",
  azul: "bg-azulTint text-azul border-azulTint",
  cinza: "bg-areiaEscura text-cinza border-borda",
};

export function Badge({ children, cor = "broto" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-11 uppercase tracking-rotulo ${porCor[cor]}`}
    >
      {children}
    </span>
  );
}
