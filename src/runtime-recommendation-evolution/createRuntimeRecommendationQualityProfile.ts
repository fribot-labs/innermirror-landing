import type {
    CreateRuntimeRecommendationQualityProfileInput,
    RuntimeRecommendationHistoryFeatures,
    RuntimeRecommendationQualityConfidence,
    RuntimeRecommendationQualityOutcome,
    RuntimeRecommendationQualityPolicy,
    RuntimeRecommendationQualityProfile,
    RuntimeRecommendationQualitySignal,
} from "./runtimeRecommendationQualityTypes";

/* ------------------------------------------------------------------ */
/* Default Policy */
/* ------------------------------------------------------------------ */

/**
 * PR-046A Recommendation Quality Analysis에서 사용하는 기본 정책입니다.
 *
 * 이 정책은 Recommendation Candidate의 점수를 직접 변경하지 않습니다.
 * History Feature를 해석하여 confidence와 outcome을 결정할 때만 사용합니다.
 *
 * 실제 Adaptive Score 적용은 PR-046C의 책임입니다.
 */
export const DEFAULT_RUNTIME_RECOMMENDATION_QUALITY_POLICY:
  RuntimeRecommendationQualityPolicy = {
    minimumOccurrencesForDevelopingConfidence:
      3,

    minimumOccurrencesForEstablishedConfidence:
      6,

    effectiveCompletionRateThreshold:
      0.6,

    unstableSupersededRateThreshold:
      0.5,

    unresolvedRateThreshold:
      0.5,

    repeatedOccurrenceThreshold:
      2,

    visitedWithoutCompletionThreshold:
      2,
  };

/* ------------------------------------------------------------------ */
/* Public Builder */
/* ------------------------------------------------------------------ */

/**
 * 정규화된 Recommendation History Feature를
 * 하나의 Quality Profile로 변환합니다.
 *
 * 이 함수는 다음 작업만 수행합니다.
 *
 * History Features
 * ↓
 * Confidence
 * ↓
 * Outcome
 * ↓
 * Quality Signals
 * ↓
 * Quality Profile
 *
 * 이 함수는 다음 작업을 수행하지 않습니다.
 *
 * - Recommendation Candidate 점수 변경
 * - Recommendation 선택
 * - Recommendation 안정화
 * - RuntimeNextAction 교체
 * - 사용자 능력 평가
 */
