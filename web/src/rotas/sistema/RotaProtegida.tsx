import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";

export function RotaProtegida({ children }: { children: ReactNode }) {
  const { usuario, carregando } = useAuth();

  // Enquanto o token guardado não foi conferido com a API, não decide nada:
  // redirecionar aqui jogaria para o login a cada refresh.
  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center text-15 text-cinza">
        Carregando...
      </div>
    );
  }

  if (!usuario) return <Navigate to="/sistema/login" replace />;

  return <>{children}</>;
}
