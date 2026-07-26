import type {
    RuntimeActionCompletionEvidence,
    RuntimeActionHistoryEntry,
    RuntimeActionHistorySnapshot,
    RuntimeActionHistoryState,
    RuntimeActionObservationSnapshot,
    RuntimeActionResolutionState,
    RuntimeActionTransition,
    RuntimeActionTransitionType,
} from "../runtime-action-history/runtimeActionHistoryTypes";

import type {
    RuntimeRecommendationLifecycleHistory,
    RuntimeRecommendationLifecycleRecord,
} from "./runtimeRecommendationLifecycleTypes";

/* ------------------------------------------------------------------ */
/* Parameters */
/* ------------------------------------------------------------------ */

/**
 * Lifecycle Recommendation을 Action History Snapshot으로 변환합니다.
 *
 * RuntimeNextAction의 실제 Presentation 구조는 이 Adapter가 직접
 * 해석하지 않고 기존 Snapshot 생성 로직을 재사용하도록 위임합니다.
 */
export type CreateRuntimeActionSnapshotFromLifecycle = (
  lifecycle: RuntimeRecommendationLifecycleRecord,
) => RuntimeActionHistorySnapshot;

/**
 * Recommendation의 동일성을 판단하기 위한 fingerprint를 생성합니다.
 */
export type CreateRuntimeActionFingerprintFromLifecycle = (
  lifecycle: RuntimeRecommendationLifecycleRecord,
) => string;

/**
 * 동일 Recommendation과 동일 프로젝트 상태가 중복 관찰되는 것을
 * 방지하기 위한 observation key를 생성합니다.
 */
export type CreateRuntimeActionObservationKeyFromLifecycle = (
  lifecycle: RuntimeRecommendationLifecycleRecord,
  observation: RuntimeActionObservationSnapshot,
) => string;

/**
 * Action History Entry ID를 생성합니다.
 *
 * 기본적으로 lifecycle.id를 그대로 사용하는 것이 권장됩니다.
 */
export type CreateRuntimeActionHistoryEntryIdFromLifecycle = (
  lifecycle: RuntimeRecommendationLifecycleRecord,
) => string;

/**
 * Action History Transition ID를 생성합니다.
 */
export type CreateRuntimeActionTransitionIdFromLifecycle = (
  fromEntryId: string | null,
  toEntryId: string,
  transitionType: RuntimeActionTransitionType,
  occurredAt: string,
) => string;

export type CreateRuntimeActionHistoryFromLifecycleParams = {
  /**
   * Recommendation 상태의 원본입니다.
   */
  lifecycleHistory:
    RuntimeRecommendationLifecycleHistory;

  /**
   * 기존 Action History입니다.
   *
   * Navigation, Evidence, 관찰 횟수 등 Lifecycle 외부에서
   * 생성된 정보를 보존하기 위해 필요합니다.
   */
  currentHistory:
    RuntimeActionHistoryState;

  /**
   * Action History가 속한 프로젝트 ID입니다.
   */
  projectId:
    string;

  /**
   * 현재 프로젝트 관찰 상태입니다.
   */
  observation:
    RuntimeActionObservationSnapshot;

  /**
   * 이번 동기화가 수행되는 시각입니다.
   */
  observedAt:
    string;

  /**
   * Lifecycle Recommendation을 Action Snapshot으로 변환합니다.
   */
  createActionSnapshot:
    CreateRuntimeActionSnapshotFromLifecycle;

  /**
   * Recommendation fingerprint를 생성합니다.
   */
  createFingerprint:
    CreateRuntimeActionFingerprintFromLifecycle;

  /**
   * 중복 관찰 방지 키를 생성합니다.
   */
  createObservationKey:
    CreateRuntimeActionObservationKeyFromLifecycle;

  /**
   * Entry ID 생성기입니다.
   *
   * 생략하면 lifecycle.id를 사용합니다.
   */
  createEntryId?:
    CreateRuntimeActionHistoryEntryIdFromLifecycle;

  /**
   * Transition ID 생성기입니다.
   *
   * 생략하면 결정론적인 기본 ID를 사용합니다.
   */
  createTransitionId?:
    CreateRuntimeActionTransitionIdFromLifecycle;

  /**
   * Lifecycle completed 상태지만 기존 완료 Evidence가 없을 때
   * fallback-resolved Evidence를 추가할지 결정합니다.
   *
   * 기본값은 true입니다.
   */
  addFallbackCompletionEvidence?:
    boolean;
};

