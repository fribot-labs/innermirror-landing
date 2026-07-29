import {
    createEmptyRecommendationPredictionScoreTrend,
    isRecommendationPredictionHorizon,
    isRecommendationPredictionTrendDirection,
} from "./recommendationPredictiveIntelligenceTypes";

import {
    validateRecommendationEvolutionMemory,
} from "./appendRecommendationEvolutionMemory";

import {
    validateRecommendationEvolutionMemoryAnalysis,
} from "./analyzeRecommendationEvolutionMemory";

import {
    validateRecommendationAdaptiveLearningAnalysis,
} from "./analyzeRecommendationAdaptiveLearning";

import {
    validateRecommendationRuntimeAdjustment,
} from "./createRecommendationRuntimeAdjustments";

import type {
    CreateRecommendationPredictionContextParams,
    RecommendationPredictionContext,
    RecommendationPredictionScoreTrend,
    RecommendationPredictionTrendDirection,
    RecommendationPredictiveEntryState,
    RecommendationPredictiveLearningPatternType,
    RecommendationPredictiveMemorySignalType,
    RecommendationPredictiveRuntimeDecisionType,
    RecommendationPredictiveStrategyType,
    ValidateRecommendationPredictionContextParams,
} from "./recommendationPredictiveIntelligenceTypes";

import type {
    RecommendationAdaptiveLearningAnalysis,
    RecommendationRuntimeAdjustment,
} from "./recommendationAdaptiveLearningTypes";

import type {
    RecommendationEvolutionMemory,
    RecommendationEvolutionMemoryAnalysis,
    RecommendationEvolutionMemoryComparison,
    RecommendationEvolutionMemoryEntry,
} from "./recommendationEvolutionMemoryTypes";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_RECENT_ENTRY_LIMIT =
  5;

const DEFAULT_RECENT_COMPARISON_LIMIT =
  5;

const MAXIMUM_RECENT_ITEM_LIMIT =
  100;

const TREND_STABLE_TOLERANCE =
  0.01;

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Memory와 Adaptive Learning 결과를 예측 전용
 * Context로 압축합니다.
 *
 * 이 함수는 예측 자체를 수행하지 않습니다.
 *
 * 역할:
 *
 * - 최신 Recommendation 상태 추출
 * - 최근 State·Strategy·Decision 흐름 추출
 * - 최근 Score 변화 추세 계산
 * - 활성·충돌 Adaptation Rule 추출
 * - Runtime Adjustment 복제
 * - Evidence·Confidence·Conflict 값 정규화
 *
 * 입력 객체는 변경하지 않습니다.
 */
export function createRecommendationPredictionContext(
  params:
    CreateRecommendationPredictionContextParams,
): RecommendationPredictionContext {
  validateCreateRecommendationPredictionContextParams(
    params,
  );

  const recentEntryLimit =
    params.recentEntryLimit ??
    DEFAULT_RECENT_ENTRY_LIMIT;

  const recentComparisonLimit =
    params.recentComparisonLimit ??
    DEFAULT_RECENT_COMPARISON_LIMIT;

  const recentEntries =
    getRecentRecommendationMemoryEntries(
      params.memory,
      recentEntryLimit,
    );

  const recentComparisons =
    getRecentRecommendationMemoryComparisons(
      params.memoryAnalysis,
      recentComparisonLimit,
    );

  const currentEntry =
    getLastArrayItem(
      recentEntries,
    );

  const context:
    RecommendationPredictionContext = {
      version:
        1,

      memoryId:
        params.memory.id,

      historyId:
        params.memory.historyId,

      sourceMemoryAnalyzedAt:
        params.memoryAnalysis.analyzedAt,

      sourceAdaptiveLearningAnalyzedAt:
        params.adaptiveLearningAnalysis.analyzedAt,

      horizon:
        params.horizon,

      currentEntryId:
        currentEntry?.id ??
        null,

      currentState:
        currentEntry?.state ??
        null,

      currentStrategyType:
        currentEntry?.strategyType ??
        null,

      currentAssessmentConfidence:
        currentEntry?.assessmentConfidence ??
        null,

      currentPrimarySignalType:
        currentEntry?.primarySignalType ??
        null,

      currentMemorySignalTypes:
        collectCurrentMemorySignalTypes(
          params.memoryAnalysis,
        ),

      currentRuntimeDecisionTypes:
        currentEntry ===
        null
          ? []
          : collectEntryRuntimeDecisionTypes(
              currentEntry,
            ),

      recentEntryIds:
        recentEntries.map(
          (
            entry,
          ) =>
            entry.id,
        ),

      recentComparisonIds:
        recentComparisons.map(
          (
            comparison,
          ) =>
            comparison.id,
        ),

      recentStates:
        recentEntries.map(
          (
            entry,
          ) =>
            entry.state,
        ),

      recentStrategyTypes:
        recentEntries.map(
          (
            entry,
          ) =>
            entry.strategyType,
        ),

      recentRuntimeDecisionTypes:
        collectRecentRuntimeDecisionTypes(
          recentEntries,
        ),

      recentLearningPatternTypes:
        collectRecentLearningPatternTypes(
          params.adaptiveLearningAnalysis,
        ),

      scoreTrend:
        createRecommendationPredictionScoreTrend(
          recentComparisons,
        ),

      activeAdaptationRuleIds:
        params.adaptiveLearningAnalysis.adaptationRules
          .filter(
            (
              rule,
            ) =>
              rule.status ===
              "active",
          )
          .map(
            (
              rule,
            ) =>
              rule.id,
          ),

      conflictedAdaptationRuleIds:
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
          ),

      runtimeAdjustment:
        clonePredictionRuntimeAdjustment(
          params.adaptiveLearningAnalysis.runtimeAdjustment,
        ),

      evidenceStrength:
        roundScore(
          clampUnitInterval(
            params.adaptiveLearningAnalysis.scores
              .evidenceStrength,
          ),
        ),

      learningConfidence:
        roundScore(
          clampUnitInterval(
            params.adaptiveLearningAnalysis.scores
              .learningConfidence,
          ),
        ),

      adaptationReadiness:
        roundScore(
          clampUnitInterval(
            params.adaptiveLearningAnalysis.scores
              .adaptationReadiness,
          ),
        ),

      conflictRisk:
        roundScore(
          clampUnitInterval(
            params.adaptiveLearningAnalysis.scores
              .conflictRisk,
          ),
        ),

      createdAt:
        params.createdAt,
    };

  validateRecommendationPredictionContext({
    memory:
      params.memory,

    memoryAnalysis:
      params.memoryAnalysis,

    adaptiveLearningAnalysis:
      params.adaptiveLearningAnalysis,

    context,
  });

  return cloneRecommendationPredictionContext(
    context,
  );
}

