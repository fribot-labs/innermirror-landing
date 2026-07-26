import type {
    AppendRuntimeRecommendationLifecycleParams,
    ReplaceRuntimeRecommendationLifecycleParams,
    RuntimeRecommendationLifecycleHistory,
    RuntimeRecommendationLifecycleRecord,
} from "./runtimeRecommendationLifecycleTypes";

/* ------------------------------------------------------------------ */
/* Create */
/* ------------------------------------------------------------------ */

/**
 * 비어있는 Recommendation Lifecycle History를 생성합니다.
 */
export function createRecommendationLifecycleHistory(
  id: string,
  createdAt: string,
): RuntimeRecommendationLifecycleHistory {
  assertNonEmptyString(id, "id");
  assertValidIsoTimestamp(createdAt, "createdAt");

  return {
    id,
    activeLifecycleId: null,
    records: [],
    createdAt,
    updatedAt: createdAt,
  };
}

/* ------------------------------------------------------------------ */
/* Append */
/* ------------------------------------------------------------------ */

/**
 * 새로운 Lifecycle Record를 History에 추가합니다.
 *
 * 규칙
 * - 기존 History는 변경하지 않습니다.
 * - Lifecycle ID는 중복될 수 없습니다.
 * - active 상태의 Recommendation은 하나만 존재합니다.
 */
export function appendRuntimeRecommendationLifecycle(
  params: AppendRuntimeRecommendationLifecycleParams,
): RuntimeRecommendationLifecycleHistory {
  const { history, lifecycle, updatedAt } = params;

  validateHistory(history);
  validateLifecycle(lifecycle);
  assertValidIsoTimestamp(updatedAt, "updatedAt");

  if (
    history.records.some(
      (record) => record.id === lifecycle.id,
    )
  ) {
    throw new Error(
      `Lifecycle "${lifecycle.id}" already exists.`,
    );
  }

  if (
    lifecycle.state === "active" &&
    history.activeLifecycleId !== null
  ) {
    throw new Error(
      "Only one active recommendation lifecycle is allowed.",
    );
  }

  return {
    ...history,
    activeLifecycleId:
      lifecycle.state === "active"
        ? lifecycle.id
        : history.activeLifecycleId,
    records: [
      ...history.records,
      lifecycle,
    ],
    updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Replace */
/* ------------------------------------------------------------------ */

/**
 * 기존 Lifecycle Record를 교체합니다.
 *
 * append-only Transition은 Lifecycle 내부에서 유지되고,
 * History는 동일 ID의 Record만 교체합니다.
 */
export function replaceRuntimeRecommendationLifecycle(
  params: ReplaceRuntimeRecommendationLifecycleParams,
): RuntimeRecommendationLifecycleHistory {
  const { history, lifecycle, updatedAt } = params;

  validateHistory(history);
  validateLifecycle(lifecycle);
  assertValidIsoTimestamp(updatedAt, "updatedAt");

  const index =
    history.records.findIndex(
      (record) => record.id === lifecycle.id,
    );

  if (index === -1) {
    throw new Error(
      `Lifecycle "${lifecycle.id}" does not exist.`,
    );
  }

  const records = [...history.records];
  records[index] = lifecycle;

  return {
    ...history,
    activeLifecycleId:
      resolveActiveLifecycleId(records),
    records,
    updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Read Helpers */
/* ------------------------------------------------------------------ */

/**
 * 현재 활성 Recommendation을 반환합니다.
 */
export function getActiveRuntimeRecommendationLifecycle(
  history: RuntimeRecommendationLifecycleHistory,
): RuntimeRecommendationLifecycleRecord | null {
  if (history.activeLifecycleId === null) {
    return null;
  }

  return (
    history.records.find(
      (record) =>
        record.id === history.activeLifecycleId,
    ) ?? null
  );
}

/**
 * Recommendation ID로 Lifecycle을 조회합니다.
 */
export function findLifecycleByRecommendationId(
  history: RuntimeRecommendationLifecycleHistory,
  recommendationId: string,
): RuntimeRecommendationLifecycleRecord | null {
  return (
    history.records.find(
      (record) =>
        record.recommendationId === recommendationId,
    ) ?? null
  );
}

/**
 * Lifecycle ID로 조회합니다.
 */
export function findLifecycleById(
  history: RuntimeRecommendationLifecycleHistory,
  lifecycleId: string,
): RuntimeRecommendationLifecycleRecord | null {
  return (
    history.records.find(
      (record) => record.id === lifecycleId,
    ) ?? null
  );
}

/* ------------------------------------------------------------------ */
/* Derived Collections */
/* ------------------------------------------------------------------ */

/**
 * Recommendation 생성 순서를 유지하여 반환합니다.
 */
export function getLifecycleTimeline(
  history: RuntimeRecommendationLifecycleHistory,
): readonly RuntimeRecommendationLifecycleRecord[] {
  return [...history.records];
}

/**
 * 완료된 Recommendation만 반환합니다.
 */
export function getCompletedRecommendationLifecycles(
  history: RuntimeRecommendationLifecycleHistory,
): RuntimeRecommendationLifecycleRecord[] {
  return history.records.filter(
    (record) =>
      record.state === "completed",
  );
}

/**
 * 교체된 Recommendation만 반환합니다.
 */
export function getSupersededRecommendationLifecycles(
  history: RuntimeRecommendationLifecycleHistory,
): RuntimeRecommendationLifecycleRecord[] {
  return history.records.filter(
    (record) =>
      record.state === "superseded",
  );
}

/**
 * Archive 상태 Recommendation만 반환합니다.
 */
export function getArchivedRecommendationLifecycles(
  history: RuntimeRecommendationLifecycleHistory,
): RuntimeRecommendationLifecycleRecord[] {
  return history.records.filter(
    (record) =>
      record.state === "archived",
  );
}

/* ------------------------------------------------------------------ */
/* Internal */
/* ------------------------------------------------------------------ */

function resolveActiveLifecycleId(
  records: RuntimeRecommendationLifecycleRecord[],
): string | null {
  const activeRecords =
    records.filter(
      (record) =>
        record.state === "active",
    );

  if (activeRecords.length === 0) {
    return null;
  }

  if (activeRecords.length > 1) {
    throw new Error(
      "History contains multiple active recommendation lifecycles.",
    );
  }

  return activeRecords[0].id;
}

function validateHistory(
  history: RuntimeRecommendationLifecycleHistory,
): void {
  if (
    history === null ||
    typeof history !== "object"
  ) {
    throw new Error(
      "history must be a valid RuntimeRecommendationLifecycleHistory.",
    );
  }
}

function validateLifecycle(
  lifecycle: RuntimeRecommendationLifecycleRecord,
): void {
  if (
    lifecycle === null ||
    typeof lifecycle !== "object"
  ) {
    throw new Error(
      "lifecycle must be a valid RuntimeRecommendationLifecycleRecord.",
    );
  }
}

function assertNonEmptyString(
  value: unknown,
  fieldName: string,
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
  value: string,
  fieldName: string,
): void {
  assertNonEmptyString(value, fieldName);

  if (Number.isNaN(Date.parse(value))) {
    throw new Error(
      `${fieldName} must be a valid ISO-8601 timestamp.`,
    );
  }
}