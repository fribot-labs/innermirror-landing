import {
    validateRecommendationEvolutionMemoryEntry,
} from "./createRecommendationEvolutionMemoryEntry";

import type {
    AppendRecommendationEvolutionMemoryParams,
    RecommendationEvolutionMemory,
    RecommendationEvolutionMemoryEntry,
    ValidateRecommendationEvolutionMemoryParams,
} from "./recommendationEvolutionMemoryTypes";

import {
    isRecommendationEvolutionMemoryVersion,
} from "./recommendationEvolutionMemoryTypes";

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Memory에 새로운 Entry를 추가합니다.
 *
 * 기존 Memory가 없다면 새로운 Memory를 생성합니다.
 * 기존 Memory가 있다면 불변성을 유지하며 Entry를 추가합니다.
 *
 * 다음 조건을 보장합니다.
 *
 * - 동일한 Recommendation History만 하나의 Memory에 저장
 * - Entry ID 중복 금지
 * - Intelligence 분석 시각 중복 금지
 * - Entry 시간 역행 금지
 * - Memory updatedAt 시간 역행 금지
 */
export function appendRecommendationEvolutionMemory(
  params:
    AppendRecommendationEvolutionMemoryParams,
): RecommendationEvolutionMemory {
  const {
    memory,
    entry,
    memoryId,
    updatedAt,
  } = params;

  validateRecommendationEvolutionMemoryEntry({
    entry,
  });

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
    const createdMemory =
      createRecommendationEvolutionMemory({
        entry,
        memoryId,
        updatedAt,
      });

    validateRecommendationEvolutionMemory({
      memory:
        createdMemory,
    });

    return createdMemory;
  }

  validateRecommendationEvolutionMemory({
    memory,
  });

  validateMemoryAppendCompatibility({
    memory,
    entry,
    memoryId,
    updatedAt,
  });

  const updatedMemory:
    RecommendationEvolutionMemory = {
      ...memory,

      entries: [
        ...memory.entries,
        cloneRecommendationEvolutionMemoryEntry(
          entry,
        ),
      ],

      updatedAt,
    };

  validateRecommendationEvolutionMemory({
    memory:
      updatedMemory,
  });

  return updatedMemory;
}

/* ------------------------------------------------------------------ */
/* Memory Creation                                                    */
/* ------------------------------------------------------------------ */

type CreateRecommendationEvolutionMemoryParams = {
  entry:
    RecommendationEvolutionMemoryEntry;

  memoryId:
    string;

  updatedAt:
    string;
};

