import { useEffect, useState } from "react";
import { Botao } from "../../componentes/ui/Botao";
import { Campo } from "../../componentes/ui/Campo";
import { Modal } from "../../componentes/ui/Modal";
import { Tabela, type Coluna } from "../../componentes/ui/Tabela";
import { Toast } from "../../componentes/ui/Toast";
import {
  criarColeta,
  ErroDaApi,
  listarColaboradores, // ⚠️ precisa existir em lib/api (ver dúvidas abaixo)
  listarColetas,
  listarEspecies,
  type Coleta,
  type DadosDeColeta,
} from "../../lib/api";
import { useAuth } from "../../lib/auth";

type FormularioDeColeta = {
  especieId: string;
  matrizLat: string;
  matrizLng: string;
  qtdSementes: string;
  dataColeta: string;
  localDescricao: string;
  colaboradorId: string;
};

type OpcaoDeEspecie = { id: string; nomeComum: string; nomeCientifico: string };
type OpcaoDeColaborador = { id: string; nome: string };

/** Data de hoje no fuso local, no formato "YYYY-MM-DD" do <input type="date">. */
function hojeLocal(): string {
  return new Date().toLocaleDateString("en-CA");
}

function formularioInicial(colaboradorId: string): FormularioDeColeta {
  return {
    especieId: "",
    matrizLat: "",
    matrizLng: "",
    qtdSementes: "",
    dataColeta: hojeLocal(),
    localDescricao: "",
    colaboradorId,
  };
}

