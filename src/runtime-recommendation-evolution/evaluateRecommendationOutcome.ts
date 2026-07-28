import type {
    EvaluateRecommendationLearningOutcomeParams,
    RecommendationLearningOutcomeCategory,
    RecommendationLearningOutcomeType,
} from "./recommendationAdaptiveLearningTypes";

import {
    resolveRecommendationLearningOutcomeCategory,
} from "./recommendationAdaptiveLearningTypes";

import type {
    RecommendationEvolutionMemoryComparison,
    RecommendationEvolutionMemoryEntry,
} from "./recommendationEvolutionMemoryTypes";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

/**
 * 부동소수점 오차나 미세한 Score 변화가 의미 있는 Outcome으로
 * 과도하게 해석되는 것을 방지합니다.
 */
const MEANINGFUL_SCORE_CHANGE_THRESHOLD =
  0.05;

/**
 * 두 방향 점수가 거의 동일한 경우 우위를 확정하지 않도록 하는
 * 비교 허용 오차입니다.
 */
const SCORE_DIRECTION_TOLERANCE =
  1e-10;

/* ------------------------------------------------------------------ */
/* Public Result Types                                                */
/* ------------------------------------------------------------------ */

export type RecommendationOutcomeEvaluation = {
  outcome:
    RecommendationLearningOutcomeType;

  category:
    RecommendationLearningOutcomeCategory;

  constructiveScore:
    number;

  riskScore:
    number;

  confidence:
    number;

  reasoning:
    string[];
};

export type EvaluateRecommendationOutcomeDetailedParams =
  EvaluateRecommendationLearningOutcomeParams;

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * 하나의 Recommendation Evolution Memory Comparison을
 * Adaptive Learning Outcome으로 분류합니다.
 *
 * 이 함수는 사용자의 성향이나 의도를 추론하지 않습니다.
 * 이전 Entry와 현재 Entry 사이에서 실제로 관찰된 State,
 * Strategy 및 Score 변화만 평가합니다.
 */
export function evaluateRecommendationLearningOutcome(
  params:
    EvaluateRecommendationLearningOutcomeParams,
): RecommendationLearningOutcomeType {
  validateEvaluationParams(
    params,
  );

  const {
    previous,
    current,
    comparison,
  } = params;

  if (
    previous ===
    null
  ) {
    return "unknown";
  }

  switch (
    comparison.type
  ) {
    case "initial":
      return "unknown";

    case "unchanged":
      return resolveUnchangedOutcome(
        previous,
        current,
        comparison,
      );

    case "stabilized":
      return resolveStabilizedOutcome(
        comparison,
      );

    case "progressed":
      return resolveProgressedOutcome(
        comparison,
      );

    case "advanced":
      return "advanced";

    case "stalled":
      return "stalled";

    case "fragmented":
      return "fragmented";

    case "recovered":
      return "recovered";

    case "regressed":
      return "regressed";

    case "strategy-shifted":
      return resolveStrategyShiftedOutcome(
        comparison,
      );

    case "confidence-improved":
      return resolveConfidenceImprovedOutcome(
        comparison,
      );

    case "confidence-declined":
      return resolveConfidenceDeclinedOutcome(
        comparison,
      );

    case "mixed":
      return resolveMixedOutcome(
        comparison,
      );
  }
}

/**
 * Outcome뿐 아니라 점수 방향, Confidence 및 판단 근거까지
 * 함께 반환합니다.
 *
 * 이후 Pattern Detection이나 Presentation 계층에서 같은 판단
 * 근거를 다시 계산하지 않도록 제공하는 상세 API입니다.
 */
