import {
    cloneRuntimeRecommendationAdaptiveObservation,
    type RuntimeRecommendationAdaptiveObservation,
} from "./createAdaptiveRecommendationObservation";

import {
    normalizeGeneratedAt,
} from "./runtimeRecommendationMath";

/* ------------------------------------------------------------------ */
/* History Policy */
/* ------------------------------------------------------------------ */

/**
 * Observation History 생성 정책입니다.
 *
 * Observation 배열을 장기 분석 가능한 형태로
 * 정규화합니다.
 */
export type RuntimeRecommendationAdaptiveObservationHistoryPolicy = {

  /**
   * 보관 가능한 최대 Observation 개수입니다.
   */
  maximumObservationCount:
    number;

  /**
   * Observation ID 중복을 허용할지 결정합니다.
   *
   * false이면 Duplicate Observation을 제거합니다.
   */
  allowDuplicateObservationIds:
    boolean;

  /**
   * Observation 정렬 방향입니다.
   */
  sortOrder:
    "ascending"
    | "descending";
};

export type PartialRuntimeRecommendationAdaptiveObservationHistoryPolicy = {

  maximumObservationCount?:
    number;

  allowDuplicateObservationIds?:
    boolean;

  sortOrder?:
    "ascending"
    | "descending";
};

/* ------------------------------------------------------------------ */
/* Default Policy */
/* ------------------------------------------------------------------ */

export const DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_HISTORY_POLICY:
RuntimeRecommendationAdaptiveObservationHistoryPolicy = {

  maximumObservationCount:
    100,

  allowDuplicateObservationIds:
    false,

  sortOrder:
    "ascending",
};

/* ------------------------------------------------------------------ */
/* History */
/* ------------------------------------------------------------------ */

/**
 * Observation들의 장기 History입니다.
 *
 * Statistics는 이 구조를 기반으로 계산됩니다.
 */
export type RuntimeRecommendationAdaptiveObservationHistory = {

  observations:
    RuntimeRecommendationAdaptiveObservation[];

  observationCount:
    number;

  firstObservedAt:
    string | null;

  lastObservedAt:
    string | null;
};

/* ------------------------------------------------------------------ */
/* Diagnostics */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveObservationHistoryDiagnostics = {

  generatedAt:
    string;

  duplicateObservationCount:
    number;

  removedObservationCount:
    number;

  warningCount:
    number;

  warnings:
    string[];
};

/* ------------------------------------------------------------------ */
/* Result */
/* ------------------------------------------------------------------ */

export type CreateAdaptiveRecommendationObservationHistoryResult = {

  history:
    RuntimeRecommendationAdaptiveObservationHistory;

  diagnostics:
    RuntimeRecommendationAdaptiveObservationHistoryDiagnostics;

  policy:
    RuntimeRecommendationAdaptiveObservationHistoryPolicy;
};

/* ------------------------------------------------------------------ */
/* Public Input */
/* ------------------------------------------------------------------ */

export type CreateAdaptiveRecommendationObservationHistoryParams = {

  observations:
    RuntimeRecommendationAdaptiveObservation[];

  policy?:
    PartialRuntimeRecommendationAdaptiveObservationHistoryPolicy;

  generatedAt?:
    string;
};

/* ------------------------------------------------------------------ */
/* Public API */
/* ------------------------------------------------------------------ */

export function createAdaptiveRecommendationObservationHistory({

  observations,

  policy,

  generatedAt,

}: CreateAdaptiveRecommendationObservationHistoryParams):
CreateAdaptiveRecommendationObservationHistoryResult {

  const normalizedPolicy =
    normalizeRuntimeRecommendationAdaptiveObservationHistoryPolicy(
      policy
    );

  return createAdaptiveRecommendationObservationHistoryWithPolicy({

    observations,

    generatedAt:
      normalizeGeneratedAt(
        generatedAt
      ),

    policy:
      normalizedPolicy,
  });
}

/* ------------------------------------------------------------------ */
/* Policy */
/* ------------------------------------------------------------------ */

export function normalizeRuntimeRecommendationAdaptiveObservationHistoryPolicy(

  policy?:
    PartialRuntimeRecommendationAdaptiveObservationHistoryPolicy

):
RuntimeRecommendationAdaptiveObservationHistoryPolicy {

  const fallback =
    DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_HISTORY_POLICY;

  return {

    maximumObservationCount:

      typeof policy?.maximumObservationCount ===
      "number"

        ? Math.max(
            1,
            Math.floor(
              policy.maximumObservationCount
            )
          )

        : fallback.maximumObservationCount,

    allowDuplicateObservationIds:

      typeof policy?.allowDuplicateObservationIds ===
      "boolean"

        ? policy.allowDuplicateObservationIds

        : fallback.allowDuplicateObservationIds,

    sortOrder:

      policy?.sortOrder === "descending"

        ? "descending"

        : "ascending",
  };
}

