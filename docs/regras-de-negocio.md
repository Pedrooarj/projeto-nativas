# Regras de negócio

> **Toda regra aqui é validada na API, não no formulário.** O front valida para
> dar feedback rápido; a API valida para garantir integridade. Um quadro bonito
> que deixa voltar etapa corrompe o dado, e dado de campo corrompido ninguém
> reconstrói — ninguém volta ao viveiro em maio para recontar o que havia em
> março.
>
> Se faltar tempo no semestre, corte tela. Nunca validação.

Os códigos de erro seguem o padrão da API: `401` sem token, `403` sem permissão,
`404` não encontrado, `409` conflito de regra, `422` falha de validação.

---

## RN-01 — Etiqueta única do lote

**Implementada** em `api/src/shared/gerarTag.ts`, com teste em
`gerarTag.test.ts`. O endpoint que a usa ainda não existe.

Formato `<PREFIXO>-<SEQUENCIAL>`: `A-102` (Angico), `M-045` (Mandacaru).

- **Prefixo:** primeira letra do nome comum, maiúscula, sem acento
  (`Ipê-roxo` → `I`).
- **Sequencial:** contador por prefixo, começa em 1, com três dígitos, **nunca
  reaproveitado** — nem se o lote for excluído.
- Espécies com a mesma inicial **compartilham o contador**. `A-102` pode ser
  Angico e `A-103` Aroeira: o prefixo é ajuda de leitura, não chave.
- A etiqueta é gerada no cadastro do lote e é **imutável**.

**Concorrência.** Dois registros simultâneos não podem receber a mesma etiqueta.
Duas camadas: a tabela `contador_tag`, com uma linha por prefixo, atualizada em
transação com `INSERT ... ON CONFLICT DO UPDATE ... RETURNING`; e a constraint
`UNIQUE` em `lote_mudas.tag_unica` como rede de segurança.

Quem construir `POST /lotes` chama `gerarTag(nomeComum, tx)` passando a transação
do cadastro, para que etiqueta e lote nasçam juntos ou não nasçam.

---

## RN-02 — Quebra de dormência

Três valores, e nenhum outro:

| Valor | Significado |
|---|---|
| `ESCARIFICACAO` | desgaste mecânico do tegumento |
| `EMBEBICAO` | imersão em água antes da semeadura |
| `N` | não necessita |

Choque térmico e métodos químicos ficaram fora por decisão da coordenação — o
projeto não manipula produtos químicos. Qualquer outro valor é erro `422`.

**O tratamento pertence ao lote, não à espécie.** O método varia com muitos
fatores, então não existe "método padrão" no cadastro de espécie. O acervo mostra
os tratamentos que o projeto já aplicou àquela espécie, calculados a partir dos
lotes — informação real em vez de padrão fictício.

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
| Etapa 1 | Etapa 2 | sim |
| Etapa 1 | Destino final | sim — a etapa 2 é opcional |
| Etapa 2 | Destino final | sim |
| qualquer | etapa anterior | **não** — devolve `409` |
| Destino final | qualquer | **não** — estado terminal |

### Recipiente por etapa

| Etapa | Recipientes válidos |
|---|---|
| Etapa 1 | `TUBETE`, `SEMENTEIRA` |
| Etapa 2 | `SACO`, `CANO` |

Enviar `SACO` num lote na etapa 1 é erro de validação, não aviso.

### Setor do viveiro

Quatro setores, com os nomes que a equipe usa: `BANCO_SEMENTES`, `CANTEIROS`,
`SEMENTEIRAS`, `RUSTIFICACAO`. Mais um campo livre opcional para identificação
fina (`identificacaoFina`: "bancada 3", "fileira 4").

**A localização muda ao longo da vida do lote** (sementeira → canteiro →
rustificação). Por isso a transição de etapa atualiza o setor junto.

Toda transição grava uma linha em `historico_crescimento` com etapa anterior,
etapa nova, recipiente, setor, data e responsável. O histórico é **append-only**:
é ele que reconstrói a linha do tempo da muda.

---

## RN-04 — Destino final

Um lote é finalizado inteiro, em um único destino. Lotes da mesma espécie
plantados em épocas diferentes são lotes diferentes.

