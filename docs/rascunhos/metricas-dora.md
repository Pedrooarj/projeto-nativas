# Métricas DORA (rascunho)

**Status:** rascunho para o time revisar. **Corte da medição:** 2026-11-23 19:00 UTC.
**Marcadores:** [fato] é contagem ou tempo medido no GitHub. [estimativa] é o uso desse valor como
substituto de uma métrica DORA, porque o projeto ainda não tem implantação em produção.

## Como reproduzir

Com o `gh` autenticado, na raiz do repositório:

```bash
node docs/rascunhos/metricas-entrega.mjs
```

O script só faz consultas de leitura. Todo número deste documento sai dessa saída. Para medir na
entrega final:

```bash
node docs/rascunhos/metricas-entrega.mjs --ate=2026-11-30T23:59:00-03:00
```

Limites conhecidos: uma branch apagada no GitHub sai da contagem de commits, e um dado editado
no GitHub depois do corte pode mudar o resultado.

## Leitura principal

O projeto **não tem implantação registrada até o corte**: 0 deployments, 0 releases e 0 tags
[fato]. Por isso os valores abaixo medem a **integração na `main`**, não a entrega em produção, e
não devem ser comparados com as faixas de desempenho do relatório DORA.

## As quatro métricas

| Métrica DORA | Substituto [estimativa] | Projeto inteiro: medido [fato] | n [fato] | Sprint 2, desde 2026-11-01: medido [fato] | n [fato] |
|---|---|---|---|---|---|
| Frequência de implantação | Merges na `main` por semana | 1,70 por semana (17 merges em 10,0 semanas) | 17 | 0,31 por semana (1 merge em 3,2 semanas) | 1 |
| Lead time de mudanças | Primeiro commit do PR até o merge | Mediana 3,9 h, média 2,3 dias, de 2 min a 11,5 dias | 17 | 7,0 dias (só o #49) | 1 |
| Taxa de falha de mudanças | Execuções de CI da `main` com `failure`, `timed_out` ou `startup_failure` | 0 de 22 = 0,0% | 22 | 0 de 1 = 0,0% | 1 |
| Tempo de recuperação | Do primeiro incidente na `main` até o próximo sucesso | Sem dado: nenhum incidente | 0 | Sem dado | 0 |

**Notas**

1. Os tempos e as contagens são [fato]. Chamá-los de frequência de implantação, lead time, taxa
   de falha ou recuperação é [estimativa], pois nada foi implantado.
2. CI verde não prova ausência de defeito em uso. Sem produção, a taxa real de falha é
   desconhecida, e o tempo de recuperação fica sem valor em vez de virar zero.
3. Indicador complementar: 1 de 17 PRs mesclados tem título de correção (#48, link de vídeo no
   README) [fato]. É correção de documentação, não falha de sistema.
4. Com n=1, os valores da Sprint 2 descrevem o #49 e não uma tendência.

## Dados de apoio

| Dado | Valor | n |
|---|---|---|
| Cycle time (abertura do PR até merge), projeto inteiro | Mediana 3,8 h, média 2,2 dias, de 1 min a 11,5 dias [fato] | 17 [fato] |
| Dias distintos com merge, em America/Fortaleza | 9 [fato] | 17 merges [fato] |
| Execuções de CI na `main` | 22 sucessos, 0 incidentes, 0 canceladas, 0 com nova tentativa [fato] | 22 [fato] |
| Execuções de CI em PR | 31 sucessos, 0 incidentes, 0 canceladas [fato] | 31 [fato] |
| PRs abertos no corte | #50, #51 e #52 prontos; #53 e #54 em rascunho [fato] | 5 [fato] |

A tabela com lead time, cycle time e fila de cada PR mesclado está na seção "PRs mesclados, um
por linha" da saída do comando.

## O que mudaria a leitura

- Fazer a primeira implantação e registrá-la (release ou tag). A partir daí, frequência e lead
  time passam a ser medidos de verdade.
- Definir o que conta como falha em produção, para a taxa de falha e o tempo de recuperação
  deixarem de ser substitutos.
