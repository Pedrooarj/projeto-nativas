import cors from "cors";
import express from "express";
import helmet from "helmet";
import { authRoutes } from "./modules/auth/auth.routes";
import { colaboradoresRoutes } from "./modules/colaboradores/colaboradores.routes";
import { especiesRoutes } from "./modules/especies/especies.routes";
import { publicoRoutes } from "./modules/publico/publico.routes";
import { env } from "./shared/env";
import { naoEncontrado } from "./shared/erros";
import { tratarErros } from "./shared/tratarErros";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", agora: new Date().toISOString() });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/colaboradores", colaboradoresRoutes);
app.use("/api/v1/especies", especiesRoutes);
app.use("/api/v1/publico", publicoRoutes);

app.use((req, _res, next) => {
  next(naoEncontrado(`Rota ${req.method} ${req.path} não existe nesta API.`));
});

// Precisa ser o último: é ele que garante o formato { erro, mensagem, detalhes? }.
app.use(tratarErros);
