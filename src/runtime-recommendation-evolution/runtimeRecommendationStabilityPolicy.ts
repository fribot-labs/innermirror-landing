/* ------------------------------------------------------------------ */
/* Stability Policy Type */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Stability Engine이 Stable Recommendation을 유지하거나
 * Challenger를 승격할 때 사용하는 정책입니다.
 *
 * 이 정책은 Recommendation의 품질을 평가하지 않습니다.
 * Recommendation 전환의 시간적 안정성만 제어합니다.
 */
export type RuntimeRecommendationStabilityPolicy = {
  /**
   * Challenger가 Stable Recommendation을 대체하기 위해 필요한
   * 최소 점수 차이입니다.
   *
   * 예:
   *
   * Stable score = 80
   * Challenger score = 85
   * minimumScoreMargin = 8
   *
   * → margin 부족
   * → Stable Recommendation 유지
   */
  minimumScoreMargin:
    number;

  /**
   * 동일 Challenger가 연속으로 관찰되어야 하는 최소 횟수입니다.
   *
   * React rerender 횟수가 아니라 서로 다른 Runtime Context
   * observation 횟수를 의미합니다.
   */
  requiredChallengerObservations:
    number;

  /**
   * Challenger가 Stable Recommendation으로 승격되기 전에
   * 최소한 유지되어야 하는 시간입니다.
   */
  minimumChallengerDwellMilliseconds:
    number;

  /**
   * 현재 Stable Recommendation이 채택된 직후 너무 빠르게
   * 교체되지 않도록 보장하는 최소 유지 시간입니다.
   */
  minimumStableDwellMilliseconds:
    number;

  /**
   * blocking Recommendation이 일반 Stability 조건을 우회하여
   * 즉시 Stable Recommendation이 될 수 있는지 결정합니다.
   */
  blockingActionsBypassStability:
    boolean;

  /**
   * 동일 Recommendation이 다시 관찰될 때 Stable Snapshot의
   * score, action, lastConfirmedAt을 갱신할지 결정합니다.
   */
  sameRecommendationRefreshesStableState:
    boolean;

  /**
   * Candidate가 일시적으로 null이 되었을 때 기존 Stable
   * Recommendation을 유지할지 결정합니다.
   *
   * 프로젝트 해제처럼 명시적인 clear 요청은 이 정책과 관계없이
   * Stability State를 제거합니다.
   */
  preserveStableWhenCandidateMissing:
    boolean;
};

/* ------------------------------------------------------------------ */
/* Default Policy */
/* ------------------------------------------------------------------ */

/**
 * Runtime Recommendation Stability의 기본 정책입니다.
 *
 * 사용자 화면에서 추천이 불필요하게 흔들리는 현상을 줄이면서도
 * 의미 있는 Recommendation 변화는 지나치게 늦추지 않는
 * 균형형 정책입니다.
 */
export const DEFAULT_RUNTIME_RECOMMENDATION_STABILITY_POLICY:
  RuntimeRecommendationStabilityPolicy = {
    /**
     * 작은 점수 차이로 인한 전환을 방지합니다.
     */
    minimumScoreMargin:
      8,

    /**
     * 동일 Challenger가 서로 다른 Context에서
     * 최소 두 번 확인되어야 합니다.
     */
    requiredChallengerObservations:
      2,

    /**
     * 짧은 비동기 중간 상태를 걸러냅니다.
     */
    minimumChallengerDwellMilliseconds:
      400,

    /**
     * 새 Stable Recommendation이 사용자에게 표시된 직후
     * 즉시 다른 추천으로 바뀌는 현상을 줄입니다.
     */
    minimumStableDwellMilliseconds:
      800,

    /**
     * 프로젝트 진행을 막는 선행 조건은 즉시 반영합니다.
     */
    blockingActionsBypassStability:
      true,

    /**
     * 동일 Recommendation이 다시 계산되면 최신 Action과
     * 점수를 Stable Snapshot에 반영합니다.
     */
    sameRecommendationRefreshesStableState:
      true,

    /**
     * 비동기 계산 중 Candidate가 잠시 사라져도
     * 현재 Recommendation을 유지합니다.
     */
    preserveStableWhenCandidateMissing:
      true,
  };

/* ------------------------------------------------------------------ */
/* Conservative Policy */
/* ------------------------------------------------------------------ */

/**
 * Recommendation 변경을 매우 신중하게 허용하는 정책입니다.
 *
 * 추천 전환이 자주 일어나는 환경을 진단하거나,
 * Runtime Action History에 불필요한 교체 기록이 쌓이는지
 * 검증할 때 사용할 수 있습니다.
 */
export const CONSERVATIVE_RUNTIME_RECOMMENDATION_STABILITY_POLICY:
  RuntimeRecommendationStabilityPolicy = {
    minimumScoreMargin:
      12,

    requiredChallengerObservations:
      3,

    minimumChallengerDwellMilliseconds:
      800,

    minimumStableDwellMilliseconds:
      1_500,

    blockingActionsBypassStability:
      true,

    sameRecommendationRefreshesStableState:
      true,

    preserveStableWhenCandidateMissing:
      true,
  };