/* ------------------------------------------------------------------ */
/* Recent Memory Entries                                              */
/* ------------------------------------------------------------------ */

export function getRecentRecommendationMemoryEntries(
  memory:
    RecommendationEvolutionMemory,
  limit:
    number =
      DEFAULT_RECENT_ENTRY_LIMIT,
): RecommendationEvolutionMemoryEntry[] {
  validatePositiveBoundedInteger(
    limit,
    "limit",
    MAXIMUM_RECENT_ITEM_LIMIT,
  );

  if (
    memory.entries.length ===
    0
  ) {
    return [];
  }

  return memory.entries
    .slice(
      Math.max(
        memory.entries.length -
          limit,
        0,
      ),
    )
    .map(
      cloneRecommendationMemoryEntryForPrediction,
    );
}

/* ------------------------------------------------------------------ */
/* Recent Comparisons                                                 */
/* ------------------------------------------------------------------ */

export function getRecentRecommendationMemoryComparisons(
  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis,
  limit:
    number =
      DEFAULT_RECENT_COMPARISON_LIMIT,
): RecommendationEvolutionMemoryComparison[] {
  validatePositiveBoundedInteger(
    limit,
    "limit",
    MAXIMUM_RECENT_ITEM_LIMIT,
  );

  if (
    memoryAnalysis.comparisons.length ===
    0
  ) {
    return [];
  }

  return memoryAnalysis.comparisons
    .slice(
      Math.max(
        memoryAnalysis.comparisons.length -
          limit,
        0,
      ),
    )
    .map(
      cloneRecommendationMemoryComparisonForPrediction,
    );
}

/* ------------------------------------------------------------------ */
/* Current Memory Signals                                             */
/* ------------------------------------------------------------------ */

/**
 * 현재 Memory Analysis에서 활성화된 Signal Type을 중복 없이
 * 반환합니다.
 */