export function cloneRuntimeRecommendationAdaptiveObservationHistoryPolicy(

  policy:
    RuntimeRecommendationAdaptiveObservationHistoryPolicy

):
RuntimeRecommendationAdaptiveObservationHistoryPolicy {

  return {

    maximumObservationCount:
      policy.maximumObservationCount,

    allowDuplicateObservationIds:
      policy.allowDuplicateObservationIds,

    sortOrder:
      policy.sortOrder,
  };
}

/* ------------------------------------------------------------------ */
/* Internal Function Contracts */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationObservationHistoryWithPolicyParams = {

  observations:
    RuntimeRecommendationAdaptiveObservation[];

  generatedAt:
    string;

  policy:
    RuntimeRecommendationAdaptiveObservationHistoryPolicy;
};

/* ------------------------------------------------------------------ */
/* History Builder */
/* ------------------------------------------------------------------ */

function createAdaptiveRecommendationObservationHistoryWithPolicy({
  observations,
  generatedAt,
  policy,
}: CreateAdaptiveRecommendationObservationHistoryWithPolicyParams):
CreateAdaptiveRecommendationObservationHistoryResult {

  /*
   * Clone
   */

  const clonedObservations:
    RuntimeRecommendationAdaptiveObservation[] =
      observations.map(
        (
          observation
        ) =>
          cloneRuntimeRecommendationAdaptiveObservation(
            observation
          )
      );

  /*
   * Validation
   */

  const warnings:
    string[] = [];

  const duplicateObservationCount =
    countDuplicateObservationIds(
      clonedObservations
    );

  if (
    duplicateObservationCount > 0
  ) {
    warnings.push(
      `${duplicateObservationCount} duplicate Observation IDs were detected.`
    );
  }

  /*
   * Duplicate Removal
   */

  const uniqueObservations:
    RuntimeRecommendationAdaptiveObservation[] =
      policy.allowDuplicateObservationIds
        ? clonedObservations
        : removeDuplicateObservationIds(
            clonedObservations
          );

  /*
   * Sort
   */

  const sortedObservations:
    RuntimeRecommendationAdaptiveObservation[] =
      [...uniqueObservations];

  sortedObservations.sort(
    policy.sortOrder === "ascending"
      ? compareObservationTimestampAscending
      : compareObservationTimestampDescending
  );

  /*
   * Maximum Count
   */

  const limitedObservations:
    RuntimeRecommendationAdaptiveObservation[] =
      sortedObservations.slice(
        0,
        policy.maximumObservationCount
      );

  validateAdaptiveRecommendationObservationHistory({
    observations:
      limitedObservations,

    sortOrder:
      policy.sortOrder,

    warnings,
  });

  const removedObservationCount =
    Math.max(
      0,
      sortedObservations.length -
        limitedObservations.length
    );

  if (
    removedObservationCount > 0
  ) {
    warnings.push(
      `${removedObservationCount} observations exceeded the configured history limit.`
    );
  }

  /*
   * History
   */

  const history:
    RuntimeRecommendationAdaptiveObservationHistory = {
    observations:
      limitedObservations,

    observationCount:
      limitedObservations.length,

    firstObservedAt:
      resolveFirstObservedAt(
        limitedObservations
      ),

    lastObservedAt:
      resolveLastObservedAt(
        limitedObservations
      ),
  };

  /*
   * Diagnostics
   */

  const diagnostics:
    RuntimeRecommendationAdaptiveObservationHistoryDiagnostics = {

    generatedAt,

    duplicateObservationCount,

    removedObservationCount,

    warningCount:
      warnings.length,

    warnings,
  };

  return {

    history,

    diagnostics,

    policy:
      cloneRuntimeRecommendationAdaptiveObservationHistoryPolicy(
        policy
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Duplicate Detection */
/* ------------------------------------------------------------------ */

function countDuplicateObservationIds(

  observations:
    RuntimeRecommendationAdaptiveObservation[]

):
number {

  const ids =
    new Set<string>();

  let duplicates = 0;

  for (
    const observation of
    observations
  ) {

    if (
      ids.has(
        observation.observationId
      )
    ) {

      duplicates++;

      continue;
    }

    ids.add(
      observation.observationId
    );
  }

  return duplicates;
}

function removeDuplicateObservationIds(

  observations:
    RuntimeRecommendationAdaptiveObservation[]

):
RuntimeRecommendationAdaptiveObservation[] {

  const ids =
    new Set<string>();

  const results:
    RuntimeRecommendationAdaptiveObservation[] = [];

  for (
    const observation of
    observations
  ) {

    if (
      ids.has(
        observation.observationId
      )
    ) {
      continue;
    }

    ids.add(
      observation.observationId
    );

    results.push(
      observation
    );
  }

  return results;
}

/* ------------------------------------------------------------------ */
/* History Validation */
/* ------------------------------------------------------------------ */

type ValidateObservationHistoryParams = {
  observations:
    RuntimeRecommendationAdaptiveObservation[];

  sortOrder:
    "ascending" | "descending";

  warnings:
    string[];
};

function validateAdaptiveRecommendationObservationHistory({
  observations,
  sortOrder,
  warnings,
}: ValidateObservationHistoryParams): void {
  if (
    observations.length === 0
  ) {
    warnings.push(
      "Adaptive Recommendation Observation History is empty."
    );

    return;
  }

  let previousTime:
    number | null = null;

  for (
    const observation of
    observations
  ) {
    const observationId =
      observation.observationId.trim();

    if (
      observationId.length === 0
    ) {
      warnings.push(
        "Observation contains an empty observationId."
      );
    }

    const currentTime =
      Date.parse(
        observation.generatedAt
      );

    if (
      !Number.isFinite(
        currentTime
      )
    ) {
      warnings.push(
        `Observation "${observation.observationId}" has an invalid generatedAt value.`
      );

      continue;
    }

    if (
      previousTime !== null
    ) {
      const isOutOfOrder =
        sortOrder === "ascending"
          ? currentTime < previousTime
          : currentTime > previousTime;

      if (
        isOutOfOrder
      ) {
        warnings.push(
          `Observation History is not ordered in ${sortOrder} chronological order.`
        );

        break;
      }
    }

    previousTime =
      currentTime;
  }
}

/* ------------------------------------------------------------------ */
/* History Clone */
/* ------------------------------------------------------------------ */

export function cloneRuntimeRecommendationAdaptiveObservationHistory(
  history:
    RuntimeRecommendationAdaptiveObservationHistory
): RuntimeRecommendationAdaptiveObservationHistory {

  return {

    observations:
      history.observations.map(
        cloneRuntimeRecommendationAdaptiveObservation
      ),

    observationCount:
      history.observationCount,

    firstObservedAt:
      history.firstObservedAt,

    lastObservedAt:
      history.lastObservedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Diagnostics Clone */
/* ------------------------------------------------------------------ */

export function cloneRuntimeRecommendationAdaptiveObservationHistoryDiagnostics(
  diagnostics:
    RuntimeRecommendationAdaptiveObservationHistoryDiagnostics
): RuntimeRecommendationAdaptiveObservationHistoryDiagnostics {

  return {

    generatedAt:
      diagnostics.generatedAt,

    duplicateObservationCount:
      diagnostics.duplicateObservationCount,

    removedObservationCount:
      diagnostics.removedObservationCount,

    warningCount:
      diagnostics.warningCount,

    warnings:
      [...diagnostics.warnings],
  };
}

/* ------------------------------------------------------------------ */
/* Primitive Helpers */
/* ------------------------------------------------------------------ */

function normalizeHistoryGeneratedAt(
  generatedAt:
    string
): string {

  return normalizeGeneratedAt(
    generatedAt
  );
}

function normalizeObservationTimestamp(
  generatedAt:
    string
): number {

  const timestamp =
    Date.parse(
      generatedAt
    );

  return Number.isFinite(
    timestamp
  )
    ? timestamp
    : Number.NEGATIVE_INFINITY;
}

function compareObservationTimestampAscending(
  left:
    RuntimeRecommendationAdaptiveObservation,
  right:
    RuntimeRecommendationAdaptiveObservation
): number {

  return (
    normalizeObservationTimestamp(
      left.generatedAt
    ) -
    normalizeObservationTimestamp(
      right.generatedAt
    )
  );
}

function compareObservationTimestampDescending(
  left:
    RuntimeRecommendationAdaptiveObservation,
  right:
    RuntimeRecommendationAdaptiveObservation
): number {

  return (
    normalizeObservationTimestamp(
      right.generatedAt
    ) -
    normalizeObservationTimestamp(
      left.generatedAt
    )
  );
}

/* ------------------------------------------------------------------ */
/* History Utilities */
/* ------------------------------------------------------------------ */

/**
 * Observation 배열에서
 * 가장 오래된 Observation 시간을 반환합니다.
 */
function resolveFirstObservedAt(
  observations:
    RuntimeRecommendationAdaptiveObservation[]
): string | null {

  return observations.length > 0
    ? observations[0].generatedAt
    : null;
}

/**
 * Observation 배열에서
 * 가장 최근 Observation 시간을 반환합니다.
 */
function resolveLastObservedAt(
  observations:
    RuntimeRecommendationAdaptiveObservation[]
): string | null {

  return observations.length > 0
    ? observations[
        observations.length - 1
      ].generatedAt
    : null;
}

/**
 * Observation History가
 * 비어있는지 확인합니다.
 */
export function isAdaptiveRecommendationObservationHistoryEmpty(
  history:
    RuntimeRecommendationAdaptiveObservationHistory
): boolean {

  return (
    history.observationCount === 0
  );
}