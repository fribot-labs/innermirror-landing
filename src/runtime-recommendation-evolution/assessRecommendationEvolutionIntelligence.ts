import type {
    RecommendationEvolutionConfidence,
    RecommendationEvolutionResult,
} from "./recommendationEvolutionTypes";

import type {
    AssessRecommendationEvolutionIntelligenceParams,
    RecommendationEvolutionIntelligenceAssessment,
    RecommendationEvolutionIntelligenceScores,
    RecommendationEvolutionIntelligenceSignal,
    RecommendationEvolutionIntelligenceSignalConfidence,
    RecommendationEvolutionIntelligenceSignalType,
    RecommendationEvolutionIntelligenceState,
} from "./recommendationEvolutionIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Signal을 종합하여
 * 현재 Recommendation 흐름의 Intelligence Assessment를 생성합니다.
 *
 * 판정 우선순위:
 *
 * 1. unavailable
 * 2. observing
 * 3. fragmented
 * 4. stalled
 * 5. advancing
 * 6. progressing
 * 7. stable
 * 8. observing
 *
 * 이 함수는 입력 Evolution Result와 Signal을 변경하지 않는
 * 결정론적 순수 함수입니다.
 */
export function assessRecommendationEvolutionIntelligence(
  params:
    AssessRecommendationEvolutionIntelligenceParams,
): RecommendationEvolutionIntelligenceAssessment {
  validateParams(
    params,
  );

  const {
    evolution,
    signals,
  } = params;

  const scores =
    createAssessmentScores({
      evolution,
      signals,
    });

  const state =
    resolveIntelligenceState({
      evolution,
      signals,
      scores,
    });

  const primarySignal =
    selectPrimarySignalForState({
      state,
      signals,
    });

  const confidence =
    resolveAssessmentConfidence({
      evolution,
      signals,
      state,
      primarySignal,
    });

  const decisions =
    resolveAssessmentDecisionFlags({
      state,
      signals,
      scores,
    });

  return {
    state,

    confidence,

    scores,

    primarySignalType:
      primarySignal?.type ??
      null,

    needsObservation:
      resolveNeedsObservation({
        state,
        signals,
        confidence,
      }),

    shouldMaintainCurrentRecommendation:
      decisions.shouldMaintainCurrentRecommendation,

    shouldRefineRecommendation:
      decisions.shouldRefineRecommendation,

    shouldConfirmCompletion:
      decisions.shouldConfirmCompletion,

    shouldStabilizeDirection:
      decisions.shouldStabilizeDirection,

    reasoning:
      createAssessmentReasoning({
        evolution,
        state,
        scores,
        primarySignal,
        signals,
      }),
  };
}

/* ------------------------------------------------------------------ */
/* Assessment Scores                                                  */
/* ------------------------------------------------------------------ */

type CreateAssessmentScoresParams = {
  evolution:
    RecommendationEvolutionResult;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];
};

function createAssessmentScores(
  params:
    CreateAssessmentScoresParams,
): RecommendationEvolutionIntelligenceScores {
  const {
    evolution,
    signals,
  } = params;

  return {
    stability:
      calculateStabilityScore(
        evolution,
        signals,
      ),

    progress:
      calculateProgressScore(
        evolution,
        signals,
      ),

    repetitionRisk:
      calculateRepetitionRiskScore(
        evolution,
        signals,
      ),

    redirectionRisk:
      calculateRedirectionRiskScore(
        evolution,
        signals,
      ),

    completionMomentum:
      calculateCompletionMomentumScore(
        evolution,
        signals,
      ),
  };
}

