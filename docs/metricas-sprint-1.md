# Métricas de fluxo — Sprint 1

Período: 14/09 a 16/10. Medição de 16/10 à noite, feita a partir do repositório (seção 7.6 da
leitura `processos-s1.md`), porque os campos Início e Fim do quadro só existem desde
25/09. Cada número tem ao lado o comando que o gerou, para qualquer pessoa refazer.
A primeira medição, de 15/10, está no histórico deste arquivo; os números mudaram porque
seis PRs entraram entre 15 e 16/10.

## Itens concluídos (PRs mesclados na `main`)

| PR | Autor | Aberto | Mesclado | Cycle time | Fecha a issue | Lead time da issue |
|---|---|---|---|---|---|---|
| #22 | Pedro | 10/09 | 14/09 | 4,7 dias | (Sprint 0) | — |
| #24 | Chistian | 15/09 | 15/09 | 4 min | #19 | 5 dias (10/09 → 15/09) |
| #25 | Levy | 17/09 | 17/09 | 9 min | — | — |
| #33 | Pedro | 18/09 | 25/09 | 6,7 dias | #26 | 7 dias (18/09 → 25/09) |
| #37 | Pedro | 25/09 | 25/09 | 1,3 h | #36 (fechada à mão, sem `Closes`) | 5 dias (25/09 → 30/09) |
| #34 | Pedro | 18/09 | 30/09 | 11,5 dias | #27 | 12 dias (18/09 → 30/09) |
| #38 | Pedro | 25/09 | 30/09 | 4,9 dias | — | — |
| #39 | Chistian | 13/10 | 15/10 | 1,8 dia | #4 | 35 dias (10/09 → 15/10) |
| #41 | Pedro | 15/10 | 15/10 | 1,5 h | #32, #35 | 27 e 20 dias |
| #40 | Chistian | 15/10 | 16/10 | 21,5 h | #7 | 36 dias (10/09 → 16/10) |
| #44 | Chistian | 16/10 | 16/10 | 11 min | — | — |
| #42 | Levy | 15/10 | 16/10 | 3,8 h | #1, #11 | 36 dias (10/09 → 16/10) |
| #45 | Levy | 16/10 | 16/10 | 13 min | #2 | 36 dias (10/09 → 16/10) |

