import { useEffect, useState } from "react";
import { Badge } from "../../componentes/ui/Badge";
import { Botao } from "../../componentes/ui/Botao";
import { Campo } from "../../componentes/ui/Campo";
import { Modal } from "../../componentes/ui/Modal";
import { Tabela, type Coluna } from "../../componentes/ui/Tabela";
import { Toast } from "../../componentes/ui/Toast";
import {
  atualizarEspecie,
  criarEspecie,
  ErroDaApi,
  listarEspecies,
  type DadosDeEspecie,
  type Especie,
} from "../../lib/api";
import { useAuth } from "../../lib/auth";

/**
 * TELA DE REFERÊNCIA.
 *
 * Este é o arquivo para copiar quando for construir coleta, lote e visita:
 * ele tem o ciclo inteiro — buscar da API, mostrar a lista, abrir formulário em
 * modal, salvar, tratar erro de validação e confirmar na tela.
 *
 * Repare que a validação de verdade é da API: o formulário só repassa a
 * mensagem que voltou. Regra duplicada no front vira regra desatualizada.
 */

type FormularioDeEspecie = {
  nomeComum: string;
  nomeCientifico: string;
  familia: string;
  porte: string;
  epocaFloracao: string;
  epocaFrutificacao: string;
  descricao: string;
  usos: string;
};

const formularioVazio: FormularioDeEspecie = {
  nomeComum: "",
  nomeCientifico: "",
  familia: "",
  porte: "",
  epocaFloracao: "",
  epocaFrutificacao: "",
  descricao: "",
  usos: "",
};

