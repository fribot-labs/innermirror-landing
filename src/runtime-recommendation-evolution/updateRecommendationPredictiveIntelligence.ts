import {
    analyzeRecommendationPredictiveIntelligence,
    cloneRecommendationPredictiveIntelligence,
    validateRecommendationPredictiveIntelligence,
} from "./analyzeRecommendationPredictiveIntelligence";

import {
    cloneRecommendationPredictivePresentation,
    createRecommendationPredictivePresentation,
    validateRecommendationPredictivePresentation,
} from "./createRecommendationPredictivePresentation";

import type {
    RecommendationPredictiveIntelligenceUpdateResult,
    UpdateRecommendationPredictiveIntelligenceParams,
    ValidateRecommendationPredictiveUpdateResultParams,
} from "./recommendationPredictiveIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Predictive Intelligence 전체 업데이트 Pipeline을
 * 실행합니다.
 *
 * 이 함수는 다음 두 계층을 하나의 실행 단위로 연결합니다.
 *
 * 1. Predictive Intelligence Analysis
 * 2. Predictive Presentation
 *
 * 반환되는 predictedAt은 Analysis와 Presentation이 공유하는
 * 하나의 실행 시점을 의미합니다.
 */
export function updateRecommendationPredictiveIntelligence(
  params:
    UpdateRecommendationPredictiveIntelligenceParams,
): RecommendationPredictiveIntelligenceUpdateResult {
  validateUpdateRecommendationPredictiveIntelligenceParams(
    params,
  );

  const analysis =
    analyzeRecommendationPredictiveIntelligence({
      memory:
        params.memory,

      memoryAnalysis:
        params.memoryAnalysis,

      adaptiveLearningAnalysis:
        params.adaptiveLearningAnalysis,

      horizon:
        params.horizon,

      predictedAt:
        params.predictedAt,

      recentEntryLimit:
        params.recentEntryLimit,

      recentComparisonLimit:
        params.recentComparisonLimit,

      maximumStateCandidateCount:
        params.maximumStateCandidateCount,

      maximumStrategyCandidateCount:
        params.maximumStrategyCandidateCount,

      maximumDecisionCandidateCount:
        params.maximumDecisionCandidateCount,

      minimumCandidateProbability:
        params.minimumCandidateProbability,

      createStatePredictionId:
        params.createStatePredictionId,

      createStrategyPredictionId:
        params.createStrategyPredictionId,

      createDecisionPredictionId:
        params.createDecisionPredictionId,

      createRiskPredictionId:
        params.createRiskPredictionId,

      createOpportunityPredictionId:
        params.createOpportunityPredictionId,

      createConflictId:
        params.createConflictId,

      createSignalId:
        params.createSignalId,
    });

  const presentation =
    createRecommendationPredictivePresentation({
      memory:
        params.memory,

      memoryAnalysis:
        params.memoryAnalysis,

      adaptiveLearningAnalysis:
        params.adaptiveLearningAnalysis,

      analysis,

      /**
       * 현재 Update Params에는 별도의 presentationCreatedAt이
       * 존재하지 않습니다.
       *
       * 따라서 하나의 Predictive Update 실행이 같은 시점을
       * 공유하도록 predictedAt을 Presentation createdAt으로
       * 사용합니다.
       */
      createdAt:
        params.predictedAt,
    });

  const result:
    RecommendationPredictiveIntelligenceUpdateResult = {
      analysis:
        cloneRecommendationPredictiveIntelligence(
          analysis,
        ),

      presentation:
        cloneRecommendationPredictivePresentation(
          presentation,
        ),

      predictedAt:
        params.predictedAt,
    };

  validateRecommendationPredictiveUpdateResult({
    memory:
      params.memory,

    memoryAnalysis:
      params.memoryAnalysis,

    adaptiveLearningAnalysis:
      params.adaptiveLearningAnalysis,

    result,
  });

  return cloneRecommendationPredictiveIntelligenceUpdateResult(
    result,
  );
}

/* ------------------------------------------------------------------ */
/* Public Validation                                                  */
/* ------------------------------------------------------------------ */

