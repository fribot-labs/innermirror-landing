import {
    createEmptyRecommendationPredictionEvidence,
} from "./recommendationPredictiveIntelligenceTypes";

import {
    validateRecommendationPredictionContext,
} from "./createRecommendationPredictionContext";

import type {
    PredictNextRecommendationStatesParams,
    RecommendationPredictedState,
    RecommendationPredictionCandidateScores,
    RecommendationPredictionContext,
    RecommendationPredictionEvidence,
    RecommendationPredictiveEntryState,
} from "./recommendationPredictiveIntelligenceTypes";

import type {
    RecommendationEvolutionMemory
} from "./recommendationEvolutionMemoryTypes";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_MAXIMUM_CANDIDATE_COUNT =
  3;

const DEFAULT_MINIMUM_PROBABILITY =
  0.05;

const MAXIMUM_CANDIDATE_COUNT =
  7;

const MINIMUM_RAW_SCORE =
  0.0001;

const SCORE_PRECISION =
  10000;

/**
 * 현재 Recommendation Evolution Intelligence State 계약과 동일한
 * 후보 집합입니다.
 */
const RECOMMENDATION_PREDICTIVE_ENTRY_STATES:
  readonly RecommendationPredictiveEntryState[] = [
    "unavailable",
    "observing",
    "stable",
    "progressing",
    "stalled",
    "fragmented",
    "advancing",
  ];

/* ------------------------------------------------------------------ */
/* Internal Candidate                                                 */
/* ------------------------------------------------------------------ */

type RecommendationStatePredictionCandidate = {
  state:
    RecommendationPredictiveEntryState;

  rawScore:
    number;

  probability:
    number;

  confidence:
    number;

  reasoning:
    string[];

  evidence:
    RecommendationPredictionEvidence;
};

type RecommendationStateTransitionStatistics = {
  transitionCount:
    number;

  matchingCurrentStateCount:
    number;

  destinationCounts:
    Partial<
      Record<
        RecommendationPredictiveEntryState,
        number
      >
    >;
};

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * 다음 Recommendation State 후보를 예측합니다.
 *
 * 예측 근거:
 *
 * - 현재 State의 지속 가능성
 * - Memory 안에서 관찰된 State 전환
 * - 최근 State 출현 빈도
 * - Stability·Progress·Risk·Completion 추세
 * - 장기 Memory Signal
 * - Adaptive Learning Evidence와 Confidence
 * - 현재 Conflict Risk
 *
 * 이 함수는 Runtime State를 변경하지 않습니다.
 * 후보와 상대적 가능성만 반환합니다.
 */
export function predictNextRecommendationStates(
  params:
    PredictNextRecommendationStatesParams,
): RecommendationPredictedState[] {
  validatePredictNextRecommendationStatesParams(
    params,
  );

  const maximumCandidateCount =
    params.maximumCandidateCount ??
    DEFAULT_MAXIMUM_CANDIDATE_COUNT;

  const minimumProbability =
    params.minimumProbability ??
    DEFAULT_MINIMUM_PROBABILITY;

  if (
    params.context.currentState ===
      null ||
    params.memory.entries.length ===
      0
  ) {
    return [];
  }

  const transitionStatistics =
    createStateTransitionStatistics(
      params.memory,
      params.context.currentState,
    );

  const candidates =
    RECOMMENDATION_PREDICTIVE_ENTRY_STATES.map(
      (
        state,
      ) =>
        createStatePredictionCandidate({
          state,
          context:
            params.context,
          memory:
            params.memory,
          transitionStatistics,
        }),
    );

  const normalizedCandidates =
    normalizeStatePredictionCandidates(
      candidates,
    );

  const selectedCandidates =
    selectStatePredictionCandidates({
      candidates:
        normalizedCandidates,

      maximumCandidateCount,

      minimumProbability,
    });

  return selectedCandidates.map(
    (
      candidate,
      index,
    ) => ({
      id:
        params.createPredictionId(
          candidate.state,
          index,
        ),

      state:
        candidate.state,

      rank:
        index +
        1,

      scores: {
        rawScore:
          roundScore(
            candidate.rawScore,
          ),

        probability:
          roundScore(
            candidate.probability,
          ),

        confidence:
          roundScore(
            candidate.confidence,
          ),
      },

      reasoning: [
        ...candidate.reasoning,
      ],

      evidence:
        cloneRecommendationPredictionEvidence(
          candidate.evidence,
        ),

      predictedAt:
        params.predictedAt,
    }),
  );
}

/* ------------------------------------------------------------------ */
/* Candidate Creation                                                 */
/* ------------------------------------------------------------------ */

