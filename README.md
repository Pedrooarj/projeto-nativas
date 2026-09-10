# Projeto Nativas — Natureza viva e forte

> **DIM0510 Processos de Software · UFRN/DIMAp · 2026.2 — Equipe Nativas**
>
> | Integrante | Matrícula | GitHub | Papel |
> |---|---|---|---|
> | Pedro Otávio Medeiros de Araújo | `<matrícula>` | [@Pedrooarj](https://github.com/Pedrooarj) | Product Owner · API e modelagem |
> | Levy Fernandes Pereira | `<matrícula>` | `@<usuário>` | Scrum Master · sistema do viveiro |
> | Chistian Daniel Pereira da Silva | `<matrícula>` | `@<usuário>` | Desenvolvedor · portal e acervo |
>
> **Coorte de apresentação:** B (online) · **Sem integração** com outra disciplina.
> **Proposta:** [docs/proposta.md](docs/proposta.md) · **Quadro:** *(link do GitHub Projects)* · **Vídeo da Sprint 0:** *(link)*
> **Uso de IA:** [docs/uso-de-ia.md](docs/uso-de-ia.md)

Plataforma web do Projeto Nativas, projeto de extensão do CERES/UFRN em Caicó-RN
que coleta sementes de espécies nativas da Caatinga, produz mudas em viveiro e
replanta na região do Seridó. Hoje esse controle vive em caderno e planilha, o
que quebra a rastreabilidade da muda até a matriz de onde ela veio e deixa o
projeto sem número agregado para mostrar à universidade e aos parceiros.

São duas frentes sobre o mesmo banco de dados. O **portal público** apresenta o
projeto, o acervo de espécies e quatro contadores; o **sistema do viveiro**, com
login, registra coletas, lotes de mudas, o acompanhamento do crescimento e o
destino final de cada lote. O que a equipe registra no viveiro é o que aparece no
portal, sem planilha intermediária e sem ninguém atualizando o site à mão.

> Este repositório é o **esqueleto** do projeto: a estrutura, alguns fluxos de
> referência e a documentação. O que a equipe ainda vai construir está listado em
> [docs/escopo.md](docs/escopo.md).

## Pré-requisitos

| Ferramenta | Versão | Para quê |
|---|---|---|
| Node.js | 20 ou mais novo | rodar a API e o front |
| Docker Desktop | qualquer versão atual | subir o Postgres e o Adminer |
| Git | qualquer versão atual | clonar o repositório |

## Subindo o projeto

Testado do zero nesta ordem. São quatro passos e leva menos de 10 minutos.

### 1. Clonar e subir o banco

```bash
git clone <url-do-repositorio> nativas
cd nativas
docker compose up -d
```

Isso sobe dois contêineres: o Postgres 16 em `localhost:5433` e o Adminer em
<http://localhost:8080> (sistema `PostgreSQL`, servidor `banco`, usuário
`nativas`, senha `nativas`, base `nativas`).

> A porta do banco no host é a **5433**, não a 5432, para não brigar com um
> Postgres já instalado na máquina.

### 2. API

```bash
cd api
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

A API sobe em <http://localhost:3333>. Confira com
<http://localhost:3333/health> e <http://localhost:3333/api/v1/publico/metricas>.

### 3. Front

Em **outro terminal**, a partir da raiz do repositório:

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

O portal abre em <http://localhost:5173> com os contadores já preenchidos pela
API.

### 4. Entrar no sistema

Vá em <http://localhost:5173/sistema/login> e use uma das contas do seed.

| Conta | E-mail | Senha | Pode |
|---|---|---|---|
| Coordenação | `admin@nativas.ufrn.br` | `admin123` | tudo, inclusive cadastrar e editar espécies |
| Equipe do viveiro | `equipe@nativas.ufrn.br` | `equipe123` | registrar e consultar, sem editar espécies |

Estas senhas são de ambiente local e estão aqui de propósito. Em produção elas
não existem: o `.env` fica fora do Git e as contas são criadas à mão.

## Comandos

Rodados dentro de `api/`, exceto onde indicado.

| Comando | O que faz |
|---|---|
| `npm run dev` | sobe a API com recarga automática (em `web/`, sobe o front) |
| `npm run db:migrate` | cria e aplica uma migration a partir do `schema.prisma` |
| `npm run db:seed` | apaga tudo e recria os dados de exemplo |
| `npm run db:studio` | abre o Prisma Studio para olhar o banco |
| `npm test` | roda os testes (precisa do banco no ar) |
| `npm run build` | compila para produção |

## Estrutura de pastas

```
nativas/
├── docker-compose.yml       Postgres 16 + Adminer, só para desenvolvimento
├── CLAUDE.md                instruções para sessões de Claude Code neste repositório
├── docs/                    a documentação do projeto (links no fim deste arquivo)
├── referencia/              documentos de concepção do projeto, fonte das decisões
├── api/
│   ├── prisma/
│   │   ├── schema.prisma    fonte da verdade do modelo de dados
│   │   ├── migrations/      histórico de migrations, versionado
│   │   └── seed.ts          dados de exemplo para desenvolvimento
│   └── src/
│       ├── modules/         um módulo por entidade: rotas, service e schema Zod
│       ├── shared/          Prisma, erros, autenticação e geração de etiqueta
│       ├── app.ts           montagem do Express: middlewares e rotas
│       └── server.ts        só sobe o servidor
└── web/
    ├── public/
    │   ├── fonts/           PP Rader e TT Travels (ver README de lá)
    │   └── marca/           logo, slogan e elemento radial (ver README de lá)
    ├── tailwind.config.ts   paleta, tipografia e escala do design system
    └── src/
        ├── rotas/publicas/  portal e acervo
        ├── rotas/sistema/   telas com login
        ├── componentes/ui/  os oito componentes básicos da interface
        └── lib/             cliente da API, contexto de auth e enums do domínio
```

## Documentação

- [docs/escopo.md](docs/escopo.md) — o que o sistema faz, o que já está pronto,
  o que falta e o que ficou de fora de propósito
- [docs/regras-de-negocio.md](docs/regras-de-negocio.md) — RN-01 a RN-07, com
  detalhe suficiente para implementar sem perguntar
- [docs/como-contribuir.md](docs/como-contribuir.md) — branch, commit, PR e a
  definição de pronto
- [docs/aprendendo-react.md](docs/aprendendo-react.md) — trilha prática de React
  usando os arquivos deste repositório

## Se der errado

| Sintoma | Provável causa |
|---|---|
| `port is already allocated` no `docker compose up` | outro contêiner usa a 5433 ou a 8080; mude a porta do host no `docker-compose.yml` e no `DATABASE_URL` |
| `Can't reach database server` | o contêiner não subiu: rode `docker compose ps` |
| `Variáveis de ambiente inválidas ou ausentes` | faltou o `cp .env.example .env` dentro de `api/` |
| Contadores do portal em `—` | a API não está no ar, ou o `VITE_API_URL` do `web/.env.local` aponta para o lugar errado |
| `npm test` falhando na conexão | os testes usam o banco de verdade: suba o Docker e rode as migrations antes |
