import type {
    AdvanceRuntimeRecommendationLifecycleParams,
    RuntimeRecommendationLifecycleRecord,
    RuntimeRecommendationLifecycleResolution,
    RuntimeRecommendationLifecycleState,
    RuntimeRecommendationLifecycleTransition,
    RuntimeRecommendationLifecycleTransitionMap,
} from "./runtimeRecommendationLifecycleTypes";

/* ------------------------------------------------------------------ */
/* Public API */
/* ------------------------------------------------------------------ */

/**
 * Runtime Recommendation Lifecycle을 다음 상태로 전환합니다.
 *
 * 이 함수는:
 *
 * - 허용된 상태 전이만 수행하고
 * - 기존 Lifecycle Record를 변경하지 않으며
 * - 새로운 Transition을 append하고
 * - 상태별 timestamp와 resolution을 갱신합니다.
 *
 * 허용되는 상태 전이:
 *
 * created
 * ├─ active
 * └─ archived
 *
 * active
 * ├─ completed
 * ├─ superseded
 * └─ archived
 *
 * completed
 * └─ archived
 *
 * superseded
 * └─ archived
 *
 * archived
 * └─ 전이 불가
 */
export function advanceRuntimeRecommendationLifecycle(
  params: AdvanceRuntimeRecommendationLifecycleParams,
): RuntimeRecommendationLifecycleRecord {
  validateAdvanceParams(params);

  const {
    lifecycle,
    nextState,
    reason,
    actor,
    transitionId,
    occurredAt,
    supersededByRecommendationId,
    nextLifecycleId,
    note,
  } = params;

  assertAllowedLifecycleTransition(
    lifecycle.state,
    nextState,
  );

  assertTransitionReasonMatchesState(
    nextState,
    reason,
  );

  assertTransitionMetadata(
    params,
  );

  const transition =
    createLifecycleTransition({
      transitionId,
      lifecycleId: lifecycle.id,
      fromState: lifecycle.state,
      toState: nextState,
      reason,
      actor,
      occurredAt,
      note: note ?? null,
    });

  const resolution =
    resolveLifecycleResolution(
      lifecycle.resolution,
      nextState,
    );

  return {
    ...lifecycle,

    state: nextState,

    activatedAt:
      nextState === "active"
        ? occurredAt
        : lifecycle.activatedAt,

    resolvedAt:
      isResolutionState(nextState)
        ? occurredAt
        : lifecycle.resolvedAt,

    archivedAt:
      nextState === "archived"
        ? occurredAt
        : lifecycle.archivedAt,

    resolution,

    nextLifecycleId:
      nextLifecycleId !== undefined
        ? nextLifecycleId
        : lifecycle.nextLifecycleId,

    supersededByRecommendationId:
      nextState === "superseded"
        ? supersededByRecommendationId ?? null
        : lifecycle.supersededByRecommendationId,

    transitions: [
      ...lifecycle.transitions,
      transition,
    ],

    updatedAt: occurredAt,
  };
}

/* ------------------------------------------------------------------ */
/* Transition Creation */
/* ------------------------------------------------------------------ */

type CreateLifecycleTransitionParams = {
  transitionId: string;
  lifecycleId: string;
  fromState: RuntimeRecommendationLifecycleState;
  toState: RuntimeRecommendationLifecycleState;
  reason:
    RuntimeRecommendationLifecycleTransition["reason"];
  actor:
    RuntimeRecommendationLifecycleTransition["actor"];
  occurredAt: string;
  note: string | null;
};

function createLifecycleTransition(
  params: CreateLifecycleTransitionParams,
): RuntimeRecommendationLifecycleTransition {
  return {
    id: params.transitionId,
    lifecycleId: params.lifecycleId,
    fromState: params.fromState,
    toState: params.toState,
    reason: params.reason,
    actor: params.actor,
    occurredAt: params.occurredAt,
    note: params.note,
  };
}

/* ------------------------------------------------------------------ */
/* Transition Rules */
/* ------------------------------------------------------------------ */

