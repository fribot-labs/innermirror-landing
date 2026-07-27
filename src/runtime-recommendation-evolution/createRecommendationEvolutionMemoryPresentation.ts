import type {
    CreateRecommendationEvolutionMemoryPresentationParams,
    RecommendationEvolutionMemory,
    RecommendationEvolutionMemoryAnalysis,
    RecommendationEvolutionMemoryPresentation,
    RecommendationEvolutionMemoryPresentationTone,
} from "./recommendationEvolutionMemoryTypes";

import {
    isRecommendationEvolutionMemoryPresentationTone,
} from "./recommendationEvolutionMemoryTypes";

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Memory Analysis를
 * 사람이 이해할 수 있는 장기 흐름 표현으로 변환합니다.
 *
 * Presentation은 Runtime 행동 지침을 생성하지 않습니다.
 * 현재까지 누적된 판단의 변화와 장기 흐름을 설명하는 역할만
 * 담당합니다.
 */
export function createRecommendationEvolutionMemoryPresentation(
  params:
    CreateRecommendationEvolutionMemoryPresentationParams,
): RecommendationEvolutionMemoryPresentation {
  const {
    memory,
    analysis,
    createdAt,
  } = params;

  const tone =
    resolveMemoryPresentationTone(
      analysis,
    );

  const headline =
    createMemoryPresentationHeadline(
      analysis,
    );

  const summary =
    createMemoryPresentationSummary(
      analysis,
    );

  const trendDescription =
    createMemoryTrendDescription(
      analysis,
    );

  const latestChange =
    createLatestMemoryChange(
      analysis,
    );

  const longTermObservation =
    createLongTermMemoryObservation(
      analysis,
    );

  const warnings =
    createMemoryPresentationWarnings(
      analysis,
    );

  const evidence =
    createMemoryPresentationEvidence({
      memoryEntryCount:
        memory.entries.length,

      analysis,
    });

  const presentation:
    RecommendationEvolutionMemoryPresentation = {
      tone,

      headline,

      summary,

      trendDescription,

      latestChange,

      longTermObservation,

      warnings,

      evidence,

      createdAt,
    };

  validateRecommendationEvolutionMemoryPresentation({
    memory,
    analysis,
    presentation,
  });

  return presentation;
}

/* ------------------------------------------------------------------ */
/* Tone Resolution                                                    */
/* ------------------------------------------------------------------ */

function resolveMemoryPresentationTone(
  analysis:
    RecommendationEvolutionMemoryAnalysis,
): RecommendationEvolutionMemoryPresentationTone {
  switch (analysis.state) {
    case "unavailable":
      return "unavailable";

    case "insufficient":
      return "neutral";

    case "stable":
      return "stable";

    case "improving":
    case "advancing":
      return "progressing";

    case "recovering":
      return "recovering";

    case "stagnant":
    case "oscillating":
    case "regressing":
      return "attention";
  }
}

/* ------------------------------------------------------------------ */
/* Headline                                                           */
/* ------------------------------------------------------------------ */

function createMemoryPresentationHeadline(
  analysis:
    RecommendationEvolutionMemoryAnalysis,
): string {
  switch (
    analysis.state
  ) {
    case "unavailable":
      return "Recommendation memory is not yet available.";

    case "insufficient":
      return "More recommendation history is needed.";

    case "stable":
      return "Recommendation judgment remains stable.";

    case "improving":
      return "Recommendation judgment is becoming more constructive.";

    case "advancing":
      return "Recommendation judgment is moving into sustained advancement.";

    case "stagnant":
      return "Recommendation judgment has remained unresolved.";

    case "oscillating":
      return "Recommendation judgment is repeatedly changing direction.";

    case "regressing":
      return "Recommendation judgment is showing signs of regression.";

    case "recovering":
      return "Recommendation judgment is recovering from a disrupted state.";
  }
}

/* ------------------------------------------------------------------ */
/* Summary                                                            */
/* ------------------------------------------------------------------ */

