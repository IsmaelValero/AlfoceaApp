-- Eventos, encuesta del mes, asistencia y comida.
-- Ejecutar en el SQL Editor de Supabase. No borra datos.

create table if not exists public.polls (
  id text primary key,
  month text not null unique,
  status text not null check (status in ('abierta', 'cerrada')),
  event_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_options (
  id text primary key,
  poll_id text not null references public.polls (id) on delete cascade,
  label text not null,
  start_date date not null,
  end_date date not null,
  sort_order integer not null,
  check (end_date >= start_date)
);

create table if not exists public.poll_votes (
  id text primary key,
  poll_id text not null references public.polls (id) on delete cascade,
  option_id text not null references public.poll_options (id) on delete cascade,
  family_id text not null references public.families (id) on delete cascade,
  member_id text references public.members (id) on delete set null,
  people_count integer not null check (people_count >= 1),
  created_at timestamptz not null default now(),
  unique (poll_id, family_id)
);

create table if not exists public.events (
  id text primary key,
  title text not null,
  kind text not null check (kind in ('cumpleanos_mes', 'navidad', 'ano_nuevo', 'celebracion')),
  start_date date not null,
  end_date date not null,
  place text,
  notes text,
  month text,
  poll_id text,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.event_rsvps (
  id text primary key,
  event_id text not null references public.events (id) on delete cascade,
  family_id text not null references public.families (id) on delete cascade,
  member_id text references public.members (id) on delete set null,
  status text not null check (status in ('voy', 'no_voy', 'duda')),
  people_count integer not null check (people_count >= 0),
  created_at timestamptz not null default now(),
  unique (event_id, family_id)
);

create table if not exists public.event_items (
  id text primary key,
  event_id text not null references public.events (id) on delete cascade,
  name text not null,
  quantity text not null,
  member_id text references public.members (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists poll_options_poll_idx on public.poll_options (poll_id, sort_order);
create index if not exists events_dates_idx on public.events (start_date, end_date);

alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.event_items enable row level security;