const allowedLifecycleTransitions: {
  [State in RuntimeRecommendationLifecycleState]:
    readonly RuntimeRecommendationLifecycleState[];
} = {
  created: [
    "active",
    "archived",
  ],

  active: [
    "completed",
    "superseded",
    "archived",
  ],

  completed: [
    "archived",
  ],

  superseded: [
    "archived",
  ],

  archived: [],
};

/**
 * 현재 상태에서 다음 상태로 전환할 수 있는지 확인합니다.
 */
export function canAdvanceRuntimeRecommendationLifecycle(
  currentState: RuntimeRecommendationLifecycleState,
  nextState: RuntimeRecommendationLifecycleState,
): boolean {
  return allowedLifecycleTransitions[
    currentState
  ].includes(nextState);
}

/**
 * 상태 전이가 허용되지 않으면 Error를 발생시킵니다.
 */
function assertAllowedLifecycleTransition(
  currentState: RuntimeRecommendationLifecycleState,
  nextState: RuntimeRecommendationLifecycleState,
): void {
  if (
    canAdvanceRuntimeRecommendationLifecycle(
      currentState,
      nextState,
    )
  ) {
    return;
  }

  throw new Error(
    `Invalid Runtime Recommendation Lifecycle transition: ` +
      `${currentState} -> ${nextState}.`,
  );
}

/**
 * 타입 계약에서 특정 상태의 허용 가능한 다음 상태를 추출합니다.
 *
 * 이후 상태별 전이 함수나 테스트에서 사용할 수 있습니다.
 */
export type AllowedRuntimeRecommendationLifecycleNextState<
  State extends RuntimeRecommendationLifecycleState,
> = RuntimeRecommendationLifecycleTransitionMap[State];

/* ------------------------------------------------------------------ */
/* Resolution */
/* ------------------------------------------------------------------ */

/**
 * completed와 superseded는 Recommendation이 active 상태에서
 * 해결된 결과를 나타냅니다.
 *
 * archived는 created 또는 active 상태에서 직접 이동할 때만
 * 최종 resolution이 됩니다.
 *
 * 이미 completed 또는 superseded 상태였던 Record를 archived로
 * 전환하는 경우에는 기존 resolution을 유지합니다.
 */
function resolveLifecycleResolution(
  currentResolution:
    RuntimeRecommendationLifecycleResolution | null,
  nextState:
    RuntimeRecommendationLifecycleState,
): RuntimeRecommendationLifecycleResolution | null {
  if (nextState === "completed") {
    return "completed";
  }

  if (nextState === "superseded") {
    return "superseded";
  }

  if (nextState === "archived") {
    return currentResolution ?? "archived";
  }

  return currentResolution;
}

function isResolutionState(
  state: RuntimeRecommendationLifecycleState,
): state is
  | "completed"
  | "superseded" {
  return (
    state === "completed" ||
    state === "superseded"
  );
}

/* ------------------------------------------------------------------ */
/* Reason Validation */
/* ------------------------------------------------------------------ */

const validReasonsByTargetState: {
  [State in RuntimeRecommendationLifecycleState]:
    readonly RuntimeRecommendationLifecycleTransition["reason"][];
} = {
  created: [
    "recommendation-created",
  ],

  active: [
    "recommendation-activated",
    "runtime-session-restored",
    "lifecycle-reconciled",
  ],

  completed: [
    "recommended-action-completed",
    "lifecycle-reconciled",
  ],

  superseded: [
    "new-recommendation-selected",
    "lifecycle-reconciled",
  ],

  archived: [
    "recommendation-manually-archived",
    "lifecycle-reconciled",
  ],
};

function assertTransitionReasonMatchesState(
  nextState: RuntimeRecommendationLifecycleState,
  reason: RuntimeRecommendationLifecycleTransition["reason"],
): void {
  const validReasons =
    validReasonsByTargetState[nextState];

  if (validReasons.includes(reason)) {
    return;
  }

  throw new Error(
    `Transition reason "${reason}" is not valid ` +
      `for lifecycle state "${nextState}".`,
  );
}

