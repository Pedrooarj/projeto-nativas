# Roteiro do vídeo — Sprint 1

**Duração alvo: 5 minutos.** Estrutura exigida pelo [guia da Sprint 1](https://github.com/fmarquesfilho/processos-2026-2/blob/main/docs/SPRINT-1.md#estrutura-do-vídeo--5-minutos):
entrega · incremento a partir do README · quadro e métricas · prática XP · retrospectiva.
**Todos os integrantes falam.**

Decisão de 16/10: o vídeo mostra o processo e o que entrou na `main`. A demonstração da
ferramenta funcionando fica para a apresentação ao vivo com o professor, com o sistema
rodando a partir do README.

Formato: chamada no Google Meet com gravação ligada, cada um compartilha a tela
indicada. Publicar no YouTube como **não listado** e colar o link no `README.md` e na
`proposta.md` (§7). Ensaio cronometrado antes de gravar. Toda afirmação com número
do próprio projeto (critério "Evidência" da rubrica de comunicação).

Antes de gravar: `main` com os PRs #39, #40, #41, #42, #44 e #45 mesclados,
`docs/retrospectiva-01.md` mesclado (#28), quadro aberto numa aba,
`docs/metricas-sprint-1.md` em outra.

Regras para caber em 5 minutos: ninguém lê a tela em voz alta, fala o número e aponta;
a passagem de um para o outro é uma frase ("Chistian, o quadro"); cronômetro visível.

---

## Bloco 1 — O que a sprint entregou (0:00–0:45) · Pedro

**Na tela:** README, seção "Entregas por sprint".

- "Sprint 1 da equipe Nativas, rastreabilidade de mudas do viveiro do CERES. Entrou na
  `main`: a API inteira do banco de sementes e dos lotes (substratos, coletas com saldo, lote
  com etiqueta única), a página inicial do portal, o acervo público com busca e filtro, e as
  duas telas do sistema: registro de coleta e cadastro de lote com a etiqueta."
- "Treze PRs mesclados na sprint, seis deles na última semana. A ferramenta a gente mostra
  funcionando na apresentação ao vivo."

## Bloco 2 — O quadro e as métricas de fluxo (0:45–2:00) · Chistian

**Na tela:** GitHub Projects, depois `docs/metricas-sprint-1.md`.

- Colunas com a política na descrição e limite de WIP no nome: 3 em progresso, 2 em
  revisão. Campos Prioridade, Estimativa, Sprint, Início e Fim. Cartões ligados ao PR que
  os fechou.
- Números: cycle time médio de 2,4 dias; PRs de feature entre 13 minutos e 11,5 dias;
  throughput de 3, 2, 2, 0 e 6 PRs por semana; WIP de revisão chegou a 4 em 25/09, o dobro
  do limite.
- Gargalo nomeado: a fila de revisão na primeira metade. #33 e #34 esperaram 7 e 12 dias
  por aprovação. Lei de Little: WIP 3 ÷ 1,75 por semana ≈ 12 dias, exatamente o lead time
  do #27. E as histórias #1 e #2 ficaram 28 dias em progresso sem branch no remoto.

## Bloco 3 — A prática XP e a evidência (2:00–3:00) · Pedro

**Na tela:** histórico de commits do PR #34, depois a regra de proteção da `main`.

- TDD: em cada PR da API o commit `test(...)` entra antes do `feat(...)`:
  `158b7b7 test(substratos)` → `a3cdf6f feat(substratos)`; `47bb6ca test(lotes)` →
  `5ef8c7b feat(lotes)`; `dcc5fbc test(coletas)` → `d1b5359 feat(coletas)`.
- O que o teste garantiu: etiqueta única sob concorrência e saldo de sementes por
  coleta, dois casos que não dá para conferir à mão.
- Revisão de código: `main` protegida desde 18/09 (PR obrigatório, 1 aprovação, CI
  verde, sem exceção para admin); todos os PRs de feature com aprovação de outro
  integrante. O que não aconteceu: o pair programming previsto. Por isso a ação da retro.

## Bloco 4 — A retrospectiva (3:00–4:15) · Levy

**Na tela:** `docs/retrospectiva-01.md`, seções Fatos e Ações.

- Os dois problemas, com o dado: fila de revisão de até 12 dias e 12 dias sem commit
  depois do adiamento de 03/10.
- A causa de cada um (5 Porquês, uma frase por problema).
- As ações (no máximo três), cada uma com responsável e prazo verificável na Sprint 2.

## Bloco 5 — Sprint 2 (4:15–5:00) · Chistian

**Na tela:** README, seção "Entregas por sprint", ou o quadro filtrado por Sprint 2.

- "Sprint 2 é a entrega final, em 30/11: quadro de lotes com avanço de etapa e destino
  final, registro de visitas, página da espécie com dado real e o mapa das matrizes e dos
  plantios." Uma frase por item, sem detalhar.
- Fechar: "Nativas, Sprint 1. Obrigado."
