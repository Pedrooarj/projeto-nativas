# Aprendendo React neste projeto

Para quem está começando do zero. Não é um curso de React: é um guia do **código
que já existe aqui**, na ordem em que ele faz sentido, com oito tarefas de
dificuldade crescente no fim.

Leia com o projeto aberto ao lado. Todo arquivo citado existe de verdade — abra
cada um antes de seguir para o próximo parágrafo.

---

## 1. Rodando o projeto

O passo a passo completo está no [README](../README.md). Resumo do dia a dia:

```bash
docker compose up -d          # uma vez por dia, na raiz do repositório
cd api && npm run dev         # deixa esse terminal aberto
cd web && npm run dev         # em outro terminal, e esse também aberto
```

Front em <http://localhost:5173>, API em <http://localhost:3333>.

### Quando der erro

| O que você vê | O que fazer |
|---|---|
| Tela branca no navegador | abra o console (F12 → Console). O erro em vermelho diz o arquivo e a linha |
| `Failed to fetch` ou contadores em `—` | o terminal da API caiu. Olhe aquele terminal, o erro está lá |
| `Module not found` | o caminho do `import` está errado, ou faltou `npm install` |
| Erro vermelho no terminal do `web` | é o TypeScript reclamando de tipo. Leia a **primeira** linha do erro e ignore o resto por enquanto |
| Salvei e a tela não mudou | veja se salvou o arquivo certo, e se o terminal do `web` não está mostrando erro |

Regra do time: **travou 40 minutos no mesmo erro, manda no grupo** com o erro
inteiro (copiado, não em foto) e o que você já tentou.

---

## 2. Onde as coisas ficam

Tudo do front está em `web/`. Você vai mexer quase só em `web/src/`.

| Pasta ou arquivo | O que é |
|---|---|
| `web/index.html` | a página vazia onde o React se pendura. Você quase nunca mexe aqui |
| `web/src/main.tsx` | a primeira linha que roda. Pendura o `<App />` no `index.html` |
| `web/src/App.tsx` | o mapa de endereços: qual endereço mostra qual tela |
| `web/src/rotas/publicas/` | as telas que qualquer pessoa vê (portal e acervo) |
| `web/src/rotas/sistema/` | as telas que só aparecem depois do login |
| `web/src/componentes/ui/` | os pedaços reutilizáveis: botão, campo, cartão, tabela… |
| `web/src/lib/api.ts` | o único arquivo que conversa com a API |
| `web/src/lib/auth.tsx` | guarda quem está logado |
| `web/src/lib/dominio.ts` | os nomes fixos do domínio (etapas, recipientes, setores) |
| `web/src/index.css` | fontes e três classes de texto usadas em todo lugar |
| `web/tailwind.config.ts` | as cores e os tamanhos da marca |

**Sobre o Tailwind:** as cores não são escritas em hexadecimal no meio da tela.
Elas têm nome — `bg-areia`, `text-verdeEscuro`, `border-borda` — e os nomes estão
todos em `web/tailwind.config.ts`. Quando não souber qual usar, abra esse arquivo:
cada cor tem um comentário dizendo onde ela entra.

Uma regra do design que não pode ser quebrada: **texto sobre o verde da marca é
sempre `text-verdeTinta`, nunca branco.** Branco sobre `#7B982C` não tem
contraste suficiente e some no sol.

---

## 3. Os cinco conceitos

### 3.1 Componente

Um componente é uma função que devolve o que aparece na tela. O nome começa com
letra maiúscula — é assim que o React sabe que aquilo é um componente e não uma
função comum.

Abra **`web/src/componentes/ui/Card.tsx`**. São quinze linhas. A função `Card`
devolve uma `<div>` com borda e fundo branco. É só isso: um componente pequeno,
que existe para não repetir as mesmas classes em quinze lugares.

Agora abra **`web/src/rotas/publicas/Portal.tsx`** e olhe a função `Portal`, no
topo. Ela não desenha quase nada: só empilha outros componentes, um por seção da
página.

