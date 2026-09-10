# 02 — Decisões técnicas

## Stack

```
Banco       PostgreSQL 16
API         Node + Express + TypeScript + Prisma + Zod
Front       Vite + React + TypeScript + React Router + Tailwind
Mapa        Leaflet + React-Leaflet
Auth        JWT simples
Deploy      VPS com Docker (API + banco) · Vercel ou Netlify (front)
```

A stack foi escolhida pelo que **esta equipe termina em um semestre**, não pelo que é
tecnicamente superior. Toda tecnologia que ninguém domina é dívida paga em semanas de aula.

### Por que estas escolhas

**Express, não Fastify.** Um dos integrantes já usou Express. A diferença de performance é
irrelevante num viveiro com cinco usuários, e Express tem mais resposta pronta quando alguém
travar às 23h.

**Vite + React Router, não Next.js.** O App Router traz Server Components, fronteira
`"use client"`, cache e convenções de arquivo — conceitos que ninguém da equipe conhece. Para
quem está começando, é a diferença entre aprender React e aprender React mais um framework
por cima. Perde-se SEO do portal; meta tags Open Graph no `index.html` cobrem o que o projeto
precisa, que é link decente ao compartilhar.

**PostgreSQL sem PostGIS.** Coordenadas ficam como `Decimal(9,6)`. O Leaflet quer dois
números, não geometria. PostGIS só serve para consultas espaciais que não estão no escopo, e
é a parte da stack com maior chance de consumir uma semana em erro de extensão e ordem de
coordenada. A migration fica escrita e é aditiva — se sobrar tempo, entra sem refazer nada.

**Dois projetos npm independentes**, `api/` e `web/`, sem workspaces e sem pacote
compartilhado. Resolução de import e build de pacote compartilhado viram atrito cedo demais.
Os poucos enums duplicados ficam em `web/src/lib/dominio.ts`, com comentário apontando
`api/prisma/schema.prisma` como fonte da verdade.

**Sem camada de repositório.** A rota valida com Zod e chama o service; o service tem a regra
e fala com o Prisma. Para este tamanho, repositório só adiciona arquivo.

---

## Estrutura

```
nativas/
├── docker-compose.yml          postgres + adminer
├── README.md
├── CLAUDE.md
├── docs/
├── api/
│   ├── prisma/{schema.prisma, seed.ts}
│   └── src/
│       ├── modules/<entidade>/{routes, service, schema}.ts
│       ├── shared/{prisma, erros, autenticar, tratarErros, gerarTag}.ts
│       └── app.ts, server.ts
└── web/
    └── src/
        ├── rotas/{publicas, sistema}/
        ├── componentes/ui/
        ├── lib/{api, auth, dominio}.ts
        └── App.tsx, main.tsx
```

---

## Modelo de dados

Enums: `Papel` (ADMIN, EQUIPE) · `MetodoQuebra` (ESCARIFICACAO, EMBEBICAO, N) ·
`TipoRecipiente` (TUBETE, SEMENTEIRA, SACO, CANO) · `SetorViveiro` (BANCO_SEMENTES,
CANTEIROS, SEMENTEIRAS, RUSTIFICACAO) · `Estagio` (ESTAGIO_1, ESTAGIO_2, FINALIZADO) ·
`TipoDestino` (PLANTIO_DEFINITIVO, DOACAO, PERDA).

