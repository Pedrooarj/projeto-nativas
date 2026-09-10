import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  apagarToken,
  buscarUsuarioLogado,
  entrar as entrarNaApi,
  guardarToken,
  lerToken,
  type Usuario,
} from "./api";

/**
 * Contexto de autenticacao.
 *
 * O token fica no localStorage para a sessão sobreviver ao refresh — o pessoal
 * do viveiro usa o celular e não vai digitar senha a cada tela.
 *
 * Lembrete de RN-06: o usuário logado diz o que a pessoa PODE fazer. Quem
 * registrou cada coisa vem do campo "quem está registrando" do formulário,
 * nunca daqui.
 */

type ContextoDeAuth = {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => void;
};

const Contexto = createContext<ContextoDeAuth | null>(null);

export function ProvedorDeAuth({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!lerToken()) {
      setCarregando(false);
      return;
    }

    // Confere com a API se o token guardado ainda vale.
    buscarUsuarioLogado()
      .then(setUsuario)
      .catch(() => apagarToken())
      .finally(() => setCarregando(false));
  }, []);

  async function entrar(email: string, senha: string) {
    const resposta = await entrarNaApi(email, senha);
    guardarToken(resposta.token);
    setUsuario(resposta.usuario);
  }

  function sair() {
    apagarToken();
    setUsuario(null);
  }

  return (
    <Contexto.Provider value={{ usuario, carregando, entrar, sair }}>
      {children}
    </Contexto.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useAuth precisa estar dentro de <ProvedorDeAuth>.");
  return contexto;
}
