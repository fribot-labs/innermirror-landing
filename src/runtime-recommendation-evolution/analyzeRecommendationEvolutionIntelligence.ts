import {
    assessRecommendationEvolutionIntelligence,
} from "./assessRecommendationEvolutionIntelligence";

import {
    createRecommendationEvolutionGuidance,
} from "./createRecommendationEvolutionGuidance";

import {
    deriveRecommendationEvolutionSignals,
} from "./deriveRecommendationEvolutionSignals";

import {
    resolveRecommendationEvolutionStrategy,
} from "./resolveRecommendationEvolutionStrategy";

import type {
    RecommendationEvolutionResult,
} from "./recommendationEvolutionTypes";

import type {
    AnalyzeRecommendationEvolutionIntelligenceParams,
    RecommendationEvolutionIntelligenceResult,
    RecommendationEvolutionRuntimeDecision,
    RecommendationEvolutionRuntimeDecisionCollection,
    RecommendationEvolutionRuntimeDecisionPriority,
    RecommendationEvolutionRuntimeDecisionType,
    RecommendationEvolutionStrategy,
} from "./recommendationEvolutionIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Intelligence 전체 파이프라인을 실행합니다.
 *
 * 처리 흐름:
 *
 * RecommendationEvolutionResult
 *        ↓
 * Intelligence Signal Collection
 *        ↓
 * Intelligence Assessment
 *        ↓
 * Recommendation Strategy
 *        ↓
 * Runtime Decisions
 *        ↓
 * Guidance
 *
 * 모든 하위 단계에 동일한 analyzedAt을 전달하여
 * 하나의 분석 실행이 동일한 시각 문맥을 공유하도록 합니다.
 *
 * 이 함수는 입력 Evolution Result를 변경하지 않는 결정론적 함수입니다.
 */
