# Métricas DORA (rascunho)

**Status:** rascunho para o time revisar. **Corte da medição:** 2026-11-23 19:00 UTC.
**Marcadores:** [fato] é contagem ou tempo lido do git ou da API do GitHub. [estimativa] é um
substituto, usado porque o projeto ainda não tem implantação em produção.

## Como reproduzir

Na raiz do repositório, com `gh` autenticado:

```bash
git fetch origin
node docs/rascunhos/metricas-entrega.mjs
```

O script só lê dados. Com o corte padrão, a saída se repete enquanto o histórico do GitHub não
mudar. Para medir na entrega final:

```bash
node docs/rascunhos/metricas-entrega.mjs --ate=2026-11-30T23:59:00-03:00
```

Limite conhecido: `isDraft` vem do estado atual do PR, não do estado na data de corte.

## Leitura principal

O projeto **não tem implantação registrada**: 0 deployments, 0 releases e 0 tags [fato]. Por
isso as quatro métricas abaixo medem a **integração na `main`**, não a entrega em produção. Elas
não devem ser comparadas com as faixas de desempenho do relatório DORA.

## As quatro métricas

| Métrica DORA | Substituto usado | Projeto inteiro | Sprint 2 (desde 2026-11-01) |
|---|---|---|---|
| Frequência de implantação | Merges na `main` por semana | 1,70 por semana [estimativa] (17 merges [fato] em 10,0 semanas) | 0,31 por semana [estimativa] (1 merge [fato] em 3,2 semanas) |
| Lead time de mudanças | Primeiro commit do PR até o merge | Mediana 3,9 h, média 2,3 dias, de 2 min a 11,5 dias [estimativa] (n=17) | 7,0 dias [estimativa] (n=1, só o #49) |
| Taxa de falha de mudanças | Execuções de CI com falha na `main` | 0 de 22 = 0% [estimativa] | ver nota 1 |
| Tempo de recuperação | Da primeira falha na `main` até o próximo sucesso | Sem dado: nenhuma falha na `main` [fato] | Sem dado |

**Notas**

1. O script conta o CI da `main` no projeto inteiro, sem separar por sprint.
2. CI verde não prova ausência de defeito em uso. Sem produção, a taxa real de falha é
   desconhecida. Por isso o 0% é [estimativa], e o tempo de recuperação fica sem valor em vez de
   virar zero.
3. Indicador complementar: 1 de 17 PRs mesclados tem título de correção (#48, link de vídeo no
   README) [fato]. É correção de documentação, não falha de sistema.
4. Com n=1, o valor da Sprint 2 descreve o #49 e não uma tendência.

## Dados de apoio

| Dado | Valor |
|---|---|
| Cycle time (abertura do PR até merge), projeto inteiro | Mediana 3,8 h, média 2,2 dias, de 1 min a 11,5 dias, n=17 [fato] |
| Dias com pelo menos um merge | 9 [fato] |
| Execuções de CI na `main` | 22: 22 sucessos, 0 falhas, 0 canceladas, 0 com nova tentativa [fato] |
| Execuções de CI em PR | 31: 31 sucessos, 0 falhas, 0 canceladas [fato] |
| PRs abertos no corte | 5 (#50 a #54), 2 deles em rascunho [fato] |

## O que mudaria a leitura

- Fazer a primeira implantação e registrá-la (release ou tag). A partir daí, frequência e lead
  time passam a ser medidos de verdade.
- Definir o que conta como falha em produção, para a taxa de falha e o tempo de recuperação
  deixarem de ser substitutos.