```tsx
<main>
  <Inicio />
  <Sobre />
  <Acoes />
  <Contadores />
  ...
</main>
```

Cada um desses está definido mais abaixo, no mesmo arquivo. **Componente é
sempre isso:** uma peça que devolve tela e pode ser usada dentro de outra.

### 3.2 Props

Props são os valores que você passa para um componente, do mesmo jeito que
argumentos de uma função. Sem props, um componente só sabe fazer uma coisa; com
props, ele serve para muitos casos.

Abra **`web/src/rotas/sistema/EmConstrucao.tsx`**. Ele recebe duas props, `nome`
e `descricao`:

```tsx
type Props = {
  nome: string;
  descricao: string;
};

export function EmConstrucao({ nome, descricao }: Props) { ... }
```

O bloco `type Props` é o TypeScript avisando o que aquele componente aceita. Se
você esquecer uma prop obrigatória, o editor reclama **antes** de você abrir o
navegador — é para isso que ele serve.

Quem usa esse componente é o **`web/src/App.tsx`**, quatro vezes, cada uma com um
texto diferente. Um componente, quatro telas.

Veja também **`web/src/componentes/ui/Botao.tsx`**: ele recebe `variante`, que
decide se o botão é verde, branco ou azul. É o mesmo componente com três caras.

### 3.3 Lista com `.map()`

Quando você precisa mostrar uma lista, não copia e cola o mesmo bloco dez vezes.
Você guarda os dados num array e transforma cada item em tela com `.map()`.

Abra **`web/src/rotas/publicas/Portal.tsx`** e procure a função `Parceiros`. Ela
tem um array de oito nomes e transforma cada nome num `<li>`:

```tsx
const parceiros = ["Arboriza Caicó", "Ilha Zero", ...];

<ul>
  {parceiros.map((parceiro) => (
    <li key={parceiro}>{parceiro}</li>
  ))}
</ul>
```

Duas coisas para gravar:

1. As chaves `{ }` dentro do JSX querem dizer "aqui entra JavaScript".
2. Todo item de lista precisa de um **`key`** único. É como o React sabe qual
   item é qual quando a lista muda. Sem `key` ele avisa no console.

O mesmo padrão aparece em `Contadores` (quatro números) e em
`web/src/rotas/sistema/LayoutSistema.tsx` (os itens do menu).

### 3.4 `useState`

Até aqui a tela é fixa. `useState` é como o componente **lembra** de alguma coisa
que muda: o que a pessoa digitou, se o modal está aberto, se está salvando.

Abra **`web/src/rotas/sistema/Login.tsx`**:

```tsx
const [email, setEmail] = useState("");
```

Isso cria duas coisas: `email`, o valor de agora, e `setEmail`, a única forma de
mudá-lo. Você **nunca** escreve `email = "outra coisa"` — o React não fica
sabendo e a tela não muda. Sempre `setEmail("outra coisa")`.

Toda vez que você chama um `set...`, o React redesenha aquele componente com o
valor novo. É esse o ciclo inteiro.

No `Login.tsx` são quatro estados: e-mail, senha, mensagem de erro e "está
enviando?". Repare que o botão vira "Entrando..." só porque `enviando` mudou de
`false` para `true`.

### 3.5 Chamada à API com `useEffect`

`useEffect` serve para fazer algo **depois** que o componente apareceu na tela —
tipicamente, buscar dados.

Abra **`web/src/rotas/publicas/Portal.tsx`**, função `Contadores`. São as linhas
mais importantes do portal:

```tsx
const [metricas, setMetricas] = useState<Metricas | null>(null);

useEffect(() => {
  buscarMetricas()
    .then(setMetricas)
    .catch((problema) => setErro(problema.message));
}, []);
```

Lendo em português: *começa sem métrica nenhuma; assim que a seção aparecer,
pede os números para a API; quando eles chegarem, guarda no estado — e o React
redesenha com os números no lugar do traço.*

