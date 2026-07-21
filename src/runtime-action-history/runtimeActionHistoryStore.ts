import type {
    RuntimeActionHistoryEntry,
    RuntimeActionHistoryState,
    RuntimeActionTransition,
} from "./runtimeActionHistoryTypes";

/**
 * Runtime Action History localStorage schema version.
 *
 * 저장 구조가 변경되면 key 또는 state version을 함께 올려야 합니다.
 */
const RUNTIME_ACTION_HISTORY_STORAGE_KEY =
  "innermirror.runtime-action-history.v1";

const RUNTIME_ACTION_HISTORY_VERSION =
  1 as const;

/**
 * 프로젝트별로 보존할 최대 History Entry 수입니다.
 *
 * 무제한 기록으로 localStorage가 커지는 것을 방지합니다.
 */
const MAX_HISTORY_ENTRIES_PER_PROJECT =
  50;

/**
 * 전체 보존 Transition 수입니다.
 */
const MAX_HISTORY_TRANSITIONS =
  100;

/**
 * Runtime Action History가 없는 경우 사용하는
 * 안전한 초기 상태입니다.
 */
export function createEmptyRuntimeActionHistory():
  RuntimeActionHistoryState {
  return {
    version:
      RUNTIME_ACTION_HISTORY_VERSION,

    entries:
      [],

    transitions:
      [],

    activeEntryId:
      null,
  };
}

/**
 * localStorage에서 Runtime Action History를 읽습니다.
 *
 * 다음 경우에는 빈 History를 반환합니다.
 *
 * - 브라우저 환경이 아님
 * - 저장값이 없음
 * - JSON 파싱 실패
 * - schema version 불일치
 * - 필수 배열 구조가 잘못됨
 *
 * History 복구 실패가 Landing 전체 실행을 막아서는 안 됩니다.
 */
export function loadRuntimeActionHistory():
  RuntimeActionHistoryState {
  if (!canUseLocalStorage()) {
    return createEmptyRuntimeActionHistory();
  }

  try {
    const rawHistory =
      window.localStorage.getItem(
        RUNTIME_ACTION_HISTORY_STORAGE_KEY
      );

    if (rawHistory === null) {
      return createEmptyRuntimeActionHistory();
    }

    const parsedHistory: unknown =
      JSON.parse(rawHistory);

    if (
      !isRuntimeActionHistoryState(
        parsedHistory
      )
    ) {
      return createEmptyRuntimeActionHistory();
    }

    return normalizeRuntimeActionHistory(
      parsedHistory
    );
  } catch {
    return createEmptyRuntimeActionHistory();
  }
}

/**
 * Runtime Action History를 localStorage에 저장합니다.
 *
 * 저장 전에:
 *
 * - 프로젝트별 Entry 수를 제한하고
 * - Transition 수를 제한하고
 * - activeEntryId 유효성을 점검합니다.
 *
 * localStorage 저장 실패는 호출자에게 예외를 던지지 않습니다.
 */
export function saveRuntimeActionHistory(
  state:
    RuntimeActionHistoryState
): RuntimeActionHistoryState {
  const normalizedState =
    normalizeRuntimeActionHistory(
      state
    );

  if (!canUseLocalStorage()) {
    return normalizedState;
  }

  try {
    window.localStorage.setItem(
      RUNTIME_ACTION_HISTORY_STORAGE_KEY,
      JSON.stringify(
        normalizedState
      )
    );
  } catch {
    /*
     * localStorage가 차단되었거나 quota를 초과해도
     * Recommendation과 Landing 실행은 계속되어야 합니다.
     */
  }

  return normalizedState;
}

/**
 * 저장된 Runtime Action History 전체를 삭제합니다.
 *
 * GitHub 로그아웃만으로는 호출하지 않습니다.
 * 사용자의 명시적인 Clear History 동작에 연결합니다.
 */
export function clearRuntimeActionHistory():
  RuntimeActionHistoryState {
  const emptyState =
    createEmptyRuntimeActionHistory();

  if (!canUseLocalStorage()) {
    return emptyState;
  }

  try {
    window.localStorage.removeItem(
      RUNTIME_ACTION_HISTORY_STORAGE_KEY
    );
  } catch {
    /*
     * 삭제 실패도 앱 전체 오류로 전파하지 않습니다.
     */
  }

  return emptyState;
}

/**
 * 특정 프로젝트의 Runtime Action History만 삭제합니다.
 *
 * 다른 프로젝트의 기록은 유지합니다.
 */
