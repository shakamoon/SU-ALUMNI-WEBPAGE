import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, useMutation, useQuery } from "@animaapp/playground-react-sdk";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { usePageMeta } from "@/hooks/usePageMeta";

type EntityName = "Event" | "Stat" | "ImpactFeature";
type AdminRole = "elevated" | "editor";
type AuditActionFilter = "all" | "create" | "update" | "delete" | "revert";
type AuditRetentionTier =
  | "critical-mutation"
  | "routine-edit"
  | "low-risk-noise";
type AuditArchiveStatus =
  | "pending"
  | "export-eligible"
  | "archive-eligible"
  | "purge-eligible"
  | "archived";
type AuditBatchKind = "export" | "archive" | "purge";

type AuditBatchTelemetryState = {
  lastRunAt: Date | null;
  processedCount: number;
  failedCount: number;
  lastBatchKey: string | null;
  lastError: string | null;
};

type EventFormState = {
  title: string;
  description: string;
  date: string;
  endDate: string;
  month: string;
  day: string;
  category: string;
  location: string;
  registrationLink: string;
  conferenceLinkText: string;
  conferenceDate: string;
};

type StatFormState = {
  statValue: string;
  statLabel: string;
  imageSrc: string;
};

type ImpactFeatureFormState = {
  title: string;
  description: string;
  imageSrc: string;
};

const EVENT_DEFAULT_FORM: EventFormState = {
  title: "",
  description: "",
  date: "",
  endDate: "",
  month: "",
  day: "",
  category: "",
  location: "",
  registrationLink: "",
  conferenceLinkText: "",
  conferenceDate: "",
};

const STAT_DEFAULT_FORM: StatFormState = {
  statValue: "",
  statLabel: "",
  imageSrc: "",
};

const IMPACT_DEFAULT_FORM: ImpactFeatureFormState = {
  title: "",
  description: "",
  imageSrc: "",
};

const toDateInputValue = (value?: Date | string) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const toDateOrUndefined = (value: string) => {
  if (!value.trim()) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const safeTrimOrUndefined = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const ALLOWED_EVENT_CATEGORIES = [
  "Social",
  "Conference",
  "Community",
  "Anniversary",
] as const;

type EventMutationPayload = {
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  month: string;
  day: string;
  category: string;
  location: string;
  registrationLink?: string;
  conferenceLinkText?: string;
  conferenceDate?: string;
};

type AuditableEventShape = {
  title?: string;
  description?: string;
  date?: Date | string;
  endDate?: Date | string;
  month?: string;
  day?: string;
  category?: string;
  location?: string;
  registrationLink?: string;
  conferenceLinkText?: string;
  conferenceDate?: string;
};

const EVENT_AUDIT_SOURCE = "admin-ui";

const ELEVATED_ADMIN_EMAIL_ALLOWLIST = ["suafdallas@yahoo.com"];
const ELEVATED_ADMIN_USER_ID_ALLOWLIST: string[] = [];
const ELEVATED_ADMIN_EMAIL_DOMAINS = ["suafdfw.org"];

const EVENT_AUDIT_FIELDS: Array<keyof EventFormState> = [
  "title",
  "description",
  "date",
  "endDate",
  "month",
  "day",
  "category",
  "location",
  "registrationLink",
  "conferenceLinkText",
  "conferenceDate",
];

const AUDIT_FILTER_DEFAULTS = {
  action: "all" as AuditActionFilter,
  actorQuery: "",
  fromDate: "",
  toDate: "",
};

const AUDIT_ACTION_OPTIONS: AuditActionFilter[] = [
  "all",
  "create",
  "update",
  "delete",
  "revert",
];

const EVENT_AUDIT_RETENTION_POLICY = {
  version: "2026-11-05.v1",
  archivalCadenceDays: 30,
  exportCadenceDays: 7,
  lowRiskFields: ["registrationLink", "conferenceLinkText", "conferenceDate"],
  tiers: {
    "critical-mutation": {
      label: "Critical Mutations",
      retentionDays: 730,
      description:
        "Destructive or rollback operations that require long-lived traceability.",
    },
    "routine-edit": {
      label: "Routine Edits",
      retentionDays: 365,
      description:
        "Standard create/update operations needed for yearly governance reviews.",
    },
    "low-risk-noise": {
      label: "Low-Risk Noise",
      retentionDays: 90,
      description:
        "Minor operational edits that can be archived quickly to keep review UX fast.",
    },
  } as Record<
    AuditRetentionTier,
    { label: string; retentionDays: number; description: string }
  >,
};

const AUDIT_ARCHIVE_STATUS = {
  pending: "pending",
  exportEligible: "export-eligible",
  archiveEligible: "archive-eligible",
  purgeEligible: "purge-eligible",
  archived: "archived",
} as const;

const AUDIT_BATCH_POLICY = {
  exportBatchSize: 50,
  archiveBatchSize: 50,
  purgeBatchSize: 50,
};

const AUDIT_BATCH_LABELS: Record<AuditBatchKind, string> = {
  export: "Export",
  archive: "Archive",
  purge: "Purge",
};

const AUDIT_BATCH_CADENCE_DAYS: Record<AuditBatchKind, number> = {
  export: EVENT_AUDIT_RETENTION_POLICY.exportCadenceDays,
  archive: EVENT_AUDIT_RETENTION_POLICY.archivalCadenceDays,
  purge: EVENT_AUDIT_RETENTION_POLICY.archivalCadenceDays,
};

const createInitialAuditBatchTelemetry = (): Record<
  AuditBatchKind,
  AuditBatchTelemetryState
> => ({
  export: {
    lastRunAt: null,
    processedCount: 0,
    failedCount: 0,
    lastBatchKey: null,
    lastError: null,
  },
  archive: {
    lastRunAt: null,
    processedCount: 0,
    failedCount: 0,
    lastBatchKey: null,
    lastError: null,
  },
  purge: {
    lastRunAt: null,
    processedCount: 0,
    failedCount: 0,
    lastBatchKey: null,
    lastError: null,
  },
});

const createAuditBatchKey = (kind: AuditBatchKind, now = new Date()) =>
  `${kind}-${now.toISOString().replace(/[:.]/g, "-")}`;

const toCsvCell = (value: unknown) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

const toIsoDateTime = (value?: Date | string) => {
  if (!value) return "";
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
};

const parseChangedFields = (value?: string | null) =>
  (value ?? "")
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean);

const classifyEventAuditTier = (audit: {
  action?: string;
  changedFields?: string | null;
}): AuditRetentionTier => {
  if (audit.action === "delete" || audit.action === "revert") {
    return "critical-mutation";
  }

  if (audit.action === "create") {
    return "routine-edit";
  }

  if (audit.action === "update") {
    const changedFields = parseChangedFields(audit.changedFields);
    if (
      changedFields.length > 0 &&
      changedFields.every((field) =>
        EVENT_AUDIT_RETENTION_POLICY.lowRiskFields.includes(field),
      )
    ) {
      return "low-risk-noise";
    }
    return "routine-edit";
  }

  return "routine-edit";
};

const getAuditRetentionDays = (audit: {
  action?: string;
  changedFields?: string | null;
}) =>
  EVENT_AUDIT_RETENTION_POLICY.tiers[classifyEventAuditTier(audit)]
    .retentionDays;

const addDays = (base: Date | string, days: number) => {
  const result = new Date(base);
  if (Number.isNaN(result.getTime())) return null;
  result.setDate(result.getDate() + days);
  return result;
};

const toDateOrNull = (value?: Date | string | null) => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toRetentionUntilIso = (
  changedAt: Date | string,
  retentionDays: number,
) => {
  const retentionUntil = addDays(changedAt, retentionDays);
  return retentionUntil ? retentionUntil.toISOString() : "";
};

