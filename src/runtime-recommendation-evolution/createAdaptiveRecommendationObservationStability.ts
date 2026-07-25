import type {
    RuntimeRecommendationAdaptiveObservationHistory,
} from "./createAdaptiveRecommendationObservationHistory";

import {
    normalizeGeneratedAt,
} from "./runtimeRecommendationMath";

import type {
    RuntimeRecommendationAdaptiveObservation,
} from "./createAdaptiveRecommendationObservation";

/* ------------------------------------------------------------------ */
/* Stability Policy */
/* ------------------------------------------------------------------ */

/**
 * Adaptive Recommendation Observation Stability 계산 정책입니다.
 *
 * Stability는 시간순 Observation에서 Adaptive Winner가
 * 얼마나 지속적으로 유지되는지를 분석합니다.
 *
 * PR-046D에서는 Stability 결과를 RuntimeNextAction 결정에
 * 사용하지 않습니다.
 */
export type RuntimeRecommendationAdaptiveObservationStabilityPolicy = {
  /**
   * Stability 계산에 필요한 최소 비교 가능 Observation 개수입니다.
   *
   * 이 개수보다 적으면 insufficient-data 상태를 반환합니다.
   */
  minimumComparableObservationCount:
    number;

  /**
   * unstable과 emerging을 구분하는 Repeat Rate 기준입니다.
   *
   * repeatRate가 이 값보다 작으면 unstable입니다.
   */
  emergingRepeatRateThreshold:
    number;

  /**
   * emerging과 stable을 구분하는 Repeat Rate 기준입니다.
   *
   * repeatRate가 이 값 이상이면 stable입니다.
   */
  stableRepeatRateThreshold:
    number;

  /**
   * Rate 결과의 소수점 자리 수입니다.
   */
  decimalPlaces:
    number;
};

export type PartialRuntimeRecommendationAdaptiveObservationStabilityPolicy = {
  minimumComparableObservationCount?:
    number;

  emergingRepeatRateThreshold?:
    number;

  stableRepeatRateThreshold?:
    number;

  decimalPlaces?:
    number;
};

/* ------------------------------------------------------------------ */
/* Default Policy */
/* ------------------------------------------------------------------ */

export const DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_STABILITY_POLICY:
  RuntimeRecommendationAdaptiveObservationStabilityPolicy = {
    minimumComparableObservationCount:
      3,

    emergingRepeatRateThreshold:
      0.5,

    stableRepeatRateThreshold:
      0.8,

    decimalPlaces:
      4,
  };

/* ------------------------------------------------------------------ */
/* Stability Status */
/* ------------------------------------------------------------------ */

/**
 * Stability 계산 자체의 처리 상태입니다.
 */
export type RuntimeRecommendationAdaptiveObservationStabilityStatus =
  | "calculated"
  | "partial"
  | "insufficient-data";

/**
 * Stability 처리 상태의 원인입니다.
 */
export type RuntimeRecommendationAdaptiveObservationStabilityReason =
  | "adaptive-winner-sequence-analyzed"
  | "history-contains-incomplete-observations"
  | "no-observations"
  | "no-comparable-observations"
  | "not-enough-comparable-observations";

/* ------------------------------------------------------------------ */
/* Stability Level */
/* ------------------------------------------------------------------ */

/**
 * Adaptive Winner 지속성에 대한 해석 수준입니다.
 *
 * 이는 Recommendation의 정확도나 신뢰도를 의미하지 않습니다.
 * Observation History에서 Winner가 얼마나 반복적으로 유지되었는지만
 * 설명합니다.
 */
export type RuntimeRecommendationAdaptiveObservationStabilityLevel =
  | "insufficient-data"
  | "unstable"
  | "emerging"
  | "stable";

/* ------------------------------------------------------------------ */
/* Candidate Stability Frequency */
/* ------------------------------------------------------------------ */

/**
 * Candidate별 Adaptive Winner 등장 빈도와 연속 기록입니다.
 */
export type RuntimeRecommendationAdaptiveWinnerStabilityFrequency = {
  candidateId:
    string;

  occurrenceCount:
    number;

  occurrenceRate:
    number;

  longestStreak:
    number;

  latestStreak:
    number;
};

/* ------------------------------------------------------------------ */
/* Stability */
/* ------------------------------------------------------------------ */

/**
 * Observation History에서 계산한 Adaptive Winner Stability 결과입니다.
 */
