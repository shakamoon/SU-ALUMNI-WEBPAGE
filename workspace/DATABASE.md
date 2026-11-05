<instructions>
This file tracks your database decisions, conventions, and preferences.
It does NOT store the current schema — entity definitions are injected per-request automatically.
Instead, use this file to remember:
  1. Data storage preferences (e.g., "store image references as storage paths, not full URLs")
  2. Schema conventions (e.g., "always use soft deletes", "snake_case column names", "every table gets createdAt/updatedAt")
  3. Anti-patterns to avoid (e.g., "don't store computed values", "no direct user-to-user foreign keys")
  4. Data flow decisions (e.g., "auth state comes from session, not DB lookup per request")
  5. Indexing and query patterns worth remembering

When the user makes a database-related decision, proactively capture the *why* here so you don't forget it.
Keep entries sorted in DESC order (newest first) so recent decisions stay in prompt context if the file is truncated.
</instructions>

<database>
# Database Decisions & Conventions
- 2026-11-05: Retention observability is surfaced in admin UI from `EventAudit` lifecycle fields plus in-memory run telemetry (`processedCount`, `failedCount`, `lastBatchKey`, `lastRunAt`) for export/archive/purge governance checks.
- 2026-11-05: EventAudit post-archive purge is policy-driven: records are purge-eligible only when `archivedAt` is set and `retentionUntil` has elapsed; purge runs delete rows in capped batches (50) to keep audit queries fast.
- 2026-11-05: EventAudit archival operations are batch-oriented with capped run sizes (50 export / 50 archive per run); each processed record is stamped with `archiveBatchKey` and phase timestamps (`exportedAt`, `archivedAt`) for operational traceability.
- 2026-11-05: Export batches mark eligible rows with `exportedAt` and keep lifecycle status current; archive batches mark `archivedAt` and guarantee `exportedAt` exists before final archive status.
- 2026-11-05: EventAudit now stores archival lifecycle metadata at write time (`retentionTier`, `retentionPolicyVersion`, `retentionDays`, `retentionUntil`, `exportEligibleAt`, `archiveEligibleAt`, `archiveStatus`) so eligibility scans avoid repeated reclassification.
- 2026-11-05: Eligibility is deterministic from policy constants: export readiness uses 7-day cadence, archive readiness uses 30-day cadence, and helper logic backfills derived values for historical rows with missing metadata.
- 2026-11-05: EventAudit retention policy is centralized in UI constants (version `2026-11-05.v1`) with tier windows: `critical-mutation` 730 days, `routine-edit` 365 days, `low-risk-noise` 90 days; cadence targets are weekly exports and 30-day archival batches.
- 2026-11-05: Event audit review/export is UI-driven from `EventAudit` with client-side action/date/user filters and CSV output of canonical audit fields; no denormalized export entity is persisted.
- 2026-11-05: RBAC currently resolves in frontend auth context (`editor` vs `elevated`) using user email/userId allowlists and approved domains; elevated role is required for destructive mutations (delete/revert), while editors retain create/update rights.
- 2026-11-05: Added `EventAudit` as an immutable history log for event moderation; each event create/update/delete/revert stores actor identity, timestamp, changed fields, and JSON snapshots (`beforeSnapshot`/`afterSnapshot`) to support transparent review and UI-based rollback.
- 2026-11-05: Audit entries use `source = "admin-ui"` to distinguish in-app content changes from external or future integration channels.
</database>
