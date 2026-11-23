import { Router } from "express";
import { autenticar } from "../../shared/autenticar";
import { criarLoteSchema, destinoSchema, transicaoSchema } from "./lotes.schema";
import {
  buscarLote,
  criarLote,
  obterQuadro,
  registrarDestino,
  transicionarLote,
} from "./lotes.service";

export const lotesRoutes = Router();

lotesRoutes.post("/", autenticar, async (req, res, next) => {
  try {
    const dados = criarLoteSchema.parse(req.body);
    res.status(201).json(await criarLote(dados));
  } catch (erro) {
    next(erro);
  }
});

// Precisa vir antes de /:id, senão "quadro" vira um id.
lotesRoutes.get("/quadro", autenticar, async (_req, res, next) => {
  try {
    res.json(await obterQuadro());
  } catch (erro) {
    next(erro);
  }
});

lotesRoutes.get("/:id", autenticar, async (req, res, next) => {
  try {
    res.json(await buscarLote(req.params.id));
  } catch (erro) {
    next(erro);
  }
});

lotesRoutes.post("/:id/transicao", autenticar, async (req, res, next) => {
  try {
    const dados = transicaoSchema.parse(req.body);
    res.json(await transicionarLote(req.params.id, dados));
  } catch (erro) {
    next(erro);
  }
});

lotesRoutes.post("/:id/destino", autenticar, async (req, res, next) => {
  try {
    const dados = destinoSchema.parse(req.body);
    res.status(201).json(await registrarDestino(req.params.id, dados));
  } catch (erro) {
    next(erro);
  }
});
