import type {
    RuntimeRecommendationAdaptiveObservation,
} from "./createAdaptiveRecommendationObservation";

import type {
    RuntimeRecommendationAdaptiveObservationHistory,
} from "./createAdaptiveRecommendationObservationHistory";

import {
    normalizeGeneratedAt,
} from "./runtimeRecommendationMath";

/* ------------------------------------------------------------------ */
/* Drift Policy */
/* ------------------------------------------------------------------ */

/**
 * Adaptive Recommendation Observation Drift 계산 정책입니다.
 *
 * Drift는 과거 Baseline Window와 최근 Recent Window를 비교해
 * Adaptive Recommendation의 행동 패턴이 얼마나 변화했는지를
 * 설명합니다.
 *
 * 이 결과는 Shadow Analytics에만 사용되며
 * RuntimeNextAction을 변경하지 않습니다.
 */
export type RuntimeRecommendationAdaptiveObservationDriftPolicy = {
  /**
   * 과거 기준 구간에 포함할 Observation 개수입니다.
   */
  baselineWindowSize:
    number;

  /**
   * 최근 분석 구간에 포함할 Observation 개수입니다.
   */
  recentWindowSize:
    number;

  /**
   * 각 Window에 필요한 최소 비교 가능 Observation 개수입니다.
   */
  minimumComparableObservationCountPerWindow:
    number;

  /**
   * Drift Level이 emerging이 되는 최소 Drift Score입니다.
   */
  emergingDriftThreshold:
    number;

  /**
   * Drift Level이 significant가 되는 최소 Drift Score입니다.
   */
  significantDriftThreshold:
    number;

  /**
   * Winner Distribution 변화의 가중치입니다.
   */
  candidateDistributionWeight:
    number;

  /**
   * Adaptive Winner Switch Rate 변화의 가중치입니다.
   */
  winnerSwitchRateWeight:
    number;

  /**
   * Base/Adaptive Winner 불일치율 변화의 가중치입니다.
   */
  winnerChangeRateWeight:
    number;

  /**
   * Adaptive Score Difference 평균 변화의 가중치입니다.
   */
  adaptiveScoreDifferenceWeight:
    number;

  /**
   * Rate와 Score 결과의 소수점 자리 수입니다.
   */
  decimalPlaces:
    number;
};

export type PartialRuntimeRecommendationAdaptiveObservationDriftPolicy = {
  baselineWindowSize?:
    number;

  recentWindowSize?:
    number;

  minimumComparableObservationCountPerWindow?:
    number;

  emergingDriftThreshold?:
    number;

  significantDriftThreshold?:
    number;

  candidateDistributionWeight?:
    number;

  winnerSwitchRateWeight?:
    number;

  winnerChangeRateWeight?:
    number;

  adaptiveScoreDifferenceWeight?:
    number;

  decimalPlaces?:
    number;
};

/* ------------------------------------------------------------------ */
/* Default Policy */
/* ------------------------------------------------------------------ */

export const DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_DRIFT_POLICY:
  RuntimeRecommendationAdaptiveObservationDriftPolicy = {
    baselineWindowSize:
      5,

    recentWindowSize:
      5,

    minimumComparableObservationCountPerWindow:
      2,

    emergingDriftThreshold:
      0.25,

    significantDriftThreshold:
      0.6,

    candidateDistributionWeight:
      0.4,

    winnerSwitchRateWeight:
      0.25,

    winnerChangeRateWeight:
      0.2,

    adaptiveScoreDifferenceWeight:
      0.15,

    decimalPlaces:
      4,
  };

/* ------------------------------------------------------------------ */
/* Drift Status */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveObservationDriftStatus =
  | "calculated"
  | "partial"
  | "insufficient-data";

export type RuntimeRecommendationAdaptiveObservationDriftReason =
  | "baseline-and-recent-windows-compared"
  | "history-contains-incomplete-observations"
  | "no-observations"
  | "not-enough-observations-for-two-windows"
  | "not-enough-baseline-observations"
  | "not-enough-recent-observations";

/* ------------------------------------------------------------------ */
/* Drift Level */
/* ------------------------------------------------------------------ */

/**
 * Drift Level은 Adaptive Recommendation이 정확한지 여부가 아니라
 * 과거 패턴과 최근 패턴이 얼마나 달라졌는지를 나타냅니다.
 */
export type RuntimeRecommendationAdaptiveObservationDriftLevel =
  | "insufficient-data"
  | "stable"
  | "emerging"
  | "significant";

/* ------------------------------------------------------------------ */
/* Candidate Distribution */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveObservationCandidateDistribution = {
  candidateId:
    string;

  baselineCount:
    number;

  recentCount:
    number;

  baselineRate:
    number;

  recentRate:
    number;

  absoluteRateDifference:
    number;
};

/* ------------------------------------------------------------------ */
/* Window Snapshot */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveObservationDriftWindowSnapshot = {
  observationCount:
    number;

  firstObservedAt:
    string | null;

  lastObservedAt:
    string | null;

  dominantCandidateId:
    string | null;

  dominantCandidateRate:
    number | null;

  winnerSwitchCount:
    number;

  winnerTransitionCount:
    number;

  winnerSwitchRate:
    number | null;

  winnerChangedCount:
    number;

  winnerChangedRate:
    number | null;

  averageAdaptiveScoreDifference:
    number | null;
};