/* ------------------------------------------------------------------ */
/* Public API */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Lifecycle History를 기존 Runtime Action History와
 * 동기화합니다.
 *
 * 이 함수의 원칙:
 *
 * - Lifecycle History는 Recommendation 상태의 Source of Truth입니다.
 * - Action History의 Navigation과 Completion Evidence는 보존합니다.
 * - created 상태는 아직 사용자에게 제시되지 않았으므로 제외합니다.
 * - active, completed, superseded 상태만 Action History에 반영합니다.
 * - archived 상태는 기존 Entry를 삭제하거나 덮어쓰지 않습니다.
 * - 기존 입력 객체와 배열을 변경하지 않습니다.
 */
export function createRuntimeActionHistoryFromLifecycle(
  params: CreateRuntimeActionHistoryFromLifecycleParams,
): RuntimeActionHistoryState {
  validateParams(params);

  const {
    lifecycleHistory,
    currentHistory,
    projectId,
    observation,
    observedAt,
    createActionSnapshot,
    createFingerprint,
    createObservationKey,
    createEntryId = defaultCreateEntryId,
    createTransitionId =
      defaultCreateTransitionId,
    addFallbackCompletionEvidence = true,
  } = params;

  const entriesById =
    new Map<string, RuntimeActionHistoryEntry>(
      currentHistory.entries.map(
        (entry) => [
          entry.id,
          cloneEntry(entry),
        ],
      ),
    );

  const entryIdByLifecycleId =
    new Map<string, string>();

  /*
   * Entry ID 생성 결과를 먼저 확정합니다.
   *
   * superseded Record의 nextLifecycleId를 replacedByEntryId로
   * 연결할 때 후속 Entry ID를 찾을 수 있어야 하기 때문입니다.
   */
  for (const lifecycle of lifecycleHistory.records) {
    if (!isVisibleLifecycle(lifecycle)) {
      continue;
    }

    const entryId =
      createEntryId(lifecycle);

    assertNonEmptyString(
      entryId,
      "createEntryId result",
    );

    entryIdByLifecycleId.set(
      lifecycle.id,
      entryId,
    );
  }

  /*
   * Lifecycle Record를 Action History Entry로 생성하거나 동기화합니다.
   */
  for (const lifecycle of lifecycleHistory.records) {
    if (!isVisibleLifecycle(lifecycle)) {
      continue;
    }

    const entryId =
      getRequiredMapValue(
        entryIdByLifecycleId,
        lifecycle.id,
        "entryIdByLifecycleId",
      );

    const existingEntry =
      entriesById.get(entryId) ?? null;

    const fingerprint =
      createFingerprint(lifecycle);

    const action =
      createActionSnapshot(lifecycle);

    const observationKey =
      createObservationKey(
        lifecycle,
        observation,
      );

    assertNonEmptyString(
      fingerprint,
      "createFingerprint result",
    );

    assertNonEmptyString(
      observationKey,
      "createObservationKey result",
    );

    const nextEntry =
      existingEntry === null
        ? createEntry({
            lifecycle,
            entryId,
            projectId,
            fingerprint,
            action,
            observation,
            observationKey,
            observedAt,
            entryIdByLifecycleId,
            addFallbackCompletionEvidence,
          })
        : synchronizeEntry({
            existingEntry,
            lifecycle,
            projectId,
            fingerprint,
            action,
            observation,
            observationKey,
            observedAt,
            entryIdByLifecycleId,
            addFallbackCompletionEvidence,
          });

    entriesById.set(
      entryId,
      nextEntry,
    );
  }

  const entries =
    preserveEntryOrder({
      currentEntries:
        currentHistory.entries,
      lifecycleRecords:
        lifecycleHistory.records,
      entriesById,
      entryIdByLifecycleId,
    });

  const activeEntryId =
    resolveActiveEntryId({
      lifecycleHistory,
      entryIdByLifecycleId,
      entries,
    });

  const transitions =
    synchronizeTransitions({
      lifecycleHistory,
      entries,
      existingTransitions:
        currentHistory.transitions,
      entryIdByLifecycleId,
      createTransitionId,
    });

  return {
    version: 1,
    entries,
    transitions,
    activeEntryId,
  };
}

