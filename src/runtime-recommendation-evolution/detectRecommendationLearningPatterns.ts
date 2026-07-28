import {
    isRecommendationLearningPatternSeverity,
    isRecommendationLearningPatternType,
} from "./recommendationAdaptiveLearningTypes";

import {
    validateRecommendationLearningObservationArray,
} from "./createRecommendationLearningObservation";

import {
    validateRecommendationSignalReliabilityProfiles,
} from "./evaluateMemorySignalReliability";

import type {
    DetectRecommendationLearningPatternsParams,
    RecommendationAdaptiveLearningRuntimeDecisionType,
    RecommendationAdaptiveLearningStrategyType,
    RecommendationLearningObservation,
    RecommendationLearningPattern,
    RecommendationLearningPatternSeverity,
    RecommendationLearningPatternType,
    RecommendationRuntimeDecisionLearningProfile,
    RecommendationSignalReliabilityProfile,
    RecommendationStrategyLearningProfile,
    ValidateRecommendationLearningPatternParams,
} from "./recommendationAdaptiveLearningTypes";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

/**
 * Strategy 또는 Runtime Decision의 성공·실패 Pattern을 만들기 위한
 * 최소 표본 수입니다.
 *
 * REI05 MVP에서는 한두 번의 우연한 결과를 학습 규칙으로 확대하지
 * 않도록 최소 3개의 Observation을 요구합니다.
 */
const MINIMUM_PATTERN_SAMPLE_COUNT =
  3;

/**
 * Pattern 감지에 필요한 최소 Profile Confidence입니다.
 */
const MINIMUM_PATTERN_CONFIDENCE =
  0.6;

/**
 * 성공 Pattern으로 판단하는 최소 Effectiveness Score입니다.
 */
const SUCCESS_EFFECTIVENESS_THRESHOLD =
  0.7;

/**
 * 실패 Pattern으로 판단하는 최대 Effectiveness Score입니다.
 */
const FAILURE_EFFECTIVENESS_THRESHOLD =
  0.3;

/**
 * Pattern Confidence를 계산할 때 표본 수가 이 값에 도달하면
 * 표본 강도를 1로 취급합니다.
 */
const FULL_SAMPLE_CONFIDENCE_COUNT =
  8;

/**
 * 부동소수점 비교 허용 오차입니다.
 */
const NUMBER_EQUALITY_TOLERANCE =
  1e-10;

/* ------------------------------------------------------------------ */
/* Internal Types                                                     */
/* ------------------------------------------------------------------ */

type PatternCandidate = {
  type:
    RecommendationLearningPatternType;

  severity:
    RecommendationLearningPatternSeverity;

  confidence:
    number;

  description:
    string;

  relatedObservationIds:
    string[];

  relatedEntryIds:
    string[];

  relatedComparisonIds:
    string[];

  relatedStrategyTypes:
    RecommendationAdaptiveLearningStrategyType[];

  relatedDecisionTypes:
    RecommendationAdaptiveLearningRuntimeDecisionType[];

  relatedSignalTypes:
    RecommendationSignalReliabilityProfile["signalType"][];
};

type CreatePatternFromCandidateParams = {
  candidate:
    PatternCandidate;

  index:
    number;

  detectedAt:
    string;

  createPatternId:
    DetectRecommendationLearningPatternsParams["createPatternId"];
};

type DetectStrategyPatternsParams = {
  observations:
    readonly RecommendationLearningObservation[];

  profiles:
    readonly RecommendationStrategyLearningProfile[];
};

type DetectRuntimeDecisionPatternsParams = {
  observations:
    readonly RecommendationLearningObservation[];

  profiles:
    readonly RecommendationRuntimeDecisionLearningProfile[];
};

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Strategy·Runtime Decision·Signal Reliability Profile에서 반복적인
 * Recommendation Learning Pattern을 감지합니다.
 *
 * Part A에서는 다음 Pattern을 생성합니다.
 *
 * - strategy-success
 * - strategy-failure
 * - decision-success
 * - decision-failure
 * - insufficient-evidence
 *
 * 특정 Strategy 또는 Decision이 결과를 직접 만들었다고 단정하지
 * 않고, 해당 요소가 사용된 Observation에서 어떤 Outcome이 반복해서
 * 관찰됐는지를 표현합니다.
 */
export function detectRecommendationLearningPatterns(
  params:
    DetectRecommendationLearningPatternsParams,
): RecommendationLearningPattern[] {
  validateDetectRecommendationLearningPatternsParams(
    params,
  );

  const candidates: PatternCandidate[] = [
    ...detectStrategyPatterns({
      observations:
        params.observations,

      profiles:
        params.strategyProfiles,
    }),

    ...detectRuntimeDecisionPatterns({
      observations:
        params.observations,

      profiles:
        params.runtimeDecisionProfiles,
    }),

    ...detectStateStrategyMismatchPatterns(
      params.observations,
    ),

    ...detectRepeatedPrematureAdvancePatterns(
      params.observations,
    ),

    ...detectPersistentOverObservationPatterns(
      params.observations,
    ),

    ...detectEffectiveStabilizationPatterns(
      params.observations,
    ),

    ...detectEffectiveRecoveryPatterns(
      params.observations,
    ),

    ...detectConfidenceLearningPatterns(
      params.observations,
    ),

    ...detectSignalCalibrationPatterns(
      params.signalReliabilityProfiles,
    ),

    ...detectConflictingEvidencePatterns({
      observations:
        params.observations,

      strategyProfiles:
        params.strategyProfiles,

      runtimeDecisionProfiles:
        params.runtimeDecisionProfiles,
    }),

    ...detectInsufficientEvidencePatterns({
      observations:
        params.observations,

      strategyProfiles:
        params.strategyProfiles,

      runtimeDecisionProfiles:
        params.runtimeDecisionProfiles,

      signalReliabilityProfiles:
        params.signalReliabilityProfiles,
    }),
  ];

  const normalizedCandidates =
    normalizePatternCandidates(
      candidates,
    );

  const patterns =
    normalizedCandidates.map(
      (
        candidate,
        index,
      ) =>
        createPatternFromCandidate({
          candidate,
          index,
          detectedAt:
            params.detectedAt,
          createPatternId:
            params.createPatternId,
        }),
    );

  const finalizedPatterns =
    finalizeRecommendationLearningPatterns(
      patterns,
    );

  validateRecommendationLearningPatterns(
    finalizedPatterns,
  );

  validateRecommendationLearningPatternEvidenceConsistency({
    patterns:
      finalizedPatterns,

    observations:
      params.observations,

    strategyProfiles:
      params.strategyProfiles,

    runtimeDecisionProfiles:
      params.runtimeDecisionProfiles,

    signalReliabilityProfiles:
      params.signalReliabilityProfiles,
  });

  return finalizedPatterns.map(
    cloneRecommendationLearningPattern,
  );
}

/* ------------------------------------------------------------------ */
/* Strategy Pattern Detection                                         */
/* ------------------------------------------------------------------ */

function detectStrategyPatterns(
  params:
    DetectStrategyPatternsParams,
): PatternCandidate[] {
  const {
    observations,
    profiles,
  } = params;

  const candidates:
    PatternCandidate[] = [];

  profiles.forEach(
    (
      profile,
    ) => {
      if (
        !hasSufficientEffectivenessEvidence(
          profile.overall,
        )
      ) {
        return;
      }

      const relatedObservations =
        findObservationsForStrategy({
          observations,
          strategyType:
            profile.strategyType,
          relatedObservationIds:
            profile.relatedObservationIds,
        });

      if (
        profile.overall.effectivenessScore >=
        SUCCESS_EFFECTIVENESS_THRESHOLD
      ) {
        candidates.push(
          createStrategySuccessCandidate({
            profile,
            observations:
              relatedObservations,
          }),
        );

        return;
      }

      if (
        profile.overall.effectivenessScore <=
        FAILURE_EFFECTIVENESS_THRESHOLD
      ) {
        candidates.push(
          createStrategyFailureCandidate({
            profile,
            observations:
              relatedObservations,
          }),
        );
      }
    },
  );

  return candidates;
}

/* ------------------------------------------------------------------ */
/* Strategy Success                                                   */
/* ------------------------------------------------------------------ */

function createStrategySuccessCandidate(
  params: {
    profile:
      RecommendationStrategyLearningProfile;

    observations:
      readonly RecommendationLearningObservation[];
  },
): PatternCandidate {
  const {
    profile,
    observations,
  } = params;

  const confidence =
    calculatePatternConfidence({
      sampleCount:
        profile.overall.sampleCount,

      profileConfidence:
        profile.overall.confidence,

      evidenceStrength:
        profile.overall.effectivenessScore,
    });

  return {
    type:
      "strategy-success",

    severity:
      resolveSuccessPatternSeverity(
        confidence,
      ),

    confidence,

    description:
      `Strategy ${profile.strategyType} was repeatedly associated with positive Recommendation outcomes.`,

    relatedObservationIds:
      observations.map(
        (
          observation,
        ) =>
          observation.id,
      ),

    relatedEntryIds:
      collectObservationEntryIds(
        observations,
      ),

    relatedComparisonIds:
      observations.map(
        (
          observation,
        ) =>
          observation.comparisonId,
      ),

    relatedStrategyTypes: [
      profile.strategyType,
    ],

    relatedDecisionTypes:
      collectObservationDecisionTypes(
        observations,
      ),

    relatedSignalTypes:
      [],
  };
}

/* ------------------------------------------------------------------ */
/* Strategy Failure                                                   */
/* ------------------------------------------------------------------ */

