-- Proyectos, tareas y tareas periodicas.
-- Ejecutar en el SQL Editor de Supabase. No borra datos existentes.

create table if not exists public.projects (
  id text primary key,
  name text not null,
  description text not null default '',
  zone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_tasks (
  id text primary key,
  project_id text not null references public.projects (id) on delete cascade,
  title text not null,
  description text not null default '',
  zone text not null default '',
  status text not null default 'sin_comenzar' check (status in ('sin_comenzar', 'en_curso', 'terminada')),
  assignee_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.recurring_tasks (
  id text primary key,
  title text not null,
  zone text not null default '',
  manual_id text references public.manuals (id) on delete set null,
  kind text not null check (kind in ('weekly', 'every_n_days', 'monthly')),
  interval integer not null default 1 check (interval >= 1),
  weekdays smallint[] not null default '{}',
  month_day smallint check (month_day between 1 and 31),
  start_date date not null,
  end_date date not null,
  allow_done boolean not null default false,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.recurring_completions (
  id text primary key,
  task_id text not null references public.recurring_tasks (id) on delete cascade,
  date date not null,
  member_id text references public.members (id) on delete set null,
  completed_at timestamptz not null default now(),
  unique (task_id, date)
);

create index if not exists project_tasks_project_id_idx on public.project_tasks (project_id);
create index if not exists recurring_tasks_dates_idx on public.recurring_tasks (start_date, end_date);
create index if not exists recurring_completions_task_date_idx on public.recurring_completions (task_id, date);

alter table public.projects disable row level security;
alter table public.project_tasks disable row level security;
alter table public.recurring_tasks disable row level security;
alter table public.recurring_completions disable row level security;
