-- Familias nuevas, cumpleaños García Rubio y cuentas de mayores de 18.
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
-- Referencia de edad: 16 de octubre de 2026. Menores de 18 → rol joven, sin cuenta.

-- ------------------------------ Familias nuevas ------------------------------
insert into public.families (id, name, color, notes) values
  ('fam-marin-valero', 'Familia Marin Valero', '#4A7C6F', null),
  ('fam-garcia-evans', 'Familia Garcia Evans', '#8B5E3C', null)
on conflict (id) do update set name = excluded.name;

-- -------------------- Cumpleaños Familia Garcia Rubio ------------------------
update public.members as member
set
  name = data.name,
  birth_day = data.birth_day,
  birth_month = data.birth_month,
  birth_year = data.birth_year,
  role = case when member.role = 'admin' then member.role else data.role end
from (
  values
    ('mem-pepe', 'Pepe', 31, 5, 1967, 'adulto'),
    ('mem-pili', 'Pili', 10, 9, 1966, 'adulto'),
    ('mem-rut', 'Rut', 3, 8, 2004, 'adulto'),
    ('mem-miriam', 'Miriam', 13, 1, 2010, 'joven')
) as data(id, name, birth_day, birth_month, birth_year, role)
where member.id = data.id;

-- Nuevos en Garcia Rubio (Pedro y Raquel: 18+)
insert into public.members (id, family_id, name, role, email, birth_day, birth_month, birth_year)
values
  ('mem-pedro-garcia', 'fam-garcia-rubio', 'Pedro', 'adulto', 'pedro.garcia@alfocea.es', 25, 11, 1998),
  ('mem-raquel-garcia', 'fam-garcia-rubio', 'Raquel', 'adulto', 'raquel@alfocea.es', 29, 10, 1991)
on conflict (id) do update set
  name = excluded.name,
  family_id = excluded.family_id,
  role = excluded.role,
  email = excluded.email,
  birth_day = excluded.birth_day,
  birth_month = excluded.birth_month,
  birth_year = excluded.birth_year;

-- Miriam ya existía: forzar rol joven y cumpleaños
update public.members
set role = 'joven', birth_day = 13, birth_month = 1, birth_year = 2010, name = 'Miriam'
where id = 'mem-miriam';

-- ------------------------- Familia Marin Valero ------------------------------
insert into public.members (id, family_id, name, role, email, birth_day, birth_month, birth_year)
values
  ('mem-eli-marin', 'fam-marin-valero', 'Eli', 'adulto', 'eli@alfocea.es', 24, 4, 1996),
  ('mem-maria-marin', 'fam-marin-valero', 'María', 'adulto', 'maria.marin@alfocea.es', 13, 9, 1997),
  ('mem-juan-marin', 'fam-marin-valero', 'Juan', 'joven', null, 2, 11, 2023),
  ('mem-pedro-marin', 'fam-marin-valero', 'Pedro', 'joven', null, 17, 6, 2026)
on conflict (id) do update set
  name = excluded.name,
  family_id = excluded.family_id,
  role = excluded.role,
  email = excluded.email,
  birth_day = excluded.birth_day,
  birth_month = excluded.birth_month,
  birth_year = excluded.birth_year;

-- ------------------------- Familia Garcia Evans ------------------------------
insert into public.members (id, family_id, name, role, email, birth_day, birth_month, birth_year)
values
  ('mem-josue-evans', 'fam-garcia-evans', 'Josue', 'adulto', 'josue@alfocea.es', 11, 7, 1993),
  ('mem-frankie-evans', 'fam-garcia-evans', 'Frankie', 'adulto', 'frankie@alfocea.es', 5, 10, 1989)
on conflict (id) do update set
  name = excluded.name,
  family_id = excluded.family_id,
  role = excluded.role,
  email = excluded.email,
  birth_day = excluded.birth_day,
  birth_month = excluded.birth_month,
  birth_year = excluded.birth_year;

-- -------------------- Cuentas (solo 18+; no pisa contraseñas) ----------------
insert into public.accounts (member_id, username, email, password_hash) values
  ('mem-pedro-garcia', 'pedro.garcia', 'pedro.garcia@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-raquel-garcia', 'raquel', 'raquel@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-eli-marin', 'eli', 'eli@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-maria-marin', 'maria.marin', 'maria.marin@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-josue-evans', 'josue', 'josue@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-frankie-evans', 'frankie', 'frankie@alfocea.es', '$bootstrap$alfocea123'),
  -- Fau Larriba (mayores de 18 que aun no tenian cuenta)
  ('mem-jose-larriba', 'jose.larriba', 'jose.larriba@alfocea.es', '$bootstrap$alfocea123'),
  ('mem-maria-larriba', 'maria.larriba', 'maria.larriba@alfocea.es', '$bootstrap$alfocea123')
on conflict (member_id) do nothing;

update public.members
set email = coalesce(email, 'jose.larriba@alfocea.es')
where id = 'mem-jose-larriba';

update public.members
set email = coalesce(email, 'maria.larriba@alfocea.es')
where id = 'mem-maria-larriba';
