import type {
    RecommendationEvolutionIntelligenceScores,
    RecommendationEvolutionIntelligenceSignalConfidence,
    RecommendationEvolutionIntelligenceState,
    RecommendationEvolutionStrategyType,
} from "./recommendationEvolutionIntelligenceTypes";

import {
    validateRecommendationEvolutionMemory,
} from "./appendRecommendationEvolutionMemory";

import {
    compareRecommendationEvolutionMemoryEntries,
    validateRecommendationEvolutionMemoryComparison,
} from "./compareRecommendationEvolutionMemoryEntries";

import {
    createEmptyRecommendationEvolutionMemoryStateCounts,
    createEmptyRecommendationEvolutionMemoryStrategyCounts,
    isRecommendationEvolutionMemorySignalSeverity,
    isRecommendationEvolutionMemorySignalType,
    isRecommendationEvolutionMemoryState,
    isRecommendationEvolutionMemoryVersion,
} from "./recommendationEvolutionMemoryTypes";

import type {
    AnalyzeRecommendationEvolutionMemoryParams,
    RecommendationEvolutionMemory,
    RecommendationEvolutionMemoryAnalysis,
    RecommendationEvolutionMemoryComparison,
    RecommendationEvolutionMemoryEntry,
    RecommendationEvolutionMemoryScores,
    RecommendationEvolutionMemorySignal,
    RecommendationEvolutionMemorySignalType,
    RecommendationEvolutionMemoryState,
    RecommendationEvolutionMemoryStatistics,
    ValidateRecommendationEvolutionMemoryAnalysisParams,
} from "./recommendationEvolutionMemoryTypes";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const MEMORY_VERSION =
  1 as const;

const EMPTY_SCORE:
  RecommendationEvolutionIntelligenceScores = {
    stability:
      0,

    progress:
      0,

    repetitionRisk:
      0,

    redirectionRisk:
      0,

    completionMomentum:
      0,
  };

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Memory 전체를 분석합니다.
 *
 * Part A에서는 다음 기능을 완성합니다.
 *
 * - Memory 검증
 * - 연속 Entry 비교 생성
 * - State / Strategy 빈도 계산
 * - Score 평균 계산
 * - 최신 Score 변화 계산
 * - State / Strategy 현재 Streak 계산
 * - 기본 unavailable / insufficient 분석 생성
 *
 * 장기 상태 판정, Signal 탐지, Reasoning 확장은 Part B에서
 * resolveMemoryAnalysisState(), createMemorySignals(),
 * resolveMemoryScores(), createMemoryReasoning()을 확장합니다.
 */
export function analyzeRecommendationEvolutionMemory(
  params:
    AnalyzeRecommendationEvolutionMemoryParams,
): RecommendationEvolutionMemoryAnalysis {
  const {
    memory,
    analyzedAt,
    createComparisonId,
    createSignalId,
  } = params;

  validateRecommendationEvolutionMemory({
    memory,
  });

  validateTimestamp(
    analyzedAt,
    "analyzedAt",
  );

  validateMemoryAnalyzedAt(
    memory,
    analyzedAt,
  );

  const comparisons =
    createMemoryComparisons({
      memory,
      analyzedAt,
      createComparisonId,
    });

  const statistics =
    calculateRecommendationEvolutionMemoryStatistics({
      memory,
      comparisons,
    });

  const state =
    resolveMemoryAnalysisState({
      memory,
      statistics,
      comparisons,
    });

  const scores =
    resolveMemoryScores({
      memory,
      statistics,
      comparisons,
    });

  const signals =
    createMemorySignals({
      memory,
      statistics,
      comparisons,
      state,
      analyzedAt,
      createSignalId,
    });

  const primarySignalType =
    resolvePrimaryMemorySignalType(
      signals,
    );

  const confidence =
    resolveMemoryAnalysisConfidence({
      statistics,
      state,
      signals,
    });

  const reasoning =
    createMemoryReasoning({
      statistics,
      state,
      scores,
      signals,
    });

  const analysis:
    RecommendationEvolutionMemoryAnalysis = {
      version:
        MEMORY_VERSION,

      memoryId:
        memory.id,

      historyId:
        memory.historyId,

      state,

      confidence,

      statistics,

      scores,

      signals,

      comparisons,

      primarySignalType,

      reasoning,

      analyzedAt,
    };

  validateRecommendationEvolutionMemoryAnalysis({
    memory,
    analysis,
  });

  return analysis;
}

/* ------------------------------------------------------------------ */
/* Public Analysis Validation API                                     */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Memory Analysis 결과의 구조와
 * Memory 원본 사이의 일관성을 검증합니다.
 */
export function validateRecommendationEvolutionMemoryAnalysis(
  params:
    ValidateRecommendationEvolutionMemoryAnalysisParams,
): void {
  const {
    memory,
    analysis,
  } = params;

  validateRecommendationEvolutionMemory({
    memory,
  });

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
      "Recommendation Evolution Memory Analysis must be an object.",
    );
  }

  if (
    !isRecommendationEvolutionMemoryVersion(
      analysis.version,
    )
  ) {
    throw new Error(
      "Recommendation Evolution Memory Analysis version is invalid.",
    );
  }

  validateRequiredIdentifier(
    analysis.memoryId,
    "analysis.memoryId",
  );

  validateRequiredIdentifier(
    analysis.historyId,
    "analysis.historyId",
  );

  if (
    analysis.memoryId !==
    memory.id
  ) {
    throw new Error(
      "Recommendation Evolution Memory Analysis memoryId must match Memory id.",
    );
  }

  if (
    analysis.historyId !==
    memory.historyId
  ) {
    throw new Error(
      "Recommendation Evolution Memory Analysis historyId must match Memory historyId.",
    );
  }

  if (
    !isRecommendationEvolutionMemoryState(
      analysis.state,
    )
  ) {
    throw new Error(
      "Recommendation Evolution Memory Analysis state is invalid.",
    );
  }

  validateAnalysisConfidence(
    analysis.confidence,
  );

  validateMemoryStatistics({
    memory,
    analysis,
  });

  validateMemoryLongTermScores(
    analysis.scores,
  );

  validateMemoryAnalysisComparisons({
    memory,
    analysis,
  });

  validateMemoryAnalysisSignals({
    memory,
    analysis,
  });

  validatePrimaryMemorySignalConsistency(
    analysis,
  );

  validateMemoryReasoning(
    analysis.reasoning,
  );

  validateTimestamp(
    analysis.analyzedAt,
    "analysis.analyzedAt",
  );

  validateTimestampOrder(
    memory.updatedAt,
    analysis.analyzedAt,
    "memory.updatedAt",
    "analysis.analyzedAt",
  );

  validateMemoryStateConsistency(
    analysis,
  );
}

/* ------------------------------------------------------------------ */
/* Statistics Validation                                              */
/* ------------------------------------------------------------------ */

type ValidateMemoryStatisticsParams = {
  memory:
    RecommendationEvolutionMemory;

  analysis:
    RecommendationEvolutionMemoryAnalysis;
};

function validateMemoryStatistics(
  params:
    ValidateMemoryStatisticsParams,
): void {
  const {
    memory,
    analysis,
  } = params;

  const {
    statistics,
  } = analysis;

  if (
    typeof statistics !==
      "object" ||
    statistics ===
      null ||
    Array.isArray(
      statistics,
    )
  ) {
    throw new Error(
      "analysis.statistics must be an object.",
    );
  }

  validateNonNegativeInteger(
    statistics.entryCount,
    "statistics.entryCount",
  );

  validateNonNegativeInteger(
    statistics.comparisonCount,
    "statistics.comparisonCount",
  );

  validateNonNegativeInteger(
    statistics.stateChangeCount,
    "statistics.stateChangeCount",
  );

  validateNonNegativeInteger(
    statistics.strategyChangeCount,
    "statistics.strategyChangeCount",
  );

  validateNonNegativeInteger(
    statistics.observeStreak,
    "statistics.observeStreak",
  );

  validateNonNegativeInteger(
    statistics.maintainStreak,
    "statistics.maintainStreak",
  );

  validateNonNegativeInteger(
    statistics.stalledStreak,
    "statistics.stalledStreak",
  );

  validateNonNegativeInteger(
    statistics.fragmentedStreak,
    "statistics.fragmentedStreak",
  );

  validateNonNegativeInteger(
    statistics.advancingStreak,
    "statistics.advancingStreak",
  );

  if (
    statistics.entryCount !==
    memory.entries.length
  ) {
    throw new Error(
      "statistics.entryCount must match Memory entries length.",
    );
  }

  if (
    statistics.comparisonCount !==
    analysis.comparisons.length
  ) {
    throw new Error(
      "statistics.comparisonCount must match Analysis comparisons length.",
    );
  }

  if (
    statistics.comparisonCount !==
    statistics.entryCount
  ) {
    throw new Error(
      "statistics.comparisonCount must equal entryCount because the first Entry creates an initial Comparison.",
    );
  }

  const maximumTransitionCount =
    Math.max(
      0,
      statistics.entryCount -
      1,
    );

  if (
    statistics.stateChangeCount >
    maximumTransitionCount
  ) {
    throw new Error(
      "statistics.stateChangeCount exceeds the available transition count.",
    );
  }

  if (
    statistics.strategyChangeCount >
    maximumTransitionCount
  ) {
    throw new Error(
      "statistics.strategyChangeCount exceeds the available transition count.",
    );
  }

  validateCountRecord(
    statistics.stateCounts,
    "statistics.stateCounts",
    statistics.entryCount,
  );

  validateCountRecord(
    statistics.strategyCounts,
    "statistics.strategyCounts",
    statistics.entryCount,
  );

  validateIntelligenceScores(
    statistics.averageScores,
    "statistics.averageScores",
  );

  if (
    statistics.latestScoreChanges !==
    null
  ) {
    validateFiniteScoreChanges(
      statistics.latestScoreChanges,
      "statistics.latestScoreChanges",
    );
  }

  validateStreakBounds(
    statistics,
  );
}

