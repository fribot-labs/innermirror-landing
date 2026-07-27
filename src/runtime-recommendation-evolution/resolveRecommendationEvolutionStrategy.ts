import type {
    RecommendationEvolutionIntelligenceAssessment,
    RecommendationEvolutionIntelligenceSignal,
    RecommendationEvolutionIntelligenceSignalType,
    RecommendationEvolutionStrategy,
    RecommendationEvolutionStrategyDecisions,
    RecommendationEvolutionStrategyPriority,
    RecommendationEvolutionStrategyType,
    ResolveRecommendationEvolutionStrategyParams,
} from "./recommendationEvolutionIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Intelligence Assessment를
 * Runtime 대응 Strategy로 변환합니다.
 *
 * 상태별 기본 전략:
 *
 * unavailable → observe
 * observing   → observe
 * stable      → maintain
 * progressing → narrow
 * stalled     → confirm-completion
 * fragmented  → stabilize
 * advancing   → advance
 *
 * Assessment와 Signal을 변경하지 않는 결정론적 순수 함수입니다.
 */
export function resolveRecommendationEvolutionStrategy(
  params:
    ResolveRecommendationEvolutionStrategyParams,
): RecommendationEvolutionStrategy {
  validateParams(
    params,
  );

  const {
    assessment,
    signals,
    resolvedAt,
  } = params;

  const type =
    resolveStrategyType(
      assessment,
      signals,
    );

  const priority =
    resolveStrategyPriority({
      type,
      assessment,
      signals,
    });

  const decisions =
    resolveStrategyDecisions({
      type,
      assessment,
      signals,
    });

  const primarySignalType =
    resolvePrimarySignalType(
      assessment,
      signals,
    );

  const relatedSignalIds =
    resolveRelatedSignalIds({
      type,
      primarySignalType,
      signals,
    });

  const rationale =
    createStrategyRationale({
      type,
      priority,
      assessment,
      primarySignalType,
      signals,
    });

  const strategy: RecommendationEvolutionStrategy = {
    type,

    priority,

    sourceState:
      assessment.state,

    primarySignalType,

    decisions,

    rationale,

    relatedSignalIds,

    resolvedAt,
  };

  validateStrategyConsistency(
    strategy,
  );

  return strategy;
}

/* ------------------------------------------------------------------ */
/* Strategy Type                                                      */
/* ------------------------------------------------------------------ */

function resolveStrategyType(
  assessment:
    RecommendationEvolutionIntelligenceAssessment,
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): RecommendationEvolutionStrategyType {
  switch (assessment.state) {
    case "unavailable":
    case "observing":
      return "observe";

    case "stable":
      return "maintain";

    case "progressing":
      if (
        assessment.shouldRefineRecommendation
      ) {
        return "narrow";
      }

      return "clarify";

    case "stalled":
      return "confirm-completion";

    case "fragmented":
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
        return "reconsider";
      }

      return "stabilize";

    case "advancing":
      return "advance";
  }
}

/* ------------------------------------------------------------------ */
/* Strategy Priority                                                  */
/* ------------------------------------------------------------------ */

type ResolveStrategyPriorityParams = {
  type:
    RecommendationEvolutionStrategyType;

  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];
};

function resolveStrategyPriority(
  params:
    ResolveStrategyPriorityParams,
): RecommendationEvolutionStrategyPriority {
  const {
    type,
    assessment,
    signals,
  } = params;

  if (
    type === "stabilize" ||
    type === "reconsider" ||
    type === "confirm-completion"
  ) {
    return hasHighSeveritySignal(
      signals,
    )
      ? "high"
      : "medium";
  }

  if (
    type === "advance"
  ) {
    return assessment.confidence ===
      "high"
      ? "high"
      : "medium";
  }

  if (
    type === "narrow" ||
    type === "clarify"
  ) {
    return "medium";
  }

  if (
    type === "maintain"
  ) {
    return assessment.confidence ===
      "low"
      ? "low"
      : "medium";
  }

  return "low";
}

/* ------------------------------------------------------------------ */
/* Strategy Decisions                                                 */
/* ------------------------------------------------------------------ */

type ResolveStrategyDecisionsParams = {
  type:
    RecommendationEvolutionStrategyType;

  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];
};

