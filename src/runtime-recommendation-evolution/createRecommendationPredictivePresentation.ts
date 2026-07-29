import {
    getPrimaryRecommendationPredictedOpportunity,
    getPrimaryRecommendationPredictedRisk,
    getPrimaryRecommendationPredictedRuntimeDecision,
    getPrimaryRecommendationPredictedState,
    getPrimaryRecommendationPredictedStrategy,
    isRecommendationPredictivePresentationTone,
} from "./recommendationPredictiveIntelligenceTypes";

import {
    validateRecommendationPredictiveIntelligence,
} from "./analyzeRecommendationPredictiveIntelligence";

import type {
    CreateRecommendationPredictivePresentationParams,
    RecommendationPredictedOpportunity,
    RecommendationPredictedRisk,
    RecommendationPredictedRuntimeDecision,
    RecommendationPredictedState,
    RecommendationPredictedStrategy,
    RecommendationPredictionConflict,
    RecommendationPredictionSeverity,
    RecommendationPredictiveIntelligence,
    RecommendationPredictivePresentation,
    RecommendationPredictivePresentationTone,
    ValidateRecommendationPredictivePresentationParams,
} from "./recommendationPredictiveIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const SCORE_PRECISION =
  10000;

const MAXIMUM_WARNING_COUNT =
  5;

const MAXIMUM_EVIDENCE_COUNT =
  8;

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Predictive Intelligence 분석 결과를 사용자 또는
 * Runtime 표시 계층에서 사용할 수 있는 설명 구조로 변환합니다.
 *
 * 이 함수는:
 *
 * - 예측 결과를 다시 계산하지 않습니다.
 * - Runtime Decision을 실행하지 않습니다.
 * - 하나의 미래를 확정하지 않습니다.
 * - Risk와 Opportunity를 동시에 표현할 수 있습니다.
 */
export function createRecommendationPredictivePresentation(
  params:
    CreateRecommendationPredictivePresentationParams,
): RecommendationPredictivePresentation {
  validateCreateRecommendationPredictivePresentationParams(
    params,
  );

  const {
    analysis,
  } = params;

  const primaryState =
    getPrimaryRecommendationPredictedState(
      analysis.predictedStates,
    );

  const primaryStrategy =
    getPrimaryRecommendationPredictedStrategy(
      analysis.predictedStrategies,
    );

  const primaryRuntimeDecision =
    getPrimaryRecommendationPredictedRuntimeDecision(
      analysis.predictedRuntimeDecisions,
    );

  const primaryRisk =
    getPrimaryRecommendationPredictedRisk(
      analysis.predictedRisks,
    );

  const primaryOpportunity =
    getPrimaryRecommendationPredictedOpportunity(
      analysis.predictedOpportunities,
    );

  const primaryConflict =
    getPrimaryPredictionConflict(
      analysis.conflicts,
    );

  const tone =
    resolveRecommendationPredictivePresentationTone({
      analysis,

      primaryRisk,

      primaryOpportunity,

      primaryConflict,
    });

  const presentation:
    RecommendationPredictivePresentation = {
      tone,

      headline:
        createPredictiveHeadline({
          analysis,

          primaryState,

          primaryStrategy,

          primaryRisk,

          primaryOpportunity,
        }),

      summary:
        createPredictiveSummary({
          analysis,

          primaryState,

          primaryStrategy,

          primaryRuntimeDecision,
        }),

      primaryPrediction:
        createPrimaryPredictionDescription({
          analysis,

          primaryState,

          primaryStrategy,

          primaryRuntimeDecision,

          primaryRisk,

          primaryOpportunity,
        }),

      statePrediction:
        createNextStateDescription(
          primaryState,
        ),

      strategyPrediction:
        createNextStrategyDescription(
          primaryStrategy,
        ),

      decisionPrediction:
        createRuntimeDecisionDescription(
          primaryRuntimeDecision,
        ),

      riskDescription:
        createRiskOutlook(
          primaryRisk,
        ),

      opportunityDescription:
        createOpportunityOutlook(
          primaryOpportunity,
        ),

      confidenceDisclosure:
        createPredictionUncertaintyDescription({
          analysis,

          primaryConflict,
        }),

      warnings:
        createPredictionWarnings({
          analysis,

          primaryRisk,

          primaryConflict,
        }).slice(
          0,
          MAXIMUM_WARNING_COUNT,
        ),

      evidence:
        createPredictionEvidence({
          analysis,

          primaryState,

          primaryStrategy,

          primaryRuntimeDecision,

          primaryRisk,

          primaryOpportunity,
        }).slice(
          0,
          MAXIMUM_EVIDENCE_COUNT,
        ),

      createdAt:
        params.createdAt,
    };

  validateRecommendationPredictivePresentation({
    analysis,

    presentation,
  });

  return cloneRecommendationPredictivePresentation(
    presentation,
  );
}