function createMemoryPresentationSummary(
  analysis:
    RecommendationEvolutionMemoryAnalysis,
): string {
  const {
    statistics,
    scores,
  } = analysis;

  switch (
    analysis.state
  ) {
    case "unavailable":
      return [
        "No Recommendation Evolution Memory entries are currently available.",
        "A long-term pattern cannot be described until Intelligence results are recorded.",
      ].join(
        " ",
      );

    case "insufficient":
      return [
        "Only one Recommendation Evolution Memory entry is available.",
        "At least one additional analysis is required to compare change over time.",
      ].join(
        " ",
      );

    case "stable":
      return [
        `${statistics.entryCount} memory entries were analyzed.`,
        "Recommendation judgment has remained broadly consistent without a dominant regression or advancement pattern.",
        `Long-term stability is ${formatScore(
          scores.longTermStability,
        )}.`,
      ].join(
        " ",
      );

    case "improving":
      return [
        `${statistics.entryCount} memory entries were analyzed.`,
        "Stability, progress, completion momentum, or risk reduction is improving across recent analyses.",
        `Long-term progress is ${formatScore(
          scores.longTermProgress,
        )}.`,
      ].join(
        " ",
      );

    case "advancing":
      return [
        `${statistics.entryCount} memory entries were analyzed.`,
        "Recommendation judgment has moved beyond simple maintenance into a sustained advancement pattern.",
        `Long-term progress is ${formatScore(
          scores.longTermProgress,
        )}, with recovery at ${formatScore(
          scores.recovery,
        )}.`,
      ].join(
        " ",
      );

    case "stagnant":
      return [
        `${statistics.entryCount} memory entries were analyzed.`,
        "Observation or stalled judgment has continued without enough measurable movement.",
        `Long-term risk is ${formatScore(
          scores.longTermRisk,
        )}.`,
      ].join(
        " ",
      );

    case "oscillating":
      return [
        `${statistics.entryCount} memory entries were analyzed.`,
        "Recent states or strategies are alternating repeatedly rather than converging.",
        `Long-term stability is ${formatScore(
          scores.longTermStability,
        )}, while risk is ${formatScore(
          scores.longTermRisk,
        )}.`,
      ].join(
        " ",
      );

    case "regressing":
      return [
        `${statistics.entryCount} memory entries were analyzed.`,
        "Recent judgment has moved toward weaker stability, lower progress, or greater repetition and redirection risk.",
        `Long-term risk is ${formatScore(
          scores.longTermRisk,
        )}.`,
      ].join(
        " ",
      );

    case "recovering":
      return [
        `${statistics.entryCount} memory entries were analyzed.`,
        "Recommendation judgment is moving away from a previously stalled or fragmented condition.",
        `Recovery is ${formatScore(
          scores.recovery,
        )}.`,
      ].join(
        " ",
      );
  }
}

/* ------------------------------------------------------------------ */
/* Trend Description                                                  */
/* ------------------------------------------------------------------ */

function createMemoryTrendDescription(
  analysis:
    RecommendationEvolutionMemoryAnalysis,
): string {
  const {
    statistics,
    scores,
  } = analysis;

  if (
    analysis.state ===
    "unavailable"
  ) {
    return "No long-term recommendation trend can be evaluated because the memory is empty.";
  }

  if (
    analysis.state ===
    "insufficient"
  ) {
    return "The current memory contains an initial judgment, but no transition has yet been observed.";
  }

  const baseTrend =
    [
      `${statistics.stateChangeCount} state changes`,
      `${statistics.strategyChangeCount} strategy changes`,
      `${statistics.entryCount} recorded analyses`,
    ].join(
      ", ",
    );

  switch (
    analysis.state
  ) {
    case "stable":
      return [
        `Across ${baseTrend}, the overall recommendation judgment remains coherent.`,
        `Stability is ${formatScore(
          scores.longTermStability,
        )} and risk is ${formatScore(
          scores.longTermRisk,
        )}.`,
      ].join(
        " ",
      );

    case "improving":
      return [
        `Across ${baseTrend}, constructive movement is becoming more visible.`,
        `Progress is ${formatScore(
          scores.longTermProgress,
        )} while risk is ${formatScore(
          scores.longTermRisk,
        )}.`,
      ].join(
        " ",
      );

    case "advancing":
      return [
        `Across ${baseTrend}, recent judgment has moved into a stronger advancement pattern.`,
        `Progress is ${formatScore(
          scores.longTermProgress,
        )} and completion-related momentum is being preserved.`,
      ].join(
        " ",
      );

    case "stagnant":
      return [
        `Across ${baseTrend}, repeated observation or stalled states are limiting visible movement.`,
        `Risk is ${formatScore(
          scores.longTermRisk,
        )}.`,
      ].join(
        " ",
      );

    case "oscillating":
      return [
        `Across ${baseTrend}, state or strategy transitions are recurring without durable convergence.`,
        `Stability is ${formatScore(
          scores.longTermStability,
        )}.`,
      ].join(
        " ",
      );

    case "regressing":
      return [
        `Across ${baseTrend}, recent changes show weakening progress or increasing risk.`,
        `Risk is ${formatScore(
          scores.longTermRisk,
        )}, which is higher than the constructive direction currently visible.`,
      ].join(
        " ",
      );

    case "recovering":
      return [
        `Across ${baseTrend}, recent judgment is moving away from previous disruption.`,
        `Recovery is ${formatScore(
          scores.recovery,
        )}, and stability is ${formatScore(
          scores.longTermStability,
        )}.`,
      ].join(
        " ",
      );
  }
}