O `[]` no fim é a lista de dependências: vazio quer dizer "faça isso uma vez só,
quando o componente aparecer". Se você esquecer o `[]`, ele refaz a chamada
infinitamente. É o erro mais comum de quem está começando.

`buscarMetricas` vem de **`web/src/lib/api.ts`**. Repare que o componente não
sabe o endereço da API nem o formato do token: isso mora tudo naquele arquivo. É
assim que fica: **tela cuida de tela, `api.ts` cuida de rede.**

Para ver as três coisas juntas — estado, lista e chamada à API — abra
**`web/src/rotas/sistema/Especies.tsx`**. É a tela mais completa do repositório e
o modelo a copiar quando você for construir uma nova.

---

## 4. As oito tarefas

Em ordem. Cada uma diz em qual arquivo mexer. Faça uma por PR.

### Tarefa 1 — Mudar um texto do rodapé

**Arquivo:** `web/src/rotas/publicas/Portal.tsx`, função `Rodape` (no fim).

Troque o parágrafo por um texto seu sobre o projeto. Salve, veja mudar no
navegador, e abra o primeiro PR. O objetivo aqui não é o texto: é passar pelo
ciclo branch → commit → PR → revisão uma vez, com uma mudança que não pode dar
errado.

**Pronto quando:** o texto novo aparece no rodapé e o PR foi aprovado.

### Tarefa 2 — A seção Sobre

**Arquivo:** `web/src/rotas/publicas/Portal.tsx`, função `Sobre`.

Hoje ela usa `SecaoPlaceholder`. Troque por conteúdo de verdade: um título, dois
ou três parágrafos sobre o projeto, a UFRN, o CERES e os voluntários. Use as
classes do Tailwind — olhe como `AcervoEmDestaque`, logo abaixo, faz isso.

**Pronto quando:** a seção tem texto real, respeita as cores do design e continua
legível no celular (estreite a janela do navegador para conferir).

### Tarefa 3 — O componente `CardAcao`

**Arquivo novo:** `web/src/componentes/CardAcao.tsx`.

Crie um componente que recebe as props `titulo` e `descricao` e devolve um
cartão. Use o `Card` de `componentes/ui/Card.tsx` por dentro, em vez de repetir
as classes de borda.

Ainda não use em lugar nenhum: só criar e exportar.

**Pronto quando:** o arquivo existe, tem o `type Props` declarado e o editor não
mostra erro.

### Tarefa 4 — As sete ações com `.map()`

**Arquivo:** `web/src/rotas/publicas/Portal.tsx`, função `Acoes`.

Crie um array com as sete ações do projeto — coleta, produção de mudas, manejo,
compostagem, mutirões, plantios e visitas — cada uma com título e descrição curta.
Renderize com `.map()` usando o `CardAcao` da tarefa anterior. Copie o padrão da
função `Parceiros`, no mesmo arquivo.

**Pronto quando:** as sete aparecem na tela, cada uma com `key`, e o console do
navegador não tem nenhum aviso.

### Tarefa 5 — O menu mobile

**Arquivo:** `web/src/rotas/publicas/Portal.tsx`, função `Cabecalho`.

Tem um botão `≡` que hoje não faz nada — está marcado com um comentário
`TAREFA 5`. Faça ele abrir e fechar um menu com os links das seções, usando
`useState` para guardar se está aberto.

Dicas: o padrão é `const [menuAberto, setMenuAberto] = useState(false)`, e o menu
só aparece quando `menuAberto` for verdadeiro. O fundo do menu mobile é
`bg-verdeTinta`, com os links em `text-areia`.

**Pronto quando:** abre, fecha, e ao clicar num link ele fecha e rola até a seção.

### Tarefa 6 — O acervo com busca e filtro

**Arquivo:** `web/src/rotas/publicas/Acervo.tsx`, mais `web/src/lib/api.ts`.

