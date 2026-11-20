import { Router } from "express";
import { buscarEspeciePublica, listarEspeciesPublicas } from "./acervo.service";
import { obterMapa } from "./mapa.service";
import { obterMetricas } from "./publico.service";

// Sem autenticação: é o que o portal consome. Nenhum endpoint público expõe
// nome de colaborador — essa é a fronteira de privacidade do sistema.
export const publicoRoutes = Router();

publicoRoutes.get("/metricas", async (_req, res, next) => {
  try {
    res.json(await obterMetricas());
  } catch (erro) {
    next(erro);
  }
});

publicoRoutes.get("/especies", async (_req, res, next) => {
  try {
    res.json(await listarEspeciesPublicas());
  } catch (erro) {
    next(erro);
  }
});

publicoRoutes.get("/especies/:id", async (req, res, next) => {
  try {
    res.json(await buscarEspeciePublica(req.params.id));
  } catch (erro) {
    next(erro);
  }
});

publicoRoutes.get("/mapa", async (_req, res, next) => {
  try {
    res.json(await obterMapa());
  } catch (erro) {
    next(erro);
  }
});
