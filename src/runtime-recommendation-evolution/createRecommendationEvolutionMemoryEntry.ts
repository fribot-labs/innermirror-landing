import type {
    RecommendationEvolutionIntelligenceResult,
    RecommendationEvolutionIntelligenceSignalType,
    RecommendationEvolutionRuntimeDecisionType,
} from "./recommendationEvolutionIntelligenceTypes";

import type {
    CreateRecommendationEvolutionMemoryEntryParams,
    RecommendationEvolutionMemoryEntry,
    ValidateRecommendationEvolutionMemoryEntryParams,
} from "./recommendationEvolutionMemoryTypes";

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Intelligence 분석 결과를
 * 장기 기억에 저장할 수 있는 Memory Entry로 정규화합니다.
 *
 * 이 함수는 원본 Intelligence Result 전체를 저장하지 않습니다.
 * 장기 비교와 추세 분석에 필요한 핵심 정보만 추출합니다.
 */
export function createRecommendationEvolutionMemoryEntry(
  params:
    CreateRecommendationEvolutionMemoryEntryParams,
): RecommendationEvolutionMemoryEntry {
  const {
    intelligence,
    recordedAt,
    createEntryId,
  } = params;

  const entryId =
    createEntryId();

  const signalTypes =
    extractRecommendationEvolutionSignalTypes(
      intelligence,
    );

  const enabledRuntimeDecisionTypes =
    extractEnabledRuntimeDecisionTypes(
      intelligence,
    );

  const entry:
    RecommendationEvolutionMemoryEntry = {
      id:
        entryId,

      intelligenceVersion:
        intelligence.version,

      historyId:
        intelligence.evolution.historyId,

      sourceEvolutionAnalyzedAt:
        intelligence.evolution.analyzedAt,

      intelligenceAnalyzedAt:
        intelligence.analyzedAt,

      state:
        intelligence.assessment.state,

      assessmentConfidence:
        intelligence.assessment.confidence,

      scores: {
        ...intelligence.assessment.scores,
      },

      primarySignalType:
        intelligence.assessment.primarySignalType,

      signalTypes: [
        ...signalTypes,
      ],

      strategyType:
        intelligence.strategy.type,

      strategyPriority:
        intelligence.strategy.priority,

      decisions: {
        ...intelligence.strategy.decisions,
      },

      enabledRuntimeDecisionTypes: [
        ...enabledRuntimeDecisionTypes,
      ],

      guidanceTone:
        intelligence.guidance.tone,

      warningCount:
        intelligence.guidance.warnings.length,

      observationCount:
        intelligence.guidance.observations.length,

      recordedAt,
    };

  validateRecommendationEvolutionMemoryEntry({
    entry,
  });

  return entry;
}

/* ------------------------------------------------------------------ */
/* Signal Type Extraction                                             */
/* ------------------------------------------------------------------ */

/**
 * Intelligence Result의 Signal 목록에서 Signal Type만 추출합니다.
 *
 * Memory 계층은 Signal 전체 Evidence와 설명을 장기 저장하지 않고,
 * 장기적인 반복 여부를 비교할 수 있도록 Type만 저장합니다.
 */
