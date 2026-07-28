import {
    createEmptyRecommendationLearningAverageChanges,
    createEmptyRecommendationLearningEffectiveness,
    createEmptyRecommendationLearningOutcomeCounts,
    isRecommendationAdaptiveLearningSignalSeverity,
    isRecommendationAdaptiveLearningSignalType,
    isRecommendationAdaptiveLearningState,
} from "./recommendationAdaptiveLearningTypes";

import {
    createRecommendationLearningObservations,
    validateRecommendationLearningObservationArray,
} from "./createRecommendationLearningObservation";

import {
    evaluateMemorySignalReliability,
    validateRecommendationSignalReliabilityProfiles,
} from "./evaluateMemorySignalReliability";

import {
    detectRecommendationLearningPatterns,
    findRecommendationLearningPatternConflicts,
    getPrimaryRecommendationLearningPattern,
    summarizeRecommendationLearningPatterns,
    validateRecommendationLearningPatterns,
} from "./detectRecommendationLearningPatterns";

import {
    createRecommendationAdaptationRules,
    findActiveRecommendationAdaptationRules,
    validateRecommendationAdaptationRules,
} from "./createRecommendationAdaptationRules";

import {
    createRecommendationRuntimeAdjustments,
    hasRecommendationRuntimeAdjustments,
    summarizeRecommendationRuntimeAdjustment,
    validateRecommendationRuntimeAdjustment,
} from "./createRecommendationRuntimeAdjustments";

import {
    validateRecommendationEvolutionMemory,
} from "./appendRecommendationEvolutionMemory";

import {
    validateRecommendationEvolutionMemoryAnalysis,
} from "./analyzeRecommendationEvolutionMemory";

import type {
    AnalyzeRecommendationAdaptiveLearningParams,
    RecommendationAdaptiveLearningAnalysis,
    RecommendationAdaptiveLearningEntryState,
    RecommendationAdaptiveLearningScores,
    RecommendationAdaptiveLearningSignal,
    RecommendationAdaptiveLearningSignalSeverity,
    RecommendationAdaptiveLearningSignalType,
    RecommendationAdaptiveLearningState,
    RecommendationAdaptiveLearningStatistics,
    RecommendationLearningAverageChanges,
    RecommendationLearningEffectiveness,
    RecommendationLearningObservation,
    RecommendationLearningOutcomeCounts,
    RecommendationRuntimeDecisionLearningProfile,
    RecommendationRuntimeDecisionStateProfile,
    RecommendationStrategyLearningProfile,
    RecommendationStrategyStateProfile,
    ValidateRecommendationAdaptiveLearningAnalysisParams
} from "./recommendationAdaptiveLearningTypes";

import type {
    RecommendationEvolutionMemory,
    RecommendationEvolutionMemoryAnalysis
} from "./recommendationEvolutionMemoryTypes";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_MINIMUM_SAMPLE_COUNT =
  3;

const DEFAULT_MINIMUM_CONFIDENCE =
  0.6;

const FULL_EVIDENCE_OBSERVATION_COUNT =
  8;

const SCORE_TOLERANCE =
  1e-10;

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Memory를 이용해 전체 Adaptive Learning
 * 분석 결과를 생성합니다.
 *
 * 처리 순서:
 *
 * Memory Comparisons
 * → Learning Observations
 * → Strategy Profiles
 * → Runtime Decision Profiles
 * → Signal Reliability Profiles
 * → Learning Patterns
 * → Adaptation Rules
 * → Runtime Adjustment
 * → Learning State / Scores / Signals
 */
export function analyzeRecommendationAdaptiveLearning(
  params:
    AnalyzeRecommendationAdaptiveLearningParams,
): RecommendationAdaptiveLearningAnalysis {
  validateAnalyzeRecommendationAdaptiveLearningParams(
    params,
  );

  const minimumSampleCount =
    params.minimumSampleCount ??
    DEFAULT_MINIMUM_SAMPLE_COUNT;

  const minimumConfidence =
    params.minimumConfidence ??
    DEFAULT_MINIMUM_CONFIDENCE;

  const observations =
    createRecommendationLearningObservations({
      memory:
        params.memory,

      comparisons:
        params.memoryAnalysis.comparisons,

      observedAt:
        params.analyzedAt,

      createObservationId:
        (
          comparison,
          index,
        ) =>
          params.createObservationId(
            comparison,
            index,
          ),
    });

  const strategyProfiles =
    evaluateStrategyLearningProfiles(
      observations,
    );

  const runtimeDecisionProfiles =
    evaluateRuntimeDecisionLearningProfiles(
      observations,
    );

  const signalReliabilityProfiles =
    evaluateMemorySignalReliability({
      observations,
      memoryAnalysis:
        params.memoryAnalysis,
    });

  const patterns =
    detectRecommendationLearningPatterns({
      observations,
      strategyProfiles,
      runtimeDecisionProfiles,
      signalReliabilityProfiles,
      detectedAt:
        params.analyzedAt,
      createPatternId:
        params.createPatternId,
    });

  const adaptationRules =
    createRecommendationAdaptationRules({
      patterns,
      strategyProfiles,
      runtimeDecisionProfiles,
      signalReliabilityProfiles,
      minimumSampleCount,
      minimumConfidence,
      createdAt:
        params.analyzedAt,
      createRuleId:
        params.createRuleId,
    });

  const runtimeAdjustment =
    createRecommendationRuntimeAdjustments({
      rules:
        adaptationRules,
    });

  const statistics =
    createAdaptiveLearningStatistics({
      memory:
        params.memory,
      memoryAnalysis:
        params.memoryAnalysis,
      observations,
      strategyProfiles,
      runtimeDecisionProfiles,
      signalReliabilityProfiles,
      patterns,
      adaptationRules,
    });

  const scores =
    createAdaptiveLearningScores({
      observations,
      strategyProfiles,
      runtimeDecisionProfiles,
      signalReliabilityProfiles,
      patterns,
      adaptationRules,
      runtimeAdjustment,
      minimumSampleCount,
    });

  const state =
    resolveAdaptiveLearningState({
      statistics,
      scores,
      patterns,
      adaptationRules,
      runtimeAdjustment,
      minimumSampleCount,
    });

  const signals =
    createAdaptiveLearningSignals({
      state,
      scores,
      observations,
      strategyProfiles,
      runtimeDecisionProfiles,
      signalReliabilityProfiles,
      patterns,
      adaptationRules,
      analyzedAt:
        params.analyzedAt,
      createSignalId:
        params.createSignalId,
    });

  const primarySignalType =
    resolvePrimaryAdaptiveLearningSignalType(
      signals,
    );

  const reasoning =
    createAdaptiveLearningReasoning({
      state,
      statistics,
      scores,
      patterns,
      adaptationRules,
      runtimeAdjustment,
    });

  const confidence =
    calculateOverallLearningConfidence({
      scores,
      statistics,
    });

  const analysis:
    RecommendationAdaptiveLearningAnalysis = {
      version:
        1,

      memoryId:
        params.memory.id,

      historyId:
        params.memory.historyId,

      sourceMemoryAnalyzedAt:
        params.memoryAnalysis.analyzedAt,

      state,

      statistics,

      scores,

      observations,

      strategyProfiles,

      runtimeDecisionProfiles,

      signalReliabilityProfiles,

      patterns,

      adaptationRules,

      runtimeAdjustment,

      signals,

      primarySignalType,

      reasoning,

      confidence,

      analyzedAt:
        params.analyzedAt,
    };

  validateRecommendationAdaptiveLearningAnalysis({
    memory:
      params.memory,

    memoryAnalysis:
      params.memoryAnalysis,

    analysis,
  });

  return cloneRecommendationAdaptiveLearningAnalysis(
    analysis,
  );
}

