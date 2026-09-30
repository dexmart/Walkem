-- Interac e-Transfers now go to walkemcommunications@gmail.com.
alter table public.store_settings alter column interac_email set default 'walkemcommunications@gmail.com';
update public.store_settings set interac_email = 'walkemcommunications@gmail.com' where id = 1;