export function evaluateRecommendationOutcomeDetailed(
  params:
    EvaluateRecommendationOutcomeDetailedParams,
): RecommendationOutcomeEvaluation {
  validateEvaluationParams(
    params,
  );

  const outcome =
    evaluateRecommendationLearningOutcome(
      params,
    );

  const constructiveScore =
    calculateConstructiveMovementScore(
      params.comparison,
    );

  const riskScore =
    calculateRiskMovementScore(
      params.comparison,
    );

  return {
    outcome,

    category:
      resolveRecommendationLearningOutcomeCategory(
        outcome,
      ),

    constructiveScore,

    riskScore,

    confidence:
      calculateOutcomeEvaluationConfidence({
        outcome,
        comparison:
          params.comparison,
        constructiveScore,
        riskScore,
      }),

    reasoning:
      createOutcomeEvaluationReasoning({
        outcome,
        comparison:
          params.comparison,
        constructiveScore,
        riskScore,
      }),
  };
}

/* ------------------------------------------------------------------ */
/* Unchanged Outcome                                                  */
/* ------------------------------------------------------------------ */

function resolveUnchangedOutcome(
  previous:
    RecommendationEvolutionMemoryEntry,
  current:
    RecommendationEvolutionMemoryEntry,
  comparison:
    RecommendationEvolutionMemoryComparison,
): RecommendationLearningOutcomeType {
  if (
    current.state ===
      "advancing" &&
    hasPositiveMomentum(
      comparison,
    )
  ) {
    return "advanced";
  }

  if (
    current.state ===
    "stalled"
  ) {
    return "stalled";
  }

  if (
    current.state ===
    "fragmented"
  ) {
    return "fragmented";
  }

  if (
    hasConstructiveScoreMovement(
      comparison,
    ) &&
    !hasRiskAccumulation(
      comparison,
    )
  ) {
    return "improved";
  }

  if (
    hasRiskAccumulation(
      comparison,
    ) &&
    !hasConstructiveScoreMovement(
      comparison,
    )
  ) {
    return "regressed";
  }

  if (
    previous.state ===
      current.state &&
    previous.strategyType ===
      current.strategyType
  ) {
    return "maintained";
  }

  return "unknown";
}

/* ------------------------------------------------------------------ */
/* Stabilized Outcome                                                 */
/* ------------------------------------------------------------------ */

function resolveStabilizedOutcome(
  comparison:
    RecommendationEvolutionMemoryComparison,
): RecommendationLearningOutcomeType {
  if (
    hasDominantRiskMovement(
      comparison,
    )
  ) {
    return "unknown";
  }

  return "improved";
}

/* ------------------------------------------------------------------ */
/* Progressed Outcome                                                 */
/* ------------------------------------------------------------------ */

function resolveProgressedOutcome(
  comparison:
    RecommendationEvolutionMemoryComparison,
): RecommendationLearningOutcomeType {
  if (
    hasPositiveMomentum(
      comparison,
    )
  ) {
    return "improved";
  }

  return "maintained";
}

/* ------------------------------------------------------------------ */
/* Strategy-shifted Outcome                                           */
/* ------------------------------------------------------------------ */

function resolveStrategyShiftedOutcome(
  comparison:
    RecommendationEvolutionMemoryComparison,
): RecommendationLearningOutcomeType {
  if (
    hasDominantConstructiveMovement(
      comparison,
    )
  ) {
    return "improved";
  }

  if (
    hasDominantRiskMovement(
      comparison,
    )
  ) {
    return "regressed";
  }

  return "redirected";
}

/* ------------------------------------------------------------------ */
/* Confidence Outcome                                                 */
/* ------------------------------------------------------------------ */

function resolveConfidenceImprovedOutcome(
  comparison:
    RecommendationEvolutionMemoryComparison,
): RecommendationLearningOutcomeType {
  if (
    hasDominantConstructiveMovement(
      comparison,
    )
  ) {
    return "improved";
  }

  if (
    hasDominantRiskMovement(
      comparison,
    )
  ) {
    return "unknown";
  }

  return "maintained";
}

function resolveConfidenceDeclinedOutcome(
  comparison:
    RecommendationEvolutionMemoryComparison,
): RecommendationLearningOutcomeType {
  if (
    hasDominantRiskMovement(
      comparison,
    )
  ) {
    return "regressed";
  }

  if (
    hasDominantConstructiveMovement(
      comparison,
    )
  ) {
    return "unknown";
  }

  return "maintained";
}

/* ------------------------------------------------------------------ */
/* Mixed Outcome                                                      */
/* ------------------------------------------------------------------ */

