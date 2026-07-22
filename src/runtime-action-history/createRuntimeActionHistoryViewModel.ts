import type {
    RuntimeActionCompletionEvidence,
    RuntimeActionHistoryEntry,
    RuntimeActionHistoryStatus,
    RuntimeActionResolutionState,
    RuntimeActionTransition,
    RuntimeActionTransitionType,
} from "./runtimeActionHistoryTypes";

export type RuntimeActionHistoryStatusTone =
  | "current"
  | "completed"
  | "replaced"
  | "attention";

export type RuntimeActionHistoryEntryViewModel = {
  id: string;

  title: string;
  description: string;

  statusLabel: string;

  statusTone:
    RuntimeActionHistoryStatusTone;

  resolutionLabel:
    string | null;

  whySummary:
    string | null;

  evidenceSummary:
    string | null;

  signalCount:
    number;

  navigationCount:
    number;

  firstObservedLabel:
    string;

  lastObservedLabel:
    string;

  completedLabel:
    string | null;

  supersededLabel:
    string | null;

  completionEvidence: {
    typeLabel: string;
    description: string;
    occurredAtLabel: string;
  }[];

  isCurrent:
    boolean;
};

export type RuntimeActionTransitionViewModel = {
  id: string;

  label: string;

  occurredAtLabel: string;
};

export type RuntimeActionHistoryViewModel = {
  entries:
    RuntimeActionHistoryEntryViewModel[];

  transitions:
    RuntimeActionTransitionViewModel[];

  activeEntryId:
    string | null;

  totalCount:
    number;

  completedCount:
    number;

  replacedCount:
    number;

  repeatedCount:
    number;

  unresolvedCount:
    number;

  navigationCount:
    number;
};

export type CreateRuntimeActionHistoryViewModelParams = {
  entries:
    RuntimeActionHistoryEntry[];

  transitions:
    RuntimeActionTransition[];

  activeEntryId:
    string | null;
};

export function createRuntimeActionHistoryViewModel({
  entries,
  transitions,
  activeEntryId,
}: CreateRuntimeActionHistoryViewModelParams):
  RuntimeActionHistoryViewModel {
  const sortedEntries =
    sortRuntimeActionHistoryEntries({
      entries,
      activeEntryId,
    });

  const entryViewModels =
    sortedEntries.map(
      (entry) =>
        createRuntimeActionHistoryEntryViewModel({
          entry,
          activeEntryId,
        })
    );

  const transitionViewModels =
    [...transitions]
      .sort(
        (
          left,
          right
        ) =>
          right.occurredAt.localeCompare(
            left.occurredAt
          )
      )
      .map(
        createRuntimeActionTransitionViewModel
      );

  return {
    entries:
      entryViewModels,

    transitions:
      transitionViewModels,

    activeEntryId,

    totalCount:
      entryViewModels.length,

    completedCount:
      entries.filter(
        (entry) =>
          entry.status ===
          "completed"
      ).length,

    replacedCount:
      entries.filter(
        (entry) =>
          entry.status ===
          "superseded"
      ).length,

    repeatedCount:
      entries.filter(
        (entry) =>
          entry.resolutionState ===
          "repeated"
      ).length,

    unresolvedCount:
      entries.filter(
        (entry) =>
          entry.resolutionState ===
          "unresolved"
      ).length,

    navigationCount:
      entries.reduce(
        (
          total,
          entry
        ) =>
          total +
          entry.navigationEvents.length,
        0
      ),
  };
}

type SortRuntimeActionHistoryEntriesParams = {
  entries:
    RuntimeActionHistoryEntry[];

  activeEntryId:
    string | null;
};

function sortRuntimeActionHistoryEntries({
  entries,
  activeEntryId,
}: SortRuntimeActionHistoryEntriesParams):
  RuntimeActionHistoryEntry[] {
  return [...entries].sort(
    (
      left,
      right
    ) => {
      const leftIsActive =
        left.id ===
        activeEntryId;

      const rightIsActive =
        right.id ===
        activeEntryId;

      if (
        leftIsActive &&
        !rightIsActive
      ) {
        return -1;
      }

      if (
        !leftIsActive &&
        rightIsActive
      ) {
        return 1;
      }

      return (
        right.lastObservedAt.localeCompare(
          left.lastObservedAt
        )
      );
    }
  );
}

type CreateRuntimeActionHistoryEntryViewModelParams = {
  entry:
    RuntimeActionHistoryEntry;

  activeEntryId:
    string | null;
};