| Tipo | Campos exigidos |
|---|---|
| `PLANTIO_DEFINITIVO` | latitude, longitude, descrição do local, data, quantidade |
| `DOACAO` | destinatário, data, quantidade |
| `PERDA` | data, quantidade, causa (opcional) |

No banco, todos os campos por tipo são opcionais; **quem exige é o service**,
conforme o tipo escolhido.

Validações: latitude entre -90 e 90, longitude entre -180 e 180, descrição com no
mínimo 5 caracteres, data não futura nem anterior ao plantio do lote.

**Só o plantio definitivo** gera ponto no mapa e entra no contador público.

A operação é **atômica**: ou cria o destino, atualiza o estágio para `FINALIZADO`
e grava o histórico, ou não faz nada. Uma muda marcada como plantada sem
coordenada é pior que não registrada, porque parece completa.

---

## RN-05 — Procedência

- Todo lote aponta para uma coleta, e o campo é **obrigatório**. Sem isso a
  rastreabilidade prometida no portal não existe.
- A espécie do lote precisa ser **a mesma da coleta**.
- A soma de sementes usada em lotes de uma coleta **não pode passar** a
  quantidade coletada. Passar devolve `409` com o saldo disponível na mensagem.
- Toda coleta registra a coordenada da matriz — é o que permite voltar à mesma
  árvore no ano seguinte. As matrizes não têm código próprio: são identificadas
  pela coordenada e pela descrição do local.

---

## RN-06 — Responsável

A equipe compartilha uma conta de login. Portanto **o responsável nunca vem do
token** — viria sempre o mesmo usuário.

Todo formulário tem o campo "quem está registrando", escolhido na lista de
colaboradores (`GET /colaboradores`). O `colaboradorId` vem no corpo da
requisição e é obrigatório em coleta, lote, transição, destino e visita.

**Colaborador não é Usuario.** Usuario faz login e tem senha e papel; Colaborador
é só um nome, sem login e sem e-mail, gerenciado pelo admin. Confundir os dois é
o erro mais provável de quem chegar depois.

A interface lembra o último nome escolhido naquele aparelho.

---

## RN-07 — Contadores públicos

**Implementada** em `api/src/modules/publico/publico.service.ts`, com teste em
`publico.service.test.ts`.

| Contador | Cálculo |
|---|---|
| Sementes coletadas | soma de `qtd_sementes` das coletas |
| Mudas no viveiro | soma de `qtd_mudas_vivas` dos lotes nas etapas 1 e 2 |
| Plantios definitivos | contagem de destinos do tipo `PLANTIO_DEFINITIVO` |
| Visitas recebidas | contagem de visitas |

Registros com `deleted_at` preenchido ficam fora de todas as somas.

Cache em memória de **5 minutos**. Os números não precisam ser instantâneos, mas
precisam ser verdadeiros. Quem grava um registro novo pode chamar
`limparCacheMetricas()` para o número subir na hora.

---

## RN-08 — Dados calculados do acervo

Por espécie, nada digitado à mão:

- número de coletas e total de sementes coletadas
- mudas produzidas (soma das sementes dos lotes)
- plantios definitivos
- taxa de germinação: `mudas vivas ÷ sementes plantadas`, considerando **apenas
  lotes com contagem registrada** e exibindo sobre quantos lotes o cálculo foi
  feito
- tratamentos já aplicados, com a contagem de lotes de cada um

O conteúdo botânico (descrição, porte, floração, frutificação, usos, fotos) é
preenchido pela coordenação e entra por **importação de planilha**, não por
digitação tela a tela — são 30 a 40 espécies. A tela de cadastro existe para
correção pontual.

---

## RN-09 — Permissões e exclusão

| Ação | Admin | Equipe |
|---|---|---|
| Registrar coleta, lote, transição, destino, visita | sim | sim |
| Criar e editar espécies e conteúdo do acervo | sim | **não** |
| Editar listas de colaboradores e substratos | sim | **não** |
| Excluir registros | sim | **não** |

Exclusão é **soft delete** (`deleted_at`), sem tela no MVP. Dado de campo não se
apaga.