/**
 * mixed Comparison은 여러 변화 방향이 동시에 존재하므로
 * 하나의 속성만 사용하지 않고 전체 Score 방향을 비교합니다.
 */
function resolveMixedOutcome(
  comparison:
    RecommendationEvolutionMemoryComparison,
): RecommendationLearningOutcomeType {
  const constructiveScore =
    calculateConstructiveMovementScore(
      comparison,
    );

  const riskScore =
    calculateRiskMovementScore(
      comparison,
    );

  if (
    isMeaningfulScore(
      constructiveScore,
    ) &&
    isScoreDominant(
      constructiveScore,
      riskScore,
    )
  ) {
    return "improved";
  }

  if (
    isMeaningfulScore(
      riskScore,
    ) &&
    isScoreDominant(
      riskScore,
      constructiveScore,
    )
  ) {
    return "regressed";
  }

  if (
    comparison.strategyChanged
  ) {
    return "redirected";
  }

  if (
    !isMeaningfulScore(
      constructiveScore,
    ) &&
    !isMeaningfulScore(
      riskScore,
    )
  ) {
    return "maintained";
  }

  return "unknown";
}

/* ------------------------------------------------------------------ */
/* Score Direction Public Helpers                                     */
/* ------------------------------------------------------------------ */

export function calculateRecommendationConstructiveMovementScore(
  comparison:
    RecommendationEvolutionMemoryComparison,
): number {
  return calculateConstructiveMovementScore(
    comparison,
  );
}

export function calculateRecommendationRiskMovementScore(
  comparison:
    RecommendationEvolutionMemoryComparison,
): number {
  return calculateRiskMovementScore(
    comparison,
  );
}

export function hasRecommendationPositiveMomentum(
  comparison:
    RecommendationEvolutionMemoryComparison,
): boolean {
  return hasPositiveMomentum(
    comparison,
  );
}

/* ------------------------------------------------------------------ */
/* Score Direction Helpers                                            */
/* ------------------------------------------------------------------ */

function hasPositiveMomentum(
  comparison:
    RecommendationEvolutionMemoryComparison,
): boolean {
  return (
    comparison.scoreChanges.progress >
      MEANINGFUL_SCORE_CHANGE_THRESHOLD ||
    comparison.scoreChanges.completionMomentum >
      MEANINGFUL_SCORE_CHANGE_THRESHOLD
  );
}

function hasConstructiveScoreMovement(
  comparison:
    RecommendationEvolutionMemoryComparison,
): boolean {
  return isMeaningfulScore(
    calculateConstructiveMovementScore(
      comparison,
    ),
  );
}

function hasRiskAccumulation(
  comparison:
    RecommendationEvolutionMemoryComparison,
): boolean {
  return isMeaningfulScore(
    calculateRiskMovementScore(
      comparison,
    ),
  );
}

function hasDominantConstructiveMovement(
  comparison:
    RecommendationEvolutionMemoryComparison,
): boolean {
  const constructiveScore =
    calculateConstructiveMovementScore(
      comparison,
    );

  const riskScore =
    calculateRiskMovementScore(
      comparison,
    );

  return (
    isMeaningfulScore(
      constructiveScore,
    ) &&
    isScoreDominant(
      constructiveScore,
      riskScore,
    )
  );
}

function hasDominantRiskMovement(
  comparison:
    RecommendationEvolutionMemoryComparison,
): boolean {
  const constructiveScore =
    calculateConstructiveMovementScore(
      comparison,
    );

  const riskScore =
    calculateRiskMovementScore(
      comparison,
    );

  return (
    isMeaningfulScore(
      riskScore,
    ) &&
    isScoreDominant(
      riskScore,
      constructiveScore,
    )
  );
}

/**
 * 긍정 방향 변화:
 *
 * - stability 증가
 * - progress 증가
 * - completionMomentum 증가
 * - repetitionRisk 감소
 * - redirectionRisk 감소
 */