export function createRuntimeRecommendationQualityProfile({
  features,
  policy,
  evaluatedAt,
}: CreateRuntimeRecommendationQualityProfileInput):
  RuntimeRecommendationQualityProfile {
  const normalizedPolicy =
    normalizeRuntimeRecommendationQualityPolicy(
      policy
    );

  const normalizedEvaluatedAt =
    normalizeEvaluatedAt(
      evaluatedAt
    );

  const confidence =
    resolveRuntimeRecommendationQualityConfidence({
      features,

      policy:
        normalizedPolicy,
    });

  const outcome =
    resolveRuntimeRecommendationQualityOutcome({
      features,

      policy:
        normalizedPolicy,

      confidence,
    });

  const signals =
    createRuntimeRecommendationQualitySignals({
      features,

      policy:
        normalizedPolicy,

      confidence,

      outcome,
    });

  return {
    identity:
      features.identity,

    features,

    confidence,

    outcome,

    signals,

    evaluatedAt:
      normalizedEvaluatedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Convenience Builder */
/* ------------------------------------------------------------------ */

/**
 * 기본 Quality Policy를 사용하는 간단한 Builder입니다.
 *
 * 테스트나 초기 PR-046A 통합에서 사용할 수 있습니다.
 */
export function createRuntimeRecommendationQualityProfileWithDefaults(
  features:
    RuntimeRecommendationHistoryFeatures,
  evaluatedAt:
    string = new Date().toISOString()
): RuntimeRecommendationQualityProfile {
  return createRuntimeRecommendationQualityProfile({
    features,

    policy:
      DEFAULT_RUNTIME_RECOMMENDATION_QUALITY_POLICY,

    evaluatedAt,
  });
}

/* ------------------------------------------------------------------ */
/* Confidence Resolution */
/* ------------------------------------------------------------------ */

type ResolveRuntimeRecommendationQualityConfidenceParams = {
  features:
    RuntimeRecommendationHistoryFeatures;

  policy:
    RuntimeRecommendationQualityPolicy;
};

/**
 * Confidence는 Recommendation의 품질 자체가 아니라,
 * 현재 품질 판단에 사용할 수 있는 History 데이터의 충분성을 나타냅니다.
 *
 * 예:
 *
 * totalOccurrences = 1
 * → unknown
 *
 * totalOccurrences = 2
 * → low
 *
 * totalOccurrences = 3~5
 * → developing
 *
 * totalOccurrences >= 6
 * → established
 */
function resolveRuntimeRecommendationQualityConfidence({
  features,
  policy,
}: ResolveRuntimeRecommendationQualityConfidenceParams):
  RuntimeRecommendationQualityConfidence {
  const totalOccurrences =
    normalizeNonNegativeInteger(
      features.counts.totalOccurrences
    );

  if (
    totalOccurrences <= 0
  ) {
    return "unknown";
  }

  if (
    totalOccurrences <
    policy.minimumOccurrencesForDevelopingConfidence
  ) {
    return totalOccurrences === 1
      ? "unknown"
      : "low";
  }

  if (
    totalOccurrences <
    policy.minimumOccurrencesForEstablishedConfidence
  ) {
    return "developing";
  }

  return "established";
}

/* ------------------------------------------------------------------ */
/* Outcome Resolution */
/* ------------------------------------------------------------------ */

type ResolveRuntimeRecommendationQualityOutcomeParams = {
  features:
    RuntimeRecommendationHistoryFeatures;

  policy:
    RuntimeRecommendationQualityPolicy;

  confidence:
    RuntimeRecommendationQualityConfidence;
};

/**
 * Recommendation History Feature를 종합하여
 * 현재까지의 Recommendation 결과 패턴을 분류합니다.
 *
 * 우선순위는 다음과 같습니다.
 *
 * 1. History 부족
 * 2. Unresolved
 * 3. Unstable
 * 4. Effective
 * 5. Mixed
 *
 * unresolved와 unstable을 effective보다 먼저 판단하는 이유는,
 * 일부 완료가 존재하더라도 반복적 미해결 또는 빈번한 교체가
 * Recommendation의 실행 가능성을 훼손할 수 있기 때문입니다.
 */
function resolveRuntimeRecommendationQualityOutcome({
  features,
  policy,
  confidence,
}: ResolveRuntimeRecommendationQualityOutcomeParams):
  RuntimeRecommendationQualityOutcome {
  const totalOccurrences =
    normalizeNonNegativeInteger(
      features.counts.totalOccurrences
    );

  if (
    totalOccurrences === 0 ||
    confidence === "unknown" ||
    confidence === "low"
  ) {
    return "insufficient-history";
  }

  if (
    isUnresolvedRecommendationPattern({
      features,

      policy,
    })
  ) {
    return "unresolved";
  }

  if (
    isUnstableRecommendationPattern({
      features,

      policy,
    })
  ) {
    return "unstable";
  }

  if (
    isEffectiveRecommendationPattern({
      features,

      policy,
    })
  ) {
    return "effective";
  }

  return "mixed";
}

/* ------------------------------------------------------------------ */
/* Outcome Pattern: Unresolved */
/* ------------------------------------------------------------------ */

type RuntimeRecommendationPatternParams = {
  features:
    RuntimeRecommendationHistoryFeatures;

  policy:
    RuntimeRecommendationQualityPolicy;
};

/**
 * 동일 Recommendation이 반복되거나,
 * unresolved 상태가 의미 있는 비율로 누적된 경우입니다.
 *
 * 단순히 active Entry가 존재한다는 이유만으로 unresolved로 판단하지 않습니다.
 * 현재 Recommendation이 active인 것은 정상적인 실행 상태일 수 있습니다.
 */
function isUnresolvedRecommendationPattern({
  features,
  policy,
}: RuntimeRecommendationPatternParams):
  boolean {
  const {
    counts,
    rates,
    latest,
  } = features;

  const unresolvedThresholdReached =
    counts.unresolvedCount > 0 &&
    rates.unresolvedRate >=
      policy.unresolvedRateThreshold;

  const repeatedWithoutCompletion =
    counts.repeatedCount >=
      policy.repeatedOccurrenceThreshold &&
    counts.completedCount === 0;

  const latestExplicitlyUnresolved =
    latest.resolutionState ===
      "unresolved" &&
    counts.totalOccurrences >=
      policy.minimumOccurrencesForDevelopingConfidence;

  return (
    unresolvedThresholdReached ||
    repeatedWithoutCompletion ||
    latestExplicitlyUnresolved
  );
}

/* ------------------------------------------------------------------ */
/* Outcome Pattern: Unstable */
/* ------------------------------------------------------------------ */

/**
 * Recommendation이 완료되기 전에 자주 교체되었거나,
 * 교체가 완료보다 지배적인 경우입니다.
 */
function isUnstableRecommendationPattern({
  features,
  policy,
}: RuntimeRecommendationPatternParams):
  boolean {
  const {
    counts,
    rates,
  } = features;

  const supersededThresholdReached =
    counts.supersededCount > 0 &&
    rates.supersededRate >=
      policy.unstableSupersededRateThreshold;

  const supersededDominatesCompletion =
    counts.supersededCount >= 2 &&
    counts.supersededCount >
      counts.completedCount;

  const repeatedAndFrequentlySuperseded =
    counts.repeatedCount >=
      policy.repeatedOccurrenceThreshold &&
    counts.supersededCount >= 2 &&
    rates.supersededRate >= 0.4;

  return (
    supersededThresholdReached ||
    supersededDominatesCompletion ||
    repeatedAndFrequentlySuperseded
  );
}

/* ------------------------------------------------------------------ */
/* Outcome Pattern: Effective */
/* ------------------------------------------------------------------ */

/**
 * 충분한 History에서 의미 있는 완료율이 관찰되고,
 * unresolved 또는 superseded 패턴이 지배적이지 않은 경우입니다.
 *
 * Navigation Rate는 보조 신호로만 사용합니다.
 * 사용자가 추천 위치를 방문하지 않고도 관련 작업을 완료할 수 있기 때문입니다.
 */
function isEffectiveRecommendationPattern({
  features,
  policy,
}: RuntimeRecommendationPatternParams):
  boolean {
  const {
    counts,
    rates,
  } = features;

  const completionThresholdReached =
    counts.completedCount > 0 &&
    rates.completionRate >=
      policy.effectiveCompletionRateThreshold;

  const completionDominatesReplacement =
    counts.completedCount >
      counts.supersededCount;

  const unresolvedIsLimited =
    rates.unresolvedRate <
      policy.unresolvedRateThreshold;

  return (
    completionThresholdReached &&
    completionDominatesReplacement &&
    unresolvedIsLimited
  );
}

/* ------------------------------------------------------------------ */
/* Quality Signal Builder */
/* ------------------------------------------------------------------ */

type CreateRuntimeRecommendationQualitySignalsParams = {
  features:
    RuntimeRecommendationHistoryFeatures;

  policy:
    RuntimeRecommendationQualityPolicy;

  confidence:
    RuntimeRecommendationQualityConfidence;

  outcome:
    RuntimeRecommendationQualityOutcome;
};

/**
 * Quality Profile의 판단 근거를 구조화된 Signal 목록으로 생성합니다.
 *
 * 실제 구현은 Part 2에서 이어집니다.
 */
function createRuntimeRecommendationQualitySignals({
  features,
  policy,
  confidence,
  outcome,
}: CreateRuntimeRecommendationQualitySignalsParams):
  RuntimeRecommendationQualitySignal[] {
  const signals:
    RuntimeRecommendationQualitySignal[] = [];

  appendHistorySufficiencySignals({
    signals,

    features,

    confidence,
  });

  appendCompletionSignals({
    signals,

    features,

    policy,
  });

  appendNavigationSignals({
    signals,

    features,

    policy,
  });

  appendSupersededSignals({
    signals,

    features,

    policy,
  });

  appendRepetitionSignals({
    signals,

    features,

    policy,
  });

  appendUnresolvedSignals({
    signals,

    features,

    policy,
  });

  appendOutcomeSignal({
    signals,

    features,

    outcome,
  });

  return deduplicateAndSortQualitySignals(
    signals
  );
}

/* ------------------------------------------------------------------ */
/* Signal Builder Shared Types */
/* ------------------------------------------------------------------ */

type AppendQualitySignalsBaseParams = {
  signals:
    RuntimeRecommendationQualitySignal[];

  features:
    RuntimeRecommendationHistoryFeatures;
};

type AppendQualitySignalsWithPolicyParams =
  AppendQualitySignalsBaseParams & {
    policy:
      RuntimeRecommendationQualityPolicy;
  };

type AppendHistorySufficiencySignalsParams =
  AppendQualitySignalsBaseParams & {
    confidence:
      RuntimeRecommendationQualityConfidence;
  };

type AppendOutcomeSignalParams =
  AppendQualitySignalsBaseParams & {
    outcome:
      RuntimeRecommendationQualityOutcome;
  };

/* ------------------------------------------------------------------ */
/* History Sufficiency Signals */
/* ------------------------------------------------------------------ */

/**
 * History 데이터의 충분성과 현재 Confidence 수준을 나타내는
 * Signal을 추가합니다.
 *
 * 이 Signal은 Recommendation 품질의 긍정 또는 부정 평가가 아니라,
 * 현재 판단을 얼마나 신뢰할 수 있는지를 설명합니다.
 */
function appendHistorySufficiencySignals({
  signals,
  features,
  confidence,
}: AppendHistorySufficiencySignalsParams):
  void {
  const totalOccurrences =
    normalizeNonNegativeInteger(
      features.counts.totalOccurrences
    );

  if (
    confidence === "unknown" ||
    confidence === "low"
  ) {
    const strength =
      totalOccurrences <= 0
        ? 1
        : clampUnit(
            1 -
            totalOccurrences /
              Math.max(
                1,
                DEFAULT_RUNTIME_RECOMMENDATION_QUALITY_POLICY
                  .minimumOccurrencesForDevelopingConfidence
              )
          );

    signals.push({
      type:
        "insufficient-occurrences",

      strength,

      description:
        totalOccurrences === 0
          ? "No recommendation history occurrences are available for this fingerprint."
          : `Only ${totalOccurrences} recommendation occurrence${
              totalOccurrences === 1
                ? ""
                : "s"
            } ${
              totalOccurrences === 1
                ? "is"
                : "are"
            } available, so the quality outcome remains provisional.`,
    });

    return;
  }

  signals.push({
    type:
      "stable-outcome",

    strength:
      confidence === "established"
        ? 1
        : 0.65,

    description:
      confidence === "established"
        ? `The quality profile is supported by ${totalOccurrences} recommendation occurrences.`
        : `The quality profile is developing from ${totalOccurrences} recommendation occurrences.`,
  });
}

/* ------------------------------------------------------------------ */
/* Completion Signals */
/* ------------------------------------------------------------------ */

/**
 * 완료 횟수와 완료율에 관한 Signal을 추가합니다.
 */
function appendCompletionSignals({
  signals,
  features,
  policy,
}: AppendQualitySignalsWithPolicyParams):
  void {
  const {
    counts,
    rates,
  } = features;

  const completedCount =
    normalizeNonNegativeInteger(
      counts.completedCount
    );

  const totalOccurrences =
    normalizeNonNegativeInteger(
      counts.totalOccurrences
    );

  const completionRate =
    clampUnit(
      rates.completionRate
    );

  if (
    completedCount > 0
  ) {
    signals.push({
      type:
        "completion-observed",

      strength:
        clampUnit(
          completedCount /
            Math.max(
              1,
              totalOccurrences
            )
        ),

      description:
        `${completedCount} of ${totalOccurrences} recommendation occurrence${
          totalOccurrences === 1
            ? ""
            : "s"
        } ${
          completedCount === 1
            ? "was"
            : "were"
        } completed through observed project-state change.`,
    });
  }

  if (
    totalOccurrences <
    policy.minimumOccurrencesForDevelopingConfidence
  ) {
    return;
  }

  if (
    completionRate >=
    policy.effectiveCompletionRateThreshold
  ) {
    signals.push({
      type:
        "high-completion-rate",

      strength:
        normalizeThresholdStrength({
          value:
            completionRate,

          threshold:
            policy.effectiveCompletionRateThreshold,
        }),

      description:
        `The completion rate is ${formatPercentage(
          completionRate
        )}, meeting the effective-outcome threshold of ${formatPercentage(
          policy.effectiveCompletionRateThreshold
        )}.`,
    });

    return;
  }

  if (
    completedCount === 0
  ) {
    signals.push({
      type:
        "low-completion-rate",

      strength:
        1,

      description:
        `No completed occurrence has been observed across ${totalOccurrences} recommendation occurrences.`,
    });

    return;
  }

  const completionDeficit =
    Math.max(
      0,
      policy.effectiveCompletionRateThreshold -
        completionRate
    );

  signals.push({
    type:
      "low-completion-rate",

    strength:
      clampUnit(
        completionDeficit /
          Math.max(
            policy.effectiveCompletionRateThreshold,
            Number.EPSILON
          )
      ),

    description:
      `The completion rate is ${formatPercentage(
        completionRate
      )}, below the effective-outcome threshold of ${formatPercentage(
        policy.effectiveCompletionRateThreshold
      )}.`,
  });
}

/* ------------------------------------------------------------------ */
/* Navigation Signals */
/* ------------------------------------------------------------------ */

/**
 * Recommendation 위치 방문 여부와 방문 후 완료되지 않은 패턴을
 * Signal로 추가합니다.
 *
 * Navigation은 완료와 동일하게 취급하지 않습니다.
 */
function appendNavigationSignals({
  signals,
  features,
  policy,
}: AppendQualitySignalsWithPolicyParams):
  void {
  const {
    counts,
    rates,
  } = features;

  const visitedOccurrenceCount =
    normalizeNonNegativeInteger(
      counts.visitedOccurrenceCount
    );

  const totalNavigationCount =
    normalizeNonNegativeInteger(
      counts.totalNavigationCount
    );

  const completedCount =
    normalizeNonNegativeInteger(
      counts.completedCount
    );

  const totalOccurrences =
    normalizeNonNegativeInteger(
      counts.totalOccurrences
    );

  const navigationRate =
    clampUnit(
      rates.navigationRate
    );

  if (
    visitedOccurrenceCount > 0
  ) {
    signals.push({
      type:
        "navigation-observed",

      strength:
        navigationRate,

      description:
        `${visitedOccurrenceCount} of ${totalOccurrences} recommendation occurrence${
          totalOccurrences === 1
            ? ""
            : "s"
        } received at least one navigation event, with ${totalNavigationCount} total visit${
          totalNavigationCount === 1
            ? ""
            : "s"
        }.`,
    });
  }

  const visitedWithoutCompletionCount =
    Math.max(
      0,
      visitedOccurrenceCount -
        Math.min(
          visitedOccurrenceCount,
          completedCount
        )
    );

  const threshold =
    Math.max(
      1,
      normalizeNonNegativeInteger(
        policy.visitedWithoutCompletionThreshold
      )
    );

  if (
    visitedWithoutCompletionCount <
    threshold
  ) {
    return;
  }

  signals.push({
    type:
      "visited-without-completion",

    strength:
      clampUnit(
        visitedWithoutCompletionCount /
          Math.max(
            1,
            visitedOccurrenceCount
          )
      ),

    description:
      `${visitedWithoutCompletionCount} visited recommendation occurrence${
        visitedWithoutCompletionCount === 1
          ? ""
          : "s"
      } did not produce confirmed completion evidence.`,
  });
}

/* ------------------------------------------------------------------ */
/* Superseded Signals */
/* ------------------------------------------------------------------ */

/**
 * Recommendation이 완료되기 전에 교체된 패턴을 Signal로 추가합니다.
 */
function appendSupersededSignals({
  signals,
  features,
  policy,
}: AppendQualitySignalsWithPolicyParams):
  void {
  const {
    counts,
    rates,
  } = features;

  const supersededCount =
    normalizeNonNegativeInteger(
      counts.supersededCount
    );

  const completedCount =
    normalizeNonNegativeInteger(
      counts.completedCount
    );

  const totalOccurrences =
    normalizeNonNegativeInteger(
      counts.totalOccurrences
    );

  const supersededRate =
    clampUnit(
      rates.supersededRate
    );

  if (
    supersededCount <= 0
  ) {
    return;
  }

  const thresholdReached =
    supersededRate >=
    policy.unstableSupersededRateThreshold;

  const replacementDominates =
    supersededCount >
      completedCount;

  if (
    !thresholdReached &&
    !replacementDominates
  ) {
    return;
  }

  const thresholdStrength =
    normalizeThresholdStrength({
      value:
        supersededRate,

      threshold:
        policy.unstableSupersededRateThreshold,
    });

  const dominanceStrength =
    replacementDominates
      ? clampUnit(
          (
            supersededCount -
            completedCount
          ) /
            Math.max(
              1,
              totalOccurrences
            )
        )
      : 0;

  signals.push({
    type:
      "frequently-superseded",

    strength:
      Math.max(
        thresholdStrength,
        dominanceStrength
      ),

    description:
      `${supersededCount} of ${totalOccurrences} recommendation occurrence${
        totalOccurrences === 1
          ? ""
          : "s"
      } ${
        supersededCount === 1
          ? "was"
          : "were"
      } replaced before completion. The superseded rate is ${formatPercentage(
        supersededRate
      )}.`,
  });
}

/* ------------------------------------------------------------------ */
/* Repetition Signals */
/* ------------------------------------------------------------------ */

/**
 * 동일 Recommendation이 다시 등장한 패턴을 Signal로 추가합니다.
 */
function appendRepetitionSignals({
  signals,
  features,
  policy,
}: AppendQualitySignalsWithPolicyParams):
  void {
  const {
    counts,
    rates,
    latest,
  } = features;

  const repeatedCount =
    normalizeNonNegativeInteger(
      counts.repeatedCount
    );

  const repetitionRate =
    clampUnit(
      rates.repetitionRate
    );

  const threshold =
    Math.max(
      1,
      normalizeNonNegativeInteger(
        policy.repeatedOccurrenceThreshold
      )
    );

  const latestIsRepeated =
    latest.resolutionState ===
      "repeated";

  if (
    repeatedCount <= 0 &&
    !latestIsRepeated
  ) {
    return;
  }

  if (
    repeatedCount <
      threshold &&
    !latestIsRepeated
  ) {
    return;
  }

  const countStrength =
    clampUnit(
      repeatedCount /
        threshold
    );

  signals.push({
    type:
      "repeated-recommendation",

    strength:
      Math.max(
        countStrength,
        repetitionRate,
        latestIsRepeated
          ? 0.5
          : 0
      ),

    description:
      latestIsRepeated
        ? `The latest recommendation occurrence is marked as repeated. ${repeatedCount} repeated occurrence${
            repeatedCount === 1
              ? ""
              : "s"
          } ${
            repeatedCount === 1
              ? "has"
              : "have"
          } been observed in total.`
        : `${repeatedCount} repeated recommendation occurrence${
            repeatedCount === 1
              ? ""
              : "s"
          } ${
            repeatedCount === 1
              ? "has"
              : "have"
          } been observed, representing ${formatPercentage(
            repetitionRate
          )} of the history.`,
  });
}

/* ------------------------------------------------------------------ */
/* Unresolved Signals */
/* ------------------------------------------------------------------ */

/**
 * 명시적 unresolved 상태 또는 반복되었지만 완료되지 않은 패턴을
 * Signal로 추가합니다.
 */
function appendUnresolvedSignals({
  signals,
  features,
  policy,
}: AppendQualitySignalsWithPolicyParams):
  void {
  const {
    counts,
    rates,
    latest,
  } = features;

  const unresolvedCount =
    normalizeNonNegativeInteger(
      counts.unresolvedCount
    );

  const repeatedCount =
    normalizeNonNegativeInteger(
      counts.repeatedCount
    );

  const completedCount =
    normalizeNonNegativeInteger(
      counts.completedCount
    );

  const totalOccurrences =
    normalizeNonNegativeInteger(
      counts.totalOccurrences
    );

  const unresolvedRate =
    clampUnit(
      rates.unresolvedRate
    );

  const explicitlyUnresolved =
    unresolvedCount > 0 &&
    unresolvedRate >=
      policy.unresolvedRateThreshold;

  const repeatedWithoutCompletion =
    repeatedCount >=
      policy.repeatedOccurrenceThreshold &&
    completedCount === 0;

  const latestIsUnresolved =
    latest.resolutionState ===
      "unresolved";

  if (
    !explicitlyUnresolved &&
    !repeatedWithoutCompletion &&
    !latestIsUnresolved
  ) {
    return;
  }

  const explicitStrength =
    explicitlyUnresolved
      ? normalizeThresholdStrength({
          value:
            unresolvedRate,

          threshold:
            policy.unresolvedRateThreshold,
        })
      : 0;

  const repetitionStrength =
    repeatedWithoutCompletion
      ? clampUnit(
          repeatedCount /
            Math.max(
              1,
              policy.repeatedOccurrenceThreshold
            )
        )
      : 0;

  const latestStrength =
    latestIsUnresolved
      ? 0.75
      : 0;

  signals.push({
    type:
      "unresolved-recommendation",

    strength:
      Math.max(
        explicitStrength,
        repetitionStrength,
        latestStrength
      ),

    description:
      createUnresolvedSignalDescription({
        totalOccurrences,

        unresolvedCount,

        unresolvedRate,

        repeatedCount,

        completedCount,

        latestIsUnresolved,
      }),
  });
}

/* ------------------------------------------------------------------ */
/* Outcome Signal */
/* ------------------------------------------------------------------ */

/**
 * 최종 Quality Outcome을 요약하는 Signal을 추가합니다.
 *
 * 앞의 세부 Signal과 달리 Profile 전체의 해석을 나타냅니다.
 */
function appendOutcomeSignal({
  signals,
  features,
  outcome,
}: AppendOutcomeSignalParams):
  void {
  const {
    counts,
    rates,
  } = features;

  switch (outcome) {
    case "insufficient-history":
      /**
       * insufficient-occurrences Signal이 이미 같은 의미를
       * 제공하므로 별도 mixed Signal을 추가하지 않습니다.
       */
      return;

    case "effective":
      signals.push({
        type:
          "stable-outcome",

        strength:
          clampUnit(
            Math.max(
              rates.completionRate,
              0.6
            )
          ),

        description:
          `The recommendation history currently shows an effective outcome pattern, with ${counts.completedCount} completed occurrence${
            counts.completedCount === 1
              ? ""
              : "s"
          } and a completion rate of ${formatPercentage(
            rates.completionRate
          )}.`,
      });
      return;

    case "unstable":
      signals.push({
        type:
          "mixed-outcome",

        strength:
          clampUnit(
            Math.max(
              rates.supersededRate,
              0.6
            )
          ),

        description:
          `The recommendation history currently shows an unstable pattern because replacement before completion is significant.`,
      });
      return;

    case "unresolved":
      /**
       * unresolved-recommendation Signal이 이미 구체적인 원인을
       * 제공하므로 중복된 unresolved Signal을 추가하지 않습니다.
       */
      return;

    case "mixed":
      signals.push({
        type:
          "mixed-outcome",

        strength:
          resolveMixedOutcomeStrength(
            features
          ),

        description:
          `The recommendation history contains both positive and negative outcome signals without one pattern clearly dominating.`,
      });
      return;
  }
}

/* ------------------------------------------------------------------ */
/* Signal Description Helpers */
/* ------------------------------------------------------------------ */

type CreateUnresolvedSignalDescriptionParams = {
  totalOccurrences:
    number;

  unresolvedCount:
    number;

  unresolvedRate:
    number;

  repeatedCount:
    number;

  completedCount:
    number;

  latestIsUnresolved:
    boolean;
};

function createUnresolvedSignalDescription({
  totalOccurrences,
  unresolvedCount,
  unresolvedRate,
  repeatedCount,
  completedCount,
  latestIsUnresolved,
}: CreateUnresolvedSignalDescriptionParams):
  string {
  const descriptions:
    string[] = [];

  if (
    unresolvedCount > 0
  ) {
    descriptions.push(
      `${unresolvedCount} of ${totalOccurrences} occurrence${
        totalOccurrences === 1
          ? ""
          : "s"
      } ${
        unresolvedCount === 1
          ? "is"
          : "are"
      } explicitly unresolved (${formatPercentage(
        unresolvedRate
      )}).`
    );
  }

  if (
    repeatedCount > 0 &&
    completedCount === 0
  ) {
    descriptions.push(
      `The recommendation repeated ${repeatedCount} time${
        repeatedCount === 1
          ? ""
          : "s"
      } without confirmed completion.`
    );
  }

  if (
    latestIsUnresolved
  ) {
    descriptions.push(
      "The latest occurrence remains unresolved."
    );
  }

  if (
    descriptions.length === 0
  ) {
    return "The recommendation history contains an unresolved outcome pattern.";
  }

  return descriptions.join(
    " "
  );
}

/* ------------------------------------------------------------------ */
/* Mixed Outcome Strength */
/* ------------------------------------------------------------------ */

/**
 * mixed outcome의 강도는 완료, 교체, 반복, 미해결 비율 중
 * 서로 경쟁하는 신호가 얼마나 존재하는지를 근사합니다.
 */
function resolveMixedOutcomeStrength(
  features:
    RuntimeRecommendationHistoryFeatures
): number {
  const {
    completionRate,
    supersededRate,
    repetitionRate,
    unresolvedRate,
  } = features.rates;

  const positiveStrength =
    clampUnit(
      completionRate
    );

  const negativeStrength =
    clampUnit(
      Math.max(
        supersededRate,
        repetitionRate,
        unresolvedRate
      )
    );

  if (
    positiveStrength === 0 &&
    negativeStrength === 0
  ) {
    return 0.25;
  }

  const balance =
    1 -
    Math.abs(
      positiveStrength -
      negativeStrength
    );

  return clampUnit(
    Math.max(
      0.35,
      balance
    )
  );
}

/* ------------------------------------------------------------------ */
/* Signal Deduplication and Ordering */
/* ------------------------------------------------------------------ */

/**
 * 동일한 type의 Signal이 여러 경로에서 생성된 경우
 * 가장 강한 Signal 하나만 유지합니다.
 *
 * 같은 strength라면 더 구체적인 설명을 보존하기 위해
 * description 길이가 긴 Signal을 우선합니다.
 */
function deduplicateAndSortQualitySignals(
  signals:
    RuntimeRecommendationQualitySignal[]
): RuntimeRecommendationQualitySignal[] {
  const signalMap =
    new Map<
      RuntimeRecommendationQualitySignal["type"],
      RuntimeRecommendationQualitySignal
    >();

  for (const signal of signals) {
    const normalizedSignal =
      normalizeQualitySignal(
        signal
      );

    const existingSignal =
      signalMap.get(
        normalizedSignal.type
      );

    if (
      existingSignal === undefined
    ) {
      signalMap.set(
        normalizedSignal.type,
        normalizedSignal
      );

      continue;
    }

    if (
      shouldReplaceExistingSignal({
        existing:
          existingSignal,

        challenger:
          normalizedSignal,
      })
    ) {
      signalMap.set(
        normalizedSignal.type,
        normalizedSignal
      );
    }
  }

  return Array.from(
    signalMap.values()
  ).sort(
    compareQualitySignals
  );
}

type ShouldReplaceExistingSignalParams = {
  existing:
    RuntimeRecommendationQualitySignal;

  challenger:
    RuntimeRecommendationQualitySignal;
};

function shouldReplaceExistingSignal({
  existing,
  challenger,
}: ShouldReplaceExistingSignalParams):
  boolean {
  if (
    challenger.strength >
    existing.strength
  ) {
    return true;
  }

  if (
    challenger.strength <
    existing.strength
  ) {
    return false;
  }

  return (
    challenger.description.length >
    existing.description.length
  );
}

function normalizeQualitySignal(
  signal:
    RuntimeRecommendationQualitySignal
): RuntimeRecommendationQualitySignal {
  return {
    type:
      signal.type,

    strength:
      roundNumber(
        clampUnit(
          signal.strength
        ),
        4
      ),

    description:
      normalizeDescription(
        signal.description
      ),
  };
}

/**
 * Signal은 사용자 UI가 아니라 Diagnostics를 위한 값이지만,
 * 출력 순서를 안정적으로 유지해야 테스트와 비교가 쉬워집니다.
 *
 * 우선순위:
 *
 * 1. History 부족
 * 2. 미해결
 * 3. 빈번한 교체
 * 4. 반복
 * 5. 방문 후 미완료
 * 6. 낮은 완료율
 * 7. 높은 완료율
 * 8. 완료 관찰
 * 9. Navigation 관찰
 * 10. Outcome 요약
 */
function compareQualitySignals(
  left:
    RuntimeRecommendationQualitySignal,
  right:
    RuntimeRecommendationQualitySignal
): number {
  const leftPriority =
    resolveQualitySignalPriority(
      left.type
    );

  const rightPriority =
    resolveQualitySignalPriority(
      right.type
    );

  if (
    leftPriority !==
    rightPriority
  ) {
    return (
      leftPriority -
      rightPriority
    );
  }

  if (
    left.strength !==
    right.strength
  ) {
    return (
      right.strength -
      left.strength
    );
  }

  return left.type.localeCompare(
    right.type
  );
}

function resolveQualitySignalPriority(
  type:
    RuntimeRecommendationQualitySignal["type"]
): number {
  switch (type) {
    case "insufficient-occurrences":
      return 10;

    case "unresolved-recommendation":
      return 20;

    case "frequently-superseded":
      return 30;

    case "repeated-recommendation":
      return 40;

    case "visited-without-completion":
      return 50;

    case "low-completion-rate":
      return 60;

    case "high-completion-rate":
      return 70;

    case "completion-observed":
      return 80;

    case "navigation-observed":
      return 90;

    case "mixed-outcome":
      return 100;

    case "stable-outcome":
      return 110;
  }
}

/* ------------------------------------------------------------------ */
/* Policy Normalization */
/* ------------------------------------------------------------------ */

/**
 * 외부에서 전달된 Quality Policy를 안전한 범위로 정규화합니다.
 *
 * 정책 객체가 유효하지 않더라도 Builder가 NaN 또는 잘못된 비교값을
 * 생성하지 않도록 모든 항목에 fallback을 적용합니다.
 */
function normalizeRuntimeRecommendationQualityPolicy(
  policy:
    RuntimeRecommendationQualityPolicy
): RuntimeRecommendationQualityPolicy {
  const developingMinimum =
    normalizePositiveInteger(
      policy
        .minimumOccurrencesForDevelopingConfidence,
      DEFAULT_RUNTIME_RECOMMENDATION_QUALITY_POLICY
        .minimumOccurrencesForDevelopingConfidence
    );

  const establishedMinimumCandidate =
    normalizePositiveInteger(
      policy
        .minimumOccurrencesForEstablishedConfidence,
      DEFAULT_RUNTIME_RECOMMENDATION_QUALITY_POLICY
        .minimumOccurrencesForEstablishedConfidence
    );

  /**
   * established threshold는 developing threshold보다
   * 반드시 커야 합니다.
   */
  const establishedMinimum =
    Math.max(
      developingMinimum + 1,
      establishedMinimumCandidate
    );

  return {
    minimumOccurrencesForDevelopingConfidence:
      developingMinimum,

    minimumOccurrencesForEstablishedConfidence:
      establishedMinimum,

    effectiveCompletionRateThreshold:
      normalizePolicyRate({
        value:
          policy
            .effectiveCompletionRateThreshold,

        fallback:
          DEFAULT_RUNTIME_RECOMMENDATION_QUALITY_POLICY
            .effectiveCompletionRateThreshold,

        minimum:
          0.01,

        maximum:
          1,
      }),

    unstableSupersededRateThreshold:
      normalizePolicyRate({
        value:
          policy
            .unstableSupersededRateThreshold,

        fallback:
          DEFAULT_RUNTIME_RECOMMENDATION_QUALITY_POLICY
            .unstableSupersededRateThreshold,

        minimum:
          0.01,

        maximum:
          1,
      }),

    unresolvedRateThreshold:
      normalizePolicyRate({
        value:
          policy
            .unresolvedRateThreshold,

        fallback:
          DEFAULT_RUNTIME_RECOMMENDATION_QUALITY_POLICY
            .unresolvedRateThreshold,

        minimum:
          0.01,

        maximum:
          1,
      }),

    repeatedOccurrenceThreshold:
      normalizePositiveInteger(
        policy
          .repeatedOccurrenceThreshold,
        DEFAULT_RUNTIME_RECOMMENDATION_QUALITY_POLICY
          .repeatedOccurrenceThreshold
      ),

    visitedWithoutCompletionThreshold:
      normalizePositiveInteger(
        policy
          .visitedWithoutCompletionThreshold,
        DEFAULT_RUNTIME_RECOMMENDATION_QUALITY_POLICY
          .visitedWithoutCompletionThreshold
      ),
  };
}

type NormalizePolicyRateParams = {
  value:
    number;

  fallback:
    number;

  minimum:
    number;

  maximum:
    number;
};

function normalizePolicyRate({
  value,
  fallback,
  minimum,
  maximum,
}: NormalizePolicyRateParams):
  number {
  const candidate =
    Number.isFinite(
      value
    )
      ? value
      : fallback;

  return roundNumber(
    Math.min(
      maximum,
      Math.max(
        minimum,
        candidate
      )
    ),
    4
  );
}

function normalizePositiveInteger(
  value:
    number,
  fallback:
    number
): number {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return Math.max(
      1,
      Math.floor(
        fallback
      )
    );
  }

  return Math.max(
    1,
    Math.floor(
      value
    )
  );
}

/* ------------------------------------------------------------------ */
/* Evaluated At Normalization */
/* ------------------------------------------------------------------ */

/**
 * evaluatedAt이 올바른 timestamp이면 ISO 문자열로 정규화합니다.
 *
 * 잘못된 값이면 현재 시각으로 대체합니다.
 */
function normalizeEvaluatedAt(
  value:
    string
): string {
  const timestamp =
    parseTimestamp(
      value
    );

  if (
    timestamp !== null
  ) {
    return new Date(
      timestamp
    ).toISOString();
  }

  return new Date().toISOString();
}

function parseTimestamp(
  value:
    string | null | undefined
): number | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  if (
    normalized.length === 0
  ) {
    return null;
  }

  const timestamp =
    Date.parse(
      normalized
    );

  if (
    Number.isNaN(
      timestamp
    ) ||
    !Number.isFinite(
      timestamp
    )
  ) {
    return null;
  }

  return timestamp;
}

