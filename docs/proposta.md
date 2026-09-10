# Proposta — Projeto Nativas

**DIM0510 Processos de Software · 2026.2 · Sprint 0**
Equipe Nativas · Coorte B (online)

---

## 1. Visão do produto

```
Para  a equipe do viveiro do Projeto Nativas (CERES/UFRN, Caicó-RN) e para quem
      acompanha o projeto de fora — coordenação, parceiros e universidade

Que   registra coletas, mudas e plantios em caderno e planilha, e por isso não
      consegue dizer de qual árvore veio uma muda plantada nem mostrar resultado
      agregado sem recontar tudo à mão

O     Nativas é uma plataforma web de rastreabilidade de produção de mudas nativas

Que   liga cada muda plantada à semente e à árvore matriz de origem, e publica os
      números do projeto automaticamente

Diferente de  planilhas compartilhadas e do caderno de campo

Nosso produto  faz o registro operacional do viveiro alimentar o portal público na
      hora, sem digitação dupla e sem ninguém atualizando o site
```

### O problema é real e delimitado

O Projeto Nativas é um projeto de extensão em atividade no CERES/UFRN em Caicó-RN:
coleta sementes de espécies nativas da Caatinga, produz mudas em viveiro e replanta
na região do Seridó. O controle vive hoje em caderno e planilha, com três perdas
concretas levantadas junto à coordenação:

1. **Rastreabilidade quebrada.** Uma muda plantada não aponta de qual matriz veio.
   Sem a coordenada da árvore-mãe, ninguém volta à mesma árvore no ano seguinte.
2. **Nenhum dado agregado.** Não há como responder "qual a taxa de germinação do
   umbuzeiro este ano" sem recontar tudo manualmente.
3. **Transparência limitada.** Projeto de extensão precisa prestar contas à
   universidade e aos parceiros, e planilha não comunica.

Os usuários são três perfis com contextos distintos: a **equipe do viveiro** (em pé,
celular na mão, luva com terra, sol forte), a **coordenação** (notebook, cadastro e
visão agregada) e o **visitante do portal** (quer entender o projeto em 15 segundos).
O primeiro perfil define as decisões de interface — se o formulário não funcionar com
o polegar sujo de terra, o dado não é registrado e o resto perde o sentido.

---

## 2. Definição do MVP

| No MVP | Fora do MVP |
|---|---|
| Login com conta compartilhada pela equipe | Cadastro de voluntários pela tela |
| Registro de coleta com coordenada da matriz | Modo offline com fila de sincronização |
| Cadastro de lote com etiqueta única automática (`A-102`) | Arrastar e soltar no quadro (haverá botão explícito) |
| Quadro de acompanhamento com transição de etapas | Upload de fotos pela interface (entra por planilha) |
| Destino final: plantio definitivo, doação ou perda | Relatórios em PDF, planilha e analytics internos |
| Acervo de espécies: lista com busca e página individual | Notificações e lembretes de rega |
| Contadores públicos calculados dos registros reais | PostGIS e consultas espaciais |
| Mapa com matrizes e plantios definitivos | Aplicativo móvel nativo |
| Registro de visitas recebidas | Inscrição em mutirões e área de doação |

### Hipótese de valor

> Acreditamos que a **equipe do viveiro** vai **registrar coleta e lote pelo celular,
> no lugar do caderno**, porque o formulário é mais curto que a anotação manual e
> devolve a etiqueta pronta para copiar na plaqueta — e que a **coordenação** vai
> **usar o portal para prestar contas**, porque os números são verificáveis e sobem
> sozinhos.

### Critérios de sucesso do MVP

1. Um voluntário registra um lote completo no celular, sem ajuda, em menos de 2 min.
2. **100% dos lotes** no banco apontam para uma coleta com coordenada de matriz.
3. Os quatro contadores do portal batem com a conferência manual do banco.
4. Uma pessoa de fora sobe o projeto em menos de 10 minutos seguindo só o `README.md`.

O MVP é viável em quatro sprints: o modelo de dados, a API de autenticação, os
contadores públicos e o cadastro de espécies já estão de pé (ver §4), e os fluxos
restantes são variações do mesmo padrão de tela e de service.

---

## 3. Backlog inicial

O backlog vive no **GitHub Projects** deste repositório, em quadro Kanban:

**Quadro:** <https://github.com/users/Pedrooarj/projects/1>

13 histórias escritas como resultado para o usuário, todas priorizadas (P1 essencial
ao MVP, P2 importante, P3 desejável) e estimadas em pontos (escala Fibonacci). As
cinco do topo, com critérios de aceitação:

| Prio | História | Critérios de aceitação | Pts | Sprint |
|---|---|---|---|---|
| P1 | Como voluntário, quero **registrar uma coleta** com a coordenada da matriz, para voltar à mesma árvore no ano seguinte | Espécie, quantidade, data e coordenada obrigatórias; lat/lng validadas; "quem está registrando" escolhido na lista | 5 | 1 |
| P1 | Como voluntário, quero **cadastrar um lote** a partir de uma coleta e receber uma etiqueta única, para identificar a bandeja na plaqueta | Etiqueta `<INICIAL>-<SEQUENCIAL>` gerada pelo sistema e imutável; duas requisições simultâneas nunca recebem a mesma; soma de sementes não passa a da coleta | 8 | 1 |
| P1 | Como voluntário, quero **avançar um lote de etapa** registrando recipiente e setor, para saber onde cada muda está hoje | Etapa 1 aceita tubete/sementeira e etapa 2 saco/cano; não se volta etapa (409); toda transição grava histórico | 8 | 2 |
| P1 | Como voluntário, quero **registrar o destino final** do lote, para fechar o ciclo da muda | Plantio exige lat, lng e descrição; doação exige destinatário; operação atômica; só plantio entra no contador | 8 | 2 |
| P1 | Como visitante, quero **ver os números do projeto** no portal, para confiar que ele entrega resultado | Quatro contadores calculados dos registros reais, sem digitação; cache de 5 min | 3 | 1 |

As oito restantes (conteúdo do portal, acervo, página da espécie, mapa, visitas,
cadastro de espécies, saldo de sementes e importação por planilha) estão no quadro com prioridade e
estimativa.

---

## 4. Stack tecnológico e justificativa

| Camada | Escolha |
|---|---|
| Banco | PostgreSQL 16, sem PostGIS |
| API | Node + Express + TypeScript + Prisma + Zod |
| Front | Vite + React + TypeScript + React Router + Tailwind CSS |
| Mapa | Leaflet + React-Leaflet |
| Autenticação | JWT |
| Infra local | Docker Compose (banco + Adminer) |
| CI | GitHub Actions |

A stack foi escolhida pelo que **esta equipe termina em um semestre**, não pelo que é
tecnicamente superior. Toda tecnologia que ninguém domina é dívida paga em semanas de
aula. Três decisões merecem registro:

- **Express, não Fastify.** Um integrante já usou Express, e a diferença de
  desempenho é irrelevante para um viveiro com cinco usuários.
- **Vite + React Router, não Next.js.** O App Router traz Server Components,
  fronteira `"use client"` e convenções de arquivo — para quem está começando, é a
  diferença entre aprender React e aprender React mais um framework por cima. O SEO
  perdido é coberto por meta tags Open Graph no `index.html`.
- **PostgreSQL sem PostGIS.** Coordenadas ficam como `Decimal(9,6)`. O Leaflet quer
  dois números, não geometria; PostGIS só serviria a consultas espaciais fora do MVP
  e é a parte da stack com maior chance de consumir uma semana em erro de extensão.

`api/` e `web/` são dois projetos npm independentes, sem workspaces e sem pacote
compartilhado — resolução de import e build de pacote compartilhado viram atrito cedo
demais.

**Já implementado na Sprint 0**, como prova de viabilidade: modelo de dados completo
com migration e seed, autenticação JWT, contadores públicos com cache, cadastro de
espécies ponta a ponta, geração de etiqueta com controle de concorrência e testes,
e o design system em Tailwind. O detalhe do que está pronto e do que falta está em
[`docs/escopo.md`](escopo.md).

---

## 5. Acordo de processo

### Cadência

Sprints de três semanas, alinhadas ao cronograma da disciplina. **Planning** na
segunda que abre a sprint; **fechamento** na sexta da entrega, às 23:59.

| Sprint | Período | Entrega |
|---|---|---|
| 1 | 14/09 a 02/10 | 02/10 |
| 2 | 05/10 a 23/10 | 23/10 |
| 3 | 26/10 a 20/11 | 20/11 |

### Cerimônias

| Cerimônia | Quando | Duração | Formato |
|---|---|---|---|
| Sprint Planning | segunda de abertura | 60 min | Google Meet, os três |
| Daily assíncrona | todo dia útil, até 10h | 5 min | grupo no WhatsApp: fiz / farei / travei |
| Weekly | quarta, após a aula | 30 min | presencial ou Meet |
| Review + Retrospectiva | sexta da entrega | 60 min | Meet; a retro vira `docs/retrospectiva-NN.md` com ações, responsável e prazo |

