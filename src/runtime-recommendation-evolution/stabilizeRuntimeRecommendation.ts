import {
    createRuntimeRecommendationStabilityKey,
    isRuntimeRecommendationKeyEqual,
} from "./createRuntimeRecommendationStabilityKey";

import {
    DEFAULT_RUNTIME_RECOMMENDATION_STABILITY_POLICY,
    normalizeRuntimeRecommendationStabilityPolicy,
} from "./runtimeRecommendationStabilityPolicy";

import type {
    RuntimeRecommendationChallengerState,
    RuntimeRecommendationStabilityCandidate,
    RuntimeRecommendationStabilityDiagnostics,
    RuntimeRecommendationStabilityResult,
    RuntimeRecommendationStabilityState,
    RuntimeStableRecommendationSnapshot,
    StabilizeRuntimeRecommendationInput,
} from "./runtimeRecommendationStabilityTypes";

import type {
    RuntimeRecommendationStabilityPolicy,
} from "./runtimeRecommendationStabilityPolicy";

/* ------------------------------------------------------------------ */
/* Public Input */
/* ------------------------------------------------------------------ */

/**
 * Stability Types의 기본 Resolver 입력에
 * Stability Policy를 결합한 실제 함수 입력입니다.
 */
export type StabilizeRuntimeRecommendationParams =
  StabilizeRuntimeRecommendationInput & {
    policy?:
      RuntimeRecommendationStabilityPolicy;
  };

/* ------------------------------------------------------------------ */
/* Empty State */
/* ------------------------------------------------------------------ */

/**
 * 비어 있는 Recommendation Stability State를 생성합니다.
 */
export function createEmptyRuntimeRecommendationStabilityState():
  RuntimeRecommendationStabilityState {
  return {
    stable:
      null,

    challenger:
      null,

    lastEvaluatedAt:
      null,

    transitionCount:
      0,
  };
}

/* ------------------------------------------------------------------ */
/* Public Resolver */
/* ------------------------------------------------------------------ */

/**
 * 새 Runtime Recommendation Candidate를 관찰하고,
 * 기존 Stable Recommendation을 유지할지 Challenger를 승격할지
 * 결정합니다.
 *
 * 이 함수는 순수 함수입니다.
 *
 * - React state를 직접 변경하지 않습니다.
 * - localStorage를 사용하지 않습니다.
 * - Runtime Action History를 직접 기록하지 않습니다.
 * - Recommendation Candidate의 점수를 변경하지 않습니다.
 */
