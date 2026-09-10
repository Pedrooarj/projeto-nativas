import { Router } from "express";
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
