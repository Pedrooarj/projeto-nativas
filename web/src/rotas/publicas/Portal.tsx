import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { buscarMetricas, ErroDaApi, type Metricas } from "../../lib/api";
import { Botao } from "../../componentes/ui/Botao";
import { Card } from "../../componentes/ui/Card";

const CAICO: [number, number] = [-6.4578, -37.0977];

const ancoras = [
  { id: "sobre", texto: "Sobre" },
  { id: "acoes", texto: "Ações" },
  { id: "contadores", texto: "Números" },
  { id: "acervo", texto: "Acervo" },
  { id: "parceiros", texto: "Parceiros" },
  { id: "mapa", texto: "Mapa" },
];

export function Portal() {
  return (
    <div className="min-h-screen bg-areia">
      <Cabecalho />
      <main>
        <Inicio />
        <Sobre />
        <Acoes />
        <Contadores />
        <AcervoEmDestaque />
        <Parceiros />
        <Mapa />
      </main>
      <Rodape />
    </div>
  );
}

function Cabecalho() {
  return (
    <header className="sticky top-0 z-40 border-b border-borda bg-areia/95 backdrop-blur">
      <div className="mx-auto flex max-w-conteudo items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/marca/logo-verde.svg"
            alt="Projeto Nativas"
            role="img"
            className="h-9 w-auto"
          />
          <span className="sr-only">Projeto Nativas</span>
        </Link>

        <nav aria-label="Seções do portal" className="hidden items-center gap-6 sistema:flex">
          {ancoras.map((ancora) => (
            <a
              key={ancora.id}
              href={`#${ancora.id}`}
              className="text-15 text-verdeEscuro hover:underline"
            >
              {ancora.texto}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* TAREFA 5 de docs/aprendendo-react.md: transformar este botão no menu
              mobile de verdade, com useState. Hoje ele não abre nada. */}
          <button
            type="button"
            aria-label="Abrir menu"
            className="min-h-toque min-w-toque rounded-botao border border-bordaForte text-verdeEscuro sistema:hidden"
          >
            ≡
          </button>

          <Link to="/sistema">
            <Botao variante="primario">Entrar no sistema</Botao>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Inicio() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      {/* Marca d'água do elemento radial da marca, a 14% como manda o design. */}
      <img
        src="/marca/el-05.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 w-[420px] opacity-[0.14]"
      />

      <div className="relative mx-auto max-w-conteudo px-5 py-20 sistema:py-28">
        <p className="rotulo-portal text-madeira">Projeto de extensão · CERES/UFRN · Caicó-RN</p>

        <h1 className="mt-5 max-w-[16ch] text-titulo tracking-tituloForte text-verdeEscuro">
          Natureza viva e forte
        </h1>

        <p className="mt-6 max-w-[52ch] text-18 text-tintaCard">
          Agir agroecológico para a sustentabilidade na Caatinga. Coletamos sementes de espécies
          nativas, produzimos mudas no viveiro e replantamos na região do Seridó.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#acervo">
            <Botao variante="primario">Conhecer as espécies</Botao>
          </a>
          <a href="#contadores">
            <Botao variante="secundario">Ver os números</Botao>
          </a>
        </div>
      </div>
    </section>
  );
}

function Sobre() {
  return (
    <SecaoPlaceholder
      id="sobre"
      sobretitulo="Sobre"
      titulo="Quem faz o Projeto Nativas"
      descricao="Seção reservada para a TAREFA 2 de docs/aprendendo-react.md: montar aqui o texto sobre o projeto, a UFRN, o CERES, a EMCM e os voluntários, usando classes do Tailwind."
    />
  );
}

function Acoes() {
  return (
    <SecaoPlaceholder
      id="acoes"
      sobretitulo="Nossas ações"
      titulo="O que o projeto faz"
      descricao="Seção reservada para as TAREFAS 3 e 4 de docs/aprendendo-react.md: criar o componente CardAcao recebendo props e renderizar as sete ações (coleta, produção de mudas, manejo, compostagem, mutirões, plantios e visitas) com .map()."
    />
  );
}

/**
 * Os quatro contadores do portal — RN-07.
 *
 * Esta é a seção que prova que o portal e o sistema são o mesmo dado: os
 * números vêm de GET /publico/metricas, calculados dos registros reais do
 * viveiro. Ninguém edita número aqui.
 */
function Contadores() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarMetricas()
      .then(setMetricas)
      .catch((problema: ErroDaApi) => setErro(problema.message));
  }, []);

  const itens = [
    { rotulo: "Sementes coletadas", valor: metricas?.sementesColetadas },
    { rotulo: "Mudas no viveiro", valor: metricas?.mudasNoViveiro },
    { rotulo: "Plantios definitivos", valor: metricas?.plantiosDefinitivos },
    { rotulo: "Visitas recebidas", valor: metricas?.visitasRecebidas },
  ];

  return (
    <section id="contadores" className="relative overflow-hidden bg-verdeEscuro">
      <img
        src="/marca/el-05.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 bottom-[-80px] w-[380px] opacity-[0.14]"
      />

      <div className="relative mx-auto max-w-conteudo px-5 py-20">
        <p className="rotulo-portal text-verdeClaro">Números do projeto</p>
        <h2 className="mt-4 text-subtitulo text-areia">Tudo o que está aqui foi registrado no viveiro</h2>

        {erro ? (
          <p className="mt-8 rounded-cartao bg-madeiraTint px-4 py-3 text-15 text-madeira">
            Não consegui carregar os números agora: {erro}
          </p>
        ) : null}

        <div className="mt-10 grid grid-cols-2 gap-4 sistema:grid-cols-4 sistema:gap-6">
          {itens.map((item) => (
            <div key={item.rotulo}>
              <p className="font-display text-30 tracking-tituloForte text-areia sistema:text-[44px]">
                {item.valor === undefined ? "—" : item.valor.toLocaleString("pt-BR")}
              </p>
              <p className="mt-2 font-mono text-12 uppercase tracking-rotuloPortal text-verdePalido">
                {item.rotulo}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AcervoEmDestaque() {
  return (
    <section id="acervo" className="mx-auto max-w-conteudo px-5 py-20">
      <p className="rotulo-portal text-madeira">Acervo</p>
      <h2 className="mt-4 text-subtitulo">As espécies que cultivamos</h2>
      <p className="mt-4 max-w-[60ch] text-17 text-tintaCard">
        Cada espécie tem uma página com as informações botânicas e com o que o projeto já fez com
        ela: coletas, mudas produzidas e plantios.
      </p>

      <div className="mt-8 grid gap-4 sistema:grid-cols-3">
        {["Angico", "Mandacaru", "Umbuzeiro"].map((nome) => (
          <Card key={nome}>
            <div className="mb-4 h-32 rounded-campo bg-areiaEscura" aria-hidden="true" />
            <p className="rotulo">Espécie</p>
            <p className="mt-2 text-18 text-verdeEscuro">{nome}</p>
            <p className="mt-1 text-14 text-cinzaMeta">
              Cartão de exemplo. O acervo de verdade entra com GET /publico/especies.
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Link to="/acervo">
          <Botao variante="secundario">Ver o acervo completo</Botao>
        </Link>
      </div>
    </section>
  );
}

function Parceiros() {
  const parceiros = [
    "Arboriza Caicó",
    "Ilha Zero",
    "Sabugi Ambiental",
    "Café nos Matos",
    "UFRN",
    "CERES",
    "DMA",
    "PROEX",
  ];

  return (
    <section id="parceiros" className="border-y border-borda bg-areiaEscura">
      <div className="mx-auto max-w-conteudo px-5 py-16">
        <p className="rotulo-portal text-madeira">Parceiros</p>
        <h2 className="mt-4 text-subtitulo">Quem caminha junto</h2>

        <ul className="mt-8 grid grid-cols-2 gap-4 sistema:grid-cols-4">
          {parceiros.map((parceiro) => (
            <li
              key={parceiro}
              className="flex min-h-[72px] items-center justify-center rounded-cartao border border-borda bg-white px-4 text-center text-15 text-tintaCard"
            >
              {parceiro}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Mapa() {
  return (
    <section id="mapa" className="mx-auto max-w-conteudo px-5 py-20">
      <p className="rotulo-portal text-madeira">Mapa</p>
      <h2 className="mt-4 text-subtitulo">Onde coletamos e onde plantamos</h2>
      <p className="mt-4 max-w-[60ch] text-17 text-tintaCard">
        O mapa já está montado com Leaflet e centrado em Caicó. Os pinos das matrizes e dos
        plantios definitivos entram quando o endpoint GET /publico/mapa existir.
      </p>

      <div className="mt-8 overflow-hidden rounded-cartao border border-borda">
        <MapContainer
          center={CAICO}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: "420px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>
    </section>
  );
}

function Rodape() {
  return (
    <footer className="bg-verdeTinta">
      <div className="mx-auto max-w-conteudo px-5 py-14">
        <img
          src="/marca/slogan-branco.svg"
          alt="Natureza viva e forte"
          role="img"
          className="h-10 w-auto"
        />

        {/* TAREFA 1 de docs/aprendendo-react.md: mudar o texto abaixo e abrir o primeiro PR. */}
        <p className="mt-6 max-w-[60ch] text-15 text-verdePalido">
          Projeto Nativas — projeto de extensão do CERES/UFRN, em Caicó, Rio Grande do Norte.
          Coleta de sementes, produção de mudas e replantio de espécies nativas da Caatinga.
        </p>

        <p className="mt-8 font-mono text-12 uppercase tracking-rotuloPortal text-verdeClaro">
          CERES · UFRN · Caicó-RN
        </p>
      </div>
    </footer>
  );
}

function SecaoPlaceholder({
  id,
  sobretitulo,
  titulo,
  descricao,
}: {
  id: string;
  sobretitulo: string;
  titulo: string;
  descricao: string;
}) {
  return (
    <section id={id} className="mx-auto max-w-conteudo px-5 py-20">
      <p className="rotulo-portal text-madeira">{sobretitulo}</p>
      <h2 className="mt-4 text-subtitulo">{titulo}</h2>
      <div className="mt-6 rounded-cartao border border-dashed border-bordaForte bg-white p-8">
        <p className="max-w-[70ch] text-16 text-cinza">{descricao}</p>
      </div>
    </section>
  );
}