/* ------------------------------------------------------------------ */
/* Generic Helpers                                                    */
/* ------------------------------------------------------------------ */

function formatScore(
  value:
    number,
): string {
  return value.toFixed(
    3,
  );
}

/* ------------------------------------------------------------------ */
/* Latest Change                                                      */
/* ------------------------------------------------------------------ */

/**
 * 가장 최근의 non-initial Comparison을 사람이 이해할 수 있는
 * 한 문장으로 변환합니다.
 */
function createLatestMemoryChange(
  analysis:
    RecommendationEvolutionMemoryAnalysis,
): string | null {
  const latestComparison =
    getLatestNonInitialComparison(
      analysis,
    );

  if (
    latestComparison ===
    null
  ) {
    return null;
  }

  const {
    previous,
    current,
    scoreChanges,
  } = latestComparison;

  if (
    previous ===
    null
  ) {
    return null;
  }

  switch (
    latestComparison.type
  ) {
    case "unchanged":
      return [
        `The latest judgment remained ${current.state}`,
        `with the ${current.strategyType} strategy unchanged.`,
      ].join(
        " ",
      );

    case "stabilized":
      return [
        `The latest judgment moved from ${previous.state} to stable.`,
        `The active strategy is now ${current.strategyType}.`,
      ].join(
        " ",
      );

    case "progressed":
      return [
        `The latest judgment progressed from ${previous.state} to ${current.state}.`,
        `Progress changed by ${formatSignedScore(
          scoreChanges.progress,
        )}.`,
      ].join(
        " ",
      );

    case "advanced":
      return [
        `The latest judgment moved into the advancing state.`,
        `Completion momentum changed by ${formatSignedScore(
          scoreChanges.completionMomentum,
        )}.`,
      ].join(
        " ",
      );

    case "stalled":
      return [
        `The latest judgment moved from ${previous.state} to stalled.`,
        `Progress changed by ${formatSignedScore(
          scoreChanges.progress,
        )}.`,
      ].join(
        " ",
      );

    case "fragmented":
      return [
        `The latest judgment moved from ${previous.state} to fragmented.`,
        `Redirection risk changed by ${formatSignedScore(
          scoreChanges.redirectionRisk,
        )}.`,
      ].join(
        " ",
      );

    case "recovered":
      return [
        `The latest judgment recovered from ${previous.state} to ${current.state}.`,
        `Stability changed by ${formatSignedScore(
          scoreChanges.stability,
        )}.`,
      ].join(
        " ",
      );

    case "regressed":
      return [
        `The latest judgment regressed from ${previous.state} to ${current.state}.`,
        `Long-term attention may be required.`,
      ].join(
        " ",
      );

    case "strategy-shifted":
      return [
        `The latest state remained ${current.state},`,
        `but the strategy changed from ${previous.strategyType} to ${current.strategyType}.`,
      ].join(
        " ",
      );

    case "confidence-improved":
      return [
        `Assessment confidence improved from ${previous.assessmentConfidence}`,
        `to ${current.assessmentConfidence}.`,
      ].join(
        " ",
      );

    case "confidence-declined":
      return [
        `Assessment confidence declined from ${previous.assessmentConfidence}`,
        `to ${current.assessmentConfidence}.`,
      ].join(
        " ",
      );

    case "mixed":
      return [
        "The latest judgment contains several simultaneous changes.",
        `The state is ${current.state} and the strategy is ${current.strategyType}.`,
      ].join(
        " ",
      );

    case "initial":
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Long-term Observation                                              */
/* ------------------------------------------------------------------ */

/**
 * 현재 State와 Memory Signal을 바탕으로 장기적인 관찰 문장을
 * 생성합니다.
 */
function createLongTermMemoryObservation(
  analysis:
    RecommendationEvolutionMemoryAnalysis,
): string | null {
  const {
    statistics,
    scores,
  } = analysis;

  switch (
    analysis.state
  ) {
    case "unavailable":
      return null;

    case "insufficient":
      return "The current record establishes an initial reference point, but it does not yet show continuity.";

    case "stable":
      if (
        statistics.maintainStreak >=
        3
      ) {
        return `The maintain strategy has continued for ${statistics.maintainStreak} consecutive analyses, indicating durable judgment continuity.`;
      }

      return "The accumulated judgments remain coherent without a dominant risk or advancement pattern.";

    case "improving":
      return [
        "Recent analyses show constructive movement in stability, progress, completion momentum, or risk reduction.",
        `Long-term progress is ${formatScore(
          scores.longTermProgress,
        )}.`,
      ].join(
        " ",
      );

    case "advancing":
      return [
        "The recommendation flow is no longer only being preserved; it is producing sustained forward movement.",
        `The advancing streak is ${statistics.advancingStreak}.`,
      ].join(
        " ",
      );

    case "stagnant":
      if (
        statistics.observeStreak >=
        3
      ) {
        return `The Runtime has remained in the observe strategy for ${statistics.observeStreak} consecutive analyses without sufficient resolution.`;
      }

      if (
        statistics.stalledStreak >=
        2
      ) {
        return `The stalled state has continued for ${statistics.stalledStreak} consecutive analyses.`;
      }

      return "The long-term record shows limited movement despite repeated analysis.";

    case "oscillating":
      return [
        "The Runtime is repeatedly moving between different states or strategies.",
        "This suggests that the underlying source of redirection has not yet converged.",
      ].join(
        " ",
      );

    case "regressing":
      return [
        "Recent judgments are weakening relative to earlier entries.",
        `Long-term risk is ${formatScore(
          scores.longTermRisk,
        )}.`,
      ].join(
        " ",
      );

    case "recovering":
      return [
        "The Runtime is moving away from a previously stalled or fragmented condition.",
        `The current recovery score is ${formatScore(
          scores.recovery,
        )}.`,
      ].join(
        " ",
      );
  }
}

/* ------------------------------------------------------------------ */
/* Presentation Warnings                                              */
/* ------------------------------------------------------------------ */

function createMemoryPresentationWarnings(
  analysis:
    RecommendationEvolutionMemoryAnalysis,
): string[] {
  const warnings:
    string[] =
      [];

  if (
    hasMemorySignal(
      analysis,
      "persistent-observation",
    )
  ) {
    warnings.push(
      "Observation has continued repeatedly without enough evidence to resolve a stronger strategy.",
    );
  }

  if (
    hasMemorySignal(
      analysis,
      "persistent-stall",
    )
  ) {
    warnings.push(
      "The stalled state has persisted across multiple analyses.",
    );
  }

  if (
    hasMemorySignal(
      analysis,
      "persistent-fragmentation",
    )
  ) {
    warnings.push(
      "Recommendation judgment remains fragmented and may require stabilization before further expansion.",
    );
  }

  if (
    hasMemorySignal(
      analysis,
      "strategy-oscillation",
    )
  ) {
    warnings.push(
      "Recommendation strategies are alternating repeatedly without durable convergence.",
    );
  }

  if (
    hasMemorySignal(
      analysis,
      "state-oscillation",
    )
  ) {
    warnings.push(
      "Recommendation Intelligence states are repeatedly alternating.",
    );
  }

  if (
    hasMemorySignal(
      analysis,
      "confidence-degradation",
    )
  ) {
    warnings.push(
      "Assessment confidence has declined across recent analyses.",
    );
  }

  if (
    hasMemorySignal(
      analysis,
      "risk-accumulation",
    )
  ) {
    warnings.push(
      "Repetition or redirection risk is accumulating while constructive scores are weakening.",
    );
  }

  if (
    analysis.state ===
    "regressing"
  ) {
    warnings.push(
      "The latest long-term pattern is regressing and should not be treated as stable continuation.",
    );
  }

  return deduplicateStrings(
    warnings,
  );
}

/* ------------------------------------------------------------------ */
/* Presentation Evidence                                              */
/* ------------------------------------------------------------------ */

type CreateMemoryPresentationEvidenceParams = {
  memoryEntryCount:
    number;

  analysis:
    RecommendationEvolutionMemoryAnalysis;
};

function createMemoryPresentationEvidence(
  params:
    CreateMemoryPresentationEvidenceParams,
): string[] {
  const {
    memoryEntryCount,
    analysis,
  } = params;

  const {
    statistics,
    scores,
  } = analysis;

  const evidence:
    string[] = [
      `${memoryEntryCount} memory entries were included in the presentation.`,
      `The resolved long-term memory state is ${analysis.state}.`,
      `${statistics.stateChangeCount} state changes were detected.`,
      `${statistics.strategyChangeCount} strategy changes were detected.`,
      `Long-term stability is ${formatScore(
        scores.longTermStability,
      )}.`,
      `Long-term progress is ${formatScore(
        scores.longTermProgress,
      )}.`,
      `Long-term risk is ${formatScore(
        scores.longTermRisk,
      )}.`,
    ];

  if (
    scores.recovery >
    0
  ) {
    evidence.push(
      `Recovery is ${formatScore(
        scores.recovery,
      )}.`,
    );
  }

  if (
    statistics.observeStreak >
    0
  ) {
    evidence.push(
      `The current observe strategy streak is ${statistics.observeStreak}.`,
    );
  }

  if (
    statistics.maintainStreak >
    0
  ) {
    evidence.push(
      `The current maintain strategy streak is ${statistics.maintainStreak}.`,
    );
  }

  if (
    statistics.stalledStreak >
    0
  ) {
    evidence.push(
      `The current stalled state streak is ${statistics.stalledStreak}.`,
    );
  }

  if (
    statistics.fragmentedStreak >
    0
  ) {
    evidence.push(
      `The current fragmented state streak is ${statistics.fragmentedStreak}.`,
    );
  }

  if (
    statistics.advancingStreak >
    0
  ) {
    evidence.push(
      `The current advancing state streak is ${statistics.advancingStreak}.`,
    );
  }

  analysis.signals.forEach(
    (
      signal,
    ) => {
      evidence.push(
        signal.description,
      );
    },
  );

  return deduplicateStrings(
    evidence,
  );
}

/* ------------------------------------------------------------------ */
/* Comparison Helpers                                                 */
/* ------------------------------------------------------------------ */

function getLatestNonInitialComparison(
  analysis:
    RecommendationEvolutionMemoryAnalysis,
): RecommendationEvolutionMemoryAnalysis["comparisons"][number] | null {
  for (
    let index =
      analysis.comparisons.length -
      1;
    index >=
    0;
    index -=
      1
  ) {
    const comparison =
      analysis.comparisons[
        index
      ];

    if (
      comparison !==
        undefined &&
      comparison.previous !==
        null
    ) {
      return comparison;
    }
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Signal Helpers                                                     */
/* ------------------------------------------------------------------ */

function hasMemorySignal(
  analysis:
    RecommendationEvolutionMemoryAnalysis,
  type:
    RecommendationEvolutionMemoryAnalysis["signals"][number]["type"],
): boolean {
  return analysis.signals.some(
    (
      signal,
    ) =>
      signal.type ===
      type,
  );
}

/* ------------------------------------------------------------------ */
/* String Helpers                                                     */
/* ------------------------------------------------------------------ */

function formatSignedScore(
  value:
    number,
): string {
  if (
    value >
    0
  ) {
    return `+${formatScore(
      value,
    )}`;
  }

  return formatScore(
    value,
  );
}

function deduplicateStrings(
  values:
    string[],
): string[] {
  const observed =
    new Set<string>();

  return values.filter(
    (
      value,
    ) => {
      const normalized =
        value.trim();

      if (
        normalized.length ===
        0 ||
        observed.has(
          normalized,
        )
      ) {
        return false;
      }

      observed.add(
        normalized,
      );

      return true;
    },
  );
}

/* ------------------------------------------------------------------ */
/* Presentation Validation Types                                      */
/* ------------------------------------------------------------------ */

export type ValidateRecommendationEvolutionMemoryPresentationParams = {
  memory:
    RecommendationEvolutionMemory;

  analysis:
    RecommendationEvolutionMemoryAnalysis;

  presentation:
    RecommendationEvolutionMemoryPresentation;
};

/* ------------------------------------------------------------------ */
/* Public Presentation Validation API                                 */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Memory Presentation의 구조와
 * 원본 Memory 및 Analysis 사이의 일관성을 검증합니다.
 */
export function validateRecommendationEvolutionMemoryPresentation(
  params:
    ValidateRecommendationEvolutionMemoryPresentationParams,
): void {
  const {
    memory,
    analysis,
    presentation,
  } = params;

  validatePresentationObject(
    presentation,
  );

  validatePresentationTone(
    presentation.tone,
  );

  validateRequiredString(
    presentation.headline,
    "presentation.headline",
  );

  validateRequiredString(
    presentation.summary,
    "presentation.summary",
  );

  validateRequiredString(
    presentation.trendDescription,
    "presentation.trendDescription",
  );

  validateNullablePresentationString(
    presentation.latestChange,
    "presentation.latestChange",
  );

  validateNullablePresentationString(
    presentation.longTermObservation,
    "presentation.longTermObservation",
  );

  validateUniquePresentationStrings(
    presentation.warnings,
    "presentation.warnings",
  );

  validateUniquePresentationStrings(
    presentation.evidence,
    "presentation.evidence",
  );

  validateTimestamp(
    presentation.createdAt,
    "presentation.createdAt",
  );

  validatePresentationTimestampConsistency({
    memory,
    analysis,
    presentation,
  });

  validatePresentationToneConsistency({
    analysis,
    presentation,
  });

  validatePresentationContentConsistency({
    memory,
    analysis,
    presentation,
  });
}

/* ------------------------------------------------------------------ */
/* Presentation Object Validation                                     */
/* ------------------------------------------------------------------ */

function validatePresentationObject(
  presentation:
    RecommendationEvolutionMemoryPresentation,
): void {
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
      "Recommendation Evolution Memory Presentation must be an object.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Presentation Tone Validation                                       */
/* ------------------------------------------------------------------ */

function validatePresentationTone(
  tone:
    unknown,
): asserts tone is RecommendationEvolutionMemoryPresentationTone {
  if (
    !isRecommendationEvolutionMemoryPresentationTone(
      tone,
    )
  ) {
    throw new Error(
      "Recommendation Evolution Memory Presentation tone is invalid.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Tone Consistency                                                   */
/* ------------------------------------------------------------------ */

type ValidatePresentationToneConsistencyParams = {
  analysis:
    RecommendationEvolutionMemoryAnalysis;

  presentation:
    RecommendationEvolutionMemoryPresentation;
};

function validatePresentationToneConsistency(
  params:
    ValidatePresentationToneConsistencyParams,
): void {
  const {
    analysis,
    presentation,
  } = params;

  const expectedTone =
    resolveMemoryPresentationTone(
      analysis,
    );

  if (
    presentation.tone !==
    expectedTone
  ) {
    throw new Error(
      `Presentation tone ${presentation.tone} is inconsistent with Memory Analysis state ${analysis.state}.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Timestamp Consistency                                              */
/* ------------------------------------------------------------------ */

type ValidatePresentationTimestampConsistencyParams = {
  memory:
    RecommendationEvolutionMemory;

  analysis:
    RecommendationEvolutionMemoryAnalysis;

  presentation:
    RecommendationEvolutionMemoryPresentation;
};

function validatePresentationTimestampConsistency(
  params:
    ValidatePresentationTimestampConsistencyParams,
): void {
  const {
    memory,
    analysis,
    presentation,
  } = params;

  validateTimestampOrder(
    memory.updatedAt,
    presentation.createdAt,
    "memory.updatedAt",
    "presentation.createdAt",
  );

  validateTimestampOrder(
    analysis.analyzedAt,
    presentation.createdAt,
    "analysis.analyzedAt",
    "presentation.createdAt",
  );
}

/* ------------------------------------------------------------------ */
/* Presentation Content Consistency                                   */
/* ------------------------------------------------------------------ */

type ValidatePresentationContentConsistencyParams = {
  memory:
    RecommendationEvolutionMemory;

  analysis:
    RecommendationEvolutionMemoryAnalysis;

  presentation:
    RecommendationEvolutionMemoryPresentation;
};

function validatePresentationContentConsistency(
  params:
    ValidatePresentationContentConsistencyParams,
): void {
  const {
    memory,
    analysis,
    presentation,
  } = params;

  validateAvailabilityContentConsistency({
    memory,
    analysis,
    presentation,
  });

  validateLatestChangeConsistency({
    analysis,
    presentation,
  });

  validateWarningConsistency({
    analysis,
    presentation,
  });

  validateEvidenceConsistency({
    memory,
    analysis,
    presentation,
  });
}

/* ------------------------------------------------------------------ */
/* Availability Content Consistency                                   */
/* ------------------------------------------------------------------ */

type ValidateAvailabilityContentConsistencyParams = {
  memory:
    RecommendationEvolutionMemory;

  analysis:
    RecommendationEvolutionMemoryAnalysis;

  presentation:
    RecommendationEvolutionMemoryPresentation;
};

function validateAvailabilityContentConsistency(
  params:
    ValidateAvailabilityContentConsistencyParams,
): void {
  const {
    memory,
    analysis,
    presentation,
  } = params;

  if (
    memory.entries.length ===
      0 &&
    analysis.state !==
      "unavailable"
  ) {
    throw new Error(
      "An empty Memory must produce an unavailable Presentation state.",
    );
  }

  if (
    analysis.state ===
    "unavailable"
  ) {
    if (
      presentation.tone !==
      "unavailable"
    ) {
      throw new Error(
        "Unavailable Memory Analysis requires an unavailable Presentation tone.",
      );
    }

    if (
      presentation.latestChange !==
      null
    ) {
      throw new Error(
        "Unavailable Memory Presentation must not contain latestChange.",
      );
    }

    if (
      presentation.longTermObservation !==
      null
    ) {
      throw new Error(
        "Unavailable Memory Presentation must not contain longTermObservation.",
      );
    }
  }

  if (
    analysis.state ===
    "insufficient"
  ) {
    if (
      presentation.tone !==
      "neutral"
    ) {
      throw new Error(
        "Insufficient Memory Analysis requires a neutral Presentation tone.",
      );
    }

    if (
      presentation.latestChange !==
      null
    ) {
      throw new Error(
        "Insufficient Memory Presentation must not contain latestChange because no transition exists.",
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Latest Change Consistency                                          */
/* ------------------------------------------------------------------ */

type ValidateLatestChangeConsistencyParams = {
  analysis:
    RecommendationEvolutionMemoryAnalysis;

  presentation:
    RecommendationEvolutionMemoryPresentation;
};

function validateLatestChangeConsistency(
  params:
    ValidateLatestChangeConsistencyParams,
): void {
  const {
    analysis,
    presentation,
  } = params;

  const latestComparison =
    getLatestNonInitialComparison(
      analysis,
    );

  if (
    latestComparison ===
    null
  ) {
    if (
      presentation.latestChange !==
      null
    ) {
      throw new Error(
        "Presentation latestChange must be null when no non-initial Comparison exists.",
      );
    }

    return;
  }

  if (
    presentation.latestChange ===
    null
  ) {
    throw new Error(
      "Presentation latestChange is required when a non-initial Comparison exists.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Warning Consistency                                                */
/* ------------------------------------------------------------------ */

type ValidateWarningConsistencyParams = {
  analysis:
    RecommendationEvolutionMemoryAnalysis;

  presentation:
    RecommendationEvolutionMemoryPresentation;
};

function validateWarningConsistency(
  params:
    ValidateWarningConsistencyParams,
): void {
  const {
    analysis,
    presentation,
  } = params;

  const hasWarningSignal =
    analysis.signals.some(
      (
        signal,
      ) =>
        signal.type ===
          "persistent-observation" ||
        signal.type ===
          "persistent-stall" ||
        signal.type ===
          "persistent-fragmentation" ||
        signal.type ===
          "strategy-oscillation" ||
        signal.type ===
          "state-oscillation" ||
        signal.type ===
          "confidence-degradation" ||
        signal.type ===
          "risk-accumulation",
    );

  const hasAttentionState =
    analysis.state ===
      "stagnant" ||
    analysis.state ===
      "oscillating" ||
    analysis.state ===
      "regressing";

  if (
    (
      hasWarningSignal ||
      hasAttentionState
    ) &&
    presentation.warnings.length ===
      0
  ) {
    throw new Error(
      "Presentation warnings are required for attention states or warning Memory Signals.",
    );
  }

  if (
    presentation.tone ===
      "attention" &&
    presentation.warnings.length ===
      0
  ) {
    throw new Error(
      "Attention Presentation tone requires at least one warning.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Evidence Consistency                                               */
/* ------------------------------------------------------------------ */

type ValidateEvidenceConsistencyParams = {
  memory:
    RecommendationEvolutionMemory;

  analysis:
    RecommendationEvolutionMemoryAnalysis;

  presentation:
    RecommendationEvolutionMemoryPresentation;
};

function validateEvidenceConsistency(
  params:
    ValidateEvidenceConsistencyParams,
): void {
  const {
    memory,
    analysis,
    presentation,
  } = params;

  if (
    presentation.evidence.length <
    2
  ) {
    throw new Error(
      "Presentation evidence must contain at least the Memory entry count and resolved state.",
    );
  }

  const entryCountEvidence =
    `${memory.entries.length} memory entries were included in the presentation.`;

  if (
    !presentation.evidence.includes(
      entryCountEvidence,
    )
  ) {
    throw new Error(
      "Presentation evidence must include the Memory entry count.",
    );
  }

  const stateEvidence =
    `The resolved long-term memory state is ${analysis.state}.`;

  if (
    !presentation.evidence.includes(
      stateEvidence,
    )
  ) {
    throw new Error(
      "Presentation evidence must include the resolved Memory Analysis state.",
    );
  }

  analysis.signals.forEach(
    (
      signal,
    ) => {
      if (
        !presentation.evidence.includes(
          signal.description,
        )
      ) {
        throw new Error(
          `Presentation evidence must include Memory Signal description: ${signal.type}.`,
        );
      }
    },
  );
}

/* ------------------------------------------------------------------ */
/* Nullable String Validation                                         */
/* ------------------------------------------------------------------ */

function validateNullablePresentationString(
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

/* ------------------------------------------------------------------ */
/* Presentation String Collection Validation                          */
/* ------------------------------------------------------------------ */

function validateUniquePresentationStrings(
  values:
    readonly unknown[],
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

      const normalized =
        value.trim();

      if (
        observed.has(
          normalized,
        )
      ) {
        throw new Error(
          `${fieldName} contains duplicate value: ${normalized}.`,
        );
      }

      observed.add(
        normalized,
      );
    },
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
    "string"
  ) {
    throw new Error(
      `${fieldName} must be a string.`,
    );
  }

  if (
    value.trim().length ===
    0
  ) {
    throw new Error(
      `${fieldName} must not be empty.`,
    );
  }
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

  const parsed =
    Date.parse(
      value,
    );

  if (
    Number.isNaN(
      parsed,
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
  const earlierTimestamp =
    Date.parse(
      earlier,
    );

  const laterTimestamp =
    Date.parse(
      later,
    );

  if (
    earlierTimestamp >
    laterTimestamp
  ) {
    throw new Error(
      `${earlierFieldName} must not be later than ${laterFieldName}.`,
    );
  }
}