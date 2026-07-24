import type {
    RuntimeRecommendationAdaptiveObservation,
} from "./createAdaptiveRecommendationObservation";

import type {
    RuntimeRecommendationAdaptiveObservationHistory,
} from "./createAdaptiveRecommendationObservationHistory";

import {
    calculateAverage,
    normalizeGeneratedAt,
    roundNumber,
    uniqueStrings,
} from "./runtimeRecommendationMath";

/* ------------------------------------------------------------------ */
/* Statistics Policy */
/* ------------------------------------------------------------------ */

/**
 * Adaptive Recommendation Observation 통계 계산 정책입니다.
 *
 * Statistics는 Observation History를 읽기만 하며,
 * 원본 History 또는 Observation을 변경하지 않습니다.
 */
export type RuntimeRecommendationAdaptiveObservationStatisticsPolicy = {
  /**
   * 비율과 평균값에 적용할 소수점 자리 수입니다.
   */
  decimalPlaces:
    number;

  /**
   * Candidate ID가 없는 Observation을 Candidate 빈도 계산에
   * 포함할지 결정합니다.
   *
   * true인 경우 누락 Candidate는 configured key로 집계합니다.
   */
  includeMissingCandidateIdsInFrequency:
    boolean;

  /**
   * Candidate ID가 없을 때 빈도 집계에 사용할 Key입니다.
   */
  missingCandidateFrequencyKey:
    string;
};

export type PartialRuntimeRecommendationAdaptiveObservationStatisticsPolicy = {
  decimalPlaces?:
    number;

  includeMissingCandidateIdsInFrequency?:
    boolean;

  missingCandidateFrequencyKey?:
    string;
};

/* ------------------------------------------------------------------ */
/* Default Policy */
/* ------------------------------------------------------------------ */

export const DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_STATISTICS_POLICY:
  RuntimeRecommendationAdaptiveObservationStatisticsPolicy = {
    decimalPlaces:
      4,

    includeMissingCandidateIdsInFrequency:
      false,

    missingCandidateFrequencyKey:
      "__missing_candidate__",
  };

/* ------------------------------------------------------------------ */
/* Statistics Status */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveObservationStatisticsStatus =
  | "calculated"
  | "partial"
  | "insufficient-data";

export type RuntimeRecommendationAdaptiveObservationStatisticsReason =
  | "complete-observation-history"
  | "history-contains-incomplete-observations"
  | "no-observations"
  | "no-comparable-observations";

/* ------------------------------------------------------------------ */
/* Candidate Frequency */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveCandidateFrequency = {
  candidateId:
    string;

  count:
    number;

  rate:
    number;
};

/* ------------------------------------------------------------------ */
/* Statistics */
/* ------------------------------------------------------------------ */

/**
 * Adaptive Recommendation Observation History에서 계산한
 * 기초 통계입니다.
 *
 * PR-046D에서는 통계 결과를 RuntimeNextAction 결정에
 * 사용하지 않습니다.
 */
export type RuntimeRecommendationAdaptiveObservationStatistics = {
  observationCount:
    number;

  /**
   * Base Winner와 Adaptive Winner가 모두 존재하여
   * 직접 비교 가능한 Observation 개수입니다.
   */
  comparableObservationCount:
    number;

  /**
   * Base 또는 Adaptive Winner가 누락되어
   * 직접 비교할 수 없는 Observation 개수입니다.
   */
  incompleteObservationCount:
    number;

  sameCandidateCount:
    number;

  changedWinnerCount:
    number;

  sameCandidateRate:
    number | null;

  changedWinnerRate:
    number | null;

  blockingStatusChangedCount:
    number;

  blockingStatusChangedRate:
    number | null;

  /**
   * Base Winner Base Score - Adaptive Winner Base Score의 평균입니다.
   */
  averageBaseScoreDifference:
    number | null;

  /**
   * Adaptive Winner Adaptive Score -
   * Base Winner Adaptive Score의 평균입니다.
   */
  averageAdaptiveScoreDifference:
    number | null;

  baseWinnerCandidateFrequency:
    Record<string, number>;

  adaptiveWinnerCandidateFrequency:
    Record<string, number>;

  baseWinnerCandidateFrequencies:
    RuntimeRecommendationAdaptiveCandidateFrequency[];

  adaptiveWinnerCandidateFrequencies:
    RuntimeRecommendationAdaptiveCandidateFrequency[];

  mostFrequentBaseCandidateId:
    string | null;

  mostFrequentAdaptiveCandidateId:
    string | null;

  status:
    RuntimeRecommendationAdaptiveObservationStatisticsStatus;

  reason:
    RuntimeRecommendationAdaptiveObservationStatisticsReason;
};