export function stabilizeRuntimeRecommendation({
  previousState,
  candidate,
  shouldClear,
  evaluatedAt,
  policy =
    DEFAULT_RUNTIME_RECOMMENDATION_STABILITY_POLICY,
}: StabilizeRuntimeRecommendationParams):
  RuntimeRecommendationStabilityResult {
  const normalizedPolicy =
    normalizeRuntimeRecommendationStabilityPolicy(
      policy
    );

  const normalizedEvaluatedAt =
    normalizeEvaluatedAt(
      evaluatedAt
    );

  const normalizedPreviousState =
    normalizeRuntimeRecommendationStabilityState(
      previousState
    );

  /*
   * 프로젝트 해제 또는 명시적 초기화가 요청된 경우에는
   * Stable과 Challenger를 모두 제거합니다.
   */
  if (
    shouldClear
  ) {
    return createClearResult({
      previousState:
        normalizedPreviousState,

      evaluatedAt:
        normalizedEvaluatedAt,
    });
  }

  /*
   * Candidate가 잠시 사라진 경우입니다.
   *
   * 비동기 Runtime 계산 중 null이 발생할 수 있으므로,
   * 기본 정책에서는 기존 Stable Recommendation을 유지합니다.
   */
  if (
    candidate === null
  ) {
    return createMissingCandidateResult({
      previousState:
        normalizedPreviousState,

      policy:
        normalizedPolicy,

      evaluatedAt:
        normalizedEvaluatedAt,
    });
  }

  const normalizedCandidate =
    normalizeStabilityCandidate(
      candidate
    );

  const candidateKey =
    createRuntimeRecommendationStabilityKey(
      normalizedCandidate.action
    );

  const stable =
    normalizedPreviousState.stable;

  /*
   * 아직 Stable Recommendation이 없다면
   * 첫 Candidate를 즉시 Stable로 초기화합니다.
   */
  if (
    stable === null
  ) {
    return createInitializeResult({
      previousState:
        normalizedPreviousState,

      candidate:
        normalizedCandidate,

      candidateKey,

      evaluatedAt:
        normalizedEvaluatedAt,
    });
  }

  /*
   * 새 Candidate가 현재 Stable Recommendation과 동일한 경우입니다.
   *
   * Stable을 다시 확인하고 기존 Challenger를 제거합니다.
   */
  if (
    isRuntimeRecommendationKeyEqual(
      stable.key,
      candidateKey
    )
  ) {
    return createConfirmStableResult({
      previousState:
        normalizedPreviousState,

      candidate:
        normalizedCandidate,

      policy:
        normalizedPolicy,

      evaluatedAt:
        normalizedEvaluatedAt,
    });
  }

  /*
   * Blocking Candidate는 Stability 조건을 우회할 수 있습니다.
   */
  if (
    normalizedCandidate.priorityClass ===
      "blocking" &&
    normalizedPolicy
      .blockingActionsBypassStability
  ) {
    return createBlockingReplacementResult({
      previousState:
        normalizedPreviousState,

      candidate:
        normalizedCandidate,

      candidateKey,

      evaluatedAt:
        normalizedEvaluatedAt,
    });
  }

  const previousChallenger =
    normalizedPreviousState.challenger;

  /*
   * 기존 Challenger가 없거나,
   * 다른 Challenger가 새로 등장한 경우입니다.
   */
  if (
    previousChallenger === null ||
    !isRuntimeRecommendationKeyEqual(
      previousChallenger.key,
      candidateKey
    )
  ) {
    return createObserveNewChallengerResult({
      previousState:
        normalizedPreviousState,

      candidate:
        normalizedCandidate,

      candidateKey,

      evaluatedAt:
        normalizedEvaluatedAt,

      policy:
        normalizedPolicy,
    });
  }

  /*
   * 동일 Challenger가 다시 관찰되었습니다.
   */
  const updatedChallenger =
    updateExistingChallenger({
      challenger:
        previousChallenger,

      candidate:
        normalizedCandidate,

      stable,

      evaluatedAt:
        normalizedEvaluatedAt,
    });

  const evaluation =
    evaluateChallengerPromotion({
      stable,

      challenger:
        updatedChallenger,

      policy:
        normalizedPolicy,

      evaluatedAt:
        normalizedEvaluatedAt,
    });

  /*
   * Observation, Margin, Challenger Dwell, Stable Dwell 조건을
   * 모두 만족하면 Challenger를 Stable로 승격합니다.
   */
  if (
    evaluation.canPromote
  ) {
    return createPromoteChallengerResult({
      previousState:
        normalizedPreviousState,

      challenger:
        updatedChallenger,

      evaluatedAt:
        normalizedEvaluatedAt,

      diagnostics:
        evaluation.diagnostics,
    });
  }

  /*
   * 아직 승격 조건을 충족하지 못했으므로
   * 기존 Stable Recommendation을 유지합니다.
   */
  return createKeepStableWithChallengerResult({
    previousState:
      normalizedPreviousState,

    challenger:
      updatedChallenger,

    evaluatedAt:
      normalizedEvaluatedAt,

    diagnostics:
      evaluation.diagnostics,

    reason:
      createPendingChallengerReason(
        evaluation.diagnostics
      ),
  });
}

/* ------------------------------------------------------------------ */
/* Clear */
/* ------------------------------------------------------------------ */

type CreateClearResultParams = {
  previousState:
    RuntimeRecommendationStabilityState;

  evaluatedAt:
    string;
};

function createClearResult({
  previousState,
  evaluatedAt,
}: CreateClearResultParams):
  RuntimeRecommendationStabilityResult {
  const state:
    RuntimeRecommendationStabilityState = {
      stable:
        null,

      challenger:
        null,

      lastEvaluatedAt:
        evaluatedAt,

      transitionCount:
        previousState.transitionCount,
  };

  return {
    state,

    stableAction:
      null,

    decision:
      "clear",

    reason:
      "Recommendation Stability state was cleared by an explicit request.",

    diagnostics:
      createEmptyDiagnostics(),
  };
}

/* ------------------------------------------------------------------ */
/* Missing Candidate */
/* ------------------------------------------------------------------ */