/* ------------------------------------------------------------------ */
/* Tone                                                               */
/* ------------------------------------------------------------------ */

export function resolveRecommendationPredictivePresentationTone(
  params: {
    analysis:
      RecommendationPredictiveIntelligence;

    primaryRisk:
      RecommendationPredictedRisk | null;

    primaryOpportunity:
      RecommendationPredictedOpportunity | null;

    primaryConflict:
      RecommendationPredictionConflict | null;
  },
): RecommendationPredictivePresentationTone {
  if (
    params.analysis.state ===
    "unavailable"
  ) {
    return "unavailable";
  }

  if (
    params.analysis.state ===
      "conflicted" ||
    params.primaryConflict?.severity ===
      "high" ||
    params.primaryConflict?.severity ===
      "moderate"
  ) {
    return "attention";
  }

  if (
    params.primaryRisk !==
      null &&
    (
      params.primaryRisk.severity ===
        "high" ||
      params.primaryRisk.severity ===
        "moderate"
    ) &&
    params.analysis.scores.riskPressure >=
      params.analysis.scores.opportunityStrength
  ) {
    return "attention";
  }

  switch (
    params.analysis.state
  ) {
    case "insufficient":
      return "neutral";

    case "observing":
      return "observing";

    case "predicting":
      return "predicting";

    case "stable":
      return "stable";
  }
}

/* ------------------------------------------------------------------ */
/* Headline                                                           */
/* ------------------------------------------------------------------ */

function createPredictiveHeadline(
  params: {
    analysis:
      RecommendationPredictiveIntelligence;

    primaryState:
      RecommendationPredictedState | null;

    primaryStrategy:
      RecommendationPredictedStrategy | null;

    primaryRisk:
      RecommendationPredictedRisk | null;

    primaryOpportunity:
      RecommendationPredictedOpportunity | null;
  },
): string {
  if (
    params.analysis.state ===
    "unavailable"
  ) {
    return "Recommendation prediction is not yet available.";
  }

  if (
    params.analysis.state ===
    "insufficient"
  ) {
    return "More Recommendation history is needed before the next transition can be predicted.";
  }

  if (
    params.analysis.state ===
    "conflicted"
  ) {
    return "The current evidence supports more than one possible Recommendation direction.";
  }

  if (
    params.primaryRisk !==
      null &&
    params.primaryRisk.severity ===
      "high" &&
    params.analysis.scores.riskPressure >
      params.analysis.scores.opportunityStrength
  ) {
    return createHighRiskHeadline(
      params.primaryRisk,
    );
  }

  if (
    params.primaryOpportunity !==
      null &&
    params.analysis.scores.opportunityStrength >
      params.analysis.scores.riskPressure
  ) {
    return createOpportunityHeadline(
      params.primaryOpportunity,
    );
  }

  if (
    params.primaryState !==
      null &&
    params.primaryStrategy !==
      null
  ) {
    return (
      `The Recommendation is most likely to move toward ` +
      `${formatState(
        params.primaryState.state,
      )} through a ${formatStrategy(
        params.primaryStrategy.strategyType,
      )} strategy.`
    );
  }

  if (
    params.primaryState !==
    null
  ) {
    return (
      `${formatState(
        params.primaryState.state,
      )} is the most likely next Recommendation state.`
    );
  }

  return "The next Recommendation direction is still being formed.";
}