Aqui acaba o aquecimento. Esta é a **história [#7](https://github.com/Pedrooarj/projeto-nativas/issues/7)
do backlog** — uma feature de verdade, com prioridade P1, que vai para o portal
público. Ela junta tudo o que você viu até agora: estado, lista com `.map()` e
chamada à API.

O que a tela precisa fazer:

1. Buscar as espécies quando a página abrir (`useEffect`)
2. Mostrar cada uma num cartão: foto principal, nome comum e nome científico
3. Ter um campo de busca por nome que filtra a lista
4. Ter um filtro por família botânica
5. Mostrar "carregando" enquanto espera e uma mensagem decente quando não achar nada

**Você não está inventando isso do zero.** Abra
`web/src/rotas/sistema/Especies.tsx`: ele faz exatamente esse ciclo — busca com
espera de 300 ms, lista, estado vazio, tratamento de erro — e está comentado como
tela de referência. Copie o padrão e adapte para o visual público.

Se o endpoint `GET /publico/especies` ainda não estiver pronto quando você chegar
aqui, fale no grupo: dá para trabalhar com uma lista fixa no arquivo e trocar pela
chamada real depois, sem refazer o resto.

**Pronto quando:** a lista carrega da API, a busca filtra enquanto se digita, o
filtro por família funciona junto com a busca, e a tela se comporta bem no celular
com estado vazio e de carregamento.

### Tarefa 7 — Card de métrica com dados fixos

**Arquivo:** `web/src/rotas/publicas/EspeciePublica.tsx`.

Essa página vai mostrar, além das informações botânicas, os números do projeto
para aquela espécie: coletas, sementes, mudas produzidas e plantios. Monte os
quatro cartões **com números inventados na mão**, só para acertar o layout.

Use `Contadores`, em `Portal.tsx`, como referência visual.

**Pronto quando:** os quatro cartões aparecem, com número grande em `font-display`
e rótulo em mono, e funcionam empilhados no celular.

### Tarefa 8 — Ligar os números no endpoint real

**Arquivo:** o mesmo `web/src/rotas/publicas/EspeciePublica.tsx`, mais
`web/src/lib/api.ts`.

Quando o endpoint `GET /publico/especies/:id` existir (é tarefa de quem cuida da
API — veja [escopo.md](escopo.md)), troque os números inventados pelos de
verdade:

1. Em `lib/api.ts`, adicione o tipo da resposta e a função `buscarEspeciePublica(id)`,
   copiando o formato das funções que já estão lá.
2. Na tela, use `useState` + `useEffect` como em `Contadores`, pegando o `id` da
   rota com `useParams` (o arquivo já importa isso).
3. Trate os três estados: carregando, deu erro, e chegou.

**Pronto quando:** os números da página vêm da API, a tela não quebra enquanto
carrega e mostra uma mensagem clara se a API estiver fora do ar.

---

## 5. Regras de convivência

- **Dúvida de React, Tailwind ou JavaScript** → o colega com experiência em front.
- **Dúvida de API, contrato, banco ou regra de negócio** → o Pedro.
- **Dúvida vai no grupo, não no privado.** Assim a resposta serve para os três, e
  ninguém vira gargalo sozinho.
- **Travou 40 minutos no mesmo erro?** Manda no grupo com o erro inteiro copiado
  e o que você já tentou. Não é sinal de fraqueza: é o combinado do time.
- Antes de abrir PR, passe a [definição de pronto](como-contribuir.md).

## 6. Sobre usar IA

Use para **entender**, não para **produzir**.

Bom uso: colar um erro e pedir para explicar o que ele quer dizer. Perguntar por
que o `useEffect` está rodando duas vezes. Pedir para explicar linha por linha um
trecho do `Especies.tsx` que você não entendeu.

Mau uso: pedir "faça o componente CardAcao" e colar o resultado. Funciona hoje e
custa caro em novembro, quando você precisar mexer no que não entende — e na
apresentação, quando a banca perguntar por que aquilo está ali.

O teste é simples: **você consegue explicar cada linha do que vai commitar?** Se
não, volte e entenda antes de abrir o PR.