function createStatePredictionCandidate(
  params: {
    state:
      RecommendationPredictiveEntryState;

    context:
      RecommendationPredictionContext;

    memory:
      RecommendationEvolutionMemory;

    transitionStatistics:
      RecommendationStateTransitionStatistics;
  },
): RecommendationStatePredictionCandidate {
  const {
    state,
    context,
    memory,
    transitionStatistics,
  } = params;

  let rawScore =
    0.1;

  const reasoning:
    string[] = [];

  const evidence =
    createEmptyRecommendationPredictionEvidence();

  addRecentEntryEvidence(
    evidence,
    context,
  );

  addAdaptiveEvidence(
    evidence,
    context,
  );

  rawScore +=
    calculateCurrentStatePersistenceScore({
      state,
      context,
      reasoning,
    });

  rawScore +=
    calculateHistoricalTransitionScore({
      state,
      transitionStatistics,
      reasoning,
    });

  rawScore +=
    calculateRecentStateFrequencyScore({
      state,
      context,
      reasoning,
    });

  rawScore +=
    calculateScoreTrendBias({
      state,
      context,
      reasoning,
    });

  rawScore +=
    calculateMemorySignalBias({
      state,
      context,
      reasoning,
    });

  rawScore +=
    calculateAdaptiveStateBias({
      state,
      context,
      reasoning,
    });

  rawScore -=
    calculateConflictPenalty({
      state,
      context,
      reasoning,
    });

  rawScore =
    Math.max(
      MINIMUM_RAW_SCORE,
      rawScore,
    );

  const confidence =
    calculateStatePredictionConfidence({
      state,
      context,
      memory,
      transitionStatistics,
    });

  if (
    reasoning.length ===
    0
  ) {
    reasoning.push(
      `The ${state} state remains a baseline prediction candidate.`,
    );
  }

  return {
    state,

    rawScore:
      roundScore(
        rawScore,
      ),

    probability:
      0,

    confidence:
      roundScore(
        confidence,
      ),

    reasoning:
      uniqueStrings(
        reasoning,
      ),

    evidence,
  };
}

/* ------------------------------------------------------------------ */
/* Current State Persistence                                          */
/* ------------------------------------------------------------------ */