function createRecommendationEvolutionMemory(
  params:
    CreateRecommendationEvolutionMemoryParams,
): RecommendationEvolutionMemory {
  const {
    entry,
    memoryId,
    updatedAt,
  } = params;

  validateEntryRecordedBeforeMemoryUpdate(
    entry,
    updatedAt,
  );

  return {
    version:
      1,

    id:
      memoryId,

    historyId:
      entry.historyId,

    entries: [
      cloneRecommendationEvolutionMemoryEntry(
        entry,
      ),
    ],

    createdAt:
      updatedAt,

    updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Append Compatibility                                               */
/* ------------------------------------------------------------------ */

type ValidateMemoryAppendCompatibilityParams = {
  memory:
    RecommendationEvolutionMemory;

  entry:
    RecommendationEvolutionMemoryEntry;

  memoryId:
    string;

  updatedAt:
    string;
};

function validateMemoryAppendCompatibility(
  params:
    ValidateMemoryAppendCompatibilityParams,
): void {
  const {
    memory,
    entry,
    memoryId,
    updatedAt,
  } = params;

  validateMemoryIdConsistency(
    memory,
    memoryId,
  );

  validateHistoryConsistency(
    memory,
    entry,
  );

  validateEntryIdUniqueness(
    memory,
    entry,
  );

  validateIntelligenceAnalysisTimestampUniqueness(
    memory,
    entry,
  );

  validateEntryChronology(
    memory,
    entry,
  );

  validateMemoryUpdateChronology(
    memory,
    updatedAt,
  );

  validateEntryRecordedBeforeMemoryUpdate(
    entry,
    updatedAt,
  );
}

/* ------------------------------------------------------------------ */
/* Memory ID Consistency                                              */
/* ------------------------------------------------------------------ */

function validateMemoryIdConsistency(
  memory:
    RecommendationEvolutionMemory,
  memoryId:
    string,
): void {
  if (
    memory.id !==
    memoryId
  ) {
    throw new Error(
      "Existing Recommendation Evolution Memory id must match memoryId.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Public Memory Validation                                           */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Memory 전체 구조를 검증합니다.
 */
export function validateRecommendationEvolutionMemory(
  params:
    ValidateRecommendationEvolutionMemoryParams,
): void {
  const {
    memory,
  } = params;

  if (
    typeof memory !==
      "object" ||
    memory ===
      null ||
    Array.isArray(
      memory,
    )
  ) {
    throw new Error(
      "Recommendation Evolution Memory must be an object.",
    );
  }

  if (
    !isRecommendationEvolutionMemoryVersion(
      memory.version,
    )
  ) {
    throw new Error(
      "Recommendation Evolution Memory version is invalid.",
    );
  }

  validateRequiredIdentifier(
    memory.id,
    "Recommendation Evolution Memory id",
  );

  validateRequiredIdentifier(
    memory.historyId,
    "Recommendation Evolution Memory historyId",
  );

  validateTimestamp(
    memory.createdAt,
    "createdAt",
  );

  validateTimestamp(
    memory.updatedAt,
    "updatedAt",
  );

  validateTimestampOrder(
    memory.createdAt,
    memory.updatedAt,
    "createdAt",
    "updatedAt",
  );

  validateMemoryEntries(
    memory,
  );

  validateMemoryEntryIdUniqueness(
    memory.entries,
  );

  validateMemoryAnalysisTimestampUniqueness(
    memory.entries,
  );

  validateMemoryEntryChronology(
    memory.entries,
  );

  validateMemoryHistoryConsistency(
    memory,
  );

  validateLatestEntryAgainstMemoryUpdatedAt(
    memory,
  );
}

/* ------------------------------------------------------------------ */
/* Memory Entry Validation                                            */
/* ------------------------------------------------------------------ */

function validateMemoryEntries(
  memory:
    RecommendationEvolutionMemory,
): void {
  if (
    !Array.isArray(
      memory.entries,
    )
  ) {
    throw new Error(
      "Recommendation Evolution Memory entries must be an array.",
    );
  }

  memory.entries.forEach(
    (
      entry,
      index,
    ) => {
      try {
        validateRecommendationEvolutionMemoryEntry({
          entry,
        });
      } catch (
        error
      ) {
        const message =
          error instanceof Error
            ? error.message
            : String(
                error,
              );

        throw new Error(
          `Recommendation Evolution Memory entry at index ${index} is invalid: ${message}`,
        );
      }
    },
  );
}

/* ------------------------------------------------------------------ */
/* History Consistency                                                */
/* ------------------------------------------------------------------ */

function validateHistoryConsistency(
  memory:
    RecommendationEvolutionMemory,
  entry:
    RecommendationEvolutionMemoryEntry,
): void {
  if (
    memory.historyId !==
    entry.historyId
  ) {
    throw new Error(
      "Recommendation Evolution Memory and Entry historyId must match.",
    );
  }
}

function validateMemoryHistoryConsistency(
  memory:
    RecommendationEvolutionMemory,
): void {
  memory.entries.forEach(
    (
      entry,
      index,
    ) => {
      if (
        entry.historyId !==
        memory.historyId
      ) {
        throw new Error(
          `Recommendation Evolution Memory entry at index ${index} has a mismatched historyId.`,
        );
      }
    },
  );
}

/* ------------------------------------------------------------------ */
/* Entry ID Uniqueness                                                */
/* ------------------------------------------------------------------ */

function validateEntryIdUniqueness(
  memory:
    RecommendationEvolutionMemory,
  entry:
    RecommendationEvolutionMemoryEntry,
): void {
  const duplicateEntry =
    memory.entries.some(
      (
        existingEntry,
      ) =>
        existingEntry.id ===
        entry.id,
    );

  if (
    duplicateEntry
  ) {
    throw new Error(
      `Recommendation Evolution Memory entry id must be unique: ${entry.id}.`,
    );
  }
}

function validateMemoryEntryIdUniqueness(
  entries:
    RecommendationEvolutionMemoryEntry[],
): void {
  const observedEntryIds =
    new Set<string>();

  entries.forEach(
    (
      entry,
    ) => {
      if (
        observedEntryIds.has(
          entry.id,
        )
      ) {
        throw new Error(
          `Recommendation Evolution Memory contains a duplicate entry id: ${entry.id}.`,
        );
      }

      observedEntryIds.add(
        entry.id,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Analysis Timestamp Uniqueness                                      */
/* ------------------------------------------------------------------ */

/**
 * MVP에서는 하나의 intelligenceAnalyzedAt에 하나의 Entry만 허용합니다.
 */
function validateIntelligenceAnalysisTimestampUniqueness(
  memory:
    RecommendationEvolutionMemory,
  entry:
    RecommendationEvolutionMemoryEntry,
): void {
  const duplicateAnalysis =
    memory.entries.some(
      (
        existingEntry,
      ) =>
        existingEntry.intelligenceAnalyzedAt ===
        entry.intelligenceAnalyzedAt,
    );

  if (
    duplicateAnalysis
  ) {
    throw new Error(
      `Recommendation Evolution Memory already contains an Entry for intelligenceAnalyzedAt: ${entry.intelligenceAnalyzedAt}.`,
    );
  }
}

function validateMemoryAnalysisTimestampUniqueness(
  entries:
    RecommendationEvolutionMemoryEntry[],
): void {
  const observedTimestamps =
    new Set<string>();

  entries.forEach(
    (
      entry,
    ) => {
      if (
        observedTimestamps.has(
          entry.intelligenceAnalyzedAt,
        )
      ) {
        throw new Error(
          `Recommendation Evolution Memory contains a duplicate intelligenceAnalyzedAt timestamp: ${entry.intelligenceAnalyzedAt}.`,
        );
      }

      observedTimestamps.add(
        entry.intelligenceAnalyzedAt,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Entry Chronology                                                   */
/* ------------------------------------------------------------------ */

function validateEntryChronology(
  memory:
    RecommendationEvolutionMemory,
  entry:
    RecommendationEvolutionMemoryEntry,
): void {
  const latestEntry =
    getLatestMemoryEntry(
      memory,
    );

  if (
    latestEntry ===
    null
  ) {
    return;
  }

  const latestAnalyzedAt =
    parseTimestamp(
      latestEntry.intelligenceAnalyzedAt,
      "latest entry intelligenceAnalyzedAt",
    );

  const nextAnalyzedAt =
    parseTimestamp(
      entry.intelligenceAnalyzedAt,
      "entry intelligenceAnalyzedAt",
    );

  if (
    nextAnalyzedAt <=
    latestAnalyzedAt
  ) {
    throw new Error(
      "New Recommendation Evolution Memory Entry intelligenceAnalyzedAt must be later than the latest Entry.",
    );
  }

  const latestRecordedAt =
    parseTimestamp(
      latestEntry.recordedAt,
      "latest entry recordedAt",
    );

  const nextRecordedAt =
    parseTimestamp(
      entry.recordedAt,
      "entry recordedAt",
    );

  if (
    nextRecordedAt <
    latestRecordedAt
  ) {
    throw new Error(
      "New Recommendation Evolution Memory Entry recordedAt must not be earlier than the latest Entry recordedAt.",
    );
  }
}

function validateMemoryEntryChronology(
  entries:
    RecommendationEvolutionMemoryEntry[],
): void {
  for (
    let index =
      1;
    index <
    entries.length;
    index +=
      1
  ) {
    const previousEntry =
      entries[
        index -
        1
      ];

    const currentEntry =
      entries[
        index
      ];

    if (
      previousEntry ===
        undefined ||
      currentEntry ===
        undefined
    ) {
      continue;
    }

    const previousAnalyzedAt =
      parseTimestamp(
        previousEntry.intelligenceAnalyzedAt,
        `entries[${index - 1}].intelligenceAnalyzedAt`,
      );

    const currentAnalyzedAt =
      parseTimestamp(
        currentEntry.intelligenceAnalyzedAt,
        `entries[${index}].intelligenceAnalyzedAt`,
      );

    if (
      currentAnalyzedAt <=
      previousAnalyzedAt
    ) {
      throw new Error(
        "Recommendation Evolution Memory entries must be ordered by ascending intelligenceAnalyzedAt.",
      );
    }

    const previousRecordedAt =
      parseTimestamp(
        previousEntry.recordedAt,
        `entries[${index - 1}].recordedAt`,
      );

    const currentRecordedAt =
      parseTimestamp(
        currentEntry.recordedAt,
        `entries[${index}].recordedAt`,
      );

    if (
      currentRecordedAt <
      previousRecordedAt
    ) {
      throw new Error(
        "Recommendation Evolution Memory entries must not move backward by recordedAt.",
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Memory Update Chronology                                           */
/* ------------------------------------------------------------------ */

function validateMemoryUpdateChronology(
  memory:
    RecommendationEvolutionMemory,
  updatedAt:
    string,
): void {
  validateTimestampOrder(
    memory.createdAt,
    updatedAt,
    "memory.createdAt",
    "updatedAt",
  );

  validateTimestampOrder(
    memory.updatedAt,
    updatedAt,
    "memory.updatedAt",
    "updatedAt",
  );
}

function validateEntryRecordedBeforeMemoryUpdate(
  entry:
    RecommendationEvolutionMemoryEntry,
  updatedAt:
    string,
): void {
  validateTimestampOrder(
    entry.recordedAt,
    updatedAt,
    "entry.recordedAt",
    "updatedAt",
  );
}

function validateLatestEntryAgainstMemoryUpdatedAt(
  memory:
    RecommendationEvolutionMemory,
): void {
  const latestEntry =
    getLatestMemoryEntry(
      memory,
    );

  if (
    latestEntry ===
    null
  ) {
    return;
  }

  validateTimestampOrder(
    latestEntry.recordedAt,
    memory.updatedAt,
    "latestEntry.recordedAt",
    "memory.updatedAt",
  );
}

/* ------------------------------------------------------------------ */
/* Entry Cloning                                                      */
/* ------------------------------------------------------------------ */

/**
 * Memory에 외부 객체 참조가 그대로 저장되지 않도록
 * Entry의 객체 및 배열 필드를 복사합니다.
 */
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
/* Query Helpers                                                      */
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

/* ------------------------------------------------------------------ */
/* Identifier Validation                                              */
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

/* ------------------------------------------------------------------ */
/* Timestamp Validation                                               */
/* ------------------------------------------------------------------ */

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

  parseTimestamp(
    value,
    fieldName,
  );
}

function parseTimestamp(
  value:
    string,
  fieldName:
    string,
): number {
  const parsedTimestamp =
    Date.parse(
      value,
    );

  if (
    Number.isNaN(
      parsedTimestamp,
    )
  ) {
    throw new Error(
      `${fieldName} must be a valid timestamp.`,
    );
  }

  return parsedTimestamp;
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
    parseTimestamp(
      earlier,
      earlierFieldName,
    );

  const laterTimestamp =
    parseTimestamp(
      later,
      laterFieldName,
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