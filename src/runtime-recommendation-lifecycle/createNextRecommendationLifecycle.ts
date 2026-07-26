import type {
    RuntimeNextAction,
} from "../runtime-next-action/runtimeNextActionTypes";

import {
    advanceRuntimeRecommendationLifecycle,
} from "./advanceRuntimeRecommendationLifecycle";

import {
    appendRuntimeRecommendationLifecycle,
    getActiveRuntimeRecommendationLifecycle,
    replaceRuntimeRecommendationLifecycle,
} from "./createRecommendationLifecycleHistory";

import {
    createRuntimeRecommendationLifecycle,
} from "./createRuntimeRecommendationLifecycle";

import type {
    RuntimeRecommendationLifecycleHistory,
    RuntimeRecommendationLifecycleRecord,
    RuntimeRecommendationLifecycleTransitionActor,
} from "./runtimeRecommendationLifecycleTypes";

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

/**
 * 현재 Recommendation을 종료하고 다음 Recommendation으로 이동할 때
 * 적용할 종료 방식입니다.
 *
 * completed
 * 사용자가 현재 Recommendation을 실제로 완료한 뒤 다음으로 이동
 *
 * superseded
 * 현재 Recommendation이 완료되기 전에 새 Recommendation으로 교체
 */
export type NextRecommendationLifecycleResolution =
  | "completed"
  | "superseded";

/**
 * 다음 Recommendation Lifecycle 생성 입력입니다.
 */
export type CreateNextRecommendationLifecycleParams = {
  /**
   * 현재 Recommendation Lifecycle History입니다.
   */
  history:
    RuntimeRecommendationLifecycleHistory;

  /**
   * 다음 Recommendation의 Lifecycle ID입니다.
   */
  nextLifecycleId:
    string;

  /**
   * 다음 Recommendation ID입니다.
   */
  nextRecommendationId:
    string;

  /**
   * 다음 Runtime Recommendation입니다.
   */
  nextRecommendation:
    RuntimeNextAction;

  /**
   * 다음 Lifecycle의 최초 created Transition ID입니다.
   *
   * 다음 Lifecycle은 즉시 활성화되므로 내부적으로:
   *
   * `${nextTransitionId}:activated`
   *
   * Transition도 함께 생성됩니다.
   */
  nextTransitionId:
    string;

  /**
   * 현재 active Recommendation을 어떤 방식으로 종료할지 결정합니다.
   *
   * active Lifecycle이 존재할 때 필수입니다.
   *
   * 기본값은 superseded입니다.
   */
  currentResolution?:
    NextRecommendationLifecycleResolution;

  /**
   * 현재 Lifecycle 종료 Transition ID입니다.
   *
   * active Lifecycle이 존재하면 필수입니다.
   */
  currentTransitionId?:
    string;

  /**
   * 현재 Lifecycle 종료 주체입니다.
   *
   * completed의 기본값은 user,
   * superseded의 기본값은 runtime입니다.
   */
  actor?:
    RuntimeRecommendationLifecycleTransitionActor;

  /**
   * Lifecycle 연결이 발생한 시각입니다.
   */
  occurredAt:
    string;

  /**
   * 현재 Lifecycle Transition에 기록할 선택적 메모입니다.
   */
  note?:
    string | null;
};

/**
 * 다음 Recommendation Lifecycle 생성 결과입니다.
 */
export type CreateNextRecommendationLifecycleResult = {
  /**
   * 이전 Recommendation Lifecycle입니다.
   *
   * 최초 Recommendation인 경우 null입니다.
   */
  previousLifecycle:
    RuntimeRecommendationLifecycleRecord | null;

  /**
   * 새로 생성되어 active 상태가 된 Lifecycle입니다.
   */
  nextLifecycle:
    RuntimeRecommendationLifecycleRecord;

  /**
   * 이전·다음 Lifecycle이 모두 반영된 새로운 History입니다.
   */
  history:
    RuntimeRecommendationLifecycleHistory;
};

/* ------------------------------------------------------------------ */
/* Public API */
/* ------------------------------------------------------------------ */

/**
 * 현재 Recommendation을 종료하고 다음 Recommendation Lifecycle을
 * 생성하여 History에 연결합니다.
 *
 * 지원하는 흐름:
 *
 * 1. 최초 Recommendation
 *
 *    empty history
 *        ↓
 *    next Recommendation active
 *
 * 2. 현재 Recommendation 완료 후 다음으로 이동
 *
 *    active
 *        ↓ completed
 *    next Recommendation active
 *
 * 3. 현재 Recommendation이 새 Recommendation으로 교체
 *
 *    active
 *        ↓ superseded
 *    next Recommendation active
 *
 * 이 함수는 입력 History와 Lifecycle 객체를 변경하지 않습니다.
 */