function calculateConstructiveMovementScore(
  comparison:
    RecommendationEvolutionMemoryComparison,
): number {
  const {
    scoreChanges,
  } = comparison;

  return averageNumbers([
    positivePart(
      scoreChanges.stability,
    ),

    positivePart(
      scoreChanges.progress,
    ),

    positivePart(
      scoreChanges.completionMomentum,
    ),

    positivePart(
      -scoreChanges.repetitionRisk,
    ),

    positivePart(
      -scoreChanges.redirectionRisk,
    ),
  ]);
}

/**
 * 위험 방향 변화:
 *
 * - stability 감소
 * - progress 감소
 * - completionMomentum 감소
 * - repetitionRisk 증가
 * - redirectionRisk 증가
 */
function calculateRiskMovementScore(
  comparison:
    RecommendationEvolutionMemoryComparison,
): number {
  const {
    scoreChanges,
  } = comparison;

  return averageNumbers([
    positivePart(
      -scoreChanges.stability,
    ),

    positivePart(
      -scoreChanges.progress,
    ),

    positivePart(
      -scoreChanges.completionMomentum,
    ),

    positivePart(
      scoreChanges.repetitionRisk,
    ),

    positivePart(
      scoreChanges.redirectionRisk,
    ),
  ]);
}

function positivePart(
  value:
    number,
): number {
  return Math.max(
    0,
    value,
  );
}

function averageNumbers(
  values:
    readonly number[],
): number {
  if (
    values.length ===
    0
  ) {
    return 0;
  }

  const total =
    values.reduce(
      (
        sum,
        value,
      ) =>
        sum +
        value,
      0,
    );

  return total /
    values.length;
}

function isMeaningfulScore(
  value:
    number,
): boolean {
  return value >=
    MEANINGFUL_SCORE_CHANGE_THRESHOLD;
}

function isScoreDominant(
  candidate:
    number,
  counterpart:
    number,
): boolean {
  return (
    candidate -
      counterpart >
    SCORE_DIRECTION_TOLERANCE
  );
}

/* ------------------------------------------------------------------ */
/* Evaluation Confidence                                              */
/* ------------------------------------------------------------------ */

type CalculateOutcomeEvaluationConfidenceParams = {
  outcome:
    RecommendationLearningOutcomeType;

  comparison:
    RecommendationEvolutionMemoryComparison;

  constructiveScore:
    number;

  riskScore:
    number;
};

function calculateOutcomeEvaluationConfidence(
  params:
    CalculateOutcomeEvaluationConfidenceParams,
): number {
  const {
    outcome,
    comparison,
    constructiveScore,
    riskScore,
  } = params;

  if (
    outcome ===
    "unknown"
  ) {
    return 0;
  }

  const directionDifference =
    Math.abs(
      constructiveScore -
        riskScore,
    );

  const movementStrength =
    clampUnitInterval(
      Math.max(
        constructiveScore,
        riskScore,
      ),
    );

  const directionClarity =
    clampUnitInterval(
      directionDifference,
    );

  const explicitTypeConfidence =
    isExplicitComparisonOutcomeType(
      comparison.type,
    )
      ? 0.8
      : 0.5;

  const confidence =
    explicitTypeConfidence *
      0.5 +
    movementStrength *
      0.3 +
    directionClarity *
      0.2;

  return roundScore(
    clampUnitInterval(
      confidence,
    ),
  );
}

function isExplicitComparisonOutcomeType(
  type:
    RecommendationEvolutionMemoryComparison["type"],
): boolean {
  return (
    type ===
      "advanced" ||
    type ===
      "stalled" ||
    type ===
      "fragmented" ||
    type ===
      "recovered" ||
    type ===
      "regressed"
  );
}

/* ------------------------------------------------------------------ */
/* Reasoning                                                          */
/* ------------------------------------------------------------------ */

type CreateOutcomeEvaluationReasoningParams = {
  outcome:
    RecommendationLearningOutcomeType;

  comparison:
    RecommendationEvolutionMemoryComparison;

  constructiveScore:
    number;

  riskScore:
    number;
};

