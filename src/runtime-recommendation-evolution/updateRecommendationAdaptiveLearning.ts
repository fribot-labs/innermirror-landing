import {
    analyzeRecommendationAdaptiveLearning,
    cloneRecommendationAdaptiveLearningAnalysis,
    validateRecommendationAdaptiveLearningAnalysis,
} from "./analyzeRecommendationAdaptiveLearning";

import {
    cloneRecommendationAdaptiveLearningPresentation,
    createRecommendationAdaptiveLearningPresentation,
    validateRecommendationAdaptiveLearningPresentation,
} from "./createRecommendationAdaptiveLearningPresentation";

import {
    validateRecommendationEvolutionMemory,
} from "./appendRecommendationEvolutionMemory";

import {
    validateRecommendationEvolutionMemoryAnalysis,
} from "./analyzeRecommendationEvolutionMemory";

import type {
    RecommendationAdaptiveLearningUpdateResult,
    UpdateRecommendationAdaptiveLearningParams,
} from "./recommendationAdaptiveLearningTypes";

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Adaptive Learning 전체 Pipeline을 실행합니다.
 *
 * 처리 순서:
 *
 * Recommendation Evolution Memory
 * → Recommendation Evolution Memory Analysis
 * → Adaptive Learning Analysis
 * → Adaptive Learning Presentation
 * → Update Result
 *
 * 이 함수는 Memory 또는 Memory Analysis를 변경하지 않습니다.
 * 모든 반환 데이터는 독립적으로 복제됩니다.
 */
export function updateRecommendationAdaptiveLearning(
  params:
    UpdateRecommendationAdaptiveLearningParams,
): RecommendationAdaptiveLearningUpdateResult {
  validateUpdateRecommendationAdaptiveLearningParams(
    params,
  );

  const analysis =
    analyzeRecommendationAdaptiveLearning({
      memory:
        params.memory,

      memoryAnalysis:
        params.memoryAnalysis,

      analyzedAt:
        params.updatedAt,

      minimumSampleCount:
        params.minimumSampleCount,

      minimumConfidence:
        params.minimumConfidence,

      createObservationId:
        params.createObservationId,

      createPatternId:
        params.createPatternId,

      createRuleId:
        params.createRuleId,

      createSignalId:
        params.createSignalId,
    });

  const presentation =
    createRecommendationAdaptiveLearningPresentation({
      memory:
        params.memory,

      memoryAnalysis:
        params.memoryAnalysis,

      analysis,

      createdAt:
        params.updatedAt,
    });

    const result:
      RecommendationAdaptiveLearningUpdateResult = {
      analysis,

      presentation,

      runtimeAdjustment: {
        strategyPreferenceAdjustments: {
          ...analysis.runtimeAdjustment
            .strategyPreferenceAdjustments,
        },

        decisionPreferenceAdjustments: {
          ...analysis.runtimeAdjustment
            .decisionPreferenceAdjustments,
        },

        signalConfidenceAdjustments: {
          ...analysis.runtimeAdjustment
            .signalConfidenceAdjustments,
        },

        evidenceRequirementAdjustment:
          analysis.runtimeAdjustment
            .evidenceRequirementAdjustment,

        newRecommendationThresholdAdjustment:
          analysis.runtimeAdjustment
            .newRecommendationThresholdAdjustment,

        redirectionThresholdAdjustment:
          analysis.runtimeAdjustment
            .redirectionThresholdAdjustment,

        stabilizationPreferenceAdjustment:
          analysis.runtimeAdjustment
            .stabilizationPreferenceAdjustment,

        recoveryPreferenceAdjustment:
          analysis.runtimeAdjustment
            .recoveryPreferenceAdjustment,
      },

      updatedAt:
        params.updatedAt,
    };

  validateRecommendationAdaptiveLearningUpdateResult({
    params,
    result,
  });

  return cloneRecommendationAdaptiveLearningUpdateResult(
    result,
  );
}

/* ------------------------------------------------------------------ */
/* Public Result Validation                                           */
/* ------------------------------------------------------------------ */