export function createNextRecommendationLifecycle(
  params: CreateNextRecommendationLifecycleParams,
): CreateNextRecommendationLifecycleResult {
  validateParams(params);

  const {
    history,
    nextLifecycleId,
    nextRecommendationId,
    nextRecommendation,
    nextTransitionId,
    currentResolution = "superseded",
    currentTransitionId,
    actor,
    occurredAt,
    note = null,
  } = params;

  const currentLifecycle =
    getActiveRuntimeRecommendationLifecycle(
      history,
    );

  /*
   * 최초 Recommendation인 경우:
   *
   * 이전 Lifecycle 없이 새 Lifecycle을 생성하고 즉시 활성화합니다.
   */
  if (currentLifecycle === null) {
    assertHistoryHasNoUnresolvedActiveReference(
      history,
    );

    const nextLifecycle =
      createRuntimeRecommendationLifecycle({
        lifecycleId:
          nextLifecycleId,
        recommendationId:
          nextRecommendationId,
        recommendation:
          nextRecommendation,
        previousLifecycleId:
          null,
        createdAt:
          occurredAt,
        activateImmediately:
          true,
        transitionId:
          nextTransitionId,
      });

    const nextHistory =
      appendRuntimeRecommendationLifecycle({
        history,
        lifecycle:
          nextLifecycle,
        updatedAt:
          occurredAt,
      });

    return {
      previousLifecycle:
        null,
      nextLifecycle,
      history:
        nextHistory,
    };
  }

  /*
   * 현재 active Lifecycle이 존재하면 종료 Transition ID가 필요합니다.
   */
  assertNonEmptyString(
    currentTransitionId,
    "currentTransitionId",
  );

  assertNextIdentityDoesNotConflict({
    history,
    currentLifecycle,
    nextLifecycleId,
    nextRecommendationId,
  });

  /*
   * 다음 Recommendation Lifecycle을 먼저 생성합니다.
   *
   * 이전 Lifecycle의 nextLifecycleId와
   * 다음 Lifecycle의 previousLifecycleId를 서로 연결해야 하므로,
   * 새 Lifecycle ID는 이 시점에 이미 확정되어 있어야 합니다.
   */
  const nextLifecycle =
    createRuntimeRecommendationLifecycle({
      lifecycleId:
        nextLifecycleId,
      recommendationId:
        nextRecommendationId,
      recommendation:
        nextRecommendation,
      previousLifecycleId:
        currentLifecycle.id,
      createdAt:
        occurredAt,
      activateImmediately:
        true,
      transitionId:
        nextTransitionId,
    });

  /*
   * 현재 Recommendation을 완료 또는 교체 상태로 전환합니다.
   */
  const resolvedCurrentLifecycle =
    advanceRuntimeRecommendationLifecycle({
      lifecycle:
        currentLifecycle,

      nextState:
        currentResolution,

      reason:
        currentResolution === "completed"
          ? "recommended-action-completed"
          : "new-recommendation-selected",

      actor:
        actor ??
        resolveDefaultActor(
          currentResolution,
        ),

      transitionId:
        currentTransitionId,

      occurredAt,

      supersededByRecommendationId:
        currentResolution === "superseded"
          ? nextRecommendationId
          : undefined,

      nextLifecycleId,

      note,
    });

  /*
   * 현재 Lifecycle을 먼저 종료하여 activeLifecycleId를 비웁니다.
   *
   * active Lifecycle이 남아 있는 상태에서 새 active Lifecycle을
   * append하면 History의 단일 active 규칙을 위반하게 됩니다.
   */
  const historyWithResolvedCurrent =
    replaceRuntimeRecommendationLifecycle({
      history,
      lifecycle:
        resolvedCurrentLifecycle,
      updatedAt:
        occurredAt,
    });

  /*
   * 종료된 이전 Lifecycle 다음에 새 active Lifecycle을 추가합니다.
   */
  const historyWithNext =
    appendRuntimeRecommendationLifecycle({
      history:
        historyWithResolvedCurrent,
      lifecycle:
        nextLifecycle,
      updatedAt:
        occurredAt,
    });

  return {
    previousLifecycle:
      resolvedCurrentLifecycle,
    nextLifecycle,
    history:
      historyWithNext,
  };
}

/* ------------------------------------------------------------------ */
/* Default Actor */
/* ------------------------------------------------------------------ */

function resolveDefaultActor(
  resolution:
    NextRecommendationLifecycleResolution,
): RuntimeRecommendationLifecycleTransitionActor {
  if (resolution === "completed") {
    return "user";
  }

  return "runtime";
}

/* ------------------------------------------------------------------ */
/* Identity Validation */
/* ------------------------------------------------------------------ */

type AssertNextIdentityDoesNotConflictParams = {
  history:
    RuntimeRecommendationLifecycleHistory;

  currentLifecycle:
    RuntimeRecommendationLifecycleRecord;

  nextLifecycleId:
    string;

  nextRecommendationId:
    string;
};