export function clearRuntimeActionHistoryForProject(
  state:
    RuntimeActionHistoryState,
  projectId:
    string
): RuntimeActionHistoryState {
  const normalizedProjectId =
    projectId.trim();

  if (
    normalizedProjectId.length === 0
  ) {
    return saveRuntimeActionHistory(
      state
    );
  }

  const removedEntryIds =
    new Set(
      state.entries
        .filter(
          (entry) =>
            entry.projectId ===
            normalizedProjectId
        )
        .map(
          (entry) =>
            entry.id
        )
    );

  const nextEntries =
    state.entries.filter(
      (entry) =>
        entry.projectId !==
        normalizedProjectId
    );

  const nextTransitions =
    state.transitions.filter(
      (transition) =>
        transition.projectId !==
          normalizedProjectId &&
        !removedEntryIds.has(
          transition.toEntryId
        ) &&
        (
          transition.fromEntryId ===
            null ||
          !removedEntryIds.has(
            transition.fromEntryId
          )
        )
    );

  const nextActiveEntryId =
    state.activeEntryId !== null &&
    removedEntryIds.has(
      state.activeEntryId
    )
      ? null
      : state.activeEntryId;

  return saveRuntimeActionHistory({
    version:
      RUNTIME_ACTION_HISTORY_VERSION,

    entries:
      nextEntries,

    transitions:
      nextTransitions,

    activeEntryId:
      nextActiveEntryId,
  });
}

/**
 * 현재 프로젝트의 History Entry만 시간순으로 반환합니다.
 *
 * 기본값은 오래된 기록 → 최신 기록 순입니다.
 */
export function getRuntimeActionHistoryEntriesForProject(
  state:
    RuntimeActionHistoryState,
  projectId:
    string
): RuntimeActionHistoryEntry[] {
  const normalizedProjectId =
    projectId.trim();

  if (
    normalizedProjectId.length === 0
  ) {
    return [];
  }

  return state.entries
    .filter(
      (entry) =>
        entry.projectId ===
        normalizedProjectId
    )
    .sort(
      compareEntriesByFirstObservedAt
    );
}

/**
 * 현재 프로젝트의 Transition만 시간순으로 반환합니다.
 */
export function getRuntimeActionTransitionsForProject(
  state:
    RuntimeActionHistoryState,
  projectId:
    string
): RuntimeActionTransition[] {
  const normalizedProjectId =
    projectId.trim();

  if (
    normalizedProjectId.length === 0
  ) {
    return [];
  }

  return state.transitions
    .filter(
      (transition) =>
        transition.projectId ===
        normalizedProjectId
    )
    .sort(
      compareTransitionsByOccurredAt
    );
}

/**
 * 현재 active History Entry를 반환합니다.
 *
 * activeEntryId가 없거나 Entry가 삭제된 경우 null을 반환합니다.
 */
export function getActiveRuntimeActionHistoryEntry(
  state:
    RuntimeActionHistoryState
): RuntimeActionHistoryEntry | null {
  if (
    state.activeEntryId === null
  ) {
    return null;
  }

  return (
    state.entries.find(
      (entry) =>
        entry.id ===
        state.activeEntryId
    ) ??
    null
  );
}

/**
 * 저장 전에 History를 정규화합니다.
 */
function normalizeRuntimeActionHistory(
  state:
    RuntimeActionHistoryState
): RuntimeActionHistoryState {
  const normalizedEntries =
    limitEntriesPerProject(
      state.entries
        .filter(
          isRuntimeActionHistoryEntry
        )
        .sort(
          compareEntriesByFirstObservedAt
        )
    );

  const validEntryIds =
    new Set(
      normalizedEntries.map(
        (entry) =>
          entry.id
      )
    );

  const normalizedTransitions =
    state.transitions
      .filter(
        isRuntimeActionTransition
      )
      .filter(
        (transition) =>
          validEntryIds.has(
            transition.toEntryId
          )
      )
      .filter(
        (transition) =>
          transition.fromEntryId ===
            null ||
          validEntryIds.has(
            transition.fromEntryId
          )
      )
      .sort(
        compareTransitionsByOccurredAt
      )
      .slice(
        -MAX_HISTORY_TRANSITIONS
      );

  const normalizedActiveEntryId =
    state.activeEntryId !== null &&
    validEntryIds.has(
      state.activeEntryId
    )
      ? state.activeEntryId
      : null;

  return {
    version:
      RUNTIME_ACTION_HISTORY_VERSION,

    entries:
      normalizedEntries,

    transitions:
      normalizedTransitions,

    activeEntryId:
      normalizedActiveEntryId,
  };
}

