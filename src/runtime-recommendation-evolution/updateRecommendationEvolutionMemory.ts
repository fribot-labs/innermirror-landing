import {
    analyzeRecommendationEvolutionMemory,
    validateRecommendationEvolutionMemoryAnalysis,
} from "./analyzeRecommendationEvolutionMemory";

import {
    appendRecommendationEvolutionMemory,
    validateRecommendationEvolutionMemory,
} from "./appendRecommendationEvolutionMemory";

import {
    createRecommendationEvolutionMemoryEntry,
    validateRecommendationEvolutionMemoryEntry,
} from "./createRecommendationEvolutionMemoryEntry";

import {
    createRecommendationEvolutionMemoryPresentation,
} from "./createRecommendationEvolutionMemoryPresentation";

import {
    validateRecommendationEvolutionMemoryComparison,
} from "./compareRecommendationEvolutionMemoryEntries";

import type {
    RecommendationEvolutionMemory,
    RecommendationEvolutionMemoryAnalysis,
    RecommendationEvolutionMemoryComparison,
    RecommendationEvolutionMemoryEntry,
    RecommendationEvolutionMemoryPresentation,
    RecommendationEvolutionMemoryUpdateResult,
    UpdateRecommendationEvolutionMemoryParams,
} from "./recommendationEvolutionMemoryTypes";

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * 하나의 Recommendation Evolution Intelligence 결과를 받아
 * Recommendation Evolution Memory 전체를 갱신합니다.
 *
 * 처리 순서:
 *
 * Intelligence Result
 *   ↓
 * Memory Entry 생성
 *   ↓
 * 기존 Memory에 Append
 *   ↓
 * 전체 Memory 분석
 *   ↓
 * 최신 Comparison 선택
 *   ↓
 * Presentation 생성
 *   ↓
 * Update Result 검증
 */