function createOutcomeEvaluationReasoning(
  params:
    CreateOutcomeEvaluationReasoningParams,
): string[] {
  const {
    outcome,
    comparison,
    constructiveScore,
    riskScore,
  } = params;

  const reasoning: string[] = [
    `Comparison type was evaluated as ${comparison.type}.`,
    `Constructive movement score was ${roundScore(constructiveScore)}.`,
    `Risk movement score was ${roundScore(riskScore)}.`,
    `Recommendation learning outcome was classified as ${outcome}.`,
  ];

  if (
    comparison.strategyChanged
  ) {
    reasoning.push(
      "The recommendation strategy changed between the compared entries.",
    );
  }

  if (
    comparison.stateChanged
  ) {
    reasoning.push(
      "The recommendation intelligence state changed between the compared entries.",
    );
  }

  if (
    comparison.confidenceChanged
  ) {
    reasoning.push(
      "Assessment confidence changed between the compared entries.",
    );
  }

  if (
    comparison.primarySignalChanged
  ) {
    reasoning.push(
      "The primary intelligence signal changed between the compared entries.",
    );
  }

  return reasoning;
}

/* ------------------------------------------------------------------ */
/* Validation                                                         */
/* ------------------------------------------------------------------ */

function validateEvaluationParams(
  params:
    EvaluateRecommendationLearningOutcomeParams,
): void {
  if (
    typeof params !==
      "object" ||
    params ===
      null ||
    Array.isArray(
      params,
    )
  ) {
    throw new Error(
      "Recommendation Outcome Evaluation params must be an object.",
    );
  }

  validateEntryReferenceConsistency(
    params,
  );

  validateScoreChanges(
    params.comparison,
  );
}

function validateEntryReferenceConsistency(
  params:
    EvaluateRecommendationLearningOutcomeParams,
): void {
  const {
    previous,
    current,
    comparison,
  } = params;

  if (
    comparison.current.id !==
    current.id
  ) {
    throw new Error(
      "Recommendation Outcome Evaluation current Entry must match Comparison current Entry.",
    );
  }

  if (
    previous ===
    null
  ) {
    if (
      comparison.previous !==
      null
    ) {
      throw new Error(
        "Recommendation Outcome Evaluation previous Entry must match Comparison previous Entry.",
      );
    }

    return;
  }

  if (
    comparison.previous ===
    null
  ) {
    throw new Error(
      "Recommendation Outcome Evaluation Comparison previous Entry is required.",
    );
  }

  if (
    comparison.previous.id !==
    previous.id
  ) {
    throw new Error(
      "Recommendation Outcome Evaluation previous Entry must match Comparison previous Entry.",
    );
  }

  if (
    previous.historyId !==
      current.historyId ||
    comparison.current.historyId !==
      current.historyId ||
    comparison.previous.historyId !==
      current.historyId
  ) {
    throw new Error(
      "Recommendation Outcome Evaluation Entries must share the same historyId.",
    );
  }
}

function validateScoreChanges(
  comparison:
    RecommendationEvolutionMemoryComparison,
): void {
  const values = [
    comparison.scoreChanges.stability,
    comparison.scoreChanges.progress,
    comparison.scoreChanges.repetitionRisk,
    comparison.scoreChanges.redirectionRisk,
    comparison.scoreChanges.completionMomentum,
  ];

  values.forEach(
    (
      value,
      index,
    ) => {
      if (
        typeof value !==
          "number" ||
        !Number.isFinite(
          value,
        )
      ) {
        throw new Error(
          `Recommendation Outcome Evaluation score change at index ${index} must be finite.`,
        );
      }

      if (
        value <
          -1 ||
        value >
          1
      ) {
        throw new Error(
          `Recommendation Outcome Evaluation score change at index ${index} must be between -1 and 1.`,
        );
      }
    },
  );
}

/* ------------------------------------------------------------------ */
/* Number Helpers                                                     */
/* ------------------------------------------------------------------ */

function clampUnitInterval(
  value:
    number,
): number {
  return Math.min(
    1,
    Math.max(
      0,
      value,
    ),
  );
}

function roundScore(
  value:
    number,
): number {
  return Math.round(
    value *
      10000,
  ) /
    10000;
}