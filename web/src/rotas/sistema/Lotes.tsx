import { useEffect, useState } from "react";
import { Botao } from "../../componentes/ui/Botao";
import { Campo } from "../../componentes/ui/Campo";
import {
  criarLote,
  ErroDaApi,
  listarColaboradores,
  listarColetas,
  listarSubstratos,
  type Colaborador,
  type Coleta,
  type DadosDeLote,
  type Lote,
  type Substrato,
} from "../../lib/api";
import {
  recipientesPorEstagio,
  rotuloMetodoQuebra,
  rotuloRecipiente,
  rotuloSetor,
  type MetodoQuebra,
  type SetorViveiro,
  type TipoRecipiente,
} from "../../lib/dominio";

/**
 * Cadastro de lote com etiqueta automática.
 * As regras (RN-01, RN-02, RN-03, RN-05) são validadas na API; a tela só repassa a mensagem.
 */

type FormularioDeLote = {
  coletaId: string;
  qtdSementes: string;
  dataPlantio: string;
  tipoRecipiente: "" | TipoRecipiente;
  tratamentoSemente: "" | MetodoQuebra;
  substratoId: string;
  setor: "" | SetorViveiro;
  identificacaoFina: string;
  qtdMudasVivas: string;
  colaboradorId: string;
};

/** Data de hoje no fuso local, no formato "YYYY-MM-DD" do <input type="date">. */
function hojeLocal(): string {
  return new Date().toLocaleDateString("en-CA");
}

function formularioInicial(): FormularioDeLote {
  return {
    coletaId: "",
    qtdSementes: "",
    dataPlantio: hojeLocal(),
    tipoRecipiente: "",
    tratamentoSemente: "",
    substratoId: "",
    setor: "",
    identificacaoFina: "",
    qtdMudasVivas: "",
    // RN-06: o responsável nunca vem do token (login compartilhado). A pessoa escolhe.
    colaboradorId: "",
  };
}

// RN-03: a Etapa 1 aceita apenas tubete ou sementeira.
const recipientes = recipientesPorEstagio.ESTAGIO_1;

// RN-02
const tratamentos = Object.keys(rotuloMetodoQuebra) as MetodoQuebra[];

const setores = Object.keys(rotuloSetor) as SetorViveiro[];

const classeDoSelect = "mt-1 block w-full rounded-campo border px-3 py-2 text-15";