/* ------------------------------------------------------------------ */
/* Responsive Policy */
/* ------------------------------------------------------------------ */

/**
 * Recommendation 변화를 더 빠르게 반영하는 실험용 정책입니다.
 *
 * Stability Resolver 개발과 테스트에는 유용하지만,
 * 사용자 환경의 기본 정책으로 사용하기 전 충분한 검증이 필요합니다.
 */
export const RESPONSIVE_RUNTIME_RECOMMENDATION_STABILITY_POLICY:
  RuntimeRecommendationStabilityPolicy = {
    minimumScoreMargin:
      4,

    requiredChallengerObservations:
      2,

    minimumChallengerDwellMilliseconds:
      150,

    minimumStableDwellMilliseconds:
      300,

    blockingActionsBypassStability:
      true,

    sameRecommendationRefreshesStableState:
      true,

    preserveStableWhenCandidateMissing:
      true,
  };

/* ------------------------------------------------------------------ */
/* Immediate Test Policy */
/* ------------------------------------------------------------------ */

/**
 * Stability Resolver의 특정 분기와 Challenger 승격을 빠르게
 * 검증하기 위한 테스트 전용 정책입니다.
 *
 * 실제 사용자 Runtime에는 사용하지 않는 것이 좋습니다.
 */
export const IMMEDIATE_TEST_RUNTIME_RECOMMENDATION_STABILITY_POLICY:
  RuntimeRecommendationStabilityPolicy = {
    minimumScoreMargin:
      0,

    requiredChallengerObservations:
      1,

    minimumChallengerDwellMilliseconds:
      0,

    minimumStableDwellMilliseconds:
      0,

    blockingActionsBypassStability:
      true,

    sameRecommendationRefreshesStableState:
      true,

    preserveStableWhenCandidateMissing:
      true,
  };

/* ------------------------------------------------------------------ */
/* Policy Collection */
/* ------------------------------------------------------------------ */

export const RUNTIME_RECOMMENDATION_STABILITY_POLICIES = {
  default:
    DEFAULT_RUNTIME_RECOMMENDATION_STABILITY_POLICY,

  conservative:
    CONSERVATIVE_RUNTIME_RECOMMENDATION_STABILITY_POLICY,

  responsive:
    RESPONSIVE_RUNTIME_RECOMMENDATION_STABILITY_POLICY,

  immediateTest:
    IMMEDIATE_TEST_RUNTIME_RECOMMENDATION_STABILITY_POLICY,
} as const;

export type RuntimeRecommendationStabilityPolicyName =
  keyof typeof RUNTIME_RECOMMENDATION_STABILITY_POLICIES;

/* ------------------------------------------------------------------ */
/* Policy Factory */
/* ------------------------------------------------------------------ */

/**
 * 외부에서 전달된 일부 정책값을 기본 정책 위에 덮어씁니다.
 *
 * 반환 전 모든 값을 안전한 범위로 정규화합니다.
 */
export function createRuntimeRecommendationStabilityPolicy(
  overrides:
    Partial<RuntimeRecommendationStabilityPolicy> = {}
): RuntimeRecommendationStabilityPolicy {
  return normalizeRuntimeRecommendationStabilityPolicy({
    ...DEFAULT_RUNTIME_RECOMMENDATION_STABILITY_POLICY,
    ...overrides,
  });
}

/**
 * 기본 Stability Policy의 독립된 복사본을 반환합니다.
 */
export function createDefaultRuntimeRecommendationStabilityPolicy():
  RuntimeRecommendationStabilityPolicy {
  return createRuntimeRecommendationStabilityPolicy();
}

/* ------------------------------------------------------------------ */
/* Named Policy Resolver */
/* ------------------------------------------------------------------ */

/**
 * 이름으로 등록된 Stability Policy를 가져옵니다.
 *
 * 원본 상수 객체가 외부에서 변경되지 않도록 복사본을 반환합니다.
 */
export function resolveRuntimeRecommendationStabilityPolicy(
  name:
    RuntimeRecommendationStabilityPolicyName
): RuntimeRecommendationStabilityPolicy {
  return cloneRuntimeRecommendationStabilityPolicy(
    RUNTIME_RECOMMENDATION_STABILITY_POLICIES[
      name
    ]
  );
}

/* ------------------------------------------------------------------ */
/* Policy Clone */
/* ------------------------------------------------------------------ */

/**
 * Stability Policy를 독립 객체로 복사합니다.
 */
export function cloneRuntimeRecommendationStabilityPolicy(
  policy:
    RuntimeRecommendationStabilityPolicy
): RuntimeRecommendationStabilityPolicy {
  return {
    minimumScoreMargin:
      policy.minimumScoreMargin,

    requiredChallengerObservations:
      policy.requiredChallengerObservations,

    minimumChallengerDwellMilliseconds:
      policy.minimumChallengerDwellMilliseconds,

    minimumStableDwellMilliseconds:
      policy.minimumStableDwellMilliseconds,

    blockingActionsBypassStability:
      policy.blockingActionsBypassStability,

    sameRecommendationRefreshesStableState:
      policy.sameRecommendationRefreshesStableState,

    preserveStableWhenCandidateMissing:
      policy.preserveStableWhenCandidateMissing,
  };
}

