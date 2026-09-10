# Roteiro do vídeo — Sprint 0

**Duração alvo: 5 minutos.** Estrutura exigida pelo guia da disciplina: equipe (30s) ·
visão (1:30) · MVP (1:30) · processo (1:30). **Todos os integrantes falam.**

Formato sugerido: chamada no Google Meet com gravação ligada, cada um apresenta sua
parte compartilhando a tela indicada. Publicar no YouTube como **não listado** e
colar o link no `README.md` e na `proposta.md` (§7). Um ensaio cronometrado antes de
gravar evita estourar os 5 minutos.

---

## Bloco 1 — Equipe (0:00–0:30) · Pedro

**Na tela:** README do repositório, seção da equipe.

- "Somos a equipe Nativas: Pedro Otávio, Levy Fernandes e Chistian Daniel."
- Papéis em uma frase cada: "Eu sou o Product Owner e cuido da API e da modelagem;
  o Levy é o Scrum Master e cuida do sistema do viveiro; o Chistian cuida do portal
  público e do acervo."
- "Apresentamos na coorte B, online. O repositório é público:
  github.com/Pedrooarj/projeto-nativas."

## Bloco 2 — Visão do produto (0:30–2:00) · Chistian

**Na tela:** `docs/proposta.md`, seção 1; depois uma foto/slide do viveiro, se houver.

- O contexto: "O Projeto Nativas é um projeto de extensão real do CERES/UFRN em
  Caicó. Ele coleta sementes de espécies nativas da Caatinga, produz mudas em
  viveiro e replanta na região."
- O problema, com as três perdas: "Hoje o controle é caderno e planilha. Isso quebra
  a rastreabilidade — uma muda plantada não diz de que árvore veio —, impede
  qualquer número agregado, tipo taxa de germinação, e deixa o projeto sem
  transparência para a universidade e os parceiros."
- A proposta: "Nossa plataforma liga o registro do viveiro ao portal público. Quando
  um voluntário registra um plantio, o contador sobe e o ponto aparece no mapa, na
  hora, sem planilha no meio."
- O usuário que manda: "O sistema é mobile-first porque quem registra está em pé no
  viveiro, de luva, no sol. Se o formulário não funcionar ali, nada do resto existe."

## Bloco 3 — MVP (2:00–3:30) · Pedro

**Na tela:** `docs/proposta.md`, seção 2 (tabela dentro/fora); no fim, o portal
rodando em `localhost:5173` com os contadores.

- O que entra: "O MVP é o ciclo completo da muda: coleta com coordenada da matriz,
  lote com etiqueta única gerada pelo sistema, quadro de etapas, destino final, e o
  lado público — acervo, contadores e mapa."
- O que fica fora, de propósito: "Deixamos fora upload de foto, modo offline,
  relatórios e app nativo. Está tudo declarado na proposta — é decisão, não
  esquecimento."
- Hipótese de valor: "Acreditamos que a equipe vai trocar o caderno pelo celular
  porque o formulário é mais curto e devolve a etiqueta pronta para a plaqueta."
- Critérios de sucesso: "Registrar um lote em menos de 2 minutos, 100% dos lotes
  rastreáveis até a matriz, e qualquer pessoa sobe o projeto em 10 minutos pelo
  README."
- Mostrar o portal: "A base já está de pé: esses quatro contadores vêm da API,
  calculados de registros reais do banco."

## Bloco 4 — Processo (3:30–5:00) · Levy

**Na tela:** o quadro no GitHub Projects; depois a Definição de Pronto na proposta.

- Cadência: "Sprints de três semanas, alinhadas à disciplina. Planning na segunda,
  daily assíncrona no WhatsApp até as 10h, weekly de 30 minutos na quarta, e review
  com retrospectiva na sexta da entrega — a retro vira arquivo no repositório, com
  ação, responsável e prazo."
- O quadro, apontando na tela: "Cinco colunas, do Backlog ao Pronto. WIP de 3 em
  progresso — um item por pessoa — e de 2 em revisão: fila de revisão cheia
  significa revisar antes de pegar coisa nova. As 12 histórias já estão priorizadas
  e estimadas."
- Definição de Pronto, mostrando o checklist: "Um item só sai de revisão com o
  critério de aceite atendido, a regra validada na API, testado em tela de celular,
  CI verde e aprovação de outro integrante."
- Colaboração: "Todo PR é revisado por quem não escreveu. Eu cuido do quadro e das
  cerimônias como Scrum Master; o Pedro prioriza como PO."
- Fechamento (uma frase): "Sprint 1 começa dia 14 com o fluxo de coleta e lote —
  obrigado!"

---

## Checklist antes de publicar

- [ ] Deu ~5 minutos (tolerância pequena; corte o que passar)
- [ ] Os três aparecem falando
- [ ] O quadro Kanban aparece na tela, já configurado
- [ ] Áudio audível nos três trechos
- [ ] Publicado no YouTube (não listado) e link colado no `README.md` e na
      `proposta.md` §7
