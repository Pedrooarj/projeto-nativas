import { Router } from "express";
import { autenticar } from "../../shared/autenticar";
import { listarColaboradoresAtivos } from "./colaboradores.service";

export const colaboradoresRoutes = Router();

colaboradoresRoutes.get("/", autenticar, async (_req, res, next) => {
  try {
    res.json(await listarColaboradoresAtivos());
  } catch (erro) {
    next(erro);
  }
});
