import type {
    RecommendationEvolutionConfidence,
    RecommendationEvolutionResult,
    RecommendationLifecycleComparison,
} from "./recommendationEvolutionTypes";

import type {
    DeriveRecommendationEvolutionSignalsParams,
    RecommendationEvolutionIntelligenceSignal,
    RecommendationEvolutionIntelligenceSignalCollection,
    RecommendationEvolutionIntelligenceSignalConfidence,
    RecommendationEvolutionIntelligenceSignalEvidence,
    RecommendationEvolutionIntelligenceSignalSeverity,
    RecommendationEvolutionIntelligenceSignalType,
} from "./recommendationEvolutionIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Thresholds                                                         */
/* ------------------------------------------------------------------ */

const STABLE_REPETITION_RATE_LIMIT =
  0.5;

const FREQUENT_REDIRECTION_RATE =
  0.4;

const PREMATURE_SUPERSESSION_RATE =
  0.5;

const LOW_COMPLETION_RATE =
  0.35;

const COMPLETION_MOMENTUM_RATE =
  0.5;

const HIGH_SUPERSESSION_RATE =
  0.6;

const MINIMUM_RESOLVED_COUNT_FOR_RATE_SIGNAL =
  2;

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * REI02 Recommendation Evolution Result에서
 * Runtime Intelligence Signal을 파생합니다.
 *
 * 이 함수는:
 *
 * - Evolution 분석을 다시 수행하지 않습니다.
 * - 입력 Result 또는 Comparison을 변경하지 않습니다.
 * - 결정론적인 규칙만 사용합니다.
 * - 동일 입력에 대해 동일한 Signal 순서를 생성합니다.
 */
