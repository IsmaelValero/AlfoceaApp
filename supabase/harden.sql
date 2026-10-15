-- Endurecimiento de la base ya existente.
-- Orden recomendado:
--   1) supabase/events.sql   (si aun no lo has lanzado)
--   2) supabase/projects.sql (si aun no lo has lanzado)
--   3) este fichero
--
-- La service role de la app sigue pudiendo leer/escribir (bypass RLS).
-- Anon/authenticated sin politicas = denegado.
-- Si una tabla aun no existe, se salta sin error.

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'families',
    'members',
    'accounts',
    'reservations',
    'manuals',
    'rules',
    'projects',
    'project_tasks',
    'recurring_tasks',
    'recurring_completions',
    'polls',
    'poll_options',
    'poll_votes',
    'events',
    'event_rsvps',
    'event_items'
  ]
  loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I enable row level security', table_name);
    end if;
  end loop;
end $$;

-- Si ya existian FKs con cascade, deja el voto/RSVP de la familia al borrar al miembro.
do $$
begin
  if to_regclass('public.poll_votes') is not null then
    alter table public.poll_votes drop constraint if exists poll_votes_member_id_fkey;
    alter table public.poll_votes alter column member_id drop not null;
    alter table public.poll_votes
      add constraint poll_votes_member_id_fkey
      foreign key (member_id) references public.members (id) on delete set null;

    -- Varios dias por familia + adultos/ninos.
    alter table public.poll_votes drop constraint if exists poll_votes_poll_id_family_id_key;
    alter table public.poll_votes add column if not exists adults_count integer;
    alter table public.poll_votes add column if not exists children_count integer;
    update public.poll_votes
      set adults_count = coalesce(adults_count, people_count),
          children_count = coalesce(children_count, 0)
      where adults_count is null or children_count is null;
    alter table public.poll_votes alter column adults_count set default 0;
    alter table public.poll_votes alter column children_count set default 0;
    alter table public.poll_votes alter column adults_count set not null;
    alter table public.poll_votes alter column children_count set not null;
    alter table public.poll_votes drop constraint if exists poll_votes_poll_family_option_key;
    alter table public.poll_votes
      add constraint poll_votes_poll_family_option_key unique (poll_id, family_id, option_id);
  end if;

  if to_regclass('public.event_rsvps') is not null then
    alter table public.event_rsvps drop constraint if exists event_rsvps_member_id_fkey;
    alter table public.event_rsvps alter column member_id drop not null;
    alter table public.event_rsvps
      add constraint event_rsvps_member_id_fkey
      foreign key (member_id) references public.members (id) on delete set null;
  end if;
end $$;
