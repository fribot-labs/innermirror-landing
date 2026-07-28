import {
    isRecommendationEvolutionMemorySignalType,
} from "./recommendationEvolutionMemoryTypes";

import {
    validateRecommendationLearningObservation,
    validateRecommendationLearningObservationArray,
} from "./createRecommendationLearningObservation";

import type {
    EvaluateMemorySignalReliabilityParams,
    RecommendationAdaptiveLearningMemorySignalType,
    RecommendationLearningObservation,
    RecommendationSignalReliabilityProfile,
    ValidateRecommendationSignalReliabilityProfileParams,
} from "./recommendationAdaptiveLearningTypes";

import type {
    RecommendationEvolutionMemoryAnalysis,
    RecommendationEvolutionMemorySignal,
} from "./recommendationEvolutionMemoryTypes";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

/**
 * 이 표본 수에 도달하면 표본량 Confidence가 1에 도달합니다.
 *
 * MVP에서는 지나치게 적은 데이터로 Signal 신뢰도를 확정하지
 * 않도록 5개의 관련 Observation을 기준으로 사용합니다.
 */
const FULL_CONFIDENCE_SAMPLE_COUNT =
  5;

/**
 * 부동소수점 비교 허용 오차입니다.
 */
const NUMBER_EQUALITY_TOLERANCE =
  1e-10;

/* ------------------------------------------------------------------ */
/* Internal Types                                                     */
/* ------------------------------------------------------------------ */

type RecommendationSignalObservationEvaluation =
  | "confirmed"
  | "contradicted"
  | "unresolved";

type EvaluateSignalObservationParams = {
  signalType:
    RecommendationAdaptiveLearningMemorySignalType;

  observation:
    RecommendationLearningObservation;
};

type CreateSignalReliabilityProfileParams = {
  signal:
    RecommendationEvolutionMemorySignal;

  observations:
    readonly RecommendationLearningObservation[];
};

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * REI04 Memory Analysis에 포함된 모든 Memory Signal의 신뢰도를
 * REI05 Learning Observation 결과와 비교해 평가합니다.
 *
 * 이 평가는 Signal이 결과를 만들었다는 인과관계를 의미하지
 * 않습니다. Signal이 가리킨 방향과 이후 관찰된 Outcome이 얼마나
 * 자주 일치했는지를 통계적으로 표현합니다.
 */
export function evaluateMemorySignalReliability(
  params:
    EvaluateMemorySignalReliabilityParams,
): RecommendationSignalReliabilityProfile[] {
  const {
    observations,
    memoryAnalysis,
  } = params;

  validateEvaluateMemorySignalReliabilityParams(
    params,
  );

  const profiles =
    memoryAnalysis.signals.map(
      (
        signal,
      ) =>
        createSignalReliabilityProfile({
          signal,
          observations,
        }),
    );

  validateRecommendationSignalReliabilityProfiles(
    profiles,
  );

  return profiles.map(
    cloneRecommendationSignalReliabilityProfile,
  );
}

/**
 * 특정 Memory Signal Type의 Reliability Profile만 평가합니다.
 *
 * 해당 Signal이 Memory Analysis에 존재하지 않으면 null을
 * 반환합니다.
 */
export function evaluateMemorySignalTypeReliability(
  params: {
    observations:
      readonly RecommendationLearningObservation[];

    memoryAnalysis:
      RecommendationEvolutionMemoryAnalysis;

    signalType:
      RecommendationAdaptiveLearningMemorySignalType;
  },
): RecommendationSignalReliabilityProfile | null {
  validateRecommendationLearningObservationArray(
    params.observations,
  );

  validateMemoryAnalysis(
    params.memoryAnalysis,
  );

  if (
    !isRecommendationEvolutionMemorySignalType(
      params.signalType,
    )
  ) {
    throw new Error(
      "Recommendation Signal Reliability signalType is invalid.",
    );
  }

  const signal =
    params.memoryAnalysis.signals.find(
      (
        candidate,
      ) =>
        candidate.type ===
        params.signalType,
    );

  if (
    signal ===
    undefined
  ) {
    return null;
  }

  return createSignalReliabilityProfile({
    signal,
    observations:
      params.observations,
  });
}

/* ------------------------------------------------------------------ */
/* Profile Creation                                                   */
/* ------------------------------------------------------------------ */

