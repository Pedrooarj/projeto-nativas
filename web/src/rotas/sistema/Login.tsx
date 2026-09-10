import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Botao } from "../../componentes/ui/Botao";
import { Campo } from "../../componentes/ui/Campo";
import { ErroDaApi } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export function Login() {
  const { usuario, entrar } = useAuth();
  const navegar = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/sistema" replace />;

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      await entrar(email, senha);
      navegar("/sistema");
    } catch (problema) {
      setErro(
        problema instanceof ErroDaApi ? problema.message : "Não consegui entrar. Tente de novo.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-areia px-5 py-12">
      <div className="w-full max-w-[420px]">
        <img
          src="/marca/logo-verde.svg"
          alt="Projeto Nativas"
          role="img"
          className="mx-auto h-10 w-auto"
        />

        <div className="mt-8 rounded-cartao border border-borda bg-white p-6">
          <h1 className="text-24">Entrar no sistema</h1>
          <p className="mt-2 text-15 text-cinza">
            A equipe do viveiro usa uma conta compartilhada. Quem registrou cada coisa é escolhido
            depois, dentro de cada formulário.
          </p>

          <form onSubmit={aoEnviar} className="mt-6 flex flex-col gap-5">
            <Campo
              id="email"
              rotulo="E-mail"
              tipo="email"
              valor={email}
              aoMudar={setEmail}
              obrigatorio
              placeholder="equipe@nativas.ufrn.br"
            />

            <Campo
              id="senha"
              rotulo="Senha"
              tipo="senha"
              valor={senha}
              aoMudar={setSenha}
              obrigatorio
            />

            {/* Erro em bloco madeiraTint, acima do botão de salvar. */}
            {erro ? (
              <p className="rounded-campo bg-madeiraTint px-4 py-3 text-15 text-madeira">{erro}</p>
            ) : null}

            <Botao type="submit" larguraTotal desabilitado={enviando}>
              {enviando ? "Entrando..." : "Entrar"}
            </Botao>
          </form>
        </div>

        <p className="mt-6 text-center text-15">
          <Link to="/" className="text-verdeEscuro underline">
            Voltar ao portal
          </Link>
        </p>
      </div>
    </div>
  );
}