function createHighRiskHeadline(
  risk:
    RecommendationPredictedRisk,
): string {
  switch (
    risk.type
  ) {
    case "premature-advance-risk":
      return "The Recommendation may advance before sufficient evidence is available.";

    case "persistent-observation-risk":
      return "The Recommendation may remain in observation without a meaningful transition.";

    case "stagnation-risk":
      return "The current Recommendation may stop producing measurable progress.";

    case "fragmentation-risk":
      return "The Recommendation direction may become increasingly fragmented.";

    case "strategy-oscillation-risk":
      return "The Runtime may continue switching between competing strategies.";

    case "state-oscillation-risk":
      return "The Recommendation may continue moving between unstable states.";

    case "redirection-risk":
      return "Another meaningful redirection may be approaching.";

    case "confidence-degradation-risk":
      return "Confidence in the current Recommendation direction may continue to weaken.";

    case "completion-failure-risk":
      return "The current Recommendation may not reach a reliable completion point.";

    case "adaptation-conflict-risk":
      return "Competing Adaptive Learning signals may produce inconsistent guidance.";
  }
}

function createOpportunityHeadline(
  opportunity:
    RecommendationPredictedOpportunity,
): string {
  switch (
    opportunity.type
  ) {
    case "stabilization-likelihood":
      return "The Recommendation flow is showing an opportunity to become more stable.";

    case "recovery-likelihood":
      return "The current Recommendation flow may be entering a recovery path.";

    case "progress-likelihood":
      return "The current Recommendation is showing a meaningful opportunity for progress.";

    case "completion-likelihood":
      return "The current Recommendation may be approaching completion.";

    case "successful-advance-likelihood":
      return "The Recommendation may be ready to advance without excessive instability.";

    case "productive-clarification-likelihood":
      return "A small clarification may significantly improve the Recommendation direction.";

    case "signal-confirmation-likelihood":
      return "Additional evidence may soon confirm the emerging Recommendation direction.";
  }
}

/* ------------------------------------------------------------------ */
/* Summary                                                            */
/* ------------------------------------------------------------------ */

function createPredictiveSummary(
  params: {
    analysis:
      RecommendationPredictiveIntelligence;

    primaryState:
      RecommendationPredictedState | null;

    primaryStrategy:
      RecommendationPredictedStrategy | null;

    primaryRuntimeDecision:
      RecommendationPredictedRuntimeDecision | null;
  },
): string {
  if (
    params.analysis.state ===
    "unavailable"
  ) {
    return (
      "No Recommendation Memory Entry is available, so the Runtime cannot " +
      "estimate a future State, Strategy, or Decision."
    );
  }

  if (
    params.analysis.state ===
    "insufficient"
  ) {
    return (
      `The Runtime reviewed ${params.analysis.statistics.memoryEntryCount} ` +
      `Memory Entry or Entries and ${params.analysis.statistics.comparisonCount} ` +
      "Comparison samples. More repeated evidence is required before the " +
      "prediction becomes reliable."
    );
  }

  const parts:
    string[] = [];

  if (
    params.primaryState !==
    null
  ) {
    parts.push(
      `${formatState(
        params.primaryState.state,
      )} is the strongest State candidate at ${formatPercent(
        params.primaryState.scores.probability,
      )}.`,
    );
  }

  if (
    params.primaryStrategy !==
    null
  ) {
    parts.push(
      `${formatStrategy(
        params.primaryStrategy.strategyType,
      )} is the strongest Strategy candidate at ${formatPercent(
        params.primaryStrategy.scores.probability,
      )}.`,
    );
  }

  if (
    params.primaryRuntimeDecision !==
    null
  ) {
    parts.push(
      `${formatRuntimeDecision(
        params.primaryRuntimeDecision.decisionType,
      )} is the most likely Runtime response.`,
    );
  }

  parts.push(
    `Overall prediction confidence is ${formatPercent(
      params.analysis.confidence,
    )}.`,
  );

  return parts.join(
    " ",
  );
}

/* ------------------------------------------------------------------ */
/* Primary Prediction                                                 */
/* ------------------------------------------------------------------ */