const resolveAuditLifecycleMetadata = (audit: {
  action?: string;
  changedFields?: string | null;
  changedAt?: Date | string;
  retentionTier?: string | null;
  retentionPolicyVersion?: string | null;
  retentionDays?: number | null;
  retentionUntil?: Date | string | null;
  exportEligibleAt?: Date | string | null;
  archiveEligibleAt?: Date | string | null;
  exportedAt?: Date | string | null;
  archivedAt?: Date | string | null;
  archiveStatus?: string | null;
}) => {
  const changedAt = toDateOrNull(audit.changedAt) ?? new Date();
  const classifiedTier = classifyEventAuditTier(audit);
  const retentionTier =
    audit.retentionTier === "critical-mutation" ||
    audit.retentionTier === "routine-edit" ||
    audit.retentionTier === "low-risk-noise"
      ? (audit.retentionTier as AuditRetentionTier)
      : classifiedTier;

  const retentionDays =
    typeof audit.retentionDays === "number"
      ? audit.retentionDays
      : EVENT_AUDIT_RETENTION_POLICY.tiers[retentionTier].retentionDays;

  const retentionUntil =
    toDateOrNull(audit.retentionUntil) ?? addDays(changedAt, retentionDays);

  const exportEligibleAt =
    toDateOrNull(audit.exportEligibleAt) ??
    addDays(changedAt, EVENT_AUDIT_RETENTION_POLICY.exportCadenceDays);

  const archiveEligibleAt =
    toDateOrNull(audit.archiveEligibleAt) ??
    addDays(changedAt, EVENT_AUDIT_RETENTION_POLICY.archivalCadenceDays);

  const exportedAt = toDateOrNull(audit.exportedAt);
  const archivedAt = toDateOrNull(audit.archivedAt);

  const now = Date.now();
  const isExportEligible = Boolean(
    exportEligibleAt &&
      exportEligibleAt.getTime() <= now &&
      !exportedAt &&
      !archivedAt,
  );
  const isArchiveEligible = Boolean(
    archiveEligibleAt && archiveEligibleAt.getTime() <= now && !archivedAt,
  );
  const isPurgeEligible = Boolean(
    archivedAt && retentionUntil && retentionUntil.getTime() <= now,
  );

  let archiveStatus: AuditArchiveStatus = AUDIT_ARCHIVE_STATUS.pending;
  if (archivedAt) {
    archiveStatus = AUDIT_ARCHIVE_STATUS.archived;
  } else if (isArchiveEligible) {
    archiveStatus = AUDIT_ARCHIVE_STATUS.archiveEligible;
  } else if (isExportEligible) {
    archiveStatus = AUDIT_ARCHIVE_STATUS.exportEligible;
  }

  if (isPurgeEligible) {
    archiveStatus = AUDIT_ARCHIVE_STATUS.purgeEligible;
  }

  return {
    retentionTier,
    retentionPolicyVersion:
      audit.retentionPolicyVersion ?? EVENT_AUDIT_RETENTION_POLICY.version,
    retentionDays,
    retentionUntil,
    exportEligibleAt,
    archiveEligibleAt,
    archiveStatus,
    isExportEligible,
    isArchiveEligible,
    isPurgeEligible,
  };
};

const normalizeEventForAudit = (event: AuditableEventShape) => ({
  title: event.title?.trim() ?? "",
  description: event.description?.trim() ?? "",
  date: toIsoDateTime(event.date),
  endDate: toIsoDateTime(event.endDate),
  month: event.month?.trim() ?? "",
  day: event.day?.trim() ?? "",
  category: event.category?.trim() ?? "",
  location: event.location?.trim() ?? "",
  registrationLink: event.registrationLink?.trim() ?? "",
  conferenceLinkText: event.conferenceLinkText?.trim() ?? "",
  conferenceDate: event.conferenceDate?.trim() ?? "",
});

const getChangedEventFields = (
  before: AuditableEventShape,
  after: AuditableEventShape,
) => {
  const normalizedBefore = normalizeEventForAudit(before);
  const normalizedAfter = normalizeEventForAudit(after);

  return EVENT_AUDIT_FIELDS.filter(
    (field) => normalizedBefore[field] !== normalizedAfter[field],
  );
};

const stringifySnapshot = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
};

const parseSnapshot = (value?: string) => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
};

const normalizeEmail = (value?: string | null) =>
  value?.trim().toLowerCase() ?? "";

const resolveAdminRole = (
  user?: { id?: string | null; email?: string | null } | null,
): AdminRole => {
  if (!user) return "editor";

  const userId = user.id ?? "";
  const email = normalizeEmail(user.email);

  if (ELEVATED_ADMIN_USER_ID_ALLOWLIST.includes(userId)) {
    return "elevated";
  }

  if (ELEVATED_ADMIN_EMAIL_ALLOWLIST.includes(email)) {
    return "elevated";
  }

  const emailDomain = email.includes("@") ? email.split("@")[1] : "";
  if (ELEVATED_ADMIN_EMAIL_DOMAINS.includes(emailDomain)) {
    return "elevated";
  }

  return "editor";
};

const toStringFromUnknown = (value: unknown) =>
  typeof value === "string" ? value : "";

const snapshotToEventForm = (
  snapshot: Record<string, unknown>,
): EventFormState => ({
  title: toStringFromUnknown(snapshot.title),
  description: toStringFromUnknown(snapshot.description),
  date: toDateInputValue(snapshot.date as Date | string | undefined),
  endDate: toDateInputValue(snapshot.endDate as Date | string | undefined),
  month: toStringFromUnknown(snapshot.month),
  day: toStringFromUnknown(snapshot.day),
  category: toStringFromUnknown(snapshot.category),
  location: toStringFromUnknown(snapshot.location),
  registrationLink: toStringFromUnknown(snapshot.registrationLink),
  conferenceLinkText: toStringFromUnknown(snapshot.conferenceLinkText),
  conferenceDate: toStringFromUnknown(snapshot.conferenceDate),
});

const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const validateEventForm = (form: EventFormState) => {
  const messages: string[] = [];

  const title = form.title.trim();
  const month = form.month.trim();
  const day = form.day.trim();
  const category = form.category.trim();
  const location = form.location.trim();

  const date = toDateOrUndefined(form.date);
  const endDate = toDateOrUndefined(form.endDate);

  if (!title) messages.push("Title is required.");
  if (!month) messages.push("Month is required.");
  if (!day) messages.push("Day is required.");
  if (!location) messages.push("Location is required.");

  if (!date) {
    messages.push("Enter a valid start date.");
  }

  if (form.endDate.trim() && !endDate) {
    messages.push("Enter a valid end date.");
  }

  if (date && endDate && endDate < date) {
    messages.push("End date must be on or after the start date.");
  }

  if (!category) {
    messages.push("Category is required.");
  } else if (
    !ALLOWED_EVENT_CATEGORIES.includes(
      category as (typeof ALLOWED_EVENT_CATEGORIES)[number],
    )
  ) {
    messages.push(
      `Category must be one of: ${ALLOWED_EVENT_CATEGORIES.join(", ")}.`,
    );
  }

  const registrationLink = safeTrimOrUndefined(form.registrationLink);
  if (registrationLink && !isValidHttpUrl(registrationLink)) {
    messages.push(
      "Registration link must start with http:// or https:// and be valid.",
    );
  }

  if (messages.length > 0 || !date) {
    return {
      payload: null,
      errorMessage: messages.join(" "),
    };
  }

  const payload: EventMutationPayload = {
    title,
    description: safeTrimOrUndefined(form.description),
    date,
    endDate,
    month,
    day,
    category,
    location,
    registrationLink,
    conferenceLinkText: safeTrimOrUndefined(form.conferenceLinkText),
    conferenceDate: safeTrimOrUndefined(form.conferenceDate),
  };

  return {
    payload,
    errorMessage: null,
  };
};

