import {
    isRecommendationPredictionConflictType,
    isRecommendationPredictionSeverity,
} from "./recommendationPredictiveIntelligenceTypes";

import {
    cloneRecommendationPredictedState,
    validateRecommendationPredictedStates,
} from "./predictNextRecommendationStates";

import {
    cloneRecommendationPredictedStrategy,
    validateRecommendationPredictedStrategies,
} from "./predictNextRecommendationStrategies";

import {
    cloneRecommendationPredictedRuntimeDecision,
    validateRecommendationPredictedRuntimeDecisions,
} from "./predictRuntimeDecisions";

import {
    cloneRecommendationPredictedRisk,
    validateRecommendationPredictedRisks,
} from "./predictRecommendationRisks";

import {
    cloneRecommendationPredictedOpportunity,
    validateRecommendationPredictedOpportunities,
} from "./predictRecommendationOpportunities";

import type {
    DetectRecommendationPredictionConflictsParams,
    NormalizeRecommendationRuntimeDecisionPredictionsParams,
    NormalizeRecommendationStatePredictionsParams,
    NormalizeRecommendationStrategyPredictionsParams,
    RecommendationPredictedOpportunity,
    RecommendationPredictedRisk,
    RecommendationPredictedRuntimeDecision,
    RecommendationPredictedState,
    RecommendationPredictedStrategy,
    RecommendationPredictionConflict,
    RecommendationPredictionConflictType,
    RecommendationPredictionSeverity,
    RecommendationPredictiveEntryState,
    RecommendationPredictiveRuntimeDecisionType,
    RecommendationPredictiveStrategyType,
} from "./recommendationPredictiveIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const SCORE_PRECISION =
  10000;

const PROBABILITY_SUM_TOLERANCE =
  0.001;

const DEFAULT_CONFLICT_DIFFERENCE_THRESHOLD =
  0.08;

const DEFAULT_MINIMUM_CONFLICT_SCORE =
  0.25;

const MAXIMUM_STATE_CANDIDATE_COUNT =
  7;

const MAXIMUM_STRATEGY_CANDIDATE_COUNT =
  8;

const MAXIMUM_RUNTIME_DECISION_CANDIDATE_COUNT =
  9;

const STATE_ORDER:
  readonly RecommendationPredictiveEntryState[] = [
    "unavailable",
    "observing",
    "stable",
    "progressing",
    "stalled",
    "fragmented",
    "advancing",
  ];

const STRATEGY_ORDER:
  readonly RecommendationPredictiveStrategyType[] = [
    "observe",
    "maintain",
    "clarify",
    "narrow",
    "confirm-completion",
    "advance",
    "stabilize",
    "reconsider",
  ];

const RUNTIME_DECISION_ORDER:
  readonly RecommendationPredictiveRuntimeDecisionType[] = [
    "request-completion-confirmation",
    "reconsider-current-recommendation",
    "reduce-direction-changes",
    "request-progress-evidence",
    "narrow-current-recommendation",
    "clarify-current-recommendation",
    "preserve-current-recommendation",
    "allow-new-recommendation",
    "block-new-recommendation",
  ];

/* ------------------------------------------------------------------ */
/* State Normalization                                                */
/* ------------------------------------------------------------------ */

/**
 * State Prediction을 다음 기준으로 정규화합니다.
 *
 * - 같은 State 후보 병합
 * - rawScore·probability·confidence 범위 보정
 * - probability 재계산
 * - minimumProbability 적용
 * - maximumCandidateCount 적용
 * - 결정적 정렬
 * - rank 재할당
 */
export function normalizeRecommendationStatePredictions(
  params:
    NormalizeRecommendationStatePredictionsParams,
): RecommendationPredictedState[] {
  validateNormalizeStatePredictionParams(
    params,
  );

  if (
    params.predictions.length ===
    0
  ) {
    return [];
  }

  const merged =
    mergeRecommendationStatePredictions(
      params.predictions,
    );

  const normalized =
    normalizeCandidateProbabilities(
      merged,
    );

  const selected =
    selectNormalizedPredictions({
      predictions:
        normalized,

      maximumCandidateCount:
        params.maximumCandidateCount,

      minimumProbability:
        params.minimumProbability,

      compare:
        compareRecommendationStatePredictions,
    });

  const ranked =
    selected.map(
      (
        prediction,
        index,
      ): RecommendationPredictedState => ({
        ...cloneRecommendationPredictedState(
          prediction,
        ),

        rank:
          index +
          1,
      }),
    );

  validateRecommendationPredictedStates(
    ranked,
  );

  return ranked.map(
    cloneRecommendationPredictedState,
  );
}

/* ------------------------------------------------------------------ */
/* Strategy Normalization                                             */
/* ------------------------------------------------------------------ */