/**
 * 프로젝트마다 최신 Entry만 최대 개수까지 유지합니다.
 */
function limitEntriesPerProject(
  entries:
    RuntimeActionHistoryEntry[]
): RuntimeActionHistoryEntry[] {
  const entriesByProject =
    new Map<
      string,
      RuntimeActionHistoryEntry[]
    >();

  for (const entry of entries) {
    const projectEntries =
      entriesByProject.get(
        entry.projectId
      ) ??
      [];

    projectEntries.push(
      entry
    );

    entriesByProject.set(
      entry.projectId,
      projectEntries
    );
  }

  const limitedEntries:
    RuntimeActionHistoryEntry[] =
      [];

  for (
    const projectEntries
    of entriesByProject.values()
  ) {
    const sortedEntries =
      [...projectEntries].sort(
        compareEntriesByFirstObservedAt
      );

    limitedEntries.push(
      ...sortedEntries.slice(
        -MAX_HISTORY_ENTRIES_PER_PROJECT
      )
    );
  }

  return limitedEntries.sort(
    compareEntriesByFirstObservedAt
  );
}

/**
 * Runtime Action History 최상위 구조를 점검합니다.
 *
 * 모든 중첩 필드를 엄격하게 검증하기보다,
 * 저장소 복구에 필요한 핵심 구조를 확인합니다.
 */
function isRuntimeActionHistoryState(
  value:
    unknown
): value is RuntimeActionHistoryState {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.version ===
      RUNTIME_ACTION_HISTORY_VERSION &&
    Array.isArray(
      value.entries
    ) &&
    Array.isArray(
      value.transitions
    ) &&
    (
      value.activeEntryId ===
        null ||
      typeof value.activeEntryId ===
        "string"
    )
  );
}

/**
 * 손상된 Entry가 History 전체를 깨뜨리지 않도록
 * 핵심 필드만 확인합니다.
 */
function isRuntimeActionHistoryEntry(
  value:
    unknown
): value is RuntimeActionHistoryEntry {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id ===
      "string" &&
    typeof value.projectId ===
      "string" &&
    typeof value.fingerprint ===
      "string" &&
    typeof value.status ===
      "string" &&
    typeof value.firstObservedAt ===
      "string" &&
    typeof value.lastObservedAt ===
      "string" &&
    typeof value.observationCount ===
      "number" &&
    typeof value.consecutiveRepeatCount ===
      "number" &&
    Array.isArray(
      value.navigationEvents
    ) &&
    Array.isArray(
      value.completionEvidence
    ) &&
    (
      value.completedAt ===
        null ||
      typeof value.completedAt ===
        "string"
    ) &&
    (
      value.supersededAt ===
        null ||
      typeof value.supersededAt ===
        "string"
    ) &&
    (
      value.replacedByEntryId ===
        null ||
      typeof value.replacedByEntryId ===
        "string"
    ) &&
    isRecord(
      value.action
    )
  );
}

/**
 * 손상된 Transition을 제거하기 위한 최소 검증입니다.
 */
function isRuntimeActionTransition(
  value:
    unknown
): value is RuntimeActionTransition {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id ===
      "string" &&
    typeof value.projectId ===
      "string" &&
    (
      value.fromEntryId ===
        null ||
      typeof value.fromEntryId ===
        "string"
    ) &&
    typeof value.toEntryId ===
      "string" &&
    typeof value.type ===
      "string" &&
    typeof value.occurredAt ===
      "string"
  );
}

function compareEntriesByFirstObservedAt(
  left:
    RuntimeActionHistoryEntry,
  right:
    RuntimeActionHistoryEntry
): number {
  return (
    left.firstObservedAt.localeCompare(
      right.firstObservedAt
    )
  );
}

function compareTransitionsByOccurredAt(
  left:
    RuntimeActionTransition,
  right:
    RuntimeActionTransition
): number {
  return (
    left.occurredAt.localeCompare(
      right.occurredAt
    )
  );
}

function canUseLocalStorage():
  boolean {
  return (
    typeof window !==
      "undefined" &&
    window.localStorage !==
      undefined
  );
}

function isRecord(
  value:
    unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value
    )
  );
}