function createSignalReliabilityProfile(
  params:
    CreateSignalReliabilityProfileParams,
): RecommendationSignalReliabilityProfile {
  const {
    signal,
    observations,
  } = params;

  const relatedObservations =
    findSignalRelatedObservations({
      signal,
      observations,
    });

  let confirmedCount =
    0;

  let contradictedCount =
    0;

  let unresolvedCount =
    0;

  relatedObservations.forEach(
    (
      observation,
    ) => {
      const evaluation =
        evaluateSignalObservation({
          signalType:
            signal.type,

          observation,
        });

      switch (
        evaluation
      ) {
        case "confirmed":
          confirmedCount +=
            1;
          break;

        case "contradicted":
          contradictedCount +=
            1;
          break;

        case "unresolved":
          unresolvedCount +=
            1;
          break;
      }
    },
  );

  const sampleCount =
    relatedObservations.length;

  const resolvedCount =
    confirmedCount +
    contradictedCount;

  const reliabilityScore =
    resolvedCount ===
    0
      ? 0
      : confirmedCount /
        resolvedCount;

  const confidence =
    calculateSignalReliabilityConfidence({
      sampleCount,
      resolvedCount,
      sourceSignalScore:
        signal.score,
    });

  const profile:
    RecommendationSignalReliabilityProfile = {
      signalType:
        signal.type,

      sampleCount,

      confirmedCount,

      contradictedCount,

      unresolvedCount,

      reliabilityScore:
        roundScore(
          reliabilityScore,
        ),

      confidence:
        roundScore(
          confidence,
        ),

      relatedObservationIds:
        relatedObservations.map(
          (
            observation,
          ) =>
            observation.id,
        ),
    };

  validateRecommendationSignalReliabilityProfile({
    profile,
  });

  return profile;
}

/* ------------------------------------------------------------------ */
/* Signal ↔ Observation Resolution                                    */
/* ------------------------------------------------------------------ */

/**
 * 우선 relatedComparisonIds를 이용해 Observation을 연결합니다.
 *
 * Comparison ID가 제공되지 않았거나 해당 Observation을 찾지
 * 못한 경우 relatedEntryIds를 보조 기준으로 사용합니다.
 */
function findSignalRelatedObservations(
  params: {
    signal:
      RecommendationEvolutionMemorySignal;

    observations:
      readonly RecommendationLearningObservation[];
  },
): RecommendationLearningObservation[] {
  const {
    signal,
    observations,
  } = params;

  const relatedComparisonIds =
    new Set(
      signal.relatedComparisonIds,
    );

  const relatedEntryIds =
    new Set(
      signal.relatedEntryIds,
    );

  const matched =
    observations.filter(
      (
        observation,
      ) => {
        if (
          relatedComparisonIds.has(
            observation.comparisonId,
          )
        ) {
          return true;
        }

        if (
          relatedEntryIds.has(
            observation.currentEntryId,
          )
        ) {
          return true;
        }

        return (
          observation.previousEntryId !==
            null &&
          relatedEntryIds.has(
            observation.previousEntryId,
          )
        );
      },
    );

  return deduplicateObservations(
    matched,
  );
}

function deduplicateObservations(
  observations:
    readonly RecommendationLearningObservation[],
): RecommendationLearningObservation[] {
  const observedIds =
    new Set<string>();

  const unique:
    RecommendationLearningObservation[] = [];

  observations.forEach(
    (
      observation,
    ) => {
      if (
        observedIds.has(
          observation.id,
        )
      ) {
        return;
      }

      observedIds.add(
        observation.id,
      );

      unique.push(
        observation,
      );
    },
  );

  return unique;
}

/* ------------------------------------------------------------------ */
/* Signal Evaluation                                                  */
/* ------------------------------------------------------------------ */