/**
 * Predictive Intelligence Update Result의 구조와 계층 간 일관성을
 * 검증합니다.
 *
 * 검증 대상:
 *
 * - Analysis와 Memory 계층의 연결
 * - Presentation과 Analysis의 연결
 * - predictedAt 일관성
 * - Presentation createdAt 시간 순서
 */
export function validateRecommendationPredictiveUpdateResult(
  params:
    ValidateRecommendationPredictiveUpdateResultParams,
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
      "Validate Recommendation Predictive Update Result params must be an object.",
    );
  }

  const {
    memory,
    memoryAnalysis,
    adaptiveLearningAnalysis,
    result,
  } = params;

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
      "Recommendation Predictive Intelligence Update Result must be an object.",
    );
  }

  validateRecommendationPredictiveIntelligence({
    memory,

    memoryAnalysis,

    adaptiveLearningAnalysis,

    analysis:
      result.analysis,
  });

  validateRecommendationPredictivePresentation({
    analysis:
      result.analysis,

    presentation:
      result.presentation,
  });

  validateTimestamp(
    result.predictedAt,
    "result.predictedAt",
  );

  if (
    result.predictedAt !==
    result.analysis.predictedAt
  ) {
    throw new Error(
      "Predictive Update Result predictedAt must match Analysis predictedAt.",
    );
  }

  if (
    result.presentation.createdAt !==
    result.predictedAt
  ) {
    throw new Error(
      "Predictive Presentation createdAt must match Update Result predictedAt.",
    );
  }

  if (
    result.analysis.memoryId !==
    memory.id
  ) {
    throw new Error(
      "Predictive Update Result Analysis memoryId must match Memory id.",
    );
  }

  if (
    result.analysis.historyId !==
      memory.historyId ||
    result.analysis.historyId !==
      memoryAnalysis.historyId ||
    result.analysis.historyId !==
      adaptiveLearningAnalysis.historyId
  ) {
    throw new Error(
      "Predictive Update Result historyId values are inconsistent.",
    );
  }

  if (
    result.analysis.sourceMemoryAnalyzedAt !==
    memoryAnalysis.analyzedAt
  ) {
    throw new Error(
      "Predictive Update Result sourceMemoryAnalyzedAt is inconsistent.",
    );
  }

  if (
    result.analysis.sourceAdaptiveLearningAnalyzedAt !==
    adaptiveLearningAnalysis.analyzedAt
  ) {
    throw new Error(
      "Predictive Update Result sourceAdaptiveLearningAnalyzedAt is inconsistent.",
    );
  }

  validateTimestampOrder(
    memoryAnalysis.analyzedAt,
    result.predictedAt,
    "memoryAnalysis.analyzedAt",
    "result.predictedAt",
  );

  validateTimestampOrder(
    adaptiveLearningAnalysis.analyzedAt,
    result.predictedAt,
    "adaptiveLearningAnalysis.analyzedAt",
    "result.predictedAt",
  );
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validateUpdateRecommendationPredictiveIntelligenceParams(
  params:
    UpdateRecommendationPredictiveIntelligenceParams,
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
      "Update Recommendation Predictive Intelligence params must be an object.",
    );
  }

  /**
   * 전체 Memory·Analysis 계약 검증은
   * analyzeRecommendationPredictiveIntelligence() 경계에서도
   * 수행됩니다.
   *
   * 여기서는 Update Orchestrator가 직접 사용하는 값과 함수의
   * 존재 여부를 먼저 검증하여 오류 위치를 명확하게 만듭니다.
   */
  if (
    typeof params.memory !==
      "object" ||
    params.memory ===
      null ||
    Array.isArray(
      params.memory,
    )
  ) {
    throw new Error(
      "Update Recommendation Predictive Intelligence memory must be an object.",
    );
  }

  if (
    typeof params.memoryAnalysis !==
      "object" ||
    params.memoryAnalysis ===
      null ||
    Array.isArray(
      params.memoryAnalysis,
    )
  ) {
    throw new Error(
      "Update Recommendation Predictive Intelligence memoryAnalysis must be an object.",
    );
  }

  if (
    typeof params.adaptiveLearningAnalysis !==
      "object" ||
    params.adaptiveLearningAnalysis ===
      null ||
    Array.isArray(
      params.adaptiveLearningAnalysis,
    )
  ) {
    throw new Error(
      "Update Recommendation Predictive Intelligence adaptiveLearningAnalysis must be an object.",
    );
  }

  validateTimestamp(
    params.predictedAt,
    "predictedAt",
  );

  validateTimestampOrder(
    params.memoryAnalysis.analyzedAt,
    params.predictedAt,
    "memoryAnalysis.analyzedAt",
    "predictedAt",
  );

  validateTimestampOrder(
    params.adaptiveLearningAnalysis.analyzedAt,
    params.predictedAt,
    "adaptiveLearningAnalysis.analyzedAt",
    "predictedAt",
  );

  validateFunction(
    params.createStatePredictionId,
    "createStatePredictionId",
  );

  validateFunction(
    params.createStrategyPredictionId,
    "createStrategyPredictionId",
  );

  validateFunction(
    params.createDecisionPredictionId,
    "createDecisionPredictionId",
  );

  validateFunction(
    params.createRiskPredictionId,
    "createRiskPredictionId",
  );

  validateFunction(
    params.createOpportunityPredictionId,
    "createOpportunityPredictionId",
  );

  validateFunction(
    params.createConflictId,
    "createConflictId",
  );

  validateFunction(
    params.createSignalId,
    "createSignalId",
  );
}