| Entidade | Campos principais |
|---|---|
| **Usuario** | email, senhaHash, papel. Só para login; a equipe compartilha uma conta |
| **Colaborador** | nome, ativo. Lista de nomes sem login — é o "quem está registrando" |
| **Substrato** | nome, ativo. Lista fixa editável pelo admin |
| **Especie** | nomeComum, nomeCientifico, familia, descricao, porte, epocaFloracao, epocaFrutificacao, usos[], fotoPrincipalUrl, galeria[] |
| **Coleta** | especieId, matrizLat, matrizLng, qtdSementes, dataColeta, localDescricao, colaboradorId |
| **LoteMudas** | tagUnica, especieId, coletaId, dataPlantio, qtdSementes, qtdMudasVivas, tipoRecipiente, tratamentoSemente, substratoId, setor, identificacaoFina, estagioAtual, colaboradorId |
| **HistoricoCrescimento** | loteId, estagioAnterior, estagioNovo, recipienteNovo, setorNovo, observacao, colaboradorId |
| **DestinoFinal** | loteId (1:1), tipo, data, quantidade + campos por tipo: destinoLat/Lng/localDescricao, destinatario, causa |
| **Visita** | data, instituicao, numeroPessoas, observacao, colaboradorId |
| **ContadorTag** | prefixo, proximo |

Coordenadas em `Decimal(9,6)`. Colunas em snake_case via `@map`. Índices em
`lote_mudas.estagio_atual`, `lote_mudas.especie_id`, `coleta.especie_id`,
`especie.nome_comum`.

**Colaborador não é Usuario.** Confundir os dois é o erro mais provável de quem chegar depois:
Usuario faz login, Colaborador é só um nome escolhido no formulário.

---

## API

REST, JSON, prefixo `/api/v1`, JWT em `Authorization: Bearer`.

```
POST   /auth/login                  GET  /auth/eu
GET    /colaboradores               GET  /substratos
GET    /especies                    GET  /especies/:id
POST   /especies                    PATCH /especies/:id        (admin)
GET    /coletas                     POST /coletas
GET    /lotes/quadro                GET  /lotes/:id            POST /lotes
POST   /lotes/:id/transicao         POST /lotes/:id/destino
GET    /visitas                     POST /visitas
GET    /publico/metricas            GET  /publico/mapa
GET    /publico/especies            GET  /publico/especies/:id
```

Erro sempre no mesmo formato: `{ erro, mensagem, detalhes? }`. Códigos: `401` sem token,
`403` sem permissão, `404` não encontrado, `409` conflito de regra (transição inválida),
`422` falha de validação.

O `responsavel` vem do corpo da requisição (RN-06), nunca do token. Os endpoints públicos não
expõem nome de colaborador — é a fronteira de privacidade do sistema.

---

## Ambientes e deploy

| Ambiente | Front | API | Banco |
|---|---|---|---|
| Local | `localhost:5173` | `localhost:3333` | Docker local |
| Produção | Vercel ou Netlify | VPS + Nginx + TLS | VPS |

```
DATABASE_URL=postgresql://user:senha@host:5432/nativas
JWT_SECRET=            JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

`.env` nunca vai para o Git; `.env.example` vai, com as chaves e sem os valores.

**Backup:** `pg_dump` diário por cron, retenção de 7 dias, guardado fora da máquina. É dado
de campo real — perder o banco significa perder registros que ninguém reconstrói. Uma linha de
cron custa cinco minutos.

**Segurança mínima:** senha com argon2 ou bcrypt custo 12 · rate limit de 5 tentativas por
minuto no login · CORS restrito · helmet · toda entrada validada por Zod antes do service.

---

## Importação do acervo

O conteúdo botânico das 30 a 40 espécies não é digitado tela a tela. Fluxo:

1. Planilha-modelo com uma linha por espécie e as colunas do acervo, preenchida pela
   coordenação
2. Pasta de fotos nomeadas pelo nome científico (`spondias-tuberosa-1.jpg`)
3. Script de importação que lê a planilha, sobe as fotos e cria ou atualiza as espécies —
   roda quantas vezes for preciso conforme o conteúdo chega

A tela de cadastro continua existindo para correções pontuais. Upload pela interface fica
para a v1.1.

---

## Decisões adiadas

PostGIS com consultas espaciais · upload de imagens por URL assinada em object storage ·
modo offline com fila de sincronização · analytics internos.
