// Calcula as métricas de docs/rascunhos/metricas-dora.md, fluxo-de-valor.md e retrospectiva-02.md.
// Só lê: todas as consultas são GET pelo gh. Não precisa de dependência nem de git fetch.
//
// Uso, com o gh autenticado:
//   node docs/rascunhos/metricas-entrega.mjs
//   node docs/rascunhos/metricas-entrega.mjs --ate=2026-11-30T23:59:00-03:00

import { execFileSync } from "node:child_process";

const REPO = "Pedrooarj/projeto-nativas";
const INICIO_SPRINT_2 = "2026-11-01T03:00:00Z";
const FUSO = "America/Fortaleza";
const EQUIPE = ["Pedrooarj", "ChisSilva", "levyingx"];
const BOTS = new Set([
  "copilot",
  "copilot-pull-request-reviewer",
  "copilot-swe-agent",
  "github-actions",
  "dependabot",
  "chatgpt-codex-connector",
]);
const CONCLUSOES_DE_INCIDENTE = new Set(["failure", "timed_out", "startup_failure"]);

const argAte = process.argv.find((a) => a.startsWith("--ate="));
const ATE = new Date(argAte ? argAte.slice(6) : "2026-11-23T19:00:00Z").getTime();
const INICIO_S2 = new Date(INICIO_SPRINT_2).getTime();
const HORA = 3600000;
const DIA = 24 * HORA;