function evaluateSignalObservation(
  params:
    EvaluateSignalObservationParams,
): RecommendationSignalObservationEvaluation {
  const {
    signalType,
    observation,
  } = params;

  switch (
    signalType
  ) {
    case "persistent-observation":
      return evaluatePersistentObservationSignal(
        observation,
      );

    case "persistent-stability":
      return evaluatePersistentStabilitySignal(
        observation,
      );

    case "persistent-stall":
      return evaluatePersistentStallSignal(
        observation,
      );

    case "persistent-fragmentation":
      return evaluatePersistentFragmentationSignal(
        observation,
      );

    case "strategy-oscillation":
      return evaluateStrategyOscillationSignal(
        observation,
      );

    case "state-oscillation":
      return evaluateStateOscillationSignal(
        observation,
      );

    case "confidence-degradation":
      return evaluateConfidenceDegradationSignal(
        observation,
      );

    case "confidence-recovery":
      return evaluateConfidenceRecoverySignal(
        observation,
      );

    case "risk-accumulation":
      return evaluateRiskAccumulationSignal(
        observation,
      );

    case "risk-reduction":
      return evaluateRiskReductionSignal(
        observation,
      );

    case "long-term-progression":
      return evaluateLongTermProgressionSignal(
        observation,
      );

    case "long-term-advancement":
      return evaluateLongTermAdvancementSignal(
        observation,
      );

    case "recovery-pattern":
      return evaluateRecoveryPatternSignal(
        observation,
      );

    case "insufficient-memory":
      return "unresolved";
  }
}

/* ------------------------------------------------------------------ */
/* Persistent Observation                                             */
/* ------------------------------------------------------------------ */

function evaluatePersistentObservationSignal(
  observation:
    RecommendationLearningObservation,
): RecommendationSignalObservationEvaluation {
  if (
    observation.currentStrategyType ===
      "observe" &&
    (
      observation.outcome ===
        "maintained" ||
      observation.outcome ===
        "unknown"
    )
  ) {
    return "confirmed";
  }

  if (
    observation.outcomeCategory ===
      "positive" ||
    observation.outcomeCategory ===
      "negative"
  ) {
    return "contradicted";
  }

  return "unresolved";
}

/* ------------------------------------------------------------------ */
/* Stability                                                          */
/* ------------------------------------------------------------------ */

function evaluatePersistentStabilitySignal(
  observation:
    RecommendationLearningObservation,
): RecommendationSignalObservationEvaluation {
  if (
    observation.outcome ===
      "maintained" ||
    observation.outcome ===
      "improved" ||
    observation.scoreChanges.stability >
      0
  ) {
    return "confirmed";
  }

  if (
    observation.outcome ===
      "fragmented" ||
    observation.outcome ===
      "regressed" ||
    observation.scoreChanges.stability <
      0
  ) {
    return "contradicted";
  }

  return "unresolved";
}

/* ------------------------------------------------------------------ */
/* Stall                                                              */
/* ------------------------------------------------------------------ */

function evaluatePersistentStallSignal(
  observation:
    RecommendationLearningObservation,
): RecommendationSignalObservationEvaluation {
  if (
    observation.outcome ===
      "stalled" ||
    observation.currentState ===
      "stalled"
  ) {
    return "confirmed";
  }

  if (
    observation.outcome ===
      "advanced" ||
    observation.outcome ===
      "improved" ||
    observation.outcome ===
      "recovered"
  ) {
    return "contradicted";
  }

  return "unresolved";
}

/* ------------------------------------------------------------------ */
/* Fragmentation                                                      */
/* ------------------------------------------------------------------ */

function evaluatePersistentFragmentationSignal(
  observation:
    RecommendationLearningObservation,
): RecommendationSignalObservationEvaluation {
  if (
    observation.outcome ===
      "fragmented" ||
    observation.currentState ===
      "fragmented"
  ) {
    return "confirmed";
  }

  if (
    observation.outcome ===
      "recovered" ||
    observation.outcome ===
      "improved" ||
    observation.scoreChanges.stability >
      0
  ) {
    return "contradicted";
  }

  return "unresolved";
}

/* ------------------------------------------------------------------ */
/* Oscillation                                                        */
/* ------------------------------------------------------------------ */

function evaluateStrategyOscillationSignal(
  observation:
    RecommendationLearningObservation,
): RecommendationSignalObservationEvaluation {
  if (
    observation.strategyChanged &&
    (
      observation.outcome ===
        "redirected" ||
      observation.outcomeCategory ===
        "ambiguous"
    )
  ) {
    return "confirmed";
  }

  if (
    !observation.strategyChanged &&
    observation.outcome ===
      "maintained"
  ) {
    return "contradicted";
  }

  return "unresolved";
}

function evaluateStateOscillationSignal(
  observation:
    RecommendationLearningObservation,
): RecommendationSignalObservationEvaluation {
  if (
    observation.stateChanged &&
    (
      observation.outcome ===
        "redirected" ||
      observation.outcomeCategory ===
        "ambiguous" ||
      observation.outcomeCategory ===
        "negative"
    )
  ) {
    return "confirmed";
  }

  if (
    !observation.stateChanged &&
    observation.outcome ===
      "maintained"
  ) {
    return "contradicted";
  }

  return "unresolved";
}