function collectCurrentMemorySignalTypes(
  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis,
): RecommendationPredictiveMemorySignalType[] {
  return uniqueStrings(
    memoryAnalysis.signals.map(
      (
        signal,
      ) =>
        signal.type,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Runtime Decisions                                                  */
/* ------------------------------------------------------------------ */

function collectEntryRuntimeDecisionTypes(
  entry:
    RecommendationEvolutionMemoryEntry,
): RecommendationPredictiveRuntimeDecisionType[] {
  return uniqueStrings(
    entry.enabledRuntimeDecisionTypes,
  );
}

function collectRecentRuntimeDecisionTypes(
  entries:
    readonly RecommendationEvolutionMemoryEntry[],
): RecommendationPredictiveRuntimeDecisionType[] {
  return uniqueStrings(
    entries.flatMap(
      (
        entry,
      ) =>
        entry.enabledRuntimeDecisionTypes,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Recent Learning Patterns                                           */
/* ------------------------------------------------------------------ */

function collectRecentLearningPatternTypes(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): RecommendationPredictiveLearningPatternType[] {
  return uniqueStrings(
    analysis.patterns.map(
      (
        pattern,
      ) =>
        pattern.type,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Score Trend                                                        */
/* ------------------------------------------------------------------ */

/**
 * 최근 Memory Comparison의 Score 변화 평균을 계산하여
 * Prediction Trend로 변환합니다.
 */
export function createRecommendationPredictionScoreTrend(
  comparisons:
    readonly RecommendationEvolutionMemoryComparison[],
): RecommendationPredictionScoreTrend {
  if (
    comparisons.length ===
    0
  ) {
    return createEmptyRecommendationPredictionScoreTrend();
  }

  const averageChanges =
    calculateAverageComparisonScoreChanges(
      comparisons,
    );

  return {
    stability:
      resolvePredictionTrendDirection(
        averageChanges.stability,
      ),

    progress:
      resolvePredictionTrendDirection(
        averageChanges.progress,
      ),

    repetitionRisk:
      resolvePredictionTrendDirection(
        averageChanges.repetitionRisk,
      ),

    redirectionRisk:
      resolvePredictionTrendDirection(
        averageChanges.redirectionRisk,
      ),

    completionMomentum:
      resolvePredictionTrendDirection(
        averageChanges.completionMomentum,
      ),

    stabilityChange:
      roundScore(
        averageChanges.stability,
      ),

    progressChange:
      roundScore(
        averageChanges.progress,
      ),

    repetitionRiskChange:
      roundScore(
        averageChanges.repetitionRisk,
      ),

    redirectionRiskChange:
      roundScore(
        averageChanges.redirectionRisk,
      ),

    completionMomentumChange:
      roundScore(
        averageChanges.completionMomentum,
      ),

    sampleCount:
      comparisons.length,
  };
}

/* ------------------------------------------------------------------ */
/* Average Score Changes                                              */
/* ------------------------------------------------------------------ */

type AveragePredictionScoreChanges = {
  stability:
    number;

  progress:
    number;

  repetitionRisk:
    number;

  redirectionRisk:
    number;

  completionMomentum:
    number;
};

function calculateAverageComparisonScoreChanges(
  comparisons:
    readonly RecommendationEvolutionMemoryComparison[],
): AveragePredictionScoreChanges {
  const total =
    comparisons.reduce(
      (
        accumulated,
        comparison,
      ) => ({
        stability:
          accumulated.stability +
          comparison.scoreChanges.stability,

        progress:
          accumulated.progress +
          comparison.scoreChanges.progress,

        repetitionRisk:
          accumulated.repetitionRisk +
          comparison.scoreChanges.repetitionRisk,

        redirectionRisk:
          accumulated.redirectionRisk +
          comparison.scoreChanges.redirectionRisk,

        completionMomentum:
          accumulated.completionMomentum +
          comparison.scoreChanges.completionMomentum,
      }),
      {
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
      },
    );

  return {
    stability:
      total.stability /
      comparisons.length,

    progress:
      total.progress /
      comparisons.length,

    repetitionRisk:
      total.repetitionRisk /
      comparisons.length,

    redirectionRisk:
      total.redirectionRisk /
      comparisons.length,

    completionMomentum:
      total.completionMomentum /
      comparisons.length,
  };
}

/* ------------------------------------------------------------------ */
/* Trend Direction                                                    */
/* ------------------------------------------------------------------ */

export function resolvePredictionTrendDirection(
  value:
    number,
): RecommendationPredictionTrendDirection {
  validateFiniteNumber(
    value,
    "Prediction trend value",
  );

  if (
    Math.abs(
      value,
    ) <=
    TREND_STABLE_TOLERANCE
  ) {
    return "stable";
  }

  if (
    value >
    0
  ) {
    return "increasing";
  }

  return "decreasing";
}

/* ------------------------------------------------------------------ */
/* Public Validation                                                  */
/* ------------------------------------------------------------------ */

export function validateRecommendationPredictionContext(
  params:
    ValidateRecommendationPredictionContextParams,
): void {
  const {
    memory,
    memoryAnalysis,
    adaptiveLearningAnalysis,
    context,
  } = params;

  validateRecommendationEvolutionMemory({
    memory,
  });

  validateRecommendationEvolutionMemoryAnalysis({
    memory,
    analysis:
      memoryAnalysis,
  });

  validateRecommendationAdaptiveLearningAnalysis({
    memory,
    memoryAnalysis,
    analysis:
      adaptiveLearningAnalysis,
  });

  if (
    typeof context !==
      "object" ||
    context ===
      null ||
    Array.isArray(
      context,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Context must be an object.",
    );
  }

  if (
    context.version !==
    1
  ) {
    throw new Error(
      "Recommendation Prediction Context version must be 1.",
    );
  }

  validateRequiredIdentifier(
    context.memoryId,
    "context.memoryId",
  );

  validateRequiredIdentifier(
    context.historyId,
    "context.historyId",
  );

  if (
    context.memoryId !==
    memory.id
  ) {
    throw new Error(
      "Recommendation Prediction Context memoryId must match Memory id.",
    );
  }

  if (
    context.historyId !==
      memory.historyId ||
    context.historyId !==
      memoryAnalysis.historyId ||
    context.historyId !==
      adaptiveLearningAnalysis.historyId
  ) {
    throw new Error(
      "Recommendation Prediction Context historyId is inconsistent.",
    );
  }

  if (
    context.sourceMemoryAnalyzedAt !==
    memoryAnalysis.analyzedAt
  ) {
    throw new Error(
      "Recommendation Prediction Context sourceMemoryAnalyzedAt must match Memory Analysis analyzedAt.",
    );
  }

  if (
    context.sourceAdaptiveLearningAnalyzedAt !==
    adaptiveLearningAnalysis.analyzedAt
  ) {
    throw new Error(
      "Recommendation Prediction Context sourceAdaptiveLearningAnalyzedAt must match Adaptive Learning analyzedAt.",
    );
  }

  if (
    !isRecommendationPredictionHorizon(
      context.horizon,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Context horizon is invalid.",
    );
  }

  validateNullableIdentifier(
    context.currentEntryId,
    "context.currentEntryId",
  );

  validateNullableString(
    context.currentState,
    "context.currentState",
  );

  validateNullableString(
    context.currentStrategyType,
    "context.currentStrategyType",
  );

  validateNullableString(
    context.currentAssessmentConfidence,
    "context.currentAssessmentConfidence",
  );

  validateNullableString(
    context.currentPrimarySignalType,
    "context.currentPrimarySignalType",
  );

  validateUniqueStringArray(
    context.currentMemorySignalTypes,
    "context.currentMemorySignalTypes",
  );

  validateUniqueStringArray(
    context.currentRuntimeDecisionTypes,
    "context.currentRuntimeDecisionTypes",
  );

  validateUniqueIdentifierArray(
    context.recentEntryIds,
    "context.recentEntryIds",
  );

  validateUniqueIdentifierArray(
    context.recentComparisonIds,
    "context.recentComparisonIds",
  );

  validateStringArray(
    context.recentStates,
    "context.recentStates",
  );

  validateStringArray(
    context.recentStrategyTypes,
    "context.recentStrategyTypes",
  );

  validateUniqueStringArray(
    context.recentRuntimeDecisionTypes,
    "context.recentRuntimeDecisionTypes",
  );

  validateUniqueStringArray(
    context.recentLearningPatternTypes,
    "context.recentLearningPatternTypes",
  );

  validateRecommendationPredictionScoreTrend(
    context.scoreTrend,
  );

  validateUniqueIdentifierArray(
    context.activeAdaptationRuleIds,
    "context.activeAdaptationRuleIds",
  );

  validateUniqueIdentifierArray(
    context.conflictedAdaptationRuleIds,
    "context.conflictedAdaptationRuleIds",
  );

  validateDisjointIdentifierArrays({
    left:
      context.activeAdaptationRuleIds,

    right:
      context.conflictedAdaptationRuleIds,

    leftFieldName:
      "context.activeAdaptationRuleIds",

    rightFieldName:
      "context.conflictedAdaptationRuleIds",
  });

  validateRecommendationRuntimeAdjustment({
    adjustment:
      context.runtimeAdjustment,
  });

  validateUnitInterval(
    context.evidenceStrength,
    "context.evidenceStrength",
  );

  validateUnitInterval(
    context.learningConfidence,
    "context.learningConfidence",
  );

  validateUnitInterval(
    context.adaptationReadiness,
    "context.adaptationReadiness",
  );

  validateUnitInterval(
    context.conflictRisk,
    "context.conflictRisk",
  );

  validateTimestamp(
    context.createdAt,
    "context.createdAt",
  );

  validateTimestampOrder(
    memoryAnalysis.analyzedAt,
    context.createdAt,
    "memoryAnalysis.analyzedAt",
    "context.createdAt",
  );

  validateTimestampOrder(
    adaptiveLearningAnalysis.analyzedAt,
    context.createdAt,
    "adaptiveLearningAnalysis.analyzedAt",
    "context.createdAt",
  );

  validatePredictionContextCurrentEntryConsistency({
    memory,
    context,
  });

  validatePredictionContextRecentEntryConsistency({
    memory,
    context,
  });

  validatePredictionContextRecentComparisonConsistency({
    memoryAnalysis,
    context,
  });

  validatePredictionContextAdaptiveLearningConsistency({
    adaptiveLearningAnalysis,
    context,
  });
}

/* ------------------------------------------------------------------ */
/* Score Trend Validation                                             */
/* ------------------------------------------------------------------ */

export function validateRecommendationPredictionScoreTrend(
  trend:
    RecommendationPredictionScoreTrend,
): void {
  if (
    typeof trend !==
      "object" ||
    trend ===
      null ||
    Array.isArray(
      trend,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Score Trend must be an object.",
    );
  }

  const directions = [
    trend.stability,
    trend.progress,
    trend.repetitionRisk,
    trend.redirectionRisk,
    trend.completionMomentum,
  ];

  directions.forEach(
    (
      direction,
      index,
    ) => {
      if (
        !isRecommendationPredictionTrendDirection(
          direction,
        )
      ) {
        throw new Error(
          `Recommendation Prediction Score Trend direction at index ${index} is invalid.`,
        );
      }
    },
  );

  validateFiniteNumber(
    trend.stabilityChange,
    "trend.stabilityChange",
  );

  validateFiniteNumber(
    trend.progressChange,
    "trend.progressChange",
  );

  validateFiniteNumber(
    trend.repetitionRiskChange,
    "trend.repetitionRiskChange",
  );

  validateFiniteNumber(
    trend.redirectionRiskChange,
    "trend.redirectionRiskChange",
  );

  validateFiniteNumber(
    trend.completionMomentumChange,
    "trend.completionMomentumChange",
  );

  validateNonNegativeInteger(
    trend.sampleCount,
    "trend.sampleCount",
  );

  if (
    trend.sampleCount ===
    0
  ) {
    const emptyTrend =
      createEmptyRecommendationPredictionScoreTrend();

    if (
      trend.stability !==
        emptyTrend.stability ||
      trend.progress !==
        emptyTrend.progress ||
      trend.repetitionRisk !==
        emptyTrend.repetitionRisk ||
      trend.redirectionRisk !==
        emptyTrend.redirectionRisk ||
      trend.completionMomentum !==
        emptyTrend.completionMomentum
    ) {
      throw new Error(
        "Prediction Score Trend with zero samples must use unknown directions.",
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Current Entry Consistency                                          */
/* ------------------------------------------------------------------ */

function validatePredictionContextCurrentEntryConsistency(
  params: {
    memory:
      RecommendationEvolutionMemory;

    context:
      RecommendationPredictionContext;
  },
): void {
  const {
    memory,
    context,
  } = params;

  const latestEntry =
    getLastArrayItem(
      memory.entries,
    );

  if (
    latestEntry ===
    null
  ) {
    if (
      context.currentEntryId !==
        null ||
      context.currentState !==
        null ||
      context.currentStrategyType !==
        null ||
      context.currentAssessmentConfidence !==
        null ||
      context.currentPrimarySignalType !==
        null ||
      context.currentRuntimeDecisionTypes.length >
        0
    ) {
      throw new Error(
        "Prediction Context must not define current Entry values when Memory is empty.",
      );
    }

    return;
  }

  if (
    context.currentEntryId !==
    latestEntry.id
  ) {
    throw new Error(
      "Prediction Context currentEntryId must match the latest Memory Entry.",
    );
  }

  if (
    context.currentState !==
    latestEntry.state
  ) {
    throw new Error(
      "Prediction Context currentState must match the latest Memory Entry state.",
    );
  }

  if (
    context.currentStrategyType !==
    latestEntry.strategyType
  ) {
    throw new Error(
      "Prediction Context currentStrategyType must match the latest Memory Entry strategyType.",
    );
  }

  if (
    context.currentAssessmentConfidence !==
    latestEntry.assessmentConfidence
  ) {
    throw new Error(
      "Prediction Context currentAssessmentConfidence must match the latest Memory Entry.",
    );
  }

  if (
    context.currentPrimarySignalType !==
    latestEntry.primarySignalType
  ) {
    throw new Error(
      "Prediction Context currentPrimarySignalType must match the latest Memory Entry.",
    );
  }

  if (
    !areStringSetsEqual(
      context.currentRuntimeDecisionTypes,
      latestEntry.enabledRuntimeDecisionTypes,
    )
  ) {
    throw new Error(
      "Prediction Context currentRuntimeDecisionTypes must match the latest Memory Entry.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Recent Entry Consistency                                           */
/* ------------------------------------------------------------------ */

function validatePredictionContextRecentEntryConsistency(
  params: {
    memory:
      RecommendationEvolutionMemory;

    context:
      RecommendationPredictionContext;
  },
): void {
  const {
    memory,
    context,
  } = params;

  const knownEntryIds =
    new Set(
      memory.entries.map(
        (
          entry,
        ) =>
          entry.id,
      ),
    );

  context.recentEntryIds.forEach(
    (
      entryId,
    ) => {
      if (
        !knownEntryIds.has(
          entryId,
        )
      ) {
        throw new Error(
          `Prediction Context references an unknown recent Entry: ${entryId}.`,
        );
      }
    },
  );

  if (
    context.recentEntryIds.length !==
    context.recentStates.length
  ) {
    throw new Error(
      "Prediction Context recentEntryIds and recentStates lengths must match.",
    );
  }

  if (
    context.recentEntryIds.length !==
    context.recentStrategyTypes.length
  ) {
    throw new Error(
      "Prediction Context recentEntryIds and recentStrategyTypes lengths must match.",
    );
  }

  context.recentEntryIds.forEach(
    (
      entryId,
      index,
    ) => {
      const entry =
        memory.entries.find(
          (
            candidate,
          ) =>
            candidate.id ===
            entryId,
        );

      if (
        entry ===
        undefined
      ) {
        return;
      }

      if (
        context.recentStates[
          index
        ] !==
        entry.state
      ) {
        throw new Error(
          `Prediction Context recentStates[${index}] must match Entry ${entryId}.`,
        );
      }

      if (
        context.recentStrategyTypes[
          index
        ] !==
        entry.strategyType
      ) {
        throw new Error(
          `Prediction Context recentStrategyTypes[${index}] must match Entry ${entryId}.`,
        );
      }
    },
  );
}

/* ------------------------------------------------------------------ */
/* Recent Comparison Consistency                                      */
/* ------------------------------------------------------------------ */

function validatePredictionContextRecentComparisonConsistency(
  params: {
    memoryAnalysis:
      RecommendationEvolutionMemoryAnalysis;

    context:
      RecommendationPredictionContext;
  },
): void {
  const {
    memoryAnalysis,
    context,
  } = params;

  const knownComparisonIds =
    new Set(
      memoryAnalysis.comparisons.map(
        (
          comparison,
        ) =>
          comparison.id,
      ),
    );

  context.recentComparisonIds.forEach(
    (
      comparisonId,
    ) => {
      if (
        !knownComparisonIds.has(
          comparisonId,
        )
      ) {
        throw new Error(
          `Prediction Context references an unknown recent Comparison: ${comparisonId}.`,
        );
      }
    },
  );

  if (
    context.scoreTrend.sampleCount !==
    context.recentComparisonIds.length
  ) {
    throw new Error(
      "Prediction Context Score Trend sampleCount must match recentComparisonIds length.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Adaptive Learning Consistency                                      */
/* ------------------------------------------------------------------ */

function validatePredictionContextAdaptiveLearningConsistency(
  params: {
    adaptiveLearningAnalysis:
      RecommendationAdaptiveLearningAnalysis;

    context:
      RecommendationPredictionContext;
  },
): void {
  const {
    adaptiveLearningAnalysis,
    context,
  } = params;

  const activeRuleIds =
    adaptiveLearningAnalysis.adaptationRules
      .filter(
        (
          rule,
        ) =>
          rule.status ===
          "active",
      )
      .map(
        (
          rule,
        ) =>
          rule.id,
      );

  const conflictedRuleIds =
    adaptiveLearningAnalysis.adaptationRules
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
    !areStringSetsEqual(
      context.activeAdaptationRuleIds,
      activeRuleIds,
    )
  ) {
    throw new Error(
      "Prediction Context activeAdaptationRuleIds must match Adaptive Learning Analysis.",
    );
  }

  if (
    !areStringSetsEqual(
      context.conflictedAdaptationRuleIds,
      conflictedRuleIds,
    )
  ) {
    throw new Error(
      "Prediction Context conflictedAdaptationRuleIds must match Adaptive Learning Analysis.",
    );
  }

  if (
    !areRuntimeAdjustmentsEqual(
      context.runtimeAdjustment,
      adaptiveLearningAnalysis.runtimeAdjustment,
    )
  ) {
    throw new Error(
      "Prediction Context runtimeAdjustment must match Adaptive Learning Analysis.",
    );
  }

  if (
    context.evidenceStrength !==
    adaptiveLearningAnalysis.scores.evidenceStrength
  ) {
    throw new Error(
      "Prediction Context evidenceStrength must match Adaptive Learning Analysis.",
    );
  }

  if (
    context.learningConfidence !==
    adaptiveLearningAnalysis.scores.learningConfidence
  ) {
    throw new Error(
      "Prediction Context learningConfidence must match Adaptive Learning Analysis.",
    );
  }

  if (
    context.adaptationReadiness !==
    adaptiveLearningAnalysis.scores.adaptationReadiness
  ) {
    throw new Error(
      "Prediction Context adaptationReadiness must match Adaptive Learning Analysis.",
    );
  }

  if (
    context.conflictRisk !==
    adaptiveLearningAnalysis.scores.conflictRisk
  ) {
    throw new Error(
      "Prediction Context conflictRisk must match Adaptive Learning Analysis.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validateCreateRecommendationPredictionContextParams(
  params:
    CreateRecommendationPredictionContextParams,
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
      "Create Recommendation Prediction Context params must be an object.",
    );
  }

  validateRecommendationEvolutionMemory({
    memory:
      params.memory,
  });

  validateRecommendationEvolutionMemoryAnalysis({
    memory:
      params.memory,

    analysis:
      params.memoryAnalysis,
  });

  validateRecommendationAdaptiveLearningAnalysis({
    memory:
      params.memory,

    memoryAnalysis:
      params.memoryAnalysis,

    analysis:
      params.adaptiveLearningAnalysis,
  });

  if (
    !isRecommendationPredictionHorizon(
      params.horizon,
    )
  ) {
    throw new Error(
      "Prediction horizon is invalid.",
    );
  }

  validateTimestamp(
    params.createdAt,
    "createdAt",
  );

  validateTimestampOrder(
    params.memoryAnalysis.analyzedAt,
    params.createdAt,
    "memoryAnalysis.analyzedAt",
    "createdAt",
  );

  validateTimestampOrder(
    params.adaptiveLearningAnalysis.analyzedAt,
    params.createdAt,
    "adaptiveLearningAnalysis.analyzedAt",
    "createdAt",
  );

  if (
    params.recentEntryLimit !==
    undefined
  ) {
    validatePositiveBoundedInteger(
      params.recentEntryLimit,
      "recentEntryLimit",
      MAXIMUM_RECENT_ITEM_LIMIT,
    );
  }

  if (
    params.recentComparisonLimit !==
    undefined
  ) {
    validatePositiveBoundedInteger(
      params.recentComparisonLimit,
      "recentComparisonLimit",
      MAXIMUM_RECENT_ITEM_LIMIT,
    );
  }

  validatePredictionInputIdentityConsistency(
    params,
  );
}

/* ------------------------------------------------------------------ */
/* Identity Consistency                                               */
/* ------------------------------------------------------------------ */

function validatePredictionInputIdentityConsistency(
  params:
    CreateRecommendationPredictionContextParams,
): void {
  if (
    params.memory.id !==
    params.memoryAnalysis.memoryId
  ) {
    throw new Error(
      "Prediction Context Memory Analysis memoryId must match Memory id.",
    );
  }

  if (
    params.memory.id !==
    params.adaptiveLearningAnalysis.memoryId
  ) {
    throw new Error(
      "Prediction Context Adaptive Learning memoryId must match Memory id.",
    );
  }

  if (
    params.memory.historyId !==
      params.memoryAnalysis.historyId ||
    params.memory.historyId !==
      params.adaptiveLearningAnalysis.historyId
  ) {
    throw new Error(
      "Prediction Context input historyId values must match.",
    );
  }

  if (
    params.adaptiveLearningAnalysis
      .sourceMemoryAnalyzedAt !==
    params.memoryAnalysis.analyzedAt
  ) {
    throw new Error(
      "Adaptive Learning sourceMemoryAnalyzedAt must match Memory Analysis analyzedAt.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Clone                                                              */
/* ------------------------------------------------------------------ */

export function cloneRecommendationPredictionContext(
  context:
    RecommendationPredictionContext,
): RecommendationPredictionContext {
  return {
    ...context,

    currentMemorySignalTypes: [
      ...context.currentMemorySignalTypes,
    ],

    currentRuntimeDecisionTypes: [
      ...context.currentRuntimeDecisionTypes,
    ],

    recentEntryIds: [
      ...context.recentEntryIds,
    ],

    recentComparisonIds: [
      ...context.recentComparisonIds,
    ],

    recentStates: [
      ...context.recentStates,
    ],

    recentStrategyTypes: [
      ...context.recentStrategyTypes,
    ],

    recentRuntimeDecisionTypes: [
      ...context.recentRuntimeDecisionTypes,
    ],

    recentLearningPatternTypes: [
      ...context.recentLearningPatternTypes,
    ],

    scoreTrend: {
      ...context.scoreTrend,
    },

    activeAdaptationRuleIds: [
      ...context.activeAdaptationRuleIds,
    ],

    conflictedAdaptationRuleIds: [
      ...context.conflictedAdaptationRuleIds,
    ],

    runtimeAdjustment:
      clonePredictionRuntimeAdjustment(
        context.runtimeAdjustment,
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Runtime Adjustment Clone                                           */
/* ------------------------------------------------------------------ */

function clonePredictionRuntimeAdjustment(
  adjustment:
    RecommendationRuntimeAdjustment,
): RecommendationRuntimeAdjustment {
  return {
    strategyPreferenceAdjustments: {
      ...adjustment.strategyPreferenceAdjustments,
    },

    decisionPreferenceAdjustments: {
      ...adjustment.decisionPreferenceAdjustments,
    },

    signalConfidenceAdjustments: {
      ...adjustment.signalConfidenceAdjustments,
    },

    evidenceRequirementAdjustment:
      adjustment.evidenceRequirementAdjustment,

    newRecommendationThresholdAdjustment:
      adjustment.newRecommendationThresholdAdjustment,

    redirectionThresholdAdjustment:
      adjustment.redirectionThresholdAdjustment,

    stabilizationPreferenceAdjustment:
      adjustment.stabilizationPreferenceAdjustment,

    recoveryPreferenceAdjustment:
      adjustment.recoveryPreferenceAdjustment,
  };
}

/* ------------------------------------------------------------------ */
/* Runtime Adjustment Equality                                        */
/* ------------------------------------------------------------------ */

function areRuntimeAdjustmentsEqual(
  left:
    RecommendationRuntimeAdjustment,
  right:
    RecommendationRuntimeAdjustment,
): boolean {
  return (
    left.evidenceRequirementAdjustment ===
      right.evidenceRequirementAdjustment &&
    left.newRecommendationThresholdAdjustment ===
      right.newRecommendationThresholdAdjustment &&
    left.redirectionThresholdAdjustment ===
      right.redirectionThresholdAdjustment &&
    left.stabilizationPreferenceAdjustment ===
      right.stabilizationPreferenceAdjustment &&
    left.recoveryPreferenceAdjustment ===
      right.recoveryPreferenceAdjustment &&
    areNumberRecordsEqual(
      left.strategyPreferenceAdjustments,
      right.strategyPreferenceAdjustments,
    ) &&
    areNumberRecordsEqual(
      left.decisionPreferenceAdjustments,
      right.decisionPreferenceAdjustments,
    ) &&
    areNumberRecordsEqual(
      left.signalConfidenceAdjustments,
      right.signalConfidenceAdjustments,
    )
  );
}

function areNumberRecordsEqual(
  left:
    Readonly<
      Record<
        string,
        number | undefined
      >
    >,
  right:
    Readonly<
      Record<
        string,
        number | undefined
      >
    >,
): boolean {
  const keys =
    Array.from(
      new Set([
        ...Object.keys(
          left,
        ),

        ...Object.keys(
          right,
        ),
      ]),
    );

  return keys.every(
    (
      key,
    ) =>
      left[
        key
      ] ===
      right[
        key
      ],
  );
}

/* ------------------------------------------------------------------ */
/* Memory Clone Helpers                                               */
/* ------------------------------------------------------------------ */

function cloneRecommendationMemoryEntryForPrediction(
  entry:
    RecommendationEvolutionMemoryEntry,
): RecommendationEvolutionMemoryEntry {
  return {
    ...entry,

    scores: {
      ...entry.scores,
    },

    signalTypes: [
      ...entry.signalTypes,
    ],

    decisions: {
      ...entry.decisions,
    },

    enabledRuntimeDecisionTypes: [
      ...entry.enabledRuntimeDecisionTypes,
    ],
  };
}

function cloneRecommendationMemoryComparisonForPrediction(
  comparison:
    RecommendationEvolutionMemoryComparison,
): RecommendationEvolutionMemoryComparison {
  return {
    ...comparison,

    previous:
      comparison.previous ===
      null
        ? null
        : cloneRecommendationMemoryEntryForPrediction(
            comparison.previous,
          ),

    current:
      cloneRecommendationMemoryEntryForPrediction(
        comparison.current,
      ),

    scoreChanges: {
      ...comparison.scoreChanges,
    },

    decisionChanges: {
      newlyEnabled: [
        ...comparison.decisionChanges.newlyEnabled,
      ],

      newlyDisabled: [
        ...comparison.decisionChanges.newlyDisabled,
      ],

      unchangedEnabled: [
        ...comparison.decisionChanges.unchangedEnabled,
      ],
    },

    signals:
      comparison.signals.map(
        (
          signal,
        ) => ({
          ...signal,
        }),
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Query Helpers                                                      */
/* ------------------------------------------------------------------ */

export function hasRecommendationPredictionContextEvidence(
  context:
    RecommendationPredictionContext,
): boolean {
  return (
    context.recentEntryIds.length >
      0 ||
    context.recentComparisonIds.length >
      0 ||
    context.recentLearningPatternTypes.length >
      0
  );
}

export function hasRecommendationPredictionContextActiveRules(
  context:
    RecommendationPredictionContext,
): boolean {
  return context.activeAdaptationRuleIds.length >
    0;
}

export function hasRecommendationPredictionContextConflict(
  context:
    RecommendationPredictionContext,
): boolean {
  return (
    context.conflictRisk >
      0 ||
    context.conflictedAdaptationRuleIds.length >
      0
  );
}

export function getRecommendationPredictionContextLatestState(
  context:
    RecommendationPredictionContext,
): RecommendationPredictiveEntryState | null {
  return context.currentState;
}

export function getRecommendationPredictionContextLatestStrategy(
  context:
    RecommendationPredictionContext,
): RecommendationPredictiveStrategyType | null {
  return context.currentStrategyType;
}

/* ------------------------------------------------------------------ */
/* Generic Array Helpers                                              */
/* ------------------------------------------------------------------ */

function getLastArrayItem<
  TValue,
>(
  values:
    readonly TValue[],
): TValue | null {
  if (
    values.length ===
    0
  ) {
    return null;
  }

  return values[
    values.length -
    1
  ] ??
    null;
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

function areStringSetsEqual(
  left:
    readonly string[],
  right:
    readonly string[],
): boolean {
  if (
    left.length !==
    right.length
  ) {
    return false;
  }

  const rightValues =
    new Set(
      right,
    );

  return left.every(
    (
      value,
    ) =>
      rightValues.has(
        value,
      ),
  );
}

/* ------------------------------------------------------------------ */
/* Generic Number Helpers                                             */
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
      10000,
  ) /
    10000;
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

function validateNullableIdentifier(
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

  validateRequiredIdentifier(
    value,
    fieldName,
  );
}

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

function validateUniqueIdentifierArray(
  values:
    readonly string[],
  fieldName:
    string,
): void {
  validateUniqueStringArray(
    values,
    fieldName,
  );

  values.forEach(
    (
      value,
      index,
    ) => {
      if (
        value.length >
        256
      ) {
        throw new Error(
          `${fieldName}[${index}] must not exceed 256 characters.`,
        );
      }
    },
  );
}

function validateDisjointIdentifierArrays(
  params: {
    left:
      readonly string[];

    right:
      readonly string[];

    leftFieldName:
      string;

    rightFieldName:
      string;
  },
): void {
  const rightValues =
    new Set(
      params.right,
    );

  const overlap =
    params.left.find(
      (
        value,
      ) =>
        rightValues.has(
          value,
        ),
    );

  if (
    overlap !==
    undefined
  ) {
    throw new Error(
      `${params.leftFieldName} and ${params.rightFieldName} must not overlap: ${overlap}.`,
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