function assertNextIdentityDoesNotConflict(
  params: AssertNextIdentityDoesNotConflictParams,
): void {
  const {
    history,
    currentLifecycle,
    nextLifecycleId,
    nextRecommendationId,
  } = params;

  if (
    nextLifecycleId ===
    currentLifecycle.id
  ) {
    throw new Error(
      "nextLifecycleId must not match the current lifecycle ID.",
    );
  }

  if (
    nextRecommendationId ===
    currentLifecycle.recommendationId
  ) {
    throw new Error(
      "nextRecommendationId must not match the current " +
        "recommendationId.",
    );
  }

  const duplicateLifecycle =
    history.records.some(
      (record) =>
        record.id === nextLifecycleId,
    );

  if (duplicateLifecycle) {
    throw new Error(
      `Lifecycle "${nextLifecycleId}" already exists in history.`,
    );
  }

  const duplicateRecommendation =
    history.records.some(
      (record) =>
        record.recommendationId ===
        nextRecommendationId,
    );

  if (duplicateRecommendation) {
    throw new Error(
      `Recommendation "${nextRecommendationId}" ` +
        "already exists in lifecycle history.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* History Validation */
/* ------------------------------------------------------------------ */

/**
 * activeLifecycleId가 null인데 active Record가 남아 있는 비정상 상태를
 * 방지합니다.
 */
function assertHistoryHasNoUnresolvedActiveReference(
  history:
    RuntimeRecommendationLifecycleHistory,
): void {
  const activeRecords =
    history.records.filter(
      (record) =>
        record.state === "active",
    );

  if (activeRecords.length > 0) {
    throw new Error(
      "Lifecycle History contains an active record while " +
        "activeLifecycleId is null.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* General Validation */
/* ------------------------------------------------------------------ */

function validateParams(
  params:
    CreateNextRecommendationLifecycleParams,
): void {
  if (
    params.history === null ||
    typeof params.history !== "object"
  ) {
    throw new Error(
      "history must be a valid " +
        "RuntimeRecommendationLifecycleHistory.",
    );
  }

  if (
    !Array.isArray(
      params.history.records,
    )
  ) {
    throw new Error(
      "history.records must be an array.",
    );
  }

  assertNonEmptyString(
    params.nextLifecycleId,
    "nextLifecycleId",
  );

  assertNonEmptyString(
    params.nextRecommendationId,
    "nextRecommendationId",
  );

  assertNonEmptyString(
    params.nextTransitionId,
    "nextTransitionId",
  );

  assertValidIsoTimestamp(
    params.occurredAt,
    "occurredAt",
  );

  if (
    params.nextRecommendation === null ||
    typeof params.nextRecommendation !==
      "object"
  ) {
    throw new Error(
      "nextRecommendation must be a valid RuntimeNextAction object.",
    );
  }

  if (
    params.currentResolution !== undefined &&
    params.currentResolution !== "completed" &&
    params.currentResolution !== "superseded"
  ) {
    throw new Error(
      'currentResolution must be either "completed" or "superseded".',
    );
  }

  if (
    params.note !== undefined &&
    params.note !== null &&
    typeof params.note !== "string"
  ) {
    throw new Error(
      "note must be a string or null.",
    );
  }

  validateHistoryConsistency(
    params.history,
  );

  validateTimestampOrder(
    params.history,
    params.occurredAt,
  );
}

function validateHistoryConsistency(
  history:
    RuntimeRecommendationLifecycleHistory,
): void {
  const lifecycleIds =
    new Set<string>();

  const recommendationIds =
    new Set<string>();

  let activeRecordCount = 0;

  for (const record of history.records) {
    assertNonEmptyString(
      record.id,
      "lifecycle.id",
    );

    assertNonEmptyString(
      record.recommendationId,
      "lifecycle.recommendationId",
    );

    if (
      lifecycleIds.has(record.id)
    ) {
      throw new Error(
        `Duplicate lifecycle ID "${record.id}".`,
      );
    }

    if (
      recommendationIds.has(
        record.recommendationId,
      )
    ) {
      throw new Error(
        `Duplicate recommendation ID ` +
          `"${record.recommendationId}".`,
      );
    }

    lifecycleIds.add(record.id);

    recommendationIds.add(
      record.recommendationId,
    );

    if (record.state === "active") {
      activeRecordCount += 1;
    }
  }

  if (activeRecordCount > 1) {
    throw new Error(
      "Lifecycle History contains multiple active records.",
    );
  }

  if (
    history.activeLifecycleId === null
  ) {
    if (activeRecordCount !== 0) {
      throw new Error(
        "activeLifecycleId is null but an active lifecycle exists.",
      );
    }

    return;
  }

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

function validateTimestampOrder(
  history:
    RuntimeRecommendationLifecycleHistory,
  occurredAt:
    string,
): void {
  const occurredTimestamp =
    Date.parse(occurredAt);

  const historyUpdatedTimestamp =
    Date.parse(history.updatedAt);

  if (
    Number.isNaN(
      historyUpdatedTimestamp,
    )
  ) {
    throw new Error(
      "history.updatedAt must be a valid ISO 8601 timestamp.",
    );
  }

  if (
    occurredTimestamp <
    historyUpdatedTimestamp
  ) {
    throw new Error(
      "occurredAt must not be earlier than history.updatedAt.",
    );
  }
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

  if (
    Number.isNaN(
      Date.parse(value),
    )
  ) {
    throw new Error(
      `${fieldName} must be a valid ISO 8601 timestamp.`,
    );
  }
}