import { Router } from "express";
import { autenticar } from "../../shared/autenticar";
import { criarVisitaSchema } from "./visitas.schema";
import { criarVisita, listarVisitas } from "./visitas.service";

export const visitasRoutes = Router();

visitasRoutes.get("/", autenticar, async (_req, res, next) => {
  try {
    res.json(await listarVisitas());
  } catch (erro) {
    next(erro);
  }
});

visitasRoutes.post("/", autenticar, async (req, res, next) => {
  try {
    const dados = criarVisitaSchema.parse(req.body);
    res.status(201).json(await criarVisita(dados));
  } catch (erro) {
    next(erro);
  }
});