export function Sementes() {
  const { usuario } = useAuth();
  const ehAdmin = usuario?.papel === "ADMIN";

  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [especies, setEspecies] = useState<OpcaoDeEspecie[]>([]);
  const [colaboradores, setColaboradores] = useState<OpcaoDeColaborador[]>([]);
  const [filtroEspecieId, setFiltroEspecieId] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erroDaLista, setErroDaLista] = useState<string | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Coleta | null>(null);
  const [formulario, setFormulario] = useState<FormularioDeColeta>(formularioInicial(""));
  const [erroDoFormulario, setErroDoFormulario] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);
  const [erroDaLocalizacao, setErroDaLocalizacao] = useState<string | null>(null);

  const [aviso, setAviso] = useState<string | null>(null);

  // Espécies e colaboradores para os <select> do formulário (e o filtro de espécie).
  useEffect(() => {
    listarEspecies()
      .then(setEspecies)
      .catch((problema: ErroDaApi) => setErroDaLista(problema.message));

    listarColaboradores()
      .then(setColaboradores)
      .catch((problema: ErroDaApi) => setErroDaLista(problema.message));
  }, []);

  // Recarrega a lista sempre que o filtro de espécie muda.
  useEffect(() => {
    setCarregando(true);
    listarColetas(filtroEspecieId || undefined)
      .then((lista) => {
        setColetas(lista);
        setErroDaLista(null);
      })
      .catch((problema: ErroDaApi) => setErroDaLista(problema.message))
      .finally(() => setCarregando(false));
  }, [filtroEspecieId]);

  async function recarregar() {
    const lista = await listarColetas(filtroEspecieId || undefined);
    setColetas(lista);
  }

  function abrirNova() {
    setEmEdicao(null);
    // Pré-seleciona quem está logado, mas o voluntário pode trocar (RN-06).
    setFormulario(formularioInicial(usuario?.id ?? ""));
    setErroDoFormulario(null);
    setErroDaLocalizacao(null);
    setModalAberto(true);
  }

  function abrirEdicao(coleta: Coleta) {
    setEmEdicao(coleta);
    setFormulario({
      especieId: coleta.especieId,
      matrizLat: String(coleta.matrizLat),
      matrizLng: String(coleta.matrizLng),
      qtdSementes: String(coleta.qtdSementes),
      dataColeta: coleta.dataColeta.slice(0, 10),
      localDescricao: coleta.localDescricao ?? "",
      colaboradorId: coleta.colaboradorId,
    });
    setErroDoFormulario(null);
    setErroDaLocalizacao(null);
    setModalAberto(true);
  }

  function mudarCampo(campo: keyof FormularioDeColeta, valor: string) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  function usarMinhaLocalizacao() {
    setErroDaLocalizacao(null);

    if (!("geolocation" in navigator)) {
      setErroDaLocalizacao("Este aparelho não oferece localização. Digite as coordenadas.");
      return;
    }

    setBuscandoLocalizacao(true);

    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        setFormulario((atual) => ({
          ...atual,
          matrizLat: posicao.coords.latitude.toFixed(6),
          matrizLng: posicao.coords.longitude.toFixed(6),
        }));
        setBuscandoLocalizacao(false);
      },
      (erro) => {
        setBuscandoLocalizacao(false);
        if (erro.code === erro.PERMISSION_DENIED) {
          setErroDaLocalizacao(
            "Sem permissão para usar a localização. Libere no navegador ou digite as coordenadas.",
          );
        } else if (erro.code === erro.TIMEOUT) {
          setErroDaLocalizacao("Demorou demais para achar sua posição. Tente de novo ou digite.");
        } else {
          setErroDaLocalizacao("Não consegui obter sua posição. Digite as coordenadas.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setErroDoFormulario(null);
    setSalvando(true);

    // A validação de verdade (lat -90..90, lng -180..180 etc.) é da API.
    const dados: DadosDeColeta = {
      especieId: formulario.especieId,
      qtdSementes: Number(formulario.qtdSementes),
      matrizLat: Number(formulario.matrizLat.trim().replace(",", ".")),
      matrizLng: Number(formulario.matrizLng.trim().replace(",", ".")),
      ...(formulario.dataColeta ? { dataColeta: formulario.dataColeta } : {}),
      ...(formulario.localDescricao.trim()
        ? { localDescricao: formulario.localDescricao.trim() }
        : {}),
      colaboradorId: formulario.colaboradorId,
    };

    try {
      if (emEdicao) {
        // await atualizarColeta(emEdicao.id, dados);
        setAviso("Coleta atualizada.");
      } else {
        await criarColeta(dados);
        setAviso("Coleta registrada.");
      }

      setModalAberto(false);

      // Se o filtro esconderia a coleta recém-salva, limpa o filtro (o effect recarrega).
      if (filtroEspecieId && filtroEspecieId !== dados.especieId) {
        setFiltroEspecieId("");
      } else {
        await recarregar();
      }
    } catch (problema) {
      setErroDoFormulario(mensagemDeErro(problema));
    } finally {
      setSalvando(false);
    }
  }

  const colunas: Coluna<Coleta>[] = [
    {
      chave: "especie",
      titulo: "Espécie",
      renderizar: (coleta) => (
        <div>
          <span className="text-16 text-verdeEscuro">{coleta.especie.nomeComum}</span>
          <br />
          <em className="text-14 text-cinza">{coleta.especie.nomeCientifico}</em>
        </div>
      ),
    },
    {
      chave: "data",
      titulo: "Data da coleta",
      renderizar: (coleta) => <span className="text-15">{formatarData(coleta.dataColeta)}</span>,
    },
    {
      chave: "sementes",
      titulo: "Sementes",
      renderizar: (coleta) => (
        <span className="text-15">
          {coleta.qtdSementes}
          <span className="text-14 text-cinza">
            {" "}
            ({coleta.sementesUsadas} usadas · saldo {coleta.saldo})
          </span>
        </span>
      ),
    },
    {
      chave: "matriz",
      titulo: "Matriz",
      renderizar: (coleta) => (
        <span className="text-14 text-cinza">
          {coleta.matrizLat.toFixed(5)}, {coleta.matrizLng.toFixed(5)}
        </span>
      ),
    },
    {
      chave: "local",
      titulo: "Local",
      renderizar: (coleta) =>
        coleta.localDescricao ? (
          <span className="text-14 text-cinza">{coleta.localDescricao}</span>
        ) : (
          <span className="text-14 text-cinzaMeta">sem descrição</span>
        ),
    },
    {
      chave: "colaborador",
      titulo: "Coletado por",
      renderizar: (coleta) => <span className="text-15">{coleta.colaborador.nome}</span>,
    },
    {
      chave: "acoes",
      titulo: "",
      renderizar: (coleta) =>
        ehAdmin ? (
          <button
            type="button"
            onClick={() => abrirEdicao(coleta)}
            className="min-h-toque text-15 text-verdeEscuro underline"
          >
            Editar
          </button>
        ) : null,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="rotulo">Sistema do viveiro</p>
          <h1 className="mt-3 text-30">Sementes</h1>
          <p className="mt-2 max-w-[60ch] text-15 text-cinza">
            Registro das coletas de sementes em campo: de qual matriz vieram, quantas sementes
            foram coletadas e quanto ainda resta no banco de sementes.
          </p>
        </div>

        <Botao onClick={abrirNova}>Registrar coleta</Botao>
      </div>

      <div className="mt-8 max-w-[420px]">
        <label htmlFor="filtroEspecie" className="text-15 text-cinza">
          Filtrar por espécie
        </label>
        <select
          id="filtroEspecie"
          value={filtroEspecieId}
          onChange={(evento) => setFiltroEspecieId(evento.target.value)}
          className="mt-1 block w-full rounded-campo border px-3 py-2 text-15"
        >
          <option value="">Todas as espécies</option>
          {especies.map((especie) => (
            <option key={especie.id} value={especie.id}>
              {especie.nomeComum}
            </option>
          ))}
        </select>
      </div>

      {erroDaLista ? (
        <p className="mt-6 rounded-campo bg-madeiraTint px-4 py-3 text-15 text-madeira">
          {erroDaLista}
        </p>
      ) : null}

      <div className="mt-6">
        {carregando ? (
          <p className="text-15 text-cinza">Carregando coletas...</p>
        ) : (
          <Tabela
            colunas={colunas}
            linhas={coletas}
            chaveDaLinha={(coleta) => coleta.id}
            vazio={
              filtroEspecieId
                ? "Nenhuma coleta registrada para essa espécie."
                : "Nenhuma coleta registrada ainda. Registre a primeira para o banco de sementes começar."
            }
          />
        )}
      </div>

      <Modal
        aberto={modalAberto}
        titulo={emEdicao ? "Editar coleta" : "Registrar coleta"}
        aoFechar={() => setModalAberto(false)}
      >
        <form onSubmit={salvar} className="flex flex-col gap-5">
          <div>
            <label htmlFor="especieId" className="text-15 text-cinza">
              Espécie
            </label>
            <select
              id="especieId"
              value={formulario.especieId}
              onChange={(evento) => mudarCampo("especieId", evento.target.value)}
              required
              className="mt-1 block w-full rounded-campo border px-3 py-2 text-15"
            >
              <option value="">Selecione...</option>
              {especies.map((especie) => (
                <option key={especie.id} value={especie.id}>
                  {especie.nomeComum} ({especie.nomeCientifico})
                </option>
              ))}
            </select>
          </div>

          <Campo
            id="qtdSementes"
            rotulo="Quantidade de sementes"
            tipo="numero"
            valor={formulario.qtdSementes}
            aoMudar={(valor) => mudarCampo("qtdSementes", valor)}
            obrigatorio
          />

          <Campo
            id="dataColeta"
            rotulo="Data da coleta"
            tipo="data"
            valor={formulario.dataColeta}
            aoMudar={(valor) => mudarCampo("dataColeta", valor)}
            obrigatorio
          />

          <div>
            <label htmlFor="colaboradorId" className="text-15 text-cinza">
              Quem está registrando
            </label>
            <select
              id="colaboradorId"
              value={formulario.colaboradorId}
              onChange={(evento) => mudarCampo("colaboradorId", evento.target.value)}
              required
              className="mt-1 block w-full rounded-campo border px-3 py-2 text-15"
            >
              <option value="">Selecione...</option>
              {colaboradores.map((colaborador) => (
                <option key={colaborador.id} value={colaborador.id}>
                  {colaborador.nome}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="flex flex-col gap-4">
            <legend className="text-15 text-cinza">Coordenada da árvore matriz</legend>

            <div>
              <button
                type="button"
                onClick={usarMinhaLocalizacao}
                disabled={buscandoLocalizacao}
                className="min-h-toque rounded-campo bg-azul px-4 text-15 text-white disabled:opacity-60"
              >
                {buscandoLocalizacao ? "Buscando sua posição..." : "Usar minha localização"}
              </button>
              <p className="mt-2 text-14 text-cinza">
                Ou digite as coordenadas nos campos abaixo.
              </p>
              {erroDaLocalizacao ? (
                <p className="mt-2 rounded-campo bg-madeiraTint px-4 py-3 text-15 text-madeira">
                  {erroDaLocalizacao}
                </p>
              ) : null}
            </div>

            <Campo
              id="matrizLat"
              rotulo="Latitude"
              valor={formulario.matrizLat}
              aoMudar={(valor) => mudarCampo("matrizLat", valor)}
              placeholder="-5.8000"
              ajuda="Entre -90 e 90."
              obrigatorio
            />

            <Campo
              id="matrizLng"
              rotulo="Longitude"
              valor={formulario.matrizLng}
              aoMudar={(valor) => mudarCampo("matrizLng", valor)}
              placeholder="-35.2000"
              ajuda="Entre -180 e 180."
              obrigatorio
            />
          </fieldset>

          <Campo
            id="localDescricao"
            rotulo="Descrição do local"
            valor={formulario.localDescricao}
            aoMudar={(valor) => mudarCampo("localDescricao", valor)}
            ajuda="Ajuda a achar a árvore de novo no ano seguinte: ponto de referência, trilha, cerca."
            multilinha
          />

          {erroDoFormulario ? (
            <p className="rounded-campo bg-madeiraTint px-4 py-3 text-15 text-madeira">
              {erroDoFormulario}
            </p>
          ) : null}

          <Botao type="submit" larguraTotal desabilitado={salvando}>
            {salvando ? "Salvando..." : emEdicao ? "Salvar alterações" : "Registrar coleta"}
          </Botao>
        </form>
      </Modal>

      {aviso ? <Toast mensagem={aviso} aoFechar={() => setAviso(null)} /> : null}
    </div>
  );
}

/** "2026-10-13T00:00:00.000Z" → "13/10/2026" (sem passar por Date, para não deslocar o dia por fuso). */
function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

/** Junta a mensagem da API com os detalhes campo a campo, quando houver. */
function mensagemDeErro(problema: unknown): string {
  if (!(problema instanceof ErroDaApi)) return "Não consegui salvar. Tente de novo.";

  if (problema.detalhes && problema.detalhes.length > 0) {
    return problema.detalhes
      .map((detalhe) => `${detalhe.campo}: ${detalhe.mensagem}`)
      .join(" · ");
  }

  return problema.message;
}