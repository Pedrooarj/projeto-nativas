# Escopo

O que o sistema faz, o que já existe neste repositório, o que a equipe ainda vai
construir e o que ficou de fora. As regras que governam cada fluxo estão em
[regras-de-negocio.md](regras-de-negocio.md).

## O que o sistema faz

O voluntário registra a coleta de sementes com a coordenada da matriz. Dessa
coleta nascem lotes de mudas, cada um com uma etiqueta única gerada pelo sistema.
O lote avança de etapa até receber um destino final — plantio definitivo, doação
ou perda. Cada plantio definitivo vira um ponto no mapa público e sobe o contador
do portal.

A promessa é essa: **o registro operacional alimenta a comunicação pública**. O
voluntário registra porque é mais fácil que o caderno; a transparência sai como
subproduto.

## Telas

### Portal público

| Rota | Tela |
|---|---|
| `/` | página principal com âncoras: início, sobre, ações, contadores, acervo em destaque, parceiros, mapa e rodapé |
| `/acervo` | lista de espécies com busca por nome e filtro por família |
| `/acervo/:id` | página da espécie: informações botânicas mais os números que o projeto já fez com ela |

### Sistema do viveiro

| Rota | Tela |
|---|---|
| `/sistema/login` | login com a conta compartilhada |
| `/sistema` | visão geral: contadores e últimos registros |
| `/sistema/coletas` | banco de sementes: coletas com o saldo de sementes de cada uma |
| `/sistema/lotes` | quadro de três colunas (Etapa 1, Etapa 2, Destino final), cadastro de lote, avançar etapa e registrar destino |
| `/sistema/especies` | cadastro de espécies e conteúdo do acervo |
| `/sistema/visitas` | registro de visitas recebidas |
| `/sistema/configuracoes` | listas de colaboradores e de substratos |

## O que já está pronto no esqueleto

**Banco.** O `schema.prisma` inteiro, com os seis enums, as dez tabelas, os
índices e o soft delete. A migration inicial e um seed com 12 espécies reais da
Caatinga, 6 coletas, 10 lotes distribuídos entre as etapas, 3 destinos finais e 4
visitas.

**API.** Autenticação com JWT, middleware de erro com formato único
(`{ erro, mensagem, detalhes? }`), CORS, helmet e rate limit no login. Os
endpoints:

```
GET    /health
POST   /api/v1/auth/login          GET  /api/v1/auth/eu
GET    /api/v1/colaboradores
GET    /api/v1/especies            GET  /api/v1/especies/:id
POST   /api/v1/especies            PATCH /api/v1/especies/:id     (admin)
GET    /api/v1/publico/metricas
```

**Utilitário de etiqueta.** `api/src/shared/gerarTag.ts` implementa a RN-01
inteira, com o controle de concorrência e teste — inclusive o de duas chamadas
simultâneas com o mesmo prefixo. O endpoint que usa isso ainda não existe: quem
construir `POST /lotes` chama essa função dentro da transação do cadastro.

**Front.** Estrutura de rotas pública e protegida, contexto de autenticação com o
token no localStorage, cliente de API tipado, os oito componentes de interface
(`Botao`, `Campo`, `Select`, `Badge`, `Card`, `Modal`, `Tabela`, `Toast`) e o
design system no `tailwind.config.ts`.

Três telas funcionam de ponta a ponta: o **portal** com os contadores consumindo
`/publico/metricas` de verdade, o **login** e a tela de **espécies** com lista,
busca e formulário em modal. As demais são placeholders identificados.

> `/sistema/especies` é a tela de referência: quem for construir coleta, lote ou
> visita copia o padrão dela — buscar da API, listar, abrir modal, salvar, tratar
> erro de validação e confirmar na tela.

## O que a equipe vai construir

### API

| Endpoint | Regra que governa |
|---|---|
| `GET /coletas` · `POST /coletas` | RN-05, RN-06 |
| `GET /substratos` | — |
| `POST /lotes` | RN-01, RN-02, RN-05, RN-06 |
| `GET /lotes/quadro` · `GET /lotes/:id` | RN-03 |
| `POST /lotes/:id/transicao` | RN-03 |
| `POST /lotes/:id/destino` | RN-04 |
| `GET /visitas` · `POST /visitas` | RN-06 |
| `GET /publico/mapa` | RN-04 (só plantio definitivo aparece) |
| `GET /publico/especies` · `GET /publico/especies/:id` | RN-08 |

Nenhum arquivo vazio foi criado para eles de propósito: um stub vazio parece
pronto e não é.

### Front

- Quadro de lotes com as três colunas, rolagem horizontal com *snap* no celular
- Formulários de coleta, lote, transição de etapa e destino final
- Tela de confirmação com a etiqueta gerada, em mono, e a instrução de anotar na
  plaqueta
- Acervo público: lista, filtro por família e página da espécie
- Mapa com os dois tipos de ponto (matrizes e plantios) e janela ao clicar
- Registro de visitas e telas de configuração

### Fora do código

- Levantamento do conteúdo botânico das 30 a 40 espécies com a coordenação
- Script de importação do acervo a partir da planilha-modelo
- Textos do portal: sobre, equipe, ações e parceiros
- Teste de campo no viveiro, com alguém da equipe registrando um lote de verdade

## Fora de escopo

Decisão, não esquecimento. Tudo aqui volta na v1.1 e serve como "trabalhos
futuros" no relatório.

- **Arrastar e soltar no quadro.** Há botão explícito, que funciona melhor com a
  mão suja de terra.
- **Modo offline** com fila de sincronização.
- **Upload de fotos pela interface.** O acervo entra por importação de planilha.
- **Relatórios** em PDF ou planilha, e gráficos de analytics interno.
- **Notificações** e lembretes de rega.
- PostGIS e consultas espaciais, inscrição em mutirões, área de doação e cadastro
  de voluntários pela tela.

## Ordem de corte

Se ficar claro que não cabe tudo no semestre, corte de cima para baixo. Decidido
com a cabeça fria para evitar a discussão ruim em cima da hora.

1. Galeria de fotos no acervo (fica só a foto principal)
2. Mapa pequeno na página da espécie
3. Registro de visitas (o contador vira número editado pelo admin)
4. Modal de detalhe do lote
5. Tela do banco de sementes (o saldo aparece só no formulário de lote)

**Nunca cortar:** login, coleta, lote com etiqueta, quadro com transições,
destino final com coordenada, acervo, contadores e mapa principal.
