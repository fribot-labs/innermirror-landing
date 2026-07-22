import type {
    RuntimeNextActionTarget,
} from "../runtime-next-action/runtimeNextActionTypes";

import {
    evaluateRuntimeActionCompletion,
} from "./runtimeActionCompletionRules";

import type {
    RuntimeActionCompletionEvidence,
    RuntimeActionHistoryEntry,
    RuntimeActionHistorySnapshot,
    RuntimeActionHistoryState,
    RuntimeActionNavigationEvent,
    RuntimeActionObservationSnapshot,
    RuntimeActionResolutionState,
    RuntimeActionTransition,
    RuntimeActionTransitionType,
} from "./runtimeActionHistoryTypes";

/* ------------------------------------------------------------------ */
/* Public Parameters */
/* ------------------------------------------------------------------ */

export type ObserveRuntimeActionParams = {
  state:
    RuntimeActionHistoryState;

  projectId:
    string;

  fingerprint:
    string;

  action:
    RuntimeActionHistorySnapshot;

  observation:
    RuntimeActionObservationSnapshot;

  /**
   * React rerender와 StrictMode에서 동일한 관찰이
   * 중복 처리되지 않도록 사용하는 안정적인 key입니다.
   */
  observationKey:
    string;

  occurredAt:
    string;
};

