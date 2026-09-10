# Database policy tests

The initial schema migration is default-deny: it enables RLS and revokes table access from `anon` and `authenticated`. Before any application connection is enabled, add policy tests covering unauthenticated denial, patient self-access, active care-team access, doctor-only sign-off, immutable audit/care-plan rows, and private realtime subscriptions.

No remote Supabase project has been created or connected.