export function Lotes() {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [substratos, setSubstratos] = useState<Substrato[]>([]);
  const [erroDaLista, setErroDaLista] = useState<string | null>(null);

  const [formulario, setFormulario] = useState<FormularioDeLote>(formularioInicial());
  const [erroDoFormulario, setErroDoFormulario] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Quando preenchido, a tela mostra a confirmação no lugar do formulário.
  const [confirmacao, setConfirmacao] = useState<Lote | null>(null);

  useEffect(() => {
    const tratarErro = (problema: ErroDaApi) => setErroDaLista(problema.message);

    listarColetas().then(setColetas).catch(tratarErro);
    listarColaboradores().then(setColaboradores).catch(tratarErro);
    listarSubstratos().then(setSubstratos).catch(tratarErro);
  }, []);

  function registrarOutro() {
    setConfirmacao(null);
    setFormulario(formularioInicial());
    setErroDoFormulario(null);
  }

  function mudarCampo(campo: keyof FormularioDeLote, valor: string) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setErroDoFormulario(null);
    setSalvando(true);

    // A espécie não vai: a API copia da coleta (RN-05). Validação de verdade é da API.
    const dados: DadosDeLote = {
      coletaId: formulario.coletaId,
      qtdSementes: Number(formulario.qtdSementes),
      tipoRecipiente: formulario.tipoRecipiente as "TUBETE" | "SEMENTEIRA",
      tratamentoSemente: formulario.tratamentoSemente as MetodoQuebra,
      substratoId: formulario.substratoId,
      setor: formulario.setor as SetorViveiro,
      colaboradorId: formulario.colaboradorId,
      ...(formulario.dataPlantio ? { dataPlantio: formulario.dataPlantio } : {}),
      ...(formulario.identificacaoFina.trim()
        ? { identificacaoFina: formulario.identificacaoFina.trim() }
        : {}),
      ...(formulario.qtdMudasVivas.trim()
        ? { qtdMudasVivas: Number(formulario.qtdMudasVivas) }
        : {}),
    };

    try {
      const lote = await criarLote(dados);
      setConfirmacao(lote);

      // O saldo da coleta mudou: atualiza em segundo plano para o próximo cadastro.
      listarColetas()
        .then(setColetas)
        .catch((problema: ErroDaApi) => setErroDaLista(problema.message));
    } catch (problema) {
      setErroDoFormulario(mensagemDeErro(problema));
    } finally {
      setSalvando(false);
    }
  }

  const coletaEscolhida = coletas.find((coleta) => coleta.id === formulario.coletaId);

  return (
    <div>
      <div>
        <p className="rotulo">Sistema do viveiro</p>
        <h1 className="mt-3 text-30">Lotes</h1>
        <p className="mt-2 max-w-[60ch] text-15 text-cinza">
          Cadastre um lote de mudas a partir de uma coleta. Ao salvar, o sistema gera a etiqueta
          que vai na plaqueta da bandeja.
        </p>
      </div>

      {erroDaLista ? (
        <p className="mt-6 rounded-campo bg-madeiraTint px-4 py-3 text-15 text-madeira">
          {erroDaLista}
        </p>
      ) : null}

      {confirmacao ? (
        <div role="status" className="mt-8 max-w-[520px] rounded-campo bg-azulTint px-5 py-5 text-azul">
          <p className="text-15">Lote cadastrado. Escreva esta etiqueta na plaqueta:</p>
          <p className="mt-3 font-mono text-30">{confirmacao.tagUnica}</p>

          <dl className="mt-4 flex flex-col gap-1 text-15">
            <div>
              <dt className="inline">Espécie: </dt>
              <dd className="inline">{confirmacao.especie.nomeComum}</dd>
            </div>
            <div>
              <dt className="inline">Quantidade: </dt>
              <dd className="inline">{confirmacao.qtdSementes} sementes</dd>
            </div>
            <div>
              <dt className="inline">Registrado por: </dt>
              <dd className="inline">{confirmacao.colaborador.nome}</dd>
            </div>
          </dl>

          <div className="mt-5">
            <Botao onClick={registrarOutro}>Registrar outro lote</Botao>
          </div>
        </div>
      ) : (
        <form onSubmit={salvar} className="mt-8 flex max-w-[520px] flex-col gap-5">
          <div>
            <label htmlFor="coletaId" className="text-15 text-cinza">
              Coleta de origem
            </label>
            <select
              id="coletaId"
              value={formulario.coletaId}
              onChange={(evento) => mudarCampo("coletaId", evento.target.value)}
              required
              className={classeDoSelect}
            >
              <option value="">Selecione...</option>
              {coletas
                .filter((coleta) => coleta.saldo > 0)
                .map((coleta) => (
                  <option key={coleta.id} value={coleta.id}>
                    {coleta.especie.nomeComum} · {formatarData(coleta.dataColeta)} · saldo{" "}
                    {coleta.saldo}
                  </option>
                ))}
            </select>
            <p className="mt-1 text-14 text-cinza">
              {coletaEscolhida
                ? `A espécie do lote será ${coletaEscolhida.especie.nomeComum}. Saldo da coleta: ${coletaEscolhida.saldo}.`
                : "A espécie do lote é a da coleta escolhida."}
            </p>
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
            id="dataPlantio"
            rotulo="Data do plantio"
            tipo="data"
            valor={formulario.dataPlantio}
            aoMudar={(valor) => mudarCampo("dataPlantio", valor)}
          />

          <div>
            <label htmlFor="tipoRecipiente" className="text-15 text-cinza">
              Recipiente
            </label>
            <select
              id="tipoRecipiente"
              value={formulario.tipoRecipiente}
              onChange={(evento) => mudarCampo("tipoRecipiente", evento.target.value)}
              required
              className={classeDoSelect}
            >
              <option value="">Selecione...</option>
              {recipientes.map((valor) => (
                <option key={valor} value={valor}>
                  {rotuloRecipiente[valor]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tratamentoSemente" className="text-15 text-cinza">
              Tratamento de dormência
            </label>
            <select
              id="tratamentoSemente"
              value={formulario.tratamentoSemente}
              onChange={(evento) => mudarCampo("tratamentoSemente", evento.target.value)}
              required
              className={classeDoSelect}
            >
              <option value="">Selecione...</option>
              {tratamentos.map((valor) => (
                <option key={valor} value={valor}>
                  {rotuloMetodoQuebra[valor]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="substratoId" className="text-15 text-cinza">
              Substrato
            </label>
            <select
              id="substratoId"
              value={formulario.substratoId}
              onChange={(evento) => mudarCampo("substratoId", evento.target.value)}
              required
              className={classeDoSelect}
            >
              <option value="">Selecione...</option>
              {substratos.map((substrato) => (
                <option key={substrato.id} value={substrato.id}>
                  {substrato.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="setor" className="text-15 text-cinza">
              Setor do viveiro
            </label>
            <select
              id="setor"
              value={formulario.setor}
              onChange={(evento) => mudarCampo("setor", evento.target.value)}
              required
              className={classeDoSelect}
            >
              <option value="">Selecione...</option>
              {setores.map((valor) => (
                <option key={valor} value={valor}>
                  {rotuloSetor[valor]}
                </option>
              ))}
            </select>
          </div>

          <Campo
            id="identificacaoFina"
            rotulo="Identificação fina"
            valor={formulario.identificacaoFina}
            aoMudar={(valor) => mudarCampo("identificacaoFina", valor)}
            ajuda="Opcional: bandeja, fileira ou qualquer detalhe extra."
          />

          <Campo
            id="qtdMudasVivas"
            rotulo="Mudas vivas"
            tipo="numero"
            valor={formulario.qtdMudasVivas}
            aoMudar={(valor) => mudarCampo("qtdMudasVivas", valor)}
            ajuda="Opcional: preencha se já souber quantas germinaram."
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
              className={classeDoSelect}
            >
              <option value="">Selecione...</option>
              {colaboradores.map((colaborador) => (
                <option key={colaborador.id} value={colaborador.id}>
                  {colaborador.nome}
                </option>
              ))}
            </select>
          </div>

          {erroDoFormulario ? (
            <p className="rounded-campo bg-madeiraTint px-4 py-3 text-15 text-madeira">
              {erroDoFormulario}
            </p>
          ) : null}

          <Botao type="submit" larguraTotal desabilitado={salvando}>
            {salvando ? "Salvando..." : "Cadastrar lote"}
          </Botao>
        </form>
      )}
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