/* ------------------------------------------------------------------ */
/* Confidence                                                         */
/* ------------------------------------------------------------------ */

function evaluateConfidenceDegradationSignal(
  observation:
    RecommendationLearningObservation,
): RecommendationSignalObservationEvaluation {
  if (
    observation.confidenceChanged &&
    (
      observation.outcome ===
        "regressed" ||
      observation.outcome ===
        "stalled" ||
      observation.outcome ===
        "fragmented"
    )
  ) {
    return "confirmed";
  }

  if (
    observation.outcome ===
      "improved" ||
    observation.outcome ===
      "advanced" ||
    observation.outcome ===
      "recovered"
  ) {
    return "contradicted";
  }

  return "unresolved";
}

function evaluateConfidenceRecoverySignal(
  observation:
    RecommendationLearningObservation,
): RecommendationSignalObservationEvaluation {
  if (
    observation.confidenceChanged &&
    (
      observation.outcome ===
        "improved" ||
      observation.outcome ===
        "advanced" ||
      observation.outcome ===
        "recovered"
    )
  ) {
    return "confirmed";
  }

  if (
    observation.outcome ===
      "regressed" ||
    observation.outcome ===
      "fragmented"
  ) {
    return "contradicted";
  }

  return "unresolved";
}

/* ------------------------------------------------------------------ */
/* Risk                                                               */
/* ------------------------------------------------------------------ */

function evaluateRiskAccumulationSignal(
  observation:
    RecommendationLearningObservation,
): RecommendationSignalObservationEvaluation {
  const riskIncreased =
    observation.scoreChanges.repetitionRisk >
      0 ||
    observation.scoreChanges.redirectionRisk >
      0;

  if (
    riskIncreased ||
    observation.outcome ===
      "regressed" ||
    observation.outcome ===
      "fragmented" ||
    observation.outcome ===
      "stalled"
  ) {
    return "confirmed";
  }

  const riskReduced =
    observation.scoreChanges.repetitionRisk <
      0 ||
    observation.scoreChanges.redirectionRisk <
      0;

  if (
    riskReduced ||
    observation.outcome ===
      "recovered" ||
    observation.outcome ===
      "improved"
  ) {
    return "contradicted";
  }

  return "unresolved";
}

function evaluateRiskReductionSignal(
  observation:
    RecommendationLearningObservation,
): RecommendationSignalObservationEvaluation {
  const riskReduced =
    observation.scoreChanges.repetitionRisk <
      0 ||
    observation.scoreChanges.redirectionRisk <
      0;

  if (
    riskReduced ||
    observation.outcome ===
      "recovered" ||
    observation.outcome ===
      "improved"
  ) {
    return "confirmed";
  }

  const riskIncreased =
    observation.scoreChanges.repetitionRisk >
      0 ||
    observation.scoreChanges.redirectionRisk >
      0;

  if (
    riskIncreased ||
    observation.outcome ===
      "regressed" ||
    observation.outcome ===
      "fragmented"
  ) {
    return "contradicted";
  }

  return "unresolved";
}

/* ------------------------------------------------------------------ */
/* Progression                                                        */
/* ------------------------------------------------------------------ */

function evaluateLongTermProgressionSignal(
  observation:
    RecommendationLearningObservation,
): RecommendationSignalObservationEvaluation {
  if (
    observation.outcome ===
      "improved" ||
    observation.outcome ===
      "advanced" ||
    observation.outcome ===
      "completed" ||
    observation.scoreChanges.progress >
      0
  ) {
    return "confirmed";
  }

  if (
    observation.outcome ===
      "regressed" ||
    observation.outcome ===
      "stalled" ||
    observation.scoreChanges.progress <
      0
  ) {
    return "contradicted";
  }

  return "unresolved";
}

function evaluateLongTermAdvancementSignal(
  observation:
    RecommendationLearningObservation,
): RecommendationSignalObservationEvaluation {
  if (
    observation.outcome ===
      "advanced" ||
    observation.outcome ===
      "completed" ||
    observation.scoreChanges.completionMomentum >
      0
  ) {
    return "confirmed";
  }

  if (
    observation.outcome ===
      "stalled" ||
    observation.outcome ===
      "regressed" ||
    observation.scoreChanges.completionMomentum <
      0
  ) {
    return "contradicted";
  }

  return "unresolved";
}

