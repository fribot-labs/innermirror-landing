import {
    createEmptyRecommendationPredictionEvidence,
} from "./recommendationPredictiveIntelligenceTypes";

import {
    validateRecommendationPredictedStates,
} from "./predictNextRecommendationStates";

import type {
    PredictNextRecommendationStrategiesParams,
    RecommendationPredictedState,
    RecommendationPredictedStrategy,
    RecommendationPredictionCandidateScores,
    RecommendationPredictionContext,
    RecommendationPredictionEvidence,
    RecommendationPredictiveEntryState,
    RecommendationPredictiveStrategyType,
} from "./recommendationPredictiveIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_MAXIMUM_CANDIDATE_COUNT =
  3;

const DEFAULT_MINIMUM_PROBABILITY =
  0.05;

const MAXIMUM_CANDIDATE_COUNT =
  8;

const MINIMUM_RAW_SCORE =
  0.0001;

const SCORE_PRECISION =
  10000;

const RECOMMENDATION_PREDICTIVE_STRATEGY_TYPES:
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

/* ------------------------------------------------------------------ */
/* Strategy-State Compatibility                                       */
/* ------------------------------------------------------------------ */

/**
 * Strategy가 자연스럽게 대응할 수 있는 State 후보입니다.
 *
 * 이것은 강제 규칙이 아닙니다.
 * 예측 점수 계산에 사용하는 기본 Compatibility Map입니다.
 */
const STRATEGY_COMPATIBLE_STATE_TYPES:
  Readonly<
    Record<
      RecommendationPredictiveStrategyType,
      readonly RecommendationPredictiveEntryState[]
    >
  > = {
    observe: [
      "unavailable",
      "observing",
      "stalled",
      "fragmented",
    ],

    maintain: [
      "observing",
      "stable",
      "progressing",
    ],

    clarify: [
      "observing",
      "stalled",
      "fragmented",
    ],

    narrow: [
      "observing",
      "stalled",
      "fragmented",
    ],

    "confirm-completion": [
      "stable",
      "progressing",
      "advancing",
    ],

    advance: [
      "stable",
      "progressing",
      "advancing",
    ],

    stabilize: [
      "observing",
      "stable",
      "stalled",
      "fragmented",
    ],

    reconsider: [
      "stalled",
      "fragmented",
      "observing",
    ],
  };

/* ------------------------------------------------------------------ */
/* Internal Candidate                                                 */
/* ------------------------------------------------------------------ */

type RecommendationStrategyPredictionCandidate = {
  strategyType:
    RecommendationPredictiveStrategyType;

  compatibleStateTypes:
    RecommendationPredictiveEntryState[];

  rawScore:
    number;

  probability:
    number;

  confidence:
    number;

  reasoning:
    string[];

  evidence:
    RecommendationPredictionEvidence;
};

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * 다음 Recommendation Strategy 후보를 예측합니다.
 *
 * 예측 근거:
 *
 * - 현재 Strategy의 지속 가능성
 * - 최근 Strategy 사용 빈도
 * - 예측된 State와 Strategy의 Compatibility
 * - Runtime Strategy Preference Adjustment
 * - Stability·Progress·Risk·Completion 추세
 * - 장기 Memory Signal
 * - 반복 및 Oscillation 위험
 * - Adaptive Learning Evidence와 Conflict Risk
 *
 * 이 함수는 Strategy를 실제 선택하거나 Runtime에 적용하지 않습니다.
 */
export function predictNextRecommendationStrategies(
  params:
    PredictNextRecommendationStrategiesParams,
): RecommendationPredictedStrategy[] {
  validatePredictNextRecommendationStrategiesParams(
    params,
  );

  const maximumCandidateCount =
    params.maximumCandidateCount ??
    DEFAULT_MAXIMUM_CANDIDATE_COUNT;

  const minimumProbability =
    params.minimumProbability ??
    DEFAULT_MINIMUM_PROBABILITY;

  if (
    params.context.currentState ===
      null ||
    params.context.recentEntryIds.length ===
      0
  ) {
    return [];
  }

  const candidates =
    RECOMMENDATION_PREDICTIVE_STRATEGY_TYPES.map(
      (
        strategyType,
      ) =>
        createStrategyPredictionCandidate({
          strategyType,
          context:
            params.context,
          predictedStates:
            params.predictedStates,
        }),
    );

  const normalizedCandidates =
    normalizeStrategyPredictionCandidates(
      candidates,
    );

  const selectedCandidates =
    selectStrategyPredictionCandidates({
      candidates:
        normalizedCandidates,

      maximumCandidateCount,

      minimumProbability,
    });

  const predictions =
    selectedCandidates.map(
      (
        candidate,
        index,
      ): RecommendationPredictedStrategy => ({
        id:
          params.createPredictionId(
            candidate.strategyType,
            index,
          ),

        strategyType:
          candidate.strategyType,

        rank:
          index +
          1,

        scores: {
          rawScore:
            roundScore(
              candidate.rawScore,
            ),

          probability:
            roundScore(
              candidate.probability,
            ),

          confidence:
            roundScore(
              candidate.confidence,
            ),
        },

        compatibleStateTypes: [
          ...candidate.compatibleStateTypes,
        ],

        reasoning: [
          ...candidate.reasoning,
        ],

        evidence:
          cloneRecommendationPredictionEvidence(
            candidate.evidence,
          ),

        predictedAt:
          params.predictedAt,
      }),
    );

  validateRecommendationPredictedStrategies(
    predictions,
  );

  return predictions.map(
    cloneRecommendationPredictedStrategy,
  );
}

/* ------------------------------------------------------------------ */
/* Candidate Creation                                                 */
/* ------------------------------------------------------------------ */

