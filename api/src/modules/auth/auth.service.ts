import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../shared/env";
import { ErroApi, naoEncontrado } from "../../shared/erros";
import { prisma } from "../../shared/prisma";
import type { DadosLogin } from "./auth.schema";

export type UsuarioPublico = {
  id: string;
  email: string;
  papel: "ADMIN" | "EQUIPE";
};

export async function login(dados: DadosLogin): Promise<{
  token: string;
  usuario: UsuarioPublico;
}> {
  const usuario = await prisma.usuario.findUnique({ where: { email: dados.email } });

  // Mesma mensagem para e-mail inexistente e senha errada: não conta a quem
  // tenta adivinhar qual das duas coisas ele acertou.
  const credenciaisInvalidas = new ErroApi(
    401,
    "credenciais_invalidas",
    "E-mail ou senha incorretos.",
  );

  if (!usuario || !usuario.ativo) throw credenciaisInvalidas;

  const senhaConfere = await bcrypt.compare(dados.senha, usuario.senhaHash);
  if (!senhaConfere) throw credenciaisInvalidas;

  const usuarioPublico: UsuarioPublico = {
    id: usuario.id,
    email: usuario.email,
    papel: usuario.papel,
  };

  const token = jwt.sign(usuarioPublico, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

  return { token, usuario: usuarioPublico };
}

export async function buscarUsuario(id: string): Promise<UsuarioPublico> {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) throw naoEncontrado("Usuário não encontrado.");

  return { id: usuario.id, email: usuario.email, papel: usuario.papel };
}