type CreateMissingCandidateResultParams = {
  previousState:
    RuntimeRecommendationStabilityState;

  policy:
    RuntimeRecommendationStabilityPolicy;

  evaluatedAt:
    string;
};

function createMissingCandidateResult({
  previousState,
  policy,
  evaluatedAt,
}: CreateMissingCandidateResultParams):
  RuntimeRecommendationStabilityResult {
  if (
    policy.preserveStableWhenCandidateMissing &&
    previousState.stable !== null
  ) {
    const state:
      RuntimeRecommendationStabilityState = {
        ...previousState,

        /*
         * Candidate가 사라진 비동기 구간에서는
         * 오래된 Challenger를 유지하지 않습니다.
         */
        challenger:
          null,

        lastEvaluatedAt:
          evaluatedAt,
      };

    return {
      state,

      stableAction:
        state.stable?.action ??
        null,

      decision:
        "keep-stable",

      reason:
        "No candidate was available, so the existing Stable Recommendation was preserved.",

      diagnostics:
        createDiagnostics({
          stable:
            state.stable,

          challenger:
            null,
        }),
    };
  }

  const state:
    RuntimeRecommendationStabilityState = {
      stable:
        null,

      challenger:
        null,

      lastEvaluatedAt:
        evaluatedAt,

      transitionCount:
        previousState.transitionCount,
  };

  return {
    state,

    stableAction:
      null,

    decision:
      "clear",

    reason:
      "No candidate was available and the active policy does not preserve the Stable Recommendation.",

    diagnostics:
      createEmptyDiagnostics(),
  };
}

/* ------------------------------------------------------------------ */
/* Initialize Stable */
/* ------------------------------------------------------------------ */

type CreateInitializeResultParams = {
  previousState:
    RuntimeRecommendationStabilityState;

  candidate:
    RuntimeRecommendationStabilityCandidate;

  candidateKey:
    string;

  evaluatedAt:
    string;
};

function createInitializeResult({
  previousState,
  candidate,
  candidateKey,
  evaluatedAt,
}: CreateInitializeResultParams):
  RuntimeRecommendationStabilityResult {
  const stable =
    createStableSnapshot({
      candidate,

      key:
        candidateKey,

      acceptedAt:
        evaluatedAt,

      observationCount:
        1,
    });

  const state:
    RuntimeRecommendationStabilityState = {
      stable,

      challenger:
        null,

      lastEvaluatedAt:
        evaluatedAt,

      /*
       * 최초 초기화는 Recommendation 교체가 아니므로
       * transitionCount를 증가시키지 않습니다.
       */
      transitionCount:
        previousState.transitionCount,
  };

  return {
    state,

    stableAction:
      stable.action,

    decision:
      "initialize",

    reason:
      "The first available Recommendation Candidate was initialized as the Stable Recommendation.",

    diagnostics:
      createDiagnostics({
        stable,

        challenger:
          null,

        thresholdSatisfied:
          true,

        dwellSatisfied:
          true,

        marginSatisfied:
          true,

        blockingBypass:
          candidate.priorityClass ===
          "blocking",
      }),
  };
}

/* ------------------------------------------------------------------ */
/* Confirm Stable */
/* ------------------------------------------------------------------ */

type CreateConfirmStableResultParams = {
  previousState:
    RuntimeRecommendationStabilityState;

  candidate:
    RuntimeRecommendationStabilityCandidate;

  policy:
    RuntimeRecommendationStabilityPolicy;

  evaluatedAt:
    string;
};

function createConfirmStableResult({
  previousState,
  candidate,
  policy,
  evaluatedAt,
}: CreateConfirmStableResultParams):
  RuntimeRecommendationStabilityResult {
  const previousStable =
    previousState.stable;

  if (
    previousStable === null
  ) {
    throw new Error(
      "Cannot confirm a Stable Recommendation when no Stable Recommendation exists."
    );
  }

  const stable:
    RuntimeStableRecommendationSnapshot =
    policy.sameRecommendationRefreshesStableState
      ? {
          ...previousStable,

          action:
            candidate.action,

          score:
            candidate.score,

          lastConfirmedAt:
            evaluatedAt,

          observationCount:
            normalizeObservationCount(
              previousStable
                .observationCount
            ) + 1,
        }
      : {
          ...previousStable,

          lastConfirmedAt:
            evaluatedAt,

          observationCount:
            normalizeObservationCount(
              previousStable
                .observationCount
            ) + 1,
        };

  const state:
    RuntimeRecommendationStabilityState = {
      stable,

      /*
       * Stable Recommendation이 다시 확인되면
       * 기존 Challenger는 폐기합니다.
       */
      challenger:
        null,

      lastEvaluatedAt:
        evaluatedAt,

      transitionCount:
        previousState.transitionCount,
  };

  return {
    state,

    stableAction:
      stable.action,

    decision:
      "confirm-stable",

    reason:
      "The observed Candidate matches the current Stable Recommendation.",

    diagnostics:
      createDiagnostics({
        stable,

        challenger:
          null,

        thresholdSatisfied:
          true,

        dwellSatisfied:
          true,

        marginSatisfied:
          true,
      }),
  };
}

