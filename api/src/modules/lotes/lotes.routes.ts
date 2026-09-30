import { Router } from "express";
import { autenticar } from "../../shared/autenticar";
import { criarLoteSchema } from "./lotes.schema";
import { criarLote } from "./lotes.service";

export const lotesRoutes = Router();

lotesRoutes.post("/", autenticar, async (req, res, next) => {
  try {
    const dados = criarLoteSchema.parse(req.body);
    res.status(201).json(await criarLote(dados));
  } catch (erro) {
    next(erro);
  }
});