/* ------------------------------------------------------------------ */
/* Threshold Strength */
/* ------------------------------------------------------------------ */

type NormalizeThresholdStrengthParams = {
  value:
    number;

  threshold:
    number;
};

/**
 * threshold를 충족한 정도를 0~1 범위로 정규화합니다.
 *
 * 예:
 *
 * value = threshold
 * → 최소 의미 강도 0.5
 *
 * value = 1
 * → 최대 강도 1
 */
function normalizeThresholdStrength({
  value,
  threshold,
}: NormalizeThresholdStrengthParams):
  number {
  const normalizedValue =
    clampUnit(
      value
    );

  const normalizedThreshold =
    clampUnit(
      threshold
    );

  if (
    normalizedValue <
    normalizedThreshold
  ) {
    return 0;
  }

  if (
    normalizedThreshold >= 1
  ) {
    return normalizedValue >= 1
      ? 1
      : 0;
  }

  const remainingRange =
    1 -
    normalizedThreshold;

  const progressBeyondThreshold =
    remainingRange > 0
      ? (
          normalizedValue -
          normalizedThreshold
        ) /
        remainingRange
      : 1;

  return clampUnit(
    0.5 +
    progressBeyondThreshold *
      0.5
  );
}

/* ------------------------------------------------------------------ */
/* Number Helpers */
/* ------------------------------------------------------------------ */

