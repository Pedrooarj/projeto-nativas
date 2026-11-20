import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  buscarMapaPublico,
  ErroDaApi,
  type MapaPublico as Pontos,
  type PontoMatriz,
  type PontoPlantio,
} from "../../lib/api";

const CAICO: [number, number] = [-6.4578, -37.0977];

// O azul é o acento de georreferenciamento do design system (tailwind.config.ts).
const AZUL = "#2C5FA8";

/** Vértices de uma estrela de 12 pontas, alternando raio externo e interno. */
function pontosDaEstrela(centro: number, raioExterno: number, raioInterno: number) {
  const vertices: string[] = [];
  for (let i = 0; i < 24; i++) {
    const raio = i % 2 === 0 ? raioExterno : raioInterno;
    const angulo = (Math.PI * i) / 12 - Math.PI / 2;
    const x = centro + raio * Math.cos(angulo);
    const y = centro + raio * Math.sin(angulo);
    vertices.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return vertices.join(" ");
}

const ESTRELA_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">` +
  `<polygon points="${pontosDaEstrela(16, 14, 8.5)}" fill="${AZUL}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>` +
  `</svg>`;

// Área de 48px em volta da estrela de 32px: alvo de toque do celular.
const iconeMatriz = L.divIcon({
  html: `<span style="display:flex;width:48px;height:48px;align-items:center;justify-content:center">${ESTRELA_SVG}</span>`,
  className: "",
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -14],
});

function dataPorExtenso(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** Enquadra o mapa nos pontos assim que eles chegam; sem pontos, fica em Caicó. */
function EnquadrarPontos({ pontos }: { pontos: Pontos }) {
  const mapa = useMap();

  useEffect(() => {
    const coordenadas = [...pontos.matrizes, ...pontos.plantios].map(
      (ponto) => [ponto.lat, ponto.lng] as [number, number],
    );
    if (coordenadas.length > 0) {
      mapa.fitBounds(coordenadas, { padding: [40, 40], maxZoom: 14 });
    }
  }, [mapa, pontos]);

  return null;
}

function Janela({
  tipo,
  ponto,
  etiqueta,
}: {
  tipo: string;
  ponto: PontoMatriz | PontoPlantio;
  etiqueta?: string;
}) {
  return (
    // A folga à esquerda tira a janela de baixo dos botões de zoom no celular.
    <Popup minWidth={200} maxWidth={240} autoPanPaddingTopLeft={[60, 10]}>
      <div className="font-corpo">
        {ponto.fotoUrl ? (
          <img
            src={ponto.fotoUrl}
            alt={ponto.especie.nomeComum}
            loading="lazy"
            className="mb-3 h-28 w-full rounded-campo object-cover"
          />
        ) : null}
        <p className="rotulo-portal !m-0 text-azul">{tipo}</p>
        <p className="!mb-0 !mt-1 text-17 text-verdeEscuro">{ponto.especie.nomeComum}</p>
        <p className="!m-0 text-13 italic text-cinza">{ponto.especie.nomeCientifico}</p>
        {etiqueta ? <p className="etiqueta !mb-0 !mt-2 text-tinta">{etiqueta}</p> : null}
        <p className="!mb-0 !mt-2 text-14 text-tintaCard">{dataPorExtenso(ponto.data)}</p>
        {ponto.localDescricao ? (
          <p className="!m-0 text-14 text-tintaCard">{ponto.localDescricao}</p>
        ) : null}
        <Link
          to={`/acervo/${ponto.especie.id}`}
          className="mt-2 inline-flex min-h-toque items-center text-15 !text-azul underline"
        >
          Ver a espécie no acervo
        </Link>
      </div>
    </Popup>
  );
}

/**
 * Mapa do portal: matrizes (estrela azul) e plantios definitivos (ponto azul
 * com borda branca), vindos de GET /publico/mapa.
 */
export function MapaPublico() {
  const [pontos, setPontos] = useState<Pontos | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarMapaPublico()
      .then(setPontos)
      .catch((problema: ErroDaApi) => setErro(problema.message));
  }, []);

  const semPontos = pontos !== null && pontos.matrizes.length + pontos.plantios.length === 0;

  return (
    <section id="mapa" className="mx-auto max-w-conteudo px-5 py-20">
      <p className="rotulo-portal text-madeira">Mapa</p>
      <h2 className="mt-4 text-subtitulo">Onde coletamos e onde plantamos</h2>
      <p className="mt-4 max-w-[60ch] text-17 text-tintaCard">
        Cada estrela é uma árvore matriz de onde vieram sementes. Cada ponto é um plantio
        definitivo de mudas que saíram do viveiro. Toque em um deles para ver a espécie e a data.
      </p>

      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-15 text-tintaCard">
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-flex h-6 w-6 [&>svg]:h-6 [&>svg]:w-6"
            dangerouslySetInnerHTML={{ __html: ESTRELA_SVG }}
          />
          Árvore matriz{pontos ? ` (${pontos.matrizes.length})` : ""}
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="mx-1 inline-block h-4 w-4 rounded-full border-2 border-white bg-azul shadow"
          />
          Plantio definitivo{pontos ? ` (${pontos.plantios.length})` : ""}
        </li>
      </ul>

      {erro ? (
        <p className="mt-6 rounded-cartao bg-madeiraTint px-4 py-3 text-15 text-madeira">
          Não consegui carregar os pontos do mapa agora: {erro}
        </p>
      ) : null}

      {semPontos ? (
        <p className="mt-6 text-15 text-cinza">
          Ainda não há coleta nem plantio registrado para mostrar aqui.
        </p>
      ) : null}

      <div className="relative z-0 mt-6 overflow-hidden rounded-cartao border border-borda">
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

          {pontos ? <EnquadrarPontos pontos={pontos} /> : null}

          {pontos?.matrizes.map((matriz) => (
            <Marker
              key={matriz.id}
              position={[matriz.lat, matriz.lng]}
              icon={iconeMatriz}
              title={`Árvore matriz: ${matriz.especie.nomeComum}`}
            >
              <Janela tipo="Árvore matriz" ponto={matriz} />
            </Marker>
          ))}

          {pontos?.plantios.map((plantio) => (
            <CircleMarker
              key={plantio.id}
              center={[plantio.lat, plantio.lng]}
              radius={10}
              pathOptions={{ color: "#fff", weight: 3, fillColor: AZUL, fillOpacity: 1 }}
            >
              <Janela tipo="Plantio definitivo" ponto={plantio} etiqueta={plantio.etiqueta} />
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
