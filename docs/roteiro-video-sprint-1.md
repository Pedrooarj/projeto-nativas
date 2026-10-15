# Roteiro do vídeo — Sprint 1

**Duração alvo: 5 minutos.** Estrutura exigida pelo [guia da Sprint 1](https://github.com/fmarquesfilho/processos-2026-2/blob/main/docs/SPRINT-1.md#estrutura-do-vídeo--5-minutos):
entrega (30s) · incremento a partir do README (1:30) · quadro e métricas (1:30) ·
prática XP (1:00) · retrospectiva (30s). **Todos os integrantes falam.**

Formato: chamada no Google Meet com gravação ligada, cada um compartilha a tela
indicada. Publicar no YouTube como **não listado** e colar o link no `README.md` e na
`proposta.md` (§7). Ensaio cronometrado antes de gravar. Toda afirmação com número
do próprio projeto (critério "Evidência" da rubrica de comunicação).

Antes de gravar: `main` com os PRs #39 e #40 mesclados, banco subido
(`docker compose up -d`), API e front rodando, quadro aberto numa aba e
`docs/metricas-sprint-1.md` em outra.

---

## Bloco 1 — O que a sprint entregou (0:00–0:30) · Pedro

**Na tela:** README, seção "Entregas por sprint".

- "Sprint 1 da equipe Nativas. Entregamos a API do banco de sementes e dos lotes
  (substratos, coletas com saldo e lote com etiqueta única), a página inicial do portal
  com conteúdo real e o acervo público com busca e filtro."
- "No processo: quadro com políticas e limites de WIP, `main` protegida com revisão
  obrigatória, TDD na API e as métricas de fluxo medidas no repositório."

## Bloco 2 — O incremento funcionando, a partir do README (0:30–2:00) · Levy

**Na tela:** README (passos 1 a 4), depois o navegador.

- Mostrar os quatro passos do README e o `docker compose up -d` rodando.
- Portal em `localhost:5173`: contadores vindos de `/publico/metricas`; seção Sobre e
  as sete ações (#4); menu mobile abrindo no modo celular.
- `/acervo` (#7): busca por nome e filtro por família.
- Login com a conta do seed e `POST /lotes` em ação: criar um lote e mostrar a
  etiqueta gerada (pelo Prisma Studio, Adminer ou pela tela de coleta, se estiver
  mesclada até a gravação). Citar: "a soma de sementes dos lotes não passa a da
  coleta: a API devolve 409 com o saldo".

## Bloco 3 — O quadro e as métricas de fluxo (2:00–3:30) · Chistian

**Na tela:** GitHub Projects, depois `docs/metricas-sprint-1.md`.

- Colunas e política de cada uma (descrição da coluna), limites de WIP: 3 em progresso,
  2 em revisão. Campos Prioridade, Estimativa, Sprint, Início e Fim.
- Histórico: cartões movidos ao longo da sprint, PRs vinculados.
- Números: cycle time médio de 4 dias; PRs de feature entre 1 hora e 11,5 dias;
  throughput de 3, 2, 2, 0 e 0 PRs por semana; WIP de revisão chegou a 4 em 25/09,
  o dobro do limite.
- Gargalo nomeado: a fila de revisão. #33 e #34 esperaram 7 e 12 dias por aprovação.
  Lei de Little: WIP 3 ÷ 1,75 por semana ≈ 12 dias, exatamente o lead time do #27.

## Bloco 4 — A prática XP e a evidência (3:30–4:30) · Pedro

**Na tela:** histórico de commits do PR #34 (ou #33, #37).

- TDD: em cada PR da API o commit `test(...)` entra antes do `feat(...)`:
  `47bb6ca test(lotes)` → `5ef8c7b feat(lotes)`; `dcc5fbc test(coletas)` →
  `d1b5359 feat(coletas)`; `158b7b7 test(substratos)` → `a3cdf6f feat(substratos)`.
- O que o teste garantiu: etiqueta única sob concorrência e saldo de sementes por
  coleta, dois casos que não dá para conferir à mão.
- Revisão de código: `main` protegida desde 18/09 (PR obrigatório, 1 aprovação, CI
  verde, sem exceção para admin); todos os PRs de feature com aprovação de outro
  integrante. O que não funcionou: a revisão demorou (bloco 3), por isso a ação da retro.

## Bloco 5 — A retrospectiva (4:30–5:00) · Levy

**Na tela:** `docs/retrospectiva-01.md`, seção Ações.

- O principal problema, com o dado: fila de revisão e 12 dias sem commit após o
  adiamento de 03/10.
- As ações (no máximo três), cada uma com responsável e prazo verificável na Sprint 2.
- Fechar: "Sprint 2 é a entrega final, em 30/11: quadro de lotes, destino final,
  visitas, página da espécie e mapa."
