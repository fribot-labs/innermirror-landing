import type {
    RuntimeRecommendationAdaptiveObservationStatistics,
} from "./createAdaptiveRecommendationObservationStatistics";

import type {
    RuntimeRecommendationAdaptiveObservationStability,
} from "./createAdaptiveRecommendationObservationStability";

import type {
    RuntimeRecommendationAdaptiveObservationDrift,
} from "./createAdaptiveRecommendationObservationDrift";

import {
    normalizeGeneratedAt,
} from "./runtimeRecommendationMath";

/* ------------------------------------------------------------------ */
/* Confidence Policy */
/* ------------------------------------------------------------------ */

/**
 * Adaptive Recommendation Observation Confidence 계산 정책입니다.
 *
 * Confidence는 Adaptive Recommendation의 정답 가능성을 의미하지 않습니다.
 *
 * Observation 분석 결과를 해석할 수 있을 만큼:
 *
 * - 충분한 데이터가 존재하는지
 * - Winner가 안정적으로 유지되는지
 * - Base와 Adaptive 결과가 얼마나 일관적인지
 * - 최근 Drift가 얼마나 낮은지
 *
 * 를 종합적으로 평가합니다.
 *
 * 이 결과는 Shadow Analytics에만 사용되며
 * RuntimeNextAction을 변경하지 않습니다.
 */
export type RuntimeRecommendationAdaptiveObservationConfidencePolicy = {
  /**
   * Confidence 계산을 시작하기 위한 최소 Observation 개수입니다.
   */
  minimumObservationCount:
    number;

  /**
   * Evidence Score가 최대값에 도달하는 Observation 개수입니다.
   */
  targetObservationCount:
    number;

  /**
   * Confidence Level이 emerging이 되는 최소 점수입니다.
   */
  emergingConfidenceThreshold:
    number;

  /**
   * Confidence Level이 established가 되는 최소 점수입니다.
   */
  establishedConfidenceThreshold:
    number;

  /**
   * Confidence Level이 strong이 되는 최소 점수입니다.
   */
  strongConfidenceThreshold:
    number;

  /**
   * Observation 수량 근거의 가중치입니다.
   */
  evidenceWeight:
    number;

  /**
   * Adaptive Winner Stability의 가중치입니다.
   */
  stabilityWeight:
    number;

  /**
   * Base와 Adaptive Winner 일치성의 가중치입니다.
   */
  agreementWeight:
    number;

  /**
   * 최근 Drift 부재 또는 낮은 Drift의 가중치입니다.
   */
  driftResistanceWeight:
    number;

  /**
   * 분석 데이터 완전성의 가중치입니다.
   */
  completenessWeight:
    number;

  /**
   * 계산 결과의 소수점 자리 수입니다.
   */
  decimalPlaces:
    number;
};

export type PartialRuntimeRecommendationAdaptiveObservationConfidencePolicy = {
  minimumObservationCount?:
    number;

  targetObservationCount?:
    number;

  emergingConfidenceThreshold?:
    number;

  establishedConfidenceThreshold?:
    number;

  strongConfidenceThreshold?:
    number;

  evidenceWeight?:
    number;

  stabilityWeight?:
    number;

  agreementWeight?:
    number;

  driftResistanceWeight?:
    number;

  completenessWeight?:
    number;

  decimalPlaces?:
    number;
};

/* ------------------------------------------------------------------ */
/* Default Policy */
/* ------------------------------------------------------------------ */

export const DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_CONFIDENCE_POLICY:
  RuntimeRecommendationAdaptiveObservationConfidencePolicy = {
    minimumObservationCount:
      3,

    targetObservationCount:
      20,

    emergingConfidenceThreshold:
      0.35,

    establishedConfidenceThreshold:
      0.65,

    strongConfidenceThreshold:
      0.85,

    evidenceWeight:
      0.25,

    stabilityWeight:
      0.25,

    agreementWeight:
      0.2,

    driftResistanceWeight:
      0.2,

    completenessWeight:
      0.1,

    decimalPlaces:
      4,
  };

/* ------------------------------------------------------------------ */
/* Confidence Status */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveObservationConfidenceStatus =
  | "calculated"
  | "partial"
  | "insufficient-data";

export type RuntimeRecommendationAdaptiveObservationConfidenceReason =
  | "adaptive-observation-confidence-calculated"
  | "analysis-contains-partial-data"
  | "no-observations"
  | "not-enough-observations"
  | "statistics-unavailable"
  | "stability-unavailable"
  | "drift-unavailable"
  | "no-confidence-components";

/* ------------------------------------------------------------------ */
/* Confidence Level */
/* ------------------------------------------------------------------ */

/**
 * Confidence는 분석 결과에 대한 해석 근거의 성숙도를 나타냅니다.
 *
 * Recommendation의 정확도, 진실성 또는 성공 가능성을
 * 직접 의미하지 않습니다.
 */
export type RuntimeRecommendationAdaptiveObservationConfidenceLevel =
  | "insufficient-data"
  | "low"
  | "emerging"
  | "established"
  | "strong";

/* ------------------------------------------------------------------ */
/* Confidence Component */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveObservationConfidenceComponentName =
  | "evidence"
  | "stability"
  | "agreement"
  | "drift-resistance"
  | "completeness";

