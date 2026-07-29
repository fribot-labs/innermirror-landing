import {
    createEmptyRecommendationPredictionEvidence,
    isRecommendationPredictionRiskType,
    isRecommendationPredictionSeverity,
} from "./recommendationPredictiveIntelligenceTypes";

import {
    validateRecommendationPredictedStates,
} from "./predictNextRecommendationStates";

import {
    validateRecommendationPredictedStrategies,
} from "./predictNextRecommendationStrategies";

import {
    validateRecommendationPredictedRuntimeDecisions,
} from "./predictRuntimeDecisions";

import type {
    PredictRecommendationRisksParams,
    RecommendationPredictedRisk,
    RecommendationPredictedRuntimeDecision,
    RecommendationPredictedState,
    RecommendationPredictedStrategy,
    RecommendationPredictionCandidateScores,
    RecommendationPredictionContext,
    RecommendationPredictionEvidence,
    RecommendationPredictionRiskType,
    RecommendationPredictionSeverity,
    RecommendationPredictiveEntryState,
    RecommendationPredictiveRuntimeDecisionType,
    RecommendationPredictiveStrategyType,
} from "./recommendationPredictiveIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_MINIMUM_PROBABILITY =
  0.05;

const MINIMUM_RAW_SCORE =
  0.0001;

const SCORE_PRECISION =
  10000;

const MAXIMUM_RISK_COUNT =
  10;

const RECOMMENDATION_PREDICTION_RISK_TYPES:
  readonly RecommendationPredictionRiskType[] = [
    "premature-advance-risk",
    "persistent-observation-risk",
    "stagnation-risk",
    "fragmentation-risk",
    "strategy-oscillation-risk",
    "state-oscillation-risk",
    "redirection-risk",
    "confidence-degradation-risk",
    "completion-failure-risk",
    "adaptation-conflict-risk",
  ];

/* ------------------------------------------------------------------ */
/* Risk Compatibility                                                 */
/* ------------------------------------------------------------------ */

const RISK_RELATED_STATE_TYPES:
  Readonly<
    Record<
      RecommendationPredictionRiskType,
      readonly RecommendationPredictiveEntryState[]
    >
  > = {
    "premature-advance-risk": [
      "progressing",
      "advancing",
      "stable",
    ],

    "persistent-observation-risk": [
      "observing",
      "stalled",
    ],

    "stagnation-risk": [
      "observing",
      "stalled",
      "stable",
    ],

    "fragmentation-risk": [
      "fragmented",
      "stalled",
      "observing",
    ],

    "strategy-oscillation-risk": [
      "observing",
      "stalled",
      "fragmented",
    ],

    "state-oscillation-risk": [
      "observing",
      "stalled",
      "fragmented",
    ],

    "redirection-risk": [
      "fragmented",
      "stalled",
      "observing",
    ],

    "confidence-degradation-risk": [
      "stalled",
      "fragmented",
      "observing",
    ],

    "completion-failure-risk": [
      "advancing",
      "progressing",
      "stalled",
    ],

    "adaptation-conflict-risk": [
      "unavailable",
      "observing",
      "stable",
      "progressing",
      "stalled",
      "fragmented",
      "advancing",
    ],
  };

const RISK_RELATED_STRATEGY_TYPES:
  Readonly<
    Record<
      RecommendationPredictionRiskType,
      readonly RecommendationPredictiveStrategyType[]
    >
  > = {
    "premature-advance-risk": [
      "advance",
      "confirm-completion",
    ],

    "persistent-observation-risk": [
      "observe",
      "maintain",
    ],

    "stagnation-risk": [
      "observe",
      "maintain",
      "clarify",
    ],

    "fragmentation-risk": [
      "clarify",
      "narrow",
      "reconsider",
    ],

    "strategy-oscillation-risk": [
      "clarify",
      "narrow",
      "stabilize",
      "reconsider",
    ],

    "state-oscillation-risk": [
      "maintain",
      "clarify",
      "stabilize",
      "reconsider",
    ],

    "redirection-risk": [
      "reconsider",
      "clarify",
      "narrow",
    ],

    "confidence-degradation-risk": [
      "observe",
      "clarify",
      "reconsider",
    ],

    "completion-failure-risk": [
      "advance",
      "confirm-completion",
      "maintain",
    ],

    "adaptation-conflict-risk": [
      "observe",
      "maintain",
      "clarify",
      "narrow",
      "confirm-completion",
      "advance",
      "stabilize",
      "reconsider",
    ],
  };

