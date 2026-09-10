-- REVIEW DRAFT: local/synthetic development only.
-- Do not apply to a remote or production project without security review.

create extension if not exists pgcrypto;
create type public.lungcare_role as enum ('patient', 'nurse', 'doctor');
create type public.workflow_status as enum (
  'draft', 'submitted', 'nurse_validated', 'escalated', 'doctor_reviewed',
  'signed', 'patient_notified', 'acknowledged', 'needs_information',
  'cancelled', 'superseded'
);
create type public.triage_priority as enum ('stable', 'review_today', 'urgent');

create table public.organizations (
  id uuid primary key default gen_random_uuid(), name text not null,
  created_at timestamptz not null default now()
);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null, created_at timestamptz not null default now()
);
create table public.organization_memberships (
  organization_id uuid not null references public.organizations(id),
  user_id uuid not null references public.profiles(id),
  role public.lungcare_role not null, active boolean not null default true,
  primary key (organization_id, user_id)
);
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  user_id uuid unique references public.profiles(id),
  synthetic boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.care_team_memberships (
  patient_id uuid not null references public.patients(id),
  clinician_user_id uuid not null references public.profiles(id),
  active boolean not null default true,
  primary key (patient_id, clinician_user_id)
);
create table public.symptom_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  patient_id uuid not null references public.patients(id),
  submitted_by uuid not null references public.profiles(id),
  schema_version text not null, symptom text not null,
  diarrhea_episodes integer not null check (diarrhea_episodes between 0 and 99),
  fever boolean not null, notes text not null default '',
  status public.workflow_status not null default 'draft',
  workflow_version integer not null default 0 check (workflow_version >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.triage_assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  patient_id uuid not null references public.patients(id),
  symptom_report_id uuid not null references public.symptom_reports(id),
  schema_version text not null, priority public.triage_priority not null,
  rule_version text not null, triggers jsonb not null default '[]'::jsonb,
  explanation text not null, clinically_validated boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.nurse_validations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  patient_id uuid not null references public.patients(id),
  symptom_report_id uuid not null references public.symptom_reports(id),
  validated_by uuid not null references public.profiles(id),
  schema_version text not null, escalation_required boolean not null,
  context text not null, created_at timestamptz not null default now()
);
create table public.physician_decisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  patient_id uuid not null references public.patients(id),
  symptom_report_id uuid not null references public.symptom_reports(id),
  reviewed_by uuid not null references public.profiles(id),
  schema_version text not null, outcome text not null, rationale text not null,
  signed_at timestamptz, created_at timestamptz not null default now()
);
create table public.care_plan_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  patient_id uuid not null references public.patients(id),
  physician_decision_id uuid not null references public.physician_decisions(id),
  schema_version text not null, version integer not null check (version > 0),
  summary text not null, signed_by uuid not null references public.profiles(id),
  signed_at timestamptz not null, supersedes_id uuid references public.care_plan_versions(id),
  created_at timestamptz not null default now(), unique (patient_id, version)
);
create table public.workflow_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  patient_id uuid not null references public.patients(id),
  symptom_report_id uuid not null references public.symptom_reports(id),
  actor_id uuid not null references public.profiles(id),
  actor_role public.lungcare_role not null, schema_version text not null,
  from_status public.workflow_status not null, to_status public.workflow_status not null,
  reason text not null, workflow_version integer not null check (workflow_version > 0),
  created_at timestamptz not null default now()
);
create table public.patient_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  patient_id uuid not null references public.patients(id),
  care_plan_version_id uuid not null references public.care_plan_versions(id),
  acknowledged_by uuid not null references public.profiles(id),
  schema_version text not null, created_at timestamptz not null default now(),
  unique (care_plan_version_id, acknowledged_by)
);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.patients enable row level security;
alter table public.care_team_memberships enable row level security;
alter table public.symptom_reports enable row level security;
alter table public.triage_assessments enable row level security;
alter table public.nurse_validations enable row level security;
alter table public.physician_decisions enable row level security;
alter table public.care_plan_versions enable row level security;
alter table public.workflow_events enable row level security;
alter table public.patient_acknowledgements enable row level security;

revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

-- Policies and minimum grants are deliberately deferred to a reviewed migration.
-- Default deny is the safe state for this schema draft.
