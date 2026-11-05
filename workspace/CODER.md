<instructions>
This file will be automatically added to your context. 
It serves multiple purposes:
  1. Storing frequently used tools so you can use them without searching each time
  2. Recording the user's code style preferences (naming conventions, preferred libraries, etc.)
  3. Maintaining useful information about the codebase structure and organization
  4. Remembering tricky quirks from this codebase

When you spend time searching for certain configuration files, tricky code coupled dependencies, or other codebase information, add that to this CODER.md file so you can remember it for next time.
Keep entries sorted in DESC order (newest first) so recent knowledge stays in prompt context if the file is truncated.
</instructions>

<coder>
## 2026-11-05
- Hardened `resolveAuditLifecycleMetadata` comparisons in `src/pages/AdminPage.tsx` by retyping eligibility expressions and removing trailing argument commas in `Boolean(...)` calls to eliminate parser ambiguity from escaped-operator regressions.
- Fixed build-breaking syntax in `src/pages/AdminPage.tsx` by replacing HTML-escaped comparison operators (`&lt;=`) with valid TypeScript operators (`<=`) in retention lifecycle eligibility checks.
- Searched for the same escaped-operator pattern in `src/**/*.tsx` and patched all clear matches in one pass (2 hits, both in `AdminPage.tsx`).
- Completed retention plan step 5 in `src/pages/AdminPage.tsx` by adding retention-ops observability cards for export/archive/purge with last run, processed/failed counts, next scheduled cadence, and latest batch key.
- Upgraded `handleRunAuditBatch` in `src/pages/AdminPage.tsx` to track per-run telemetry (`lastRunAt`, `processedCount`, `failedCount`, `lastError`) and continue batch execution on per-record failures.
- Completed retention plan step 4 in `src/pages/AdminPage.tsx` by enforcing post-archive purge lifecycle: records become purge-eligible when `archivedAt` exists and `retentionUntil` has passed, then purge batches delete those rows.
- Added purge batch controls/counts in EventAudit admin UI and elevated-role guardrails for destructive purge operations.
- Extended EventAudit CSV export with `isPurgeEligible` and surfaced `retentionUntil` in row-level lifecycle display for compliance checks.
- Completed retention plan step 3 in `src/pages/AdminPage.tsx` by adding cadence-driven `EventAudit` export/archive batch handlers that stamp `exportedAt`, `archivedAt`, `archiveBatchKey`, and lifecycle `archiveStatus`.
- Added batch policy constants (`exportBatchSize`, `archiveBatchSize`) plus deterministic batch key generation for traceable archival runs.
- Extended EventAudit panel controls with run-export/run-archive actions and eligibility counters; CSV now includes `exportedAt`, `archivedAt`, and `archiveBatchKey`.
- Completed retention plan step 2 in `src/pages/AdminPage.tsx` by adding `EventAudit` lifecycle metadata derivation (`retentionTier`, `retentionPolicyVersion`, `retentionUntil`, `exportEligibleAt`, `archiveEligibleAt`, `archiveStatus`) and writing those fields on new audit records.
- Added centralized eligibility helper (`resolveAuditLifecycleMetadata`) to compute export/archive readiness and fallback-derive metadata for legacy rows missing new columns.
- Extended audit UI + CSV export in `src/pages/AdminPage.tsx` to surface lifecycle status and eligibility dates for faster archival triage.
- Added step-1 retention policy constants in `src/pages/AdminPage.tsx` with versioned EventAudit tier classification (`critical-mutation`, `routine-edit`, `low-risk-noise`) and explicit retention windows (730/365/90 days) plus archival/export cadence constants.
- Event audit CSV export now includes retention metadata (`retentionTier`, `policyVersion`, `retentionUntil`, `retentionDays`) derived from centralized policy helpers.
- Added EventAudit review tooling in `src/pages/AdminPage.tsx`: filter controls for action/date/user and CSV export of filtered entries for faster chapter leadership review workflows.
- Added role-based admin controls in `src/pages/AdminPage.tsx`: authenticated users default to `editor`, while elevated users (allowlist/domain based) can execute delete and revert actions; editors can still create and update.
- Elevated role checks now gate handlers and button states for delete/revert across Event, Stat, ImpactFeature, and EventAudit sections.
- Fixed build-breaking duplicate `handleEventCreate` declaration in `src/pages/AdminPage.tsx` that caused parser failure at EOF (`Unexpected token (1663:0)`).
- Added immutable `EventAudit` trail integration in `src/pages/AdminPage.tsx` with per-field change detection, actor/time metadata, JSON before/after snapshots, and in-UI revert actions for create/update/delete event operations.
- Added reusable event validation pipeline in `src/pages/AdminPage.tsx` (`validateEventForm`) to guard date, category, and registrationLink before `createEvent`/`updateEvent`, with friendly status messages shown in the admin events UI.
- Protected PHP backend management links in `src/sections/ImpactSection/components/ImpactContent.tsx` and `src/sections/StatsGrid/index.tsx` by gating link rendering behind `useAuth()` (`Boolean(user)` and auth-ready check).
- Admin CRUD remains hard-protected with `useAuth({ requireAuth: true })` in `src/pages/AdminPage.tsx`; frontend edit-link visibility now matches auth state.
- Added missing `src/pages/AdminPage.tsx` to satisfy `src/App.tsx` route import and resolve module-not-found build failure.
- Admin page includes in-app authenticated CRUD for `Event`, `Stat`, and `ImpactFeature` via `useAuth({ requireAuth: true })`, `useQuery`, and `useMutation`.
- Data/auth now uses `@animaapp/playground-react-sdk`; app root is wrapped with `AnimaProvider` in `src/index.tsx`.
- Dynamic entities wired: `Event`, `Stat`, and `ImpactFeature` via `useQuery` in `EventsPage`, `EventsGrid`, `StatsGrid`, and `ImpactContent`.
- PHP backend management links are centralized in `src/config/backend.ts` as `PHP_BACKEND_LINKS`.
- Existing UI structure remains; components use DB data first with safe fallback content if DB is empty.
</coder>
