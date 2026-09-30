# Uso de ferramentas de IA

Registro exigido pela [Sistemática de Avaliação, §9](https://github.com/fmarquesfilho/processos-2026-2/blob/main/docs/AVALIACAO.md#9-uso-de-ferramentas-de-ia)
da disciplina. Regra do time, alinhada à da disciplina: **toda contribuição
submetida precisa ser compreendida por quem a submeteu** — qualquer integrante pode
ser questionado sobre qualquer trecho nas apresentações.

## Regras internas

1. IA é usada para **entender e acelerar**, nunca para submeter o que não se sabe
   explicar. O teste antes de todo PR: consigo explicar cada linha?
2. Para quem está aprendendo (trilha do portal): IA serve para **explicar erros e
   conceitos**, não para gerar componentes prontos. A regra completa está em
   [`aprendendo-react.md`](aprendendo-react.md), seção 6.
3. Todo uso relevante entra na tabela abaixo, na sprint em que aconteceu.

## Registro

| Sprint | Ferramenta | Tarefa em que foi aplicada | Quem |
|---|---|---|---|
| 0 | Claude Code (Opus) | Geração do esqueleto do repositório a partir da documentação de concepção escrita pela equipe (`referencia/`): estrutura `api/` + `web/`, schema Prisma, seed, endpoints de auth/espécies/métricas, componentes de UI, design system, testes de etiqueta e contadores, e primeira versão dos docs. Todo o material foi revisado pelo PO; as regras de negócio e decisões técnicas são anteriores à geração e estão em `referencia/` | Pedro |
| 0 | Claude Code (Opus) | Organização dos artefatos da Sprint 0 (proposta, backlog, acordo de processo, roteiro do vídeo) a partir do guia da disciplina | Pedro |
| 1 | Claude Code (Fable 5.1) | Leitura da rubrica da Sprint 1 contra o estado do repositório (PRs sem aprovação formal, commits direto na `main`), criação das tarefas de processo S1-T1 a S1-T5 e da proteção da `main`. Na API, `GET /substratos` (#26), `POST /lotes` (#27) e `GET`/`POST /coletas` (#36), com os testes escritos e commitados antes da implementação. Em 25/09, leitura do guia da Sprint 1 do professor contra o repositório e reorganização do quadro (políticas de coluna, campos de prioridade, sprint, estimativa e datas). As decisões de contrato — o lote herda a espécie da coleta e a coleta fica travada na transação para o saldo valer sob concorrência — foram propostas pela ferramenta e aceitas pelo PO, que responde por elas | Pedro |

> Os fluxos centrais do produto — coletas, lotes, quadro, transições, destino final,
> acervo público e mapa — estão **reservados à equipe** e serão implementados pelos
> integrantes nas Sprints 1–3 (ver [`escopo.md`](escopo.md)). O esqueleto existe para
> padronizar a base; o trabalho avaliado das sprints é da equipe.