export type RuntimeRecommendationAdaptiveObservationStability = {
  /**
   * History에 포함된 전체 Observation 개수입니다.
   */
  observationCount:
    number;

  /**
   * Adaptive Candidate ID가 존재하여 Stability 계산에
   * 사용할 수 있는 Observation 개수입니다.
   */
  comparableObservationCount:
    number;

  /**
   * Adaptive Candidate ID가 없어 Stability 계산에서
   * 제외된 Observation 개수입니다.
   */
  incompleteObservationCount:
    number;

  /**
   * 인접한 두 비교 가능 Observation에서
   * Adaptive Winner가 동일했던 횟수입니다.
   */
  adaptiveWinnerRepeatCount:
    number;

  /**
   * 인접한 두 비교 가능 Observation에서
   * Adaptive Winner가 변경된 횟수입니다.
   */
  adaptiveWinnerSwitchCount:
    number;

  /**
   * 비교 가능한 인접 Observation 쌍의 개수입니다.
   *
   * 일반적으로 comparableObservationCount - 1입니다.
   */
  adaptiveWinnerTransitionCount:
    number;

  /**
   * Adaptive Winner가 이전 Observation과 동일했던 비율입니다.
   */
  adaptiveWinnerRepeatRate:
    number | null;

  /**
   * Adaptive Winner가 이전 Observation과 달라진 비율입니다.
   */
  adaptiveWinnerSwitchRate:
    number | null;

  /**
   * 전체 History에서 가장 길게 유지된 Adaptive Winner 연속 횟수입니다.
   */
  longestAdaptiveWinnerStreak:
    number;

  /**
   * 가장 최근 Adaptive Winner의 현재 연속 횟수입니다.
   */
  currentAdaptiveWinnerStreak:
    number;

  /**
   * 가장 최근의 Adaptive Winner Candidate ID입니다.
   */
  currentAdaptiveWinnerCandidateId:
    string | null;

  /**
   * 가장 긴 연속 기록을 가진 Candidate ID입니다.
   *
   * 동률인 경우 시간상 먼저 해당 Streak에 도달한 Candidate를 사용합니다.
   */
  longestStreakCandidateId:
    string | null;

  /**
   * Candidate별 Adaptive Winner 등장 및 연속 기록입니다.
   */
  candidateFrequencies:
    RuntimeRecommendationAdaptiveWinnerStabilityFrequency[];

  level:
    RuntimeRecommendationAdaptiveObservationStabilityLevel;

  status:
    RuntimeRecommendationAdaptiveObservationStabilityStatus;

  reason:
    RuntimeRecommendationAdaptiveObservationStabilityReason;
};

/* ------------------------------------------------------------------ */
/* Diagnostics */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveObservationStabilityDiagnostics = {
  generatedAt:
    string;

  observationCount:
    number;

  comparableObservationCount:
    number;

  incompleteObservationCount:
    number;

  transitionCount:
    number;

  candidateCount:
    number;

  firstComparableObservedAt:
    string | null;

  lastComparableObservedAt:
    string | null;

  warningCount:
    number;

  warnings:
    string[];
};

/* ------------------------------------------------------------------ */
/* Result */
/* ------------------------------------------------------------------ */

export type CreateAdaptiveRecommendationObservationStabilityResult = {
  stability:
    RuntimeRecommendationAdaptiveObservationStability;

  diagnostics:
    RuntimeRecommendationAdaptiveObservationStabilityDiagnostics;

  policy:
    RuntimeRecommendationAdaptiveObservationStabilityPolicy;
};

/* ------------------------------------------------------------------ */
/* Public Input */
/* ------------------------------------------------------------------ */

export type CreateAdaptiveRecommendationObservationStabilityParams = {
  history:
    RuntimeRecommendationAdaptiveObservationHistory;

  policy?:
    PartialRuntimeRecommendationAdaptiveObservationStabilityPolicy;

  /**
   * 테스트 또는 회귀 검증에서 결정적인 시각을 사용할 때 전달합니다.
   */
  generatedAt?:
    string;
};

/* ------------------------------------------------------------------ */
/* Public API */
/* ------------------------------------------------------------------ */

/**
 * Observation History에서 Adaptive Winner Stability를 계산합니다.
 *
 * 이 함수는 다음을 수행하지 않습니다.
 *
 * - Observation 추가 또는 제거
 * - History 정렬 변경
 * - Adaptive Winner 변경
 * - RuntimeNextAction 변경
 * - Drift 계산
 * - Confidence 계산
 * - Runtime Policy 조정
 */
export function createAdaptiveRecommendationObservationStability({
  history,
  policy,
  generatedAt,
}: CreateAdaptiveRecommendationObservationStabilityParams):
  CreateAdaptiveRecommendationObservationStabilityResult {
  const normalizedPolicy =
    normalizeRuntimeRecommendationAdaptiveObservationStabilityPolicy(
      policy
    );

  return createAdaptiveRecommendationObservationStabilityWithPolicy({
    history,

    generatedAt:
      normalizeGeneratedAt(
        generatedAt
      ),

    policy:
      normalizedPolicy,
  });
}

/* ------------------------------------------------------------------ */
/* Policy Normalization */
/* ------------------------------------------------------------------ */

export function normalizeRuntimeRecommendationAdaptiveObservationStabilityPolicy(
  policy?:
    PartialRuntimeRecommendationAdaptiveObservationStabilityPolicy
): RuntimeRecommendationAdaptiveObservationStabilityPolicy {
  const fallback =
    DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_STABILITY_POLICY;

  const minimumComparableObservationCount =
    normalizePositiveStabilityInteger(
      policy?.minimumComparableObservationCount,
      fallback.minimumComparableObservationCount
    );

  const emergingRepeatRateThreshold =
    normalizeStabilityRateThreshold(
      policy?.emergingRepeatRateThreshold,
      fallback.emergingRepeatRateThreshold
    );

  const requestedStableRepeatRateThreshold =
    normalizeStabilityRateThreshold(
      policy?.stableRepeatRateThreshold,
      fallback.stableRepeatRateThreshold
    );

  const stableRepeatRateThreshold =
    Math.max(
      emergingRepeatRateThreshold,
      requestedStableRepeatRateThreshold
    );

  const decimalPlaces =
    normalizeStabilityDecimalPlaces(
      policy?.decimalPlaces,
      fallback.decimalPlaces
    );

  return {
    minimumComparableObservationCount,

    emergingRepeatRateThreshold,

    stableRepeatRateThreshold,

    decimalPlaces,
  };
}

