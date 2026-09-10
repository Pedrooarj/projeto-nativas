# Como contribuir

Uma página. Vale para os três.

## Branch por tarefa

Ninguém commita na `main`. Cada tarefa nasce numa branch com prefixo e assunto:

```
feat/quadro-transicao
fix/validacao-recipiente
docs/regras-destino-final
```

## Commits convencionais

```
feat(lotes): gera etiqueta com contador transacional
fix(coletas): valida saldo de sementes antes de criar lote
docs(escopo): lista endpoints pendentes
```

Não é burocracia: no fim do semestre esse histórico vira a seção de
desenvolvimento do relatório sem ninguém precisar reconstruir nada.

## PR revisado por outra pessoa

**Todo PR é revisado**, mesmo que a aprovação leve dois minutos. Numa equipe de
três, é o que evita cada um conhecer só o próprio terço do sistema — e a banca
costuma perguntar justamente sobre a parte que você não escreveu.

**Revisão em até 24 horas.** É o único compromisso de prazo fixo do time.

**PR pequeno: uma tarefa, um PR.** Revisar 40 linhas leva cinco minutos; revisar
600 leva um dia e não acontece.

Quem revisa o quê:

| Assunto | Vai para |
|---|---|
| React, Tailwind, JavaScript | o colega com experiência em front |
| Arquitetura, contrato de API, modelagem, regra de negócio | o Pedro |

## Tarefa só entra no quadro com critério de aceite escrito

Duas ou três linhas dizendo o que precisa estar na tela para a tarefa estar
pronta. Exemplo:

> **Registrar visita.** O formulário tem data (padrão hoje), instituição, número
> de pessoas, observação e "quem está registrando". Ao salvar, a tela mostra a
> confirmação e o contador de visitas do portal sobe depois do cache expirar.

Meia hora escrevendo o critério evita cinco idas e voltas depois — e é o que
permite saber sozinho se você terminou.

O quadro tem quatro colunas: **A Fazer · Fazendo · Revisão · Feito**. Nada fora
do quadro.

## Definição de pronto

- [ ] Funciona no fluxo real, não só no caso feliz
- [ ] Regra de negócio validada **na API**, não apenas no formulário
- [ ] Testada em tela de celular
- [ ] PR revisado e aprovado por outro integrante
- [ ] Documentação atualizada, se mudou contrato ou regra
- [ ] Sem `console.log` esquecido nem credencial no código

## Reunião semanal de 30 minutos

O que fiz, o que farei, o que travou. Só isso.

**Regra de desbloqueio:** travou 40 minutos no mesmo erro, manda no grupo com o
erro inteiro e o que já tentou. Sem isso, quem está aprendendo passa dois dias em
silêncio achando que a dúvida é boba.