export function updateRecommendationEvolutionMemory(
  params:
    UpdateRecommendationEvolutionMemoryParams,
): RecommendationEvolutionMemoryUpdateResult {
  const {
    memory,
    intelligence,
    updatedAt,
    memoryId,
    createEntryId,
    createComparisonId,
    createSignalId,
  } = params;

  validateUpdateInput({
    memory,
    updatedAt,
    memoryId,
  });

  const entry =
    createRecommendationEvolutionMemoryEntry({
      intelligence,

      recordedAt:
        updatedAt,

      createEntryId,
    });

  const updatedMemory =
    appendRecommendationEvolutionMemory({
      memory,

      entry,

      memoryId,

      updatedAt,
    });

  const analysis =
    analyzeRecommendationEvolutionMemory({
      memory:
        updatedMemory,

      analyzedAt:
        updatedAt,

      createComparisonId,

      createSignalId,
    });

  const latestComparison =
    getLatestMemoryComparison(
      analysis,
    );

  const presentation =
    createRecommendationEvolutionMemoryPresentation({
      memory:
        updatedMemory,

      analysis,

      createdAt:
        updatedAt,
    });

  const result:
    RecommendationEvolutionMemoryUpdateResult = {
      memory:
        cloneRecommendationEvolutionMemory(
          updatedMemory,
        ),

      entry:
        cloneRecommendationEvolutionMemoryEntry(
          entry,
        ),

      latestComparison:
        cloneRecommendationEvolutionMemoryComparison(
          latestComparison,
        ),

      analysis:
        cloneRecommendationEvolutionMemoryAnalysis(
          analysis,
        ),

      presentation:
        cloneRecommendationEvolutionMemoryPresentation(
          presentation,
        ),

      updatedAt,
    };

  validateRecommendationEvolutionMemoryUpdateResult(
    result,
  );

  return result;
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

type ValidateUpdateInputParams = {
  memory:
    RecommendationEvolutionMemory | null;

  updatedAt:
    string;

  memoryId:
    string;
};

function validateUpdateInput(
  params:
    ValidateUpdateInputParams,
): void {
  const {
    memory,
    updatedAt,
    memoryId,
  } = params;

  validateRequiredIdentifier(
    memoryId,
    "memoryId",
  );

  validateTimestamp(
    updatedAt,
    "updatedAt",
  );

  if (
    memory ===
    null
  ) {
    return;
  }

  validateRecommendationEvolutionMemory({
    memory,
  });

  if (
    memory.id !==
    memoryId
  ) {
    throw new Error(
      "Existing Recommendation Evolution Memory id must match memoryId.",
    );
  }

  validateTimestampOrder(
    memory.updatedAt,
    updatedAt,
    "memory.updatedAt",
    "updatedAt",
  );
}

/* ------------------------------------------------------------------ */
/* Latest Comparison                                                  */
/* ------------------------------------------------------------------ */

/**
 * analyzeRecommendationEvolutionMemory()는 첫 Entry에도
 * initial Comparison을 생성합니다.
 *
 * 따라서 Entry가 정상적으로 추가되었다면 Analysis에는 항상
 * 하나 이상의 Comparison이 존재해야 합니다.
 */
function getLatestMemoryComparison(
  analysis:
    RecommendationEvolutionMemoryAnalysis,
): RecommendationEvolutionMemoryComparison {
  const latestComparison =
    analysis.comparisons[
      analysis.comparisons.length -
      1
    ];

  if (
    latestComparison ===
    undefined
  ) {
    throw new Error(
      "Recommendation Evolution Memory Analysis must contain a latest Comparison.",
    );
  }

  return latestComparison;
}

/* ------------------------------------------------------------------ */
/* Public Result Validation                                           */
/* ------------------------------------------------------------------ */

/**
 * REI04 Orchestrator가 생성한 최종 결과의 모듈 간 일관성을
 * 검증합니다.
 */
export function validateRecommendationEvolutionMemoryUpdateResult(
  result:
    RecommendationEvolutionMemoryUpdateResult,
): void {
  if (
    typeof result !==
      "object" ||
    result ===
      null ||
    Array.isArray(
      result,
    )
  ) {
    throw new Error(
      "Recommendation Evolution Memory Update Result must be an object.",
    );
  }

  validateTimestamp(
    result.updatedAt,
    "result.updatedAt",
  );

  validateRecommendationEvolutionMemory({
    memory:
      result.memory,
  });

  validateRecommendationEvolutionMemoryEntry({
    entry:
      result.entry,
  });

  validateRecommendationEvolutionMemoryComparison({
    comparison:
      result.latestComparison,
  });

  validateRecommendationEvolutionMemoryAnalysis({
    memory:
      result.memory,

    analysis:
      result.analysis,
  });

  validatePresentation(
    result.presentation,
  );

  validateResultMemoryConsistency(
    result,
  );

  validateResultTimestampConsistency(
    result,
  );
}

/* ------------------------------------------------------------------ */
/* Result Cross-field Consistency                                     */
/* ------------------------------------------------------------------ */

function validateResultMemoryConsistency(
  result:
    RecommendationEvolutionMemoryUpdateResult,
): void {
  const latestMemoryEntry =
    result.memory.entries[
      result.memory.entries.length -
      1
    ];

  if (
    latestMemoryEntry ===
    undefined
  ) {
    throw new Error(
      "Updated Recommendation Evolution Memory must contain at least one Entry.",
    );
  }

  if (
    latestMemoryEntry.id !==
    result.entry.id
  ) {
    throw new Error(
      "Update Result entry must be the latest Memory Entry.",
    );
  }

  if (
    result.entry.historyId !==
    result.memory.historyId
  ) {
    throw new Error(
      "Update Result entry historyId must match Memory historyId.",
    );
  }

  if (
    result.analysis.memoryId !==
    result.memory.id
  ) {
    throw new Error(
      "Update Result Analysis memoryId must match Memory id.",
    );
  }

  if (
    result.analysis.historyId !==
    result.memory.historyId
  ) {
    throw new Error(
      "Update Result Analysis historyId must match Memory historyId.",
    );
  }

  const latestAnalysisComparison =
    result.analysis.comparisons[
      result.analysis.comparisons.length -
      1
    ];

  if (
    latestAnalysisComparison ===
    undefined
  ) {
    throw new Error(
      "Update Result Analysis must contain a latest Comparison.",
    );
  }

  if (
    latestAnalysisComparison.id !==
    result.latestComparison.id
  ) {
    throw new Error(
      "Update Result latestComparison must match the latest Analysis Comparison.",
    );
  }

  if (
    result.latestComparison.current.id !==
    result.entry.id
  ) {
    throw new Error(
      "Update Result latestComparison current Entry must match the created Entry.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Timestamp Consistency                                              */
/* ------------------------------------------------------------------ */

function validateResultTimestampConsistency(
  result:
    RecommendationEvolutionMemoryUpdateResult,
): void {
  if (
    result.memory.updatedAt !==
    result.updatedAt
  ) {
    throw new Error(
      "Memory updatedAt must equal Update Result updatedAt.",
    );
  }

  if (
    result.entry.recordedAt !==
    result.updatedAt
  ) {
    throw new Error(
      "Created Memory Entry recordedAt must equal Update Result updatedAt.",
    );
  }

  if (
    result.analysis.analyzedAt !==
    result.updatedAt
  ) {
    throw new Error(
      "Memory Analysis analyzedAt must equal Update Result updatedAt.",
    );
  }

  if (
    result.presentation.createdAt !==
    result.updatedAt
  ) {
    throw new Error(
      "Memory Presentation createdAt must equal Update Result updatedAt.",
    );
  }

  if (
    result.latestComparison.comparedAt !==
    result.updatedAt
  ) {
    throw new Error(
      "Latest Memory Comparison comparedAt must equal Update Result updatedAt.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Presentation Validation                                            */
/* ------------------------------------------------------------------ */

/**
 * Presentation 전용 공개 Validation 함수가 아직 분리되지 않았으므로
 * Orchestrator에서 최종 반환에 필요한 최소 구조를 검증합니다.
 */
function validatePresentation(
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

  validateRequiredString(
    presentation.tone,
    "presentation.tone",
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

  validateNullableString(
    presentation.latestChange,
    "presentation.latestChange",
  );

  validateNullableString(
    presentation.longTermObservation,
    "presentation.longTermObservation",
  );

  validateUniqueStringArray(
    presentation.warnings,
    "presentation.warnings",
  );

  validateUniqueStringArray(
    presentation.evidence,
    "presentation.evidence",
  );

  validateTimestamp(
    presentation.createdAt,
    "presentation.createdAt",
  );
}

/* ------------------------------------------------------------------ */
/* Memory Cloning                                                     */
/* ------------------------------------------------------------------ */

function cloneRecommendationEvolutionMemory(
  memory:
    RecommendationEvolutionMemory,
): RecommendationEvolutionMemory {
  return {
    ...memory,

    entries:
      memory.entries.map(
        cloneRecommendationEvolutionMemoryEntry,
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Entry Cloning                                                      */
/* ------------------------------------------------------------------ */

function cloneRecommendationEvolutionMemoryEntry(
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

/* ------------------------------------------------------------------ */
/* Comparison Cloning                                                 */
/* ------------------------------------------------------------------ */

function cloneRecommendationEvolutionMemoryComparison(
  comparison:
    RecommendationEvolutionMemoryComparison,
): RecommendationEvolutionMemoryComparison {
  return {
    ...comparison,

    previous:
      comparison.previous ===
      null
        ? null
        : cloneRecommendationEvolutionMemoryEntry(
            comparison.previous,
          ),

    current:
      cloneRecommendationEvolutionMemoryEntry(
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
/* Analysis Cloning                                                   */
/* ------------------------------------------------------------------ */

function cloneRecommendationEvolutionMemoryAnalysis(
  analysis:
    RecommendationEvolutionMemoryAnalysis,
): RecommendationEvolutionMemoryAnalysis {
  return {
    ...analysis,

    statistics: {
      ...analysis.statistics,

      stateCounts: {
        ...analysis.statistics.stateCounts,
      },

      strategyCounts: {
        ...analysis.statistics.strategyCounts,
      },

      averageScores: {
        ...analysis.statistics.averageScores,
      },

      latestScoreChanges:
        analysis.statistics.latestScoreChanges ===
        null
          ? null
          : {
              ...analysis.statistics.latestScoreChanges,
            },
    },

    scores: {
      ...analysis.scores,
    },

    signals:
      analysis.signals.map(
        (
          signal,
        ) => ({
          ...signal,

          relatedEntryIds: [
            ...signal.relatedEntryIds,
          ],

          relatedComparisonIds: [
            ...signal.relatedComparisonIds,
          ],
        }),
      ),

    comparisons:
      analysis.comparisons.map(
        cloneRecommendationEvolutionMemoryComparison,
      ),

    reasoning: [
      ...analysis.reasoning,
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Presentation Cloning                                               */
/* ------------------------------------------------------------------ */

function cloneRecommendationEvolutionMemoryPresentation(
  presentation:
    RecommendationEvolutionMemoryPresentation,
): RecommendationEvolutionMemoryPresentation {
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

/* ------------------------------------------------------------------ */
/* Timestamp Validation                                               */
/* ------------------------------------------------------------------ */

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