/* ------------------------------------------------------------------ */
/* Strategy Profiles                                                  */
/* ------------------------------------------------------------------ */

function evaluateStrategyLearningProfiles(
  observations:
    readonly RecommendationLearningObservation[],
): RecommendationStrategyLearningProfile[] {
  validateRecommendationLearningObservationArray(
    observations,
  );

  const strategyTypes =
    uniqueStrings(
      observations.map(
        (
          observation,
        ) =>
          observation.currentStrategyType,
      ),
    );

  return strategyTypes
    .map(
      (
        strategyType,
      ) => {
        const relatedObservations =
          observations.filter(
            (
              observation,
            ) =>
              observation.currentStrategyType ===
              strategyType,
          );

        const profile:
          RecommendationStrategyLearningProfile = {
          strategyType,

          overall:
            calculateEffectiveness(
              relatedObservations,
            ),

          byState:
            createStrategyStateProfiles(
              relatedObservations,
            ),

          averageChanges:
            calculateAverageChanges(
              relatedObservations,
            ),

          outcomeCounts:
            countOutcomes(
              relatedObservations,
            ),

          relatedObservationIds:
            relatedObservations.map(
              (
                observation,
              ) =>
                observation.id,
            ),
        };

        return profile;
      },
    )
    .sort(
      (
        left,
        right,
      ) =>
        left.strategyType.localeCompare(
          right.strategyType,
        ),
    );
}

function createStrategyStateProfiles(
  observations:
    readonly RecommendationLearningObservation[],
): Partial<
  Record<
    RecommendationAdaptiveLearningEntryState,
    RecommendationStrategyStateProfile
  >
