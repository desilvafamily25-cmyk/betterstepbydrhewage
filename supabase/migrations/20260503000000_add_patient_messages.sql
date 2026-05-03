create table if not exists public.patient_messages (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  clinician_id uuid references public.profiles(id) not null,
  subject text not null,
  body text not null,
  priority text default 'normal' check (priority in ('normal', 'important', 'urgent')),
  status text default 'unread' check (status in ('unread', 'read', 'archived')),
  created_at timestamptz default now() not null,
  read_at timestamptz,
  archived_at timestamptz
);

alter table public.patient_messages enable row level security;

drop policy if exists "Clinicians can view patient messages" on public.patient_messages;
drop policy if exists "Patients can view own messages" on public.patient_messages;
drop policy if exists "Clinicians can send patient messages" on public.patient_messages;
drop policy if exists "Clinicians can update patient messages" on public.patient_messages;
drop policy if exists "Patients can update own message status" on public.patient_messages;

create policy "Clinicians can view patient messages"
on public.patient_messages for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'clinician'
  )
);

create policy "Patients can view own messages"
on public.patient_messages for select
using (
  exists (
    select 1 from public.patients
    where patients.id = patient_messages.patient_id
    and patients.profile_id = auth.uid()
  )
);

create policy "Clinicians can send patient messages"
on public.patient_messages for insert
with check (
  clinician_id = auth.uid()
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'clinician'
  )
);

create policy "Clinicians can update patient messages"
on public.patient_messages for update
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'clinician'
  )
);

create policy "Patients can update own message status"
on public.patient_messages for update
using (
  exists (
    select 1 from public.patients
    where patients.id = patient_messages.patient_id
    and patients.profile_id = auth.uid()
  )
);

grant select, insert, update on public.patient_messages to authenticated;