export function validateRecommendationAdaptiveLearningUpdateResult(
  input: {
    params:
      UpdateRecommendationAdaptiveLearningParams;

    result:
      RecommendationAdaptiveLearningUpdateResult;
  },
): void {
  const {
    params,
    result,
  } = input;

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
      "Recommendation Adaptive Learning Update Result must be an object.",
    );
  }

  validateRecommendationAdaptiveLearningAnalysis({
    memory:
      params.memory,

    memoryAnalysis:
      params.memoryAnalysis,

    analysis:
      result.analysis,
  });

  validateRecommendationAdaptiveLearningPresentation({
    analysis:
      result.analysis,

    presentation:
      result.presentation,
  });

  validateTimestamp(
    result.updatedAt,
    "result.updatedAt",
  );

  validateTimestampOrder(
    params.memoryAnalysis.analyzedAt,
    result.analysis.analyzedAt,
    "memoryAnalysis.analyzedAt",
    "result.analysis.analyzedAt",
  );

  validateTimestampOrder(
    result.analysis.analyzedAt,
    result.presentation.createdAt,
    "result.analysis.analyzedAt",
    "result.presentation.createdAt",
  );

  validateTimestampOrder(
    result.presentation.createdAt,
    result.updatedAt,
    "result.presentation.createdAt",
    "result.updatedAt",
  );

  validateUpdateResultIdentityConsistency({
    params,
    result,
  });

  validateUpdateResultTimestampConsistency(
    result,
  );

  validateUpdateResultPresentationConsistency(
    result,
  );

  validateUpdateResultRuntimeAdjustmentConsistency(
    result,
);
}

/* ------------------------------------------------------------------ */
/* Identity Consistency                                               */
/* ------------------------------------------------------------------ */