/* ------------------------------------------------------------------ */
/* Entry Creation */
/* ------------------------------------------------------------------ */

type CreateEntryParams = {
  lifecycle:
    RuntimeRecommendationLifecycleRecord;

  entryId:
    string;

  projectId:
    string;

  fingerprint:
    string;

  action:
    RuntimeActionHistorySnapshot;

  observation:
    RuntimeActionObservationSnapshot;

  observationKey:
    string;

  observedAt:
    string;

  entryIdByLifecycleId:
    ReadonlyMap<string, string>;

  addFallbackCompletionEvidence:
    boolean;
};

function createEntry(
  params: CreateEntryParams,
): RuntimeActionHistoryEntry {
  const {
    lifecycle,
    entryId,
    projectId,
    fingerprint,
    action,
    observation,
    observationKey,
    observedAt,
    entryIdByLifecycleId,
    addFallbackCompletionEvidence,
  } = params;

  const status =
    mapLifecycleStateToActionStatus(
      lifecycle,
      null,
    );

  const completionEvidence =
    createInitialCompletionEvidence({
      lifecycle,
      addFallbackCompletionEvidence,
    });

  return {
    id: entryId,
    projectId,
    fingerprint,
    action,
    status,
    resolutionState:
      "new",
    firstObservedAt:
      lifecycle.activatedAt ??
      lifecycle.createdAt,
    lastObservedAt:
      observedAt,
    observationCount:
      1,
    consecutiveRepeatCount:
      0,
    navigationEvents:
      [],
    completionEvidence,
    completedAt:
      lifecycle.state === "completed"
        ? lifecycle.resolvedAt
        : null,
    supersededAt:
      lifecycle.state === "superseded"
        ? lifecycle.resolvedAt
        : null,
    replacedByEntryId:
      resolveReplacedByEntryId(
        lifecycle,
        entryIdByLifecycleId,
        null,
      ),
    startedFrom:
      cloneObservation(observation),
    lastObservedState:
      cloneObservation(observation),
    lastObservationKey:
      observationKey,
  };
}

/* ------------------------------------------------------------------ */
/* Entry Synchronization */
/* ------------------------------------------------------------------ */

type SynchronizeEntryParams = {
  existingEntry:
    RuntimeActionHistoryEntry;

  lifecycle:
    RuntimeRecommendationLifecycleRecord;

  projectId:
    string;

  fingerprint:
    string;

  action:
    RuntimeActionHistorySnapshot;

  observation:
    RuntimeActionObservationSnapshot;

  observationKey:
    string;

  observedAt:
    string;

  entryIdByLifecycleId:
    ReadonlyMap<string, string>;

  addFallbackCompletionEvidence:
    boolean;
};

function synchronizeEntry(
  params: SynchronizeEntryParams,
): RuntimeActionHistoryEntry {
  const {
    existingEntry,
    lifecycle,
    projectId,
    fingerprint,
    action,
    observation,
    observationKey,
    observedAt,
    entryIdByLifecycleId,
    addFallbackCompletionEvidence,
  } = params;

  if (
    existingEntry.projectId !== projectId
  ) {
    throw new Error(
      `Action History Entry "${existingEntry.id}" belongs to ` +
        `project "${existingEntry.projectId}", not "${projectId}".`,
    );
  }

  const isDuplicateObservation =
    existingEntry.lastObservationKey ===
    observationKey;

  const observationCount =
    isDuplicateObservation
      ? existingEntry.observationCount
      : existingEntry.observationCount + 1;

  const lifecycleStatus =
    mapLifecycleStateToActionStatus(
      lifecycle,
      existingEntry.status,
    );

  const resolutionState =
    resolveEntryResolutionState({
      existingEntry,
      fingerprint,
      isDuplicateObservation,
    });

  const consecutiveRepeatCount =
    resolveConsecutiveRepeatCount({
      existingEntry,
      resolutionState,
      isDuplicateObservation,
    });

  const completionEvidence =
    synchronizeCompletionEvidence({
      existingEvidence:
        existingEntry.completionEvidence,
      lifecycle,
      addFallbackCompletionEvidence,
    });

  return {
    ...existingEntry,
    projectId,
    fingerprint,
    action,
    status:
      lifecycleStatus,
    resolutionState,
    lastObservedAt:
      isDuplicateObservation
        ? existingEntry.lastObservedAt
        : observedAt,
    observationCount,
    consecutiveRepeatCount,
    navigationEvents:
      existingEntry.navigationEvents.map(
        (event) => ({ ...event }),
      ),
    completionEvidence,
    completedAt:
      lifecycle.state === "completed"
        ? lifecycle.resolvedAt ??
          existingEntry.completedAt
        : existingEntry.completedAt,
    supersededAt:
      lifecycle.state === "superseded"
        ? lifecycle.resolvedAt ??
          existingEntry.supersededAt
        : existingEntry.supersededAt,
    replacedByEntryId:
      resolveReplacedByEntryId(
        lifecycle,
        entryIdByLifecycleId,
        existingEntry.replacedByEntryId,
      ),
    startedFrom:
      cloneObservation(
        existingEntry.startedFrom,
      ),
    lastObservedState:
      isDuplicateObservation
        ? cloneObservation(
            existingEntry.lastObservedState,
          )
        : cloneObservation(observation),
    lastObservationKey:
      isDuplicateObservation
        ? existingEntry.lastObservationKey
        : observationKey,
  };
}