export function normalizeRecommendationStrategyPredictions(
  params:
    NormalizeRecommendationStrategyPredictionsParams,
): RecommendationPredictedStrategy[] {
  validateNormalizeStrategyPredictionParams(
    params,
  );

  if (
    params.predictions.length ===
    0
  ) {
    return [];
  }

  const merged =
    mergeRecommendationStrategyPredictions(
      params.predictions,
    );

  const normalized =
    normalizeCandidateProbabilities(
      merged,
    );

  const selected =
    selectNormalizedPredictions({
      predictions:
        normalized,

      maximumCandidateCount:
        params.maximumCandidateCount,

      minimumProbability:
        params.minimumProbability,

      compare:
        compareRecommendationStrategyPredictions,
    });

  const ranked =
    selected.map(
      (
        prediction,
        index,
      ): RecommendationPredictedStrategy => ({
        ...cloneRecommendationPredictedStrategy(
          prediction,
        ),

        rank:
          index +
          1,
      }),
    );

  validateRecommendationPredictedStrategies(
    ranked,
  );

  return ranked.map(
    cloneRecommendationPredictedStrategy,
  );
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Normalization                                     */
/* ------------------------------------------------------------------ */

export function normalizeRecommendationRuntimeDecisionPredictions(
  params:
    NormalizeRecommendationRuntimeDecisionPredictionsParams,
): RecommendationPredictedRuntimeDecision[] {
  validateNormalizeRuntimeDecisionPredictionParams(
    params,
  );

  if (
    params.predictions.length ===
    0
  ) {
    return [];
  }

  const merged =
    mergeRecommendationRuntimeDecisionPredictions(
      params.predictions,
    );

  const normalized =
    normalizeCandidateProbabilities(
      merged,
    );

  const selected =
    selectNormalizedPredictions({
      predictions:
        normalized,

      maximumCandidateCount:
        params.maximumCandidateCount,

      minimumProbability:
        params.minimumProbability,

      compare:
        compareRecommendationRuntimeDecisionPredictions,
    });

  const ranked =
    selected.map(
      (
        prediction,
        index,
      ): RecommendationPredictedRuntimeDecision => ({
        ...cloneRecommendationPredictedRuntimeDecision(
          prediction,
        ),

        rank:
          index +
          1,
      }),
    );

  validateRecommendationPredictedRuntimeDecisions(
    ranked,
  );

  return ranked.map(
    cloneRecommendationPredictedRuntimeDecision,
  );
}

/* ------------------------------------------------------------------ */
/* Risk Normalization                                                 */
/* ------------------------------------------------------------------ */

/**
 * Risk와 Opportunity는 각 예측 함수 안에서 이미 정규화되지만,
 * Predictive Analysis 단계에서 다시 사용하기 위한 공통
 * 정규화 함수도 제공합니다.
 */
export function normalizeRecommendationRiskPredictions(
  predictions:
    readonly RecommendationPredictedRisk[],
): RecommendationPredictedRisk[] {
  validateRecommendationPredictedRisks(
    predictions,
  );

  if (
    predictions.length ===
    0
  ) {
    return [];
  }

  const normalized =
    normalizeCandidateProbabilities(
      predictions.map(
        cloneRecommendationPredictedRisk,
      ),
    )
      .sort(
        compareRecommendationRiskPredictions,
      )
      .map(
        (
          prediction,
          index,
        ): RecommendationPredictedRisk => ({
          ...cloneRecommendationPredictedRisk(
            prediction,
          ),

          rank:
            index +
            1,
        }),
      );

  validateRecommendationPredictedRisks(
    normalized,
  );

  return normalized.map(
    cloneRecommendationPredictedRisk,
  );
}

/* ------------------------------------------------------------------ */
/* Opportunity Normalization                                          */
/* ------------------------------------------------------------------ */

export function normalizeRecommendationOpportunityPredictions(
  predictions:
    readonly RecommendationPredictedOpportunity[],
): RecommendationPredictedOpportunity[] {
  validateRecommendationPredictedOpportunities(
    predictions,
  );

  if (
    predictions.length ===
    0
  ) {
    return [];
  }

  const normalized =
    normalizeCandidateProbabilities(
      predictions.map(
        cloneRecommendationPredictedOpportunity,
      ),
    )
      .sort(
        compareRecommendationOpportunityPredictions,
      )
      .map(
        (
          prediction,
          index,
        ): RecommendationPredictedOpportunity => ({
          ...cloneRecommendationPredictedOpportunity(
            prediction,
          ),

          rank:
            index +
            1,
        }),
      );

  validateRecommendationPredictedOpportunities(
    normalized,
  );

  return normalized.map(
    cloneRecommendationPredictedOpportunity,
  );
}

/* ------------------------------------------------------------------ */
/* State Merge                                                        */
/* ------------------------------------------------------------------ */

function mergeRecommendationStatePredictions(
  predictions:
    readonly RecommendationPredictedState[],
): RecommendationPredictedState[] {
  const merged =
    new Map<
      RecommendationPredictiveEntryState,
      RecommendationPredictedState
    >();

  predictions.forEach(
    (
      prediction,
    ) => {
      const existing =
        merged.get(
          prediction.state,
        );

      if (
        existing ===
        undefined
      ) {
        merged.set(
          prediction.state,
          cloneRecommendationPredictedState(
            prediction,
          ),
        );

        return;
      }

      merged.set(
        prediction.state,
        {
          ...cloneRecommendationPredictedState(
            existing,
          ),

          scores: {
            rawScore:
              roundScore(
                existing.scores.rawScore +
                prediction.scores.rawScore,
              ),

            probability:
              roundScore(
                existing.scores.probability +
                prediction.scores.probability,
              ),

            confidence:
              roundScore(
                weightedAverageConfidence([
                  existing,
                  prediction,
                ]),
              ),
          },

          reasoning:
            uniqueStrings([
              ...existing.reasoning,
              ...prediction.reasoning,
            ]),

          evidence:
            mergePredictionEvidence(
              existing.evidence,
              prediction.evidence,
            ),

          predictedAt:
            getLatestTimestamp(
              existing.predictedAt,
              prediction.predictedAt,
            ),
        },
      );
    },
  );

  return Array.from(
    merged.values(),
  );
}

/* ------------------------------------------------------------------ */
/* Strategy Merge                                                     */
/* ------------------------------------------------------------------ */

function mergeRecommendationStrategyPredictions(
  predictions:
    readonly RecommendationPredictedStrategy[],
): RecommendationPredictedStrategy[] {
  const merged =
    new Map<
      RecommendationPredictiveStrategyType,
      RecommendationPredictedStrategy
    >();

  predictions.forEach(
    (
      prediction,
    ) => {
      const existing =
        merged.get(
          prediction.strategyType,
        );

      if (
        existing ===
        undefined
      ) {
        merged.set(
          prediction.strategyType,
          cloneRecommendationPredictedStrategy(
            prediction,
          ),
        );

        return;
      }

      merged.set(
        prediction.strategyType,
        {
          ...cloneRecommendationPredictedStrategy(
            existing,
          ),

          scores: {
            rawScore:
              roundScore(
                existing.scores.rawScore +
                prediction.scores.rawScore,
              ),

            probability:
              roundScore(
                existing.scores.probability +
                prediction.scores.probability,
              ),

            confidence:
              roundScore(
                weightedAverageConfidence([
                  existing,
                  prediction,
                ]),
              ),
          },

          compatibleStateTypes:
            uniqueStrings([
              ...existing.compatibleStateTypes,
              ...prediction.compatibleStateTypes,
            ]),

          reasoning:
            uniqueStrings([
              ...existing.reasoning,
              ...prediction.reasoning,
            ]),

          evidence:
            mergePredictionEvidence(
              existing.evidence,
              prediction.evidence,
            ),

          predictedAt:
            getLatestTimestamp(
              existing.predictedAt,
              prediction.predictedAt,
            ),
        },
      );
    },
  );

  return Array.from(
    merged.values(),
  );
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Merge                                             */
/* ------------------------------------------------------------------ */

function mergeRecommendationRuntimeDecisionPredictions(
  predictions:
    readonly RecommendationPredictedRuntimeDecision[],
): RecommendationPredictedRuntimeDecision[] {
  const merged =
    new Map<
      RecommendationPredictiveRuntimeDecisionType,
      RecommendationPredictedRuntimeDecision
    >();

  predictions.forEach(
    (
      prediction,
    ) => {
      const existing =
        merged.get(
          prediction.decisionType,
        );

      if (
        existing ===
        undefined
      ) {
        merged.set(
          prediction.decisionType,
          cloneRecommendationPredictedRuntimeDecision(
            prediction,
          ),
        );

        return;
      }

      merged.set(
        prediction.decisionType,
        {
          ...cloneRecommendationPredictedRuntimeDecision(
            existing,
          ),

          scores: {
            rawScore:
              roundScore(
                existing.scores.rawScore +
                prediction.scores.rawScore,
              ),

            probability:
              roundScore(
                existing.scores.probability +
                prediction.scores.probability,
              ),

            confidence:
              roundScore(
                weightedAverageConfidence([
                  existing,
                  prediction,
                ]),
              ),
          },

          relatedStateTypes:
            uniqueStrings([
              ...existing.relatedStateTypes,
              ...prediction.relatedStateTypes,
            ]),

          relatedStrategyTypes:
            uniqueStrings([
              ...existing.relatedStrategyTypes,
              ...prediction.relatedStrategyTypes,
            ]),

          reasoning:
            uniqueStrings([
              ...existing.reasoning,
              ...prediction.reasoning,
            ]),

          evidence:
            mergePredictionEvidence(
              existing.evidence,
              prediction.evidence,
            ),

          predictedAt:
            getLatestTimestamp(
              existing.predictedAt,
              prediction.predictedAt,
            ),
        },
      );
    },
  );

  return Array.from(
    merged.values(),
  );
}

/* ------------------------------------------------------------------ */
/* Generic Probability Normalization                                  */
/* ------------------------------------------------------------------ */

type PredictionWithCandidateScores = {
  scores: {
    rawScore:
      number;

    probability:
      number;

    confidence:
      number;
  };
};

function normalizeCandidateProbabilities<
  TPrediction extends PredictionWithCandidateScores,
>(
  predictions:
    readonly TPrediction[],
): TPrediction[] {
  if (
    predictions.length ===
    0
  ) {
    return [];
  }

  const sanitized =
    predictions.map(
      (
        prediction,
      ): TPrediction => ({
        ...prediction,

        scores: {
          rawScore:
            roundScore(
              Math.max(
                0,
                finiteOrZero(
                  prediction.scores.rawScore,
                ),
              ),
            ),

          probability:
            roundScore(
              clampUnitInterval(
                finiteOrZero(
                  prediction.scores.probability,
                ),
              ),
            ),

          confidence:
            roundScore(
              clampUnitInterval(
                finiteOrZero(
                  prediction.scores.confidence,
                ),
              ),
            ),
        },
      }),
    );

  const rawScoreTotal =
    sanitized.reduce(
      (
        total,
        prediction,
      ) =>
        total +
        prediction.scores.rawScore,
      0,
    );

  const existingProbabilityTotal =
    sanitized.reduce(
      (
        total,
        prediction,
      ) =>
        total +
        prediction.scores.probability,
      0,
    );

  if (
    rawScoreTotal >
    0
  ) {
    return sanitized.map(
      (
        prediction,
      ): TPrediction => ({
        ...prediction,

        scores: {
          ...prediction.scores,

          probability:
            roundScore(
              prediction.scores.rawScore /
              rawScoreTotal,
            ),
        },
      }),
    );
  }

  if (
    existingProbabilityTotal >
    0
  ) {
    return sanitized.map(
      (
        prediction,
      ): TPrediction => ({
        ...prediction,

        scores: {
          ...prediction.scores,

          probability:
            roundScore(
              prediction.scores.probability /
              existingProbabilityTotal,
            ),
        },
      }),
    );
  }

  const uniformProbability =
    1 /
    sanitized.length;

  return sanitized.map(
    (
      prediction,
    ): TPrediction => ({
      ...prediction,

      scores: {
        ...prediction.scores,

        probability:
          roundScore(
            uniformProbability,
          ),
      },
    }),
  );
}

/* ------------------------------------------------------------------ */
/* Generic Selection                                                  */
/* ------------------------------------------------------------------ */

function selectNormalizedPredictions<
  TPrediction extends PredictionWithCandidateScores,
>(
  params: {
    predictions:
      readonly TPrediction[];

    maximumCandidateCount:
      number;

    minimumProbability:
      number;

    compare:
      (
        left:
          TPrediction,
        right:
          TPrediction,
      ) => number;
  },
): TPrediction[] {
  const sorted =
    [...params.predictions].sort(
      params.compare,
    );

  let selected =
    sorted
      .filter(
        (
          prediction,
        ) =>
          prediction.scores.probability >=
          params.minimumProbability,
      )
      .slice(
        0,
        params.maximumCandidateCount,
      );

  if (
    selected.length ===
      0
  ) {
    const firstPrediction =
      sorted[
        0
      ];

    if (
      firstPrediction !==
      undefined
    ) {
      selected = [
        firstPrediction,
      ];
    }
  }

  return renormalizeSelectedPredictions(
    selected,
  );
}

function renormalizeSelectedPredictions<
  TPrediction extends PredictionWithCandidateScores,
>(
  predictions:
    readonly TPrediction[],
): TPrediction[] {
  if (
    predictions.length ===
    0
  ) {
    return [];
  }

  const total =
    predictions.reduce(
      (
        accumulated,
        prediction,
      ) =>
        accumulated +
        prediction.scores.probability,
      0,
    );

  if (
    total <=
    0
  ) {
    const uniformProbability =
      1 /
      predictions.length;

    return predictions.map(
      (
        prediction,
      ): TPrediction => ({
        ...prediction,

        scores: {
          ...prediction.scores,

          probability:
            roundScore(
              uniformProbability,
            ),
        },
      }),
    );
  }

  const normalized =
    predictions.map(
      (
        prediction,
      ): TPrediction => ({
        ...prediction,

        scores: {
          ...prediction.scores,

          probability:
            roundScore(
              prediction.scores.probability /
              total,
            ),
        },
      }),
    );

  return correctProbabilityRounding(
    normalized,
  );
}

/* ------------------------------------------------------------------ */
/* Probability Rounding Correction                                    */
/* ------------------------------------------------------------------ */

/**
 * 각 probability를 소수점 네 자리로 반올림하면 합계가
 * 0.9999 또는 1.0001이 될 수 있습니다.
 *
 * 가장 높은 후보에 반올림 오차를 반영하여 합계를 정확히 1에
 * 가깝게 유지합니다.
 */
function correctProbabilityRounding<
  TPrediction extends PredictionWithCandidateScores,
>(
  predictions:
    readonly TPrediction[],
): TPrediction[] {
  if (
    predictions.length ===
    0
  ) {
    return [];
  }

  const total =
    predictions.reduce(
      (
        accumulated,
        prediction,
      ) =>
        accumulated +
        prediction.scores.probability,
      0,
    );

  const difference =
    roundScore(
      1 -
      total,
    );

  if (
    Math.abs(
      difference,
    ) <=
    Number.EPSILON
  ) {
    return predictions.map(
      (
        prediction,
      ) => ({
        ...prediction,

        scores: {
          ...prediction.scores,
        },
      }),
    );
  }

  return predictions.map(
    (
      prediction,
      index,
    ): TPrediction => {
      if (
        index !==
        0
      ) {
        return {
          ...prediction,

          scores: {
            ...prediction.scores,
          },
        };
      }

      return {
        ...prediction,

        scores: {
          ...prediction.scores,

          probability:
            roundScore(
              clampUnitInterval(
                prediction.scores.probability +
                difference,
              ),
            ),
        },
      };
    },
  );
}

/* ------------------------------------------------------------------ */
/* Conflict Detection Public API                                      */
/* ------------------------------------------------------------------ */

/**
 * 예측 후보 사이의 구조적 충돌을 탐지합니다.
 *
 * 탐지 대상:
 *
 * - 상위 State 후보가 비슷한 확률을 가지는 경우
 * - 상위 Strategy 후보가 비슷한 확률을 가지는 경우
 * - 상위 Runtime Decision 후보가 비슷한 확률을 가지는 경우
 * - Risk와 Opportunity가 의미상 동시에 강한 경우
 * - REI05 Adaptive Learning 자체의 Conflict Risk가 높은 경우
 */
export function detectRecommendationPredictionConflicts(
  params:
    DetectRecommendationPredictionConflictsParams,
): RecommendationPredictionConflict[] {
  validateDetectRecommendationPredictionConflictsParams(
    params,
  );

  const conflicts:
    RecommendationPredictionConflict[] = [];

  const stateConflict =
    createDistributionConflict({
      type:
        "state-distribution-conflict",

      predictions:
        params.predictedStates,

      getId:
        (
          prediction,
        ) =>
          prediction.id,

      getLabel:
        (
          prediction,
        ) =>
          prediction.state,

      createConflictId:
        params.createConflictId,

      conflictIndex:
        conflicts.length,
    });

  if (
    stateConflict !==
    null
  ) {
    conflicts.push(
      stateConflict,
    );
  }

  const strategyConflict =
    createDistributionConflict({
      type:
        "strategy-distribution-conflict",

      predictions:
        params.predictedStrategies,

      getId:
        (
          prediction,
        ) =>
          prediction.id,

      getLabel:
        (
          prediction,
        ) =>
          prediction.strategyType,

      createConflictId:
        params.createConflictId,

      conflictIndex:
        conflicts.length,
    });

  if (
    strategyConflict !==
    null
  ) {
    conflicts.push(
      strategyConflict,
    );
  }

  const decisionConflict =
    createDistributionConflict({
      type:
        "decision-distribution-conflict",

      predictions:
        params.predictedRuntimeDecisions,

      getId:
        (
          prediction,
        ) =>
          prediction.id,

      getLabel:
        (
          prediction,
        ) =>
          prediction.decisionType,

      createConflictId:
        params.createConflictId,

      conflictIndex:
        conflicts.length,
    });

  if (
    decisionConflict !==
    null
  ) {
    conflicts.push(
      decisionConflict,
    );
  }

  const riskOpportunityConflict =
    createRiskOpportunityConflict({
      predictedRisks:
        params.predictedRisks,

      predictedOpportunities:
        params.predictedOpportunities,

      createConflictId:
        params.createConflictId,

      conflictIndex:
        conflicts.length,
    });

  if (
    riskOpportunityConflict !==
    null
  ) {
    conflicts.push(
      riskOpportunityConflict,
    );
  }

  const adaptiveEvidenceConflict =
    createAdaptiveEvidenceConflict({
      adaptiveLearningAnalysis:
        params.adaptiveLearningAnalysis,

      createConflictId:
        params.createConflictId,

      conflictIndex:
        conflicts.length,
    });

  if (
    adaptiveEvidenceConflict !==
    null
  ) {
    conflicts.push(
      adaptiveEvidenceConflict,
    );
  }

  const sorted =
    conflicts
      .sort(
        compareRecommendationPredictionConflicts,
      )
      .map(
        (
          conflict,
          index,
        ) => ({
          ...cloneRecommendationPredictionConflict(
            conflict,
          ),

          id:
            conflict.id,

          relatedPredictionIds: [
            ...conflict.relatedPredictionIds,
          ],

          reasoning: [
            ...conflict.reasoning,
          ],
        }),
      );

  validateRecommendationPredictionConflicts(
    sorted,
  );

  return sorted.map(
    cloneRecommendationPredictionConflict,
  );
}

/* ------------------------------------------------------------------ */
/* Distribution Conflict                                              */
/* ------------------------------------------------------------------ */

type DistributionPrediction = {
  id:
    string;

  scores: {
    probability:
      number;

    confidence:
      number;
  };
};

function createDistributionConflict<
  TPrediction extends DistributionPrediction,
>(
  params: {
    type:
      | "state-distribution-conflict"
      | "strategy-distribution-conflict"
      | "decision-distribution-conflict";

    predictions:
      readonly TPrediction[];

    getId:
      (
        prediction:
          TPrediction,
      ) => string;

    getLabel:
      (
        prediction:
          TPrediction,
      ) => string;

    createConflictId:
      DetectRecommendationPredictionConflictsParams[
        "createConflictId"
      ];

    conflictIndex:
      number;
  },
): RecommendationPredictionConflict | null {
  if (
    params.predictions.length <
    2
  ) {
    return null;
  }

  const sorted =
    [...params.predictions].sort(
      (
        left,
        right,
      ) =>
        right.scores.probability -
        left.scores.probability,
    );

  const first =
    sorted[
      0
    ];

  const second =
    sorted[
      1
    ];

  if (
    first ===
      undefined ||
    second ===
      undefined
  ) {
    return null;
  }

  const probabilityDifference =
    Math.abs(
      first.scores.probability -
      second.scores.probability,
    );

  const combinedProbability =
    clampUnitInterval(
      first.scores.probability +
      second.scores.probability,
    );

  if (
    probabilityDifference >
      DEFAULT_CONFLICT_DIFFERENCE_THRESHOLD ||
    combinedProbability <
      0.5
  ) {
    return null;
  }

  const conflictScore =
    clampUnitInterval(
      (
        1 -
        probabilityDifference /
        DEFAULT_CONFLICT_DIFFERENCE_THRESHOLD
      ) *
      combinedProbability,
    );

  if (
    conflictScore <
    DEFAULT_MINIMUM_CONFLICT_SCORE
  ) {
    return null;
  }

  const confidence =
    clampUnitInterval(
      (
        first.scores.confidence +
        second.scores.confidence
      ) /
      2,
    );

  return {
    id:
      params.createConflictId(
        params.type,
        params.conflictIndex,
      ),

    type:
      params.type,

    severity:
      resolveConflictSeverity(
        conflictScore,
        confidence,
      ),

    score:
      roundScore(
        conflictScore,
      ),

    confidence:
      roundScore(
        confidence,
      ),

    description:
      `${params.getLabel(
        first,
      )} and ${params.getLabel(
        second,
      )} remain similarly likely prediction candidates.`,

    relatedPredictionIds: [
      params.getId(
        first,
      ),
      params.getId(
        second,
      ),
    ],

    reasoning: [
      `The two highest candidates differ by only ${roundScore(
        probabilityDifference *
        100,
      )} percentage points.`,

      `Their combined probability is ${roundScore(
        combinedProbability *
        100,
      )}%.`,
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Risk–Opportunity Conflict                                          */
/* ------------------------------------------------------------------ */

function createRiskOpportunityConflict(
  params: {
    predictedRisks:
      readonly RecommendationPredictedRisk[];

    predictedOpportunities:
      readonly RecommendationPredictedOpportunity[];

    createConflictId:
      DetectRecommendationPredictionConflictsParams[
        "createConflictId"
      ];

    conflictIndex:
      number;
  },
): RecommendationPredictionConflict | null {
  const primaryRisk =
    getPrimaryPrediction(
      params.predictedRisks,
    );

  const primaryOpportunity =
    getPrimaryPrediction(
      params.predictedOpportunities,
    );

  if (
    primaryRisk ===
      null ||
    primaryOpportunity ===
      null
  ) {
    return null;
  }

  const relationship =
    isRiskOpportunityOpposition(
      primaryRisk.type,
      primaryOpportunity.type,
    );

  if (
    !relationship
  ) {
    return null;
  }

  const combinedStrength =
    clampUnitInterval(
      (
        primaryRisk.scores.probability *
        primaryRisk.scores.confidence +
        primaryOpportunity.scores.probability *
        primaryOpportunity.scores.confidence
      ) /
      2,
    );

  if (
    combinedStrength <
    DEFAULT_MINIMUM_CONFLICT_SCORE
  ) {
    return null;
  }

  const confidence =
    clampUnitInterval(
      (
        primaryRisk.scores.confidence +
        primaryOpportunity.scores.confidence
      ) /
      2,
    );

  return {
    id:
      params.createConflictId(
        "risk-opportunity-conflict",
        params.conflictIndex,
      ),

    type:
      "risk-opportunity-conflict",

    severity:
      resolveConflictSeverity(
        combinedStrength,
        confidence,
      ),

    score:
      roundScore(
        combinedStrength,
      ),

    confidence:
      roundScore(
        confidence,
      ),

    description:
      `${primaryRisk.type} and ${primaryOpportunity.type} are simultaneously supported by the current evidence.`,

    relatedPredictionIds: [
      primaryRisk.id,
      primaryOpportunity.id,
    ],

    reasoning: [
      "The current flow contains both a meaningful downside risk and a plausible positive transition.",

      "The prediction should remain conditional rather than being presented as a single certain direction.",
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Adaptive Evidence Conflict                                         */
/* ------------------------------------------------------------------ */

function createAdaptiveEvidenceConflict(
  params: {
    adaptiveLearningAnalysis:
      DetectRecommendationPredictionConflictsParams[
        "adaptiveLearningAnalysis"
      ];

    createConflictId:
      DetectRecommendationPredictionConflictsParams[
        "createConflictId"
      ];

    conflictIndex:
      number;
  },
): RecommendationPredictionConflict | null {
  const conflictRisk =
    clampUnitInterval(
      params.adaptiveLearningAnalysis.scores
        .conflictRisk,
    );

  const conflictedRuleIds =
    params.adaptiveLearningAnalysis.adaptationRules
      .filter(
        (
          rule,
        ) =>
          rule.status ===
          "conflicted",
      )
      .map(
        (
          rule,
        ) =>
          rule.id,
      );

  if (
    conflictRisk <
      DEFAULT_MINIMUM_CONFLICT_SCORE &&
    conflictedRuleIds.length ===
      0
  ) {
    return null;
  }

  const ruleEvidence =
    clampUnitInterval(
      conflictedRuleIds.length /
      4,
    );

  const score =
    clampUnitInterval(
      conflictRisk *
      0.75 +
      ruleEvidence *
      0.25,
    );

  return {
    id:
      params.createConflictId(
        "adaptive-evidence-conflict",
        params.conflictIndex,
      ),

    type:
      "adaptive-evidence-conflict",

    severity:
      resolveConflictSeverity(
        score,
        conflictRisk,
      ),

    score:
      roundScore(
        score,
      ),

    confidence:
      roundScore(
        clampUnitInterval(
          params.adaptiveLearningAnalysis.scores
            .learningConfidence,
        ),
      ),

    description:
      "Adaptive Learning contains competing or internally inconsistent evidence.",

    relatedPredictionIds:
      [],

    reasoning:
      uniqueStrings([
        conflictRisk >
          0
          ? `Adaptive Learning conflict risk is ${roundScore(
              conflictRisk *
              100,
            )}%.`
          : "",

        conflictedRuleIds.length >
          0
          ? `${conflictedRuleIds.length} conflicted adaptation rule(s) were detected.`
          : "",
      ]).filter(
        (
          value,
        ) =>
          value.length >
          0,
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Risk–Opportunity Opposition Map                                    */
/* ------------------------------------------------------------------ */

function isRiskOpportunityOpposition(
  riskType:
    RecommendationPredictedRisk[
      "type"
    ],
  opportunityType:
    RecommendationPredictedOpportunity[
      "type"
    ],
): boolean {
  switch (
    riskType
  ) {
    case "premature-advance-risk":
      return (
        opportunityType ===
          "successful-advance-likelihood" ||
        opportunityType ===
          "completion-likelihood"
      );

    case "persistent-observation-risk":
      return (
        opportunityType ===
          "progress-likelihood" ||
        opportunityType ===
          "productive-clarification-likelihood"
      );

    case "stagnation-risk":
      return (
        opportunityType ===
          "progress-likelihood" ||
        opportunityType ===
          "recovery-likelihood"
      );

    case "fragmentation-risk":
      return (
        opportunityType ===
          "stabilization-likelihood" ||
        opportunityType ===
          "recovery-likelihood"
      );

    case "strategy-oscillation-risk":
    case "state-oscillation-risk":
      return (
        opportunityType ===
          "stabilization-likelihood" ||
        opportunityType ===
          "productive-clarification-likelihood"
      );

    case "redirection-risk":
      return (
        opportunityType ===
          "stabilization-likelihood" ||
        opportunityType ===
          "productive-clarification-likelihood"
      );

    case "confidence-degradation-risk":
      return (
        opportunityType ===
          "signal-confirmation-likelihood" ||
        opportunityType ===
          "recovery-likelihood"
      );

    case "completion-failure-risk":
      return (
        opportunityType ===
          "completion-likelihood" ||
        opportunityType ===
          "successful-advance-likelihood"
      );

    case "adaptation-conflict-risk":
      return (
        opportunityType ===
          "signal-confirmation-likelihood" ||
        opportunityType ===
          "productive-clarification-likelihood"
      );
  }
}

/* ------------------------------------------------------------------ */
/* Conflict Severity                                                  */
/* ------------------------------------------------------------------ */

function resolveConflictSeverity(
  score:
    number,
  confidence:
    number,
): RecommendationPredictionSeverity {
  const weightedScore =
    clampUnitInterval(
      score *
      (
        0.65 +
        confidence *
        0.35
      ),
    );

  if (
    weightedScore >=
    0.75
  ) {
    return "high";
  }

  if (
    weightedScore >=
    0.5
  ) {
    return "moderate";
  }

  if (
    weightedScore >=
    0.25
  ) {
    return "low";
  }

  return "informational";
}

/* ------------------------------------------------------------------ */
/* Conflict Query Helpers                                             */
/* ------------------------------------------------------------------ */

export function hasRecommendationPredictionConflict(
  conflicts:
    readonly RecommendationPredictionConflict[],
  type:
    RecommendationPredictionConflictType,
): boolean {
  return conflicts.some(
    (
      conflict,
    ) =>
      conflict.type ===
      type,
  );
}

export function getPrimaryRecommendationPredictionConflict(
  conflicts:
    readonly RecommendationPredictionConflict[],
): RecommendationPredictionConflict | null {
  if (
    conflicts.length ===
    0
  ) {
    return null;
  }

  const sorted =
    [...conflicts].sort(
      compareRecommendationPredictionConflicts,
    );

  return sorted[
    0
  ] ??
    null;
}

export function summarizeRecommendationPredictionConflicts(
  conflicts:
    readonly RecommendationPredictionConflict[],
): string {
  if (
    conflicts.length ===
    0
  ) {
    return "No meaningful Recommendation prediction conflict was detected.";
  }

  return conflicts
    .map(
      (
        conflict,
      ) =>
        `${conflict.type}: ${roundScore(
          conflict.score *
          100,
        )}% (${conflict.severity})`,
    )
    .join(
      ", ",
    );
}

/* ------------------------------------------------------------------ */
/* Conflict Validation                                                */
/* ------------------------------------------------------------------ */

export function validateRecommendationPredictionConflict(
  conflict:
    RecommendationPredictionConflict,
): void {
  if (
    typeof conflict !==
      "object" ||
    conflict ===
      null ||
    Array.isArray(
      conflict,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Conflict must be an object.",
    );
  }

  validateRequiredIdentifier(
    conflict.id,
    "conflict.id",
  );

  if (
    !isRecommendationPredictionConflictType(
      conflict.type,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Conflict type is invalid.",
    );
  }

  if (
    !isRecommendationPredictionSeverity(
      conflict.severity,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Conflict severity is invalid.",
    );
  }

  validateUnitInterval(
    conflict.score,
    "conflict.score",
  );

  validateUnitInterval(
    conflict.confidence,
    "conflict.confidence",
  );

  validateRequiredString(
    conflict.description,
    "conflict.description",
  );

  validateUniqueStringArray(
    conflict.relatedPredictionIds,
    "conflict.relatedPredictionIds",
  );

  validateStringArray(
    conflict.reasoning,
    "conflict.reasoning",
  );
}

export function validateRecommendationPredictionConflicts(
  conflicts:
    readonly RecommendationPredictionConflict[],
): void {
  if (
    !Array.isArray(
      conflicts,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Conflicts must be an array.",
    );
  }

  const observedIds =
    new Set<string>();

  conflicts.forEach(
    (
      conflict,
    ) => {
      validateRecommendationPredictionConflict(
        conflict,
      );

      if (
        observedIds.has(
          conflict.id,
        )
      ) {
        throw new Error(
          `Recommendation Prediction Conflict id must be unique: ${conflict.id}.`,
        );
      }

      observedIds.add(
        conflict.id,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Normalization Param Validation                                     */
/* ------------------------------------------------------------------ */

function validateNormalizeStatePredictionParams(
  params:
    NormalizeRecommendationStatePredictionsParams,
): void {
  validateNormalizationParams({
    params,

    maximumAllowed:
      MAXIMUM_STATE_CANDIDATE_COUNT,

    fieldPrefix:
      "State Prediction",
  });
}

function validateNormalizeStrategyPredictionParams(
  params:
    NormalizeRecommendationStrategyPredictionsParams,
): void {
  validateNormalizationParams({
    params,

    maximumAllowed:
      MAXIMUM_STRATEGY_CANDIDATE_COUNT,

    fieldPrefix:
      "Strategy Prediction",
  });
}

function validateNormalizeRuntimeDecisionPredictionParams(
  params:
    NormalizeRecommendationRuntimeDecisionPredictionsParams,
): void {
  validateNormalizationParams({
    params,

    maximumAllowed:
      MAXIMUM_RUNTIME_DECISION_CANDIDATE_COUNT,

    fieldPrefix:
      "Runtime Decision Prediction",
  });
}

function validateNormalizationParams(
  params: {
    params: {
      predictions:
        readonly unknown[];

      maximumCandidateCount:
        number;

      minimumProbability:
        number;
    };

    maximumAllowed:
      number;

    fieldPrefix:
      string;
  },
): void {
  if (
    typeof params.params !==
      "object" ||
    params.params ===
      null ||
    Array.isArray(
      params.params,
    )
  ) {
    throw new Error(
      `${params.fieldPrefix} normalization params must be an object.`,
    );
  }

  if (
    !Array.isArray(
      params.params.predictions,
    )
  ) {
    throw new Error(
      `${params.fieldPrefix} predictions must be an array.`,
    );
  }

  validatePositiveBoundedInteger(
    params.params.maximumCandidateCount,
    `${params.fieldPrefix} maximumCandidateCount`,
    params.maximumAllowed,
  );

  validateUnitInterval(
    params.params.minimumProbability,
    `${params.fieldPrefix} minimumProbability`,
  );
}

/* ------------------------------------------------------------------ */
/* Conflict Params Validation                                         */
/* ------------------------------------------------------------------ */

function validateDetectRecommendationPredictionConflictsParams(
  params:
    DetectRecommendationPredictionConflictsParams,
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
      "Detect Recommendation Prediction Conflicts params must be an object.",
    );
  }

  validateRecommendationPredictedStates(
    params.predictedStates,
  );

  validateRecommendationPredictedStrategies(
    params.predictedStrategies,
  );

  validateRecommendationPredictedRuntimeDecisions(
    params.predictedRuntimeDecisions,
  );

  validateRecommendationPredictedRisks(
    params.predictedRisks,
  );

  validateRecommendationPredictedOpportunities(
    params.predictedOpportunities,
  );

  if (
    typeof params.adaptiveLearningAnalysis !==
      "object" ||
    params.adaptiveLearningAnalysis ===
      null ||
    Array.isArray(
      params.adaptiveLearningAnalysis,
    )
  ) {
    throw new Error(
      "Adaptive Learning Analysis must be an object.",
    );
  }

  validateUnitInterval(
    params.adaptiveLearningAnalysis.scores
      .conflictRisk,
    "adaptiveLearningAnalysis.scores.conflictRisk",
  );

  validateUnitInterval(
    params.adaptiveLearningAnalysis.scores
      .learningConfidence,
    "adaptiveLearningAnalysis.scores.learningConfidence",
  );

  if (
    typeof params.createConflictId !==
    "function"
  ) {
    throw new Error(
      "createConflictId must be a function.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Comparators                                                        */
/* ------------------------------------------------------------------ */

function compareRecommendationStatePredictions(
  left:
    RecommendationPredictedState,
  right:
    RecommendationPredictedState,
): number {
  const scoreComparison =
    comparePredictionScores(
      left,
      right,
    );

  if (
    scoreComparison !==
    0
  ) {
    return scoreComparison;
  }

  return STATE_ORDER.indexOf(
    left.state,
  ) -
    STATE_ORDER.indexOf(
      right.state,
    );
}

function compareRecommendationStrategyPredictions(
  left:
    RecommendationPredictedStrategy,
  right:
    RecommendationPredictedStrategy,
): number {
  const scoreComparison =
    comparePredictionScores(
      left,
      right,
    );

  if (
    scoreComparison !==
    0
  ) {
    return scoreComparison;
  }

  return STRATEGY_ORDER.indexOf(
    left.strategyType,
  ) -
    STRATEGY_ORDER.indexOf(
      right.strategyType,
    );
}

function compareRecommendationRuntimeDecisionPredictions(
  left:
    RecommendationPredictedRuntimeDecision,
  right:
    RecommendationPredictedRuntimeDecision,
): number {
  const scoreComparison =
    comparePredictionScores(
      left,
      right,
    );

  if (
    scoreComparison !==
    0
  ) {
    return scoreComparison;
  }

  return RUNTIME_DECISION_ORDER.indexOf(
    left.decisionType,
  ) -
    RUNTIME_DECISION_ORDER.indexOf(
      right.decisionType,
    );
}

function compareRecommendationRiskPredictions(
  left:
    RecommendationPredictedRisk,
  right:
    RecommendationPredictedRisk,
): number {
  return comparePredictionScores(
    left,
    right,
  );
}

function compareRecommendationOpportunityPredictions(
  left:
    RecommendationPredictedOpportunity,
  right:
    RecommendationPredictedOpportunity,
): number {
  return comparePredictionScores(
    left,
    right,
  );
}

function comparePredictionScores(
  left:
    PredictionWithCandidateScores,
  right:
    PredictionWithCandidateScores,
): number {
  if (
    left.scores.probability !==
    right.scores.probability
  ) {
    return right.scores.probability -
      left.scores.probability;
  }

  if (
    left.scores.confidence !==
    right.scores.confidence
  ) {
    return right.scores.confidence -
      left.scores.confidence;
  }

  return right.scores.rawScore -
    left.scores.rawScore;
}

function compareRecommendationPredictionConflicts(
  left:
    RecommendationPredictionConflict,
  right:
    RecommendationPredictionConflict,
): number {
  if (
    left.score !==
    right.score
  ) {
    return right.score -
      left.score;
  }

  if (
    left.confidence !==
    right.confidence
  ) {
    return right.confidence -
      left.confidence;
  }

  return left.type.localeCompare(
    right.type,
  );
}

/* ------------------------------------------------------------------ */
/* Generic Prediction Helpers                                         */
/* ------------------------------------------------------------------ */

function weightedAverageConfidence(
  predictions:
    readonly PredictionWithCandidateScores[],
): number {
  if (
    predictions.length ===
    0
  ) {
    return 0;
  }

  const totalWeight =
    predictions.reduce(
      (
        accumulated,
        prediction,
      ) =>
        accumulated +
        Math.max(
          prediction.scores.rawScore,
          prediction.scores.probability,
          0,
        ),
      0,
    );

  if (
    totalWeight <=
    0
  ) {
    return predictions.reduce(
      (
        accumulated,
        prediction,
      ) =>
        accumulated +
        prediction.scores.confidence,
      0,
    ) /
      predictions.length;
  }

  return predictions.reduce(
    (
      accumulated,
      prediction,
    ) => {
      const weight =
        Math.max(
          prediction.scores.rawScore,
          prediction.scores.probability,
          0,
        );

      return accumulated +
        prediction.scores.confidence *
        weight;
    },
    0,
  ) /
    totalWeight;
}

function getPrimaryPrediction<
  TPrediction extends {
    rank:
      number;

    scores: {
      probability:
        number;

      confidence:
        number;
    };
  },
>(
  predictions:
    readonly TPrediction[],
): TPrediction | null {
  if (
    predictions.length ===
    0
  ) {
    return null;
  }

  const sorted =
    [...predictions].sort(
      (
        left,
        right,
      ) => {
        if (
          left.rank !==
          right.rank
        ) {
          return left.rank -
            right.rank;
        }

        if (
          left.scores.probability !==
          right.scores.probability
        ) {
          return right.scores.probability -
            left.scores.probability;
        }

        return right.scores.confidence -
          left.scores.confidence;
      },
    );

  return sorted[
    0
  ] ??
    null;
}

/* ------------------------------------------------------------------ */
/* Evidence Merge                                                     */
/* ------------------------------------------------------------------ */

function mergePredictionEvidence<
  TEvidence extends {
    relatedEntryIds:
      string[];

    relatedComparisonIds:
      string[];

    relatedObservationIds:
      string[];

    relatedPatternIds:
      string[];

    relatedRuleIds:
      string[];

    relatedMemorySignalTypes:
      string[];
  },
>(
  left:
    TEvidence,
  right:
    TEvidence,
): TEvidence {
  return {
    relatedEntryIds:
      uniqueStrings([
        ...left.relatedEntryIds,
        ...right.relatedEntryIds,
      ]),

    relatedComparisonIds:
      uniqueStrings([
        ...left.relatedComparisonIds,
        ...right.relatedComparisonIds,
      ]),

    relatedObservationIds:
      uniqueStrings([
        ...left.relatedObservationIds,
        ...right.relatedObservationIds,
      ]),

    relatedPatternIds:
      uniqueStrings([
        ...left.relatedPatternIds,
        ...right.relatedPatternIds,
      ]),

    relatedRuleIds:
      uniqueStrings([
        ...left.relatedRuleIds,
        ...right.relatedRuleIds,
      ]),

    relatedMemorySignalTypes:
      uniqueStrings([
        ...left.relatedMemorySignalTypes,
        ...right.relatedMemorySignalTypes,
      ]),
  } as TEvidence;
}

/* ------------------------------------------------------------------ */
/* Clone Conflict                                                     */
/* ------------------------------------------------------------------ */

export function cloneRecommendationPredictionConflict(
  conflict:
    RecommendationPredictionConflict,
): RecommendationPredictionConflict {
  return {
    ...conflict,

    relatedPredictionIds: [
      ...conflict.relatedPredictionIds,
    ],

    reasoning: [
      ...conflict.reasoning,
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Probability Validation Helper                                      */
/* ------------------------------------------------------------------ */

export function hasValidPredictionProbabilityTotal(
  predictions:
    readonly PredictionWithCandidateScores[],
): boolean {
  if (
    predictions.length ===
    0
  ) {
    return true;
  }

  const total =
    predictions.reduce(
      (
        accumulated,
        prediction,
      ) =>
        accumulated +
        prediction.scores.probability,
      0,
    );

  return Math.abs(
    total -
    1,
  ) <=
    PROBABILITY_SUM_TOLERANCE;
}

/* ------------------------------------------------------------------ */
/* Generic Helpers                                                    */
/* ------------------------------------------------------------------ */

function finiteOrZero(
  value:
    number,
): number {
  return Number.isFinite(
    value,
  )
    ? value
    : 0;
}

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
    SCORE_PRECISION,
  ) /
    SCORE_PRECISION;
}

function getLatestTimestamp(
  left:
    string,
  right:
    string,
): string {
  return Date.parse(
    left,
  ) >=
    Date.parse(
      right,
    )
    ? left
    : right;
}

function uniqueStrings<
  TValue extends string,
>(
  values:
    readonly TValue[],
): TValue[] {
  return Array.from(
    new Set(
      values,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Generic Validation                                                 */
/* ------------------------------------------------------------------ */

function validateRequiredString(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string {
  if (
    typeof value !==
      "string" ||
    value.trim().length ===
      0
  ) {
    throw new Error(
      `${fieldName} must be a non-empty string.`,
    );
  }
}

function validateRequiredIdentifier(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string {
  validateRequiredString(
    value,
    fieldName,
  );

  if (
    value.length >
    256
  ) {
    throw new Error(
      `${fieldName} must not exceed 256 characters.`,
    );
  }
}

function validateStringArray(
  values:
    readonly string[],
  fieldName:
    string,
): void {
  if (
    !Array.isArray(
      values,
    )
  ) {
    throw new Error(
      `${fieldName} must be an array.`,
    );
  }

  values.forEach(
    (
      value,
      index,
    ) => {
      validateRequiredString(
        value,
        `${fieldName}[${index}]`,
      );
    },
  );
}

function validateUniqueStringArray(
  values:
    readonly string[],
  fieldName:
    string,
): void {
  validateStringArray(
    values,
    fieldName,
  );

  const observed =
    new Set<string>();

  values.forEach(
    (
      value,
    ) => {
      if (
        observed.has(
          value,
        )
      ) {
        throw new Error(
          `${fieldName} must not contain duplicate value: ${value}.`,
        );
      }

      observed.add(
        value,
      );
    },
  );
}

function validateFiniteNumber(
  value:
    unknown,
  fieldName:
    string,
): asserts value is number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    throw new Error(
      `${fieldName} must be a finite number.`,
    );
  }
}

function validateUnitInterval(
  value:
    unknown,
  fieldName:
    string,
): asserts value is number {
  validateFiniteNumber(
    value,
    fieldName,
  );

  if (
    value <
      0 ||
    value >
      1
  ) {
    throw new Error(
      `${fieldName} must be between 0 and 1.`,
    );
  }
}

function validatePositiveBoundedInteger(
  value:
    unknown,
  fieldName:
    string,
  maximum:
    number,
): asserts value is number {
  if (
    typeof value !==
      "number" ||
    !Number.isInteger(
      value,
    ) ||
    value <
      1 ||
    value >
      maximum
  ) {
    throw new Error(
      `${fieldName} must be an integer between 1 and ${maximum}.`,
    );
  }
}