/* ------------------------------------------------------------------ */
/* Diagnostics */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveObservationStatisticsDiagnostics = {
  generatedAt:
    string;

  observationCount:
    number;

  comparableObservationCount:
    number;

  incompleteObservationCount:
    number;

  baseScoreDifferenceSampleCount:
    number;

  adaptiveScoreDifferenceSampleCount:
    number;

  missingBaseCandidateCount:
    number;

  missingAdaptiveCandidateCount:
    number;

  warningCount:
    number;

  warnings:
    string[];
};

/* ------------------------------------------------------------------ */
/* Result */
/* ------------------------------------------------------------------ */

export type CreateAdaptiveRecommendationObservationStatisticsResult = {
  statistics:
    RuntimeRecommendationAdaptiveObservationStatistics;

  diagnostics:
    RuntimeRecommendationAdaptiveObservationStatisticsDiagnostics;

  policy:
    RuntimeRecommendationAdaptiveObservationStatisticsPolicy;
};

/* ------------------------------------------------------------------ */
/* Public Input */
/* ------------------------------------------------------------------ */

export type CreateAdaptiveRecommendationObservationStatisticsParams = {
  history:
    RuntimeRecommendationAdaptiveObservationHistory;

  policy?:
    PartialRuntimeRecommendationAdaptiveObservationStatisticsPolicy;

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
 * Observation History에서 Adaptive Recommendation 기초 통계를
 * 생성합니다.
 *
 * 이 함수는 다음을 수행하지 않습니다.
 *
 * - Observation 추가 또는 제거
 * - History 정렬 변경
 * - Adaptive Winner 변경
 * - RuntimeNextAction 변경
 * - Stability 계산
 * - Drift 계산
 * - Confidence 계산
 */
export function createAdaptiveRecommendationObservationStatistics({
  history,
  policy,
  generatedAt,
}: CreateAdaptiveRecommendationObservationStatisticsParams):
  CreateAdaptiveRecommendationObservationStatisticsResult {
  const normalizedPolicy =
    normalizeRuntimeRecommendationAdaptiveObservationStatisticsPolicy(
      policy
    );

  return createAdaptiveRecommendationObservationStatisticsWithPolicy({
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
/* Statistics Builder */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationObservationStatisticsWithPolicyParams = {
  history:
    RuntimeRecommendationAdaptiveObservationHistory;

  generatedAt:
    string;

  policy:
    RuntimeRecommendationAdaptiveObservationStatisticsPolicy;
};

function createAdaptiveRecommendationObservationStatisticsWithPolicy({
  history,
  generatedAt,
  policy,
}: CreateAdaptiveRecommendationObservationStatisticsWithPolicyParams):
  CreateAdaptiveRecommendationObservationStatisticsResult {
  const observations =
    history.observations;

  const warnings:
    string[] = [];

  validateAdaptiveRecommendationObservationStatisticsInput({
    history,
    warnings,
  });

  const comparableObservations =
    observations.filter(
      isComparableAdaptiveRecommendationObservation
    );

  const incompleteObservations =
    observations.filter(
      (observation) =>
        !isComparableAdaptiveRecommendationObservation(
          observation
        )
    );

  const sameCandidateCount =
    comparableObservations.filter(
      (observation) =>
        observation.sameCandidate
    ).length;

  const changedWinnerCount =
    comparableObservations.filter(
      (observation) =>
        observation.winnerChanged
    ).length;

  const blockingStatusChangedCount =
    comparableObservations.filter(
      (observation) =>
        observation.blockingStatusChanged
    ).length;

  const baseScoreDifferences =
    collectFiniteObservationNumbers(
      observations.map(
        (observation) =>
          observation.baseScoreDifference
      )
    );

  const adaptiveScoreDifferences =
    collectFiniteObservationNumbers(
      observations.map(
        (observation) =>
          observation.adaptiveScoreDifference
      )
    );

  const baseWinnerCandidateFrequency =
    createAdaptiveRecommendationCandidateFrequencyRecord({
      observations,

      candidateIdSelector:
        (observation) =>
          observation.baseCandidateId,

      policy,
    });

  const adaptiveWinnerCandidateFrequency =
    createAdaptiveRecommendationCandidateFrequencyRecord({
      observations,

      candidateIdSelector:
        (observation) =>
          observation.adaptiveCandidateId,

      policy,
    });

  const baseWinnerCandidateFrequencies =
    createAdaptiveRecommendationCandidateFrequencyList({
      frequencyRecord:
        baseWinnerCandidateFrequency,

      denominator:
        resolveFrequencyDenominator({
          observations,

          candidateIdSelector:
            (observation) =>
              observation.baseCandidateId,

          policy,
        }),

      decimalPlaces:
        policy.decimalPlaces,
    });

  const adaptiveWinnerCandidateFrequencies =
    createAdaptiveRecommendationCandidateFrequencyList({
      frequencyRecord:
        adaptiveWinnerCandidateFrequency,

      denominator:
        resolveFrequencyDenominator({
          observations,

          candidateIdSelector:
            (observation) =>
              observation.adaptiveCandidateId,

          policy,
        }),

      decimalPlaces:
        policy.decimalPlaces,
    });

  const status =
    resolveAdaptiveRecommendationObservationStatisticsStatus({
      observationCount:
        observations.length,

      comparableObservationCount:
        comparableObservations.length,

      incompleteObservationCount:
        incompleteObservations.length,
    });

  const reason =
    resolveAdaptiveRecommendationObservationStatisticsReason({
      observationCount:
        observations.length,

      comparableObservationCount:
        comparableObservations.length,

      incompleteObservationCount:
        incompleteObservations.length,
    });

  if (
    comparableObservations.length === 0
  ) {
    warnings.push(
      "No comparable Adaptive Recommendation Observations were available."
    );
  }

  if (
    incompleteObservations.length > 0
  ) {
    warnings.push(
      `${incompleteObservations.length} incomplete Adaptive Recommendation Observation${
        incompleteObservations.length === 1
          ? ""
          : "s"
      } ${
        incompleteObservations.length === 1
          ? "was"
          : "were"
      } excluded from Winner comparison rates.`
    );
  }

  const missingBaseCandidateCount =
    observations.filter(
      (observation) =>
        observation.baseCandidateId === null
    ).length;

  const missingAdaptiveCandidateCount =
    observations.filter(
      (observation) =>
        observation.adaptiveCandidateId === null
    ).length;

  const statistics:
    RuntimeRecommendationAdaptiveObservationStatistics = {
    observationCount:
      observations.length,

    comparableObservationCount:
      comparableObservations.length,

    incompleteObservationCount:
      incompleteObservations.length,

    sameCandidateCount,

    changedWinnerCount,

    sameCandidateRate:
      calculateObservationRate({
        numerator:
          sameCandidateCount,

        denominator:
          comparableObservations.length,

        decimalPlaces:
          policy.decimalPlaces,
      }),

    changedWinnerRate:
      calculateObservationRate({
        numerator:
          changedWinnerCount,

        denominator:
          comparableObservations.length,

        decimalPlaces:
          policy.decimalPlaces,
      }),

    blockingStatusChangedCount,

    blockingStatusChangedRate:
      calculateObservationRate({
        numerator:
          blockingStatusChangedCount,

        denominator:
          comparableObservations.length,

        decimalPlaces:
          policy.decimalPlaces,
      }),

    averageBaseScoreDifference:
      calculateRoundedAverage({
        values:
          baseScoreDifferences,

        decimalPlaces:
          policy.decimalPlaces,
      }),

    averageAdaptiveScoreDifference:
      calculateRoundedAverage({
        values:
          adaptiveScoreDifferences,

        decimalPlaces:
          policy.decimalPlaces,
      }),

    baseWinnerCandidateFrequency,

    adaptiveWinnerCandidateFrequency,

    baseWinnerCandidateFrequencies,

    adaptiveWinnerCandidateFrequencies,

    mostFrequentBaseCandidateId:
      resolveMostFrequentAdaptiveRecommendationCandidateId(
        baseWinnerCandidateFrequencies
      ),

    mostFrequentAdaptiveCandidateId:
      resolveMostFrequentAdaptiveRecommendationCandidateId(
        adaptiveWinnerCandidateFrequencies
      ),

    status,

    reason,
  };

  const diagnostics:
    RuntimeRecommendationAdaptiveObservationStatisticsDiagnostics = {
    generatedAt,

    observationCount:
      observations.length,

    comparableObservationCount:
      comparableObservations.length,

    incompleteObservationCount:
      incompleteObservations.length,

    baseScoreDifferenceSampleCount:
      baseScoreDifferences.length,

    adaptiveScoreDifferenceSampleCount:
      adaptiveScoreDifferences.length,

    missingBaseCandidateCount,

    missingAdaptiveCandidateCount,

    warningCount:
      uniqueStrings(
        warnings
      ).length,

    warnings:
      uniqueStrings(
        warnings
      ),
  };

  return {
    statistics,

    diagnostics,

    policy:
      cloneRuntimeRecommendationAdaptiveObservationStatisticsPolicy(
        policy
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Comparable Observation */
/* ------------------------------------------------------------------ */

/**
 * Base Candidate와 Adaptive Candidate가 모두 존재하는 경우에만
 * Winner 비교가 가능한 Observation으로 간주합니다.
 */
export function isComparableAdaptiveRecommendationObservation(
  observation:
    RuntimeRecommendationAdaptiveObservation
): boolean {
  return (
    observation.baseCandidateId !== null &&
    observation.adaptiveCandidateId !== null
  );
}

/* ------------------------------------------------------------------ */
/* Statistics Status */
/* ------------------------------------------------------------------ */

type ResolveAdaptiveRecommendationObservationStatisticsStateParams = {
  observationCount:
    number;

  comparableObservationCount:
    number;

  incompleteObservationCount:
    number;
};

function resolveAdaptiveRecommendationObservationStatisticsStatus({
  observationCount,
  comparableObservationCount,
  incompleteObservationCount,
}: ResolveAdaptiveRecommendationObservationStatisticsStateParams):
  RuntimeRecommendationAdaptiveObservationStatisticsStatus {
  if (
    observationCount === 0 ||
    comparableObservationCount === 0
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

function resolveAdaptiveRecommendationObservationStatisticsReason({
  observationCount,
  comparableObservationCount,
  incompleteObservationCount,
}: ResolveAdaptiveRecommendationObservationStatisticsStateParams):
  RuntimeRecommendationAdaptiveObservationStatisticsReason {
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
    incompleteObservationCount > 0
  ) {
    return "history-contains-incomplete-observations";
  }

  return "complete-observation-history";
}

/* ------------------------------------------------------------------ */
/* Candidate Frequency */
/* ------------------------------------------------------------------ */

type CandidateIdSelector = (
  observation:
    RuntimeRecommendationAdaptiveObservation
) => string | null;

type CreateAdaptiveRecommendationCandidateFrequencyRecordParams = {
  observations:
    RuntimeRecommendationAdaptiveObservation[];

  candidateIdSelector:
    CandidateIdSelector;

  policy:
    RuntimeRecommendationAdaptiveObservationStatisticsPolicy;
};

function createAdaptiveRecommendationCandidateFrequencyRecord({
  observations,
  candidateIdSelector,
  policy,
}: CreateAdaptiveRecommendationCandidateFrequencyRecordParams):
  Record<string, number> {
  const frequency:
    Record<string, number> = {};

  for (
    const observation of
    observations
  ) {
    const candidateId =
      candidateIdSelector(
        observation
      );

    const frequencyKey =
      candidateId ??
      (
        policy.includeMissingCandidateIdsInFrequency
          ? policy.missingCandidateFrequencyKey
          : null
      );

    if (
      frequencyKey === null
    ) {
      continue;
    }

    frequency[frequencyKey] =
      (
        frequency[frequencyKey] ??
        0
      ) +
      1;
  }

  return frequency;
}

type ResolveFrequencyDenominatorParams = {
  observations:
    RuntimeRecommendationAdaptiveObservation[];

  candidateIdSelector:
    CandidateIdSelector;

  policy:
    RuntimeRecommendationAdaptiveObservationStatisticsPolicy;
};

function resolveFrequencyDenominator({
  observations,
  candidateIdSelector,
  policy,
}: ResolveFrequencyDenominatorParams):
  number {
  if (
    policy.includeMissingCandidateIdsInFrequency
  ) {
    return observations.length;
  }

  return observations.filter(
    (observation) =>
      candidateIdSelector(
        observation
      ) !== null
  ).length;
}

type CreateAdaptiveRecommendationCandidateFrequencyListParams = {
  frequencyRecord:
    Record<string, number>;

  denominator:
    number;

  decimalPlaces:
    number;
};

function createAdaptiveRecommendationCandidateFrequencyList({
  frequencyRecord,
  denominator,
  decimalPlaces,
}: CreateAdaptiveRecommendationCandidateFrequencyListParams):
  RuntimeRecommendationAdaptiveCandidateFrequency[] {
  return Object.entries(
    frequencyRecord
  )
    .map(
      (
        [candidateId, count]
      ):
        RuntimeRecommendationAdaptiveCandidateFrequency => ({
        candidateId,

        count,

        rate:
          calculateObservationRate({
            numerator:
              count,

            denominator,

            decimalPlaces,
          }) ??
          0,
      })
    )
    .sort(
      (
        left,
        right
      ) => {
        if (
          left.count !==
          right.count
        ) {
          return (
            right.count -
            left.count
          );
        }

        return left.candidateId.localeCompare(
          right.candidateId
        );
      }
    );
}

function resolveMostFrequentAdaptiveRecommendationCandidateId(
  frequencies:
    RuntimeRecommendationAdaptiveCandidateFrequency[]
): string | null {
  return (
    frequencies[0]
      ?.candidateId ??
    null
  );
}

/* ------------------------------------------------------------------ */
/* Rate and Average */
/* ------------------------------------------------------------------ */

type CalculateObservationRateParams = {
  numerator:
    number;

  denominator:
    number;

  decimalPlaces:
    number;
};

function calculateObservationRate({
  numerator,
  denominator,
  decimalPlaces,
}: CalculateObservationRateParams):
  number | null {
  if (
    denominator <= 0
  ) {
    return null;
  }

  return roundNumber(
    numerator /
      denominator,

    decimalPlaces
  );
}

type CalculateRoundedAverageParams = {
  values:
    number[];

  decimalPlaces:
    number;
};

function calculateRoundedAverage({
  values,
  decimalPlaces,
}: CalculateRoundedAverageParams):
  number | null {
  const average =
    calculateAverage(
      values
    );

  return average === null
    ? null
    : roundNumber(
        average,
        decimalPlaces
      );
}

function collectFiniteObservationNumbers(
  values:
    Array<number | null>
): number[] {
  return values.filter(
    (
      value
    ): value is number =>
      typeof value === "number" &&
      Number.isFinite(
        value
      )
  );
}

/* ------------------------------------------------------------------ */
/* Input Validation */
/* ------------------------------------------------------------------ */

type ValidateAdaptiveRecommendationObservationStatisticsInputParams = {
  history:
    RuntimeRecommendationAdaptiveObservationHistory;

  warnings:
    string[];
};

function validateAdaptiveRecommendationObservationStatisticsInput({
  history,
  warnings,
}: ValidateAdaptiveRecommendationObservationStatisticsInputParams):
  void {
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
    if (
      observation.observationId.trim().length === 0
    ) {
      warnings.push(
        "Observation Statistics received an Observation with an empty observationId."
      );
    }

    if (
      observation.sameCandidate &&
      observation.winnerChanged
    ) {
      warnings.push(
        `Observation "${observation.observationId}" reports both sameCandidate and winnerChanged.`
      );
    }

    if (
      observation.baseCandidateId !== null &&
      observation.adaptiveCandidateId !== null
    ) {
      const candidateIdsMatch =
        observation.baseCandidateId ===
        observation.adaptiveCandidateId;

      if (
        observation.sameCandidate !==
        candidateIdsMatch
      ) {
        warnings.push(
          `Observation "${observation.observationId}" has inconsistent Candidate equality fields.`
        );
      }
    }

    validateOptionalFiniteStatisticsValue({
      value:
        observation.baseScoreDifference,

      observationId:
        observation.observationId,

      fieldName:
        "baseScoreDifference",

      warnings,
    });

    validateOptionalFiniteStatisticsValue({
      value:
        observation.adaptiveScoreDifference,

      observationId:
        observation.observationId,

      fieldName:
        "adaptiveScoreDifference",

      warnings,
    });
  }
}

type ValidateOptionalFiniteStatisticsValueParams = {
  value:
    number | null;

  observationId:
    string;

  fieldName:
    string;

  warnings:
    string[];
};

function validateOptionalFiniteStatisticsValue({
  value,
  observationId,
  fieldName,
  warnings,
}: ValidateOptionalFiniteStatisticsValueParams):
  void {
  if (
    value !== null &&
    !Number.isFinite(
      value
    )
  ) {
    warnings.push(
      `Observation "${observationId}" contains a non-finite "${fieldName}" value.`
    );
  }
}

/* ------------------------------------------------------------------ */
/* Policy */
/* ------------------------------------------------------------------ */

export function normalizeRuntimeRecommendationAdaptiveObservationStatisticsPolicy(
  policy?:
    PartialRuntimeRecommendationAdaptiveObservationStatisticsPolicy
): RuntimeRecommendationAdaptiveObservationStatisticsPolicy {
  const fallback =
    DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_STATISTICS_POLICY;

  return {
    decimalPlaces:
      normalizeStatisticsDecimalPlaces(
        policy?.decimalPlaces,
        fallback.decimalPlaces
      ),

    includeMissingCandidateIdsInFrequency:
      typeof policy
        ?.includeMissingCandidateIdsInFrequency ===
        "boolean"
        ? policy
            .includeMissingCandidateIdsInFrequency
        : fallback
            .includeMissingCandidateIdsInFrequency,

    missingCandidateFrequencyKey:
      normalizeMissingCandidateFrequencyKey(
        policy?.missingCandidateFrequencyKey,
        fallback.missingCandidateFrequencyKey
      ),
  };
}

export function cloneRuntimeRecommendationAdaptiveObservationStatisticsPolicy(
  policy:
    RuntimeRecommendationAdaptiveObservationStatisticsPolicy
): RuntimeRecommendationAdaptiveObservationStatisticsPolicy {
  return {
    decimalPlaces:
      policy.decimalPlaces,

    includeMissingCandidateIdsInFrequency:
      policy.includeMissingCandidateIdsInFrequency,

    missingCandidateFrequencyKey:
      policy.missingCandidateFrequencyKey,
  };
}

/* ------------------------------------------------------------------ */
/* Result Clone */
/* ------------------------------------------------------------------ */

export function cloneRuntimeRecommendationAdaptiveObservationStatistics(
  statistics:
    RuntimeRecommendationAdaptiveObservationStatistics
): RuntimeRecommendationAdaptiveObservationStatistics {
  return {
    observationCount:
      statistics.observationCount,

    comparableObservationCount:
      statistics.comparableObservationCount,

    incompleteObservationCount:
      statistics.incompleteObservationCount,

    sameCandidateCount:
      statistics.sameCandidateCount,

    changedWinnerCount:
      statistics.changedWinnerCount,

    sameCandidateRate:
      statistics.sameCandidateRate,

    changedWinnerRate:
      statistics.changedWinnerRate,

    blockingStatusChangedCount:
      statistics.blockingStatusChangedCount,

    blockingStatusChangedRate:
      statistics.blockingStatusChangedRate,

    averageBaseScoreDifference:
      statistics.averageBaseScoreDifference,

    averageAdaptiveScoreDifference:
      statistics.averageAdaptiveScoreDifference,

    baseWinnerCandidateFrequency: {
      ...statistics.baseWinnerCandidateFrequency,
    },

    adaptiveWinnerCandidateFrequency: {
      ...statistics.adaptiveWinnerCandidateFrequency,
    },

    baseWinnerCandidateFrequencies:
      statistics
        .baseWinnerCandidateFrequencies
        .map(
          (frequency) => ({
            ...frequency,
          })
        ),

    adaptiveWinnerCandidateFrequencies:
      statistics
        .adaptiveWinnerCandidateFrequencies
        .map(
          (frequency) => ({
            ...frequency,
          })
        ),

    mostFrequentBaseCandidateId:
      statistics.mostFrequentBaseCandidateId,

    mostFrequentAdaptiveCandidateId:
      statistics.mostFrequentAdaptiveCandidateId,

    status:
      statistics.status,

    reason:
      statistics.reason,
  };
}

/* ------------------------------------------------------------------ */
/* Primitive Helpers */
/* ------------------------------------------------------------------ */

function normalizeStatisticsDecimalPlaces(
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

function normalizeMissingCandidateFrequencyKey(
  value:
    string | undefined,
  fallback:
    string
): string {
  if (
    typeof value !== "string"
  ) {
    return fallback;
  }

  const normalizedValue =
    value.trim();

  return normalizedValue.length > 0
    ? normalizedValue
    : fallback;
}