/* ------------------------------------------------------------------ */
/* State Mapping */
/* ------------------------------------------------------------------ */

function isVisibleLifecycle(
  lifecycle:
    RuntimeRecommendationLifecycleRecord,
): boolean {
  return (
    lifecycle.state === "active" ||
    lifecycle.state === "completed" ||
    lifecycle.state === "superseded"
  );
}

/**
 * Lifecycle archived 상태는 새 Action Entry를 만들지 않습니다.
 *
 * 이미 Action History에 존재하는 Entry도 archived 상태로
 * 강제로 덮어쓰지 않고 마지막 사용자 의미 상태를 보존합니다.
 */
function mapLifecycleStateToActionStatus(
  lifecycle:
    RuntimeRecommendationLifecycleRecord,
  existingStatus:
    RuntimeActionHistoryEntry["status"] | null,
): RuntimeActionHistoryEntry["status"] {
  if (lifecycle.state === "completed") {
    return "completed";
  }

  if (lifecycle.state === "superseded") {
    return "superseded";
  }

  if (lifecycle.state === "active") {
    /*
     * Navigation은 Recommendation 완료가 아닌 사용자 행동 기록입니다.
     * Lifecycle이 active인 동안 기존 navigated 상태를 보존합니다.
     */
    if (existingStatus === "navigated") {
      return "navigated";
    }

    return "active";
  }

  if (existingStatus !== null) {
    return existingStatus;
  }

  throw new Error(
    `Lifecycle state "${lifecycle.state}" cannot be mapped ` +
      "to a new Runtime Action History Entry.",
  );
}

/* ------------------------------------------------------------------ */
/* Resolution State */
/* ------------------------------------------------------------------ */

type ResolveEntryResolutionStateParams = {
  existingEntry:
    RuntimeActionHistoryEntry;

  fingerprint:
    string;

  isDuplicateObservation:
    boolean;
};

function resolveEntryResolutionState(
  params: ResolveEntryResolutionStateParams,
): RuntimeActionResolutionState {
  const {
    existingEntry,
    fingerprint,
    isDuplicateObservation,
  } = params;

  if (
    existingEntry.fingerprint ===
    fingerprint
  ) {
    if (
      existingEntry.observationCount > 0 &&
      !isDuplicateObservation
    ) {
      return "repeated";
    }

    return existingEntry.resolutionState;
  }

  return "new";
}

type ResolveConsecutiveRepeatCountParams = {
  existingEntry:
    RuntimeActionHistoryEntry;

  resolutionState:
    RuntimeActionResolutionState;

  isDuplicateObservation:
    boolean;
};

function resolveConsecutiveRepeatCount(
  params: ResolveConsecutiveRepeatCountParams,
): number {
  const {
    existingEntry,
    resolutionState,
    isDuplicateObservation,
  } = params;

  if (isDuplicateObservation) {
    return existingEntry.consecutiveRepeatCount;
  }

  if (resolutionState === "repeated") {
    return (
      existingEntry.consecutiveRepeatCount +
      1
    );
  }

  return 0;
}

/* ------------------------------------------------------------------ */
/* Completion Evidence */
/* ------------------------------------------------------------------ */