/* ------------------------------------------------------------------ */
/* Recovery                                                           */
/* ------------------------------------------------------------------ */

function evaluateRecoveryPatternSignal(
  observation:
    RecommendationLearningObservation,
): RecommendationSignalObservationEvaluation {
  if (
    observation.outcome ===
      "recovered" ||
    (
      observation.previousState ===
        "stalled" &&
      observation.currentState !==
        "stalled" &&
      observation.scoreChanges.stability >
        0
    ) ||
    (
      observation.previousState ===
        "fragmented" &&
      observation.currentState !==
        "fragmented" &&
      observation.scoreChanges.stability >
        0
    )
  ) {
    return "confirmed";
  }

  if (
    observation.outcome ===
      "regressed" ||
    observation.outcome ===
      "fragmented" ||
    observation.scoreChanges.stability <
      0
  ) {
    return "contradicted";
  }

  return "unresolved";
}

/* ------------------------------------------------------------------ */
/* Confidence Calculation                                             */
/* ------------------------------------------------------------------ */

function calculateSignalReliabilityConfidence(
  params: {
    sampleCount:
      number;

    resolvedCount:
      number;

    sourceSignalScore:
      number;
  },
): number {
  const {
    sampleCount,
    resolvedCount,
    sourceSignalScore,
  } = params;

  if (
    sampleCount ===
    0
  ) {
    return 0;
  }

  const sampleStrength =
    clampUnitInterval(
      sampleCount /
        FULL_CONFIDENCE_SAMPLE_COUNT,
    );

  const resolutionRate =
    resolvedCount /
    sampleCount;

  const sourceStrength =
    clampUnitInterval(
      sourceSignalScore,
    );

  return clampUnitInterval(
    sampleStrength *
      0.5 +
    resolutionRate *
      0.3 +
    sourceStrength *
      0.2,
  );
}

/* ------------------------------------------------------------------ */
/* Public Validation                                                  */
/* ------------------------------------------------------------------ */

export function validateRecommendationSignalReliabilityProfile(
  params:
    ValidateRecommendationSignalReliabilityProfileParams,
): void {
  const {
    profile,
  } = params;

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
      "Recommendation Signal Reliability Profile must be an object.",
    );
  }

  if (
    !isRecommendationEvolutionMemorySignalType(
      profile.signalType,
    )
  ) {
    throw new Error(
      "Recommendation Signal Reliability Profile signalType is invalid.",
    );
  }

  validateNonNegativeInteger(
    profile.sampleCount,
    "sampleCount",
  );

  validateNonNegativeInteger(
    profile.confirmedCount,
    "confirmedCount",
  );

  validateNonNegativeInteger(
    profile.contradictedCount,
    "contradictedCount",
  );

  validateNonNegativeInteger(
    profile.unresolvedCount,
    "unresolvedCount",
  );

  const expectedSampleCount =
    profile.confirmedCount +
    profile.contradictedCount +
    profile.unresolvedCount;

  if (
    profile.sampleCount !==
    expectedSampleCount
  ) {
    throw new Error(
      "Recommendation Signal Reliability Profile sampleCount must equal confirmedCount + contradictedCount + unresolvedCount.",
    );
  }

  validateUnitInterval(
    profile.reliabilityScore,
    "reliabilityScore",
  );

  validateUnitInterval(
    profile.confidence,
    "confidence",
  );

  validateUniqueIdentifierArray(
    profile.relatedObservationIds,
    "relatedObservationIds",
  );

  if (
    profile.relatedObservationIds.length !==
    profile.sampleCount
  ) {
    throw new Error(
      "Recommendation Signal Reliability Profile relatedObservationIds length must match sampleCount.",
    );
  }

  const resolvedCount =
    profile.confirmedCount +
    profile.contradictedCount;

  const expectedReliabilityScore =
    resolvedCount ===
    0
      ? 0
      : profile.confirmedCount /
        resolvedCount;

  assertApproximatelyEqual(
    profile.reliabilityScore,
    expectedReliabilityScore,
    "reliabilityScore",
  );

  if (
    profile.sampleCount ===
      0 &&
    profile.confidence !==
      0
  ) {
    throw new Error(
      "Recommendation Signal Reliability Profile confidence must be zero when sampleCount is zero.",
    );
  }
}

