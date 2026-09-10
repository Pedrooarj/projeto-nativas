import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

// Cartão branco com borda de 1px e sem sombra em repouso.
export function Card({ children, className = "" }: Props) {
  return (
    <div className={`rounded-cartao border border-borda bg-white p-5 ${className}`}>
      {children}
    </div>
  );
}