const RISK_RELATED_DECISION_TYPES:
  Readonly<
    Record<
      RecommendationPredictionRiskType,
      readonly RecommendationPredictiveRuntimeDecisionType[]
    >
  > = {
    "premature-advance-risk": [
      "allow-new-recommendation",
      "request-completion-confirmation",
    ],

    "persistent-observation-risk": [
      "request-progress-evidence",
      "preserve-current-recommendation",
      "block-new-recommendation",
    ],

    "stagnation-risk": [
      "preserve-current-recommendation",
      "request-progress-evidence",
      "block-new-recommendation",
    ],

    "fragmentation-risk": [
      "reduce-direction-changes",
      "narrow-current-recommendation",
      "clarify-current-recommendation",
      "reconsider-current-recommendation",
    ],

    "strategy-oscillation-risk": [
      "reduce-direction-changes",
      "clarify-current-recommendation",
      "reconsider-current-recommendation",
    ],

    "state-oscillation-risk": [
      "reduce-direction-changes",
      "preserve-current-recommendation",
      "reconsider-current-recommendation",
    ],

    "redirection-risk": [
      "reconsider-current-recommendation",
      "reduce-direction-changes",
      "narrow-current-recommendation",
    ],

    "confidence-degradation-risk": [
      "request-progress-evidence",
      "clarify-current-recommendation",
      "block-new-recommendation",
    ],

    "completion-failure-risk": [
      "request-completion-confirmation",
      "allow-new-recommendation",
      "block-new-recommendation",
    ],

    "adaptation-conflict-risk": [
      "request-completion-confirmation",
      "reconsider-current-recommendation",
      "reduce-direction-changes",
      "request-progress-evidence",
      "narrow-current-recommendation",
      "clarify-current-recommendation",
      "preserve-current-recommendation",
      "allow-new-recommendation",
      "block-new-recommendation",
    ],
  };

/* ------------------------------------------------------------------ */
/* Internal Candidate                                                 */
/* ------------------------------------------------------------------ */

type RecommendationRiskPredictionCandidate = {
  type:
    RecommendationPredictionRiskType;

  severity:
    RecommendationPredictionSeverity;

  relatedStateTypes:
    RecommendationPredictiveEntryState[];

  relatedStrategyTypes:
    RecommendationPredictiveStrategyType[];

  relatedDecisionTypes:
    RecommendationPredictiveRuntimeDecisionType[];

  rawScore:
    number;

  probability:
    number;

  confidence:
    number;

  description:
    string;

  reasoning:
    string[];

  evidence:
    RecommendationPredictionEvidence;
};

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * 다음 Recommendation 흐름에서 발생할 가능성이 있는 위험을
 * 예측합니다.
 *
 * 사용 근거:
 *
 * - State Prediction
 * - Strategy Prediction
 * - Runtime Decision Prediction
 * - Score Trend
 * - Memory Signal
 * - Runtime Adjustment
 * - Adaptive Learning Confidence
 * - Conflict Risk
 *
 * 반환값은 위험 가능성에 대한 예측이며 Runtime 동작을 직접
 * 변경하지 않습니다.
 */
