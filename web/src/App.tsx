import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { ProvedorDeAuth } from "./lib/auth";
import { Acervo } from "./rotas/publicas/Acervo";
import { EspeciePublica } from "./rotas/publicas/EspeciePublica";
import { Portal } from "./rotas/publicas/Portal";
import { EmConstrucao } from "./rotas/sistema/EmConstrucao";
import { Especies } from "./rotas/sistema/Especies";
import { LayoutSistema } from "./rotas/sistema/LayoutSistema";
import { Login } from "./rotas/sistema/Login";
import { RotaProtegida } from "./rotas/sistema/RotaProtegida";
import { VisaoGeral } from "./rotas/sistema/VisaoGeral";

export function App() {
  return (
    <BrowserRouter>
      <ProvedorDeAuth>
        <Routes>
          <Route path="/" element={<Portal />} />
          <Route path="/acervo" element={<Acervo />} />
          <Route path="/acervo/:id" element={<EspeciePublica />} />

          <Route path="/sistema/login" element={<Login />} />

          <Route
            path="/sistema"
            element={
              <RotaProtegida>
                <LayoutSistema />
              </RotaProtegida>
            }
          >
            <Route index element={<VisaoGeral />} />
            <Route path="especies" element={<Especies />} />
            <Route
              path="coletas"
              element={
                <EmConstrucao
                  nome="Banco de sementes"
                  descricao="Lista das coletas com o saldo de sementes de cada uma, e o formulário de registrar coleta com a coordenada da matriz. Depende de GET e POST /coletas."
                />
              }
            />
            <Route
              path="lotes"
              element={
                <EmConstrucao
                  nome="Lotes"
                  descricao="Quadro com três colunas (Etapa 1, Etapa 2 e Destino final), cadastro de lote com etiqueta automática, avançar etapa e registrar destino final. Depende de GET /lotes/quadro, POST /lotes, POST /lotes/:id/transicao e POST /lotes/:id/destino."
                />
              }
            />
            <Route
              path="visitas"
              element={
                <EmConstrucao
                  nome="Visitas"
                  descricao="Registro simples de visita (data, instituição, número de pessoas) que alimenta o quarto contador do portal. Depende de GET e POST /visitas."
                />
              }
            />
            <Route
              path="configuracoes"
              element={
                <EmConstrucao
                  nome="Configuracoes"
                  descricao="Listas de colaboradores e de substratos, editáveis pelo admin. Depende dos endpoints de substratos e da escrita em colaboradores."
                />
              }
            />
          </Route>

          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </ProvedorDeAuth>
    </BrowserRouter>
  );
}

function NaoEncontrada() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
      <h1 className="text-30">Esta pagina nao existe</h1>
      <Link to="/" className="text-16 text-verdeEscuro underline">
        Voltar ao portal
      </Link>
    </div>
  );
}