function resolveStrategyDecisions(
  params:
    ResolveStrategyDecisionsParams,
): RecommendationEvolutionStrategyDecisions {
  const {
    type,
    assessment,
    signals,
  } = params;

  switch (type) {
    case "observe":
      return {
        shouldGenerateNewRecommendation:
          assessment.state ===
            "unavailable",

        shouldPreserveCurrentRecommendation:
          assessment.state ===
            "observing",

        shouldRequestProgressEvidence:
          assessment.state ===
            "observing",

        shouldRequestCompletionConfirmation:
          false,

        shouldReduceDirectionChanges:
          false,

        shouldNarrowCurrentRecommendation:
          false,

        shouldClarifyCurrentRecommendation:
          assessment.state ===
            "observing",

        shouldReconsiderCurrentRecommendation:
          false,
      };

    case "maintain":
      return {
        shouldGenerateNewRecommendation:
          false,

        shouldPreserveCurrentRecommendation:
          true,

        shouldRequestProgressEvidence:
          assessment.needsObservation,

        shouldRequestCompletionConfirmation:
          false,

        shouldReduceDirectionChanges:
          false,

        shouldNarrowCurrentRecommendation:
          false,

        shouldClarifyCurrentRecommendation:
          false,

        shouldReconsiderCurrentRecommendation:
          false,
      };

    case "clarify":
      return {
        shouldGenerateNewRecommendation:
          false,

        shouldPreserveCurrentRecommendation:
          true,

        shouldRequestProgressEvidence:
          true,

        shouldRequestCompletionConfirmation:
          false,

        shouldReduceDirectionChanges:
          false,

        shouldNarrowCurrentRecommendation:
          false,

        shouldClarifyCurrentRecommendation:
          true,

        shouldReconsiderCurrentRecommendation:
          false,
      };

    case "narrow":
      return {
        shouldGenerateNewRecommendation:
          false,

        shouldPreserveCurrentRecommendation:
          true,

        shouldRequestProgressEvidence:
          false,

        shouldRequestCompletionConfirmation:
          false,

        shouldReduceDirectionChanges:
          false,

        shouldNarrowCurrentRecommendation:
          true,

        shouldClarifyCurrentRecommendation:
          false,

        shouldReconsiderCurrentRecommendation:
          false,
      };

    case "confirm-completion":
      return {
        shouldGenerateNewRecommendation:
          false,

        shouldPreserveCurrentRecommendation:
          true,

        shouldRequestProgressEvidence:
          true,

        shouldRequestCompletionConfirmation:
          true,

        shouldReduceDirectionChanges:
          false,

        shouldNarrowCurrentRecommendation:
          false,

        shouldClarifyCurrentRecommendation:
          false,

        shouldReconsiderCurrentRecommendation:
          false,
      };

    case "advance":
      return {
        shouldGenerateNewRecommendation:
          true,

        shouldPreserveCurrentRecommendation:
          false,

        shouldRequestProgressEvidence:
          false,

        shouldRequestCompletionConfirmation:
          !hasSignal(
            signals,
            "completion-momentum",
          ),

        shouldReduceDirectionChanges:
          false,

        shouldNarrowCurrentRecommendation:
          false,

        shouldClarifyCurrentRecommendation:
          false,

        shouldReconsiderCurrentRecommendation:
          false,
      };

    case "stabilize":
      return {
        shouldGenerateNewRecommendation:
          false,

        shouldPreserveCurrentRecommendation:
          false,

        shouldRequestProgressEvidence:
          true,

        shouldRequestCompletionConfirmation:
          false,

        shouldReduceDirectionChanges:
          true,

        shouldNarrowCurrentRecommendation:
          false,

        shouldClarifyCurrentRecommendation:
          true,

        shouldReconsiderCurrentRecommendation:
          false,
      };

    case "reconsider":
      return {
        shouldGenerateNewRecommendation:
          false,

        shouldPreserveCurrentRecommendation:
          false,

        shouldRequestProgressEvidence:
          true,

        shouldRequestCompletionConfirmation:
          false,

        shouldReduceDirectionChanges:
          true,

        shouldNarrowCurrentRecommendation:
          false,

        shouldClarifyCurrentRecommendation:
          false,

        shouldReconsiderCurrentRecommendation:
          true,
      };
  }
}

/* ------------------------------------------------------------------ */
/* Primary Signal                                                     */
/* ------------------------------------------------------------------ */

function resolvePrimarySignalType(
  assessment:
    RecommendationEvolutionIntelligenceAssessment,
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): RecommendationEvolutionIntelligenceSignalType | null {
  if (
    assessment.primarySignalType !==
      null &&
    hasSignal(
      signals,
      assessment.primarySignalType,
    )
  ) {
    return assessment.primarySignalType;
  }

  const selected =
    selectHighestPrioritySignal(
      signals,
    );

  return selected?.type ??
    null;
}

