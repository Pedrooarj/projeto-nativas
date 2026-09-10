import { useEffect, type ReactNode } from "react";

type Props = {
  aberto: boolean;
  titulo: string;
  aoFechar: () => void;
  children: ReactNode;
  rodape?: ReactNode;
};

/**
 * No celular sobe como folha inferior (raio 20px no topo); a partir de 900px
 * vira um cartão centralizado.
 */
export function Modal({ aberto, titulo, aoFechar, children, rodape }: Props) {
  useEffect(() => {
    if (!aberto) return;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") aoFechar();
    }

    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-verdeTinta/50 sistema:items-center"
      onClick={aoFechar}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(evento) => evento.stopPropagation()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-folha bg-white sistema:max-w-[560px] sistema:rounded-cartao"
      >
        <div className="flex items-center justify-between border-b border-borda px-5 py-4">
          <h2 className="text-18 text-verdeEscuro">{titulo}</h2>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="min-h-toque min-w-toque rounded-campo text-24 text-cinza hover:bg-areiaEscura"
          >
            &times;
          </button>
        </div>

        <div className="px-5 py-5">{children}</div>

        {rodape ? <div className="border-t border-borda px-5 py-4">{rodape}</div> : null}
      </div>
    </div>
  );
}