function calculateStabilityScore(
  evolution:
    RecommendationEvolutionResult,
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): number {
  let score =
    0;

  switch (
    evolution.summary.stability
  ) {
    case "highly-stable":
      score =
        1;
      break;

    case "stable":
      score =
        0.8;
      break;

    case "developing":
      score =
        0.5;
      break;

    case "unstable":
      score =
        0.15;
      break;

    case "unknown":
      score =
        0;
      break;
  }

  if (
    hasSignal(
      signals,
      "stable-continuation",
    )
  ) {
    score +=
      0.1;
  }

  if (
    hasSignal(
      signals,
      "stable-direction",
    )
  ) {
    score +=
      0.1;
  }

  if (
    hasSignal(
      signals,
      "frequent-redirection",
    )
  ) {
    score -=
      0.3;
  }

  if (
    hasSignal(
      signals,
      "high-drift",
    )
  ) {
    score -=
      0.35;
  }

  return clampScore(
    score,
  );
}

function calculateProgressScore(
  evolution:
    RecommendationEvolutionResult,
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): number {
  const {
    statistics,
  } = evolution;

  const transitionCount =
    statistics.transitionCount;

  const refinementRate =
    safeRatio(
      statistics.refinedTransitionCount,
      transitionCount,
    );

  const completionAdvanceRate =
    safeRatio(
      statistics.completionAdvanceCount,
      transitionCount,
    );

  let score =
    statistics.completionRate *
      0.45 +
    completionAdvanceRate *
      0.3 +
    refinementRate *
      0.25;

  if (
    hasSignal(
      signals,
      "productive-refinement",
    )
  ) {
    score +=
      0.1;
  }

  if (
    hasSignal(
      signals,
      "completion-momentum",
    )
  ) {
    score +=
      0.15;
  }

  if (
    hasSignal(
      signals,
      "unresolved-repetition",
    )
  ) {
    score -=
      0.2;
  }

  if (
    hasSignal(
      signals,
      "high-drift",
    )
  ) {
    score -=
      0.15;
  }

  return clampScore(
    score,
  );
}

function calculateRepetitionRiskScore(
  evolution:
    RecommendationEvolutionResult,
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): number {
  const repetitionRate =
    evolution.statistics
      .repetitionRate;

  const completionModifier =
    evolution.statistics
      .completionRate <
    0.3
      ? 1
      : 0.6;

  let score =
    repetitionRate *
    completionModifier;

  if (
    hasSignal(
      signals,
      "persistent-repetition",
    )
  ) {
    score +=
      0.15;
  }

  if (
    hasSignal(
      signals,
      "unresolved-repetition",
    )
  ) {
    score +=
      0.25;
  }

  if (
    hasSignal(
      signals,
      "completion-momentum",
    )
  ) {
    score -=
      0.2;
  }

  return clampScore(
    score,
  );
}

function calculateRedirectionRiskScore(
  evolution:
    RecommendationEvolutionResult,
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): number {
  const {
    statistics,
    summary,
  } = evolution;

  const redirectedRate =
    safeRatio(
      statistics.redirectedTransitionCount,
      statistics.transitionCount,
    );

  let score =
    redirectedRate *
      0.55 +
    statistics.supersessionRate *
      0.35;

  switch (
    summary.drift
  ) {
    case "high":
      score +=
        0.3;
      break;

    case "moderate":
      score +=
        0.15;
      break;

    case "low":
      score +=
        0.05;
      break;

    case "none":
    case "unknown":
      break;
  }

  if (
    hasSignal(
      signals,
      "frequent-redirection",
    )
  ) {
    score +=
      0.15;
  }

  if (
    hasSignal(
      signals,
      "premature-supersession",
    ) ||
    hasSignal(
      signals,
      "high-supersession-rate",
    )
  ) {
    score +=
      0.15;
  }

  return clampScore(
    score,
  );
}

function calculateCompletionMomentumScore(
  evolution:
    RecommendationEvolutionResult,
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): number {
  const {
    statistics,
    summary,
  } = evolution;

  const completionAdvanceRate =
    safeRatio(
      statistics.completionAdvanceCount,
      statistics.transitionCount,
    );

  let score =
    statistics.completionRate *
      0.6 +
    completionAdvanceRate *
      0.3;

  if (
    summary.latestType ===
    "completed-and-advanced"
  ) {
    score +=
      0.1;
  }

  if (
    hasSignal(
      signals,
      "completion-momentum",
    )
  ) {
    score +=
      0.15;
  }

  if (
    hasSignal(
      signals,
      "low-completion-rate",
    )
  ) {
    score -=
      0.25;
  }

  return clampScore(
    score,
  );
}

