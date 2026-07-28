import {
    validateRecommendationEvolutionMemory,
} from "./appendRecommendationEvolutionMemory";

import {
    validateRecommendationEvolutionMemoryComparison,
} from "./compareRecommendationEvolutionMemoryEntries";

import {
    isRecommendationAdaptiveLearningVersion,
    isRecommendationLearningOutcomeCategory,
    isRecommendationLearningOutcomeType,
    resolveRecommendationLearningOutcomeCategory,
} from "./recommendationAdaptiveLearningTypes";

import type {
    CreateRecommendationLearningObservationParams,
    RecommendationAdaptiveLearningEntryState,
    RecommendationAdaptiveLearningRuntimeDecisionType,
    RecommendationAdaptiveLearningStrategyType,
    RecommendationLearningObservation,
    RecommendationLearningOutcomeCategory,
    RecommendationLearningOutcomeCounts,
    RecommendationLearningOutcomeType,
    ValidateRecommendationLearningObservationParams,
} from "./recommendationAdaptiveLearningTypes";

import type {
    RecommendationEvolutionMemoryComparison,
} from "./recommendationEvolutionMemoryTypes";

import {
    evaluateRecommendationLearningOutcome,
} from "./evaluateRecommendationOutcome";

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Memory Comparison을
 * Adaptive Learning이 사용할 수 있는 Observation으로 정규화합니다.
 *
 * 이 함수는 사용자의 고정 성향을 추론하지 않습니다.
 * 특정 State·Strategy·Decision 조합 이후 관찰된 변화만 기록합니다.
 */
export function createRecommendationLearningObservation(
  params:
    CreateRecommendationLearningObservationParams,
): RecommendationLearningObservation {
  const {
    memory,
    comparison,
    observedAt,
    createObservationId,
  } = params;

  validateRecommendationEvolutionMemory({
    memory,
  });

  validateRecommendationEvolutionMemoryComparison({
    comparison,
  });

  validateRequiredTimestamp(
    observedAt,
    "observedAt",
  );

  validateObservationSourceConsistency({
    memory,
    comparison,
    observedAt,
  });

  const observationId =
    createObservationId();

  validateRequiredIdentifier(
    observationId,
    "Recommendation Learning Observation id",
  );

  const outcome =
    evaluateRecommendationLearningOutcome({
      previous:
        comparison.previous,

      current:
        comparison.current,

      comparison,
    });

  const outcomeCategory =
    resolveRecommendationLearningOutcomeCategory(
      outcome,
    );

  const previous =
    comparison.previous;

  const current =
    comparison.current;

  const observation:
    RecommendationLearningObservation = {
      version:
        1,

      id:
        observationId,

      historyId:
        memory.historyId,

      memoryId:
        memory.id,

      comparisonId:
        comparison.id,

      previousEntryId:
        previous?.id ??
        null,

      currentEntryId:
        current.id,

      previousState:
        previous?.state ??
        null,

      currentState:
        current.state,

      previousStrategyType:
        previous?.strategyType ??
        null,

      currentStrategyType:
        current.strategyType,

      previousAssessmentConfidence:
        previous?.assessmentConfidence ??
        null,

      currentAssessmentConfidence:
        current.assessmentConfidence,

      previousPrimarySignalType:
        previous?.primarySignalType ??
        null,

      currentPrimarySignalType:
        current.primarySignalType ??
        null,

      enabledRuntimeDecisionTypes: [
        ...current.enabledRuntimeDecisionTypes,
      ],

      outcome,

      outcomeCategory,

      scoreChanges: {
        ...comparison.scoreChanges,
      },

      warningCountChange:
        calculateCountChange(
          previous?.warningCount ??
            null,
          current.warningCount,
        ),

      observationCountChange:
        calculateCountChange(
          previous?.observationCount ??
            null,
          current.observationCount,
        ),

      stateChanged:
        comparison.stateChanged,

      strategyChanged:
        comparison.strategyChanged,

      confidenceChanged:
        comparison.confidenceChanged,

      primarySignalChanged:
        comparison.primarySignalChanged,

      observedAt,
    };

  validateRecommendationLearningObservation({
    observation,
  });

  validateRecommendationLearningObservationIntegrity({
    memory,
    comparison,
    observation,
  });

  return cloneRecommendationLearningObservation(
    observation,
  );
}

/* ------------------------------------------------------------------ */
/* Count Change                                                       */
/* ------------------------------------------------------------------ */

/**
 * previous가 없는 initial Observation은 변화량을 0으로 기록합니다.
 *
 * 첫 Entry의 Warning·Observation 개수를 증가량으로 해석하면
 * 이전 기준점이 없는데도 변화가 발생한 것으로 오해할 수 있기
 * 때문입니다.
 */
function calculateCountChange(
  previous:
    number | null,
  current:
    number,
): number {
  if (
    previous ===
    null
  ) {
    return 0;
  }

  return current -
    previous;
}

/* ------------------------------------------------------------------ */
/* Source Consistency Validation                                      */
/* ------------------------------------------------------------------ */

type ValidateObservationSourceConsistencyParams = {
  memory:
    CreateRecommendationLearningObservationParams["memory"];

  comparison:
    RecommendationEvolutionMemoryComparison;

  observedAt:
    string;
};

function validateObservationSourceConsistency(
  params:
    ValidateObservationSourceConsistencyParams,
): void {
  const {
    memory,
    comparison,
    observedAt,
  } = params;

  if (
    comparison.current.historyId !==
    memory.historyId
  ) {
    throw new Error(
      "Recommendation Learning Observation Comparison historyId must match Memory historyId.",
    );
  }

  if (
    comparison.previous !==
      null &&
    comparison.previous.historyId !==
      memory.historyId
  ) {
    throw new Error(
      "Previous Comparison Entry historyId must match Memory historyId.",
    );
  }

  const currentEntryExists =
    memory.entries.some(
      (
        entry,
      ) =>
        entry.id ===
        comparison.current.id,
    );

  if (
    !currentEntryExists
  ) {
    throw new Error(
      "Recommendation Learning Observation current Entry must exist in Memory.",
    );
  }

  if (
    comparison.previous !==
    null
  ) {
    const previousEntryExists =
      memory.entries.some(
        (
          entry,
        ) =>
          entry.id ===
          comparison.previous?.id,
      );

    if (
      !previousEntryExists
    ) {
      throw new Error(
        "Recommendation Learning Observation previous Entry must exist in Memory.",
      );
    }
  }

  validateTimestampOrder(
    comparison.comparedAt,
    observedAt,
    "comparison.comparedAt",
    "observedAt",
  );

  validateTimestampOrder(
    memory.updatedAt,
    observedAt,
    "memory.updatedAt",
    "observedAt",
  );
}

/* ------------------------------------------------------------------ */
/* Public Observation Validation                                      */
/* ------------------------------------------------------------------ */