function createPrimaryPredictionDescription(
  params: {
    analysis:
      RecommendationPredictiveIntelligence;

    primaryState:
      RecommendationPredictedState | null;

    primaryStrategy:
      RecommendationPredictedStrategy | null;

    primaryRuntimeDecision:
      RecommendationPredictedRuntimeDecision | null;

    primaryRisk:
      RecommendationPredictedRisk | null;

    primaryOpportunity:
      RecommendationPredictedOpportunity | null;
  },
): string | null {
  if (
    params.analysis.state ===
    "unavailable"
  ) {
    return null;
  }

  if (
    params.analysis.primarySignalType ===
      "prediction-conflicted" &&
    params.primaryRisk !==
      null &&
    params.primaryOpportunity !==
      null
  ) {
    return (
      `${params.primaryRisk.type} and ` +
      `${params.primaryOpportunity.type} are both supported by the current evidence.`
    );
  }

  switch (
    params.analysis.primarySignalType
  ) {
    case "state-transition-likely":
      return params.primaryState ===
        null
        ? null
        : (
          `${formatState(
            params.primaryState.state,
          )} is the primary predicted transition.`
        );

    case "strategy-transition-likely":
      return params.primaryStrategy ===
        null
        ? null
        : (
          `${formatStrategy(
            params.primaryStrategy.strategyType,
          )} is the primary predicted strategy.`
        );

    case "runtime-decision-likely":
      return params.primaryRuntimeDecision ===
        null
        ? null
        : (
          `${formatRuntimeDecision(
            params.primaryRuntimeDecision.decisionType,
          )} is the primary predicted Runtime response.`
        );

    case "risk-elevated":
      return params.primaryRisk ===
        null
        ? null
        : params.primaryRisk.description;

    case "opportunity-detected":
      return params.primaryOpportunity ===
        null
        ? null
        : params.primaryOpportunity.description;

    case "prediction-stable":
      return "The current predictive direction is comparatively stable.";

    case "prediction-conflicted":
      return "Multiple future Recommendation directions remain meaningfully supported.";

    case "insufficient-prediction-data":
      return "More Recommendation history is required before a primary prediction can be established.";

    case null:
      return params.primaryState ===
        null
        ? null
        : (
          `${formatState(
            params.primaryState.state,
          )} is currently the strongest prediction candidate.`
        );
  }
}

/* ------------------------------------------------------------------ */
/* Primary Prediction Descriptions                                    */
/* ------------------------------------------------------------------ */

function createNextStateDescription(
  prediction:
    RecommendationPredictedState | null,
): string | null {
  if (
    prediction ===
    null
  ) {
    return null;
  }

  return (
    `${formatState(
      prediction.state,
    )} is predicted with ${formatPercent(
      prediction.scores.probability,
    )} relative probability and ${formatPercent(
      prediction.scores.confidence,
    )} confidence.`
  );
}

function createNextStrategyDescription(
  prediction:
    RecommendationPredictedStrategy | null,
): string | null {
  if (
    prediction ===
    null
  ) {
    return null;
  }

  return (
    `${formatStrategy(
      prediction.strategyType,
    )} is the most likely next strategy. ` +
    `Its relative probability is ${formatPercent(
      prediction.scores.probability,
    )}.`
  );
}

function createRuntimeDecisionDescription(
  prediction:
    RecommendationPredictedRuntimeDecision | null,
): string | null {
  if (
    prediction ===
    null
  ) {
    return null;
  }

  return (
    `The Runtime is most likely to ${formatRuntimeDecision(
      prediction.decisionType,
    )}. ` +
    "This remains a prediction and has not been executed."
  );
}

/* ------------------------------------------------------------------ */
/* Risk Description                                                   */
/* ------------------------------------------------------------------ */

function createRiskOutlook(
  risk:
    RecommendationPredictedRisk | null,
): string | null {
  if (
    risk ===
    null
  ) {
    return null;
  }

  const severity =
    formatSeverity(
      risk.severity,
    );

  return (
    `${risk.description} ` +
    `This is the primary ${severity} risk candidate with ` +
    `${formatPercent(
      risk.scores.probability,
    )} relative probability.`
  );
}

/* ------------------------------------------------------------------ */
/* Opportunity Description                                            */
/* ------------------------------------------------------------------ */

function createOpportunityOutlook(
  opportunity:
    RecommendationPredictedOpportunity | null,
): string | null {
  if (
    opportunity ===
    null
  ) {
    return null;
  }

  const severity =
    formatSeverity(
      opportunity.severity,
    );

  return (
    `${opportunity.description} ` +
    `This is the primary ${severity} opportunity signal with ` +
    `${formatPercent(
      opportunity.scores.probability,
    )} relative probability.`
  );
}

/* ------------------------------------------------------------------ */
/* Confidence Disclosure                                              */
/* ------------------------------------------------------------------ */

