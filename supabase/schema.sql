-- Alfocea App — schema + seed inicial para Supabase
-- Ejecutar en el SQL Editor de Supabase (todo el fichero de una vez).

create extension if not exists "pgcrypto";

-- ------------------------------ Tablas ---------------------------------------

create table if not exists public.families (
  id text primary key,
  name text not null,
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  notes text
);

create table if not exists public.members (
  id text primary key,
  family_id text not null references public.families (id) on delete cascade,
  name text not null,
  last_name text,
  role text not null check (role in ('admin', 'adulto', 'joven', 'invitado')),
  phone text,
  email text
);

create table if not exists public.accounts (
  member_id text primary key references public.members (id) on delete cascade,
  username text not null unique,
  email text not null unique,
  password_hash text not null
);

create table if not exists public.reservations (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  family_id text not null references public.families (id) on delete restrict,
  member_id text references public.members (id) on delete set null,
  zone text not null check (zone in ('Zona 1', 'Zona 2')),
  start_date date not null,
  end_date date not null,
  start_time time,
  end_time time,
  guests integer not null check (guests >= 1),
  status text not null check (status in ('confirmada', 'pendiente', 'cancelada')),
  notes text,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.manuals (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  category text not null,
  summary text not null,
  content text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.rules (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  category text not null,
  content text not null,
  priority text not null check (priority in ('alta', 'media', 'baja')),
  pinned boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists members_family_id_idx on public.members (family_id);
create index if not exists reservations_dates_idx on public.reservations (start_date, end_date);
create index if not exists reservations_family_id_idx on public.reservations (family_id);

-- La app usa la service role key en el servidor; RLS queda desactivado
-- porque la autorizacion la hace Next.js (sesion propia + rol admin).
alter table public.families disable row level security;
alter table public.members disable row level security;
alter table public.accounts disable row level security;
alter table public.reservations disable row level security;
alter table public.manuals disable row level security;
alter table public.rules disable row level security;

-- ------------------------------ Seed -----------------------------------------
-- Contraseña inicial de todas las cuentas: alfocea123
-- (marcador $bootstrap$…; al primer login la app lo sustituye por un hash scrypt)

truncate table public.accounts cascade;
truncate table public.reservations cascade;
truncate table public.manuals cascade;
truncate table public.rules cascade;
truncate table public.members cascade;
truncate table public.families cascade;

insert into public.families (id, name, color, notes) values
  ('fam-rendon-fau', 'Familia Rendon Fau', '#2F6B4F', null),
  ('fam-garcia-rubio', 'Familia Garcia Rubio', '#C2703D', null),
  ('fam-valero-garcia', 'Familia Valero Garcia', '#3B6EA5', null),
  ('fam-guallar-garcia', 'Familia Guallar Garcia', '#8A5AA8', null),
  ('fam-garcia-jarabo', 'Familia Garcia Jarabo', '#B23B3B', null),
  ('fam-valero-segura', 'Familia Valero Segura', '#B4801F', null),
  ('fam-fau-garcia', 'Familia Fau Garcia', '#3F8F8A', null),
  ('fam-garcia-jimenez', 'Familia Garcia Jimenez', '#6B7A72', null),
  ('fam-casbas-rubio', 'Familia Casbas Rubio', '#2F6B4F', null),
  ('fam-guallar-ortin', 'Familia Guallar Ortin', '#C2703D', null);

insert into public.members (id, family_id, name, role, email) values
  -- Rendon Fau
  ('mem-miguel-rendon', 'fam-rendon-fau', 'Miguel', 'adulto', 'miguel.rendon@alfocea.es'),
  ('mem-ester', 'fam-rendon-fau', 'Ester', 'adulto', 'ester@alfocea.es'),
  -- Garcia Rubio (Pepe = administrador)
  ('mem-pepe', 'fam-garcia-rubio', 'Pepe', 'admin', 'pepe@alfocea.es'),
  ('mem-pili', 'fam-garcia-rubio', 'Pili', 'adulto', 'pili@alfocea.es'),
  ('mem-rut', 'fam-garcia-rubio', 'Rut', 'adulto', 'rut@alfocea.es'),
  -- Valero Garcia
  ('mem-juan-valero', 'fam-valero-garcia', 'Juan', 'adulto', 'juan.valero@alfocea.es'),
  ('mem-mapi', 'fam-valero-garcia', 'Mapi', 'adulto', 'mapi@alfocea.es'),
  ('mem-dani', 'fam-valero-garcia', 'Dani', 'adulto', 'dani@alfocea.es'),
  ('mem-teresa', 'fam-valero-garcia', 'Teresa', 'adulto', 'teresa@alfocea.es'),
  -- Guallar Garcia
  ('mem-inma', 'fam-guallar-garcia', 'Inma', 'adulto', 'inma@alfocea.es'),
  ('mem-joaquin', 'fam-guallar-garcia', 'Joaquin', 'adulto', 'joaquin@alfocea.es'),
  ('mem-david', 'fam-guallar-garcia', 'David', 'adulto', 'david@alfocea.es'),
  ('mem-sara', 'fam-guallar-garcia', 'Sara', 'adulto', 'sara@alfocea.es'),
  -- Garcia Jarabo
  ('mem-gabriel', 'fam-garcia-jarabo', 'Gabriel', 'adulto', 'gabriel@alfocea.es'),
  ('mem-nerea', 'fam-garcia-jarabo', 'Nerea', 'adulto', 'nerea@alfocea.es'),
  -- Valero Segura
  ('mem-ismael', 'fam-valero-segura', 'Ismael', 'adulto', 'ismael@alfocea.es'),
  ('mem-laura-valero', 'fam-valero-segura', 'Laura', 'adulto', 'laura.valero@alfocea.es'),
  -- Fau Garcia
  ('mem-javi', 'fam-fau-garcia', 'Javi', 'adulto', 'javi@alfocea.es'),
  ('mem-maria', 'fam-fau-garcia', 'Maria', 'adulto', 'maria@alfocea.es'),
  ('mem-rebeca', 'fam-fau-garcia', 'Rebeca', 'adulto', 'rebeca@alfocea.es'),
  ('mem-monica', 'fam-fau-garcia', 'Monica', 'adulto', 'monica@alfocea.es'),
  ('mem-miguel-fau', 'fam-fau-garcia', 'Miguel', 'adulto', 'miguel.fau@alfocea.es'),
  ('mem-juan-fau', 'fam-fau-garcia', 'Juan', 'adulto', 'juan.fau@alfocea.es'),
  -- Garcia Jimenez
  ('mem-yaya', 'fam-garcia-jimenez', 'Yaya', 'adulto', 'yaya@alfocea.es'),
  ('mem-yayo', 'fam-garcia-jimenez', 'Yayo', 'adulto', 'yayo@alfocea.es'),
  -- Casbas Rubio
  ('mem-carlos', 'fam-casbas-rubio', 'Carlos', 'adulto', 'carlos@alfocea.es'),
  ('mem-isabel', 'fam-casbas-rubio', 'Isabel', 'adulto', 'isabel@alfocea.es'),
  ('mem-luis', 'fam-casbas-rubio', 'Luis', 'adulto', 'luis@alfocea.es'),
  -- Guallar Ortin
  ('mem-pablo', 'fam-guallar-ortin', 'Pablo', 'adulto', 'pablo@alfocea.es'),
  ('mem-laura-guallar', 'fam-guallar-ortin', 'Laura', 'adulto', 'laura.guallar@alfocea.es');

insert into public.accounts (member_id, username, email, password_hash) values
  ('mem-miguel-rendon', 'miguel.rendon', 'miguel.rendon@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-ester', 'ester', 'ester@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-pepe', 'pepe', 'pepe@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-pili', 'pili', 'pili@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-rut', 'rut', 'rut@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-juan-valero', 'juan.valero', 'juan.valero@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-mapi', 'mapi', 'mapi@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-dani', 'dani', 'dani@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-teresa', 'teresa', 'teresa@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-inma', 'inma', 'inma@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-joaquin', 'joaquin', 'joaquin@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-david', 'david', 'david@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-sara', 'sara', 'sara@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-gabriel', 'gabriel', 'gabriel@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-nerea', 'nerea', 'nerea@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-ismael', 'ismael', 'ismael@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-laura-valero', 'laura.valero', 'laura.valero@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-javi', 'javi', 'javi@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-maria', 'maria', 'maria@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-rebeca', 'rebeca', 'rebeca@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-monica', 'monica', 'monica@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-miguel-fau', 'miguel.fau', 'miguel.fau@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-juan-fau', 'juan.fau', 'juan.fau@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-yaya', 'yaya', 'yaya@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-yayo', 'yayo', 'yayo@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-carlos', 'carlos', 'carlos@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-isabel', 'isabel', 'isabel@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-luis', 'luis', 'luis@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-pablo', 'pablo', 'pablo@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-laura-guallar', 'laura.guallar', 'laura.guallar@alfocea.es', '$bootstrap$alfocea123');
