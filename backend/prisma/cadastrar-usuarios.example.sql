-- 1. Crie primeiro as contas em Authentication > Users no Supabase.
-- 2. Copie o UUID gerado e use-o abaixo.
-- 3. O e-mail deve ser o mesmo da conta no Supabase Auth.

insert into public.usuarios (id, email, nome, perfil, ativo, criado_em, atualizado_em)
values (
  'UUID_DA_CONTA_DE_COORDENACAO',
  'coordenacao@ufpi.edu.br',
  'Coordenação do PPGCC',
  'COORDENACAO',
  true,
  now(),
  now()
);

insert into public.usuarios (
  id,
  email,
  nome,
  perfil,
  ativo,
  docente_id,
  criado_em,
  atualizado_em
)
values (
  'UUID_DA_CONTA_DO_DOCENTE',
  'docente@ufpi.edu.br',
  'Nome do Docente',
  'DOCENTE',
  true,
  'doc_ID_EXISTENTE_EM_DOCENTES_JSON',
  now(),
  now()
);
