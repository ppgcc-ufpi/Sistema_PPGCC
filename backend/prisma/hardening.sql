-- Execute no SQL Editor do Supabase depois da primeira migration.
-- A aplicação acessa o banco exclusivamente pelo backend; anon e authenticated
-- não precisam consultar as tabelas pela Data API do Supabase.

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;