/* ------------------------------------------------------------------ */
/* Policy Clone */
/* ------------------------------------------------------------------ */

export function cloneRuntimeRecommendationAdaptiveObservationStabilityPolicy(
  policy:
    RuntimeRecommendationAdaptiveObservationStabilityPolicy
): RuntimeRecommendationAdaptiveObservationStabilityPolicy {
  return {
    minimumComparableObservationCount:
      policy.minimumComparableObservationCount,

    emergingRepeatRateThreshold:
      policy.emergingRepeatRateThreshold,

    stableRepeatRateThreshold:
      policy.stableRepeatRateThreshold,

    decimalPlaces:
      policy.decimalPlaces,
  };
}

/* ------------------------------------------------------------------ */
/* Internal Function Contract */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationObservationStabilityWithPolicyParams = {
  history:
    RuntimeRecommendationAdaptiveObservationHistory;

  generatedAt:
    string;

  policy:
    RuntimeRecommendationAdaptiveObservationStabilityPolicy;
};

/* ------------------------------------------------------------------ */
/* Primitive Policy Helpers */
/* ------------------------------------------------------------------ */

function normalizePositiveStabilityInteger(
  value:
    number | undefined,
  fallback:
    number
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(
      value
    )
  ) {
    return fallback;
  }

  return Math.max(
    1,
    Math.floor(
      value
    )
  );
}

function normalizeStabilityRateThreshold(
  value:
    number | undefined,
  fallback:
    number
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(
      value
    )
  ) {
    return fallback;
  }

  return Math.min(
    1,
    Math.max(
      0,
      value
    )
  );
}

function normalizeStabilityDecimalPlaces(
  value:
    number | undefined,
  fallback:
    number
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(
      value
    )
  ) {
    return fallback;
  }

  return Math.max(
    0,
    Math.min(
      8,
      Math.floor(
        value
      )
    )
  );
}

/* ------------------------------------------------------------------ */
/* Stability Builder */
/* ------------------------------------------------------------------ */

function createAdaptiveRecommendationObservationStabilityWithPolicy({
  history,
  generatedAt,
  policy,
}: CreateAdaptiveRecommendationObservationStabilityWithPolicyParams):
  CreateAdaptiveRecommendationObservationStabilityResult {

  const warnings: string[] = [];

  validateAdaptiveRecommendationObservationStabilityInput({
    history,
    warnings,
  });

  const comparableObservations =
    history.observations.filter(
      isComparableAdaptiveRecommendationObservation
    );

  const incompleteObservationCount =
    history.observations.length -
    comparableObservations.length;

  return createAdaptiveRecommendationObservationStabilityContinuation({
    history,

    comparableObservations,

    incompleteObservationCount,

    generatedAt,

    policy,

    warnings,
  });
}

/* ------------------------------------------------------------------ */
/* Builder Continuation Contract */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationObservationStabilityContinuationParams = {
  history:
    RuntimeRecommendationAdaptiveObservationHistory;

  comparableObservations:
    RuntimeRecommendationAdaptiveObservation[];

  incompleteObservationCount:
    number;

  generatedAt:
    string;

  policy:
    RuntimeRecommendationAdaptiveObservationStabilityPolicy;

  warnings:
    string[];
};

/* ------------------------------------------------------------------ */
/* Transition */
/* ------------------------------------------------------------------ */

type AdaptiveWinnerTransitionResult = {
  repeatCount:
    number;

  switchCount:
    number;

  transitionCount:
    number;
};

function calculateAdaptiveWinnerTransitions(
  observations:
    RuntimeRecommendationAdaptiveObservation[]
):
  AdaptiveWinnerTransitionResult {

  if (
    observations.length < 2
  ) {
    return {
      repeatCount: 0,

      switchCount: 0,

      transitionCount: 0,
    };
  }

  let repeatCount = 0;

  let switchCount = 0;

  for (
    let index = 1;
    index < observations.length;
    index++
  ) {

    const previous =
      observations[
        index - 1
      ];

    const current =
      observations[
        index
      ];

    if (
      previous.adaptiveCandidateId ===
      current.adaptiveCandidateId
    ) {

      repeatCount++;

    } else {

      switchCount++;

    }
  }

  return {

    repeatCount,

    switchCount,

    transitionCount:
      observations.length - 1,
  };
}

/* ------------------------------------------------------------------ */
/* Builder Continuation */
/* ------------------------------------------------------------------ */

