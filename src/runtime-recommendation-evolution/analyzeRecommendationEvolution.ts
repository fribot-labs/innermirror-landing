import type {
    RuntimeRecommendationLifecycleHistory,
    RuntimeRecommendationLifecycleRecord,
} from "../runtime-recommendation-lifecycle/runtimeRecommendationLifecycleTypes";

import {
    compareRecommendationLifecycle,
} from "./compareRecommendationLifecycle";

import type {
    AnalyzeRecommendationEvolutionParams,
    RecommendationEvolutionConfidence,
    RecommendationEvolutionDataQuality,
    RecommendationEvolutionDirection,
    RecommendationEvolutionDrift,
    RecommendationEvolutionRepeatPattern,
    RecommendationEvolutionResult,
    RecommendationEvolutionStability,
    RecommendationEvolutionStatistics,
    RecommendationEvolutionSummary,
    RecommendationEvolutionType,
    RecommendationLifecycleComparison,
} from "./recommendationEvolutionTypes";

/* ------------------------------------------------------------------ */
/* Public API */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Lifecycle History 전체를 분석하여
 * Recommendation Evolution Result를 생성합니다.
 *
 * 분석 흐름:
 *
 * Lifecycle History
 *        ↓
 * visible lifecycle 정렬
 *        ↓
 * 연속 Lifecycle 비교
 *        ↓
 * RecommendationLifecycleComparison[]
 *        ↓
 * Statistics 계산
 *        ↓
 * Summary 계산
 *        ↓
 * Data Quality / Confidence 계산
 *
 * 최초 Recommendation도 previous=null인 initial comparison으로
 * comparisons에 포함합니다.
 *
 * 이 함수는 입력 History와 Record를 변경하지 않는 순수 함수입니다.
 */