function calculateCurrentStatePersistenceScore(
  params: {
    state:
      RecommendationPredictiveEntryState;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  if (
    params.context.currentState !==
    params.state
  ) {
    return 0;
  }

  const recentStateCount =
    countOccurrences(
      params.context.recentStates,
      params.state,
    );

  const recentStateRatio =
    params.context.recentStates.length ===
      0
      ? 0
      : recentStateCount /
        params.context.recentStates.length;

  const score =
    0.22 +
    recentStateRatio *
      0.18;

  params.reasoning.push(
    `The current state is ${params.state}, supporting short-term state persistence.`,
  );

  if (
    recentStateRatio >=
    0.6
  ) {
    params.reasoning.push(
      `${params.state} has appeared repeatedly in the recent Recommendation sequence.`,
    );
  }

  return score;
}

/* ------------------------------------------------------------------ */
/* Historical Transition                                              */
/* ------------------------------------------------------------------ */

function calculateHistoricalTransitionScore(
  params: {
    state:
      RecommendationPredictiveEntryState;

    transitionStatistics:
      RecommendationStateTransitionStatistics;

    reasoning:
      string[];
  },
): number {
  const destinationCount =
    params.transitionStatistics.destinationCounts[
      params.state
    ] ??
    0;

  if (
    destinationCount ===
      0 ||
    params.transitionStatistics.transitionCount ===
      0
  ) {
    return 0;
  }

  const transitionRatio =
    destinationCount /
    params.transitionStatistics.transitionCount;

  params.reasoning.push(
    `Historical transitions from the current state have previously moved to ${params.state}.`,
  );

  return transitionRatio *
    0.3;
}

/* ------------------------------------------------------------------ */
/* Recent State Frequency                                             */
/* ------------------------------------------------------------------ */

function calculateRecentStateFrequencyScore(
  params: {
    state:
      RecommendationPredictiveEntryState;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  if (
    params.context.recentStates.length ===
    0
  ) {
    return 0;
  }

  const occurrenceCount =
    countOccurrences(
      params.context.recentStates,
      params.state,
    );

  if (
    occurrenceCount ===
    0
  ) {
    return 0;
  }

  const frequency =
    occurrenceCount /
    params.context.recentStates.length;

  if (
    frequency >=
    0.4
  ) {
    params.reasoning.push(
      `${params.state} is a recurring state in recent Memory entries.`,
    );
  }

  return frequency *
    0.14;
}

/* ------------------------------------------------------------------ */
/* Score Trend Bias                                                   */
/* ------------------------------------------------------------------ */

function calculateScoreTrendBias(
  params: {
    state:
      RecommendationPredictiveEntryState;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  const {
    scoreTrend,
  } = params.context;

  let score =
    0;

  switch (
    params.state
  ) {
    case "stable": {
      score +=
        positiveChange(
          scoreTrend.stabilityChange,
        ) *
        0.22;

      score +=
        positiveChange(
          scoreTrend.progressChange,
        ) *
        0.08;

      score +=
        negativeChangeMagnitude(
          scoreTrend.repetitionRiskChange,
        ) *
        0.08;

      if (
        scoreTrend.stability ===
        "increasing"
      ) {
        params.reasoning.push(
          "Recent stability scores are increasing.",
        );
      }

      break;
    }

    case "progressing": {
      score +=
        positiveChange(
          scoreTrend.progressChange,
        ) *
        0.24;

      score +=
        positiveChange(
          scoreTrend.stabilityChange,
        ) *
        0.08;

      if (
        scoreTrend.progress ===
        "increasing"
      ) {
        params.reasoning.push(
          "Recent progress scores are increasing.",
        );
      }

      break;
    }

    case "advancing": {
      score +=
        positiveChange(
          scoreTrend.progressChange,
        ) *
        0.14;

      score +=
        positiveChange(
          scoreTrend.completionMomentumChange,
        ) *
        0.24;

      score +=
        negativeChangeMagnitude(
          scoreTrend.redirectionRiskChange,
        ) *
        0.08;

      if (
        scoreTrend.completionMomentum ===
        "increasing"
      ) {
        params.reasoning.push(
          "Completion momentum is increasing, supporting an advancing transition.",
        );
      }

      break;
    }

    case "stalled": {
      score +=
        negativeChangeMagnitude(
          scoreTrend.progressChange,
        ) *
        0.2;

      score +=
        positiveChange(
          scoreTrend.repetitionRiskChange,
        ) *
        0.16;

      score +=
        negativeChangeMagnitude(
          scoreTrend.completionMomentumChange,
        ) *
        0.12;

      if (
        scoreTrend.progress ===
        "decreasing"
      ) {
        params.reasoning.push(
          "Recent progress is decreasing, increasing stalled-state likelihood.",
        );
      }

      break;
    }

    case "fragmented": {
      score +=
        positiveChange(
          scoreTrend.redirectionRiskChange,
        ) *
        0.22;

      score +=
        positiveChange(
          scoreTrend.repetitionRiskChange,
        ) *
        0.1;

      score +=
        negativeChangeMagnitude(
          scoreTrend.stabilityChange,
        ) *
        0.14;

      if (
        scoreTrend.redirectionRisk ===
        "increasing"
      ) {
        params.reasoning.push(
          "Redirection risk is increasing, supporting a fragmented-state possibility.",
        );
      }

      break;
    }

    case "observing": {
      score +=
        stableDirectionScore(
          scoreTrend.progress,
        ) *
        0.06;

      score +=
        stableDirectionScore(
          scoreTrend.stability,
        ) *
        0.04;

      break;
    }

    case "unavailable": {
      if (
        scoreTrend.sampleCount ===
        0
      ) {
        score +=
          0.08;

        params.reasoning.push(
          "No comparison trend is available, leaving the unavailable state as a limited candidate.",
        );
      }

      break;
    }
  }

  return score;
}

/* ------------------------------------------------------------------ */
/* Memory Signal Bias                                                 */
/* ------------------------------------------------------------------ */

function calculateMemorySignalBias(
  params: {
    state:
      RecommendationPredictiveEntryState;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  const signals =
    new Set(
      params.context.currentMemorySignalTypes,
    );

  let score =
    0;

  switch (
    params.state
  ) {
    case "observing": {
      if (
        signals.has(
          "persistent-observation",
        )
      ) {
        score +=
          0.22;

        params.reasoning.push(
          "Persistent observation is active in long-term Memory.",
        );
      }

      break;
    }

    case "stable": {
      if (
        signals.has(
          "persistent-stability",
        )
      ) {
        score +=
          0.24;

        params.reasoning.push(
          "Persistent stability is active in long-term Memory.",
        );
      }

      if (
        signals.has(
          "risk-reduction",
        )
      ) {
        score +=
          0.08;
      }

      break;
    }

    case "progressing": {
      if (
        signals.has(
          "long-term-progression",
        )
      ) {
        score +=
          0.24;

        params.reasoning.push(
          "Long-term progression is active in Memory.",
        );
      }

      if (
        signals.has(
          "confidence-recovery",
        )
      ) {
        score +=
          0.06;
      }

      break;
    }

    case "advancing": {
      if (
        signals.has(
          "long-term-advancement",
        )
      ) {
        score +=
          0.26;

        params.reasoning.push(
          "Long-term advancement is active in Memory.",
        );
      }

      break;
    }

    case "stalled": {
      if (
        signals.has(
          "persistent-stall",
        )
      ) {
        score +=
          0.26;

        params.reasoning.push(
          "Persistent stall is active in long-term Memory.",
        );
      }

      if (
        signals.has(
          "confidence-degradation",
        )
      ) {
        score +=
          0.06;
      }

      break;
    }

    case "fragmented": {
      if (
        signals.has(
          "persistent-fragmentation",
        )
      ) {
        score +=
          0.28;

        params.reasoning.push(
          "Persistent fragmentation is active in long-term Memory.",
        );
      }

      if (
        signals.has(
          "state-oscillation",
        ) ||
        signals.has(
          "strategy-oscillation",
        )
      ) {
        score +=
          0.1;
      }

      if (
        signals.has(
          "risk-accumulation",
        )
      ) {
        score +=
          0.08;
      }

      break;
    }

    case "unavailable": {
      if (
        signals.has(
          "insufficient-memory",
        )
      ) {
        score +=
          0.3;

        params.reasoning.push(
          "Memory currently reports insufficient evidence.",
        );
      }

      break;
    }
  }

  if (
    signals.has(
      "recovery-pattern",
    )
  ) {
    if (
      params.state ===
        "stable" ||
      params.state ===
        "progressing"
    ) {
      score +=
        0.08;

      params.reasoning.push(
        "A recovery pattern supports movement toward a healthier state.",
      );
    }
  }

  return score;
}

/* ------------------------------------------------------------------ */
/* Adaptive Learning Bias                                             */
/* ------------------------------------------------------------------ */

function calculateAdaptiveStateBias(
  params: {
    state:
      RecommendationPredictiveEntryState;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  const {
    context,
  } = params;

  let score =
    0;

  if (
    params.state ===
    "stable"
  ) {
    score +=
      positiveChange(
        context.runtimeAdjustment
          .stabilizationPreferenceAdjustment,
      ) *
      0.18;

    if (
      context.runtimeAdjustment
        .stabilizationPreferenceAdjustment >
      0
    ) {
      params.reasoning.push(
        "Adaptive Learning currently favors stabilization.",
      );
    }
  }

  if (
    params.state ===
      "stable" ||
    params.state ===
      "progressing"
  ) {
    score +=
      positiveChange(
        context.runtimeAdjustment
          .recoveryPreferenceAdjustment,
      ) *
      0.12;
  }

  if (
    params.state ===
    "advancing"
  ) {
    score +=
      negativeChangeMagnitude(
        context.runtimeAdjustment
          .newRecommendationThresholdAdjustment,
      ) *
      0.1;
  }

  if (
    params.state ===
      "observing" ||
    params.state ===
      "stalled"
  ) {
    score +=
      positiveChange(
        context.runtimeAdjustment
          .evidenceRequirementAdjustment,
      ) *
      0.08;
  }

  return score *
    averageNumbers([
      context.learningConfidence,
      context.adaptationReadiness,
    ]);
}

/* ------------------------------------------------------------------ */
/* Conflict Penalty                                                   */
/* ------------------------------------------------------------------ */

function calculateConflictPenalty(
  params: {
    state:
      RecommendationPredictiveEntryState;

    context:
      RecommendationPredictionContext;

    reasoning:
      string[];
  },
): number {
  if (
    params.context.conflictRisk <=
      0
  ) {
    return 0;
  }

  const basePenalty =
    params.context.conflictRisk *
    0.08;

  const additionalPenalty =
    params.context.conflictedAdaptationRuleIds.length >
      0
      ? 0.03
      : 0;

  if (
    params.context.conflictRisk >=
    0.5
  ) {
    params.reasoning.push(
      "Conflicting adaptive evidence reduces prediction certainty.",
    );
  }

  /**
   * unavailable은 데이터 충돌 시 상대적으로 가능성이 높아질 수
   * 있으므로 일반 후보보다 패널티를 작게 적용합니다.
   */
  if (
    params.state ===
    "unavailable"
  ) {
    return (
      basePenalty +
      additionalPenalty
    ) *
      0.25;
  }

  return basePenalty +
    additionalPenalty;
}

/* ------------------------------------------------------------------ */
/* Confidence                                                         */
/* ------------------------------------------------------------------ */

function calculateStatePredictionConfidence(
  params: {
    state:
      RecommendationPredictiveEntryState;

    context:
      RecommendationPredictionContext;

    memory:
      RecommendationEvolutionMemory;

    transitionStatistics:
      RecommendationStateTransitionStatistics;
  },
): number {
  const entryEvidence =
    clampUnitInterval(
      params.memory.entries.length /
      5,
    );

  const comparisonEvidence =
    clampUnitInterval(
      params.context.scoreTrend.sampleCount /
      4,
    );

  const transitionEvidence =
    clampUnitInterval(
      params.transitionStatistics
        .matchingCurrentStateCount /
      3,
    );

  const stateFrequencyEvidence =
    params.context.recentStates.length ===
      0
      ? 0
      : countOccurrences(
          params.context.recentStates,
          params.state,
        ) /
        params.context.recentStates.length;

  const adaptiveEvidence =
    averageNumbers([
      params.context.evidenceStrength,
      params.context.learningConfidence,
      params.context.adaptationReadiness,
    ]);

  const confidence =
    entryEvidence *
      0.18 +
    comparisonEvidence *
      0.18 +
    transitionEvidence *
      0.2 +
    stateFrequencyEvidence *
      0.14 +
    adaptiveEvidence *
      0.3;

  const conflictMultiplier =
    1 -
    params.context.conflictRisk *
      0.45;

  return clampUnitInterval(
    confidence *
      conflictMultiplier,
  );
}

/* ------------------------------------------------------------------ */
/* Historical Transition Statistics                                   */
/* ------------------------------------------------------------------ */

function createStateTransitionStatistics(
  memory:
    RecommendationEvolutionMemory,
  currentState:
    RecommendationPredictiveEntryState,
): RecommendationStateTransitionStatistics {
  const destinationCounts:
    Partial<
      Record<
        RecommendationPredictiveEntryState,
        number
      >
    > = {};

  let matchingCurrentStateCount =
    0;

  for (
    let index =
      0;
    index <
    memory.entries.length -
      1;
    index +=
      1
  ) {
    const current =
      memory.entries[
        index
      ];

    const next =
      memory.entries[
        index +
          1
      ];

    if (
      current ===
        undefined ||
      next ===
        undefined ||
      current.state !==
        currentState
    ) {
      continue;
    }

    matchingCurrentStateCount +=
      1;

    destinationCounts[
      next.state
    ] =
      (
        destinationCounts[
          next.state
        ] ??
        0
      ) +
      1;
  }

  return {
    transitionCount:
      matchingCurrentStateCount,

    matchingCurrentStateCount,

    destinationCounts,
  };
}

/* ------------------------------------------------------------------ */
/* Normalization                                                      */
/* ------------------------------------------------------------------ */

export function normalizeRecommendationStatePredictions(
  predictions:
    readonly RecommendationPredictedState[],
): RecommendationPredictedState[] {
  if (
    predictions.length ===
    0
  ) {
    return [];
  }

  const totalRawScore =
    predictions.reduce(
      (
        sum,
        prediction,
      ) =>
        sum +
        Math.max(
          0,
          prediction.scores.rawScore,
        ),
      0,
    );

  if (
    totalRawScore <=
    0
  ) {
    const uniformProbability =
      1 /
      predictions.length;

    return predictions.map(
      (
        prediction,
      ) => ({
        ...cloneRecommendationPredictedState(
          prediction,
        ),

        scores: {
          ...prediction.scores,

          probability:
            roundScore(
              uniformProbability,
            ),
        },
      }),
    );
  }

  return predictions.map(
    (
      prediction,
    ) => ({
      ...cloneRecommendationPredictedState(
        prediction,
      ),

      scores: {
        ...prediction.scores,

        probability:
          roundScore(
            Math.max(
              0,
              prediction.scores.rawScore,
            ) /
              totalRawScore,
          ),
      },
    }),
  );
}

function normalizeStatePredictionCandidates(
  candidates:
    readonly RecommendationStatePredictionCandidate[],
): RecommendationStatePredictionCandidate[] {
  const totalRawScore =
    candidates.reduce(
      (
        sum,
        candidate,
      ) =>
        sum +
        Math.max(
          MINIMUM_RAW_SCORE,
          candidate.rawScore,
        ),
      0,
    );

  if (
    totalRawScore <=
    0
  ) {
    const uniformProbability =
      1 /
      candidates.length;

    return candidates.map(
      (
        candidate,
      ) => ({
        ...cloneStatePredictionCandidate(
          candidate,
        ),

        probability:
          uniformProbability,
      }),
    );
  }

  return candidates.map(
    (
      candidate,
    ) => ({
      ...cloneStatePredictionCandidate(
        candidate,
      ),

      probability:
        Math.max(
          MINIMUM_RAW_SCORE,
          candidate.rawScore,
        ) /
        totalRawScore,
    }),
  );
}

/* ------------------------------------------------------------------ */
/* Candidate Selection                                                */
/* ------------------------------------------------------------------ */

function selectStatePredictionCandidates(
  params: {
    candidates:
      readonly RecommendationStatePredictionCandidate[];

    maximumCandidateCount:
      number;

    minimumProbability:
      number;
  },
): RecommendationStatePredictionCandidate[] {
  const sorted =
    [...params.candidates].sort(
      compareStatePredictionCandidates,
    );

  let selected =
    sorted
      .filter(
        (
          candidate,
        ) =>
          candidate.probability >=
          params.minimumProbability,
      )
      .slice(
        0,
        params.maximumCandidateCount,
      );

  /**
   * 모든 후보가 minimumProbability보다 낮은 극단적인 설정에서도
   * 가장 높은 후보 하나는 보존합니다.
   */
  if (
    selected.length ===
      0 &&
    sorted.length >
      0
  ) {
    selected = [
      sorted[
        0
      ] as RecommendationStatePredictionCandidate,
    ];
  }

  return renormalizeSelectedCandidates(
    selected,
  );
}

function renormalizeSelectedCandidates(
  candidates:
    readonly RecommendationStatePredictionCandidate[],
): RecommendationStatePredictionCandidate[] {
  const probabilityTotal =
    candidates.reduce(
      (
        sum,
        candidate,
      ) =>
        sum +
        candidate.probability,
      0,
    );

  if (
    probabilityTotal <=
    0
  ) {
    return candidates.map(
      cloneStatePredictionCandidate,
    );
  }

  return candidates.map(
    (
      candidate,
    ) => ({
      ...cloneStatePredictionCandidate(
        candidate,
      ),

      probability:
        candidate.probability /
        probabilityTotal,
    }),
  );
}

function compareStatePredictionCandidates(
  left:
    RecommendationStatePredictionCandidate,
  right:
    RecommendationStatePredictionCandidate,
): number {
  if (
    left.probability !==
    right.probability
  ) {
    return right.probability -
      left.probability;
  }

  if (
    left.confidence !==
    right.confidence
  ) {
    return right.confidence -
      left.confidence;
  }

  return getStateOrder(
    left.state,
  ) -
    getStateOrder(
      right.state,
    );
}

/* ------------------------------------------------------------------ */
/* Evidence                                                           */
/* ------------------------------------------------------------------ */

function addRecentEntryEvidence(
  evidence:
    RecommendationPredictionEvidence,
  context:
    RecommendationPredictionContext,
): void {
  evidence.relatedEntryIds =
    uniqueStrings([
      ...evidence.relatedEntryIds,
      ...context.recentEntryIds,
    ]);

  evidence.relatedComparisonIds =
    uniqueStrings([
      ...evidence.relatedComparisonIds,
      ...context.recentComparisonIds,
    ]);

  evidence.relatedMemorySignalTypes =
    uniqueStrings([
      ...evidence.relatedMemorySignalTypes,
      ...context.currentMemorySignalTypes,
    ]);
}

function addAdaptiveEvidence(
  evidence:
    RecommendationPredictionEvidence,
  context:
    RecommendationPredictionContext,
): void {
  evidence.relatedRuleIds =
    uniqueStrings([
      ...evidence.relatedRuleIds,
      ...context.activeAdaptationRuleIds,
      ...context.conflictedAdaptationRuleIds,
    ]);
}

/* ------------------------------------------------------------------ */
/* Clone                                                              */
/* ------------------------------------------------------------------ */

export function cloneRecommendationPredictedState(
  prediction:
    RecommendationPredictedState,
): RecommendationPredictedState {
  return {
    ...prediction,

    scores: {
      ...prediction.scores,
    },

    reasoning: [
      ...prediction.reasoning,
    ],

    evidence:
      cloneRecommendationPredictionEvidence(
        prediction.evidence,
      ),
  };
}

function cloneStatePredictionCandidate(
  candidate:
    RecommendationStatePredictionCandidate,
): RecommendationStatePredictionCandidate {
  return {
    ...candidate,

    reasoning: [
      ...candidate.reasoning,
    ],

    evidence:
      cloneRecommendationPredictionEvidence(
        candidate.evidence,
      ),
  };
}

function cloneRecommendationPredictionEvidence(
  evidence:
    RecommendationPredictionEvidence,
): RecommendationPredictionEvidence {
  return {
    relatedEntryIds: [
      ...evidence.relatedEntryIds,
    ],

    relatedComparisonIds: [
      ...evidence.relatedComparisonIds,
    ],

    relatedObservationIds: [
      ...evidence.relatedObservationIds,
    ],

    relatedPatternIds: [
      ...evidence.relatedPatternIds,
    ],

    relatedRuleIds: [
      ...evidence.relatedRuleIds,
    ],

    relatedMemorySignalTypes: [
      ...evidence.relatedMemorySignalTypes,
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Query Helpers                                                      */
/* ------------------------------------------------------------------ */

export function getRecommendationStatePredictionProbability(
  predictions:
    readonly RecommendationPredictedState[],
  state:
    RecommendationPredictiveEntryState,
): number {
  return (
    predictions.find(
      (
        prediction,
      ) =>
        prediction.state ===
        state,
    )?.scores.probability ??
    0
  );
}

export function hasRecommendationStatePrediction(
  predictions:
    readonly RecommendationPredictedState[],
  state:
    RecommendationPredictiveEntryState,
): boolean {
  return predictions.some(
    (
      prediction,
    ) =>
      prediction.state ===
      state,
  );
}

export function summarizeRecommendationStatePredictions(
  predictions:
    readonly RecommendationPredictedState[],
): string {
  if (
    predictions.length ===
    0
  ) {
    return "No Recommendation state prediction is currently available.";
  }

  return predictions
    .map(
      (
        prediction,
      ) =>
        `${prediction.state}: ${roundScore(
          prediction.scores.probability *
            100,
        )}%`,
    )
    .join(
      ", ",
    );
}

/* ------------------------------------------------------------------ */
/* Public Validation                                                  */
/* ------------------------------------------------------------------ */

export function validateRecommendationPredictedState(
  prediction:
    RecommendationPredictedState,
): void {
  validateRequiredIdentifier(
    prediction.id,
    "prediction.id",
  );

  if (
    !isRecommendationPredictiveEntryState(
      prediction.state,
    )
  ) {
    throw new Error(
      "Recommendation State Prediction state is invalid.",
    );
  }

  validatePositiveInteger(
    prediction.rank,
    "prediction.rank",
  );

  validatePredictionCandidateScores(
    prediction.scores,
  );

  validateStringArray(
    prediction.reasoning,
    "prediction.reasoning",
  );

  validatePredictionEvidence(
    prediction.evidence,
  );

  validateTimestamp(
    prediction.predictedAt,
    "prediction.predictedAt",
  );
}

export function validateRecommendationPredictedStates(
  predictions:
    readonly RecommendationPredictedState[],
): void {
  if (
    !Array.isArray(
      predictions,
    )
  ) {
    throw new Error(
      "Recommendation State Predictions must be an array.",
    );
  }

  const observedIds =
    new Set<string>();

  const observedStates =
    new Set<
      RecommendationPredictiveEntryState
    >();

  predictions.forEach(
    (
      prediction,
      index,
    ) => {
      validateRecommendationPredictedState(
        prediction,
      );

      if (
        observedIds.has(
          prediction.id,
        )
      ) {
        throw new Error(
          `Recommendation State Prediction id must be unique: ${prediction.id}.`,
        );
      }

      if (
        observedStates.has(
          prediction.state,
        )
      ) {
        throw new Error(
          `Recommendation State Prediction state must be unique: ${prediction.state}.`,
        );
      }

      if (
        prediction.rank !==
        index +
          1
      ) {
        throw new Error(
          "Recommendation State Prediction ranks must be sequential.",
        );
      }

      observedIds.add(
        prediction.id,
      );

      observedStates.add(
        prediction.state,
      );
    },
  );

  if (
    predictions.length >
    0
  ) {
    const probabilityTotal =
      predictions.reduce(
        (
          sum,
          prediction,
        ) =>
          sum +
          prediction.scores.probability,
        0,
      );

    if (
      Math.abs(
        probabilityTotal -
          1,
      ) >
      0.001
    ) {
      throw new Error(
        "Recommendation State Prediction probabilities must sum to 1.",
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validatePredictNextRecommendationStatesParams(
  params:
    PredictNextRecommendationStatesParams,
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
      "Predict Next Recommendation States params must be an object.",
    );
  }

  validateRecommendationPredictionContext({
    memory:
      params.memory,

    memoryAnalysis:
      params.memoryAnalysis,

    adaptiveLearningAnalysis:
      params.adaptiveLearningAnalysis,

    context:
      params.context,
  });

  validateTimestamp(
    params.predictedAt,
    "predictedAt",
  );

  validateTimestampOrder(
    params.context.createdAt,
    params.predictedAt,
    "context.createdAt",
    "predictedAt",
  );

  if (
    params.maximumCandidateCount !==
    undefined
  ) {
    validatePositiveBoundedInteger(
      params.maximumCandidateCount,
      "maximumCandidateCount",
      MAXIMUM_CANDIDATE_COUNT,
    );
  }

  if (
    params.minimumProbability !==
    undefined
  ) {
    validateUnitInterval(
      params.minimumProbability,
      "minimumProbability",
    );
  }

  if (
    typeof params.createPredictionId !==
    "function"
  ) {
    throw new Error(
      "createPredictionId must be a function.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Validation Helpers                                                 */
/* ------------------------------------------------------------------ */

function validatePredictionCandidateScores(
  scores:
    RecommendationPredictionCandidateScores,
): void {
  if (
    typeof scores !==
      "object" ||
    scores ===
      null ||
    Array.isArray(
      scores,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Candidate Scores must be an object.",
    );
  }

  validateNonNegativeFiniteNumber(
    scores.rawScore,
    "scores.rawScore",
  );

  validateUnitInterval(
    scores.probability,
    "scores.probability",
  );

  validateUnitInterval(
    scores.confidence,
    "scores.confidence",
  );
}

function validatePredictionEvidence(
  evidence:
    RecommendationPredictionEvidence,
): void {
  if (
    typeof evidence !==
      "object" ||
    evidence ===
      null ||
    Array.isArray(
      evidence,
    )
  ) {
    throw new Error(
      "Recommendation Prediction Evidence must be an object.",
    );
  }

  validateUniqueStringArray(
    evidence.relatedEntryIds,
    "evidence.relatedEntryIds",
  );

  validateUniqueStringArray(
    evidence.relatedComparisonIds,
    "evidence.relatedComparisonIds",
  );

  validateUniqueStringArray(
    evidence.relatedObservationIds,
    "evidence.relatedObservationIds",
  );

  validateUniqueStringArray(
    evidence.relatedPatternIds,
    "evidence.relatedPatternIds",
  );

  validateUniqueStringArray(
    evidence.relatedRuleIds,
    "evidence.relatedRuleIds",
  );

  validateUniqueStringArray(
    evidence.relatedMemorySignalTypes,
    "evidence.relatedMemorySignalTypes",
  );
}

/* ------------------------------------------------------------------ */
/* State Guard                                                        */
/* ------------------------------------------------------------------ */

function isRecommendationPredictiveEntryState(
  value:
    unknown,
): value is RecommendationPredictiveEntryState {
  return (
    typeof value ===
      "string" &&
    RECOMMENDATION_PREDICTIVE_ENTRY_STATES.includes(
      value as RecommendationPredictiveEntryState,
    )
  );
}

/* ------------------------------------------------------------------ */
/* State Order                                                        */
/* ------------------------------------------------------------------ */

function getStateOrder(
  state:
    RecommendationPredictiveEntryState,
): number {
  return RECOMMENDATION_PREDICTIVE_ENTRY_STATES.indexOf(
    state,
  );
}

/* ------------------------------------------------------------------ */
/* Generic Number Helpers                                             */
/* ------------------------------------------------------------------ */

function positiveChange(
  value:
    number,
): number {
  return Math.max(
    0,
    value,
  );
}

function negativeChangeMagnitude(
  value:
    number,
): number {
  return Math.max(
    0,
    -value,
  );
}

function stableDirectionScore(
  direction:
    RecommendationPredictionContext[
      "scoreTrend"
    ][
      "stability"
    ],
): number {
  return direction ===
    "stable"
    ? 1
    : 0;
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
      SCORE_PRECISION,
  ) /
    SCORE_PRECISION;
}

/* ------------------------------------------------------------------ */
/* Generic Array Helpers                                              */
/* ------------------------------------------------------------------ */

function countOccurrences<
  TValue,
>(
  values:
    readonly TValue[],
  target:
    TValue,
): number {
  return values.reduce(
    (
      count,
      value,
    ) =>
      value ===
      target
        ? count +
          1
        : count,
    0,
  );
}

function uniqueStrings<
  TValue extends string,
>(
  values:
    readonly TValue[],
): TValue[] {
  return Array.from(
    new Set(
      values,
    ),
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

function validateStringArray(
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

  values.forEach(
    (
      value,
      index,
    ) => {
      if (
        typeof value !==
          "string" ||
        value.trim().length ===
          0
      ) {
        throw new Error(
          `${fieldName}[${index}] must be a non-empty string.`,
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
  validateStringArray(
    values,
    fieldName,
  );

  const observed =
    new Set<string>();

  values.forEach(
    (
      value,
    ) => {
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

function validateNonNegativeFiniteNumber(
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
    0
  ) {
    throw new Error(
      `${fieldName} must not be negative.`,
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

function validatePositiveBoundedInteger(
  value:
    unknown,
  fieldName:
    string,
  maximum:
    number,
): asserts value is number {
  validatePositiveInteger(
    value,
    fieldName,
  );

  if (
    value >
    maximum
  ) {
    throw new Error(
      `${fieldName} must not exceed ${maximum}.`,
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