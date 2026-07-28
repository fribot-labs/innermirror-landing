import {
    isRecommendationAdaptationRuleStatus,
    isRecommendationAdaptationRuleType,
} from "./recommendationAdaptiveLearningTypes";

import {
    validateRecommendationLearningPatterns
} from "./detectRecommendationLearningPatterns";

import {
    validateRecommendationSignalReliabilityProfiles,
} from "./evaluateMemorySignalReliability";

import type {
    CreateRecommendationAdaptationRulesParams,
    RecommendationAdaptationRule,
    RecommendationAdaptationRuleStatus,
    RecommendationAdaptationRuleType,
    RecommendationAdaptiveLearningEntryState,
    RecommendationAdaptiveLearningMemorySignalType,
    RecommendationAdaptiveLearningRuntimeDecisionType,
    RecommendationAdaptiveLearningStrategyType,
    RecommendationLearningPattern,
    RecommendationRuntimeDecisionLearningProfile,
    RecommendationSignalReliabilityProfile,
    RecommendationStrategyLearningProfile,
    ValidateRecommendationAdaptationRuleParams
} from "./recommendationAdaptiveLearningTypes";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

/**
 * 개별 Pattern이 생성할 수 있는 최대 조정값입니다.
 *
 * MVP 단계에서는 단일 Pattern이 Runtime의 판단을 과도하게
 * 변경하지 못하도록 제한합니다.
 */
const MAXIMUM_RULE_ADJUSTMENT =
  0.35;

/**
 * 실제 적용 가능한 Rule의 기본 최소 조정값입니다.
 */
const MINIMUM_RULE_ADJUSTMENT =
  0.05;

/**
 * Confidence가 충분히 높을 때 Rule을 active 상태로 설정합니다.
 */
const ACTIVE_RULE_CONFIDENCE_THRESHOLD =
  0.75;

/**
 * 서로 반대되는 Rule을 충돌로 판단할 때 사용하는 허용 오차입니다.
 */
const NUMBER_EQUALITY_TOLERANCE =
  1e-10;

/* ------------------------------------------------------------------ */
/* Internal Candidate                                                 */
/* ------------------------------------------------------------------ */

type AdaptationRuleCandidate = {
  type:
    RecommendationAdaptationRuleType;

  targetStrategyType:
    RecommendationAdaptiveLearningStrategyType | null;

  targetDecisionType:
    RecommendationAdaptiveLearningRuntimeDecisionType | null;

  targetSignalType:
    RecommendationAdaptiveLearningMemorySignalType | null;

  appliesToState:
    RecommendationAdaptiveLearningEntryState | null;

  adjustment:
    number;

  confidence:
    number;

  sampleCount:
    number;

  reasoning:
    string[];

  sourcePatternIds:
    string[];

  evidenceObservationIds:
    string[];

  evidenceEntryIds:
    string[];

  evidenceComparisonIds:
    string[];
};

type CreateRuleFromCandidateParams = {
  candidate:
    AdaptationRuleCandidate;

  index:
    number;

  createdAt:
    string;

  createRuleId:
    CreateRecommendationAdaptationRulesParams["createRuleId"];
};

type PatternRuleContext = {
  pattern:
    RecommendationLearningPattern;

  strategyProfiles:
    readonly RecommendationStrategyLearningProfile[];

  runtimeDecisionProfiles:
    readonly RecommendationRuntimeDecisionLearningProfile[];

  signalReliabilityProfiles:
    readonly RecommendationSignalReliabilityProfile[];
};

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Learning Pattern을 Runtime이 사용할 수 있는
 * Adaptation Rule로 변환합니다.
 *
 * Rule은 사용자의 방향을 강제하지 않습니다.
 * 다음 Recommendation 판단에서 Strategy·Decision·Signal 선호도와
 * Evidence 요구 수준을 소폭 조정하는 가역적 Hint입니다.
 */
export function createRecommendationAdaptationRules(
  params:
    CreateRecommendationAdaptationRulesParams,
): RecommendationAdaptationRule[] {
  validateCreateRecommendationAdaptationRulesParams(
    params,
  );

  const candidates =
    params.patterns.flatMap(
      (
        pattern,
      ) =>
        createCandidatesFromPattern({
          pattern,

          strategyProfiles:
            params.strategyProfiles,

          runtimeDecisionProfiles:
            params.runtimeDecisionProfiles,

          signalReliabilityProfiles:
            params.signalReliabilityProfiles,
        }),
    );

  const thresholdedCandidates =
    candidates.filter(
      (
        candidate,
      ) =>
        candidate.sampleCount >=
          params.minimumSampleCount &&
        candidate.confidence >=
          params.minimumConfidence,
    );

  const mergedCandidates =
    mergeEquivalentRuleCandidates(
      thresholdedCandidates,
    );

  const resolvedCandidates =
    resolveCandidateConflicts(
      mergedCandidates,
    );

  const rules =
    resolvedCandidates.map(
      (
        candidate,
        index,
      ) =>
        createRuleFromCandidate({
          candidate,
          index,
          createdAt:
            params.createdAt,
          createRuleId:
            params.createRuleId,
        }),
    );

  const finalizedRules =
    finalizeRecommendationAdaptationRules(
      rules,
    );

  validateRecommendationAdaptationRules(
    finalizedRules,
  );

  validateAdaptationRuleEvidenceConsistency({
    rules:
      finalizedRules,

    patterns:
      params.patterns,
  });

  return finalizedRules.map(
    cloneRecommendationAdaptationRule,
  );
}

/* ------------------------------------------------------------------ */
/* Pattern Routing                                                    */
/* ------------------------------------------------------------------ */

function createCandidatesFromPattern(
  context:
    PatternRuleContext,
): AdaptationRuleCandidate[] {
  switch (
    context.pattern.type
  ) {
    case "strategy-success":
      return createStrategyPreferenceCandidates(
        context,
        true,
      );

    case "strategy-failure":
      return createStrategyPreferenceCandidates(
        context,
        false,
      );

    case "decision-success":
      return createDecisionPreferenceCandidates(
        context,
        true,
      );

    case "decision-failure":
      return createDecisionPreferenceCandidates(
        context,
        false,
      );

    case "state-strategy-mismatch":
      return createStateStrategyMismatchCandidates(
        context,
      );

    case "repeated-premature-advance":
      return createPrematureAdvanceCandidates(
        context,
      );

    case "persistent-over-observation":
      return createPersistentObservationCandidates(
        context,
      );

    case "effective-stabilization":
      return createEffectiveStabilizationCandidates(
        context,
      );

    case "effective-recovery":
      return createEffectiveRecoveryCandidates(
        context,
      );

    case "signal-overestimation":
      return createSignalConfidenceCandidates(
        context,
        false,
      );

    case "signal-underestimation":
      return createSignalConfidenceCandidates(
        context,
        true,
      );

    case "confidence-degradation":
      return createConfidenceDegradationCandidates(
        context,
      );

    case "confidence-recovery":
      return createConfidenceRecoveryCandidates(
        context,
      );

    case "conflicting-evidence":
      return [];

    case "insufficient-evidence":
      return [];
  }
}