export type RecordRuntimeActionNavigationParams = {
  state:
    RuntimeActionHistoryState;

  projectId:
    string;

  fingerprint:
    string;

  target:
    RuntimeNextActionTarget;

  occurredAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Recommendation Observation */
/* ------------------------------------------------------------------ */

/**
 * 현재 RuntimeNextAction을 History에 반영합니다.
 *
 * 처리 순서:
 *
 * 1. 현재 프로젝트의 active Entry 조회
 * 2. 동일 fingerprint이면 기존 Entry 갱신
 * 3. 완료 조건이 충족되면 completed 처리
 * 4. 다른 fingerprint이면 이전 Entry 종료
 * 5. 신규 Entry 생성
 * 6. Recommendation transition 생성
 */
export function observeRuntimeAction({
  state,
  projectId,
  fingerprint,
  action,
  observation,
  observationKey,
  occurredAt,
}: ObserveRuntimeActionParams):
  RuntimeActionHistoryState {
  const normalizedProjectId =
    projectId.trim();

  const normalizedFingerprint =
    fingerprint.trim();

  if (
    normalizedProjectId.length === 0 ||
    normalizedFingerprint.length === 0
  ) {
    return state;
  }

  const activeEntry =
    findActiveEntryForProject(
      state,
      normalizedProjectId
    );

  /**
   * 현재 active Recommendation과 동일한 Recommendation이
   * 다시 관찰된 경우입니다.
   */
  if (
    activeEntry !== null &&
    activeEntry.fingerprint ===
      normalizedFingerprint
  ) {
    return observeExistingRuntimeAction({
      state,
      activeEntry,
      observation,
      observationKey,
      occurredAt,
    });
  }

  /**
   * 현재 active Recommendation과 다른 Recommendation이
   * 등장했으므로 이전 Entry를 먼저 종료합니다.
   */
  const previousResult =
    finalizePreviousRuntimeAction({
      state,
      activeEntry,
      observation,
      occurredAt,
    });

  const previousEntry =
    previousResult.previousEntry;

  const priorMatchingEntries =
    previousResult.state.entries.filter(
      (entry) =>
        entry.projectId ===
          normalizedProjectId &&
        entry.fingerprint ===
          normalizedFingerprint
    );

  const resolutionState =
    resolveRecommendationRepetitionState(
      priorMatchingEntries.length
    );

  const newEntry =
    createRuntimeActionHistoryEntry({
      projectId:
        normalizedProjectId,

      fingerprint:
        normalizedFingerprint,

      action,

      observation,

      observationKey,

      resolutionState,

      previousMatchingEntryCount:
        priorMatchingEntries.length,

      occurredAt,
    });

  const transitionType =
    resolveNewTransitionType({
      previousEntry,
      resolutionState,
    });

  const newTransition =
    createRuntimeActionTransition({
      projectId:
        normalizedProjectId,

      fromEntryId:
        previousEntry?.id ??
        null,

      toEntryId:
        newEntry.id,

      type:
        transitionType,

      occurredAt,
    });

  return {
    ...previousResult.state,

    entries: [
      ...previousResult.state.entries,
      newEntry,
    ],

    transitions: [
      ...previousResult.state.transitions,
      newTransition,
    ],

    activeEntryId:
      newEntry.id,
  };
}

/* ------------------------------------------------------------------ */
/* Existing Recommendation Observation */
/* ------------------------------------------------------------------ */

type ObserveExistingRuntimeActionParams = {
  state:
    RuntimeActionHistoryState;

  activeEntry:
    RuntimeActionHistoryEntry;

  observation:
    RuntimeActionObservationSnapshot;

  observationKey:
    string;

  occurredAt:
    string;
};

function observeExistingRuntimeAction({
  state,
  activeEntry,
  observation,
  observationKey,
  occurredAt,
}: ObserveExistingRuntimeActionParams):
  RuntimeActionHistoryState {
  /**
   * 동일 Recommendation과 동일 프로젝트 상태가
   * 이미 처리되었다면 아무것도 변경하지 않습니다.
   */
  if (
    activeEntry.lastObservationKey ===
    observationKey
  ) {
    return state;
  }

  const completionEvidence =
    evaluateRuntimeActionCompletion({
      entry:
        activeEntry,

      current:
        observation,

      occurredAt,
    });

  /**
   * Recommendation 완료 Evidence가 발견된 경우입니다.
   */
  if (
    completionEvidence !== null
  ) {
    return completeRuntimeActionEntry({
      state,
      entry:
        activeEntry,

      observation,

      observationKey,

      completionEvidence,

      occurredAt,
    });
  }

  /**
   * Recommendation은 그대로이며 프로젝트 상태만
   * 의미 있게 변경된 경우 마지막 관찰 상태를 갱신합니다.
   */
  return {
    ...state,

    entries:
      state.entries.map(
        (entry) =>
          entry.id ===
          activeEntry.id
            ? {
                ...entry,

                lastObservedAt:
                  occurredAt,

                observationCount:
                  entry.observationCount +
                  1,

                lastObservedState:
                  cloneObservationSnapshot(
                    observation
                  ),

                lastObservationKey:
                  observationKey,
              }
            : entry
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Previous Recommendation Finalization */
/* ------------------------------------------------------------------ */

type FinalizePreviousRuntimeActionParams = {
  state:
    RuntimeActionHistoryState;

  activeEntry:
    RuntimeActionHistoryEntry | null;

  observation:
    RuntimeActionObservationSnapshot;

  occurredAt:
    string;
};

type FinalizePreviousRuntimeActionResult = {
  state:
    RuntimeActionHistoryState;

  previousEntry:
    RuntimeActionHistoryEntry | null;
};

function finalizePreviousRuntimeAction({
  state,
  activeEntry,
  observation,
  occurredAt,
}: FinalizePreviousRuntimeActionParams):
  FinalizePreviousRuntimeActionResult {
  /**
   * active Entry가 없다면 현재 프로젝트의 가장 최근 Entry를
   * transition predecessor로 사용합니다.
   *
   * 이전 Recommendation이 바로 completed 처리된 뒤
   * 다음 Recommendation이 등장하는 경우를 연결하기 위함입니다.
   */
  if (activeEntry === null) {
    const latestEntry =
      findLatestEntryForCurrentObservation(
        state,
        observation
      );

    return {
      state,
      previousEntry:
        latestEntry,
    };
  }

  const completionEvidence =
    evaluateRuntimeActionCompletion({
      entry:
        activeEntry,

      current:
        observation,

      occurredAt,
    });

  if (
    completionEvidence !== null
  ) {
    const completedState =
      completeRuntimeActionEntry({
        state,
        entry:
          activeEntry,

        observation,

        observationKey:
          activeEntry.lastObservationKey,

        completionEvidence,

        occurredAt,
      });

    const completedEntry =
      completedState.entries.find(
        (entry) =>
          entry.id ===
          activeEntry.id
      ) ??
      null;

    return {
      state:
        completedState,

      previousEntry:
        completedEntry,
    };
  }

  const supersededEntry:
    RuntimeActionHistoryEntry = {
    ...activeEntry,

    status:
      "superseded",

    lastObservedAt:
      occurredAt,

    lastObservedState:
      cloneObservationSnapshot(
        observation
      ),

    supersededAt:
      occurredAt,
  };

  return {
    state: {
      ...state,

      entries:
        state.entries.map(
          (entry) =>
            entry.id ===
            activeEntry.id
              ? supersededEntry
              : entry
        ),

      activeEntryId:
        null,
    },

    previousEntry:
      supersededEntry,
  };
}

/* ------------------------------------------------------------------ */
/* Navigation Recording */
/* ------------------------------------------------------------------ */

/**
 * Recommendation navigation 버튼 클릭을 기록합니다.
 *
 * navigation은 learner가 추천 화면으로 이동했다는 뜻이며,
 * Recommendation이 완료되었다는 의미는 아닙니다.
 */
export function recordRuntimeActionNavigation({
  state,
  projectId,
  fingerprint,
  target,
  occurredAt,
}: RecordRuntimeActionNavigationParams):
  RuntimeActionHistoryState {
  const normalizedProjectId =
    projectId.trim();

  const normalizedFingerprint =
    fingerprint.trim();

  if (
    normalizedProjectId.length === 0 ||
    normalizedFingerprint.length === 0
  ) {
    return state;
  }

  const activeEntry =
    findActiveEntryForProject(
      state,
      normalizedProjectId
    );

  if (
    activeEntry === null ||
    activeEntry.fingerprint !==
      normalizedFingerprint
  ) {
    return state;
  }

  if (
    activeEntry.status ===
      "completed" ||
    activeEntry.status ===
      "superseded"
  ) {
    return state;
  }

  const navigationEvent:
    RuntimeActionNavigationEvent = {
    id:
      createRuntimeActionHistoryId(
        "navigation"
      ),

    target,

    occurredAt,
  };

  return {
    ...state,

    entries:
      state.entries.map(
        (entry) =>
          entry.id ===
          activeEntry.id
            ? {
                ...entry,

                status:
                  "navigated",

                lastObservedAt:
                  occurredAt,

                navigationEvents: [
                  ...entry.navigationEvents,
                  navigationEvent,
                ],
              }
            : entry
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Completion */
/* ------------------------------------------------------------------ */

type CompleteRuntimeActionEntryParams = {
  state:
    RuntimeActionHistoryState;

  entry:
    RuntimeActionHistoryEntry;

  observation:
    RuntimeActionObservationSnapshot;

  observationKey:
    string;

  completionEvidence:
    RuntimeActionCompletionEvidence;

  occurredAt:
    string;
};

function completeRuntimeActionEntry({
  state,
  entry,
  observation,
  observationKey,
  completionEvidence,
  occurredAt,
}: CompleteRuntimeActionEntryParams):
  RuntimeActionHistoryState {
  if (
    entry.status ===
    "completed"
  ) {
    return state;
  }

  const hasMatchingCompletionEvidence =
    entry.completionEvidence.some(
      (existingEvidence) =>
        existingEvidence.type ===
          completionEvidence.type &&
        existingEvidence.occurredAt ===
          completionEvidence.occurredAt
    );

  const nextCompletionEvidence =
    hasMatchingCompletionEvidence
      ? entry.completionEvidence
      : [
          ...entry.completionEvidence,
          completionEvidence,
        ];

  return {
    ...state,

    entries:
      state.entries.map(
        (currentEntry) =>
          currentEntry.id ===
          entry.id
            ? {
                ...currentEntry,

                status:
                  "completed",

                lastObservedAt:
                  occurredAt,

                observationCount:
                  currentEntry
                    .observationCount +
                  1,

                lastObservedState:
                  cloneObservationSnapshot(
                    observation
                  ),

                lastObservationKey:
                  observationKey,

                completionEvidence:
                  nextCompletionEvidence,

                completedAt:
                  occurredAt,
              }
            : currentEntry
      ),

    activeEntryId:
      state.activeEntryId ===
      entry.id
        ? null
        : state.activeEntryId,
  };
}

/* ------------------------------------------------------------------ */
/* Entry Creation */
/* ------------------------------------------------------------------ */

type CreateRuntimeActionHistoryEntryParams = {
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

  resolutionState:
    RuntimeActionResolutionState;

  previousMatchingEntryCount:
    number;

  occurredAt:
    string;
};

function createRuntimeActionHistoryEntry({
  projectId,
  fingerprint,
  action,
  observation,
  observationKey,
  resolutionState,
  previousMatchingEntryCount,
  occurredAt,
}: CreateRuntimeActionHistoryEntryParams):
  RuntimeActionHistoryEntry {
  return {
    id:
      createRuntimeActionHistoryId(
        "entry"
      ),

    projectId,

    fingerprint,

    action: {
      ...action,
    },

    status:
      "active",

    resolutionState,

    firstObservedAt:
      occurredAt,

    lastObservedAt:
      occurredAt,

    observationCount:
      1,

    /**
     * 같은 fingerprint의 과거 occurrence 수입니다.
     *
     * 최초 등장:
     * 0
     *
     * 첫 재등장:
     * 1
     *
     * 두 번째 이상 재등장:
     * 2+
     */
    consecutiveRepeatCount:
      previousMatchingEntryCount,

    navigationEvents:
      [],

    completionEvidence:
      [],

    completedAt:
      null,

    supersededAt:
      null,

    replacedByEntryId:
      null,

    startedFrom:
      cloneObservationSnapshot(
        observation
      ),

    lastObservedState:
      cloneObservationSnapshot(
        observation
      ),

    lastObservationKey:
      observationKey,
  };
}

/* ------------------------------------------------------------------ */
/* Transition Creation */
/* ------------------------------------------------------------------ */

type CreateRuntimeActionTransitionParams = {
  projectId:
    string;

  fromEntryId:
    string | null;

  toEntryId:
    string;

  type:
    RuntimeActionTransitionType;

  occurredAt:
    string;
};

function createRuntimeActionTransition({
  projectId,
  fromEntryId,
  toEntryId,
  type,
  occurredAt,
}: CreateRuntimeActionTransitionParams):
  RuntimeActionTransition {
  return {
    id:
      createRuntimeActionHistoryId(
        "transition"
      ),

    projectId,

    fromEntryId,

    toEntryId,

    type,

    occurredAt,
  };
}

/* ------------------------------------------------------------------ */
/* Transition Type Resolution */
/* ------------------------------------------------------------------ */

type ResolveNewTransitionTypeParams = {
  previousEntry:
    RuntimeActionHistoryEntry | null;

  resolutionState:
    RuntimeActionResolutionState;
};

function resolveNewTransitionType({
  previousEntry,
  resolutionState,
}: ResolveNewTransitionTypeParams):
  RuntimeActionTransitionType {
  if (previousEntry === null) {
    return "initial";
  }

  if (
    resolutionState === "repeated" ||
    resolutionState === "unresolved"
  ) {
    return "repeated";
  }

  if (
    previousEntry.status ===
    "completed"
  ) {
    return "completed-and-advanced";
  }

  if (
    previousEntry.status ===
    "superseded"
  ) {
    return "superseded";
  }

  return "changed";
}

/* ------------------------------------------------------------------ */
/* Repetition Resolution */
/* ------------------------------------------------------------------ */

function resolveRecommendationRepetitionState(
  priorMatchingEntryCount:
    number
): RuntimeActionResolutionState {
  if (
    priorMatchingEntryCount >= 2
  ) {
    return "unresolved";
  }

  if (
    priorMatchingEntryCount === 1
  ) {
    return "repeated";
  }

  return "new";
}

/* ------------------------------------------------------------------ */
/* Entry Lookup */
/* ------------------------------------------------------------------ */

function findActiveEntryForProject(
  state:
    RuntimeActionHistoryState,
  projectId:
    string
): RuntimeActionHistoryEntry | null {
  if (
    state.activeEntryId === null
  ) {
    return null;
  }

  const activeEntry =
    state.entries.find(
      (entry) =>
        entry.id ===
          state.activeEntryId &&
        entry.projectId ===
          projectId &&
        (
          entry.status ===
            "active" ||
          entry.status ===
            "navigated"
        )
    );

  return activeEntry ??
    null;
}

/**
 * activeEntryId가 이미 null인 경우,
 * 현재 Observation과 같은 프로젝트의 최신 Entry를 찾습니다.
 *
 * Observation snapshot에는 projectId가 없을 수 있으므로
 * 이 함수는 전체 Entry 중 가장 최근 Entry를 반환하지 않고,
 * caller가 project별 predecessor를 전달하는 구조가 더 정확합니다.
 *
 * 현재 MVP에서는 active Entry가 완료된 직후 다음 관찰이 이어지는
 * 일반 흐름을 위해 최신 completed 또는 superseded Entry를 사용합니다.
 */
function findLatestEntryForCurrentObservation(
  state:
    RuntimeActionHistoryState,
  _observation:
    RuntimeActionObservationSnapshot
): RuntimeActionHistoryEntry | null {
  if (
    state.entries.length === 0
  ) {
    return null;
  }

  return (
    [...state.entries]
      .sort(
        compareHistoryEntryRecency
      )[0] ??
    null
  );
}

function compareHistoryEntryRecency(
  left:
    RuntimeActionHistoryEntry,
  right:
    RuntimeActionHistoryEntry
): number {
  return (
    right.lastObservedAt.localeCompare(
      left.lastObservedAt
    )
  );
}

/* ------------------------------------------------------------------ */
/* Observation Snapshot */
/* ------------------------------------------------------------------ */

function cloneObservationSnapshot(
  observation:
    RuntimeActionObservationSnapshot
): RuntimeActionObservationSnapshot {
  return {
    reflectionCount:
      normalizeCount(
        observation.reflectionCount
      ),

    githubSnapshotRevision:
      normalizeNullableText(
        observation
          .githubSnapshotRevision
      ),

    currentFocus:
      normalizeNullableText(
        observation.currentFocus
      ),

    connectedEventCount:
      normalizeCount(
        observation.connectedEventCount
      ),

    runtimeAnalysisRevision:
      normalizeNullableText(
        observation
          .runtimeAnalysisRevision
      ),
  };
}

function normalizeCount(
  value:
    number
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(value)
  );
}

function normalizeNullableText(
  value:
    string | null
): string | null {
  if (value === null) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

/* ------------------------------------------------------------------ */
/* Stable Local IDs */
/* ------------------------------------------------------------------ */

function createRuntimeActionHistoryId(
  prefix:
    "entry" |
    "transition" |
    "navigation"
): string {
  const randomId =
    createRandomIdPart();

  const timestamp =
    Date.now().toString(36);

  return [
    prefix,
    timestamp,
    randomId,
  ].join("-");
}

function createRandomIdPart():
  string {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return (
      crypto
        .randomUUID()
        .replace(/-/g, "")
        .slice(
          0,
          12
        )
    );
  }

  return (
    Math
      .random()
      .toString(36)
      .slice(2, 14)
  );
}