/* ------------------------------------------------------------------ */
/* Related Signals                                                    */
/* ------------------------------------------------------------------ */

type ResolveRelatedSignalIdsParams = {
  type:
    RecommendationEvolutionStrategyType;

  primarySignalType:
    RecommendationEvolutionIntelligenceSignalType | null;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];
};

function resolveRelatedSignalIds(
  params:
    ResolveRelatedSignalIdsParams,
): string[] {
  const preferredTypes =
    getPreferredSignalTypesForStrategy(
      params.type,
    );

  const ids:
    string[] = [];

  for (const signal of params.signals) {
    if (
      signal.type ===
        params.primarySignalType ||
      preferredTypes.includes(
        signal.type,
      )
    ) {
      ids.push(
        signal.id,
      );
    }
  }

  return uniqueStrings(
    ids,
  );
}

function getPreferredSignalTypesForStrategy(
  type:
    RecommendationEvolutionStrategyType,
): RecommendationEvolutionIntelligenceSignalType[] {
  switch (type) {
    case "observe":
      return [
        "insufficient-history",
        "observation-needed",
        "decreasing-confidence",
      ];

    case "maintain":
      return [
        "stable-continuation",
        "stable-direction",
      ];

    case "clarify":
      return [
        "productive-refinement",
        "observation-needed",
        "decreasing-confidence",
      ];

    case "narrow":
      return [
        "productive-refinement",
        "increasing-confidence",
      ];

    case "confirm-completion":
      return [
        "unresolved-repetition",
        "persistent-repetition",
        "low-completion-rate",
      ];

    case "advance":
      return [
        "completion-momentum",
        "productive-refinement",
      ];

    case "stabilize":
      return [
        "high-drift",
        "frequent-redirection",
        "stable-direction",
      ];

    case "reconsider":
      return [
        "premature-supersession",
        "high-supersession-rate",
        "frequent-redirection",
        "high-drift",
      ];
  }
}

/* ------------------------------------------------------------------ */
/* Rationale                                                          */
/* ------------------------------------------------------------------ */

type CreateStrategyRationaleParams = {
  type:
    RecommendationEvolutionStrategyType;

  priority:
    RecommendationEvolutionStrategyPriority;

  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  primarySignalType:
    RecommendationEvolutionIntelligenceSignalType | null;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];
};

function createStrategyRationale(
  params:
    CreateStrategyRationaleParams,
): string[] {
  const {
    type,
    priority,
    assessment,
    primarySignalType,
    signals,
  } = params;

  const rationale:
    string[] = [
      createStrategyTypeRationale(
        type,
      ),
      `Strategy priority is "${priority}" for intelligence state "${assessment.state}".`,
    ];

  if (
    primarySignalType !==
    null
  ) {
    rationale.push(
      `Primary signal "${primarySignalType}" supports this strategy.`,
    );
  }

  if (
    assessment.confidence ===
      "low"
  ) {
    rationale.push(
      "Assessment confidence is low, so irreversible Recommendation changes should be avoided.",
    );
  }

  if (
    assessment.needsObservation
  ) {
    rationale.push(
      "Additional observation is required before making a stronger Recommendation transition.",
    );
  }

  if (
    hasSignal(
      signals,
      "high-drift",
    )
  ) {
    rationale.push(
      "High Recommendation drift requires direction stabilization.",
    );
  }

  if (
    hasSignal(
      signals,
      "unresolved-repetition",
    )
  ) {
    rationale.push(
      "Repeated Recommendation activity has not produced sufficient completion evidence.",
    );
  }

  if (
    hasSignal(
      signals,
      "completion-momentum",
    )
  ) {
    rationale.push(
      "Completion momentum supports moving toward the next Recommendation stage.",
    );
  }

  return uniqueStrings(
    rationale,
  );
}

