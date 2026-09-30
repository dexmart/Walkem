-- Email address customers send Interac e-Transfers to (editable in Store settings).
alter table public.store_settings add column if not exists interac_email text default 'walkemfoods@gmail.com';
update public.store_settings set interac_email = 'walkemfoods@gmail.com' where id = 1 and interac_email is null;