/* ------------------------------------------------------------------ */
/* Metadata Validation */
/* ------------------------------------------------------------------ */

function assertTransitionMetadata(
  params: AdvanceRuntimeRecommendationLifecycleParams,
): void {
  const {
    lifecycle,
    nextState,
    supersededByRecommendationId,
    nextLifecycleId,
  } = params;

  if (nextState === "superseded") {
    assertNonEmptyString(
      supersededByRecommendationId,
      "supersededByRecommendationId",
    );

    if (
      supersededByRecommendationId ===
      lifecycle.recommendationId
    ) {
      throw new Error(
        "supersededByRecommendationId must not match " +
          "the current recommendationId.",
      );
    }
  } else if (
    supersededByRecommendationId !== undefined &&
    supersededByRecommendationId !== null
  ) {
    throw new Error(
      "supersededByRecommendationId can only be provided " +
        'when nextState is "superseded".',
    );
  }

  if (
    nextLifecycleId !== undefined &&
    nextLifecycleId !== null
  ) {
    assertNonEmptyString(
      nextLifecycleId,
      "nextLifecycleId",
    );

    if (nextLifecycleId === lifecycle.id) {
      throw new Error(
        "nextLifecycleId must not match the current lifecycle ID.",
      );
    }

    if (
      nextState !== "completed" &&
      nextState !== "superseded"
    ) {
      throw new Error(
        "nextLifecycleId can only be provided when the lifecycle " +
          'is completed or superseded.',
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* General Validation */
/* ------------------------------------------------------------------ */

function validateAdvanceParams(
  params: AdvanceRuntimeRecommendationLifecycleParams,
): void {
  if (
    params.lifecycle === null ||
    typeof params.lifecycle !== "object"
  ) {
    throw new Error(
      "lifecycle must be a valid " +
        "RuntimeRecommendationLifecycleRecord.",
    );
  }

  assertNonEmptyString(
    params.lifecycle.id,
    "lifecycle.id",
  );

  assertNonEmptyString(
    params.lifecycle.recommendationId,
    "lifecycle.recommendationId",
  );

  assertNonEmptyString(
    params.transitionId,
    "transitionId",
  );

  assertValidIsoTimestamp(
    params.occurredAt,
    "occurredAt",
  );

  assertTimestampOrder(
    params.lifecycle,
    params.occurredAt,
  );

  assertUniqueTransitionId(
    params.lifecycle,
    params.transitionId,
  );

  if (
    params.note !== undefined &&
    params.note !== null &&
    typeof params.note !== "string"
  ) {
    throw new Error(
      "note must be a string or null.",
    );
  }
}

function assertTimestampOrder(
  lifecycle: RuntimeRecommendationLifecycleRecord,
  occurredAt: string,
): void {
  const occurredAtTimestamp =
    Date.parse(occurredAt);

  const createdAtTimestamp =
    Date.parse(lifecycle.createdAt);

  const updatedAtTimestamp =
    Date.parse(lifecycle.updatedAt);

  if (
    occurredAtTimestamp <
    createdAtTimestamp
  ) {
    throw new Error(
      "occurredAt must not be earlier than lifecycle.createdAt.",
    );
  }

  if (
    occurredAtTimestamp <
    updatedAtTimestamp
  ) {
    throw new Error(
      "occurredAt must not be earlier than lifecycle.updatedAt.",
    );
  }
}

function assertUniqueTransitionId(
  lifecycle: RuntimeRecommendationLifecycleRecord,
  transitionId: string,
): void {
  const alreadyExists =
    lifecycle.transitions.some(
      (transition) =>
        transition.id === transitionId,
    );

  if (alreadyExists) {
    throw new Error(
      `Transition ID "${transitionId}" already exists ` +
        `in lifecycle "${lifecycle.id}".`,
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
  assertNonEmptyString(
    value,
    fieldName,
  );

  const parsedTimestamp =
    Date.parse(value);

  if (Number.isNaN(parsedTimestamp)) {
    throw new Error(
      `${fieldName} must be a valid ISO 8601 timestamp.`,
    );
  }
}