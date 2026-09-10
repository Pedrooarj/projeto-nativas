import { Router } from "express";
import rateLimit from "express-rate-limit";
import { autenticar } from "../../shared/autenticar";
import { loginSchema } from "./auth.schema";
import { buscarUsuario, login } from "./auth.service";

// 5 tentativas por minuto por IP.
const limiteDeLogin = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    erro: "muitas_tentativas",
    mensagem: "Muitas tentativas de login. Espere um minuto e tente de novo.",
  },
});

export const authRoutes = Router();

authRoutes.post("/login", limiteDeLogin, async (req, res, next) => {
  try {
    const dados = loginSchema.parse(req.body);
    res.json(await login(dados));
  } catch (erro) {
    next(erro);
  }
});

authRoutes.get("/eu", autenticar, async (req, res, next) => {
  try {
    res.json(await buscarUsuario(req.usuario!.id));
  } catch (erro) {
    next(erro);
  }
});