Definições usadas (guia da Sprint 1): **cycle time** = abertura do PR até o merge;
**lead time** = criação da issue até o fechamento dela. As cinco histórias de produto
(#1, #2, #4, #7, #11) foram criadas juntas em 10/09, no planejamento da Sprint 0, por isso
o lead time delas é parecido: o que varia é o tempo em que ficaram paradas.

```bash
gh pr list --state merged --json number,author,createdAt,mergedAt,closingIssuesReferences
gh issue list --state all --json number,createdAt,closedAt
```

## Os quatro números

| Métrica | Valor | Observação |
|---|---|---|
| Cycle time médio | 2,4 dias (13 PRs) | Os PRs de docs e chore fecharam em minutos ou horas; os de feature vão de 13 min a 11,5 dias |
| Cycle time dos PRs de feature | 3,0 dias em média (7 PRs) | #33 6,7 d · #37 1,3 h · #34 11,5 d · #39 1,8 d · #40 21,5 h · #42 3,8 h · #45 13 min |
| Lead time das histórias de produto | 35 a 36 dias | #1, #2, #4, #7 e #11: criadas em 10/09, fechadas entre 15 e 16/10 |
| Lead time das tarefas técnicas | 5 a 12 dias | #19, #26, #27 e #36 |
| Throughput | 3 · 2 · 2 · 0 · 6 PRs por semana | semanas 14–20/09, 21–27/09, 28/09–04/10, 05–11/10, 12–16/10 |
| WIP em revisão | 4 em 25/09 (limite 2) · 3 em 15/10 (limite 2) · 0 em 16/10 à noite | em 25/09 havia #33, #34, #37 e #38 abertos ao mesmo tempo; em 15/10 de manhã, #39, #40 e #41 |

## Onde o fluxo travou

1. **Fila de revisão na primeira metade.** #33 e #34 foram abertos em 18/09 e aprovados em
   25/09 e 30/09: 7 e 12 dias em "Em revisão". É o cartão que mais demorou (#27, via PR #34)
   e o lugar onde ficou parado. Em 25/09 o WIP de revisão estava em 4, o dobro do limite.
   Na segunda metade a fila andou: os seis PRs da última semana levaram de 13 minutos a
   1,8 dia para serem aprovados e mesclados.
2. **Duas semanas sem commit.** Entre 01/10 e 12/10 não entrou nenhum commit no
   repositório. A entrega foi adiada de 02/10 para 16/10 em 03/10 e o time parou
   junto com o prazo. Throughput zero na semana de 05 a 11/10.
3. **Telas entregues no limite.** As histórias #1 e #2 (coleta e lote) entraram em progresso
   em 18/09 e viraram PR só em 15 e 16/10: 28 dias em progresso sem branch no remoto, e os
   PRs mesclados a menos de 24 h da entrega. #4 e #7 chegaram como PR em 13 e 15/10.
   O trabalho estava invisível para o time até a última semana.
4. **`main` sem `Closes`.** O PR #37 não referenciou a issue #36, que foi fechada à mão. O
   combinado da #31 (todo PR com `Closes #NN`) falhou em 1 de 7 PRs que fecharam issue.

Lei de Little, primeira metade: com WIP médio de cerca de 3 itens e throughput de cerca de
1,75 PR por semana, o lead time esperado é de cerca de 1,7 semana (12 dias), o que bate com
o #27. Respeitar o limite de 2 em revisão teria cortado esse tempo pela metade. Na última
semana o mesmo WIP com 6 PRs mesclados deu lead time de meio dia a dois dias.

## Atividade por integrante (fator de participação, AVALIACAO §3.2)

Commits sem merge desde 14/09, em todas as branches, medidos em 16/10 à noite:

```bash
git log --all --since=2026-09-14 --no-merges --format="%ad %an" --date=short
git log --all --since=2026-09-14 --no-merges --author=<nome> --numstat
```

| Integrante | Commits | % dos commits | Linhas (+/-) | Semanas com commit (de 5) | PR integrado | Revisão aprovada em PR de outro |
|---|---|---|---|---|---|---|
| Pedro | 9 | 35% | +1254 / -106 | 3 (14–20/09, 21–27/09, 12–16/10) | sim (#22, #33, #34, #37, #38, #41) | sim (#39, #40, #42, #44, #45) |
| Chistian | 11 | 42% | +321 / -80 | 2 (14–20/09, 12–16/10) | sim (#24, #39, #40, #44) | sim (#38, #41) |
| Levy | 6 | 23% | +897 / -21 | 2 (14–20/09, 12–16/10) | sim (#25, #42, #45) | sim (#33, #34, #37) |

Total: 26 commits. Ninguém abaixo de 15%, todos com PR integrado e revisão aprovada em PR
de outro. O ponto fraco é a regularidade: Chistian e Levy têm commit em 2 das 5 semanas,
e as duas são a primeira e a última.

## O que vai para a retrospectiva (#28)

- Fato: fila de revisão de até 12 dias com WIP de revisão em 4 (limite 2) na primeira metade.
- Fato: 12 dias sem commit depois do adiamento de 03/10; throughput zero na semana de 05 a 11/10.
- Fato: as duas histórias do sistema do viveiro (#1 e #2) ficaram 28 dias em progresso sem
  branch no remoto e foram mescladas a menos de 24 h da entrega.
- Fato: 1 PR sem `Closes` (#37), issue fechada à mão.
- Fato: o pair programming previsto na #30 não aconteceu; a segunda prática XP ficou sendo a
  revisão de código com `main` protegida.
- Candidatas a ação: revisar em até 24 h (já combinado em #31, agora com a `main`
  protegida); abrir o PR em rascunho no primeiro dia de trabalho da história, mesmo incompleto;
  daily assíncrona no grupo de verdade, com "fiz / farei / travei".
