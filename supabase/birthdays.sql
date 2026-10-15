-- Cumpleaños y familiares sin cuenta.
-- Ejecutar este fichero en el SQL Editor de Supabase.
-- No crea cuentas nuevas y no borra las que ya existen.

alter table public.members
  add column if not exists birth_day smallint,
  add column if not exists birth_month smallint,
  add column if not exists birth_year smallint;

alter table public.members drop constraint if exists members_birthday_check;
alter table public.members drop constraint if exists members_birth_year_check;

alter table public.members
  add constraint members_birthday_check check (
    (birth_day is null and birth_month is null)
    or (birth_day between 1 and 31 and birth_month between 1 and 12)
  );

alter table public.members
  add constraint members_birth_year_check check (
    birth_year is null or birth_year between 1900 and 2100
  );

insert into public.families (id, name, color)
values ('fam-fau-larriba', 'Familia Fau Larriba', '#7D5A45')
on conflict (id) do nothing;

-- Quien ya estaba: solo nombre y cumpleaños. El rol y la cuenta no se tocan.
update public.members as member
set
  name = data.name,
  birth_day = data.birth_day,
  birth_month = data.birth_month,
  birth_year = data.birth_year
from (
  values
    ('mem-javi', 'Javi', 14, 8, 1970),
    ('mem-maria', 'María', 23, 3, 1974),
    ('mem-rebeca', 'Rebeca', 14, 12, 2000),
    ('mem-monica', 'Mónica', 12, 9, 2004),
    ('mem-miguel-fau', 'Miguel', 11, 6, 2006),
    ('mem-juan-fau', 'Juan', 19, 12, 2007),
    ('mem-juan-valero', 'Juan', 14, 3, 1967),
    ('mem-mapi', 'Mapi', 3, 1, 1969),
    ('mem-dani', 'Dani', 30, 10, 2005),
    ('mem-teresa', 'Teresa', 2, 11, 2007),
    ('mem-miguel-rendon', 'Miguel', 31, 8, 1998),
    ('mem-ester', 'Ester', 9, 10, 1998),
    ('mem-pablo', 'Pablo', 10, 6, 1995),
    ('mem-laura-guallar', 'Laura', 8, 11, 2001),
    ('mem-inma', 'Inma', 24, 4, 1966),
    ('mem-joaquin', 'Joaquín', 28, 7, 1977),
    ('mem-david', 'David', 19, 11, 1996),
    ('mem-sara', 'Sara', 17, 2, 1999),
    ('mem-ismael', 'Ismael', 13, 10, 2000),
    ('mem-laura-valero', 'Laura', 3, 1, 1999),
    ('mem-gabriel', 'Gabriel', 29, 9, 1995)
) as data(id, name, birth_day, birth_month, birth_year)
where member.id = data.id;

-- Familiares nuevos, sin cuenta.
insert into public.members (id, family_id, name, role, birth_day, birth_month, birth_year)
values
  ('mem-ana-fau', 'fam-fau-garcia', 'Ana', 'joven', 29, 12, 2009),
  ('mem-david-fau', 'fam-fau-garcia', 'David', 'joven', 1, 9, 2012),
  ('mem-nacho-fau', 'fam-fau-garcia', 'Nacho', 'joven', 10, 12, 2014),
  ('mem-maria-fau-nina', 'fam-fau-garcia', 'María', 'joven', 9, 6, 2017),
  ('mem-marta-valero', 'fam-valero-garcia', 'Marta', 'joven', 8, 2, 2010),
  ('mem-sara-rendon', 'fam-rendon-fau', 'Sara', 'joven', 6, 9, 2023),
  ('mem-rebeca-rendon', 'fam-rendon-fau', 'Rebeca', 'joven', 4, 12, 2024),
  ('mem-sofia-rendon', 'fam-rendon-fau', 'Sofía', 'joven', 14, 10, 2026),
  ('mem-javi-valero', 'fam-valero-segura', 'Javi', 'joven', 18, 1, 2024),
  ('mem-jose-valero', 'fam-valero-segura', 'José', 'joven', 12, 2, 2026),
  ('mem-jose-larriba', 'fam-fau-larriba', 'José', 'adulto', 26, 2, 2003),
  ('mem-maria-larriba', 'fam-fau-larriba', 'María', 'adulto', 29, 11, 2003)
on conflict (id) do update set
  name = excluded.name,
  family_id = excluded.family_id,
  role = excluded.role,
  birth_day = excluded.birth_day,
  birth_month = excluded.birth_month,
  birth_year = excluded.birth_year;

-- Sin fecha todavía. Si más adelante se rellena, este insert no la borra.
insert into public.members (id, family_id, name, role)
values
  ('mem-miriam', 'fam-garcia-rubio', 'Miriam', 'adulto'),
  ('mem-sira', 'fam-garcia-jarabo', 'Sira', 'joven')
on conflict (id) do nothing;