function normalizeNonNegativeInteger(
  value:
    number
): number {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      value
    )
  );
}

function clampUnit(
  value:
    number
): number {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return 0;
  }

  return Math.min(
    1,
    Math.max(
      0,
      value
    )
  );
}

function roundNumber(
  value:
    number,
  decimalPlaces:
    number
): number {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return 0;
  }

  const safeDecimalPlaces =
    Math.max(
      0,
      Math.floor(
        decimalPlaces
      )
    );

  const multiplier =
    10 **
    safeDecimalPlaces;

  return (
    Math.round(
      value *
      multiplier
    ) /
    multiplier
  );
}

/* ------------------------------------------------------------------ */
/* Percentage Formatting */
/* ------------------------------------------------------------------ */

/**
 * Diagnostics 문구에 사용할 비율을 사람이 읽기 쉬운 퍼센트로
 * 변환합니다.
 *
 * 예:
 *
 * 0.5
 * → 50%
 *
 * 0.3333
 * → 33.3%
 */
function formatPercentage(
  value:
    number
): string {
  const percentage =
    clampUnit(
      value
    ) *
    100;

  const roundedPercentage =
    roundNumber(
      percentage,
      1
    );

  return Number.isInteger(
    roundedPercentage
  )
    ? `${roundedPercentage.toFixed(
        0
      )}%`
    : `${roundedPercentage.toFixed(
        1
      )}%`;
}

/* ------------------------------------------------------------------ */
/* Text Helpers */
/* ------------------------------------------------------------------ */

function normalizeDescription(
  value:
    string
): string {
  const normalized =
    value
      .trim()
      .replace(
        /\s+/g,
        " "
      );

  return normalized.length > 0
    ? normalized
    : "No quality signal description is available.";
}