export function deriveRecommendationEvolutionSignals(
  params:
    DeriveRecommendationEvolutionSignalsParams,
): RecommendationEvolutionIntelligenceSignalCollection {
  validateParams(
    params,
  );

  const {
    evolution,
    detectedAt,
    createSignalId,
  } = params;

  const drafts =
    createSignalDrafts(
      evolution,
    );

  const signals =
    drafts.map(
      (
        draft,
        index,
      ) => {
        const id =
          createSignalId(
            draft.type,
            index,
          );

        assertNonEmptyString(
          id,
          `createSignalId result for signal "${draft.type}"`,
        );

        return {
          ...draft,
          id,
          detectedAt,
        };
      },
    );

  assertUniqueSignalIds(
    signals,
  );

  const primarySignal =
    selectPrimarySignal(
      signals,
    );

  return {
    signals,

    signalTypes:
      getUniqueSignalTypes(
        signals,
      ),

    primarySignalId:
      primarySignal?.id ??
      null,

    hasActionableSignal:
      signals.some(
        (
          signal,
        ) =>
          signal.severity ===
            "moderate" ||
          signal.severity ===
            "high",
      ),

    needsObservation:
      signals.some(
        (
          signal,
        ) =>
          signal.type ===
            "insufficient-history" ||
          signal.type ===
            "observation-needed",
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Signal Draft                                                       */
/* ------------------------------------------------------------------ */

type RecommendationEvolutionIntelligenceSignalDraft =
  Omit<
    RecommendationEvolutionIntelligenceSignal,
    "id" | "detectedAt"
  >;

function createSignalDrafts(
  evolution:
    RecommendationEvolutionResult,
): RecommendationEvolutionIntelligenceSignalDraft[] {
  const drafts:
    RecommendationEvolutionIntelligenceSignalDraft[] = [];

  pushSignal(
    drafts,
    deriveInsufficientHistorySignal(
      evolution,
    ),
  );

  pushSignal(
    drafts,
    deriveStableContinuationSignal(
      evolution,
    ),
  );

  pushSignal(
    drafts,
    deriveProductiveRefinementSignal(
      evolution,
    ),
  );

  pushSignal(
    drafts,
    derivePersistentRepetitionSignal(
      evolution,
    ),
  );

  pushSignal(
    drafts,
    deriveUnresolvedRepetitionSignal(
      evolution,
    ),
  );

  pushSignal(
    drafts,
    deriveFrequentRedirectionSignal(
      evolution,
    ),
  );

  pushSignal(
    drafts,
    derivePrematureSupersessionSignal(
      evolution,
    ),
  );

  pushSignal(
    drafts,
    deriveCompletionMomentumSignal(
      evolution,
    ),
  );

  pushSignal(
    drafts,
    deriveLowCompletionRateSignal(
      evolution,
    ),
  );

  pushSignal(
    drafts,
    deriveHighSupersessionRateSignal(
      evolution,
    ),
  );

  pushSignal(
    drafts,
    deriveIncreasingConfidenceSignal(
      evolution,
    ),
  );

  pushSignal(
    drafts,
    deriveDecreasingConfidenceSignal(
      evolution,
    ),
  );

  pushSignal(
    drafts,
    deriveHighDriftSignal(
      evolution,
    ),
  );

  pushSignal(
    drafts,
    deriveStableDirectionSignal(
      evolution,
    ),
  );

  pushSignal(
    drafts,
    deriveObservationNeededSignal(
      evolution,
      drafts,
    ),
  );

  return drafts;
}

function pushSignal(
  drafts:
    RecommendationEvolutionIntelligenceSignalDraft[],
  signal:
    RecommendationEvolutionIntelligenceSignalDraft | null,
): void {
  if (signal !== null) {
    drafts.push(
      signal,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Insufficient History                                               */
/* ------------------------------------------------------------------ */

function deriveInsufficientHistorySignal(
  evolution:
    RecommendationEvolutionResult,
): RecommendationEvolutionIntelligenceSignalDraft | null {
  if (
    evolution.summary
      .hasSufficientHistory
  ) {
    return null;
  }

  const comparableCount =
    evolution.statistics
      .comparableRecommendationCount;

  return createSignalDraft({
    type:
      "insufficient-history",

    severity:
      "info",

    confidence:
      "high",

    score:
      comparableCount === 0
        ? 1
        : 0.75,

    title:
      "분석 가능한 Recommendation 이력이 아직 충분하지 않습니다.",

    description:
      "현재 흐름을 안정성이나 진전 상태로 판단하기보다 추가 Recommendation 변화를 관찰해야 합니다.",

    evidence: [
      createEvidence(
        "Comparable recommendation count",
        comparableCount,
        [],
      ),
      createEvidence(
        "Has sufficient history",
        false,
        [],
      ),
    ],

    relatedComparisonIds:
      getComparableComparisonIds(
        evolution,
      ),
  });
}

/* ------------------------------------------------------------------ */
/* Stable Continuation                                                */
/* ------------------------------------------------------------------ */

function deriveStableContinuationSignal(
  evolution:
    RecommendationEvolutionResult,
): RecommendationEvolutionIntelligenceSignalDraft | null {
  const {
    summary,
    statistics,
  } = evolution;

  const hasStableState =
    summary.stability ===
      "stable" ||
    summary.stability ===
      "highly-stable";

  const hasLowDrift =
    summary.drift ===
      "none" ||
    summary.drift ===
      "low";

  if (
    !summary.hasSufficientHistory ||
    !hasStableState ||
    !hasLowDrift ||
    statistics.repetitionRate >=
      STABLE_REPETITION_RATE_LIMIT
  ) {
    return null;
  }

  const stabilityBase =
    summary.stability ===
      "highly-stable"
      ? 1
      : 0.75;

  const score =
    clampScore(
      stabilityBase -
      statistics.repetitionRate *
        0.25,
    );

  return createSignalDraft({
    type:
      "stable-continuation",

    severity:
      "info",

    confidence:
      evolution.confidence,

    score,

    title:
      "현재 Recommendation 방향이 안정적으로 유지되고 있습니다.",

    description:
      "큰 방향 전환 없이 기존 Recommendation의 연속성이 유지되고 있습니다.",

    evidence: [
      createEvidence(
        "Stability",
        summary.stability,
        [],
      ),
      createEvidence(
        "Drift",
        summary.drift,
        [],
      ),
      createEvidence(
        "Repetition rate",
        statistics.repetitionRate,
        getComparisonIdsByType(
          evolution,
          "repeated",
        ),
      ),
    ],

    relatedComparisonIds:
      getComparableComparisonIds(
        evolution,
      ),
  });
}

/* ------------------------------------------------------------------ */
/* Productive Refinement                                              */
/* ------------------------------------------------------------------ */

function deriveProductiveRefinementSignal(
  evolution:
    RecommendationEvolutionResult,
): RecommendationEvolutionIntelligenceSignalDraft | null {
  const {
    statistics,
    summary,
  } = evolution;

  if (
    statistics.refinedTransitionCount ===
      0
  ) {
    return null;
  }

  const transitionCount =
    statistics.transitionCount;

  const refinementRate =
    safeRatio(
      statistics.refinedTransitionCount,
      transitionCount,
    );

  const latestBonus =
    summary.latestType ===
      "refined"
      ? 0.25
      : 0;

  const score =
    clampScore(
      refinementRate *
        0.75 +
      latestBonus,
    );

  return createSignalDraft({
    type:
      "productive-refinement",

    severity:
      summary.latestType ===
        "refined"
        ? "moderate"
        : "low",

    confidence:
      evolution.confidence,

    score,

    title:
      "Recommendation이 기존 방향 안에서 구체화되고 있습니다.",

    description:
      "새로운 방향으로 교체되기보다 현재 Recommendation이 더 실행 가능한 형태로 다듬어지고 있습니다.",

    evidence: [
      createEvidence(
        "Refined transition count",
        statistics.refinedTransitionCount,
        getComparisonIdsByType(
          evolution,
          "refined",
        ),
      ),
      createEvidence(
        "Refinement rate",
        refinementRate,
        getComparisonIdsByType(
          evolution,
          "refined",
        ),
      ),
      createEvidence(
        "Latest evolution type",
        summary.latestType ??
          "none",
        getLatestComparableComparisonId(
          evolution,
        ),
      ),
    ],

    relatedComparisonIds:
      getComparisonIdsByType(
        evolution,
        "refined",
      ),
  });
}

/* ------------------------------------------------------------------ */
/* Persistent Repetition                                              */
/* ------------------------------------------------------------------ */

function derivePersistentRepetitionSignal(
  evolution:
    RecommendationEvolutionResult,
): RecommendationEvolutionIntelligenceSignalDraft | null {
  if (
    evolution.summary
      .repeatPattern !==
    "persistent"
  ) {
    return null;
  }

  const repetitionRate =
    evolution.statistics
      .repetitionRate;

  return createSignalDraft({
    type:
      "persistent-repetition",

    severity:
      repetitionRate >= 0.75
        ? "high"
        : "moderate",

    confidence:
      evolution.confidence,

    score:
      clampScore(
        repetitionRate,
      ),

    title:
      "동일한 Recommendation이 지속적으로 반복되고 있습니다.",

    description:
      "반복이 의도적인 유지인지 실행 정체인지 구분할 수 있도록 진행 근거를 확인해야 합니다.",

    evidence: [
      createEvidence(
        "Repeat pattern",
        evolution.summary
          .repeatPattern,
        getComparisonIdsByType(
          evolution,
          "repeated",
        ),
      ),
      createEvidence(
        "Repeated transition count",
        evolution.statistics
          .repeatedTransitionCount,
        getComparisonIdsByType(
          evolution,
          "repeated",
        ),
      ),
      createEvidence(
        "Repetition rate",
        repetitionRate,
        getComparisonIdsByType(
          evolution,
          "repeated",
        ),
      ),
    ],

    relatedComparisonIds:
      getComparisonIdsByType(
        evolution,
        "repeated",
      ),
  });
}

/* ------------------------------------------------------------------ */
/* Unresolved Repetition                                              */
/* ------------------------------------------------------------------ */

function deriveUnresolvedRepetitionSignal(
  evolution:
    RecommendationEvolutionResult,
): RecommendationEvolutionIntelligenceSignalDraft | null {
  const {
    summary,
    statistics,
  } = evolution;

  const latestIsRepeated =
    summary.latestType ===
      "repeated";

  const unresolved =
    summary.repeatPattern ===
      "persistent" &&
    latestIsRepeated &&
    statistics.completionRate <
      COMPLETION_MOMENTUM_RATE;

  if (!unresolved) {
    return null;
  }

  const score =
    clampScore(
      statistics.repetitionRate *
        0.7 +
      (1 -
        statistics.completionRate) *
        0.3,
    );

  return createSignalDraft({
    type:
      "unresolved-repetition",

    severity:
      score >= 0.75
        ? "high"
        : "moderate",

    confidence:
      evolution.confidence,

    score,

    title:
      "반복되는 Recommendation의 완료 또는 진행 상태가 확인되지 않았습니다.",

    description:
      "새 Recommendation을 추가하기 전에 현재 Recommendation의 실행 여부와 장애 조건을 확인할 필요가 있습니다.",

    evidence: [
      createEvidence(
        "Latest evolution type",
        summary.latestType ??
          "none",
        getLatestComparableComparisonId(
          evolution,
        ),
      ),
      createEvidence(
        "Repetition rate",
        statistics.repetitionRate,
        getComparisonIdsByType(
          evolution,
          "repeated",
        ),
      ),
      createEvidence(
        "Completion rate",
        statistics.completionRate,
        getComparisonIdsByType(
          evolution,
          "completed-and-advanced",
        ),
      ),
    ],

    relatedComparisonIds:
      getComparisonIdsByType(
        evolution,
        "repeated",
      ),
  });
}

/* ------------------------------------------------------------------ */
/* Frequent Redirection                                               */
/* ------------------------------------------------------------------ */

function deriveFrequentRedirectionSignal(
  evolution:
    RecommendationEvolutionResult,
): RecommendationEvolutionIntelligenceSignalDraft | null {
  const {
    statistics,
    summary,
  } = evolution;

  const redirectionRate =
    safeRatio(
      statistics.redirectedTransitionCount,
      statistics.transitionCount,
    );

  const hasFrequentRedirection =
    redirectionRate >=
      FREQUENT_REDIRECTION_RATE ||
    (
      summary.drift ===
        "high" &&
      statistics.redirectedTransitionCount >
        0
    );

  if (!hasFrequentRedirection) {
    return null;
  }

  const score =
    clampScore(
      Math.max(
        redirectionRate,
        summary.drift ===
          "high"
          ? 0.75
          : 0,
      ),
    );

  return createSignalDraft({
    type:
      "frequent-redirection",

    severity:
      score >= 0.75
        ? "high"
        : "moderate",

    confidence:
      evolution.confidence,

    score,

    title:
      "Recommendation 방향이 자주 변경되고 있습니다.",

    description:
      "새로운 방향을 추가하기보다 현재 목표와 방향 변경의 이유를 먼저 안정화할 필요가 있습니다.",

    evidence: [
      createEvidence(
        "Redirected transition count",
        statistics.redirectedTransitionCount,
        getComparisonIdsByType(
          evolution,
          "redirected",
        ),
      ),
      createEvidence(
        "Redirection rate",
        redirectionRate,
        getComparisonIdsByType(
          evolution,
          "redirected",
        ),
      ),
      createEvidence(
        "Drift",
        summary.drift,
        getRedirectingComparisonIds(
          evolution,
        ),
      ),
    ],

    relatedComparisonIds:
      getRedirectingComparisonIds(
        evolution,
      ),
  });
}

/* ------------------------------------------------------------------ */
/* Premature Supersession                                             */
/* ------------------------------------------------------------------ */

function derivePrematureSupersessionSignal(
  evolution:
    RecommendationEvolutionResult,
): RecommendationEvolutionIntelligenceSignalDraft | null {
  const {
    statistics,
  } = evolution;

  if (
    statistics.supersededCount ===
      0 ||
    statistics.supersessionRate <
      PREMATURE_SUPERSESSION_RATE
  ) {
    return null;
  }

  const score =
    clampScore(
      statistics.supersessionRate,
    );

  return createSignalDraft({
    type:
      "premature-supersession",

    severity:
      score >= 0.75
        ? "high"
        : "moderate",

    confidence:
      evolution.confidence,

    score,

    title:
      "완료되기 전에 교체되는 Recommendation 비중이 높습니다.",

    description:
      "Recommendation 교체가 실제 방향 전환인지 실행 회피인지 확인할 필요가 있습니다.",

    evidence: [
      createEvidence(
        "Superseded count",
        statistics.supersededCount,
        getComparisonIdsByType(
          evolution,
          "superseded",
        ),
      ),
      createEvidence(
        "Supersession rate",
        statistics.supersessionRate,
        getComparisonIdsByType(
          evolution,
          "superseded",
        ),
      ),
    ],

    relatedComparisonIds:
      getComparisonIdsByType(
        evolution,
        "superseded",
      ),
  });
}

/* ------------------------------------------------------------------ */
/* Completion Momentum                                                */
/* ------------------------------------------------------------------ */

function deriveCompletionMomentumSignal(
  evolution:
    RecommendationEvolutionResult,
): RecommendationEvolutionIntelligenceSignalDraft | null {
  const {
    statistics,
    summary,
  } = evolution;

  if (
    statistics.completionAdvanceCount ===
      0 ||
    statistics.completionRate <
      COMPLETION_MOMENTUM_RATE
  ) {
    return null;
  }

  const advanceRate =
    safeRatio(
      statistics.completionAdvanceCount,
      statistics.transitionCount,
    );

  const latestBonus =
    summary.latestType ===
      "completed-and-advanced"
      ? 0.2
      : 0;

  const score =
    clampScore(
      statistics.completionRate *
        0.6 +
      advanceRate *
        0.2 +
      latestBonus,
    );

  return createSignalDraft({
    type:
      "completion-momentum",

    severity:
      "moderate",

    confidence:
      evolution.confidence,

    score,

    title:
      "Recommendation 완료가 다음 단계로 이어지는 흐름이 형성되고 있습니다.",

    description:
      "이전 Recommendation의 완료를 보존하면서 다음 Recommendation으로 전진할 수 있는 상태입니다.",

    evidence: [
      createEvidence(
        "Completion rate",
        statistics.completionRate,
        getComparisonIdsByType(
          evolution,
          "completed-and-advanced",
        ),
      ),
      createEvidence(
        "Completion advance count",
        statistics.completionAdvanceCount,
        getComparisonIdsByType(
          evolution,
          "completed-and-advanced",
        ),
      ),
      createEvidence(
        "Latest evolution type",
        summary.latestType ??
          "none",
        getLatestComparableComparisonId(
          evolution,
        ),
      ),
    ],

    relatedComparisonIds:
      getComparisonIdsByType(
        evolution,
        "completed-and-advanced",
      ),
  });
}

/* ------------------------------------------------------------------ */
/* Low Completion Rate                                                */
/* ------------------------------------------------------------------ */

function deriveLowCompletionRateSignal(
  evolution:
    RecommendationEvolutionResult,
): RecommendationEvolutionIntelligenceSignalDraft | null {
  const {
    statistics,
  } = evolution;

  const resolvedCount =
    statistics.completedCount +
    statistics.supersededCount;

  if (
    resolvedCount <
      MINIMUM_RESOLVED_COUNT_FOR_RATE_SIGNAL ||
    statistics.completionRate >=
      LOW_COMPLETION_RATE
  ) {
    return null;
  }

  const score =
    clampScore(
      1 -
      statistics.completionRate,
    );

  return createSignalDraft({
    type:
      "low-completion-rate",

    severity:
      score >= 0.8
        ? "high"
        : "moderate",

    confidence:
      evolution.confidence,

    score,

    title:
      "해결된 Recommendation 중 완료로 이어진 비율이 낮습니다.",

    description:
      "새 Recommendation 생성보다 기존 Recommendation의 실행 가능성과 완료 조건을 점검할 필요가 있습니다.",

    evidence: [
      createEvidence(
        "Resolved recommendation count",
        resolvedCount,
        [],
      ),
      createEvidence(
        "Completed count",
        statistics.completedCount,
        getComparisonIdsByType(
          evolution,
          "completed-and-advanced",
        ),
      ),
      createEvidence(
        "Completion rate",
        statistics.completionRate,
        [],
      ),
    ],

    relatedComparisonIds:
      getComparableComparisonIds(
        evolution,
      ),
  });
}

/* ------------------------------------------------------------------ */
/* High Supersession Rate                                             */
/* ------------------------------------------------------------------ */

function deriveHighSupersessionRateSignal(
  evolution:
    RecommendationEvolutionResult,
): RecommendationEvolutionIntelligenceSignalDraft | null {
  const {
    statistics,
  } = evolution;

  const resolvedCount =
    statistics.completedCount +
    statistics.supersededCount;

  if (
    resolvedCount <
      MINIMUM_RESOLVED_COUNT_FOR_RATE_SIGNAL ||
    statistics.supersessionRate <
      HIGH_SUPERSESSION_RATE
  ) {
    return null;
  }

  return createSignalDraft({
    type:
      "high-supersession-rate",

    severity:
      statistics.supersessionRate >=
        0.8
        ? "high"
        : "moderate",

    confidence:
      evolution.confidence,

    score:
      clampScore(
        statistics.supersessionRate,
      ),

    title:
      "Recommendation 교체 비율이 높습니다.",

    description:
      "Recommendation이 충분히 실행되기 전에 다른 방향으로 대체되는 패턴인지 확인해야 합니다.",

    evidence: [
      createEvidence(
        "Resolved recommendation count",
        resolvedCount,
        [],
      ),
      createEvidence(
        "Superseded count",
        statistics.supersededCount,
        getComparisonIdsByType(
          evolution,
          "superseded",
        ),
      ),
      createEvidence(
        "Supersession rate",
        statistics.supersessionRate,
        getComparisonIdsByType(
          evolution,
          "superseded",
        ),
      ),
    ],

    relatedComparisonIds:
      getComparisonIdsByType(
        evolution,
        "superseded",
      ),
  });
}

/* ------------------------------------------------------------------ */
/* Confidence Trend                                                   */
/* ------------------------------------------------------------------ */

function deriveIncreasingConfidenceSignal(
  evolution:
    RecommendationEvolutionResult,
): RecommendationEvolutionIntelligenceSignalDraft | null {
  const pair =
    getLatestConfidencePair(
      evolution,
    );

  if (
    pair === null ||
    confidenceWeight(
      pair.current.confidence,
    ) <=
      confidenceWeight(
        pair.previous.confidence,
      )
  ) {
    return null;
  }

  const difference =
    confidenceWeight(
      pair.current.confidence,
    ) -
    confidenceWeight(
      pair.previous.confidence,
    );

  return createSignalDraft({
    type:
      "increasing-confidence",

    severity:
      "info",

    confidence:
      pair.current.confidence,

    score:
      clampScore(
        difference /
          2,
      ),

    title:
      "최근 Recommendation 변화 판단의 신뢰도가 높아지고 있습니다.",

    description:
      "최근 비교에서 사용할 수 있는 데이터와 변화 신호가 이전보다 더 분명해졌습니다.",

    evidence: [
      createEvidence(
        "Previous confidence",
        pair.previous.confidence,
        [
          pair.previous.id,
        ],
      ),
      createEvidence(
        "Current confidence",
        pair.current.confidence,
        [
          pair.current.id,
        ],
      ),
    ],

    relatedComparisonIds: [
      pair.previous.id,
      pair.current.id,
    ],
  });
}

function deriveDecreasingConfidenceSignal(
  evolution:
    RecommendationEvolutionResult,
): RecommendationEvolutionIntelligenceSignalDraft | null {
  const pair =
    getLatestConfidencePair(
      evolution,
    );

  if (
    pair === null ||
    confidenceWeight(
      pair.current.confidence,
    ) >=
      confidenceWeight(
        pair.previous.confidence,
      )
  ) {
    return null;
  }

  const difference =
    confidenceWeight(
      pair.previous.confidence,
    ) -
    confidenceWeight(
      pair.current.confidence,
    );

  return createSignalDraft({
    type:
      "decreasing-confidence",

    severity:
      pair.current.confidence ===
        "low"
        ? "moderate"
        : "low",

    confidence:
      evolution.confidence,

    score:
      clampScore(
        difference /
          2,
      ),

    title:
      "최근 Recommendation 변화 판단의 신뢰도가 낮아지고 있습니다.",

    description:
      "현재 흐름을 확정적으로 해석하기 전에 추가 관찰 데이터가 필요합니다.",

    evidence: [
      createEvidence(
        "Previous confidence",
        pair.previous.confidence,
        [
          pair.previous.id,
        ],
      ),
      createEvidence(
        "Current confidence",
        pair.current.confidence,
        [
          pair.current.id,
        ],
      ),
    ],

    relatedComparisonIds: [
      pair.previous.id,
      pair.current.id,
    ],
  });
}

/* ------------------------------------------------------------------ */
/* High Drift                                                         */
/* ------------------------------------------------------------------ */

function deriveHighDriftSignal(
  evolution:
    RecommendationEvolutionResult,
): RecommendationEvolutionIntelligenceSignalDraft | null {
  if (
    evolution.summary.drift !==
    "high"
  ) {
    return null;
  }

  return createSignalDraft({
    type:
      "high-drift",

    severity:
      "high",

    confidence:
      evolution.confidence,

    score:
      1,

    title:
      "Recommendation 흐름의 방향 편차가 높습니다.",

    description:
      "최근 Recommendation들이 하나의 연속된 방향으로 연결되는지 다시 확인할 필요가 있습니다.",

    evidence: [
      createEvidence(
        "Drift",
        evolution.summary.drift,
        getRedirectingComparisonIds(
          evolution,
        ),
      ),
      createEvidence(
        "Dominant direction",
        evolution.summary
          .dominantDirection ??
          "none",
        getComparableComparisonIds(
          evolution,
        ),
      ),
    ],

    relatedComparisonIds:
      getRedirectingComparisonIds(
        evolution,
      ),
  });
}

/* ------------------------------------------------------------------ */
/* Stable Direction                                                   */
/* ------------------------------------------------------------------ */

function deriveStableDirectionSignal(
  evolution:
    RecommendationEvolutionResult,
): RecommendationEvolutionIntelligenceSignalDraft | null {
  const {
    summary,
  } = evolution;

  if (
    !summary.hasSufficientHistory ||
    summary.dominantDirection !==
      "stable" ||
    (
      summary.drift !==
        "none" &&
      summary.drift !==
        "low"
    )
  ) {
    return null;
  }

  return createSignalDraft({
    type:
      "stable-direction",

    severity:
      "info",

    confidence:
      evolution.confidence,

    score:
      summary.drift ===
        "none"
        ? 1
        : 0.75,

    title:
      "Recommendation의 중심 방향이 유지되고 있습니다.",

    description:
      "Recommendation 표현이 달라지더라도 전체 흐름의 중심 방향은 안정적으로 이어지고 있습니다.",

    evidence: [
      createEvidence(
        "Dominant direction",
        summary.dominantDirection,
        getStableComparisonIds(
          evolution,
        ),
      ),
      createEvidence(
        "Drift",
        summary.drift,
        getComparableComparisonIds(
          evolution,
        ),
      ),
    ],

    relatedComparisonIds:
      getStableComparisonIds(
        evolution,
      ),
  });
}

/* ------------------------------------------------------------------ */
/* Observation Needed                                                 */
/* ------------------------------------------------------------------ */

function deriveObservationNeededSignal(
  evolution:
    RecommendationEvolutionResult,
  existingDrafts:
    readonly RecommendationEvolutionIntelligenceSignalDraft[],
): RecommendationEvolutionIntelligenceSignalDraft | null {
  const needsObservation =
    evolution.dataQuality !==
      "sufficient" ||
    evolution.confidence ===
      "low" ||
    !evolution.summary
      .hasSufficientHistory ||
    existingDrafts.some(
      (
        signal,
      ) =>
        signal.type ===
          "decreasing-confidence",
    );

  if (!needsObservation) {
    return null;
  }

  const score =
    clampScore(
      (
        evolution.dataQuality ===
          "insufficient"
          ? 0.4
          : evolution.dataQuality ===
              "partial"
            ? 0.25
            : 0
      ) +
      (
        evolution.confidence ===
          "low"
          ? 0.35
          : evolution.confidence ===
              "medium"
            ? 0.15
            : 0
      ) +
      (
        evolution.summary
          .hasSufficientHistory
          ? 0
          : 0.25
      ),
    );

  return createSignalDraft({
    type:
      "observation-needed",

    severity:
      evolution.dataQuality ===
        "insufficient" ||
      evolution.confidence ===
        "low"
        ? "moderate"
        : "low",

    confidence:
      normalizeObservationConfidence(
        evolution.confidence,
      ),

    score,

    title:
      "현재 Recommendation 흐름은 추가 관찰이 필요합니다.",

    description:
      "데이터 품질이나 비교 이력이 충분해질 때까지 강한 전략 변경보다 관찰과 확인을 우선해야 합니다.",

    evidence: [
      createEvidence(
        "Data quality",
        evolution.dataQuality,
        getComparableComparisonIds(
          evolution,
        ),
      ),
      createEvidence(
        "Result confidence",
        evolution.confidence,
        getComparableComparisonIds(
          evolution,
        ),
      ),
      createEvidence(
        "Has sufficient history",
        evolution.summary
          .hasSufficientHistory,
        getComparableComparisonIds(
          evolution,
        ),
      ),
    ],

    relatedComparisonIds:
      getComparableComparisonIds(
        evolution,
      ),
  });
}

/* ------------------------------------------------------------------ */
/* Signal Construction                                                */
/* ------------------------------------------------------------------ */

type CreateSignalDraftParams = {
  type:
    RecommendationEvolutionIntelligenceSignalType;

  severity:
    RecommendationEvolutionIntelligenceSignalSeverity;

  confidence:
    RecommendationEvolutionIntelligenceSignalConfidence;

  score:
    number;

  title:
    string;

  description:
    string;

  evidence:
    RecommendationEvolutionIntelligenceSignalEvidence[];

  relatedComparisonIds:
    string[];
};

function createSignalDraft(
  params:
    CreateSignalDraftParams,
): RecommendationEvolutionIntelligenceSignalDraft {
  assertNonEmptyString(
    params.title,
    `signal "${params.type}" title`,
  );

  assertNonEmptyString(
    params.description,
    `signal "${params.type}" description`,
  );

  const score =
    clampScore(
      params.score,
    );

  return {
    type:
      params.type,

    severity:
      params.severity,

    confidence:
      params.confidence,

    score,

    title:
      params.title,

    description:
      params.description,

    evidence:
      params.evidence.map(
        (
          evidence,
        ) => ({
          ...evidence,

          relatedComparisonIds:
            uniqueStrings(
              evidence
                .relatedComparisonIds,
            ),
        }),
      ),

    relatedComparisonIds:
      uniqueStrings(
        params.relatedComparisonIds,
      ),
  };
}

function createEvidence(
  label:
    string,
  value:
    string | number | boolean,
  relatedComparisonIds:
    string[],
): RecommendationEvolutionIntelligenceSignalEvidence {
  return {
    label,

    value,

    relatedComparisonIds:
      uniqueStrings(
        relatedComparisonIds,
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Primary Signal                                                     */
/* ------------------------------------------------------------------ */

function selectPrimarySignal(
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): RecommendationEvolutionIntelligenceSignal | null {
  let primary:
    RecommendationEvolutionIntelligenceSignal | null = null;

  for (const signal of signals) {
    if (
      primary === null ||
      compareSignalPriority(
        signal,
        primary,
      ) >
        0
    ) {
      primary =
        signal;
    }
  }

  return primary;
}

function compareSignalPriority(
  left:
    RecommendationEvolutionIntelligenceSignal,
  right:
    RecommendationEvolutionIntelligenceSignal,
): number {
  const severityDifference =
    severityWeight(
      left.severity,
    ) -
    severityWeight(
      right.severity,
    );

  if (
    severityDifference !==
    0
  ) {
    return severityDifference;
  }

  const scoreDifference =
    left.score -
    right.score;

  if (
    scoreDifference !==
    0
  ) {
    return scoreDifference;
  }

  return (
    confidenceWeight(
      left.confidence,
    ) -
    confidenceWeight(
      right.confidence,
    )
  );
}

function severityWeight(
  severity:
    RecommendationEvolutionIntelligenceSignalSeverity,
): number {
  switch (severity) {
    case "high":
      return 4;

    case "moderate":
      return 3;

    case "low":
      return 2;

    case "info":
      return 1;
  }
}

function confidenceWeight(
  confidence:
    RecommendationEvolutionConfidence,
): number {
  switch (confidence) {
    case "high":
      return 3;

    case "medium":
      return 2;

    case "low":
      return 1;
  }
}

/* ------------------------------------------------------------------ */
/* Comparison Helpers                                                 */
/* ------------------------------------------------------------------ */

function getComparableComparisons(
  evolution:
    RecommendationEvolutionResult,
): RecommendationLifecycleComparison[] {
  return evolution.comparisons.filter(
    (
      comparison,
    ) =>
      comparison.previous !==
      null,
  );
}

function getComparableComparisonIds(
  evolution:
    RecommendationEvolutionResult,
): string[] {
  return getComparableComparisons(
    evolution,
  ).map(
    (
      comparison,
    ) =>
      comparison.id,
  );
}

function getComparisonIdsByType(
  evolution:
    RecommendationEvolutionResult,
  type:
    RecommendationLifecycleComparison["type"],
): string[] {
  return getComparableComparisons(
    evolution,
  )
    .filter(
      (
        comparison,
      ) =>
        comparison.type ===
        type,
    )
    .map(
      (
        comparison,
      ) =>
        comparison.id,
    );
}

function getRedirectingComparisonIds(
  evolution:
    RecommendationEvolutionResult,
): string[] {
  return getComparableComparisons(
    evolution,
  )
    .filter(
      (
        comparison,
      ) =>
        comparison.type ===
          "redirected" ||
        comparison.direction ===
          "redirecting" ||
        comparison.type ===
          "superseded",
    )
    .map(
      (
        comparison,
      ) =>
        comparison.id,
    );
}

function getStableComparisonIds(
  evolution:
    RecommendationEvolutionResult,
): string[] {
  return getComparableComparisons(
    evolution,
  )
    .filter(
      (
        comparison,
      ) =>
        comparison.direction ===
          "stable" ||
        comparison.type ===
          "repeated",
    )
    .map(
      (
        comparison,
      ) =>
        comparison.id,
    );
}

function getLatestComparableComparisonId(
  evolution:
    RecommendationEvolutionResult,
): string[] {
  const comparisons =
    getComparableComparisons(
      evolution,
    );

  const latest =
    comparisons.length === 0
      ? undefined
      : comparisons[
          comparisons.length - 1
        ];

  return latest === undefined
    ? []
    : [
        latest.id,
      ];
}

type LatestConfidencePair = {
  previous:
    RecommendationLifecycleComparison;

  current:
    RecommendationLifecycleComparison;
};

function getLatestConfidencePair(
  evolution:
    RecommendationEvolutionResult,
): LatestConfidencePair | null {
  const comparisons =
    getComparableComparisons(
      evolution,
    );

  if (
    comparisons.length <
    2
  ) {
    return null;
  }

  const previous =
    comparisons[
      comparisons.length - 2
    ];

  const current =
    comparisons[
      comparisons.length - 1
    ];

  if (
    previous === undefined ||
    current === undefined
  ) {
    return null;
  }

  return {
    previous,
    current,
  };
}

/* ------------------------------------------------------------------ */
/* Collection Helpers                                                 */
/* ------------------------------------------------------------------ */

function getUniqueSignalTypes(
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): RecommendationEvolutionIntelligenceSignalType[] {
  const types =
    new Set<
      RecommendationEvolutionIntelligenceSignalType
    >();

  for (const signal of signals) {
    types.add(
      signal.type,
    );
  }

  return [
    ...types,
  ];
}

function uniqueStrings(
  values:
    readonly string[],
): string[] {
  return [
    ...new Set(
      values,
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* Numeric Helpers                                                    */
/* ------------------------------------------------------------------ */

function safeRatio(
  numerator:
    number,
  denominator:
    number,
): number {
  if (
    denominator <=
    0
  ) {
    return 0;
  }

  return clampScore(
    numerator /
      denominator,
  );
}

function clampScore(
  value:
    number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

function normalizeObservationConfidence(
  confidence:
    RecommendationEvolutionConfidence,
): RecommendationEvolutionIntelligenceSignalConfidence {
  if (
    confidence ===
    "high"
  ) {
    return "medium";
  }

  return confidence;
}

/* ------------------------------------------------------------------ */
/* Validation                                                         */
/* ------------------------------------------------------------------ */

function validateParams(
  params:
    DeriveRecommendationEvolutionSignalsParams,
): void {
  if (
    params === null ||
    typeof params !==
      "object"
  ) {
    throw new Error(
      "params must be a valid DeriveRecommendationEvolutionSignalsParams object.",
    );
  }

  validateEvolutionResult(
    params.evolution,
  );

  assertValidIsoTimestamp(
    params.detectedAt,
    "detectedAt",
  );

  if (
    typeof params.createSignalId !==
    "function"
  ) {
    throw new Error(
      "createSignalId must be a function.",
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

  assertRatio(
    evolution.statistics
      .completionRate,
    "evolution.statistics.completionRate",
  );

  assertRatio(
    evolution.statistics
      .supersessionRate,
    "evolution.statistics.supersessionRate",
  );

  assertRatio(
    evolution.statistics
      .repetitionRate,
    "evolution.statistics.repetitionRate",
  );

  assertNonNegativeInteger(
    evolution.statistics
      .transitionCount,
    "evolution.statistics.transitionCount",
  );

  assertNonNegativeInteger(
    evolution.statistics
      .comparableRecommendationCount,
    "evolution.statistics.comparableRecommendationCount",
  );

  assertNonNegativeInteger(
    evolution.statistics
      .completedCount,
    "evolution.statistics.completedCount",
  );

  assertNonNegativeInteger(
    evolution.statistics
      .supersededCount,
    "evolution.statistics.supersededCount",
  );

  assertNonNegativeInteger(
    evolution.statistics
      .repeatedTransitionCount,
    "evolution.statistics.repeatedTransitionCount",
  );

  assertNonNegativeInteger(
    evolution.statistics
      .refinedTransitionCount,
    "evolution.statistics.refinedTransitionCount",
  );

  assertNonNegativeInteger(
    evolution.statistics
      .redirectedTransitionCount,
    "evolution.statistics.redirectedTransitionCount",
  );

  assertNonNegativeInteger(
    evolution.statistics
      .completionAdvanceCount,
    "evolution.statistics.completionAdvanceCount",
  );
}

function assertUniqueSignalIds(
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): void {
  const ids =
    new Set<string>();

  for (const signal of signals) {
    if (
      ids.has(
        signal.id,
      )
    ) {
      throw new Error(
        `Duplicate Recommendation Evolution Intelligence signal ID "${signal.id}".`,
      );
    }

    ids.add(
      signal.id,
    );
  }
}

function assertRatio(
  value:
    number,
  fieldName:
    string,
): void {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    ) ||
    value < 0 ||
    value > 1
  ) {
    throw new Error(
      `${fieldName} must be a finite number between 0 and 1.`,
    );
  }
}

function assertNonNegativeInteger(
  value:
    number,
  fieldName:
    string,
): void {
  if (
    !Number.isInteger(
      value,
    ) ||
    value < 0
  ) {
    throw new Error(
      `${fieldName} must be a non-negative integer.`,
    );
  }
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