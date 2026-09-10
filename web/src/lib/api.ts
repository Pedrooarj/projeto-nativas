import type { Papel } from "./dominio";

/**
 * Único lugar do front que fala com a API.
 *
 * Toda função aqui é tipada: quem chama sabe o que volta sem abrir o navegador.
 * Se você precisa de um endpoint novo, adicione uma função no fim do arquivo em
 * vez de chamar fetch solto na tela.
 */

const URL_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api/v1";

const CHAVE_DO_TOKEN = "nativas.token";

export function lerToken(): string | null {
  return localStorage.getItem(CHAVE_DO_TOKEN);
}

export function guardarToken(token: string) {
  localStorage.setItem(CHAVE_DO_TOKEN, token);
}

export function apagarToken() {
  localStorage.removeItem(CHAVE_DO_TOKEN);
}

export type DetalheDeErro = { campo: string; mensagem: string };

/** Todo erro vindo da API chega na tela como um ErroDaApi. */
export class ErroDaApi extends Error {
  status: number;
  erro: string;
  detalhes?: DetalheDeErro[];

  constructor(status: number, erro: string, mensagem: string, detalhes?: DetalheDeErro[]) {
    super(mensagem);
    this.name = "ErroDaApi";
    this.status = status;
    this.erro = erro;
    this.detalhes = detalhes;
  }
}

type Opcoes = {
  metodo?: "GET" | "POST" | "PATCH" | "DELETE";
  corpo?: unknown;
};

async function requisitar<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const token = lerToken();

  const resposta = await fetch(URL_BASE + caminho, {
    method: opcoes.metodo ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
  }).catch(() => {
    throw new ErroDaApi(0, "sem_conexao", "Não consegui falar com a API. Ela está rodando?");
  });

  if (resposta.status === 204) return undefined as T;

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new ErroDaApi(
      resposta.status,
      dados?.erro ?? "erro_interno",
      dados?.mensagem ?? "Algo deu errado.",
      dados?.detalhes,
    );
  }

  return dados as T;
}

export type Usuario = {
  id: string;
  email: string;
  papel: Papel;
};

export type Metricas = {
  sementesColetadas: number;
  mudasNoViveiro: number;
  plantiosDefinitivos: number;
  visitasRecebidas: number;
  atualizadoEm: string;
};

export type Colaborador = {
  id: string;
  nome: string;
};

export type Especie = {
  id: string;
  nomeComum: string;
  nomeCientifico: string;
  familia: string;
  descricao: string | null;
  porte: string | null;
  epocaFloracao: string | null;
  epocaFrutificacao: string | null;
  usos: string[];
  fotoPrincipalUrl: string | null;
  galeria: string[];
  criadoEm: string;
};

export type DadosDeEspecie = {
  nomeComum: string;
  nomeCientifico: string;
  familia: string;
  descricao?: string;
  porte?: string;
  epocaFloracao?: string;
  epocaFrutificacao?: string;
  usos?: string[];
};

export function entrar(email: string, senha: string) {
  return requisitar<{ token: string; usuario: Usuario }>("/auth/login", {
    metodo: "POST",
    corpo: { email, senha },
  });
}

export function buscarUsuarioLogado() {
  return requisitar<Usuario>("/auth/eu");
}

export function buscarMetricas() {
  return requisitar<Metricas>("/publico/metricas");
}

export function listarColaboradores() {
  return requisitar<Colaborador[]>("/colaboradores");
}

export function listarEspecies(busca?: string) {
  const consulta = busca ? `?busca=${encodeURIComponent(busca)}` : "";
  return requisitar<Especie[]>(`/especies${consulta}`);
}

export function buscarEspecie(id: string) {
  return requisitar<Especie>(`/especies/${id}`);
}

export function criarEspecie(dados: DadosDeEspecie) {
  return requisitar<Especie>("/especies", { metodo: "POST", corpo: dados });
}

export function atualizarEspecie(id: string, dados: Partial<DadosDeEspecie>) {
  return requisitar<Especie>(`/especies/${id}`, { metodo: "PATCH", corpo: dados });
}
