# Métricas de fluxo — Sprint 1

Período: 14/09 a 16/10. Medição de 15/10, feita a partir do repositório (seção 7.6 da
leitura `processos-s1.md`), porque os campos Início e Fim do quadro só existem desde
25/09. Cada número tem ao lado o comando que o gerou, para qualquer pessoa refazer.

## Itens concluídos (PRs mesclados na `main`)

| PR | Autor | Aberto | Mesclado | Cycle time | Fecha a issue | Lead time da issue |
|---|---|---|---|---|---|---|
| #22 | Pedro | 10/09 | 14/09 | 4,7 dias | (Sprint 0) | — |
| #24 | Chistian | 15/09 | 15/09 | 4 min | #19 | 5 dias (10/09 → 15/09) |
| #25 | Levy | 17/09 | 17/09 | 9 min | — | — |
| #33 | Pedro | 18/09 | 25/09 | 6,7 dias | #26 | 7 dias (18/09 → 25/09) |
| #37 | Pedro | 25/09 | 25/09 | 1,3 h | #36 | 5 dias (25/09 → 30/09) |
| #34 | Pedro | 18/09 | 30/09 | 11,5 dias | #27 | 12 dias (18/09 → 30/09) |
| #38 | Pedro | 25/09 | 30/09 | 4,9 dias | — | — |

Definições usadas (guia da Sprint 1): **cycle time** = abertura do PR até o merge;
**lead time** = criação da issue até o fechamento dela.

```bash
gh pr list --state merged --json number,author,createdAt,mergedAt,closingIssuesReferences
gh issue list --state all --json number,createdAt,closedAt
```

## Os quatro números

| Métrica | Valor | Observação |
|---|---|---|
| Cycle time médio | 4,0 dias (7 PRs) | Os três PRs de docs/chore fecharam em minutos; os de feature levaram de 1 h a 11,5 dias |
| Cycle time dos PRs de feature | 6,7 · 1,3 h · 11,5 dias | #33, #37 e #34 |
| Lead time das histórias técnicas | 5 a 12 dias | #19, #26, #27 e #36 |
| Throughput | 3 · 2 · 2 · 0 · 0 PRs por semana | semanas 14–20/09, 21–27/09, 28/09–04/10, 05–11/10, 12–16/10 (até 15/10) |
| WIP em revisão | 4 em 25/09 (limite 2) · 2 em 15/10 | em 25/09 havia #33, #34, #37 e #38 abertos ao mesmo tempo |

## Onde o fluxo travou

1. **Fila de revisão.** #33 e #34 foram abertos em 18/09 e aprovados em 25/09 e 30/09:
   7 e 12 dias em "Em revisão". É o cartão que mais demorou (#27, via PR #34) e o
   lugar onde ficou parado. Em 25/09 o WIP de revisão estava em 4, o dobro do limite.
2. **Duas semanas sem commit.** Entre 01/10 e 12/10 não entrou nenhum commit no
   repositório. A entrega foi adiada de 02/10 para 16/10 em 03/10 e o time parou
   junto com o prazo.
3. **Telas sem PR.** As histórias #1 e #2 (coleta e lote) estão em progresso desde
   18/09 sem branch no remoto; #4 e #7 chegaram como PR em 13/10 e 15/10.

Lei de Little: com WIP médio de cerca de 3 itens e throughput de cerca de 1,75 PR por
semana, o lead time esperado é de cerca de 1,7 semana (12 dias), o que bate com o #27.
Respeitar o limite de 2 em revisão teria cortado esse tempo pela metade.

## Atividade por integrante (fator de participação, AVALIACAO §3.2)

Commits sem merge desde 14/09, em todas as branches:

```bash
git log --all --since=2026-09-14 --no-merges --format="%ad %an" --date=short
git log --all --since=2026-09-14 --no-merges --author=<nome> --numstat
```

| Integrante | Commits | % dos commits | Linhas (+/-) | Semanas com commit (de 5) | PR integrado | Revisão aprovada em PR de outro |
|---|---|---|---|---|---|---|
| Pedro | 8 | 42% | +1081 / -46 | 2 (14–20/09, 21–27/09) + a desta semana | sim (#22, #33, #34, #37, #38) | **ainda não** (aprovar #39 e #40) |
| Chistian | 9 | 47% | +313 / -21 | 2 (14–20/09, 12–16/10) | sim (#24; #39 e #40 em revisão) | sim (#38) |
| Levy | 2 | 11% | +20 / -1 | 1 (14–20/09) | sim (#25) | sim (#33, #34, #37) |

Os percentuais mudam até 16/10 com os PRs #39, #40 e os da tela de coleta.

## O que vai para a retrospectiva (#28)

- Fato: fila de revisão de até 12 dias com WIP de revisão em 4 (limite 2).
- Fato: 12 dias sem commit depois do adiamento de 03/10.
- Fato: as duas histórias do sistema do viveiro (#1 e #2) sem PR a um dia da entrega.
- Candidatas a ação: revisar em até 24 h (já combinado em #31, agora com a `main`
  protegida); abrir o PR no primeiro dia de trabalho da história, mesmo incompleto, em
  rascunho; daily assíncrona no grupo de verdade, com "fiz / farei / travei".
