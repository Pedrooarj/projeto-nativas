// Calcula as métricas de docs/rascunhos/metricas-dora.md e fluxo-de-valor.md.
// Só lê: usa git log e consultas GET do gh. Não precisa de dependência.
//
// Uso, a partir da raiz do repositório (depois de git fetch origin):
//   node docs/rascunhos/metricas-entrega.mjs
//   node docs/rascunhos/metricas-entrega.mjs --ate=2026-11-30T23:59:00-03:00

import { execFileSync } from "node:child_process";

const REPO = "Pedrooarj/projeto-nativas";
const INICIO_SPRINT_2 = "2026-11-01T03:00:00Z";
const argAte = process.argv.find((a) => a.startsWith("--ate="));
const ATE = new Date(argAte ? argAte.slice(6) : "2026-11-23T19:00:00Z");
const HORA = 3600000;
const DIA = 24 * HORA;

function rodar(comando, args) {
  return execFileSync(comando, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function ghJsonLinhas(caminho, filtro) {
  const saida = rodar("gh", ["api", "--paginate", caminho, "--jq", filtro]);
  return saida.split("\n").filter(Boolean).map((linha) => JSON.parse(linha));
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

function duracao(ms) {
  if (ms === null) return "sem dado";
  if (ms < HORA) return `${Math.round(ms / 60000)} min`;
  if (ms < DIA) return `${(ms / HORA).toFixed(1).replace(".", ",")} h`;
  return `${(ms / DIA).toFixed(1).replace(".", ",")} dias`;
}

function resumo(valores) {
  if (valores.length === 0) return "sem dado";
  return `n=${valores.length} | mediana ${duracao(mediana(valores))} | média ${duracao(media(valores))} | mín ${duracao(Math.min(...valores))} | máx ${duracao(Math.max(...valores))}`;
}

function ehRevisorHumano(revisao, autorDoPr) {
  const login = revisao.author?.login ?? "";
  return login !== autorDoPr && !login.includes("copilot") && !login.endsWith("[bot]");
}

const campos = "number,title,author,createdAt,mergedAt,closedAt,isDraft,reviews,closingIssuesReferences";
const prs = JSON.parse(rodar("gh", ["pr", "list", "-R", REPO, "--state", "all", "--limit", "500", "--json", campos]))
  .filter((pr) => new Date(pr.createdAt) <= ATE);

const issues = JSON.parse(rodar("gh", ["issue", "list", "-R", REPO, "--state", "all", "--limit", "500", "--json", "number,createdAt,closedAt"]));
const criacaoIssue = new Map(issues.map((i) => [i.number, new Date(i.createdAt).getTime()]));

const execucoes = ghJsonLinhas(
  `repos/${REPO}/actions/runs?per_page=100`,
  ".workflow_runs[] | {evento: .event, ramo: .head_branch, conclusao: .conclusion, tentativa: .run_attempt, criado: .created_at}",
).filter((r) => new Date(r.criado) <= ATE);

const implantacoes = ghJsonLinhas(`repos/${REPO}/deployments?per_page=100`, ".[] | {criado: .created_at}");
const versoes = ghJsonLinhas(`repos/${REPO}/releases?per_page=100`, ".[] | {criado: .created_at}");
const tags = ghJsonLinhas(`repos/${REPO}/tags?per_page=100`, ".[] | {nome: .name}");

const mesclados = prs
  .filter((pr) => pr.mergedAt && new Date(pr.mergedAt) <= ATE)
  .sort((a, b) => new Date(a.mergedAt) - new Date(b.mergedAt));

const linhas = mesclados.map((pr) => {
  const autor = pr.author.login;
  const merge = new Date(pr.mergedAt).getTime();
  const abertura = new Date(pr.createdAt).getTime();
  const datas = ghJsonLinhas(
    `repos/${REPO}/pulls/${pr.number}/commits?per_page=100`,
    ".[] | {data: .commit.author.date, pais: (.parents | length)}",
  )
    .filter((c) => c.pais < 2)
    .map((c) => new Date(c.data).getTime());
  const primeiroCommit = datas.length ? Math.min(...datas) : abertura;
  const revisoes = (pr.reviews ?? [])
    .filter((r) => ehRevisorHumano(r, autor) && r.submittedAt)
    .map((r) => new Date(r.submittedAt).getTime())
    .filter((t) => t <= merge);
  const primeiraRevisao = revisoes.length ? Math.min(...revisoes) : null;
  const criacoes = (pr.closingIssuesReferences ?? [])
    .map((i) => criacaoIssue.get(i.number))
    .filter(Boolean);
  const issueMaisAntiga = criacoes.length ? Math.min(...criacoes) : null;
  return {
    numero: pr.number,
    merge,
    leadTime: merge - primeiroCommit,
    cycleTime: merge - abertura,
    espera: issueMaisAntiga === null ? null : Math.max(0, primeiroCommit - issueMaisAntiga),
    desenvolvimento: Math.max(0, abertura - primeiroCommit),
    filaRevisao: primeiraRevisao === null ? null : Math.max(0, primeiraRevisao - abertura),
    revisaoAteMerge: primeiraRevisao === null ? null : Math.max(0, merge - primeiraRevisao),
    titulo: pr.title,
  };
});

const inicioS2 = new Date(INICIO_SPRINT_2).getTime();
const janelas = [
  ["Projeto inteiro", linhas],
  ["Sprint 2 (desde 2026-11-01)", linhas.filter((l) => l.merge >= inicioS2)],
];

console.log(`# Medição até ${ATE.toISOString()}\n`);

console.log("## DORA");
console.log(`Implantações registradas no GitHub: ${implantacoes.length} | releases: ${versoes.length} | tags: ${tags.length}`);
for (const [nome, grupo] of janelas) {
  const inicio = nome.startsWith("Sprint") ? inicioS2 : Math.min(...linhas.map((l) => l.merge));
  const semanas = (ATE.getTime() - inicio) / (7 * DIA);
  const dias = new Set(grupo.map((l) => new Date(l.merge).toISOString().slice(0, 10))).size;
  console.log(`\n### ${nome}`);
  console.log(`Merges na main: ${grupo.length} em ${semanas.toFixed(1).replace(".", ",")} semanas = ${(grupo.length / semanas).toFixed(2).replace(".", ",")} por semana | dias com merge: ${dias}`);
  console.log(`Lead time (1º commit até merge): ${resumo(grupo.map((l) => l.leadTime))}`);
  console.log(`Cycle time (abertura do PR até merge): ${resumo(grupo.map((l) => l.cycleTime))}`);
}

const naMain = execucoes.filter((r) => r.evento === "push" && r.ramo === "main");
const emPr = execucoes.filter((r) => r.evento === "pull_request");
const contar = (lista, c) => lista.filter((r) => r.conclusao === c).length;
console.log("\n### CI");
console.log(`Execuções na main: ${naMain.length} | sucesso ${contar(naMain, "success")} | falha ${contar(naMain, "failure")} | cancelada ${contar(naMain, "cancelled")} | com nova tentativa ${naMain.filter((r) => r.tentativa > 1).length}`);
console.log(`Execuções em PR: ${emPr.length} | sucesso ${contar(emPr, "success")} | falha ${contar(emPr, "failure")} | cancelada ${contar(emPr, "cancelled")}`);

const ordenadas = [...naMain].sort((a, b) => new Date(a.criado) - new Date(b.criado));
const recuperacoes = [];
let inicioFalha = null;
for (const r of ordenadas) {
  if (r.conclusao === "failure" && inicioFalha === null) inicioFalha = new Date(r.criado).getTime();
  if (r.conclusao === "success" && inicioFalha !== null) {
    recuperacoes.push(new Date(r.criado).getTime() - inicioFalha);
    inicioFalha = null;
  }
}
console.log(`Recuperação da main após falha: ${resumo(recuperacoes)}`);

const correcoes = linhas.filter((l) => /^(fix|hotfix|revert)\b/i.test(l.titulo));
console.log(`PRs mesclados com título de correção: ${correcoes.length} de ${linhas.length} (${correcoes.map((l) => "#" + l.numero).join(", ") || "nenhum"})`);

console.log("\n## Fluxo de valor (PRs mesclados, projeto inteiro)");
console.log(`Espera (issue criada até 1º commit): ${resumo(linhas.map((l) => l.espera).filter((x) => x !== null))}`);
console.log(`Desenvolvimento (1º commit até abrir PR): ${resumo(linhas.map((l) => l.desenvolvimento))}`);
console.log(`Fila de revisão (abrir PR até 1ª revisão humana): ${resumo(linhas.map((l) => l.filaRevisao).filter((x) => x !== null))}`);
console.log(`Revisão até merge: ${resumo(linhas.map((l) => l.revisaoAteMerge).filter((x) => x !== null))}`);
console.log(`PRs mesclados sem revisão humana registrada: ${linhas.filter((l) => l.filaRevisao === null).map((l) => "#" + l.numero).join(", ") || "nenhum"}`);

console.log("\n## PRs abertos na data de corte");
const abertos = prs.filter((pr) => {
  const fim = pr.mergedAt ?? pr.closedAt;
  return !fim || new Date(fim) > ATE;
});
for (const pr of abertos.sort((a, b) => a.number - b.number)) {
  const humanas = (pr.reviews ?? []).filter((r) => ehRevisorHumano(r, pr.author.login) && r.submittedAt && new Date(r.submittedAt) <= ATE);
  const primeira = humanas.length ? Math.min(...humanas.map((r) => new Date(r.submittedAt).getTime())) : null;
  const espera = primeira === null ? "sem revisão humana" : `1ª revisão humana em ${duracao(primeira - new Date(pr.createdAt))}`;
  console.log(`#${pr.number} | ${pr.isDraft ? "rascunho" : "pronto"} | aberto há ${duracao(ATE - new Date(pr.createdAt))} | ${espera} | ${pr.title}`);
}
console.log(`WIP em revisão (abertos sem rascunho): ${abertos.filter((pr) => !pr.isDraft).length} (limite do acordo: 2)`);

console.log("\n## Commits sem merge por autor, Sprint 2 (branches do remoto)");
const log = rodar("git", ["log", "--remotes=origin", "--no-merges", "--format=%aI%x09%an"]);
const porAutor = {};
for (const linha of log.split("\n").filter(Boolean)) {
  const [data, autor] = linha.split("\t");
  const t = new Date(data).getTime();
  if (t >= inicioS2 && t <= ATE.getTime()) porAutor[autor] = (porAutor[autor] ?? 0) + 1;
}
for (const [autor, n] of Object.entries(porAutor).sort((a, b) => b[1] - a[1])) console.log(`${autor}: ${n}`);