function createStrategyPredictionCandidate(
  params: {
    strategyType:
      RecommendationPredictiveStrategyType;

    context:
      RecommendationPredictionContext;

    predictedStates:
      readonly RecommendationPredictedState[];
  },
): RecommendationStrategyPredictionCandidate {
  const compatibleStateTypes = [
    ...STRATEGY_COMPATIBLE_STATE_TYPES[
      params.strategyType
    ],
  ];

  const reasoning:
    string[] = [];

  const evidence =
    createEmptyRecommendationPredictionEvidence();

  addPredictionContextEvidence(
    evidence,
    params.context,
  );

  let rawScore =
    0.1;

  rawScore +=
    calculateCurrentStrategyPersistenceScore({
      strategyType:
        params.strategyType,

      context:
        params.context,

      reasoning,
    });

  rawScore +=
    calculateRecentStrategyFrequencyScore({
      strategyType:
        params.strategyType,

      context:
        params.context,

      reasoning,
    });

  rawScore +=
    calculatePredictedStateCompatibilityScore({
      strategyType:
        params.strategyType,

      compatibleStateTypes,

      predictedStates:
        params.predictedStates,

      reasoning,
    });

  rawScore +=
    calculateStrategyPreferenceAdjustmentScore({
      strategyType:
        params.strategyType,

      context:
        params.context,

      reasoning,
    });

  rawScore +=
    calculateScoreTrendStrategyBias({
      strategyType:
        params.strategyType,

      context:
        params.context,

      reasoning,
    });

  rawScore +=
    calculateMemorySignalStrategyBias({
      strategyType:
        params.strategyType,

      context:
        params.context,

      reasoning,
    });

  rawScore +=
    calculateGlobalRuntimeAdjustmentBias({
      strategyType:
        params.strategyType,

      context:
        params.context,

      reasoning,
    });

  rawScore -=
    calculateStrategyRepetitionPenalty({
      strategyType:
        params.strategyType,

      context:
        params.context,

      reasoning,
    });

  rawScore -=
    calculateStrategyConflictPenalty({
      context:
        params.context,

      reasoning,
    });

  rawScore =
    Math.max(
      MINIMUM_RAW_SCORE,
      rawScore,
    );

  const confidence =
    calculateStrategyPredictionConfidence({
      strategyType:
        params.strategyType,

      compatibleStateTypes,

      context:
        params.context,

      predictedStates:
        params.predictedStates,
    });

  if (
    reasoning.length ===
    0
  ) {
    reasoning.push(
      `The ${params.strategyType} strategy remains a baseline prediction candidate.`,
    );
  }

  return {
    strategyType:
      params.strategyType,

    compatibleStateTypes,

    rawScore:
      roundScore(
        rawScore,
      ),

    probability:
      0,

    confidence:
      roundScore(
        confidence,
      ),

    reasoning:
      uniqueStrings(
        reasoning,
      ),

    evidence,
  };
}

/* ------------------------------------------------------------------ */
/* Current Strategy Persistence                                       */
/* ------------------------------------------------------------------ */