function createPredictionUncertaintyDescription(
  params: {
    analysis:
      RecommendationPredictiveIntelligence;

    primaryConflict:
      RecommendationPredictionConflict | null;
  },
): string {
  if (
    params.analysis.state ===
    "unavailable"
  ) {
    return "Uncertainty cannot yet be estimated because no predictive evidence is available.";
  }

  if (
    params.analysis.state ===
    "insufficient"
  ) {
    return "Uncertainty is high because the available Recommendation history is still too short.";
  }

  if (
    params.primaryConflict !==
    null
  ) {
    return (
      `${params.primaryConflict.description} ` +
      `Conflict strength is ${formatPercent(
        params.primaryConflict.score,
      )}.`
    );
  }

  if (
    params.analysis.scores.predictionConfidence >=
      0.7
  ) {
    return "The current prediction is comparatively clear, but it should still be treated as a conditional estimate.";
  }

  if (
    params.analysis.scores.predictionConfidence >=
      0.4
  ) {
    return "The prediction has moderate support, but the next transition may still change as new evidence arrives.";
  }

  return "The current evidence remains weak, so the predicted direction should be treated as provisional.";
}

/* ------------------------------------------------------------------ */
/* Warnings                                                           */
/* ------------------------------------------------------------------ */

function createPredictionWarnings(
  params: {
    analysis:
      RecommendationPredictiveIntelligence;

    primaryRisk:
      RecommendationPredictedRisk | null;

    primaryConflict:
      RecommendationPredictionConflict | null;
  },
): string[] {
  const warnings:
    string[] = [];

  if (
    params.analysis.state ===
    "unavailable"
  ) {
    warnings.push(
      "No Recommendation Memory is available for prediction.",
    );
  }

  if (
    params.analysis.state ===
    "insufficient"
  ) {
    warnings.push(
      "Prediction quality is limited by insufficient historical evidence.",
    );
  }

  if (
    params.analysis.scores.predictionConfidence <
      0.35
  ) {
    warnings.push(
      "Overall prediction confidence is low.",
    );
  }

  if (
    params.analysis.scores.temporalConsistency <
      0.35 &&
    params.analysis.statistics.comparisonCount >
      0
  ) {
    warnings.push(
      "Recent Recommendation changes do not yet form a temporally consistent pattern.",
    );
  }

  if (
    params.analysis.scores.conflictRisk >=
      0.35
  ) {
    warnings.push(
      "Multiple prediction paths are supported by the current evidence.",
    );
  }

  if (
    params.primaryConflict !==
    null
  ) {
    warnings.push(
      params.primaryConflict.description,
    );
  }

  if (
    params.primaryRisk !==
      null &&
    (
      params.primaryRisk.severity ===
        "high" ||
      params.primaryRisk.severity ===
        "moderate"
    )
  ) {
    warnings.push(
      params.primaryRisk.description,
    );
  }

  if (
    params.analysis.context.conflictedAdaptationRuleIds.length >
      0
  ) {
    warnings.push(
      `${params.analysis.context.conflictedAdaptationRuleIds.length} Adaptive Learning rule or rules remain conflicted.`,
    );
  }

  return uniqueStrings(
    warnings,
  );
}

/* ------------------------------------------------------------------ */
/* Evidence                                                           */
/* ------------------------------------------------------------------ */