export function validateRecommendationSignalReliabilityProfiles(
  profiles:
    readonly RecommendationSignalReliabilityProfile[],
): void {
  if (
    !Array.isArray(
      profiles,
    )
  ) {
    throw new Error(
      "Recommendation Signal Reliability Profiles must be an array.",
    );
  }

  const observedSignalTypes =
    new Set<
      RecommendationAdaptiveLearningMemorySignalType
    >();

  profiles.forEach(
    (
      profile,
      index,
    ) => {
      try {
        validateRecommendationSignalReliabilityProfile({
          profile,
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
          `Recommendation Signal Reliability Profile at index ${index} is invalid: ${message}`,
        );
      }

      if (
        observedSignalTypes.has(
          profile.signalType,
        )
      ) {
        throw new Error(
          `Recommendation Signal Reliability Profiles must not contain duplicate signalType: ${profile.signalType}.`,
        );
      }

      observedSignalTypes.add(
        profile.signalType,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validateEvaluateMemorySignalReliabilityParams(
  params:
    EvaluateMemorySignalReliabilityParams,
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
      "Evaluate Memory Signal Reliability params must be an object.",
    );
  }

  validateRecommendationLearningObservationArray(
    params.observations,
  );

  validateMemoryAnalysis(
    params.memoryAnalysis,
  );

  validateObservationAnalysisConsistency({
    observations:
      params.observations,

    memoryAnalysis:
      params.memoryAnalysis,
  });
}

/* ------------------------------------------------------------------ */
/* Memory Analysis Validation                                        */
/* ------------------------------------------------------------------ */

function validateMemoryAnalysis(
  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis,
): void {
  if (
    typeof memoryAnalysis !==
      "object" ||
    memoryAnalysis ===
      null ||
    Array.isArray(
      memoryAnalysis,
    )
  ) {
    throw new Error(
      "Recommendation Evolution Memory Analysis must be an object.",
    );
  }

  validateRequiredIdentifier(
    memoryAnalysis.memoryId,
    "memoryAnalysis.memoryId",
  );

  validateRequiredIdentifier(
    memoryAnalysis.historyId,
    "memoryAnalysis.historyId",
  );

  validateTimestamp(
    memoryAnalysis.analyzedAt,
    "memoryAnalysis.analyzedAt",
  );

  if (
    !Array.isArray(
      memoryAnalysis.signals,
    )
  ) {
    throw new Error(
      "memoryAnalysis.signals must be an array.",
    );
  }

  if (
    !Array.isArray(
      memoryAnalysis.comparisons,
    )
  ) {
    throw new Error(
      "memoryAnalysis.comparisons must be an array.",
    );
  }

  const signalIds =
    new Set<string>();

  const signalTypes =
    new Set<
      RecommendationAdaptiveLearningMemorySignalType
    >();

  memoryAnalysis.signals.forEach(
    (
      signal,
      index,
    ) => {
      validateMemorySignal(
        signal,
        index,
      );

      if (
        signalIds.has(
          signal.id,
        )
      ) {
        throw new Error(
          `memoryAnalysis.signals contains duplicate id: ${signal.id}.`,
        );
      }

      if (
        signalTypes.has(
          signal.type,
        )
      ) {
        throw new Error(
          `memoryAnalysis.signals contains duplicate type: ${signal.type}.`,
        );
      }

      signalIds.add(
        signal.id,
      );

      signalTypes.add(
        signal.type,
      );
    },
  );

  if (
    memoryAnalysis.primarySignalType !==
      null &&
    !signalTypes.has(
      memoryAnalysis.primarySignalType,
    )
  ) {
    throw new Error(
      "memoryAnalysis.primarySignalType must exist in memoryAnalysis.signals.",
    );
  }
}

function validateMemorySignal(
  signal:
    RecommendationEvolutionMemorySignal,
  index:
    number,
): void {
  validateRequiredIdentifier(
    signal.id,
    `memoryAnalysis.signals[${index}].id`,
  );

  if (
    !isRecommendationEvolutionMemorySignalType(
      signal.type,
    )
  ) {
    throw new Error(
      `memoryAnalysis.signals[${index}].type is invalid.`,
    );
  }

  validateUnitInterval(
    signal.score,
    `memoryAnalysis.signals[${index}].score`,
  );

  validateUniqueIdentifierArray(
    signal.relatedEntryIds,
    `memoryAnalysis.signals[${index}].relatedEntryIds`,
  );

  validateUniqueIdentifierArray(
    signal.relatedComparisonIds,
    `memoryAnalysis.signals[${index}].relatedComparisonIds`,
  );

  validateTimestamp(
    signal.detectedAt,
    `memoryAnalysis.signals[${index}].detectedAt`,
  );
}

/* ------------------------------------------------------------------ */
/* Observation ↔ Analysis Consistency                                 */
/* ------------------------------------------------------------------ */

function validateObservationAnalysisConsistency(
  params: {
    observations:
      readonly RecommendationLearningObservation[];

    memoryAnalysis:
      RecommendationEvolutionMemoryAnalysis;
  },
): void {
  const {
    observations,
    memoryAnalysis,
  } = params;

  observations.forEach(
    (
      observation,
      index,
    ) => {
      validateRecommendationLearningObservation({
        observation,
      });

      if (
        observation.memoryId !==
        memoryAnalysis.memoryId
      ) {
        throw new Error(
          `observations[${index}].memoryId must match memoryAnalysis.memoryId.`,
        );
      }

      if (
        observation.historyId !==
        memoryAnalysis.historyId
      ) {
        throw new Error(
          `observations[${index}].historyId must match memoryAnalysis.historyId.`,
        );
      }
    },
  );
}

/* ------------------------------------------------------------------ */
/* Clone                                                              */
/* ------------------------------------------------------------------ */

export function cloneRecommendationSignalReliabilityProfile(
  profile:
    RecommendationSignalReliabilityProfile,
): RecommendationSignalReliabilityProfile {
  validateRecommendationSignalReliabilityProfile({
    profile,
  });

  return {
    ...profile,

    relatedObservationIds: [
      ...profile.relatedObservationIds,
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Query Helpers                                                      */
/* ------------------------------------------------------------------ */

export function findRecommendationSignalReliabilityProfile(
  params: {
    profiles:
      readonly RecommendationSignalReliabilityProfile[];

    signalType:
      RecommendationAdaptiveLearningMemorySignalType;
  },
): RecommendationSignalReliabilityProfile | null {
  validateRecommendationSignalReliabilityProfiles(
    params.profiles,
  );

  if (
    !isRecommendationEvolutionMemorySignalType(
      params.signalType,
    )
  ) {
    throw new Error(
      "Recommendation Signal Reliability query signalType is invalid.",
    );
  }

  const profile =
    params.profiles.find(
      (
        candidate,
      ) =>
        candidate.signalType ===
        params.signalType,
    );

  return profile ===
    undefined
    ? null
    : cloneRecommendationSignalReliabilityProfile(
        profile,
      );
}

export function getMostReliableRecommendationMemorySignal(
  profiles:
    readonly RecommendationSignalReliabilityProfile[],
): RecommendationSignalReliabilityProfile | null {
  validateRecommendationSignalReliabilityProfiles(
    profiles,
  );

  if (
    profiles.length ===
    0
  ) {
    return null;
  }

  const sorted =
    profiles
      .map(
        cloneRecommendationSignalReliabilityProfile,
      )
      .sort(
        (
          left,
          right,
        ) => {
          if (
            left.reliabilityScore !==
            right.reliabilityScore
          ) {
            return right.reliabilityScore -
              left.reliabilityScore;
          }

          if (
            left.confidence !==
            right.confidence
          ) {
            return right.confidence -
              left.confidence;
          }

          if (
            left.sampleCount !==
            right.sampleCount
          ) {
            return right.sampleCount -
              left.sampleCount;
          }

          return left.signalType.localeCompare(
            right.signalType,
          );
        },
      );

  return sorted[
    0
  ] ??
    null;
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

  if (
    value.length >
    256
  ) {
    throw new Error(
      `${fieldName} must not exceed 256 characters.`,
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
      validateRequiredIdentifier(
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
  if (
    typeof value !==
      "string" ||
    value.trim().length ===
      0
  ) {
    throw new Error(
      `${fieldName} must be a non-empty timestamp string.`,
    );
  }

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

function assertApproximatelyEqual(
  actual:
    number,
  expected:
    number,
  fieldName:
    string,
): void {
  if (
    Math.abs(
      actual -
        expected,
    ) >
    NUMBER_EQUALITY_TOLERANCE
  ) {
    throw new Error(
      `${fieldName} is inconsistent with its source counts.`,
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