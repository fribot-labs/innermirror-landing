import {
    createEmptyRecommendationPredictionEvidence,
} from "./recommendationPredictiveIntelligenceTypes";

import {
    validateRecommendationPredictedStates,
} from "./predictNextRecommendationStates";

import {
    validateRecommendationPredictedStrategies,
} from "./predictNextRecommendationStrategies";

import type {
    PredictRecommendationRuntimeDecisionsParams,
    RecommendationPredictedRuntimeDecision,
    RecommendationPredictedState,
    RecommendationPredictedStrategy,
    RecommendationPredictionCandidateScores,
    RecommendationPredictionContext,
    RecommendationPredictionEvidence,
    RecommendationPredictiveEntryState,
    RecommendationPredictiveRuntimeDecisionType,
    RecommendationPredictiveStrategyType,
} from "./recommendationPredictiveIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_MAXIMUM_CANDIDATE_COUNT =
  4;

const DEFAULT_MINIMUM_PROBABILITY =
  0.05;

const MAXIMUM_CANDIDATE_COUNT =
  9;

const MINIMUM_RAW_SCORE =
  0.0001;

const SCORE_PRECISION =
  10000;

const RECOMMENDATION_PREDICTIVE_RUNTIME_DECISION_TYPES:
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
/* Decision Compatibility                                             */
/* ------------------------------------------------------------------ */

const DECISION_RELATED_STRATEGY_TYPES:
  Readonly<
    Record<
      RecommendationPredictiveRuntimeDecisionType,
      readonly RecommendationPredictiveStrategyType[]
    >
  > = {
    "request-completion-confirmation": [
      "confirm-completion",
      "advance",
      "maintain",
    ],

    "reconsider-current-recommendation": [
      "reconsider",
      "clarify",
    ],

    "reduce-direction-changes": [
      "stabilize",
      "maintain",
      "narrow",
    ],

    "request-progress-evidence": [
      "observe",
      "clarify",
      "maintain",
    ],

    "narrow-current-recommendation": [
      "narrow",
      "clarify",
      "stabilize",
    ],

    "clarify-current-recommendation": [
      "clarify",
      "observe",
      "reconsider",
    ],

    "preserve-current-recommendation": [
      "maintain",
      "stabilize",
      "observe",
    ],

    "allow-new-recommendation": [
      "advance",
      "confirm-completion",
    ],

    "block-new-recommendation": [
      "observe",
      "maintain",
      "clarify",
      "narrow",
      "stabilize",
      "reconsider",
    ],
  };

const DECISION_RELATED_STATE_TYPES:
  Readonly<
    Record<
      RecommendationPredictiveRuntimeDecisionType,
      readonly RecommendationPredictiveEntryState[]
    >
  > = {
    "request-completion-confirmation": [
      "stable",
      "progressing",
      "advancing",
    ],

    "reconsider-current-recommendation": [
      "stalled",
      "fragmented",
      "observing",
    ],

    "reduce-direction-changes": [
      "fragmented",
      "stalled",
      "observing",
      "stable",
    ],

    "request-progress-evidence": [
      "observing",
      "stable",
      "stalled",
    ],

    "narrow-current-recommendation": [
      "fragmented",
      "stalled",
      "observing",
    ],

    "clarify-current-recommendation": [
      "observing",
      "stalled",
      "fragmented",
    ],

    "preserve-current-recommendation": [
      "observing",
      "stable",
      "progressing",
    ],

    "allow-new-recommendation": [
      "stable",
      "progressing",
      "advancing",
    ],

    "block-new-recommendation": [
      "unavailable",
      "observing",
      "stalled",
      "fragmented",
    ],
  };

/* ------------------------------------------------------------------ */
/* Internal Candidate                                                 */
/* ------------------------------------------------------------------ */

