import { Router } from "express";
import { autenticar, exigirAdmin } from "../../shared/autenticar";
import {
  atualizarEspecieSchema,
  criarEspecieSchema,
  listarEspeciesQuerySchema,
} from "./especies.schema";
import {
  atualizarEspecie,
  buscarEspecie,
  criarEspecie,
  listarEspecies,
} from "./especies.service";

export const especiesRoutes = Router();

especiesRoutes.get("/", autenticar, async (req, res, next) => {
  try {
    const { busca } = listarEspeciesQuerySchema.parse(req.query);
    res.json(await listarEspecies(busca));
  } catch (erro) {
    next(erro);
  }
});

especiesRoutes.get("/:id", autenticar, async (req, res, next) => {
  try {
    res.json(await buscarEspecie(req.params.id));
  } catch (erro) {
    next(erro);
  }
});

especiesRoutes.post("/", autenticar, exigirAdmin, async (req, res, next) => {
  try {
    const dados = criarEspecieSchema.parse(req.body);
    res.status(201).json(await criarEspecie(dados));
  } catch (erro) {
    next(erro);
  }
});

especiesRoutes.patch("/:id", autenticar, exigirAdmin, async (req, res, next) => {
  try {
    const dados = atualizarEspecieSchema.parse(req.body);
    res.json(await atualizarEspecie(req.params.id, dados));
  } catch (erro) {
    next(erro);
  }
});