**Regra de desbloqueio:** travou 40 minutos no mesmo erro, manda no grupo com o erro
inteiro e o que já tentou. Não existe pergunta boba; existe pessoa parada dois dias.

### Definição de Pronto

Um item só sai de "Em revisão" quando **todas** as condições valem:

- [ ] Critério de aceitação da história atendido, no fluxo real e não só no caso feliz
- [ ] Regra de negócio validada **na API**, não apenas no formulário
- [ ] Testado em tela de celular (largura de 390 px)
- [ ] CI verde no pull request
- [ ] PR revisado e **aprovado por outro integrante**
- [ ] Documentação atualizada, se mudou contrato ou regra de negócio
- [ ] Sem `console.log` esquecido nem credencial no código
- [ ] Cartão movido para "Pronto" e vinculado ao PR que o fechou

### Papéis

| Integrante | Papel | Trilha | Revisa PR de |
|---|---|---|---|
| Pedro Otávio | **Product Owner e Scrum Master** · arquitetura e modelagem | API e banco · mapa público · apoio às duas trilhas | Levy e Chistian |
| Levy Fernandes | Desenvolvedor | Sistema do viveiro: quadro de lotes, formulários e CRUDs | Pedro e Chistian |
| Chistian Daniel | Desenvolvedor | Portal público e acervo · teste de campo no viveiro | Levy |

Todo PR precisa de **uma aprovação de quem não o escreveu**. O Pedro acumula PO e
Scrum Master — decide prioridade e cuida do quadro e das cerimônias. Sabemos que o
Scrum recomenda separar os dois papéis; numa equipe de três, a mitigação é a
**retrospectiva ser facilitada em rodízio por Levy e Chistian**, para que quem
prioriza o escopo não seja também quem julga o próprio processo.

As trilhas foram divididas pela dificuldade real de cada peça, não por área do
produto. O **quadro de acompanhamento** é o pedaço mais difícil do frontend — mistura
estado, chamada assíncrona, modal condicional e regra de transição — e vai para quem
tem mais experiência. O **mapa público**, com dois tipos de marcador, ícones próprios
e janela ao clicar, fica com o PO, junto com toda a API.

A trilha de quem está aprendendo web é **progressiva dentro da própria sprint**:
começa pelas seções estáticas do portal (conteúdo e Tailwind, resultado visível na
hora), avança para o **acervo com busca e filtro** — que já exige estado, chamada à
API e lista renderizada — e depois para a página da espécie. O passo a passo,
apontando arquivo por arquivo, está em [`aprendendo-react.md`](aprendendo-react.md).
A regra é que ninguém recebe uma peça sem ter feito a anterior, e quando a fila
apertar o PO puxa a peça mais complexa para si em vez de deixar alguém travado.

### Ferramentas

| Para | Ferramenta |
|---|---|
| Código, revisão e backlog | GitHub (repositório público + GitHub Projects) |
| Integração contínua | GitHub Actions |
| Conversa do dia a dia | Grupo no WhatsApp |
| Cerimônias | Google Meet |
| Decisões e registros | `docs/` no próprio repositório |
| Inspeção do banco | Adminer e Prisma Studio |

### WIP limits

| Coluna | Limite | Por quê |
|---|---|---|
| Backlog | — | — |
| Sprint Backlog | 8 itens | o que cabe em três semanas com três pessoas |
| Em progresso | **3** | um item por pessoa; ninguém começa o segundo antes de fechar o primeiro |
| Em revisão | **2** | fila cheia significa revisar antes de pegar item novo |
| Pronto | — | — |

---

## 6. Equipe

| Integrante | Matrícula | GitHub | Papel |
|---|---|---|---|
| Pedro Otávio Medeiros de Araújo | 20230089892 | [@Pedrooarj](https://github.com/Pedrooarj) | Product Owner e Scrum Master · API e modelagem |
| Levy Fernandes Pereira | 20230052613 | [@levyingx](https://github.com/levyingx) | Desenvolvedor · sistema do viveiro |
| Chistian Daniel Pereira da Silva | 20230053030 | [@ChisSilva](https://github.com/ChisSilva) | Desenvolvedor · portal e acervo |

---

## 7. Coorte, quadro e integração

- **Coorte de apresentação:** **B — online**, por Google Meet.
  Sprint 1: 28/09 · Sprint 2: 19/10 · Sprint 3: 16/11 · Entrega final: 07/12.
- **Quadro no GitHub Projects:** <https://github.com/users/Pedrooarj/projects/1>
- **Vídeo da Sprint 0:** *(link)*
- **Integração com outra disciplina:** não há. O Projeto Nativas é conduzido apenas em
  DIM0510 Processos de Software.