function rodar(comando, args) {
  return execFileSync(comando, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function ghJsonLinhas(caminho, filtro) {
  const saida = rodar("gh", ["api", "--paginate", caminho, "--jq", filtro]);
  return saida.split("\n").filter(Boolean).map((linha) => JSON.parse(linha));
}

const tempo = (texto) => new Date(texto).getTime();

function diaLocal(ms) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

function mediana(valores) {
  if (valores.length === 0) return null;
  const v = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(v.length / 2);
  return v.length % 2 ? v[meio] : (v[meio - 1] + v[meio]) / 2;
}

function media(valores) {
  return valores.length ? valores.reduce((s, x) => s + x, 0) / valores.length : null;
}

const decimal = (n, casas = 1) => n.toFixed(casas).replace(".", ",");

function duracao(ms) {
  if (ms === null || ms === undefined) return "sem dado";
  if (ms < HORA) return `${Math.round(ms / 60000)} min`;
  if (ms < DIA) return `${decimal(ms / HORA)} h`;
  return `${decimal(ms / DIA)} dias`;
}

function resumo(valores) {
  if (valores.length === 0) return "n=0 | sem dado";
  return `n=${valores.length} | mediana ${duracao(mediana(valores))} | média ${duracao(media(valores))} | mín ${duracao(Math.min(...valores))} | máx ${duracao(Math.max(...valores))}`;
}

function ehBot(login) {
  return BOTS.has(login.replace(/\[bot\]$/, "").toLowerCase());
}

function ehRevisaoHumana(revisao, autorDoPr) {
  const login = revisao.author?.login ?? "";
  return Boolean(login) && login !== autorDoPr && !ehBot(login) && Boolean(revisao.submittedAt);
}

function estavaEmRascunho(pr, eventos) {
  const ateCorte = eventos.filter((e) => e.t <= ATE);
  if (ateCorte.length) return ateCorte[ateCorte.length - 1].evento === "convert_to_draft";
  if (eventos.length) return eventos[0].evento === "ready_for_review";
  return pr.isDraft;
}

const campos = "number,title,author,createdAt,mergedAt,closedAt,isDraft,reviews,closingIssuesReferences";
const todosPrs = JSON.parse(rodar("gh", ["pr", "list", "-R", REPO, "--state", "all", "--limit", "500", "--json", campos]))
  .filter((pr) => tempo(pr.createdAt) <= ATE);

const issues = JSON.parse(rodar("gh", ["issue", "list", "-R", REPO, "--state", "all", "--limit", "500", "--json", "number,createdAt,closedAt"]));
const criacaoIssue = new Map(issues.map((i) => [i.number, tempo(i.createdAt)]));

function analisar(pr) {
  const autor = pr.author.login;
  const abertura = tempo(pr.createdAt);
  const merge = pr.mergedAt && tempo(pr.mergedAt) <= ATE ? tempo(pr.mergedAt) : null;
  const limite = merge ?? ATE;

  const eventos = ghJsonLinhas(
    `repos/${REPO}/issues/${pr.number}/timeline?per_page=100`,
    '.[] | select(.event == "ready_for_review" or .event == "convert_to_draft") | {evento: .event, data: .created_at}',
  )
    .map((e) => ({ evento: e.evento, t: tempo(e.data) }))
    .sort((a, b) => a.t - b.t);

  const revisoes = (pr.reviews ?? [])
    .filter((r) => ehRevisaoHumana(r, autor) && tempo(r.submittedAt) <= limite)
    .sort((a, b) => tempo(a.submittedAt) - tempo(b.submittedAt));
  const primeiraRevisao = revisoes.length ? tempo(revisoes[0].submittedAt) : null;

  const ultimaPorRevisor = new Map();
  for (const r of revisoes) {
    if (["APPROVED", "CHANGES_REQUESTED", "DISMISSED"].includes(r.state)) {
      ultimaPorRevisor.set(r.author.login, r.state);
    }
  }
  const aprovadores = [...ultimaPorRevisor].filter(([, s]) => s === "APPROVED").map(([l]) => l);

  const prontos = eventos.filter((e) => e.evento === "ready_for_review" && e.t <= ATE).map((e) => e.t);
  let inicioFila = abertura;
  if (prontos.length) {
    const antesDaRevisao = primeiraRevisao === null ? prontos : prontos.filter((t) => t <= primeiraRevisao);
    inicioFila = antesDaRevisao.length ? antesDaRevisao[antesDaRevisao.length - 1] : prontos[0];
  }
  const rascunho = merge === null && estavaEmRascunho(pr, eventos);
  const filaRevisao = rascunho || primeiraRevisao === null ? null : Math.max(0, primeiraRevisao - inicioFila);
  const base = { numero: pr.number, titulo: pr.title, autor, abertura, merge, rascunho, inicioFila, primeiraRevisao, aprovadores, filaRevisao };
  if (merge === null) return base;

  const datas = ghJsonLinhas(
    `repos/${REPO}/pulls/${pr.number}/commits?per_page=100`,
    ".[] | {data: .commit.author.date, pais: (.parents | length)}",
  )
    .filter((c) => c.pais < 2)
    .map((c) => tempo(c.data));
  const primeiroCommit = datas.length ? Math.min(...datas) : abertura;
  const criacoes = (pr.closingIssuesReferences ?? [])
    .map((i) => criacaoIssue.get(i.number))
    .filter(Boolean);
  const issueMaisAntiga = criacoes.length ? Math.min(...criacoes) : null;
  return {
    ...base,
    leadTime: merge - primeiroCommit,
    cycleTime: merge - abertura,
    espera: issueMaisAntiga === null ? null : Math.max(0, primeiroCommit - issueMaisAntiga),
    desenvolvimento: Math.max(0, abertura - primeiroCommit),
    revisaoAteMerge: primeiraRevisao === null ? null : Math.max(0, merge - primeiraRevisao),
  };
}

const ativos = todosPrs.filter((pr) => pr.mergedAt || !pr.closedAt || tempo(pr.closedAt) > ATE);
const analisados = ativos.map(analisar);
const mesclados = analisados.filter((l) => l.merge !== null).sort((a, b) => a.merge - b.merge);
const abertos = analisados.filter((l) => l.merge === null).sort((a, b) => a.numero - b.numero);

const execucoes = ghJsonLinhas(
  `repos/${REPO}/actions/runs?per_page=100`,
  ".workflow_runs[] | {evento: .event, ramo: .head_branch, conclusao: .conclusion, tentativa: .run_attempt, criado: .created_at}",
).filter((r) => tempo(r.criado) <= ATE);

const implantacoes = ghJsonLinhas(`repos/${REPO}/deployments?per_page=100`, ".[] | {criado: .created_at}")
  .filter((d) => tempo(d.criado) <= ATE);
const versoes = ghJsonLinhas(`repos/${REPO}/releases?per_page=100`, ".[] | {criado: (.published_at // .created_at)}")
  .filter((v) => tempo(v.criado) <= ATE);
const tags = ghJsonLinhas(`repos/${REPO}/tags?per_page=100`, ".[] | {sha: .commit.sha}").filter((tag) => {
  const [c] = ghJsonLinhas(`repos/${REPO}/commits/${tag.sha}`, "{data: .commit.committer.date}");
  return tempo(c.data) <= ATE;
});

console.log(`# Medição até ${new Date(ATE).toISOString()} (dias de merge em ${FUSO})\n`);

console.log("## DORA");
console.log(`Implantações até o corte: ${implantacoes.length} | releases: ${versoes.length} | tags: ${tags.length}`);

const naMain = execucoes.filter((r) => r.evento === "push" && r.ramo === "main");
const emPr = execucoes.filter((r) => r.evento === "pull_request");
const ehIncidente = (r) => CONCLUSOES_DE_INCIDENTE.has(r.conclusao);

function recuperacoes(lista) {
  const ordenadas = [...lista].sort((a, b) => tempo(a.criado) - tempo(b.criado));
  const tempos = [];
  let inicio = null;
  for (const r of ordenadas) {
    if (ehIncidente(r) && inicio === null) inicio = tempo(r.criado);
    if (r.conclusao === "success" && inicio !== null) {
      tempos.push(tempo(r.criado) - inicio);
      inicio = null;
    }
  }
  return tempos;
}

const janelas = [
  ["Projeto inteiro", mesclados, naMain, mesclados.length ? Math.min(...mesclados.map((l) => l.merge)) : null],
  ["Sprint 2 (desde 2026-11-01)", mesclados.filter((l) => l.merge >= INICIO_S2), naMain.filter((r) => tempo(r.criado) >= INICIO_S2), INICIO_S2],
];
for (const [nome, grupo, ci, inicio] of janelas) {
  const semanas = inicio === null ? 0 : (ATE - inicio) / (7 * DIA);
  const dias = new Set(grupo.map((l) => diaLocal(l.merge))).size;
  const frequencia = semanas > 0 ? `${decimal(grupo.length / semanas, 2)} por semana` : "sem dado";
  const incidentes = ci.filter(ehIncidente).length;
  const taxa = ci.length ? `${decimal((incidentes / ci.length) * 100)}%` : "sem dado";
  console.log(`\n### ${nome}`);
  console.log(`Merges na main: ${grupo.length} em ${semanas > 0 ? decimal(semanas) : "sem dado"} semanas = ${frequencia} | dias com merge: ${dias}`);
  console.log(`Lead time (1º commit até merge): ${resumo(grupo.map((l) => l.leadTime))}`);
  console.log(`Cycle time (abertura do PR até merge): ${resumo(grupo.map((l) => l.cycleTime))}`);
  console.log(`CI na main: ${ci.length} execuções | incidentes (failure, timed_out, startup_failure): ${incidentes} | taxa ${taxa}`);
  console.log(`Recuperação da main após incidente: ${resumo(recuperacoes(ci))}`);
}

const contar = (lista, c) => lista.filter((r) => r.conclusao === c).length;
console.log("\n### CI");
console.log(`Execuções na main: ${naMain.length} | sucesso ${contar(naMain, "success")} | incidente ${naMain.filter(ehIncidente).length} | cancelada ${contar(naMain, "cancelled")} | com nova tentativa ${naMain.filter((r) => r.tentativa > 1).length}`);
console.log(`Execuções em PR: ${emPr.length} | sucesso ${contar(emPr, "success")} | incidente ${emPr.filter(ehIncidente).length} | cancelada ${contar(emPr, "cancelled")}`);

const correcoes = mesclados.filter((l) => /^(fix|hotfix|revert)\b/i.test(l.titulo));
console.log(`PRs mesclados com título de correção: ${correcoes.length} de ${mesclados.length} (${correcoes.map((l) => "#" + l.numero).join(", ") || "nenhum"})`);

console.log("\n## PRs mesclados, um por linha");
console.log("PR | autor | dia do merge | lead time | cycle time | fila de revisão | revisão até merge");
for (const l of mesclados) {
  console.log(`#${l.numero} | ${l.autor} | ${diaLocal(l.merge)} | ${duracao(l.leadTime)} | ${duracao(l.cycleTime)} | ${l.filaRevisao === null ? "sem revisão humana" : duracao(l.filaRevisao)} | ${duracao(l.revisaoAteMerge)}`);
}

console.log("\n## Fluxo de valor (PRs mesclados, projeto inteiro)");
console.log(`Espera (issue criada até 1º commit): ${resumo(mesclados.map((l) => l.espera).filter((x) => x !== null))}`);
console.log(`Desenvolvimento (1º commit até abrir PR): ${resumo(mesclados.map((l) => l.desenvolvimento))}`);
console.log(`Fila de revisão (pronto para revisão até 1ª revisão humana): ${resumo(mesclados.map((l) => l.filaRevisao).filter((x) => x !== null))}`);
console.log(`Revisão até merge: ${resumo(mesclados.map((l) => l.revisaoAteMerge).filter((x) => x !== null))}`);
console.log(`PRs mesclados sem revisão humana registrada: ${mesclados.filter((l) => l.filaRevisao === null).map((l) => "#" + l.numero).join(", ") || "nenhum"}`);

console.log("\n## PRs abertos na data de corte");
for (const l of abertos) {
  const revisao = l.primeiraRevisao === null
    ? "sem revisão humana"
    : l.rascunho
      ? `1ª revisão humana ${duracao(l.primeiraRevisao - l.abertura)} após abrir (rascunho, fora da fila)`
      : `fila de revisão ${duracao(l.filaRevisao)}`;
  const aprovacao = l.aprovadores.length ? `aprovado por ${l.aprovadores.join(", ")}` : "sem aprovação";
  console.log(`#${l.numero} | ${l.rascunho ? "rascunho" : "pronto"} | aberto há ${duracao(ATE - l.abertura)} | ${revisao} | ${aprovacao} | ${l.titulo}`);
}
console.log(`WIP em revisão (abertos e prontos): ${abertos.filter((l) => !l.rascunho).length} (limite do acordo: 2)`);

console.log("\n## Prazo de 24 h, PRs prontos abertos desde 2026-11-01");
const prontosS2 = analisados.filter((l) => l.abertura >= INICIO_S2 && !l.rascunho).sort((a, b) => a.numero - b.numero);
const noPrazo = prontosS2.filter((l) => l.filaRevisao !== null && l.filaRevisao <= DIA);
const pendentesNoPrazo = prontosS2.filter((l) => l.filaRevisao === null && ATE - l.inicioFila <= DIA);
const foraDoPrazo = prontosS2.filter((l) => !noPrazo.includes(l) && !pendentesNoPrazo.includes(l));
const listar = (lista) => lista.map((l) => "#" + l.numero).join(", ") || "nenhum";
console.log(`Prontos: ${listar(prontosS2)}`);
console.log(`1ª revisão humana em até 24 h: ${noPrazo.length} (${listar(noPrazo)})`);
console.log(`Fora das 24 h: ${foraDoPrazo.length} (${listar(foraDoPrazo)})`);
console.log(`Ainda dentro das 24 h: ${pendentesNoPrazo.length} (${listar(pendentesNoPrazo)})`);
for (const l of prontosS2) {
  console.log(`#${l.numero}: fila desde ${new Date(l.inicioFila).toISOString()} | ${l.filaRevisao === null ? `sem revisão há ${duracao(ATE - l.inicioFila)}` : `revisado em ${duracao(l.filaRevisao)}`}`);
}

console.log("\n## Issues abertas na data de corte");
const issuesAbertas = issues
  .filter((i) => tempo(i.createdAt) <= ATE && (!i.closedAt || tempo(i.closedAt) > ATE))
  .map((i) => i.number)
  .sort((a, b) => a - b);
console.log(`${issuesAbertas.length}: ${issuesAbertas.map((n) => "#" + n).join(", ")}`);

console.log("\n## Commits sem merge por pessoa, Sprint 2 (todas as branches do GitHub, pela API)");
const ramos = ghJsonLinhas(`repos/${REPO}/branches?per_page=100`, ".[] | {nome: .name}");
const commits = new Map();
for (const { nome } of ramos) {
  const caminho = `repos/${REPO}/commits?sha=${encodeURIComponent(nome)}&since=${INICIO_SPRINT_2}&per_page=100`;
  const filtro = ".[] | {sha: .sha, pais: (.parents | length), data: .commit.author.date, login: (.author.login // .commit.author.name)}";
  for (const c of ghJsonLinhas(caminho, filtro)) commits.set(c.sha, c);
}
const porPessoa = Object.fromEntries(EQUIPE.map((p) => [p, 0]));
for (const c of commits.values()) {
  const t = tempo(c.data);
  if (c.pais > 1 || t < INICIO_S2 || t > ATE) continue;
  porPessoa[c.login] = (porPessoa[c.login] ?? 0) + 1;
}
for (const [pessoa, n] of Object.entries(porPessoa)) console.log(`${pessoa}: ${n}`);