export const AdminPage = () => {
  usePageMeta({
    title: "Admin | Southern University Alumni - Dallas Chapter",
    description:
      "Manage events, impact features, and stats from the in-app admin dashboard.",
    url: "/admin",
  });

  const {
    user,
    isPending: authPending,
    error: authError,
  } = useAuth({ requireAuth: true });

  const {
    data: eventsData,
    isPending: eventsPending,
    error: eventsError,
  } = useQuery("Event", { orderBy: { date: "asc" } });

  const {
    data: statsData,
    isPending: statsPending,
    error: statsError,
  } = useQuery("Stat", { orderBy: { createdAt: "asc" } });

  const {
    data: impactData,
    isPending: impactPending,
    error: impactError,
  } = useQuery("ImpactFeature", { orderBy: { createdAt: "asc" } });

  const {
    data: eventAuditsData,
    isPending: eventAuditsPending,
    error: eventAuditsError,
  } = useQuery("EventAudit", {
    orderBy: { changedAt: "desc" },
    limit: 100,
  });

  const {
    create: createEvent,
    update: updateEvent,
    remove: removeEvent,
    isPending: eventMutationPending,
    error: eventMutationError,
  } = useMutation("Event");

  const {
    create: createStat,
    update: updateStat,
    remove: removeStat,
    isPending: statMutationPending,
    error: statMutationError,
  } = useMutation("Stat");

  const {
    create: createImpactFeature,
    update: updateImpactFeature,
    remove: removeImpactFeature,
    isPending: impactMutationPending,
    error: impactMutationError,
  } = useMutation("ImpactFeature");

  const {
    create: createEventAudit,
    update: updateEventAudit,
    remove: removeEventAudit,
    isPending: eventAuditMutationPending,
    error: eventAuditMutationError,
  } = useMutation("EventAudit");

  const [activeEntity, setActiveEntity] = useState<EntityName>("Event");

  const [eventCreateForm, setEventCreateForm] =
    useState<EventFormState>(EVENT_DEFAULT_FORM);
  const [eventEditId, setEventEditId] = useState<string | null>(null);
  const [eventEditForm, setEventEditForm] =
    useState<EventFormState>(EVENT_DEFAULT_FORM);

  const [statCreateForm, setStatCreateForm] =
    useState<StatFormState>(STAT_DEFAULT_FORM);
  const [statEditId, setStatEditId] = useState<string | null>(null);
  const [statEditForm, setStatEditForm] =
    useState<StatFormState>(STAT_DEFAULT_FORM);

  const [impactCreateForm, setImpactCreateForm] =
    useState<ImpactFeatureFormState>(IMPACT_DEFAULT_FORM);
  const [impactEditId, setImpactEditId] = useState<string | null>(null);
  const [impactEditForm, setImpactEditForm] =
    useState<ImpactFeatureFormState>(IMPACT_DEFAULT_FORM);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [auditFilters, setAuditFilters] = useState(AUDIT_FILTER_DEFAULTS);
  const [auditBatchTelemetry, setAuditBatchTelemetry] = useState<
    Record<AuditBatchKind, AuditBatchTelemetryState>
  >(createInitialAuditBatchTelemetry);

  const adminRole = resolveAdminRole(user);
  const canDeleteOrRevert = adminRole === "elevated";

  const events = eventsData ?? [];
  const stats = statsData ?? [];
  const impactFeatures = impactData ?? [];
  const eventAudits = eventAuditsData ?? [];

  const auditTierCounts = useMemo(
    () =>
      eventAudits.reduce<Record<AuditRetentionTier, number>>(
        (counts, audit) => {
          const tier = resolveAuditLifecycleMetadata(audit).retentionTier;
          counts[tier] += 1;
          return counts;
        },
        {
          "critical-mutation": 0,
          "routine-edit": 0,
          "low-risk-noise": 0,
        },
      ),
    [eventAudits],
  );

  const exportEligibleCount = useMemo(
    () =>
      eventAudits.filter((audit) => {
        const lifecycle = resolveAuditLifecycleMetadata(audit);
        return lifecycle.isExportEligible;
      }).length,
    [eventAudits],
  );

  const archiveEligibleCount = useMemo(
    () =>
      eventAudits.filter((audit) => {
        const lifecycle = resolveAuditLifecycleMetadata(audit);
        return lifecycle.isArchiveEligible;
      }).length,
    [eventAudits],
  );

  const purgeEligibleCount = useMemo(
    () =>
      eventAudits.filter((audit) => {
        const lifecycle = resolveAuditLifecycleMetadata(audit);
        return lifecycle.isPurgeEligible;
      }).length,
    [eventAudits],
  );

  const latestExportedAt = useMemo(
    () =>
      eventAudits.reduce<Date | null>((latest, audit) => {
        const exportedAt = toDateOrNull(audit.exportedAt);
        if (!exportedAt) return latest;
        if (!latest || exportedAt.getTime() > latest.getTime())
          return exportedAt;
        return latest;
      }, null),
    [eventAudits],
  );

  const latestArchivedAt = useMemo(
    () =>
      eventAudits.reduce<Date | null>((latest, audit) => {
        const archivedAt = toDateOrNull(audit.archivedAt);
        if (!archivedAt) return latest;
        if (!latest || archivedAt.getTime() > latest.getTime())
          return archivedAt;
        return latest;
      }, null),
    [eventAudits],
  );

  const filteredEventAudits = useMemo(() => {
    const actionFilter = auditFilters.action;
    const actorNeedle = auditFilters.actorQuery.trim().toLowerCase();

    const fromDate = toDateOrUndefined(auditFilters.fromDate);
    const fromBoundary = fromDate ? new Date(fromDate) : null;
    if (fromBoundary) fromBoundary.setHours(0, 0, 0, 0);

    const toDate = toDateOrUndefined(auditFilters.toDate);
    const toBoundary = toDate ? new Date(toDate) : null;
    if (toBoundary) toBoundary.setHours(23, 59, 59, 999);

    return eventAudits.filter((audit) => {
      if (actionFilter !== "all" && audit.action !== actionFilter) {
        return false;
      }

      if (actorNeedle) {
        const actorSource =
          `${audit.changedByEmail ?? ""} ${audit.changedByUserId ?? ""}`.toLowerCase();
        if (!actorSource.includes(actorNeedle)) {
          return false;
        }
      }

      const changedAtDate = new Date(audit.changedAt);
      if (Number.isNaN(changedAtDate.getTime())) {
        return false;
      }

      if (fromBoundary && changedAtDate < fromBoundary) {
        return false;
      }

      if (toBoundary && changedAtDate > toBoundary) {
        return false;
      }

      return true;
    });
  }, [eventAudits, auditFilters]);

  const isMutating =
    eventMutationPending ||
    statMutationPending ||
    impactMutationPending ||
    eventAuditMutationPending;

  const selectedError = useMemo(() => {
    if (activeEntity === "Event") {
      return (
        eventsError ||
        eventMutationError ||
        eventAuditsError ||
        eventAuditMutationError
      );
    }
    if (activeEntity === "Stat") return statsError || statMutationError;
    return impactError || impactMutationError;
  }, [
    activeEntity,
    eventsError,
    eventMutationError,
    eventAuditsError,
    eventAuditMutationError,
    statsError,
    statMutationError,
    impactError,
    impactMutationError,
  ]);

  const resetStatus = () => setStatusMessage(null);

  const mapEventToForm = (event: (typeof events)[number]): EventFormState => ({
    title: event.title ?? "",
    description: event.description ?? "",
    date: toDateInputValue(event.date),
    endDate: toDateInputValue(event.endDate),
    month: event.month ?? "",
    day: event.day ?? "",
    category: event.category ?? "",
    location: event.location ?? "",
    registrationLink: event.registrationLink ?? "",
    conferenceLinkText: event.conferenceLinkText ?? "",
    conferenceDate: event.conferenceDate ?? "",
  });

  const writeEventAudit = async ({
    eventId,
    action,
    changeSummary,
    changedFields,
    beforeSnapshot,
    afterSnapshot,
  }: {
    eventId: string;
    action: "create" | "update" | "delete" | "revert";
    changeSummary: string;
    changedFields?: string[];
    beforeSnapshot?: string;
    afterSnapshot?: string;
  }) => {
    try {
      const changedAt = new Date();
      const changedFieldsValue =
        changedFields && changedFields.length > 0
          ? changedFields.join(", ")
          : undefined;

      const lifecycle = resolveAuditLifecycleMetadata({
        action,
        changedFields: changedFieldsValue,
        changedAt,
      });

      await createEventAudit({
        eventId,
        action,
        changedAt,
        changedByUserId: user?.id,
        changedByEmail: user?.email,
        changeSummary,
        changedFields: changedFieldsValue,
        beforeSnapshot,
        afterSnapshot,
        source: EVENT_AUDIT_SOURCE,
        retentionTier: lifecycle.retentionTier,
        retentionPolicyVersion: lifecycle.retentionPolicyVersion,
        retentionDays: lifecycle.retentionDays,
        retentionUntil: lifecycle.retentionUntil ?? undefined,
        exportEligibleAt: lifecycle.exportEligibleAt ?? undefined,
        archiveEligibleAt: lifecycle.archiveEligibleAt ?? undefined,
        archiveStatus: lifecycle.archiveStatus,
      });
      return true;
    } catch {
      return false;
    }
  };

  const handleEventCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStatus();

    const { payload, errorMessage } = validateEventForm(eventCreateForm);
    if (!payload) {
      setStatusMessage(errorMessage ?? "Please review the event fields.");
      return;
    }

    try {
      const createdEvent = await createEvent(payload);
      const auditLogged = await writeEventAudit({
        eventId: createdEvent.id,
        action: "create",
        changeSummary: "Created event record.",
        changedFields: EVENT_AUDIT_FIELDS,
        afterSnapshot: stringifySnapshot(normalizeEventForAudit(createdEvent)),
      });

      setEventCreateForm(EVENT_DEFAULT_FORM);
      setStatusMessage(
        auditLogged
          ? "Event created."
          : "Event created, but audit logging failed.",
      );
    } catch {
      setStatusMessage("Failed to create event.");
    }
  };

  const handleEventEditStart = (eventId: string) => {
    const target = events.find((item) => item.id === eventId);
    if (!target) return;
    setEventEditId(eventId);
    setEventEditForm(mapEventToForm(target));
    resetStatus();
  };

  const handleEventEditSave = async (eventId: string) => {
    resetStatus();
    const { payload, errorMessage } = validateEventForm(eventEditForm);
    if (!payload) {
      setStatusMessage(errorMessage ?? "Please review the event fields.");
      return;
    }

    const existingEvent = events.find((item) => item.id === eventId);
    if (!existingEvent) {
      setStatusMessage("Event not found for update.");
      return;
    }

    const changedFields = getChangedEventFields(existingEvent, payload);
    if (changedFields.length === 0) {
      setStatusMessage("No changes detected.");
      setEventEditId(null);
      return;
    }

    try {
      const updatedEvent = await updateEvent(eventId, payload);
      const auditLogged = await writeEventAudit({
        eventId,
        action: "update",
        changeSummary: `Updated event fields: ${changedFields.join(", ")}.`,
        changedFields,
        beforeSnapshot: stringifySnapshot(
          normalizeEventForAudit(existingEvent),
        ),
        afterSnapshot: stringifySnapshot(normalizeEventForAudit(updatedEvent)),
      });

      setEventEditId(null);
      setStatusMessage(
        auditLogged
          ? "Event updated."
          : "Event updated, but audit logging failed.",
      );
    } catch {
      setStatusMessage("Failed to update event.");
    }
  };

  const handleEventDelete = async (eventId: string) => {
    resetStatus();

    if (!canDeleteOrRevert) {
      setStatusMessage("Elevated admin role required for delete actions.");
      return;
    }

    const existingEvent = events.find((item) => item.id === eventId);
    if (!existingEvent) {
      setStatusMessage("Event not found for deletion.");
      return;
    }

    try {
      await removeEvent(eventId);
      const auditLogged = await writeEventAudit({
        eventId,
        action: "delete",
        changeSummary: "Deleted event record.",
        changedFields: EVENT_AUDIT_FIELDS,
        beforeSnapshot: stringifySnapshot(
          normalizeEventForAudit(existingEvent),
        ),
      });

      if (eventEditId === eventId) setEventEditId(null);
      setStatusMessage(
        auditLogged
          ? "Event deleted."
          : "Event deleted, but audit logging failed.",
      );
    } catch {
      setStatusMessage("Failed to delete event.");
    }
  };

  const handleEventRevert = async (auditId: string) => {
    resetStatus();

    if (!canDeleteOrRevert) {
      setStatusMessage("Elevated admin role required for revert actions.");
      return;
    }

    const audit = eventAudits.find((item) => item.id === auditId);
    if (!audit) {
      setStatusMessage("Audit entry not found.");
      return;
    }

    const beforeSnapshot = parseSnapshot(audit.beforeSnapshot);
    const afterSnapshot = parseSnapshot(audit.afterSnapshot);

    try {
      if (audit.action === "create") {
        await removeEvent(audit.eventId);
        const auditLogged = await writeEventAudit({
          eventId: audit.eventId,
          action: "revert",
          changeSummary: "Reverted event creation.",
          changedFields: EVENT_AUDIT_FIELDS,
          beforeSnapshot: stringifySnapshot(afterSnapshot ?? {}),
        });
        setStatusMessage(
          auditLogged
            ? "Event creation reverted."
            : "Event creation reverted, but audit logging failed.",
        );
        return;
      }

      if (audit.action === "update") {
        if (!beforeSnapshot) {
          setStatusMessage("Cannot revert: missing previous event snapshot.");
          return;
        }

        const { payload, errorMessage } = validateEventForm(
          snapshotToEventForm(beforeSnapshot),
        );

        if (!payload) {
          setStatusMessage(
            `Cannot revert: ${errorMessage ?? "snapshot data is invalid."}`,
          );
          return;
        }

        const currentEvent = events.find((item) => item.id === audit.eventId);
        const revertedEvent = await updateEvent(audit.eventId, payload);
        const changedFields = currentEvent
          ? getChangedEventFields(currentEvent, payload)
          : EVENT_AUDIT_FIELDS;

        const auditLogged = await writeEventAudit({
          eventId: audit.eventId,
          action: "revert",
          changeSummary: `Reverted update using snapshot from ${new Date(audit.changedAt).toLocaleString()}.`,
          changedFields,
          beforeSnapshot: stringifySnapshot(
            currentEvent ? normalizeEventForAudit(currentEvent) : {},
          ),
          afterSnapshot: stringifySnapshot(
            normalizeEventForAudit(revertedEvent),
          ),
        });

        setStatusMessage(
          auditLogged
            ? "Event reverted to previous version."
            : "Event reverted, but audit logging failed.",
        );
        return;
      }

      if (audit.action === "delete") {
        if (!beforeSnapshot) {
          setStatusMessage("Cannot restore: missing deleted event snapshot.");
          return;
        }

        const { payload, errorMessage } = validateEventForm(
          snapshotToEventForm(beforeSnapshot),
        );

        if (!payload) {
          setStatusMessage(
            `Cannot restore: ${errorMessage ?? "snapshot data is invalid."}`,
          );
          return;
        }

        const restoredEvent = await createEvent(payload);
        const auditLogged = await writeEventAudit({
          eventId: restoredEvent.id,
          action: "revert",
          changeSummary: `Restored deleted event from ${new Date(audit.changedAt).toLocaleString()}.`,
          changedFields: EVENT_AUDIT_FIELDS,
          afterSnapshot: stringifySnapshot(
            normalizeEventForAudit(restoredEvent),
          ),
        });

        setStatusMessage(
          auditLogged
            ? "Deleted event restored."
            : "Deleted event restored, but audit logging failed.",
        );
        return;
      }

      setStatusMessage("This audit entry cannot be reverted in the UI.");
    } catch {
      setStatusMessage("Failed to revert event changes.");
    }
  };

  const handleRunAuditBatch = async (kind: AuditBatchKind) => {
    resetStatus();

    if (kind === "purge" && !canDeleteOrRevert) {
      setStatusMessage("Elevated admin role required for purge actions.");
      return;
    }

    const batchSize =
      kind === "export"
        ? AUDIT_BATCH_POLICY.exportBatchSize
        : kind === "archive"
          ? AUDIT_BATCH_POLICY.archiveBatchSize
          : AUDIT_BATCH_POLICY.purgeBatchSize;

    const candidates = eventAudits
      .filter((audit) => {
        const lifecycle = resolveAuditLifecycleMetadata(audit);
        if (kind === "export") return lifecycle.isExportEligible;
        if (kind === "archive") return lifecycle.isArchiveEligible;
        return lifecycle.isPurgeEligible;
      })
      .sort(
        (a, b) =>
          new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
      )
      .slice(0, batchSize);

    const now = new Date();
    const batchKey = createAuditBatchKey(kind, now);

    if (candidates.length === 0) {
      setAuditBatchTelemetry((prev) => ({
        ...prev,
        [kind]: {
          lastRunAt: now,
          processedCount: 0,
          failedCount: 0,
          lastBatchKey: batchKey,
          lastError: "No eligible records",
        },
      }));
      setStatusMessage(
        `No audit records are currently eligible for ${kind} batching.`,
      );
      return;
    }

    let processedCount = 0;
    let failedCount = 0;

    for (const audit of candidates) {
      try {
        if (kind === "export") {
          const lifecycle = resolveAuditLifecycleMetadata(audit);
          await updateEventAudit(audit.id, {
            exportedAt: now,
            archiveBatchKey: batchKey,
            archiveStatus: lifecycle.isArchiveEligible
              ? AUDIT_ARCHIVE_STATUS.archiveEligible
              : AUDIT_ARCHIVE_STATUS.pending,
          });
          processedCount += 1;
          continue;
        }

        if (kind === "archive") {
          await updateEventAudit(audit.id, {
            archivedAt: now,
            exportedAt: audit.exportedAt ?? now,
            archiveBatchKey: batchKey,
            archiveStatus: AUDIT_ARCHIVE_STATUS.archived,
          });
          processedCount += 1;
          continue;
        }

        await removeEventAudit(audit.id);
        processedCount += 1;
      } catch {
        failedCount += 1;
      }
    }

    setAuditBatchTelemetry((prev) => ({
      ...prev,
      [kind]: {
        lastRunAt: now,
        processedCount,
        failedCount,
        lastBatchKey: batchKey,
        lastError:
          failedCount > 0 ? `${failedCount} record(s) failed in run.` : null,
      },
    }));

    setStatusMessage(
      failedCount > 0
        ? `Processed ${processedCount} records with ${failedCount} failures in ${kind} batch ${batchKey}.`
        : `Processed ${processedCount} records in ${kind} batch ${batchKey}.`,
    );
  };

  const handleAuditExportCsv = () => {
    if (filteredEventAudits.length === 0) {
      setStatusMessage("No audit entries available to export.");
      return;
    }

    const headers = [
      "id",
      "eventId",
      "action",
      "retentionTier",
      "policyVersion",
      "changedAt",
      "retentionUntil",
      "retentionDays",
      "exportEligibleAt",
      "archiveEligibleAt",
      "exportedAt",
      "archivedAt",
      "archiveBatchKey",
      "archiveStatus",
      "isExportEligible",
      "isArchiveEligible",
      "isPurgeEligible",
      "changedByEmail",
      "changedByUserId",
      "changedFields",
      "changeSummary",
      "source",
      "beforeSnapshot",
      "afterSnapshot",
    ];

    const rows = filteredEventAudits.map((audit) => {
      const lifecycle = resolveAuditLifecycleMetadata(audit);

      return [
        audit.id,
        audit.eventId,
        audit.action,
        lifecycle.retentionTier,
        lifecycle.retentionPolicyVersion,
        new Date(audit.changedAt).toISOString(),
        lifecycle.retentionUntil
          ? lifecycle.retentionUntil.toISOString()
          : toRetentionUntilIso(audit.changedAt, lifecycle.retentionDays),
        lifecycle.retentionDays,
        lifecycle.exportEligibleAt
          ? lifecycle.exportEligibleAt.toISOString()
          : "",
        lifecycle.archiveEligibleAt
          ? lifecycle.archiveEligibleAt.toISOString()
          : "",
        toIsoDateTime(audit.exportedAt),
        toIsoDateTime(audit.archivedAt),
        audit.archiveBatchKey ?? "",
        lifecycle.archiveStatus,
        lifecycle.isExportEligible ? "true" : "false",
        lifecycle.isArchiveEligible ? "true" : "false",
        lifecycle.isPurgeEligible ? "true" : "false",
        audit.changedByEmail ?? "",
        audit.changedByUserId ?? "",
        audit.changedFields ?? "",
        audit.changeSummary ?? "",
        audit.source ?? "",
        audit.beforeSnapshot ?? "",
        audit.afterSnapshot ?? "",
      ]
        .map((value) => toCsvCell(value))
        .join(",");
    });

    const csvContent = [
      headers.map((header) => toCsvCell(header)).join(","),
      ...rows,
    ].join("\n");
    const fileName = `event-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(downloadUrl);
    setStatusMessage(`Exported ${filteredEventAudits.length} audit entries.`);
  };

  const handleStatCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStatus();

    const payload = {
      statValue: statCreateForm.statValue.trim(),
      statLabel: statCreateForm.statLabel.trim(),
      imageSrc: statCreateForm.imageSrc.trim(),
    };

    if (!payload.statValue || !payload.statLabel || !payload.imageSrc) {
      setStatusMessage("Please fill all stat fields.");
      return;
    }

    try {
      await createStat(payload);
      setStatCreateForm(STAT_DEFAULT_FORM);
      setStatusMessage("Stat created.");
    } catch {
      setStatusMessage("Failed to create stat.");
    }
  };

  const handleStatEditStart = (statId: string) => {
    const target = stats.find((item) => item.id === statId);
    if (!target) return;
    setStatEditId(statId);
    setStatEditForm({
      statValue: target.statValue ?? "",
      statLabel: target.statLabel ?? "",
      imageSrc: target.imageSrc ?? "",
    });
    resetStatus();
  };

  const handleStatEditSave = async (statId: string) => {
    resetStatus();

    const payload = {
      statValue: statEditForm.statValue.trim(),
      statLabel: statEditForm.statLabel.trim(),
      imageSrc: statEditForm.imageSrc.trim(),
    };

    if (!payload.statValue || !payload.statLabel || !payload.imageSrc) {
      setStatusMessage("Please fill all stat fields.");
      return;
    }

    try {
      await updateStat(statId, payload);
      setStatEditId(null);
      setStatusMessage("Stat updated.");
    } catch {
      setStatusMessage("Failed to update stat.");
    }
  };

  const handleStatDelete = async (statId: string) => {
    resetStatus();

    if (!canDeleteOrRevert) {
      setStatusMessage("Elevated admin role required for delete actions.");
      return;
    }

    try {
      await removeStat(statId);
      if (statEditId === statId) setStatEditId(null);
      setStatusMessage("Stat deleted.");
    } catch {
      setStatusMessage("Failed to delete stat.");
    }
  };

  const handleImpactCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStatus();

    const payload = {
      title: impactCreateForm.title.trim(),
      description: impactCreateForm.description.trim(),
      imageSrc: impactCreateForm.imageSrc.trim(),
    };

    if (!payload.title || !payload.description || !payload.imageSrc) {
      setStatusMessage("Please fill all impact feature fields.");
      return;
    }

    try {
      await createImpactFeature(payload);
      setImpactCreateForm(IMPACT_DEFAULT_FORM);
      setStatusMessage("Impact feature created.");
    } catch {
      setStatusMessage("Failed to create impact feature.");
    }
  };

  const handleImpactEditStart = (impactId: string) => {
    const target = impactFeatures.find((item) => item.id === impactId);
    if (!target) return;
    setImpactEditId(impactId);
    setImpactEditForm({
      title: target.title ?? "",
      description: target.description ?? "",
      imageSrc: target.imageSrc ?? "",
    });
    resetStatus();
  };

  const handleImpactEditSave = async (impactId: string) => {
    resetStatus();

    const payload = {
      title: impactEditForm.title.trim(),
      description: impactEditForm.description.trim(),
      imageSrc: impactEditForm.imageSrc.trim(),
    };

    if (!payload.title || !payload.description || !payload.imageSrc) {
      setStatusMessage("Please fill all impact feature fields.");
      return;
    }

    try {
      await updateImpactFeature(impactId, payload);
      setImpactEditId(null);
      setStatusMessage("Impact feature updated.");
    } catch {
      setStatusMessage("Failed to update impact feature.");
    }
  };

  const handleImpactDelete = async (impactId: string) => {
    resetStatus();

    if (!canDeleteOrRevert) {
      setStatusMessage("Elevated admin role required for delete actions.");
      return;
    }

    try {
      await removeImpactFeature(impactId);
      if (impactEditId === impactId) setImpactEditId(null);
      setStatusMessage("Impact feature deleted.");
    } catch {
      setStatusMessage("Failed to delete impact feature.");
    }
  };

  const entityButtonClass = (entity: EntityName) =>
    `rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
      activeEntity === entity
        ? "bg-amber-400 text-amber-950"
        : "bg-white/10 text-white hover:bg-white/20"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b083f] via-[#111062] to-[#1f1a8a] text-white">
      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 md:px-8">
        <section className="rounded-2xl border border-white/15 bg-white/5 p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                Admin Dashboard
              </p>
              <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">
                In-App Content Management
              </h1>
              <p className="mt-2 text-sm text-gray-200">
                Manage events, statistics, and impact features directly in the
                app.
              </p>
            </div>
            <Link
              to="/"
              className="rounded-md border border-white/25 px-3 py-2 text-sm font-medium text-gray-100 transition hover:bg-white/10"
            >
              Back to site
            </Link>
          </div>

          {authPending && (
            <p className="mb-4 text-sm text-gray-200">
              Authenticating admin session...
            </p>
          )}
          {authError && (
            <p className="mb-4 text-sm text-red-300">
              Auth error: {authError.message}
            </p>
          )}
          {user && (
            <p className="mb-4 text-sm text-emerald-300">
              Signed in as {user.email} • Role:{" "}
              {adminRole === "elevated" ? "Elevated Admin" : "Editor"}
            </p>
          )}

          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              className={entityButtonClass("Event")}
              onClick={() => setActiveEntity("Event")}
            >
              Events
            </button>
            <button
              type="button"
              className={entityButtonClass("Stat")}
              onClick={() => setActiveEntity("Stat")}
            >
              Stats
            </button>
            <button
              type="button"
              className={entityButtonClass("ImpactFeature")}
              onClick={() => setActiveEntity("ImpactFeature")}
            >
              Impact Features
            </button>
          </div>

          {statusMessage && (
            <div className="mb-4 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-gray-100">
              {statusMessage}
            </div>
          )}

          {selectedError && (
            <div className="mb-4 rounded-md border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm text-red-200">
              {selectedError.message}
            </div>
          )}

          {activeEntity === "Event" && (
            <section className="space-y-6">
              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <h2 className="text-lg font-bold">Create Event</h2>
                <form
                  onSubmit={handleEventCreate}
                  className="mt-3 grid gap-3 md:grid-cols-2"
                >
                  <input
                    value={eventCreateForm.title}
                    onChange={(e) =>
                      setEventCreateForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Title *"
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <input
                    value={eventCreateForm.category}
                    onChange={(e) =>
                      setEventCreateForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    placeholder="Category *"
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <input
                    value={eventCreateForm.location}
                    onChange={(e) =>
                      setEventCreateForm((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Location *"
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <input
                    type="date"
                    value={eventCreateForm.date}
                    onChange={(e) =>
                      setEventCreateForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <input
                    type="date"
                    value={eventCreateForm.endDate}
                    onChange={(e) =>
                      setEventCreateForm((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <input
                    value={eventCreateForm.month}
                    onChange={(e) =>
                      setEventCreateForm((prev) => ({
                        ...prev,
                        month: e.target.value,
                      }))
                    }
                    placeholder="Month (e.g. Apr) *"
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <input
                    value={eventCreateForm.day}
                    onChange={(e) =>
                      setEventCreateForm((prev) => ({
                        ...prev,
                        day: e.target.value,
                      }))
                    }
                    placeholder="Day (e.g. 12) *"
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <input
                    value={eventCreateForm.registrationLink}
                    onChange={(e) =>
                      setEventCreateForm((prev) => ({
                        ...prev,
                        registrationLink: e.target.value,
                      }))
                    }
                    placeholder="Registration link"
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <input
                    value={eventCreateForm.conferenceLinkText}
                    onChange={(e) =>
                      setEventCreateForm((prev) => ({
                        ...prev,
                        conferenceLinkText: e.target.value,
                      }))
                    }
                    placeholder="Conference link text"
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <input
                    value={eventCreateForm.conferenceDate}
                    onChange={(e) =>
                      setEventCreateForm((prev) => ({
                        ...prev,
                        conferenceDate: e.target.value,
                      }))
                    }
                    placeholder="Conference date display"
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <textarea
                    value={eventCreateForm.description}
                    onChange={(e) =>
                      setEventCreateForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Description"
                    className="md:col-span-2 min-h-[96px] rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={isMutating}
                      className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950 disabled:opacity-60"
                    >
                      {eventMutationPending ? "Saving..." : "Create Event"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <h2 className="text-lg font-bold">Existing Events</h2>
                {eventsPending ? (
                  <p className="mt-3 text-sm text-gray-300">
                    Loading events...
                  </p>
                ) : events.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-300">No events found.</p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {events.map((event) => {
                      const isEditing = eventEditId === event.id;

                      return (
                        <div
                          key={event.id}
                          className="rounded-lg border border-white/15 bg-slate-900/40 p-3"
                        >
                          {isEditing ? (
                            <div className="grid gap-2 md:grid-cols-2">
                              <input
                                value={eventEditForm.title}
                                onChange={(e) =>
                                  setEventEditForm((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
                                className="rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <input
                                value={eventEditForm.category}
                                onChange={(e) =>
                                  setEventEditForm((prev) => ({
                                    ...prev,
                                    category: e.target.value,
                                  }))
                                }
                                className="rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <input
                                value={eventEditForm.location}
                                onChange={(e) =>
                                  setEventEditForm((prev) => ({
                                    ...prev,
                                    location: e.target.value,
                                  }))
                                }
                                className="rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <input
                                type="date"
                                value={eventEditForm.date}
                                onChange={(e) =>
                                  setEventEditForm((prev) => ({
                                    ...prev,
                                    date: e.target.value,
                                  }))
                                }
                                className="rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <input
                                type="date"
                                value={eventEditForm.endDate}
                                onChange={(e) =>
                                  setEventEditForm((prev) => ({
                                    ...prev,
                                    endDate: e.target.value,
                                  }))
                                }
                                className="rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <input
                                value={eventEditForm.month}
                                onChange={(e) =>
                                  setEventEditForm((prev) => ({
                                    ...prev,
                                    month: e.target.value,
                                  }))
                                }
                                className="rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <input
                                value={eventEditForm.day}
                                onChange={(e) =>
                                  setEventEditForm((prev) => ({
                                    ...prev,
                                    day: e.target.value,
                                  }))
                                }
                                className="rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <input
                                value={eventEditForm.registrationLink}
                                onChange={(e) =>
                                  setEventEditForm((prev) => ({
                                    ...prev,
                                    registrationLink: e.target.value,
                                  }))
                                }
                                className="rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <input
                                value={eventEditForm.conferenceLinkText}
                                onChange={(e) =>
                                  setEventEditForm((prev) => ({
                                    ...prev,
                                    conferenceLinkText: e.target.value,
                                  }))
                                }
                                className="rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <input
                                value={eventEditForm.conferenceDate}
                                onChange={(e) =>
                                  setEventEditForm((prev) => ({
                                    ...prev,
                                    conferenceDate: e.target.value,
                                  }))
                                }
                                className="rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <textarea
                                value={eventEditForm.description}
                                onChange={(e) =>
                                  setEventEditForm((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                  }))
                                }
                                className="md:col-span-2 min-h-[84px] rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <div className="md:col-span-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEventEditSave(event.id)}
                                  disabled={isMutating}
                                  className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEventEditId(null)}
                                  disabled={isMutating}
                                  className="rounded-md border border-white/20 px-3 py-2 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-amber-300">
                                  {event.title}
                                </p>
                                <p className="text-xs text-gray-300">
                                  {event.month} {event.day} • {event.category} •{" "}
                                  {event.location}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEventEditStart(event.id)}
                                  disabled={isMutating}
                                  className="rounded-md border border-white/20 px-3 py-1.5 text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEventDelete(event.id)}
                                  disabled={isMutating || !canDeleteOrRevert}
                                  title={
                                    canDeleteOrRevert
                                      ? undefined
                                      : "Elevated admin role required for delete actions."
                                  }
                                  className="rounded-md bg-red-500/80 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">Event Audit Trail</h2>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleRunAuditBatch("export")}
                      disabled={isMutating || eventAuditsPending}
                      className="rounded-md border border-white/25 px-3 py-1.5 text-xs font-semibold text-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Run export batch
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRunAuditBatch("archive")}
                      disabled={isMutating || eventAuditsPending}
                      className="rounded-md border border-white/25 px-3 py-1.5 text-xs font-semibold text-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Run archive batch
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRunAuditBatch("purge")}
                      disabled={
                        isMutating || eventAuditsPending || !canDeleteOrRevert
                      }
                      title={
                        canDeleteOrRevert
                          ? undefined
                          : "Elevated admin role required for purge actions."
                      }
                      className="rounded-md border border-red-300/40 px-3 py-1.5 text-xs font-semibold text-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Run purge batch
                    </button>
                    <button
                      type="button"
                      onClick={handleAuditExportCsv}
                      disabled={
                        eventAuditsPending || filteredEventAudits.length === 0
                      }
                      className="rounded-md border border-white/25 px-3 py-1.5 text-xs font-semibold text-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Export CSV
                    </button>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-white/15 bg-slate-900/40 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                    Retention Policy v{EVENT_AUDIT_RETENTION_POLICY.version}
                  </p>
                  <p className="mt-1 text-xs text-gray-300">
                    Archive cadence: every{" "}
                    {EVENT_AUDIT_RETENTION_POLICY.archivalCadenceDays} days •
                    Export cadence: every{" "}
                    {EVENT_AUDIT_RETENTION_POLICY.exportCadenceDays} days
                  </p>
                  <div className="mt-2 grid gap-2 md:grid-cols-3">
                    {(
                      Object.entries(
                        EVENT_AUDIT_RETENTION_POLICY.tiers,
                      ) as Array<
                        [
                          AuditRetentionTier,
                          {
                            label: string;
                            retentionDays: number;
                            description: string;
                          },
                        ]
                      >
                    ).map(([tierKey, config]) => (
                      <div
                        key={tierKey}
                        className="rounded-md border border-white/10 bg-white/5 p-2"
                      >
                        <p className="text-xs font-semibold text-gray-100">
                          {config.label}
                        </p>
                        <p className="mt-1 text-xs text-gray-300">
                          Retain {config.retentionDays} days •{" "}
                          {auditTierCounts[tierKey]} entries
                        </p>
                        <p className="mt-1 text-[11px] text-gray-400">
                          {config.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-white/15 bg-slate-900/40 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                    Retention Ops Telemetry
                  </p>
                  <p className="mt-1 text-xs text-gray-300">
                    Last run health, processed/failed counts, and next cadence
                    window for each lifecycle batch.
                  </p>
                  <div className="mt-2 grid gap-2 md:grid-cols-3">
                    {(["export", "archive", "purge"] as AuditBatchKind[]).map(
                      (kind) => {
                        const telemetry = auditBatchTelemetry[kind];
                        const lastRecordedAt =
                          kind === "export"
                            ? latestExportedAt
                            : kind === "archive"
                              ? latestArchivedAt
                              : null;
                        const lastRunAt = telemetry.lastRunAt ?? lastRecordedAt;
                        const cadenceDays = AUDIT_BATCH_CADENCE_DAYS[kind];
                        const nextScheduledAt = lastRunAt
                          ? addDays(lastRunAt, cadenceDays)
                          : new Date();
                        const isOverdue = Boolean(
                          nextScheduledAt &&
                            nextScheduledAt.getTime() <= Date.now(),
                        );

                        const eligibleCount =
                          kind === "export"
                            ? exportEligibleCount
                            : kind === "archive"
                              ? archiveEligibleCount
                              : purgeEligibleCount;

                        return (
                          <div
                            key={kind}
                            className="rounded-md border border-white/10 bg-white/5 p-2"
                          >
                            <p className="text-xs font-semibold text-gray-100">
                              {AUDIT_BATCH_LABELS[kind]} Ops
                            </p>
                            <p className="mt-1 text-[11px] text-gray-300">
                              Last run:{" "}
                              {lastRunAt
                                ? lastRunAt.toLocaleString()
                                : "Not run yet"}
                            </p>
                            <p className="mt-1 text-[11px] text-gray-300">
                              Processed: {telemetry.processedCount} • Failed:{" "}
                              {telemetry.failedCount}
                            </p>
                            <p className="mt-1 text-[11px] text-gray-300">
                              Eligible now: {eligibleCount}
                            </p>
                            <p className="mt-1 text-[11px] text-gray-300">
                              Next scheduled:{" "}
                              {nextScheduledAt
                                ? nextScheduledAt.toLocaleDateString()
                                : "Now"}{" "}
                              {isOverdue ? "(due now)" : ""}
                            </p>
                            <p className="mt-1 truncate text-[11px] text-gray-400">
                              Batch key: {telemetry.lastBatchKey ?? "N/A"}
                            </p>
                            {telemetry.lastError && (
                              <p className="mt-1 text-[11px] text-red-200">
                                Last issue: {telemetry.lastError}
                              </p>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-4">
                  <select
                    value={auditFilters.action}
                    onChange={(e) =>
                      setAuditFilters((prev) => ({
                        ...prev,
                        action: e.target.value as AuditActionFilter,
                      }))
                    }
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={eventAuditsPending}
                  >
                    {AUDIT_ACTION_OPTIONS.map((option) => (
                      <option
                        key={option}
                        value={option}
                        className="bg-slate-900"
                      >
                        {option === "all"
                          ? "All actions"
                          : option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={auditFilters.fromDate}
                    onChange={(e) =>
                      setAuditFilters((prev) => ({
                        ...prev,
                        fromDate: e.target.value,
                      }))
                    }
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={eventAuditsPending}
                  />
                  <input
                    type="date"
                    value={auditFilters.toDate}
                    onChange={(e) =>
                      setAuditFilters((prev) => ({
                        ...prev,
                        toDate: e.target.value,
                      }))
                    }
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={eventAuditsPending}
                  />
                  <input
                    value={auditFilters.actorQuery}
                    onChange={(e) =>
                      setAuditFilters((prev) => ({
                        ...prev,
                        actorQuery: e.target.value,
                      }))
                    }
                    placeholder="Filter by user email or ID"
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={eventAuditsPending}
                  />
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-gray-300">
                    Showing {filteredEventAudits.length} of {eventAudits.length}{" "}
                    entries • Export eligible: {exportEligibleCount} • Archive
                    eligible: {archiveEligibleCount} • Purge eligible:{" "}
                    {purgeEligibleCount}
                  </p>
                  <button
                    type="button"
                    onClick={() => setAuditFilters(AUDIT_FILTER_DEFAULTS)}
                    disabled={eventAuditsPending}
                    className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reset filters
                  </button>
                </div>

                {eventAuditsPending ? (
                  <p className="mt-3 text-sm text-gray-300">
                    Loading audit entries...
                  </p>
                ) : eventAudits.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-300">
                    No audit entries yet.
                  </p>
                ) : filteredEventAudits.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-300">
                    No audit entries match the current filters.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {filteredEventAudits.map((audit) => {
                      const canRevert =
                        audit.action === "create" ||
                        audit.action === "update" ||
                        audit.action === "delete";
                      const lifecycle = resolveAuditLifecycleMetadata(audit);

                      return (
                        <div
                          key={audit.id}
                          className="rounded-lg border border-white/15 bg-slate-900/40 p-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                                {audit.action}
                              </p>
                              <p className="mt-1 text-sm text-gray-100">
                                {audit.changeSummary ||
                                  "Event change recorded."}
                              </p>
                              <p className="mt-1 text-xs text-gray-300">
                                {new Date(audit.changedAt).toLocaleString()} •{" "}
                                {audit.changedByEmail ||
                                  audit.changedByUserId ||
                                  "Unknown admin"}
                              </p>
                              {audit.changedFields && (
                                <p className="mt-1 text-xs text-gray-300">
                                  Fields: {audit.changedFields}
                                </p>
                              )}
                              <p className="mt-1 text-xs text-gray-300">
                                Tier: {lifecycle.retentionTier} • Status:{" "}
                                {lifecycle.archiveStatus} • Archive eligible:{" "}
                                {lifecycle.archiveEligibleAt
                                  ? lifecycle.archiveEligibleAt.toLocaleDateString()
                                  : "N/A"}{" "}
                                • Retain until:{" "}
                                {lifecycle.retentionUntil
                                  ? lifecycle.retentionUntil.toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                            {canRevert && (
                              <button
                                type="button"
                                onClick={() => handleEventRevert(audit.id)}
                                disabled={isMutating || !canDeleteOrRevert}
                                title={
                                  canDeleteOrRevert
                                    ? undefined
                                    : "Elevated admin role required for revert actions."
                                }
                                className="rounded-md border border-white/25 px-3 py-1.5 text-xs font-semibold text-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Revert
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeEntity === "Stat" && (
            <section className="space-y-6">
              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <h2 className="text-lg font-bold">Create Stat</h2>
                <form
                  onSubmit={handleStatCreate}
                  className="mt-3 grid gap-3 md:grid-cols-2"
                >
                  <input
                    value={statCreateForm.statValue}
                    onChange={(e) =>
                      setStatCreateForm((prev) => ({
                        ...prev,
                        statValue: e.target.value,
                      }))
                    }
                    placeholder="Stat value *"
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <input
                    value={statCreateForm.statLabel}
                    onChange={(e) =>
                      setStatCreateForm((prev) => ({
                        ...prev,
                        statLabel: e.target.value,
                      }))
                    }
                    placeholder="Stat label *"
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <input
                    value={statCreateForm.imageSrc}
                    onChange={(e) =>
                      setStatCreateForm((prev) => ({
                        ...prev,
                        imageSrc: e.target.value,
                      }))
                    }
                    placeholder="Image URL *"
                    className="md:col-span-2 rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={isMutating}
                      className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950 disabled:opacity-60"
                    >
                      {statMutationPending ? "Saving..." : "Create Stat"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <h2 className="text-lg font-bold">Existing Stats</h2>
                {statsPending ? (
                  <p className="mt-3 text-sm text-gray-300">Loading stats...</p>
                ) : stats.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-300">No stats found.</p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {stats.map((stat) => {
                      const isEditing = statEditId === stat.id;
                      return (
                        <div
                          key={stat.id}
                          className="rounded-lg border border-white/15 bg-slate-900/40 p-3"
                        >
                          {isEditing ? (
                            <div className="grid gap-2 md:grid-cols-2">
                              <input
                                value={statEditForm.statValue}
                                onChange={(e) =>
                                  setStatEditForm((prev) => ({
                                    ...prev,
                                    statValue: e.target.value,
                                  }))
                                }
                                className="rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <input
                                value={statEditForm.statLabel}
                                onChange={(e) =>
                                  setStatEditForm((prev) => ({
                                    ...prev,
                                    statLabel: e.target.value,
                                  }))
                                }
                                className="rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <input
                                value={statEditForm.imageSrc}
                                onChange={(e) =>
                                  setStatEditForm((prev) => ({
                                    ...prev,
                                    imageSrc: e.target.value,
                                  }))
                                }
                                className="md:col-span-2 rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <div className="md:col-span-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStatEditSave(stat.id)}
                                  disabled={isMutating}
                                  className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStatEditId(null)}
                                  disabled={isMutating}
                                  className="rounded-md border border-white/20 px-3 py-2 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-amber-300">
                                  {stat.statValue}
                                </p>
                                <p className="text-xs text-gray-300">
                                  {stat.statLabel}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStatEditStart(stat.id)}
                                  disabled={isMutating}
                                  className="rounded-md border border-white/20 px-3 py-1.5 text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatDelete(stat.id)}
                                  disabled={isMutating || !canDeleteOrRevert}
                                  title={
                                    canDeleteOrRevert
                                      ? undefined
                                      : "Elevated admin role required for delete actions."
                                  }
                                  className="rounded-md bg-red-500/80 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeEntity === "ImpactFeature" && (
            <section className="space-y-6">
              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <h2 className="text-lg font-bold">Create Impact Feature</h2>
                <form onSubmit={handleImpactCreate} className="mt-3 grid gap-3">
                  <input
                    value={impactCreateForm.title}
                    onChange={(e) =>
                      setImpactCreateForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Title *"
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <textarea
                    value={impactCreateForm.description}
                    onChange={(e) =>
                      setImpactCreateForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Description *"
                    className="min-h-[96px] rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <input
                    value={impactCreateForm.imageSrc}
                    onChange={(e) =>
                      setImpactCreateForm((prev) => ({
                        ...prev,
                        imageSrc: e.target.value,
                      }))
                    }
                    placeholder="Image URL *"
                    className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2 text-sm"
                    disabled={isMutating}
                  />
                  <div>
                    <button
                      type="submit"
                      disabled={isMutating}
                      className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950 disabled:opacity-60"
                    >
                      {impactMutationPending
                        ? "Saving..."
                        : "Create Impact Feature"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <h2 className="text-lg font-bold">Existing Impact Features</h2>
                {impactPending ? (
                  <p className="mt-3 text-sm text-gray-300">
                    Loading impact features...
                  </p>
                ) : impactFeatures.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-300">
                    No impact features found.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {impactFeatures.map((feature) => {
                      const isEditing = impactEditId === feature.id;

                      return (
                        <div
                          key={feature.id}
                          className="rounded-lg border border-white/15 bg-slate-900/40 p-3"
                        >
                          {isEditing ? (
                            <div className="grid gap-2">
                              <input
                                value={impactEditForm.title}
                                onChange={(e) =>
                                  setImpactEditForm((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
                                className="rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <textarea
                                value={impactEditForm.description}
                                onChange={(e) =>
                                  setImpactEditForm((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                  }))
                                }
                                className="min-h-[88px] rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <input
                                value={impactEditForm.imageSrc}
                                onChange={(e) =>
                                  setImpactEditForm((prev) => ({
                                    ...prev,
                                    imageSrc: e.target.value,
                                  }))
                                }
                                className="rounded-md border border-white/20 bg-slate-900/70 px-3 py-2 text-sm"
                                disabled={isMutating}
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleImpactEditSave(feature.id)
                                  }
                                  disabled={isMutating}
                                  className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setImpactEditId(null)}
                                  disabled={isMutating}
                                  className="rounded-md border border-white/20 px-3 py-2 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-amber-300">
                                  {feature.title}
                                </p>
                                <p className="line-clamp-2 text-xs text-gray-300">
                                  {feature.description}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleImpactEditStart(feature.id)
                                  }
                                  disabled={isMutating}
                                  className="rounded-md border border-white/20 px-3 py-1.5 text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleImpactDelete(feature.id)}
                                  disabled={isMutating || !canDeleteOrRevert}
                                  title={
                                    canDeleteOrRevert
                                      ? undefined
                                      : "Elevated admin role required for delete actions."
                                  }
                                  className="rounded-md bg-red-500/80 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};
