create table if not exists push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references patients(id) on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now(),
  unique (patient_id, endpoint)
);

alter table push_subscriptions enable row level security;

-- Patients can only manage their own subscriptions
create policy "patient_manage_own_push_subscriptions"
  on push_subscriptions for all
  using  (patient_id = auth.uid())
  with check (patient_id = auth.uid());

-- Service role (edge function) can read all subscriptions
create policy "service_role_read_push_subscriptions"
  on push_subscriptions for select
  using (auth.role() = 'service_role');

create policy "service_role_delete_push_subscriptions"
  on push_subscriptions for delete
  using (auth.role() = 'service_role');