function extractRecommendationEvolutionSignalTypes(
  intelligence:
    RecommendationEvolutionIntelligenceResult,
): RecommendationEvolutionIntelligenceSignalType[] {
  return intelligence.signals.map(
    (
      signal,
    ) =>
      signal.type,
  );
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Extraction                                        */
/* ------------------------------------------------------------------ */

/**
 * 현재 Intelligence 실행에서 활성화된 Runtime Decision Type만
 * Memory Entry에 저장합니다.
 *
 * enabled=false인 Decision은 현재 Runtime 행동에 반영되지 않으므로
 * 장기 비교 대상에서 제외합니다.
 */
function extractEnabledRuntimeDecisionTypes(
  intelligence:
    RecommendationEvolutionIntelligenceResult,
): RecommendationEvolutionRuntimeDecisionType[] {
  return intelligence.runtimeDecisions
    .filter(
      (
        decision,
      ) =>
        decision.enabled,
    )
    .map(
      (
        decision,
      ) =>
        decision.type,
    );
}

/* ------------------------------------------------------------------ */
/* Public Validation API                                              */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Memory Entry가 장기 저장에 적합한
 * 유효한 구조인지 검증합니다.
 */
export function validateRecommendationEvolutionMemoryEntry(
  params:
    ValidateRecommendationEvolutionMemoryEntryParams,
): void {
  const {
    entry,
  } = params;

  validateRequiredIdentifier(
    entry.id,
    "Recommendation Evolution Memory Entry id",
  );

  validateRequiredIdentifier(
    entry.historyId,
    "Recommendation Evolution Memory Entry historyId",
  );

  validateIntelligenceVersion(
    entry.intelligenceVersion,
  );

  validateTimestamp(
    entry.sourceEvolutionAnalyzedAt,
    "sourceEvolutionAnalyzedAt",
  );

  validateTimestamp(
    entry.intelligenceAnalyzedAt,
    "intelligenceAnalyzedAt",
  );

  validateTimestamp(
    entry.recordedAt,
    "recordedAt",
  );

  validateTimestampOrder(
    entry.sourceEvolutionAnalyzedAt,
    entry.intelligenceAnalyzedAt,
    "sourceEvolutionAnalyzedAt",
    "intelligenceAnalyzedAt",
  );

  validateTimestampOrder(
    entry.intelligenceAnalyzedAt,
    entry.recordedAt,
    "intelligenceAnalyzedAt",
    "recordedAt",
  );

  validateRequiredString(
    entry.state,
    "state",
  );

  validateRequiredString(
    entry.assessmentConfidence,
    "assessmentConfidence",
  );

  validateRecommendationEvolutionMemoryScores(
    entry.scores,
  );

  validateNullableString(
    entry.primarySignalType,
    "primarySignalType",
  );

  validateUniqueStringArray(
    entry.signalTypes,
    "signalTypes",
  );

  validateRequiredString(
    entry.strategyType,
    "strategyType",
  );

  validateRequiredString(
    entry.strategyPriority,
    "strategyPriority",
  );

  validateStrategyDecisions(
    entry.decisions,
  );

  validateUniqueStringArray(
    entry.enabledRuntimeDecisionTypes,
    "enabledRuntimeDecisionTypes",
  );

  validateRequiredString(
    entry.guidanceTone,
    "guidanceTone",
  );

  validateNonNegativeInteger(
    entry.warningCount,
    "warningCount",
  );

  validateNonNegativeInteger(
    entry.observationCount,
    "observationCount",
  );

  validatePrimarySignalConsistency(
    entry,
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

/* ------------------------------------------------------------------ */
/* String Validation                                                  */
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

/* ------------------------------------------------------------------ */
/* Intelligence Version Validation                                    */
/* ------------------------------------------------------------------ */

function validateIntelligenceVersion(
  value:
    unknown,
): void {
  if (
    typeof value !==
      "number" &&
    typeof value !==
      "string"
  ) {
    throw new Error(
      "intelligenceVersion must be a string or number.",
    );
  }

  if (
    typeof value ===
      "number" &&
    !Number.isFinite(
      value,
    )
  ) {
    throw new Error(
      "intelligenceVersion must be finite.",
    );
  }

  if (
    typeof value ===
      "string" &&
    value.trim().length ===
      0
  ) {
    throw new Error(
      "intelligenceVersion must not be empty.",
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
  const earlierTime =
    Date.parse(
      earlier,
    );

  const laterTime =
    Date.parse(
      later,
    );

  if (
    earlierTime >
    laterTime
  ) {
    throw new Error(
      `${earlierFieldName} must not be later than ${laterFieldName}.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Score Validation                                                   */
/* ------------------------------------------------------------------ */

function validateRecommendationEvolutionMemoryScores(
  scores:
    RecommendationEvolutionMemoryEntry["scores"],
): void {
  if (
    typeof scores !==
      "object" ||
    scores ===
      null
  ) {
    throw new Error(
      "scores must be an object.",
    );
  }

  validateNormalizedScore(
    scores.stability,
    "scores.stability",
  );

  validateNormalizedScore(
    scores.progress,
    "scores.progress",
  );

  validateNormalizedScore(
    scores.repetitionRisk,
    "scores.repetitionRisk",
  );

  validateNormalizedScore(
    scores.redirectionRisk,
    "scores.redirectionRisk",
  );

  validateNormalizedScore(
    scores.completionMomentum,
    "scores.completionMomentum",
  );
}

function validateNormalizedScore(
  value:
    unknown,
  fieldName:
    string,
): asserts value is number {
  if (
    typeof value !==
    "number"
  ) {
    throw new Error(
      `${fieldName} must be a number.`,
    );
  }

  if (
    !Number.isFinite(
      value,
    )
  ) {
    throw new Error(
      `${fieldName} must be finite.`,
    );
  }

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

/* ------------------------------------------------------------------ */
/* Array Validation                                                   */
/* ------------------------------------------------------------------ */

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
          `${fieldName} must not contain duplicate values: ${value}.`,
        );
      }

      observedValues.add(
        value,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Count Validation                                                   */
/* ------------------------------------------------------------------ */

function validateNonNegativeInteger(
  value:
    unknown,
  fieldName:
    string,
): asserts value is number {
  if (
    typeof value !==
    "number"
  ) {
    throw new Error(
      `${fieldName} must be a number.`,
    );
  }

  if (
    !Number.isInteger(
      value,
    )
  ) {
    throw new Error(
      `${fieldName} must be an integer.`,
    );
  }

  if (
    value <
    0
  ) {
    throw new Error(
      `${fieldName} must not be negative.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Strategy Decision Validation                                       */
/* ------------------------------------------------------------------ */

function validateStrategyDecisions(
  decisions:
    RecommendationEvolutionMemoryEntry["decisions"],
): void {
  if (
    typeof decisions !==
      "object" ||
    decisions ===
      null ||
    Array.isArray(
      decisions,
    )
  ) {
    throw new Error(
      "decisions must be an object.",
    );
  }

  const entries =
    Object.entries(
      decisions,
    );

  if (
    entries.length ===
    0
  ) {
    throw new Error(
      "decisions must contain at least one decision.",
    );
  }

  entries.forEach(
    (
      [
        decisionName,
        decisionValue,
      ],
    ) => {
      validateRequiredString(
        decisionName,
        "decision name",
      );

      if (
        typeof decisionValue !==
        "boolean"
      ) {
        throw new Error(
          `decisions.${decisionName} must be a boolean.`,
        );
      }
    },
  );
}

/* ------------------------------------------------------------------ */
/* Cross-field Consistency                                            */
/* ------------------------------------------------------------------ */

function validatePrimarySignalConsistency(
  entry:
    RecommendationEvolutionMemoryEntry,
): void {
  if (
    entry.primarySignalType ===
    null
  ) {
    return;
  }

  if (
    !entry.signalTypes.includes(
      entry.primarySignalType,
    )
  ) {
    throw new Error(
      "primarySignalType must exist in signalTypes.",
    );
  }
}