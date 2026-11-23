import { readFileSync } from "node:fs";
import { importarAcervo } from "../src/modules/especies/importacao.service";
import { ErroApi } from "../src/shared/erros";
import { prisma } from "../src/shared/prisma";

// Uso: npm run db:importar-acervo -- caminho/da/planilha.csv [--simular]
// Mesmo serviço da rota POST /especies/importacao, para quem roda na máquina.
async function principal() {
  const caminho = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  const simular = process.argv.includes("--simular");
  if (!caminho) {
    console.error("Informe o CSV: npm run db:importar-acervo -- planilha.csv [--simular]");
    process.exitCode = 1;
    return;
  }

  try {
    const relatorio = await importarAcervo(readFileSync(caminho, "utf8"), { simular });
    console.log(simular ? "Simulação: nada foi gravado." : "Importação concluída.");
    console.log(`Linhas lidas: ${relatorio.linhasLidas}`);
    console.log(`Criadas (${relatorio.criadas.length}): ${relatorio.criadas.join(", ") || "nenhuma"}`);
    console.log(
      `Atualizadas (${relatorio.atualizadas.length}): ${relatorio.atualizadas.join(", ") || "nenhuma"}`,
    );
  } catch (erro) {
    if (!(erro instanceof ErroApi)) throw erro;
    console.error(erro.message);
    for (const problema of (erro.detalhes as { linha: number; campo: string; mensagem: string }[]) ?? []) {
      console.error(`  linha ${problema.linha}, ${problema.campo}: ${problema.mensagem}`);
    }
    process.exitCode = 1;
  }
}

principal().finally(() => prisma.$disconnect());