function validateUpdateResultIdentityConsistency(
  input: {
    params:
      UpdateRecommendationAdaptiveLearningParams;

    result:
      RecommendationAdaptiveLearningUpdateResult;
  },
): void {
  const {
    params,
    result,
  } = input;

  if (
    result.analysis.memoryId !==
    params.memory.id
  ) {
    throw new Error(
      "Adaptive Learning Update Result analysis.memoryId must match Memory id.",
    );
  }

  if (
    result.analysis.historyId !==
    params.memory.historyId
  ) {
    throw new Error(
      "Adaptive Learning Update Result analysis.historyId must match Memory historyId.",
    );
  }

  if (
    result.analysis.historyId !==
    params.memoryAnalysis.historyId
  ) {
    throw new Error(
      "Adaptive Learning Update Result analysis.historyId must match Memory Analysis historyId.",
    );
  }

  if (
    result.analysis.sourceMemoryAnalyzedAt !==
    params.memoryAnalysis.analyzedAt
  ) {
    throw new Error(
      "Adaptive Learning Update Result sourceMemoryAnalyzedAt must match Memory Analysis analyzedAt.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Timestamp Consistency                                              */
/* ------------------------------------------------------------------ */

/**
 * 현재 Update Orchestrator는 단일 updatedAt을 Analysis와
 * Presentation 생성 시각으로 사용합니다.
 *
 * 따라서 세 Timestamp는 동일해야 합니다.
 */
function validateUpdateResultTimestampConsistency(
  result:
    RecommendationAdaptiveLearningUpdateResult,
): void {
  if (
    result.analysis.analyzedAt !==
    result.updatedAt
  ) {
    throw new Error(
      "Adaptive Learning Analysis analyzedAt must match Update Result updatedAt.",
    );
  }

  if (
    result.presentation.createdAt !==
    result.updatedAt
  ) {
    throw new Error(
      "Adaptive Learning Presentation createdAt must match Update Result updatedAt.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Presentation Consistency                                           */
/* ------------------------------------------------------------------ */

function validateUpdateResultPresentationConsistency(
  result:
    RecommendationAdaptiveLearningUpdateResult,
): void {
  const {
    analysis,
    presentation,
  } = result;

  if (
    analysis.state ===
      "unavailable" &&
    presentation.tone !==
      "unavailable"
  ) {
    throw new Error(
      "Unavailable Adaptive Learning Analysis must produce an unavailable Presentation.",
    );
  }

  if (
    analysis.state ===
      "observing" &&
    presentation.tone !==
      "observing"
  ) {
    throw new Error(
      "Observing Adaptive Learning Analysis must produce an observing Presentation.",
    );
  }

  if (
    analysis.state ===
      "insufficient" &&
    presentation.tone !==
      "observing"
  ) {
    throw new Error(
      "Insufficient Adaptive Learning Analysis must produce an observing Presentation.",
    );
  }

  if (
    analysis.state ===
      "learning" &&
    presentation.tone !==
      "learning"
  ) {
    throw new Error(
      "Learning Adaptive Learning Analysis must produce a learning Presentation.",
    );
  }

  if (
    analysis.state ===
      "adapting" &&
    presentation.tone !==
      "adapting"
  ) {
    throw new Error(
      "Adapting Adaptive Learning Analysis must produce an adapting Presentation.",
    );
  }

  if (
    analysis.state ===
      "stable" &&
    presentation.tone !==
      "stable"
  ) {
    throw new Error(
      "Stable Adaptive Learning Analysis must produce a stable Presentation.",
    );
  }

  if (
    analysis.state ===
      "conflicted" &&
    presentation.tone !==
      "attention"
  ) {
    throw new Error(
      "Conflicted Adaptive Learning Analysis must produce an attention Presentation.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validateUpdateRecommendationAdaptiveLearningParams(
  params:
    UpdateRecommendationAdaptiveLearningParams,
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
      "Update Recommendation Adaptive Learning params must be an object.",
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

  validateTimestamp(
    params.updatedAt,
    "updatedAt",
  );

  validateTimestampOrder(
    params.memoryAnalysis.analyzedAt,
    params.updatedAt,
    "memoryAnalysis.analyzedAt",
    "updatedAt",
  );

  if (
    params.minimumSampleCount !==
    undefined
  ) {
    validatePositiveInteger(
      params.minimumSampleCount,
      "minimumSampleCount",
    );
  }

  if (
    params.minimumConfidence !==
    undefined
  ) {
    validateUnitInterval(
      params.minimumConfidence,
      "minimumConfidence",
    );
  }

  validateFunction(
    params.createObservationId,
    "createObservationId",
  );

  validateFunction(
    params.createPatternId,
    "createPatternId",
  );

  validateFunction(
    params.createRuleId,
    "createRuleId",
  );

  validateFunction(
    params.createSignalId,
    "createSignalId",
  );

  validateUpdateInputIdentityConsistency(
    params,
  );
}

/* ------------------------------------------------------------------ */
/* Input Identity Consistency                                         */
/* ------------------------------------------------------------------ */

function validateUpdateInputIdentityConsistency(
  params:
    UpdateRecommendationAdaptiveLearningParams,
): void {
  if (
    params.memory.historyId !==
    params.memoryAnalysis.historyId
  ) {
    throw new Error(
      "Adaptive Learning Update Memory and Memory Analysis historyId values must match.",
    );
  }

  if (
    params.memoryAnalysis.memoryId !==
    params.memory.id
  ) {
    throw new Error(
      "Adaptive Learning Update Memory Analysis memoryId must match Memory id.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Clone                                                              */
/* ------------------------------------------------------------------ */

export function cloneRecommendationAdaptiveLearningUpdateResult(
  result:
    RecommendationAdaptiveLearningUpdateResult,
): RecommendationAdaptiveLearningUpdateResult {
  return {
    analysis:
      cloneRecommendationAdaptiveLearningAnalysis(
        result.analysis,
      ),

    presentation:
      cloneRecommendationAdaptiveLearningPresentation(
        result.presentation,
      ),

    runtimeAdjustment: {
      strategyPreferenceAdjustments: {
        ...result.runtimeAdjustment
          .strategyPreferenceAdjustments,
      },

      decisionPreferenceAdjustments: {
        ...result.runtimeAdjustment
          .decisionPreferenceAdjustments,
      },

      signalConfidenceAdjustments: {
        ...result.runtimeAdjustment
          .signalConfidenceAdjustments,
      },

      evidenceRequirementAdjustment:
        result.runtimeAdjustment
          .evidenceRequirementAdjustment,

      newRecommendationThresholdAdjustment:
        result.runtimeAdjustment
          .newRecommendationThresholdAdjustment,

      redirectionThresholdAdjustment:
        result.runtimeAdjustment
          .redirectionThresholdAdjustment,

      stabilizationPreferenceAdjustment:
        result.runtimeAdjustment
          .stabilizationPreferenceAdjustment,

      recoveryPreferenceAdjustment:
        result.runtimeAdjustment
          .recoveryPreferenceAdjustment,
    },

    updatedAt:
      result.updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Query Helpers                                                      */
/* ------------------------------------------------------------------ */

/**
 * Update 결과가 실제 Runtime Adjustment를 포함하는지 확인합니다.
 */
export function hasRecommendationAdaptiveLearningRuntimeAdjustment(
  result:
    RecommendationAdaptiveLearningUpdateResult,
): boolean {
  const {
    runtimeAdjustment,
  } = result.analysis;

  return (
    Object.keys(
      runtimeAdjustment
        .strategyPreferenceAdjustments,
    ).length >
      0 ||
    Object.keys(
      runtimeAdjustment
        .decisionPreferenceAdjustments,
    ).length >
      0 ||
    Object.keys(
      runtimeAdjustment
        .signalConfidenceAdjustments,
    ).length >
      0 ||
    runtimeAdjustment
      .evidenceRequirementAdjustment !==
      0 ||
    runtimeAdjustment
      .newRecommendationThresholdAdjustment !==
      0 ||
    runtimeAdjustment
      .redirectionThresholdAdjustment !==
      0 ||
    runtimeAdjustment
      .stabilizationPreferenceAdjustment !==
      0 ||
    runtimeAdjustment
      .recoveryPreferenceAdjustment !==
      0
  );
}

/**
 * Adaptive Learning이 실제 adapting 상태인지 확인합니다.
 */
export function isRecommendationAdaptiveLearningActivelyAdapting(
  result:
    RecommendationAdaptiveLearningUpdateResult,
): boolean {
  return (
    result.analysis.state ===
      "adapting" &&
    result.analysis.statistics
      .activeAdaptationRuleCount >
      0 &&
    hasRecommendationAdaptiveLearningRuntimeAdjustment(
      result,
    )
  );
}

/**
 * 추가 Evidence가 필요한 상태인지 확인합니다.
 */
export function requiresMoreRecommendationAdaptiveLearningEvidence(
  result:
    RecommendationAdaptiveLearningUpdateResult,
): boolean {
  return (
    result.analysis.state ===
      "unavailable" ||
    result.analysis.state ===
      "insufficient" ||
    result.analysis.state ===
      "observing" ||
    result.analysis.state ===
      "conflicted"
  );
}

/**
 * 자동 Adaptation을 제한하는 충돌이 존재하는지 확인합니다.
 */
export function hasRecommendationAdaptiveLearningConflict(
  result:
    RecommendationAdaptiveLearningUpdateResult,
): boolean {
  return (
    result.analysis.state ===
      "conflicted" ||
    result.analysis.scores.conflictRisk >=
      0.4 ||
    result.analysis.statistics
      .conflictedAdaptationRuleCount >
      0 ||
    result.analysis.patterns.some(
      (
        pattern,
      ) =>
        pattern.type ===
        "conflicting-evidence",
    )
  );
}

/**
 * Adaptive Learning 결과가 안정 상태인지 확인합니다.
 */
export function isRecommendationAdaptiveLearningStable(
  result:
    RecommendationAdaptiveLearningUpdateResult,
): boolean {
  return result.analysis.state ===
    "stable";
}

/**
 * 현재 Presentation의 첫 번째 Warning을 반환합니다.
 */
export function getRecommendationAdaptiveLearningPrimaryWarning(
  result:
    RecommendationAdaptiveLearningUpdateResult,
): string | null {
  return result.presentation.warnings[
    0
  ] ??
    null;
}

/**
 * 현재 Presentation의 첫 번째 Evidence를 반환합니다.
 */
export function getRecommendationAdaptiveLearningPrimaryEvidence(
  result:
    RecommendationAdaptiveLearningUpdateResult,
): string | null {
  return result.presentation.evidence[
    0
  ] ??
    null;
}

/* ------------------------------------------------------------------ */
/* Summary                                                            */
/* ------------------------------------------------------------------ */

export type RecommendationAdaptiveLearningUpdateSummary = {
  state:
    RecommendationAdaptiveLearningUpdateResult[
      "analysis"
    ][
      "state"
    ];

  confidence:
    number;

  observationCount:
    number;

  patternCount:
    number;

  adaptationRuleCount:
    number;

  activeAdaptationRuleCount:
    number;

  conflictedAdaptationRuleCount:
    number;

  signalCount:
    number;

  hasRuntimeAdjustment:
    boolean;

  hasConflict:
    boolean;

  isStable:
    boolean;

  headline:
    string;
};

export function summarizeRecommendationAdaptiveLearningUpdate(
  result:
    RecommendationAdaptiveLearningUpdateResult,
): RecommendationAdaptiveLearningUpdateSummary {
  return {
    state:
      result.analysis.state,

    confidence:
      result.analysis.confidence,

    observationCount:
      result.analysis.statistics
        .observationCount,

    patternCount:
      result.analysis.statistics
        .patternCount,

    adaptationRuleCount:
      result.analysis.statistics
        .adaptationRuleCount,

    activeAdaptationRuleCount:
      result.analysis.statistics
        .activeAdaptationRuleCount,

    conflictedAdaptationRuleCount:
      result.analysis.statistics
        .conflictedAdaptationRuleCount,

    signalCount:
      result.analysis.signals.length,

    hasRuntimeAdjustment:
      hasRecommendationAdaptiveLearningRuntimeAdjustment(
        result,
      ),

    hasConflict:
      hasRecommendationAdaptiveLearningConflict(
        result,
      ),

    isStable:
      isRecommendationAdaptiveLearningStable(
        result,
      ),

    headline:
      result.presentation.headline,
  };
}

/* ------------------------------------------------------------------ */
/* Generic Validation Helpers                                         */
/* ------------------------------------------------------------------ */

function validatePositiveInteger(
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
      1
  ) {
    throw new Error(
      `${fieldName} must be a positive integer.`,
    );
  }
}

function validateUnitInterval(
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

function validateTimestamp(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string {
  if (
    typeof value !==
      "string" ||
    value.trim().length ===
      0 ||
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
): asserts value is (
  ...args:
    unknown[]
) => unknown {
  if (
    typeof value !==
    "function"
  ) {
    throw new Error(
      `${fieldName} must be a function.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Runtime Adjustment Consistency                                     */
/* ------------------------------------------------------------------ */

function validateUpdateResultRuntimeAdjustmentConsistency(
  result:
    RecommendationAdaptiveLearningUpdateResult,
): void {
  const analysisAdjustment =
    result.analysis.runtimeAdjustment;

  const resultAdjustment =
    result.runtimeAdjustment;

  if (
    analysisAdjustment.evidenceRequirementAdjustment !==
      resultAdjustment.evidenceRequirementAdjustment ||
    analysisAdjustment.newRecommendationThresholdAdjustment !==
      resultAdjustment.newRecommendationThresholdAdjustment ||
    analysisAdjustment.redirectionThresholdAdjustment !==
      resultAdjustment.redirectionThresholdAdjustment ||
    analysisAdjustment.stabilizationPreferenceAdjustment !==
      resultAdjustment.stabilizationPreferenceAdjustment ||
    analysisAdjustment.recoveryPreferenceAdjustment !==
      resultAdjustment.recoveryPreferenceAdjustment ||
    !areNumberRecordsEqual(
      analysisAdjustment.strategyPreferenceAdjustments,
      resultAdjustment.strategyPreferenceAdjustments,
    ) ||
    !areNumberRecordsEqual(
      analysisAdjustment.decisionPreferenceAdjustments,
      resultAdjustment.decisionPreferenceAdjustments,
    ) ||
    !areNumberRecordsEqual(
      analysisAdjustment.signalConfidenceAdjustments,
      resultAdjustment.signalConfidenceAdjustments,
    )
  ) {
    throw new Error(
      "Adaptive Learning Update Result runtimeAdjustment must match analysis.runtimeAdjustment.",
    );
  }
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