/* ------------------------------------------------------------------ */
/* Clone                                                              */
/* ------------------------------------------------------------------ */

export function cloneRecommendationPredictiveIntelligenceUpdateResult(
  result:
    RecommendationPredictiveIntelligenceUpdateResult,
): RecommendationPredictiveIntelligenceUpdateResult {
  return {
    analysis:
      cloneRecommendationPredictiveIntelligence(
        result.analysis,
      ),

    presentation:
      cloneRecommendationPredictivePresentation(
        result.presentation,
      ),

    predictedAt:
      result.predictedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Query Helpers                                                      */
/* ------------------------------------------------------------------ */

/**
 * Update Result가 실제 예측 후보를 하나 이상 포함하는지
 * 확인합니다.
 */
export function hasRecommendationPredictiveIntelligencePredictions(
  result:
    RecommendationPredictiveIntelligenceUpdateResult,
): boolean {
  return (
    result.analysis.predictedStates.length >
      0 ||
    result.analysis.predictedStrategies.length >
      0 ||
    result.analysis.predictedRuntimeDecisions.length >
      0 ||
    result.analysis.predictedRisks.length >
      0 ||
    result.analysis.predictedOpportunities.length >
      0
  );
}

/**
 * Update Result가 의미 있는 Conflict를 포함하는지 확인합니다.
 */
export function hasRecommendationPredictiveIntelligenceConflict(
  result:
    RecommendationPredictiveIntelligenceUpdateResult,
): boolean {
  return result.analysis.conflicts.length >
    0;
}

/**
 * Update Result가 사용자 또는 Runtime에 표시할 수 있는
 * Presentation을 포함하는지 확인합니다.
 */
export function hasRecommendationPredictiveIntelligencePresentation(
  result:
    RecommendationPredictiveIntelligenceUpdateResult,
): boolean {
  return (
    result.presentation.headline.trim().length >
      0 &&
    result.presentation.summary.trim().length >
      0 &&
    result.presentation.confidenceDisclosure.trim().length >
      0
  );
}

/**
 * 현재 결과가 다음 Runtime 처리에 사용할 수 있는 수준인지
 * 확인합니다.
 *
 * conflicted 상태는 예측 실패가 아니라 조건부 예측이므로
 * 사용할 수 있는 결과로 간주합니다.
 */
export function isRecommendationPredictiveIntelligenceUpdateUsable(
  result:
    RecommendationPredictiveIntelligenceUpdateResult,
): boolean {
  return (
    result.analysis.state !==
      "unavailable" &&
    result.analysis.state !==
      "insufficient" &&
    hasRecommendationPredictiveIntelligencePredictions(
      result,
    )
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

function validateFunction(
  value:
    unknown,
  fieldName:
    string,
): asserts value is (...args: never[]) => unknown {
  if (
    typeof value !==
      "function"
  ) {
    throw new Error(
      `${fieldName} must be a function.`,
    );
  }
}