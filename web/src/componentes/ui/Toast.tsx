type Props = {
  mensagem: string;
  tipo?: "sucesso" | "erro";
  aoFechar: () => void;
};

/**
 * Confirmação curta de ação. Não some sozinho: quem registra no viveiro precisa
 * ter certeza do que salvou antes de guardar o celular.
 */
export function Toast({ mensagem, tipo = "sucesso", aoFechar }: Props) {
  const cores =
    tipo === "sucesso"
      ? "bg-broto border-[#B5C48A] text-verdeEscuro"
      : "bg-madeiraTint border-madeira text-madeira";

  return (
    <div
      role="status"
      className={`fixed inset-x-4 bottom-24 z-50 flex items-center justify-between gap-4 rounded-cartao border px-4 py-3 text-15 sistema:inset-x-auto sistema:bottom-6 sistema:right-6 sistema:max-w-[420px] ${cores}`}
    >
      <span>{mensagem}</span>
      <button
        type="button"
        onClick={aoFechar}
        aria-label="Fechar aviso"
        className="min-h-[32px] min-w-[32px] rounded-campo text-18"
      >
        &times;
      </button>
    </div>
  );
}