/* ------------------------------------------------------------------ */
/* Strategy Preference                                                */
/* ------------------------------------------------------------------ */

function createStrategyPreferenceCandidates(
  context:
    PatternRuleContext,
  increase:
    boolean,
): AdaptationRuleCandidate[] {
  return context.pattern.relatedStrategyTypes.map(
    (
      strategyType,
    ) => {
      const profile =
        findStrategyProfile(
          context.strategyProfiles,
          strategyType,
        );

      const sampleCount =
        profile?.overall.sampleCount ??
        context.pattern.relatedObservationIds.length;

      return createBaseCandidate({
        pattern:
          context.pattern,

        type:
          increase
            ? "increase-strategy-preference"
            : "decrease-strategy-preference",

        targetStrategyType:
          strategyType,

        targetDecisionType:
          null,

        targetSignalType:
          null,

        appliesToState:
          resolvePatternState(
            context.pattern,
          ),

        adjustment:
          createSignedAdjustment(
            context.pattern.confidence,
            increase,
          ),

        sampleCount,

        reasoning: [
          increase
            ? `Strategy ${strategyType} was repeatedly associated with positive Recommendation outcomes.`
            : `Strategy ${strategyType} was repeatedly associated with weak or negative Recommendation outcomes.`,

          "The adjustment changes future Strategy preference without forcing or prohibiting the Strategy.",
        ],
      });
    },
  );
}

/* ------------------------------------------------------------------ */
/* Decision Preference                                                */
/* ------------------------------------------------------------------ */

function createDecisionPreferenceCandidates(
  context:
    PatternRuleContext,
  increase:
    boolean,
): AdaptationRuleCandidate[] {
  return context.pattern.relatedDecisionTypes.map(
    (
      decisionType,
    ) => {
      const profile =
        findRuntimeDecisionProfile(
          context.runtimeDecisionProfiles,
          decisionType,
        );

      const sampleCount =
        profile?.effectiveness.sampleCount ??
        context.pattern.relatedObservationIds.length;

      return createBaseCandidate({
        pattern:
          context.pattern,

        type:
          increase
            ? "increase-decision-preference"
            : "decrease-decision-preference",

        targetStrategyType:
          null,

        targetDecisionType:
          decisionType,

        targetSignalType:
          null,

        appliesToState:
          resolvePatternState(
            context.pattern,
          ),

        adjustment:
          createSignedAdjustment(
            context.pattern.confidence,
            increase,
          ),

        sampleCount,

        reasoning: [
          increase
            ? `Runtime decision ${decisionType} was repeatedly associated with positive Recommendation outcomes.`
            : `Runtime decision ${decisionType} was repeatedly associated with weak or negative Recommendation outcomes.`,

          "The adjustment changes future Decision preference without establishing causation.",
        ],
      });
    },
  );
}

/* ------------------------------------------------------------------ */
/* State–Strategy Mismatch                                            */
/* ------------------------------------------------------------------ */

function createStateStrategyMismatchCandidates(
  context:
    PatternRuleContext,
): AdaptationRuleCandidate[] {
  return context.pattern.relatedStrategyTypes.map(
    (
      strategyType,
    ) =>
      createBaseCandidate({
        pattern:
          context.pattern,

        type:
          "decrease-strategy-preference",

        targetStrategyType:
          strategyType,

        targetDecisionType:
          null,

        targetSignalType:
          null,

        appliesToState:
          resolvePatternState(
            context.pattern,
          ),

        adjustment:
          createSignedAdjustment(
            context.pattern.confidence,
            false,
          ),

        sampleCount:
          context.pattern.relatedObservationIds.length,

        reasoning: [
          `Strategy ${strategyType} showed context-dependent mismatch evidence.`,

          "The preference is reduced only for the observed state context when that context can be resolved.",
        ],
      }),
  );
}

/* ------------------------------------------------------------------ */
/* Premature Advance                                                  */
/* ------------------------------------------------------------------ */