/* ------------------------------------------------------------------ */
/* Long-term Score Validation                                         */
/* ------------------------------------------------------------------ */

function validateMemoryLongTermScores(
  scores:
    RecommendationEvolutionMemoryScores,
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
      "analysis.scores must be an object.",
    );
  }

  validateNormalizedScore(
    scores.longTermStability,
    "scores.longTermStability",
  );

  validateNormalizedScore(
    scores.longTermProgress,
    "scores.longTermProgress",
  );

  validateNormalizedScore(
    scores.longTermRisk,
    "scores.longTermRisk",
  );

  validateNormalizedScore(
    scores.recovery,
    "scores.recovery",
  );
}

function validateIntelligenceScores(
  scores:
    RecommendationEvolutionIntelligenceScores,
  fieldName:
    string,
): void {
  validateNormalizedScore(
    scores.stability,
    `${fieldName}.stability`,
  );

  validateNormalizedScore(
    scores.progress,
    `${fieldName}.progress`,
  );

  validateNormalizedScore(
    scores.repetitionRisk,
    `${fieldName}.repetitionRisk`,
  );

  validateNormalizedScore(
    scores.redirectionRisk,
    `${fieldName}.redirectionRisk`,
  );

  validateNormalizedScore(
    scores.completionMomentum,
    `${fieldName}.completionMomentum`,
  );
}

function validateFiniteScoreChanges(
  changes:
    RecommendationEvolutionMemoryStatistics["latestScoreChanges"],
  fieldName:
    string,
): void {
  if (
    changes ===
    null
  ) {
    return;
  }

  validateFiniteNumber(
    changes.stability,
    `${fieldName}.stability`,
  );

  validateFiniteNumber(
    changes.progress,
    `${fieldName}.progress`,
  );

  validateFiniteNumber(
    changes.repetitionRisk,
    `${fieldName}.repetitionRisk`,
  );

  validateFiniteNumber(
    changes.redirectionRisk,
    `${fieldName}.redirectionRisk`,
  );

  validateFiniteNumber(
    changes.completionMomentum,
    `${fieldName}.completionMomentum`,
  );
}

/* ------------------------------------------------------------------ */
/* Comparison Collection Validation                                   */
/* ------------------------------------------------------------------ */

type ValidateMemoryAnalysisComparisonsParams = {
  memory:
    RecommendationEvolutionMemory;

  analysis:
    RecommendationEvolutionMemoryAnalysis;
};

function validateMemoryAnalysisComparisons(
  params:
    ValidateMemoryAnalysisComparisonsParams,
): void {
  const {
    memory,
    analysis,
  } = params;

  if (
    !Array.isArray(
      analysis.comparisons,
    )
  ) {
    throw new Error(
      "analysis.comparisons must be an array.",
    );
  }

  if (
    analysis.comparisons.length !==
    memory.entries.length
  ) {
    throw new Error(
      "Analysis comparisons length must match Memory entries length.",
    );
  }

  const observedIds =
    new Set<string>();

  analysis.comparisons.forEach(
    (
      comparison,
      index,
    ) => {
      validateRecommendationEvolutionMemoryComparison({
        comparison,
      });

      if (
        observedIds.has(
          comparison.id,
        )
      ) {
        throw new Error(
          `Analysis comparisons contain duplicate id: ${comparison.id}.`,
        );
      }

      observedIds.add(
        comparison.id,
      );

      const memoryEntry =
        memory.entries[
          index
        ];

      if (
        memoryEntry ===
        undefined
      ) {
        throw new Error(
          `Memory Entry is missing at comparison index ${index}.`,
        );
      }

      if (
        comparison.current.id !==
        memoryEntry.id
      ) {
        throw new Error(
          `Comparison current Entry at index ${index} must match Memory Entry.`,
        );
      }

      if (
        index ===
        0
      ) {
        if (
          comparison.previous !==
          null
        ) {
          throw new Error(
            "The first Memory Comparison must be initial.",
          );
        }

        return;
      }

      const expectedPrevious =
        memory.entries[
          index -
          1
        ];

      if (
        expectedPrevious ===
        undefined ||
        comparison.previous ===
        null ||
        comparison.previous.id !==
        expectedPrevious.id
      ) {
        throw new Error(
          `Comparison previous Entry at index ${index} is inconsistent.`,
        );
      }
    },
  );
}

function validateCountRecord(
  counts:
    Record<string, number>,
  fieldName:
    string,
  expectedTotal:
    number,
): void {
  if (
    typeof counts !==
      "object" ||
    counts ===
      null ||
    Array.isArray(
      counts,
    )
  ) {
    throw new Error(
      `${fieldName} must be an object.`,
    );
  }

  const values =
    Object.values(
      counts,
    );

  values.forEach(
    (
      value,
      index,
    ) => {
      validateNonNegativeInteger(
        value,
        `${fieldName}[${index}]`,
      );
    },
  );

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

  if (
    total !==
    expectedTotal
  ) {
    throw new Error(
      `${fieldName} total must equal entryCount.`,
    );
  }
}