function createAdaptiveRecommendationObservationStabilityContinuation({
  history,
  comparableObservations,
  incompleteObservationCount,
  generatedAt,
  policy,
  warnings,
}: CreateAdaptiveRecommendationObservationStabilityContinuationParams):
  CreateAdaptiveRecommendationObservationStabilityResult {
  const chronologicalObservations =
    sortAdaptiveRecommendationObservationsChronologically(
      comparableObservations
    );

  /*
   * Stability는 History의 저장 정렬 방향과 관계없이
   * 시간순으로 정규화된 Observation Sequence를 기준으로
   * Transition을 계산합니다.
   */
  const transition =
    calculateAdaptiveWinnerTransitions(
      chronologicalObservations
    );

  const streak =
    calculateAdaptiveWinnerStreaks(
      chronologicalObservations
    );

  const candidateFrequencies =
    createAdaptiveWinnerStabilityFrequencies({
      candidateStreaks:
        streak.candidateStreaks,

      comparableObservationCount:
        chronologicalObservations.length,

      decimalPlaces:
        policy.decimalPlaces,
    });

  return createAdaptiveRecommendationObservationStabilityResult({
    history,

    comparableObservations:
      chronologicalObservations,

    transition,

    streak,

    candidateFrequencies,

    incompleteObservationCount,

    generatedAt,

    policy,

    warnings,
  });
}

/* ------------------------------------------------------------------ */
/* Final Builder Contract */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationObservationStabilityResultParams = {
  history:
    RuntimeRecommendationAdaptiveObservationHistory;

  comparableObservations:
    RuntimeRecommendationAdaptiveObservation[];

  transition:
    AdaptiveWinnerTransitionResult;

  streak:
    AdaptiveWinnerStreakResult;

  candidateFrequencies:
    RuntimeRecommendationAdaptiveWinnerStabilityFrequency[];

  incompleteObservationCount:
    number;

  generatedAt:
    string;

  policy:
    RuntimeRecommendationAdaptiveObservationStabilityPolicy;

  warnings:
    string[];
};

/* ------------------------------------------------------------------ */
/* Chronological Ordering */
/* ------------------------------------------------------------------ */

/**
 * Stability는 Observation History의 저장 정렬 정책과 관계없이
 * 과거에서 현재로 이어지는 시간 흐름을 기준으로 계산합니다.
 *
 * 원본 배열은 변경하지 않습니다.
 */
function sortAdaptiveRecommendationObservationsChronologically(
  observations:
    RuntimeRecommendationAdaptiveObservation[]
):
  RuntimeRecommendationAdaptiveObservation[] {
  return [
    ...observations,
  ].sort(
    (
      left,
      right
    ) => {
      const leftTime =
        Date.parse(
          left.generatedAt
        );

      const rightTime =
        Date.parse(
          right.generatedAt
        );

      const leftTimeIsValid =
        Number.isFinite(
          leftTime
        );

      const rightTimeIsValid =
        Number.isFinite(
          rightTime
        );

      if (
        leftTimeIsValid &&
        rightTimeIsValid &&
        leftTime !== rightTime
      ) {
        return (
          leftTime -
          rightTime
        );
      }

      if (
        leftTimeIsValid &&
        !rightTimeIsValid
      ) {
        return -1;
      }

      if (
        !leftTimeIsValid &&
        rightTimeIsValid
      ) {
        return 1;
      }

      return left.observationId.localeCompare(
        right.observationId
      );
    }
  );
}

/* ------------------------------------------------------------------ */
/* Streak Result */
/* ------------------------------------------------------------------ */

type AdaptiveWinnerStreakResult = {
  longestStreak:
    number;

  currentStreak:
    number;

  currentCandidateId:
    string | null;

  longestStreakCandidateId:
    string | null;

  candidateStreaks:
    Record<
      string,
      AdaptiveWinnerCandidateStreakAccumulator
    >;
};

type AdaptiveWinnerCandidateStreakAccumulator = {
  /**
   * 전체 Observation Sequence에서 Candidate가 등장한 총 횟수입니다.
   */
  occurrenceCount:
    number;

  /**
   * Candidate가 기록한 가장 긴 연속 등장 횟수입니다.
   */
  longestStreak:
    number;

  /**
   * Candidate가 가장 최근에 등장했던 연속 구간의 길이입니다.
   *
   * 현재 Sequence의 마지막 Candidate인 경우에는
   * 현재 진행 중인 Streak 길이입니다.
   */
  latestStreak:
    number;
};

/* ------------------------------------------------------------------ */
/* Streak Calculation */
/* ------------------------------------------------------------------ */