/* ------------------------------------------------------------------ */
/* Drift Result */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveObservationDrift = {
  observationCount:
    number;

  comparableObservationCount:
    number;

  incompleteObservationCount:
    number;

  baselineWindow:
    RuntimeRecommendationAdaptiveObservationDriftWindowSnapshot;

  recentWindow:
    RuntimeRecommendationAdaptiveObservationDriftWindowSnapshot;

  dominantCandidateChanged:
    boolean;

  candidateDistributionDistance:
    number | null;

  winnerSwitchRateDifference:
    number | null;

  winnerChangeRateDifference:
    number | null;

  adaptiveScoreDifferenceDelta:
    number | null;

  normalizedAdaptiveScoreDifferenceDelta:
    number | null;

  driftScore:
    number | null;

  candidateDistributions:
    RuntimeRecommendationAdaptiveObservationCandidateDistribution[];

  level:
    RuntimeRecommendationAdaptiveObservationDriftLevel;

  status:
    RuntimeRecommendationAdaptiveObservationDriftStatus;

  reason:
    RuntimeRecommendationAdaptiveObservationDriftReason;
};

/* ------------------------------------------------------------------ */
/* Diagnostics */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveObservationDriftDiagnostics = {
  generatedAt:
    string;

  observationCount:
    number;

  comparableObservationCount:
    number;

  incompleteObservationCount:
    number;

  baselineWindowCount:
    number;

  recentWindowCount:
    number;

  candidateCount:
    number;

  appliedWeightTotal:
    number;

  warningCount:
    number;

  warnings:
    string[];
};

/* ------------------------------------------------------------------ */
/* Public Result */
/* ------------------------------------------------------------------ */

export type CreateAdaptiveRecommendationObservationDriftResult = {
  drift:
    RuntimeRecommendationAdaptiveObservationDrift;

  diagnostics:
    RuntimeRecommendationAdaptiveObservationDriftDiagnostics;

  policy:
    RuntimeRecommendationAdaptiveObservationDriftPolicy;
};

/* ------------------------------------------------------------------ */
/* Public Input */
/* ------------------------------------------------------------------ */

export type CreateAdaptiveRecommendationObservationDriftParams = {
  history:
    RuntimeRecommendationAdaptiveObservationHistory;

  policy?:
    PartialRuntimeRecommendationAdaptiveObservationDriftPolicy;

  /**
   * 테스트 또는 회귀 검증에서 결정적인 시각을 사용할 때 사용합니다.
   */
  generatedAt?:
    string;
};

/* ------------------------------------------------------------------ */
/* Public API */
/* ------------------------------------------------------------------ */

