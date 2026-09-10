# 00 — O projeto

## O problema

O viveiro do Projeto Nativas (CERES/UFRN, Caicó-RN) coleta sementes de espécies nativas da
Caatinga, produz mudas e replanta na região. Esse controle vive hoje em caderno e planilha,
com três perdas concretas:

1. **Rastreabilidade quebrada** — uma muda plantada não aponta de qual matriz veio.
2. **Nenhum dado agregado** — não dá para responder "qual a taxa de germinação do umbuzeiro
   este ano" sem recontar tudo à mão.
3. **Transparência limitada** — projeto de extensão precisa mostrar resultado para a
   universidade e para os parceiros, e planilha não comunica.

## A proposta

Uma plataforma onde o registro operacional do viveiro alimenta automaticamente a
comunicação pública. O voluntário registra porque é mais fácil que o caderno; a
transparência sai de graça como subproduto.

**Quando um voluntário registra um plantio, o número sobe no portal e um ponto novo aparece
no mapa, na hora.** Sem planilha intermediária, sem ninguém atualizando o site.

## Usuários

| Perfil | Contexto | O que precisa |
|---|---|---|
| **Equipe do viveiro** | Em pé no viveiro, celular na mão, luva com terra, sol forte | Formulários curtos, botões grandes, poucos campos obrigatórios |
| **Coordenação** | Notebook, no gabinete | Cadastro de espécies, conteúdo do acervo, visão agregada |
| **Visitante do portal** | Celular ou desktop | Entender o projeto em 15 segundos e ver que os números são reais |

O primeiro perfil define as decisões de interface. **O sistema é mobile-first por
necessidade operacional:** se o formulário não funcionar com o polegar sujo de terra, o dado
não é registrado e o resto perde sentido.

---

## Escopo

Referência visual: o protótipo validado no Claude Design. Ele é a fonte da verdade de
layout; este documento é a fonte da verdade de funcionalidade.

### Portal público

Uma página principal com âncoras, mais o acervo.

**Página principal:** início (slogan "Natureza viva e forte" e a frase "Agir agroecológico
para a sustentabilidade na Caatinga") · sobre o projeto e equipe (UFRN, CERES, EMCM,
voluntários) · nossas ações (coleta, produção de mudas, manejo, compostagem, mutirões,
plantios, visitas) · quatro contadores · acervo em destaque · parceiros (Arboriza Caicó,
Ilha Zero, Sabugi Ambiental, Café nos Matos, UFRN, CERES, DMA, PROEX) · mapa · rodapé.

**Acervo de espécies** — a seção mais importante do portal. Lista com busca por nome e
filtro por família; página individual por espécie com duas partes:

- *Informações botânicas*, preenchidas pela coordenação: descrição, porte, época de floração
  e de frutificação, usos, foto principal e galeria.
- *O que o projeto já fez com ela*, calculado pelo sistema: coletas e sementes, mudas
  produzidas, plantios definitivos, taxa de germinação, tratamentos já aplicados, e um mapa
  pequeno com os pontos daquela espécie.

A segunda parte é o que diferencia o acervo de uma enciclopédia: os números são do projeto,
verificáveis, e mudam sozinhos.

**Mapa** — dois tipos de ponto (matrizes e plantios definitivos), janela ao clicar com foto,
espécie, data, etiqueta e link para o acervo. Coordenadas exatas, por decisão da
coordenação.

### Sistema do viveiro

| Tela | O que faz |
|---|---|
| Login | Conta compartilhada pela equipe |
| Visão geral | Contadores e últimos registros |
| Banco de sementes | Coletas com saldo de sementes por coleta |
| Registrar coleta | Espécie, GPS da matriz, quantidade, data |
| Lotes — quadro | Três colunas: Etapa 1 → Etapa 2 → Destino final |
| Registrar lote | Gera a etiqueta automática (A-102) |
| Avançar etapa | Novo recipiente e novo setor |
| Destino final | Plantio definitivo, doação ou perda |
| Espécies | Cadastro e conteúdo do acervo |
| Visitas | Registro simples, alimenta o quarto contador |
| Configurações | Listas de colaboradores e substratos |

---

## Fora do escopo

Decisão, não esquecimento. Tudo aqui volta na v1.1 e serve como "trabalhos futuros" no
relatório.

Arrastar e soltar no quadro (haverá botão, que funciona melhor com a mão suja) · upload de
fotos pela interface (o acervo entra por importação de planilha) · PostGIS e consultas
espaciais · modo offline · lembretes de rega · relatórios em PDF ou planilha · gráficos e
analytics internos · inscrição em mutirões · área de doação · cadastro de voluntários pela
tela · alternância "onde coletamos / onde plantamos" e satélite no mapa.

## Ordem de corte

Se na semana 9 ficar claro que não cabe tudo, corte nesta ordem, de cima para baixo.
Decidido agora, com a cabeça fria, para evitar a discussão ruim em cima da hora.

1. Galeria de fotos no acervo (fica só a foto principal)
2. Mapa pequeno na página da espécie
3. Registro de visitas (o contador vira número editado pelo admin)
4. Modal de detalhe do lote
5. Tela do banco de sementes (o saldo aparece só no formulário de lote)

**Nunca cortar:** login, coleta, lote com etiqueta, quadro com transições, destino final com
coordenada, acervo (lista e página), contadores, mapa principal.

---

## A demo de 8 minutos

O escopo foi montado de trás para frente a partir deste roteiro. Ensaiem com ele desde o
sprint 3, não na semana 14.

1. **O problema** (1 min) — o viveiro real, o caderno, a pergunta que ninguém responde hoje
2. **Portal** (1 min) — a página e os contadores
3. **Acervo** (1,5 min) — a página de uma espécie, com os números do projeto
4. **Registrar coleta e criar um lote** (1,5 min) — no celular, com a etiqueta A-102
   aparecendo sozinha
5. **Quadro** (1,5 min) — avançar a muda até o destino final, o modal exigindo a coordenada
6. **Volta ao portal** (1 min) — o contador subiu e o pino novo está no mapa
7. **Uma decisão técnica** (0,5 min) — geração de etiqueta com controle de concorrência, ou
   a escolha de adiar o PostGIS

O passo 6 vende o projeto inteiro: é onde fica visível que os dois lados são o mesmo dado.