/**
 * Part A에서는 Observation 자체의 기본 구조와 값 범위를 검증합니다.
 *
 * Memory·Comparison과의 세부 교차 필드 검증은 Part B에서
 * 추가로 강화합니다.
 */
export function validateRecommendationLearningObservation(
  params:
    ValidateRecommendationLearningObservationParams,
): void {
  const {
    observation,
  } = params;

  validateObservationObject(
    observation,
  );

  if (
    !isRecommendationAdaptiveLearningVersion(
      observation.version,
    )
  ) {
    throw new Error(
      "Recommendation Learning Observation version is invalid.",
    );
  }

  validateRequiredIdentifier(
    observation.id,
    "Recommendation Learning Observation id",
  );

  validateRequiredIdentifier(
    observation.historyId,
    "Recommendation Learning Observation historyId",
  );

  validateRequiredIdentifier(
    observation.memoryId,
    "Recommendation Learning Observation memoryId",
  );

  validateRequiredIdentifier(
    observation.comparisonId,
    "Recommendation Learning Observation comparisonId",
  );

  validateNullableIdentifier(
    observation.previousEntryId,
    "Recommendation Learning Observation previousEntryId",
  );

  validateRequiredIdentifier(
    observation.currentEntryId,
    "Recommendation Learning Observation currentEntryId",
  );

  validateNullableString(
    observation.previousState,
    "previousState",
  );

  validateRequiredString(
    observation.currentState,
    "currentState",
  );

  validateNullableString(
    observation.previousStrategyType,
    "previousStrategyType",
  );

  validateRequiredString(
    observation.currentStrategyType,
    "currentStrategyType",
  );

  validateNullableString(
    observation.previousAssessmentConfidence,
    "previousAssessmentConfidence",
  );

  validateRequiredString(
    observation.currentAssessmentConfidence,
    "currentAssessmentConfidence",
  );

  validateNullableString(
    observation.previousPrimarySignalType,
    "previousPrimarySignalType",
  );

  validateNullableString(
    observation.currentPrimarySignalType,
    "currentPrimarySignalType",
  );

  validateUniqueStringArray(
    observation.enabledRuntimeDecisionTypes,
    "enabledRuntimeDecisionTypes",
  );

  if (
    !isRecommendationLearningOutcomeType(
      observation.outcome,
    )
  ) {
    throw new Error(
      "Recommendation Learning Observation outcome is invalid.",
    );
  }

  if (
    !isRecommendationLearningOutcomeCategory(
      observation.outcomeCategory,
    )
  ) {
    throw new Error(
      "Recommendation Learning Observation outcomeCategory is invalid.",
    );
  }

  validateScoreChanges(
    observation.scoreChanges,
  );

  validateFiniteNumber(
    observation.warningCountChange,
    "warningCountChange",
  );

  validateFiniteNumber(
    observation.observationCountChange,
    "observationCountChange",
  );

  validateBoolean(
    observation.stateChanged,
    "stateChanged",
  );

  validateBoolean(
    observation.strategyChanged,
    "strategyChanged",
  );

  validateBoolean(
    observation.confidenceChanged,
    "confidenceChanged",
  );

  validateBoolean(
    observation.primarySignalChanged,
    "primarySignalChanged",
  );

  validateRequiredTimestamp(
    observation.observedAt,
    "observedAt",
  );

  validateOutcomeCategoryConsistency(
    observation,
  );

  validateInitialObservationConsistency(
    observation,
  );
}

/* ------------------------------------------------------------------ */
/* Observation Object Validation                                      */
/* ------------------------------------------------------------------ */