type RecommendationRuntimeDecisionPredictionCandidate = {
  decisionType:
    RecommendationPredictiveRuntimeDecisionType;

  relatedStateTypes:
    RecommendationPredictiveEntryState[];

  relatedStrategyTypes:
    RecommendationPredictiveStrategyType[];

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
 * 다음 Runtime Decision 후보를 예측합니다.
 *
 * 사용 근거:
 *
 * - 예측 State 분포
 * - 예측 Strategy 분포
 * - 현재 활성 Runtime Decision
 * - 최근 Runtime Decision 이력
 * - Decision Preference Adjustment
 * - Evidence Requirement 및 Threshold Adjustment
 * - Memory Signal
 * - Conflict Risk
 *
 * 이 함수는 Runtime Decision을 실제로 활성화하지 않습니다.
 */
export function predictRecommendationRuntimeDecisions(
  params:
    PredictRecommendationRuntimeDecisionsParams,
): RecommendationPredictedRuntimeDecision[] {
  validatePredictRecommendationRuntimeDecisionsParams(
    params,
  );

  const maximumCandidateCount =
    params.maximumCandidateCount ??
    DEFAULT_MAXIMUM_CANDIDATE_COUNT;

  const minimumProbability =
    params.minimumProbability ??
    DEFAULT_MINIMUM_PROBABILITY;

  if (
    params.context.currentEntryId ===
      null ||
    params.context.recentEntryIds.length ===
      0
  ) {
    return [];
  }

  const candidates =
    RECOMMENDATION_PREDICTIVE_RUNTIME_DECISION_TYPES.map(
      (
        decisionType,
      ) =>
        createRuntimeDecisionPredictionCandidate({
          decisionType,

          context:
            params.context,

          predictedStates:
            params.predictedStates,

          predictedStrategies:
            params.predictedStrategies,
        }),
    );

  const normalizedCandidates =
    normalizeRuntimeDecisionPredictionCandidates(
      candidates,
    );

  const selectedCandidates =
    selectRuntimeDecisionPredictionCandidates({
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
      ): RecommendationPredictedRuntimeDecision => ({
        id:
          params.createPredictionId(
            candidate.decisionType,
            index,
          ),

        decisionType:
          candidate.decisionType,

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

        relatedStateTypes: [
          ...candidate.relatedStateTypes,
        ],

        relatedStrategyTypes: [
          ...candidate.relatedStrategyTypes,
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

  validateRecommendationPredictedRuntimeDecisions(
    predictions,
  );

  return predictions.map(
    cloneRecommendationPredictedRuntimeDecision,
  );
}

/* ------------------------------------------------------------------ */
/* Candidate Creation                                                 */
/* ------------------------------------------------------------------ */

function createRuntimeDecisionPredictionCandidate(
  params: {
    decisionType:
      RecommendationPredictiveRuntimeDecisionType;

    context:
      RecommendationPredictionContext;

    predictedStates:
      readonly RecommendationPredictedState[];

    predictedStrategies:
      readonly RecommendationPredictedStrategy[];
  },
): RecommendationRuntimeDecisionPredictionCandidate {
  const relatedStateTypes = [
    ...DECISION_RELATED_STATE_TYPES[
      params.decisionType
    ],
  ];

  const relatedStrategyTypes = [
    ...DECISION_RELATED_STRATEGY_TYPES[
      params.decisionType
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
    calculateCurrentDecisionPersistenceScore({
      decisionType:
        params.decisionType,

      context:
        params.context,

      reasoning,
    });

  rawScore +=
    calculateRecentDecisionFrequencyScore({
      decisionType:
        params.decisionType,

      context:
        params.context,

      reasoning,
    });

  rawScore +=
    calculatePredictedStateDecisionScore({
      decisionType:
        params.decisionType,

      relatedStateTypes,

      predictedStates:
        params.predictedStates,

      reasoning,
    });

  rawScore +=
    calculatePredictedStrategyDecisionScore({
      decisionType:
        params.decisionType,

      relatedStrategyTypes,

      predictedStrategies:
        params.predictedStrategies,

      reasoning,
    });

  rawScore +=
    calculateDecisionPreferenceAdjustmentScore({
      decisionType:
        params.decisionType,

      context:
        params.context,

      reasoning,
    });

  rawScore +=
    calculateRuntimeThresholdDecisionBias({
      decisionType:
        params.decisionType,

      context:
        params.context,

      reasoning,
    });

  rawScore +=
    calculateMemorySignalDecisionBias({
      decisionType:
        params.decisionType,

      context:
        params.context,

      reasoning,
    });

  rawScore -=
    calculateDecisionConflictPenalty({
      decisionType:
        params.decisionType,

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
    calculateRuntimeDecisionPredictionConfidence({
      decisionType:
        params.decisionType,

      relatedStateTypes,

      relatedStrategyTypes,

      context:
        params.context,

      predictedStates:
        params.predictedStates,

      predictedStrategies:
        params.predictedStrategies,
    });

  if (
    reasoning.length ===
    0
  ) {
    reasoning.push(
      `The ${params.decisionType} Runtime Decision remains a baseline prediction candidate.`,
    );
  }

  return {
    decisionType:
      params.decisionType,

    relatedStateTypes,

    relatedStrategyTypes,

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
/* Current Decision Persistence                                       */
/* ------------------------------------------------------------------ */

function calculateCurrentDecisionPersistenceScore(
  params: {
    decisionType:
      RecommendationPredictiveRuntimeDecisionType;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  if (
    !params.context.currentRuntimeDecisionTypes.includes(
      params.decisionType,
    )
  ) {
    return 0;
  }

  params.reasoning.push(
    `${params.decisionType} is currently enabled and may persist into the next evaluation.`,
  );

  let score =
    0.16;

  if (
    params.context.recentRuntimeDecisionTypes.includes(
      params.decisionType,
    )
  ) {
    score +=
      0.06;
  }

  if (
    params.decisionType ===
      "request-progress-evidence" &&
    params.context.scoreTrend.progress ===
      "decreasing"
  ) {
    score +=
      0.06;
  }

  if (
    params.decisionType ===
      "preserve-current-recommendation" &&
    params.context.scoreTrend.stability ===
      "increasing"
  ) {
    score +=
      0.08;
  }

  return score;
}

/* ------------------------------------------------------------------ */
/* Recent Decision Frequency                                          */
/* ------------------------------------------------------------------ */

function calculateRecentDecisionFrequencyScore(
  params: {
    decisionType:
      RecommendationPredictiveRuntimeDecisionType;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  if (
    params.context.recentRuntimeDecisionTypes.length ===
      0
  ) {
    return 0;
  }

  const occurrenceCount =
    countOccurrences(
      params.context.recentRuntimeDecisionTypes,
      params.decisionType,
    );

  if (
    occurrenceCount ===
    0
  ) {
    return 0;
  }

  const frequency =
    occurrenceCount /
    params.context.recentRuntimeDecisionTypes.length;

  if (
    frequency >=
    0.3
  ) {
    params.reasoning.push(
      `${params.decisionType} has appeared repeatedly in recent Runtime Decision history.`,
    );
  }

  return frequency *
    0.12;
}

/* ------------------------------------------------------------------ */
/* State Compatibility                                                */
/* ------------------------------------------------------------------ */

function calculatePredictedStateDecisionScore(
  params: {
    decisionType:
      RecommendationPredictiveRuntimeDecisionType;

    relatedStateTypes:
      readonly RecommendationPredictiveEntryState[];

    predictedStates:
      readonly RecommendationPredictedState[];

    reasoning:
      string[];
  },
): number {
  const compatibleProbability =
    params.predictedStates.reduce(
      (
        total,
        prediction,
      ) =>
        params.relatedStateTypes.includes(
          prediction.state,
        )
          ? total +
            prediction.scores.probability
          : total,
      0,
    );

  if (
    compatibleProbability <=
    0
  ) {
    return 0;
  }

  const strongestCompatibleState =
    params.predictedStates.find(
      (
        prediction,
      ) =>
        params.relatedStateTypes.includes(
          prediction.state,
        ),
    );

  if (
    strongestCompatibleState !==
    undefined
  ) {
    params.reasoning.push(
      `${params.decisionType} is compatible with the predicted ${strongestCompatibleState.state} state.`,
    );
  }

  return compatibleProbability *
    0.24;
}

/* ------------------------------------------------------------------ */
/* Strategy Compatibility                                             */
/* ------------------------------------------------------------------ */

function calculatePredictedStrategyDecisionScore(
  params: {
    decisionType:
      RecommendationPredictiveRuntimeDecisionType;

    relatedStrategyTypes:
      readonly RecommendationPredictiveStrategyType[];

    predictedStrategies:
      readonly RecommendationPredictedStrategy[];

    reasoning:
      string[];
  },
): number {
  const compatibleProbability =
    params.predictedStrategies.reduce(
      (
        total,
        prediction,
      ) =>
        params.relatedStrategyTypes.includes(
          prediction.strategyType,
        )
          ? total +
            prediction.scores.probability
          : total,
      0,
    );

  if (
    compatibleProbability <=
    0
  ) {
    return 0;
  }

  const strongestCompatibleStrategy =
    params.predictedStrategies.find(
      (
        prediction,
      ) =>
        params.relatedStrategyTypes.includes(
          prediction.strategyType,
        ),
    );

  if (
    strongestCompatibleStrategy !==
    undefined
  ) {
    params.reasoning.push(
      `${params.decisionType} aligns with the predicted ${strongestCompatibleStrategy.strategyType} strategy.`,
    );
  }

  return compatibleProbability *
    0.32;
}

/* ------------------------------------------------------------------ */
/* Decision Preference Adjustment                                     */
/* ------------------------------------------------------------------ */

function calculateDecisionPreferenceAdjustmentScore(
  params: {
    decisionType:
      RecommendationPredictiveRuntimeDecisionType;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  const adjustment =
    params.context.runtimeAdjustment
      .decisionPreferenceAdjustments[
        params.decisionType
      ] ??
    0;

  if (
    adjustment >
    0
  ) {
    params.reasoning.push(
      `Adaptive Learning increases preference for ${params.decisionType}.`,
    );

    return adjustment *
      0.24;
  }

  if (
    adjustment <
    0
  ) {
    params.reasoning.push(
      `Adaptive Learning reduces preference for ${params.decisionType}.`,
    );

    return adjustment *
      0.16;
  }

  return 0;
}

/* ------------------------------------------------------------------ */
/* Runtime Threshold Bias                                             */
/* ------------------------------------------------------------------ */

function calculateRuntimeThresholdDecisionBias(
  params: {
    decisionType:
      RecommendationPredictiveRuntimeDecisionType;

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

  switch (
    params.decisionType
  ) {
    case "request-progress-evidence": {
      score +=
        positiveChange(
          adjustment.evidenceRequirementAdjustment,
        ) *
        0.18;

      if (
        adjustment.evidenceRequirementAdjustment >
        0
      ) {
        params.reasoning.push(
          "The Runtime currently requires stronger progress evidence.",
        );
      }

      break;
    }

    case "block-new-recommendation": {
      score +=
        positiveChange(
          adjustment.newRecommendationThresholdAdjustment,
        ) *
        0.16;

      score +=
        positiveChange(
          adjustment.evidenceRequirementAdjustment,
        ) *
        0.1;

      break;
    }

    case "allow-new-recommendation": {
      score +=
        negativeChangeMagnitude(
          adjustment.newRecommendationThresholdAdjustment,
        ) *
        0.18;

      score -=
        positiveChange(
          adjustment.evidenceRequirementAdjustment,
        ) *
        0.08;

      break;
    }

    case "reduce-direction-changes": {
      score +=
        positiveChange(
          adjustment.stabilizationPreferenceAdjustment,
        ) *
        0.16;

      score +=
        positiveChange(
          adjustment.redirectionThresholdAdjustment,
        ) *
        0.08;

      break;
    }

    case "reconsider-current-recommendation": {
      score +=
        positiveChange(
          adjustment.recoveryPreferenceAdjustment,
        ) *
        0.16;

      score +=
        negativeChangeMagnitude(
          adjustment.redirectionThresholdAdjustment,
        ) *
        0.12;

      break;
    }

    case "preserve-current-recommendation": {
      score +=
        positiveChange(
          adjustment.stabilizationPreferenceAdjustment,
        ) *
        0.14;

      break;
    }

    case "request-completion-confirmation": {
      score +=
        negativeChangeMagnitude(
          adjustment.newRecommendationThresholdAdjustment,
        ) *
        0.08;

      break;
    }

    case "narrow-current-recommendation":
    case "clarify-current-recommendation": {
      score +=
        positiveChange(
          adjustment.evidenceRequirementAdjustment,
        ) *
        0.08;

      score +=
        positiveChange(
          adjustment.recoveryPreferenceAdjustment,
        ) *
        0.08;

      break;
    }
  }

  return score *
    averageNumbers([
      params.context.learningConfidence,
      params.context.adaptationReadiness,
    ]);
}

/* ------------------------------------------------------------------ */
/* Memory Signal Bias                                                 */
/* ------------------------------------------------------------------ */

function calculateMemorySignalDecisionBias(
  params: {
    decisionType:
      RecommendationPredictiveRuntimeDecisionType;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  switch (
    params.decisionType
  ) {
    case "request-completion-confirmation": {
      if (
        hasMemorySignal(
          params.context,
          "long-term-advancement",
        )
      ) {
        params.reasoning.push(
          "Long-term advancement supports completion confirmation.",
        );

        return 0.2;
      }

      return 0;
    }

    case "reconsider-current-recommendation": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "persistent-stall",
            "confidence-degradation",
            "strategy-oscillation",
          ],
        )
      ) {
        params.reasoning.push(
          "Persistent stall or degraded confidence supports reconsideration.",
        );

        return 0.22;
      }

      return 0;
    }

    case "reduce-direction-changes": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "strategy-oscillation",
            "state-oscillation",
            "persistent-fragmentation",
          ],
        )
      ) {
        params.reasoning.push(
          "Oscillation or fragmentation supports reducing direction changes.",
        );

        return 0.24;
      }

      return 0;
    }

    case "request-progress-evidence": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "persistent-observation",
            "persistent-stall",
            "insufficient-memory",
          ],
        )
      ) {
        params.reasoning.push(
          "The current Memory pattern supports requesting stronger progress evidence.",
        );

        return 0.2;
      }

      return 0;
    }

    case "narrow-current-recommendation": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "persistent-fragmentation",
            "state-oscillation",
          ],
        )
      ) {
        params.reasoning.push(
          "Fragmentation supports narrowing the current Recommendation.",
        );

        return 0.2;
      }

      return 0;
    }

    case "clarify-current-recommendation": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "persistent-observation",
            "strategy-oscillation",
            "confidence-degradation",
          ],
        )
      ) {
        params.reasoning.push(
          "Observation pressure or uncertainty supports clarification.",
        );

        return 0.18;
      }

      return 0;
    }

    case "preserve-current-recommendation": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "persistent-stability",
            "risk-reduction",
            "long-term-progression",
          ],
        )
      ) {
        params.reasoning.push(
          "Long-term stability supports preserving the current Recommendation.",
        );

        return 0.22;
      }

      return 0;
    }

    case "allow-new-recommendation": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "long-term-progression",
            "long-term-advancement",
          ],
        )
      ) {
        params.reasoning.push(
          "Long-term progression supports allowing a new Recommendation.",
        );

        return 0.22;
      }

      if (
        hasMemorySignal(
          params.context,
          "risk-accumulation",
        )
      ) {
        return -0.12;
      }

      return 0;
    }

    case "block-new-recommendation": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "insufficient-memory",
            "persistent-stall",
            "persistent-fragmentation",
            "risk-accumulation",
          ],
        )
      ) {
        params.reasoning.push(
          "Insufficient or unstable evidence supports blocking a new Recommendation.",
        );

        return 0.22;
      }

      return 0;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Conflict Penalty                                                   */