function calculateAdaptiveWinnerStreaks(
  observations:
    RuntimeRecommendationAdaptiveObservation[]
):
  AdaptiveWinnerStreakResult {

  const candidateStreaks:
    Record<
      string,
      AdaptiveWinnerCandidateStreakAccumulator
    > = {};

  if (
    observations.length === 0
  ) {
    return {
      longestStreak: 0,

      currentStreak: 0,

      currentCandidateId: null,

      longestStreakCandidateId: null,

      candidateStreaks,
    };
  }

  let activeCandidateId:
    string | null = null;

  let activeLength =
    0;

  let longestStreak =
    0;

  let longestStreakCandidateId:
    string | null = null;

  const commitActiveRun = () => {

    if (
      activeCandidateId === null ||
      activeLength <= 0
    ) {
      return;
    }

    const accumulator =
      candidateStreaks[
        activeCandidateId
      ];

    accumulator.latestStreak =
      activeLength;

    if (
      activeLength >
      accumulator.longestStreak
    ) {
      accumulator.longestStreak =
        activeLength;
    }

    if (
      activeLength >
      longestStreak
    ) {
      longestStreak =
        activeLength;

      longestStreakCandidateId =
        activeCandidateId;
    }
  };

  for (
    const observation of
    observations
  ) {

    const candidateId =
      observation.adaptiveCandidateId;

    if (
      candidateId === null
    ) {
      continue;
    }

    const accumulator =
      getOrCreateAdaptiveWinnerCandidateStreakAccumulator({
        candidateId,
        candidateStreaks,
      });

    accumulator.occurrenceCount++;

    if (
      activeCandidateId ===
      candidateId
    ) {

      activeLength++;

      continue;
    }

    commitActiveRun();

    activeCandidateId =
      candidateId;

    activeLength =
      1;
  }

  commitActiveRun();

  return {
    longestStreak,

    currentStreak:
      activeLength,

    currentCandidateId:
      activeCandidateId,

    longestStreakCandidateId,

    candidateStreaks,
  };
}

/* ------------------------------------------------------------------ */
/* Candidate Accumulator */
/* ------------------------------------------------------------------ */

type GetOrCreateAdaptiveWinnerCandidateStreakAccumulatorParams = {
  candidateId:
    string;

  candidateStreaks:
    Record<
      string,
      AdaptiveWinnerCandidateStreakAccumulator
    >;
};

function getOrCreateAdaptiveWinnerCandidateStreakAccumulator({
  candidateId,
  candidateStreaks,
}: GetOrCreateAdaptiveWinnerCandidateStreakAccumulatorParams):
  AdaptiveWinnerCandidateStreakAccumulator {
  const existingAccumulator =
    candidateStreaks[
      candidateId
    ];

  if (
    existingAccumulator !== undefined
  ) {
    return existingAccumulator;
  }

  const accumulator:
    AdaptiveWinnerCandidateStreakAccumulator = {
      occurrenceCount:
        0,

      longestStreak:
        0,

      latestStreak:
        0,
  };

  candidateStreaks[
    candidateId
  ] =
    accumulator;

  return accumulator;
}

/* ------------------------------------------------------------------ */
/* Candidate Frequency */
/* ------------------------------------------------------------------ */

type CreateAdaptiveWinnerStabilityFrequenciesParams = {
  candidateStreaks:
    Record<
      string,
      AdaptiveWinnerCandidateStreakAccumulator
    >;

  comparableObservationCount:
    number;

  decimalPlaces:
    number;
};

function createAdaptiveWinnerStabilityFrequencies({
  candidateStreaks,
  comparableObservationCount,
  decimalPlaces,
}: CreateAdaptiveWinnerStabilityFrequenciesParams):
  RuntimeRecommendationAdaptiveWinnerStabilityFrequency[] {
  if (
    comparableObservationCount <=
    0
  ) {
    return [];
  }

  return Object.entries(
    candidateStreaks
  )
    .map(
      (
        [
          candidateId,
          accumulator,
        ]
      ):
        RuntimeRecommendationAdaptiveWinnerStabilityFrequency => ({
        candidateId,

        occurrenceCount:
          accumulator.occurrenceCount,

        occurrenceRate:
          calculateAdaptiveWinnerStabilityRate({
            numerator:
              accumulator.occurrenceCount,

            denominator:
              comparableObservationCount,

            decimalPlaces,
          }),

        longestStreak:
          accumulator.longestStreak,

        latestStreak:
          accumulator.latestStreak,
      })
    )
    .sort(
      (
        left,
        right
      ) => {
        if (
          left.occurrenceCount !==
          right.occurrenceCount
        ) {
          return (
            right.occurrenceCount -
            left.occurrenceCount
          );
        }

        if (
          left.longestStreak !==
          right.longestStreak
        ) {
          return (
            right.longestStreak -
            left.longestStreak
          );
        }

        if (
          left.latestStreak !==
          right.latestStreak
        ) {
          return (
            right.latestStreak -
            left.latestStreak
          );
        }

        return left.candidateId.localeCompare(
          right.candidateId
        );
      }
    );
}

/* ------------------------------------------------------------------ */
/* Rate Helper */
/* ------------------------------------------------------------------ */

type CalculateAdaptiveWinnerStabilityRateParams = {
  numerator:
    number;

  denominator:
    number;

  decimalPlaces:
    number;
};

function calculateAdaptiveWinnerStabilityRate({
  numerator,
  denominator,
  decimalPlaces,
}: CalculateAdaptiveWinnerStabilityRateParams):
  number {
  if (
    denominator <=
    0
  ) {
    return 0;
  }

  return roundAdaptiveWinnerStabilityNumber(
    numerator /
      denominator,

    decimalPlaces
  );
}

function roundAdaptiveWinnerStabilityNumber(
  value:
    number,
  decimalPlaces:
    number
): number {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return 0;
  }

  const multiplier =
    10 **
    decimalPlaces;

  return (
    Math.round(
      (
        value +
        Number.EPSILON
      ) *
      multiplier
    ) /
    multiplier
  );
}