function calculateCurrentStrategyPersistenceScore(
  params: {
    strategyType:
      RecommendationPredictiveStrategyType;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  if (
    params.context.currentStrategyType !==
    params.strategyType
  ) {
    return 0;
  }

  const recentCount =
    countOccurrences(
      params.context.recentStrategyTypes,
      params.strategyType,
    );

  const recentRatio =
    params.context.recentStrategyTypes.length ===
      0
      ? 0
      : recentCount /
        params.context.recentStrategyTypes.length;

  let score =
    0.16 +
    recentRatio *
      0.12;

  /**
   * 같은 Strategy가 반복되더라도 위험 신호가 높으면 단순 지속성을
   * 그대로 긍정하지 않습니다.
   */
  if (
    params.strategyType ===
      "observe" &&
    hasMemorySignal(
      params.context,
      "persistent-observation",
    )
  ) {
    score *=
      0.45;

    params.reasoning.push(
      "The current observe strategy is repeated, but persistent observation reduces the value of simple continuation.",
    );

    return score;
  }

  if (
    (
      params.strategyType ===
        "maintain" ||
      params.strategyType ===
        "stabilize"
    ) &&
    (
      params.context.scoreTrend.stability ===
        "increasing" ||
      hasMemorySignal(
        params.context,
        "persistent-stability",
      )
    )
  ) {
    score +=
      0.08;

    params.reasoning.push(
      `The current ${params.strategyType} strategy is producing a stable continuation pattern.`,
    );

    return score;
  }

  params.reasoning.push(
    `The current strategy is ${params.strategyType}, supporting short-term persistence.`,
  );

  return score;
}

/* ------------------------------------------------------------------ */
/* Recent Strategy Frequency                                          */
/* ------------------------------------------------------------------ */

function calculateRecentStrategyFrequencyScore(
  params: {
    strategyType:
      RecommendationPredictiveStrategyType;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  if (
    params.context.recentStrategyTypes.length ===
    0
  ) {
    return 0;
  }

  const occurrenceCount =
    countOccurrences(
      params.context.recentStrategyTypes,
      params.strategyType,
    );

  if (
    occurrenceCount ===
    0
  ) {
    return 0;
  }

  const frequency =
    occurrenceCount /
    params.context.recentStrategyTypes.length;

  if (
    frequency >=
    0.4
  ) {
    params.reasoning.push(
      `${params.strategyType} is a recurring strategy in recent Memory entries.`,
    );
  }

  return frequency *
    0.1;
}

/* ------------------------------------------------------------------ */
/* Predicted State Compatibility                                      */
/* ------------------------------------------------------------------ */

function calculatePredictedStateCompatibilityScore(
  params: {
    strategyType:
      RecommendationPredictiveStrategyType;

    compatibleStateTypes:
      readonly RecommendationPredictiveEntryState[];

    predictedStates:
      readonly RecommendationPredictedState[];

    reasoning:
      string[];
  },
): number {
  if (
    params.predictedStates.length ===
    0
  ) {
    return 0;
  }

  const compatibleProbability =
    params.predictedStates.reduce(
      (
        sum,
        prediction,
      ) =>
        params.compatibleStateTypes.includes(
          prediction.state,
        )
          ? sum +
            prediction.scores.probability
          : sum,
      0,
    );

  if (
    compatibleProbability <=
    0
  ) {
    return 0;
  }

  const primaryCompatibleState =
    params.predictedStates.find(
      (
        prediction,
      ) =>
        params.compatibleStateTypes.includes(
          prediction.state,
        ),
    );

  if (
    primaryCompatibleState !==
    undefined
  ) {
    params.reasoning.push(
      `${params.strategyType} is compatible with the predicted ${primaryCompatibleState.state} state.`,
    );
  }

  return compatibleProbability *
    0.34;
}

/* ------------------------------------------------------------------ */
/* Strategy Preference Adjustment                                     */
/* ------------------------------------------------------------------ */

function calculateStrategyPreferenceAdjustmentScore(
  params: {
    strategyType:
      RecommendationPredictiveStrategyType;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  const adjustment =
    params.context.runtimeAdjustment
      .strategyPreferenceAdjustments[
        params.strategyType
      ] ??
    0;

  if (
    adjustment >
    0
  ) {
    params.reasoning.push(
      `Adaptive Learning currently increases preference for the ${params.strategyType} strategy.`,
    );

    return adjustment *
      0.24;
  }

  if (
    adjustment <
    0
  ) {
    params.reasoning.push(
      `Adaptive Learning currently reduces preference for the ${params.strategyType} strategy.`,
    );

    return adjustment *
      0.16;
  }

  return 0;
}

/* ------------------------------------------------------------------ */
/* Score Trend Bias                                                   */
/* ------------------------------------------------------------------ */

function calculateScoreTrendStrategyBias(
  params: {
    strategyType:
      RecommendationPredictiveStrategyType;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  const {
    scoreTrend,
  } = params.context;

  let score =
    0;

  switch (
    params.strategyType
  ) {
    case "observe": {
      if (
        scoreTrend.sampleCount ===
        0
      ) {
        score +=
          0.12;

        params.reasoning.push(
          "Limited comparison evidence supports continued observation.",
        );
      }

      if (
        scoreTrend.progress ===
          "stable" &&
        scoreTrend.stability ===
          "stable"
      ) {
        score +=
          0.04;
      }

      break;
    }

    case "maintain": {
      score +=
        positiveChange(
          scoreTrend.stabilityChange,
        ) *
        0.2;

      score +=
        positiveChange(
          scoreTrend.progressChange,
        ) *
        0.08;

      score +=
        negativeChangeMagnitude(
          scoreTrend.repetitionRiskChange,
        ) *
        0.08;

      if (
        scoreTrend.stability ===
        "increasing"
      ) {
        params.reasoning.push(
          "Increasing stability supports maintaining the current direction.",
        );
      }

      break;
    }

    case "clarify": {
      score +=
        positiveChange(
          scoreTrend.redirectionRiskChange,
        ) *
        0.12;

      score +=
        negativeChangeMagnitude(
          scoreTrend.progressChange,
        ) *
        0.1;

      if (
        scoreTrend.redirectionRisk ===
        "increasing"
      ) {
        params.reasoning.push(
          "Increasing redirection risk supports clarification before further movement.",
        );
      }

      break;
    }

    case "narrow": {
      score +=
        positiveChange(
          scoreTrend.repetitionRiskChange,
        ) *
        0.12;

      score +=
        positiveChange(
          scoreTrend.redirectionRiskChange,
        ) *
        0.12;

      score +=
        negativeChangeMagnitude(
          scoreTrend.progressChange,
        ) *
        0.08;

      if (
        scoreTrend.repetitionRisk ===
          "increasing"
      ) {
        params.reasoning.push(
          "Increasing repetition risk supports narrowing the Recommendation scope.",
        );
      }

      break;
    }

    case "confirm-completion": {
      score +=
        positiveChange(
          scoreTrend.completionMomentumChange,
        ) *
        0.28;

      score +=
        positiveChange(
          scoreTrend.progressChange,
        ) *
        0.1;

      if (
        scoreTrend.completionMomentum ===
        "increasing"
      ) {
        params.reasoning.push(
          "Increasing completion momentum supports completion confirmation.",
        );
      }

      break;
    }

    case "advance": {
      score +=
        positiveChange(
          scoreTrend.progressChange,
        ) *
        0.18;

      score +=
        positiveChange(
          scoreTrend.completionMomentumChange,
        ) *
        0.22;

      score +=
        negativeChangeMagnitude(
          scoreTrend.redirectionRiskChange,
        ) *
        0.06;

      if (
        scoreTrend.progress ===
          "increasing" &&
        scoreTrend.completionMomentum ===
          "increasing"
      ) {
        params.reasoning.push(
          "Progress and completion momentum jointly support advancement.",
        );
      }

      break;
    }

    case "stabilize": {
      score +=
        negativeChangeMagnitude(
          scoreTrend.stabilityChange,
        ) *
        0.2;

      score +=
        positiveChange(
          scoreTrend.repetitionRiskChange,
        ) *
        0.08;

      score +=
        positiveChange(
          scoreTrend.redirectionRiskChange,
        ) *
        0.08;

      if (
        scoreTrend.stability ===
        "decreasing"
      ) {
        params.reasoning.push(
          "Declining stability supports a stabilization strategy.",
        );
      }

      break;
    }

    case "reconsider": {
      score +=
        negativeChangeMagnitude(
          scoreTrend.progressChange,
        ) *
        0.14;

      score +=
        positiveChange(
          scoreTrend.redirectionRiskChange,
        ) *
        0.18;

      score +=
        negativeChangeMagnitude(
          scoreTrend.completionMomentumChange,
        ) *
        0.1;

      if (
        scoreTrend.redirectionRisk ===
          "increasing" &&
        scoreTrend.progress ===
          "decreasing"
      ) {
        params.reasoning.push(
          "Declining progress and increasing redirection risk support reconsidering the current direction.",
        );
      }

      break;
    }
  }

  return score;
}

/* ------------------------------------------------------------------ */
/* Memory Signal Bias                                                 */
/* ------------------------------------------------------------------ */

function calculateMemorySignalStrategyBias(
  params: {
    strategyType:
      RecommendationPredictiveStrategyType;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  let score =
    0;

  switch (
    params.strategyType
  ) {
    case "observe": {
      if (
        hasMemorySignal(
          params.context,
          "insufficient-memory",
        )
      ) {
        score +=
          0.2;

        params.reasoning.push(
          "Insufficient long-term Memory supports further observation.",
        );
      }

      break;
    }

    case "maintain": {
      if (
        hasMemorySignal(
          params.context,
          "persistent-stability",
        ) ||
        hasMemorySignal(
          params.context,
          "risk-reduction",
        )
      ) {
        score +=
          0.2;

        params.reasoning.push(
          "Long-term stability or risk reduction supports maintaining the current direction.",
        );
      }

      break;
    }

    case "clarify": {
      if (
        hasMemorySignal(
          params.context,
          "strategy-oscillation",
        )
      ) {
        score +=
          0.14;

        params.reasoning.push(
          "Strategy oscillation supports clarifying the Recommendation basis.",
        );
      }

      break;
    }

    case "narrow": {
      if (
        hasMemorySignal(
          params.context,
          "persistent-fragmentation",
        ) ||
        hasMemorySignal(
          params.context,
          "state-oscillation",
        )
      ) {
        score +=
          0.2;

        params.reasoning.push(
          "Fragmentation or state oscillation supports narrowing the active scope.",
        );
      }

      break;
    }

    case "confirm-completion": {
      if (
        hasMemorySignal(
          params.context,
          "long-term-advancement",
        )
      ) {
        score +=
          0.18;

        params.reasoning.push(
          "Long-term advancement supports checking whether completion has been reached.",
        );
      }

      break;
    }

    case "advance": {
      if (
        hasMemorySignal(
          params.context,
          "long-term-progression",
        ) ||
        hasMemorySignal(
          params.context,
          "long-term-advancement",
        )
      ) {
        score +=
          0.22;

        params.reasoning.push(
          "Long-term progression supports the possibility of advancement.",
        );
      }

      if (
        hasMemorySignal(
          params.context,
          "risk-accumulation",
        )
      ) {
        score -=
          0.12;
      }

      break;
    }

    case "stabilize": {
      if (
        hasMemorySignal(
          params.context,
          "persistent-stall",
        ) ||
        hasMemorySignal(
          params.context,
          "persistent-fragmentation",
        ) ||
        hasMemorySignal(
          params.context,
          "risk-accumulation",
        )
      ) {
        score +=
          0.24;

        params.reasoning.push(
          "Long-term stall, fragmentation, or accumulated risk supports stabilization.",
        );
      }

      break;
    }

    case "reconsider": {
      if (
        hasMemorySignal(
          params.context,
          "persistent-stall",
        ) ||
        hasMemorySignal(
          params.context,
          "confidence-degradation",
        ) ||
        hasMemorySignal(
          params.context,
          "strategy-oscillation",
        )
      ) {
        score +=
          0.22;

        params.reasoning.push(
          "Persistent stall or degraded confidence supports reconsidering the current strategy.",
        );
      }

      if (
        hasMemorySignal(
          params.context,
          "recovery-pattern",
        )
      ) {
        score +=
          0.08;
      }

      break;
    }
  }

  return score;
}

/* ------------------------------------------------------------------ */
/* Global Runtime Adjustment Bias                                     */
/* ------------------------------------------------------------------ */

function calculateGlobalRuntimeAdjustmentBias(
  params: {
    strategyType:
      RecommendationPredictiveStrategyType;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  const adjustment =
    params.context.runtimeAdjustment;

  let score =
    0;

  if (
    params.strategyType ===
    "stabilize"
  ) {
    score +=
      positiveChange(
        adjustment.stabilizationPreferenceAdjustment,
      ) *
      0.2;

    if (
      adjustment.stabilizationPreferenceAdjustment >
      0
    ) {
      params.reasoning.push(
        "The Runtime Adjustment explicitly favors stabilization.",
      );
    }
  }

  if (
    params.strategyType ===
      "reconsider" ||
    params.strategyType ===
      "clarify"
  ) {
    score +=
      positiveChange(
        adjustment.recoveryPreferenceAdjustment,
      ) *
      0.14;
  }

  if (
    params.strategyType ===
      "advance" ||
    params.strategyType ===
      "confirm-completion"
  ) {
    score +=
      negativeChangeMagnitude(
        adjustment.newRecommendationThresholdAdjustment,
      ) *
      0.12;

    score -=
      positiveChange(
        adjustment.evidenceRequirementAdjustment,
      ) *
      0.08;
  }

  if (
    params.strategyType ===
      "observe" ||
    params.strategyType ===
      "clarify"
  ) {
    score +=
      positiveChange(
        adjustment.evidenceRequirementAdjustment,
      ) *
      0.08;
  }

  if (
    params.strategyType ===
    "reconsider"
  ) {
    score +=
      negativeChangeMagnitude(
        adjustment.redirectionThresholdAdjustment,
      ) *
      0.1;
  }

  return score *
    averageNumbers([
      params.context.learningConfidence,
      params.context.adaptationReadiness,
    ]);
}

/* ------------------------------------------------------------------ */
/* Repetition Penalty                                                 */
/* ------------------------------------------------------------------ */

function calculateStrategyRepetitionPenalty(
  params: {
    strategyType:
      RecommendationPredictiveStrategyType;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  const recentStrategies =
    params.context.recentStrategyTypes;

  if (
    recentStrategies.length <
    2
  ) {
    return 0;
  }

  const trailingCount =
    countTrailingOccurrences(
      recentStrategies,
      params.strategyType,
    );

  if (
    trailingCount <
    2
  ) {
    return 0;
  }

  /**
   * maintain과 stabilize는 실제 성과가 나타나는 경우 지속성이
   * 의미 있을 수 있으므로 패널티를 낮춥니다.
   */
  if (
    params.strategyType ===
      "maintain" &&
    (
      params.context.scoreTrend.stability ===
        "increasing" ||
      params.context.scoreTrend.progress ===
        "increasing"
    )
  ) {
    return 0;
  }

  if (
    params.strategyType ===
      "stabilize" &&
    params.context.scoreTrend.stability ===
      "increasing"
  ) {
    return 0;
  }

  const basePenalty =
    Math.min(
      0.18,
      trailingCount *
        0.04,
    );

  if (
    params.strategyType ===
      "observe" &&
    hasMemorySignal(
      params.context,
      "persistent-observation",
    )
  ) {
    params.reasoning.push(
      "Repeated observation without sufficient transition evidence reduces the likelihood of another observe strategy.",
    );

    return basePenalty +
      0.1;
  }

  params.reasoning.push(
    `Repeated use of ${params.strategyType} reduces the value of another unchanged strategy selection.`,
  );

  return basePenalty;
}

/* ------------------------------------------------------------------ */
/* Conflict Penalty                                                   */
/* ------------------------------------------------------------------ */

function calculateStrategyConflictPenalty(
  params: {
    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  if (
    params.context.conflictRisk <=
    0
  ) {
    return 0;
  }

  const ruleConflictPenalty =
    Math.min(
      0.08,
      params.context
        .conflictedAdaptationRuleIds.length *
        0.02,
    );

  const penalty =
    params.context.conflictRisk *
      0.08 +
    ruleConflictPenalty;

  if (
    params.context.conflictRisk >=
    0.5
  ) {
    params.reasoning.push(
      "Conflicting adaptive evidence reduces Strategy prediction certainty.",
    );
  }

  return penalty;
}

/* ------------------------------------------------------------------ */
/* Confidence                                                         */
/* ------------------------------------------------------------------ */

function calculateStrategyPredictionConfidence(
  params: {
    strategyType:
      RecommendationPredictiveStrategyType;

    compatibleStateTypes:
      readonly RecommendationPredictiveEntryState[];

    context:
      RecommendationPredictionContext;

    predictedStates:
      readonly RecommendationPredictedState[];
  },
): number {
  const recentEvidence =
    clampUnitInterval(
      params.context.recentStrategyTypes.length /
      5,
    );

  const strategyFrequency =
    params.context.recentStrategyTypes.length ===
      0
      ? 0
      : countOccurrences(
          params.context.recentStrategyTypes,
          params.strategyType,
        ) /
        params.context.recentStrategyTypes.length;

  const compatibleStateEvidence =
    params.predictedStates.reduce(
      (
        sum,
        prediction,
      ) =>
        params.compatibleStateTypes.includes(
          prediction.state,
        )
          ? sum +
            prediction.scores.probability *
            prediction.scores.confidence
          : sum,
      0,
    );

  const adaptiveEvidence =
    averageNumbers([
      params.context.evidenceStrength,
      params.context.learningConfidence,
      params.context.adaptationReadiness,
    ]);

  const preferenceAdjustment =
    Math.abs(
      params.context.runtimeAdjustment
        .strategyPreferenceAdjustments[
          params.strategyType
        ] ??
      0,
    );

  const adjustmentEvidence =
    clampUnitInterval(
      preferenceAdjustment,
    );

  const confidence =
    recentEvidence *
      0.16 +
    strategyFrequency *
      0.14 +
    compatibleStateEvidence *
      0.32 +
    adaptiveEvidence *
      0.28 +
    adjustmentEvidence *
      0.1;

  const conflictMultiplier =
    1 -
    params.context.conflictRisk *
      0.45;

  return clampUnitInterval(
    confidence *
      conflictMultiplier,
  );
}

/* ------------------------------------------------------------------ */
/* Normalization                                                      */
/* ------------------------------------------------------------------ */

function normalizeStrategyPredictionCandidates(
  candidates:
    readonly RecommendationStrategyPredictionCandidate[],
): RecommendationStrategyPredictionCandidate[] {
  if (
    candidates.length ===
    0
  ) {
    return [];
  }

  const totalRawScore =
    candidates.reduce(
      (
        sum,
        candidate,
      ) =>
        sum +
        Math.max(
          MINIMUM_RAW_SCORE,
          candidate.rawScore,
        ),
      0,
    );

  if (
    totalRawScore <=
    0
  ) {
    const uniformProbability =
      1 /
      candidates.length;

    return candidates.map(
      (
        candidate,
      ) => ({
        ...cloneStrategyPredictionCandidate(
          candidate,
        ),

        probability:
          uniformProbability,
      }),
    );
  }

  return candidates.map(
    (
      candidate,
    ) => ({
      ...cloneStrategyPredictionCandidate(
        candidate,
      ),

      probability:
        Math.max(
          MINIMUM_RAW_SCORE,
          candidate.rawScore,
        ) /
        totalRawScore,
    }),
  );
}

/* ------------------------------------------------------------------ */
/* Candidate Selection                                                */
/* ------------------------------------------------------------------ */

function selectStrategyPredictionCandidates(
  params: {
    candidates:
      readonly RecommendationStrategyPredictionCandidate[];

    maximumCandidateCount:
      number;

    minimumProbability:
      number;
  },
): RecommendationStrategyPredictionCandidate[] {
  const sorted =
    [...params.candidates].sort(
      compareStrategyPredictionCandidates,
    );

  let selected =
    sorted
      .filter(
        (
          candidate,
        ) =>
          candidate.probability >=
          params.minimumProbability,
      )
      .slice(
        0,
        params.maximumCandidateCount,
      );

  if (
    selected.length ===
      0 &&
    sorted.length >
      0
  ) {
    const firstCandidate =
      sorted[
        0
      ];

    if (
      firstCandidate !==
      undefined
    ) {
      selected = [
        firstCandidate,
      ];
    }
  }

  return renormalizeSelectedStrategyCandidates(
    selected,
  );
}

function renormalizeSelectedStrategyCandidates(
  candidates:
    readonly RecommendationStrategyPredictionCandidate[],
): RecommendationStrategyPredictionCandidate[] {
  if (
    candidates.length ===
    0
  ) {
    return [];
  }

  const probabilityTotal =
    candidates.reduce(
      (
        sum,
        candidate,
      ) =>
        sum +
        candidate.probability,
      0,
    );

  if (
    probabilityTotal <=
    0
  ) {
    const uniformProbability =
      1 /
      candidates.length;

    return candidates.map(
      (
        candidate,
      ) => ({
        ...cloneStrategyPredictionCandidate(
          candidate,
        ),

        probability:
          uniformProbability,
      }),
    );
  }

  return candidates.map(
    (
      candidate,
    ) => ({
      ...cloneStrategyPredictionCandidate(
        candidate,
      ),

      probability:
        candidate.probability /
        probabilityTotal,
    }),
  );
}

function compareStrategyPredictionCandidates(
  left:
    RecommendationStrategyPredictionCandidate,
  right:
    RecommendationStrategyPredictionCandidate,
): number {
  if (
    left.probability !==
    right.probability
  ) {
    return right.probability -
      left.probability;
  }

  if (
    left.confidence !==
    right.confidence
  ) {
    return right.confidence -
      left.confidence;
  }

  return getStrategyOrder(
    left.strategyType,
  ) -
    getStrategyOrder(
      right.strategyType,
    );
}

/* ------------------------------------------------------------------ */
/* Evidence                                                           */
/* ------------------------------------------------------------------ */

function addPredictionContextEvidence(
  evidence:
    RecommendationPredictionEvidence,
  context:
    RecommendationPredictionContext,
): void {
  evidence.relatedEntryIds =
    uniqueStrings([
      ...evidence.relatedEntryIds,
      ...context.recentEntryIds,
    ]);

  evidence.relatedComparisonIds =
    uniqueStrings([
      ...evidence.relatedComparisonIds,
      ...context.recentComparisonIds,
    ]);

  evidence.relatedRuleIds =
    uniqueStrings([
      ...evidence.relatedRuleIds,
      ...context.activeAdaptationRuleIds,
      ...context.conflictedAdaptationRuleIds,
    ]);

  evidence.relatedMemorySignalTypes =
    uniqueStrings([
      ...evidence.relatedMemorySignalTypes,
      ...context.currentMemorySignalTypes,
    ]);
}

/* ------------------------------------------------------------------ */
/* Clone                                                              */
/* ------------------------------------------------------------------ */

export function cloneRecommendationPredictedStrategy(
  prediction:
    RecommendationPredictedStrategy,
): RecommendationPredictedStrategy {
  return {
    ...prediction,

    scores: {
      ...prediction.scores,
    },

    compatibleStateTypes: [
      ...prediction.compatibleStateTypes,
    ],

    reasoning: [
      ...prediction.reasoning,
    ],

    evidence:
      cloneRecommendationPredictionEvidence(
        prediction.evidence,
      ),
  };
}

function cloneStrategyPredictionCandidate(
  candidate:
    RecommendationStrategyPredictionCandidate,
): RecommendationStrategyPredictionCandidate {
  return {
    ...candidate,

    compatibleStateTypes: [
      ...candidate.compatibleStateTypes,
    ],

    reasoning: [
      ...candidate.reasoning,
    ],

    evidence:
      cloneRecommendationPredictionEvidence(
        candidate.evidence,
      ),
  };
}

function cloneRecommendationPredictionEvidence(
  evidence:
    RecommendationPredictionEvidence,
): RecommendationPredictionEvidence {
  return {
    relatedEntryIds: [
      ...evidence.relatedEntryIds,
    ],

    relatedComparisonIds: [
      ...evidence.relatedComparisonIds,
    ],

    relatedObservationIds: [
      ...evidence.relatedObservationIds,
    ],

    relatedPatternIds: [
      ...evidence.relatedPatternIds,
    ],

    relatedRuleIds: [
      ...evidence.relatedRuleIds,
    ],

    relatedMemorySignalTypes: [
      ...evidence.relatedMemorySignalTypes,
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Query Helpers                                                      */
/* ------------------------------------------------------------------ */

export function getRecommendationStrategyPredictionProbability(
  predictions:
    readonly RecommendationPredictedStrategy[],
  strategyType:
    RecommendationPredictiveStrategyType,
): number {
  return (
    predictions.find(
      (
        prediction,
      ) =>
        prediction.strategyType ===
        strategyType,
    )?.scores.probability ??
    0
  );
}

export function hasRecommendationStrategyPrediction(
  predictions:
    readonly RecommendationPredictedStrategy[],
  strategyType:
    RecommendationPredictiveStrategyType,
): boolean {
  return predictions.some(
    (
      prediction,
    ) =>
      prediction.strategyType ===
      strategyType,
  );
}

export function summarizeRecommendationStrategyPredictions(
  predictions:
    readonly RecommendationPredictedStrategy[],
): string {
  if (
    predictions.length ===
    0
  ) {
    return "No Recommendation strategy prediction is currently available.";
  }

  return predictions
    .map(
      (
        prediction,
      ) =>
        `${prediction.strategyType}: ${roundScore(
          prediction.scores.probability *
            100,
        )}%`,
    )
    .join(
      ", ",
    );
}

/* ------------------------------------------------------------------ */
/* Public Validation                                                  */
/* ------------------------------------------------------------------ */

export function validateRecommendationPredictedStrategy(
  prediction:
    RecommendationPredictedStrategy,
): void {
  if (
    typeof prediction !==
      "object" ||
    prediction ===
      null ||
    Array.isArray(
      prediction,
    )
  ) {
    throw new Error(
      "Recommendation Strategy Prediction must be an object.",
    );
  }

  validateRequiredIdentifier(
    prediction.id,
    "prediction.id",
  );

  if (
    !isRecommendationPredictiveStrategyType(
      prediction.strategyType,
    )
  ) {
    throw new Error(
      "Recommendation Strategy Prediction strategyType is invalid.",
    );
  }

  validatePositiveInteger(
    prediction.rank,
    "prediction.rank",
  );

  validatePredictionCandidateScores(
    prediction.scores,
  );

  validateUniqueStateArray(
    prediction.compatibleStateTypes,
    "prediction.compatibleStateTypes",
  );

  validateStringArray(
    prediction.reasoning,
    "prediction.reasoning",
  );

  validatePredictionEvidence(
    prediction.evidence,
  );

  validateTimestamp(
    prediction.predictedAt,
    "prediction.predictedAt",
  );
}

export function validateRecommendationPredictedStrategies(
  predictions:
    readonly RecommendationPredictedStrategy[],
): void {
  if (
    !Array.isArray(
      predictions,
    )
  ) {
    throw new Error(
      "Recommendation Strategy Predictions must be an array.",
    );
  }

  const observedIds =
    new Set<string>();

  const observedStrategyTypes =
    new Set<
      RecommendationPredictiveStrategyType
    >();

  predictions.forEach(
    (
      prediction,
      index,
    ) => {
      validateRecommendationPredictedStrategy(
        prediction,
      );

      if (
        observedIds.has(
          prediction.id,
        )
      ) {
        throw new Error(
          `Recommendation Strategy Prediction id must be unique: ${prediction.id}.`,
        );
      }

      if (
        observedStrategyTypes.has(
          prediction.strategyType,
        )
      ) {
        throw new Error(
          `Recommendation Strategy Prediction strategyType must be unique: ${prediction.strategyType}.`,
        );
      }

      if (
        prediction.rank !==
        index +
          1
      ) {
        throw new Error(
          "Recommendation Strategy Prediction ranks must be sequential.",
        );
      }

      observedIds.add(
        prediction.id,
      );

      observedStrategyTypes.add(
        prediction.strategyType,
      );
    },
  );

  if (
    predictions.length >
    0
  ) {
    const probabilityTotal =
      predictions.reduce(
        (
          sum,
          prediction,
        ) =>
          sum +
          prediction.scores.probability,
        0,
      );

    if (
      Math.abs(
        probabilityTotal -
          1,
      ) >
      0.001
    ) {
      throw new Error(
        "Recommendation Strategy Prediction probabilities must sum to 1.",
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validatePredictNextRecommendationStrategiesParams(
  params:
    PredictNextRecommendationStrategiesParams,
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
      "Predict Next Recommendation Strategies params must be an object.",
    );
  }

  validateStrategyPredictionContextConsistency({
    context:
      params.context,

    adaptiveLearningAnalysis:
      params.adaptiveLearningAnalysis,
  });

  validateRecommendationPredictedStates(
    params.predictedStates,
  );

  validateTimestamp(
    params.predictedAt,
    "predictedAt",
  );

  validateTimestampOrder(
    params.context.createdAt,
    params.predictedAt,
    "context.createdAt",
    "predictedAt",
  );

  params.predictedStates.forEach(
    (
      prediction,
    ) => {
      if (
        prediction.predictedAt !==
        params.predictedAt
      ) {
        throw new Error(
          "State and Strategy Predictions must use the same predictedAt timestamp.",
        );
      }
    },
  );

  if (
    params.maximumCandidateCount !==
    undefined
  ) {
    validatePositiveBoundedInteger(
      params.maximumCandidateCount,
      "maximumCandidateCount",
      MAXIMUM_CANDIDATE_COUNT,
    );
  }

  if (
    params.minimumProbability !==
    undefined
  ) {
    validateUnitInterval(
      params.minimumProbability,
      "minimumProbability",
    );
  }

  if (
    typeof params.createPredictionId !==
    "function"
  ) {
    throw new Error(
      "createPredictionId must be a function.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Validation Helpers                                                 */
/* ------------------------------------------------------------------ */

function validatePredictionCandidateScores(
  scores:
    RecommendationPredictionCandidateScores,
): void {
  if (
    typeof scores !==
      "object" ||
    scores ===
      null ||
    Array.isArray(
      scores,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Candidate Scores must be an object.",
    );
  }

  validateNonNegativeFiniteNumber(
    scores.rawScore,
    "scores.rawScore",
  );

  validateUnitInterval(
    scores.probability,
    "scores.probability",
  );

  validateUnitInterval(
    scores.confidence,
    "scores.confidence",
  );
}

function validatePredictionEvidence(
  evidence:
    RecommendationPredictionEvidence,
): void {
  if (
    typeof evidence !==
      "object" ||
    evidence ===
      null ||
    Array.isArray(
      evidence,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Evidence must be an object.",
    );
  }

  validateUniqueStringArray(
    evidence.relatedEntryIds,
    "evidence.relatedEntryIds",
  );

  validateUniqueStringArray(
    evidence.relatedComparisonIds,
    "evidence.relatedComparisonIds",
  );

  validateUniqueStringArray(
    evidence.relatedObservationIds,
    "evidence.relatedObservationIds",
  );

  validateUniqueStringArray(
    evidence.relatedPatternIds,
    "evidence.relatedPatternIds",
  );

  validateUniqueStringArray(
    evidence.relatedRuleIds,
    "evidence.relatedRuleIds",
  );

  validateUniqueStringArray(
    evidence.relatedMemorySignalTypes,
    "evidence.relatedMemorySignalTypes",
  );
}

function validateUniqueStateArray(
  values:
    readonly RecommendationPredictiveEntryState[],
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

  const observed =
    new Set<
      RecommendationPredictiveEntryState
    >();

  values.forEach(
    (
      value,
      index,
    ) => {
      if (
        !isRecommendationPredictiveEntryState(
          value,
        )
      ) {
        throw new Error(
          `${fieldName}[${index}] is invalid.`,
        );
      }

      if (
        observed.has(
          value,
        )
      ) {
        throw new Error(
          `${fieldName} must not contain duplicate state: ${value}.`,
        );
      }

      observed.add(
        value,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Type Guards                                                        */
/* ------------------------------------------------------------------ */

function isRecommendationPredictiveStrategyType(
  value:
    unknown,
): value is RecommendationPredictiveStrategyType {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_PREDICTIVE_STRATEGY_TYPES.includes(
      value as RecommendationPredictiveStrategyType,
    )
  );
}

function isRecommendationPredictiveEntryState(
  value:
    unknown,
): value is RecommendationPredictiveEntryState {
  return (
    value ===
      "unavailable" ||
    value ===
      "observing" ||
    value ===
      "stable" ||
    value ===
      "progressing" ||
    value ===
      "stalled" ||
    value ===
      "fragmented" ||
    value ===
      "advancing"
  );
}

/* ------------------------------------------------------------------ */
/* Strategy Order                                                     */
/* ------------------------------------------------------------------ */

function getStrategyOrder(
  strategyType:
    RecommendationPredictiveStrategyType,
): number {
  return RECOMMENDATION_PREDICTIVE_STRATEGY_TYPES.indexOf(
    strategyType,
  );
}

/* ------------------------------------------------------------------ */
/* Memory Signal Helper                                               */
/* ------------------------------------------------------------------ */

function hasMemorySignal(
  context:
    RecommendationPredictionContext,
  signalType:
    RecommendationPredictionContext[
      "currentMemorySignalTypes"
    ][number],
): boolean {
  return context.currentMemorySignalTypes.includes(
    signalType,
  );
}

/* ------------------------------------------------------------------ */
/* Generic Number Helpers                                             */
/* ------------------------------------------------------------------ */

function positiveChange(
  value:
    number,
): number {
  return Math.max(
    0,
    value,
  );
}

function negativeChangeMagnitude(
  value:
    number,
): number {
  return Math.max(
    0,
    -value,
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

  return values.reduce(
    (
      sum,
      value,
    ) =>
      sum +
      value,
    0,
  ) /
    values.length;
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

/* ------------------------------------------------------------------ */
/* Generic Array Helpers                                              */
/* ------------------------------------------------------------------ */

function countOccurrences<
  TValue,
>(
  values:
    readonly TValue[],
  target:
    TValue,
): number {
  return values.reduce(
    (
      count,
      value,
    ) =>
      value ===
      target
        ? count +
          1
        : count,
    0,
  );
}

function countTrailingOccurrences<
  TValue,
>(
  values:
    readonly TValue[],
  target:
    TValue,
): number {
  let count =
    0;

  for (
    let index =
      values.length -
      1;
    index >=
    0;
    index -=
      1
  ) {
    if (
      values[
        index
      ] !==
      target
    ) {
      break;
    }

    count +=
      1;
  }

  return count;
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
/* Generic Validation Helpers                                         */
/* ------------------------------------------------------------------ */

function validateRequiredIdentifier(
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
      if (
        typeof value !==
          "string" ||
        value.trim().length ===
          0
      ) {
        throw new Error(
          `${fieldName}[${index}] must be a non-empty string.`,
        );
      }
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

function validateNonNegativeFiniteNumber(
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
    0
  ) {
    throw new Error(
      `${fieldName} must not be negative.`,
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

function validatePositiveInteger(
  value:
    unknown,
  fieldName:
    string,
): asserts value is number {
  if (
    typeof value !==
      "number" ||
    !Number.isInteger(
      value,
    ) ||
    value <
      1
  ) {
    throw new Error(
      `${fieldName} must be a positive integer.`,
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
  validatePositiveInteger(
    value,
    fieldName,
  );

  if (
    value >
    maximum
  ) {
    throw new Error(
      `${fieldName} must not exceed ${maximum}.`,
    );
  }
}

function validateTimestamp(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string {
  if (
    typeof value !==
      "string" ||
    value.trim().length ===
      0 ||
    Number.isNaN(
      Date.parse(
        value,
      ),
    )
  ) {
    throw new Error(
      `${fieldName} must be a valid timestamp.`,
    );
  }
}

function validateTimestampOrder(
  earlier:
    string,
  later:
    string,
  earlierFieldName:
    string,
  laterFieldName:
    string,
): void {
  if (
    Date.parse(
      earlier,
    ) >
    Date.parse(
      later,
    )
  ) {
    throw new Error(
      `${earlierFieldName} must not be later than ${laterFieldName}.`,
    );
  }
}

function validateStrategyPredictionContextConsistency(
  params: {
    context:
      RecommendationPredictionContext;

    adaptiveLearningAnalysis:
      PredictNextRecommendationStrategiesParams["adaptiveLearningAnalysis"];
  },
): void {
  if (
    params.context.memoryId !==
    params.adaptiveLearningAnalysis.memoryId
  ) {
    throw new Error(
      "Prediction Context memoryId must match Adaptive Learning memoryId.",
    );
  }

  if (
    params.context.historyId !==
    params.adaptiveLearningAnalysis.historyId
  ) {
    throw new Error(
      "Prediction Context historyId must match Adaptive Learning historyId.",
    );
  }

  if (
    params.context.sourceAdaptiveLearningAnalyzedAt !==
    params.adaptiveLearningAnalysis.analyzedAt
  ) {
    throw new Error(
      "Prediction Context analyzedAt mismatch.",
    );
  }

  validateTimestamp(
    params.context.createdAt,
    "context.createdAt",
  );

  validateUnitInterval(
    params.context.evidenceStrength,
    "context.evidenceStrength",
  );

  validateUnitInterval(
    params.context.learningConfidence,
    "context.learningConfidence",
  );

  validateUnitInterval(
    params.context.adaptationReadiness,
    "context.adaptationReadiness",
  );

  validateUnitInterval(
    params.context.conflictRisk,
    "context.conflictRisk",
  );
}