function createPredictionEvidence(
  params: {
    analysis:
      RecommendationPredictiveIntelligence;

    primaryState:
      RecommendationPredictedState | null;

    primaryStrategy:
      RecommendationPredictedStrategy | null;

    primaryRuntimeDecision:
      RecommendationPredictedRuntimeDecision | null;

    primaryRisk:
      RecommendationPredictedRisk | null;

    primaryOpportunity:
      RecommendationPredictedOpportunity | null;
  },
): string[] {
  const evidence:
    string[] = [];

  evidence.push(
    `${params.analysis.statistics.memoryEntryCount} Recommendation Memory Entry or Entries were reviewed.`,
  );

  evidence.push(
    `${params.analysis.statistics.comparisonCount} Memory Comparison sample or samples were used.`,
  );

  if (
    params.analysis.statistics.learningObservationCount >
    0
  ) {
    evidence.push(
      `${params.analysis.statistics.learningObservationCount} Adaptive Learning Observation or Observations contributed evidence.`,
    );
  }

  if (
    params.analysis.statistics.activeAdaptationRuleCount >
    0
  ) {
    evidence.push(
      `${params.analysis.statistics.activeAdaptationRuleCount} active Adaptation Rule or Rules influenced the prediction.`,
    );
  }

  if (
    params.primaryState !==
    null
  ) {
    evidence.push(
      `Primary State evidence supports ${formatState(
        params.primaryState.state,
      )} at ${formatPercent(
        params.primaryState.scores.probability,
      )}.`,
    );
  }

  if (
    params.primaryStrategy !==
    null
  ) {
    evidence.push(
      `Primary Strategy evidence supports ${formatStrategy(
        params.primaryStrategy.strategyType,
      )} at ${formatPercent(
        params.primaryStrategy.scores.probability,
      )}.`,
    );
  }

  if (
    params.primaryRuntimeDecision !==
    null
  ) {
    evidence.push(
      `The leading Runtime Decision candidate is ${formatRuntimeDecision(
        params.primaryRuntimeDecision.decisionType,
      )}.`,
    );
  }

  if (
    params.primaryRisk !==
    null
  ) {
    evidence.push(
      `${params.primaryRisk.type} is the strongest Risk candidate.`,
    );
  }

  if (
    params.primaryOpportunity !==
    null
  ) {
    evidence.push(
      `${params.primaryOpportunity.type} is the strongest Opportunity candidate.`,
    );
  }

  if (
    params.analysis.context.currentMemorySignalTypes.length >
    0
  ) {
    evidence.push(
      `Current Memory signals include ${params.analysis.context.currentMemorySignalTypes.join(
        ", ",
      )}.`,
    );
  }

  return uniqueStrings(
    evidence,
  );
}

/* ------------------------------------------------------------------ */
/* Primary Conflict                                                   */
/* ------------------------------------------------------------------ */

function getPrimaryPredictionConflict(
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
      (
        left,
        right,
      ) => {
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
      },
    );

  return sorted[
    0
  ] ??
    null;
}

/* ------------------------------------------------------------------ */
/* Formatting                                                         */
/* ------------------------------------------------------------------ */

function formatState(
  state:
    RecommendationPredictedState[
      "state"
    ],
): string {
  switch (
    state
  ) {
    case "unavailable":
      return "an unavailable state";

    case "observing":
      return "continued observation";

    case "stable":
      return "a stable state";

    case "progressing":
      return "a progressing state";

    case "stalled":
      return "a stalled state";

    case "fragmented":
      return "a fragmented state";

    case "advancing":
      return "an advancing state";
  }
}

function formatStrategy(
  strategyType:
    RecommendationPredictedStrategy[
      "strategyType"
    ],
): string {
  switch (
    strategyType
  ) {
    case "observe":
      return "continued observation";

    case "maintain":
      return "maintenance";

    case "clarify":
      return "clarification";

    case "narrow":
      return "scope narrowing";

    case "confirm-completion":
      return "completion confirmation";

    case "advance":
      return "advancement";

    case "stabilize":
      return "stabilization";

    case "reconsider":
      return "reconsideration";
  }
}

function formatRuntimeDecision(
  decisionType:
    RecommendationPredictedRuntimeDecision[
      "decisionType"
    ],
): string {
  switch (
    decisionType
  ) {
    case "request-completion-confirmation":
      return "request completion confirmation";

    case "reconsider-current-recommendation":
      return "reconsider the current Recommendation";

    case "reduce-direction-changes":
      return "reduce further direction changes";

    case "request-progress-evidence":
      return "request additional progress evidence";

    case "narrow-current-recommendation":
      return "narrow the current Recommendation";

    case "clarify-current-recommendation":
      return "clarify the current Recommendation";

    case "preserve-current-recommendation":
      return "preserve the current Recommendation";

    case "allow-new-recommendation":
      return "allow a new Recommendation";

    case "block-new-recommendation":
      return "delay or block a new Recommendation";
  }
}

function formatSeverity(
  severity:
    RecommendationPredictionSeverity,
): string {
  switch (
    severity
  ) {
    case "informational":
      return "informational";

    case "low":
      return "low-strength";

    case "moderate":
      return "moderate-strength";

    case "high":
      return "high-strength";
  }
}

function formatPercent(
  value:
    number,
): string {
  return `${roundScore(
    clampUnitInterval(
      value,
    ) *
    100,
  )}%`;
}

