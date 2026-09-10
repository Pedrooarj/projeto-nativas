import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "./env";
import { naoAutenticado, semPermissao } from "./erros";

export type UsuarioDoToken = {
  id: string;
  email: string;
  papel: "ADMIN" | "EQUIPE";
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: UsuarioDoToken;
    }
  }
}

export function autenticar(req: Request, _res: Response, next: NextFunction) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
    return next(naoAutenticado());
  }

  try {
    const token = cabecalho.slice("Bearer ".length);
    req.usuario = jwt.verify(token, env.JWT_SECRET) as UsuarioDoToken;
    return next();
  } catch {
    return next(naoAutenticado("Sessão expirada. Faça login de novo."));
  }
}

/**
 * RN-09: criar e editar espécies e listas é só do admin.
 * Lembrete: o token diz o que a pessoa PODE fazer, nunca QUEM registrou (RN-06).
 */
export function exigirAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.usuario) return next(naoAutenticado());
  if (req.usuario.papel !== "ADMIN") return next(semPermissao());
  return next();
}