type CreateInitialCompletionEvidenceParams = {
  lifecycle:
    RuntimeRecommendationLifecycleRecord;

  addFallbackCompletionEvidence:
    boolean;
};

function createInitialCompletionEvidence(
  params: CreateInitialCompletionEvidenceParams,
): RuntimeActionCompletionEvidence[] {
  const {
    lifecycle,
    addFallbackCompletionEvidence,
  } = params;

  if (
    lifecycle.state !== "completed" ||
    !addFallbackCompletionEvidence
  ) {
    return [];
  }

  return [
    createFallbackCompletionEvidence(
      lifecycle,
    ),
  ];
}

type SynchronizeCompletionEvidenceParams = {
  existingEvidence:
    RuntimeActionCompletionEvidence[];

  lifecycle:
    RuntimeRecommendationLifecycleRecord;

  addFallbackCompletionEvidence:
    boolean;
};

function synchronizeCompletionEvidence(
  params: SynchronizeCompletionEvidenceParams,
): RuntimeActionCompletionEvidence[] {
  const {
    existingEvidence,
    lifecycle,
    addFallbackCompletionEvidence,
  } = params;

  const clonedEvidence =
    existingEvidence.map(
      (evidence) => ({ ...evidence }),
    );

  if (
    lifecycle.state !== "completed" ||
    !addFallbackCompletionEvidence ||
    clonedEvidence.length > 0
  ) {
    return clonedEvidence;
  }

  return [
    createFallbackCompletionEvidence(
      lifecycle,
    ),
  ];
}

