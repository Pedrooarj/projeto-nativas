# CLAUDE.md

Instruções para sessões de Claude Code neste repositório.

## O que é

Plataforma do Projeto Nativas (extensão do CERES/UFRN, Caicó-RN): portal público
mais sistema de viveiro, sobre o mesmo banco. Contexto completo no
[README](README.md); regras em [docs/regras-de-negocio.md](docs/regras-de-negocio.md);
o que está pronto e o que falta em [docs/escopo.md](docs/escopo.md).

A equipe é de três estudantes, um deles aprendendo desenvolvimento web do zero.
Isso guia toda escolha: **prefira o simples e o explícito ao inteligente e ao
abstrato.** Sem padrão avançado, sem abstração prematura, sem mágica.

## Stack (fechada)

PostgreSQL 16 sem PostGIS · Node + Express + TypeScript + Prisma + Zod ·
Vite + React + TypeScript + React Router + Tailwind · Leaflet + React-Leaflet ·
JWT simples · Docker Compose só para banco e Adminer.

`api/` e `web/` são **dois projetos npm independentes**. Sem workspaces, sem
monorepo, sem pacote compartilhado. Os poucos enums duplicados ficam em
`web/src/lib/dominio.ts`, com `api/prisma/schema.prisma` como fonte da verdade.

## Camadas da API

```
rota (.routes.ts)     valida a entrada com Zod e chama o service
service (.service.ts) tem a regra de negócio e fala com o Prisma
schema (.schema.ts)   os schemas Zod do módulo
```

**Não existe camada de repositório**, e não deve passar a existir. Para este
tamanho de projeto ela só adiciona arquivo.

Erro sempre no formato `{ erro, mensagem, detalhes? }`, montado pelo middleware
`shared/tratarErros.ts`. Para lançar um erro previsto, use os construtores de
`shared/erros.ts` (`naoEncontrado`, `conflito`, `invalido`, ...), nunca um
`res.status(...)` solto no meio do service.

## Convenções

- **Nomes de domínio em português** (`Especie`, `criarLote`, `qtdSementes`);
  palavras da linguagem em inglês (`function`, `async`, `map`).
- **Colunas do banco em snake_case**, via `@map` no `schema.prisma`. Os campos do
  Prisma continuam camelCase.
- **Validação sempre na API.** O front valida para dar feedback rápido; a API
  valida para garantir integridade. Nunca só no formulário.
- **O responsável nunca vem do token** (RN-06). Como a equipe compartilha o
  login, `colaboradorId` vem no corpo da requisição.
- Texto de interface e mensagem de erro em português **com acento**. Vocabulário
  do viveiro ("muda", "lote", "etiqueta", "setor"), não do banco de dados.
- Comentário só para decisão não evidente. Nada de comentário que repete o código.
- Sem `console.log` esquecido e sem credencial no código.

## Design

A paleta e a tipografia estão em `web/tailwind.config.ts`, com os nomes que o
projeto usa (`verde`, `areia`, `madeira`, `azul`...). Duas regras que não podem
ser quebradas:

1. **Texto sobre `verde` é sempre `verdeTinta`, nunca branco.** O verde da marca
   é claro e branco em cima não passa em AA. `verde` e `verdeClaro` também não
   servem como texto sobre branco ou areia — só como fundo ou marcador.
2. **O azul é acento de georreferenciamento**, não cor de interface: pinos,
   coordenadas, "usar minha localização" e confirmação de plantio definitivo.

O sistema é mobile-first por necessidade operacional (sol forte, luva, uma mão
livre): alvo de toque de 48px, formulário em uma coluna, botão primário de
largura total. Rótulo de campo é sempre mono, maiúsculo, `madeira`.

Não instale biblioteca de componentes. Os oito componentes de
`web/src/componentes/ui/` são propositalmente simples e com props explícitas.

## O que NÃO fazer

- **Não instalar biblioteca de UI** (MUI, shadcn, Chakra, Radix) nem de
  formulário ou estado global. O que existe basta.
- **Não criar camada de repositório**, DTOs, mappers ou casos de uso.
- **Não implementar os fluxos reservados à equipe.** Coletas, lotes, quadro,
  transição de etapa, destino final, visitas, substratos e os endpoints públicos
  do acervo e do mapa são as tarefas de aprendizado dos estudantes. A lista está
  em [docs/escopo.md](docs/escopo.md). Se pedirem para construir um deles, tudo
  bem — mas não faça por conta própria "já que estava ali".
- **Não criar arquivo vazio ou stub** para o que ainda não existe. Um stub vazio
  parece pronto e não é.
- **Não trocar a stack** nem adicionar PostGIS, Next.js, workspaces ou pacote
  compartilhado. As alternativas já foram avaliadas e recusadas — o raciocínio
  está em `referencia/02-decisoes-tecnicas.md`.
- **Não inventar conteúdo botânico** para as espécies. Descrição, porte, épocas,
  usos e fotos vêm da coordenação por planilha. Acervo com texto inventado é pior
  que acervo vazio.

## Comandos úteis

```bash
docker compose up -d              # banco em localhost:5433, Adminer em :8080
cd api && npm run dev             # API em localhost:3333
cd api && npm test                # precisa do banco no ar
cd api && npm run db:seed         # apaga tudo e recria os dados de exemplo
cd web && npm run dev             # front em localhost:5173
```