/* ------------------------------------------------------------------ */
/* Intelligence State                                                 */
/* ------------------------------------------------------------------ */

type ResolveIntelligenceStateParams = {
  evolution:
    RecommendationEvolutionResult;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];

  scores:
    RecommendationEvolutionIntelligenceScores;
};

function resolveIntelligenceState(
  params:
    ResolveIntelligenceStateParams,
): RecommendationEvolutionIntelligenceState {
  const {
    evolution,
    signals,
    scores,
  } = params;

  if (
    evolution.statistics
      .totalRecommendationCount ===
    0
  ) {
    return "unavailable";
  }

  if (
    !evolution.summary
      .hasSufficientHistory ||
    hasSignal(
      signals,
      "insufficient-history",
    )
  ) {
    return "observing";
  }

  if (
    hasSignal(
      signals,
      "high-drift",
    ) ||
    hasSignal(
      signals,
      "frequent-redirection",
    ) ||
    scores.redirectionRisk >=
      0.65
  ) {
    return "fragmented";
  }

  if (
    hasSignal(
      signals,
      "unresolved-repetition",
    ) ||
    (
      hasSignal(
        signals,
        "persistent-repetition",
      ) &&
      scores.repetitionRisk >=
        0.6
    )
  ) {
    return "stalled";
  }

  if (
    hasSignal(
      signals,
      "completion-momentum",
    ) &&
    scores.completionMomentum >=
      0.55
  ) {
    return "advancing";
  }

  if (
    hasSignal(
      signals,
      "productive-refinement",
    ) ||
    scores.progress >=
      0.55
  ) {
    return "progressing";
  }

  if (
    hasSignal(
      signals,
      "stable-continuation",
    ) ||
    hasSignal(
      signals,
      "stable-direction",
    ) ||
    scores.stability >=
      0.65
  ) {
    return "stable";
  }

  return "observing";
}

/* ------------------------------------------------------------------ */
/* Primary Signal                                                     */
/* ------------------------------------------------------------------ */

type SelectPrimarySignalForStateParams = {
  state:
    RecommendationEvolutionIntelligenceState;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];
};

function selectPrimarySignalForState(
  params:
    SelectPrimarySignalForStateParams,
): RecommendationEvolutionIntelligenceSignal | null {
  const {
    state,
    signals,
  } = params;

  const preferredTypes =
    getPreferredSignalTypesForState(
      state,
    );

  for (const type of preferredTypes) {
    const matched =
      findHighestPrioritySignalByType(
        signals,
        type,
      );

    if (matched !== null) {
      return matched;
    }
  }

  return selectHighestPrioritySignal(
    signals,
  );
}

function getPreferredSignalTypesForState(
  state:
    RecommendationEvolutionIntelligenceState,
): RecommendationEvolutionIntelligenceSignalType[] {
  switch (state) {
    case "unavailable":
      return [
        "insufficient-history",
        "observation-needed",
      ];

    case "observing":
      return [
        "insufficient-history",
        "observation-needed",
        "decreasing-confidence",
      ];

    case "stable":
      return [
        "stable-continuation",
        "stable-direction",
      ];

    case "progressing":
      return [
        "productive-refinement",
        "increasing-confidence",
      ];

    case "stalled":
      return [
        "unresolved-repetition",
        "persistent-repetition",
        "low-completion-rate",
      ];

    case "fragmented":
      return [
        "high-drift",
        "frequent-redirection",
        "premature-supersession",
        "high-supersession-rate",
      ];

    case "advancing":
      return [
        "completion-momentum",
        "productive-refinement",
      ];
  }
}

