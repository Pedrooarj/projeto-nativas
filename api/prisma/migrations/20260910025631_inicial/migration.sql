-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('ADMIN', 'EQUIPE');

-- CreateEnum
CREATE TYPE "MetodoQuebra" AS ENUM ('ESCARIFICACAO', 'EMBEBICAO', 'N');

-- CreateEnum
CREATE TYPE "TipoRecipiente" AS ENUM ('TUBETE', 'SEMENTEIRA', 'SACO', 'CANO');

-- CreateEnum
CREATE TYPE "SetorViveiro" AS ENUM ('BANCO_SEMENTES', 'CANTEIROS', 'SEMENTEIRAS', 'RUSTIFICACAO');

-- CreateEnum
CREATE TYPE "Estagio" AS ENUM ('ESTAGIO_1', 'ESTAGIO_2', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "TipoDestino" AS ENUM ('PLANTIO_DEFINITIVO', 'DOACAO', 'PERDA');

-- CreateTable
CREATE TABLE "usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "papel" "Papel" NOT NULL DEFAULT 'EQUIPE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colaborador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "colaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "substrato" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "substrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "especie" (
    "id" TEXT NOT NULL,
    "nome_comum" TEXT NOT NULL,
    "nome_cientifico" TEXT NOT NULL,
    "familia" TEXT NOT NULL,
    "descricao" TEXT,
    "porte" TEXT,
    "epoca_floracao" TEXT,
    "epoca_frutificacao" TEXT,
    "usos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "foto_principal_url" TEXT,
    "galeria" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "especie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coleta" (
    "id" TEXT NOT NULL,
    "especie_id" TEXT NOT NULL,
    "matriz_lat" DECIMAL(9,6) NOT NULL,
    "matriz_lng" DECIMAL(9,6) NOT NULL,
    "qtd_sementes" INTEGER NOT NULL,
    "data_coleta" DATE NOT NULL,
    "local_descricao" TEXT,
    "foto_url" TEXT,
    "colaborador_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "coleta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lote_mudas" (
    "id" TEXT NOT NULL,
    "tag_unica" TEXT NOT NULL,
    "especie_id" TEXT NOT NULL,
    "coleta_id" TEXT NOT NULL,
    "data_plantio" DATE NOT NULL,
    "qtd_sementes" INTEGER NOT NULL,
    "qtd_mudas_vivas" INTEGER,
    "tipo_recipiente" "TipoRecipiente" NOT NULL,
    "tratamento_semente" "MetodoQuebra" NOT NULL,
    "substrato_id" TEXT NOT NULL,
    "setor" "SetorViveiro" NOT NULL,
    "identificacao_fina" TEXT,
    "foto_url" TEXT,
    "estagio_atual" "Estagio" NOT NULL DEFAULT 'ESTAGIO_1',
    "colaborador_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "lote_mudas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_crescimento" (
    "id" TEXT NOT NULL,
    "lote_id" TEXT NOT NULL,
    "estagio_anterior" "Estagio",
    "estagio_novo" "Estagio" NOT NULL,
    "recipiente_novo" "TipoRecipiente",
    "setor_novo" "SetorViveiro",
    "observacao" TEXT,
    "data_transferencia" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "colaborador_id" TEXT NOT NULL,

    CONSTRAINT "historico_crescimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destino_final" (
    "id" TEXT NOT NULL,
    "lote_id" TEXT NOT NULL,
    "tipo" "TipoDestino" NOT NULL,
    "data" DATE NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "destino_lat" DECIMAL(9,6),
    "destino_lng" DECIMAL(9,6),
    "local_descricao" TEXT,
    "destinatario" TEXT,
    "causa" TEXT,
    "colaborador_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destino_final_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visita" (
    "id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "instituicao" TEXT NOT NULL,
    "numero_pessoas" INTEGER NOT NULL,
    "observacao" TEXT,
    "colaborador_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contador_tag" (
    "prefixo" TEXT NOT NULL,
    "proximo" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "contador_tag_pkey" PRIMARY KEY ("prefixo")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "especie_nome_cientifico_key" ON "especie"("nome_cientifico");

-- CreateIndex
CREATE INDEX "especie_nome_comum_idx" ON "especie"("nome_comum");

-- CreateIndex
CREATE INDEX "coleta_especie_id_idx" ON "coleta"("especie_id");

-- CreateIndex
CREATE UNIQUE INDEX "lote_mudas_tag_unica_key" ON "lote_mudas"("tag_unica");

-- CreateIndex
CREATE INDEX "lote_mudas_estagio_atual_idx" ON "lote_mudas"("estagio_atual");

-- CreateIndex
CREATE INDEX "lote_mudas_especie_id_idx" ON "lote_mudas"("especie_id");

-- CreateIndex
CREATE INDEX "historico_crescimento_lote_id_idx" ON "historico_crescimento"("lote_id");

-- CreateIndex
CREATE UNIQUE INDEX "destino_final_lote_id_key" ON "destino_final"("lote_id");

-- CreateIndex
CREATE INDEX "destino_final_tipo_idx" ON "destino_final"("tipo");

-- AddForeignKey
ALTER TABLE "coleta" ADD CONSTRAINT "coleta_especie_id_fkey" FOREIGN KEY ("especie_id") REFERENCES "especie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coleta" ADD CONSTRAINT "coleta_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_mudas" ADD CONSTRAINT "lote_mudas_especie_id_fkey" FOREIGN KEY ("especie_id") REFERENCES "especie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_mudas" ADD CONSTRAINT "lote_mudas_coleta_id_fkey" FOREIGN KEY ("coleta_id") REFERENCES "coleta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_mudas" ADD CONSTRAINT "lote_mudas_substrato_id_fkey" FOREIGN KEY ("substrato_id") REFERENCES "substrato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_mudas" ADD CONSTRAINT "lote_mudas_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_crescimento" ADD CONSTRAINT "historico_crescimento_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "lote_mudas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_crescimento" ADD CONSTRAINT "historico_crescimento_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destino_final" ADD CONSTRAINT "destino_final_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "lote_mudas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destino_final" ADD CONSTRAINT "destino_final_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visita" ADD CONSTRAINT "visita_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
