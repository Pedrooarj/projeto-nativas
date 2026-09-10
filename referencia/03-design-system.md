# 03 — Design system

**A fonte da verdade visual é o [protótipo validado no Claude Design](https://claude.ai/code/artifact/cb3adc0e-a497-46ff-adb0-380014f34c28)**
(`Nativas Principal`, `Nativas Acervo`, `Nativas Especie`, `Nativas Viveiro`). Este documento traz o que o protótipo
não carrega sozinho: os valores exatos, o raciocínio por trás das escolhas e as regras que
precisam valer em telas que ainda não foram desenhadas.

> Revisado em 09/09/2026 contra o protótipo. Itens marcados **[alterado]** divergiam da versão
> anterior deste documento; **[não implementado]** existe como regra mas ainda não aparece em tela.

---

## Cores

```ts
// tailwind.config.ts → theme.extend.colors
verde:        "#7B982C"   // verde da marca — botões primários, sidebar do sistema, marcador da linha do tempo
verdeHover:   "#8AA836"   // hover do botão primário
verdeEscuro:  "#3F4F17"   // seção de números, títulos de seção do portal, links, botões secundários
verdeTinta:   "#1B2410"   // texto sobre `verde`, fundo do rodapé e do menu mobile
verdeClaro:   "#B8CF5A"   // rótulos mono sobre fundo escuro
verdePalido:  "#D6DFB0"   // texto secundário sobre fundo escuro
broto:        "#EEF2DD"   // fundo de chip/estado suave (borda #B5C48A)
madeira:      "#7A4B27"   // rótulos de formulário, categorias, texto de erro
madeiraTint:  "#FBEFE6"   // fundo da mensagem de erro
areia:        "#FAF6EC"   // fundo geral
areiaEscura:  "#EFE9DA"   // fundo do mapa e de blocos rebaixados
areiaColuna:  "#F1EDE0"   // coluna do quadro de lotes
borda:        "#E6E1D2"   // bordas de cartão
bordaForte:   "#D9D4C3"   // bordas de botão secundário, divisores
azul:         "#2C5FA8"   // acento — ver abaixo
azulHover:    "#245090"
azulTint:     "#E8EEF7"   // fundo de aviso ligado a localização
tinta:        "#1F2A22"   // texto principal
tintaCard:    "#3B4A3E"   // corpo de texto dentro de cartões
cinza:        "#5C6B5F"   // texto secundário
cinzaMeta:    "#8A8A74"   // metadados, unidades
placeholder:  "#9A9784"
```

**[alterado]** A paleta anterior (`folha #1E4D2B`, `folhaMedia`, `folhaClara #7DBE6B`) foi
substituída pelo verde oficial da marca `#7B982C` e seus derivados. O verde é mais claro que o
antigo, então **o texto sobre ele é `verdeTinta`, nunca branco** (branco sobre `#7B982C` não
passa em AA).

**O azul é acento, não cor de interface.** Ele aparece na mancha de pincel atrás de uma palavra
do título e em tudo que se refere a georreferenciamento: pinos do mapa, botão "usar minha
localização", coordenadas, botão "Confirmar destino" do plantio definitivo. Essa consistência
ensina o usuário sem legenda — azul quer dizer "isso tem lugar no mundo". Um acento de cor por
tela, nunca dois brigando.

**Contraste (AA).** `areia` aceita `tinta`, `verdeEscuro`, `madeira`, `azul` e `cinza`;
`verde` aceita só `verdeTinta`; `verdeEscuro` e `verdeTinta` aceitam `areia`, `verdeClaro` e
`verdePalido`; branco aceita `tinta`, `tintaCard`, `cinza`, `verdeEscuro`, `madeira` e `azul`;
`azul` aceita branco. `verdeClaro` e `verde` sobre branco ou areia **não passam em AA como
texto** — use só como fundo, marcador ou sobre fundo escuro.

---

## Tipografia

Três papéis, cada um com função:

| Papel | Fonte | Uso |
|---|---|---|
| Display | **PP Rader** Bold (700/800) | Títulos, slogan, números grandes |
| Corpo | **TT Travels** Medium (400–600) | Texto de leitura e de interface |
| Utilitário | **IBM Plex Mono** 400/500/600 | Etiquetas (`A-102`), coordenadas, rótulos de formulário e de seção |

**[alterado]** Bricolage Grotesque e Inter saíram. PP Rader e TT Travels são as fontes da
identidade; os arquivos estão em `fonts/` (`PPRader-Bold.otf`, `TTTravels-Medium.otf`).
Fallbacks: `Unbounded` para display, `Outfit` para corpo. TT Travels tem um único peso
(Medium), então os pesos 400–600 da interface renderizam com a mesma fonte; a hierarquia vem
de tamanho e cor, não de peso.

O mono não é decoração: marca **o que é identificador ou rótulo do sistema**. Vendo `A-102` em
mono e "Angico" em display, o usuário aprende sozinho qual dos dois é a chave. No sistema todo
rótulo de campo é mono, maiúsculo, `madeira`.

**Escala.** Sistema: `11 / 12 / 13 / 14 / 15 / 16 / 17 / 18 / 24 / 30 / 32`. Portal: mesma
base para texto, e títulos fluidos com `clamp()` (ex.: `clamp(34px, 4.2vw, 52px)`).
**[alterado]** Corpo padrão de botão e formulário é 15–17 px, maior que o web comum, por causa
do uso ao sol.

**Letter-spacing.** Títulos display `-0.02em` a `-0.035em`. Rótulos mono em maiúsculas
`0.08em` no sistema e `0.12em` no portal **[alterado — era 0.28em]**.

---

## Elementos de marca

**Logo e slogan** — vetores em `marca/logo-{verde,branco,preto}.svg` e
`marca/slogan-{verde,branco,preto}.svg`, com as fontes embutidas. Logo verde sobre areia,
branco sobre fundos escuros, preto sobre o verde da sidebar. Nunca redesenhar o texto do logo
com fonte do sistema.

**Elemento radial** (`marca/el-05`) — a "estrela" do projeto, e também o O de "F○RTE" no
slogan. Usar com restrição: favicon, marca d'água grande e translúcida (opacidade 0,14) no hero
e na seção de números, ícone pequeno junto ao sobretítulo. Não repetir como padrão de fundo em
todas as seções. Marcador de matriz no mapa é uma estrela geométrica de 12 pontas em `azul`;
plantio é um ponto `azul` com borda branca.

**Mancha de pincel azul** — SVG de forma irregular, atrás da palavra de maior peso do título
(ex.: "As **espécies** que cultivamos"). Texto branco por cima. Nunca atrás da frase inteira.

**Ícones de recipiente** — tubete, sementeira, saco e cano como ícones de linha (stroke 1.8,
`currentColor`) dentro dos botões de escolha. O formato do recipiente é informação real de
manejo, então o ícone acompanha sempre o texto. **[não implementado]** Ainda não há SVGs
próprios para os quatro objetos; os botões usam ícones genéricos de linha. Quando forem
desenhados, substituir mantendo o mesmo peso de traço.

**Tratamento de dormência** — no protótipo é uma escolha de três botões (Escarificação,
Embebição, Não necessita) e aparece em texto no detalhe do lote. **[não implementado]** Se
virar badge em listagem: Escarificação em `madeira`, Embebição em `azul`, Não necessita em
`cinza`, sempre cor **e** ícone **e** texto. Cor sozinha exclui daltônicos e não sobrevive ao
sol batendo na tela.

**Cartões e campos.** Raio 10–12 px em botões e inputs, 14–16 px em cartões, 20 px na folha
inferior (modal). Cartão branco com borda `borda` de 1 px; sem sombra em repouso.

---

## Mobile-first no sistema

O contexto real: sol forte, tela suja, luva, uma mão livre.

- Alvo de toque mínimo **48×48 px**; botão primário de largura total no celular, 56–60 px de
  altura no fim de formulário
- Formulário em **uma coluna**, campo por campo. Exceção única: latitude e longitude lado a
  lado, porque são um só dado
- Espécie, substrato, setor, recipiente e tratamento como escolha em lista ou botões, nunca
  digitação livre
- Data com default "hoje" — é o valor certo em quase todo registro
- Coordenada com botão grande "Usar minha localização" em `azul`, e digitação manual como
  alternativa logo abaixo
- Quadro no celular: uma coluna visível por vez, rolagem horizontal com *snap* e indicador de
  posição; no desktop (≥ 900 px) as três colunas lado a lado e a sidebar fixa de 236 px
- Mover lote por **botão explícito** ("Avançar etapa", "Registrar destino"), não arrastar
- Confirmação de salvamento **visível e persistente**: tela própria com a etiqueta gerada em
  mono, quem registrou e quando, e a instrução de anotar na plaqueta. Não é um aviso que some
  em 2 segundos — quem registra no campo precisa ter certeza antes de guardar o celular
- Navegação inferior fixa no celular, sidebar no desktop; "Voltar ao portal" sempre acessível

---

## Acessibilidade — piso obrigatório

Todo campo com `<label>` associado, não só `placeholder` · foco de teclado visível em tudo
interativo · contraste AA em todo texto · `prefers-reduced-motion` respeitado · imagens do
portal com `alt` descritivo real · logo e slogan em SVG com `role="img"` e `aria-label`.

---

## Escrita da interface

- Verbo dizendo o que acontece: "Registrar coleta", não "Enviar"
- O nome da ação não muda no caminho: o botão "Registrar lote" gera "Lote registrado"
- Erro explica o que houve e o que fazer: "Esta muda está na etapa 1. Escolha tubete ou
  sementeira" — não "Valor inválido". Erro aparece em bloco `madeiraTint` com texto `madeira`,
  acima do botão de salvar
- Estado vazio convida à ação: "Nenhum lote na etapa 2. Avance um lote quando as mudas
  estiverem prontas para repicagem"
- Vocabulário do viveiro, não do banco: a tela diz "muda", "lote", "recipiente", "setor",
  "matriz", "etiqueta" — nunca "registro", "entidade" ou "flag"
- Etapas nomeadas sempre por número e nome: "Etapa 1 · Plantio inicial", "Etapa 2 ·
  Crescimento", "Destino final"