function createRuntimeActionHistoryEntryViewModel({
  entry,
  activeEntryId,
}: CreateRuntimeActionHistoryEntryViewModelParams):
  RuntimeActionHistoryEntryViewModel {
  const isCurrent =
    entry.id ===
      activeEntryId &&
    (
      entry.status ===
        "active" ||
      entry.status ===
        "navigated"
    );

  return {
    id:
      entry.id,

    title:
      normalizeDisplayText(
        entry.action.title,
        "Untitled recommendation"
      ),

    description:
      normalizeDisplayText(
        entry.action.description,
        "No additional recommendation detail is available."
      ),

    statusLabel:
      resolveStatusLabel({
        status:
          entry.status,
        isCurrent,
      }),

    statusTone:
      resolveStatusTone({
        status:
          entry.status,
        resolutionState:
          entry.resolutionState,
        isCurrent,
      }),

    resolutionLabel:
      resolveResolutionLabel(
        entry.resolutionState
      ),

    whySummary:
      normalizeOptionalDisplayText(
        entry.action.whySummary
      ),

    evidenceSummary:
      normalizeOptionalDisplayText(
        entry.action.evidenceSummary
      ),

    signalCount:
      normalizeCount(
        entry.action.signalCount
      ),

    navigationCount:
      entry.navigationEvents.length,

    firstObservedLabel:
      formatRuntimeActionHistoryTimestamp(
        entry.firstObservedAt
      ),

    lastObservedLabel:
      formatRuntimeActionHistoryTimestamp(
        entry.lastObservedAt
      ),

    completedLabel:
      entry.completedAt === null
        ? null
        : formatRuntimeActionHistoryTimestamp(
            entry.completedAt
          ),

    supersededLabel:
      entry.supersededAt === null
        ? null
        : formatRuntimeActionHistoryTimestamp(
            entry.supersededAt
          ),

    completionEvidence:
      entry.completionEvidence.map(
        createRuntimeActionCompletionEvidenceViewModel
      ),

    isCurrent,
  };
}

type ResolveStatusLabelParams = {
  status:
    RuntimeActionHistoryStatus;

  isCurrent:
    boolean;
};

function resolveStatusLabel({
  status,
  isCurrent,
}: ResolveStatusLabelParams):
  string {
  if (isCurrent) {
    return "Current";
  }

  switch (status) {
    case "active":
    case "navigated":
      return "In progress";

    case "completed":
      return "Completed";

    case "superseded":
      return "Replaced";
  }
}

type ResolveStatusToneParams = {
  status:
    RuntimeActionHistoryStatus;

  resolutionState:
    RuntimeActionResolutionState;

  isCurrent:
    boolean;
};

function resolveStatusTone({
  status,
  resolutionState,
  isCurrent,
}: ResolveStatusToneParams):
  RuntimeActionHistoryStatusTone {
  if (
    resolutionState ===
    "unresolved"
  ) {
    return "attention";
  }

  if (isCurrent) {
    return "current";
  }

  switch (status) {
    case "completed":
      return "completed";

    case "superseded":
      return "replaced";

    case "active":
    case "navigated":
      return "current";
  }
}

function resolveResolutionLabel(
  resolutionState:
    RuntimeActionResolutionState
): string | null {
  switch (resolutionState) {
    case "new":
      return null;

    case "repeated":
      return "Repeated";

    case "unresolved":
      return "Needs attention";
  }
}

function createRuntimeActionCompletionEvidenceViewModel(
  evidence:
    RuntimeActionCompletionEvidence
): RuntimeActionHistoryEntryViewModel["completionEvidence"][number] {
  return {
    typeLabel:
      resolveCompletionEvidenceTypeLabel(
        evidence.type
      ),

    description:
      normalizeDisplayText(
        evidence.description,
        "Runtime observed a project-state change that completed this recommendation."
      ),

    occurredAtLabel:
      formatRuntimeActionHistoryTimestamp(
        evidence.occurredAt
      ),
  };
}

function resolveCompletionEvidenceTypeLabel(
  type:
    RuntimeActionCompletionEvidence["type"]
): string {
  switch (type) {
    case "github-snapshot-created":
      return "GitHub activity captured";

    case "github-snapshot-updated":
      return "GitHub evidence refreshed";

    case "reflection-recorded":
      return "Reflection added";

    case "current-focus-updated":
      return "Project focus updated";

    case "runtime-analysis-completed":
      return "Runtime analysis completed";

    case "connected-event-added":
      return "Project activity recorded";

    case "fallback-resolved":
      return "Missing context restored";
  }
}

function createRuntimeActionTransitionViewModel(
  transition:
    RuntimeActionTransition
): RuntimeActionTransitionViewModel {
  return {
    id:
      transition.id,

    label:
      resolveTransitionLabel(
        transition.type
      ),

    occurredAtLabel:
      formatRuntimeActionHistoryTimestamp(
        transition.occurredAt
      ),
  };
}

function resolveTransitionLabel(
  type:
    RuntimeActionTransitionType
): string {
  switch (type) {
    case "initial":
      return "Recommendation path started";

    case "changed":
      return "Recommendation changed";

    case "repeated":
      return "A previous recommendation returned";

    case "completed-and-advanced":
      return "Recommendation completed and Runtime advanced";

    case "superseded":
      return "Recommendation was replaced";
  }
}

function formatRuntimeActionHistoryTimestamp(
  value:
    string
): string {
  const timestamp =
    Date.parse(
      value
    );

  if (
    Number.isNaN(
      timestamp
    )
  ) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  ).format(
    new Date(
      timestamp
    )
  );
}

function normalizeCount(
  value:
    number
): number {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      value
    )
  );
}

function normalizeDisplayText(
  value:
    string,
  fallback:
    string
): string {
  const normalized =
    value
      .trim()
      .replace(
        /\s+/g,
        " "
      );

  return normalized.length > 0
    ? normalized
    : fallback;
}

function normalizeOptionalDisplayText(
  value:
    string | null
): string | null {
  if (value === null) {
    return null;
  }

  const normalized =
    value
      .trim()
      .replace(
        /\s+/g,
        " "
      );

  return normalized.length > 0
    ? normalized
    : null;
}