/* ------------------------------------------------------------------ */
/* Blocking Replacement */
/* ------------------------------------------------------------------ */

type CreateBlockingReplacementResultParams = {
  previousState:
    RuntimeRecommendationStabilityState;

  candidate:
    RuntimeRecommendationStabilityCandidate;

  candidateKey:
    string;

  evaluatedAt:
    string;
};

function createBlockingReplacementResult({
  previousState,
  candidate,
  candidateKey,
  evaluatedAt,
}: CreateBlockingReplacementResultParams):
  RuntimeRecommendationStabilityResult {
  const stable =
    createStableSnapshot({
      candidate,

      key:
        candidateKey,

      acceptedAt:
        evaluatedAt,

      observationCount:
        1,
    });

  const state:
    RuntimeRecommendationStabilityState = {
      stable,

      challenger:
        null,

      lastEvaluatedAt:
        evaluatedAt,

      transitionCount:
        previousState.transitionCount +
        1,
  };

  return {
    state,

    stableAction:
      stable.action,

    decision:
      "replace-by-blocking",

    reason:
      "A blocking Recommendation bypassed the normal Stability thresholds and immediately replaced the previous Stable Recommendation.",

    diagnostics:
      createDiagnostics({
        stable,

        challenger:
          null,

        thresholdSatisfied:
          true,

        dwellSatisfied:
          true,

        marginSatisfied:
          true,

        blockingBypass:
          true,
      }),
  };
}

/* ------------------------------------------------------------------ */
/* New Challenger */
/* ------------------------------------------------------------------ */

type CreateObserveNewChallengerResultParams = {
  previousState:
    RuntimeRecommendationStabilityState;

  candidate:
    RuntimeRecommendationStabilityCandidate;

  candidateKey:
    string;

  evaluatedAt:
    string;

  policy:
    RuntimeRecommendationStabilityPolicy;
};

function createObserveNewChallengerResult({
  previousState,
  candidate,
  candidateKey,
  evaluatedAt,
  policy,
}: CreateObserveNewChallengerResultParams):
  RuntimeRecommendationStabilityResult {
  const stable =
    previousState.stable;

  if (
    stable === null
  ) {
    throw new Error(
      "Cannot observe a Challenger without a Stable Recommendation."
    );
  }

  const challenger:
    RuntimeRecommendationChallengerState = {
      key:
        candidateKey,

      action:
        candidate.action,

      score:
        candidate.score,

      firstObservedAt:
        evaluatedAt,

      lastObservedAt:
        evaluatedAt,

      observationCount:
        1,

      scoreMargin:
        candidate.score -
        stable.score,
  };

  /*
   * requiredChallengerObservations가 1이고
   * 모든 dwell 정책이 0인 Immediate Test Policy에서는
   * 첫 관찰에서도 바로 승격될 수 있습니다.
   */
  const evaluation =
    evaluateChallengerPromotion({
      stable,

      challenger,

      policy,

      evaluatedAt,
    });

  if (
    evaluation.canPromote
  ) {
    return createPromoteChallengerResult({
      previousState,

      challenger,

      evaluatedAt,

      diagnostics:
        evaluation.diagnostics,
    });
  }

  const state:
    RuntimeRecommendationStabilityState = {
      ...previousState,

      challenger,

      lastEvaluatedAt:
        evaluatedAt,
  };

  return {
    state,

    stableAction:
      stable.action,

    decision:
      "observe-challenger",

    reason:
      createPendingChallengerReason(
        evaluation.diagnostics
      ),

    diagnostics:
      evaluation.diagnostics,
  };
}

