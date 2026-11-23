# Licença do repositório: opções (rascunho)

**Status:** aguardando decisão do time. Nenhum arquivo `LICENSE` foi criado.
**Data:** 2026-11-23. Este texto organiza a decisão e não é parecer jurídico.
**Marcadores:** [fato] verificado no repositório. [suposição] precisa de confirmação.

## Situação atual

- [fato] O repositório é público e não declara licença. Sem licença, o código pode ser lido, mas
  ninguém recebe permissão expressa para reutilizar, alterar ou redistribuir.
- [fato] Há 3 pessoas com commits no repositório: Pedrooarj, ChisSilva e levyingx.
- [fato] Dependências de produção, pelo `package-lock.json`: 90 pacotes na API (82 MIT, 3 ISC,
  2 Apache-2.0, 2 BSD-3-Clause, 1 BSD-2-Clause) e 10 no front (7 MIT, 2 Hippocratic-2.1,
  1 BSD-2-Clause).
- [fato] `react-leaflet` 5.0.0 e `@react-leaflet/core` 3.0.0 usam **Hippocratic 2.1**, que proíbe
  usos que violem direitos humanos e não é uma licença de código aberto tradicional. O `leaflet`
  em si é BSD-2-Clause.
- [fato] As fontes PP Rader e TT Travels são da identidade do projeto e os arquivos não estão no
  repositório. Os logos entram pelo PR #53.
- [suposição] Por ser projeto de extensão da UFRN, pode haver regra da universidade ou acordo com
  a coordenação sobre a titularidade do código e da marca.

## Opções

| Licença | Permite | Exige | A favor | Contra |
|---|---|---|---|---|
| **MIT** | Quase tudo, inclusive uso fechado | Manter aviso e licença | Curta, conhecida, fácil de a equipe explicar; facilita outro viveiro reaproveitar | Quem melhorar o sistema não precisa devolver a melhoria |
| **Apache-2.0** | Quase tudo | Aviso, registro de mudanças | Traz concessão expressa de patentes | Texto longo, proteção pouco relevante aqui |
| **GPL-3.0** | Uso e alteração | Distribuir derivados sob GPL | Mantém derivados abertos quando distribuídos | Não cobre sistema só hospedado; compatibilidade com Hippocratic precisa de análise |
| **AGPL-3.0** | Uso e alteração | Abrir o código também em uso via rede | Melhor proteção para sistema web | Mais restritiva; pode afastar adoção; mesma dúvida com Hippocratic |
| **Sem licença** | Só leitura | Nada a cumprir | Nenhum trabalho agora | Impede reuso legítimo, contra o espírito de um projeto de extensão |

## Recomendação

**MIT para o código de `api/`, `web/` e `lint/`**, com três ressalvas escritas no README:

1. **A licença cobre só o código.** Marca, logos, fontes, fotos, textos e dados das espécies ficam
   fora e seguem com seus titulares.
2. **Dependências mantêm as próprias licenças.** Citar que `react-leaflet` usa Hippocratic 2.1,
   que continua valendo para quem redistribuir o front com ele.
3. **Confirmar com a coordenação** antes de publicar a licença, pela possível regra da UFRN.

**Por quê:** a equipe tem três estudantes e o critério do projeto é preferir o simples. O objetivo
provável é permitir que outros viveiros reaproveitem o sistema, e a MIT faz isso com menos atrito.

**Premissa mais frágil:** que os três autores e a coordenação possam licenciar o código. Se a
UFRN for titular, a escolha não é só da equipe.

**Quando escolher outra:** se o time quiser garantir que versões hospedadas por terceiros
continuem abertas, a opção é AGPL-3.0, depois de analisar a compatibilidade com o `react-leaflet`.

## Decisão

- [ ] Licença escolhida: ____
- [ ] Pedro de acordo
- [ ] Chistian de acordo
- [ ] Levy de acordo
- [ ] Coordenação consultada, em ____ (data), resposta: ____
- [ ] Ressalvas adicionadas ao README, depois do merge do PR #54, que também altera esse arquivo
- [ ] Arquivo `LICENSE` criado com o texto oficial, ano e titulares