export function Especies() {
  const { usuario } = useAuth();
  const ehAdmin = usuario?.papel === "ADMIN";

  const [especies, setEspecies] = useState<Especie[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erroDaLista, setErroDaLista] = useState<string | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Especie | null>(null);
  const [formulario, setFormulario] = useState<FormularioDeEspecie>(formularioVazio);
  const [erroDoFormulario, setErroDoFormulario] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [aviso, setAviso] = useState<string | null>(null);

  // Espera 300ms depois da última tecla para não disparar uma requisição por letra.
  useEffect(() => {
    const relogio = setTimeout(() => {
      setCarregando(true);
      listarEspecies(busca.trim() || undefined)
        .then((lista) => {
          setEspecies(lista);
          setErroDaLista(null);
        })
        .catch((problema: ErroDaApi) => setErroDaLista(problema.message))
        .finally(() => setCarregando(false));
    }, 300);

    return () => clearTimeout(relogio);
  }, [busca]);

  async function recarregar() {
    const lista = await listarEspecies(busca.trim() || undefined);
    setEspecies(lista);
  }

  function abrirNova() {
    setEmEdicao(null);
    setFormulario(formularioVazio);
    setErroDoFormulario(null);
    setModalAberto(true);
  }

  function abrirEdicao(especie: Especie) {
    setEmEdicao(especie);
    setFormulario({
      nomeComum: especie.nomeComum,
      nomeCientifico: especie.nomeCientifico,
      familia: especie.familia,
      porte: especie.porte ?? "",
      epocaFloracao: especie.epocaFloracao ?? "",
      epocaFrutificacao: especie.epocaFrutificacao ?? "",
      descricao: especie.descricao ?? "",
      usos: especie.usos.join(", "),
    });
    setErroDoFormulario(null);
    setModalAberto(true);
  }

  function mudarCampo(campo: keyof FormularioDeEspecie, valor: string) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setErroDoFormulario(null);
    setSalvando(true);

    const dados: DadosDeEspecie = {
      nomeComum: formulario.nomeComum.trim(),
      nomeCientifico: formulario.nomeCientifico.trim(),
      familia: formulario.familia.trim(),
      ...(formulario.porte.trim() ? { porte: formulario.porte.trim() } : {}),
      ...(formulario.epocaFloracao.trim()
        ? { epocaFloracao: formulario.epocaFloracao.trim() }
        : {}),
      ...(formulario.epocaFrutificacao.trim()
        ? { epocaFrutificacao: formulario.epocaFrutificacao.trim() }
        : {}),
      ...(formulario.descricao.trim() ? { descricao: formulario.descricao.trim() } : {}),
      usos: formulario.usos
        .split(",")
        .map((uso) => uso.trim())
        .filter((uso) => uso.length > 0),
    };

    try {
      if (emEdicao) {
        await atualizarEspecie(emEdicao.id, dados);
        setAviso(`Espécie ${dados.nomeComum} atualizada.`);
      } else {
        await criarEspecie(dados);
        setAviso(`Espécie ${dados.nomeComum} cadastrada.`);
      }

      setModalAberto(false);
      await recarregar();
    } catch (problema) {
      setErroDoFormulario(mensagemDeErro(problema));
    } finally {
      setSalvando(false);
    }
  }

  const colunas: Coluna<Especie>[] = [
    {
      chave: "nome",
      titulo: "Nome comum",
      renderizar: (especie) => <span className="text-16 text-verdeEscuro">{especie.nomeComum}</span>,
    },
    {
      chave: "cientifico",
      titulo: "Nome científico",
      renderizar: (especie) => <em className="text-15">{especie.nomeCientifico}</em>,
    },
    {
      chave: "familia",
      titulo: "Família",
      renderizar: (especie) => <Badge cor="broto">{especie.familia}</Badge>,
    },
    {
      chave: "acervo",
      titulo: "Conteúdo do acervo",
      renderizar: (especie) =>
        especie.descricao ? (
          <span className="text-14 text-cinza">preenchido</span>
        ) : (
          <span className="text-14 text-cinzaMeta">falta descrição</span>
        ),
    },
    {
      chave: "acoes",
      titulo: "",
      renderizar: (especie) =>
        ehAdmin ? (
          <button
            type="button"
            onClick={() => abrirEdicao(especie)}
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
          <h1 className="mt-3 text-30">Espécies</h1>
          <p className="mt-2 max-w-[60ch] text-15 text-cinza">
            Cadastro das espécies e do conteúdo do acervo. As 30 a 40 espécies entram por
            importação de planilha; esta tela é para correção pontual.
          </p>
        </div>

        {ehAdmin ? <Botao onClick={abrirNova}>Cadastrar espécie</Botao> : null}
      </div>

      {!ehAdmin ? (
        <p className="mt-6 rounded-campo bg-azulTint px-4 py-3 text-15 text-azul">
          Sua conta é da equipe do viveiro: dá para consultar as espécies, mas só a coordenação
          cadastra e edita (RN-09).
        </p>
      ) : null}

      <div className="mt-8 max-w-[420px]">
        <Campo
          id="busca"
          rotulo="Buscar"
          valor={busca}
          aoMudar={setBusca}
          placeholder="nome comum, nome científico ou família"
        />
      </div>

      {erroDaLista ? (
        <p className="mt-6 rounded-campo bg-madeiraTint px-4 py-3 text-15 text-madeira">
          {erroDaLista}
        </p>
      ) : null}

      <div className="mt-6">
        {carregando ? (
          <p className="text-15 text-cinza">Carregando espécies...</p>
        ) : (
          <Tabela
            colunas={colunas}
            linhas={especies}
            chaveDaLinha={(especie) => especie.id}
            vazio={
              busca
                ? `Nenhuma espécie encontrada para "${busca}".`
                : "Nenhuma espécie cadastrada ainda. Cadastre a primeira para o acervo começar."
            }
          />
        )}
      </div>

      <Modal
        aberto={modalAberto}
        titulo={emEdicao ? "Editar espécie" : "Cadastrar espécie"}
        aoFechar={() => setModalAberto(false)}
      >
        <form onSubmit={salvar} className="flex flex-col gap-5">
          <Campo
            id="nomeComum"
            rotulo="Nome comum"
            valor={formulario.nomeComum}
            aoMudar={(valor) => mudarCampo("nomeComum", valor)}
            obrigatorio
            ajuda="A primeira letra vira o prefixo da etiqueta dos lotes (Angico = A-001)."
          />

          <Campo
            id="nomeCientifico"
            rotulo="Nome científico"
            valor={formulario.nomeCientifico}
            aoMudar={(valor) => mudarCampo("nomeCientifico", valor)}
            obrigatorio
          />

          <Campo
            id="familia"
            rotulo="Família"
            valor={formulario.familia}
            aoMudar={(valor) => mudarCampo("familia", valor)}
            obrigatorio
          />

          <Campo
            id="porte"
            rotulo="Porte"
            valor={formulario.porte}
            aoMudar={(valor) => mudarCampo("porte", valor)}
          />

          <Campo
            id="epocaFloracao"
            rotulo="Época de floração"
            valor={formulario.epocaFloracao}
            aoMudar={(valor) => mudarCampo("epocaFloracao", valor)}
          />

          <Campo
            id="epocaFrutificacao"
            rotulo="Época de frutificação"
            valor={formulario.epocaFrutificacao}
            aoMudar={(valor) => mudarCampo("epocaFrutificacao", valor)}
          />

          <Campo
            id="usos"
            rotulo="Usos"
            valor={formulario.usos}
            aoMudar={(valor) => mudarCampo("usos", valor)}
            ajuda="Separe por vírgula: medicinal, forrageiro, madeireiro."
          />

          <Campo
            id="descricao"
            rotulo="Descrição"
            valor={formulario.descricao}
            aoMudar={(valor) => mudarCampo("descricao", valor)}
            multilinha
          />

          {erroDoFormulario ? (
            <p className="rounded-campo bg-madeiraTint px-4 py-3 text-15 text-madeira">
              {erroDoFormulario}
            </p>
          ) : null}

          <Botao type="submit" larguraTotal desabilitado={salvando}>
            {salvando ? "Salvando..." : emEdicao ? "Salvar alterações" : "Cadastrar espécie"}
          </Botao>
        </form>
      </Modal>

      {aviso ? <Toast mensagem={aviso} aoFechar={() => setAviso(null)} /> : null}
    </div>
  );
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
