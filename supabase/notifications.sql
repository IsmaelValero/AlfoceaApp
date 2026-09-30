-- Estado de notificaciones (leidas / quitadas) y marca de resolucion de reservas.
-- Ejecutar en el SQL Editor de Supabase.

alter table public.reservations
  add column if not exists resolved_at timestamptz;

alter table public.accounts
  add column if not exists notification_last_read_at timestamptz;

alter table public.accounts
  add column if not exists dismissed_notification_ids jsonb not null default '[]'::jsonb;
