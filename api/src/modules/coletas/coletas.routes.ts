import { Router } from "express";
import { autenticar } from "../../shared/autenticar";
import { criarColetaSchema, listarColetasQuerySchema } from "./coletas.schema";
import { criarColeta, listarColetas } from "./coletas.service";

export const coletasRoutes = Router();

coletasRoutes.get("/", autenticar, async (req, res, next) => {
  try {
    const { especieId } = listarColetasQuerySchema.parse(req.query);
    res.json(await listarColetas(especieId));
  } catch (erro) {
    next(erro);
  }
});

coletasRoutes.post("/", autenticar, async (req, res, next) => {
  try {
    const dados = criarColetaSchema.parse(req.body);
    res.status(201).json(await criarColeta(dados));
  } catch (erro) {
    next(erro);
  }
});
