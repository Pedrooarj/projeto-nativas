import { Router } from "express";
import { autenticar } from "../../shared/autenticar";
import { listarSubstratosAtivos } from "./substratos.service";

export const substratosRoutes = Router();

substratosRoutes.get("/", autenticar, async (_req, res, next) => {
  try {
    res.json(await listarSubstratosAtivos());
  } catch (erro) {
    next(erro);
  }
});