function findHighestPrioritySignalByType(
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
  type:
    RecommendationEvolutionIntelligenceSignalType,
): RecommendationEvolutionIntelligenceSignal | null {
  let selected:
    RecommendationEvolutionIntelligenceSignal | null = null;

  for (const signal of signals) {
    if (
      signal.type !==
      type
    ) {
      continue;
    }

    if (
      selected === null ||
      compareSignalPriority(
        signal,
        selected,
      ) >
        0
    ) {
      selected =
        signal;
    }
  }

  return selected;
}

function selectHighestPrioritySignal(
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): RecommendationEvolutionIntelligenceSignal | null {
  let selected:
    RecommendationEvolutionIntelligenceSignal | null = null;

  for (const signal of signals) {
    if (
      selected === null ||
      compareSignalPriority(
        signal,
        selected,
      ) >
        0
    ) {
      selected =
        signal;
    }
  }

  return selected;
}

function compareSignalPriority(
  left:
    RecommendationEvolutionIntelligenceSignal,
  right:
    RecommendationEvolutionIntelligenceSignal,
): number {
  const severityDifference =
    severityWeight(
      left.severity,
    ) -
    severityWeight(
      right.severity,
    );

  if (
    severityDifference !==
    0
  ) {
    return severityDifference;
  }

  const scoreDifference =
    left.score -
    right.score;

  if (
    scoreDifference !==
    0
  ) {
    return scoreDifference;
  }

  return (
    confidenceWeight(
      left.confidence,
    ) -
    confidenceWeight(
      right.confidence,
    )
  );
}

/* ------------------------------------------------------------------ */
/* Assessment Confidence                                              */
/* ------------------------------------------------------------------ */

type ResolveAssessmentConfidenceParams = {
  evolution:
    RecommendationEvolutionResult;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];

  state:
    RecommendationEvolutionIntelligenceState;

  primarySignal:
    RecommendationEvolutionIntelligenceSignal | null;
};

function resolveAssessmentConfidence(
  params:
    ResolveAssessmentConfidenceParams,
): RecommendationEvolutionIntelligenceSignalConfidence {
  const {
    evolution,
    signals,
    state,
    primarySignal,
  } = params;

  if (
    state ===
      "unavailable" ||
    evolution.dataQuality ===
      "insufficient"
  ) {
    return "low";
  }

  if (
    state ===
      "observing" ||
    evolution.confidence ===
      "low" ||
    hasSignal(
      signals,
      "observation-needed",
    )
  ) {
    return "low";
  }

  if (
    primarySignal !==
      null &&
    primarySignal.confidence ===
      "high" &&
    evolution.confidence ===
      "high" &&
    evolution.dataQuality ===
      "sufficient"
  ) {
    return "high";
  }

  if (
    primarySignal !==
      null &&
    primarySignal.confidence ===
      "low"
  ) {
    return "low";
  }

  return "medium";
}

/* ------------------------------------------------------------------ */
/* Assessment Decision Flags                                          */
/* ------------------------------------------------------------------ */

type AssessmentDecisionFlags = {
  shouldMaintainCurrentRecommendation:
    boolean;

  shouldRefineRecommendation:
    boolean;

  shouldConfirmCompletion:
    boolean;

  shouldStabilizeDirection:
    boolean;
};

type ResolveAssessmentDecisionFlagsParams = {
  state:
    RecommendationEvolutionIntelligenceState;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];

  scores:
    RecommendationEvolutionIntelligenceScores;
};

