import type {
    CreateRecommendationEvolutionStatisticsParams,
    RecommendationEvolutionStatistics,
    RecommendationLifecycleComparison,
} from "./recommendationEvolutionTypes";

import type {
    RuntimeRecommendationLifecycleHistory,
    RuntimeRecommendationLifecycleRecord,
} from "../runtime-recommendation-lifecycle/runtimeRecommendationLifecycleTypes";

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Lifecycle 비교 기록에서
 * Recommendation Evolution 통계를 계산합니다.
 *
 * 이 함수는:
 *
 * - 비교 결과를 변경하지 않습니다.
 * - Evolution type을 다시 판정하지 않습니다.
 * - Summary 또는 Presentation을 생성하지 않습니다.
 * - 전달받은 comparisons만 사용해 통계를 계산합니다.
 */
export function createRecommendationEvolutionStatistics(
  params:
    CreateRecommendationEvolutionStatisticsParams,
): RecommendationEvolutionStatistics {
  validateParams(
    params,
  );

  const {
    history,
    comparisons,
  } = params;

  const comparableComparisons =
    comparisons.filter(
      (
        comparison,
      ) =>
        comparison.previous !== null,
    );

  const lifecycleCounts =
    countLifecycleStates(
      history,
    );

  const transitionCounts =
    countTransitionTypes(
      comparableComparisons,
    );

  const resolvedCount =
    lifecycleCounts.completedCount +
    lifecycleCounts.supersededCount;

  return {
    totalRecommendationCount:
      history.records.length,

    comparableRecommendationCount:
      comparableComparisons.length,

    transitionCount:
      comparableComparisons.length,

    activeCount:
      lifecycleCounts.activeCount,

    completedCount:
      lifecycleCounts.completedCount,

    supersededCount:
      lifecycleCounts.supersededCount,

    archivedCount:
      lifecycleCounts.archivedCount,

    repeatedTransitionCount:
      transitionCounts.repeatedTransitionCount,

    changedTransitionCount:
      transitionCounts.changedTransitionCount,

    refinedTransitionCount:
      transitionCounts.refinedTransitionCount,

    redirectedTransitionCount:
      transitionCounts.redirectedTransitionCount,

    completionAdvanceCount:
      transitionCounts.completionAdvanceCount,

    completionRate:
      calculateRatio(
        lifecycleCounts.completedCount,
        resolvedCount,
      ),

    supersessionRate:
      calculateRatio(
        lifecycleCounts.supersededCount,
        resolvedCount,
      ),

    repetitionRate:
      calculateRatio(
        transitionCounts.repeatedTransitionCount,
        comparableComparisons.length,
      ),

    averageActiveDurationMs:
      calculateAverageActiveDurationMs(
        history.records,
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Lifecycle State Counts                                             */
/* ------------------------------------------------------------------ */

type LifecycleCounts = {
  activeCount: number;
  completedCount: number;
  supersededCount: number;
  archivedCount: number;
};

function countLifecycleStates(
  history:
    RuntimeRecommendationLifecycleHistory,
): LifecycleCounts {
  const counts:
    LifecycleCounts = {
      activeCount: 0,
      completedCount: 0,
      supersededCount: 0,
      archivedCount: 0,
    };

  for (
    const record of
    history.records
  ) {
    switch (
      record.state
    ) {
      case "created":
        break;

      case "active":
        counts.activeCount += 1;
        break;

      case "completed":
        counts.completedCount += 1;
        break;

      case "superseded":
        counts.supersededCount += 1;
        break;

      case "archived":
        counts.archivedCount += 1;
        break;

      default:
        assertNeverLifecycleState(
          record.state,
        );
    }
  }

  return counts;
}

/* ------------------------------------------------------------------ */
/* Transition Counts                                                  */
/* ------------------------------------------------------------------ */

type TransitionCounts = {
  repeatedTransitionCount: number;
  changedTransitionCount: number;
  refinedTransitionCount: number;
  redirectedTransitionCount: number;
  completionAdvanceCount: number;
};

function countTransitionTypes(
  comparisons:
    readonly RecommendationLifecycleComparison[],
): TransitionCounts {
  const counts:
    TransitionCounts = {
      repeatedTransitionCount: 0,
      changedTransitionCount: 0,
      refinedTransitionCount: 0,
      redirectedTransitionCount: 0,
      completionAdvanceCount: 0,
    };

  for (
    const comparison of
    comparisons
  ) {
    if (
      comparison.type ===
      "repeated"
    ) {
      counts.repeatedTransitionCount += 1;
    } else {
      counts.changedTransitionCount += 1;
    }

    switch (
      comparison.type
    ) {
      case "refined":
        counts.refinedTransitionCount += 1;
        break;

      case "redirected":
        counts.redirectedTransitionCount += 1;
        break;

      case "completed-and-advanced":
        counts.completionAdvanceCount += 1;
        break;

      case "initial":
      case "repeated":
      case "expanded":
      case "superseded":
        break;

      default:
        assertNeverEvolutionType(
          comparison.type,
        );
    }
  }

  return counts;
}

/* ------------------------------------------------------------------ */
/* Active Duration                                                    */
/* ------------------------------------------------------------------ */

/**
 * 활성화 시점과 종료 시점이 모두 존재하는 Lifecycle만 사용합니다.
 *
 * 아직 활성 상태인 Lifecycle은 종료 시점이 없으므로
 * 평균 계산에서 제외합니다.
 */
function calculateAverageActiveDurationMs(
  records:
    readonly RuntimeRecommendationLifecycleRecord[],
): number | null {
  let totalDurationMs =
    0;

  let measuredRecordCount =
    0;

  for (
    const record of
    records
  ) {
    const {
      activatedAt,
      resolvedAt,
    } = record;

    if (
      activatedAt === null ||
      resolvedAt === null
    ) {
      continue;
    }

    const activatedAtMs =
      Date.parse(
        activatedAt,
      );

    const resolvedAtMs =
      Date.parse(
        resolvedAt,
      );

    if (
      Number.isNaN(
        activatedAtMs,
      ) ||
      Number.isNaN(
        resolvedAtMs,
      )
    ) {
      continue;
    }

    const durationMs =
      resolvedAtMs -
      activatedAtMs;

    if (
      durationMs < 0
    ) {
      continue;
    }

    totalDurationMs +=
      durationMs;

    measuredRecordCount +=
      1;
  }

  if (
    measuredRecordCount ===
    0
  ) {
    return null;
  }

  return (
    totalDurationMs /
    measuredRecordCount
  );
}

/* ------------------------------------------------------------------ */
/* Ratio                                                              */
/* ------------------------------------------------------------------ */

function calculateRatio(
  numerator:
    number,
  denominator:
    number,
): number {
  if (
    denominator === 0
  ) {
    return 0;
  }

  return (
    numerator /
    denominator
  );
}

function validateParams(
  params:
    CreateRecommendationEvolutionStatisticsParams,
): void {
  if (
    params === null ||
    typeof params !== "object"
  ) {
    throw new Error(
      "params must be a valid CreateRecommendationEvolutionStatisticsParams object.",
    );
  }

  validateComparisons(
    params.comparisons,
  );
}

/* ------------------------------------------------------------------ */
/* Validation                                                         */
/* ------------------------------------------------------------------ */

function validateComparisons(
  comparisons:
    readonly RecommendationLifecycleComparison[],
): void {
  if (
    !Array.isArray(
      comparisons,
    )
  ) {
    throw new Error(
      "comparisons must be an array.",
    );
  }

  const comparisonIds =
    new Set<string>();

  for (
    let index = 0;
    index < comparisons.length;
    index += 1
  ) {
    const comparison =
      comparisons[index];

    if (
      comparison === undefined ||
      comparison === null ||
      typeof comparison !==
        "object"
    ) {
      throw new Error(
        `comparisons[${index}] must be a valid comparison object.`,
      );
    }

    assertNonEmptyString(
      comparison.id,
      `comparisons[${index}].id`,
    );

    if (
      comparisonIds.has(
        comparison.id,
      )
    ) {
      throw new Error(
        `comparisons contains duplicate comparison ID "${comparison.id}".`,
      );
    }

    comparisonIds.add(
      comparison.id,
    );

    validateCurrentSnapshot(
      comparison,
      index,
    );

    validateComparisonShape(
      comparison,
      index,
    );
  }

  validateComparisonSequence(
    comparisons,
  );
}

function validateCurrentSnapshot(
  comparison:
    RecommendationLifecycleComparison,
  index:
    number,
): void {
  const current =
    comparison.current;

  if (
    current === null ||
    typeof current !==
      "object"
  ) {
    throw new Error(
      `comparisons[${index}].current must be a valid snapshot object.`,
    );
  }

  assertNonEmptyString(
    current.lifecycleId,
    `comparisons[${index}].current.lifecycleId`,
  );

  assertNonEmptyString(
    current.recommendationId,
    `comparisons[${index}].current.recommendationId`,
  );

  validateResolution(
    current.resolution,
    `comparisons[${index}].current.resolution`,
  );

  assertParsableTimestamp(
    current.createdAt,
    `comparisons[${index}].current.createdAt`,
  );

  assertOptionalParsableTimestamp(
    current.activatedAt,
    `comparisons[${index}].current.activatedAt`,
  );

  assertOptionalParsableTimestamp(
    current.resolvedAt,
    `comparisons[${index}].current.resolvedAt`,
  );

  if (
    current.activatedAt !== null &&
    current.resolvedAt !== null
  ) {
    const activatedAtMs =
      Date.parse(
        current.activatedAt,
      );

    const resolvedAtMs =
      Date.parse(
        current.resolvedAt,
      );

    if (
      resolvedAtMs <
      activatedAtMs
    ) {
      throw new Error(
        `comparisons[${index}].current.resolvedAt must not be earlier than activatedAt.`,
      );
    }
  }
}

function validateComparisonShape(
  comparison:
    RecommendationLifecycleComparison,
  index:
    number,
): void {
  validateEvolutionType(
    comparison.type,
    `comparisons[${index}].type`,
  );

  if (
    comparison.type ===
      "initial" &&
    comparison.previous !== null
  ) {
    throw new Error(
      `comparisons[${index}] with type "initial" must have previous=null.`,
    );
  }

  if (
    comparison.type !==
      "initial" &&
    comparison.previous === null
  ) {
    throw new Error(
      `comparisons[${index}] without a previous snapshot must use type "initial".`,
    );
  }
}

function validateComparisonSequence(
  comparisons:
    readonly RecommendationLifecycleComparison[],
): void {
  if (
    comparisons.length === 0
  ) {
    return;
  }

  const first =
    comparisons[0];

  if (
    first === undefined
  ) {
    throw new Error(
      "The first comparison is missing.",
    );
  }

  if (
    first.type !==
      "initial" ||
    first.previous !== null
  ) {
    throw new Error(
      "The first comparison must be an initial comparison with previous=null.",
    );
  }

  for (
    let index = 1;
    index < comparisons.length;
    index += 1
  ) {
    const previousComparison =
      comparisons[index - 1];

    const currentComparison =
      comparisons[index];

    if (
      previousComparison === undefined ||
      currentComparison === undefined
    ) {
      throw new Error(
        `Comparison sequence is incomplete at index ${index}.`,
      );
    }

    if (
      currentComparison.previous === null
    ) {
      throw new Error(
        `comparisons[${index}] must include a previous snapshot.`,
      );
    }

    if (
      currentComparison.previous.lifecycleId !==
      previousComparison.current.lifecycleId
    ) {
      throw new Error(
        `comparisons[${index}] is not connected to the preceding comparison.`,
      );
    }

    const previousCreatedAtMs =
      Date.parse(
        previousComparison.current.createdAt,
      );

    const currentCreatedAtMs =
      Date.parse(
        currentComparison.current.createdAt,
      );

    if (
      currentCreatedAtMs <
      previousCreatedAtMs
    ) {
      throw new Error(
        `comparisons[${index}] is ordered before the preceding lifecycle.`,
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Enum Validation                                                    */
/* ------------------------------------------------------------------ */

function validateEvolutionType(
  value:
    unknown,
  fieldName:
    string,
): void {
  const validValues = [
    "initial",
    "repeated",
    "refined",
    "expanded",
    "redirected",
    "completed-and-advanced",
    "superseded",
  ];

  assertAllowedValue(
    value,
    validValues,
    fieldName,
  );
}

function validateResolution(
  value:
    unknown,
  fieldName:
    string,
): void {
  if (
    value === null
  ) {
    return;
  }

  const validValues = [
    "completed",
    "superseded",
    "archived",
  ];

  assertAllowedValue(
    value,
    validValues,
    fieldName,
  );
}

/* ------------------------------------------------------------------ */
/* General Helpers                                                    */
/* ------------------------------------------------------------------ */

function assertAllowedValue(
  value:
    unknown,
  validValues:
    readonly string[],
  fieldName:
    string,
): void {
  if (
    typeof value !==
      "string" ||
    !validValues.includes(
      value,
    )
  ) {
    throw new Error(
      `${fieldName} must be one of: ${validValues.join(", ")}.`,
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

function assertParsableTimestamp(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string {
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
      `${fieldName} must be a valid parsable timestamp.`,
    );
  }
}

function assertOptionalParsableTimestamp(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string | null {
  if (
    value === null
  ) {
    return;
  }

  assertParsableTimestamp(
    value,
    fieldName,
  );
}

/* ------------------------------------------------------------------ */
/* Exhaustiveness Guards                                              */
/* ------------------------------------------------------------------ */

function assertNeverEvolutionType(
  value:
    never,
): never {
  throw new Error(
    `Unsupported Recommendation evolution type: ${String(value)}.`,
  );
}

function assertNeverLifecycleState(
  value:
    never,
): never {
  throw new Error(
    `Unsupported Recommendation Lifecycle state: ${String(value)}.`,
  );
}