/* ------------------------------------------------------------------ */
/* Public Validation                                                  */
/* ------------------------------------------------------------------ */

export function validateRecommendationPredictivePresentation(
  params:
    ValidateRecommendationPredictivePresentationParams,
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
      "Validate Recommendation Predictive Presentation params must be an object.",
    );
  }

  const {
    analysis,
    presentation,
  } = params;

  if (
    typeof analysis !==
      "object" ||
    analysis ===
      null ||
    Array.isArray(
      analysis,
    )
  ) {
    throw new Error(
      "Recommendation Predictive Intelligence must be an object.",
    );
  }

  if (
    typeof presentation !==
      "object" ||
    presentation ===
      null ||
    Array.isArray(
      presentation,
    )
  ) {
    throw new Error(
      "Recommendation Predictive Presentation must be an object.",
    );
  }

  if (
    !isRecommendationPredictivePresentationTone(
      presentation.tone,
    )
  ) {
    throw new Error(
      "Recommendation Predictive Presentation tone is invalid.",
    );
  }

  validateRequiredString(
    presentation.headline,
    "presentation.headline",
  );

  validateRequiredString(
    presentation.summary,
    "presentation.summary",
  );

  validateNullableString(
    presentation.primaryPrediction,
    "presentation.primaryPrediction",
  );

  validateNullableString(
    presentation.statePrediction,
    "presentation.statePrediction",
  );

  validateNullableString(
    presentation.strategyPrediction,
    "presentation.strategyPrediction",
  );

  validateNullableString(
    presentation.decisionPrediction,
    "presentation.decisionPrediction",
  );

  validateNullableString(
    presentation.riskDescription,
    "presentation.riskDescription",
  );

  validateNullableString(
    presentation.opportunityDescription,
    "presentation.opportunityDescription",
  );

  validateRequiredString(
    presentation.confidenceDisclosure,
    "presentation.confidenceDisclosure",
  );

  validateUniqueStringArray(
    presentation.warnings,
    "presentation.warnings",
  );

  validateUniqueStringArray(
    presentation.evidence,
    "presentation.evidence",
  );

  if (
    presentation.warnings.length >
    MAXIMUM_WARNING_COUNT
  ) {
    throw new Error(
      `Presentation warnings must not exceed ${MAXIMUM_WARNING_COUNT}.`,
    );
  }

  if (
    presentation.evidence.length >
    MAXIMUM_EVIDENCE_COUNT
  ) {
    throw new Error(
      `Presentation evidence must not exceed ${MAXIMUM_EVIDENCE_COUNT}.`,
    );
  }

  validateTimestamp(
    presentation.createdAt,
    "presentation.createdAt",
  );

  validateTimestampOrder(
    analysis.predictedAt,
    presentation.createdAt,
    "analysis.predictedAt",
    "presentation.createdAt",
  );

  validatePresentationStateConsistency({
    analysis,

    presentation,
  });
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validateCreateRecommendationPredictivePresentationParams(
  params:
    CreateRecommendationPredictivePresentationParams,
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
      "Create Recommendation Predictive Presentation params must be an object.",
    );
  }

  validateRecommendationPredictiveIntelligence({
    memory:
      params.memory,

    memoryAnalysis:
      params.memoryAnalysis,

    adaptiveLearningAnalysis:
      params.adaptiveLearningAnalysis,

    analysis:
      params.analysis,
  });

  validateTimestamp(
    params.createdAt,
    "createdAt",
  );

  validateTimestampOrder(
    params.analysis.predictedAt,
    params.createdAt,
    "analysis.predictedAt",
    "createdAt",
  );
}

/* ------------------------------------------------------------------ */
/* Presentation Consistency                                           */
/* ------------------------------------------------------------------ */