export type RuntimeRecommendationAdaptiveObservationConfidenceComponent = {
  name:
    RuntimeRecommendationAdaptiveObservationConfidenceComponentName;

  available:
    boolean;

  value:
    number | null;

  weight:
    number;

  weightedValue:
    number | null;

  reason:
    string;
};

/* ------------------------------------------------------------------ */
/* Confidence */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveObservationConfidence = {
  observationCount:
    number;

  comparableObservationCount:
    number;

  incompleteObservationCount:
    number;

  /**
   * Observation 수량에 따른 근거 성숙도입니다.
   */
  evidenceScore:
    number | null;

  /**
   * Adaptive Winner Repeat Rate 기반 안정성 점수입니다.
   */
  stabilityScore:
    number | null;

  /**
   * Base Winner와 Adaptive Winner의 일치율입니다.
   */
  agreementScore:
    number | null;

  /**
   * Drift Score의 반대값입니다.
   *
   * Drift가 0이면 1,
   * Drift가 1이면 0입니다.
   */
  driftResistanceScore:
    number | null;

  /**
   * 전체 Observation 중 분석 가능한 Observation 비율입니다.
   */
  completenessScore:
    number | null;

  /**
   * 실제 계산에 적용된 가중치 합입니다.
   */
  appliedWeightTotal:
    number;

  /**
   * 가중 평균으로 계산된 최종 Confidence Score입니다.
   */
  confidenceScore:
    number | null;

  components:
    RuntimeRecommendationAdaptiveObservationConfidenceComponent[];

  level:
    RuntimeRecommendationAdaptiveObservationConfidenceLevel;

  status:
    RuntimeRecommendationAdaptiveObservationConfidenceStatus;

  reason:
    RuntimeRecommendationAdaptiveObservationConfidenceReason;
};

/* ------------------------------------------------------------------ */
/* Diagnostics */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveObservationConfidenceDiagnostics = {
  generatedAt:
    string;

  observationCount:
    number;

  comparableObservationCount:
    number;

  incompleteObservationCount:
    number;

  availableComponentCount:
    number;

  unavailableComponentCount:
    number;

  appliedWeightTotal:
    number;

  statisticsStatus:
    string;

  stabilityStatus:
    string;

  driftStatus:
    string;

  warningCount:
    number;

  warnings:
    string[];
};

/* ------------------------------------------------------------------ */
/* Public Result */
/* ------------------------------------------------------------------ */

export type CreateAdaptiveRecommendationObservationConfidenceResult = {
  confidence:
    RuntimeRecommendationAdaptiveObservationConfidence;

  diagnostics:
    RuntimeRecommendationAdaptiveObservationConfidenceDiagnostics;

  policy:
    RuntimeRecommendationAdaptiveObservationConfidencePolicy;
};

/* ------------------------------------------------------------------ */
/* Public Input */
/* ------------------------------------------------------------------ */

export type CreateAdaptiveRecommendationObservationConfidenceParams = {
  statistics:
    RuntimeRecommendationAdaptiveObservationStatistics;

  stability:
    RuntimeRecommendationAdaptiveObservationStability;

  drift:
    RuntimeRecommendationAdaptiveObservationDrift;

  policy?:
    PartialRuntimeRecommendationAdaptiveObservationConfidencePolicy;

  /**
   * 테스트 또는 회귀 검증을 위한 결정적 생성 시각입니다.
   */
  generatedAt?:
    string;
};

/* ------------------------------------------------------------------ */
/* Public API */
/* ------------------------------------------------------------------ */

export function createAdaptiveRecommendationObservationConfidence({
  statistics,
  stability,
  drift,
  policy,
  generatedAt,
}: CreateAdaptiveRecommendationObservationConfidenceParams):
  CreateAdaptiveRecommendationObservationConfidenceResult {
  const normalizedPolicy =
    normalizeRuntimeRecommendationAdaptiveObservationConfidencePolicy(
      policy
    );

  return createAdaptiveRecommendationObservationConfidenceWithPolicy({
    statistics,

    stability,

    drift,

    policy:
      normalizedPolicy,

    generatedAt:
      normalizeGeneratedAt(
        generatedAt
      ),
  });
}