export function analyzeRecommendationEvolutionIntelligence(
  params:
    AnalyzeRecommendationEvolutionIntelligenceParams,
): RecommendationEvolutionIntelligenceResult {
  validateParams(
    params,
  );

  const {
    evolution,
    analyzedAt,
    createSignalId,
    createDecisionId,
    createGuidanceId,
    createWarningId,
    createObservationId,
  } = params;

  const signalCollection =
    deriveRecommendationEvolutionSignals({
      evolution,

      detectedAt:
        analyzedAt,

      createSignalId,
    });

  const assessment =
    assessRecommendationEvolutionIntelligence({
      evolution,

      signals:
        signalCollection.signals,
    });

  const strategy =
    resolveRecommendationEvolutionStrategy({
      assessment,

      signals:
        signalCollection.signals,

      resolvedAt:
        analyzedAt,
    });

  const runtimeDecisionCollection =
    createRuntimeDecisionCollection({
      strategy,

      analyzedAt,

      createDecisionId,
    });

  const guidance =
    createRecommendationEvolutionGuidance({
      assessment,

      strategy,

      runtimeDecisions:
        runtimeDecisionCollection.decisions,

      signals:
        signalCollection.signals,

      createdAt:
        analyzedAt,

      createGuidanceId,

      createWarningId,

      createObservationId,
    });

  const result:
    RecommendationEvolutionIntelligenceResult = {
      version:
        1,

      evolution,

      signalCollection,

      signals:
        signalCollection.signals,

      assessment,

      strategy,

      runtimeDecisionCollection,

      runtimeDecisions:
        runtimeDecisionCollection.decisions,

      guidance,

      analyzedAt,
    };

  validateResultConsistency(
    result,
  );

  return result;
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Collection                                        */
/* ------------------------------------------------------------------ */

type CreateRuntimeDecisionCollectionParams = {
  strategy:
    RecommendationEvolutionStrategy;

  analyzedAt:
    string;

  createDecisionId:
    (
      type:
        RecommendationEvolutionRuntimeDecisionType,
      index:
        number,
    ) => string;
};

type RuntimeDecisionDraft = Omit<
  RecommendationEvolutionRuntimeDecision,
  "id" | "decidedAt"
>;

function createRuntimeDecisionCollection(
  params:
    CreateRuntimeDecisionCollectionParams,
): RecommendationEvolutionRuntimeDecisionCollection {
  const drafts =
    createRuntimeDecisionDrafts(
      params.strategy,
    );

  const decisions =
    drafts.map(
      (
        draft,
        index,
      ) => {
        const id =
          params.createDecisionId(
            draft.type,
            index,
          );

        assertNonEmptyString(
          id,
          `createDecisionId result for decision "${draft.type}"`,
        );

        return {
          ...draft,

          id,

          decidedAt:
            params.analyzedAt,
        };
      },
    );

  assertUniqueRuntimeDecisionIds(
    decisions,
  );

  const enabledDecisions =
    decisions.filter(
      (
        decision,
      ) =>
        decision.enabled,
    );

  const primaryDecision =
    selectPrimaryRuntimeDecision(
      enabledDecisions,
    );

  return {
    strategy:
      params.strategy,

    decisions,

    enabledDecisionIds:
      enabledDecisions.map(
        (
          decision,
        ) =>
          decision.id,
      ),

    primaryDecisionId:
      primaryDecision?.id ??
      null,

    canGenerateNewRecommendation:
      params.strategy.decisions
        .shouldGenerateNewRecommendation,

    mustPreserveCurrentRecommendation:
      params.strategy.decisions
        .shouldPreserveCurrentRecommendation,
  };
}

function createRuntimeDecisionDrafts(
  strategy:
    RecommendationEvolutionStrategy,
): RuntimeDecisionDraft[] {
  const drafts:
    RuntimeDecisionDraft[] = [];

  const decisions =
    strategy.decisions;

  drafts.push(
    createRuntimeDecisionDraft({
      type:
        decisions
          .shouldGenerateNewRecommendation
          ? "allow-new-recommendation"
          : "block-new-recommendation",

      enabled:
        true,

      priority:
        strategy.priority,

      strategy,

      description:
        decisions
          .shouldGenerateNewRecommendation
          ? "새로운 Recommendation 생성을 허용합니다."
          : "현재 단계에서는 새로운 Recommendation 생성을 보류합니다.",

      rationale:
        strategy.rationale,
    }),
  );

  pushDecisionDraft(
    drafts,
    createConditionalRuntimeDecisionDraft({
      enabled:
        decisions
          .shouldPreserveCurrentRecommendation,

      type:
        "preserve-current-recommendation",

      priority:
        strategy.priority,

      strategy,

      description:
        "현재 Recommendation을 보존합니다.",
    }),
  );

  pushDecisionDraft(
    drafts,
    createConditionalRuntimeDecisionDraft({
      enabled:
        decisions
          .shouldRequestProgressEvidence,

      type:
        "request-progress-evidence",

      priority:
        strategy.priority,

      strategy,

      description:
        "현재 Recommendation의 진행 근거를 요청합니다.",
    }),
  );

  pushDecisionDraft(
    drafts,
    createConditionalRuntimeDecisionDraft({
      enabled:
        decisions
          .shouldRequestCompletionConfirmation,

      type:
        "request-completion-confirmation",

      priority:
        strategy.priority,

      strategy,

      description:
        "현재 Recommendation의 완료 여부를 확인합니다.",
    }),
  );

  pushDecisionDraft(
    drafts,
    createConditionalRuntimeDecisionDraft({
      enabled:
        decisions
          .shouldReduceDirectionChanges,

      type:
        "reduce-direction-changes",

      priority:
        strategy.priority,

      strategy,

      description:
        "새로운 방향 추가를 줄이고 Recommendation 흐름을 안정화합니다.",
    }),
  );

  pushDecisionDraft(
    drafts,
    createConditionalRuntimeDecisionDraft({
      enabled:
        decisions
          .shouldNarrowCurrentRecommendation,

      type:
        "narrow-current-recommendation",

      priority:
        strategy.priority,

      strategy,

      description:
        "현재 Recommendation을 더 작은 실행 단위로 좁힙니다.",
    }),
  );

  pushDecisionDraft(
    drafts,
    createConditionalRuntimeDecisionDraft({
      enabled:
        decisions
          .shouldClarifyCurrentRecommendation,

      type:
        "clarify-current-recommendation",

      priority:
        strategy.priority,

      strategy,

      description:
        "현재 Recommendation의 목표와 완료 조건을 명확히 합니다.",
    }),
  );

  pushDecisionDraft(
    drafts,
    createConditionalRuntimeDecisionDraft({
      enabled:
        decisions
          .shouldReconsiderCurrentRecommendation,

      type:
        "reconsider-current-recommendation",

      priority:
        strategy.priority,

      strategy,

      description:
        "현재 Recommendation의 전제와 방향을 다시 검토합니다.",
    }),
  );

  return drafts;
}

type CreateRuntimeDecisionDraftParams = {
  type:
    RecommendationEvolutionRuntimeDecisionType;

  enabled:
    boolean;

  priority:
    RecommendationEvolutionRuntimeDecisionPriority;

  strategy:
    RecommendationEvolutionStrategy;

  description:
    string;

  rationale:
    string[];
};

function createRuntimeDecisionDraft(
  params:
    CreateRuntimeDecisionDraftParams,
): RuntimeDecisionDraft {
  return {
    type:
      params.type,

    priority:
      params.priority,

    enabled:
      params.enabled,

    sourceStrategyType:
      params.strategy.type,

    description:
      params.description,

    rationale:
      uniqueNonEmptyStrings(
        params.rationale,
      ),

    relatedSignalIds:
      [
        ...params.strategy
          .relatedSignalIds,
      ],
  };
}

type CreateConditionalRuntimeDecisionDraftParams = {
  enabled:
    boolean;

  type:
    RecommendationEvolutionRuntimeDecisionType;

  priority:
    RecommendationEvolutionRuntimeDecisionPriority;

  strategy:
    RecommendationEvolutionStrategy;

  description:
    string;
};

function createConditionalRuntimeDecisionDraft(
  params:
    CreateConditionalRuntimeDecisionDraftParams,
): RuntimeDecisionDraft | null {
  if (!params.enabled) {
    return null;
  }

  return createRuntimeDecisionDraft({
    type:
      params.type,

    enabled:
      true,

    priority:
      params.priority,

    strategy:
      params.strategy,

    description:
      params.description,

    rationale:
      params.strategy.rationale,
  });
}

function pushDecisionDraft(
  drafts:
    RuntimeDecisionDraft[],
  draft:
    RuntimeDecisionDraft | null,
): void {
  if (draft !== null) {
    drafts.push(
      draft,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Primary Runtime Decision                                           */
/* ------------------------------------------------------------------ */

function selectPrimaryRuntimeDecision(
  decisions:
    readonly RecommendationEvolutionRuntimeDecision[],
): RecommendationEvolutionRuntimeDecision | null {
  let selected:
    RecommendationEvolutionRuntimeDecision | null = null;

  for (const decision of decisions) {
    if (
      selected === null ||
      compareRuntimeDecisionPriority(
        decision,
        selected,
      ) >
        0
    ) {
      selected =
        decision;
    }
  }

  return selected;
}

function compareRuntimeDecisionPriority(
  left:
    RecommendationEvolutionRuntimeDecision,
  right:
    RecommendationEvolutionRuntimeDecision,
): number {
  const priorityDifference =
    runtimeDecisionPriorityWeight(
      left.priority,
    ) -
    runtimeDecisionPriorityWeight(
      right.priority,
    );

  if (
    priorityDifference !==
    0
  ) {
    return priorityDifference;
  }

  return (
    runtimeDecisionTypeWeight(
      left.type,
    ) -
    runtimeDecisionTypeWeight(
      right.type,
    )
  );
}

function runtimeDecisionPriorityWeight(
  priority:
    RecommendationEvolutionRuntimeDecisionPriority,
): number {
  switch (priority) {
    case "high":
      return 3;

    case "medium":
      return 2;

    case "low":
      return 1;
  }
}

function runtimeDecisionTypeWeight(
  type:
    RecommendationEvolutionRuntimeDecisionType,
): number {
  switch (type) {
    case "request-completion-confirmation":
      return 9;

    case "reconsider-current-recommendation":
      return 8;

    case "reduce-direction-changes":
      return 7;

    case "request-progress-evidence":
      return 6;

    case "narrow-current-recommendation":
      return 5;

    case "clarify-current-recommendation":
      return 4;

    case "preserve-current-recommendation":
      return 3;

    case "allow-new-recommendation":
      return 2;

    case "block-new-recommendation":
      return 1;
  }
}

/* ------------------------------------------------------------------ */
/* Result Consistency                                                 */
/* ------------------------------------------------------------------ */

function validateResultConsistency(
  result:
    RecommendationEvolutionIntelligenceResult,
): void {
  if (
    result.signals !==
    result.signalCollection.signals
  ) {
    throw new Error(
      "result.signals must reference signalCollection.signals.",
    );
  }

  if (
    result.runtimeDecisions !==
    result.runtimeDecisionCollection.decisions
  ) {
    throw new Error(
      "result.runtimeDecisions must reference runtimeDecisionCollection.decisions.",
    );
  }

  if (
    result.strategy.sourceState !==
    result.assessment.state
  ) {
    throw new Error(
      "strategy.sourceState must match assessment.state.",
    );
  }

  if (
    result.guidance.sourceState !==
    result.assessment.state
  ) {
    throw new Error(
      "guidance.sourceState must match assessment.state.",
    );
  }

  if (
    result.guidance.sourceStrategyType !==
    result.strategy.type
  ) {
    throw new Error(
      "guidance.sourceStrategyType must match strategy.type.",
    );
  }

  if (
    result.runtimeDecisionCollection
      .strategy !==
    result.strategy
  ) {
    throw new Error(
      "runtimeDecisionCollection.strategy must reference result.strategy.",
    );
  }

  validateDecisionCollectionConsistency(
    result.runtimeDecisionCollection,
  );
}

function validateDecisionCollectionConsistency(
  collection:
    RecommendationEvolutionRuntimeDecisionCollection,
): void {
  const enabledIds =
    collection.decisions
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
          decision.id,
      );

  if (
    !sameStringSet(
      enabledIds,
      collection.enabledDecisionIds,
    )
  ) {
    throw new Error(
      "enabledDecisionIds must match enabled Runtime Decisions.",
    );
  }

  const hasAllowDecision =
    collection.decisions.some(
      (
        decision,
      ) =>
        decision.enabled &&
        decision.type ===
          "allow-new-recommendation",
    );

  if (
    collection
      .canGenerateNewRecommendation !==
    hasAllowDecision
  ) {
    throw new Error(
      "canGenerateNewRecommendation is inconsistent with Runtime Decisions.",
    );
  }

  if (
    collection.primaryDecisionId !==
      null &&
    !collection.enabledDecisionIds
      .includes(
        collection.primaryDecisionId,
      )
  ) {
    throw new Error(
      "primaryDecisionId must reference an enabled Runtime Decision.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validateParams(
  params:
    AnalyzeRecommendationEvolutionIntelligenceParams,
): void {
  if (
    params === null ||
    typeof params !==
      "object"
  ) {
    throw new Error(
      "params must be a valid AnalyzeRecommendationEvolutionIntelligenceParams object.",
    );
  }

  validateEvolutionResult(
    params.evolution,
  );

  assertValidIsoTimestamp(
    params.analyzedAt,
    "analyzedAt",
  );

  if (
    typeof params.createSignalId !==
    "function"
  ) {
    throw new Error(
      "createSignalId must be a function.",
    );
  }

  if (
    typeof params.createDecisionId !==
    "function"
  ) {
    throw new Error(
      "createDecisionId must be a function.",
    );
  }

  if (
    typeof params.createGuidanceId !==
    "function"
  ) {
    throw new Error(
      "createGuidanceId must be a function.",
    );
  }

  if (
    typeof params.createWarningId !==
    "function"
  ) {
    throw new Error(
      "createWarningId must be a function.",
    );
  }

  if (
    typeof params.createObservationId !==
    "function"
  ) {
    throw new Error(
      "createObservationId must be a function.",
    );
  }
}

function validateEvolutionResult(
  evolution:
    RecommendationEvolutionResult,
): void {
  if (
    evolution === null ||
    typeof evolution !==
      "object"
  ) {
    throw new Error(
      "evolution must be a valid RecommendationEvolutionResult.",
    );
  }

  assertNonEmptyString(
    evolution.historyId,
    "evolution.historyId",
  );

  assertValidIsoTimestamp(
    evolution.analyzedAt,
    "evolution.analyzedAt",
  );

  if (
    !Array.isArray(
      evolution.comparisons,
    )
  ) {
    throw new Error(
      "evolution.comparisons must be an array.",
    );
  }

  if (
    evolution.statistics ===
      null ||
    typeof evolution.statistics !==
      "object"
  ) {
    throw new Error(
      "evolution.statistics must be a valid object.",
    );
  }

  if (
    evolution.summary ===
      null ||
    typeof evolution.summary !==
      "object"
  ) {
    throw new Error(
      "evolution.summary must be a valid object.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* General Helpers                                                    */
/* ------------------------------------------------------------------ */

function assertUniqueRuntimeDecisionIds(
  decisions:
    readonly RecommendationEvolutionRuntimeDecision[],
): void {
  const ids =
    new Set<string>();

  for (const decision of decisions) {
    if (
      ids.has(
        decision.id,
      )
    ) {
      throw new Error(
        `Duplicate Recommendation Evolution Runtime Decision ID "${decision.id}".`,
      );
    }

    ids.add(
      decision.id,
    );
  }
}

function sameStringSet(
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

  const rightSet =
    new Set(
      right,
    );

  return left.every(
    (
      value,
    ) =>
      rightSet.has(
        value,
      ),
  );
}

function uniqueNonEmptyStrings(
  values:
    readonly string[],
): string[] {
  return [
    ...new Set(
      values.filter(
        (
          value,
        ) =>
          value.trim().length >
          0,
      ),
    ),
  ];
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