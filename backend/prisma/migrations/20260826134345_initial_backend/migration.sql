-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('COORDENACAO', 'DOCENTE');

-- CreateEnum
CREATE TYPE "StatusImportacao" AS ENUM ('INICIADA', 'CONCLUIDA', 'FALHOU');

-- CreateEnum
CREATE TYPE "TipoEntidade" AS ENUM ('DOCENTE', 'FORMACAO', 'PRODUCAO', 'ORIENTACAO', 'PROJETO');

-- CreateEnum
CREATE TYPE "StatusSugestao" AS ENUM ('PENDENTE', 'APROVADA', 'REJEITADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoDecisao" AS ENUM ('APROVACAO', 'REJEICAO');

-- CreateTable
CREATE TABLE "programas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "programa_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "nome" TEXT,
    "perfil" "PerfilUsuario" NOT NULL DEFAULT 'DOCENTE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "docente_id" UUID,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes_refresh" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "revogada_em" TIMESTAMP(3),
    "criada_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessoes_refresh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docentes" (
    "id" UUID NOT NULL,
    "programa_id" TEXT NOT NULL,
    "id_docente" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nome_normalizado" TEXT NOT NULL,
    "ano_ingresso_programa" INTEGER,
    "dados_originais" JSONB NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "docentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formacoes" (
    "id" UUID NOT NULL,
    "programa_id" TEXT NOT NULL,
    "id_formacao" TEXT NOT NULL,
    "docente_id" UUID NOT NULL,
    "nivel" TEXT,
    "instituicao" TEXT,
    "ano_inicio" INTEGER,
    "ano_conclusao" INTEGER,
    "dados_originais" JSONB NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producoes" (
    "id" UUID NOT NULL,
    "programa_id" TEXT NOT NULL,
    "id_producao" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "ano" INTEGER,
    "natureza" TEXT,
    "elegivel_coordenacao" BOOLEAN NOT NULL DEFAULT false,
    "elegivel_publico" BOOLEAN NOT NULL DEFAULT false,
    "exibir_padrao_coordenacao" BOOLEAN NOT NULL DEFAULT false,
    "exibir_padrao_publico" BOOLEAN NOT NULL DEFAULT false,
    "permite_ocultar_coordenacao" BOOLEAN NOT NULL DEFAULT false,
    "oculta_coordenacao" BOOLEAN NOT NULL DEFAULT false,
    "ocultada_por" UUID,
    "ocultada_em" TIMESTAMP(3),
    "dados_originais" JSONB NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producao_docentes" (
    "producao_id" UUID NOT NULL,
    "docente_id" UUID NOT NULL,
    "elegivel_docente" BOOLEAN NOT NULL DEFAULT false,
    "exibir_por_padrao" BOOLEAN NOT NULL DEFAULT false,
    "permite_ocultar" BOOLEAN NOT NULL DEFAULT false,
    "oculta_docente" BOOLEAN NOT NULL DEFAULT false,
    "ocultada_por" UUID,
    "ocultada_em" TIMESTAMP(3),

    CONSTRAINT "producao_docentes_pkey" PRIMARY KEY ("producao_id","docente_id")
);

-- CreateTable
CREATE TABLE "orientacoes" (
    "id" UUID NOT NULL,
    "programa_id" TEXT NOT NULL,
    "id_orientacao" TEXT NOT NULL,
    "orientando" TEXT NOT NULL,
    "ano" INTEGER,
    "nivel_normalizado" TEXT,
    "situacao_normalizada" TEXT,
    "elegivel_coordenacao" BOOLEAN NOT NULL DEFAULT false,
    "elegivel_publico" BOOLEAN NOT NULL DEFAULT false,
    "exibir_padrao_coordenacao" BOOLEAN NOT NULL DEFAULT false,
    "exibir_padrao_publico" BOOLEAN NOT NULL DEFAULT false,
    "permite_ocultar_coordenacao" BOOLEAN NOT NULL DEFAULT false,
    "oculta_coordenacao" BOOLEAN NOT NULL DEFAULT false,
    "ocultada_por" UUID,
    "ocultada_em" TIMESTAMP(3),
    "monitoramento_atualizacao" JSONB,
    "dados_originais" JSONB NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orientacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orientacao_docentes" (
    "orientacao_id" UUID NOT NULL,
    "docente_id" UUID NOT NULL,
    "elegivel_docente" BOOLEAN NOT NULL DEFAULT false,
    "exibir_por_padrao" BOOLEAN NOT NULL DEFAULT false,
    "permite_ocultar" BOOLEAN NOT NULL DEFAULT false,
    "oculta_docente" BOOLEAN NOT NULL DEFAULT false,
    "ocultada_por" UUID,
    "ocultada_em" TIMESTAMP(3),

    CONSTRAINT "orientacao_docentes_pkey" PRIMARY KEY ("orientacao_id","docente_id")
);

-- CreateTable
CREATE TABLE "projetos" (
    "id" UUID NOT NULL,
    "programa_id" TEXT NOT NULL,
    "id_projeto" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "ano_inicio" INTEGER,
    "ano_conclusao" INTEGER,
    "situacao_normalizada" TEXT,
    "elegivel_coordenacao" BOOLEAN NOT NULL DEFAULT false,
    "elegivel_publico" BOOLEAN NOT NULL DEFAULT false,
    "exibir_padrao_coordenacao" BOOLEAN NOT NULL DEFAULT false,
    "exibir_padrao_publico" BOOLEAN NOT NULL DEFAULT false,
    "permite_ocultar_coordenacao" BOOLEAN NOT NULL DEFAULT false,
    "oculta_coordenacao" BOOLEAN NOT NULL DEFAULT false,
    "ocultada_por" UUID,
    "ocultada_em" TIMESTAMP(3),
    "dados_originais" JSONB NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projeto_docentes" (
    "projeto_id" UUID NOT NULL,
    "docente_id" UUID NOT NULL,
    "elegivel_docente" BOOLEAN NOT NULL DEFAULT false,
    "exibir_por_padrao" BOOLEAN NOT NULL DEFAULT false,
    "permite_ocultar" BOOLEAN NOT NULL DEFAULT false,
    "oculta_docente" BOOLEAN NOT NULL DEFAULT false,
    "ocultada_por" UUID,
    "ocultada_em" TIMESTAMP(3),

    CONSTRAINT "projeto_docentes_pkey" PRIMARY KEY ("projeto_id","docente_id")
);

-- CreateTable
CREATE TABLE "importacoes" (
    "id" UUID NOT NULL,
    "programa_id" TEXT,
    "status" "StatusImportacao" NOT NULL DEFAULT 'INICIADA',
    "origem" TEXT NOT NULL,
    "schema_versao" TEXT,
    "metadados" JSONB,
    "contagens" JSONB,
    "erro" TEXT,
    "iniciada_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluida_em" TIMESTAMP(3),

    CONSTRAINT "importacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sugestoes" (
    "id" UUID NOT NULL,
    "programa_id" TEXT NOT NULL,
    "tipo_entidade" "TipoEntidade" NOT NULL,
    "registro_id_externo" TEXT NOT NULL,
    "alteracoes" JSONB NOT NULL,
    "justificativa" TEXT NOT NULL,
    "status" "StatusSugestao" NOT NULL DEFAULT 'PENDENTE',
    "autor_id" UUID NOT NULL,
    "criada_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizada_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sugestoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decisoes_sugestoes" (
    "id" UUID NOT NULL,
    "sugestao_id" UUID NOT NULL,
    "tipo" "TipoDecisao" NOT NULL,
    "justificativa" TEXT NOT NULL,
    "responsavel_id" UUID NOT NULL,
    "decidida_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decisoes_sugestoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "correcoes_aprovadas" (
    "id" UUID NOT NULL,
    "programa_id" TEXT NOT NULL,
    "sugestao_id" UUID NOT NULL,
    "tipo_entidade" "TipoEntidade" NOT NULL,
    "registro_id_externo" TEXT NOT NULL,
    "alteracoes" JSONB NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "responsavel_id" UUID NOT NULL,
    "aprovada_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "correcoes_aprovadas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_docente_id_key" ON "usuarios"("docente_id");

-- CreateIndex
CREATE INDEX "usuarios_programa_id_perfil_idx" ON "usuarios"("programa_id", "perfil");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_refresh_token_hash_key" ON "sessoes_refresh"("token_hash");

-- CreateIndex
CREATE INDEX "sessoes_refresh_usuario_id_expira_em_idx" ON "sessoes_refresh"("usuario_id", "expira_em");

-- CreateIndex
CREATE INDEX "docentes_programa_id_nome_normalizado_idx" ON "docentes"("programa_id", "nome_normalizado");

-- CreateIndex
CREATE UNIQUE INDEX "docentes_programa_id_id_docente_key" ON "docentes"("programa_id", "id_docente");

-- CreateIndex
CREATE INDEX "formacoes_docente_id_idx" ON "formacoes"("docente_id");

-- CreateIndex
CREATE UNIQUE INDEX "formacoes_programa_id_id_formacao_key" ON "formacoes"("programa_id", "id_formacao");

-- CreateIndex
CREATE INDEX "producoes_programa_id_elegivel_publico_oculta_coordenacao_idx" ON "producoes"("programa_id", "elegivel_publico", "oculta_coordenacao");

-- CreateIndex
CREATE INDEX "producoes_programa_id_elegivel_coordenacao_idx" ON "producoes"("programa_id", "elegivel_coordenacao");

-- CreateIndex
CREATE UNIQUE INDEX "producoes_programa_id_id_producao_key" ON "producoes"("programa_id", "id_producao");

-- CreateIndex
CREATE INDEX "producao_docentes_docente_id_elegivel_docente_oculta_docent_idx" ON "producao_docentes"("docente_id", "elegivel_docente", "oculta_docente");

-- CreateIndex
CREATE INDEX "orientacoes_programa_id_elegivel_publico_oculta_coordenacao_idx" ON "orientacoes"("programa_id", "elegivel_publico", "oculta_coordenacao");

-- CreateIndex
CREATE INDEX "orientacoes_programa_id_elegivel_coordenacao_idx" ON "orientacoes"("programa_id", "elegivel_coordenacao");

-- CreateIndex
CREATE UNIQUE INDEX "orientacoes_programa_id_id_orientacao_key" ON "orientacoes"("programa_id", "id_orientacao");

-- CreateIndex
CREATE INDEX "orientacao_docentes_docente_id_elegivel_docente_oculta_doce_idx" ON "orientacao_docentes"("docente_id", "elegivel_docente", "oculta_docente");

-- CreateIndex
CREATE INDEX "projetos_programa_id_elegivel_publico_oculta_coordenacao_idx" ON "projetos"("programa_id", "elegivel_publico", "oculta_coordenacao");

-- CreateIndex
CREATE INDEX "projetos_programa_id_elegivel_coordenacao_idx" ON "projetos"("programa_id", "elegivel_coordenacao");

-- CreateIndex
CREATE UNIQUE INDEX "projetos_programa_id_id_projeto_key" ON "projetos"("programa_id", "id_projeto");

-- CreateIndex
CREATE INDEX "projeto_docentes_docente_id_elegivel_docente_oculta_docente_idx" ON "projeto_docentes"("docente_id", "elegivel_docente", "oculta_docente");

-- CreateIndex
CREATE INDEX "importacoes_programa_id_status_concluida_em_idx" ON "importacoes"("programa_id", "status", "concluida_em");

-- CreateIndex
CREATE INDEX "sugestoes_programa_id_status_criada_em_idx" ON "sugestoes"("programa_id", "status", "criada_em");

-- CreateIndex
CREATE INDEX "sugestoes_programa_id_tipo_entidade_registro_id_externo_idx" ON "sugestoes"("programa_id", "tipo_entidade", "registro_id_externo");

-- CreateIndex
CREATE INDEX "decisoes_sugestoes_sugestao_id_decidida_em_idx" ON "decisoes_sugestoes"("sugestao_id", "decidida_em");

-- CreateIndex
CREATE UNIQUE INDEX "correcoes_aprovadas_sugestao_id_key" ON "correcoes_aprovadas"("sugestao_id");

-- CreateIndex
CREATE INDEX "correcoes_aprovadas_programa_id_tipo_entidade_registro_id_e_idx" ON "correcoes_aprovadas"("programa_id", "tipo_entidade", "registro_id_externo", "ativa");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes_refresh" ADD CONSTRAINT "sessoes_refresh_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docentes" ADD CONSTRAINT "docentes_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formacoes" ADD CONSTRAINT "formacoes_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formacoes" ADD CONSTRAINT "formacoes_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producoes" ADD CONSTRAINT "producoes_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producao_docentes" ADD CONSTRAINT "producao_docentes_producao_id_fkey" FOREIGN KEY ("producao_id") REFERENCES "producoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producao_docentes" ADD CONSTRAINT "producao_docentes_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientacoes" ADD CONSTRAINT "orientacoes_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientacao_docentes" ADD CONSTRAINT "orientacao_docentes_orientacao_id_fkey" FOREIGN KEY ("orientacao_id") REFERENCES "orientacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientacao_docentes" ADD CONSTRAINT "orientacao_docentes_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projeto_docentes" ADD CONSTRAINT "projeto_docentes_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projeto_docentes" ADD CONSTRAINT "projeto_docentes_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "importacoes" ADD CONSTRAINT "importacoes_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sugestoes" ADD CONSTRAINT "sugestoes_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sugestoes" ADD CONSTRAINT "sugestoes_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisoes_sugestoes" ADD CONSTRAINT "decisoes_sugestoes_sugestao_id_fkey" FOREIGN KEY ("sugestao_id") REFERENCES "sugestoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisoes_sugestoes" ADD CONSTRAINT "decisoes_sugestoes_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correcoes_aprovadas" ADD CONSTRAINT "correcoes_aprovadas_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correcoes_aprovadas" ADD CONSTRAINT "correcoes_aprovadas_sugestao_id_fkey" FOREIGN KEY ("sugestao_id") REFERENCES "sugestoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correcoes_aprovadas" ADD CONSTRAINT "correcoes_aprovadas_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