/* ------------------------------------------------------------------ */
/* Internal Builder Contract */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationObservationConfidenceWithPolicyParams = {
  statistics:
    RuntimeRecommendationAdaptiveObservationStatistics;

  stability:
    RuntimeRecommendationAdaptiveObservationStability;

  drift:
    RuntimeRecommendationAdaptiveObservationDrift;

  policy:
    RuntimeRecommendationAdaptiveObservationConfidencePolicy;

  generatedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Confidence Builder */
/* ------------------------------------------------------------------ */

function createAdaptiveRecommendationObservationConfidenceWithPolicy({
  statistics,
  stability,
  drift,
  policy,
  generatedAt,
}: CreateAdaptiveRecommendationObservationConfidenceWithPolicyParams):
  CreateAdaptiveRecommendationObservationConfidenceResult {
  const warnings:
    string[] = [];

  validateAdaptiveRecommendationObservationConfidenceInput({
    statistics,

    stability,

    drift,

    warnings,
  });

  const observationCount =
    resolveConfidenceObservationCount({
      statistics,

      stability,

      drift,
    });

  const comparableObservationCount =
    resolveConfidenceComparableObservationCount({
      statistics,

      stability,

      drift,
    });

  const incompleteObservationCount =
    Math.max(
      0,
      observationCount -
        comparableObservationCount
    );

  const evidenceScore =
    calculateConfidenceEvidenceScore({
      observationCount:
        comparableObservationCount,

      targetObservationCount:
        policy.targetObservationCount,

      decimalPlaces:
        policy.decimalPlaces,
    });

  const stabilityScore =
    calculateConfidenceStabilityScore({
      stability,

      decimalPlaces:
        policy.decimalPlaces,
    });

  const agreementScore =
    calculateConfidenceAgreementScore({
      statistics,

      decimalPlaces:
        policy.decimalPlaces,
    });

  const driftResistanceScore =
    calculateConfidenceDriftResistanceScore({
      drift,

      decimalPlaces:
        policy.decimalPlaces,
    });

  const completenessScore =
    calculateConfidenceCompletenessScore({
      observationCount,

      comparableObservationCount,

      decimalPlaces:
        policy.decimalPlaces,
    });

  const components =
    createAdaptiveRecommendationConfidenceComponents({
      evidenceScore,

      stabilityScore,

      agreementScore,

      driftResistanceScore,

      completenessScore,

      policy,
    });

  const weightedResult =
    calculateAdaptiveRecommendationConfidenceWeightedResult({
      components,

      decimalPlaces:
        policy.decimalPlaces,
    });

  const status =
    resolveAdaptiveRecommendationObservationConfidenceStatus({
      observationCount,

      comparableObservationCount,

      components,

      statistics,

      stability,

      drift,

      policy,
    });

  const reason =
    resolveAdaptiveRecommendationObservationConfidenceReason({
      observationCount,

      comparableObservationCount,

      components,

      statistics,

      stability,

      drift,

      policy,
    });

  const level =
    resolveAdaptiveRecommendationObservationConfidenceLevel({
      status,

      confidenceScore:
        weightedResult.confidenceScore,

      policy,
    });

  const confidence:
    RuntimeRecommendationAdaptiveObservationConfidence = {
    observationCount,

    comparableObservationCount,

    incompleteObservationCount,

    evidenceScore,

    stabilityScore,

    agreementScore,

    driftResistanceScore,

    completenessScore,

    appliedWeightTotal:
      weightedResult.appliedWeightTotal,

    confidenceScore:
      weightedResult.confidenceScore,

    components,

    level,

    status,

    reason,
  };

  validateAdaptiveRecommendationObservationConfidenceResult({
    confidence,

    warnings,
  });

  const diagnostics =
    createAdaptiveRecommendationObservationConfidenceDiagnostics({
      confidence,

      statistics,

      stability,

      drift,

      generatedAt,

      warnings,
    });

  return {
    confidence:
      cloneRuntimeRecommendationAdaptiveObservationConfidence(
        confidence
      ),

    diagnostics:
      cloneRuntimeRecommendationAdaptiveObservationConfidenceDiagnostics(
        diagnostics
      ),

    policy:
      cloneRuntimeRecommendationAdaptiveObservationConfidencePolicy(
        policy
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Observation Count Resolution */
/* ------------------------------------------------------------------ */

type ResolveConfidenceObservationCountParams = {
  statistics:
    RuntimeRecommendationAdaptiveObservationStatistics;

  stability:
    RuntimeRecommendationAdaptiveObservationStability;

  drift:
    RuntimeRecommendationAdaptiveObservationDrift;
};

function resolveConfidenceObservationCount({
  statistics,
  stability,
  drift,
}: ResolveConfidenceObservationCountParams):
  number {
  return Math.max(
    0,
    statistics.observationCount,
    stability.observationCount,
    drift.observationCount
  );
}

function resolveConfidenceComparableObservationCount({
  statistics,
  stability,
  drift,
}: ResolveConfidenceObservationCountParams):
  number {
  return Math.max(
    0,
    Math.min(
      resolveConfidenceObservationCount({
        statistics,
        stability,
        drift,
      }),

      statistics.comparableObservationCount,

      stability.comparableObservationCount,

      drift.comparableObservationCount
    )
  );
}

/* ------------------------------------------------------------------ */
/* Evidence Score */
/* ------------------------------------------------------------------ */

type CalculateConfidenceEvidenceScoreParams = {
  observationCount:
    number;

  targetObservationCount:
    number;

  decimalPlaces:
    number;
};

function calculateConfidenceEvidenceScore({
  observationCount,
  targetObservationCount,
  decimalPlaces,
}: CalculateConfidenceEvidenceScoreParams):
  number | null {
  if (
    observationCount <= 0 ||
    targetObservationCount <= 0
  ) {
    return null;
  }

  return roundConfidenceNumber(
    Math.min(
      1,
      observationCount /
        targetObservationCount
    ),

    decimalPlaces
  );
}

/* ------------------------------------------------------------------ */
/* Stability Score */
/* ------------------------------------------------------------------ */

type CalculateConfidenceStabilityScoreParams = {
  stability:
    RuntimeRecommendationAdaptiveObservationStability;

  decimalPlaces:
    number;
};

function calculateConfidenceStabilityScore({
  stability,
  decimalPlaces,
}: CalculateConfidenceStabilityScoreParams):
  number | null {
  if (
    stability.status ===
      "insufficient-data" ||
    stability.adaptiveWinnerRepeatRate ===
      null
  ) {
    return null;
  }

  return roundConfidenceNumber(
    clampConfidenceRate(
      stability.adaptiveWinnerRepeatRate
    ),

    decimalPlaces
  );
}

/* ------------------------------------------------------------------ */
/* Agreement Score */
/* ------------------------------------------------------------------ */

type CalculateConfidenceAgreementScoreParams = {
  statistics:
    RuntimeRecommendationAdaptiveObservationStatistics;

  decimalPlaces:
    number;
};

function calculateConfidenceAgreementScore({
  statistics,
  decimalPlaces,
}: CalculateConfidenceAgreementScoreParams):
  number | null {
  if (
    statistics.status ===
      "insufficient-data"
  ) {
    return null;
  }

  if (
    statistics.sameCandidateRate !==
    null
  ) {
    return roundConfidenceNumber(
      clampConfidenceRate(
        statistics.sameCandidateRate
      ),

      decimalPlaces
    );
  }

  if (
    statistics.changedWinnerRate !==
    null
  ) {
    return roundConfidenceNumber(
      1 -
        clampConfidenceRate(
          statistics.changedWinnerRate
        ),

      decimalPlaces
    );
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Drift Resistance Score */
/* ------------------------------------------------------------------ */

type CalculateConfidenceDriftResistanceScoreParams = {
  drift:
    RuntimeRecommendationAdaptiveObservationDrift;

  decimalPlaces:
    number;
};

function calculateConfidenceDriftResistanceScore({
  drift,
  decimalPlaces,
}: CalculateConfidenceDriftResistanceScoreParams):
  number | null {
  if (
    drift.status ===
      "insufficient-data" ||
    drift.driftScore ===
      null
  ) {
    return null;
  }

  return roundConfidenceNumber(
    1 -
      clampConfidenceRate(
        drift.driftScore
      ),

    decimalPlaces
  );
}

/* ------------------------------------------------------------------ */
/* Completeness Score */
/* ------------------------------------------------------------------ */

type CalculateConfidenceCompletenessScoreParams = {
  observationCount:
    number;

  comparableObservationCount:
    number;

  decimalPlaces:
    number;
};

function calculateConfidenceCompletenessScore({
  observationCount,
  comparableObservationCount,
  decimalPlaces,
}: CalculateConfidenceCompletenessScoreParams):
  number | null {
  if (
    observationCount <= 0
  ) {
    return null;
  }

  return roundConfidenceNumber(
    clampConfidenceRate(
      comparableObservationCount /
        observationCount
    ),

    decimalPlaces
  );
}

/* ------------------------------------------------------------------ */
/* Confidence Components */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationConfidenceComponentsParams = {
  evidenceScore:
    number | null;

  stabilityScore:
    number | null;

  agreementScore:
    number | null;

  driftResistanceScore:
    number | null;

  completenessScore:
    number | null;

  policy:
    RuntimeRecommendationAdaptiveObservationConfidencePolicy;
};

function createAdaptiveRecommendationConfidenceComponents({
  evidenceScore,
  stabilityScore,
  agreementScore,
  driftResistanceScore,
  completenessScore,
  policy,
}: CreateAdaptiveRecommendationConfidenceComponentsParams):
  RuntimeRecommendationAdaptiveObservationConfidenceComponent[] {
  return [
    createAdaptiveRecommendationConfidenceComponent({
      name:
        "evidence",

      value:
        evidenceScore,

      weight:
        policy.evidenceWeight,

      reason:
        evidenceScore === null
          ? "No comparable Observation evidence is available."
          : "Confidence contribution from comparable Observation volume.",
    }),

    createAdaptiveRecommendationConfidenceComponent({
      name:
        "stability",

      value:
        stabilityScore,

      weight:
        policy.stabilityWeight,

      reason:
        stabilityScore === null
          ? "Adaptive Winner Stability is unavailable."
          : "Confidence contribution from Adaptive Winner continuity.",
    }),

    createAdaptiveRecommendationConfidenceComponent({
      name:
        "agreement",

      value:
        agreementScore,

      weight:
        policy.agreementWeight,

      reason:
        agreementScore === null
          ? "Base and Adaptive Winner agreement data is unavailable."
          : "Confidence contribution from Base and Adaptive Winner agreement.",
    }),

    createAdaptiveRecommendationConfidenceComponent({
      name:
        "drift-resistance",

      value:
        driftResistanceScore,

      weight:
        policy.driftResistanceWeight,

      reason:
        driftResistanceScore === null
          ? "Adaptive Recommendation Drift data is unavailable."
          : "Confidence contribution from resistance to recent behavioral Drift.",
    }),

    createAdaptiveRecommendationConfidenceComponent({
      name:
        "completeness",

      value:
        completenessScore,

      weight:
        policy.completenessWeight,

      reason:
        completenessScore === null
          ? "Observation completeness cannot be calculated."
          : "Confidence contribution from valid and comparable Observation coverage.",
    }),
  ];
}

type CreateAdaptiveRecommendationConfidenceComponentParams = {
  name:
    RuntimeRecommendationAdaptiveObservationConfidenceComponentName;

  value:
    number | null;

  weight:
    number;

  reason:
    string;
};

function createAdaptiveRecommendationConfidenceComponent({
  name,
  value,
  weight,
  reason,
}: CreateAdaptiveRecommendationConfidenceComponentParams):
  RuntimeRecommendationAdaptiveObservationConfidenceComponent {
  const available =
    value !== null &&
    Number.isFinite(
      value
    ) &&
    weight > 0;

  return {
    name,

    available,

    value:
      available
        ? clampConfidenceRate(
            value
          )
        : null,

    weight,

    weightedValue:
      available
        ? value *
          weight
        : null,

    reason,
  };
}

/* ------------------------------------------------------------------ */
/* Weighted Confidence */
/* ------------------------------------------------------------------ */

type CalculateAdaptiveRecommendationConfidenceWeightedResultParams = {
  components:
    RuntimeRecommendationAdaptiveObservationConfidenceComponent[];

  decimalPlaces:
    number;
};

type AdaptiveRecommendationConfidenceWeightedResult = {
  confidenceScore:
    number | null;

  appliedWeightTotal:
    number;
};

function calculateAdaptiveRecommendationConfidenceWeightedResult({
  components,
  decimalPlaces,
}: CalculateAdaptiveRecommendationConfidenceWeightedResultParams):
  AdaptiveRecommendationConfidenceWeightedResult {
  let weightedTotal =
    0;

  let appliedWeightTotal =
    0;

  for (
    const component of
    components
  ) {
    if (
      !component.available ||
      component.value === null ||
      component.weight <= 0
    ) {
      continue;
    }

    weightedTotal +=
      component.value *
      component.weight;

    appliedWeightTotal +=
      component.weight;
  }

  if (
    appliedWeightTotal <= 0
  ) {
    return {
      confidenceScore:
        null,

      appliedWeightTotal:
        0,
    };
  }

  return {
    confidenceScore:
      roundConfidenceNumber(
        weightedTotal /
          appliedWeightTotal,

        decimalPlaces
      ),

    appliedWeightTotal:
      roundConfidenceNumber(
        appliedWeightTotal,

        decimalPlaces
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Status / Reason */
/* ------------------------------------------------------------------ */

type ResolveAdaptiveRecommendationObservationConfidenceStateParams = {
  observationCount:
    number;

  comparableObservationCount:
    number;

  components:
    RuntimeRecommendationAdaptiveObservationConfidenceComponent[];

  statistics:
    RuntimeRecommendationAdaptiveObservationStatistics;

  stability:
    RuntimeRecommendationAdaptiveObservationStability;

  drift:
    RuntimeRecommendationAdaptiveObservationDrift;

  policy:
    RuntimeRecommendationAdaptiveObservationConfidencePolicy;
};

function resolveAdaptiveRecommendationObservationConfidenceStatus({
  observationCount,
  comparableObservationCount,
  components,
  statistics,
  stability,
  drift,
  policy,
}: ResolveAdaptiveRecommendationObservationConfidenceStateParams):
  RuntimeRecommendationAdaptiveObservationConfidenceStatus {
  if (
    observationCount === 0 ||
    comparableObservationCount <
      policy.minimumObservationCount ||
    countAvailableConfidenceComponents(
      components
    ) === 0
  ) {
    return "insufficient-data";
  }

  if (
    statistics.status !==
      "calculated" ||
    stability.status !==
      "calculated" ||
    drift.status !==
      "calculated" ||
    countUnavailableConfidenceComponents(
      components
    ) > 0
  ) {
    return "partial";
  }

  return "calculated";
}

function resolveAdaptiveRecommendationObservationConfidenceReason({
  observationCount,
  comparableObservationCount,
  components,
  statistics,
  stability,
  drift,
  policy,
}: ResolveAdaptiveRecommendationObservationConfidenceStateParams):
  RuntimeRecommendationAdaptiveObservationConfidenceReason {
  if (
    observationCount === 0
  ) {
    return "no-observations";
  }

  if (
    comparableObservationCount <
    policy.minimumObservationCount
  ) {
    return "not-enough-observations";
  }

  if (
    countAvailableConfidenceComponents(
      components
    ) === 0
  ) {
    return "no-confidence-components";
  }

  if (
    statistics.status ===
      "insufficient-data"
  ) {
    return "statistics-unavailable";
  }

  if (
    stability.status ===
      "insufficient-data"
  ) {
    return "stability-unavailable";
  }

  if (
    drift.status ===
      "insufficient-data"
  ) {
    return "drift-unavailable";
  }

  if (
    statistics.status !==
      "calculated" ||
    stability.status !==
      "calculated" ||
    drift.status !==
      "calculated" ||
    countUnavailableConfidenceComponents(
      components
    ) > 0
  ) {
    return "analysis-contains-partial-data";
  }

  return "adaptive-observation-confidence-calculated";
}

/* ------------------------------------------------------------------ */
/* Level */
/* ------------------------------------------------------------------ */

type ResolveAdaptiveRecommendationObservationConfidenceLevelParams = {
  status:
    RuntimeRecommendationAdaptiveObservationConfidenceStatus;

  confidenceScore:
    number | null;

  policy:
    RuntimeRecommendationAdaptiveObservationConfidencePolicy;
};

function resolveAdaptiveRecommendationObservationConfidenceLevel({
  status,
  confidenceScore,
  policy,
}: ResolveAdaptiveRecommendationObservationConfidenceLevelParams):
  RuntimeRecommendationAdaptiveObservationConfidenceLevel {
  if (
    status ===
      "insufficient-data" ||
    confidenceScore ===
      null
  ) {
    return "insufficient-data";
  }

  if (
    confidenceScore >=
    policy.strongConfidenceThreshold
  ) {
    return "strong";
  }

  if (
    confidenceScore >=
    policy.establishedConfidenceThreshold
  ) {
    return "established";
  }

  if (
    confidenceScore >=
    policy.emergingConfidenceThreshold
  ) {
    return "emerging";
  }

  return "low";
}

/* ------------------------------------------------------------------ */
/* Component Count */
/* ------------------------------------------------------------------ */

function countAvailableConfidenceComponents(
  components:
    RuntimeRecommendationAdaptiveObservationConfidenceComponent[]
): number {
  return components.filter(
    (
      component
    ) =>
      component.available
  ).length;
}

function countUnavailableConfidenceComponents(
  components:
    RuntimeRecommendationAdaptiveObservationConfidenceComponent[]
): number {
  return components.length -
    countAvailableConfidenceComponents(
      components
    );
}

/* ------------------------------------------------------------------ */
/* Diagnostics */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationObservationConfidenceDiagnosticsParams = {
  confidence:
    RuntimeRecommendationAdaptiveObservationConfidence;

  statistics:
    RuntimeRecommendationAdaptiveObservationStatistics;

  stability:
    RuntimeRecommendationAdaptiveObservationStability;

  drift:
    RuntimeRecommendationAdaptiveObservationDrift;

  generatedAt:
    string;

  warnings:
    string[];
};

function createAdaptiveRecommendationObservationConfidenceDiagnostics({
  confidence,
  statistics,
  stability,
  drift,
  generatedAt,
  warnings,
}: CreateAdaptiveRecommendationObservationConfidenceDiagnosticsParams):
  RuntimeRecommendationAdaptiveObservationConfidenceDiagnostics {
  const uniqueWarnings =
    normalizeUniqueConfidenceWarnings(
      warnings
    );

  const availableComponentCount =
    countAvailableConfidenceComponents(
      confidence.components
    );

  return {
    generatedAt,

    observationCount:
      confidence.observationCount,

    comparableObservationCount:
      confidence.comparableObservationCount,

    incompleteObservationCount:
      confidence.incompleteObservationCount,

    availableComponentCount,

    unavailableComponentCount:
      confidence.components.length -
      availableComponentCount,

    appliedWeightTotal:
      confidence.appliedWeightTotal,

    statisticsStatus:
      statistics.status,

    stabilityStatus:
      stability.status,

    driftStatus:
      drift.status,

    warningCount:
      uniqueWarnings.length,

    warnings:
      [
        ...uniqueWarnings,
      ],
  };
}

/* ------------------------------------------------------------------ */
/* Input Validation */
/* ------------------------------------------------------------------ */

type ValidateAdaptiveRecommendationObservationConfidenceInputParams = {
  statistics:
    RuntimeRecommendationAdaptiveObservationStatistics;

  stability:
    RuntimeRecommendationAdaptiveObservationStability;

  drift:
    RuntimeRecommendationAdaptiveObservationDrift;

  warnings:
    string[];
};

function validateAdaptiveRecommendationObservationConfidenceInput({
  statistics,
  stability,
  drift,
  warnings,
}: ValidateAdaptiveRecommendationObservationConfidenceInputParams):
  void {
  const observationCounts =
    [
      statistics.observationCount,
      stability.observationCount,
      drift.observationCount,
    ];

  if (
    new Set(
      observationCounts
    ).size >
    1
  ) {
    warnings.push(
      "Statistics, Stability, and Drift Observation counts do not match."
    );
  }

  if (
    statistics.comparableObservationCount !==
    stability.comparableObservationCount
  ) {
    warnings.push(
      "Statistics and Stability comparable Observation counts do not match."
    );
  }

  if (
    stability.comparableObservationCount !==
    drift.comparableObservationCount
  ) {
    warnings.push(
      "Stability and Drift comparable Observation counts do not match."
    );
  }

  if (
    statistics.status ===
      "insufficient-data"
  ) {
    warnings.push(
      "Observation Statistics is unavailable for complete Confidence analysis."
    );
  }

  if (
    stability.status ===
      "insufficient-data"
  ) {
    warnings.push(
      "Observation Stability is unavailable for complete Confidence analysis."
    );
  }

  if (
    drift.status ===
      "insufficient-data"
  ) {
    warnings.push(
      "Observation Drift is unavailable for complete Confidence analysis."
    );
  }

  validateNullableConfidenceRate({
    name:
      "Statistics sameCandidateRate",

    value:
      statistics.sameCandidateRate,

    warnings,
  });

  validateNullableConfidenceRate({
    name:
      "Statistics changedWinnerRate",

    value:
      statistics.changedWinnerRate,

    warnings,
  });

  validateNullableConfidenceRate({
    name:
      "Stability adaptiveWinnerRepeatRate",

    value:
      stability.adaptiveWinnerRepeatRate,

    warnings,
  });

  validateNullableConfidenceRate({
    name:
      "Drift driftScore",

    value:
      drift.driftScore,

    warnings,
  });
}

type ValidateNullableConfidenceRateParams = {
  name:
    string;

  value:
    number | null;

  warnings:
    string[];
};

function validateNullableConfidenceRate({
  name,
  value,
  warnings,
}: ValidateNullableConfidenceRateParams):
  void {
  if (
    value !== null &&
    (
      !Number.isFinite(
        value
      ) ||
      value < 0 ||
      value > 1
    )
  ) {
    warnings.push(
      `${name} is outside the valid range.`
    );
  }
}

/* ------------------------------------------------------------------ */
/* Result Validation */
/* ------------------------------------------------------------------ */

type ValidateAdaptiveRecommendationObservationConfidenceResultParams = {
  confidence:
    RuntimeRecommendationAdaptiveObservationConfidence;

  warnings:
    string[];
};

function validateAdaptiveRecommendationObservationConfidenceResult({
  confidence,
  warnings,
}: ValidateAdaptiveRecommendationObservationConfidenceResultParams):
  void {
  if (
    confidence.comparableObservationCount +
      confidence.incompleteObservationCount !==
    confidence.observationCount
  ) {
    warnings.push(
      "Comparable and incomplete Observation counts do not match the total Observation count."
    );
  }

  validateNullableConfidenceRate({
    name:
      "Evidence Score",

    value:
      confidence.evidenceScore,

    warnings,
  });

  validateNullableConfidenceRate({
    name:
      "Stability Score",

    value:
      confidence.stabilityScore,

    warnings,
  });

  validateNullableConfidenceRate({
    name:
      "Agreement Score",

    value:
      confidence.agreementScore,

    warnings,
  });

  validateNullableConfidenceRate({
    name:
      "Drift Resistance Score",

    value:
      confidence.driftResistanceScore,

    warnings,
  });

  validateNullableConfidenceRate({
    name:
      "Completeness Score",

    value:
      confidence.completenessScore,

    warnings,
  });

  validateNullableConfidenceRate({
    name:
      "Confidence Score",

    value:
      confidence.confidenceScore,

    warnings,
  });

  const expectedAvailableComponentCount =
    countAvailableConfidenceComponents(
      confidence.components
    );

  if (
    expectedAvailableComponentCount ===
      0 &&
    confidence.confidenceScore !==
      null
  ) {
    warnings.push(
      "Confidence Score exists without available Confidence components."
    );
  }

  if (
    expectedAvailableComponentCount >
      0 &&
    confidence.appliedWeightTotal <=
      0
  ) {
    warnings.push(
      "Confidence components are available without an applied weight total."
    );
  }

  for (
    const component of
    confidence.components
  ) {
    if (
      component.weight <
        0 ||
      !Number.isFinite(
        component.weight
      )
    ) {
      warnings.push(
        `Confidence component "${component.name}" has an invalid weight.`
      );
    }

    if (
      component.available &&
      component.value ===
        null
    ) {
      warnings.push(
        `Confidence component "${component.name}" is available without a value.`
      );
    }

    if (
      !component.available &&
      component.weightedValue !==
        null
    ) {
      warnings.push(
        `Unavailable Confidence component "${component.name}" contains a weighted value.`
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Clone */
/* ------------------------------------------------------------------ */

export function cloneRuntimeRecommendationAdaptiveObservationConfidence(
  confidence:
    RuntimeRecommendationAdaptiveObservationConfidence
): RuntimeRecommendationAdaptiveObservationConfidence {
  return {
    ...confidence,

    components:
      confidence.components.map(
        (
          component
        ) => ({
          ...component,
        })
      ),
  };
}

export function cloneRuntimeRecommendationAdaptiveObservationConfidenceDiagnostics(
  diagnostics:
    RuntimeRecommendationAdaptiveObservationConfidenceDiagnostics
): RuntimeRecommendationAdaptiveObservationConfidenceDiagnostics {
  return {
    ...diagnostics,

    warnings: [
      ...diagnostics.warnings,
    ],
  };
}

export function cloneRuntimeRecommendationAdaptiveObservationConfidencePolicy(
  policy:
    RuntimeRecommendationAdaptiveObservationConfidencePolicy
): RuntimeRecommendationAdaptiveObservationConfidencePolicy {
  return {
    ...policy,
  };
}

/* ------------------------------------------------------------------ */
/* Policy Normalization */
/* ------------------------------------------------------------------ */

export function normalizeRuntimeRecommendationAdaptiveObservationConfidencePolicy(
  policy?:
    PartialRuntimeRecommendationAdaptiveObservationConfidencePolicy
): RuntimeRecommendationAdaptiveObservationConfidencePolicy {
  const fallback =
    DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_CONFIDENCE_POLICY;

  const minimumObservationCount =
    normalizePositiveConfidenceInteger(
      policy?.minimumObservationCount,
      fallback.minimumObservationCount
    );

  const targetObservationCount =
    Math.max(
      minimumObservationCount,

      normalizePositiveConfidenceInteger(
        policy?.targetObservationCount,
        fallback.targetObservationCount
      )
    );

  const emergingConfidenceThreshold =
    normalizeConfidenceRate(
      policy?.emergingConfidenceThreshold,
      fallback.emergingConfidenceThreshold
    );

  const requestedEstablishedConfidenceThreshold =
    normalizeConfidenceRate(
      policy?.establishedConfidenceThreshold,
      fallback.establishedConfidenceThreshold
    );

  const establishedConfidenceThreshold =
    Math.max(
      emergingConfidenceThreshold,
      requestedEstablishedConfidenceThreshold
    );

  const requestedStrongConfidenceThreshold =
    normalizeConfidenceRate(
      policy?.strongConfidenceThreshold,
      fallback.strongConfidenceThreshold
    );

  const strongConfidenceThreshold =
    Math.max(
      establishedConfidenceThreshold,
      requestedStrongConfidenceThreshold
    );

  const normalizedWeights =
    normalizeAdaptiveRecommendationConfidenceWeights({
      evidenceWeight:
        policy?.evidenceWeight ??
        fallback.evidenceWeight,

      stabilityWeight:
        policy?.stabilityWeight ??
        fallback.stabilityWeight,

      agreementWeight:
        policy?.agreementWeight ??
        fallback.agreementWeight,

      driftResistanceWeight:
        policy?.driftResistanceWeight ??
        fallback.driftResistanceWeight,

      completenessWeight:
        policy?.completenessWeight ??
        fallback.completenessWeight,
    });

  return {
    minimumObservationCount,

    targetObservationCount,

    emergingConfidenceThreshold,

    establishedConfidenceThreshold,

    strongConfidenceThreshold,

    evidenceWeight:
      normalizedWeights.evidenceWeight,

    stabilityWeight:
      normalizedWeights.stabilityWeight,

    agreementWeight:
      normalizedWeights.agreementWeight,

    driftResistanceWeight:
      normalizedWeights.driftResistanceWeight,

    completenessWeight:
      normalizedWeights.completenessWeight,

    decimalPlaces:
      normalizeConfidenceDecimalPlaces(
        policy?.decimalPlaces,
        fallback.decimalPlaces
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Primitive Policy Helpers */
/* ------------------------------------------------------------------ */

function normalizePositiveConfidenceInteger(
  value:
    number | undefined,
  fallback:
    number
): number {
  if (
    typeof value !==
      "number" ||
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

function normalizeConfidenceRate(
  value:
    number | undefined,
  fallback:
    number
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value
    )
  ) {
    return fallback;
  }

  return clampConfidenceRate(
    value
  );
}

function normalizeConfidenceDecimalPlaces(
  value:
    number | undefined,
  fallback:
    number
): number {
  if (
    typeof value !==
      "number" ||
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
/* Weight Normalization */
/* ------------------------------------------------------------------ */

type AdaptiveRecommendationConfidenceWeights = {
  evidenceWeight:
    number;

  stabilityWeight:
    number;

  agreementWeight:
    number;

  driftResistanceWeight:
    number;

  completenessWeight:
    number;
};

function normalizeAdaptiveRecommendationConfidenceWeights({
  evidenceWeight,
  stabilityWeight,
  agreementWeight,
  driftResistanceWeight,
  completenessWeight,
}: AdaptiveRecommendationConfidenceWeights):
  AdaptiveRecommendationConfidenceWeights {
  const values:
    AdaptiveRecommendationConfidenceWeights = {
    evidenceWeight:
      normalizeNonNegativeConfidenceNumber(
        evidenceWeight
      ),

    stabilityWeight:
      normalizeNonNegativeConfidenceNumber(
        stabilityWeight
      ),

    agreementWeight:
      normalizeNonNegativeConfidenceNumber(
        agreementWeight
      ),

    driftResistanceWeight:
      normalizeNonNegativeConfidenceNumber(
        driftResistanceWeight
      ),

    completenessWeight:
      normalizeNonNegativeConfidenceNumber(
        completenessWeight
      ),
  };

  const total =
    values.evidenceWeight +
    values.stabilityWeight +
    values.agreementWeight +
    values.driftResistanceWeight +
    values.completenessWeight;

  if (
    total <= 0
  ) {
    return {
      evidenceWeight:
        DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_CONFIDENCE_POLICY
          .evidenceWeight,

      stabilityWeight:
        DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_CONFIDENCE_POLICY
          .stabilityWeight,

      agreementWeight:
        DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_CONFIDENCE_POLICY
          .agreementWeight,

      driftResistanceWeight:
        DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_CONFIDENCE_POLICY
          .driftResistanceWeight,

      completenessWeight:
        DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_CONFIDENCE_POLICY
          .completenessWeight,
    };
  }

  return {
    evidenceWeight:
      values.evidenceWeight /
      total,

    stabilityWeight:
      values.stabilityWeight /
      total,

    agreementWeight:
      values.agreementWeight /
      total,

    driftResistanceWeight:
      values.driftResistanceWeight /
      total,

    completenessWeight:
      values.completenessWeight /
      total,
  };
}

/* ------------------------------------------------------------------ */
/* Primitive Helpers */
/* ------------------------------------------------------------------ */

function normalizeNonNegativeConfidenceNumber(
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

function clampConfidenceRate(
  value:
    number
): number {
  return Math.min(
    1,
    Math.max(
      0,
      value
    )
  );
}

function roundConfidenceNumber(
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

function normalizeUniqueConfidenceWarnings(
  warnings:
    string[]
): string[] {
  return [
    ...new Set(
      warnings
    ),
  ];
}