export function createAdaptiveRecommendationObservationDrift({
  history,
  policy,
  generatedAt,
}: CreateAdaptiveRecommendationObservationDriftParams):
  CreateAdaptiveRecommendationObservationDriftResult {
  const normalizedPolicy =
    normalizeRuntimeRecommendationAdaptiveObservationDriftPolicy(
      policy
    );

  return createAdaptiveRecommendationObservationDriftWithPolicy({
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
/* Internal Builder Contract */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationObservationDriftWithPolicyParams = {
  history:
    RuntimeRecommendationAdaptiveObservationHistory;

  generatedAt:
    string;

  policy:
    RuntimeRecommendationAdaptiveObservationDriftPolicy;
};

/* ------------------------------------------------------------------ */
/* Drift Builder */
/* ------------------------------------------------------------------ */

function createAdaptiveRecommendationObservationDriftWithPolicy({
  history,
  generatedAt,
  policy,
}: CreateAdaptiveRecommendationObservationDriftWithPolicyParams):
  CreateAdaptiveRecommendationObservationDriftResult {
  const warnings:
    string[] = [];

  validateAdaptiveRecommendationObservationDriftInput({
    history,
    warnings,
  });

  const comparableObservations =
    history.observations
      .filter(
        isComparableAdaptiveRecommendationDriftObservation
      )
      .sort(
        compareAdaptiveRecommendationObservationsChronologically
      );

  const incompleteObservationCount =
    history.observations.length -
    comparableObservations.length;

  const windows =
    createAdaptiveRecommendationObservationDriftWindows({
      observations:
        comparableObservations,

      policy,
    });

  const baselineWindow =
    createAdaptiveRecommendationObservationDriftWindowSnapshot(
      windows.baseline
    );

  const recentWindow =
    createAdaptiveRecommendationObservationDriftWindowSnapshot(
      windows.recent
    );

  const candidateDistributions =
    compareAdaptiveRecommendationCandidateDistributions({
      baseline:
        windows.baseline,

      recent:
        windows.recent,

      decimalPlaces:
        policy.decimalPlaces,
    });

  const candidateDistributionDistance =
    calculateCandidateDistributionDistance({
      distributions:
        candidateDistributions,

      decimalPlaces:
        policy.decimalPlaces,
    });

  const winnerSwitchRateDifference =
    calculateNullableAbsoluteDifference({
      left:
        baselineWindow.winnerSwitchRate,

      right:
        recentWindow.winnerSwitchRate,

      decimalPlaces:
        policy.decimalPlaces,
    });

  const winnerChangeRateDifference =
    calculateNullableAbsoluteDifference({
      left:
        baselineWindow.winnerChangedRate,

      right:
        recentWindow.winnerChangedRate,

      decimalPlaces:
        policy.decimalPlaces,
    });

  const adaptiveScoreDifferenceDelta =
    calculateNullableSignedDifference({
      baseline:
        baselineWindow.averageAdaptiveScoreDifference,

      recent:
        recentWindow.averageAdaptiveScoreDifference,

      decimalPlaces:
        policy.decimalPlaces,
    });

  const normalizedAdaptiveScoreDifferenceDelta =
    normalizeAdaptiveScoreDifferenceDelta({
      baseline:
        baselineWindow.averageAdaptiveScoreDifference,

      recent:
        recentWindow.averageAdaptiveScoreDifference,

      decimalPlaces:
        policy.decimalPlaces,
    });

  const appliedWeightTotal =
    calculateAppliedDriftWeightTotal({
      candidateDistributionDistance,

      winnerSwitchRateDifference,

      winnerChangeRateDifference,

      normalizedAdaptiveScoreDifferenceDelta,

      policy,
    });

  const driftScore =
    calculateAdaptiveRecommendationObservationDriftScore({
      candidateDistributionDistance,

      winnerSwitchRateDifference,

      winnerChangeRateDifference,

      normalizedAdaptiveScoreDifferenceDelta,

      policy,
    });

  const dominantCandidateChanged =
    baselineWindow.dominantCandidateId !== null &&
    recentWindow.dominantCandidateId !== null &&
    baselineWindow.dominantCandidateId !==
      recentWindow.dominantCandidateId;

  const status =
    resolveAdaptiveRecommendationObservationDriftStatus({
      observationCount:
        history.observations.length,

      baselineWindowCount:
        windows.baseline.length,

      recentWindowCount:
        windows.recent.length,

      incompleteObservationCount,

      policy,
    });

  const reason =
    resolveAdaptiveRecommendationObservationDriftReason({
      observationCount:
        history.observations.length,

      baselineWindowCount:
        windows.baseline.length,

      recentWindowCount:
        windows.recent.length,

      incompleteObservationCount,

      policy,
    });

  const level =
    resolveAdaptiveRecommendationObservationDriftLevel({
      status,
      driftScore,
      policy,
    });

  const drift:
    RuntimeRecommendationAdaptiveObservationDrift = {
    observationCount:
      history.observations.length,

    comparableObservationCount:
      comparableObservations.length,

    incompleteObservationCount,

    baselineWindow,

    recentWindow,

    dominantCandidateChanged,

    candidateDistributionDistance,

    winnerSwitchRateDifference,

    winnerChangeRateDifference,

    adaptiveScoreDifferenceDelta,

    normalizedAdaptiveScoreDifferenceDelta,

    driftScore,

    candidateDistributions,

    level,

    status,

    reason,
  };

  validateAdaptiveRecommendationObservationDriftResult({
    drift,
    warnings,
  });

  const diagnostics =
    createAdaptiveRecommendationObservationDriftDiagnostics({
      drift,

      generatedAt,

      appliedWeightTotal,

      warnings,
    });

  return {
    drift:
      cloneRuntimeRecommendationAdaptiveObservationDrift(
        drift
      ),

    diagnostics:
      cloneRuntimeRecommendationAdaptiveObservationDriftDiagnostics(
        diagnostics
      ),

    policy:
      cloneRuntimeRecommendationAdaptiveObservationDriftPolicy(
        policy
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Comparable Observation */
/* ------------------------------------------------------------------ */

function isComparableAdaptiveRecommendationDriftObservation(
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
/* Chronological Ordering */
/* ------------------------------------------------------------------ */

function compareAdaptiveRecommendationObservationsChronologically(
  left:
    RuntimeRecommendationAdaptiveObservation,
  right:
    RuntimeRecommendationAdaptiveObservation
): number {
  const leftTime =
    Date.parse(
      left.generatedAt
    );

  const rightTime =
    Date.parse(
      right.generatedAt
    );

  if (
    leftTime !== rightTime
  ) {
    return (
      leftTime -
      rightTime
    );
  }

  return left.observationId.localeCompare(
    right.observationId
  );
}

/* ------------------------------------------------------------------ */
/* Window Selection */
/* ------------------------------------------------------------------ */

type AdaptiveRecommendationObservationDriftWindows = {
  baseline:
    RuntimeRecommendationAdaptiveObservation[];

  recent:
    RuntimeRecommendationAdaptiveObservation[];
};

type CreateAdaptiveRecommendationObservationDriftWindowsParams = {
  observations:
    RuntimeRecommendationAdaptiveObservation[];

  policy:
    RuntimeRecommendationAdaptiveObservationDriftPolicy;
};

function createAdaptiveRecommendationObservationDriftWindows({
  observations,
  policy,
}: CreateAdaptiveRecommendationObservationDriftWindowsParams):
  AdaptiveRecommendationObservationDriftWindows {
  const recentWindowStart =
    Math.max(
      0,
      observations.length -
        policy.recentWindowSize
    );

  const recent =
    observations.slice(
      recentWindowStart
    );

  const baselineWindowEnd =
    recentWindowStart;

  const baselineWindowStart =
    Math.max(
      0,
      baselineWindowEnd -
        policy.baselineWindowSize
    );

  const baseline =
    observations.slice(
      baselineWindowStart,
      baselineWindowEnd
    );

  return {
    baseline,
    recent,
  };
}

/* ------------------------------------------------------------------ */
/* Window Snapshot */
/* ------------------------------------------------------------------ */

function createAdaptiveRecommendationObservationDriftWindowSnapshot(
  observations:
    RuntimeRecommendationAdaptiveObservation[]
):
  RuntimeRecommendationAdaptiveObservationDriftWindowSnapshot {
  const candidateFrequency =
    createCandidateFrequencyRecord(
      observations
    );

  const dominantCandidate =
    resolveDominantCandidate({
      frequency:
        candidateFrequency,

      observationCount:
        observations.length,
    });

  const transitions =
    calculateWindowWinnerTransitions(
      observations
    );

  const winnerChangedCount =
    observations.filter(
      (
        observation
      ) =>
        observation.winnerChanged ===
        true
    ).length;

  const adaptiveScoreDifferences =
    observations
      .map(
        (
          observation
        ) =>
          observation.adaptiveScoreDifference
      )
      .filter(
        (
          value
        ): value is number =>
          typeof value === "number" &&
          Number.isFinite(
            value
          )
      );

  return {
    observationCount:
      observations.length,

    firstObservedAt:
      observations[0]
        ?.generatedAt ??
      null,

    lastObservedAt:
      observations[
        observations.length -
          1
      ]?.generatedAt ??
      null,

    dominantCandidateId:
      dominantCandidate.candidateId,

    dominantCandidateRate:
      dominantCandidate.rate,

    winnerSwitchCount:
      transitions.switchCount,

    winnerTransitionCount:
      transitions.transitionCount,

    winnerSwitchRate:
      calculateNullableRate({
        numerator:
          transitions.switchCount,

        denominator:
          transitions.transitionCount,

        decimalPlaces:
          4,
      }),

    winnerChangedCount,

    winnerChangedRate:
      calculateNullableRate({
        numerator:
          winnerChangedCount,

        denominator:
          observations.length,

        decimalPlaces:
          4,
      }),

    averageAdaptiveScoreDifference:
      calculateNullableAverage(
        adaptiveScoreDifferences
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Candidate Frequency */
/* ------------------------------------------------------------------ */

function createCandidateFrequencyRecord(
  observations:
    RuntimeRecommendationAdaptiveObservation[]
): Record<string, number> {
  const frequency:
    Record<string, number> = {};

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

    frequency[candidateId] =
      (
        frequency[candidateId] ??
        0
      ) +
      1;
  }

  return frequency;
}

type ResolveDominantCandidateParams = {
  frequency:
    Record<string, number>;

  observationCount:
    number;
};

function resolveDominantCandidate({
  frequency,
  observationCount,
}: ResolveDominantCandidateParams): {
  candidateId:
    string | null;

  rate:
    number | null;
} {
  const sortedCandidates =
    Object.entries(
      frequency
    ).sort(
      (
        left,
        right
      ) => {
        if (
          left[1] !==
          right[1]
        ) {
          return (
            right[1] -
            left[1]
          );
        }

        return left[0].localeCompare(
          right[0]
        );
      }
    );

  const dominant =
    sortedCandidates[0];

  if (
    dominant === undefined ||
    observationCount <= 0
  ) {
    return {
      candidateId:
        null,

      rate:
        null,
    };
  }

  return {
    candidateId:
      dominant[0],

    rate:
      roundDriftNumber(
        dominant[1] /
          observationCount,

        4
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Winner Transition */
/* ------------------------------------------------------------------ */

function calculateWindowWinnerTransitions(
  observations:
    RuntimeRecommendationAdaptiveObservation[]
): {
  switchCount:
    number;

  transitionCount:
    number;
} {
  if (
    observations.length < 2
  ) {
    return {
      switchCount:
        0,

      transitionCount:
        0,
    };
  }

  let switchCount =
    0;

  for (
    let index = 1;
    index < observations.length;
    index++
  ) {
    if (
      observations[
        index - 1
      ].adaptiveCandidateId !==
      observations[
        index
      ].adaptiveCandidateId
    ) {
      switchCount++;
    }
  }

  return {
    switchCount,

    transitionCount:
      observations.length -
      1,
  };
}

/* ------------------------------------------------------------------ */
/* Candidate Distribution Comparison */
/* ------------------------------------------------------------------ */

type CompareAdaptiveRecommendationCandidateDistributionsParams = {
  baseline:
    RuntimeRecommendationAdaptiveObservation[];

  recent:
    RuntimeRecommendationAdaptiveObservation[];

  decimalPlaces:
    number;
};

function compareAdaptiveRecommendationCandidateDistributions({
  baseline,
  recent,
  decimalPlaces,
}: CompareAdaptiveRecommendationCandidateDistributionsParams):
  RuntimeRecommendationAdaptiveObservationCandidateDistribution[] {
  const baselineFrequency =
    createCandidateFrequencyRecord(
      baseline
    );

  const recentFrequency =
    createCandidateFrequencyRecord(
      recent
    );

  const candidateIds =
    [
      ...new Set([
        ...Object.keys(
          baselineFrequency
        ),

        ...Object.keys(
          recentFrequency
        ),
      ]),
    ].sort(
      (
        left,
        right
      ) =>
        left.localeCompare(
          right
        )
    );

  return candidateIds.map(
    (
      candidateId
    ) => {
      const baselineCount =
        baselineFrequency[
          candidateId
        ] ??
        0;

      const recentCount =
        recentFrequency[
          candidateId
        ] ??
        0;

      const baselineRate =
        baseline.length > 0
          ? roundDriftNumber(
              baselineCount /
                baseline.length,

              decimalPlaces
            )
          : 0;

      const recentRate =
        recent.length > 0
          ? roundDriftNumber(
              recentCount /
                recent.length,

              decimalPlaces
            )
          : 0;

      return {
        candidateId,

        baselineCount,

        recentCount,

        baselineRate,

        recentRate,

        absoluteRateDifference:
          roundDriftNumber(
            Math.abs(
              recentRate -
                baselineRate
            ),

            decimalPlaces
          ),
      };
    }
  );
}

/* ------------------------------------------------------------------ */
/* Distribution Distance */
/* ------------------------------------------------------------------ */

type CalculateCandidateDistributionDistanceParams = {
  distributions:
    RuntimeRecommendationAdaptiveObservationCandidateDistribution[];

  decimalPlaces:
    number;
};

function calculateCandidateDistributionDistance({
  distributions,
  decimalPlaces,
}: CalculateCandidateDistributionDistanceParams):
  number | null {
  if (
    distributions.length === 0
  ) {
    return null;
  }

  const totalAbsoluteDifference =
    distributions.reduce(
      (
        total,
        distribution
      ) =>
        total +
        distribution
          .absoluteRateDifference,

      0
    );

  /*
   * Total Variation Distance:
   *
   * 0.5 × Σ |P(candidate) - Q(candidate)|
   */
  return roundDriftNumber(
    Math.min(
      1,
      totalAbsoluteDifference /
        2
    ),

    decimalPlaces
  );
}

/* ------------------------------------------------------------------ */
/* Score Difference Normalization */
/* ------------------------------------------------------------------ */

type NormalizeAdaptiveScoreDifferenceDeltaParams = {
  baseline:
    number | null;

  recent:
    number | null;

  decimalPlaces:
    number;
};

function normalizeAdaptiveScoreDifferenceDelta({
  baseline,
  recent,
  decimalPlaces,
}: NormalizeAdaptiveScoreDifferenceDeltaParams):
  number | null {
  if (
    baseline === null ||
    recent === null
  ) {
    return null;
  }

  const difference =
    Math.abs(
      recent -
        baseline
    );

  const scale =
    Math.max(
      1,
      Math.abs(
        baseline
      ),
      Math.abs(
        recent
      )
    );

  return roundDriftNumber(
    Math.min(
      1,
      difference /
        scale
    ),

    decimalPlaces
  );
}

/* ------------------------------------------------------------------ */
/* Drift Score */
/* ------------------------------------------------------------------ */

type CalculateAdaptiveRecommendationObservationDriftScoreParams = {
  candidateDistributionDistance:
    number | null;

  winnerSwitchRateDifference:
    number | null;

  winnerChangeRateDifference:
    number | null;

  normalizedAdaptiveScoreDifferenceDelta:
    number | null;

  policy:
    RuntimeRecommendationAdaptiveObservationDriftPolicy;
};

function calculateAdaptiveRecommendationObservationDriftScore({
  candidateDistributionDistance,
  winnerSwitchRateDifference,
  winnerChangeRateDifference,
  normalizedAdaptiveScoreDifferenceDelta,
  policy,
}: CalculateAdaptiveRecommendationObservationDriftScoreParams):
  number | null {
  const weightedValues =
    createAppliedDriftWeightedValues({
      candidateDistributionDistance,

      winnerSwitchRateDifference,

      winnerChangeRateDifference,

      normalizedAdaptiveScoreDifferenceDelta,

      policy,
    });

  if (
    weightedValues.weightTotal <=
    0
  ) {
    return null;
  }

  return roundDriftNumber(
    weightedValues.weightedTotal /
      weightedValues.weightTotal,

    policy.decimalPlaces
  );
}

function calculateAppliedDriftWeightTotal(
  params:
    CalculateAdaptiveRecommendationObservationDriftScoreParams
): number {
  return createAppliedDriftWeightedValues(
    params
  ).weightTotal;
}

function createAppliedDriftWeightedValues({
  candidateDistributionDistance,
  winnerSwitchRateDifference,
  winnerChangeRateDifference,
  normalizedAdaptiveScoreDifferenceDelta,
  policy,
}: CalculateAdaptiveRecommendationObservationDriftScoreParams): {
  weightedTotal:
    number;

  weightTotal:
    number;
} {
  let weightedTotal =
    0;

  let weightTotal =
    0;

  const addMetric = (
    value:
      number | null,
    weight:
      number
  ): void => {
    if (
      value === null ||
      weight <= 0
    ) {
      return;
    }

    weightedTotal +=
      value *
      weight;

    weightTotal +=
      weight;
  };

  addMetric(
    candidateDistributionDistance,
    policy.candidateDistributionWeight
  );

  addMetric(
    winnerSwitchRateDifference,
    policy.winnerSwitchRateWeight
  );

  addMetric(
    winnerChangeRateDifference,
    policy.winnerChangeRateWeight
  );

  addMetric(
    normalizedAdaptiveScoreDifferenceDelta,
    policy.adaptiveScoreDifferenceWeight
  );

  return {
    weightedTotal,

    weightTotal:
      roundDriftNumber(
        weightTotal,
        policy.decimalPlaces
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Status / Reason / Level */
/* ------------------------------------------------------------------ */

type ResolveAdaptiveRecommendationObservationDriftStateParams = {
  observationCount:
    number;

  baselineWindowCount:
    number;

  recentWindowCount:
    number;

  incompleteObservationCount:
    number;

  policy:
    RuntimeRecommendationAdaptiveObservationDriftPolicy;
};

function resolveAdaptiveRecommendationObservationDriftStatus({
  observationCount,
  baselineWindowCount,
  recentWindowCount,
  incompleteObservationCount,
  policy,
}: ResolveAdaptiveRecommendationObservationDriftStateParams):
  RuntimeRecommendationAdaptiveObservationDriftStatus {
  if (
    observationCount === 0 ||
    baselineWindowCount <
      policy.minimumComparableObservationCountPerWindow ||
    recentWindowCount <
      policy.minimumComparableObservationCountPerWindow
  ) {
    return "insufficient-data";
  }

  if (
    incompleteObservationCount >
    0
  ) {
    return "partial";
  }

  return "calculated";
}

function resolveAdaptiveRecommendationObservationDriftReason({
  observationCount,
  baselineWindowCount,
  recentWindowCount,
  incompleteObservationCount,
  policy,
}: ResolveAdaptiveRecommendationObservationDriftStateParams):
  RuntimeRecommendationAdaptiveObservationDriftReason {
  if (
    observationCount === 0
  ) {
    return "no-observations";
  }

  if (
    baselineWindowCount === 0 &&
    recentWindowCount > 0
  ) {
    return "not-enough-observations-for-two-windows";
  }

  if (
    baselineWindowCount <
    policy.minimumComparableObservationCountPerWindow
  ) {
    return "not-enough-baseline-observations";
  }

  if (
    recentWindowCount <
    policy.minimumComparableObservationCountPerWindow
  ) {
    return "not-enough-recent-observations";
  }

  if (
    incompleteObservationCount >
    0
  ) {
    return "history-contains-incomplete-observations";
  }

  return "baseline-and-recent-windows-compared";
}

type ResolveAdaptiveRecommendationObservationDriftLevelParams = {
  status:
    RuntimeRecommendationAdaptiveObservationDriftStatus;

  driftScore:
    number | null;

  policy:
    RuntimeRecommendationAdaptiveObservationDriftPolicy;
};

function resolveAdaptiveRecommendationObservationDriftLevel({
  status,
  driftScore,
  policy,
}: ResolveAdaptiveRecommendationObservationDriftLevelParams):
  RuntimeRecommendationAdaptiveObservationDriftLevel {
  if (
    status ===
      "insufficient-data" ||
    driftScore ===
      null
  ) {
    return "insufficient-data";
  }

  if (
    driftScore >=
    policy.significantDriftThreshold
  ) {
    return "significant";
  }

  if (
    driftScore >=
    policy.emergingDriftThreshold
  ) {
    return "emerging";
  }

  return "stable";
}

/* ------------------------------------------------------------------ */
/* Diagnostics */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationObservationDriftDiagnosticsParams = {
  drift:
    RuntimeRecommendationAdaptiveObservationDrift;

  generatedAt:
    string;

  appliedWeightTotal:
    number;

  warnings:
    string[];
};

function createAdaptiveRecommendationObservationDriftDiagnostics({
  drift,
  generatedAt,
  appliedWeightTotal,
  warnings,
}: CreateAdaptiveRecommendationObservationDriftDiagnosticsParams):
  RuntimeRecommendationAdaptiveObservationDriftDiagnostics {
  const uniqueWarnings =
    normalizeUniqueDriftWarnings(
      warnings
    );

  return {
    generatedAt,

    observationCount:
      drift.observationCount,

    comparableObservationCount:
      drift.comparableObservationCount,

    incompleteObservationCount:
      drift.incompleteObservationCount,

    baselineWindowCount:
      drift.baselineWindow
        .observationCount,

    recentWindowCount:
      drift.recentWindow
        .observationCount,

    candidateCount:
      drift.candidateDistributions
        .length,

    appliedWeightTotal,

    warningCount:
      uniqueWarnings.length,

    warnings:
      [
        ...uniqueWarnings,
      ],
  };
}

/* ------------------------------------------------------------------ */
/* Validation */
/* ------------------------------------------------------------------ */

type ValidateAdaptiveRecommendationObservationDriftInputParams = {
  history:
    RuntimeRecommendationAdaptiveObservationHistory;

  warnings:
    string[];
};

function validateAdaptiveRecommendationObservationDriftInput({
  history,
  warnings,
}: ValidateAdaptiveRecommendationObservationDriftInputParams):
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
    history.observations.length ===
    0
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
      observation.observationId
        .trim().length ===
      0
    ) {
      warnings.push(
        "Observation Drift input contains an empty observationId."
      );
    }

    if (
      !Number.isFinite(
        Date.parse(
          observation.generatedAt
        )
      )
    ) {
      warnings.push(
        `Observation "${observation.observationId}" contains an invalid generatedAt value.`
      );
    }

    if (
      observation.adaptiveCandidateId !==
        null &&
      observation.adaptiveCandidateId
        .trim().length ===
        0
    ) {
      warnings.push(
        `Observation "${observation.observationId}" contains an empty adaptiveCandidateId.`
      );
    }

    if (
      observation.adaptiveScoreDifference !==
        null &&
      !Number.isFinite(
        observation.adaptiveScoreDifference
      )
    ) {
      warnings.push(
        `Observation "${observation.observationId}" contains a non-finite adaptiveScoreDifference value.`
      );
    }
  }
}

type ValidateAdaptiveRecommendationObservationDriftResultParams = {
  drift:
    RuntimeRecommendationAdaptiveObservationDrift;

  warnings:
    string[];
};

function validateAdaptiveRecommendationObservationDriftResult({
  drift,
  warnings,
}: ValidateAdaptiveRecommendationObservationDriftResultParams):
  void {
  if (
    drift.comparableObservationCount +
      drift.incompleteObservationCount !==
    drift.observationCount
  ) {
    warnings.push(
      "Comparable and incomplete Observation counts do not match the total Observation count."
    );
  }

  if (
    drift.baselineWindow
      .observationCount +
      drift.recentWindow
        .observationCount >
    drift.comparableObservationCount
  ) {
    warnings.push(
      "Drift Window counts exceed the comparable Observation count."
    );
  }

  if (
    drift.driftScore !==
      null &&
    (
      drift.driftScore < 0 ||
      drift.driftScore > 1
    )
  ) {
    warnings.push(
      "Adaptive Recommendation Drift Score is outside the valid range."
    );
  }

  if (
    drift.candidateDistributionDistance !==
      null &&
    (
      drift.candidateDistributionDistance <
        0 ||
      drift.candidateDistributionDistance >
        1
    )
  ) {
    warnings.push(
      "Candidate Distribution Distance is outside the valid range."
    );
  }

  validateAdaptiveRecommendationDriftWindowSnapshot({
    name:
      "Baseline",

    snapshot:
      drift.baselineWindow,

    warnings,
  });

  validateAdaptiveRecommendationDriftWindowSnapshot({
    name:
      "Recent",

    snapshot:
      drift.recentWindow,

    warnings,
  });
}

type ValidateAdaptiveRecommendationDriftWindowSnapshotParams = {
  name:
    string;

  snapshot:
    RuntimeRecommendationAdaptiveObservationDriftWindowSnapshot;

  warnings:
    string[];
};

function validateAdaptiveRecommendationDriftWindowSnapshot({
  name,
  snapshot,
  warnings,
}: ValidateAdaptiveRecommendationDriftWindowSnapshotParams):
  void {
  const expectedTransitionCount =
    Math.max(
      0,
      snapshot.observationCount -
        1
    );

  if (
    snapshot.winnerTransitionCount !==
    expectedTransitionCount
  ) {
    warnings.push(
      `${name} Drift Window transition count does not match its Observation count.`
    );
  }

  if (
    snapshot.winnerSwitchCount >
    snapshot.winnerTransitionCount
  ) {
    warnings.push(
      `${name} Drift Window switch count exceeds its transition count.`
    );
  }

  if (
    snapshot.winnerChangedCount >
    snapshot.observationCount
  ) {
    warnings.push(
      `${name} Drift Window changed-winner count exceeds its Observation count.`
    );
  }
}

/* ------------------------------------------------------------------ */
/* Clone */
/* ------------------------------------------------------------------ */

export function cloneRuntimeRecommendationAdaptiveObservationDrift(
  drift:
    RuntimeRecommendationAdaptiveObservationDrift
): RuntimeRecommendationAdaptiveObservationDrift {
  return {
    ...drift,

    baselineWindow: {
      ...drift.baselineWindow,
    },

    recentWindow: {
      ...drift.recentWindow,
    },

    candidateDistributions:
      drift.candidateDistributions.map(
        (
          distribution
        ) => ({
          ...distribution,
        })
      ),
  };
}

export function cloneRuntimeRecommendationAdaptiveObservationDriftDiagnostics(
  diagnostics:
    RuntimeRecommendationAdaptiveObservationDriftDiagnostics
): RuntimeRecommendationAdaptiveObservationDriftDiagnostics {
  return {
    ...diagnostics,

    warnings: [
      ...diagnostics.warnings,
    ],
  };
}

export function cloneRuntimeRecommendationAdaptiveObservationDriftPolicy(
  policy:
    RuntimeRecommendationAdaptiveObservationDriftPolicy
): RuntimeRecommendationAdaptiveObservationDriftPolicy {
  return {
    ...policy,
  };
}

/* ------------------------------------------------------------------ */
/* Policy Normalization */
/* ------------------------------------------------------------------ */

export function normalizeRuntimeRecommendationAdaptiveObservationDriftPolicy(
  policy?:
    PartialRuntimeRecommendationAdaptiveObservationDriftPolicy
): RuntimeRecommendationAdaptiveObservationDriftPolicy {
  const fallback =
    DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_DRIFT_POLICY;

  const emergingDriftThreshold =
    normalizeDriftRate(
      policy?.emergingDriftThreshold,
      fallback.emergingDriftThreshold
    );

  const requestedSignificantDriftThreshold =
    normalizeDriftRate(
      policy?.significantDriftThreshold,
      fallback.significantDriftThreshold
    );

  const normalizedWeights =
    normalizeAdaptiveRecommendationDriftWeights({
      candidateDistributionWeight:
        policy?.candidateDistributionWeight ??
        fallback.candidateDistributionWeight,

      winnerSwitchRateWeight:
        policy?.winnerSwitchRateWeight ??
        fallback.winnerSwitchRateWeight,

      winnerChangeRateWeight:
        policy?.winnerChangeRateWeight ??
        fallback.winnerChangeRateWeight,

      adaptiveScoreDifferenceWeight:
        policy?.adaptiveScoreDifferenceWeight ??
        fallback.adaptiveScoreDifferenceWeight,
    });

  return {
    baselineWindowSize:
      normalizePositiveDriftInteger(
        policy?.baselineWindowSize,
        fallback.baselineWindowSize
      ),

    recentWindowSize:
      normalizePositiveDriftInteger(
        policy?.recentWindowSize,
        fallback.recentWindowSize
      ),

    minimumComparableObservationCountPerWindow:
      normalizePositiveDriftInteger(
        policy
          ?.minimumComparableObservationCountPerWindow,
        fallback
          .minimumComparableObservationCountPerWindow
      ),

    emergingDriftThreshold,

    significantDriftThreshold:
      Math.max(
        emergingDriftThreshold,
        requestedSignificantDriftThreshold
      ),

    candidateDistributionWeight:
      normalizedWeights
        .candidateDistributionWeight,

    winnerSwitchRateWeight:
      normalizedWeights
        .winnerSwitchRateWeight,

    winnerChangeRateWeight:
      normalizedWeights
        .winnerChangeRateWeight,

    adaptiveScoreDifferenceWeight:
      normalizedWeights
        .adaptiveScoreDifferenceWeight,

    decimalPlaces:
      normalizeDriftDecimalPlaces(
        policy?.decimalPlaces,
        fallback.decimalPlaces
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Primitive Helpers */
/* ------------------------------------------------------------------ */

function normalizePositiveDriftInteger(
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

function normalizeDriftRate(
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

function normalizeDriftDecimalPlaces(
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

function normalizeAdaptiveRecommendationDriftWeights({
  candidateDistributionWeight,
  winnerSwitchRateWeight,
  winnerChangeRateWeight,
  adaptiveScoreDifferenceWeight,
}: {
  candidateDistributionWeight:
    number;

  winnerSwitchRateWeight:
    number;

  winnerChangeRateWeight:
    number;

  adaptiveScoreDifferenceWeight:
    number;
}): {
  candidateDistributionWeight:
    number;

  winnerSwitchRateWeight:
    number;

  winnerChangeRateWeight:
    number;

  adaptiveScoreDifferenceWeight:
    number;
} {
  const values = {
    candidateDistributionWeight:
      normalizeNonNegativeDriftNumber(
        candidateDistributionWeight
      ),

    winnerSwitchRateWeight:
      normalizeNonNegativeDriftNumber(
        winnerSwitchRateWeight
      ),

    winnerChangeRateWeight:
      normalizeNonNegativeDriftNumber(
        winnerChangeRateWeight
      ),

    adaptiveScoreDifferenceWeight:
      normalizeNonNegativeDriftNumber(
        adaptiveScoreDifferenceWeight
      ),
  };

  const total =
    values
      .candidateDistributionWeight +
    values
      .winnerSwitchRateWeight +
    values
      .winnerChangeRateWeight +
    values
      .adaptiveScoreDifferenceWeight;

  if (
    total <= 0
  ) {
    return {
      candidateDistributionWeight:
        DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_DRIFT_POLICY
          .candidateDistributionWeight,

      winnerSwitchRateWeight:
        DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_DRIFT_POLICY
          .winnerSwitchRateWeight,

      winnerChangeRateWeight:
        DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_DRIFT_POLICY
          .winnerChangeRateWeight,

      adaptiveScoreDifferenceWeight:
        DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_DRIFT_POLICY
          .adaptiveScoreDifferenceWeight,
    };
  }

  return {
    candidateDistributionWeight:
      values
        .candidateDistributionWeight /
      total,

    winnerSwitchRateWeight:
      values
        .winnerSwitchRateWeight /
      total,

    winnerChangeRateWeight:
      values
        .winnerChangeRateWeight /
      total,

    adaptiveScoreDifferenceWeight:
      values
        .adaptiveScoreDifferenceWeight /
      total,
  };
}

function normalizeNonNegativeDriftNumber(
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
    value
  );
}

function calculateNullableRate({
  numerator,
  denominator,
  decimalPlaces,
}: {
  numerator:
    number;

  denominator:
    number;

  decimalPlaces:
    number;
}): number | null {
  if (
    denominator <= 0
  ) {
    return null;
  }

  return roundDriftNumber(
    numerator /
      denominator,

    decimalPlaces
  );
}

function calculateNullableAverage(
  values:
    number[]
): number | null {
  if (
    values.length === 0
  ) {
    return null;
  }

  return (
    values.reduce(
      (
        total,
        value
      ) =>
        total +
        value,

      0
    ) /
    values.length
  );
}

function calculateNullableAbsoluteDifference({
  left,
  right,
  decimalPlaces,
}: {
  left:
    number | null;

  right:
    number | null;

  decimalPlaces:
    number;
}): number | null {
  if (
    left === null ||
    right === null
  ) {
    return null;
  }

  return roundDriftNumber(
    Math.abs(
      right -
        left
    ),

    decimalPlaces
  );
}

function calculateNullableSignedDifference({
  baseline,
  recent,
  decimalPlaces,
}: {
  baseline:
    number | null;

  recent:
    number | null;

  decimalPlaces:
    number;
}): number | null {
  if (
    baseline === null ||
    recent === null
  ) {
    return null;
  }

  return roundDriftNumber(
    recent -
      baseline,

    decimalPlaces
  );
}

function roundDriftNumber(
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

function normalizeUniqueDriftWarnings(
  warnings:
    string[]
): string[] {
  return [
    ...new Set(
      warnings
    ),
  ];
}