/* ------------------------------------------------------------------ */
/* Policy Normalization */
/* ------------------------------------------------------------------ */

/**
 * Stability Resolver가 비정상적인 숫자나 음수를 받지 않도록
 * 정책값을 정규화합니다.
 */
export function normalizeRuntimeRecommendationStabilityPolicy(
  policy:
    RuntimeRecommendationStabilityPolicy
): RuntimeRecommendationStabilityPolicy {
  return {
    minimumScoreMargin:
      normalizeNonNegativeNumber(
        policy.minimumScoreMargin,
        DEFAULT_RUNTIME_RECOMMENDATION_STABILITY_POLICY
          .minimumScoreMargin
      ),

    requiredChallengerObservations:
      normalizePositiveInteger(
        policy.requiredChallengerObservations,
        DEFAULT_RUNTIME_RECOMMENDATION_STABILITY_POLICY
          .requiredChallengerObservations
      ),

    minimumChallengerDwellMilliseconds:
      normalizeNonNegativeInteger(
        policy.minimumChallengerDwellMilliseconds,
        DEFAULT_RUNTIME_RECOMMENDATION_STABILITY_POLICY
          .minimumChallengerDwellMilliseconds
      ),

    minimumStableDwellMilliseconds:
      normalizeNonNegativeInteger(
        policy.minimumStableDwellMilliseconds,
        DEFAULT_RUNTIME_RECOMMENDATION_STABILITY_POLICY
          .minimumStableDwellMilliseconds
      ),

    blockingActionsBypassStability:
      normalizeBoolean(
        policy.blockingActionsBypassStability,
        DEFAULT_RUNTIME_RECOMMENDATION_STABILITY_POLICY
          .blockingActionsBypassStability
      ),

    sameRecommendationRefreshesStableState:
      normalizeBoolean(
        policy.sameRecommendationRefreshesStableState,
        DEFAULT_RUNTIME_RECOMMENDATION_STABILITY_POLICY
          .sameRecommendationRefreshesStableState
      ),

    preserveStableWhenCandidateMissing:
      normalizeBoolean(
        policy.preserveStableWhenCandidateMissing,
        DEFAULT_RUNTIME_RECOMMENDATION_STABILITY_POLICY
          .preserveStableWhenCandidateMissing
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Validation */
/* ------------------------------------------------------------------ */

/**
 * 정책 객체가 Stability Resolver에서 사용할 수 있는 값인지 검사합니다.
 *
 * 이 함수는 값을 수정하지 않습니다.
 * 외부 설정 검증이나 테스트에 사용할 수 있습니다.
 */
export function isRuntimeRecommendationStabilityPolicyValid(
  policy:
    RuntimeRecommendationStabilityPolicy
): boolean {
  return (
    isNonNegativeFiniteNumber(
      policy.minimumScoreMargin
    ) &&
    isPositiveInteger(
      policy.requiredChallengerObservations
    ) &&
    isNonNegativeInteger(
      policy.minimumChallengerDwellMilliseconds
    ) &&
    isNonNegativeInteger(
      policy.minimumStableDwellMilliseconds
    ) &&
    typeof policy.blockingActionsBypassStability ===
      "boolean" &&
    typeof policy.sameRecommendationRefreshesStableState ===
      "boolean" &&
    typeof policy.preserveStableWhenCandidateMissing ===
      "boolean"
  );
}

/* ------------------------------------------------------------------ */
/* Number Helpers */
/* ------------------------------------------------------------------ */

function normalizeNonNegativeNumber(
  value:
    number,
  fallback:
    number
): number {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return Math.max(
      0,
      fallback
    );
  }

  return Math.max(
    0,
    value
  );
}

function normalizePositiveInteger(
  value:
    number,
  fallback:
    number
): number {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return Math.max(
      1,
      Math.floor(
        fallback
      )
    );
  }

  return Math.max(
    1,
    Math.floor(
      value
    )
  );
}

function normalizeNonNegativeInteger(
  value:
    number,
  fallback:
    number
): number {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return Math.max(
      0,
      Math.floor(
        fallback
      )
    );
  }

  return Math.max(
    0,
    Math.floor(
      value
    )
  );
}

function normalizeBoolean(
  value:
    boolean,
  fallback:
    boolean
): boolean {
  return typeof value ===
    "boolean"
    ? value
    : fallback;
}

/* ------------------------------------------------------------------ */
/* Validation Helpers */
/* ------------------------------------------------------------------ */

function isNonNegativeFiniteNumber(
  value:
    number
): boolean {
  return (
    Number.isFinite(
      value
    ) &&
    value >= 0
  );
}

function isPositiveInteger(
  value:
    number
): boolean {
  return (
    Number.isInteger(
      value
    ) &&
    value > 0
  );
}

function isNonNegativeInteger(
  value:
    number
): boolean {
  return (
    Number.isInteger(
      value
    ) &&
    value >= 0
  );
}