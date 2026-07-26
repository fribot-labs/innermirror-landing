import type {
    CreateRuntimeRecommendationLifecycleParams,
    RuntimeRecommendationLifecycleRecord,
    RuntimeRecommendationLifecycleState,
    RuntimeRecommendationLifecycleTransition,
} from "./runtimeRecommendationLifecycleTypes";

/**
 * 새로운 Runtime Recommendation Lifecycle Record를 생성합니다.
 *
 * Recommendation은 기본적으로 created 상태에서 시작합니다.
 * activateImmediately가 true이면 생성과 동시에 active 상태가 되며,
 * created → active 두 개의 Transition이 순서대로 기록됩니다.
 *
 * 이 함수는 입력 객체를 변경하지 않는 순수 함수입니다.
 */
export function createRuntimeRecommendationLifecycle(
  params: CreateRuntimeRecommendationLifecycleParams,
): RuntimeRecommendationLifecycleRecord {
  const {
    lifecycleId,
    recommendationId,
    recommendation,
    previousLifecycleId = null,
    createdAt,
    activateImmediately = false,
    transitionId,
  } = params;

  validateCreationParams(params);

  const createdTransition =
    createInitialTransition({
      transitionId,
      lifecycleId,
      createdAt,
    });

  if (!activateImmediately) {
    return {
      id: lifecycleId,
      recommendationId,
      recommendation,
      state: "created",
      createdAt,
      activatedAt: null,
      resolvedAt: null,
      archivedAt: null,
      resolution: null,
      previousLifecycleId,
      nextLifecycleId: null,
      supersededByRecommendationId: null,
      transitions: [
        createdTransition,
      ],
      updatedAt: createdAt,
    };
  }

  const activationTransition =
    createActivationTransition({
      transitionId:
        createActivationTransitionId(transitionId),
      lifecycleId,
      activatedAt: createdAt,
    });

  return {
    id: lifecycleId,
    recommendationId,
    recommendation,
    state: "active",
    createdAt,
    activatedAt: createdAt,
    resolvedAt: null,
    archivedAt: null,
    resolution: null,
    previousLifecycleId,
    nextLifecycleId: null,
    supersededByRecommendationId: null,
    transitions: [
      createdTransition,
      activationTransition,
    ],
    updatedAt: createdAt,
  };
}

/* ------------------------------------------------------------------ */
/* Initial Transitions */
/* ------------------------------------------------------------------ */

type CreateInitialTransitionParams = {
  transitionId: string;
  lifecycleId: string;
  createdAt: string;
};

function createInitialTransition(
  params: CreateInitialTransitionParams,
): RuntimeRecommendationLifecycleTransition {
  const {
    transitionId,
    lifecycleId,
    createdAt,
  } = params;

  return {
    id: transitionId,
    lifecycleId,
    fromState: null,
    toState: "created",
    reason: "recommendation-created",
    actor: "runtime",
    occurredAt: createdAt,
    note: null,
  };
}

type CreateActivationTransitionParams = {
  transitionId: string;
  lifecycleId: string;
  activatedAt: string;
};

function createActivationTransition(
  params: CreateActivationTransitionParams,
): RuntimeRecommendationLifecycleTransition {
  const {
    transitionId,
    lifecycleId,
    activatedAt,
  } = params;

  return {
    id: transitionId,
    lifecycleId,
    fromState: "created",
    toState: "active",
    reason: "recommendation-activated",
    actor: "runtime",
    occurredAt: activatedAt,
    note: null,
  };
}

/* ------------------------------------------------------------------ */
/* Transition ID */
/* ------------------------------------------------------------------ */

/**
 * 생성과 즉시 활성화되는 경우 두 번째 Transition ID를 만듭니다.
 *
 * MVP 단계에서는 호출자가 제공한 최초 Transition ID에
 * 안정적인 suffix를 추가합니다.
 *
 * 이후 별도 ID Factory가 도입되면 이 구현을 교체할 수 있습니다.
 */
function createActivationTransitionId(
  transitionId: string,
): string {
  return `${transitionId}:activated`;
}

/* ------------------------------------------------------------------ */
/* Validation */
/* ------------------------------------------------------------------ */

function validateCreationParams(
  params: CreateRuntimeRecommendationLifecycleParams,
): void {
  assertNonEmptyString(
    params.lifecycleId,
    "lifecycleId",
  );

  assertNonEmptyString(
    params.recommendationId,
    "recommendationId",
  );

  assertNonEmptyString(
    params.transitionId,
    "transitionId",
  );

  assertValidIsoTimestamp(
    params.createdAt,
    "createdAt",
  );

  if (
    params.previousLifecycleId !== undefined &&
    params.previousLifecycleId !== null
  ) {
    assertNonEmptyString(
      params.previousLifecycleId,
      "previousLifecycleId",
    );

    if (
      params.previousLifecycleId ===
      params.lifecycleId
    ) {
      throw new Error(
        "previousLifecycleId must not match lifecycleId.",
      );
    }
  }

  if (
    params.recommendation === null ||
    typeof params.recommendation !== "object"
  ) {
    throw new Error(
      "recommendation must be a valid RuntimeNextAction object.",
    );
  }
}

function assertNonEmptyString(
  value: string,
  fieldName: string,
): void {
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

/* ------------------------------------------------------------------ */
/* Type Guard */
/* ------------------------------------------------------------------ */

/**
 * Lifecycle 생성 결과가 아직 해결되지 않은 상태인지 확인합니다.
 *
 * created와 active는 Recommendation이 현재 Lifecycle 흐름 안에서
 * 계속 유효한 상태입니다.
 */
export function isOpenRuntimeRecommendationLifecycleState(
  state: RuntimeRecommendationLifecycleState,
): boolean {
  return (
    state === "created" ||
    state === "active"
  );
}