function validatePresentationStateConsistency(
  params: {
    analysis:
      RecommendationPredictiveIntelligence;

    presentation:
      RecommendationPredictivePresentation;
  },
): void {
  if (
    params.analysis.state ===
      "unavailable" &&
    params.presentation.tone !==
      "unavailable"
  ) {
    throw new Error(
      "Unavailable Predictive Intelligence must use unavailable presentation tone.",
    );
  }

  if (
    params.analysis.state ===
      "conflicted" &&
    params.presentation.tone !==
      "attention"
  ) {
    throw new Error(
      "Conflicted Predictive Intelligence must use attention presentation tone.",
    );
  }

  if (
    params.analysis.predictedStates.length ===
      0 &&
    params.presentation.statePrediction !==
      null
  ) {
    throw new Error(
      "Presentation statePrediction must be null when no State Prediction exists.",
    );
  }

  if (
    params.analysis.predictedStrategies.length ===
      0 &&
    params.presentation.strategyPrediction !==
      null
  ) {
    throw new Error(
      "Presentation strategyPrediction must be null when no Strategy Prediction exists.",
    );
  }

  if (
    params.analysis.predictedRuntimeDecisions.length ===
      0 &&
    params.presentation.decisionPrediction !==
      null
  ) {
    throw new Error(
      "Presentation decisionPrediction must be null when no Runtime Decision Prediction exists.",
    );
  }

  if (
    params.analysis.predictedRisks.length ===
      0 &&
    params.presentation.riskDescription !==
      null
  ) {
    throw new Error(
      "Presentation riskDescription must be null when no Risk Prediction exists.",
    );
  }

  if (
    params.analysis.predictedOpportunities.length ===
      0 &&
    params.presentation.opportunityDescription !==
      null
  ) {
    throw new Error(
      "Presentation opportunityDescription must be null when no Opportunity Prediction exists.",
    );
  }

  if (
    params.analysis.state ===
      "unavailable" &&
    params.presentation.primaryPrediction !==
      null
  ) {
    throw new Error(
      "Presentation primaryPrediction must be null when Predictive Intelligence is unavailable.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Clone                                                              */
/* ------------------------------------------------------------------ */

export function cloneRecommendationPredictivePresentation(
  presentation:
    RecommendationPredictivePresentation,
): RecommendationPredictivePresentation {
  return {
    ...presentation,

    warnings: [
      ...presentation.warnings,
    ],

    evidence: [
      ...presentation.evidence,
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Query Helpers                                                      */
/* ------------------------------------------------------------------ */

export function hasRecommendationPredictivePresentationWarning(
  presentation:
    RecommendationPredictivePresentation,
): boolean {
  return presentation.warnings.length >
    0;
}

export function hasRecommendationPredictivePrimaryPrediction(
  presentation:
    RecommendationPredictivePresentation,
): boolean {
  return presentation.primaryPrediction !==
    null;
}

export function hasRecommendationPredictiveRiskDescription(
  presentation:
    RecommendationPredictivePresentation,
): boolean {
  return presentation.riskDescription !==
    null;
}

export function hasRecommendationPredictiveOpportunityDescription(
  presentation:
    RecommendationPredictivePresentation,
): boolean {
  return presentation.opportunityDescription !==
    null;
}

/**
 * 기존 호출부와의 호환성을 위해 Outlook 이름도 유지합니다.
 */
export function hasRecommendationPredictiveRiskOutlook(
  presentation:
    RecommendationPredictivePresentation,
): boolean {
  return hasRecommendationPredictiveRiskDescription(
    presentation,
  );
}

export function hasRecommendationPredictiveOpportunityOutlook(
  presentation:
    RecommendationPredictivePresentation,
): boolean {
  return hasRecommendationPredictiveOpportunityDescription(
    presentation,
  );
}

export function isRecommendationPredictivePresentationActionable(
  presentation:
    RecommendationPredictivePresentation,
): boolean {
  return (
    presentation.tone !==
      "unavailable" &&
    (
      presentation.strategyPrediction !==
        null ||
      presentation.decisionPrediction !==
        null
    )
  );
}

/* ------------------------------------------------------------------ */
/* Generic Helpers                                                    */
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
    SCORE_PRECISION,
  ) /
    SCORE_PRECISION;
}

function uniqueStrings<
  TValue extends string,
>(
  values:
    readonly TValue[],
): TValue[] {
  return Array.from(
    new Set(
      values.filter(
        (
          value,
        ) =>
          value.trim().length >
          0,
      ),
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Generic Validation Helpers                                         */
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

function validateNullableString(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string | null {
  if (
    value ===
    null
  ) {
    return;
  }

  validateRequiredString(
    value,
    fieldName,
  );
}

function validateUniqueStringArray(
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

  const observed =
    new Set<string>();

  values.forEach(
    (
      value,
      index,
    ) => {
      validateRequiredString(
        value,
        `${fieldName}[${index}]`,
      );

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

function validateTimestamp(
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