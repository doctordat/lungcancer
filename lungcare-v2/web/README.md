# LungCare V3 Web Foundation

This directory contains the new typed foundation for LungCare V3. It is intentionally separate from the static baseline in `../mobile/`.

Current scope: Next.js App Router, versioned Zod schemas, pure demo triage rules, guarded workflow transitions, Vitest tests, Playwright configuration, and minimal role route shells.

Authentication, persistence, realtime queues, physician sign-off transactions, and real clinical data are not connected.

## Local commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The production build uses Next.js' supported Webpack mode because Turbopack's CSS worker cannot bind its internal loopback port in the current managed workspace.

Copy `.env.example` to a local ignored file only when local Supabase work begins. Never use real patient data in this development foundation.