/* ------------------------------------------------------------------ */
/* Existing Challenger Update */
/* ------------------------------------------------------------------ */

type UpdateExistingChallengerParams = {
  challenger:
    RuntimeRecommendationChallengerState;

  candidate:
    RuntimeRecommendationStabilityCandidate;

  stable:
    RuntimeStableRecommendationSnapshot;

  evaluatedAt:
    string;
};

function updateExistingChallenger({
  challenger,
  candidate,
  stable,
  evaluatedAt,
}: UpdateExistingChallengerParams):
  RuntimeRecommendationChallengerState {
  return {
    ...challenger,

    action:
      candidate.action,

    score:
      candidate.score,

    lastObservedAt:
      evaluatedAt,

    observationCount:
      normalizeObservationCount(
        challenger.observationCount
      ) + 1,

    scoreMargin:
      candidate.score -
      stable.score,
  };
}

/* ------------------------------------------------------------------ */
/* Challenger Promotion Evaluation */
/* ------------------------------------------------------------------ */

type EvaluateChallengerPromotionParams = {
  stable:
    RuntimeStableRecommendationSnapshot;

  challenger:
    RuntimeRecommendationChallengerState;

  policy:
    RuntimeRecommendationStabilityPolicy;

  evaluatedAt:
    string;
};

type ChallengerPromotionEvaluation = {
  canPromote:
    boolean;

  diagnostics:
    RuntimeRecommendationStabilityDiagnostics;
};

function evaluateChallengerPromotion({
  stable,
  challenger,
  policy,
  evaluatedAt,
}: EvaluateChallengerPromotionParams):
  ChallengerPromotionEvaluation {
  const evaluatedTimestamp =
    parseTimestamp(
      evaluatedAt
    );

  const challengerFirstObservedTimestamp =
    parseTimestamp(
      challenger.firstObservedAt
    );

  const stableAcceptedTimestamp =
    parseTimestamp(
      stable.acceptedAt
    );

  const challengerAgeMilliseconds =
    calculateElapsedMilliseconds({
      start:
        challengerFirstObservedTimestamp,

      end:
        evaluatedTimestamp,
    });

  const stableAgeMilliseconds =
    calculateElapsedMilliseconds({
      start:
        stableAcceptedTimestamp,

      end:
        evaluatedTimestamp,
    });

  const thresholdSatisfied =
    normalizeObservationCount(
      challenger.observationCount
    ) >=
    policy.requiredChallengerObservations;

  const marginSatisfied =
    normalizeFiniteNumber(
      challenger.scoreMargin
    ) >=
    policy.minimumScoreMargin;

  const challengerDwellSatisfied =
    challengerAgeMilliseconds !== null &&
    challengerAgeMilliseconds >=
      policy
        .minimumChallengerDwellMilliseconds;

  const stableDwellSatisfied =
    stableAgeMilliseconds !== null &&
    stableAgeMilliseconds >=
      policy
        .minimumStableDwellMilliseconds;

  const dwellSatisfied =
    challengerDwellSatisfied &&
    stableDwellSatisfied;

  const diagnostics =
    createDiagnostics({
      stable,

      challenger,

      challengerAgeMilliseconds,

      thresholdSatisfied,

      dwellSatisfied,

      marginSatisfied,

      blockingBypass:
        false,
    });

  return {
    canPromote:
      thresholdSatisfied &&
      marginSatisfied &&
      dwellSatisfied,

    diagnostics,
  };
}

/* ------------------------------------------------------------------ */
/* Promote Challenger */
/* ------------------------------------------------------------------ */

type CreatePromoteChallengerResultParams = {
  previousState:
    RuntimeRecommendationStabilityState;

  challenger:
    RuntimeRecommendationChallengerState;

  evaluatedAt:
    string;

  diagnostics:
    RuntimeRecommendationStabilityDiagnostics;
};