/* ------------------------------------------------------------------ */

function calculateDecisionConflictPenalty(
  params: {
    decisionType:
      RecommendationPredictiveRuntimeDecisionType;

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

  let penalty =
    params.context.conflictRisk *
    0.08;

  penalty +=
    Math.min(
      0.08,
      params.context
        .conflictedAdaptationRuleIds.length *
      0.02,
    );

  /**
   * 보수적인 Decision은 충돌 상황에서도 필요할 수 있으므로
   * 패널티를 절반만 적용합니다.
   */
  if (
    params.decisionType ===
      "request-progress-evidence" ||
    params.decisionType ===
      "block-new-recommendation" ||
    params.decisionType ===
      "clarify-current-recommendation"
  ) {
    penalty *=
      0.5;
  }

  if (
    params.context.conflictRisk >=
    0.5
  ) {
    params.reasoning.push(
      "Conflicting adaptive evidence reduces Runtime Decision certainty.",
    );
  }

  return penalty;
}

/* ------------------------------------------------------------------ */
/* Confidence                                                         */
/* ------------------------------------------------------------------ */

function calculateRuntimeDecisionPredictionConfidence(
  params: {
    decisionType:
      RecommendationPredictiveRuntimeDecisionType;

    relatedStateTypes:
      readonly RecommendationPredictiveEntryState[];

    relatedStrategyTypes:
      readonly RecommendationPredictiveStrategyType[];

    context:
      RecommendationPredictionContext;

    predictedStates:
      readonly RecommendationPredictedState[];

    predictedStrategies:
      readonly RecommendationPredictedStrategy[];
  },
): number {
  const stateEvidence =
    params.predictedStates.reduce(
      (
        total,
        prediction,
      ) =>
        params.relatedStateTypes.includes(
          prediction.state,
        )
          ? total +
            prediction.scores.probability *
            prediction.scores.confidence
          : total,
      0,
    );

  const strategyEvidence =
    params.predictedStrategies.reduce(
      (
        total,
        prediction,
      ) =>
        params.relatedStrategyTypes.includes(
          prediction.strategyType,
        )
          ? total +
            prediction.scores.probability *
            prediction.scores.confidence
          : total,
      0,
    );

  const historyEvidence =
    params.context.recentRuntimeDecisionTypes.includes(
      params.decisionType,
    )
      ? 1
      : 0;

  const adaptiveEvidence =
    averageNumbers([
      params.context.evidenceStrength,
      params.context.learningConfidence,
      params.context.adaptationReadiness,
    ]);

  const decisionAdjustmentEvidence =
    clampUnitInterval(
      Math.abs(
        params.context.runtimeAdjustment
          .decisionPreferenceAdjustments[
            params.decisionType
          ] ??
        0,
      ),
    );

  const confidence =
    stateEvidence *
      0.25 +
    strategyEvidence *
      0.3 +
    historyEvidence *
      0.12 +
    adaptiveEvidence *
      0.25 +
    decisionAdjustmentEvidence *
      0.08;

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

function normalizeRuntimeDecisionPredictionCandidates(
  candidates:
    readonly RecommendationRuntimeDecisionPredictionCandidate[],
): RecommendationRuntimeDecisionPredictionCandidate[] {
  if (
    candidates.length ===
    0
  ) {
    return [];
  }

  const totalRawScore =
    candidates.reduce(
      (
        total,
        candidate,
      ) =>
        total +
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
        ...cloneRuntimeDecisionPredictionCandidate(
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
      ...cloneRuntimeDecisionPredictionCandidate(
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
/* Selection                                                          */
/* ------------------------------------------------------------------ */

function selectRuntimeDecisionPredictionCandidates(
  params: {
    candidates:
      readonly RecommendationRuntimeDecisionPredictionCandidate[];

    maximumCandidateCount:
      number;

    minimumProbability:
      number;
  },
): RecommendationRuntimeDecisionPredictionCandidate[] {
  const sorted =
    [...params.candidates].sort(
      compareRuntimeDecisionPredictionCandidates,
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

  return renormalizeSelectedRuntimeDecisionCandidates(
    selected,
  );
}

function renormalizeSelectedRuntimeDecisionCandidates(
  candidates:
    readonly RecommendationRuntimeDecisionPredictionCandidate[],
): RecommendationRuntimeDecisionPredictionCandidate[] {
  if (
    candidates.length ===
    0
  ) {
    return [];
  }

  const totalProbability =
    candidates.reduce(
      (
        total,
        candidate,
      ) =>
        total +
        candidate.probability,
      0,
    );

  if (
    totalProbability <=
    0
  ) {
    const uniformProbability =
      1 /
      candidates.length;

    return candidates.map(
      (
        candidate,
      ) => ({
        ...cloneRuntimeDecisionPredictionCandidate(
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
      ...cloneRuntimeDecisionPredictionCandidate(
        candidate,
      ),

      probability:
        candidate.probability /
        totalProbability,
    }),
  );
}

function compareRuntimeDecisionPredictionCandidates(
  left:
    RecommendationRuntimeDecisionPredictionCandidate,
  right:
    RecommendationRuntimeDecisionPredictionCandidate,
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

  return getRuntimeDecisionOrder(
    left.decisionType,
  ) -
    getRuntimeDecisionOrder(
      right.decisionType,
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

export function cloneRecommendationPredictedRuntimeDecision(
  prediction:
    RecommendationPredictedRuntimeDecision,
): RecommendationPredictedRuntimeDecision {
  return {
    ...prediction,

    scores: {
      ...prediction.scores,
    },

    relatedStateTypes: [
      ...prediction.relatedStateTypes,
    ],

    relatedStrategyTypes: [
      ...prediction.relatedStrategyTypes,
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

function cloneRuntimeDecisionPredictionCandidate(
  candidate:
    RecommendationRuntimeDecisionPredictionCandidate,
): RecommendationRuntimeDecisionPredictionCandidate {
  return {
    ...candidate,

    relatedStateTypes: [
      ...candidate.relatedStateTypes,
    ],

    relatedStrategyTypes: [
      ...candidate.relatedStrategyTypes,
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

export function getRecommendationRuntimeDecisionPredictionProbability(
  predictions:
    readonly RecommendationPredictedRuntimeDecision[],
  decisionType:
    RecommendationPredictiveRuntimeDecisionType,
): number {
  return (
    predictions.find(
      (
        prediction,
      ) =>
        prediction.decisionType ===
        decisionType,
    )?.scores.probability ??
    0
  );
}

export function hasRecommendationRuntimeDecisionPrediction(
  predictions:
    readonly RecommendationPredictedRuntimeDecision[],
  decisionType:
    RecommendationPredictiveRuntimeDecisionType,
): boolean {
  return predictions.some(
    (
      prediction,
    ) =>
      prediction.decisionType ===
      decisionType,
  );
}

export function summarizeRecommendationRuntimeDecisionPredictions(
  predictions:
    readonly RecommendationPredictedRuntimeDecision[],
): string {
  if (
    predictions.length ===
    0
  ) {
    return "No Runtime Decision prediction is currently available.";
  }

  return predictions
    .map(
      (
        prediction,
      ) =>
        `${prediction.decisionType}: ${roundScore(
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

export function validateRecommendationPredictedRuntimeDecision(
  prediction:
    RecommendationPredictedRuntimeDecision,
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
      "Recommendation Runtime Decision Prediction must be an object.",
    );
  }

  validateRequiredIdentifier(
    prediction.id,
    "prediction.id",
  );

  if (
    !isRecommendationPredictiveRuntimeDecisionType(
      prediction.decisionType,
    )
  ) {
    throw new Error(
      "Recommendation Runtime Decision Prediction decisionType is invalid.",
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
    prediction.relatedStateTypes,
    "prediction.relatedStateTypes",
  );

  validateUniqueStrategyArray(
    prediction.relatedStrategyTypes,
    "prediction.relatedStrategyTypes",
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

export function validateRecommendationPredictedRuntimeDecisions(
  predictions:
    readonly RecommendationPredictedRuntimeDecision[],
): void {
  if (
    !Array.isArray(
      predictions,
    )
  ) {
    throw new Error(
      "Recommendation Runtime Decision Predictions must be an array.",
    );
  }

  const observedIds =
    new Set<string>();

  const observedDecisionTypes =
    new Set<
      RecommendationPredictiveRuntimeDecisionType
    >();

  predictions.forEach(
    (
      prediction,
      index,
    ) => {
      validateRecommendationPredictedRuntimeDecision(
        prediction,
      );

      if (
        observedIds.has(
          prediction.id,
        )
      ) {
        throw new Error(
          `Runtime Decision Prediction id must be unique: ${prediction.id}.`,
        );
      }

      if (
        observedDecisionTypes.has(
          prediction.decisionType,
        )
      ) {
        throw new Error(
          `Runtime Decision Prediction type must be unique: ${prediction.decisionType}.`,
        );
      }

      if (
        prediction.rank !==
        index +
        1
      ) {
        throw new Error(
          "Runtime Decision Prediction ranks must be sequential.",
        );
      }

      observedIds.add(
        prediction.id,
      );

      observedDecisionTypes.add(
        prediction.decisionType,
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
          total,
          prediction,
        ) =>
          total +
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
        "Runtime Decision Prediction probabilities must sum to 1.",
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validatePredictRecommendationRuntimeDecisionsParams(
  params:
    PredictRecommendationRuntimeDecisionsParams,
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
      "Predict Recommendation Runtime Decisions params must be an object.",
    );
  }

  validateRuntimeDecisionPredictionContextConsistency({
    context:
      params.context,

    adaptiveLearningAnalysis:
      params.adaptiveLearningAnalysis,
  });

  validateRecommendationPredictedStates(
    params.predictedStates,
  );

  validateRecommendationPredictedStrategies(
    params.predictedStrategies,
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

  validatePredictionTimestamps(
    params,
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

function validateRuntimeDecisionPredictionContextConsistency(
  params: {
    context:
      RecommendationPredictionContext;

    adaptiveLearningAnalysis:
      PredictRecommendationRuntimeDecisionsParams[
        "adaptiveLearningAnalysis"
      ];
  },
): void {
  if (
    params.context.memoryId !==
    params.adaptiveLearningAnalysis.memoryId
  ) {
    throw new Error(
      "Runtime Decision Prediction Context memoryId must match Adaptive Learning memoryId.",
    );
  }

  if (
    params.context.historyId !==
    params.adaptiveLearningAnalysis.historyId
  ) {
    throw new Error(
      "Runtime Decision Prediction Context historyId must match Adaptive Learning historyId.",
    );
  }

  if (
    params.context.sourceAdaptiveLearningAnalyzedAt !==
    params.adaptiveLearningAnalysis.analyzedAt
  ) {
    throw new Error(
      "Runtime Decision Prediction Context analyzedAt is inconsistent.",
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

function validatePredictionTimestamps(
  params:
    PredictRecommendationRuntimeDecisionsParams,
): void {
  params.predictedStates.forEach(
    (
      prediction,
    ) => {
      if (
        prediction.predictedAt !==
        params.predictedAt
      ) {
        throw new Error(
          "State and Runtime Decision Predictions must use the same predictedAt timestamp.",
        );
      }
    },
  );

  params.predictedStrategies.forEach(
    (
      prediction,
    ) => {
      if (
        prediction.predictedAt !==
        params.predictedAt
      ) {
        throw new Error(
          "Strategy and Runtime Decision Predictions must use the same predictedAt timestamp.",
        );
      }
    },
  );
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

/* ------------------------------------------------------------------ */
/* Type Guards                                                        */
/* ------------------------------------------------------------------ */

function isRecommendationPredictiveRuntimeDecisionType(
  value:
    unknown,
): value is RecommendationPredictiveRuntimeDecisionType {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_PREDICTIVE_RUNTIME_DECISION_TYPES.includes(
      value as RecommendationPredictiveRuntimeDecisionType,
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

function isRecommendationPredictiveStrategyType(
  value:
    unknown,
): value is RecommendationPredictiveStrategyType {
  return (
    value ===
      "observe" ||
    value ===
      "maintain" ||
    value ===
      "clarify" ||
    value ===
      "narrow" ||
    value ===
      "confirm-completion" ||
    value ===
      "advance" ||
    value ===
      "stabilize" ||
    value ===
      "reconsider"
  );
}

/* ------------------------------------------------------------------ */
/* Array Validation                                                   */
/* ------------------------------------------------------------------ */

function validateUniqueStateArray(
  values:
    readonly RecommendationPredictiveEntryState[],
  fieldName:
    string,
): void {
  validateUniqueTypedStringArray(
    values,
    fieldName,
    isRecommendationPredictiveEntryState,
  );
}

function validateUniqueStrategyArray(
  values:
    readonly RecommendationPredictiveStrategyType[],
  fieldName:
    string,
): void {
  validateUniqueTypedStringArray(
    values,
    fieldName,
    isRecommendationPredictiveStrategyType,
  );
}

function validateUniqueTypedStringArray<
  TValue extends string,
>(
  values:
    readonly TValue[],
  fieldName:
    string,
  guard:
    (
      value:
        unknown,
    ) => value is TValue,
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
    new Set<TValue>();

  values.forEach(
    (
      value,
      index,
    ) => {
      if (
        !guard(
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
          `${fieldName} must not contain duplicate value: ${value}.`,
        );
      }

      observed.add(
        value,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Memory Signal Helpers                                              */
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

function hasAnyMemorySignal(
  context:
    RecommendationPredictionContext,
  signalTypes:
    readonly RecommendationPredictionContext[
      "currentMemorySignalTypes"
    ][number][],
): boolean {
  return signalTypes.some(
    (
      signalType,
    ) =>
      hasMemorySignal(
        context,
        signalType,
      ),
  );
}

/* ------------------------------------------------------------------ */
/* Order                                                              */
/* ------------------------------------------------------------------ */

function getRuntimeDecisionOrder(
  decisionType:
    RecommendationPredictiveRuntimeDecisionType,
): number {
  return RECOMMENDATION_PREDICTIVE_RUNTIME_DECISION_TYPES.indexOf(
    decisionType,
  );
}

/* ------------------------------------------------------------------ */
/* Generic Helpers                                                    */
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
      total,
      value,
    ) =>
      total +
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