function createPrematureAdvanceCandidates(
  context:
    PatternRuleContext,
): AdaptationRuleCandidate[] {
  const sampleCount =
    context.pattern.relatedObservationIds.length;

  return [
    createBaseCandidate({
      pattern:
        context.pattern,

      type:
        "delay-new-recommendation",

      targetStrategyType:
        null,

      targetDecisionType:
        null,

      targetSignalType:
        null,

      appliesToState:
        resolvePatternState(
          context.pattern,
        ),

      adjustment:
        createPositiveAdjustment(
          context.pattern.confidence,
        ),

      sampleCount,

      reasoning: [
        "Advance-related outcomes repeatedly stalled, fragmented, regressed, or redirected.",

        "The Runtime should delay a new Recommendation until stronger progress evidence is available.",
      ],
    }),

    createBaseCandidate({
      pattern:
        context.pattern,

      type:
        "require-more-evidence",

      targetStrategyType:
        null,

      targetDecisionType:
        null,

      targetSignalType:
        null,

      appliesToState:
        resolvePatternState(
          context.pattern,
        ),

      adjustment:
        createPositiveAdjustment(
          context.pattern.confidence,
        ),

      sampleCount,

      reasoning: [
        "Repeated premature advancement indicates that the current evidence threshold may be too low.",

        "The Runtime should request stronger completion or progress evidence before advancing.",
      ],
    }),

    ...context.pattern.relatedStrategyTypes.map(
      (
        strategyType,
      ) =>
        createBaseCandidate({
          pattern:
            context.pattern,

          type:
            "decrease-strategy-preference",

          targetStrategyType:
            strategyType,

          targetDecisionType:
            null,

          targetSignalType:
            null,

          appliesToState:
            resolvePatternState(
              context.pattern,
            ),

          adjustment:
            createSignedAdjustment(
              context.pattern.confidence,
              false,
            ),

          sampleCount,

          reasoning: [
            `Strategy ${strategyType} was repeatedly associated with premature advancement evidence.`,
          ],
        }),
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* Persistent Observation                                             */
/* ------------------------------------------------------------------ */

function createPersistentObservationCandidates(
  context:
    PatternRuleContext,
): AdaptationRuleCandidate[] {
  const sampleCount =
    context.pattern.relatedObservationIds.length;

  return [
    ...context.pattern.relatedStrategyTypes.map(
      (
        strategyType,
      ) =>
        createBaseCandidate({
          pattern:
            context.pattern,

          type:
            "decrease-strategy-preference",

          targetStrategyType:
            strategyType,

          targetDecisionType:
            null,

          targetSignalType:
            null,

          appliesToState:
            resolvePatternState(
              context.pattern,
            ),

          adjustment:
            createSignedAdjustment(
              context.pattern.confidence,
              false,
            ),

          sampleCount,

          reasoning: [
            `Strategy ${strategyType} persisted without corresponding progress or completion momentum.`,
          ],
        }),
    ),

    createBaseCandidate({
      pattern:
        context.pattern,

      type:
        "reduce-evidence-requirement",

      targetStrategyType:
        null,

      targetDecisionType:
        null,

      targetSignalType:
        null,

      appliesToState:
        resolvePatternState(
          context.pattern,
        ),

      adjustment:
        createNegativeAdjustment(
          context.pattern.confidence,
        ),

      sampleCount,

      reasoning: [
        "Persistent observation without progress may indicate that the Runtime is waiting for excessive evidence.",

        "The evidence requirement is reduced conservatively and remains reversible.",
      ],
    }),
  ];
}

/* ------------------------------------------------------------------ */
/* Effective Stabilization                                            */
/* ------------------------------------------------------------------ */

function createEffectiveStabilizationCandidates(
  context:
    PatternRuleContext,
): AdaptationRuleCandidate[] {
  const sampleCount =
    context.pattern.relatedObservationIds.length;

  return [
    createBaseCandidate({
      pattern:
        context.pattern,

      type:
        "prefer-stabilization",

      targetStrategyType:
        null,

      targetDecisionType:
        null,

      targetSignalType:
        null,

      appliesToState:
        resolvePatternState(
          context.pattern,
        ),

      adjustment:
        createPositiveAdjustment(
          context.pattern.confidence,
        ),

      sampleCount,

      reasoning: [
        "Stabilization was repeatedly associated with improved stability or reduced Recommendation risk.",
      ],
    }),

    ...context.pattern.relatedStrategyTypes.map(
      (
        strategyType,
      ) =>
        createBaseCandidate({
          pattern:
            context.pattern,

          type:
            "increase-strategy-preference",

          targetStrategyType:
            strategyType,

          targetDecisionType:
            null,

          targetSignalType:
            null,

          appliesToState:
            resolvePatternState(
              context.pattern,
            ),

          adjustment:
            createSignedAdjustment(
              context.pattern.confidence,
              true,
            ),

          sampleCount,

          reasoning: [
            `Strategy ${strategyType} was associated with effective stabilization outcomes.`,
          ],
        }),
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* Effective Recovery                                                 */
/* ------------------------------------------------------------------ */

function createEffectiveRecoveryCandidates(
  context:
    PatternRuleContext,
): AdaptationRuleCandidate[] {
  const sampleCount =
    context.pattern.relatedObservationIds.length;

  return [
    createBaseCandidate({
      pattern:
        context.pattern,

      type:
        "prefer-recovery",

      targetStrategyType:
        null,

      targetDecisionType:
        null,

      targetSignalType:
        null,

      appliesToState:
        resolvePatternState(
          context.pattern,
        ),

      adjustment:
        createPositiveAdjustment(
          context.pattern.confidence,
        ),

      sampleCount,

      reasoning: [
        "Recovery-related behavior was repeatedly associated with movement away from stalled or fragmented states.",
      ],
    }),

    ...context.pattern.relatedStrategyTypes.map(
      (
        strategyType,
      ) =>
        createBaseCandidate({
          pattern:
            context.pattern,

          type:
            "increase-strategy-preference",

          targetStrategyType:
            strategyType,

          targetDecisionType:
            null,

          targetSignalType:
            null,

          appliesToState:
            resolvePatternState(
              context.pattern,
            ),

          adjustment:
            createSignedAdjustment(
              context.pattern.confidence,
              true,
            ),

          sampleCount,

          reasoning: [
            `Strategy ${strategyType} was associated with effective recovery outcomes.`,
          ],
        }),
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* Signal Confidence                                                  */
/* ------------------------------------------------------------------ */

function createSignalConfidenceCandidates(
  context:
    PatternRuleContext,
  increase:
    boolean,
): AdaptationRuleCandidate[] {
  return context.pattern.relatedSignalTypes.map(
    (
      signalType,
    ) => {
      const profile =
        findSignalReliabilityProfile(
          context.signalReliabilityProfiles,
          signalType,
        );

      return createBaseCandidate({
        pattern:
          context.pattern,

        type:
          increase
            ? "raise-signal-confidence"
            : "lower-signal-confidence",

        targetStrategyType:
          null,

        targetDecisionType:
          null,

        targetSignalType:
          signalType,

        appliesToState:
          null,

        adjustment:
          createSignedAdjustment(
            context.pattern.confidence,
            increase,
          ),

        sampleCount:
          profile?.sampleCount ??
          context.pattern.relatedObservationIds.length,

        reasoning: [
          increase
            ? `Memory signal ${signalType} was confirmed consistently in related observations.`
            : `Memory signal ${signalType} was contradicted frequently in related observations.`,

          "This rule adjusts future Signal confidence rather than removing the Signal.",
        ],
      });
    },
  );
}

/* ------------------------------------------------------------------ */
/* Confidence Degradation                                             */
/* ------------------------------------------------------------------ */

function createConfidenceDegradationCandidates(
  context:
    PatternRuleContext,
): AdaptationRuleCandidate[] {
  return [
    createBaseCandidate({
      pattern:
        context.pattern,

      type:
        "require-more-evidence",

      targetStrategyType:
        null,

      targetDecisionType:
        null,

      targetSignalType:
        null,

      appliesToState:
        resolvePatternState(
          context.pattern,
        ),

      adjustment:
        createPositiveAdjustment(
          context.pattern.confidence,
        ),

      sampleCount:
        context.pattern.relatedObservationIds.length,

      reasoning: [
        "Assessment confidence changes were associated with weak or negative Recommendation outcomes.",

        "The Runtime should gather additional evidence before making a stronger directional change.",
      ],
    }),
  ];
}

/* ------------------------------------------------------------------ */
/* Confidence Recovery                                                */
/* ------------------------------------------------------------------ */

function createConfidenceRecoveryCandidates(
  context:
    PatternRuleContext,
): AdaptationRuleCandidate[] {
  return [
    createBaseCandidate({
      pattern:
        context.pattern,

      type:
        "reduce-evidence-requirement",

      targetStrategyType:
        null,

      targetDecisionType:
        null,

      targetSignalType:
        null,

      appliesToState:
        resolvePatternState(
          context.pattern,
        ),

      adjustment:
        createNegativeAdjustment(
          context.pattern.confidence,
        ),

      sampleCount:
        context.pattern.relatedObservationIds.length,

      reasoning: [
        "Confidence recovery was repeatedly associated with improved or recovered outcomes.",

        "The Runtime may reduce evidence pressure slightly while preserving reversibility.",
      ],
    }),
  ];
}

/* ------------------------------------------------------------------ */
/* Candidate Factory                                                  */
/* ------------------------------------------------------------------ */

function createBaseCandidate(
  params: {
    pattern:
      RecommendationLearningPattern;

    type:
      RecommendationAdaptationRuleType;

    targetStrategyType:
      RecommendationAdaptiveLearningStrategyType | null;

    targetDecisionType:
      RecommendationAdaptiveLearningRuntimeDecisionType | null;

    targetSignalType:
      RecommendationAdaptiveLearningMemorySignalType | null;

    appliesToState:
      RecommendationAdaptiveLearningEntryState | null;

    adjustment:
      number;

    sampleCount:
      number;

    reasoning:
      string[];
  },
): AdaptationRuleCandidate {
  return {
    type:
      params.type,

    targetStrategyType:
      params.targetStrategyType,

    targetDecisionType:
      params.targetDecisionType,

    targetSignalType:
      params.targetSignalType,

    appliesToState:
      params.appliesToState,

    adjustment:
      roundScore(
        clampAdjustment(
          params.adjustment,
        ),
      ),

    confidence:
      roundScore(
        clampUnitInterval(
          params.pattern.confidence,
        ),
      ),

    sampleCount:
      params.sampleCount,

    reasoning: [
      ...params.reasoning,
      `Source learning pattern: ${params.pattern.type}.`,
    ],

    sourcePatternIds: [
      params.pattern.id,
    ],

    evidenceObservationIds: [
      ...params.pattern.relatedObservationIds,
    ],

    evidenceEntryIds: [
      ...params.pattern.relatedEntryIds,
    ],

    evidenceComparisonIds: [
      ...params.pattern.relatedComparisonIds,
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Rule Factory                                                       */
/* ------------------------------------------------------------------ */

function createRuleFromCandidate(
  params:
    CreateRuleFromCandidateParams,
): RecommendationAdaptationRule {
  const {
    candidate,
    index,
    createdAt,
    createRuleId,
  } = params;

  const id =
    createRuleId(
      candidate.type,
      index,
    );

  validateRequiredIdentifier(
    id,
    "Recommendation Adaptation Rule id",
  );

  const rule:
    RecommendationAdaptationRule = {
      id,

      type:
        candidate.type,

      status:
        resolveInitialRuleStatus(
          candidate,
        ),

      targetStrategyType:
        candidate.targetStrategyType,

      targetDecisionType:
        candidate.targetDecisionType,

      targetSignalType:
        candidate.targetSignalType,

      appliesToState:
        candidate.appliesToState,

      adjustment:
        roundScore(
          clampAdjustment(
            candidate.adjustment,
          ),
        ),

      confidence:
        roundScore(
          clampUnitInterval(
            candidate.confidence,
          ),
        ),

      sampleCount:
        candidate.sampleCount,

      reasoning:
        uniqueStrings(
          candidate.reasoning,
        ),

      sourcePatternIds:
        uniqueStrings(
          candidate.sourcePatternIds,
        ),

      evidenceObservationIds:
        uniqueStrings(
          candidate.evidenceObservationIds,
        ),

      evidenceEntryIds:
        uniqueStrings(
          candidate.evidenceEntryIds,
        ),

      evidenceComparisonIds:
        uniqueStrings(
          candidate.evidenceComparisonIds,
        ),

      createdAt,
    };

  validateRecommendationAdaptationRule({
    rule,
  });

  return rule;
}

/* ------------------------------------------------------------------ */
/* Initial Status                                                     */
/* ------------------------------------------------------------------ */

function resolveInitialRuleStatus(
  candidate:
    AdaptationRuleCandidate,
): RecommendationAdaptationRuleStatus {
  if (
    candidate.confidence >=
      ACTIVE_RULE_CONFIDENCE_THRESHOLD &&
    Math.abs(
      candidate.adjustment,
    ) >=
      MINIMUM_RULE_ADJUSTMENT
  ) {
    return "active";
  }

  return "proposed";
}

/* ------------------------------------------------------------------ */
/* Candidate Merge                                                    */
/* ------------------------------------------------------------------ */

function mergeEquivalentRuleCandidates(
  candidates:
    readonly AdaptationRuleCandidate[],
): AdaptationRuleCandidate[] {
  const candidateByKey =
    new Map<
      string,
      AdaptationRuleCandidate
    >();

  candidates.forEach(
    (
      candidate,
    ) => {
      const key =
        createCandidateKey(
          candidate,
        );

      const existing =
        candidateByKey.get(
          key,
        );

      if (
        existing ===
        undefined
      ) {
        candidateByKey.set(
          key,
          cloneRuleCandidate(
            candidate,
          ),
        );

        return;
      }

      candidateByKey.set(
        key,
        mergeRuleCandidates(
          existing,
          candidate,
        ),
      );
    },
  );

  return Array.from(
    candidateByKey.values(),
  );
}

function createCandidateKey(
  candidate:
    AdaptationRuleCandidate,
): string {
  return [
    candidate.type,
    candidate.targetStrategyType ??
      "",
    candidate.targetDecisionType ??
      "",
    candidate.targetSignalType ??
      "",
    candidate.appliesToState ??
      "",
  ].join(
    "|",
  );
}

function mergeRuleCandidates(
  left:
    AdaptationRuleCandidate,
  right:
    AdaptationRuleCandidate,
): AdaptationRuleCandidate {
  const totalSampleCount =
    left.sampleCount +
    right.sampleCount;

  const weightedConfidence =
    totalSampleCount ===
    0
      ? Math.max(
          left.confidence,
          right.confidence,
        )
      : (
          left.confidence *
            left.sampleCount +
          right.confidence *
            right.sampleCount
        ) /
        totalSampleCount;

  const weightedAdjustment =
    totalSampleCount ===
    0
      ? (
          left.adjustment +
          right.adjustment
        ) /
        2
      : (
          left.adjustment *
            left.sampleCount +
          right.adjustment *
            right.sampleCount
        ) /
        totalSampleCount;

  return {
    ...left,

    adjustment:
      roundScore(
        clampAdjustment(
          weightedAdjustment,
        ),
      ),

    confidence:
      roundScore(
        clampUnitInterval(
          weightedConfidence,
        ),
      ),

    sampleCount:
      totalSampleCount,

    reasoning:
      uniqueStrings([
        ...left.reasoning,
        ...right.reasoning,
      ]),

    sourcePatternIds:
      uniqueStrings([
        ...left.sourcePatternIds,
        ...right.sourcePatternIds,
      ]),

    evidenceObservationIds:
      uniqueStrings([
        ...left.evidenceObservationIds,
        ...right.evidenceObservationIds,
      ]),

    evidenceEntryIds:
      uniqueStrings([
        ...left.evidenceEntryIds,
        ...right.evidenceEntryIds,
      ]),

    evidenceComparisonIds:
      uniqueStrings([
        ...left.evidenceComparisonIds,
        ...right.evidenceComparisonIds,
      ]),
  };
}

/* ------------------------------------------------------------------ */
/* Candidate Conflict Resolution                                      */
/* ------------------------------------------------------------------ */

function resolveCandidateConflicts(
  candidates:
    readonly AdaptationRuleCandidate[],
): AdaptationRuleCandidate[] {
  const conflictedKeys =
    findConflictedCandidateTargetKeys(
      candidates,
    );

  return candidates.map(
    (
      candidate,
    ) => {
      const targetKey =
        createCandidateTargetKey(
          candidate,
        );

      if (
        !conflictedKeys.has(
          targetKey,
        )
      ) {
        return cloneRuleCandidate(
          candidate,
        );
      }

      return {
        ...cloneRuleCandidate(
          candidate,
        ),

        confidence:
          roundScore(
            candidate.confidence *
              0.5,
          ),

        reasoning: [
          ...candidate.reasoning,
          "Opposing adaptation evidence exists for the same target. The rule remains conflicted and must not be applied automatically.",
        ],
      };
    },
  );
}

function findConflictedCandidateTargetKeys(
  candidates:
    readonly AdaptationRuleCandidate[],
): Set<string> {
  const directionsByTarget =
    new Map<
      string,
      Set<
        "positive" | "negative"
      >
    >();

  candidates.forEach(
    (
      candidate,
    ) => {
      const direction =
        resolveCandidateDirection(
          candidate.type,
        );

      if (
        direction ===
        null
      ) {
        return;
      }

      const key =
        createCandidateTargetKey(
          candidate,
        );

      const directions =
        directionsByTarget.get(
          key,
        ) ??
        new Set<
          "positive" | "negative"
        >();

      directions.add(
        direction,
      );

      directionsByTarget.set(
        key,
        directions,
      );
    },
  );

  const conflicted =
    new Set<string>();

  directionsByTarget.forEach(
    (
      directions,
      key,
    ) => {
      if (
        directions.has(
          "positive",
        ) &&
        directions.has(
          "negative",
        )
      ) {
        conflicted.add(
          key,
        );
      }
    },
  );

  return conflicted;
}

function createCandidateTargetKey(
  candidate:
    AdaptationRuleCandidate,
): string {
  if (
    candidate.targetStrategyType !==
    null
  ) {
    return `strategy:${candidate.targetStrategyType}:${candidate.appliesToState ?? "*"}`;
  }

  if (
    candidate.targetDecisionType !==
    null
  ) {
    return `decision:${candidate.targetDecisionType}:${candidate.appliesToState ?? "*"}`;
  }

  if (
    candidate.targetSignalType !==
    null
  ) {
    return `signal:${candidate.targetSignalType}`;
  }

  return `global:${resolveGlobalRuleFamily(candidate.type)}:${candidate.appliesToState ?? "*"}`;
}

function resolveCandidateDirection(
  type:
    RecommendationAdaptationRuleType,
): "positive" | "negative" | null {
  switch (
    type
  ) {
    case "increase-strategy-preference":
    case "increase-decision-preference":
    case "allow-earlier-recommendation":
    case "prefer-stabilization":
    case "prefer-recovery":
    case "allow-redirection":
    case "raise-signal-confidence":
      return "positive";

    case "decrease-strategy-preference":
    case "decrease-decision-preference":
    case "require-more-evidence":
    case "delay-new-recommendation":
    case "reduce-redirection":
    case "lower-signal-confidence":
      return "negative";

    case "reduce-evidence-requirement":
      return "positive";
  }
}

function resolveGlobalRuleFamily(
  type:
    RecommendationAdaptationRuleType,
): string {
  switch (
    type
  ) {
    case "require-more-evidence":
    case "reduce-evidence-requirement":
      return "evidence";

    case "delay-new-recommendation":
    case "allow-earlier-recommendation":
      return "recommendation-threshold";

    case "reduce-redirection":
    case "allow-redirection":
      return "redirection";

    case "prefer-stabilization":
      return "stabilization";

    case "prefer-recovery":
      return "recovery";

    default:
      return type;
  }
}

/* ------------------------------------------------------------------ */
/* Finalization                                                       */
/* ------------------------------------------------------------------ */

export function finalizeRecommendationAdaptationRules(
  rules:
    readonly RecommendationAdaptationRule[],
): RecommendationAdaptationRule[] {
  validateRecommendationAdaptationRules(
    rules,
  );

  const conflictedTargets =
    findRuleConflictTargets(
      rules,
    );

  return rules
    .map(
      (
        rule,
      ) => {
        const targetKey =
          createRuleTargetKey(
            rule,
          );

        const status:
          RecommendationAdaptationRuleStatus =
          conflictedTargets.has(
            targetKey,
          )
            ? "conflicted"
            : rule.status;

        return {
          ...cloneRecommendationAdaptationRule(
            rule,
          ),

          status,

          reasoning:
            uniqueStrings(
              rule.reasoning,
            ).sort(),

          sourcePatternIds:
            uniqueStrings(
              rule.sourcePatternIds,
            ).sort(),

          evidenceObservationIds:
            uniqueStrings(
              rule.evidenceObservationIds,
            ).sort(),

          evidenceEntryIds:
            uniqueStrings(
              rule.evidenceEntryIds,
            ).sort(),

          evidenceComparisonIds:
            uniqueStrings(
              rule.evidenceComparisonIds,
            ).sort(),
        };
      },
    )
    .sort(
      compareRecommendationAdaptationRules,
    );
}

function findRuleConflictTargets(
  rules:
    readonly RecommendationAdaptationRule[],
): Set<string> {
  const directionByTarget =
    new Map<
      string,
      Set<
        "positive" | "negative"
      >
    >();

  rules.forEach(
    (
      rule,
    ) => {
      const direction =
        resolveCandidateDirection(
          rule.type,
        );

      if (
        direction ===
        null
      ) {
        return;
      }

      const key =
        createRuleTargetKey(
          rule,
        );

      const directions =
        directionByTarget.get(
          key,
        ) ??
        new Set<
          "positive" | "negative"
        >();

      directions.add(
        direction,
      );

      directionByTarget.set(
        key,
        directions,
      );
    },
  );

  const conflicted =
    new Set<string>();

  directionByTarget.forEach(
    (
      directions,
      key,
    ) => {
      if (
        directions.has(
          "positive",
        ) &&
        directions.has(
          "negative",
        )
      ) {
        conflicted.add(
          key,
        );
      }
    },
  );

  return conflicted;
}

function createRuleTargetKey(
  rule:
    RecommendationAdaptationRule,
): string {
  return createCandidateTargetKey({
    type:
      rule.type,

    targetStrategyType:
      rule.targetStrategyType,

    targetDecisionType:
      rule.targetDecisionType,

    targetSignalType:
      rule.targetSignalType,

    appliesToState:
      rule.appliesToState,

    adjustment:
      rule.adjustment,

    confidence:
      rule.confidence,

    sampleCount:
      rule.sampleCount,

    reasoning:
      rule.reasoning,

    sourcePatternIds:
      rule.sourcePatternIds,

    evidenceObservationIds:
      rule.evidenceObservationIds,

    evidenceEntryIds:
      rule.evidenceEntryIds,

    evidenceComparisonIds:
      rule.evidenceComparisonIds,
  });
}

function compareRecommendationAdaptationRules(
  left:
    RecommendationAdaptationRule,
  right:
    RecommendationAdaptationRule,
): number {
  const statusDifference =
    getRuleStatusPriority(
      right.status,
    ) -
    getRuleStatusPriority(
      left.status,
    );

  if (
    statusDifference !==
    0
  ) {
    return statusDifference;
  }

  if (
    !areNumbersApproximatelyEqual(
      left.confidence,
      right.confidence,
    )
  ) {
    return right.confidence -
      left.confidence;
  }

  const adjustmentDifference =
    Math.abs(
      right.adjustment,
    ) -
    Math.abs(
      left.adjustment,
    );

  if (
    !areNumbersApproximatelyEqual(
      adjustmentDifference,
      0,
    )
  ) {
    return adjustmentDifference;
  }

  const typeDifference =
    left.type.localeCompare(
      right.type,
    );

  if (
    typeDifference !==
    0
  ) {
    return typeDifference;
  }

  return left.id.localeCompare(
    right.id,
  );
}

function getRuleStatusPriority(
  status:
    RecommendationAdaptationRuleStatus,
): number {
  switch (
    status
  ) {
    case "active":
      return 4;

    case "proposed":
      return 3;

    case "conflicted":
      return 2;

    case "suppressed":
      return 1;
  }
}

/* ------------------------------------------------------------------ */
/* Public Validation                                                  */
/* ------------------------------------------------------------------ */

export function validateRecommendationAdaptationRule(
  params:
    ValidateRecommendationAdaptationRuleParams,
): void {
  const {
    rule,
  } = params;

  if (
    typeof rule !==
      "object" ||
    rule ===
      null ||
    Array.isArray(
      rule,
    )
  ) {
    throw new Error(
      "Recommendation Adaptation Rule must be an object.",
    );
  }

  validateRequiredIdentifier(
    rule.id,
    "Recommendation Adaptation Rule id",
  );

  if (
    !isRecommendationAdaptationRuleType(
      rule.type,
    )
  ) {
    throw new Error(
      "Recommendation Adaptation Rule type is invalid.",
    );
  }

  if (
    !isRecommendationAdaptationRuleStatus(
      rule.status,
    )
  ) {
    throw new Error(
      "Recommendation Adaptation Rule status is invalid.",
    );
  }

  validateNullableString(
    rule.targetStrategyType,
    "targetStrategyType",
  );

  validateNullableString(
    rule.targetDecisionType,
    "targetDecisionType",
  );

  validateNullableString(
    rule.targetSignalType,
    "targetSignalType",
  );

  validateNullableString(
    rule.appliesToState,
    "appliesToState",
  );

  validateFiniteNumber(
    rule.adjustment,
    "adjustment",
  );

  if (
    rule.adjustment <
      -MAXIMUM_RULE_ADJUSTMENT ||
    rule.adjustment >
      MAXIMUM_RULE_ADJUSTMENT
  ) {
    throw new Error(
      `Recommendation Adaptation Rule adjustment must be between -${MAXIMUM_RULE_ADJUSTMENT} and ${MAXIMUM_RULE_ADJUSTMENT}.`,
    );
  }

  validateUnitInterval(
    rule.confidence,
    "confidence",
  );

  validateNonNegativeInteger(
    rule.sampleCount,
    "sampleCount",
  );

  validateUniqueNonEmptyStringArray(
    rule.reasoning,
    "reasoning",
  );

  validateUniqueIdentifierArray(
    rule.sourcePatternIds,
    "sourcePatternIds",
  );

  validateUniqueIdentifierArray(
    rule.evidenceObservationIds,
    "evidenceObservationIds",
  );

  validateUniqueIdentifierArray(
    rule.evidenceEntryIds,
    "evidenceEntryIds",
  );

  validateUniqueIdentifierArray(
    rule.evidenceComparisonIds,
    "evidenceComparisonIds",
  );

  validateTimestamp(
    rule.createdAt,
    "createdAt",
  );

  validateRuleTargetContract(
    rule,
  );

  if (
    rule.sourcePatternIds.length ===
    0
  ) {
    throw new Error(
      "Recommendation Adaptation Rule must reference at least one source Pattern.",
    );
  }

  if (
    rule.status ===
      "active" &&
    (
      rule.confidence <
        ACTIVE_RULE_CONFIDENCE_THRESHOLD ||
      Math.abs(
        rule.adjustment,
      ) <
        MINIMUM_RULE_ADJUSTMENT
    )
  ) {
    throw new Error(
      "Active Recommendation Adaptation Rule must meet confidence and adjustment thresholds.",
    );
  }
}

function validateRuleTargetContract(
  rule:
    RecommendationAdaptationRule,
): void {
  switch (
    rule.type
  ) {
    case "increase-strategy-preference":
    case "decrease-strategy-preference":
      requireSingleTarget({
        rule,
        required:
          "strategy",
      });
      return;

    case "increase-decision-preference":
    case "decrease-decision-preference":
      requireSingleTarget({
        rule,
        required:
          "decision",
      });
      return;

    case "lower-signal-confidence":
    case "raise-signal-confidence":
      requireSingleTarget({
        rule,
        required:
          "signal",
      });
      return;

    case "require-more-evidence":
    case "reduce-evidence-requirement":
    case "delay-new-recommendation":
    case "allow-earlier-recommendation":
    case "prefer-stabilization":
    case "prefer-recovery":
    case "reduce-redirection":
    case "allow-redirection":
      if (
        rule.targetStrategyType !==
          null ||
        rule.targetDecisionType !==
          null ||
        rule.targetSignalType !==
          null
      ) {
        throw new Error(
          `Recommendation Adaptation Rule ${rule.type} must not define a direct Strategy, Decision, or Signal target.`,
        );
      }
      return;
  }
}

function requireSingleTarget(
  params: {
    rule:
      RecommendationAdaptationRule;

    required:
      "strategy" | "decision" | "signal";
  },
): void {
  const {
    rule,
    required,
  } = params;

  const hasStrategy =
    rule.targetStrategyType !==
    null;

  const hasDecision =
    rule.targetDecisionType !==
    null;

  const hasSignal =
    rule.targetSignalType !==
    null;

  const targetCount =
    Number(
      hasStrategy,
    ) +
    Number(
      hasDecision,
    ) +
    Number(
      hasSignal,
    );

  if (
    targetCount !==
    1
  ) {
    throw new Error(
      "Targeted Recommendation Adaptation Rule must define exactly one target.",
    );
  }

  if (
    required ===
      "strategy" &&
    !hasStrategy
  ) {
    throw new Error(
      "Recommendation Adaptation Rule requires targetStrategyType.",
    );
  }

  if (
    required ===
      "decision" &&
    !hasDecision
  ) {
    throw new Error(
      "Recommendation Adaptation Rule requires targetDecisionType.",
    );
  }

  if (
    required ===
      "signal" &&
    !hasSignal
  ) {
    throw new Error(
      "Recommendation Adaptation Rule requires targetSignalType.",
    );
  }
}

export function validateRecommendationAdaptationRules(
  rules:
    readonly RecommendationAdaptationRule[],
): void {
  if (
    !Array.isArray(
      rules,
    )
  ) {
    throw new Error(
      "Recommendation Adaptation Rules must be an array.",
    );
  }

  const observedIds =
    new Set<string>();

  rules.forEach(
    (
      rule,
      index,
    ) => {
      try {
        validateRecommendationAdaptationRule({
          rule,
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
          `Recommendation Adaptation Rule at index ${index} is invalid: ${message}`,
        );
      }

      if (
        observedIds.has(
          rule.id,
        )
      ) {
        throw new Error(
          `Recommendation Adaptation Rules must not contain duplicate id: ${rule.id}.`,
        );
      }

      observedIds.add(
        rule.id,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Evidence Consistency                                               */
/* ------------------------------------------------------------------ */

function validateAdaptationRuleEvidenceConsistency(
  params: {
    rules:
      readonly RecommendationAdaptationRule[];

    patterns:
      readonly RecommendationLearningPattern[];
  },
): void {
  const patternIds =
    new Set(
      params.patterns.map(
        (
          pattern,
        ) =>
          pattern.id,
      ),
    );

  params.rules.forEach(
    (
      rule,
      index,
    ) => {
      rule.sourcePatternIds.forEach(
        (
          patternId,
        ) => {
          if (
            !patternIds.has(
              patternId,
            )
          ) {
            throw new Error(
              `rules[${index}].sourcePatternIds references an unknown Pattern: ${patternId}.`,
            );
          }
        },
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validateCreateRecommendationAdaptationRulesParams(
  params:
    CreateRecommendationAdaptationRulesParams,
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
      "Create Recommendation Adaptation Rules params must be an object.",
    );
  }

  validateRecommendationLearningPatterns(
    params.patterns,
  );

  validateStrategyProfiles(
    params.strategyProfiles,
  );

  validateRuntimeDecisionProfiles(
    params.runtimeDecisionProfiles,
  );

  validateRecommendationSignalReliabilityProfiles(
    params.signalReliabilityProfiles,
  );

  validatePositiveInteger(
    params.minimumSampleCount,
    "minimumSampleCount",
  );

  validateUnitInterval(
    params.minimumConfidence,
    "minimumConfidence",
  );

  validateTimestamp(
    params.createdAt,
    "createdAt",
  );

  if (
    typeof params.createRuleId !==
    "function"
  ) {
    throw new Error(
      "createRuleId must be a function.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Profile Validation                                                 */
/* ------------------------------------------------------------------ */

function validateStrategyProfiles(
  profiles:
    readonly RecommendationStrategyLearningProfile[],
): void {
  if (
    !Array.isArray(
      profiles,
    )
  ) {
    throw new Error(
      "Recommendation Strategy Learning Profiles must be an array.",
    );
  }

  const observed =
    new Set<string>();

  profiles.forEach(
    (
      profile,
      index,
    ) => {
      validateRequiredString(
        profile.strategyType,
        `strategyProfiles[${index}].strategyType`,
      );

      validateEffectiveness(
        profile.overall,
        `strategyProfiles[${index}].overall`,
      );

      if (
        observed.has(
          profile.strategyType,
        )
      ) {
        throw new Error(
          `Strategy Profiles must not contain duplicate strategyType: ${profile.strategyType}.`,
        );
      }

      observed.add(
        profile.strategyType,
      );
    },
  );
}

function validateRuntimeDecisionProfiles(
  profiles:
    readonly RecommendationRuntimeDecisionLearningProfile[],
): void {
  if (
    !Array.isArray(
      profiles,
    )
  ) {
    throw new Error(
      "Recommendation Runtime Decision Learning Profiles must be an array.",
    );
  }

  const observed =
    new Set<string>();

  profiles.forEach(
    (
      profile,
      index,
    ) => {
      validateRequiredString(
        profile.decisionType,
        `runtimeDecisionProfiles[${index}].decisionType`,
      );

      validateEffectiveness(
        profile.effectiveness,
        `runtimeDecisionProfiles[${index}].effectiveness`,
      );

      if (
        observed.has(
          profile.decisionType,
        )
      ) {
        throw new Error(
          `Runtime Decision Profiles must not contain duplicate decisionType: ${profile.decisionType}.`,
        );
      }

      observed.add(
        profile.decisionType,
      );
    },
  );
}

function validateEffectiveness(
  effectiveness: {
    sampleCount:
      number;

    confidence:
      number;

    effectivenessScore:
      number;
  },
  fieldName:
    string,
): void {
  validateNonNegativeInteger(
    effectiveness.sampleCount,
    `${fieldName}.sampleCount`,
  );

  validateUnitInterval(
    effectiveness.confidence,
    `${fieldName}.confidence`,
  );

  validateUnitInterval(
    effectiveness.effectivenessScore,
    `${fieldName}.effectivenessScore`,
  );
}

/* ------------------------------------------------------------------ */
/* Profile Lookup                                                     */
/* ------------------------------------------------------------------ */

function findStrategyProfile(
  profiles:
    readonly RecommendationStrategyLearningProfile[],
  strategyType:
    RecommendationAdaptiveLearningStrategyType,
): RecommendationStrategyLearningProfile | null {
  return profiles.find(
    (
      profile,
    ) =>
      profile.strategyType ===
      strategyType,
  ) ??
    null;
}

function findRuntimeDecisionProfile(
  profiles:
    readonly RecommendationRuntimeDecisionLearningProfile[],
  decisionType:
    RecommendationAdaptiveLearningRuntimeDecisionType,
): RecommendationRuntimeDecisionLearningProfile | null {
  return profiles.find(
    (
      profile,
    ) =>
      profile.decisionType ===
      decisionType,
  ) ??
    null;
}

function findSignalReliabilityProfile(
  profiles:
    readonly RecommendationSignalReliabilityProfile[],
  signalType:
    RecommendationAdaptiveLearningMemorySignalType,
): RecommendationSignalReliabilityProfile | null {
  return profiles.find(
    (
      profile,
    ) =>
      profile.signalType ===
      signalType,
  ) ??
    null;
}

/* ------------------------------------------------------------------ */
/* State Resolution                                                   */
/* ------------------------------------------------------------------ */

/**
 * 현재 Pattern 계약에는 State 배열이 별도로 보존되지 않으므로
 * 특정 State를 확정적으로 복원할 수 없습니다.
 *
 * 이후 Pattern 계약에 relatedStateTypes가 추가되기 전까지는
 * 전역 적용 가능한 null을 사용합니다.
 */
function resolvePatternState(
  _pattern:
    RecommendationLearningPattern,
): RecommendationAdaptiveLearningEntryState | null {
  return null;
}

/* ------------------------------------------------------------------ */
/* Adjustment Calculation                                             */
/* ------------------------------------------------------------------ */

function createPositiveAdjustment(
  confidence:
    number,
): number {
  return calculateAdjustmentMagnitude(
    confidence,
  );
}

function createNegativeAdjustment(
  confidence:
    number,
): number {
  return -calculateAdjustmentMagnitude(
    confidence,
  );
}

function createSignedAdjustment(
  confidence:
    number,
  positive:
    boolean,
): number {
  const magnitude =
    calculateAdjustmentMagnitude(
      confidence,
    );

  return positive
    ? magnitude
    : -magnitude;
}

function calculateAdjustmentMagnitude(
  confidence:
    number,
): number {
  const normalizedConfidence =
    clampUnitInterval(
      confidence,
    );

  return clampAdjustment(
    MINIMUM_RULE_ADJUSTMENT +
    normalizedConfidence *
      (
        MAXIMUM_RULE_ADJUSTMENT -
        MINIMUM_RULE_ADJUSTMENT
      ),
  );
}

/* ------------------------------------------------------------------ */
/* Clone                                                              */
/* ------------------------------------------------------------------ */

export function cloneRecommendationAdaptationRule(
  rule:
    RecommendationAdaptationRule,
): RecommendationAdaptationRule {
  validateRecommendationAdaptationRule({
    rule,
  });

  return {
    ...rule,

    reasoning: [
      ...rule.reasoning,
    ],

    sourcePatternIds: [
      ...rule.sourcePatternIds,
    ],

    evidenceObservationIds: [
      ...rule.evidenceObservationIds,
    ],

    evidenceEntryIds: [
      ...rule.evidenceEntryIds,
    ],

    evidenceComparisonIds: [
      ...rule.evidenceComparisonIds,
    ],
  };
}

function cloneRuleCandidate(
  candidate:
    AdaptationRuleCandidate,
): AdaptationRuleCandidate {
  return {
    ...candidate,

    reasoning: [
      ...candidate.reasoning,
    ],

    sourcePatternIds: [
      ...candidate.sourcePatternIds,
    ],

    evidenceObservationIds: [
      ...candidate.evidenceObservationIds,
    ],

    evidenceEntryIds: [
      ...candidate.evidenceEntryIds,
    ],

    evidenceComparisonIds: [
      ...candidate.evidenceComparisonIds,
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Query Helpers                                                      */
/* ------------------------------------------------------------------ */

export function findRecommendationAdaptationRuleById(
  params: {
    rules:
      readonly RecommendationAdaptationRule[];

    ruleId:
      string;
  },
): RecommendationAdaptationRule | null {
  validateRecommendationAdaptationRules(
    params.rules,
  );

  validateRequiredIdentifier(
    params.ruleId,
    "ruleId",
  );

  const rule =
    params.rules.find(
      (
        candidate,
      ) =>
        candidate.id ===
        params.ruleId,
    );

  return rule ===
    undefined
    ? null
    : cloneRecommendationAdaptationRule(
        rule,
      );
}

export function findRecommendationAdaptationRulesByType(
  params: {
    rules:
      readonly RecommendationAdaptationRule[];

    type:
      RecommendationAdaptationRuleType;
  },
): RecommendationAdaptationRule[] {
  validateRecommendationAdaptationRules(
    params.rules,
  );

  if (
    !isRecommendationAdaptationRuleType(
      params.type,
    )
  ) {
    throw new Error(
      "Recommendation Adaptation Rule query type is invalid.",
    );
  }

  return params.rules
    .filter(
      (
        rule,
      ) =>
        rule.type ===
        params.type,
    )
    .map(
      cloneRecommendationAdaptationRule,
    );
}

export function findActiveRecommendationAdaptationRules(
  rules:
    readonly RecommendationAdaptationRule[],
): RecommendationAdaptationRule[] {
  validateRecommendationAdaptationRules(
    rules,
  );

  return rules
    .filter(
      (
        rule,
      ) =>
        rule.status ===
        "active",
    )
    .map(
      cloneRecommendationAdaptationRule,
    );
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

function validateUniqueNonEmptyStringArray(
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
  validateUniqueNonEmptyStringArray(
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

/* ------------------------------------------------------------------ */
/* Generic Helpers                                                    */
/* ------------------------------------------------------------------ */

function uniqueStrings<T extends string>(
  values:
    readonly T[],
): T[] {
  return Array.from(
    new Set(
      values,
    ),
  );
}

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

function clampAdjustment(
  value:
    number,
): number {
  return Math.min(
    MAXIMUM_RULE_ADJUSTMENT,
    Math.max(
      -MAXIMUM_RULE_ADJUSTMENT,
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

function areNumbersApproximatelyEqual(
  left:
    number,
  right:
    number,
): boolean {
  return (
    Math.abs(
      left -
        right,
    ) <=
    NUMBER_EQUALITY_TOLERANCE
  );
}