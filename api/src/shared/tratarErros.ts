import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ErroApi } from "./erros";

export function tratarErros(
  erro: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (erro instanceof ZodError) {
    return res.status(422).json({
      erro: "validacao",
      mensagem: "Alguns campos precisam ser corrigidos.",
      detalhes: erro.issues.map((problema) => ({
        campo: problema.path.join("."),
        mensagem: problema.message,
      })),
    });
  }

  if (erro instanceof ErroApi) {
    return res.status(erro.status).json({
      erro: erro.erro,
      mensagem: erro.message,
      ...(erro.detalhes ? { detalhes: erro.detalhes } : {}),
    });
  }

  // P2002 = violação de UNIQUE. Acontece, por exemplo, com nome científico repetido.
  if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
    return res.status(409).json({
      erro: "conflito",
      mensagem: "Já existe um registro com este valor único.",
      detalhes: erro.meta,
    });
  }

  console.error(erro);
  return res.status(500).json({
    erro: "erro_interno",
    mensagem: "Algo deu errado no servidor. Tente de novo.",
  });
}
