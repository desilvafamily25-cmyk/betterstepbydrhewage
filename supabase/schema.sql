-- ============================================================
-- Betterstep by Dr. Hewage — Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── Profiles ────────────────────────────────────────────────
-- Linked 1:1 to auth.users; stores role
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  role         text not null check (role in ('patient', 'clinician')),
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'patient')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Patients ─────────────────────────────────────────────────
create table if not exists public.patients (
  id                              uuid primary key default gen_random_uuid(),
  user_id                         uuid not null references public.profiles(id) on delete cascade,
  name                            text not null,
  date_of_birth                   date,
  height_cm                       numeric(5,1),
  starting_weight_kg              numeric(5,1),
  current_weight_kg               numeric(5,1),
  goal_weight_kg                  numeric(5,1),
  waist_cm                        numeric(5,1),
  mobile                          text,
  email                           text not null,
  clinic_name                     text,
  review_interval_weeks           integer default 4,
  next_review_date                date,
  next_prescription_review_date   date,
  next_medication_dose_date       date,
  safety_answers                  jsonb default '{}'::jsonb,
  created_at                      timestamptz default now() not null,
  updated_at                      timestamptz default now() not null
);

create trigger set_patients_updated_at before update on public.patients
  for each row execute procedure public.set_updated_at();

-- ── Check-ins ────────────────────────────────────────────────
create table if not exists public.check_ins (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references public.patients(id) on delete cascade,
  date            date not null default current_date,
  weight_kg       numeric(5,1) not null,
  waist_cm        numeric(5,1),
  appetite_score  integer check (appetite_score between 1 and 10),
  energy_score    integer check (energy_score between 1 and 10),
  mood_score      integer check (mood_score between 1 and 10),
  sleep_score     integer check (sleep_score between 1 and 10),
  exercise_level  text default 'none',
  alcohol_intake  text default 'none',
  protein_focus   boolean default false,
  water_focus     boolean default false,
  side_effects    text[] default array['none'],
  notes           text,
  red_flag        boolean default false,
  created_at      timestamptz default now() not null
);

-- ── Medications ──────────────────────────────────────────────
create table if not exists public.medications (
  id                          uuid primary key default gen_random_uuid(),
  patient_id                  uuid not null references public.patients(id) on delete cascade,
  name                        text not null,
  dose                        text,
  start_date                  date,
  frequency                   text,
  medication_day              text,
  next_dose_date              date,
  prescription_review_date    date,
  gp_review_date              date,
  tolerance_notes             text,
  estimated_days_remaining    integer,
  created_at                  timestamptz default now() not null,
  updated_at                  timestamptz default now() not null
);

create trigger set_medications_updated_at before update on public.medications
  for each row execute procedure public.set_updated_at();

-- ── Reminders ────────────────────────────────────────────────
create table if not exists public.reminders (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references public.patients(id) on delete cascade,
  type        text not null,
  due_date    date not null,
  status      text default 'pending' check (status in ('pending', 'acknowledged', 'dismissed')),
  message     text not null,
  created_at  timestamptz default now() not null
);

-- ── Clinician Notes ──────────────────────────────────────────
create table if not exists public.clinician_notes (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references public.patients(id) on delete cascade,
  clinician_id    uuid not null references public.profiles(id),
  date            date not null default current_date,
  note            text not null,
  plan            text,
  follow_up_weeks integer,
  created_at      timestamptz default now() not null
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles        enable row level security;
alter table public.patients        enable row level security;
alter table public.check_ins       enable row level security;
alter table public.medications     enable row level security;
alter table public.reminders       enable row level security;
alter table public.clinician_notes enable row level security;

-- profiles: users see their own row; clinicians see all
create policy "Own profile" on public.profiles
  for all using (auth.uid() = id);

-- patients: patient sees their own record; clinicians see all
create policy "Patient owns record" on public.patients
  for all using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'clinician'
    )
  );

-- check_ins: patient sees own; clinicians see all
create policy "Patient check-in access" on public.check_ins
  for all using (
    exists (
      select 1 from public.patients p
      where p.id = patient_id
        and (p.user_id = auth.uid()
          or exists (select 1 from public.profiles where id = auth.uid() and role = 'clinician'))
    )
  );

-- medications: same pattern
create policy "Patient medication access" on public.medications
  for all using (
    exists (
      select 1 from public.patients p
      where p.id = patient_id
        and (p.user_id = auth.uid()
          or exists (select 1 from public.profiles where id = auth.uid() and role = 'clinician'))
    )
  );

-- reminders: same pattern
create policy "Patient reminder access" on public.reminders
  for all using (
    exists (
      select 1 from public.patients p
      where p.id = patient_id
        and (p.user_id = auth.uid()
          or exists (select 1 from public.profiles where id = auth.uid() and role = 'clinician'))
    )
  );

-- clinician_notes: clinicians read/write all; patients read their own
create policy "Clinician note access" on public.clinician_notes
  for all using (
    clinician_id = auth.uid()
    or exists (
      select 1 from public.patients p
      where p.id = patient_id and p.user_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles where id = auth.uid() and role = 'clinician'
    )
  );