function validateObservationObject(
  observation:
    RecommendationLearningObservation,
): void {
  if (
    typeof observation !==
      "object" ||
    observation ===
      null ||
    Array.isArray(
      observation,
    )
  ) {
    throw new Error(
      "Recommendation Learning Observation must be an object.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Outcome Consistency                                                */
/* ------------------------------------------------------------------ */

function validateOutcomeCategoryConsistency(
  observation:
    RecommendationLearningObservation,
): void {
  const expectedCategory =
    resolveRecommendationLearningOutcomeCategory(
      observation.outcome,
    );

  if (
    observation.outcomeCategory !==
    expectedCategory
  ) {
    throw new Error(
      `Recommendation Learning Observation outcomeCategory ${observation.outcomeCategory} is inconsistent with outcome ${observation.outcome}.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Initial Observation Consistency                                    */
/* ------------------------------------------------------------------ */

function validateInitialObservationConsistency(
  observation:
    RecommendationLearningObservation,
): void {
  if (
    observation.previousEntryId !==
    null
  ) {
    return;
  }

  if (
    observation.previousState !==
      null ||
    observation.previousStrategyType !==
      null ||
    observation.previousAssessmentConfidence !==
      null ||
    observation.previousPrimarySignalType !==
      null
  ) {
    throw new Error(
      "Initial Recommendation Learning Observation must not contain previous Entry values.",
    );
  }

  if (
    observation.outcome !==
    "unknown"
  ) {
    throw new Error(
      "Initial Recommendation Learning Observation outcome must be unknown.",
    );
  }

  if (
    observation.warningCountChange !==
      0 ||
    observation.observationCountChange !==
      0
  ) {
    throw new Error(
      "Initial Recommendation Learning Observation count changes must be zero.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Score Change Validation                                            */
/* ------------------------------------------------------------------ */

function validateScoreChanges(
  scoreChanges:
    RecommendationLearningObservation["scoreChanges"],
): void {
  if (
    typeof scoreChanges !==
      "object" ||
    scoreChanges ===
      null ||
    Array.isArray(
      scoreChanges,
    )
  ) {
    throw new Error(
      "Recommendation Learning Observation scoreChanges must be an object.",
    );
  }

  validateScoreChange(
    scoreChanges.stability,
    "scoreChanges.stability",
  );

  validateScoreChange(
    scoreChanges.progress,
    "scoreChanges.progress",
  );

  validateScoreChange(
    scoreChanges.repetitionRisk,
    "scoreChanges.repetitionRisk",
  );

  validateScoreChange(
    scoreChanges.redirectionRisk,
    "scoreChanges.redirectionRisk",
  );

  validateScoreChange(
    scoreChanges.completionMomentum,
    "scoreChanges.completionMomentum",
  );
}

function validateScoreChange(
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
      -1 ||
    value >
      1
  ) {
    throw new Error(
      `${fieldName} must be between -1 and 1.`,
    );
  }
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

function validateFiniteNumber(
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
}

function validateBoolean(
  value:
    unknown,
  fieldName:
    string,
): asserts value is boolean {
  if (
    typeof value !==
    "boolean"
  ) {
    throw new Error(
      `${fieldName} must be a boolean.`,
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
          `${fieldName} must not contain duplicate values: ${value}.`,
        );
      }

      observed.add(
        value,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Timestamp Validation                                               */
/* ------------------------------------------------------------------ */

function validateRequiredTimestamp(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string {
  validateRequiredString(
    value,
    fieldName,
  );

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

  return parsed;
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

/* ------------------------------------------------------------------ */
/* Part B — Cross-source Integrity Validation                         */
/* ------------------------------------------------------------------ */

export type ValidateRecommendationLearningObservationIntegrityParams = {
  memory:
    CreateRecommendationLearningObservationParams["memory"];

  comparison:
    RecommendationEvolutionMemoryComparison;

  observation:
    RecommendationLearningObservation;
};

/**
 * 생성된 Observation이 원본 Memory 및 Comparison과 정확하게
 * 일치하는지 교차 검증합니다.
 *
 * Part A의 기본 Validation이 Observation 자체의 구조를 확인한다면,
 * 이 함수는 Observation이 출처 데이터를 왜곡하거나 누락하지
 * 않았는지를 검증합니다.
 */
export function validateRecommendationLearningObservationIntegrity(
  params:
    ValidateRecommendationLearningObservationIntegrityParams,
): void {
  const {
    memory,
    comparison,
    observation,
  } = params;

  validateRecommendationEvolutionMemory({
    memory,
  });

  validateRecommendationEvolutionMemoryComparison({
    comparison,
  });

  validateRecommendationLearningObservation({
    observation,
  });

  validateObservationIdentityConsistency({
    memory,
    comparison,
    observation,
  });

  validateObservationEntryReferenceConsistency({
    memory,
    comparison,
    observation,
  });

  validateObservationStateConsistency({
    comparison,
    observation,
  });

  validateObservationStrategyConsistency({
    comparison,
    observation,
  });

  validateObservationConfidenceConsistency({
    comparison,
    observation,
  });

  validateObservationSignalConsistency({
    comparison,
    observation,
  });

  validateObservationRuntimeDecisionConsistency({
    comparison,
    observation,
  });

  validateObservationScoreChangeConsistency({
    comparison,
    observation,
  });

  validateObservationCountChangeConsistency({
    comparison,
    observation,
  });

  validateObservationChangeFlagConsistency({
    comparison,
    observation,
  });

  validateObservationOutcomeConsistency({
    comparison,
    observation,
  });

  validateObservationChronologyConsistency({
    memory,
    comparison,
    observation,
  });
}

/* ------------------------------------------------------------------ */
/* Identity Consistency                                               */
/* ------------------------------------------------------------------ */

type ValidateObservationIdentityConsistencyParams = {
  memory:
    CreateRecommendationLearningObservationParams["memory"];

  comparison:
    RecommendationEvolutionMemoryComparison;

  observation:
    RecommendationLearningObservation;
};

function validateObservationIdentityConsistency(
  params:
    ValidateObservationIdentityConsistencyParams,
): void {
  const {
    memory,
    comparison,
    observation,
  } = params;

  if (
    observation.memoryId !==
    memory.id
  ) {
    throw new Error(
      "Recommendation Learning Observation memoryId must match source Memory id.",
    );
  }

  if (
    observation.historyId !==
    memory.historyId
  ) {
    throw new Error(
      "Recommendation Learning Observation historyId must match source Memory historyId.",
    );
  }

  if (
    observation.comparisonId !==
    comparison.id
  ) {
    throw new Error(
      "Recommendation Learning Observation comparisonId must match source Comparison id.",
    );
  }

  if (
    comparison.current.historyId !==
    observation.historyId
  ) {
    throw new Error(
      "Recommendation Learning Observation historyId must match current Entry historyId.",
    );
  }

  if (
    comparison.previous !==
      null &&
    comparison.previous.historyId !==
      observation.historyId
  ) {
    throw new Error(
      "Recommendation Learning Observation historyId must match previous Entry historyId.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Entry Reference Consistency                                        */
/* ------------------------------------------------------------------ */

type ValidateObservationEntryReferenceConsistencyParams = {
  memory:
    CreateRecommendationLearningObservationParams["memory"];

  comparison:
    RecommendationEvolutionMemoryComparison;

  observation:
    RecommendationLearningObservation;
};

function validateObservationEntryReferenceConsistency(
  params:
    ValidateObservationEntryReferenceConsistencyParams,
): void {
  const {
    memory,
    comparison,
    observation,
  } = params;

  const expectedPreviousEntryId =
    comparison.previous?.id ??
    null;

  if (
    observation.previousEntryId !==
    expectedPreviousEntryId
  ) {
    throw new Error(
      "Recommendation Learning Observation previousEntryId must match Comparison previous Entry.",
    );
  }

  if (
    observation.currentEntryId !==
    comparison.current.id
  ) {
    throw new Error(
      "Recommendation Learning Observation currentEntryId must match Comparison current Entry.",
    );
  }

  const currentEntryIndex =
    memory.entries.findIndex(
      (
        entry,
      ) =>
        entry.id ===
        observation.currentEntryId,
    );

  if (
    currentEntryIndex ===
    -1
  ) {
    throw new Error(
      "Recommendation Learning Observation current Entry must exist in source Memory.",
    );
  }

  if (
    observation.previousEntryId ===
    null
  ) {
    if (
      comparison.previous !==
      null
    ) {
      throw new Error(
        "Recommendation Learning Observation previous Entry reference is inconsistent.",
      );
    }

    return;
  }

  const previousEntryIndex =
    memory.entries.findIndex(
      (
        entry,
      ) =>
        entry.id ===
        observation.previousEntryId,
    );

  if (
    previousEntryIndex ===
    -1
  ) {
    throw new Error(
      "Recommendation Learning Observation previous Entry must exist in source Memory.",
    );
  }

  if (
    previousEntryIndex >=
    currentEntryIndex
  ) {
    throw new Error(
      "Recommendation Learning Observation previous Entry must precede current Entry in Memory.",
    );
  }

  if (
    currentEntryIndex -
      previousEntryIndex !==
    1
  ) {
    throw new Error(
      "Recommendation Learning Observation Entries must be consecutive in source Memory.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* State Consistency                                                  */
/* ------------------------------------------------------------------ */

type ValidateObservationComparisonConsistencyParams = {
  comparison:
    RecommendationEvolutionMemoryComparison;

  observation:
    RecommendationLearningObservation;
};

function validateObservationStateConsistency(
  params:
    ValidateObservationComparisonConsistencyParams,
): void {
  const {
    comparison,
    observation,
  } = params;

  const expectedPreviousState =
    comparison.previous?.state ??
    null;

  if (
    observation.previousState !==
    expectedPreviousState
  ) {
    throw new Error(
      "Recommendation Learning Observation previousState must match Comparison previous Entry state.",
    );
  }

  if (
    observation.currentState !==
    comparison.current.state
  ) {
    throw new Error(
      "Recommendation Learning Observation currentState must match Comparison current Entry state.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Strategy Consistency                                               */
/* ------------------------------------------------------------------ */

function validateObservationStrategyConsistency(
  params:
    ValidateObservationComparisonConsistencyParams,
): void {
  const {
    comparison,
    observation,
  } = params;

  const expectedPreviousStrategyType =
    comparison.previous?.strategyType ??
    null;

  if (
    observation.previousStrategyType !==
    expectedPreviousStrategyType
  ) {
    throw new Error(
      "Recommendation Learning Observation previousStrategyType must match Comparison previous Entry strategyType.",
    );
  }

  if (
    observation.currentStrategyType !==
    comparison.current.strategyType
  ) {
    throw new Error(
      "Recommendation Learning Observation currentStrategyType must match Comparison current Entry strategyType.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Confidence Consistency                                             */
/* ------------------------------------------------------------------ */

function validateObservationConfidenceConsistency(
  params:
    ValidateObservationComparisonConsistencyParams,
): void {
  const {
    comparison,
    observation,
  } = params;

  const expectedPreviousConfidence =
    comparison.previous?.assessmentConfidence ??
    null;

  if (
    observation.previousAssessmentConfidence !==
    expectedPreviousConfidence
  ) {
    throw new Error(
      "Recommendation Learning Observation previousAssessmentConfidence must match Comparison previous Entry.",
    );
  }

  if (
    observation.currentAssessmentConfidence !==
    comparison.current.assessmentConfidence
  ) {
    throw new Error(
      "Recommendation Learning Observation currentAssessmentConfidence must match Comparison current Entry.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Signal Consistency                                                 */
/* ------------------------------------------------------------------ */

function validateObservationSignalConsistency(
  params:
    ValidateObservationComparisonConsistencyParams,
): void {
  const {
    comparison,
    observation,
  } = params;

  const expectedPreviousPrimarySignalType =
    comparison.previous?.primarySignalType ??
    null;

  const expectedCurrentPrimarySignalType =
    comparison.current.primarySignalType ??
    null;

  if (
    observation.previousPrimarySignalType !==
    expectedPreviousPrimarySignalType
  ) {
    throw new Error(
      "Recommendation Learning Observation previousPrimarySignalType must match Comparison previous Entry.",
    );
  }

  if (
    observation.currentPrimarySignalType !==
    expectedCurrentPrimarySignalType
  ) {
    throw new Error(
      "Recommendation Learning Observation currentPrimarySignalType must match Comparison current Entry.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Consistency                                       */
/* ------------------------------------------------------------------ */

function validateObservationRuntimeDecisionConsistency(
  params:
    ValidateObservationComparisonConsistencyParams,
): void {
  const {
    comparison,
    observation,
  } = params;

  if (
    !areStringArraysEqual(
      observation.enabledRuntimeDecisionTypes,
      comparison.current.enabledRuntimeDecisionTypes,
    )
  ) {
    throw new Error(
      "Recommendation Learning Observation enabledRuntimeDecisionTypes must match Comparison current Entry.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Score Change Consistency                                           */
/* ------------------------------------------------------------------ */

function validateObservationScoreChangeConsistency(
  params:
    ValidateObservationComparisonConsistencyParams,
): void {
  const {
    comparison,
    observation,
  } = params;

  validateEquivalentNumber(
    observation.scoreChanges.stability,
    comparison.scoreChanges.stability,
    "scoreChanges.stability",
  );

  validateEquivalentNumber(
    observation.scoreChanges.progress,
    comparison.scoreChanges.progress,
    "scoreChanges.progress",
  );

  validateEquivalentNumber(
    observation.scoreChanges.repetitionRisk,
    comparison.scoreChanges.repetitionRisk,
    "scoreChanges.repetitionRisk",
  );

  validateEquivalentNumber(
    observation.scoreChanges.redirectionRisk,
    comparison.scoreChanges.redirectionRisk,
    "scoreChanges.redirectionRisk",
  );

  validateEquivalentNumber(
    observation.scoreChanges.completionMomentum,
    comparison.scoreChanges.completionMomentum,
    "scoreChanges.completionMomentum",
  );
}

/* ------------------------------------------------------------------ */
/* Count Change Consistency                                           */
/* ------------------------------------------------------------------ */

function validateObservationCountChangeConsistency(
  params:
    ValidateObservationComparisonConsistencyParams,
): void {
  const {
    comparison,
    observation,
  } = params;

  const expectedWarningCountChange =
    calculateCountChange(
      comparison.previous?.warningCount ??
        null,
      comparison.current.warningCount,
    );

  const expectedObservationCountChange =
    calculateCountChange(
      comparison.previous?.observationCount ??
        null,
      comparison.current.observationCount,
    );

  if (
    observation.warningCountChange !==
    expectedWarningCountChange
  ) {
    throw new Error(
      "Recommendation Learning Observation warningCountChange is inconsistent with Comparison Entries.",
    );
  }

  if (
    observation.observationCountChange !==
    expectedObservationCountChange
  ) {
    throw new Error(
      "Recommendation Learning Observation observationCountChange is inconsistent with Comparison Entries.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Change Flag Consistency                                            */
/* ------------------------------------------------------------------ */

function validateObservationChangeFlagConsistency(
  params:
    ValidateObservationComparisonConsistencyParams,
): void {
  const {
    comparison,
    observation,
  } = params;

  if (
    observation.stateChanged !==
    comparison.stateChanged
  ) {
    throw new Error(
      "Recommendation Learning Observation stateChanged must match Comparison.",
    );
  }

  if (
    observation.strategyChanged !==
    comparison.strategyChanged
  ) {
    throw new Error(
      "Recommendation Learning Observation strategyChanged must match Comparison.",
    );
  }

  if (
    observation.confidenceChanged !==
    comparison.confidenceChanged
  ) {
    throw new Error(
      "Recommendation Learning Observation confidenceChanged must match Comparison.",
    );
  }

  if (
    observation.primarySignalChanged !==
    comparison.primarySignalChanged
  ) {
    throw new Error(
      "Recommendation Learning Observation primarySignalChanged must match Comparison.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Outcome Consistency                                                */
/* ------------------------------------------------------------------ */

function validateObservationOutcomeConsistency(
  params:
    ValidateObservationComparisonConsistencyParams,
): void {
  const {
    comparison,
    observation,
  } = params;

  const expectedOutcome =
    evaluateRecommendationLearningOutcome({
      previous:
        comparison.previous,

      current:
        comparison.current,

      comparison,
    });

  if (
    observation.outcome !==
    expectedOutcome
  ) {
    throw new Error(
      `Recommendation Learning Observation outcome ${observation.outcome} must match evaluated outcome ${expectedOutcome}.`,
    );
  }

  const expectedCategory =
    resolveRecommendationLearningOutcomeCategory(
      expectedOutcome,
    );

  if (
    observation.outcomeCategory !==
    expectedCategory
  ) {
    throw new Error(
      `Recommendation Learning Observation outcomeCategory ${observation.outcomeCategory} must match expected category ${expectedCategory}.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Chronology Consistency                                             */
/* ------------------------------------------------------------------ */

type ValidateObservationChronologyConsistencyParams = {
  memory:
    CreateRecommendationLearningObservationParams["memory"];

  comparison:
    RecommendationEvolutionMemoryComparison;

  observation:
    RecommendationLearningObservation;
};

function validateObservationChronologyConsistency(
  params:
    ValidateObservationChronologyConsistencyParams,
): void {
  const {
    memory,
    comparison,
    observation,
  } = params;

  validateTimestampOrder(
    comparison.comparedAt,
    observation.observedAt,
    "comparison.comparedAt",
    "observation.observedAt",
  );

  validateTimestampOrder(
    memory.updatedAt,
    observation.observedAt,
    "memory.updatedAt",
    "observation.observedAt",
  );
}

/* ------------------------------------------------------------------ */
/* Defensive Clone                                                    */
/* ------------------------------------------------------------------ */

/**
 * Observation의 배열 및 중첩 객체를 새 참조로 복제합니다.
 *
 * 호출자가 반환된 Observation을 변경해도 source Comparison과
 * 내부 생성 객체가 함께 변경되지 않도록 합니다.
 */
export function cloneRecommendationLearningObservation(
  observation:
    RecommendationLearningObservation,
): RecommendationLearningObservation {
  validateRecommendationLearningObservation({
    observation,
  });

  return {
    ...observation,

    enabledRuntimeDecisionTypes: [
      ...observation.enabledRuntimeDecisionTypes,
    ],

    scoreChanges: {
      ...observation.scoreChanges,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Observation Query Params                                           */
/* ------------------------------------------------------------------ */

export type FindRecommendationLearningObservationByIdParams = {
  observations:
    readonly RecommendationLearningObservation[];

  observationId:
    string;
};

export type FindRecommendationLearningObservationByComparisonIdParams = {
  observations:
    readonly RecommendationLearningObservation[];

  comparisonId:
    string;
};

export type FindRecommendationLearningObservationByCurrentEntryIdParams = {
  observations:
    readonly RecommendationLearningObservation[];

  currentEntryId:
    string;
};

export type FindRecommendationLearningObservationsByOutcomeParams = {
  observations:
    readonly RecommendationLearningObservation[];

  outcome:
    RecommendationLearningOutcomeType;
};

export type SortRecommendationLearningObservationsParams = {
  observations:
    readonly RecommendationLearningObservation[];
};

export type FindLatestRecommendationLearningObservationParams = {
  observations:
    readonly RecommendationLearningObservation[];
};

/* ------------------------------------------------------------------ */
/* Observation Query Helpers                                          */
/* ------------------------------------------------------------------ */

export function findRecommendationLearningObservationById(
  params:
    FindRecommendationLearningObservationByIdParams,
): RecommendationLearningObservation | null {
  const {
    observations,
    observationId,
  } = params;

  validateRequiredIdentifier(
    observationId,
    "observationId",
  );

  const observation =
    observations.find(
      (
        candidate,
      ) =>
        candidate.id ===
        observationId,
    );

  return observation ===
    undefined
    ? null
    : cloneRecommendationLearningObservation(
        observation,
      );
}

export function findRecommendationLearningObservationByComparisonId(
  params:
    FindRecommendationLearningObservationByComparisonIdParams,
): RecommendationLearningObservation | null {
  const {
    observations,
    comparisonId,
  } = params;

  validateRequiredIdentifier(
    comparisonId,
    "comparisonId",
  );

  const observation =
    observations.find(
      (
        candidate,
      ) =>
        candidate.comparisonId ===
        comparisonId,
    );

  return observation ===
    undefined
    ? null
    : cloneRecommendationLearningObservation(
        observation,
      );
}

export function findRecommendationLearningObservationByCurrentEntryId(
  params:
    FindRecommendationLearningObservationByCurrentEntryIdParams,
): RecommendationLearningObservation | null {
  const {
    observations,
    currentEntryId,
  } = params;

  validateRequiredIdentifier(
    currentEntryId,
    "currentEntryId",
  );

  const observation =
    observations.find(
      (
        candidate,
      ) =>
        candidate.currentEntryId ===
        currentEntryId,
    );

  return observation ===
    undefined
    ? null
    : cloneRecommendationLearningObservation(
        observation,
      );
}

export function findRecommendationLearningObservationsByOutcome(
  params:
    FindRecommendationLearningObservationsByOutcomeParams,
): RecommendationLearningObservation[] {
  const {
    observations,
    outcome,
  } = params;

  if (
    !isRecommendationLearningOutcomeType(
      outcome,
    )
  ) {
    throw new Error(
      "Recommendation Learning Observation query outcome is invalid.",
    );
  }

  return observations
    .filter(
      (
        observation,
      ) =>
        observation.outcome ===
        outcome,
    )
    .map(
      cloneRecommendationLearningObservation,
    );
}

/**
 * observedAt 오름차순으로 정렬합니다.
 *
 * 원본 배열은 변경하지 않습니다.
 * Timestamp가 동일하면 id를 이용해 결정적인 순서를 만듭니다.
 */
export function sortRecommendationLearningObservations(
  params:
    SortRecommendationLearningObservationsParams,
): RecommendationLearningObservation[] {
  const {
    observations,
  } = params;

  validateRecommendationLearningObservationArray(
    observations,
  );

  return observations
    .map(
      cloneRecommendationLearningObservation,
    )
    .sort(
      (
        left,
        right,
      ) => {
        const leftTimestamp =
          parseTimestamp(
            left.observedAt,
            "left.observedAt",
          );

        const rightTimestamp =
          parseTimestamp(
            right.observedAt,
            "right.observedAt",
          );

        if (
          leftTimestamp !==
          rightTimestamp
        ) {
          return leftTimestamp -
            rightTimestamp;
        }

        return left.id.localeCompare(
          right.id,
        );
      },
    );
}

export function findLatestRecommendationLearningObservation(
  params:
    FindLatestRecommendationLearningObservationParams,
): RecommendationLearningObservation | null {
  const sorted =
    sortRecommendationLearningObservations({
      observations:
        params.observations,
    });

  const latest =
    sorted.length >
    0
      ? sorted[
          sorted.length -
            1
        ]
      : undefined;

    return latest ??
        null;
    }

/* ------------------------------------------------------------------ */
/* Observation Array Validation                                       */
/* ------------------------------------------------------------------ */

export function validateRecommendationLearningObservationArray(
  observations:
    readonly RecommendationLearningObservation[],
): void {
  if (
    !Array.isArray(
      observations,
    )
  ) {
    throw new Error(
      "Recommendation Learning Observations must be an array.",
    );
  }

  const observedIds =
    new Set<string>();

  const observedComparisonIds =
    new Set<string>();

  const observedCurrentEntryIds =
    new Set<string>();

  observations.forEach(
    (
      observation,
      index,
    ) => {
      validateRecommendationLearningObservation({
        observation,
      });

      if (
        observedIds.has(
          observation.id,
        )
      ) {
        throw new Error(
          `Recommendation Learning Observations must not contain duplicate id at index ${index}: ${observation.id}.`,
        );
      }

      if (
        observedComparisonIds.has(
          observation.comparisonId,
        )
      ) {
        throw new Error(
          `Recommendation Learning Observations must not contain duplicate comparisonId at index ${index}: ${observation.comparisonId}.`,
        );
      }

      if (
        observedCurrentEntryIds.has(
          observation.currentEntryId,
        )
      ) {
        throw new Error(
          `Recommendation Learning Observations must not contain duplicate currentEntryId at index ${index}: ${observation.currentEntryId}.`,
        );
      }

      observedIds.add(
        observation.id,
      );

      observedComparisonIds.add(
        observation.comparisonId,
      );

      observedCurrentEntryIds.add(
        observation.currentEntryId,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Part B Generic Helpers                                             */
/* ------------------------------------------------------------------ */

const NUMBER_EQUALITY_TOLERANCE =
  1e-10;

function validateEquivalentNumber(
  actual:
    number,
  expected:
    number,
  fieldName:
    string,
): void {
  validateFiniteNumber(
    actual,
    fieldName,
  );

  validateFiniteNumber(
    expected,
    `expected ${fieldName}`,
  );

  if (
    Math.abs(
      actual -
        expected,
    ) >
    NUMBER_EQUALITY_TOLERANCE
  ) {
    throw new Error(
      `Recommendation Learning Observation ${fieldName} must match source Comparison.`,
    );
  }
}

function areStringArraysEqual(
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

  return left.every(
    (
      value,
      index,
    ) =>
      value ===
      right[index],
  );
}

/* ------------------------------------------------------------------ */
/* Part C — Observation Collection                                    */
/* ------------------------------------------------------------------ */

export type CreateRecommendationLearningObservationsParams = {
  memory:
    CreateRecommendationLearningObservationParams["memory"];

  comparisons:
    readonly RecommendationEvolutionMemoryComparison[];

  observedAt:
    string;

  createObservationId:
    (
      comparison:
        RecommendationEvolutionMemoryComparison,
      index:
        number,
    ) => string;
};

/**
 * 여러 Memory Comparison을 시간순으로 정렬한 뒤
 * Recommendation Learning Observation 배열로 변환합니다.
 *
 * 입력 comparisons 배열은 변경하지 않습니다.
 */
export function createRecommendationLearningObservations(
  params:
    CreateRecommendationLearningObservationsParams,
): RecommendationLearningObservation[] {
  const {
    memory,
    comparisons,
    observedAt,
    createObservationId,
  } = params;

  validateRecommendationEvolutionMemory({
    memory,
  });

  validateRequiredTimestamp(
    observedAt,
    "observedAt",
  );

  validateRecommendationEvolutionMemoryComparisonArray(
    comparisons,
  );

  const sortedComparisons =
    sortRecommendationEvolutionMemoryComparisons(
      comparisons,
    );

  const observations =
    sortedComparisons.map(
      (
        comparison,
        index,
      ) =>
        createRecommendationLearningObservation({
          memory,

          comparison,

          observedAt,

          createObservationId:
            () =>
              createObservationId(
                comparison,
                index,
              ),
        }),
    );

  validateRecommendationLearningObservationSequence({
    memory,
    comparisons:
      sortedComparisons,
    observations,
  });

  return cloneRecommendationLearningObservations(
    observations,
  );
}

/* ------------------------------------------------------------------ */
/* Collection Clone                                                   */
/* ------------------------------------------------------------------ */

export function cloneRecommendationLearningObservations(
  observations:
    readonly RecommendationLearningObservation[],
): RecommendationLearningObservation[] {
  validateRecommendationLearningObservationArray(
    observations,
  );

  return observations.map(
    cloneRecommendationLearningObservation,
  );
}

/* ------------------------------------------------------------------ */
/* Comparison Array Validation                                        */
/* ------------------------------------------------------------------ */

function validateRecommendationEvolutionMemoryComparisonArray(
  comparisons:
    readonly RecommendationEvolutionMemoryComparison[],
): void {
  if (
    !Array.isArray(
      comparisons,
    )
  ) {
    throw new Error(
      "Recommendation Evolution Memory Comparisons must be an array.",
    );
  }

  const observedComparisonIds =
    new Set<string>();

  const observedCurrentEntryIds =
    new Set<string>();

  comparisons.forEach(
    (
      comparison,
      index,
    ) => {
      validateRecommendationEvolutionMemoryComparison({
        comparison,
      });

      if (
        observedComparisonIds.has(
          comparison.id,
        )
      ) {
        throw new Error(
          `Recommendation Evolution Memory Comparisons must not contain duplicate id at index ${index}: ${comparison.id}.`,
        );
      }

      if (
        observedCurrentEntryIds.has(
          comparison.current.id,
        )
      ) {
        throw new Error(
          `Recommendation Evolution Memory Comparisons must not contain duplicate current Entry id at index ${index}: ${comparison.current.id}.`,
        );
      }

      observedComparisonIds.add(
        comparison.id,
      );

      observedCurrentEntryIds.add(
        comparison.current.id,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Comparison Sorting                                                 */
/* ------------------------------------------------------------------ */

function sortRecommendationEvolutionMemoryComparisons(
  comparisons:
    readonly RecommendationEvolutionMemoryComparison[],
): RecommendationEvolutionMemoryComparison[] {
  return [
    ...comparisons,
  ].sort(
    (
      left,
      right,
    ) => {
      const leftTimestamp =
        parseTimestamp(
          left.comparedAt,
          "left.comparedAt",
        );

      const rightTimestamp =
        parseTimestamp(
          right.comparedAt,
          "right.comparedAt",
        );

      if (
        leftTimestamp !==
        rightTimestamp
      ) {
        return leftTimestamp -
          rightTimestamp;
      }

      return left.id.localeCompare(
        right.id,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Sequence Validation Params                                         */
/* ------------------------------------------------------------------ */

export type ValidateRecommendationLearningObservationSequenceParams = {
  memory:
    CreateRecommendationLearningObservationParams["memory"];

  comparisons:
    readonly RecommendationEvolutionMemoryComparison[];

  observations:
    readonly RecommendationLearningObservation[];
};

/**
 * Observation 배열이 Memory 및 Comparison 배열과 완전한
 * 일대일 대응 관계를 가지는지 검증합니다.
 *
 * 검증 대상:
 *
 * - Comparison 수와 Observation 수
 * - Comparison ↔ Observation 일대일 대응
 * - Memory Entry 순서
 * - 이전·현재 Entry 연결
 * - Observation 시간 순서
 * - History 및 Memory 일관성
 */
export function validateRecommendationLearningObservationSequence(
  params:
    ValidateRecommendationLearningObservationSequenceParams,
): void {
  const {
    memory,
    comparisons,
    observations,
  } = params;

  validateRecommendationEvolutionMemory({
    memory,
  });

  validateRecommendationEvolutionMemoryComparisonArray(
    comparisons,
  );

  validateRecommendationLearningObservationArray(
    observations,
  );

  if (
    comparisons.length !==
    observations.length
  ) {
    throw new Error(
      "Recommendation Learning Observation count must match Comparison count.",
    );
  }

  const comparisonById =
    new Map<
      string,
      RecommendationEvolutionMemoryComparison
    >();

  comparisons.forEach(
    (
      comparison,
    ) => {
      comparisonById.set(
        comparison.id,
        comparison,
      );
    },
  );

  observations.forEach(
    (
      observation,
    ) => {
      const comparison =
        comparisonById.get(
          observation.comparisonId,
        );

      if (
        comparison ===
        undefined
      ) {
        throw new Error(
          `Recommendation Learning Observation comparisonId does not exist in source Comparisons: ${observation.comparisonId}.`,
        );
      }

      validateRecommendationLearningObservationIntegrity({
        memory,
        comparison,
        observation,
      });
    },
  );

  validateObservationMemoryCoverage({
    memory,
    observations,
  });

  validateObservationSequenceOrdering({
    memory,
    observations,
  });

  validateObservationChainContinuity({
    observations,
  });
}

/* ------------------------------------------------------------------ */
/* Memory Coverage                                                    */
/* ------------------------------------------------------------------ */

type ValidateObservationMemoryCoverageParams = {
  memory:
    CreateRecommendationLearningObservationParams["memory"];

  observations:
    readonly RecommendationLearningObservation[];
};

function validateObservationMemoryCoverage(
  params:
    ValidateObservationMemoryCoverageParams,
): void {
  const {
    memory,
    observations,
  } = params;

  observations.forEach(
    (
      observation,
    ) => {
      if (
        observation.memoryId !==
        memory.id
      ) {
        throw new Error(
          "Every Recommendation Learning Observation must reference the same Memory.",
        );
      }

      if (
        observation.historyId !==
        memory.historyId
      ) {
        throw new Error(
          "Every Recommendation Learning Observation must reference the same historyId.",
        );
      }

      const currentEntryExists =
        memory.entries.some(
          (
            entry,
          ) =>
            entry.id ===
            observation.currentEntryId,
        );

      if (
        !currentEntryExists
      ) {
        throw new Error(
          `Recommendation Learning Observation current Entry does not exist in Memory: ${observation.currentEntryId}.`,
        );
      }

      if (
        observation.previousEntryId ===
        null
      ) {
        return;
      }

      const previousEntryExists =
        memory.entries.some(
          (
            entry,
          ) =>
            entry.id ===
            observation.previousEntryId,
        );

      if (
        !previousEntryExists
      ) {
        throw new Error(
          `Recommendation Learning Observation previous Entry does not exist in Memory: ${observation.previousEntryId}.`,
        );
      }
    },
  );
}

/* ------------------------------------------------------------------ */
/* Sequence Ordering                                                  */
/* ------------------------------------------------------------------ */

type ValidateObservationSequenceOrderingParams = {
  memory:
    CreateRecommendationLearningObservationParams["memory"];

  observations:
    readonly RecommendationLearningObservation[];
};

function validateObservationSequenceOrdering(
  params:
    ValidateObservationSequenceOrderingParams,
): void {
  const {
    memory,
    observations,
  } = params;

  const memoryEntryIndexById =
    new Map<
      string,
      number
    >();

  memory.entries.forEach(
    (
      entry,
      index,
    ) => {
      memoryEntryIndexById.set(
        entry.id,
        index,
      );
    },
  );

  let previousObservedAt:
    number | null =
      null;

  let previousCurrentEntryIndex:
    number | null =
      null;

  observations.forEach(
    (
      observation,
      index,
    ) => {
      const observedAt =
        parseTimestamp(
          observation.observedAt,
          `observations[${index}].observedAt`,
        );

      if (
        previousObservedAt !==
          null &&
        observedAt <
          previousObservedAt
      ) {
        throw new Error(
          "Recommendation Learning Observations must be ordered by observedAt.",
        );
      }

      const currentEntryIndex =
        memoryEntryIndexById.get(
          observation.currentEntryId,
        );

      if (
        currentEntryIndex ===
        undefined
      ) {
        throw new Error(
          `Recommendation Learning Observation current Entry index could not be resolved: ${observation.currentEntryId}.`,
        );
      }

      if (
        previousCurrentEntryIndex !==
          null &&
        currentEntryIndex <=
          previousCurrentEntryIndex
      ) {
        throw new Error(
          "Recommendation Learning Observations must follow Memory Entry order.",
        );
      }

      previousObservedAt =
        observedAt;

      previousCurrentEntryIndex =
        currentEntryIndex;
    },
  );
}

/* ------------------------------------------------------------------ */
/* Chain Continuity                                                   */
/* ------------------------------------------------------------------ */

/**
 * 연속 Observation 사이에서 앞 Observation의 current Entry가
 * 다음 Observation의 previous Entry가 되는지 검증합니다.
 *
 * 첫 번째 Observation이 반드시 initial일 필요는 없습니다.
 * 일부 Comparison 구간만 전달할 수 있기 때문입니다.
 */
function validateObservationChainContinuity(
  params: {
    observations:
      readonly RecommendationLearningObservation[];
  },
): void {
  const {
    observations,
  } = params;

  for (
    let index =
      1;
    index <
    observations.length;
    index +=
      1
  ) {
    const previousObservation =
      observations[
        index -
          1
      ];

    const currentObservation =
      observations[
        index
      ];

    if (
      previousObservation ===
        undefined ||
      currentObservation ===
        undefined
    ) {
      throw new Error(
        "Recommendation Learning Observation sequence contains an unresolved item.",
      );
    }

    if (
      currentObservation.previousEntryId !==
      previousObservation.currentEntryId
    ) {
      throw new Error(
        `Recommendation Learning Observation chain is disconnected between index ${index - 1} and ${index}.`,
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Outcome Count Aggregation                                          */
/* ------------------------------------------------------------------ */

export function countRecommendationLearningOutcomes(
  observations:
    readonly RecommendationLearningObservation[],
): RecommendationLearningOutcomeCounts {
  validateRecommendationLearningObservationArray(
    observations,
  );

  const counts:
    RecommendationLearningOutcomeCounts = {
      unknown:
        0,

      maintained:
        0,

      improved:
        0,

      advanced:
        0,

      completed:
        0,

      stalled:
        0,

      fragmented:
        0,

      regressed:
        0,

      recovered:
        0,

      redirected:
        0,
    };

  observations.forEach(
    (
      observation,
    ) => {
      counts[
        observation.outcome
      ] +=
        1;
    },
  );

  return counts;
}

/* ------------------------------------------------------------------ */
/* Category Count                                                     */
/* ------------------------------------------------------------------ */

export type RecommendationLearningOutcomeCategoryCounts = {
  unknown:
    number;

  positive:
    number;

  neutral:
    number;

  negative:
    number;

  ambiguous:
    number;
};

export function countRecommendationLearningOutcomeCategories(
  observations:
    readonly RecommendationLearningObservation[],
): RecommendationLearningOutcomeCategoryCounts {
  validateRecommendationLearningObservationArray(
    observations,
  );

  const counts:
    RecommendationLearningOutcomeCategoryCounts = {
      unknown:
        0,

      positive:
        0,

      neutral:
        0,

      negative:
        0,

      ambiguous:
        0,
    };

  observations.forEach(
    (
      observation,
    ) => {
      counts[
        observation.outcomeCategory
      ] +=
        1;
    },
  );

  return counts;
}

/* ------------------------------------------------------------------ */
/* Additional Query Params                                            */
/* ------------------------------------------------------------------ */

export type FindRecommendationLearningObservationsByCategoryParams = {
  observations:
    readonly RecommendationLearningObservation[];

  category:
    RecommendationLearningOutcomeCategory;
};

export type FindRecommendationLearningObservationsByStateParams = {
  observations:
    readonly RecommendationLearningObservation[];

  state:
    RecommendationAdaptiveLearningEntryState;
};

export type FindRecommendationLearningObservationsByStrategyParams = {
  observations:
    readonly RecommendationLearningObservation[];

  strategyType:
    RecommendationAdaptiveLearningStrategyType;
};

export type FindRecommendationLearningObservationsByRuntimeDecisionParams = {
  observations:
    readonly RecommendationLearningObservation[];

  decisionType:
    RecommendationAdaptiveLearningRuntimeDecisionType;
};

/* ------------------------------------------------------------------ */
/* Category Query                                                     */
/* ------------------------------------------------------------------ */

export function findRecommendationLearningObservationsByCategory(
  params:
    FindRecommendationLearningObservationsByCategoryParams,
): RecommendationLearningObservation[] {
  const {
    observations,
    category,
  } = params;

  validateRecommendationLearningObservationArray(
    observations,
  );

  if (
    !isRecommendationLearningOutcomeCategory(
      category,
    )
  ) {
    throw new Error(
      "Recommendation Learning Observation query category is invalid.",
    );
  }

  return observations
    .filter(
      (
        observation,
      ) =>
        observation.outcomeCategory ===
        category,
    )
    .map(
      cloneRecommendationLearningObservation,
    );
}

/* ------------------------------------------------------------------ */
/* State Query                                                        */
/* ------------------------------------------------------------------ */

export function findRecommendationLearningObservationsByState(
  params:
    FindRecommendationLearningObservationsByStateParams,
): RecommendationLearningObservation[] {
  const {
    observations,
    state,
  } = params;

  validateRecommendationLearningObservationArray(
    observations,
  );

  validateRequiredString(
    state,
    "state",
  );

  return observations
    .filter(
      (
        observation,
      ) =>
        observation.currentState ===
        state,
    )
    .map(
      cloneRecommendationLearningObservation,
    );
}

/* ------------------------------------------------------------------ */
/* Strategy Query                                                     */
/* ------------------------------------------------------------------ */

export function findRecommendationLearningObservationsByStrategy(
  params:
    FindRecommendationLearningObservationsByStrategyParams,
): RecommendationLearningObservation[] {
  const {
    observations,
    strategyType,
  } = params;

  validateRecommendationLearningObservationArray(
    observations,
  );

  validateRequiredString(
    strategyType,
    "strategyType",
  );

  return observations
    .filter(
      (
        observation,
      ) =>
        observation.currentStrategyType ===
        strategyType,
    )
    .map(
      cloneRecommendationLearningObservation,
    );
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Query                                             */
/* ------------------------------------------------------------------ */

export function findRecommendationLearningObservationsByRuntimeDecision(
  params:
    FindRecommendationLearningObservationsByRuntimeDecisionParams,
): RecommendationLearningObservation[] {
  const {
    observations,
    decisionType,
  } = params;

  validateRecommendationLearningObservationArray(
    observations,
  );

  validateRequiredString(
    decisionType,
    "decisionType",
  );

  return observations
    .filter(
      (
        observation,
      ) =>
        observation.enabledRuntimeDecisionTypes.includes(
          decisionType,
        ),
    )
    .map(
      cloneRecommendationLearningObservation,
    );
}

/* ------------------------------------------------------------------ */
/* Observation Summary                                                */
/* ------------------------------------------------------------------ */

export type RecommendationLearningObservationSummary = {
  observationCount:
    number;

  outcomeCounts:
    RecommendationLearningOutcomeCounts;

  categoryCounts:
    RecommendationLearningOutcomeCategoryCounts;

  firstObservedAt:
    string | null;

  latestObservedAt:
    string | null;

  firstCurrentEntryId:
    string | null;

  latestCurrentEntryId:
    string | null;
};

export function summarizeRecommendationLearningObservations(
  observations:
    readonly RecommendationLearningObservation[],
): RecommendationLearningObservationSummary {
  validateRecommendationLearningObservationArray(
    observations,
  );

  const sorted =
    sortRecommendationLearningObservations({
      observations,
    });

  if (
    sorted.length ===
    0
  ) {
    return {
      observationCount:
        0,

      outcomeCounts:
        countRecommendationLearningOutcomes(
          [],
        ),

      categoryCounts:
        countRecommendationLearningOutcomeCategories(
          [],
        ),

      firstObservedAt:
        null,

      latestObservedAt:
        null,

      firstCurrentEntryId:
        null,

      latestCurrentEntryId:
        null,
    };
  }

  const first =
    sorted[
      0
    ];

  const latest =
    sorted[
      sorted.length -
        1
    ];

  if (
    first ===
      undefined ||
    latest ===
      undefined
  ) {
    throw new Error(
      "Recommendation Learning Observation summary could not resolve sequence boundaries.",
    );
  }

  return {
    observationCount:
      sorted.length,

    outcomeCounts:
      countRecommendationLearningOutcomes(
        sorted,
      ),

    categoryCounts:
      countRecommendationLearningOutcomeCategories(
        sorted,
      ),

    firstObservedAt:
      first.observedAt,

    latestObservedAt:
      latest.observedAt,

    firstCurrentEntryId:
      first.currentEntryId,

    latestCurrentEntryId:
      latest.currentEntryId,
  };
}