export function analyzeRecommendationEvolution(
  params: AnalyzeRecommendationEvolutionParams,
): RecommendationEvolutionResult {
  validateParams(params);

  const {
    history,
    analyzedAt,
    createFingerprint,
    createSnapshot,
    createComparisonId,
  } = params;

  const analyzableRecords =
    getAnalyzableLifecycleRecords(
      history,
    );

  const comparisons:
    RecommendationLifecycleComparison[] = [];

  for (
    let index = 0;
    index < analyzableRecords.length;
    index += 1
  ) {
    const current =
      analyzableRecords[index];

    const previous =
      index === 0
        ? null
        : analyzableRecords[index - 1];

    const currentFingerprint =
      createFingerprint(current);

    const previousFingerprint =
      previous === null
        ? null
        : createFingerprint(previous);

    assertNonEmptyString(
      currentFingerprint,
      `createFingerprint result for lifecycle "${current.id}"`,
    );

    if (previous !== null) {
      assertNonEmptyString(
        previousFingerprint,
        `createFingerprint result for lifecycle "${previous.id}"`,
      );
    }

    const comparisonId =
      createComparisonId(
        previous,
        current,
      );

    assertNonEmptyString(
      comparisonId,
      "createComparisonId result",
    );

    const comparison =
      compareRecommendationLifecycle({
        previous,
        current,
        previousFingerprint,
        currentFingerprint,
        createSnapshot,
        comparisonId,
        comparedAt:
          analyzedAt,
      });

    comparisons.push(comparison);
  }

  assertUniqueComparisonIds(
    comparisons,
  );

  const statistics =
    createEvolutionStatistics({
      history,
      comparisons,
    });

  const summary =
    createEvolutionSummary({
      comparisons,
      statistics,
    });

  const dataQuality =
    resolveResultDataQuality(
      comparisons,
    );

  const confidence =
    resolveResultConfidence({
      comparisons,
      dataQuality,
      summary,
    });

  return {
    version:
      1,

    historyId:
      history.id,

    comparisons,

    statistics,

    summary,

    dataQuality,

    confidence,

    analyzedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Analyzable Lifecycle Records */
/* ------------------------------------------------------------------ */

/**
 * created 상태는 아직 사용자에게 활성 Recommendation으로
 * 제시되지 않았을 수 있으므로 Evolution 분석에서 제외합니다.
 *
 * archived Record는 이전에 active/completed/superseded 상태를
 * 거쳤을 가능성이 있으므로 History 궤적 보존을 위해 포함합니다.
 */
function getAnalyzableLifecycleRecords(
  history:
    RuntimeRecommendationLifecycleHistory,
): RuntimeRecommendationLifecycleRecord[] {
  return history.records
    .filter(
      (record) =>
        record.state !== "created",
    )
    .slice()
    .sort(
      compareLifecycleOrder,
    );
}

function compareLifecycleOrder(
  left:
    RuntimeRecommendationLifecycleRecord,
  right:
    RuntimeRecommendationLifecycleRecord,
): number {
  const leftTimestamp =
    Date.parse(left.createdAt);

  const rightTimestamp =
    Date.parse(right.createdAt);

  if (
    leftTimestamp !==
    rightTimestamp
  ) {
    return (
      leftTimestamp -
      rightTimestamp
    );
  }

  return left.id.localeCompare(
    right.id,
  );
}

/* ------------------------------------------------------------------ */
/* Statistics */
/* ------------------------------------------------------------------ */

type CreateEvolutionStatisticsParams = {
  history:
    RuntimeRecommendationLifecycleHistory;

  comparisons:
    RecommendationLifecycleComparison[];
};

/**
 * REI02 초기 단계에서 필요한 Evolution 통계를 계산합니다.
 *
 * 이후 recommendationEvolutionStatistics.ts가 추가되면
 * 이 함수를 해당 전용 모듈로 이동할 수 있습니다.
 */
function createEvolutionStatistics(
  params: CreateEvolutionStatisticsParams,
): RecommendationEvolutionStatistics {
  const {
    history,
    comparisons,
  } = params;

  const analyzableRecords =
    history.records.filter(
      (record) =>
        record.state !== "created",
    );

  const comparableComparisons =
    comparisons.filter(
      (comparison) =>
        comparison.previous !== null,
    );

  const activeCount =
    analyzableRecords.filter(
      (record) =>
        record.state === "active",
    ).length;

  const completedCount =
    analyzableRecords.filter(
      (record) =>
        record.resolution ===
        "completed",
    ).length;

  const supersededCount =
    analyzableRecords.filter(
      (record) =>
        record.resolution ===
        "superseded",
    ).length;

  const archivedCount =
    analyzableRecords.filter(
      (record) =>
        record.state === "archived",
    ).length;

  const repeatedTransitionCount =
    comparableComparisons.filter(
      (comparison) =>
        comparison.type ===
        "repeated",
    ).length;

  const refinedTransitionCount =
    comparableComparisons.filter(
      (comparison) =>
        comparison.type ===
        "refined",
    ).length;

  const redirectedTransitionCount =
    comparableComparisons.filter(
      (comparison) =>
        comparison.type ===
        "redirected",
    ).length;

  const completionAdvanceCount =
    comparableComparisons.filter(
      (comparison) =>
        comparison.type ===
        "completed-and-advanced",
    ).length;

  const changedTransitionCount =
    comparableComparisons.filter(
      (comparison) =>
        comparison.type !==
        "repeated",
    ).length;

  const resolvedCount =
    completedCount +
    supersededCount;

  const comparableCount =
    comparableComparisons.length;

  return {
    totalRecommendationCount:
      analyzableRecords.length,

    comparableRecommendationCount:
      comparableCount,

    transitionCount:
      comparableCount,

    activeCount,

    completedCount,

    supersededCount,

    archivedCount,

    repeatedTransitionCount,

    changedTransitionCount,

    refinedTransitionCount,

    redirectedTransitionCount,

    completionAdvanceCount,

    completionRate:
      safeRatio(
        completedCount,
        resolvedCount,
      ),

    supersessionRate:
      safeRatio(
        supersededCount,
        resolvedCount,
      ),

    repetitionRate:
      safeRatio(
        repeatedTransitionCount,
        comparableCount,
      ),

    averageActiveDurationMs:
      calculateAverageActiveDuration(
        analyzableRecords,
      ),
  };
}

function calculateAverageActiveDuration(
  records:
    RuntimeRecommendationLifecycleRecord[],
): number | null {
  const durations =
    records
      .map(
        calculateActiveDuration,
      )
      .filter(
        (
          duration,
        ): duration is number =>
          duration !== null,
      );

  if (durations.length === 0) {
    return null;
  }

  const total =
    durations.reduce(
      (
        sum,
        duration,
      ) =>
        sum + duration,
      0,
    );

  return total /
    durations.length;
}

function calculateActiveDuration(
  record:
    RuntimeRecommendationLifecycleRecord,
): number | null {
  if (
    record.activatedAt === null ||
    record.resolvedAt === null
  ) {
    return null;
  }

  const activatedAt =
    Date.parse(
      record.activatedAt,
    );

  const resolvedAt =
    Date.parse(
      record.resolvedAt,
    );

  if (
    Number.isNaN(activatedAt) ||
    Number.isNaN(resolvedAt) ||
    resolvedAt < activatedAt
  ) {
    return null;
  }

  return (
    resolvedAt -
    activatedAt
  );
}

function safeRatio(
  numerator:
    number,
  denominator:
    number,
): number {
  if (denominator <= 0) {
    return 0;
  }

  return clampRatio(
    numerator /
      denominator,
  );
}

function clampRatio(
  value:
    number,
): number {
  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

/* ------------------------------------------------------------------ */
/* Summary */
/* ------------------------------------------------------------------ */

type CreateEvolutionSummaryParams = {
  comparisons:
    RecommendationLifecycleComparison[];

  statistics:
    RecommendationEvolutionStatistics;
};

function createEvolutionSummary(
  params: CreateEvolutionSummaryParams,
): RecommendationEvolutionSummary {
  const {
    comparisons,
    statistics,
  } = params;

  const comparableComparisons =
    comparisons.filter(
      (comparison) =>
        comparison.previous !== null,
    );

  const latestComparison =
    comparableComparisons.length === 0
      ? null
      : comparableComparisons[
          comparableComparisons.length - 1
        ];

  const dominantType =
    resolveDominantType(
      comparableComparisons,
    );

  const dominantDirection =
    resolveDominantDirection(
      comparableComparisons,
    );

  const stability =
    resolveStability({
      comparisons:
        comparableComparisons,
      statistics,
    });

  const drift =
    resolveDrift(
      comparableComparisons,
    );

  const repeatPattern =
    resolveRepeatPattern({
      comparisons:
        comparableComparisons,
      statistics,
    });

  const recommendationChanged =
    latestComparison !== null &&
    latestComparison.type !==
      "repeated";

  const hasMeaningfulEvolution =
    comparableComparisons.some(
      (comparison) =>
        comparison.type ===
          "refined" ||
        comparison.type ===
          "expanded" ||
        comparison.type ===
          "redirected" ||
        comparison.type ===
          "completed-and-advanced" ||
        comparison.type ===
          "superseded",
    );

  return {
    stability,

    drift,

    repeatPattern,

    dominantType,

    dominantDirection,

    latestType:
      latestComparison?.type ??
      null,

    latestDirection:
      latestComparison?.direction ??
      null,

    latestMagnitude:
      latestComparison?.magnitude ??
      null,

    recommendationChanged,

    hasMeaningfulEvolution,

    hasSufficientHistory:
      statistics
        .comparableRecommendationCount >=
      2,
  };
}

/* ------------------------------------------------------------------ */
/* Stability */
/* ------------------------------------------------------------------ */

type ResolveStabilityParams = {
  comparisons:
    RecommendationLifecycleComparison[];

  statistics:
    RecommendationEvolutionStatistics;
};

function resolveStability(
  params: ResolveStabilityParams,
): RecommendationEvolutionStability {
  const {
    comparisons,
    statistics,
  } = params;

  const transitionCount =
    statistics.transitionCount;

  if (transitionCount === 0) {
    return "unknown";
  }

  const stableTransitionCount =
    comparisons.filter(
      (comparison) =>
        comparison.direction ===
          "stable" ||
        comparison.type ===
          "repeated",
    ).length;

  const redirectingCount =
    comparisons.filter(
      (comparison) =>
        comparison.direction ===
          "redirecting" ||
        comparison.type ===
          "redirected" ||
        comparison.type ===
          "superseded",
    ).length;

  const stableRate =
    safeRatio(
      stableTransitionCount,
      transitionCount,
    );

  const redirectingRate =
    safeRatio(
      redirectingCount,
      transitionCount,
    );

  if (
    transitionCount >= 3 &&
    stableRate >= 0.75 &&
    redirectingRate === 0
  ) {
    return "highly-stable";
  }

  if (
    stableRate >= 0.5 &&
    redirectingRate <= 0.25
  ) {
    return "stable";
  }

  if (
    redirectingRate >= 0.6
  ) {
    return "unstable";
  }

  return "developing";
}

/* ------------------------------------------------------------------ */
/* Drift */
/* ------------------------------------------------------------------ */

function resolveDrift(
  comparisons:
    RecommendationLifecycleComparison[],
): RecommendationEvolutionDrift {
  if (comparisons.length === 0) {
    return "unknown";
  }

  const driftScore =
    comparisons.reduce(
      (
        total,
        comparison,
      ) =>
        total +
        getDriftWeight(
          comparison,
        ),
      0,
    );

  const maximumScore =
    comparisons.length *
    3;

  const driftRate =
    safeRatio(
      driftScore,
      maximumScore,
    );

  if (driftRate === 0) {
    return "none";
  }

  if (driftRate < 0.25) {
    return "low";
  }

  if (driftRate < 0.6) {
    return "moderate";
  }

  return "high";
}

function getDriftWeight(
  comparison:
    RecommendationLifecycleComparison,
): number {
  if (
    comparison.type ===
      "redirected" ||
    comparison.direction ===
      "redirecting"
  ) {
    return 3;
  }

  if (
    comparison.type ===
      "superseded" ||
    comparison.magnitude ===
      "major"
  ) {
    return 2;
  }

  if (
    comparison.type ===
      "expanded" ||
    comparison.magnitude ===
      "moderate"
  ) {
    return 1;
  }

  return 0;
}

/* ------------------------------------------------------------------ */
/* Repeat Pattern */
/* ------------------------------------------------------------------ */

type ResolveRepeatPatternParams = {
  comparisons:
    RecommendationLifecycleComparison[];

  statistics:
    RecommendationEvolutionStatistics;
};

function resolveRepeatPattern(
  params: ResolveRepeatPatternParams,
): RecommendationEvolutionRepeatPattern {
  const {
    comparisons,
    statistics,
  } = params;

  if (comparisons.length === 0) {
    return "unknown";
  }

  if (
    statistics
      .repeatedTransitionCount ===
    0
  ) {
    return "none";
  }

  const trailingRepeatCount =
    countTrailingRepeatedComparisons(
      comparisons,
    );

  if (
    statistics.repetitionRate >=
      0.5 ||
    trailingRepeatCount >= 2
  ) {
    return "persistent";
  }

  return "occasional";
}

function countTrailingRepeatedComparisons(
  comparisons:
    RecommendationLifecycleComparison[],
): number {
  let count = 0;

  for (
    let index =
      comparisons.length - 1;
    index >= 0;
    index -= 1
  ) {
    if (
      comparisons[index].type !==
      "repeated"
    ) {
      break;
    }

    count += 1;
  }

  return count;
}

/* ------------------------------------------------------------------ */
/* Dominant Values */
/* ------------------------------------------------------------------ */

function resolveDominantType(
  comparisons:
    RecommendationLifecycleComparison[],
): RecommendationEvolutionType | null {
  return resolveDominantValue(
    comparisons.map(
      (comparison) =>
        comparison.type,
    ),
  );
}

function resolveDominantDirection(
  comparisons:
    RecommendationLifecycleComparison[],
): RecommendationEvolutionDirection | null {
  return resolveDominantValue(
    comparisons.map(
      (comparison) =>
        comparison.direction,
    ),
  );
}

function resolveDominantValue<
  Value extends string,
>(
  values:
    Value[],
): Value | null {
  if (values.length === 0) {
    return null;
  }

  const counts =
    new Map<Value, number>();

  for (const value of values) {
    counts.set(
      value,
      (counts.get(value) ?? 0) +
        1,
    );
  }

  let dominantValue:
    Value | null = null;

  let dominantCount =
    -1;

  for (const value of values) {
    const count =
      counts.get(value) ?? 0;

    /*
     * 동일 빈도에서는 가장 최근에 등장한 값을 우선하기 위해
     * >= 조건을 사용합니다.
     */
    if (count >= dominantCount) {
      dominantValue =
        value;

      dominantCount =
        count;
    }
  }

  return dominantValue;
}

/* ------------------------------------------------------------------ */
/* Result Data Quality */
/* ------------------------------------------------------------------ */

function resolveResultDataQuality(
  comparisons:
    RecommendationLifecycleComparison[],
): RecommendationEvolutionDataQuality {
  if (comparisons.length === 0) {
    return "insufficient";
  }

  const comparableComparisons =
    comparisons.filter(
      (comparison) =>
        comparison.previous !== null,
    );

  if (
    comparableComparisons.length ===
    0
  ) {
    return "partial";
  }

  const insufficientCount =
    comparableComparisons.filter(
      (comparison) =>
        comparison.dataQuality ===
        "insufficient",
    ).length;

  const sufficientCount =
    comparableComparisons.filter(
      (comparison) =>
        comparison.dataQuality ===
        "sufficient",
    ).length;

  if (
    insufficientCount ===
    comparableComparisons.length
  ) {
    return "insufficient";
  }

  if (
    sufficientCount ===
    comparableComparisons.length
  ) {
    return "sufficient";
  }

  return "partial";
}

/* ------------------------------------------------------------------ */
/* Result Confidence */
/* ------------------------------------------------------------------ */

type ResolveResultConfidenceParams = {
  comparisons:
    RecommendationLifecycleComparison[];

  dataQuality:
    RecommendationEvolutionDataQuality;

  summary:
    RecommendationEvolutionSummary;
};

function resolveResultConfidence(
  params: ResolveResultConfidenceParams,
): RecommendationEvolutionConfidence {
  const {
    comparisons,
    dataQuality,
    summary,
  } = params;

  if (
    dataQuality ===
      "insufficient" ||
    comparisons.length === 0
  ) {
    return "low";
  }

  const comparableComparisons =
    comparisons.filter(
      (comparison) =>
        comparison.previous !== null,
    );

  if (
    comparableComparisons.length ===
    0
  ) {
    return "low";
  }

  const highConfidenceCount =
    comparableComparisons.filter(
      (comparison) =>
        comparison.confidence ===
        "high",
    ).length;

  const lowConfidenceCount =
    comparableComparisons.filter(
      (comparison) =>
        comparison.confidence ===
        "low",
    ).length;

  const highConfidenceRate =
    safeRatio(
      highConfidenceCount,
      comparableComparisons.length,
    );

  const lowConfidenceRate =
    safeRatio(
      lowConfidenceCount,
      comparableComparisons.length,
    );

  if (
    dataQuality ===
      "sufficient" &&
    summary.hasSufficientHistory &&
    highConfidenceRate >= 0.6
  ) {
    return "high";
  }

  if (
    lowConfidenceRate < 0.6
  ) {
    return "medium";
  }

  return "low";
}

/* ------------------------------------------------------------------ */
/* Comparison ID Validation */
/* ------------------------------------------------------------------ */

function assertUniqueComparisonIds(
  comparisons:
    RecommendationLifecycleComparison[],
): void {
  const ids =
    new Set<string>();

  for (const comparison of comparisons) {
    if (
      ids.has(comparison.id)
    ) {
      throw new Error(
        `Duplicate Recommendation Evolution comparison ID "${comparison.id}".`,
      );
    }

    ids.add(comparison.id);
  }
}

/* ------------------------------------------------------------------ */
/* Validation */
/* ------------------------------------------------------------------ */

function validateParams(
  params:
    AnalyzeRecommendationEvolutionParams,
): void {
  validateHistory(
    params.history,
  );

  assertValidIsoTimestamp(
    params.analyzedAt,
    "analyzedAt",
  );

  if (
    typeof params.createFingerprint !==
    "function"
  ) {
    throw new Error(
      "createFingerprint must be a function.",
    );
  }

  if (
    typeof params.createSnapshot !==
    "function"
  ) {
    throw new Error(
      "createSnapshot must be a function.",
    );
  }

  if (
    typeof params.createComparisonId !==
    "function"
  ) {
    throw new Error(
      "createComparisonId must be a function.",
    );
  }
}

function validateHistory(
  history:
    RuntimeRecommendationLifecycleHistory,
): void {
  if (
    history === null ||
    typeof history !== "object"
  ) {
    throw new Error(
      "history must be a valid RuntimeRecommendationLifecycleHistory.",
    );
  }

  assertNonEmptyString(
    history.id,
    "history.id",
  );

  assertValidIsoTimestamp(
    history.createdAt,
    "history.createdAt",
  );

  assertValidIsoTimestamp(
    history.updatedAt,
    "history.updatedAt",
  );

  if (
    !Array.isArray(
      history.records,
    )
  ) {
    throw new Error(
      "history.records must be an array.",
    );
  }

  const lifecycleIds =
    new Set<string>();

  const recommendationIds =
    new Set<string>();

  let activeRecordCount =
    0;

  for (const record of history.records) {
    validateLifecycleRecord(
      record,
    );

    if (
      lifecycleIds.has(
        record.id,
      )
    ) {
      throw new Error(
        `Duplicate lifecycle ID "${record.id}".`,
      );
    }

    if (
      recommendationIds.has(
        record.recommendationId,
      )
    ) {
      throw new Error(
        `Duplicate recommendation ID "${record.recommendationId}".`,
      );
    }

    lifecycleIds.add(
      record.id,
    );

    recommendationIds.add(
      record.recommendationId,
    );

    if (
      record.state ===
      "active"
    ) {
      activeRecordCount +=
        1;
    }
  }

  if (activeRecordCount > 1) {
    throw new Error(
      "Lifecycle History contains multiple active records.",
    );
  }

  validateActiveLifecycleReference(
    history,
  );

  validateLifecycleLinks(
    history.records,
  );
}

function validateLifecycleRecord(
  record:
    RuntimeRecommendationLifecycleRecord,
): void {
  if (
    record === null ||
    typeof record !== "object"
  ) {
    throw new Error(
      "history record must be a valid RuntimeRecommendationLifecycleRecord.",
    );
  }

  assertNonEmptyString(
    record.id,
    "lifecycle.id",
  );

  assertNonEmptyString(
    record.recommendationId,
    "lifecycle.recommendationId",
  );

  assertValidIsoTimestamp(
    record.createdAt,
    `lifecycle "${record.id}" createdAt`,
  );

  assertValidIsoTimestamp(
    record.updatedAt,
    `lifecycle "${record.id}" updatedAt`,
  );

  assertOptionalIsoTimestamp(
    record.activatedAt,
    `lifecycle "${record.id}" activatedAt`,
  );

  assertOptionalIsoTimestamp(
    record.resolvedAt,
    `lifecycle "${record.id}" resolvedAt`,
  );

  assertOptionalIsoTimestamp(
    record.archivedAt,
    `lifecycle "${record.id}" archivedAt`,
  );

  if (
    !Array.isArray(
      record.transitions,
    )
  ) {
    throw new Error(
      `Lifecycle "${record.id}" transitions must be an array.`,
    );
  }

  validateLifecycleTimestampOrder(
    record,
  );
}

function validateLifecycleTimestampOrder(
  record:
    RuntimeRecommendationLifecycleRecord,
): void {
  const createdAt =
    Date.parse(
      record.createdAt,
    );

  if (
    record.activatedAt !== null &&
    Date.parse(
      record.activatedAt,
    ) < createdAt
  ) {
    throw new Error(
      `Lifecycle "${record.id}" activatedAt must not be earlier than createdAt.`,
    );
  }

  if (
    record.resolvedAt !== null
  ) {
    const resolutionBase =
      record.activatedAt ??
      record.createdAt;

    if (
      Date.parse(
        record.resolvedAt,
      ) <
      Date.parse(
        resolutionBase,
      )
    ) {
      throw new Error(
        `Lifecycle "${record.id}" resolvedAt must not be earlier than activation.`,
      );
    }
  }

  if (
    record.archivedAt !== null &&
    Date.parse(
      record.archivedAt,
    ) < createdAt
  ) {
    throw new Error(
      `Lifecycle "${record.id}" archivedAt must not be earlier than createdAt.`,
    );
  }
}

function validateActiveLifecycleReference(
  history:
    RuntimeRecommendationLifecycleHistory,
): void {
  if (
    history.activeLifecycleId ===
    null
  ) {
    const hasActiveRecord =
      history.records.some(
        (record) =>
          record.state ===
          "active",
      );

    if (hasActiveRecord) {
      throw new Error(
        "activeLifecycleId is null but an active lifecycle exists.",
      );
    }

    return;
  }

  const activeRecord =
    history.records.find(
      (record) =>
        record.id ===
        history.activeLifecycleId,
    );

  if (activeRecord === undefined) {
    throw new Error(
      `activeLifecycleId "${history.activeLifecycleId}" does not exist.`,
    );
  }

  if (
    activeRecord.state !==
    "active"
  ) {
    throw new Error(
      `activeLifecycleId "${history.activeLifecycleId}" does not reference an active lifecycle.`,
    );
  }
}

function validateLifecycleLinks(
  records:
    RuntimeRecommendationLifecycleRecord[],
): void {
  const recordById =
    new Map(
      records.map(
        (record) => [
          record.id,
          record,
        ],
      ),
    );

  for (const record of records) {
    if (
      record.previousLifecycleId !==
      null
    ) {
      const previous =
        recordById.get(
          record.previousLifecycleId,
        );

      if (previous === undefined) {
        throw new Error(
          `Lifecycle "${record.id}" references missing previous lifecycle "${record.previousLifecycleId}".`,
        );
      }

      if (
        previous.nextLifecycleId !==
          null &&
        previous.nextLifecycleId !==
          record.id
      ) {
        throw new Error(
          `Lifecycle link mismatch between "${previous.id}" and "${record.id}".`,
        );
      }
    }

    if (
      record.nextLifecycleId !==
      null
    ) {
      const next =
        recordById.get(
          record.nextLifecycleId,
        );

      if (next === undefined) {
        throw new Error(
          `Lifecycle "${record.id}" references missing next lifecycle "${record.nextLifecycleId}".`,
        );
      }

      if (
        next.previousLifecycleId !==
          null &&
        next.previousLifecycleId !==
          record.id
      ) {
        throw new Error(
          `Lifecycle link mismatch between "${record.id}" and "${next.id}".`,
        );
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* General Helpers */
/* ------------------------------------------------------------------ */

function assertNonEmptyString(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
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
      Date.parse(value),
    )
  ) {
    throw new Error(
      `${fieldName} must be a valid ISO 8601 timestamp.`,
    );
  }
}

function assertOptionalIsoTimestamp(
  value:
    string | null,
  fieldName:
    string,
): void {
  if (value === null) {
    return;
  }

  assertValidIsoTimestamp(
    value,
    fieldName,
  );
}