function resolveAssessmentDecisionFlags(
  params:
    ResolveAssessmentDecisionFlagsParams,
): AssessmentDecisionFlags {
  const {
    state,
    signals,
    scores,
  } = params;

  switch (state) {
    case "unavailable":
      return {
        shouldMaintainCurrentRecommendation:
          false,

        shouldRefineRecommendation:
          false,

        shouldConfirmCompletion:
          false,

        shouldStabilizeDirection:
          false,
      };

    case "observing":
      return {
        shouldMaintainCurrentRecommendation:
          true,

        shouldRefineRecommendation:
          false,

        shouldConfirmCompletion:
          false,

        shouldStabilizeDirection:
          false,
      };

    case "stable":
      return {
        shouldMaintainCurrentRecommendation:
          true,

        shouldRefineRecommendation:
          false,

        shouldConfirmCompletion:
          false,

        shouldStabilizeDirection:
          false,
      };

    case "progressing":
      return {
        shouldMaintainCurrentRecommendation:
          true,

        shouldRefineRecommendation:
          true,

        shouldConfirmCompletion:
          false,

        shouldStabilizeDirection:
          false,
      };

    case "stalled":
      return {
        shouldMaintainCurrentRecommendation:
          true,

        shouldRefineRecommendation:
          false,

        shouldConfirmCompletion:
          true,

        shouldStabilizeDirection:
          false,
      };

    case "fragmented":
      return {
        shouldMaintainCurrentRecommendation:
          false,

        shouldRefineRecommendation:
          false,

        shouldConfirmCompletion:
          false,

        shouldStabilizeDirection:
          true,
      };

    case "advancing":
      return {
        shouldMaintainCurrentRecommendation:
          false,

        shouldRefineRecommendation:
          scores.progress >=
          0.7,

        shouldConfirmCompletion:
          !hasSignal(
            signals,
            "completion-momentum",
          ),

        shouldStabilizeDirection:
          false,
      };
  }
}

/* ------------------------------------------------------------------ */
/* Observation                                                        */
/* ------------------------------------------------------------------ */

type ResolveNeedsObservationParams = {
  state:
    RecommendationEvolutionIntelligenceState;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];

  confidence:
    RecommendationEvolutionIntelligenceSignalConfidence;
};

function resolveNeedsObservation(
  params:
    ResolveNeedsObservationParams,
): boolean {
  return (
    params.state ===
      "unavailable" ||
    params.state ===
      "observing" ||
    params.confidence ===
      "low" ||
    hasSignal(
      params.signals,
      "observation-needed",
    ) ||
    hasSignal(
      params.signals,
      "decreasing-confidence",
    )
  );
}

/* ------------------------------------------------------------------ */
/* Reasoning                                                          */
/* ------------------------------------------------------------------ */

type CreateAssessmentReasoningParams = {
  evolution:
    RecommendationEvolutionResult;

  state:
    RecommendationEvolutionIntelligenceState;

  scores:
    RecommendationEvolutionIntelligenceScores;

  primarySignal:
    RecommendationEvolutionIntelligenceSignal | null;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];
};

function createAssessmentReasoning(
  params:
    CreateAssessmentReasoningParams,
): string[] {
  const {
    evolution,
    state,
    scores,
    primarySignal,
    signals,
  } = params;

  const reasoning:
    string[] = [];

  reasoning.push(
    createStateReasoning(
      state,
    ),
  );

  if (
    primarySignal !==
    null
  ) {
    reasoning.push(
      `Primary signal "${primarySignal.type}" was selected with score ${formatScore(primarySignal.score)}.`,
    );
  }

  reasoning.push(
    `Stability score is ${formatScore(scores.stability)} and progress score is ${formatScore(scores.progress)}.`,
  );

  if (
    scores.repetitionRisk >=
    0.5
  ) {
    reasoning.push(
      `Repetition risk is elevated at ${formatScore(scores.repetitionRisk)}.`,
    );
  }

  if (
    scores.redirectionRisk >=
    0.5
  ) {
    reasoning.push(
      `Redirection risk is elevated at ${formatScore(scores.redirectionRisk)}.`,
    );
  }

  if (
    scores.completionMomentum >=
    0.5
  ) {
    reasoning.push(
      `Completion momentum is present at ${formatScore(scores.completionMomentum)}.`,
    );
  }

  if (
    hasSignal(
      signals,
      "observation-needed",
    )
  ) {
    reasoning.push(
      "Additional observation is required before making a strong Recommendation strategy change.",
    );
  }

  if (
    evolution.dataQuality !==
    "sufficient"
  ) {
    reasoning.push(
      `Evolution data quality is "${evolution.dataQuality}".`,
    );
  }

  return uniqueStrings(
    reasoning,
  );
}

