/**
 * Todo erro previsto da API é um ErroApi. O middleware tratarErros transforma
 * em { erro, mensagem, detalhes? } com o status certo.
 */
export class ErroApi extends Error {
  status: number;
  erro: string;
  detalhes?: unknown;

  constructor(status: number, erro: string, mensagem: string, detalhes?: unknown) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
    this.erro = erro;
    this.detalhes = detalhes;
  }
}

export function naoAutenticado(mensagem = "Faça login para continuar.") {
  return new ErroApi(401, "nao_autenticado", mensagem);
}

export function semPermissao(mensagem = "Esta ação é restrita a administradores.") {
  return new ErroApi(403, "sem_permissao", mensagem);
}

export function naoEncontrado(mensagem: string) {
  return new ErroApi(404, "nao_encontrado", mensagem);
}

export function conflito(mensagem: string, detalhes?: unknown) {
  return new ErroApi(409, "conflito", mensagem, detalhes);
}

export function invalido(mensagem: string, detalhes?: unknown) {
  return new ErroApi(422, "validacao", mensagem, detalhes);
}