function createStrategyFailureCandidate(
  params: {
    profile:
      RecommendationStrategyLearningProfile;

    observations:
      readonly RecommendationLearningObservation[];
  },
): PatternCandidate {
  const {
    profile,
    observations,
  } = params;

  const failureStrength =
    1 -
    profile.overall.effectivenessScore;

  const confidence =
    calculatePatternConfidence({
      sampleCount:
        profile.overall.sampleCount,

      profileConfidence:
        profile.overall.confidence,

      evidenceStrength:
        failureStrength,
    });

  return {
    type:
      "strategy-failure",

    severity:
      resolveFailurePatternSeverity(
        confidence,
      ),

    confidence,

    description:
      `Strategy ${profile.strategyType} was repeatedly associated with weak or negative Recommendation outcomes.`,

    relatedObservationIds:
      observations.map(
        (
          observation,
        ) =>
          observation.id,
      ),

    relatedEntryIds:
      collectObservationEntryIds(
        observations,
      ),

    relatedComparisonIds:
      observations.map(
        (
          observation,
        ) =>
          observation.comparisonId,
      ),

    relatedStrategyTypes: [
      profile.strategyType,
    ],

    relatedDecisionTypes:
      collectObservationDecisionTypes(
        observations,
      ),

    relatedSignalTypes:
      [],
  };
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Pattern Detection                                 */
/* ------------------------------------------------------------------ */

function detectRuntimeDecisionPatterns(
  params:
    DetectRuntimeDecisionPatternsParams,
): PatternCandidate[] {
  const {
    observations,
    profiles,
  } = params;

  const candidates:
    PatternCandidate[] = [];

  profiles.forEach(
    (
      profile,
    ) => {
      if (
        !hasSufficientEffectivenessEvidence(
          profile.effectiveness,
        )
      ) {
        return;
      }

      const relatedObservations =
        findObservationsForRuntimeDecision({
          observations,
          decisionType:
            profile.decisionType,
          relatedObservationIds:
            profile.relatedObservationIds,
        });

      if (
        profile.effectiveness.effectivenessScore >=
        SUCCESS_EFFECTIVENESS_THRESHOLD
      ) {
        candidates.push(
          createRuntimeDecisionSuccessCandidate({
            profile,
            observations:
              relatedObservations,
          }),
        );

        return;
      }

      if (
        profile.effectiveness.effectivenessScore <=
        FAILURE_EFFECTIVENESS_THRESHOLD
      ) {
        candidates.push(
          createRuntimeDecisionFailureCandidate({
            profile,
            observations:
              relatedObservations,
          }),
        );
      }
    },
  );

  return candidates;
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Success                                           */
/* ------------------------------------------------------------------ */

function createRuntimeDecisionSuccessCandidate(
  params: {
    profile:
      RecommendationRuntimeDecisionLearningProfile;

    observations:
      readonly RecommendationLearningObservation[];
  },
): PatternCandidate {
  const {
    profile,
    observations,
  } = params;

  const confidence =
    calculatePatternConfidence({
      sampleCount:
        profile.effectiveness.sampleCount,

      profileConfidence:
        profile.effectiveness.confidence,

      evidenceStrength:
        profile.effectiveness.effectivenessScore,
    });

  return {
    type:
      "decision-success",

    severity:
      resolveSuccessPatternSeverity(
        confidence,
      ),

    confidence,

    description:
      `Runtime decision ${profile.decisionType} was repeatedly associated with positive Recommendation outcomes.`,

    relatedObservationIds:
      observations.map(
        (
          observation,
        ) =>
          observation.id,
      ),

    relatedEntryIds:
      collectObservationEntryIds(
        observations,
      ),

    relatedComparisonIds:
      observations.map(
        (
          observation,
        ) =>
          observation.comparisonId,
      ),

    relatedStrategyTypes:
      collectObservationStrategyTypes(
        observations,
      ),

    relatedDecisionTypes: [
      profile.decisionType,
    ],

    relatedSignalTypes:
      [],
  };
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Failure                                           */
/* ------------------------------------------------------------------ */

function createRuntimeDecisionFailureCandidate(
  params: {
    profile:
      RecommendationRuntimeDecisionLearningProfile;

    observations:
      readonly RecommendationLearningObservation[];
  },
): PatternCandidate {
  const {
    profile,
    observations,
  } = params;

  const failureStrength =
    1 -
    profile.effectiveness.effectivenessScore;

  const confidence =
    calculatePatternConfidence({
      sampleCount:
        profile.effectiveness.sampleCount,

      profileConfidence:
        profile.effectiveness.confidence,

      evidenceStrength:
        failureStrength,
    });

  return {
    type:
      "decision-failure",

    severity:
      resolveFailurePatternSeverity(
        confidence,
      ),

    confidence,

    description:
      `Runtime decision ${profile.decisionType} was repeatedly associated with weak or negative Recommendation outcomes.`,

    relatedObservationIds:
      observations.map(
        (
          observation,
        ) =>
          observation.id,
      ),

    relatedEntryIds:
      collectObservationEntryIds(
        observations,
      ),

    relatedComparisonIds:
      observations.map(
        (
          observation,
        ) =>
          observation.comparisonId,
      ),

    relatedStrategyTypes:
      collectObservationStrategyTypes(
        observations,
      ),

    relatedDecisionTypes: [
      profile.decisionType,
    ],

    relatedSignalTypes:
      [],
  };
}

/* ------------------------------------------------------------------ */
/* Part B Constants                                                   */
/* ------------------------------------------------------------------ */

const MINIMUM_SPECIAL_PATTERN_OBSERVATION_COUNT =
  3;

const SPECIAL_PATTERN_CONFIDENCE_THRESHOLD =
  0.6;

const SIGNAL_OVER_ESTIMATION_THRESHOLD =
  0.35;

const SIGNAL_UNDER_ESTIMATION_THRESHOLD =
  0.75;

const CONFLICT_MINIMUM_CATEGORY_COUNT =
  2;

const CONFLICT_MINIMUM_CATEGORY_RATIO =
  0.3;

/* ------------------------------------------------------------------ */
/* State–Strategy Mismatch                                            */
/* ------------------------------------------------------------------ */

/**
 * 동일한 State·Strategy 조합에서 부정적 또는 모호한 Outcome이
 * 반복될 경우 해당 조합의 적합성이 낮을 가능성을 기록합니다.
 *
 * 특정 Strategy 자체가 잘못됐다고 단정하지 않고,
 * 특정 State와의 조합에서 결과가 좋지 않았음을 나타냅니다.
 */
function detectStateStrategyMismatchPatterns(
  observations:
    readonly RecommendationLearningObservation[],
): PatternCandidate[] {
  const grouped =
    groupObservationsByStateAndStrategy(
      observations,
    );

  const candidates:
    PatternCandidate[] = [];

  grouped.forEach(
    (
      group,
    ) => {
      if (
        group.length <
        MINIMUM_SPECIAL_PATTERN_OBSERVATION_COUNT
      ) {
        return;
      }

      const negativeOrAmbiguous =
        group.filter(
          (
            observation,
          ) =>
            observation.outcomeCategory ===
              "negative" ||
            observation.outcomeCategory ===
              "ambiguous",
        );

      const mismatchRatio =
        negativeOrAmbiguous.length /
        group.length;

      if (
        mismatchRatio <
        0.6
      ) {
        return;
      }

      const representative =
        group[
          0
        ];

      if (
        representative ===
        undefined
      ) {
        return;
      }

      const confidence =
        calculateSpecialPatternConfidence({
          sampleCount:
            group.length,

          matchingCount:
            negativeOrAmbiguous.length,

          baseConfidence:
            mismatchRatio,
        });

      if (
        confidence <
        SPECIAL_PATTERN_CONFIDENCE_THRESHOLD
      ) {
        return;
      }

      candidates.push({
        type:
          "state-strategy-mismatch",

        severity:
          resolveFailurePatternSeverity(
            confidence,
          ),

        confidence,

        description:
          `Strategy ${representative.currentStrategyType} was repeatedly associated with weak or ambiguous outcomes while the Recommendation state was ${representative.currentState}.`,

        relatedObservationIds:
          group.map(
            (
              observation,
            ) =>
              observation.id,
          ),

        relatedEntryIds:
          collectObservationEntryIds(
            group,
          ),

        relatedComparisonIds:
          group.map(
            (
              observation,
            ) =>
              observation.comparisonId,
          ),

        relatedStrategyTypes: [
          representative.currentStrategyType,
        ],

        relatedDecisionTypes:
          collectObservationDecisionTypes(
            group,
          ),

        relatedSignalTypes:
          [],
      });
    },
  );

  return candidates;
}

/* ------------------------------------------------------------------ */
/* Repeated Premature Advance                                         */
/* ------------------------------------------------------------------ */

/**
 * advance Strategy가 활성화된 직후 stalled·fragmented·regressed
 * 또는 redirected 결과가 반복되는지 감지합니다.
 */
function detectRepeatedPrematureAdvancePatterns(
  observations:
    readonly RecommendationLearningObservation[],
): PatternCandidate[] {
  const advanceObservations =
    observations.filter(
      (
        observation,
      ) =>
        observation.currentStrategyType ===
          "advance",
    );

  const failedAdvanceObservations =
    advanceObservations.filter(
      (
        observation,
      ) =>
        observation.outcome ===
          "stalled" ||
        observation.outcome ===
          "fragmented" ||
        observation.outcome ===
          "regressed" ||
        observation.outcome ===
          "redirected",
    );

  if (
    failedAdvanceObservations.length <
    MINIMUM_SPECIAL_PATTERN_OBSERVATION_COUNT
  ) {
    return [];
  }

  const failureRatio =
    failedAdvanceObservations.length /
    advanceObservations.length;

  if (
    failureRatio <
    0.6
  ) {
    return [];
  }

  const confidence =
    calculateSpecialPatternConfidence({
      sampleCount:
        advanceObservations.length,

      matchingCount:
        failedAdvanceObservations.length,

      baseConfidence:
        failureRatio,
    });

  if (
    confidence <
    SPECIAL_PATTERN_CONFIDENCE_THRESHOLD
  ) {
    return [];
  }

  return [
    {
      type:
        "repeated-premature-advance",

      severity:
        resolveFailurePatternSeverity(
          confidence,
        ),

      confidence,

      description:
        "Advance strategy was repeatedly followed by stalled, fragmented, regressed, or redirected outcomes before stable progress was established.",

      relatedObservationIds:
        failedAdvanceObservations.map(
          (
            observation,
          ) =>
            observation.id,
        ),

      relatedEntryIds:
        collectObservationEntryIds(
          failedAdvanceObservations,
        ),

      relatedComparisonIds:
        failedAdvanceObservations.map(
          (
            observation,
          ) =>
            observation.comparisonId,
        ),

      relatedStrategyTypes: [
        "advance",
      ],

      relatedDecisionTypes:
        collectObservationDecisionTypes(
          failedAdvanceObservations,
        ),

      relatedSignalTypes:
        [],
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Persistent Over-observation                                        */
/* ------------------------------------------------------------------ */

/**
 * observe Strategy가 반복되고 있지만 Progress 증가가 나타나지
 * 않는 구간을 감지합니다.
 */
function detectPersistentOverObservationPatterns(
  observations:
    readonly RecommendationLearningObservation[],
): PatternCandidate[] {
  const observeObservations =
    observations.filter(
      (
        observation,
      ) =>
        observation.currentStrategyType ===
          "observe",
    );

  const stagnantObservations =
    observeObservations.filter(
      (
        observation,
      ) =>
        observation.scoreChanges.progress <=
          0 &&
        observation.scoreChanges.completionMomentum <=
          0 &&
        (
          observation.outcome ===
            "maintained" ||
          observation.outcome ===
            "stalled" ||
          observation.outcome ===
            "unknown"
        ),
    );

  if (
    stagnantObservations.length <
    MINIMUM_SPECIAL_PATTERN_OBSERVATION_COUNT
  ) {
    return [];
  }

  const stagnantRatio =
    stagnantObservations.length /
    observeObservations.length;

  if (
    stagnantRatio <
    0.6
  ) {
    return [];
  }

  const confidence =
    calculateSpecialPatternConfidence({
      sampleCount:
        observeObservations.length,

      matchingCount:
        stagnantObservations.length,

      baseConfidence:
        stagnantRatio,
    });

  if (
    confidence <
    SPECIAL_PATTERN_CONFIDENCE_THRESHOLD
  ) {
    return [];
  }

  return [
    {
      type:
        "persistent-over-observation",

      severity:
        resolveFailurePatternSeverity(
          confidence,
        ),

      confidence,

      description:
        "Observe strategy persisted across multiple Recommendation states without corresponding progress or completion momentum.",

      relatedObservationIds:
        stagnantObservations.map(
          (
            observation,
          ) =>
            observation.id,
        ),

      relatedEntryIds:
        collectObservationEntryIds(
          stagnantObservations,
        ),

      relatedComparisonIds:
        stagnantObservations.map(
          (
            observation,
          ) =>
            observation.comparisonId,
        ),

      relatedStrategyTypes: [
        "observe",
      ],

      relatedDecisionTypes:
        collectObservationDecisionTypes(
          stagnantObservations,
        ),

      relatedSignalTypes:
        [],
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Effective Stabilization                                            */
/* ------------------------------------------------------------------ */

function detectEffectiveStabilizationPatterns(
  observations:
    readonly RecommendationLearningObservation[],
): PatternCandidate[] {
  const stabilizationObservations =
    observations.filter(
      (
        observation,
      ) =>
        observation.currentStrategyType ===
          "stabilize",
    );

  const effectiveObservations =
    stabilizationObservations.filter(
      (
        observation,
      ) =>
        observation.outcome ===
          "improved" ||
        observation.outcome ===
          "recovered" ||
        observation.scoreChanges.stability >
          0 ||
        observation.scoreChanges.repetitionRisk <
          0 ||
        observation.scoreChanges.redirectionRisk <
          0,
    );

  if (
    effectiveObservations.length <
    MINIMUM_SPECIAL_PATTERN_OBSERVATION_COUNT
  ) {
    return [];
  }

  const effectivenessRatio =
    effectiveObservations.length /
    stabilizationObservations.length;

  if (
    effectivenessRatio <
    0.6
  ) {
    return [];
  }

  const confidence =
    calculateSpecialPatternConfidence({
      sampleCount:
        stabilizationObservations.length,

      matchingCount:
        effectiveObservations.length,

      baseConfidence:
        effectivenessRatio,
    });

  if (
    confidence <
    SPECIAL_PATTERN_CONFIDENCE_THRESHOLD
  ) {
    return [];
  }

  return [
    {
      type:
        "effective-stabilization",

      severity:
        resolveSuccessPatternSeverity(
          confidence,
        ),

      confidence,

      description:
        "Stabilization strategy was repeatedly associated with improved stability or reduced Recommendation risk.",

      relatedObservationIds:
        effectiveObservations.map(
          (
            observation,
          ) =>
            observation.id,
        ),

      relatedEntryIds:
        collectObservationEntryIds(
          effectiveObservations,
        ),

      relatedComparisonIds:
        effectiveObservations.map(
          (
            observation,
          ) =>
            observation.comparisonId,
        ),

      relatedStrategyTypes: [
        "stabilize",
      ],

      relatedDecisionTypes:
        collectObservationDecisionTypes(
          effectiveObservations,
        ),

      relatedSignalTypes:
        [],
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Effective Recovery                                                 */
/* ------------------------------------------------------------------ */

function detectEffectiveRecoveryPatterns(
  observations:
    readonly RecommendationLearningObservation[],
): PatternCandidate[] {
  const recoveryObservations =
    observations.filter(
      (
        observation,
      ) =>
        observation.currentStrategyType ===
          "reconsider",
    );

  const effectiveObservations =
    recoveryObservations.filter(
      (
        observation,
      ) =>
        observation.outcome ===
          "recovered" ||
        observation.outcome ===
          "improved" ||
        (
          (
            observation.previousState ===
              "stalled" ||
            observation.previousState ===
              "fragmented"
          ) &&
          observation.currentState !==
            observation.previousState &&
          observation.scoreChanges.stability >
            0
        ),
    );

  if (
    effectiveObservations.length <
    MINIMUM_SPECIAL_PATTERN_OBSERVATION_COUNT
  ) {
    return [];
  }

  const effectivenessRatio =
    effectiveObservations.length /
    recoveryObservations.length;

  if (
    effectivenessRatio <
    0.6
  ) {
    return [];
  }

  const confidence =
    calculateSpecialPatternConfidence({
      sampleCount:
        recoveryObservations.length,

      matchingCount:
        effectiveObservations.length,

      baseConfidence:
        effectivenessRatio,
    });

  if (
    confidence <
    SPECIAL_PATTERN_CONFIDENCE_THRESHOLD
  ) {
    return [];
  }

  return [
    {
      type:
        "effective-recovery",

      severity:
        resolveSuccessPatternSeverity(
          confidence,
        ),

      confidence,

      description:
        "Recovery strategy was repeatedly associated with movement away from stalled or fragmented Recommendation states.",

      relatedObservationIds:
        effectiveObservations.map(
          (
            observation,
          ) =>
            observation.id,
        ),

      relatedEntryIds:
        collectObservationEntryIds(
          effectiveObservations,
        ),

      relatedComparisonIds:
        effectiveObservations.map(
          (
            observation,
          ) =>
            observation.comparisonId,
        ),

      relatedStrategyTypes: [
        "reconsider",
      ],

      relatedDecisionTypes:
        collectObservationDecisionTypes(
          effectiveObservations,
        ),

      relatedSignalTypes:
        [],
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Confidence Patterns                                                */
/* ------------------------------------------------------------------ */

function detectConfidenceLearningPatterns(
  observations:
    readonly RecommendationLearningObservation[],
): PatternCandidate[] {
  const changedConfidenceObservations =
    observations.filter(
      (
        observation,
      ) =>
        observation.confidenceChanged,
    );

  if (
    changedConfidenceObservations.length <
    MINIMUM_SPECIAL_PATTERN_OBSERVATION_COUNT
  ) {
    return [];
  }

  const degradationObservations =
    changedConfidenceObservations.filter(
      (
        observation,
      ) =>
        observation.outcome ===
          "regressed" ||
        observation.outcome ===
          "stalled" ||
        observation.outcome ===
          "fragmented",
    );

  const recoveryObservations =
    changedConfidenceObservations.filter(
      (
        observation,
      ) =>
        observation.outcome ===
          "improved" ||
        observation.outcome ===
          "advanced" ||
        observation.outcome ===
          "recovered",
    );

  const candidates:
    PatternCandidate[] = [];

  if (
    degradationObservations.length >=
    MINIMUM_SPECIAL_PATTERN_OBSERVATION_COUNT
  ) {
    const degradationRatio =
      degradationObservations.length /
      changedConfidenceObservations.length;

    const confidence =
      calculateSpecialPatternConfidence({
        sampleCount:
          changedConfidenceObservations.length,

        matchingCount:
          degradationObservations.length,

        baseConfidence:
          degradationRatio,
      });

    if (
      confidence >=
      SPECIAL_PATTERN_CONFIDENCE_THRESHOLD
    ) {
      candidates.push({
        type:
          "confidence-degradation",

        severity:
          resolveFailurePatternSeverity(
            confidence,
          ),

        confidence,

        description:
          "Assessment confidence changes were repeatedly associated with stalled, fragmented, or regressed Recommendation outcomes.",

        relatedObservationIds:
          degradationObservations.map(
            (
              observation,
            ) =>
              observation.id,
          ),

        relatedEntryIds:
          collectObservationEntryIds(
            degradationObservations,
          ),

        relatedComparisonIds:
          degradationObservations.map(
            (
              observation,
            ) =>
              observation.comparisonId,
          ),

        relatedStrategyTypes:
          collectObservationStrategyTypes(
            degradationObservations,
          ),

        relatedDecisionTypes:
          collectObservationDecisionTypes(
            degradationObservations,
          ),

        relatedSignalTypes:
          [],
      });
    }
  }

  if (
    recoveryObservations.length >=
    MINIMUM_SPECIAL_PATTERN_OBSERVATION_COUNT
  ) {
    const recoveryRatio =
      recoveryObservations.length /
      changedConfidenceObservations.length;

    const confidence =
      calculateSpecialPatternConfidence({
        sampleCount:
          changedConfidenceObservations.length,

        matchingCount:
          recoveryObservations.length,

        baseConfidence:
          recoveryRatio,
      });

    if (
      confidence >=
      SPECIAL_PATTERN_CONFIDENCE_THRESHOLD
    ) {
      candidates.push({
        type:
          "confidence-recovery",

        severity:
          resolveSuccessPatternSeverity(
            confidence,
          ),

        confidence,

        description:
          "Assessment confidence changes were repeatedly associated with improved, advanced, or recovered Recommendation outcomes.",

        relatedObservationIds:
          recoveryObservations.map(
            (
              observation,
            ) =>
              observation.id,
          ),

        relatedEntryIds:
          collectObservationEntryIds(
            recoveryObservations,
          ),

        relatedComparisonIds:
          recoveryObservations.map(
            (
              observation,
            ) =>
              observation.comparisonId,
          ),

        relatedStrategyTypes:
          collectObservationStrategyTypes(
            recoveryObservations,
          ),

        relatedDecisionTypes:
          collectObservationDecisionTypes(
            recoveryObservations,
          ),

        relatedSignalTypes:
          [],
      });
    }
  }

  return candidates;
}

/* ------------------------------------------------------------------ */
/* Signal Calibration Patterns                                        */
/* ------------------------------------------------------------------ */

function detectSignalCalibrationPatterns(
  profiles:
    readonly RecommendationSignalReliabilityProfile[],
): PatternCandidate[] {
  const candidates:
    PatternCandidate[] = [];

  profiles.forEach(
    (
      profile,
    ) => {
      if (
        profile.sampleCount <
          MINIMUM_SPECIAL_PATTERN_OBSERVATION_COUNT ||
        profile.confidence <
          SPECIAL_PATTERN_CONFIDENCE_THRESHOLD
      ) {
        return;
      }

      if (
        profile.reliabilityScore <=
        SIGNAL_OVER_ESTIMATION_THRESHOLD
      ) {
        candidates.push({
          type:
            "signal-overestimation",

          severity:
            resolveFailurePatternSeverity(
              profile.confidence,
            ),

          confidence:
            roundScore(
              profile.confidence,
            ),

          description:
            `Memory signal ${profile.signalType} was contradicted more often than it was confirmed in related Recommendation observations.`,

          relatedObservationIds: [
            ...profile.relatedObservationIds,
          ],

          relatedEntryIds:
            [],

          relatedComparisonIds:
            [],

          relatedStrategyTypes:
            [],

          relatedDecisionTypes:
            [],

          relatedSignalTypes: [
            profile.signalType,
          ],
        });

        return;
      }

      if (
        profile.reliabilityScore >=
        SIGNAL_UNDER_ESTIMATION_THRESHOLD
      ) {
        candidates.push({
          type:
            "signal-underestimation",

          severity:
            resolveSuccessPatternSeverity(
              profile.confidence,
            ),

          confidence:
            roundScore(
              profile.confidence,
            ),

          description:
            `Memory signal ${profile.signalType} was confirmed consistently across related Recommendation observations.`,

          relatedObservationIds: [
            ...profile.relatedObservationIds,
          ],

          relatedEntryIds:
            [],

          relatedComparisonIds:
            [],

          relatedStrategyTypes:
            [],

          relatedDecisionTypes:
            [],

          relatedSignalTypes: [
            profile.signalType,
          ],
        });
      }
    },
  );

  return candidates;
}

/* ------------------------------------------------------------------ */
/* Conflicting Evidence                                               */
/* ------------------------------------------------------------------ */

function detectConflictingEvidencePatterns(
  params: {
    observations:
      readonly RecommendationLearningObservation[];

    strategyProfiles:
      readonly RecommendationStrategyLearningProfile[];

    runtimeDecisionProfiles:
      readonly RecommendationRuntimeDecisionLearningProfile[];
  },
): PatternCandidate[] {
  const candidates:
    PatternCandidate[] = [];

  params.strategyProfiles.forEach(
    (
      profile,
    ) => {
      if (
        !hasConflictingEffectivenessEvidence(
          profile.overall,
        )
      ) {
        return;
      }

      const relatedObservations =
        findObservationsForStrategy({
          observations:
            params.observations,

          strategyType:
            profile.strategyType,

          relatedObservationIds:
            profile.relatedObservationIds,
        });

      const confidence =
        calculateConflictConfidence(
          profile.overall,
        );

      candidates.push({
        type:
          "conflicting-evidence",

        severity:
          "moderate",

        confidence,

        description:
          `Strategy ${profile.strategyType} produced substantial positive and negative evidence, so a stable adaptation preference cannot yet be established.`,

        relatedObservationIds:
          relatedObservations.map(
            (
              observation,
            ) =>
              observation.id,
          ),

        relatedEntryIds:
          collectObservationEntryIds(
            relatedObservations,
          ),

        relatedComparisonIds:
          relatedObservations.map(
            (
              observation,
            ) =>
              observation.comparisonId,
          ),

        relatedStrategyTypes: [
          profile.strategyType,
        ],

        relatedDecisionTypes:
          collectObservationDecisionTypes(
            relatedObservations,
          ),

        relatedSignalTypes:
          [],
      });
    },
  );

  params.runtimeDecisionProfiles.forEach(
    (
      profile,
    ) => {
      if (
        !hasConflictingEffectivenessEvidence(
          profile.effectiveness,
        )
      ) {
        return;
      }

      const relatedObservations =
        findObservationsForRuntimeDecision({
          observations:
            params.observations,

          decisionType:
            profile.decisionType,

          relatedObservationIds:
            profile.relatedObservationIds,
        });

      const confidence =
        calculateConflictConfidence(
          profile.effectiveness,
        );

      candidates.push({
        type:
          "conflicting-evidence",

        severity:
          "moderate",

        confidence,

        description:
          `Runtime decision ${profile.decisionType} produced substantial positive and negative evidence, so its effectiveness remains context-dependent.`,

        relatedObservationIds:
          relatedObservations.map(
            (
              observation,
            ) =>
              observation.id,
          ),

        relatedEntryIds:
          collectObservationEntryIds(
            relatedObservations,
          ),

        relatedComparisonIds:
          relatedObservations.map(
            (
              observation,
            ) =>
              observation.comparisonId,
          ),

        relatedStrategyTypes:
          collectObservationStrategyTypes(
            relatedObservations,
          ),

        relatedDecisionTypes: [
          profile.decisionType,
        ],

        relatedSignalTypes:
          [],
      });
    },
  );

  return candidates;
}

/* ------------------------------------------------------------------ */
/* State–Strategy Grouping                                            */
/* ------------------------------------------------------------------ */

function groupObservationsByStateAndStrategy(
  observations:
    readonly RecommendationLearningObservation[],
): Map<
  string,
  RecommendationLearningObservation[]
> {
  const grouped =
    new Map<
      string,
      RecommendationLearningObservation[]
    >();

  observations.forEach(
    (
      observation,
    ) => {
      const key =
        `${observation.currentState}|${observation.currentStrategyType}`;

      const group =
        grouped.get(
          key,
        );

      if (
        group ===
        undefined
      ) {
        grouped.set(
          key,
          [
            observation,
          ],
        );

        return;
      }

      group.push(
        observation,
      );
    },
  );

  return grouped;
}

/* ------------------------------------------------------------------ */
/* Conflict Helpers                                                   */
/* ------------------------------------------------------------------ */

function hasConflictingEffectivenessEvidence(
  effectiveness: {
    sampleCount:
      number;

    positiveCount:
      number;

    negativeCount:
      number;

    confidence:
      number;
  },
): boolean {
  if (
    effectiveness.sampleCount <
      MINIMUM_SPECIAL_PATTERN_OBSERVATION_COUNT ||
    effectiveness.confidence <
      SPECIAL_PATTERN_CONFIDENCE_THRESHOLD
  ) {
    return false;
  }

  if (
    effectiveness.positiveCount <
      CONFLICT_MINIMUM_CATEGORY_COUNT ||
    effectiveness.negativeCount <
      CONFLICT_MINIMUM_CATEGORY_COUNT
  ) {
    return false;
  }

  const positiveRatio =
    effectiveness.positiveCount /
    effectiveness.sampleCount;

  const negativeRatio =
    effectiveness.negativeCount /
    effectiveness.sampleCount;

  return (
    positiveRatio >=
      CONFLICT_MINIMUM_CATEGORY_RATIO &&
    negativeRatio >=
      CONFLICT_MINIMUM_CATEGORY_RATIO
  );
}

function calculateConflictConfidence(
  effectiveness: {
    sampleCount:
      number;

    positiveCount:
      number;

    negativeCount:
      number;

    confidence:
      number;
  },
): number {
  const resolvedCount =
    effectiveness.positiveCount +
    effectiveness.negativeCount;

  if (
    resolvedCount ===
    0
  ) {
    return 0;
  }

  const balance =
    1 -
    Math.abs(
      effectiveness.positiveCount -
        effectiveness.negativeCount,
    ) /
      resolvedCount;

  const sampleStrength =
    clampUnitInterval(
      effectiveness.sampleCount /
        FULL_SAMPLE_CONFIDENCE_COUNT,
    );

  return roundScore(
    clampUnitInterval(
      balance *
        0.4 +
      effectiveness.confidence *
        0.4 +
      sampleStrength *
        0.2,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Special Pattern Confidence                                        */
/* ------------------------------------------------------------------ */

function calculateSpecialPatternConfidence(
  params: {
    sampleCount:
      number;

    matchingCount:
      number;

    baseConfidence:
      number;
  },
): number {
  if (
    params.sampleCount <=
      0 ||
    params.matchingCount <=
      0
  ) {
    return 0;
  }

  const sampleStrength =
    clampUnitInterval(
      params.sampleCount /
        FULL_SAMPLE_CONFIDENCE_COUNT,
    );

  const matchingRatio =
    clampUnitInterval(
      params.matchingCount /
        params.sampleCount,
    );

  return roundScore(
    clampUnitInterval(
      sampleStrength *
        0.3 +
      matchingRatio *
        0.4 +
      params.baseConfidence *
        0.3,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Insufficient Evidence                                              */
/* ------------------------------------------------------------------ */

function detectInsufficientEvidencePatterns(
  params: {
    observations:
      readonly RecommendationLearningObservation[];

    strategyProfiles:
      readonly RecommendationStrategyLearningProfile[];

    runtimeDecisionProfiles:
      readonly RecommendationRuntimeDecisionLearningProfile[];

    signalReliabilityProfiles:
      readonly RecommendationSignalReliabilityProfile[];
  },
): PatternCandidate[] {
  const {
    observations,
    strategyProfiles,
    runtimeDecisionProfiles,
    signalReliabilityProfiles,
  } = params;

  if (
    observations.length >=
    MINIMUM_PATTERN_SAMPLE_COUNT
  ) {
    return [];
  }

  return [
    {
      type:
        "insufficient-evidence",

      severity:
        "low",

      confidence:
        calculateInsufficientEvidenceConfidence(
          observations.length,
        ),

      description:
        "Recommendation learning history does not yet contain enough observations to establish a stable adaptation pattern.",

      relatedObservationIds:
        observations.map(
          (
            observation,
          ) =>
            observation.id,
        ),

      relatedEntryIds:
        collectObservationEntryIds(
          observations,
        ),

      relatedComparisonIds:
        observations.map(
          (
            observation,
          ) =>
            observation.comparisonId,
        ),

      relatedStrategyTypes:
        strategyProfiles.map(
          (
            profile,
          ) =>
            profile.strategyType,
        ),

      relatedDecisionTypes:
        runtimeDecisionProfiles.map(
          (
            profile,
          ) =>
            profile.decisionType,
        ),

      relatedSignalTypes:
        signalReliabilityProfiles.map(
          (
            profile,
          ) =>
            profile.signalType,
        ),
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Pattern Factory                                                    */
/* ------------------------------------------------------------------ */

function createPatternFromCandidate(
  params:
    CreatePatternFromCandidateParams,
): RecommendationLearningPattern {
  const {
    candidate,
    index,
    detectedAt,
    createPatternId,
  } = params;

  const id =
    createPatternId(
      candidate.type,
      index,
    );

  validateRequiredIdentifier(
    id,
    "Recommendation Learning Pattern id",
  );

  const pattern:
    RecommendationLearningPattern = {
      id,

      type:
        candidate.type,

      severity:
        candidate.severity,

      confidence:
        roundScore(
          candidate.confidence,
        ),

      description:
        candidate.description,

      relatedObservationIds:
        uniqueStrings(
          candidate.relatedObservationIds,
        ),

      relatedEntryIds:
        uniqueStrings(
          candidate.relatedEntryIds,
        ),

      relatedComparisonIds:
        uniqueStrings(
          candidate.relatedComparisonIds,
        ),

      relatedStrategyTypes:
        uniqueStrings(
          candidate.relatedStrategyTypes,
        ),

      relatedDecisionTypes:
        uniqueStrings(
          candidate.relatedDecisionTypes,
        ),

      relatedSignalTypes:
        uniqueStrings(
          candidate.relatedSignalTypes,
        ),

      detectedAt,
    };

  validateRecommendationLearningPattern({
    pattern,
  });

  return pattern;
}

/* ------------------------------------------------------------------ */
/* Candidate Normalization                                            */
/* ------------------------------------------------------------------ */

function normalizePatternCandidates(
  candidates:
    readonly PatternCandidate[],
): PatternCandidate[] {
  const candidateByKey =
    new Map<
      string,
      PatternCandidate
    >();

  candidates.forEach(
    (
      candidate,
    ) => {
      const key =
        createPatternCandidateKey(
          candidate,
        );

      const existing =
        candidateByKey.get(
          key,
        );

      if (
        existing ===
          undefined ||
        candidate.confidence >
          existing.confidence
      ) {
        candidateByKey.set(
          key,
          candidate,
        );
      }
    },
  );

  return Array.from(
    candidateByKey.values(),
  ).sort(
    (
      left,
      right,
    ) => {
      const typeComparison =
        left.type.localeCompare(
          right.type,
        );

      if (
        typeComparison !==
        0
      ) {
        return typeComparison;
      }

      const strategyComparison =
        left.relatedStrategyTypes
          .join(
            ",",
          )
          .localeCompare(
            right.relatedStrategyTypes.join(
              ",",
            ),
          );

      if (
        strategyComparison !==
        0
      ) {
        return strategyComparison;
      }

      return left.relatedDecisionTypes
        .join(
          ",",
        )
        .localeCompare(
          right.relatedDecisionTypes.join(
            ",",
          ),
        );
    },
  );
}

function createPatternCandidateKey(
  candidate:
    PatternCandidate,
): string {
  return [
    candidate.type,

    [
      ...candidate.relatedStrategyTypes,
    ]
      .sort()
      .join(
        ",",
      ),

    [
      ...candidate.relatedDecisionTypes,
    ]
      .sort()
      .join(
        ",",
      ),

    [
      ...candidate.relatedSignalTypes,
    ]
      .sort()
      .join(
        ",",
      ),
  ].join(
    "|",
  );
}

/* ------------------------------------------------------------------ */
/* Evidence Resolution                                                */
/* ------------------------------------------------------------------ */

function findObservationsForStrategy(
  params: {
    observations:
      readonly RecommendationLearningObservation[];

    strategyType:
      RecommendationAdaptiveLearningStrategyType;

    relatedObservationIds:
      readonly string[];
  },
): RecommendationLearningObservation[] {
  const relatedObservationIds =
    new Set(
      params.relatedObservationIds,
    );

  return params.observations.filter(
    (
      observation,
    ) =>
      relatedObservationIds.has(
        observation.id,
      ) ||
      observation.currentStrategyType ===
        params.strategyType,
  );
}

function findObservationsForRuntimeDecision(
  params: {
    observations:
      readonly RecommendationLearningObservation[];

    decisionType:
      RecommendationAdaptiveLearningRuntimeDecisionType;

    relatedObservationIds:
      readonly string[];
  },
): RecommendationLearningObservation[] {
  const relatedObservationIds =
    new Set(
      params.relatedObservationIds,
    );

  return params.observations.filter(
    (
      observation,
    ) =>
      relatedObservationIds.has(
        observation.id,
      ) ||
      observation.enabledRuntimeDecisionTypes.includes(
        params.decisionType,
      ),
  );
}

/* ------------------------------------------------------------------ */
/* Evidence Collection                                                */
/* ------------------------------------------------------------------ */

function collectObservationEntryIds(
  observations:
    readonly RecommendationLearningObservation[],
): string[] {
  const entryIds:
    string[] = [];

  observations.forEach(
    (
      observation,
    ) => {
      if (
        observation.previousEntryId !==
        null
      ) {
        entryIds.push(
          observation.previousEntryId,
        );
      }

      entryIds.push(
        observation.currentEntryId,
      );
    },
  );

  return uniqueStrings(
    entryIds,
  );
}

function collectObservationStrategyTypes(
  observations:
    readonly RecommendationLearningObservation[],
): RecommendationAdaptiveLearningStrategyType[] {
  return uniqueStrings(
    observations.map(
      (
        observation,
      ) =>
        observation.currentStrategyType,
    ),
  );
}

function collectObservationDecisionTypes(
  observations:
    readonly RecommendationLearningObservation[],
): RecommendationAdaptiveLearningRuntimeDecisionType[] {
  return uniqueStrings(
    observations.flatMap(
      (
        observation,
      ) =>
        observation.enabledRuntimeDecisionTypes,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Evidence Threshold                                                 */
/* ------------------------------------------------------------------ */

function hasSufficientEffectivenessEvidence(
  effectiveness: {
    sampleCount:
      number;

    confidence:
      number;
  },
): boolean {
  return (
    effectiveness.sampleCount >=
      MINIMUM_PATTERN_SAMPLE_COUNT &&
    effectiveness.confidence >=
      MINIMUM_PATTERN_CONFIDENCE
  );
}

/* ------------------------------------------------------------------ */
/* Confidence                                                         */
/* ------------------------------------------------------------------ */

function calculatePatternConfidence(
  params: {
    sampleCount:
      number;

    profileConfidence:
      number;

    evidenceStrength:
      number;
  },
): number {
  const sampleStrength =
    clampUnitInterval(
      params.sampleCount /
        FULL_SAMPLE_CONFIDENCE_COUNT,
    );

  return roundScore(
    clampUnitInterval(
      sampleStrength *
        0.35 +
      params.profileConfidence *
        0.4 +
      params.evidenceStrength *
        0.25,
    ),
  );
}

function calculateInsufficientEvidenceConfidence(
  observationCount:
    number,
): number {
  if (
    observationCount ===
    0
  ) {
    return 1;
  }

  return roundScore(
    clampUnitInterval(
      1 -
      observationCount /
        MINIMUM_PATTERN_SAMPLE_COUNT,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Severity                                                           */
/* ------------------------------------------------------------------ */

function resolveSuccessPatternSeverity(
  confidence:
    number,
): RecommendationLearningPatternSeverity {
  if (
    confidence >=
    0.85
  ) {
    return "high";
  }

  if (
    confidence >=
    0.7
  ) {
    return "moderate";
  }

  return "low";
}

function resolveFailurePatternSeverity(
  confidence:
    number,
): RecommendationLearningPatternSeverity {
  if (
    confidence >=
    0.8
  ) {
    return "high";
  }

  if (
    confidence >=
    0.65
  ) {
    return "moderate";
  }

  return "low";
}

/* ------------------------------------------------------------------ */
/* Public Validation                                                  */
/* ------------------------------------------------------------------ */

export function validateRecommendationLearningPattern(
  params:
    ValidateRecommendationLearningPatternParams,
): void {
  const {
    pattern,
  } = params;

  if (
    typeof pattern !==
      "object" ||
    pattern ===
      null ||
    Array.isArray(
      pattern,
    )
  ) {
    throw new Error(
      "Recommendation Learning Pattern must be an object.",
    );
  }

  validateRequiredIdentifier(
    pattern.id,
    "Recommendation Learning Pattern id",
  );

  if (
    !isRecommendationLearningPatternType(
      pattern.type,
    )
  ) {
    throw new Error(
      "Recommendation Learning Pattern type is invalid.",
    );
  }

  if (
    !isRecommendationLearningPatternSeverity(
      pattern.severity,
    )
  ) {
    throw new Error(
      "Recommendation Learning Pattern severity is invalid.",
    );
  }

  validateUnitInterval(
    pattern.confidence,
    "Recommendation Learning Pattern confidence",
  );

  validateRequiredString(
    pattern.description,
    "Recommendation Learning Pattern description",
  );

  validateUniqueIdentifierArray(
    pattern.relatedObservationIds,
    "Recommendation Learning Pattern relatedObservationIds",
  );

  validateUniqueIdentifierArray(
    pattern.relatedEntryIds,
    "Recommendation Learning Pattern relatedEntryIds",
  );

  validateUniqueIdentifierArray(
    pattern.relatedComparisonIds,
    "Recommendation Learning Pattern relatedComparisonIds",
  );

  validateUniqueStringArray(
    pattern.relatedStrategyTypes,
    "Recommendation Learning Pattern relatedStrategyTypes",
  );

  validateUniqueStringArray(
    pattern.relatedDecisionTypes,
    "Recommendation Learning Pattern relatedDecisionTypes",
  );

  validateUniqueStringArray(
    pattern.relatedSignalTypes,
    "Recommendation Learning Pattern relatedSignalTypes",
  );

  validateTimestamp(
    pattern.detectedAt,
    "Recommendation Learning Pattern detectedAt",
  );
}

export function validateRecommendationLearningPatterns(
  patterns:
    readonly RecommendationLearningPattern[],
): void {
  if (
    !Array.isArray(
      patterns,
    )
  ) {
    throw new Error(
      "Recommendation Learning Patterns must be an array.",
    );
  }

  const observedIds =
    new Set<string>();

  patterns.forEach(
    (
      pattern,
      index,
    ) => {
      try {
        validateRecommendationLearningPattern({
          pattern,
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
          `Recommendation Learning Pattern at index ${index} is invalid: ${message}`,
        );
      }

      if (
        observedIds.has(
          pattern.id,
        )
      ) {
        throw new Error(
          `Recommendation Learning Patterns must not contain duplicate id: ${pattern.id}.`,
        );
      }

      observedIds.add(
        pattern.id,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validateDetectRecommendationLearningPatternsParams(
  params:
    DetectRecommendationLearningPatternsParams,
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
      "Detect Recommendation Learning Patterns params must be an object.",
    );
  }

  validateRecommendationLearningObservationArray(
    params.observations,
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

  validateTimestamp(
    params.detectedAt,
    "detectedAt",
  );

  if (
    typeof params.createPatternId !==
    "function"
  ) {
    throw new Error(
      "createPatternId must be a function.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Strategy Profile Validation                                        */
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

  const observedStrategyTypes =
    new Set<string>();

  profiles.forEach(
    (
      profile,
      index,
    ) => {
      if (
        typeof profile !==
          "object" ||
        profile ===
          null ||
        Array.isArray(
          profile,
        )
      ) {
        throw new Error(
          `Recommendation Strategy Learning Profile at index ${index} must be an object.`,
        );
      }

      validateRequiredString(
        profile.strategyType,
        `strategyProfiles[${index}].strategyType`,
      );

      validateEffectiveness(
        profile.overall,
        `strategyProfiles[${index}].overall`,
      );

      validateUniqueIdentifierArray(
        profile.relatedObservationIds,
        `strategyProfiles[${index}].relatedObservationIds`,
      );

      if (
        profile.relatedObservationIds.length !==
        profile.overall.sampleCount
      ) {
        throw new Error(
          `strategyProfiles[${index}].relatedObservationIds length must match overall.sampleCount.`,
        );
      }

      if (
        observedStrategyTypes.has(
          profile.strategyType,
        )
      ) {
        throw new Error(
          `Recommendation Strategy Learning Profiles must not contain duplicate strategyType: ${profile.strategyType}.`,
        );
      }

      observedStrategyTypes.add(
        profile.strategyType,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Profile Validation                                */
/* ------------------------------------------------------------------ */

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

  const observedDecisionTypes =
    new Set<string>();

  profiles.forEach(
    (
      profile,
      index,
    ) => {
      if (
        typeof profile !==
          "object" ||
        profile ===
          null ||
        Array.isArray(
          profile,
        )
      ) {
        throw new Error(
          `Recommendation Runtime Decision Learning Profile at index ${index} must be an object.`,
        );
      }

      validateRequiredString(
        profile.decisionType,
        `runtimeDecisionProfiles[${index}].decisionType`,
      );

      validateEffectiveness(
        profile.effectiveness,
        `runtimeDecisionProfiles[${index}].effectiveness`,
      );

      validateUniqueIdentifierArray(
        profile.relatedObservationIds,
        `runtimeDecisionProfiles[${index}].relatedObservationIds`,
      );

      if (
        profile.relatedObservationIds.length !==
        profile.effectiveness.sampleCount
      ) {
        throw new Error(
          `runtimeDecisionProfiles[${index}].relatedObservationIds length must match effectiveness.sampleCount.`,
        );
      }

      if (
        observedDecisionTypes.has(
          profile.decisionType,
        )
      ) {
        throw new Error(
          `Recommendation Runtime Decision Learning Profiles must not contain duplicate decisionType: ${profile.decisionType}.`,
        );
      }

      observedDecisionTypes.add(
        profile.decisionType,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Effectiveness Validation                                           */
/* ------------------------------------------------------------------ */

function validateEffectiveness(
  effectiveness: {
    sampleCount:
      number;

    positiveCount:
      number;

    neutralCount:
      number;

    negativeCount:
      number;

    ambiguousCount:
      number;

    unknownCount:
      number;

    effectivenessScore:
      number;

    confidence:
      number;
  },
  fieldName:
    string,
): void {
  validateNonNegativeInteger(
    effectiveness.sampleCount,
    `${fieldName}.sampleCount`,
  );

  validateNonNegativeInteger(
    effectiveness.positiveCount,
    `${fieldName}.positiveCount`,
  );

  validateNonNegativeInteger(
    effectiveness.neutralCount,
    `${fieldName}.neutralCount`,
  );

  validateNonNegativeInteger(
    effectiveness.negativeCount,
    `${fieldName}.negativeCount`,
  );

  validateNonNegativeInteger(
    effectiveness.ambiguousCount,
    `${fieldName}.ambiguousCount`,
  );

  validateNonNegativeInteger(
    effectiveness.unknownCount,
    `${fieldName}.unknownCount`,
  );

  const expectedSampleCount =
    effectiveness.positiveCount +
    effectiveness.neutralCount +
    effectiveness.negativeCount +
    effectiveness.ambiguousCount +
    effectiveness.unknownCount;

  if (
    effectiveness.sampleCount !==
    expectedSampleCount
  ) {
    throw new Error(
      `${fieldName}.sampleCount must equal all outcome category counts.`,
    );
  }

  validateUnitInterval(
    effectiveness.effectivenessScore,
    `${fieldName}.effectivenessScore`,
  );

  validateUnitInterval(
    effectiveness.confidence,
    `${fieldName}.confidence`,
  );
}

/* ------------------------------------------------------------------ */
/* Clone                                                              */
/* ------------------------------------------------------------------ */

export function cloneRecommendationLearningPattern(
  pattern:
    RecommendationLearningPattern,
): RecommendationLearningPattern {
  validateRecommendationLearningPattern({
    pattern,
  });

  return {
    ...pattern,

    relatedObservationIds: [
      ...pattern.relatedObservationIds,
    ],

    relatedEntryIds: [
      ...pattern.relatedEntryIds,
    ],

    relatedComparisonIds: [
      ...pattern.relatedComparisonIds,
    ],

    relatedStrategyTypes: [
      ...pattern.relatedStrategyTypes,
    ],

    relatedDecisionTypes: [
      ...pattern.relatedDecisionTypes,
    ],

    relatedSignalTypes: [
      ...pattern.relatedSignalTypes,
    ],
  };
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

function validateUniqueStringArray(
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
/* Number Helpers                                                     */
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

/**
 * Part B에서 Confidence 충돌 및 Profile 비교에 사용하기 위해
 * 유지하는 내부 숫자 비교 Helper입니다.
 */
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

void areNumbersApproximatelyEqual;

/* ------------------------------------------------------------------ */
/* Part C — Pattern Finalization                                      */
/* ------------------------------------------------------------------ */

/**
 * Pattern 배열을 안정적인 순서로 정렬하고,
 * Evidence 배열을 정규화한 최종 결과를 반환합니다.
 *
 * 원본 Pattern 객체와 배열은 변경하지 않습니다.
 */
export function finalizeRecommendationLearningPatterns(
  patterns:
    readonly RecommendationLearningPattern[],
): RecommendationLearningPattern[] {
  validateRecommendationLearningPatterns(
    patterns,
  );

  return patterns
    .map(
      (
        pattern,
      ) =>
        normalizeRecommendationLearningPattern(
          pattern,
        ),
    )
    .sort(
      compareRecommendationLearningPatterns,
    );
}

/* ------------------------------------------------------------------ */
/* Pattern Normalization                                              */
/* ------------------------------------------------------------------ */

function normalizeRecommendationLearningPattern(
  pattern:
    RecommendationLearningPattern,
): RecommendationLearningPattern {
  const normalized:
    RecommendationLearningPattern = {
      ...pattern,

      confidence:
        roundScore(
          clampUnitInterval(
            pattern.confidence,
          ),
        ),

      description:
        pattern.description.trim(),

      relatedObservationIds:
        sortUniqueStrings(
          pattern.relatedObservationIds,
        ),

      relatedEntryIds:
        sortUniqueStrings(
          pattern.relatedEntryIds,
        ),

      relatedComparisonIds:
        sortUniqueStrings(
          pattern.relatedComparisonIds,
        ),

      relatedStrategyTypes:
        sortUniqueStrings(
          pattern.relatedStrategyTypes,
        ),

      relatedDecisionTypes:
        sortUniqueStrings(
          pattern.relatedDecisionTypes,
        ),

      relatedSignalTypes:
        sortUniqueStrings(
          pattern.relatedSignalTypes,
        ),
    };

  validateRecommendationLearningPattern({
    pattern:
      normalized,
  });

  return normalized;
}

/* ------------------------------------------------------------------ */
/* Pattern Ordering                                                   */
/* ------------------------------------------------------------------ */

/**
 * Pattern의 결정적 정렬 순서입니다.
 *
 * 1. Severity
 * 2. Confidence
 * 3. Pattern Type
 * 4. Pattern ID
 */
function compareRecommendationLearningPatterns(
  left:
    RecommendationLearningPattern,
  right:
    RecommendationLearningPattern,
): number {
  const severityDifference =
    getPatternSeverityRank(
      right.severity,
    ) -
    getPatternSeverityRank(
      left.severity,
    );

  if (
    severityDifference !==
    0
  ) {
    return severityDifference;
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

function getPatternSeverityRank(
  severity:
    RecommendationLearningPatternSeverity,
): number {
  switch (
    severity
  ) {
    case "low":
      return 1;

    case "moderate":
      return 2;

    case "high":
      return 3;
  }
}

/* ------------------------------------------------------------------ */
/* Evidence Consistency Params                                        */
/* ------------------------------------------------------------------ */

export type ValidateRecommendationLearningPatternEvidenceConsistencyParams = {
  patterns:
    readonly RecommendationLearningPattern[];

  observations:
    readonly RecommendationLearningObservation[];

  strategyProfiles:
    readonly RecommendationStrategyLearningProfile[];

  runtimeDecisionProfiles:
    readonly RecommendationRuntimeDecisionLearningProfile[];

  signalReliabilityProfiles:
    readonly RecommendationSignalReliabilityProfile[];
};

/**
 * Pattern이 참조하는 Evidence가 실제 입력 데이터에 존재하는지
 * 교차 검증합니다.
 */
export function validateRecommendationLearningPatternEvidenceConsistency(
  params:
    ValidateRecommendationLearningPatternEvidenceConsistencyParams,
): void {
  const {
    patterns,
    observations,
    strategyProfiles,
    runtimeDecisionProfiles,
    signalReliabilityProfiles,
  } = params;

  validateRecommendationLearningPatterns(
    patterns,
  );

  validateRecommendationLearningObservationArray(
    observations,
  );

  validateStrategyProfiles(
    strategyProfiles,
  );

  validateRuntimeDecisionProfiles(
    runtimeDecisionProfiles,
  );

  validateRecommendationSignalReliabilityProfiles(
    signalReliabilityProfiles,
  );

  const observationById =
    new Map<
      string,
      RecommendationLearningObservation
    >();

  const entryIds =
    new Set<string>();

  const comparisonIds =
    new Set<string>();

  observations.forEach(
    (
      observation,
    ) => {
      observationById.set(
        observation.id,
        observation,
      );

      comparisonIds.add(
        observation.comparisonId,
      );

      if (
        observation.previousEntryId !==
        null
      ) {
        entryIds.add(
          observation.previousEntryId,
        );
      }

      entryIds.add(
        observation.currentEntryId,
      );
    },
  );

  const strategyTypes =
    new Set(
      strategyProfiles.map(
        (
          profile,
        ) =>
          profile.strategyType,
      ),
    );

  const decisionTypes =
    new Set(
      runtimeDecisionProfiles.map(
        (
          profile,
        ) =>
          profile.decisionType,
      ),
    );

  const signalTypes =
    new Set(
      signalReliabilityProfiles.map(
        (
          profile,
        ) =>
          profile.signalType,
      ),
    );

  patterns.forEach(
    (
      pattern,
      patternIndex,
    ) => {
      pattern.relatedObservationIds.forEach(
        (
          observationId,
        ) => {
          if (
            !observationById.has(
              observationId,
            )
          ) {
            throw new Error(
              `patterns[${patternIndex}].relatedObservationIds references an unknown Observation: ${observationId}.`,
            );
          }
        },
      );

      pattern.relatedEntryIds.forEach(
        (
          entryId,
        ) => {
          if (
            !entryIds.has(
              entryId,
            )
          ) {
            throw new Error(
              `patterns[${patternIndex}].relatedEntryIds references an unknown Entry: ${entryId}.`,
            );
          }
        },
      );

      pattern.relatedComparisonIds.forEach(
        (
          comparisonId,
        ) => {
          if (
            !comparisonIds.has(
              comparisonId,
            )
          ) {
            throw new Error(
              `patterns[${patternIndex}].relatedComparisonIds references an unknown Comparison: ${comparisonId}.`,
            );
          }
        },
      );

      pattern.relatedStrategyTypes.forEach(
        (
          strategyType,
        ) => {
          if (
            !strategyTypes.has(
              strategyType,
            ) &&
            !observations.some(
              (
                observation,
              ) =>
                observation.currentStrategyType ===
                strategyType,
            )
          ) {
            throw new Error(
              `patterns[${patternIndex}].relatedStrategyTypes references an unknown Strategy: ${strategyType}.`,
            );
          }
        },
      );

      pattern.relatedDecisionTypes.forEach(
        (
          decisionType,
        ) => {
          if (
            !decisionTypes.has(
              decisionType,
            ) &&
            !observations.some(
              (
                observation,
              ) =>
                observation.enabledRuntimeDecisionTypes.includes(
                  decisionType,
                ),
            )
          ) {
            throw new Error(
              `patterns[${patternIndex}].relatedDecisionTypes references an unknown Runtime Decision: ${decisionType}.`,
            );
          }
        },
      );

      pattern.relatedSignalTypes.forEach(
        (
          signalType,
        ) => {
          if (
            !signalTypes.has(
              signalType,
            )
          ) {
            throw new Error(
              `patterns[${patternIndex}].relatedSignalTypes references an unknown Memory Signal: ${signalType}.`,
            );
          }
        },
      );

      validatePatternEvidenceCardinality(
        pattern,
        patternIndex,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Evidence Cardinality                                               */
/* ------------------------------------------------------------------ */

function validatePatternEvidenceCardinality(
  pattern:
    RecommendationLearningPattern,
  patternIndex:
    number,
): void {
  if (
    pattern.type ===
      "insufficient-evidence"
  ) {
    return;
  }

  const evidenceCount =
    pattern.relatedObservationIds.length +
    pattern.relatedEntryIds.length +
    pattern.relatedComparisonIds.length +
    pattern.relatedStrategyTypes.length +
    pattern.relatedDecisionTypes.length +
    pattern.relatedSignalTypes.length;

  if (
    evidenceCount ===
    0
  ) {
    throw new Error(
      `patterns[${patternIndex}] must contain at least one related evidence reference.`,
    );
  }

  if (
    (
      pattern.type ===
        "strategy-success" ||
      pattern.type ===
        "strategy-failure" ||
      pattern.type ===
        "state-strategy-mismatch" ||
      pattern.type ===
        "repeated-premature-advance" ||
      pattern.type ===
        "persistent-over-observation" ||
      pattern.type ===
        "effective-stabilization" ||
      pattern.type ===
        "effective-recovery"
    ) &&
    pattern.relatedStrategyTypes.length ===
      0
  ) {
    throw new Error(
      `patterns[${patternIndex}] must reference at least one Strategy.`,
    );
  }

  if (
    (
      pattern.type ===
        "decision-success" ||
      pattern.type ===
        "decision-failure"
    ) &&
    pattern.relatedDecisionTypes.length ===
      0
  ) {
    throw new Error(
      `patterns[${patternIndex}] must reference at least one Runtime Decision.`,
    );
  }

  if (
    (
      pattern.type ===
        "signal-overestimation" ||
      pattern.type ===
        "signal-underestimation"
    ) &&
    pattern.relatedSignalTypes.length ===
      0
  ) {
    throw new Error(
      `patterns[${patternIndex}] must reference at least one Memory Signal.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Pattern Query Types                                                */
/* ------------------------------------------------------------------ */

export type FindRecommendationLearningPatternByIdParams = {
  patterns:
    readonly RecommendationLearningPattern[];

  patternId:
    string;
};

export type FindRecommendationLearningPatternsByTypeParams = {
  patterns:
    readonly RecommendationLearningPattern[];

  type:
    RecommendationLearningPatternType;
};

export type FindRecommendationLearningPatternsBySeverityParams = {
  patterns:
    readonly RecommendationLearningPattern[];

  severity:
    RecommendationLearningPatternSeverity;
};

export type FindRecommendationLearningPatternsByStrategyParams = {
  patterns:
    readonly RecommendationLearningPattern[];

  strategyType:
    RecommendationAdaptiveLearningStrategyType;
};

export type FindRecommendationLearningPatternsByRuntimeDecisionParams = {
  patterns:
    readonly RecommendationLearningPattern[];

  decisionType:
    RecommendationAdaptiveLearningRuntimeDecisionType;
};

export type FindRecommendationLearningPatternsBySignalParams = {
  patterns:
    readonly RecommendationLearningPattern[];

  signalType:
    RecommendationSignalReliabilityProfile["signalType"];
};

export type FindRecommendationLearningPatternsByObservationParams = {
  patterns:
    readonly RecommendationLearningPattern[];

  observationId:
    string;
};

/* ------------------------------------------------------------------ */
/* Pattern Query Helpers                                              */
/* ------------------------------------------------------------------ */

export function findRecommendationLearningPatternById(
  params:
    FindRecommendationLearningPatternByIdParams,
): RecommendationLearningPattern | null {
  validateRecommendationLearningPatterns(
    params.patterns,
  );

  validateRequiredIdentifier(
    params.patternId,
    "patternId",
  );

  const pattern =
    params.patterns.find(
      (
        candidate,
      ) =>
        candidate.id ===
        params.patternId,
    );

  return pattern ===
    undefined
    ? null
    : cloneRecommendationLearningPattern(
        pattern,
      );
}

export function findRecommendationLearningPatternsByType(
  params:
    FindRecommendationLearningPatternsByTypeParams,
): RecommendationLearningPattern[] {
  validateRecommendationLearningPatterns(
    params.patterns,
  );

  if (
    !isRecommendationLearningPatternType(
      params.type,
    )
  ) {
    throw new Error(
      "Recommendation Learning Pattern query type is invalid.",
    );
  }

  return params.patterns
    .filter(
      (
        pattern,
      ) =>
        pattern.type ===
        params.type,
    )
    .map(
      cloneRecommendationLearningPattern,
    );
}

export function findRecommendationLearningPatternsBySeverity(
  params:
    FindRecommendationLearningPatternsBySeverityParams,
): RecommendationLearningPattern[] {
  validateRecommendationLearningPatterns(
    params.patterns,
  );

  if (
    !isRecommendationLearningPatternSeverity(
      params.severity,
    )
  ) {
    throw new Error(
      "Recommendation Learning Pattern query severity is invalid.",
    );
  }

  return params.patterns
    .filter(
      (
        pattern,
      ) =>
        pattern.severity ===
        params.severity,
    )
    .map(
      cloneRecommendationLearningPattern,
    );
}

export function findRecommendationLearningPatternsByStrategy(
  params:
    FindRecommendationLearningPatternsByStrategyParams,
): RecommendationLearningPattern[] {
  validateRecommendationLearningPatterns(
    params.patterns,
  );

  validateRequiredString(
    params.strategyType,
    "strategyType",
  );

  return params.patterns
    .filter(
      (
        pattern,
      ) =>
        pattern.relatedStrategyTypes.includes(
          params.strategyType,
        ),
    )
    .map(
      cloneRecommendationLearningPattern,
    );
}

export function findRecommendationLearningPatternsByRuntimeDecision(
  params:
    FindRecommendationLearningPatternsByRuntimeDecisionParams,
): RecommendationLearningPattern[] {
  validateRecommendationLearningPatterns(
    params.patterns,
  );

  validateRequiredString(
    params.decisionType,
    "decisionType",
  );

  return params.patterns
    .filter(
      (
        pattern,
      ) =>
        pattern.relatedDecisionTypes.includes(
          params.decisionType,
        ),
    )
    .map(
      cloneRecommendationLearningPattern,
    );
}

export function findRecommendationLearningPatternsBySignal(
  params:
    FindRecommendationLearningPatternsBySignalParams,
): RecommendationLearningPattern[] {
  validateRecommendationLearningPatterns(
    params.patterns,
  );

  validateRequiredString(
    params.signalType,
    "signalType",
  );

  return params.patterns
    .filter(
      (
        pattern,
      ) =>
        pattern.relatedSignalTypes.includes(
          params.signalType,
        ),
    )
    .map(
      cloneRecommendationLearningPattern,
    );
}

export function findRecommendationLearningPatternsByObservation(
  params:
    FindRecommendationLearningPatternsByObservationParams,
): RecommendationLearningPattern[] {
  validateRecommendationLearningPatterns(
    params.patterns,
  );

  validateRequiredIdentifier(
    params.observationId,
    "observationId",
  );

  return params.patterns
    .filter(
      (
        pattern,
      ) =>
        pattern.relatedObservationIds.includes(
          params.observationId,
        ),
    )
    .map(
      cloneRecommendationLearningPattern,
    );
}

/* ------------------------------------------------------------------ */
/* Primary Pattern                                                    */
/* ------------------------------------------------------------------ */

/**
 * 현재 학습 결과를 가장 강하게 나타내는 Pattern을 반환합니다.
 *
 * 우선순위:
 *
 * 1. conflicted evidence
 * 2. 실패·위험 Pattern
 * 3. 성공 Pattern
 * 4. insufficient evidence
 */
export function getPrimaryRecommendationLearningPattern(
  patterns:
    readonly RecommendationLearningPattern[],
): RecommendationLearningPattern | null {
  const finalized =
    finalizeRecommendationLearningPatterns(
      patterns,
    );

  if (
    finalized.length ===
    0
  ) {
    return null;
  }

  const sorted =
    finalized.sort(
      (
        left,
        right,
      ) => {
        const priorityDifference =
          getPatternTypePriority(
            right.type,
          ) -
          getPatternTypePriority(
            left.type,
          );

        if (
          priorityDifference !==
          0
        ) {
          return priorityDifference;
        }

        return compareRecommendationLearningPatterns(
          left,
          right,
        );
      },
    );

  const primary =
    sorted[
      0
    ];

  return primary ===
    undefined
    ? null
    : cloneRecommendationLearningPattern(
        primary,
      );
}

function getPatternTypePriority(
  type:
    RecommendationLearningPatternType,
): number {
  switch (
    type
  ) {
    case "conflicting-evidence":
      return 100;

    case "repeated-premature-advance":
      return 95;

    case "persistent-over-observation":
      return 90;

    case "state-strategy-mismatch":
      return 85;

    case "strategy-failure":
      return 80;

    case "decision-failure":
      return 75;

    case "signal-overestimation":
      return 70;

    case "confidence-degradation":
      return 65;

    case "effective-recovery":
      return 60;

    case "effective-stabilization":
      return 55;

    case "strategy-success":
      return 50;

    case "decision-success":
      return 45;

    case "signal-underestimation":
      return 40;

    case "confidence-recovery":
      return 35;

    case "insufficient-evidence":
      return 10;
  }
}

/* ------------------------------------------------------------------ */
/* Pattern Conflict Classification                                   */
/* ------------------------------------------------------------------ */

export type RecommendationLearningPatternConflict = {
  key:
    string;

  positivePatternIds:
    string[];

  negativePatternIds:
    string[];

  relatedStrategyTypes:
    RecommendationAdaptiveLearningStrategyType[];

  relatedDecisionTypes:
    RecommendationAdaptiveLearningRuntimeDecisionType[];

  confidence:
    number;
};

/**
 * 동일 Strategy 또는 Decision에 성공·실패 Pattern이 동시에
 * 존재하는지 분석합니다.
 */
export function findRecommendationLearningPatternConflicts(
  patterns:
    readonly RecommendationLearningPattern[],
): RecommendationLearningPatternConflict[] {
  validateRecommendationLearningPatterns(
    patterns,
  );

  const conflicts:
    RecommendationLearningPatternConflict[] = [];

  collectStrategyPatternConflicts(
    patterns,
    conflicts,
  );

  collectDecisionPatternConflicts(
    patterns,
    conflicts,
  );

  return conflicts.sort(
    (
      left,
      right,
    ) => {
      if (
        !areNumbersApproximatelyEqual(
          left.confidence,
          right.confidence,
        )
      ) {
        return right.confidence -
          left.confidence;
      }

      return left.key.localeCompare(
        right.key,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Strategy Conflicts                                                 */
/* ------------------------------------------------------------------ */

function collectStrategyPatternConflicts(
  patterns:
    readonly RecommendationLearningPattern[],
  conflicts:
    RecommendationLearningPatternConflict[],
): void {
  const strategyTypes =
    uniqueStrings(
      patterns.flatMap(
        (
          pattern,
        ) =>
          pattern.relatedStrategyTypes,
      ),
    );

  strategyTypes.forEach(
    (
      strategyType,
    ) => {
      const positivePatterns =
        patterns.filter(
          (
            pattern,
          ) =>
            pattern.relatedStrategyTypes.includes(
              strategyType,
            ) &&
            isPositiveLearningPatternType(
              pattern.type,
            ),
        );

      const negativePatterns =
        patterns.filter(
          (
            pattern,
          ) =>
            pattern.relatedStrategyTypes.includes(
              strategyType,
            ) &&
            isNegativeLearningPatternType(
              pattern.type,
            ),
        );

      if (
        positivePatterns.length ===
          0 ||
        negativePatterns.length ===
          0
      ) {
        return;
      }

      conflicts.push({
        key:
          `strategy:${strategyType}`,

        positivePatternIds:
          positivePatterns.map(
            (
              pattern,
            ) =>
              pattern.id,
          ),

        negativePatternIds:
          negativePatterns.map(
            (
              pattern,
            ) =>
              pattern.id,
          ),

        relatedStrategyTypes: [
          strategyType,
        ],

        relatedDecisionTypes:
          [],

        confidence:
          calculatePatternConflictConfidence({
            positivePatterns,
            negativePatterns,
          }),
      });
    },
  );
}

/* ------------------------------------------------------------------ */
/* Decision Conflicts                                                 */
/* ------------------------------------------------------------------ */

function collectDecisionPatternConflicts(
  patterns:
    readonly RecommendationLearningPattern[],
  conflicts:
    RecommendationLearningPatternConflict[],
): void {
  const decisionTypes =
    uniqueStrings(
      patterns.flatMap(
        (
          pattern,
        ) =>
          pattern.relatedDecisionTypes,
      ),
    );

  decisionTypes.forEach(
    (
      decisionType,
    ) => {
      const positivePatterns =
        patterns.filter(
          (
            pattern,
          ) =>
            pattern.relatedDecisionTypes.includes(
              decisionType,
            ) &&
            isPositiveLearningPatternType(
              pattern.type,
            ),
        );

      const negativePatterns =
        patterns.filter(
          (
            pattern,
          ) =>
            pattern.relatedDecisionTypes.includes(
              decisionType,
            ) &&
            isNegativeLearningPatternType(
              pattern.type,
            ),
        );

      if (
        positivePatterns.length ===
          0 ||
        negativePatterns.length ===
          0
      ) {
        return;
      }

      conflicts.push({
        key:
          `decision:${decisionType}`,

        positivePatternIds:
          positivePatterns.map(
            (
              pattern,
            ) =>
              pattern.id,
          ),

        negativePatternIds:
          negativePatterns.map(
            (
              pattern,
            ) =>
              pattern.id,
          ),

        relatedStrategyTypes:
          [],

        relatedDecisionTypes: [
          decisionType,
        ],

        confidence:
          calculatePatternConflictConfidence({
            positivePatterns,
            negativePatterns,
          }),
      });
    },
  );
}

function calculatePatternConflictConfidence(
  params: {
    positivePatterns:
      readonly RecommendationLearningPattern[];

    negativePatterns:
      readonly RecommendationLearningPattern[];
  },
): number {
  const positiveAverage =
    averagePatternConfidence(
      params.positivePatterns,
    );

  const negativeAverage =
    averagePatternConfidence(
      params.negativePatterns,
    );

  const balance =
    1 -
    Math.abs(
      positiveAverage -
        negativeAverage,
    );

  const combinedStrength =
    (
      positiveAverage +
      negativeAverage
    ) /
    2;

  return roundScore(
    clampUnitInterval(
      balance *
        0.45 +
      combinedStrength *
        0.55,
    ),
  );
}

function averagePatternConfidence(
  patterns:
    readonly RecommendationLearningPattern[],
): number {
  if (
    patterns.length ===
    0
  ) {
    return 0;
  }

  const total =
    patterns.reduce(
      (
        sum,
        pattern,
      ) =>
        sum +
        pattern.confidence,
      0,
    );

  return total /
    patterns.length;
}

/* ------------------------------------------------------------------ */
/* Pattern Direction Helpers                                          */
/* ------------------------------------------------------------------ */

export function isPositiveLearningPatternType(
  type:
    RecommendationLearningPatternType,
): boolean {
  return (
    type ===
      "strategy-success" ||
    type ===
      "decision-success" ||
    type ===
      "effective-stabilization" ||
    type ===
      "effective-recovery" ||
    type ===
      "signal-underestimation" ||
    type ===
      "confidence-recovery"
  );
}

export function isNegativeLearningPatternType(
  type:
    RecommendationLearningPatternType,
): boolean {
  return (
    type ===
      "strategy-failure" ||
    type ===
      "decision-failure" ||
    type ===
      "state-strategy-mismatch" ||
    type ===
      "repeated-premature-advance" ||
    type ===
      "persistent-over-observation" ||
    type ===
      "signal-overestimation" ||
    type ===
      "confidence-degradation"
  );
}

export function isConflictedLearningPatternType(
  type:
    RecommendationLearningPatternType,
): boolean {
  return type ===
    "conflicting-evidence";
}

/* ------------------------------------------------------------------ */
/* Pattern Summary Types                                              */
/* ------------------------------------------------------------------ */

export type RecommendationLearningPatternTypeCounts =
  Record<
    RecommendationLearningPatternType,
    number
  >;

export type RecommendationLearningPatternSeverityCounts = {
  low:
    number;

  moderate:
    number;

  high:
    number;
};

export type RecommendationLearningPatternSummary = {
  patternCount:
    number;

  positivePatternCount:
    number;

  negativePatternCount:
    number;

  conflictedPatternCount:
    number;

  insufficientEvidencePatternCount:
    number;

  highSeverityPatternCount:
    number;

  averageConfidence:
    number;

  typeCounts:
    RecommendationLearningPatternTypeCounts;

  severityCounts:
    RecommendationLearningPatternSeverityCounts;

  primaryPatternId:
    string | null;

  primaryPatternType:
    RecommendationLearningPatternType | null;

  hasConflictingEvidence:
    boolean;
};

/* ------------------------------------------------------------------ */
/* Pattern Summary                                                    */
/* ------------------------------------------------------------------ */

export function summarizeRecommendationLearningPatterns(
  patterns:
    readonly RecommendationLearningPattern[],
): RecommendationLearningPatternSummary {
  validateRecommendationLearningPatterns(
    patterns,
  );

  const typeCounts =
    createEmptyRecommendationLearningPatternTypeCounts();

  const severityCounts:
    RecommendationLearningPatternSeverityCounts = {
      low:
        0,

      moderate:
        0,

      high:
        0,
    };

  let positivePatternCount =
    0;

  let negativePatternCount =
    0;

  let conflictedPatternCount =
    0;

  let insufficientEvidencePatternCount =
    0;

  let totalConfidence =
    0;

  patterns.forEach(
    (
      pattern,
    ) => {
      typeCounts[
        pattern.type
      ] +=
        1;

      severityCounts[
        pattern.severity
      ] +=
        1;

      totalConfidence +=
        pattern.confidence;

      if (
        isPositiveLearningPatternType(
          pattern.type,
        )
      ) {
        positivePatternCount +=
          1;
      }

      if (
        isNegativeLearningPatternType(
          pattern.type,
        )
      ) {
        negativePatternCount +=
          1;
      }

      if (
        isConflictedLearningPatternType(
          pattern.type,
        )
      ) {
        conflictedPatternCount +=
          1;
      }

      if (
        pattern.type ===
        "insufficient-evidence"
      ) {
        insufficientEvidencePatternCount +=
          1;
      }
    },
  );

  const primaryPattern =
    getPrimaryRecommendationLearningPattern(
      patterns,
    );

  return {
    patternCount:
      patterns.length,

    positivePatternCount,

    negativePatternCount,

    conflictedPatternCount,

    insufficientEvidencePatternCount,

    highSeverityPatternCount:
      severityCounts.high,

    averageConfidence:
      patterns.length ===
      0
        ? 0
        : roundScore(
            totalConfidence /
              patterns.length,
          ),

    typeCounts,

    severityCounts,

    primaryPatternId:
      primaryPattern?.id ??
      null,

    primaryPatternType:
      primaryPattern?.type ??
      null,

    hasConflictingEvidence:
      conflictedPatternCount >
        0 ||
      findRecommendationLearningPatternConflicts(
        patterns,
      ).length >
        0,
  };
}

/* ------------------------------------------------------------------ */
/* Empty Type Counts                                                  */
/* ------------------------------------------------------------------ */

export function createEmptyRecommendationLearningPatternTypeCounts():
  RecommendationLearningPatternTypeCounts {
  return {
    "strategy-success":
      0,

    "strategy-failure":
      0,

    "decision-success":
      0,

    "decision-failure":
      0,

    "state-strategy-mismatch":
      0,

    "repeated-premature-advance":
      0,

    "persistent-over-observation":
      0,

    "effective-stabilization":
      0,

    "effective-recovery":
      0,

    "signal-overestimation":
      0,

    "signal-underestimation":
      0,

    "confidence-degradation":
      0,

    "confidence-recovery":
      0,

    "conflicting-evidence":
      0,

    "insufficient-evidence":
      0,
  };
}

/* ------------------------------------------------------------------ */
/* Collection Clone                                                   */
/* ------------------------------------------------------------------ */

export function cloneRecommendationLearningPatterns(
  patterns:
    readonly RecommendationLearningPattern[],
): RecommendationLearningPattern[] {
  validateRecommendationLearningPatterns(
    patterns,
  );

  return patterns.map(
    cloneRecommendationLearningPattern,
  );
}

/* ------------------------------------------------------------------ */
/* Part C Generic Helpers                                             */
/* ------------------------------------------------------------------ */

function sortUniqueStrings<T extends string>(
  values:
    readonly T[],
): T[] {
  return uniqueStrings(
    values,
  ).sort(
    (
      left,
      right,
    ) =>
      left.localeCompare(
        right,
      ),
  );
}