function createStateReasoning(
  state:
    RecommendationEvolutionIntelligenceState,
): string {
  switch (state) {
    case "unavailable":
      return "No analyzable Recommendation history is available.";

    case "observing":
      return "The Recommendation history is not yet sufficient for a stable intelligence judgment.";

    case "stable":
      return "The Recommendation direction remains stable without meaningful drift.";

    case "progressing":
      return "The Recommendation is becoming more actionable through refinement or measurable progress.";

    case "stalled":
      return "Repeated Recommendation activity is not accompanied by enough completion or progress evidence.";

    case "fragmented":
      return "Frequent redirection, supersession, or drift is weakening Recommendation continuity.";

    case "advancing":
      return "Completed Recommendations are creating momentum toward the next stage.";
  }
}

/* ------------------------------------------------------------------ */
/* Signal Helpers                                                     */
/* ------------------------------------------------------------------ */

function hasSignal(
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
  type:
    RecommendationEvolutionIntelligenceSignalType,
): boolean {
  return signals.some(
    (
      signal,
    ) =>
      signal.type ===
      type,
  );
}

function severityWeight(
  severity:
    RecommendationEvolutionIntelligenceSignal["severity"],
): number {
  switch (severity) {
    case "high":
      return 4;

    case "moderate":
      return 3;

    case "low":
      return 2;

    case "info":
      return 1;
  }
}

function confidenceWeight(
  confidence:
    RecommendationEvolutionConfidence,
): number {
  switch (confidence) {
    case "high":
      return 3;

    case "medium":
      return 2;

    case "low":
      return 1;
  }
}

/* ------------------------------------------------------------------ */
/* Numeric Helpers                                                    */
/* ------------------------------------------------------------------ */

function safeRatio(
  numerator:
    number,
  denominator:
    number,
): number {
  if (
    denominator <=
    0
  ) {
    return 0;
  }

  return clampScore(
    numerator /
      denominator,
  );
}

