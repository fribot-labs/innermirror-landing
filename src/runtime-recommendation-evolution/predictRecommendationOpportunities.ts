import {
    createEmptyRecommendationPredictionEvidence,
    isRecommendationPredictionOpportunityType,
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
    PredictRecommendationOpportunitiesParams,
    RecommendationPredictedOpportunity,
    RecommendationPredictedRuntimeDecision,
    RecommendationPredictedState,
    RecommendationPredictedStrategy,
    RecommendationPredictionCandidateScores,
    RecommendationPredictionContext,
    RecommendationPredictionEvidence,
    RecommendationPredictionOpportunityType,
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

const MAXIMUM_OPPORTUNITY_COUNT =
  7;

const RECOMMENDATION_PREDICTION_OPPORTUNITY_TYPES:
  readonly RecommendationPredictionOpportunityType[] = [
    "stabilization-likelihood",
    "recovery-likelihood",
    "progress-likelihood",
    "completion-likelihood",
    "successful-advance-likelihood",
    "productive-clarification-likelihood",
    "signal-confirmation-likelihood",
  ];

/* ------------------------------------------------------------------ */
/* Opportunity Compatibility                                          */
/* ------------------------------------------------------------------ */

const OPPORTUNITY_RELATED_STATE_TYPES:
  Readonly<
    Record<
      RecommendationPredictionOpportunityType,
      readonly RecommendationPredictiveEntryState[]
    >
  > = {
    "stabilization-likelihood": [
      "stable",
      "observing",
      "stalled",
      "fragmented",
    ],

    "recovery-likelihood": [
      "stalled",
      "fragmented",
      "observing",
      "progressing",
      "stable",
    ],

    "progress-likelihood": [
      "progressing",
      "stable",
      "advancing",
      "observing",
    ],

    "completion-likelihood": [
      "stable",
      "progressing",
      "advancing",
    ],

    "successful-advance-likelihood": [
      "stable",
      "progressing",
      "advancing",
    ],

    "productive-clarification-likelihood": [
      "observing",
      "stalled",
      "fragmented",
      "stable",
    ],

    "signal-confirmation-likelihood": [
      "observing",
      "stable",
      "progressing",
    ],
  };

const OPPORTUNITY_RELATED_STRATEGY_TYPES:
  Readonly<
    Record<
      RecommendationPredictionOpportunityType,
      readonly RecommendationPredictiveStrategyType[]
    >
  > = {
    "stabilization-likelihood": [
      "stabilize",
      "maintain",
      "narrow",
    ],

    "recovery-likelihood": [
      "reconsider",
      "stabilize",
      "clarify",
      "narrow",
    ],

    "progress-likelihood": [
      "maintain",
      "advance",
      "clarify",
      "stabilize",
    ],

    "completion-likelihood": [
      "confirm-completion",
      "advance",
      "maintain",
    ],

    "successful-advance-likelihood": [
      "advance",
      "confirm-completion",
      "maintain",
    ],

    "productive-clarification-likelihood": [
      "clarify",
      "narrow",
      "observe",
      "reconsider",
    ],

    "signal-confirmation-likelihood": [
      "observe",
      "clarify",
      "maintain",
      "confirm-completion",
    ],
  };

const OPPORTUNITY_RELATED_DECISION_TYPES:
  Readonly<
    Record<
      RecommendationPredictionOpportunityType,
      readonly RecommendationPredictiveRuntimeDecisionType[]
    >
  > = {
    "stabilization-likelihood": [
      "preserve-current-recommendation",
      "reduce-direction-changes",
      "narrow-current-recommendation",
      "block-new-recommendation",
    ],

    "recovery-likelihood": [
      "reconsider-current-recommendation",
      "clarify-current-recommendation",
      "reduce-direction-changes",
      "narrow-current-recommendation",
    ],

    "progress-likelihood": [
      "preserve-current-recommendation",
      "request-progress-evidence",
      "allow-new-recommendation",
    ],

    "completion-likelihood": [
      "request-completion-confirmation",
      "allow-new-recommendation",
      "preserve-current-recommendation",
    ],

    "successful-advance-likelihood": [
      "allow-new-recommendation",
      "request-completion-confirmation",
    ],

    "productive-clarification-likelihood": [
      "clarify-current-recommendation",
      "narrow-current-recommendation",
      "request-progress-evidence",
    ],

    "signal-confirmation-likelihood": [
      "request-progress-evidence",
      "request-completion-confirmation",
      "preserve-current-recommendation",
    ],
  };

/* ------------------------------------------------------------------ */
/* Internal Candidate                                                 */
/* ------------------------------------------------------------------ */

type RecommendationOpportunityPredictionCandidate = {
  type:
    RecommendationPredictionOpportunityType;

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
 * 다음 Recommendation 흐름에서 나타날 가능성이 있는 긍정적
 * 전환과 발전 기회를 예측합니다.
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
 * 반환되는 Opportunity는 가능성 정보이며 Runtime 행동을 직접
 * 변경하지 않습니다.
 */
export function predictRecommendationOpportunities(
  params:
    PredictRecommendationOpportunitiesParams,
): RecommendationPredictedOpportunity[] {
  validatePredictRecommendationOpportunitiesParams(
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
    RECOMMENDATION_PREDICTION_OPPORTUNITY_TYPES.map(
      (
        type,
      ) =>
        createRecommendationOpportunityPredictionCandidate({
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
    normalizeRecommendationOpportunityCandidates(
      candidates,
    );

  const selectedCandidates =
    selectRecommendationOpportunityCandidates({
      candidates:
        normalizedCandidates,

      minimumProbability,
    });

  const predictions =
    selectedCandidates.map(
      (
        candidate,
        index,
      ): RecommendationPredictedOpportunity => ({
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

  validateRecommendationPredictedOpportunities(
    predictions,
  );

  return predictions.map(
    cloneRecommendationPredictedOpportunity,
  );
}

/* ------------------------------------------------------------------ */
/* Candidate Creation                                                 */
/* ------------------------------------------------------------------ */

function createRecommendationOpportunityPredictionCandidate(
  params: {
    type:
      RecommendationPredictionOpportunityType;

    context:
      RecommendationPredictionContext;

    predictedStates:
      readonly RecommendationPredictedState[];

    predictedStrategies:
      readonly RecommendationPredictedStrategy[];

    predictedRuntimeDecisions:
      readonly RecommendationPredictedRuntimeDecision[];
  },
): RecommendationOpportunityPredictionCandidate {
  const relatedStateTypes = [
    ...OPPORTUNITY_RELATED_STATE_TYPES[
      params.type
    ],
  ];

  const relatedStrategyTypes = [
    ...OPPORTUNITY_RELATED_STRATEGY_TYPES[
      params.type
    ],
  ];

  const relatedDecisionTypes = [
    ...OPPORTUNITY_RELATED_DECISION_TYPES[
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
    calculatePredictedStateOpportunityScore({
      type:
        params.type,

      relatedStateTypes,

      predictedStates:
        params.predictedStates,

      reasoning,
    });

  rawScore +=
    calculatePredictedStrategyOpportunityScore({
      type:
        params.type,

      relatedStrategyTypes,

      predictedStrategies:
        params.predictedStrategies,

      reasoning,
    });

  rawScore +=
    calculatePredictedDecisionOpportunityScore({
      type:
        params.type,

      relatedDecisionTypes,

      predictedRuntimeDecisions:
        params.predictedRuntimeDecisions,

      reasoning,
    });

  rawScore +=
    calculateOpportunityTrendScore({
      type:
        params.type,

      context:
        params.context,

      reasoning,
    });

  rawScore +=
    calculateOpportunityMemorySignalScore({
      type:
        params.type,

      context:
        params.context,

      reasoning,
    });

  rawScore +=
    calculateOpportunityRuntimeAdjustmentScore({
      type:
        params.type,

      context:
        params.context,

      reasoning,
    });

  rawScore -=
    calculateOpportunityConflictPenalty({
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
    calculateRecommendationOpportunityConfidence({
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
    resolveRecommendationOpportunitySeverity(
      rawScore,
      confidence,
    );

  if (
    reasoning.length ===
    0
  ) {
    reasoning.push(
      `The ${params.type} signal remains a low-evidence opportunity candidate.`,
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
      createRecommendationOpportunityDescription(
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
/* State Opportunity Score                                            */
/* ------------------------------------------------------------------ */

function calculatePredictedStateOpportunityScore(
  params: {
    type:
      RecommendationPredictionOpportunityType;

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
      `The predicted ${strongestState.state} state supports ${params.type}.`,
    );
  }

  return relatedProbability *
    0.2;
}

/* ------------------------------------------------------------------ */
/* Strategy Opportunity Score                                         */
/* ------------------------------------------------------------------ */

function calculatePredictedStrategyOpportunityScore(
  params: {
    type:
      RecommendationPredictionOpportunityType;

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
      `The predicted ${strongestStrategy.strategyType} strategy supports ${params.type}.`,
    );
  }

  return relatedProbability *
    0.2;
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Opportunity Score                                 */
/* ------------------------------------------------------------------ */

function calculatePredictedDecisionOpportunityScore(
  params: {
    type:
      RecommendationPredictionOpportunityType;

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
      `The predicted ${strongestDecision.decisionType} Runtime Decision supports ${params.type}.`,
    );
  }

  return relatedProbability *
    0.18;
}

/* ------------------------------------------------------------------ */
/* Trend Score                                                        */
/* ------------------------------------------------------------------ */

function calculateOpportunityTrendScore(
  params: {
    type:
      RecommendationPredictionOpportunityType;

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
    case "stabilization-likelihood": {
      score +=
        positiveChange(
          scoreTrend.stabilityChange,
        ) *
        0.26;

      score +=
        negativeChangeMagnitude(
          scoreTrend.repetitionRiskChange,
        ) *
        0.1;

      score +=
        negativeChangeMagnitude(
          scoreTrend.redirectionRiskChange,
        ) *
        0.1;

      if (
        scoreTrend.stability ===
        "increasing"
      ) {
        params.reasoning.push(
          "Increasing stability supports a stabilization opportunity.",
        );
      }

      break;
    }

    case "recovery-likelihood": {
      score +=
        positiveChange(
          scoreTrend.stabilityChange,
        ) *
        0.16;

      score +=
        positiveChange(
          scoreTrend.progressChange,
        ) *
        0.16;

      score +=
        negativeChangeMagnitude(
          scoreTrend.redirectionRiskChange,
        ) *
        0.08;

      if (
        scoreTrend.stability ===
          "increasing" ||
        scoreTrend.progress ===
          "increasing"
      ) {
        params.reasoning.push(
          "Improving stability or progress supports recovery.",
        );
      }

      break;
    }

    case "progress-likelihood": {
      score +=
        positiveChange(
          scoreTrend.progressChange,
        ) *
        0.3;

      score +=
        positiveChange(
          scoreTrend.stabilityChange,
        ) *
        0.08;

      score +=
        negativeChangeMagnitude(
          scoreTrend.repetitionRiskChange,
        ) *
        0.08;

      if (
        scoreTrend.progress ===
        "increasing"
      ) {
        params.reasoning.push(
          "The recent score trend directly indicates increasing progress.",
        );
      }

      break;
    }

    case "completion-likelihood": {
      score +=
        positiveChange(
          scoreTrend.completionMomentumChange,
        ) *
        0.32;

      score +=
        positiveChange(
          scoreTrend.progressChange,
        ) *
        0.12;

      if (
        scoreTrend.completionMomentum ===
        "increasing"
      ) {
        params.reasoning.push(
          "Increasing completion momentum supports completion likelihood.",
        );
      }

      break;
    }

    case "successful-advance-likelihood": {
      score +=
        positiveChange(
          scoreTrend.progressChange,
        ) *
        0.2;

      score +=
        positiveChange(
          scoreTrend.completionMomentumChange,
        ) *
        0.24;

      score +=
        negativeChangeMagnitude(
          scoreTrend.redirectionRiskChange,
        ) *
        0.08;

      if (
        scoreTrend.progress ===
          "increasing" &&
        scoreTrend.completionMomentum ===
          "increasing"
      ) {
        params.reasoning.push(
          "Progress and completion momentum jointly support successful advancement.",
        );
      }

      break;
    }

    case "productive-clarification-likelihood": {
      score +=
        positiveChange(
          scoreTrend.redirectionRiskChange,
        ) *
        0.08;

      score +=
        negativeChangeMagnitude(
          scoreTrend.progressChange,
        ) *
        0.06;

      score +=
        positiveChange(
          scoreTrend.stabilityChange,
        ) *
        0.08;

      if (
        scoreTrend.redirectionRisk ===
          "increasing" &&
        scoreTrend.stability !==
          "decreasing"
      ) {
        params.reasoning.push(
          "Clarification may convert redirection pressure into a more stable direction.",
        );
      }

      break;
    }

    case "signal-confirmation-likelihood": {
      score +=
        positiveChange(
          scoreTrend.stabilityChange,
        ) *
        0.12;

      score +=
        positiveChange(
          scoreTrend.progressChange,
        ) *
        0.12;

      score +=
        positiveChange(
          scoreTrend.completionMomentumChange,
        ) *
        0.1;

      if (
        scoreTrend.sampleCount >
        0
      ) {
        score +=
          clampUnitInterval(
            scoreTrend.sampleCount /
            5,
          ) *
          0.08;
      }

      break;
    }
  }

  return score;
}

/* ------------------------------------------------------------------ */
/* Memory Signal Score                                                */
/* ------------------------------------------------------------------ */

function calculateOpportunityMemorySignalScore(
  params: {
    type:
      RecommendationPredictionOpportunityType;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  switch (
    params.type
  ) {
    case "stabilization-likelihood": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "persistent-stability",
            "risk-reduction",
            "confidence-recovery",
          ],
        )
      ) {
        params.reasoning.push(
          "Long-term stability or risk reduction supports stabilization.",
        );

        return 0.28;
      }

      if (
        hasMemorySignal(
          params.context,
          "recovery-pattern",
        )
      ) {
        return 0.12;
      }

      return 0;
    }

    case "recovery-likelihood": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "recovery-pattern",
            "confidence-recovery",
            "risk-reduction",
          ],
        )
      ) {
        params.reasoning.push(
          "A long-term recovery pattern supports renewed continuity.",
        );

        return 0.32;
      }

      return 0;
    }

    case "progress-likelihood": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "long-term-progression",
            "risk-reduction",
            "confidence-recovery",
          ],
        )
      ) {
        params.reasoning.push(
          "Long-term progression or recovering confidence supports future progress.",
        );

        return 0.3;
      }

      return 0;
    }

    case "completion-likelihood": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "long-term-advancement",
            "long-term-progression",
            "persistent-stability",
          ],
        )
      ) {
        params.reasoning.push(
          "Long-term advancement and stability support completion.",
        );

        return 0.28;
      }

      return 0;
    }

    case "successful-advance-likelihood": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "long-term-progression",
            "long-term-advancement",
            "risk-reduction",
          ],
        )
      ) {
        params.reasoning.push(
          "Long-term progression supports a successful Recommendation advance.",
        );

        return 0.3;
      }

      return 0;
    }

    case "productive-clarification-likelihood": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "strategy-oscillation",
            "state-oscillation",
            "persistent-observation",
          ],
        )
      ) {
        params.reasoning.push(
          "Existing uncertainty creates an opportunity for productive clarification.",
        );

        return 0.2;
      }

      return 0;
    }

    case "signal-confirmation-likelihood": {
      if (
        hasAnyMemorySignal(
          params.context,
          [
            "persistent-stability",
            "long-term-progression",
            "confidence-recovery",
            "risk-reduction",
          ],
        )
      ) {
        params.reasoning.push(
          "Repeated positive Memory signals support stronger signal confirmation.",
        );

        return 0.26;
      }

      return 0;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Runtime Adjustment Score                                           */
/* ------------------------------------------------------------------ */

function calculateOpportunityRuntimeAdjustmentScore(
  params: {
    type:
      RecommendationPredictionOpportunityType;

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
    case "stabilization-likelihood": {
      score +=
        positiveChange(
          adjustment.stabilizationPreferenceAdjustment,
        ) *
        0.22;

      if (
        adjustment.stabilizationPreferenceAdjustment >
        0
      ) {
        params.reasoning.push(
          "Adaptive Learning explicitly favors stabilization.",
        );
      }

      break;
    }

    case "recovery-likelihood": {
      score +=
        positiveChange(
          adjustment.recoveryPreferenceAdjustment,
        ) *
        0.24;

      score +=
        positiveChange(
          adjustment.stabilizationPreferenceAdjustment,
        ) *
        0.08;

      if (
        adjustment.recoveryPreferenceAdjustment >
        0
      ) {
        params.reasoning.push(
          "Adaptive Learning explicitly favors recovery-oriented behavior.",
        );
      }

      break;
    }

    case "progress-likelihood": {
      score +=
        negativeChangeMagnitude(
          adjustment.newRecommendationThresholdAdjustment,
        ) *
        0.08;

      score +=
        positiveChange(
          adjustment.stabilizationPreferenceAdjustment,
        ) *
        0.04;

      break;
    }

    case "completion-likelihood": {
      score +=
        negativeChangeMagnitude(
          adjustment.newRecommendationThresholdAdjustment,
        ) *
        0.12;

      score -=
        positiveChange(
          adjustment.evidenceRequirementAdjustment,
        ) *
        0.04;

      break;
    }

    case "successful-advance-likelihood": {
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

    case "productive-clarification-likelihood": {
      score +=
        positiveChange(
          adjustment.evidenceRequirementAdjustment,
        ) *
        0.12;

      score +=
        positiveChange(
          adjustment.recoveryPreferenceAdjustment,
        ) *
        0.08;

      break;
    }

    case "signal-confirmation-likelihood": {
      score +=
        positiveChange(
          adjustment.evidenceRequirementAdjustment,
        ) *
        0.08;

      score +=
        positiveChange(
          params.context.evidenceStrength -
          0.5,
        ) *
        0.14;

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
/* Conflict Penalty                                                   */
/* ------------------------------------------------------------------ */

function calculateOpportunityConflictPenalty(
  params: {
    type:
      RecommendationPredictionOpportunityType;

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
    0.12;

  penalty +=
    Math.min(
      0.08,
      params.context
        .conflictedAdaptationRuleIds.length *
      0.02,
    );

  /**
   * Clarification은 Conflict가 존재할 때 오히려 의미 있는
   * Opportunity가 될 수 있으므로 패널티를 작게 적용합니다.
   */
  if (
    params.type ===
    "productive-clarification-likelihood"
  ) {
    penalty *=
      0.35;
  }

  if (
    params.context.conflictRisk >=
    0.5
  ) {
    params.reasoning.push(
      "Conflicting adaptive evidence reduces Opportunity prediction certainty.",
    );
  }

  return penalty;
}

/* ------------------------------------------------------------------ */
/* Confidence                                                         */
/* ------------------------------------------------------------------ */

function calculateRecommendationOpportunityConfidence(
  params: {
    type:
      RecommendationPredictionOpportunityType;

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

  const trendEvidence =
    clampUnitInterval(
      params.context.scoreTrend.sampleCount /
      5,
    );

  const confidence =
    stateEvidence *
      0.2 +
    strategyEvidence *
      0.2 +
    decisionEvidence *
      0.18 +
    adaptiveEvidence *
      0.24 +
    memoryEvidence *
      0.1 +
    trendEvidence *
      0.08;

  const conflictMultiplier =
    1 -
    params.context.conflictRisk *
      0.4;

  return clampUnitInterval(
    confidence *
      conflictMultiplier,
  );
}

/* ------------------------------------------------------------------ */
/* Severity                                                           */
/* ------------------------------------------------------------------ */

/**
 * Opportunity의 severity는 위험 강도가 아니라 Opportunity
 * Signal의 강도를 의미합니다.
 */
export function resolveRecommendationOpportunitySeverity(
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

function createRecommendationOpportunityDescription(
  type:
    RecommendationPredictionOpportunityType,
  severity:
    RecommendationPredictionSeverity,
): string {
  const prefix =
    `${capitalizeSeverity(
      severity,
    )} opportunity:`;

  switch (
    type
  ) {
    case "stabilization-likelihood":
      return `${prefix} the Recommendation flow may become more stable and internally consistent.`;

    case "recovery-likelihood":
      return `${prefix} the current flow may recover from stall, fragmentation, or weakened confidence.`;

    case "progress-likelihood":
      return `${prefix} the Recommendation may produce measurable forward progress.`;

    case "completion-likelihood":
      return `${prefix} the current Recommendation may reach or confirm completion.`;

    case "successful-advance-likelihood":
      return `${prefix} the flow may advance successfully without creating excessive instability.`;

    case "productive-clarification-likelihood":
      return `${prefix} clarification may reduce ambiguity and improve the Recommendation direction.`;

    case "signal-confirmation-likelihood":
      return `${prefix} additional evidence may confirm the currently emerging Recommendation signal.`;
  }
}

/* ------------------------------------------------------------------ */
/* Normalization                                                      */
/* ------------------------------------------------------------------ */

function normalizeRecommendationOpportunityCandidates(
  candidates:
    readonly RecommendationOpportunityPredictionCandidate[],
): RecommendationOpportunityPredictionCandidate[] {
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
        ...cloneRecommendationOpportunityCandidate(
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
      ...cloneRecommendationOpportunityCandidate(
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

function selectRecommendationOpportunityCandidates(
  params: {
    candidates:
      readonly RecommendationOpportunityPredictionCandidate[];

    minimumProbability:
      number;
  },
): RecommendationOpportunityPredictionCandidate[] {
  const sorted =
    [...params.candidates].sort(
      compareRecommendationOpportunityCandidates,
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
    MAXIMUM_OPPORTUNITY_COUNT
  ) {
    selected =
      selected.slice(
        0,
        MAXIMUM_OPPORTUNITY_COUNT,
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

  return renormalizeSelectedOpportunityCandidates(
    selected,
  );
}

function renormalizeSelectedOpportunityCandidates(
  candidates:
    readonly RecommendationOpportunityPredictionCandidate[],
): RecommendationOpportunityPredictionCandidate[] {
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
        ...cloneRecommendationOpportunityCandidate(
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
      ...cloneRecommendationOpportunityCandidate(
        candidate,
      ),

      probability:
        candidate.probability /
        probabilityTotal,
    }),
  );
}

function compareRecommendationOpportunityCandidates(
  left:
    RecommendationOpportunityPredictionCandidate,
  right:
    RecommendationOpportunityPredictionCandidate,
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

  return getOpportunityTypeOrder(
    left.type,
  ) -
    getOpportunityTypeOrder(
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

export function cloneRecommendationPredictedOpportunity(
  prediction:
    RecommendationPredictedOpportunity,
): RecommendationPredictedOpportunity {
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

function cloneRecommendationOpportunityCandidate(
  candidate:
    RecommendationOpportunityPredictionCandidate,
): RecommendationOpportunityPredictionCandidate {
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

export function getRecommendationOpportunityPredictionProbability(
  predictions:
    readonly RecommendationPredictedOpportunity[],
  type:
    RecommendationPredictionOpportunityType,
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

export function hasRecommendationOpportunityPrediction(
  predictions:
    readonly RecommendationPredictedOpportunity[],
  type:
    RecommendationPredictionOpportunityType,
): boolean {
  return predictions.some(
    (
      prediction,
    ) =>
      prediction.type ===
      type,
  );
}

export function getHighestRecommendationOpportunity(
  predictions:
    readonly RecommendationPredictedOpportunity[],
): RecommendationPredictedOpportunity | null {
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

export function summarizeRecommendationOpportunityPredictions(
  predictions:
    readonly RecommendationPredictedOpportunity[],
): string {
  if (
    predictions.length ===
    0
  ) {
    return "No Recommendation opportunity prediction is currently available.";
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

export function validateRecommendationPredictedOpportunity(
  prediction:
    RecommendationPredictedOpportunity,
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
      "Recommendation Opportunity Prediction must be an object.",
    );
  }

  validateRequiredIdentifier(
    prediction.id,
    "prediction.id",
  );

  if (
    !isRecommendationPredictionOpportunityType(
      prediction.type,
    )
  ) {
    throw new Error(
      "Recommendation Opportunity Prediction type is invalid.",
    );
  }

  if (
    !isRecommendationPredictionSeverity(
      prediction.severity,
    )
  ) {
    throw new Error(
      "Recommendation Opportunity Prediction severity is invalid.",
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

export function validateRecommendationPredictedOpportunities(
  predictions:
    readonly RecommendationPredictedOpportunity[],
): void {
  if (
    !Array.isArray(
      predictions,
    )
  ) {
    throw new Error(
      "Recommendation Opportunity Predictions must be an array.",
    );
  }

  const observedIds =
    new Set<string>();

  const observedTypes =
    new Set<
      RecommendationPredictionOpportunityType
    >();

  predictions.forEach(
    (
      prediction,
      index,
    ) => {
      validateRecommendationPredictedOpportunity(
        prediction,
      );

      if (
        observedIds.has(
          prediction.id,
        )
      ) {
        throw new Error(
          `Recommendation Opportunity Prediction id must be unique: ${prediction.id}.`,
        );
      }

      if (
        observedTypes.has(
          prediction.type,
        )
      ) {
        throw new Error(
          `Recommendation Opportunity Prediction type must be unique: ${prediction.type}.`,
        );
      }

      if (
        prediction.rank !==
        index +
          1
      ) {
        throw new Error(
          "Recommendation Opportunity Prediction ranks must be sequential.",
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
        "Recommendation Opportunity Prediction probabilities must sum to 1.",
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validatePredictRecommendationOpportunitiesParams(
  params:
    PredictRecommendationOpportunitiesParams,
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
      "Predict Recommendation Opportunities params must be an object.",
    );
  }

  validateOpportunityPredictionContextConsistency(
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

function validateOpportunityPredictionContextConsistency(
  params:
    PredictRecommendationOpportunitiesParams,
): void {
  if (
    params.context.memoryId !==
    params.memoryAnalysis.memoryId
  ) {
    throw new Error(
      "Opportunity Prediction Context memoryId must match Memory Analysis memoryId.",
    );
  }

  if (
    params.context.memoryId !==
    params.adaptiveLearningAnalysis.memoryId
  ) {
    throw new Error(
      "Opportunity Prediction Context memoryId must match Adaptive Learning memoryId.",
    );
  }

  if (
    params.context.historyId !==
      params.memoryAnalysis.historyId ||
    params.context.historyId !==
      params.adaptiveLearningAnalysis.historyId
  ) {
    throw new Error(
      "Opportunity Prediction Context historyId values are inconsistent.",
    );
  }

  if (
    params.context.sourceMemoryAnalyzedAt !==
    params.memoryAnalysis.analyzedAt
  ) {
    throw new Error(
      "Opportunity Prediction Context sourceMemoryAnalyzedAt is inconsistent.",
    );
  }

  if (
    params.context.sourceAdaptiveLearningAnalyzedAt !==
    params.adaptiveLearningAnalysis.analyzedAt
  ) {
    throw new Error(
      "Opportunity Prediction Context sourceAdaptiveLearningAnalyzedAt is inconsistent.",
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
    PredictRecommendationOpportunitiesParams,
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
          "State and Opportunity Predictions must use the same predictedAt timestamp.",
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
          "Strategy and Opportunity Predictions must use the same predictedAt timestamp.",
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
          "Runtime Decision and Opportunity Predictions must use the same predictedAt timestamp.",
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

function getOpportunityTypeOrder(
  type:
    RecommendationPredictionOpportunityType,
): number {
  return RECOMMENDATION_PREDICTION_OPPORTUNITY_TYPES.indexOf(
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