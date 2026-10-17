# Retrospectiva da Sprint 1

**Período:** 14/09 a 16/10 · **Participantes:** Pedro (PO e SM), Chistian, Levy
**Fonte dos números:** `docs/metricas-sprint-1.md` (medição de 16/10)

## 1. Fatos

**Entrega e capacidade**
- T3 a T6 concluídas. T1 (retrospectiva, #28) e T2 (vídeo, #29) fecham com este PR e com a gravação; a #30 segue aberta. Os PRs das telas de coleta e lote (#1 e #2) foram mesclados em 16/10, no último dia.
- A Sprint 1 planejou 18 pontos (#1, #2 e #4) e entregou 26, com #7 e #11 puxados durante a sprint. A Sprint 2 tem 35 pontos para 4 semanas, e o time produziu de verdade em 2 das 5 semanas da Sprint 1.

**Métricas de fluxo**
- Cycle time médio de 2,4 dias em 13 PRs. Os PRs de feature levaram de 13 minutos a 11,5 dias (#34).
- Throughput semanal: 3, 2, 2, 0 e 6 PRs. Não houve commit de 01/10 a 12/10, depois que o professor adiou a entrega de 02/10 para 16/10.
- Fila de revisão: #33 e #34 ficaram 7 e 12 dias em "Em revisão". Em 25/09 havia 4 PRs abertos, com limite de 2.
- Contraste: os 6 PRs da última semana foram revisados em horas.
- As telas de coleta e lote estavam em progresso desde 18/09 e só chegaram a PR no fim da sprint.

**Pessoas e processo**
- Parte das atividades de Levy foi concluída perto do fim da sprint, pois a estimativa de capacidade não foi revisada durante o desenvolvimento.
- TDD na API e revisão de código com `main` protegida funcionaram e têm evidência. O pair programming de Levy e Chistian, previsto na #30, não aconteceu: os horários não coincidiram.
- Não houve daily no grupo. Houve duas daily meetings com o professor, em 28 e 30/09, e as weeklies de 21 e 28/09 não foram registradas (#32).
- Pontos que funcionaram: as revisões do Pedro nos PRs da equipe, o apoio dele no desenvolvimento e a reunião de alinhamento da entrega da sprint.

## 2. Causas

**Problema 1: fila de revisão de 7 e 12 dias (5 Porquês)**
1. Por que #33 e #34 esperaram 7 e 12 dias? Ninguém era responsável por puxar os PRs da coluna "Em revisão".
2. Por que ninguém era responsável? A coluna existia, mas sem dono, e o GitHub só era aberto por quem tinha PR próprio.
3. Por que não havia cobrança? Não havia prazo combinado para revisar.
4. Por que o limite de 2 em revisão não segurou os PRs (4 abertos em 25/09)? Ele existia no acordo, mas sem dono, sem prazo e sem proteção da `main`.

**Causa raiz:** limite de WIP sem prazo e sem responsável pela revisão.

**Ação já tomada:** em 18/09, a `main` foi protegida e combinou-se revisar em até 24 h (#31). Resolveu parcialmente: #33 e #34 ainda esperaram dias, mas os 6 PRs da última semana foram revisados em horas.

**Problema 2: entrega tardia de parte das atividades (5 Porquês)**
1. Por que parte das atividades de Levy foi concluída tarde? Ele estimou que daria conta e o atraso só ficou claro perto do fim.
2. Por que só ficou claro tarde? Não havia daily no grupo nem weekly registrada, só as daily meetings com o professor em 28 e 30/09.
3. Por que não havia checagem de capacidade? A Planning não registrava a capacidade de cada um, nem em horas nem em pontos, e ela não era revisada durante a sprint.

**Causa raiz:** capacidade não registrada nem acompanhada, então o atraso só apareceu no fim.

## 3. Ações

Cada ação tem um cartão no backlog da Sprint 2.

| # | Ação | Responsável | Prazo | Verificação na Sprint 2 |
|---|---|---|---|---|
| 1 | Manter a revisão de PRs em até 24 h (#31) e no máximo 2 PRs em "Em revisão". Cada pessoa tem 1 história em progresso por vez. PR em rascunho não conta no WIP de revisão. | Todos | 1º dia da Sprint 2 | Todo PR revisado em até 24 h; WIP de revisão nunca acima de 2. |
| 2 | Abrir PR em rascunho na primeira semana de cada história, mesmo incompleto. | Cada autor; Pedro verifica no checkpoint semanal e registra no grupo | Planning da Sprint 2 | Toda história com PR em rascunho em até 7 dias; checkpoint registrado no grupo em cada semana. |
| 3 | Na Planning, registrar a capacidade de cada um em pontos (35 pontos para 4 semanas). Quem estiver atrasado avisa no checkpoint e as tarefas são redistribuídas. | Levy | Planning da Sprint 2 | Capacidade registrada na Planning; nenhum cartão concluído só no último dia. |

## 4. Revisão do acordo de processo

- Mantidos TDD e revisão de código com `main` protegida.
- Mantida a revisão em até 24 h, agora com 1 história em progresso por pessoa e PR em rascunho fora do WIP de revisão.
- Toda história tem uma semana para abrir PR em rascunho.
- Pair programming mantido, com sessão de Levy e Chistian marcada na Planning da Sprint 2 e `Co-authored-by` como evidência.
- A Planning registra a capacidade em pontos, e o checkpoint semanal é registrado no grupo.