function createFallbackCompletionEvidence(
  lifecycle:
    RuntimeRecommendationLifecycleRecord,
): RuntimeActionCompletionEvidence {
  return {
    type:
      "fallback-resolved",
    description:
      "The recommendation lifecycle was marked as completed.",
    occurredAt:
      lifecycle.resolvedAt ??
      lifecycle.updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Replacement Link */
/* ------------------------------------------------------------------ */

function resolveReplacedByEntryId(
  lifecycle:
    RuntimeRecommendationLifecycleRecord,
  entryIdByLifecycleId:
    ReadonlyMap<string, string>,
  existingValue:
    string | null,
): string | null {
  if (
    lifecycle.state !== "superseded"
  ) {
    return existingValue;
  }

  if (
    lifecycle.nextLifecycleId === null
  ) {
    return existingValue;
  }

  return (
    entryIdByLifecycleId.get(
      lifecycle.nextLifecycleId,
    ) ??
    existingValue
  );
}

/* ------------------------------------------------------------------ */
/* Active Entry */
/* ------------------------------------------------------------------ */

type ResolveActiveEntryIdParams = {
  lifecycleHistory:
    RuntimeRecommendationLifecycleHistory;

  entryIdByLifecycleId:
    ReadonlyMap<string, string>;

  entries:
    RuntimeActionHistoryEntry[];
};

function resolveActiveEntryId(
  params: ResolveActiveEntryIdParams,
): string | null {
  const {
    lifecycleHistory,
    entryIdByLifecycleId,
    entries,
  } = params;

  if (
    lifecycleHistory.activeLifecycleId ===
    null
  ) {
    return null;
  }

  const entryId =
    entryIdByLifecycleId.get(
      lifecycleHistory.activeLifecycleId,
    );

  if (entryId === undefined) {
    throw new Error(
      `Active lifecycle "${lifecycleHistory.activeLifecycleId}" ` +
        "does not have a visible Action History Entry.",
    );
  }

  const entry =
    entries.find(
      (candidate) =>
        candidate.id === entryId,
    );

  if (entry === undefined) {
    throw new Error(
      `Active Action History Entry "${entryId}" does not exist.`,
    );
  }

  if (
    entry.status !== "active" &&
    entry.status !== "navigated"
  ) {
    throw new Error(
      `Active Action History Entry "${entryId}" has invalid ` +
        `status "${entry.status}".`,
    );
  }

  return entryId;
}

/* ------------------------------------------------------------------ */
/* Entry Ordering */
/* ------------------------------------------------------------------ */

type PreserveEntryOrderParams = {
  currentEntries:
    RuntimeActionHistoryEntry[];

  lifecycleRecords:
    RuntimeRecommendationLifecycleRecord[];

  entriesById:
    ReadonlyMap<
      string,
      RuntimeActionHistoryEntry
    >;

  entryIdByLifecycleId:
    ReadonlyMap<string, string>;
};

function preserveEntryOrder(
  params: PreserveEntryOrderParams,
): RuntimeActionHistoryEntry[] {
  const {
    currentEntries,
    lifecycleRecords,
    entriesById,
    entryIdByLifecycleId,
  } = params;

  const result:
    RuntimeActionHistoryEntry[] = [];

  const addedEntryIds =
    new Set<string>();

  /*
   * 기존 Action History의 순서를 먼저 유지합니다.
   */
  for (const existingEntry of currentEntries) {
    const synchronizedEntry =
      entriesById.get(existingEntry.id);

    if (synchronizedEntry === undefined) {
      result.push(
        cloneEntry(existingEntry),
      );

      addedEntryIds.add(
        existingEntry.id,
      );

      continue;
    }

    result.push(
      cloneEntry(synchronizedEntry),
    );

    addedEntryIds.add(
      synchronizedEntry.id,
    );
  }

  /*
   * 새 Lifecycle Entry는 Lifecycle 생성 순서대로 뒤에 추가합니다.
   */
  for (const lifecycle of lifecycleRecords) {
    const entryId =
      entryIdByLifecycleId.get(
        lifecycle.id,
      );

    if (
      entryId === undefined ||
      addedEntryIds.has(entryId)
    ) {
      continue;
    }

    const entry =
      entriesById.get(entryId);

    if (entry === undefined) {
      continue;
    }

    result.push(
      cloneEntry(entry),
    );

    addedEntryIds.add(entryId);
  }

  return result;
}

/* ------------------------------------------------------------------ */
/* Transition Synchronization */
/* ------------------------------------------------------------------ */

type SynchronizeTransitionsParams = {
  lifecycleHistory:
    RuntimeRecommendationLifecycleHistory;

  entries:
    RuntimeActionHistoryEntry[];

  existingTransitions:
    RuntimeActionTransition[];

  entryIdByLifecycleId:
    ReadonlyMap<string, string>;

  createTransitionId:
    CreateRuntimeActionTransitionIdFromLifecycle;
};

function synchronizeTransitions(
  params: SynchronizeTransitionsParams,
): RuntimeActionTransition[] {
  const {
    lifecycleHistory,
    entries,
    existingTransitions,
    entryIdByLifecycleId,
    createTransitionId,
  } = params;

  const transitions =
    existingTransitions.map(
      (transition) => ({
        ...transition,
      }),
    );

  const transitionKeys =
    new Set(
      transitions.map(
        createTransitionIdentityKey,
      ),
    );

  const entryById =
    new Map(
      entries.map(
        (entry) => [
          entry.id,
          entry,
        ],
      ),
    );

  const visibleLifecycles =
    lifecycleHistory.records.filter(
      isVisibleLifecycle,
    );

  for (
    let index = 0;
    index < visibleLifecycles.length;
    index += 1
  ) {
    const lifecycle =
      visibleLifecycles[index];

    const toEntryId =
      getRequiredMapValue(
        entryIdByLifecycleId,
        lifecycle.id,
        "entryIdByLifecycleId",
      );

    const previousLifecycle =
      resolvePreviousVisibleLifecycle({
        lifecycle,
        visibleLifecycles,
        currentIndex: index,
      });

    const fromEntryId =
      previousLifecycle === null
        ? null
        : entryIdByLifecycleId.get(
            previousLifecycle.id,
          ) ?? null;

    const fromEntry =
      fromEntryId === null
        ? null
        : entryById.get(fromEntryId) ??
          null;

    const toEntry =
      entryById.get(toEntryId);

    if (toEntry === undefined) {
      throw new Error(
        `Action History Entry "${toEntryId}" does not exist.`,
      );
    }

    const type =
      resolveTransitionType(
        fromEntry,
        toEntry,
      );

    const occurredAt =
      lifecycle.activatedAt ??
      lifecycle.createdAt;

    const transition: RuntimeActionTransition = {
      id:
        createTransitionId(
          fromEntryId,
          toEntryId,
          type,
          occurredAt,
        ),
      projectId:
        toEntry.projectId,
      fromEntryId,
      toEntryId,
      type,
      occurredAt,
    };

    assertNonEmptyString(
      transition.id,
      "createTransitionId result",
    );

    const identityKey =
      createTransitionIdentityKey(
        transition,
      );

    if (
      transitionKeys.has(identityKey)
    ) {
      continue;
    }

    transitions.push(transition);
    transitionKeys.add(identityKey);
  }

  return transitions;
}

type ResolvePreviousVisibleLifecycleParams = {
  lifecycle:
    RuntimeRecommendationLifecycleRecord;

  visibleLifecycles:
    RuntimeRecommendationLifecycleRecord[];

  currentIndex:
    number;
};

function resolvePreviousVisibleLifecycle(
  params: ResolvePreviousVisibleLifecycleParams,
): RuntimeRecommendationLifecycleRecord | null {
  const {
    lifecycle,
    visibleLifecycles,
    currentIndex,
  } = params;

  if (
    lifecycle.previousLifecycleId !==
    null
  ) {
    return (
      visibleLifecycles.find(
        (candidate) =>
          candidate.id ===
          lifecycle.previousLifecycleId,
      ) ?? null
    );
  }

  if (currentIndex === 0) {
    return null;
  }

  return (
    visibleLifecycles[
      currentIndex - 1
    ] ?? null
  );
}

function resolveTransitionType(
  fromEntry:
    RuntimeActionHistoryEntry | null,
  toEntry:
    RuntimeActionHistoryEntry,
): RuntimeActionTransitionType {
  if (fromEntry === null) {
    return "initial";
  }

  if (
    fromEntry.fingerprint ===
    toEntry.fingerprint
  ) {
    return "repeated";
  }

  if (
    fromEntry.status === "completed"
  ) {
    return "completed-and-advanced";
  }

  if (
    fromEntry.status === "superseded"
  ) {
    return "superseded";
  }

  return "changed";
}

function createTransitionIdentityKey(
  transition:
    RuntimeActionTransition,
): string {
  return [
    transition.projectId,
    transition.fromEntryId ?? "null",
    transition.toEntryId,
    transition.type,
  ].join("::");
}

/* ------------------------------------------------------------------ */
/* Default Factories */
/* ------------------------------------------------------------------ */

function defaultCreateEntryId(
  lifecycle:
    RuntimeRecommendationLifecycleRecord,
): string {
  return lifecycle.id;
}

function defaultCreateTransitionId(
  fromEntryId:
    string | null,
  toEntryId:
    string,
  transitionType:
    RuntimeActionTransitionType,
  occurredAt:
    string,
): string {
  return [
    "runtime-action-transition",
    fromEntryId ?? "initial",
    toEntryId,
    transitionType,
    occurredAt,
  ].join(":");
}

/* ------------------------------------------------------------------ */
/* Clone Helpers */
/* ------------------------------------------------------------------ */

function cloneEntry(
  entry:
    RuntimeActionHistoryEntry,
): RuntimeActionHistoryEntry {
  return {
    ...entry,
    action: {
      ...entry.action,
    },
    navigationEvents:
      entry.navigationEvents.map(
        (event) => ({ ...event }),
      ),
    completionEvidence:
      entry.completionEvidence.map(
        (evidence) => ({
          ...evidence,
        }),
      ),
    startedFrom:
      cloneObservation(
        entry.startedFrom,
      ),
    lastObservedState:
      cloneObservation(
        entry.lastObservedState,
      ),
  };
}

function cloneObservation(
  observation:
    RuntimeActionObservationSnapshot,
): RuntimeActionObservationSnapshot {
  return {
    ...observation,
  };
}

/* ------------------------------------------------------------------ */
/* Validation */
/* ------------------------------------------------------------------ */

function validateParams(
  params:
    CreateRuntimeActionHistoryFromLifecycleParams,
): void {
  validateLifecycleHistory(
    params.lifecycleHistory,
  );

  validateActionHistory(
    params.currentHistory,
  );

  assertNonEmptyString(
    params.projectId,
    "projectId",
  );

  assertValidIsoTimestamp(
    params.observedAt,
    "observedAt",
  );

  if (
    params.observation === null ||
    typeof params.observation !== "object"
  ) {
    throw new Error(
      "observation must be a valid RuntimeActionObservationSnapshot.",
    );
  }

  if (
    typeof params.createActionSnapshot !==
    "function"
  ) {
    throw new Error(
      "createActionSnapshot must be a function.",
    );
  }

  if (
    typeof params.createFingerprint !==
    "function"
  ) {
    throw new Error(
      "createFingerprint must be a function.",
    );
  }

  if (
    typeof params.createObservationKey !==
    "function"
  ) {
    throw new Error(
      "createObservationKey must be a function.",
    );
  }

  if (
    params.createEntryId !== undefined &&
    typeof params.createEntryId !==
      "function"
  ) {
    throw new Error(
      "createEntryId must be a function.",
    );
  }

  if (
    params.createTransitionId !==
      undefined &&
    typeof params.createTransitionId !==
      "function"
  ) {
    throw new Error(
      "createTransitionId must be a function.",
    );
  }
}

function validateLifecycleHistory(
  history:
    RuntimeRecommendationLifecycleHistory,
): void {
  if (
    history === null ||
    typeof history !== "object"
  ) {
    throw new Error(
      "lifecycleHistory must be a valid " +
        "RuntimeRecommendationLifecycleHistory.",
    );
  }

  if (!Array.isArray(history.records)) {
    throw new Error(
      "lifecycleHistory.records must be an array.",
    );
  }

  const lifecycleIds =
    new Set<string>();

  let activeCount = 0;

  for (const lifecycle of history.records) {
    assertNonEmptyString(
      lifecycle.id,
      "lifecycle.id",
    );

    if (lifecycleIds.has(lifecycle.id)) {
      throw new Error(
        `Duplicate lifecycle ID "${lifecycle.id}".`,
      );
    }

    lifecycleIds.add(lifecycle.id);

    if (lifecycle.state === "active") {
      activeCount += 1;
    }
  }

  if (activeCount > 1) {
    throw new Error(
      "Lifecycle History contains multiple active records.",
    );
  }

  if (
    history.activeLifecycleId !== null
  ) {
    const activeRecord =
      history.records.find(
        (record) =>
          record.id ===
          history.activeLifecycleId,
      );

    if (activeRecord === undefined) {
      throw new Error(
        `activeLifecycleId "${history.activeLifecycleId}" ` +
          "does not exist.",
      );
    }

    if (
      activeRecord.state !== "active"
    ) {
      throw new Error(
        `activeLifecycleId "${history.activeLifecycleId}" ` +
          "does not reference an active lifecycle.",
      );
    }
  }
}

function validateActionHistory(
  history:
    RuntimeActionHistoryState,
): void {
  if (
    history === null ||
    typeof history !== "object"
  ) {
    throw new Error(
      "currentHistory must be a valid RuntimeActionHistoryState.",
    );
  }

  if (history.version !== 1) {
    throw new Error(
      `Unsupported Runtime Action History version "${history.version}".`,
    );
  }

  if (!Array.isArray(history.entries)) {
    throw new Error(
      "currentHistory.entries must be an array.",
    );
  }

  if (
    !Array.isArray(history.transitions)
  ) {
    throw new Error(
      "currentHistory.transitions must be an array.",
    );
  }

  const entryIds =
    new Set<string>();

  for (const entry of history.entries) {
    assertNonEmptyString(
      entry.id,
      "entry.id",
    );

    if (entryIds.has(entry.id)) {
      throw new Error(
        `Duplicate Action History Entry ID "${entry.id}".`,
      );
    }

    entryIds.add(entry.id);
  }

  if (
    history.activeEntryId !== null &&
    !entryIds.has(history.activeEntryId)
  ) {
    throw new Error(
      `activeEntryId "${history.activeEntryId}" does not exist.`,
    );
  }
}

function getRequiredMapValue<Key, Value>(
  map:
    ReadonlyMap<Key, Value>,
  key:
    Key,
  mapName:
    string,
): Value {
  const value =
    map.get(key);

  if (value === undefined) {
    throw new Error(
      `Required value was not found in ${mapName}.`,
    );
  }

  return value;
}

function assertNonEmptyString(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new Error(
      `${fieldName} must be a non-empty string.`,
    );
  }
}

function assertValidIsoTimestamp(
  value:
    string,
  fieldName:
    string,
): void {
  assertNonEmptyString(
    value,
    fieldName,
  );

  if (Number.isNaN(Date.parse(value))) {
    throw new Error(
      `${fieldName} must be a valid ISO 8601 timestamp.`,
    );
  }
}