function clampScore(
  value:
    number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

function formatScore(
  value:
    number,
): string {
  return value
    .toFixed(
      2,
    );
}

function uniqueStrings(
  values:
    readonly string[],
): string[] {
  return [
    ...new Set(
      values,
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* Validation                                                         */
/* ------------------------------------------------------------------ */

function validateParams(
  params:
    AssessRecommendationEvolutionIntelligenceParams,
): void {
  if (
    params === null ||
    typeof params !==
      "object"
  ) {
    throw new Error(
      "params must be a valid AssessRecommendationEvolutionIntelligenceParams object.",
    );
  }

  validateEvolutionResult(
    params.evolution,
  );

  if (
    !Array.isArray(
      params.signals,
    )
  ) {
    throw new Error(
      "signals must be an array.",
    );
  }

  validateSignals(
    params.signals,
  );

  validateSignalComparisonReferences(
    params.evolution,
    params.signals,
  );
}

function validateEvolutionResult(
  evolution:
    RecommendationEvolutionResult,
): void {
  if (
    evolution === null ||
    typeof evolution !==
      "object"
  ) {
    throw new Error(
      "evolution must be a valid RecommendationEvolutionResult.",
    );
  }

  assertNonEmptyString(
    evolution.historyId,
    "evolution.historyId",
  );

  if (
    !Array.isArray(
      evolution.comparisons,
    )
  ) {
    throw new Error(
      "evolution.comparisons must be an array.",
    );
  }

  if (
    evolution.statistics ===
      null ||
    typeof evolution.statistics !==
      "object"
  ) {
    throw new Error(
      "evolution.statistics must be a valid object.",
    );
  }

  if (
    evolution.summary ===
      null ||
    typeof evolution.summary !==
      "object"
  ) {
    throw new Error(
      "evolution.summary must be a valid object.",
    );
  }

  assertRatio(
    evolution.statistics
      .completionRate,
    "evolution.statistics.completionRate",
  );

  assertRatio(
    evolution.statistics
      .supersessionRate,
    "evolution.statistics.supersessionRate",
  );

  assertRatio(
    evolution.statistics
      .repetitionRate,
    "evolution.statistics.repetitionRate",
  );

  assertNonNegativeInteger(
    evolution.statistics
      .totalRecommendationCount,
    "evolution.statistics.totalRecommendationCount",
  );

  assertNonNegativeInteger(
    evolution.statistics
      .transitionCount,
    "evolution.statistics.transitionCount",
  );

  assertNonNegativeInteger(
    evolution.statistics
      .refinedTransitionCount,
    "evolution.statistics.refinedTransitionCount",
  );

  assertNonNegativeInteger(
    evolution.statistics
      .redirectedTransitionCount,
    "evolution.statistics.redirectedTransitionCount",
  );

  assertNonNegativeInteger(
    evolution.statistics
      .completionAdvanceCount,
    "evolution.statistics.completionAdvanceCount",
  );
}

function validateSignals(
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): void {
  const ids =
    new Set<string>();

  const types =
    new Set<
      RecommendationEvolutionIntelligenceSignalType
    >();

  for (const signal of signals) {
    if (
      signal === null ||
      typeof signal !==
        "object"
    ) {
      throw new Error(
        "Each signal must be a valid RecommendationEvolutionIntelligenceSignal.",
      );
    }

    assertNonEmptyString(
      signal.id,
      "signal.id",
    );

    if (
      ids.has(
        signal.id,
      )
    ) {
      throw new Error(
        `Duplicate Recommendation Evolution Intelligence signal ID "${signal.id}".`,
      );
    }

    ids.add(
      signal.id,
    );

    if (
      types.has(
        signal.type,
      )
    ) {
      throw new Error(
        `Duplicate Recommendation Evolution Intelligence signal type "${signal.type}".`,
      );
    }

    types.add(
      signal.type,
    );

    assertScore(
      signal.score,
      `signal "${signal.id}" score`,
    );

    assertNonEmptyString(
      signal.title,
      `signal "${signal.id}" title`,
    );

    assertNonEmptyString(
      signal.description,
      `signal "${signal.id}" description`,
    );

    if (
      !Array.isArray(
        signal.relatedComparisonIds,
      )
    ) {
      throw new Error(
        `signal "${signal.id}" relatedComparisonIds must be an array.`,
      );
    }
  }
}

function validateSignalComparisonReferences(
  evolution:
    RecommendationEvolutionResult,
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): void {
  const comparisonIds =
    new Set(
      evolution.comparisons.map(
        (
          comparison,
        ) =>
          comparison.id,
      ),
    );

  for (const signal of signals) {
    for (
      const comparisonId
      of signal.relatedComparisonIds
    ) {
      if (
        !comparisonIds.has(
          comparisonId,
        )
      ) {
        throw new Error(
          `Signal "${signal.id}" references missing comparison "${comparisonId}".`,
        );
      }
    }
  }
}

function assertScore(
  value:
    number,
  fieldName:
    string,
): void {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    ) ||
    value < 0 ||
    value > 1
  ) {
    throw new Error(
      `${fieldName} must be a finite number between 0 and 1.`,
    );
  }
}

function assertRatio(
  value:
    number,
  fieldName:
    string,
): void {
  assertScore(
    value,
    fieldName,
  );
}

function assertNonNegativeInteger(
  value:
    number,
  fieldName:
    string,
): void {
  if (
    !Number.isInteger(
      value,
    ) ||
    value < 0
  ) {
    throw new Error(
      `${fieldName} must be a non-negative integer.`,
    );
  }
}

function assertNonEmptyString(
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