function createPromoteChallengerResult({
  previousState,
  challenger,
  evaluatedAt,
  diagnostics,
}: CreatePromoteChallengerResultParams):
  RuntimeRecommendationStabilityResult {
  const stable:
    RuntimeStableRecommendationSnapshot = {
      key:
        challenger.key,

      action:
        challenger.action,

      score:
        challenger.score,

      acceptedAt:
        evaluatedAt,

      lastConfirmedAt:
        evaluatedAt,

      observationCount:
        normalizeObservationCount(
          challenger.observationCount
        ),
  };

  const state:
    RuntimeRecommendationStabilityState = {
      stable,

      challenger:
        null,

      lastEvaluatedAt:
        evaluatedAt,

      transitionCount:
        previousState.transitionCount +
        1,
  };

  return {
    state,

    stableAction:
      stable.action,

    decision:
      "promote-challenger",

    reason:
      "The Challenger satisfied the score margin, observation threshold, and dwell-time requirements and was promoted to Stable Recommendation.",

    diagnostics: {
      ...diagnostics,

      stableKey:
        stable.key,

      challengerKey:
        null,

      stableScore:
        stable.score,

      challengerScore:
        null,

      scoreMargin:
        null,

      challengerObservationCount:
        0,

      challengerAgeMilliseconds:
        null,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Keep Stable with Challenger */
/* ------------------------------------------------------------------ */

type CreateKeepStableWithChallengerResultParams = {
  previousState:
    RuntimeRecommendationStabilityState;

  challenger:
    RuntimeRecommendationChallengerState;

  evaluatedAt:
    string;

  diagnostics:
    RuntimeRecommendationStabilityDiagnostics;

  reason:
    string;
};

function createKeepStableWithChallengerResult({
  previousState,
  challenger,
  evaluatedAt,
  diagnostics,
  reason,
}: CreateKeepStableWithChallengerResultParams):
  RuntimeRecommendationStabilityResult {
  const state:
    RuntimeRecommendationStabilityState = {
      ...previousState,

      challenger,

      lastEvaluatedAt:
        evaluatedAt,
  };

  return {
    state,

    stableAction:
      state.stable?.action ??
      null,

    decision:
      "keep-stable",

    reason,

    diagnostics,
  };
}

/* ------------------------------------------------------------------ */
/* Stable Snapshot */
/* ------------------------------------------------------------------ */

type CreateStableSnapshotParams = {
  candidate:
    RuntimeRecommendationStabilityCandidate;

  key:
    string;

  acceptedAt:
    string;

  observationCount:
    number;
};

function createStableSnapshot({
  candidate,
  key,
  acceptedAt,
  observationCount,
}: CreateStableSnapshotParams):
  RuntimeStableRecommendationSnapshot {
  return {
    key,

    action:
      candidate.action,

    score:
      candidate.score,

    acceptedAt,

    lastConfirmedAt:
      acceptedAt,

    observationCount:
      normalizeObservationCount(
        observationCount
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Diagnostics */
/* ------------------------------------------------------------------ */

type CreateDiagnosticsParams = {
  stable:
    RuntimeStableRecommendationSnapshot | null;

  challenger:
    RuntimeRecommendationChallengerState | null;

  challengerAgeMilliseconds?:
    number | null;

  thresholdSatisfied?:
    boolean;

  dwellSatisfied?:
    boolean;

  marginSatisfied?:
    boolean;

  blockingBypass?:
    boolean;
};

function createDiagnostics({
  stable,
  challenger,
  challengerAgeMilliseconds =
    null,
  thresholdSatisfied =
    false,
  dwellSatisfied =
    false,
  marginSatisfied =
    false,
  blockingBypass =
    false,
}: CreateDiagnosticsParams):
  RuntimeRecommendationStabilityDiagnostics {
  return {
    stableKey:
      stable?.key ??
      null,

    challengerKey:
      challenger?.key ??
      null,

    stableScore:
      stable?.score ??
      null,

    challengerScore:
      challenger?.score ??
      null,

    scoreMargin:
      challenger?.scoreMargin ??
      null,

    challengerObservationCount:
      challenger?.observationCount ??
      0,

    challengerAgeMilliseconds,

    thresholdSatisfied,

    dwellSatisfied,

    marginSatisfied,

    blockingBypass,
  };
}

function createEmptyDiagnostics():
  RuntimeRecommendationStabilityDiagnostics {
  return {
    stableKey:
      null,

    challengerKey:
      null,

    stableScore:
      null,

    challengerScore:
      null,

    scoreMargin:
      null,

    challengerObservationCount:
      0,

    challengerAgeMilliseconds:
      null,

    thresholdSatisfied:
      false,

    dwellSatisfied:
      false,

    marginSatisfied:
      false,

    blockingBypass:
      false,
  };
}

/* ------------------------------------------------------------------ */
/* Pending Reason */
/* ------------------------------------------------------------------ */

function createPendingChallengerReason(
  diagnostics:
    RuntimeRecommendationStabilityDiagnostics
): string {
  const reasons:
    string[] = [];

  if (
    !diagnostics.marginSatisfied
  ) {
    reasons.push(
      "the score margin is below the required threshold"
    );
  }

  if (
    !diagnostics.thresholdSatisfied
  ) {
    reasons.push(
      "the Challenger has not reached the required observation count"
    );
  }

  if (
    !diagnostics.dwellSatisfied
  ) {
    reasons.push(
      "the Challenger or Stable Recommendation has not satisfied the minimum dwell time"
    );
  }

  if (
    reasons.length === 0
  ) {
    return "The current Stable Recommendation was retained.";
  }

  return `The current Stable Recommendation was retained because ${joinReasons(
    reasons
  )}.`;
}

function joinReasons(
  reasons:
    string[]
): string {
  if (
    reasons.length === 0
  ) {
    return "";
  }

  if (
    reasons.length === 1
  ) {
    return reasons[0];
  }

  if (
    reasons.length === 2
  ) {
    return `${reasons[0]} and ${reasons[1]}`;
  }

  return `${reasons
    .slice(
      0,
      -1
    )
    .join(", ")}, and ${
    reasons[
      reasons.length -
      1
    ]
  }`;
}

/* ------------------------------------------------------------------ */
/* State Normalization */
/* ------------------------------------------------------------------ */

function normalizeRuntimeRecommendationStabilityState(
  state:
    RuntimeRecommendationStabilityState
): RuntimeRecommendationStabilityState {
  return {
    stable:
      state.stable,

    challenger:
      state.challenger,

    lastEvaluatedAt:
      normalizeTimestampOrNull(
        state.lastEvaluatedAt
      ),

    transitionCount:
      normalizeNonNegativeInteger(
        state.transitionCount
      ),
  };
}

function normalizeStabilityCandidate(
  candidate:
    RuntimeRecommendationStabilityCandidate
): RuntimeRecommendationStabilityCandidate {
  return {
    action:
      candidate.action,

    score:
      normalizeFiniteNumber(
        candidate.score
      ),

    priorityClass:
      candidate.priorityClass ===
      "blocking"
        ? "blocking"
        : "normal",

    contextRevision:
      normalizeContextRevision(
        candidate.contextRevision
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Timestamp Helpers */
/* ------------------------------------------------------------------ */

function normalizeEvaluatedAt(
  value:
    string
): string {
  const timestamp =
    parseTimestamp(
      value
    );

  if (
    timestamp === null
  ) {
    return new Date().toISOString();
  }

  return new Date(
    timestamp
  ).toISOString();
}

function normalizeTimestampOrNull(
  value:
    string | null
): string | null {
  const timestamp =
    parseTimestamp(
      value
    );

  return timestamp === null
    ? null
    : new Date(
        timestamp
      ).toISOString();
}

function parseTimestamp(
  value:
    string | null | undefined
): number | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  if (
    normalized.length === 0
  ) {
    return null;
  }

  const timestamp =
    Date.parse(
      normalized
    );

  if (
    !Number.isFinite(
      timestamp
    )
  ) {
    return null;
  }

  return timestamp;
}

type CalculateElapsedMillisecondsParams = {
  start:
    number | null;

  end:
    number | null;
};

function calculateElapsedMilliseconds({
  start,
  end,
}: CalculateElapsedMillisecondsParams):
  number | null {
  if (
    start === null ||
    end === null
  ) {
    return null;
  }

  return Math.max(
    0,
    end -
    start
  );
}

/* ------------------------------------------------------------------ */
/* Number Helpers */
/* ------------------------------------------------------------------ */

function normalizeFiniteNumber(
  value:
    number
): number {
  return Number.isFinite(
    value
  )
    ? value
    : 0;
}

function normalizeObservationCount(
  value:
    number
): number {
  return Math.max(
    1,
    normalizeNonNegativeInteger(
      value
    )
  );
}

function normalizeNonNegativeInteger(
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

/* ------------------------------------------------------------------ */
/* Text Helpers */
/* ------------------------------------------------------------------ */

function normalizeContextRevision(
  value:
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
    : "unknown-context";
}