export function predictRecommendationRisks(
  params:
    PredictRecommendationRisksParams,
): RecommendationPredictedRisk[] {
  validatePredictRecommendationRisksParams(
    params,
  );

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
    RECOMMENDATION_PREDICTION_RISK_TYPES.map(
      (
        type,
      ) =>
        createRecommendationRiskPredictionCandidate({
          type,

          context:
            params.context,

          predictedStates:
            params.predictedStates,

          predictedStrategies:
            params.predictedStrategies,

          predictedRuntimeDecisions:
            params.predictedRuntimeDecisions,
        }),
    );

  const normalizedCandidates =
    normalizeRecommendationRiskCandidates(
      candidates,
    );

  const selectedCandidates =
    selectRecommendationRiskCandidates({
      candidates:
        normalizedCandidates,

      minimumProbability,
    });

  const predictions =
    selectedCandidates.map(
      (
        candidate,
        index,
      ): RecommendationPredictedRisk => ({
        id:
          params.createPredictionId(
            candidate.type,
            index,
          ),

        type:
          candidate.type,

        severity:
          candidate.severity,

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

        description:
          candidate.description,

        relatedStateTypes: [
          ...candidate.relatedStateTypes,
        ],

        relatedStrategyTypes: [
          ...candidate.relatedStrategyTypes,
        ],

        relatedDecisionTypes: [
          ...candidate.relatedDecisionTypes,
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

  validateRecommendationPredictedRisks(
    predictions,
  );

  return predictions.map(
    cloneRecommendationPredictedRisk,
  );
}

/* ------------------------------------------------------------------ */
/* Candidate Creation                                                 */
/* ------------------------------------------------------------------ */

function createRecommendationRiskPredictionCandidate(
  params: {
    type:
      RecommendationPredictionRiskType;

    context:
      RecommendationPredictionContext;

    predictedStates:
      readonly RecommendationPredictedState[];

    predictedStrategies:
      readonly RecommendationPredictedStrategy[];

    predictedRuntimeDecisions:
      readonly RecommendationPredictedRuntimeDecision[];
  },
): RecommendationRiskPredictionCandidate {
  const relatedStateTypes = [
    ...RISK_RELATED_STATE_TYPES[
      params.type
    ],
  ];

  const relatedStrategyTypes = [
    ...RISK_RELATED_STRATEGY_TYPES[
      params.type
    ],
  ];

  const relatedDecisionTypes = [
    ...RISK_RELATED_DECISION_TYPES[
      params.type
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
    0.05;

  rawScore +=
    calculatePredictedStateRiskScore({
      type:
        params.type,

      relatedStateTypes,

      predictedStates:
        params.predictedStates,

      reasoning,
    });

  rawScore +=
    calculatePredictedStrategyRiskScore({
      type:
        params.type,

      relatedStrategyTypes,

      predictedStrategies:
        params.predictedStrategies,

      reasoning,
    });

  rawScore +=
    calculatePredictedDecisionRiskScore({
      type:
        params.type,

      relatedDecisionTypes,

      predictedRuntimeDecisions:
        params.predictedRuntimeDecisions,

      reasoning,
    });

  rawScore +=
    calculateRiskTrendScore({
      type:
        params.type,

      context:
        params.context,

      reasoning,
    });

  rawScore +=
    calculateRiskMemorySignalScore({
      type:
        params.type,

      context:
        params.context,

      reasoning,
    });

  rawScore +=
    calculateRiskRuntimeAdjustmentScore({
      type:
        params.type,

      context:
        params.context,

      reasoning,
    });

  rawScore +=
    calculateRiskConflictScore({
      type:
        params.type,

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
    calculateRecommendationRiskConfidence({
      type:
        params.type,

      relatedStateTypes,

      relatedStrategyTypes,

      relatedDecisionTypes,

      context:
        params.context,

      predictedStates:
        params.predictedStates,

      predictedStrategies:
        params.predictedStrategies,

      predictedRuntimeDecisions:
        params.predictedRuntimeDecisions,
    });

  const severity =
    resolveRecommendationRiskSeverity(
      rawScore,
      confidence,
    );

  if (
    reasoning.length ===
    0
  ) {
    reasoning.push(
      `The ${params.type} signal remains a low-evidence risk candidate.`,
    );
  }

  return {
    type:
      params.type,

    severity,

    relatedStateTypes,

    relatedStrategyTypes,

    relatedDecisionTypes,

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

    description:
      createRecommendationRiskDescription(
        params.type,
        severity,
      ),

    reasoning:
      uniqueStrings(
        reasoning,
      ),

    evidence,
  };
}

/* ------------------------------------------------------------------ */
/* State Risk Score                                                   */
/* ------------------------------------------------------------------ */

function calculatePredictedStateRiskScore(
  params: {
    type:
      RecommendationPredictionRiskType;

    relatedStateTypes:
      readonly RecommendationPredictiveEntryState[];

    predictedStates:
      readonly RecommendationPredictedState[];

    reasoning:
      string[];
  },
): number {
  const relatedProbability =
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
    relatedProbability <=
    0
  ) {
    return 0;
  }

  const strongestState =
    params.predictedStates.find(
      (
        prediction,
      ) =>
        params.relatedStateTypes.includes(
          prediction.state,
        ),
    );

  if (
    strongestState !==
    undefined
  ) {
    params.reasoning.push(
      `The predicted ${strongestState.state} state contributes to ${params.type}.`,
    );
  }

  return relatedProbability *
    0.2;
}

/* ------------------------------------------------------------------ */
/* Strategy Risk Score                                                */
/* ------------------------------------------------------------------ */

function calculatePredictedStrategyRiskScore(
  params: {
    type:
      RecommendationPredictionRiskType;

    relatedStrategyTypes:
      readonly RecommendationPredictiveStrategyType[];

    predictedStrategies:
      readonly RecommendationPredictedStrategy[];

    reasoning:
      string[];
  },
): number {
  const relatedProbability =
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
    relatedProbability <=
    0
  ) {
    return 0;
  }

  const strongestStrategy =
    params.predictedStrategies.find(
      (
        prediction,
      ) =>
        params.relatedStrategyTypes.includes(
          prediction.strategyType,
        ),
    );

  if (
    strongestStrategy !==
    undefined
  ) {
    params.reasoning.push(
      `The predicted ${strongestStrategy.strategyType} strategy contributes to ${params.type}.`,
    );
  }

  return relatedProbability *
    0.18;
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Risk Score                                        */
/* ------------------------------------------------------------------ */

function calculatePredictedDecisionRiskScore(
  params: {
    type:
      RecommendationPredictionRiskType;

    relatedDecisionTypes:
      readonly RecommendationPredictiveRuntimeDecisionType[];

    predictedRuntimeDecisions:
      readonly RecommendationPredictedRuntimeDecision[];

    reasoning:
      string[];
  },
): number {
  const relatedProbability =
    params.predictedRuntimeDecisions.reduce(
      (
        total,
        prediction,
      ) =>
        params.relatedDecisionTypes.includes(
          prediction.decisionType,
        )
          ? total +
            prediction.scores.probability
          : total,
      0,
    );

  if (
    relatedProbability <=
    0
  ) {
    return 0;
  }

  const strongestDecision =
    params.predictedRuntimeDecisions.find(
      (
        prediction,
      ) =>
        params.relatedDecisionTypes.includes(
          prediction.decisionType,
        ),
    );

  if (
    strongestDecision !==
    undefined
  ) {
    params.reasoning.push(
      `The predicted ${strongestDecision.decisionType} Runtime Decision contributes to ${params.type}.`,
    );
  }

  return relatedProbability *
    0.18;
}

/* ------------------------------------------------------------------ */
/* Trend Score                                                        */
/* ------------------------------------------------------------------ */

function calculateRiskTrendScore(
  params: {
    type:
      RecommendationPredictionRiskType;

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
    params.type
  ) {
    case "premature-advance-risk": {
      score +=
        negativeChangeMagnitude(
          scoreTrend.progressChange,
        ) *
        0.18;

      score +=
        negativeChangeMagnitude(
          scoreTrend.completionMomentumChange,
        ) *
        0.22;

      score +=
        positiveChange(
          scoreTrend.redirectionRiskChange,
        ) *
        0.1;

      if (
        scoreTrend.completionMomentum ===
        "decreasing"
      ) {
        params.reasoning.push(
          "Completion momentum is decreasing while advancement remains possible.",
        );
      }

      break;
    }

    case "persistent-observation-risk": {
      score +=
        stableOrUnknownDirectionScore(
          scoreTrend.progress,
        ) *
        0.08;

      score +=
        positiveChange(
          scoreTrend.repetitionRiskChange,
        ) *
        0.18;

      if (
        scoreTrend.progress ===
        "stable" &&
        scoreTrend.repetitionRisk ===
        "increasing"
      ) {
        params.reasoning.push(
          "Progress remains flat while repetition risk increases.",
        );
      }

      break;
    }

    case "stagnation-risk": {
      score +=
        negativeChangeMagnitude(
          scoreTrend.progressChange,
        ) *
        0.22;

      score +=
        negativeChangeMagnitude(
          scoreTrend.completionMomentumChange,
        ) *
        0.14;

      score +=
        positiveChange(
          scoreTrend.repetitionRiskChange,
        ) *
        0.14;

      if (
        scoreTrend.progress ===
        "decreasing"
      ) {
        params.reasoning.push(
          "Declining progress increases stagnation risk.",
        );
      }

      break;
    }

    case "fragmentation-risk": {
      score +=
        negativeChangeMagnitude(
          scoreTrend.stabilityChange,
        ) *
        0.18;

      score +=
        positiveChange(
          scoreTrend.redirectionRiskChange,
        ) *
        0.22;

      score +=
        positiveChange(
          scoreTrend.repetitionRiskChange,
        ) *
        0.08;

      if (
        scoreTrend.redirectionRisk ===
        "increasing"
      ) {
        params.reasoning.push(
          "Increasing redirection pressure raises fragmentation risk.",
        );
      }

      break;
    }

    case "strategy-oscillation-risk": {
      score +=
        positiveChange(
          scoreTrend.redirectionRiskChange,
        ) *
        0.14;

      score +=
        negativeChangeMagnitude(
          scoreTrend.stabilityChange,
        ) *
        0.1;

      break;
    }

    case "state-oscillation-risk": {
      score +=
        negativeChangeMagnitude(
          scoreTrend.stabilityChange,
        ) *
        0.14;

      score +=
        positiveChange(
          scoreTrend.redirectionRiskChange,
        ) *
        0.14;

      break;
    }

    case "redirection-risk": {
      score +=
        positiveChange(
          scoreTrend.redirectionRiskChange,
        ) *
        0.28;

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
          "The recent score trend directly indicates increasing redirection risk.",
        );
      }

      break;
    }

    case "confidence-degradation-risk": {
      score +=
        negativeChangeMagnitude(
          scoreTrend.stabilityChange,
        ) *
        0.1;

      score +=
        negativeChangeMagnitude(
          scoreTrend.progressChange,
        ) *
        0.1;

      score +=
        positiveChange(
          scoreTrend.redirectionRiskChange,
        ) *
        0.08;

      break;
    }

    case "completion-failure-risk": {
      score +=
        negativeChangeMagnitude(
          scoreTrend.completionMomentumChange,
        ) *
        0.28;

      score +=
        negativeChangeMagnitude(
          scoreTrend.progressChange,
        ) *
        0.12;

      if (
        scoreTrend.completionMomentum ===
        "decreasing"
      ) {
        params.reasoning.push(
          "Declining completion momentum increases completion failure risk.",
        );
      }

      break;
    }

    case "adaptation-conflict-risk": {
      score +=
        params.context.conflictRisk *
        0.26;

      break;
    }
  }

  return score;
}

/* ------------------------------------------------------------------ */
/* Memory Signal Score                                                */
/* ------------------------------------------------------------------ */

function calculateRiskMemorySignalScore(
  params: {
    type:
      RecommendationPredictionRiskType;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  switch (
    params.type
  ) {
    case "premature-advance-risk": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "risk-accumulation",
            "persistent-stall",
            "confidence-degradation",
          ],
        )
      ) {
        params.reasoning.push(
          "Long-term Memory contains warning signals that make advancement less reliable.",
        );

        return 0.22;
      }

      return 0;
    }

    case "persistent-observation-risk": {
      if (
        hasMemorySignal(
          params.context,
          "persistent-observation",
        )
      ) {
        params.reasoning.push(
          "Persistent observation is already present in long-term Memory.",
        );

        return 0.3;
      }

      return 0;
    }

    case "stagnation-risk": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "persistent-stall",
            "persistent-observation",
            "risk-accumulation",
          ],
        )
      ) {
        params.reasoning.push(
          "Long-term Memory indicates sustained stall or observation pressure.",
        );

        return 0.28;
      }

      return 0;
    }

    case "fragmentation-risk": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "persistent-fragmentation",
            "state-oscillation",
            "risk-accumulation",
          ],
        )
      ) {
        params.reasoning.push(
          "Long-term fragmentation or oscillation signals increase fragmentation risk.",
        );

        return 0.3;
      }

      return 0;
    }

    case "strategy-oscillation-risk": {
      if (
        hasMemorySignal(
          params.context,
          "strategy-oscillation",
        )
      ) {
        params.reasoning.push(
          "Strategy oscillation is already active in Memory.",
        );

        return 0.32;
      }

      return 0;
    }

    case "state-oscillation-risk": {
      if (
        hasMemorySignal(
          params.context,
          "state-oscillation",
        )
      ) {
        params.reasoning.push(
          "State oscillation is already active in Memory.",
        );

        return 0.32;
      }

      return 0;
    }

    case "redirection-risk": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "persistent-fragmentation",
            "strategy-oscillation",
            "state-oscillation",
            "risk-accumulation",
          ],
        )
      ) {
        params.reasoning.push(
          "Memory contains signals associated with repeated redirection.",
        );

        return 0.26;
      }

      return 0;
    }

    case "confidence-degradation-risk": {
      if (
        hasMemorySignal(
          params.context,
          "confidence-degradation",
        )
      ) {
        params.reasoning.push(
          "Confidence degradation is already present in long-term Memory.",
        );

        return 0.32;
      }

      return 0;
    }

    case "completion-failure-risk": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "persistent-stall",
            "risk-accumulation",
            "confidence-degradation",
          ],
        )
      ) {
        params.reasoning.push(
          "Long-term stall or degraded confidence weakens completion reliability.",
        );

        return 0.24;
      }

      return 0;
    }

    case "adaptation-conflict-risk": {
      if (
        params.context.conflictedAdaptationRuleIds.length >
        0
      ) {
        params.reasoning.push(
          "One or more Adaptive Learning rules are currently conflicted.",
        );

        return Math.min(
          0.32,
          params.context
            .conflictedAdaptationRuleIds.length *
          0.08,
        );
      }

      return 0;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Runtime Adjustment Score                                           */
/* ------------------------------------------------------------------ */

function calculateRiskRuntimeAdjustmentScore(
  params: {
    type:
      RecommendationPredictionRiskType;

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
    params.type
  ) {
    case "premature-advance-risk": {
      score +=
        positiveChange(
          adjustment.evidenceRequirementAdjustment,
        ) *
        0.14;

      score +=
        positiveChange(
          adjustment.newRecommendationThresholdAdjustment,
        ) *
        0.16;

      break;
    }

    case "persistent-observation-risk": {
      score +=
        positiveChange(
          adjustment.evidenceRequirementAdjustment,
        ) *
        0.08;

      break;
    }

    case "stagnation-risk": {
      score +=
        positiveChange(
          adjustment.stabilizationPreferenceAdjustment,
        ) *
        0.08;

      break;
    }

    case "fragmentation-risk":
    case "redirection-risk": {
      score +=
        positiveChange(
          adjustment.redirectionThresholdAdjustment,
        ) *
        0.12;

      break;
    }

    case "confidence-degradation-risk": {
      score +=
        positiveChange(
          adjustment.evidenceRequirementAdjustment,
        ) *
        0.08;

      break;
    }

    case "completion-failure-risk": {
      score +=
        positiveChange(
          adjustment.newRecommendationThresholdAdjustment,
        ) *
        0.12;

      break;
    }

    case "adaptation-conflict-risk": {
      score +=
        params.context.conflictRisk *
        0.18;

      break;
    }

    case "strategy-oscillation-risk":
    case "state-oscillation-risk": {
      score +=
        positiveChange(
          adjustment.stabilizationPreferenceAdjustment,
        ) *
        0.06;

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
/* Conflict Score                                                     */
/* ------------------------------------------------------------------ */

function calculateRiskConflictScore(
  params: {
    type:
      RecommendationPredictionRiskType;

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

  if (
    params.type ===
    "adaptation-conflict-risk"
  ) {
    if (
      params.context.conflictRisk >=
      0.4
    ) {
      params.reasoning.push(
        "Adaptive evidence contains meaningful internal conflict.",
      );
    }

    return params.context.conflictRisk *
      0.3;
  }

  /**
   * 일반 위험 후보도 Adaptive Conflict가 높으면 예측 불확실성이
   * 커지므로 약한 보조 점수만 추가합니다.
   */
  return params.context.conflictRisk *
    0.04;
}

/* ------------------------------------------------------------------ */
/* Confidence                                                         */
/* ------------------------------------------------------------------ */

function calculateRecommendationRiskConfidence(
  params: {
    type:
      RecommendationPredictionRiskType;

    relatedStateTypes:
      readonly RecommendationPredictiveEntryState[];

    relatedStrategyTypes:
      readonly RecommendationPredictiveStrategyType[];

    relatedDecisionTypes:
      readonly RecommendationPredictiveRuntimeDecisionType[];

    context:
      RecommendationPredictionContext;

    predictedStates:
      readonly RecommendationPredictedState[];

    predictedStrategies:
      readonly RecommendationPredictedStrategy[];

    predictedRuntimeDecisions:
      readonly RecommendationPredictedRuntimeDecision[];
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

  const decisionEvidence =
    params.predictedRuntimeDecisions.reduce(
      (
        total,
        prediction,
      ) =>
        params.relatedDecisionTypes.includes(
          prediction.decisionType,
        )
          ? total +
            prediction.scores.probability *
            prediction.scores.confidence
          : total,
      0,
    );

  const adaptiveEvidence =
    averageNumbers([
      params.context.evidenceStrength,
      params.context.learningConfidence,
      params.context.adaptationReadiness,
    ]);

  const memoryEvidence =
    clampUnitInterval(
      params.context.currentMemorySignalTypes.length /
      4,
    );

  let confidence =
    stateEvidence *
      0.2 +
    strategyEvidence *
      0.18 +
    decisionEvidence *
      0.2 +
    adaptiveEvidence *
      0.27 +
    memoryEvidence *
      0.15;

  /**
   * adaptation-conflict-risk는 Conflict 자체가 Evidence이므로
   * 일반 위험과 달리 conflictRisk를 감점하지 않습니다.
   */
  if (
    params.type ===
    "adaptation-conflict-risk"
  ) {
    confidence +=
      params.context.conflictRisk *
      0.2;

    return clampUnitInterval(
      confidence,
    );
  }

  const conflictMultiplier =
    1 -
    params.context.conflictRisk *
      0.35;

  return clampUnitInterval(
    confidence *
      conflictMultiplier,
  );
}

/* ------------------------------------------------------------------ */
/* Severity                                                           */
/* ------------------------------------------------------------------ */

export function resolveRecommendationRiskSeverity(
  rawScore:
    number,
  confidence:
    number,
): RecommendationPredictionSeverity {
  validateNonNegativeFiniteNumber(
    rawScore,
    "rawScore",
  );

  validateUnitInterval(
    confidence,
    "confidence",
  );

  const weightedScore =
    rawScore *
    (
      0.65 +
      confidence *
      0.35
    );

  if (
    weightedScore >=
    0.75
  ) {
    return "high";
  }

  if (
    weightedScore >=
    0.45
  ) {
    return "moderate";
  }

  if (
    weightedScore >=
    0.2
  ) {
    return "low";
  }

  return "informational";
}

/* ------------------------------------------------------------------ */
/* Description                                                        */
/* ------------------------------------------------------------------ */

function createRecommendationRiskDescription(
  type:
    RecommendationPredictionRiskType,
  severity:
    RecommendationPredictionSeverity,
): string {
  const prefix =
    `${capitalizeSeverity(
      severity,
    )} risk:`;

  switch (
    type
  ) {
    case "premature-advance-risk":
      return `${prefix} the Recommendation may advance before sufficient progress or completion evidence is available.`;

    case "persistent-observation-risk":
      return `${prefix} the flow may remain in observation without producing a meaningful transition.`;

    case "stagnation-risk":
      return `${prefix} the Recommendation may stop producing measurable progress.`;

    case "fragmentation-risk":
      return `${prefix} the Recommendation direction may split into unstable or weakly connected paths.`;

    case "strategy-oscillation-risk":
      return `${prefix} the Runtime may continue switching between competing strategies.`;

    case "state-oscillation-risk":
      return `${prefix} the Recommendation state may repeatedly move between incompatible conditions.`;

    case "redirection-risk":
      return `${prefix} the current direction may require another significant redirection.`;

    case "confidence-degradation-risk":
      return `${prefix} confidence in the current Recommendation may continue to weaken.`;

    case "completion-failure-risk":
      return `${prefix} the Recommendation may fail to reach or confirm completion.`;

    case "adaptation-conflict-risk":
      return `${prefix} competing Adaptive Learning rules may produce inconsistent Runtime guidance.`;
  }
}

/* ------------------------------------------------------------------ */
/* Normalization                                                      */
/* ------------------------------------------------------------------ */

function normalizeRecommendationRiskCandidates(
  candidates:
    readonly RecommendationRiskPredictionCandidate[],
): RecommendationRiskPredictionCandidate[] {
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
        ...cloneRecommendationRiskCandidate(
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
      ...cloneRecommendationRiskCandidate(
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

function selectRecommendationRiskCandidates(
  params: {
    candidates:
      readonly RecommendationRiskPredictionCandidate[];

    minimumProbability:
      number;
  },
): RecommendationRiskPredictionCandidate[] {
  const sorted =
    [...params.candidates].sort(
      compareRecommendationRiskCandidates,
    );

  let selected =
    sorted.filter(
      (
        candidate,
      ) =>
        candidate.probability >=
        params.minimumProbability,
    );

  if (
    selected.length >
    MAXIMUM_RISK_COUNT
  ) {
    selected =
      selected.slice(
        0,
        MAXIMUM_RISK_COUNT,
      );
  }

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

  return renormalizeSelectedRiskCandidates(
    selected,
  );
}

function renormalizeSelectedRiskCandidates(
  candidates:
    readonly RecommendationRiskPredictionCandidate[],
): RecommendationRiskPredictionCandidate[] {
  if (
    candidates.length ===
    0
  ) {
    return [];
  }

  const probabilityTotal =
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
        ...cloneRecommendationRiskCandidate(
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
      ...cloneRecommendationRiskCandidate(
        candidate,
      ),

      probability:
        candidate.probability /
        probabilityTotal,
    }),
  );
}

function compareRecommendationRiskCandidates(
  left:
    RecommendationRiskPredictionCandidate,
  right:
    RecommendationRiskPredictionCandidate,
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

  return getRiskTypeOrder(
    left.type,
  ) -
    getRiskTypeOrder(
      right.type,
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

export function cloneRecommendationPredictedRisk(
  prediction:
    RecommendationPredictedRisk,
): RecommendationPredictedRisk {
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

    relatedDecisionTypes: [
      ...prediction.relatedDecisionTypes,
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

function cloneRecommendationRiskCandidate(
  candidate:
    RecommendationRiskPredictionCandidate,
): RecommendationRiskPredictionCandidate {
  return {
    ...candidate,

    relatedStateTypes: [
      ...candidate.relatedStateTypes,
    ],

    relatedStrategyTypes: [
      ...candidate.relatedStrategyTypes,
    ],

    relatedDecisionTypes: [
      ...candidate.relatedDecisionTypes,
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

export function getRecommendationRiskPredictionProbability(
  predictions:
    readonly RecommendationPredictedRisk[],
  type:
    RecommendationPredictionRiskType,
): number {
  return (
    predictions.find(
      (
        prediction,
      ) =>
        prediction.type ===
        type,
    )?.scores.probability ??
    0
  );
}

export function hasRecommendationRiskPrediction(
  predictions:
    readonly RecommendationPredictedRisk[],
  type:
    RecommendationPredictionRiskType,
): boolean {
  return predictions.some(
    (
      prediction,
    ) =>
      prediction.type ===
      type,
  );
}

export function getHighestRecommendationRisk(
  predictions:
    readonly RecommendationPredictedRisk[],
): RecommendationPredictedRisk | null {
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

        return right.scores.probability -
          left.scores.probability;
      },
    );

  return sorted[
    0
  ] ??
    null;
}

export function summarizeRecommendationRiskPredictions(
  predictions:
    readonly RecommendationPredictedRisk[],
): string {
  if (
    predictions.length ===
    0
  ) {
    return "No Recommendation risk prediction is currently available.";
  }

  return predictions
    .map(
      (
        prediction,
      ) =>
        `${prediction.type}: ${roundScore(
          prediction.scores.probability *
          100,
        )}% (${prediction.severity})`,
    )
    .join(
      ", ",
    );
}

/* ------------------------------------------------------------------ */
/* Public Validation                                                  */
/* ------------------------------------------------------------------ */

export function validateRecommendationPredictedRisk(
  prediction:
    RecommendationPredictedRisk,
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
      "Recommendation Risk Prediction must be an object.",
    );
  }

  validateRequiredIdentifier(
    prediction.id,
    "prediction.id",
  );

  if (
    !isRecommendationPredictionRiskType(
      prediction.type,
    )
  ) {
    throw new Error(
      "Recommendation Risk Prediction type is invalid.",
    );
  }

  if (
    !isRecommendationPredictionSeverity(
      prediction.severity,
    )
  ) {
    throw new Error(
      "Recommendation Risk Prediction severity is invalid.",
    );
  }

  validatePositiveInteger(
    prediction.rank,
    "prediction.rank",
  );

  validatePredictionCandidateScores(
    prediction.scores,
  );

  validateRequiredString(
    prediction.description,
    "prediction.description",
  );

  validateUniqueStateArray(
    prediction.relatedStateTypes,
    "prediction.relatedStateTypes",
  );

  validateUniqueStrategyArray(
    prediction.relatedStrategyTypes,
    "prediction.relatedStrategyTypes",
  );

  validateUniqueRuntimeDecisionArray(
    prediction.relatedDecisionTypes,
    "prediction.relatedDecisionTypes",
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

export function validateRecommendationPredictedRisks(
  predictions:
    readonly RecommendationPredictedRisk[],
): void {
  if (
    !Array.isArray(
      predictions,
    )
  ) {
    throw new Error(
      "Recommendation Risk Predictions must be an array.",
    );
  }

  const observedIds =
    new Set<string>();

  const observedTypes =
    new Set<
      RecommendationPredictionRiskType
    >();

  predictions.forEach(
    (
      prediction,
      index,
    ) => {
      validateRecommendationPredictedRisk(
        prediction,
      );

      if (
        observedIds.has(
          prediction.id,
        )
      ) {
        throw new Error(
          `Recommendation Risk Prediction id must be unique: ${prediction.id}.`,
        );
      }

      if (
        observedTypes.has(
          prediction.type,
        )
      ) {
        throw new Error(
          `Recommendation Risk Prediction type must be unique: ${prediction.type}.`,
        );
      }

      if (
        prediction.rank !==
        index +
        1
      ) {
        throw new Error(
          "Recommendation Risk Prediction ranks must be sequential.",
        );
      }

      observedIds.add(
        prediction.id,
      );

      observedTypes.add(
        prediction.type,
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
        "Recommendation Risk Prediction probabilities must sum to 1.",
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validatePredictRecommendationRisksParams(
  params:
    PredictRecommendationRisksParams,
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
      "Predict Recommendation Risks params must be an object.",
    );
  }

  validateRiskPredictionContextConsistency(
    params,
  );

  validateRecommendationPredictedStates(
    params.predictedStates,
  );

  validateRecommendationPredictedStrategies(
    params.predictedStrategies,
  );

  validateRecommendationPredictedRuntimeDecisions(
    params.predictedRuntimeDecisions,
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
/* Context Consistency                                                */
/* ------------------------------------------------------------------ */

function validateRiskPredictionContextConsistency(
  params:
    PredictRecommendationRisksParams,
): void {
  if (
    params.context.memoryId !==
    params.memoryAnalysis.memoryId
  ) {
    throw new Error(
      "Risk Prediction Context memoryId must match Memory Analysis memoryId.",
    );
  }

  if (
    params.context.memoryId !==
    params.adaptiveLearningAnalysis.memoryId
  ) {
    throw new Error(
      "Risk Prediction Context memoryId must match Adaptive Learning memoryId.",
    );
  }

  if (
    params.context.historyId !==
      params.memoryAnalysis.historyId ||
    params.context.historyId !==
      params.adaptiveLearningAnalysis.historyId
  ) {
    throw new Error(
      "Risk Prediction Context historyId values are inconsistent.",
    );
  }

  if (
    params.context.sourceMemoryAnalyzedAt !==
    params.memoryAnalysis.analyzedAt
  ) {
    throw new Error(
      "Risk Prediction Context sourceMemoryAnalyzedAt is inconsistent.",
    );
  }

  if (
    params.context.sourceAdaptiveLearningAnalyzedAt !==
    params.adaptiveLearningAnalysis.analyzedAt
  ) {
    throw new Error(
      "Risk Prediction Context sourceAdaptiveLearningAnalyzedAt is inconsistent.",
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

/* ------------------------------------------------------------------ */
/* Timestamp Consistency                                              */
/* ------------------------------------------------------------------ */

function validatePredictionTimestamps(
  params:
    PredictRecommendationRisksParams,
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
          "State and Risk Predictions must use the same predictedAt timestamp.",
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
          "Strategy and Risk Predictions must use the same predictedAt timestamp.",
        );
      }
    },
  );

  params.predictedRuntimeDecisions.forEach(
    (
      prediction,
    ) => {
      if (
        prediction.predictedAt !==
        params.predictedAt
      ) {
        throw new Error(
          "Runtime Decision and Risk Predictions must use the same predictedAt timestamp.",
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
/* Typed Array Validation                                             */
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

function validateUniqueRuntimeDecisionArray(
  values:
    readonly RecommendationPredictiveRuntimeDecisionType[],
  fieldName:
    string,
): void {
  validateUniqueTypedStringArray(
    values,
    fieldName,
    isRecommendationPredictiveRuntimeDecisionType,
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
/* Type Guards                                                        */
/* ------------------------------------------------------------------ */

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

function isRecommendationPredictiveRuntimeDecisionType(
  value:
    unknown,
): value is RecommendationPredictiveRuntimeDecisionType {
  return (
    value ===
      "request-completion-confirmation" ||
    value ===
      "reconsider-current-recommendation" ||
    value ===
      "reduce-direction-changes" ||
    value ===
      "request-progress-evidence" ||
    value ===
      "narrow-current-recommendation" ||
    value ===
      "clarify-current-recommendation" ||
    value ===
      "preserve-current-recommendation" ||
    value ===
      "allow-new-recommendation" ||
    value ===
      "block-new-recommendation"
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

function getRiskTypeOrder(
  type:
    RecommendationPredictionRiskType,
): number {
  return RECOMMENDATION_PREDICTION_RISK_TYPES.indexOf(
    type,
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

function stableOrUnknownDirectionScore(
  direction:
    RecommendationPredictionContext[
      "scoreTrend"
    ][
      "progress"
    ],
): number {
  return (
    direction ===
      "stable" ||
    direction ===
      "unknown"
  )
    ? 1
    : 0;
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

function capitalizeSeverity(
  severity:
    RecommendationPredictionSeverity,
): string {
  return severity.charAt(
    0,
  ).toUpperCase() +
    severity.slice(
      1,
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