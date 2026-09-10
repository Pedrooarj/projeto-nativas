# 01 — Regras de negócio

Documento de referência para implementação. Toda regra aqui precisa estar validada **na
API**, não apenas no formulário: o front valida para dar feedback rápido, a API valida para
garantir integridade.

Se faltar tempo no semestre, corte tela — nunca validação. Um quadro bonito que deixa voltar
etapa corrompe o dado, e dado de campo corrompido ninguém reconstrói.

---

## RN-01 — Etiqueta única do lote

Formato `<PREFIXO>-<SEQUENCIAL>`: `A-102` (Angico), `M-045` (Mandacaru).

- **Prefixo:** primeira letra do nome comum, maiúscula, sem acento (`Ipê-roxo` → `I`).
- **Sequencial:** contador por prefixo, começa em 1, nunca reaproveitado — nem se o lote for
  excluído.
- Espécies com a mesma inicial **compartilham o contador**. `A-102` pode ser Angico e `A-103`
  Aroeira; o prefixo é ajuda de leitura, não chave.
- A etiqueta é gerada no cadastro do lote e é **imutável**.

**Concorrência.** Dois registros simultâneos não podem receber a mesma etiqueta. Duas
camadas: tabela `contador_tag` com uma linha por prefixo, atualizada em transação com
`INSERT ... ON CONFLICT DO UPDATE ... RETURNING`; e constraint `UNIQUE` no banco como rede de
segurança.

---

## RN-02 — Quebra de dormência

Três valores, e nenhum outro:

| Valor | Significado |
|---|---|
| `ESCARIFICACAO` | Desgaste mecânico do tegumento |
| `EMBEBICAO` | Imersão em água antes da semeadura |
| `N` | Não necessita |

Choque térmico e métodos químicos ficaram fora por decisão da coordenação — o projeto não
manipula produtos químicos.

**O tratamento pertence ao lote, não à espécie.** O método varia com muitos fatores, então
não existe "método padrão" no cadastro de espécie. O acervo mostra os tratamentos que o
projeto já aplicou àquela espécie, calculados a partir dos lotes — informação real em vez de
padrão fictício.

---

## RN-03 — Fluxo de crescimento

```
  cadastro ──► ETAPA 1 ──┬──► ETAPA 2 ──┐
             Tubete ou   │    Saco ou   ├──► DESTINO FINAL
             Sementeira  │    Cano      │
                         └──────────────┘
                          (etapa 2 é opcional)
```

### Transições

| De | Para | Permitido |
|---|---|---|
| Etapa 1 | Etapa 2 | Sim |
| Etapa 1 | Destino final | Sim — a etapa 2 é opcional |
| Etapa 2 | Destino final | Sim |
| qualquer | etapa anterior | **Não** — devolve `409` |
| Destino final | qualquer | **Não** — estado terminal |

### Recipiente por etapa

| Etapa | Recipientes válidos |
|---|---|
| Etapa 1 | `TUBETE`, `SEMENTEIRA` |
| Etapa 2 | `SACO`, `CANO` |

Enviar `SACO` num lote na etapa 1 é erro de validação, não aviso.

### Setor do viveiro

Quatro setores, com os nomes que a equipe usa: `Banco de sementes`, `Canteiros`,
`Sementeiras`, `Rustificação`. Mais um campo livre opcional para identificação fina
(bancada, fileira).

**A localização muda ao longo da vida do lote** (sementeira → canteiro → rustificação). Por
isso a transição de etapa atualiza o setor junto, e o histórico registra as duas coisas.

Toda transição grava uma linha em `historico_crescimento` com etapa, setor, data e
responsável. O histórico é append-only — é ele que reconstrói a linha do tempo da muda.

---

## RN-04 — Destino final

Um lote é finalizado inteiro, em um único destino. Lotes da mesma espécie plantados em
épocas diferentes são lotes diferentes.

| Tipo | Campos exigidos |
|---|---|
| **Plantio definitivo** | latitude, longitude, descrição do local, data, quantidade |
| **Doação** | destinatário, data, quantidade |
| **Perda** | data, quantidade, causa (opcional) |

Validações: latitude entre -90 e 90, longitude entre -180 e 180, descrição com no mínimo 5
caracteres, data não futura nem anterior ao plantio do lote.

**Só o plantio definitivo** gera ponto no mapa e entra no contador público.

A operação é **atômica**: ou cria o destino, atualiza o estágio e grava o histórico, ou não
faz nada. Uma muda marcada como plantada sem coordenada é pior que não registrada, porque
parece completa.

---

## RN-05 — Procedência

- Todo lote aponta para uma coleta (obrigatório). Sem isso a rastreabilidade prometida no
  portal não existe.
- A espécie do lote precisa ser a mesma da coleta.
- A soma de sementes usada em lotes de uma coleta não pode passar a quantidade coletada.
- Toda coleta registra a coordenada da matriz — é o que permite voltar à mesma árvore no ano
  seguinte. As matrizes não têm código próprio; são identificadas pela coordenada e pela
  descrição do local.

---

## RN-06 — Responsável

A equipe compartilha uma conta de login. Portanto **o responsável nunca vem do token** —
viria sempre o mesmo usuário.

Todo formulário tem o campo "quem está registrando", escolhido numa lista de colaboradores
(nomes simples, sem login nem e-mail, gerenciada pelo admin). A interface lembra o último
nome escolhido naquele aparelho.

Duas contas de login apenas: uma de administração (coordenação) e uma da equipe do viveiro.

---

## RN-07 — Contadores públicos

| Contador | Cálculo |
|---|---|
| Sementes coletadas | soma de `qtd_sementes` das coletas |
| Mudas no viveiro | soma de `qtd_mudas_vivas` dos lotes nas etapas 1 e 2 |
| Plantios definitivos | contagem de destinos do tipo plantio definitivo |
| Visitas recebidas | contagem de visitas |

Cache de 5 minutos. Os números não precisam ser instantâneos, mas precisam ser verdadeiros.

---

## RN-08 — Dados calculados do acervo

Por espécie, nada digitado à mão:

- número de coletas e total de sementes coletadas
- mudas produzidas (soma das sementes dos lotes)
- plantios definitivos
- taxa de germinação: `mudas vivas ÷ sementes plantadas`, considerando apenas lotes com
  contagem registrada, exibindo sobre quantos lotes o cálculo foi feito
- tratamentos já aplicados, com a contagem de lotes de cada um

O conteúdo botânico (descrição, porte, floração, frutificação, usos, fotos) é preenchido pela
coordenação e entra por **importação de planilha**, não por digitação tela a tela — são 30 a
40 espécies.

---

## RN-09 — Permissões e exclusão

| Ação | Admin | Equipe |
|---|---|---|
| Registrar coleta, lote, transição, destino, visita | ✅ | ✅ |
| Criar e editar espécies e conteúdo do acervo | ✅ | ❌ |
| Editar listas de colaboradores e substratos | ✅ | ❌ |
| Excluir registros | ✅ | ❌ |

Exclusão é **soft delete** (`deleted_at`), sem tela no MVP. Dado de campo não se apaga:
ninguém consegue voltar ao viveiro em maio para recontar o que havia em março.