> {
  const result:
    Partial<
      Record<
        RecommendationAdaptiveLearningEntryState,
        RecommendationStrategyStateProfile
      >
    > = {};

  const states =
    uniqueStrings(
      observations.map(
        (
          observation,
        ) =>
          observation.currentState,
      ),
    );

  states.forEach(
    (
      state,
    ) => {
      const stateObservations =
        observations.filter(
          (
            observation,
          ) =>
            observation.currentState ===
            state,
        );

      result[
        state
      ] = {
        state,

        effectiveness:
          calculateEffectiveness(
            stateObservations,
          ),

        averageChanges:
          calculateAverageChanges(
            stateObservations,
          ),

        outcomeCounts:
          countOutcomes(
            stateObservations,
          ),
      };
    },
  );

  return result;
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Profiles                                          */
/* ------------------------------------------------------------------ */

function evaluateRuntimeDecisionLearningProfiles(
  observations:
    readonly RecommendationLearningObservation[],
): RecommendationRuntimeDecisionLearningProfile[] {
  validateRecommendationLearningObservationArray(
    observations,
  );

  const decisionTypes =
    uniqueStrings(
      observations.flatMap(
        (
          observation,
        ) =>
          observation.enabledRuntimeDecisionTypes,
      ),
    );

  return decisionTypes
    .map(
      (
        decisionType,
      ) => {
        const relatedObservations =
          observations.filter(
            (
              observation,
            ) =>
              observation.enabledRuntimeDecisionTypes.includes(
                decisionType,
              ),
          );

        const profile:
          RecommendationRuntimeDecisionLearningProfile = {
          decisionType,

          effectiveness:
            calculateEffectiveness(
              relatedObservations,
            ),

          byState:
            createRuntimeDecisionStateProfiles(
              relatedObservations,
            ),

          averageChanges:
            calculateAverageChanges(
              relatedObservations,
            ),

          outcomeCounts:
            countOutcomes(
              relatedObservations,
            ),

          relatedObservationIds:
            relatedObservations.map(
              (
                observation,
              ) =>
                observation.id,
            ),
        };

        return profile;
      },
    )
    .sort(
      (
        left,
        right,
      ) =>
        left.decisionType.localeCompare(
          right.decisionType,
        ),
    );
}

function createRuntimeDecisionStateProfiles(
  observations:
    readonly RecommendationLearningObservation[],
): Partial<
  Record<
    RecommendationAdaptiveLearningEntryState,
    RecommendationRuntimeDecisionStateProfile
  >
> {
  const result:
    Partial<
      Record<
        RecommendationAdaptiveLearningEntryState,
        RecommendationRuntimeDecisionStateProfile
      >
    > = {};

  const states =
    uniqueStrings(
      observations.map(
        (
          observation,
        ) =>
          observation.currentState,
      ),
    );

  states.forEach(
    (
      state,
    ) => {
      const stateObservations =
        observations.filter(
          (
            observation,
          ) =>
            observation.currentState ===
            state,
        );

      result[
        state
      ] = {
        state,

        effectiveness:
          calculateEffectiveness(
            stateObservations,
          ),

        averageChanges:
          calculateAverageChanges(
            stateObservations,
          ),

        outcomeCounts:
          countOutcomes(
            stateObservations,
          ),
      };
    },
  );

  return result;
}

/* ------------------------------------------------------------------ */
/* Effectiveness                                                      */
/* ------------------------------------------------------------------ */

function calculateEffectiveness(
  observations:
    readonly RecommendationLearningObservation[],
): RecommendationLearningEffectiveness {
  if (
    observations.length ===
    0
  ) {
    return createEmptyRecommendationLearningEffectiveness();
  }

  let positiveCount =
    0;

  let neutralCount =
    0;

  let negativeCount =
    0;

  let ambiguousCount =
    0;

  let unknownCount =
    0;

  observations.forEach(
    (
      observation,
    ) => {
      switch (
        observation.outcomeCategory
      ) {
        case "positive":
          positiveCount +=
            1;
          break;

        case "neutral":
          neutralCount +=
            1;
          break;

        case "negative":
          negativeCount +=
            1;
          break;

        case "ambiguous":
          ambiguousCount +=
            1;
          break;

        case "unknown":
          unknownCount +=
            1;
          break;
      }
    },
  );

  const resolvedCount =
    positiveCount +
    neutralCount +
    negativeCount;

  const effectivenessScore =
    resolvedCount ===
    0
      ? 0
      : (
          positiveCount +
          neutralCount *
            0.5
        ) /
        resolvedCount;

  const sampleStrength =
    clampUnitInterval(
      observations.length /
      FULL_EVIDENCE_OBSERVATION_COUNT,
    );

  const resolvedRatio =
    resolvedCount /
    observations.length;

  const confidence =
    clampUnitInterval(
      sampleStrength *
        0.65 +
      resolvedRatio *
        0.35,
    );

  return {
    sampleCount:
      observations.length,

    positiveCount,

    neutralCount,

    negativeCount,

    ambiguousCount,

    unknownCount,

    effectivenessScore:
      roundScore(
        effectivenessScore,
      ),

    confidence:
      roundScore(
        confidence,
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Average Changes                                                    */
/* ------------------------------------------------------------------ */

function calculateAverageChanges(
  observations:
    readonly RecommendationLearningObservation[],
): RecommendationLearningAverageChanges {
  if (
    observations.length ===
    0
  ) {
    return createEmptyRecommendationLearningAverageChanges();
  }

  const total =
    observations.reduce(
      (
        accumulated,
        observation,
      ) => ({
        stability:
          accumulated.stability +
          observation.scoreChanges.stability,

        progress:
          accumulated.progress +
          observation.scoreChanges.progress,

        repetitionRisk:
          accumulated.repetitionRisk +
          observation.scoreChanges.repetitionRisk,

        redirectionRisk:
          accumulated.redirectionRisk +
          observation.scoreChanges.redirectionRisk,

        completionMomentum:
          accumulated.completionMomentum +
          observation.scoreChanges.completionMomentum,

        warningCount:
          accumulated.warningCount +
          observation.warningCountChange,

        observationCount:
          accumulated.observationCount +
          observation.observationCountChange,
      }),
      createEmptyRecommendationLearningAverageChanges(),
    );

  return {
    stability:
      roundScore(
        total.stability /
        observations.length,
      ),

    progress:
      roundScore(
        total.progress /
        observations.length,
      ),

    repetitionRisk:
      roundScore(
        total.repetitionRisk /
        observations.length,
      ),

    redirectionRisk:
      roundScore(
        total.redirectionRisk /
        observations.length,
      ),

    completionMomentum:
      roundScore(
        total.completionMomentum /
        observations.length,
      ),

    warningCount:
      roundScore(
        total.warningCount /
        observations.length,
      ),

    observationCount:
      roundScore(
        total.observationCount /
        observations.length,
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Outcome Counts                                                     */
/* ------------------------------------------------------------------ */

function countOutcomes(
  observations:
    readonly RecommendationLearningObservation[],
): RecommendationLearningOutcomeCounts {
  const counts =
    createEmptyRecommendationLearningOutcomeCounts();

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
/* Statistics                                                         */
/* ------------------------------------------------------------------ */

type CreateAdaptiveLearningStatisticsParams = {
  memory:
    RecommendationEvolutionMemory;

  memoryAnalysis:
    RecommendationEvolutionMemoryAnalysis;

  observations:
    readonly RecommendationLearningObservation[];

  strategyProfiles:
    readonly RecommendationStrategyLearningProfile[];

  runtimeDecisionProfiles:
    readonly RecommendationRuntimeDecisionLearningProfile[];

  signalReliabilityProfiles:
    RecommendationAdaptiveLearningAnalysis[
      "signalReliabilityProfiles"
    ];

  patterns:
    RecommendationAdaptiveLearningAnalysis[
      "patterns"
    ];

  adaptationRules:
    RecommendationAdaptiveLearningAnalysis[
      "adaptationRules"
    ];
};

function createAdaptiveLearningStatistics(
  params:
    CreateAdaptiveLearningStatisticsParams,
): RecommendationAdaptiveLearningStatistics {
  let positiveOutcomeCount =
    0;

  let neutralOutcomeCount =
    0;

  let negativeOutcomeCount =
    0;

  let ambiguousOutcomeCount =
    0;

  let unknownOutcomeCount =
    0;

  params.observations.forEach(
    (
      observation,
    ) => {
      switch (
        observation.outcomeCategory
      ) {
        case "positive":
          positiveOutcomeCount +=
            1;
          break;

        case "neutral":
          neutralOutcomeCount +=
            1;
          break;

        case "negative":
          negativeOutcomeCount +=
            1;
          break;

        case "ambiguous":
          ambiguousOutcomeCount +=
            1;
          break;

        case "unknown":
          unknownOutcomeCount +=
            1;
          break;
      }
    },
  );

  return {
    memoryEntryCount:
      params.memory.entries.length,

    comparisonCount:
      params.memoryAnalysis.comparisons.length,

    observationCount:
      params.observations.length,

    positiveOutcomeCount,

    neutralOutcomeCount,

    negativeOutcomeCount,

    ambiguousOutcomeCount,

    unknownOutcomeCount,

    strategyProfileCount:
      params.strategyProfiles.length,

    runtimeDecisionProfileCount:
      params.runtimeDecisionProfiles.length,

    signalReliabilityProfileCount:
      params.signalReliabilityProfiles.length,

    patternCount:
      params.patterns.length,

    adaptationRuleCount:
      params.adaptationRules.length,

    activeAdaptationRuleCount:
      params.adaptationRules.filter(
        (
          rule,
        ) =>
          rule.status ===
          "active",
      ).length,

    conflictedAdaptationRuleCount:
      params.adaptationRules.filter(
        (
          rule,
        ) =>
          rule.status ===
          "conflicted",
      ).length,
  };
}

/* ------------------------------------------------------------------ */
/* Scores                                                             */
/* ------------------------------------------------------------------ */

type CreateAdaptiveLearningScoresParams = {
  observations:
    readonly RecommendationLearningObservation[];

  strategyProfiles:
    readonly RecommendationStrategyLearningProfile[];

  runtimeDecisionProfiles:
    readonly RecommendationRuntimeDecisionLearningProfile[];

  signalReliabilityProfiles:
    RecommendationAdaptiveLearningAnalysis[
      "signalReliabilityProfiles"
    ];

  patterns:
    RecommendationAdaptiveLearningAnalysis[
      "patterns"
    ];

  adaptationRules:
    RecommendationAdaptiveLearningAnalysis[
      "adaptationRules"
    ];

  runtimeAdjustment:
    RecommendationAdaptiveLearningAnalysis[
      "runtimeAdjustment"
    ];

  minimumSampleCount:
    number;
};

function createAdaptiveLearningScores(
  params:
    CreateAdaptiveLearningScoresParams,
): RecommendationAdaptiveLearningScores {
  const evidenceStrength =
    clampUnitInterval(
      params.observations.length /
      Math.max(
        params.minimumSampleCount *
          2,
        1,
      ),
    );

  const strategyConsistency =
    calculateProfileConsistency(
      params.strategyProfiles.map(
        (
          profile,
        ) =>
          profile.overall,
      ),
    );

  const decisionConsistency =
    calculateProfileConsistency(
      params.runtimeDecisionProfiles.map(
        (
          profile,
        ) =>
          profile.effectiveness,
      ),
    );

  const signalReliability =
    averageNumbers(
      params.signalReliabilityProfiles.map(
        (
          profile,
        ) =>
          profile.reliabilityScore *
          profile.confidence,
      ),
    );

  const patternSummary =
    summarizeRecommendationLearningPatterns(
      params.patterns,
    );

  const patternConflicts =
    findRecommendationLearningPatternConflicts(
      params.patterns,
    );

  const conflictRisk =
    clampUnitInterval(
      (
        patternSummary.conflictedPatternCount +
        patternConflicts.length +
        params.adaptationRules.filter(
          (
            rule,
          ) =>
            rule.status ===
            "conflicted",
        ).length
      ) /
      Math.max(
        params.patterns.length +
          params.adaptationRules.length,
        1,
      ),
    );

  const activeRules =
    findActiveRecommendationAdaptationRules(
      params.adaptationRules,
    );

  const adaptationReadiness =
    hasRecommendationRuntimeAdjustments(
      params.runtimeAdjustment,
    )
      ? clampUnitInterval(
          averageNumbers(
            activeRules.map(
              (
                rule,
              ) =>
                rule.confidence,
            ),
          ) *
          evidenceStrength *
          (
            1 -
            conflictRisk
          ),
        )
      : 0;

  const learningConfidence =
    clampUnitInterval(
      evidenceStrength *
        0.35 +
      strategyConsistency *
        0.2 +
      decisionConsistency *
        0.15 +
      signalReliability *
        0.15 +
      (
        1 -
        conflictRisk
      ) *
        0.15,
    );

  return {
    evidenceStrength:
      roundScore(
        evidenceStrength,
      ),

    learningConfidence:
      roundScore(
        learningConfidence,
      ),

    adaptationReadiness:
      roundScore(
        adaptationReadiness,
      ),

    strategyConsistency:
      roundScore(
        strategyConsistency,
      ),

    decisionConsistency:
      roundScore(
        decisionConsistency,
      ),

    signalReliability:
      roundScore(
        signalReliability,
      ),

    conflictRisk:
      roundScore(
        conflictRisk,
      ),
  };
}

function calculateProfileConsistency(
  profiles:
    readonly RecommendationLearningEffectiveness[],
): number {
  if (
    profiles.length ===
    0
  ) {
    return 0;
  }

  return averageNumbers(
    profiles.map(
      (
        effectiveness,
      ) => {
        const directionalClarity =
          Math.abs(
            effectiveness.effectivenessScore -
            0.5,
          ) *
          2;

        return clampUnitInterval(
          directionalClarity *
          effectiveness.confidence,
        );
      },
    ),
  );
}

/* ------------------------------------------------------------------ */
/* State                                                              */
/* ------------------------------------------------------------------ */

type ResolveAdaptiveLearningStateParams = {
  statistics:
    RecommendationAdaptiveLearningStatistics;

  scores:
    RecommendationAdaptiveLearningScores;

  patterns:
    RecommendationAdaptiveLearningAnalysis[
      "patterns"
    ];

  adaptationRules:
    RecommendationAdaptiveLearningAnalysis[
      "adaptationRules"
    ];

  runtimeAdjustment:
    RecommendationAdaptiveLearningAnalysis[
      "runtimeAdjustment"
    ];

  minimumSampleCount:
    number;
};

function resolveAdaptiveLearningState(
  params:
    ResolveAdaptiveLearningStateParams,
): RecommendationAdaptiveLearningState {
  if (
    params.statistics.memoryEntryCount ===
      0 ||
    params.statistics.observationCount ===
      0
  ) {
    return "unavailable";
  }

  if (
    params.statistics.observationCount <
    params.minimumSampleCount
  ) {
    return "insufficient";
  }

  if (
    params.scores.conflictRisk >=
      0.4 ||
    params.statistics.conflictedAdaptationRuleCount >
      0 ||
    params.patterns.some(
      (
        pattern,
      ) =>
        pattern.type ===
        "conflicting-evidence",
    )
  ) {
    return "conflicted";
  }

  if (
    hasRecommendationRuntimeAdjustments(
      params.runtimeAdjustment,
    ) &&
    params.statistics.activeAdaptationRuleCount >
      0
  ) {
    return "adapting";
  }

  if (
    params.patterns.length >
      0 ||
    params.adaptationRules.length >
      0
  ) {
    return "learning";
  }

  if (
    params.scores.learningConfidence >=
      0.75 &&
    params.scores.strategyConsistency >=
      0.65
  ) {
    return "stable";
  }

  return "observing";
}

/* ------------------------------------------------------------------ */
/* Signals                                                            */
/* ------------------------------------------------------------------ */

type CreateAdaptiveLearningSignalsParams = {
  state:
    RecommendationAdaptiveLearningState;

  scores:
    RecommendationAdaptiveLearningScores;

  observations:
    readonly RecommendationLearningObservation[];

  strategyProfiles:
    readonly RecommendationStrategyLearningProfile[];

  runtimeDecisionProfiles:
    readonly RecommendationRuntimeDecisionLearningProfile[];

  signalReliabilityProfiles:
    RecommendationAdaptiveLearningAnalysis[
      "signalReliabilityProfiles"
    ];

  patterns:
    RecommendationAdaptiveLearningAnalysis[
      "patterns"
    ];

  adaptationRules:
    RecommendationAdaptiveLearningAnalysis[
      "adaptationRules"
    ];

  analyzedAt:
    string;

  createSignalId:
    AnalyzeRecommendationAdaptiveLearningParams[
      "createSignalId"
    ];
};

type AdaptiveLearningSignalCandidate = {
  type:
    RecommendationAdaptiveLearningSignalType;

  severity:
    RecommendationAdaptiveLearningSignalSeverity;

  confidence:
    number;

  score:
    number;

  description:
    string;

  relatedObservationIds:
    string[];

  relatedPatternIds:
    string[];

  relatedRuleIds:
    string[];
};

function createAdaptiveLearningSignals(
  params:
    CreateAdaptiveLearningSignalsParams,
): RecommendationAdaptiveLearningSignal[] {
  const candidates:
    AdaptiveLearningSignalCandidate[] = [];

  if (
    params.state ===
      "unavailable" ||
    params.state ===
      "insufficient"
  ) {
    candidates.push({
      type:
        "insufficient-learning-data",

      severity:
        "informational",

      confidence:
        1,

      score:
        1 -
        params.scores.evidenceStrength,

      description:
        "Recommendation history does not yet contain enough evidence for stable adaptive learning.",

      relatedObservationIds:
        params.observations.map(
          (
            observation,
          ) =>
            observation.id,
        ),

      relatedPatternIds:
        params.patterns
          .filter(
            (
              pattern,
            ) =>
              pattern.type ===
              "insufficient-evidence",
          )
          .map(
            (
              pattern,
            ) =>
              pattern.id,
          ),

      relatedRuleIds:
        [],
    });
  } else {
    candidates.push({
      type:
        "learning-evidence-available",

      severity:
        "informational",

      confidence:
        params.scores.learningConfidence,

      score:
        params.scores.evidenceStrength,

      description:
        "Recommendation history contains sufficient evidence for learning-pattern analysis.",

      relatedObservationIds:
        params.observations.map(
          (
            observation,
          ) =>
            observation.id,
        ),

      relatedPatternIds:
        [],

      relatedRuleIds:
        [],
    });
  }

  addStrategySignals(
    candidates,
    params,
  );

  addDecisionSignals(
    candidates,
    params,
  );

  addSignalReliabilitySignals(
    candidates,
    params,
  );

  if (
    params.state ===
      "adapting"
  ) {
    const activeRules =
      params.adaptationRules.filter(
        (
          rule,
        ) =>
          rule.status ===
          "active",
      );

    candidates.push({
      type:
        "adaptation-ready",

      severity:
        "moderate",

      confidence:
        params.scores.adaptationReadiness,

      score:
        params.scores.adaptationReadiness,

      description:
        "Active adaptation rules are available for Runtime adjustment.",

      relatedObservationIds:
        uniqueStrings(
          activeRules.flatMap(
            (
              rule,
            ) =>
              rule.evidenceObservationIds,
          ),
        ),

      relatedPatternIds:
        uniqueStrings(
          activeRules.flatMap(
            (
              rule,
            ) =>
              rule.sourcePatternIds,
          ),
        ),

      relatedRuleIds:
        activeRules.map(
          (
            rule,
          ) =>
            rule.id,
        ),
    });
  }

  if (
    params.state ===
      "conflicted"
  ) {
    const conflictedPatterns =
      params.patterns.filter(
        (
          pattern,
        ) =>
          pattern.type ===
          "conflicting-evidence",
      );

    const conflictedRules =
      params.adaptationRules.filter(
        (
          rule,
        ) =>
          rule.status ===
          "conflicted",
      );

    candidates.push({
      type:
        "adaptation-conflict",

      severity:
        "high",

      confidence:
        params.scores.conflictRisk,

      score:
        params.scores.conflictRisk,

      description:
        "Conflicting Recommendation evidence prevents automatic adaptation.",

      relatedObservationIds:
        uniqueStrings([
          ...conflictedPatterns.flatMap(
            (
              pattern,
            ) =>
              pattern.relatedObservationIds,
          ),

          ...conflictedRules.flatMap(
            (
              rule,
            ) =>
              rule.evidenceObservationIds,
          ),
        ]),

      relatedPatternIds:
        conflictedPatterns.map(
          (
            pattern,
          ) =>
            pattern.id,
        ),

      relatedRuleIds:
        conflictedRules.map(
          (
            rule,
          ) =>
            rule.id,
        ),
    });
  }

  if (
    params.state ===
      "stable"
  ) {
    candidates.push({
      type:
        "stable-learning-pattern",

      severity:
        "low",

      confidence:
        params.scores.learningConfidence,

      score:
        params.scores.strategyConsistency,

      description:
        "Recommendation learning evidence is stable and does not currently require additional Runtime adjustment.",

      relatedObservationIds:
        params.observations.map(
          (
            observation,
          ) =>
            observation.id,
        ),

      relatedPatternIds:
        params.patterns.map(
          (
            pattern,
          ) =>
            pattern.id,
        ),

      relatedRuleIds:
        params.adaptationRules.map(
          (
            rule,
          ) =>
            rule.id,
        ),
    });
  }

  return candidates
    .map(
      (
        candidate,
        index,
      ) =>
        createAdaptiveLearningSignal({
          candidate,
          index,
          analyzedAt:
            params.analyzedAt,
          createSignalId:
            params.createSignalId,
        }),
    )
    .sort(
      compareAdaptiveLearningSignals,
    );
}

function addStrategySignals(
  candidates:
    AdaptiveLearningSignalCandidate[],
  params:
    CreateAdaptiveLearningSignalsParams,
): void {
  const successfulPatterns =
    params.patterns.filter(
      (
        pattern,
      ) =>
        pattern.type ===
          "strategy-success" ||
        pattern.type ===
          "effective-stabilization" ||
        pattern.type ===
          "effective-recovery",
    );

  if (
    successfulPatterns.length >
    0
  ) {
    candidates.push({
      type:
        "strategy-effectiveness-detected",

      severity:
        "low",

      confidence:
        averageNumbers(
          successfulPatterns.map(
            (
              pattern,
            ) =>
              pattern.confidence,
          ),
        ),

      score:
        params.scores.strategyConsistency,

      description:
        "One or more Recommendation strategies were repeatedly associated with constructive outcomes.",

      relatedObservationIds:
        uniqueStrings(
          successfulPatterns.flatMap(
            (
              pattern,
            ) =>
              pattern.relatedObservationIds,
          ),
        ),

      relatedPatternIds:
        successfulPatterns.map(
          (
            pattern,
          ) =>
            pattern.id,
        ),

      relatedRuleIds:
        [],
    });
  }

  const failedPatterns =
    params.patterns.filter(
      (
        pattern,
      ) =>
        pattern.type ===
          "strategy-failure" ||
        pattern.type ===
          "state-strategy-mismatch" ||
        pattern.type ===
          "repeated-premature-advance" ||
        pattern.type ===
          "persistent-over-observation",
    );

  if (
    failedPatterns.length >
    0
  ) {
    candidates.push({
      type:
        "strategy-failure-detected",

      severity:
        "moderate",

      confidence:
        averageNumbers(
          failedPatterns.map(
            (
              pattern,
            ) =>
              pattern.confidence,
          ),
        ),

      score:
        params.scores.strategyConsistency,

      description:
        "One or more Recommendation strategies were repeatedly associated with weak or context-mismatched outcomes.",

      relatedObservationIds:
        uniqueStrings(
          failedPatterns.flatMap(
            (
              pattern,
            ) =>
              pattern.relatedObservationIds,
          ),
        ),

      relatedPatternIds:
        failedPatterns.map(
          (
            pattern,
          ) =>
            pattern.id,
        ),

      relatedRuleIds:
        [],
    });
  }
}

function addDecisionSignals(
  candidates:
    AdaptiveLearningSignalCandidate[],
  params:
    CreateAdaptiveLearningSignalsParams,
): void {
  const successfulPatterns =
    params.patterns.filter(
      (
        pattern,
      ) =>
        pattern.type ===
        "decision-success",
    );

  if (
    successfulPatterns.length >
    0
  ) {
    candidates.push({
      type:
        "decision-effectiveness-detected",

      severity:
        "low",

      confidence:
        averageNumbers(
          successfulPatterns.map(
            (
              pattern,
            ) =>
              pattern.confidence,
          ),
        ),

      score:
        params.scores.decisionConsistency,

      description:
        "One or more Runtime decisions were repeatedly associated with constructive outcomes.",

      relatedObservationIds:
        uniqueStrings(
          successfulPatterns.flatMap(
            (
              pattern,
            ) =>
              pattern.relatedObservationIds,
          ),
        ),

      relatedPatternIds:
        successfulPatterns.map(
          (
            pattern,
          ) =>
            pattern.id,
        ),

      relatedRuleIds:
        [],
    });
  }

  const failedPatterns =
    params.patterns.filter(
      (
        pattern,
      ) =>
        pattern.type ===
        "decision-failure",
    );

  if (
    failedPatterns.length >
    0
  ) {
    candidates.push({
      type:
        "decision-failure-detected",

      severity:
        "moderate",

      confidence:
        averageNumbers(
          failedPatterns.map(
            (
              pattern,
            ) =>
              pattern.confidence,
          ),
        ),

      score:
        params.scores.decisionConsistency,

      description:
        "One or more Runtime decisions were repeatedly associated with weak outcomes.",

      relatedObservationIds:
        uniqueStrings(
          failedPatterns.flatMap(
            (
              pattern,
            ) =>
              pattern.relatedObservationIds,
          ),
        ),

      relatedPatternIds:
        failedPatterns.map(
          (
            pattern,
          ) =>
            pattern.id,
        ),

      relatedRuleIds:
        [],
    });
  }
}

function addSignalReliabilitySignals(
  candidates:
    AdaptiveLearningSignalCandidate[],
  params:
    CreateAdaptiveLearningSignalsParams,
): void {
  const confirmedProfiles =
    params.signalReliabilityProfiles.filter(
      (
        profile,
      ) =>
        profile.sampleCount >
          0 &&
        profile.reliabilityScore >=
          0.75 &&
        profile.confidence >=
          0.6,
    );

  if (
    confirmedProfiles.length >
    0
  ) {
    candidates.push({
      type:
        "signal-reliability-confirmed",

      severity:
        "low",

      confidence:
        averageNumbers(
          confirmedProfiles.map(
            (
              profile,
            ) =>
              profile.confidence,
          ),
        ),

      score:
        averageNumbers(
          confirmedProfiles.map(
            (
              profile,
            ) =>
              profile.reliabilityScore,
          ),
        ),

      description:
        "One or more Memory signals were consistently confirmed by related Recommendation outcomes.",

      relatedObservationIds:
        uniqueStrings(
          confirmedProfiles.flatMap(
            (
              profile,
            ) =>
              profile.relatedObservationIds,
          ),
        ),

      relatedPatternIds:
        params.patterns
          .filter(
            (
              pattern,
            ) =>
              pattern.type ===
              "signal-underestimation",
          )
          .map(
            (
              pattern,
            ) =>
              pattern.id,
          ),

      relatedRuleIds:
        params.adaptationRules
          .filter(
            (
              rule,
            ) =>
              rule.type ===
              "raise-signal-confidence",
          )
          .map(
            (
              rule,
            ) =>
              rule.id,
          ),
    });
  }

  const declinedProfiles =
    params.signalReliabilityProfiles.filter(
      (
        profile,
      ) =>
        profile.sampleCount >
          0 &&
        profile.reliabilityScore <=
          0.35 &&
        profile.confidence >=
          0.6,
    );

  if (
    declinedProfiles.length >
    0
  ) {
    candidates.push({
      type:
        "signal-reliability-declined",

      severity:
        "moderate",

      confidence:
        averageNumbers(
          declinedProfiles.map(
            (
              profile,
            ) =>
              profile.confidence,
          ),
        ),

      score:
        1 -
        averageNumbers(
          declinedProfiles.map(
            (
              profile,
            ) =>
              profile.reliabilityScore,
          ),
        ),

      description:
        "One or more Memory signals were contradicted frequently by related Recommendation outcomes.",

      relatedObservationIds:
        uniqueStrings(
          declinedProfiles.flatMap(
            (
              profile,
            ) =>
              profile.relatedObservationIds,
          ),
        ),

      relatedPatternIds:
        params.patterns
          .filter(
            (
              pattern,
            ) =>
              pattern.type ===
              "signal-overestimation",
          )
          .map(
            (
              pattern,
            ) =>
              pattern.id,
          ),

      relatedRuleIds:
        params.adaptationRules
          .filter(
            (
              rule,
            ) =>
              rule.type ===
              "lower-signal-confidence",
          )
          .map(
            (
              rule,
            ) =>
              rule.id,
          ),
    });
  }
}

function createAdaptiveLearningSignal(
  params: {
    candidate:
      AdaptiveLearningSignalCandidate;

    index:
      number;

    analyzedAt:
      string;

    createSignalId:
      AnalyzeRecommendationAdaptiveLearningParams[
        "createSignalId"
      ];
  },
): RecommendationAdaptiveLearningSignal {
  const id =
    params.createSignalId(
      params.candidate.type,
      params.index,
    );

  validateRequiredIdentifier(
    id,
    "Recommendation Adaptive Learning Signal id",
  );

  return {
    id,

    type:
      params.candidate.type,

    severity:
      params.candidate.severity,

    confidence:
      roundScore(
        clampUnitInterval(
          params.candidate.confidence,
        ),
      ),

    score:
      roundScore(
        clampUnitInterval(
          params.candidate.score,
        ),
      ),

    description:
      params.candidate.description,

    relatedObservationIds:
      uniqueStrings(
        params.candidate.relatedObservationIds,
      ),

    relatedPatternIds:
      uniqueStrings(
        params.candidate.relatedPatternIds,
      ),

    relatedRuleIds:
      uniqueStrings(
        params.candidate.relatedRuleIds,
      ),

    detectedAt:
      params.analyzedAt,
  };
}

function compareAdaptiveLearningSignals(
  left:
    RecommendationAdaptiveLearningSignal,
  right:
    RecommendationAdaptiveLearningSignal,
): number {
  const severityDifference =
    getSignalSeverityPriority(
      right.severity,
    ) -
    getSignalSeverityPriority(
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
      left.score,
      right.score,
    )
  ) {
    return right.score -
      left.score;
  }

  return left.type.localeCompare(
    right.type,
  );
}

function getSignalSeverityPriority(
  severity:
    RecommendationAdaptiveLearningSignalSeverity,
): number {
  switch (
    severity
  ) {
    case "informational":
      return 1;

    case "low":
      return 2;

    case "moderate":
      return 3;

    case "high":
      return 4;
  }
}

function resolvePrimaryAdaptiveLearningSignalType(
  signals:
    readonly RecommendationAdaptiveLearningSignal[],
): RecommendationAdaptiveLearningSignalType | null {
  return signals[
    0
  ]?.type ??
    null;
}

/* ------------------------------------------------------------------ */
/* Reasoning                                                          */
/* ------------------------------------------------------------------ */

function createAdaptiveLearningReasoning(
  params: {
    state:
      RecommendationAdaptiveLearningState;

    statistics:
      RecommendationAdaptiveLearningStatistics;

    scores:
      RecommendationAdaptiveLearningScores;

    patterns:
      RecommendationAdaptiveLearningAnalysis[
        "patterns"
      ];

    adaptationRules:
      RecommendationAdaptiveLearningAnalysis[
        "adaptationRules"
      ];

    runtimeAdjustment:
      RecommendationAdaptiveLearningAnalysis[
        "runtimeAdjustment"
      ];
  },
): string[] {
  const patternSummary =
    summarizeRecommendationLearningPatterns(
      params.patterns,
    );

  const adjustmentSummary =
    summarizeRecommendationRuntimeAdjustment(
      params.runtimeAdjustment,
    );

  const primaryPattern =
    getPrimaryRecommendationLearningPattern(
      params.patterns,
    );

  const reasoning = [
    `Adaptive learning state was classified as ${params.state}.`,

    `${params.statistics.observationCount} learning observations were evaluated.`,

    `${params.statistics.patternCount} learning patterns and ${params.statistics.adaptationRuleCount} adaptation rules were generated.`,

    `Learning confidence was ${params.scores.learningConfidence}.`,

    `Conflict risk was ${params.scores.conflictRisk}.`,
  ];

  if (
    primaryPattern !==
    null
  ) {
    reasoning.push(
      `Primary learning pattern was ${primaryPattern.type}.`,
    );
  }

  if (
    patternSummary.hasConflictingEvidence
  ) {
    reasoning.push(
      "Conflicting evidence was detected, so automatic adaptation must remain limited.",
    );
  }

  if (
    adjustmentSummary.hasAdjustments
  ) {
    reasoning.push(
      `${adjustmentSummary.strategyAdjustmentCount} Strategy, ${adjustmentSummary.decisionAdjustmentCount} Decision, and ${adjustmentSummary.signalAdjustmentCount} Signal adjustments are available.`,
    );
  } else {
    reasoning.push(
      "No active Runtime adjustment was produced from the available evidence.",
    );
  }

  return reasoning;
}

/* ------------------------------------------------------------------ */
/* Overall Confidence                                                 */
/* ------------------------------------------------------------------ */

function calculateOverallLearningConfidence(
  params: {
    scores:
      RecommendationAdaptiveLearningScores;

    statistics:
      RecommendationAdaptiveLearningStatistics;
  },
): number {
  if (
    params.statistics.observationCount ===
    0
  ) {
    return 0;
  }

  return roundScore(
    clampUnitInterval(
      params.scores.learningConfidence *
        0.7 +
      params.scores.evidenceStrength *
        0.2 +
      (
        1 -
        params.scores.conflictRisk
      ) *
        0.1,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Public Validation                                                  */
/* ------------------------------------------------------------------ */

export function validateRecommendationAdaptiveLearningAnalysis(
  params:
    ValidateRecommendationAdaptiveLearningAnalysisParams,
): void {
  const {
    memory,
    memoryAnalysis,
    analysis,
  } = params;

  validateRecommendationEvolutionMemory({
    memory,
  });

  validateRecommendationEvolutionMemoryAnalysis({
    memory,
    analysis:
      memoryAnalysis,
  });

  if (
    typeof analysis !==
      "object" ||
    analysis ===
      null ||
    Array.isArray(
      analysis,
    )
  ) {
    throw new Error(
      "Recommendation Adaptive Learning Analysis must be an object.",
    );
  }

  if (
    analysis.version !==
    1
  ) {
    throw new Error(
      "Recommendation Adaptive Learning Analysis version must be 1.",
    );
  }

  if (
    analysis.memoryId !==
    memory.id
  ) {
    throw new Error(
      "Recommendation Adaptive Learning Analysis memoryId must match Memory id.",
    );
  }

  if (
    analysis.historyId !==
    memory.historyId ||
    analysis.historyId !==
    memoryAnalysis.historyId
  ) {
    throw new Error(
      "Recommendation Adaptive Learning Analysis historyId is inconsistent.",
    );
  }

  if (
    analysis.sourceMemoryAnalyzedAt !==
    memoryAnalysis.analyzedAt
  ) {
    throw new Error(
      "Recommendation Adaptive Learning Analysis sourceMemoryAnalyzedAt must match Memory Analysis analyzedAt.",
    );
  }

  if (
    !isRecommendationAdaptiveLearningState(
      analysis.state,
    )
  ) {
    throw new Error(
      "Recommendation Adaptive Learning Analysis state is invalid.",
    );
  }

  validateAdaptiveLearningStatistics(
    analysis.statistics,
  );

  validateAdaptiveLearningScores(
    analysis.scores,
  );

  validateRecommendationLearningObservationArray(
    analysis.observations,
  );

  validateRecommendationSignalReliabilityProfiles(
    analysis.signalReliabilityProfiles,
  );

  validateRecommendationLearningPatterns(
    analysis.patterns,
  );

  validateRecommendationAdaptationRules(
    analysis.adaptationRules,
  );

  validateRecommendationRuntimeAdjustment({
    adjustment:
      analysis.runtimeAdjustment,
  });

  validateAdaptiveLearningSignals(
    analysis.signals,
  );

  if (
    analysis.primarySignalType !==
      null &&
    !analysis.signals.some(
      (
        signal,
      ) =>
        signal.type ===
        analysis.primarySignalType,
    )
  ) {
    throw new Error(
      "Recommendation Adaptive Learning Analysis primarySignalType must exist in signals.",
    );
  }

  validateUniqueStringArray(
    analysis.reasoning,
    "analysis.reasoning",
  );

  validateUnitInterval(
    analysis.confidence,
    "analysis.confidence",
  );

  validateTimestamp(
    analysis.analyzedAt,
    "analysis.analyzedAt",
  );

  validateTimestampOrder(
    memoryAnalysis.analyzedAt,
    analysis.analyzedAt,
    "memoryAnalysis.analyzedAt",
    "analysis.analyzedAt",
  );

  validateAnalysisStatisticsConsistency(
    analysis,
  );
}

/* ------------------------------------------------------------------ */
/* Statistics Validation                                              */
/* ------------------------------------------------------------------ */

function validateAdaptiveLearningStatistics(
  statistics:
    RecommendationAdaptiveLearningStatistics,
): void {
  const values = [
    statistics.memoryEntryCount,
    statistics.comparisonCount,
    statistics.observationCount,
    statistics.positiveOutcomeCount,
    statistics.neutralOutcomeCount,
    statistics.negativeOutcomeCount,
    statistics.ambiguousOutcomeCount,
    statistics.unknownOutcomeCount,
    statistics.strategyProfileCount,
    statistics.runtimeDecisionProfileCount,
    statistics.signalReliabilityProfileCount,
    statistics.patternCount,
    statistics.adaptationRuleCount,
    statistics.activeAdaptationRuleCount,
    statistics.conflictedAdaptationRuleCount,
  ];

  values.forEach(
    (
      value,
      index,
    ) => {
      validateNonNegativeInteger(
        value,
        `analysis.statistics value at index ${index}`,
      );
    },
  );

  const totalOutcomeCount =
    statistics.positiveOutcomeCount +
    statistics.neutralOutcomeCount +
    statistics.negativeOutcomeCount +
    statistics.ambiguousOutcomeCount +
    statistics.unknownOutcomeCount;

  if (
    totalOutcomeCount !==
    statistics.observationCount
  ) {
    throw new Error(
      "Adaptive Learning outcome counts must equal observationCount.",
    );
  }

  if (
    statistics.activeAdaptationRuleCount >
      statistics.adaptationRuleCount ||
    statistics.conflictedAdaptationRuleCount >
      statistics.adaptationRuleCount
  ) {
    throw new Error(
      "Adaptive Learning Rule status counts must not exceed adaptationRuleCount.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Score Validation                                                   */
/* ------------------------------------------------------------------ */

function validateAdaptiveLearningScores(
  scores:
    RecommendationAdaptiveLearningScores,
): void {
  validateUnitInterval(
    scores.evidenceStrength,
    "scores.evidenceStrength",
  );

  validateUnitInterval(
    scores.learningConfidence,
    "scores.learningConfidence",
  );

  validateUnitInterval(
    scores.adaptationReadiness,
    "scores.adaptationReadiness",
  );

  validateUnitInterval(
    scores.strategyConsistency,
    "scores.strategyConsistency",
  );

  validateUnitInterval(
    scores.decisionConsistency,
    "scores.decisionConsistency",
  );

  validateUnitInterval(
    scores.signalReliability,
    "scores.signalReliability",
  );

  validateUnitInterval(
    scores.conflictRisk,
    "scores.conflictRisk",
  );
}

/* ------------------------------------------------------------------ */
/* Signal Validation                                                  */
/* ------------------------------------------------------------------ */

function validateAdaptiveLearningSignals(
  signals:
    readonly RecommendationAdaptiveLearningSignal[],
): void {
  if (
    !Array.isArray(
      signals,
    )
  ) {
    throw new Error(
      "Recommendation Adaptive Learning signals must be an array.",
    );
  }

  const ids =
    new Set<string>();

  signals.forEach(
    (
      signal,
      index,
    ) => {
      validateRequiredIdentifier(
        signal.id,
        `signals[${index}].id`,
      );

      if (
        !isRecommendationAdaptiveLearningSignalType(
          signal.type,
        )
      ) {
        throw new Error(
          `signals[${index}].type is invalid.`,
        );
      }

      if (
        !isRecommendationAdaptiveLearningSignalSeverity(
          signal.severity,
        )
      ) {
        throw new Error(
          `signals[${index}].severity is invalid.`,
        );
      }

      validateUnitInterval(
        signal.confidence,
        `signals[${index}].confidence`,
      );

      validateUnitInterval(
        signal.score,
        `signals[${index}].score`,
      );

      validateRequiredString(
        signal.description,
        `signals[${index}].description`,
      );

      validateUniqueStringArray(
        signal.relatedObservationIds,
        `signals[${index}].relatedObservationIds`,
      );

      validateUniqueStringArray(
        signal.relatedPatternIds,
        `signals[${index}].relatedPatternIds`,
      );

      validateUniqueStringArray(
        signal.relatedRuleIds,
        `signals[${index}].relatedRuleIds`,
      );

      validateTimestamp(
        signal.detectedAt,
        `signals[${index}].detectedAt`,
      );

      if (
        ids.has(
          signal.id,
        )
      ) {
        throw new Error(
          `Recommendation Adaptive Learning signals contain duplicate id: ${signal.id}.`,
        );
      }

      ids.add(
        signal.id,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Cross-field Validation                                             */
/* ------------------------------------------------------------------ */

function validateAnalysisStatisticsConsistency(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): void {
  if (
    analysis.statistics.observationCount !==
    analysis.observations.length
  ) {
    throw new Error(
      "analysis.statistics.observationCount must match observations length.",
    );
  }

  if (
    analysis.statistics.strategyProfileCount !==
    analysis.strategyProfiles.length
  ) {
    throw new Error(
      "analysis.statistics.strategyProfileCount must match strategyProfiles length.",
    );
  }

  if (
    analysis.statistics.runtimeDecisionProfileCount !==
    analysis.runtimeDecisionProfiles.length
  ) {
    throw new Error(
      "analysis.statistics.runtimeDecisionProfileCount must match runtimeDecisionProfiles length.",
    );
  }

  if (
    analysis.statistics.signalReliabilityProfileCount !==
    analysis.signalReliabilityProfiles.length
  ) {
    throw new Error(
      "analysis.statistics.signalReliabilityProfileCount must match signalReliabilityProfiles length.",
    );
  }

  if (
    analysis.statistics.patternCount !==
    analysis.patterns.length
  ) {
    throw new Error(
      "analysis.statistics.patternCount must match patterns length.",
    );
  }

  if (
    analysis.statistics.adaptationRuleCount !==
    analysis.adaptationRules.length
  ) {
    throw new Error(
      "analysis.statistics.adaptationRuleCount must match adaptationRules length.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validateAnalyzeRecommendationAdaptiveLearningParams(
  params:
    AnalyzeRecommendationAdaptiveLearningParams,
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
      "Analyze Recommendation Adaptive Learning params must be an object.",
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
    params.analyzedAt,
    "analyzedAt",
  );

  validateTimestampOrder(
    params.memoryAnalysis.analyzedAt,
    params.analyzedAt,
    "memoryAnalysis.analyzedAt",
    "analyzedAt",
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
}

/* ------------------------------------------------------------------ */
/* Clone                                                              */
/* ------------------------------------------------------------------ */

export function cloneRecommendationAdaptiveLearningAnalysis(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): RecommendationAdaptiveLearningAnalysis {
  return {
    ...analysis,

    statistics: {
      ...analysis.statistics,
    },

    scores: {
      ...analysis.scores,
    },

    observations:
      analysis.observations.map(
        (
          observation,
        ) => ({
          ...observation,

          enabledRuntimeDecisionTypes: [
            ...observation.enabledRuntimeDecisionTypes,
          ],

          scoreChanges: {
            ...observation.scoreChanges,
          },
        }),
      ),

    strategyProfiles:
      analysis.strategyProfiles.map(
        cloneStrategyProfile,
      ),

    runtimeDecisionProfiles:
      analysis.runtimeDecisionProfiles.map(
        cloneRuntimeDecisionProfile,
      ),

    signalReliabilityProfiles:
      analysis.signalReliabilityProfiles.map(
        (
          profile,
        ) => ({
          ...profile,

          relatedObservationIds: [
            ...profile.relatedObservationIds,
          ],
        }),
      ),

    patterns:
      analysis.patterns.map(
        (
          pattern,
        ) => ({
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
        }),
      ),

    adaptationRules:
      analysis.adaptationRules.map(
        (
          rule,
        ) => ({
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
        }),
      ),

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

    signals:
      analysis.signals.map(
        (
          signal,
        ) => ({
          ...signal,

          relatedObservationIds: [
            ...signal.relatedObservationIds,
          ],

          relatedPatternIds: [
            ...signal.relatedPatternIds,
          ],

          relatedRuleIds: [
            ...signal.relatedRuleIds,
          ],
        }),
      ),

    reasoning: [
      ...analysis.reasoning,
    ],
  };
}

function cloneStrategyProfile(
  profile:
    RecommendationStrategyLearningProfile,
): RecommendationStrategyLearningProfile {
  return {
    ...profile,

    overall: {
      ...profile.overall,
    },

    byState:
      cloneStateProfileRecord(
        profile.byState,
      ),

    averageChanges: {
      ...profile.averageChanges,
    },

    outcomeCounts: {
      ...profile.outcomeCounts,
    },

    relatedObservationIds: [
      ...profile.relatedObservationIds,
    ],
  };
}

function cloneRuntimeDecisionProfile(
  profile:
    RecommendationRuntimeDecisionLearningProfile,
): RecommendationRuntimeDecisionLearningProfile {
  return {
    ...profile,

    effectiveness: {
      ...profile.effectiveness,
    },

    byState:
      cloneStateProfileRecord(
        profile.byState,
      ),

    averageChanges: {
      ...profile.averageChanges,
    },

    outcomeCounts: {
      ...profile.outcomeCounts,
    },

    relatedObservationIds: [
      ...profile.relatedObservationIds,
    ],
  };
}

function cloneStateProfileRecord<
  TProfile extends {
    state:
      RecommendationAdaptiveLearningEntryState;

    effectiveness:
      RecommendationLearningEffectiveness;

    averageChanges:
      RecommendationLearningAverageChanges;

    outcomeCounts:
      RecommendationLearningOutcomeCounts;
  },
>(
  record:
    Partial<
      Record<
        RecommendationAdaptiveLearningEntryState,
        TProfile
      >
    >,
): Partial<
  Record<
    RecommendationAdaptiveLearningEntryState,
    TProfile
  >
> {
  const cloned:
    Partial<
      Record<
        RecommendationAdaptiveLearningEntryState,
        TProfile
      >
    > = {};

  Object.keys(
    record,
  ).forEach(
    (
      rawState,
    ) => {
      const state =
        rawState as RecommendationAdaptiveLearningEntryState;

      const profile =
        record[
          state
        ];

      if (
        profile ===
        undefined
      ) {
        return;
      }

      cloned[
        state
      ] = {
        ...profile,

        effectiveness: {
          ...profile.effectiveness,
        },

        averageChanges: {
          ...profile.averageChanges,
        },

        outcomeCounts: {
          ...profile.outcomeCounts,
        },
      };
    },
  );

  return cloned;
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

function averageNumbers(
  values:
    readonly number[],
): number {
  if (
    values.length ===
    0
  ) {
    return 0;
  }

  return values.reduce(
    (
      sum,
      value,
    ) =>
      sum +
      value,
    0,
  ) /
    values.length;
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
    SCORE_TOLERANCE
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