function validateStreakBounds(
  statistics:
    RecommendationEvolutionMemoryStatistics,
): void {
  const streaks = [
    statistics.observeStreak,
    statistics.maintainStreak,
    statistics.stalledStreak,
    statistics.fragmentedStreak,
    statistics.advancingStreak,
  ];

  if (
    streaks.some(
      (
        streak,
      ) =>
        streak >
        statistics.entryCount,
    )
  ) {
    throw new Error(
      "Memory Statistics streak must not exceed entryCount.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Memory Comparison Collection                                       */
/* ------------------------------------------------------------------ */

type CreateMemoryComparisonsParams = {
  memory:
    RecommendationEvolutionMemory;

  analyzedAt:
    string;

  createComparisonId:
    (
      index:
        number,
    ) => string;
};

function createMemoryComparisons(
  params:
    CreateMemoryComparisonsParams,
): RecommendationEvolutionMemoryComparison[] {
  const {
    memory,
    analyzedAt,
    createComparisonId,
  } = params;

  return memory.entries.map(
    (
      current,
      index,
    ) => {
      const previous =
        index ===
        0
          ? null
          : memory.entries[
              index -
              1
            ] ??
            null;

      return compareRecommendationEvolutionMemoryEntries({
        previous,

        current,

        comparedAt:
          analyzedAt,

        createComparisonId:
          () =>
            createComparisonId(
              index,
            ),
      });
    },
  );
}

/* ------------------------------------------------------------------ */
/* Statistics                                                         */
/* ------------------------------------------------------------------ */

type CalculateMemoryStatisticsParams = {
  memory:
    RecommendationEvolutionMemory;

  comparisons:
    RecommendationEvolutionMemoryComparison[];
};

export function calculateRecommendationEvolutionMemoryStatistics(
  params:
    CalculateMemoryStatisticsParams,
): RecommendationEvolutionMemoryStatistics {
  const {
    memory,
    comparisons,
  } = params;

  const stateCounts =
    calculateStateCounts(
      memory.entries,
    );

  const strategyCounts =
    calculateStrategyCounts(
      memory.entries,
    );

  const stateChangeCount =
    comparisons.filter(
      (
        comparison,
      ) =>
        comparison.stateChanged,
    ).length;

  const strategyChangeCount =
    comparisons.filter(
      (
        comparison,
      ) =>
        comparison.strategyChanged,
    ).length;

  return {
    entryCount:
      memory.entries.length,

    comparisonCount:
      comparisons.length,

    stateCounts,

    strategyCounts,

    stateChangeCount,

    strategyChangeCount,

    observeStreak:
      calculateCurrentStrategyStreak(
        memory.entries,
        "observe",
      ),

    maintainStreak:
      calculateCurrentStrategyStreak(
        memory.entries,
        "maintain",
      ),

    stalledStreak:
      calculateCurrentStateStreak(
        memory.entries,
        "stalled",
      ),

    fragmentedStreak:
      calculateCurrentStateStreak(
        memory.entries,
        "fragmented",
      ),

    advancingStreak:
      calculateCurrentStateStreak(
        memory.entries,
        "advancing",
      ),

    averageScores:
      calculateAverageScores(
        memory.entries,
      ),

    latestScoreChanges:
      getLatestScoreChanges(
        comparisons,
      ),
  };
}

/* ------------------------------------------------------------------ */
/* State Counts                                                       */
/* ------------------------------------------------------------------ */

function calculateStateCounts(
  entries:
    RecommendationEvolutionMemoryEntry[],
): RecommendationEvolutionMemoryStatistics["stateCounts"] {
  const counts =
    createEmptyRecommendationEvolutionMemoryStateCounts();

  entries.forEach(
    (
      entry,
    ) => {
      counts[
        entry.state
      ] +=
        1;
    },
  );

  return counts;
}

/* ------------------------------------------------------------------ */
/* Strategy Counts                                                    */
/* ------------------------------------------------------------------ */

function calculateStrategyCounts(
  entries:
    RecommendationEvolutionMemoryEntry[],
): RecommendationEvolutionMemoryStatistics["strategyCounts"] {
  const counts =
    createEmptyRecommendationEvolutionMemoryStrategyCounts();

  entries.forEach(
    (
      entry,
    ) => {
      counts[
        entry.strategyType
      ] +=
        1;
    },
  );

  return counts;
}

/* ------------------------------------------------------------------ */
/* Average Scores                                                     */
/* ------------------------------------------------------------------ */

function calculateAverageScores(
  entries:
    RecommendationEvolutionMemoryEntry[],
): RecommendationEvolutionIntelligenceScores {
  if (
    entries.length ===
    0
  ) {
    return {
      ...EMPTY_SCORE,
    };
  }

  const totals =
    entries.reduce<
      RecommendationEvolutionIntelligenceScores
    >(
      (
        accumulator,
        entry,
      ) => {
        return {
          stability:
            accumulator.stability +
            entry.scores.stability,

          progress:
            accumulator.progress +
            entry.scores.progress,

          repetitionRisk:
            accumulator.repetitionRisk +
            entry.scores.repetitionRisk,

          redirectionRisk:
            accumulator.redirectionRisk +
            entry.scores.redirectionRisk,

          completionMomentum:
            accumulator.completionMomentum +
            entry.scores.completionMomentum,
        };
      },
      {
        ...EMPTY_SCORE,
      },
    );

  return {
    stability:
      normalizeScore(
        totals.stability /
        entries.length,
      ),

    progress:
      normalizeScore(
        totals.progress /
        entries.length,
      ),

    repetitionRisk:
      normalizeScore(
        totals.repetitionRisk /
        entries.length,
      ),

    redirectionRisk:
      normalizeScore(
        totals.redirectionRisk /
        entries.length,
      ),

    completionMomentum:
      normalizeScore(
        totals.completionMomentum /
        entries.length,
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Latest Score Changes                                               */
/* ------------------------------------------------------------------ */

function getLatestScoreChanges(
  comparisons:
    RecommendationEvolutionMemoryComparison[],
): RecommendationEvolutionMemoryStatistics["latestScoreChanges"] {
  if (
    comparisons.length <
    2
  ) {
    return null;
  }

  const latestComparison =
    comparisons[
      comparisons.length -
      1
    ];

  if (
    latestComparison ===
    undefined ||
    latestComparison.previous ===
    null
  ) {
    return null;
  }

  return {
    ...latestComparison.scoreChanges,
  };
}

/* ------------------------------------------------------------------ */
/* Current State Streak                                               */
/* ------------------------------------------------------------------ */

/**
 * Memory 마지막 Entry부터 역순으로 확인해 지정한 State가
 * 연속해서 나타난 횟수를 계산합니다.
 */
export function calculateCurrentStateStreak(
  entries:
    RecommendationEvolutionMemoryEntry[],
  targetState:
    RecommendationEvolutionIntelligenceState,
): number {
  let streak =
    0;

  for (
    let index =
      entries.length -
      1;
    index >=
    0;
    index -=
      1
  ) {
    const entry =
      entries[
        index
      ];

    if (
      entry ===
      undefined
    ) {
      continue;
    }

    if (
      entry.state !==
      targetState
    ) {
      break;
    }

    streak +=
      1;
  }

  return streak;
}

/* ------------------------------------------------------------------ */
/* Current Strategy Streak                                            */
/* ------------------------------------------------------------------ */

/**
 * Memory 마지막 Entry부터 역순으로 확인해 지정한 Strategy가
 * 연속해서 나타난 횟수를 계산합니다.
 */
export function calculateCurrentStrategyStreak(
  entries:
    RecommendationEvolutionMemoryEntry[],
  targetStrategy:
    RecommendationEvolutionStrategyType,
): number {
  let streak =
    0;

  for (
    let index =
      entries.length -
      1;
    index >=
    0;
    index -=
      1
  ) {
    const entry =
      entries[
        index
      ];

    if (
      entry ===
      undefined
    ) {
      continue;
    }

    if (
      entry.strategyType !==
      targetStrategy
    ) {
      break;
    }

    streak +=
      1;
  }

  return streak;
}

/* ------------------------------------------------------------------ */
/* Memory State Resolution                                            */
/* ------------------------------------------------------------------ */

type ResolveMemoryAnalysisStateParams = {
  memory:
    RecommendationEvolutionMemory;

  statistics:
    RecommendationEvolutionMemoryStatistics;

  comparisons:
    RecommendationEvolutionMemoryComparison[];
};

function resolveMemoryAnalysisState(
  params:
    ResolveMemoryAnalysisStateParams,
): RecommendationEvolutionMemoryState {
  const {
    memory,
    statistics,
    comparisons,
  } = params;

  if (
    statistics.entryCount ===
    0
  ) {
    return "unavailable";
  }

  if (
    statistics.entryCount ===
    1
  ) {
    return "insufficient";
  }

  if (
    isRecoveringMemory(
      comparisons,
    )
  ) {
    return "recovering";
  }

  if (
    isRegressingMemory({
      memory,
      statistics,
      comparisons,
    })
  ) {
    return "regressing";
  }

  if (
    isOscillatingMemory({
      memory,
      statistics,
      comparisons,
    })
  ) {
    return "oscillating";
  }

  if (
    isStagnantMemory(
      statistics,
    )
  ) {
    return "stagnant";
  }

  if (
    isAdvancingMemory({
      memory,
      statistics,
      comparisons,
    })
  ) {
    return "advancing";
  }

  if (
    isImprovingMemory({
      statistics,
      comparisons,
    })
  ) {
    return "improving";
  }

  return "stable";
}

/* ------------------------------------------------------------------ */
/* Recovering Detection                                               */
/* ------------------------------------------------------------------ */

function isRecoveringMemory(
  comparisons:
    RecommendationEvolutionMemoryComparison[],
): boolean {
  const recentComparisons =
    getRecentNonInitialComparisons(
      comparisons,
      3,
    );

  if (
    recentComparisons.length ===
    0
  ) {
    return false;
  }

  return recentComparisons.some(
    (
      comparison,
    ) =>
      comparison.type ===
      "recovered",
  );
}

/* ------------------------------------------------------------------ */
/* Regression Detection                                               */
/* ------------------------------------------------------------------ */

type IsRegressingMemoryParams = {
  memory:
    RecommendationEvolutionMemory;

  statistics:
    RecommendationEvolutionMemoryStatistics;

  comparisons:
    RecommendationEvolutionMemoryComparison[];
};

function isRegressingMemory(
  params:
    IsRegressingMemoryParams,
): boolean {
  const {
    memory,
    statistics,
    comparisons,
  } = params;

  const latestEntry =
    getLatestMemoryEntry(
      memory,
    );

  if (
    latestEntry ===
    null
  ) {
    return false;
  }

  const recentComparisons =
    getRecentNonInitialComparisons(
      comparisons,
      3,
    );

  const regressionCount =
    recentComparisons.filter(
      (
        comparison,
      ) =>
        comparison.type ===
          "regressed" ||
        comparison.type ===
          "fragmented" ||
        comparison.type ===
          "stalled",
    ).length;

  const latestChanges =
    statistics.latestScoreChanges;

  const scoresAreDeclining =
    latestChanges !==
      null &&
    (
      latestChanges.stability <=
        -0.1 ||
      latestChanges.progress <=
        -0.1 ||
      latestChanges.repetitionRisk >=
        0.1 ||
      latestChanges.redirectionRisk >=
        0.1
    );

  const latestStateIsRisky =
    latestEntry.state ===
      "fragmented" ||
    latestEntry.state ===
      "stalled";

  return (
    regressionCount >=
      2 ||
    (
      latestStateIsRisky &&
      scoresAreDeclining
    )
  );
}

/* ------------------------------------------------------------------ */
/* Oscillation Detection                                              */
/* ------------------------------------------------------------------ */

type IsOscillatingMemoryParams = {
  memory:
    RecommendationEvolutionMemory;

  statistics:
    RecommendationEvolutionMemoryStatistics;

  comparisons:
    RecommendationEvolutionMemoryComparison[];
};

function isOscillatingMemory(
  params:
    IsOscillatingMemoryParams,
): boolean {
  const {
    memory,
    statistics,
    comparisons,
  } = params;

  if (
    memory.entries.length <
    4
  ) {
    return false;
  }

  const recentEntries =
    getRecentEntries(
      memory.entries,
      4,
    );

  const stateOscillation =
    hasAlternatingValues(
      recentEntries.map(
        (
          entry,
        ) =>
          entry.state,
      ),
    );

  const strategyOscillation =
    hasAlternatingValues(
      recentEntries.map(
        (
          entry,
        ) =>
          entry.strategyType,
      ),
    );

  const recentComparisons =
    getRecentNonInitialComparisons(
      comparisons,
      3,
    );

  const repeatedChangeCount =
    recentComparisons.filter(
      (
        comparison,
      ) =>
        comparison.stateChanged ||
        comparison.strategyChanged,
    ).length;

  const highChangeRatio =
    statistics.entryCount >
      1 &&
    (
      statistics.stateChangeCount +
      statistics.strategyChangeCount
    ) /
      (
        (
          statistics.entryCount -
          1
        ) *
        2
      ) >=
      0.65;

  return (
    stateOscillation ||
    strategyOscillation ||
    (
      repeatedChangeCount >=
        3 &&
      highChangeRatio
    )
  );
}

/* ------------------------------------------------------------------ */
/* Stagnation Detection                                               */
/* ------------------------------------------------------------------ */

function isStagnantMemory(
  statistics:
    RecommendationEvolutionMemoryStatistics,
): boolean {
  if (
    statistics.observeStreak >=
    3
  ) {
    return true;
  }

  if (
    statistics.stalledStreak >=
    2
  ) {
    return true;
  }

  const latestChanges =
    statistics.latestScoreChanges;

  if (
    latestChanges ===
    null
  ) {
    return false;
  }

  const littleProgressChange =
    Math.abs(
      latestChanges.progress,
    ) <
    0.05;

  const littleCompletionChange =
    Math.abs(
      latestChanges.completionMomentum,
    ) <
    0.05;

  const persistentStall =
    statistics.stateCounts.stalled >=
    2;

  return (
    persistentStall &&
    littleProgressChange &&
    littleCompletionChange
  );
}

/* ------------------------------------------------------------------ */
/* Advancement Detection                                              */
/* ------------------------------------------------------------------ */

type IsAdvancingMemoryParams = {
  memory:
    RecommendationEvolutionMemory;

  statistics:
    RecommendationEvolutionMemoryStatistics;

  comparisons:
    RecommendationEvolutionMemoryComparison[];
};

function isAdvancingMemory(
  params:
    IsAdvancingMemoryParams,
): boolean {
  const {
    memory,
    statistics,
    comparisons,
  } = params;

  const latestEntry =
    getLatestMemoryEntry(
      memory,
    );

  if (
    latestEntry ===
    null
  ) {
    return false;
  }

  if (
    statistics.advancingStreak >=
    2
  ) {
    return true;
  }

  const recentComparisons =
    getRecentNonInitialComparisons(
      comparisons,
      3,
    );

  const advancedTransitionCount =
    recentComparisons.filter(
      (
        comparison,
      ) =>
        comparison.type ===
        "advanced",
    ).length;

  const strongLatestMomentum =
    latestEntry.scores.progress >=
      0.7 &&
    latestEntry.scores.completionMomentum >=
      0.65;

  return (
    latestEntry.state ===
      "advancing" &&
    (
      advancedTransitionCount >=
        1 ||
      strongLatestMomentum
    )
  );
}

/* ------------------------------------------------------------------ */
/* Improvement Detection                                              */
/* ------------------------------------------------------------------ */

type IsImprovingMemoryParams = {
  statistics:
    RecommendationEvolutionMemoryStatistics;

  comparisons:
    RecommendationEvolutionMemoryComparison[];
};

function isImprovingMemory(
  params:
    IsImprovingMemoryParams,
): boolean {
  const {
    statistics,
    comparisons,
  } = params;

  const latestChanges =
    statistics.latestScoreChanges;

  const latestComparison =
    getLatestNonInitialComparison(
      comparisons,
    );

  if (
    latestComparison !==
      null &&
    (
      latestComparison.type ===
        "progressed" ||
      latestComparison.type ===
        "stabilized" ||
      latestComparison.type ===
        "confidence-improved"
    )
  ) {
    return true;
  }

  if (
    latestChanges ===
    null
  ) {
    return false;
  }

  const constructiveIncrease =
    latestChanges.stability >=
      0.08 ||
    latestChanges.progress >=
      0.08 ||
    latestChanges.completionMomentum >=
      0.08;

  const riskReduction =
    latestChanges.repetitionRisk <=
      -0.08 ||
    latestChanges.redirectionRisk <=
      -0.08;

  return (
    constructiveIncrease &&
    riskReduction
  );
}

/* ------------------------------------------------------------------ */
/* Long-term Scores                                                   */
/* ------------------------------------------------------------------ */

type ResolveMemoryScoresParams = {
  memory:
    RecommendationEvolutionMemory;

  statistics:
    RecommendationEvolutionMemoryStatistics;

  comparisons:
    RecommendationEvolutionMemoryComparison[];
};

function resolveMemoryScores(
  params:
    ResolveMemoryScoresParams,
): RecommendationEvolutionMemoryScores {
  const {
    memory,
    statistics,
    comparisons,
  } = params;

  if (
    statistics.entryCount ===
    0
  ) {
    return {
      longTermStability:
        0,

      longTermProgress:
        0,

      longTermRisk:
        0,

      recovery:
        0,
    };
  }

  const average =
    statistics.averageScores;

  const transitionCount =
    Math.max(
      1,
      statistics.entryCount -
      1,
    );

  const stateChangeRatio =
    statistics.stateChangeCount /
    transitionCount;

  const strategyChangeRatio =
    statistics.strategyChangeCount /
    transitionCount;

  const oscillationPenalty =
    calculateOscillationPenalty(
      memory.entries,
    );

  const stalledRatio =
    statistics.stateCounts.stalled /
    statistics.entryCount;

  const fragmentedRatio =
    statistics.stateCounts.fragmented /
    statistics.entryCount;

  const advancingRatio =
    statistics.stateCounts.advancing /
    statistics.entryCount;

  const longTermStability =
    normalizeScore(
      average.stability *
        0.7 +
      (
        1 -
        stateChangeRatio
      ) *
        0.2 +
      (
        1 -
        strategyChangeRatio
      ) *
        0.1 -
      oscillationPenalty *
        0.25,
    );

  const longTermProgress =
    normalizeScore(
      average.progress *
        0.5 +
      average.completionMomentum *
        0.3 +
      advancingRatio *
        0.2,
    );

  const longTermRisk =
    normalizeScore(
      average.repetitionRisk *
        0.35 +
      average.redirectionRisk *
        0.35 +
      stalledRatio *
        0.15 +
      fragmentedRatio *
        0.15 +
      oscillationPenalty *
        0.2,
    );

  const recovery =
    calculateRecoveryScore(
      comparisons,
    );

  return {
    longTermStability,

    longTermProgress,

    longTermRisk,

    recovery,
  };
}

function calculateOscillationPenalty(
  entries:
    RecommendationEvolutionMemoryEntry[],
): number {
  if (
    entries.length <
    4
  ) {
    return 0;
  }

  const recentEntries =
    getRecentEntries(
      entries,
      6,
    );

  const stateOscillates =
    hasAlternatingValues(
      recentEntries.map(
        (
          entry,
        ) =>
          entry.state,
      ),
    );

  const strategyOscillates =
    hasAlternatingValues(
      recentEntries.map(
        (
          entry,
        ) =>
          entry.strategyType,
      ),
    );

  if (
    stateOscillates &&
    strategyOscillates
  ) {
    return 1;
  }

  if (
    stateOscillates ||
    strategyOscillates
  ) {
    return 0.65;
  }

  return 0;
}

function calculateRecoveryScore(
  comparisons:
    RecommendationEvolutionMemoryComparison[],
): number {
  const nonInitialComparisons =
    comparisons.filter(
      (
        comparison,
      ) =>
        comparison.previous !==
        null,
    );

  if (
    nonInitialComparisons.length ===
    0
  ) {
    return 0;
  }

  const recoveredCount =
    nonInitialComparisons.filter(
      (
        comparison,
      ) =>
        comparison.type ===
        "recovered",
    ).length;

  const regressionCount =
    nonInitialComparisons.filter(
      (
        comparison,
      ) =>
        comparison.type ===
          "regressed" ||
        comparison.type ===
          "fragmented" ||
        comparison.type ===
          "stalled",
    ).length;

  if (
    recoveredCount ===
    0
  ) {
    return 0;
  }

  return normalizeScore(
    recoveredCount /
      Math.max(
        1,
        regressionCount +
        recoveredCount,
      ),
  );
}

/* ------------------------------------------------------------------ */
/* Memory Signals                                                     */
/* ------------------------------------------------------------------ */

type CreateMemorySignalsParams = {
  memory:
    RecommendationEvolutionMemory;

  statistics:
    RecommendationEvolutionMemoryStatistics;

  comparisons:
    RecommendationEvolutionMemoryComparison[];

  state:
    RecommendationEvolutionMemoryState;

  analyzedAt:
    string;

  createSignalId:
    (
      type:
        RecommendationEvolutionMemorySignalType,
      index:
        number,
    ) => string;
};

function createMemorySignals(
  params:
    CreateMemorySignalsParams,
): RecommendationEvolutionMemorySignal[] {
  const {
    memory,
    statistics,
    comparisons,
    state,
    analyzedAt,
    createSignalId,
  } = params;

  const drafts:
    MemorySignalDraft[] =
      [];

  if (
    state ===
      "unavailable" ||
    state ===
      "insufficient"
  ) {
    drafts.push({
      type:
        "insufficient-memory",

      severity:
        "info",

      confidence:
        "low",

      score:
        state ===
        "unavailable"
          ? 1
          : 0.75,

      description:
        state ===
        "unavailable"
          ? "No Recommendation Evolution Memory entries are available."
          : "Additional Recommendation Evolution Memory entries are required for reliable long-term analysis.",

      relatedEntryIds:
        memory.entries.map(
          (
            entry,
          ) =>
            entry.id,
        ),

      relatedComparisonIds:
        [],
    });
  }

  if (
    statistics.observeStreak >=
    3
  ) {
    drafts.push({
      type:
        "persistent-observation",

      severity:
        statistics.observeStreak >=
        4
          ? "high"
          : "moderate",

      confidence:
        resolvePatternConfidence(
          statistics.observeStreak,
        ),

      score:
        normalizeScore(
          statistics.observeStreak /
          5,
        ),

      description:
        `The observe strategy has persisted for ${statistics.observeStreak} consecutive analyses.`,

      relatedEntryIds:
        getTrailingStrategyEntryIds(
          memory.entries,
          "observe",
        ),

      relatedComparisonIds:
        getRelatedComparisonIds(
          comparisons,
          statistics.observeStreak,
        ),
    });
  }

  if (
    statistics.maintainStreak >=
      3 &&
    state ===
      "stable"
  ) {
    drafts.push({
      type:
        "persistent-stability",

      severity:
        "info",

      confidence:
        resolvePatternConfidence(
          statistics.maintainStreak,
        ),

      score:
        normalizeScore(
          statistics.maintainStreak /
          5,
        ),

      description:
        `The maintain strategy has persisted for ${statistics.maintainStreak} consecutive analyses while the memory remains stable.`,

      relatedEntryIds:
        getTrailingStrategyEntryIds(
          memory.entries,
          "maintain",
        ),

      relatedComparisonIds:
        getRelatedComparisonIds(
          comparisons,
          statistics.maintainStreak,
        ),
    });
  }

  if (
    statistics.stalledStreak >=
    2
  ) {
    drafts.push({
      type:
        "persistent-stall",

      severity:
        statistics.stalledStreak >=
        3
          ? "high"
          : "moderate",

      confidence:
        resolvePatternConfidence(
          statistics.stalledStreak,
        ),

      score:
        normalizeScore(
          statistics.stalledStreak /
          4,
        ),

      description:
        `The stalled state has persisted for ${statistics.stalledStreak} consecutive analyses.`,

      relatedEntryIds:
        getTrailingStateEntryIds(
          memory.entries,
          "stalled",
        ),

      relatedComparisonIds:
        getRelatedComparisonIds(
          comparisons,
          statistics.stalledStreak,
        ),
    });
  }

  if (
    statistics.fragmentedStreak >=
    2
  ) {
    drafts.push({
      type:
        "persistent-fragmentation",

      severity:
        "high",

      confidence:
        resolvePatternConfidence(
          statistics.fragmentedStreak,
        ),

      score:
        normalizeScore(
          0.65 +
          statistics.fragmentedStreak *
            0.1,
        ),

      description:
        `The fragmented state has persisted for ${statistics.fragmentedStreak} consecutive analyses.`,

      relatedEntryIds:
        getTrailingStateEntryIds(
          memory.entries,
          "fragmented",
        ),

      relatedComparisonIds:
        getRelatedComparisonIds(
          comparisons,
          statistics.fragmentedStreak,
        ),
    });
  }

  const recentEntries =
    getRecentEntries(
      memory.entries,
      6,
    );

  if (
    hasAlternatingValues(
      recentEntries.map(
        (
          entry,
        ) =>
          entry.strategyType,
      ),
    )
  ) {
    drafts.push({
      type:
        "strategy-oscillation",

      severity:
        "moderate",

      confidence:
        recentEntries.length >=
        5
          ? "high"
          : "medium",

      score:
        normalizeScore(
          recentEntries.length /
          6,
        ),

      description:
        "Recommendation strategies are alternating repeatedly across recent analyses.",

      relatedEntryIds:
        recentEntries.map(
          (
            entry,
          ) =>
            entry.id,
        ),

      relatedComparisonIds:
        getRecentNonInitialComparisons(
          comparisons,
          recentEntries.length -
          1,
        ).map(
          (
            comparison,
          ) =>
            comparison.id,
        ),
    });
  }

  if (
    hasAlternatingValues(
      recentEntries.map(
        (
          entry,
        ) =>
          entry.state,
      ),
    )
  ) {
    drafts.push({
      type:
        "state-oscillation",

      severity:
        "moderate",

      confidence:
        recentEntries.length >=
        5
          ? "high"
          : "medium",

      score:
        normalizeScore(
          recentEntries.length /
          6,
        ),

      description:
        "Recommendation Intelligence states are alternating repeatedly across recent analyses.",

      relatedEntryIds:
        recentEntries.map(
          (
            entry,
          ) =>
            entry.id,
        ),

      relatedComparisonIds:
        getRecentNonInitialComparisons(
          comparisons,
          recentEntries.length -
          1,
        ).map(
          (
            comparison,
          ) =>
            comparison.id,
        ),
    });
  }

  if (
    isConfidenceDegrading(
      recentEntries,
    )
  ) {
    drafts.push({
      type:
        "confidence-degradation",

      severity:
        "moderate",

      confidence:
        "medium",

      score:
        0.7,

      description:
        "Assessment confidence has declined across recent analyses.",

      relatedEntryIds:
        recentEntries.map(
          (
            entry,
          ) =>
            entry.id,
        ),

      relatedComparisonIds:
        getRecentNonInitialComparisons(
          comparisons,
          recentEntries.length -
          1,
        ).map(
          (
            comparison,
          ) =>
            comparison.id,
        ),
    });
  }

  if (
    isConfidenceRecovering(
      recentEntries,
    )
  ) {
    drafts.push({
      type:
        "confidence-recovery",

      severity:
        "info",

      confidence:
        "medium",

      score:
        0.65,

      description:
        "Assessment confidence has recovered across recent analyses.",

      relatedEntryIds:
        recentEntries.map(
          (
            entry,
          ) =>
            entry.id,
        ),

      relatedComparisonIds:
        getRecentNonInitialComparisons(
          comparisons,
          recentEntries.length -
          1,
        ).map(
          (
            comparison,
          ) =>
            comparison.id,
        ),
    });
  }

  if (
    hasRiskAccumulation(
      statistics,
    )
  ) {
    drafts.push({
      type:
        "risk-accumulation",

      severity:
        "high",

      confidence:
        statistics.entryCount >=
        4
          ? "high"
          : "medium",

      score:
        calculateRiskSignalScore(
          statistics,
        ),

      description:
        "Repetition or redirection risk is accumulating while stability or progress is weakening.",

      relatedEntryIds:
        recentEntries.map(
          (
            entry,
          ) =>
            entry.id,
        ),

      relatedComparisonIds:
        getRecentNonInitialComparisons(
          comparisons,
          3,
        ).map(
          (
            comparison,
          ) =>
            comparison.id,
        ),
    });
  }

  if (
    hasRiskReduction(
      statistics,
    )
  ) {
    drafts.push({
      type:
        "risk-reduction",

      severity:
        "info",

      confidence:
        "medium",

      score:
        calculateRiskReductionSignalScore(
          statistics,
        ),

      description:
        "Recommendation repetition or redirection risk has decreased in the latest analysis.",

      relatedEntryIds:
        recentEntries.map(
          (
            entry,
          ) =>
            entry.id,
        ),

      relatedComparisonIds:
        getRecentNonInitialComparisons(
          comparisons,
          2,
        ).map(
          (
            comparison,
          ) =>
            comparison.id,
        ),
    });
  }

  if (
    state ===
    "improving"
  ) {
    drafts.push({
      type:
        "long-term-progression",

      severity:
        "info",

      confidence:
        statistics.entryCount >=
        4
          ? "high"
          : "medium",

      score:
        normalizeScore(
          (
            statistics.averageScores.progress +
            statistics.averageScores.stability
          ) /
          2,
        ),

      description:
        "Recommendation Intelligence is showing sustained long-term progression.",

      relatedEntryIds:
        recentEntries.map(
          (
            entry,
          ) =>
            entry.id,
        ),

      relatedComparisonIds:
        getRecentNonInitialComparisons(
          comparisons,
          3,
        ).map(
          (
            comparison,
          ) =>
            comparison.id,
        ),
    });
  }

  if (
    state ===
      "advancing" ||
    statistics.advancingStreak >=
      2
  ) {
    drafts.push({
      type:
        "long-term-advancement",

      severity:
        "info",

      confidence:
        statistics.advancingStreak >=
        3
          ? "high"
          : "medium",

      score:
        normalizeScore(
          (
            statistics.averageScores.progress +
            statistics.averageScores.completionMomentum
          ) /
          2,
        ),

      description:
        "Recommendation Intelligence has moved into a sustained advancement pattern.",

      relatedEntryIds:
        getTrailingStateEntryIds(
          memory.entries,
          "advancing",
        ),

      relatedComparisonIds:
        getRecentNonInitialComparisons(
          comparisons,
          3,
        ).map(
          (
            comparison,
          ) =>
            comparison.id,
        ),
    });
  }

  if (
    state ===
    "recovering"
  ) {
    drafts.push({
      type:
        "recovery-pattern",

      severity:
        "info",

      confidence:
        "medium",

      score:
        calculateRecoveryScore(
          comparisons,
        ),

      description:
        "Recommendation Intelligence is recovering from a previously stalled or fragmented state.",

      relatedEntryIds:
        recentEntries.map(
          (
            entry,
          ) =>
            entry.id,
        ),

      relatedComparisonIds:
        getRecentNonInitialComparisons(
          comparisons,
          3,
        ).map(
          (
            comparison,
          ) =>
            comparison.id,
        ),
    });
  }

  return drafts.map(
    (
      draft,
      index,
    ) => {
      const signalId =
        createSignalId(
          draft.type,
          index,
        );

      validateRequiredIdentifier(
        signalId,
        `Recommendation Evolution Memory Signal id at index ${index}`,
      );

      return {
        id:
          signalId,

        ...draft,

        detectedAt:
          analyzedAt,
      };
    },
  );
}

type MemorySignalDraft = Omit<
  RecommendationEvolutionMemorySignal,
  "id" | "detectedAt"
>;

function resolvePatternConfidence(
  streak:
    number,
): RecommendationEvolutionIntelligenceSignalConfidence {
  if (
    streak >=
    4
  ) {
    return "high";
  }

  if (
    streak >=
    2
  ) {
    return "medium";
  }

  return "low";
}

function getTrailingStateEntryIds(
  entries:
    RecommendationEvolutionMemoryEntry[],
  state:
    RecommendationEvolutionIntelligenceState,
): string[] {
  const ids:
    string[] =
      [];

  for (
    let index =
      entries.length -
      1;
    index >=
    0;
    index -=
      1
  ) {
    const entry =
      entries[
        index
      ];

    if (
      entry ===
        undefined ||
      entry.state !==
        state
    ) {
      break;
    }

    ids.unshift(
      entry.id,
    );
  }

  return ids;
}

function getTrailingStrategyEntryIds(
  entries:
    RecommendationEvolutionMemoryEntry[],
  strategy:
    RecommendationEvolutionStrategyType,
): string[] {
  const ids:
    string[] =
      [];

  for (
    let index =
      entries.length -
      1;
    index >=
    0;
    index -=
      1
  ) {
    const entry =
      entries[
        index
      ];

    if (
      entry ===
        undefined ||
      entry.strategyType !==
        strategy
    ) {
      break;
    }

    ids.unshift(
      entry.id,
    );
  }

  return ids;
}

function getRelatedComparisonIds(
  comparisons:
    RecommendationEvolutionMemoryComparison[],
  streak:
    number,
): string[] {
  return getRecentNonInitialComparisons(
    comparisons,
    Math.max(
      0,
      streak -
      1,
    ),
  ).map(
    (
      comparison,
    ) =>
      comparison.id,
  );
}

/* ------------------------------------------------------------------ */
/* Primary Signal                                                     */
/* ------------------------------------------------------------------ */

function resolvePrimaryMemorySignalType(
  signals:
    RecommendationEvolutionMemorySignal[],
): RecommendationEvolutionMemorySignalType | null {
  if (
    signals.length ===
    0
  ) {
    return null;
  }

  const sortedSignals =
    [
      ...signals,
    ].sort(
      (
        left,
        right,
      ) =>
        right.score -
        left.score,
    );

  return (
    sortedSignals[
      0
    ]?.type ??
    null
  );
}

/* ------------------------------------------------------------------ */
/* Analysis Confidence                                                */
/* ------------------------------------------------------------------ */

type ResolveMemoryAnalysisConfidenceParams = {
  statistics:
    RecommendationEvolutionMemoryStatistics;

  state:
    RecommendationEvolutionMemoryState;

  signals:
    RecommendationEvolutionMemorySignal[];
};

function resolveMemoryAnalysisConfidence(
  params:
    ResolveMemoryAnalysisConfidenceParams,
): RecommendationEvolutionIntelligenceSignalConfidence {
  const {
    statistics,
    state,
    signals,
  } = params;

  if (
    state ===
      "unavailable" ||
    state ===
      "insufficient"
  ) {
    return "low";
  }

  const highConfidenceSignals =
    signals.filter(
      (
        signal,
      ) =>
        signal.confidence ===
        "high",
    ).length;

  if (
    statistics.entryCount >=
      5 ||
    highConfidenceSignals >=
      1
  ) {
    return "high";
  }

  if (
    statistics.entryCount >=
    3
  ) {
    return "medium";
  }

  return "low";
}

/* ------------------------------------------------------------------ */
/* Memory Reasoning                                                   */
/* ------------------------------------------------------------------ */

type CreateMemoryReasoningParams = {
  statistics:
    RecommendationEvolutionMemoryStatistics;

  state:
    RecommendationEvolutionMemoryState;

  scores:
    RecommendationEvolutionMemoryScores;

  signals:
    RecommendationEvolutionMemorySignal[];
};

function createMemoryReasoning(
  params:
    CreateMemoryReasoningParams,
): string[] {
  const {
    statistics,
    state,
    scores,
    signals,
  } = params;

  if (
    state ===
    "unavailable"
  ) {
    return [
      "No Recommendation Evolution Memory entries are available.",
      "Long-term Recommendation Intelligence continuity cannot yet be evaluated.",
    ];
  }

  if (
    state ===
    "insufficient"
  ) {
    return [
      "Only one Recommendation Evolution Memory entry is available.",
      "At least two entries are required to evaluate change over time.",
    ];
  }

  const reasoning:
    string[] = [
      `${statistics.entryCount} Recommendation Evolution Memory entries were analyzed.`,
      `${statistics.stateChangeCount} state changes and ${statistics.strategyChangeCount} strategy changes were detected.`,
      `The long-term memory state was resolved as ${state}.`,
      `Long-term stability is ${formatScore(
        scores.longTermStability,
      )}, progress is ${formatScore(
        scores.longTermProgress,
      )}, and risk is ${formatScore(
        scores.longTermRisk,
      )}.`,
  ];

  if (
    statistics.observeStreak >=
    3
  ) {
    reasoning.push(
      `The observe strategy has continued for ${statistics.observeStreak} consecutive analyses.`,
    );
  }

  if (
    statistics.maintainStreak >=
    3
  ) {
    reasoning.push(
      `The maintain strategy has continued for ${statistics.maintainStreak} consecutive analyses.`,
    );
  }

  if (
    statistics.stalledStreak >=
    2
  ) {
    reasoning.push(
      `The stalled state has continued for ${statistics.stalledStreak} consecutive analyses.`,
    );
  }

  if (
    statistics.fragmentedStreak >=
    2
  ) {
    reasoning.push(
      `The fragmented state has continued for ${statistics.fragmentedStreak} consecutive analyses.`,
    );
  }

  if (
    statistics.advancingStreak >=
    2
  ) {
    reasoning.push(
      `The advancing state has continued for ${statistics.advancingStreak} consecutive analyses.`,
    );
  }

  if (
    scores.recovery >
    0
  ) {
    reasoning.push(
      `The recovery score is ${formatScore(
        scores.recovery,
      )}, indicating recovery from a previous risk state.`,
    );
  }

  signals.forEach(
    (
      signal,
    ) => {
      if (
        !reasoning.includes(
          signal.description,
        )
      ) {
        reasoning.push(
          signal.description,
        );
      }
    },
  );

  return reasoning;
}

/* ------------------------------------------------------------------ */
/* Timestamp Validation                                               */
/* ------------------------------------------------------------------ */

function validateMemoryAnalyzedAt(
  memory:
    RecommendationEvolutionMemory,
  analyzedAt:
    string,
): void {
  validateTimestampOrder(
    memory.updatedAt,
    analyzedAt,
    "memory.updatedAt",
    "analyzedAt",
  );

  const latestEntry =
    memory.entries[
      memory.entries.length -
      1
    ];

  if (
    latestEntry ===
    undefined
  ) {
    return;
  }

  validateTimestampOrder(
    latestEntry.recordedAt,
    analyzedAt,
    "latestEntry.recordedAt",
    "analyzedAt",
  );
}

function validateTimestamp(
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

  const timestamp =
    Date.parse(
      value,
    );

  if (
    Number.isNaN(
      timestamp,
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

/* ------------------------------------------------------------------ */
/* Generic Helpers                                                    */
/* ------------------------------------------------------------------ */

function validateRequiredIdentifier(
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

  if (
    value.length >
    256
  ) {
    throw new Error(
      `${fieldName} must not exceed 256 characters.`,
    );
  }
}

function normalizeScore(
  value:
    number,
): number {
  const clamped =
    Math.min(
      1,
      Math.max(
        0,
        value,
      ),
    );

  const normalized =
    Number(
      clamped.toFixed(
        6,
      ),
    );

  return Object.is(
    normalized,
    -0,
  )
    ? 0
    : normalized;
}

function formatScore(
  value:
    number,
): string {
  return value.toFixed(
    3,
  );
}

function isConfidenceDegrading(
  entries:
    RecommendationEvolutionMemoryEntry[],
): boolean {
  if (
    entries.length <
    3
  ) {
    return false;
  }

  const recent =
    getRecentEntries(
      entries,
      3,
    );

  const ranks =
    recent.map(
      (
        entry,
      ) =>
        getConfidenceRank(
          entry.assessmentConfidence,
        ),
    );

  return (
    ranks.length ===
      3 &&
    ranks[0] !==
      undefined &&
    ranks[1] !==
      undefined &&
    ranks[2] !==
      undefined &&
    ranks[0] >
      ranks[1] &&
    ranks[1] >
      ranks[2]
  );
}

function isConfidenceRecovering(
  entries:
    RecommendationEvolutionMemoryEntry[],
): boolean {
  if (
    entries.length <
    3
  ) {
    return false;
  }

  const recent =
    getRecentEntries(
      entries,
      3,
    );

  const ranks =
    recent.map(
      (
        entry,
      ) =>
        getConfidenceRank(
          entry.assessmentConfidence,
        ),
    );

  return (
    ranks.length ===
      3 &&
    ranks[0] !==
      undefined &&
    ranks[1] !==
      undefined &&
    ranks[2] !==
      undefined &&
    ranks[0] <
      ranks[1] &&
    ranks[1] <
      ranks[2]
  );
}

function getConfidenceRank(
  confidence:
    RecommendationEvolutionIntelligenceSignalConfidence,
): number {
  switch (
    confidence
  ) {
    case "low":
      return 1;

    case "medium":
      return 2;

    case "high":
      return 3;
  }
}

function hasRiskAccumulation(
  statistics:
    RecommendationEvolutionMemoryStatistics,
): boolean {
  const changes =
    statistics.latestScoreChanges;

  if (
    changes ===
    null
  ) {
    return false;
  }

  const riskIncrease =
    changes.repetitionRisk >=
      0.1 ||
    changes.redirectionRisk >=
      0.1;

  const constructiveDecline =
    changes.stability <=
      -0.08 ||
    changes.progress <=
      -0.08;

  return (
    riskIncrease &&
    constructiveDecline
  );
}

function hasRiskReduction(
  statistics:
    RecommendationEvolutionMemoryStatistics,
): boolean {
  const changes =
    statistics.latestScoreChanges;

  if (
    changes ===
    null
  ) {
    return false;
  }

  const riskDecrease =
    changes.repetitionRisk <=
      -0.1 ||
    changes.redirectionRisk <=
      -0.1;

  const constructiveIncrease =
    changes.stability >=
      0.05 ||
    changes.progress >=
      0.05;

  return (
    riskDecrease &&
    constructiveIncrease
  );
}

function calculateRiskSignalScore(
  statistics:
    RecommendationEvolutionMemoryStatistics,
): number {
  const changes =
    statistics.latestScoreChanges;

  if (
    changes ===
    null
  ) {
    return 0;
  }

  return normalizeScore(
    (
      Math.max(
        0,
        changes.repetitionRisk,
      ) +
      Math.max(
        0,
        changes.redirectionRisk,
      ) +
      Math.max(
        0,
        -changes.stability,
      ) +
      Math.max(
        0,
        -changes.progress,
      )
    ) /
    2,
  );
}

function calculateRiskReductionSignalScore(
  statistics:
    RecommendationEvolutionMemoryStatistics,
): number {
  const changes =
    statistics.latestScoreChanges;

  if (
    changes ===
    null
  ) {
    return 0;
  }

  return normalizeScore(
    (
      Math.max(
        0,
        -changes.repetitionRisk,
      ) +
      Math.max(
        0,
        -changes.redirectionRisk,
      ) +
      Math.max(
        0,
        changes.stability,
      ) +
      Math.max(
        0,
        changes.progress,
      )
    ) /
    2,
  );
}

/* ------------------------------------------------------------------ */
/* Collection Helpers                                                 */
/* ------------------------------------------------------------------ */

function getLatestMemoryEntry(
  memory:
    RecommendationEvolutionMemory,
): RecommendationEvolutionMemoryEntry | null {
  if (
    memory.entries.length ===
    0
  ) {
    return null;
  }

  return (
    memory.entries[
      memory.entries.length -
      1
    ] ??
    null
  );
}

function getLatestNonInitialComparison(
  comparisons:
    RecommendationEvolutionMemoryComparison[],
): RecommendationEvolutionMemoryComparison | null {
  for (
    let index =
      comparisons.length -
      1;
    index >=
    0;
    index -=
      1
  ) {
    const comparison =
      comparisons[
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

function getRecentEntries(
  entries:
    RecommendationEvolutionMemoryEntry[],
  count:
    number,
): RecommendationEvolutionMemoryEntry[] {
  if (
    count <=
    0
  ) {
    return [];
  }

  return entries.slice(
    Math.max(
      0,
      entries.length -
      count,
    ),
  );
}

function getRecentNonInitialComparisons(
  comparisons:
    RecommendationEvolutionMemoryComparison[],
  count:
    number,
): RecommendationEvolutionMemoryComparison[] {
  if (
    count <=
    0
  ) {
    return [];
  }

  const nonInitial =
    comparisons.filter(
      (
        comparison,
      ) =>
        comparison.previous !==
        null,
    );

  return nonInitial.slice(
    Math.max(
      0,
      nonInitial.length -
      count,
    ),
  );
}

/**
 * A → B → A → B처럼 두 값이 교대로 반복되는 패턴을 찾습니다.
 */
function hasAlternatingValues(
  values:
    readonly string[],
): boolean {
  if (
    values.length <
    4
  ) {
    return false;
  }

  const first =
    values[
      0
    ];

  const second =
    values[
      1
    ];

  if (
    first ===
      undefined ||
    second ===
      undefined ||
    first ===
      second
  ) {
    return false;
  }

  for (
    let index =
      2;
    index <
    values.length;
    index +=
      1
  ) {
    const current =
      values[
        index
      ];

    const expected =
      index %
        2 ===
      0
        ? first
        : second;

    if (
      current !==
      expected
    ) {
      return false;
    }
  }

  return true;
}

/* ------------------------------------------------------------------ */
/* Memory Signal Validation                                           */
/* ------------------------------------------------------------------ */

type ValidateMemoryAnalysisSignalsParams = {
  memory:
    RecommendationEvolutionMemory;

  analysis:
    RecommendationEvolutionMemoryAnalysis;
};

function validateMemoryAnalysisSignals(
  params:
    ValidateMemoryAnalysisSignalsParams,
): void {
  const {
    memory,
    analysis,
  } = params;

  if (
    !Array.isArray(
      analysis.signals,
    )
  ) {
    throw new Error(
      "analysis.signals must be an array.",
    );
  }

  const memoryEntryIds =
    new Set(
      memory.entries.map(
        (
          entry,
        ) =>
          entry.id,
      ),
    );

  const comparisonIds =
    new Set(
      analysis.comparisons.map(
        (
          comparison,
        ) =>
          comparison.id,
      ),
    );

  const observedSignalIds =
    new Set<string>();

  const observedSignalTypes =
    new Set<
      RecommendationEvolutionMemorySignalType
    >();

  analysis.signals.forEach(
    (
      signal,
      index,
    ) => {
      validateRequiredIdentifier(
        signal.id,
        `signals[${index}].id`,
      );

      if (
        observedSignalIds.has(
          signal.id,
        )
      ) {
        throw new Error(
          `Memory Analysis contains duplicate Signal id: ${signal.id}.`,
        );
      }

      observedSignalIds.add(
        signal.id,
      );

      if (
        !isRecommendationEvolutionMemorySignalType(
          signal.type,
        )
      ) {
        throw new Error(
          `signals[${index}].type is invalid.`,
        );
      }

      if (
        observedSignalTypes.has(
          signal.type,
        )
      ) {
        throw new Error(
          `Memory Analysis contains duplicate Signal type: ${signal.type}.`,
        );
      }

      observedSignalTypes.add(
        signal.type,
      );

      if (
        !isRecommendationEvolutionMemorySignalSeverity(
          signal.severity,
        )
      ) {
        throw new Error(
          `signals[${index}].severity is invalid.`,
        );
      }

      validateAnalysisConfidence(
        signal.confidence,
      );

      validateNormalizedScore(
        signal.score,
        `signals[${index}].score`,
      );

      validateRequiredString(
        signal.description,
        `signals[${index}].description`,
      );

      validateUniqueStringArray(
        signal.relatedEntryIds,
        `signals[${index}].relatedEntryIds`,
      );

      validateUniqueStringArray(
        signal.relatedComparisonIds,
        `signals[${index}].relatedComparisonIds`,
      );

      signal.relatedEntryIds.forEach(
        (
          entryId,
        ) => {
          if (
            !memoryEntryIds.has(
              entryId,
            )
          ) {
            throw new Error(
              `Signal ${signal.id} refers to unknown Memory Entry id: ${entryId}.`,
            );
          }
        },
      );

      signal.relatedComparisonIds.forEach(
        (
          comparisonId,
        ) => {
          if (
            !comparisonIds.has(
              comparisonId,
            )
          ) {
            throw new Error(
              `Signal ${signal.id} refers to unknown Comparison id: ${comparisonId}.`,
            );
          }
        },
      );

      validateTimestamp(
        signal.detectedAt,
        `signals[${index}].detectedAt`,
      );

      if (
        signal.detectedAt !==
        analysis.analyzedAt
      ) {
        throw new Error(
          `signals[${index}].detectedAt must equal analysis.analyzedAt.`,
        );
      }
    },
  );
}

/* ------------------------------------------------------------------ */
/* Cross-field Consistency                                            */
/* ------------------------------------------------------------------ */

function validatePrimaryMemorySignalConsistency(
  analysis:
    RecommendationEvolutionMemoryAnalysis,
): void {
  if (
    analysis.primarySignalType ===
    null
  ) {
    if (
      analysis.signals.length >
      0
    ) {
      throw new Error(
        "primarySignalType must be present when Memory Signals exist.",
      );
    }

    return;
  }

  if (
    !isRecommendationEvolutionMemorySignalType(
      analysis.primarySignalType,
    )
  ) {
    throw new Error(
      "analysis.primarySignalType is invalid.",
    );
  }

  const primarySignalExists =
    analysis.signals.some(
      (
        signal,
      ) =>
        signal.type ===
        analysis.primarySignalType,
    );

  if (
    !primarySignalExists
  ) {
    throw new Error(
      "analysis.primarySignalType must exist in analysis.signals.",
    );
  }
}

function validateMemoryStateConsistency(
  analysis:
    RecommendationEvolutionMemoryAnalysis,
): void {
  const {
    state,
    statistics,
  } = analysis;

  if (
    statistics.entryCount ===
      0 &&
    state !==
      "unavailable"
  ) {
    throw new Error(
      "An empty Memory must resolve to unavailable.",
    );
  }

  if (
    statistics.entryCount ===
      1 &&
    state !==
      "insufficient"
  ) {
    throw new Error(
      "A single-entry Memory must resolve to insufficient.",
    );
  }

  if (
    statistics.entryCount >=
      2 &&
    (
      state ===
        "unavailable" ||
      state ===
        "insufficient"
    )
  ) {
    throw new Error(
      "A multi-entry Memory must resolve to a long-term analysis state.",
    );
  }

  if (
    state ===
      "unavailable" ||
    state ===
      "insufficient"
  ) {
    const hasInsufficientSignal =
      analysis.signals.some(
        (
          signal,
        ) =>
          signal.type ===
          "insufficient-memory",
      );

    if (
      !hasInsufficientSignal
    ) {
      throw new Error(
        "Unavailable or insufficient Memory requires an insufficient-memory Signal.",
      );
    }
  }

  if (
    state ===
    "recovering"
  ) {
    const hasRecoverySignal =
      analysis.signals.some(
        (
          signal,
        ) =>
          signal.type ===
          "recovery-pattern",
      );

    if (
      !hasRecoverySignal
    ) {
      throw new Error(
        "Recovering Memory state requires a recovery-pattern Signal.",
      );
    }
  }

  if (
    state ===
    "advancing"
  ) {
    const hasAdvancementSignal =
      analysis.signals.some(
        (
          signal,
        ) =>
          signal.type ===
          "long-term-advancement",
      );

    if (
      !hasAdvancementSignal
    ) {
      throw new Error(
        "Advancing Memory state requires a long-term-advancement Signal.",
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Reasoning Validation                                               */
/* ------------------------------------------------------------------ */

function validateMemoryReasoning(
  reasoning:
    string[],
): void {
  if (
    !Array.isArray(
      reasoning,
    )
  ) {
    throw new Error(
      "analysis.reasoning must be an array.",
    );
  }

  if (
    reasoning.length ===
    0
  ) {
    throw new Error(
      "analysis.reasoning must contain at least one statement.",
    );
  }

  const observedStatements =
    new Set<string>();

  reasoning.forEach(
    (
      statement,
      index,
    ) => {
      validateRequiredString(
        statement,
        `reasoning[${index}]`,
      );

      if (
        observedStatements.has(
          statement,
        )
      ) {
        throw new Error(
          `analysis.reasoning contains duplicate statement: ${statement}.`,
        );
      }

      observedStatements.add(
        statement,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Analysis Confidence Validation                                     */
/* ------------------------------------------------------------------ */

function validateAnalysisConfidence(
  confidence:
    unknown,
): asserts confidence is RecommendationEvolutionIntelligenceSignalConfidence {
  if (
    confidence !==
      "low" &&
    confidence !==
      "medium" &&
    confidence !==
      "high"
  ) {
    throw new Error(
      "Recommendation Evolution Memory Analysis confidence is invalid.",
    );
  }
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

function validateNormalizedScore(
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

function validateNonNegativeInteger(
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
      0
  ) {
    throw new Error(
      `${fieldName} must be a non-negative integer.`,
    );
  }
}

function validateUniqueStringArray(
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

  const observedValues =
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
        observedValues.has(
          value,
        )
      ) {
        throw new Error(
          `${fieldName} contains duplicate value: ${value}.`,
        );
      }

      observedValues.add(
        value,
      );
    },
  );
}