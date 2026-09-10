# 04 — Time e plano

## A equipe

| Pessoa | Experiência | Do que é dono |
|---|---|---|
| **Pedro** | Arquitetou o projeto, domina o domínio | Modelagem, regras de negócio, revisão de PR |
| **Colega 1** | React, Tailwind, Express | Sistema do viveiro (quadro, formulários) e CRUDs da API |
| **Colega 2** | Aprendendo desenvolvimento web | Portal público, acervo, conteúdo e teste de campo |

Trilhas, não caixas fechadas: cada um decide e responde pela sua área, e todo mundo revisa PR
dos outros.

**O quadro de acompanhamento é a peça mais difícil do frontend** — mistura estado, chamada
assíncrona, modal condicional e regra de transição. Vai para quem tem mais experiência.

**O acervo é a peça mais visível do portal** e o motivo de ele ser a trilha de quem está
aprendendo: são componentes majoritariamente visuais, com pouco estado, e cada tarefa dá
resultado na tela na hora. Feedback visual rápido sustenta a motivação nas primeiras semanas.

### Fora do código, e igualmente essencial

Três frentes do colega 2 que ninguém mais vai fazer:

1. **Levantamento com a coordenação** — conteúdo botânico das 30 a 40 espécies, fotos, lista
   de substratos, nomes dos colaboradores. Sem isso o acervo fica pronto e vazio, o que é
   pior que não existir.
2. **Conteúdo do portal** — textos de sobre, equipe, ações, parceiros.
3. **Teste de campo** — levar o sistema ao viveiro, pedir para alguém registrar um lote de
   verdade e anotar cada hesitação. É o teste de usabilidade mais valioso do projeto, e não
   exige programar: exige prestar atenção.

---

## Como o time funciona sem acompanhamento contínuo

Não há sessão semanal de mentoria — ninguém tem folga na agenda. O que substitui:

**Capacitação antes das tarefas, não durante.** As duas primeiras semanas são de estudo
guiado, sem entrega de código cobrada. Quem começa sabendo o básico pergunta muito menos
depois — é o mesmo tempo, gasto antes em vez de gasto em interrupção.

**Tarefa só entra no quadro com critério de aceite escrito.** Duas ou três linhas dizendo o
que precisa estar na tela para estar pronta. É o que permite saber sozinho se terminou. Meia
hora escrevendo o critério evita cinco idas e voltas depois.

**Suporte assíncrono e escalonado.** Dúvida vai no grupo, não no privado. Dúvida de React,
Tailwind e JavaScript vai para o colega 1; decisão de arquitetura, contrato de API e revisão
de PR vão para o Pedro. Distribui a carga em vez de concentrar numa pessoa.

**Revisão de PR em até 24h** — o único compromisso de prazo fixo do time.

**Regra de desbloqueio:** travou 40 minutos no mesmo erro, manda no grupo com o erro inteiro e
o que já tentou. Sem isso, quem está aprendendo passa dois dias em silêncio achando que a
dúvida é boba.

**Nada do colega 2 fica no caminho crítico.** Se o portal atrasar duas semanas, o sistema e a
API continuam. O contrário não seria verdade — é o motivo real da divisão ser essa.

---

## Sprints

| Sprint | Semanas | Entrega |
|---|---|---|
| 0 | 1–2 | Ambiente nas três máquinas · repositório e quadro · estudo guiado do colega 2 · levantamento das espécies com a coordenação |
| 1 | 3–5 | Schema e seed · login · cadastro de espécies · início e sobre no portal |
| 2 | 6–8 | **Coleta → lote com etiqueta → contador subindo no portal** |
| 3 | 9–11 | Quadro com transições · destino final · acervo (lista e página) |
| 4 | 12–13 | Mapa · importação do acervo · acabamento · deploy · teste no viveiro |
| 5 | 14 | Relatório, ensaio e apresentação |

Duas datas inegociáveis: **fim da semana 8** para o marco do sprint 2, e **fim da semana 11**
para o ciclo completo até o acervo. Se a semana 8 chegar sem o marco, aplique a ordem de corte
imediatamente, sem esperar.

Reservem a semana 14 quase inteira para escrita e ensaio: a nota depende tanto da
apresentação quanto do código.

---

## Fluxo de trabalho

Branch por tarefa, PR sempre, ninguém commita na `main`.

```
feat/quadro-transicao
fix/validacao-recipiente
docs/regras-destino-final
```

Commits convencionais (`feat(lotes): gera etiqueta com contador transacional`) — já organizam
o histórico para o relatório final.

**Todo PR é revisado por outra pessoa**, mesmo que a aprovação leve dois minutos. Numa equipe
de três, é o que evita cada um conhecer só o próprio terço — e a banca costuma perguntar
justamente sobre a parte que você não escreveu.

**PR pequeno.** Uma tarefa, um PR. Revisar 40 linhas leva cinco minutos; revisar 600 leva um
dia e não acontece.

**Reunião semanal de 30 minutos:** o que fiz, o que farei, o que travou. Quadro de tarefas com
A Fazer / Fazendo / Revisão / Feito. Nada fora do quadro.

### Definição de pronto

- [ ] Funciona no fluxo real, não só no caso feliz
- [ ] Regra de negócio validada **na API**, não apenas no formulário
- [ ] Testada em tela de celular
- [ ] PR revisado e aprovado por outro integrante
- [ ] Documentação atualizada, se mudou contrato ou regra
- [ ] Sem `console.log` esquecido nem credencial no código

---

## Pendências com a coordenação

Para responder junto com a validação final:

- **P1.** Lista inicial de substratos — o nome de cada mistura padrão
- **P2.** Nomes dos colaboradores que registram no viveiro
- **P3.** O que conta como visita: visitante avulso, ou só grupos e instituições agendados?
- **P4.** Doações e perdas aparecem no portal público, ou ficam só no sistema interno?
- **P5.** Planilha-modelo do acervo: a equipe envia o modelo, a coordenação confirma se as
  colunas fazem sentido antes de preencher as 30 a 40 espécies
- **P6.** A lista de usos (medicinal, forrageiro, madeireiro, ornamental, alimentício) está
  completa?

**P5 é a que tem prazo real.** O acervo depende do conteúdo chegar até o meio do semestre; se
a planilha só for validada no sprint 3, o conteúdo não chega a tempo.
