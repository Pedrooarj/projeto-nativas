# Licença do repositório: opções (rascunho)

**Status:** aguardando decisão do time. Nenhum arquivo `LICENSE` foi criado.
**Data:** 2026-11-23.
**Este texto não é parecer jurídico.** Ele organiza a decisão; os pontos de compatibilidade e de
titularidade precisam de confirmação de quem responde por isso na UFRN ou de um profissional.
**Marcadores:** [fato] verificado no repositório ou no texto da licença. [suposição] precisa de
confirmação.

## Situação atual

- [fato] O repositório é público e não declara licença. Sem licença, o código pode ser lido, mas
  ninguém recebe permissão expressa para reutilizar, alterar ou redistribuir.
- [fato] Há 3 pessoas com commits no repositório: Pedrooarj, ChisSilva e levyingx.
- [fato] Dependências de produção, pelo `package-lock.json`: 90 pacotes na API (82 MIT, 3 ISC,
  2 Apache-2.0, 2 BSD-3-Clause, 1 BSD-2-Clause) e 10 no front (7 MIT, 2 Hippocratic-2.1,
  1 BSD-2-Clause).
- [fato] As fontes PP Rader e TT Travels são da identidade do projeto e os arquivos não estão no
  repositório. Os logos entram pelo PR #53.
- [suposição] Por ser projeto de extensão da UFRN, pode haver regra da universidade ou acordo com
  a coordenação sobre a titularidade do código e da marca.

## O ponto que condiciona a escolha: Hippocratic 2.1

`react-leaflet` 5.0.0 e `@react-leaflet/core` 3.0.0 usam Hippocratic 2.1 [fato]. O `leaflet` em si
é BSD-2-Clause [fato]. Só o front depende deles; a API não [fato].

O que o texto da licença traz [fato]:

- **Restrição de uso.** O software não pode ser usado em sistemas ou atividades que violem os
  princípios e as leis de direitos humanos definidos na licença. A condição acompanha quem usa,
  hospeda ou redistribui o front com esses pacotes.
- **Aviso.** Quem repassa uma cópia precisa repassar também a licença e o aviso de copyright.
- **Indenização.** Quem usar em violação desses termos deve indenizar o licenciante e os
  contribuidores por perdas, custos e honorários.
- **Arbitragem.** Disputas sobre esses princípios vão para arbitragem pelas Hague Rules on
  Business and Human Rights Arbitration, com documentos do processo públicos, salvo acordo.

**Ação necessária antes da primeira implantação, qualquer que seja a licença do projeto:** incluir
no build do front um aviso de terceiros com o texto completo da Hippocratic 2.1 e o copyright do
`react-leaflet`. Hoje esse aviso não existe [fato: não há arquivo de avisos de terceiros no repositório].

**Compatibilidade com GPL e AGPL 3.0:** provavelmente incompatível [suposição]. GPL e AGPL não
admitem restrições adicionais sobre o uso, e a Hippocratic impõe uma. Distribuir um mesmo front sob
AGPL ou GPL junto com `react-leaflet` tende a criar conflito.

## Opções

| Licença | Permite | Exige | A favor | Contra |
|---|---|---|---|---|
| **MIT** | Quase tudo, inclusive uso fechado | Manter aviso e licença | Curta, conhecida, fácil de a equipe explicar; facilita outro viveiro reaproveitar | Quem melhorar o sistema não precisa devolver a melhoria |
| **Apache-2.0** | Quase tudo | Aviso, registro de mudanças | Traz concessão expressa de patentes | Texto longo, proteção pouco relevante aqui |
| **GPL-3.0** | Uso e alteração | Distribuir derivados sob GPL | Mantém derivados abertos quando distribuídos | Não cobre sistema só hospedado; provável incompatibilidade com `react-leaflet` |
| **AGPL-3.0** | Uso e alteração | Abrir o código também em uso via rede | Melhor proteção para sistema web | Mais restritiva; pode afastar adoção; provável incompatibilidade com `react-leaflet` |
| **Sem licença** | Só leitura | Nada a cumprir | Nenhum trabalho agora | Impede reuso legítimo, contra o espírito de um projeto de extensão |

## Se o time quiser copyleft: três saídas

1. **AGPL só em `api/`**, com o front sob licença permissiva. A API não depende de `react-leaflet`
   e os dois já são projetos npm independentes.
2. **Trocar `react-leaflet` por `leaflet` direto.** Elimina a dependência Hippocratic, mas exige
   reescrever os componentes de mapa, e isso toca código da equipe. Fica fora desta entrega.
3. **Obter exceção** dos titulares do `react-leaflet`, por escrito. Depende de resposta externa.

## Recomendação

**MIT para o código de `api/`, `web/` e `lint/`**, com quatro ressalvas no README:

1. **A licença cobre só o código.** Marca, logos, fontes, fotos, textos e dados das espécies ficam
   fora e seguem com seus titulares.
2. **Dependências mantêm as próprias licenças.** Dizer que o front inclui `react-leaflet` sob
   Hippocratic 2.1, que continua valendo para quem usar, hospedar ou redistribuir o front.
3. **Aviso de terceiros no build do front** antes da primeira implantação.
4. **Confirmar com a coordenação** antes de publicar a licença, pela possível regra da UFRN.

**Por quê:** a equipe tem três estudantes e o critério do projeto é preferir o simples. O objetivo
provável é permitir que outros viveiros reaproveitem o sistema, e a MIT faz isso com menos atrito.

**Premissa mais frágil:** que os três autores e a coordenação possam licenciar o código. Se a
UFRN for titular, a escolha não é só da equipe.

**Quando escolher outra:** se o time quiser garantir que versões hospedadas por terceiros
continuem abertas, a saída mais simples é a opção 1 acima.

## Decisão

- [ ] Licença escolhida: ____
- [ ] Pedro de acordo
- [ ] Chistian de acordo
- [ ] Levy de acordo
- [ ] Coordenação consultada, em ____ (data), resposta: ____
- [ ] Ressalvas adicionadas ao README, depois do merge do PR #54, que também altera esse arquivo
- [ ] Aviso de terceiros com o texto da Hippocratic 2.1 incluído no build do front
- [ ] Arquivo `LICENSE` criado com o texto oficial, ano e titulares