function createStrategyTypeRationale(
  type:
    RecommendationEvolutionStrategyType,
): string {
  switch (type) {
    case "observe":
      return "Additional Recommendation history should be collected before selecting a stronger intervention.";

    case "maintain":
      return "The current Recommendation direction is stable and should be preserved.";

    case "clarify":
      return "The current Recommendation should be clarified before it is replaced or expanded.";

    case "narrow":
      return "The current Recommendation should be reduced to a smaller and more executable action.";

    case "confirm-completion":
      return "The current Recommendation completion state must be confirmed before generating another Recommendation.";

    case "advance":
      return "The completed Recommendation flow supports advancing to the next stage.";

    case "stabilize":
      return "Direction changes should be reduced until a coherent Recommendation path is restored.";

    case "reconsider":
      return "The current Recommendation assumptions should be reconsidered because replacement or redirection is persistent.";
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

function hasHighSeveritySignal(
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): boolean {
  return signals.some(
    (
      signal,
    ) =>
      signal.severity ===
      "high",
  );
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
    RecommendationEvolutionIntelligenceSignal["confidence"],
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
/* Consistency Validation                                             */
/* ------------------------------------------------------------------ */

function validateStrategyConsistency(
  strategy:
    RecommendationEvolutionStrategy,
): void {
  const {
    type,
    decisions,
  } = strategy;

  if (
    decisions
      .shouldGenerateNewRecommendation &&
    decisions
      .shouldPreserveCurrentRecommendation
  ) {
    throw new Error(
      "Strategy cannot generate a new Recommendation while preserving the current Recommendation.",
    );
  }

  if (
    type === "advance" &&
    !decisions
      .shouldGenerateNewRecommendation
  ) {
    throw new Error(
      'Strategy "advance" must allow a new Recommendation.',
    );
  }

  if (
    type ===
      "confirm-completion" &&
    !decisions
      .shouldRequestCompletionConfirmation
  ) {
    throw new Error(
      'Strategy "confirm-completion" must request completion confirmation.',
    );
  }

  if (
    type === "stabilize" &&
    !decisions
      .shouldReduceDirectionChanges
  ) {
    throw new Error(
      'Strategy "stabilize" must reduce direction changes.',
    );
  }

  if (
    type === "reconsider" &&
    !decisions
      .shouldReconsiderCurrentRecommendation
  ) {
    throw new Error(
      'Strategy "reconsider" must reconsider the current Recommendation.',
    );
  }

  if (
    type === "narrow" &&
    !decisions
      .shouldNarrowCurrentRecommendation
  ) {
    throw new Error(
      'Strategy "narrow" must narrow the current Recommendation.',
    );
  }

  if (
    type === "clarify" &&
    !decisions
      .shouldClarifyCurrentRecommendation
  ) {
    throw new Error(
      'Strategy "clarify" must clarify the current Recommendation.',
    );
  }
}

/* ------------------------------------------------------------------ */
/* General Helpers                                                    */
/* ------------------------------------------------------------------ */

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
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validateParams(
  params:
    ResolveRecommendationEvolutionStrategyParams,
): void {
  if (
    params === null ||
    typeof params !==
      "object"
  ) {
    throw new Error(
      "params must be a valid ResolveRecommendationEvolutionStrategyParams object.",
    );
  }

  validateAssessment(
    params.assessment,
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

  validateAssessmentSignalConsistency(
    params.assessment,
    params.signals,
  );

  assertValidIsoTimestamp(
    params.resolvedAt,
    "resolvedAt",
  );
}

function validateAssessment(
  assessment:
    RecommendationEvolutionIntelligenceAssessment,
): void {
  if (
    assessment === null ||
    typeof assessment !==
      "object"
  ) {
    throw new Error(
      "assessment must be a valid RecommendationEvolutionIntelligenceAssessment.",
    );
  }

  assertScore(
    assessment.scores.stability,
    "assessment.scores.stability",
  );

  assertScore(
    assessment.scores.progress,
    "assessment.scores.progress",
  );

  assertScore(
    assessment.scores.repetitionRisk,
    "assessment.scores.repetitionRisk",
  );

  assertScore(
    assessment.scores.redirectionRisk,
    "assessment.scores.redirectionRisk",
  );

  assertScore(
    assessment.scores.completionMomentum,
    "assessment.scores.completionMomentum",
  );

  if (
    !Array.isArray(
      assessment.reasoning,
    )
  ) {
    throw new Error(
      "assessment.reasoning must be an array.",
    );
  }
}

function validateSignals(
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): void {
  const ids =
    new Set<string>();

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

    assertScore(
      signal.score,
      `signal "${signal.id}" score`,
    );
  }
}

function validateAssessmentSignalConsistency(
  assessment:
    RecommendationEvolutionIntelligenceAssessment,
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): void {
  if (
    assessment.primarySignalType ===
    null
  ) {
    return;
  }

  if (
    !hasSignal(
      signals,
      assessment.primarySignalType,
    )
  ) {
    throw new Error(
      `Assessment primarySignalType "${assessment.primarySignalType}" does not exist in signals.`,
    );
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

function assertValidIsoTimestamp(
  value:
    string,
  fieldName:
    string,
): void {
  assertNonEmptyString(
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
      `${fieldName} must be a valid ISO 8601 timestamp.`,
    );
  }
}