/* ------------------------------------------------------------------ */
/* Stability Result Builder */
/* ------------------------------------------------------------------ */

function createAdaptiveRecommendationObservationStabilityResult({
  history,
  comparableObservations,
  transition,
  streak,
  candidateFrequencies,
  incompleteObservationCount,
  generatedAt,
  policy,
  warnings,
}: CreateAdaptiveRecommendationObservationStabilityResultParams):
  CreateAdaptiveRecommendationObservationStabilityResult {
  const observationCount =
    history.observations.length;

  const comparableObservationCount =
    comparableObservations.length;

  const adaptiveWinnerRepeatRate =
    calculateNullableAdaptiveWinnerStabilityRate({
      numerator:
        transition.repeatCount,

      denominator:
        transition.transitionCount,

      decimalPlaces:
        policy.decimalPlaces,
    });

  const adaptiveWinnerSwitchRate =
    calculateNullableAdaptiveWinnerStabilityRate({
      numerator:
        transition.switchCount,

      denominator:
        transition.transitionCount,

      decimalPlaces:
        policy.decimalPlaces,
    });

  const status =
    resolveAdaptiveRecommendationObservationStabilityStatus({
      observationCount,

      comparableObservationCount,

      incompleteObservationCount,

      minimumComparableObservationCount:
        policy.minimumComparableObservationCount,
    });

  const reason =
    resolveAdaptiveRecommendationObservationStabilityReason({
      observationCount,

      comparableObservationCount,

      incompleteObservationCount,

      minimumComparableObservationCount:
        policy.minimumComparableObservationCount,
    });

  const level =
    resolveAdaptiveRecommendationObservationStabilityLevel({
      comparableObservationCount,

      adaptiveWinnerRepeatRate,

      policy,
    });

  const stability:
    RuntimeRecommendationAdaptiveObservationStability = {
    observationCount,

    comparableObservationCount,

    incompleteObservationCount,

    adaptiveWinnerRepeatCount:
      transition.repeatCount,

    adaptiveWinnerSwitchCount:
      transition.switchCount,

    adaptiveWinnerTransitionCount:
      transition.transitionCount,

    adaptiveWinnerRepeatRate,

    adaptiveWinnerSwitchRate,

    longestAdaptiveWinnerStreak:
      streak.longestStreak,

    currentAdaptiveWinnerStreak:
      streak.currentStreak,

    currentAdaptiveWinnerCandidateId:
      streak.currentCandidateId,

    longestStreakCandidateId:
      streak.longestStreakCandidateId,

    candidateFrequencies,

    level,

    status,

    reason,
  };

  validateAdaptiveRecommendationObservationStabilityResult({
    stability,

    warnings,
  });

  const diagnostics =
    createAdaptiveRecommendationObservationStabilityDiagnostics({
      stability,

      history,

      comparableObservations,

      generatedAt,

      warnings,
    });

  return {
    stability:
      cloneRuntimeRecommendationAdaptiveObservationStability(
        stability
      ),

    diagnostics:
      cloneRuntimeRecommendationAdaptiveObservationStabilityDiagnostics(
        diagnostics
      ),

    policy:
      cloneRuntimeRecommendationAdaptiveObservationStabilityPolicy(
        policy
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Stability Status */
/* ------------------------------------------------------------------ */

type ResolveAdaptiveRecommendationObservationStabilityStateParams = {
  observationCount:
    number;

  comparableObservationCount:
    number;

  incompleteObservationCount:
    number;

  minimumComparableObservationCount:
    number;
};

function resolveAdaptiveRecommendationObservationStabilityStatus({
  observationCount,
  comparableObservationCount,
  incompleteObservationCount,
  minimumComparableObservationCount,
}: ResolveAdaptiveRecommendationObservationStabilityStateParams):
  RuntimeRecommendationAdaptiveObservationStabilityStatus {
  if (
    observationCount === 0 ||
    comparableObservationCount === 0 ||
    comparableObservationCount <
      minimumComparableObservationCount
  ) {
    return "insufficient-data";
  }

  if (
    incompleteObservationCount > 0
  ) {
    return "partial";
  }

  return "calculated";
}

/* ------------------------------------------------------------------ */
/* Stability Reason */
/* ------------------------------------------------------------------ */

function resolveAdaptiveRecommendationObservationStabilityReason({
  observationCount,
  comparableObservationCount,
  incompleteObservationCount,
  minimumComparableObservationCount,
}: ResolveAdaptiveRecommendationObservationStabilityStateParams):
  RuntimeRecommendationAdaptiveObservationStabilityReason {
  if (
    observationCount === 0
  ) {
    return "no-observations";
  }

  if (
    comparableObservationCount === 0
  ) {
    return "no-comparable-observations";
  }

  if (
    comparableObservationCount <
    minimumComparableObservationCount
  ) {
    return "not-enough-comparable-observations";
  }

  if (
    incompleteObservationCount > 0
  ) {
    return "history-contains-incomplete-observations";
  }

  return "adaptive-winner-sequence-analyzed";
}

/* ------------------------------------------------------------------ */
/* Stability Level */
/* ------------------------------------------------------------------ */

type ResolveAdaptiveRecommendationObservationStabilityLevelParams = {
  comparableObservationCount:
    number;

  adaptiveWinnerRepeatRate:
    number | null;

  policy:
    RuntimeRecommendationAdaptiveObservationStabilityPolicy;
};

function resolveAdaptiveRecommendationObservationStabilityLevel({
  comparableObservationCount,
  adaptiveWinnerRepeatRate,
  policy,
}: ResolveAdaptiveRecommendationObservationStabilityLevelParams):
  RuntimeRecommendationAdaptiveObservationStabilityLevel {
  if (
    comparableObservationCount <
      policy.minimumComparableObservationCount ||
    adaptiveWinnerRepeatRate === null
  ) {
    return "insufficient-data";
  }

  if (
    adaptiveWinnerRepeatRate >=
    policy.stableRepeatRateThreshold
  ) {
    return "stable";
  }

  if (
    adaptiveWinnerRepeatRate >=
    policy.emergingRepeatRateThreshold
  ) {
    return "emerging";
  }

  return "unstable";
}

/* ------------------------------------------------------------------ */
/* Nullable Rate */
/* ------------------------------------------------------------------ */

type CalculateNullableAdaptiveWinnerStabilityRateParams = {
  numerator:
    number;

  denominator:
    number;

  decimalPlaces:
    number;
};

function calculateNullableAdaptiveWinnerStabilityRate({
  numerator,
  denominator,
  decimalPlaces,
}: CalculateNullableAdaptiveWinnerStabilityRateParams):
  number | null {
  if (
    denominator <= 0
  ) {
    return null;
  }

  return roundAdaptiveWinnerStabilityNumber(
    numerator /
      denominator,

    decimalPlaces
  );
}

/* ------------------------------------------------------------------ */
/* Validation */
/* ------------------------------------------------------------------ */

type ValidateAdaptiveRecommendationObservationStabilityInputParams = {
  history:
    RuntimeRecommendationAdaptiveObservationHistory;

  warnings:
    string[];
};

function validateAdaptiveRecommendationObservationStabilityInput({
  history,
  warnings,
}: ValidateAdaptiveRecommendationObservationStabilityInputParams): void {

  if (
    history.observationCount !==
    history.observations.length
  ) {
    warnings.push(
      "Observation History count does not match the Observation array length."
    );
  }

  if (
    history.observations.length === 0
  ) {
    warnings.push(
      "Adaptive Recommendation Observation History is empty."
    );

    return;
  }

  for (
    const observation of
    history.observations
  ) {

    const observationId =
      observation.observationId.trim();

    if (
      observationId.length === 0
    ) {
      warnings.push(
        "Observation contains an empty observationId."
      );
    }

    const generatedTime =
      Date.parse(
        observation.generatedAt
      );

    if (
      !Number.isFinite(
        generatedTime
      )
    ) {
      warnings.push(
        `Observation "${observation.observationId}" contains an invalid generatedAt value.`
      );
    }

    const candidateId =
      observation.adaptiveCandidateId;

    if (
      candidateId !== null &&
      candidateId.trim().length === 0
    ) {
      warnings.push(
        `Observation "${observation.observationId}" contains an empty adaptiveCandidateId.`
      );
    }

    if (
      observation.generatedAt.trim().length === 0
    ) {
      warnings.push(
        `Observation "${observation.observationId}" contains an empty generatedAt value.`
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Comparable */
/* ------------------------------------------------------------------ */

function isComparableAdaptiveRecommendationObservation(
  observation:
    RuntimeRecommendationAdaptiveObservation
): boolean {
  const candidateId =
    observation.adaptiveCandidateId;

  const generatedTime =
    Date.parse(
      observation.generatedAt
    );

  return (
    candidateId !== null &&
    candidateId.trim().length > 0 &&
    Number.isFinite(
      generatedTime
    )
  );
}

/* ------------------------------------------------------------------ */
/* Stability Clone */
/* ------------------------------------------------------------------ */

export function cloneRuntimeRecommendationAdaptiveObservationStability(
  stability:
    RuntimeRecommendationAdaptiveObservationStability
):
RuntimeRecommendationAdaptiveObservationStability {

  return {

    observationCount:
      stability.observationCount,

    comparableObservationCount:
      stability.comparableObservationCount,

    incompleteObservationCount:
      stability.incompleteObservationCount,

    adaptiveWinnerRepeatCount:
      stability.adaptiveWinnerRepeatCount,

    adaptiveWinnerSwitchCount:
      stability.adaptiveWinnerSwitchCount,

    adaptiveWinnerTransitionCount:
      stability.adaptiveWinnerTransitionCount,

    adaptiveWinnerRepeatRate:
      stability.adaptiveWinnerRepeatRate,

    adaptiveWinnerSwitchRate:
      stability.adaptiveWinnerSwitchRate,

    longestAdaptiveWinnerStreak:
      stability.longestAdaptiveWinnerStreak,

    currentAdaptiveWinnerStreak:
      stability.currentAdaptiveWinnerStreak,

    currentAdaptiveWinnerCandidateId:
      stability.currentAdaptiveWinnerCandidateId,

    longestStreakCandidateId:
      stability.longestStreakCandidateId,

    candidateFrequencies:
      cloneAdaptiveWinnerStabilityFrequencies(
        stability.candidateFrequencies
      ),

    level:
      stability.level,

    status:
      stability.status,

    reason:
      stability.reason,
  };
}

/* ------------------------------------------------------------------ */
/* Diagnostics Clone */
/* ------------------------------------------------------------------ */

export function cloneRuntimeRecommendationAdaptiveObservationStabilityDiagnostics(
  diagnostics:
    RuntimeRecommendationAdaptiveObservationStabilityDiagnostics
):
RuntimeRecommendationAdaptiveObservationStabilityDiagnostics {

  return {

    generatedAt:
      diagnostics.generatedAt,

    observationCount:
      diagnostics.observationCount,

    comparableObservationCount:
      diagnostics.comparableObservationCount,

    incompleteObservationCount:
      diagnostics.incompleteObservationCount,

    transitionCount:
      diagnostics.transitionCount,

    candidateCount:
      diagnostics.candidateCount,

    firstComparableObservedAt:
      diagnostics.firstComparableObservedAt,

    lastComparableObservedAt:
      diagnostics.lastComparableObservedAt,

    warningCount:
      diagnostics.warningCount,

    warnings:
      cloneWarnings(
        diagnostics.warnings
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Diagnostics Builder */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationObservationStabilityDiagnosticsParams = {
  stability:
    RuntimeRecommendationAdaptiveObservationStability;

  history:
    RuntimeRecommendationAdaptiveObservationHistory;

  comparableObservations:
    RuntimeRecommendationAdaptiveObservation[];

  generatedAt:
    string;

  warnings:
    string[];
};

function createAdaptiveRecommendationObservationStabilityDiagnostics({
  stability,
  history,
  comparableObservations,
  generatedAt,
  warnings,
}: CreateAdaptiveRecommendationObservationStabilityDiagnosticsParams):
RuntimeRecommendationAdaptiveObservationStabilityDiagnostics {

  const uniqueWarnings =
    normalizeUniqueWarnings(
      warnings
    );

  const firstComparableObservedAt =
    comparableObservations.length > 0
      ? comparableObservations[0]
          .generatedAt
      : null;

  const lastComparableObservedAt =
    comparableObservations.length > 0
      ? comparableObservations[
          comparableObservations.length - 1
        ].generatedAt
      : null;

  return {

    generatedAt,

    observationCount:
      history.observations.length,

    comparableObservationCount:
      stability.comparableObservationCount,

    incompleteObservationCount:
      stability.incompleteObservationCount,

    transitionCount:
      stability.adaptiveWinnerTransitionCount,

    candidateCount:
      stability.candidateFrequencies.length,

    firstComparableObservedAt,

    lastComparableObservedAt,

    warningCount:
      uniqueWarnings.length,

    warnings:
      cloneWarnings(
        uniqueWarnings
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Warning Normalize */
/* ------------------------------------------------------------------ */

function normalizeUniqueWarnings(
  warnings:
    string[]
):
string[] {

  return [
    ...new Set(
      warnings
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* Warning Clone */
/* ------------------------------------------------------------------ */

function cloneWarnings(
  warnings:
    string[]
):
string[] {

  return [
    ...warnings,
  ];
}

/* ------------------------------------------------------------------ */
/* Frequency Clone */
/* ------------------------------------------------------------------ */

function cloneAdaptiveWinnerStabilityFrequencies(
  frequencies:
    RuntimeRecommendationAdaptiveWinnerStabilityFrequency[]
):
RuntimeRecommendationAdaptiveWinnerStabilityFrequency[] {

  return frequencies.map(
    (
      frequency
    ) => ({

      candidateId:
        frequency.candidateId,

      occurrenceCount:
        frequency.occurrenceCount,

      occurrenceRate:
        frequency.occurrenceRate,

      longestStreak:
        frequency.longestStreak,

      latestStreak:
        frequency.latestStreak,
    })
  );
}

function validateAdaptiveRecommendationObservationStabilityResult({
  stability,
  warnings,
}: {
  stability:
    RuntimeRecommendationAdaptiveObservationStability;

  warnings:
    string[];
}): void {
  const expectedTransitionCount =
    Math.max(
      0,
      stability.comparableObservationCount -
        1
    );

  if (
    stability.adaptiveWinnerTransitionCount !==
    expectedTransitionCount
  ) {
    warnings.push(
      "Adaptive Winner transition count does not match the comparable Observation count."
    );
  }

  if (
    stability.adaptiveWinnerRepeatCount +
      stability.adaptiveWinnerSwitchCount !==
    stability.adaptiveWinnerTransitionCount
  ) {
    warnings.push(
      "Adaptive Winner repeat and switch counts do not match the transition count."
    );
  }

  if (
    stability.comparableObservationCount +
      stability.incompleteObservationCount !==
    stability.observationCount
  ) {
    warnings.push(
      "Comparable and incomplete Observation counts do not match the total Observation count."
    );
  }

  const totalOccurrenceCount =
    stability.candidateFrequencies.reduce(
      (
        total,
        frequency
      ) =>
        total +
        frequency.occurrenceCount,
      0
    );

  if (
    totalOccurrenceCount !==
    stability.comparableObservationCount
  ) {
    warnings.push(
      "Candidate occurrence counts do not match the comparable Observation count."
    );
  }
}