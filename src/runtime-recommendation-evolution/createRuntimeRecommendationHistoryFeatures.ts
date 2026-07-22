import type {
    RuntimeActionHistoryEntry,
} from "../runtime-action-history/runtimeActionHistoryTypes";

import type {
    RuntimeRecommendationHistoryAverages,
    RuntimeRecommendationHistoryCounts,
    RuntimeRecommendationHistoryFeatureContext,
    RuntimeRecommendationHistoryFeatures,
    RuntimeRecommendationHistoryRates,
    RuntimeRecommendationHistoryTemporalFeatures,
    RuntimeRecommendationLatestState,
    RuntimeRecommendationQualityIdentity,
} from "./runtimeRecommendationQualityTypes";

/* ------------------------------------------------------------------ */
/* Public Input */
/* ------------------------------------------------------------------ */

export type CreateRuntimeRecommendationHistoryFeaturesParams = {
  /**
   * 전체 Runtime Action History Entry입니다.
   *
   * Builder 내부에서 projectId와 fingerprint가 일치하는
   * Entry만 선별합니다.
   */
  entries:
    RuntimeActionHistoryEntry[];

  /**
   * 분석할 프로젝트, Recommendation fingerprint,
   * 분석 시각을 제공합니다.
   */
  context:
    RuntimeRecommendationHistoryFeatureContext;
};

/* ------------------------------------------------------------------ */
/* Public Builder */
/* ------------------------------------------------------------------ */

/**
 * 동일 프로젝트와 동일 Recommendation fingerprint의
 * History Entry들을 하나의 Feature 집합으로 변환합니다.
 *
 * 일치하는 Entry가 없으면 null을 반환합니다.
 *
 * 이 함수는 Recommendation의 품질을 판단하지 않습니다.
 * History에서 관찰 가능한 사실만 계산합니다.
 */
export function createRuntimeRecommendationHistoryFeatures({
  entries,
  context,
}: CreateRuntimeRecommendationHistoryFeaturesParams):
  RuntimeRecommendationHistoryFeatures | null {
  const projectId =
    normalizeRequiredText(
      context.projectId
    );

  const fingerprint =
    normalizeRequiredText(
      context.fingerprint
    );

  if (
    projectId === null ||
    fingerprint === null
  ) {
    return null;
  }

  const matchingEntries =
    entries
      .filter(
        (entry) =>
          normalizeRequiredText(
            entry.projectId
          ) === projectId &&
          normalizeRequiredText(
            entry.fingerprint
          ) === fingerprint
      )
      .sort(
        compareEntriesByFirstObservedAt
      );

  if (
    matchingEntries.length === 0
  ) {
    return null;
  }

  const identity =
    createRecommendationQualityIdentity({
      entries:
        matchingEntries,

      projectId,

      fingerprint,
    });

  const counts =
    createRecommendationHistoryCounts(
      matchingEntries
    );

  const rates =
    createRecommendationHistoryRates(
      counts
    );

  const averages =
    createRecommendationHistoryAverages(
      counts
    );

  const temporal =
    createRecommendationHistoryTemporalFeatures({
      entries:
        matchingEntries,

      evaluatedAt:
        context.evaluatedAt,
    });

  const latest =
    createLatestRecommendationState(
      matchingEntries
    );

  return {
    identity,

    counts,

    rates,

    averages,

    temporal,

    latest,
  };
}

/* ------------------------------------------------------------------ */
/* Identity */
/* ------------------------------------------------------------------ */

type CreateRecommendationQualityIdentityParams = {
  entries:
    RuntimeActionHistoryEntry[];

  projectId:
    string;

  fingerprint:
    string;
};

function createRecommendationQualityIdentity({
  entries,
  projectId,
  fingerprint,
}: CreateRecommendationQualityIdentityParams):
  RuntimeRecommendationQualityIdentity {
  /**
   * 같은 fingerprint의 Entry들은 원칙적으로 동일한
   * kind, target, source, title을 가져야 합니다.
   *
   * 가장 최근 Entry를 사용하면 향후 Snapshot 표현이
   * 일부 보정되었을 때 최신 정보를 보존할 수 있습니다.
   */
  const latestEntry =
    getLatestEntry(
      entries
    );

  return {
    fingerprint,

    projectId,

    kind:
      latestEntry.action.kind,

    target:
      latestEntry.action.target,

    source:
      latestEntry.action.source,

    title:
      normalizeDisplayText(
        latestEntry.action.title,
        "Untitled recommendation"
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Counts */
/* ------------------------------------------------------------------ */

function createRecommendationHistoryCounts(
  entries:
    RuntimeActionHistoryEntry[]
): RuntimeRecommendationHistoryCounts {
  let completedCount = 0;
  let supersededCount = 0;
  let activeCount = 0;
  let visitedOccurrenceCount = 0;
  let totalNavigationCount = 0;
  let repeatedCount = 0;
  let unresolvedCount = 0;
  let completionEvidenceCount = 0;
  let totalObservationCount = 0;

  for (const entry of entries) {
    switch (entry.status) {
      case "completed":
        completedCount += 1;
        break;

      case "superseded":
        supersededCount += 1;
        break;

      case "active":
      case "navigated":
        activeCount += 1;
        break;
    }

    const navigationCount =
      Array.isArray(
        entry.navigationEvents
      )
        ? entry.navigationEvents.length
        : 0;

    if (
      navigationCount > 0
    ) {
      visitedOccurrenceCount += 1;
    }

    totalNavigationCount +=
      navigationCount;

    if (
      entry.resolutionState ===
      "repeated"
    ) {
      repeatedCount += 1;
    }

    if (
      entry.resolutionState ===
      "unresolved"
    ) {
      unresolvedCount += 1;
    }

    completionEvidenceCount +=
      Array.isArray(
        entry.completionEvidence
      )
        ? entry.completionEvidence.length
        : 0;

    totalObservationCount +=
      normalizeCount(
        entry.observationCount
      );
  }

  return {
    totalOccurrences:
      entries.length,

    completedCount,

    supersededCount,

    activeCount,

    visitedOccurrenceCount,

    totalNavigationCount,

    repeatedCount,

    unresolvedCount,

    completionEvidenceCount,

    totalObservationCount,
  };
}

/* ------------------------------------------------------------------ */
/* Rates */
/* ------------------------------------------------------------------ */

function createRecommendationHistoryRates(
  counts:
    RuntimeRecommendationHistoryCounts
): RuntimeRecommendationHistoryRates {
  const totalOccurrences =
    counts.totalOccurrences;

  if (
    totalOccurrences <= 0
  ) {
    return {
      completionRate:
        0,

      supersededRate:
        0,

      activeRate:
        0,

      navigationRate:
        0,

      repetitionRate:
        0,

      unresolvedRate:
        0,

      completionEvidenceRate:
        0,
    };
  }

  return {
    completionRate:
      normalizeRate(
        counts.completedCount /
        totalOccurrences
      ),

    supersededRate:
      normalizeRate(
        counts.supersededCount /
        totalOccurrences
      ),

    activeRate:
      normalizeRate(
        counts.activeCount /
        totalOccurrences
      ),

    /**
     * Navigation Rate는 Navigation Event 총수가 아니라,
     * 한 번 이상 방문한 occurrence의 비율입니다.
     */
    navigationRate:
      normalizeRate(
        counts.visitedOccurrenceCount /
        totalOccurrences
      ),

    repetitionRate:
      normalizeRate(
        counts.repeatedCount /
        totalOccurrences
      ),

    unresolvedRate:
      normalizeRate(
        counts.unresolvedCount /
        totalOccurrences
      ),

    /**
     * Completion Evidence Rate는 occurrence당 Evidence 존재 정도를
     * 0~1 범위로 제한하여 표현합니다.
     *
     * 하나의 완료 Entry에 여러 Evidence가 존재해도
     * 비율이 1을 넘지 않도록 normalizeRate가 제한합니다.
     */
    completionEvidenceRate:
      normalizeRate(
        counts.completionEvidenceCount /
        totalOccurrences
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Averages */
/* ------------------------------------------------------------------ */

function createRecommendationHistoryAverages(
  counts:
    RuntimeRecommendationHistoryCounts
): RuntimeRecommendationHistoryAverages {
  const totalOccurrences =
    counts.totalOccurrences;

  if (
    totalOccurrences <= 0
  ) {
    return {
      averageObservationCount:
        0,

      averageNavigationCount:
        0,

      averageCompletionEvidenceCount:
        0,
    };
  }

  return {
    averageObservationCount:
      normalizeAverage(
        counts.totalObservationCount /
        totalOccurrences
      ),

    averageNavigationCount:
      normalizeAverage(
        counts.totalNavigationCount /
        totalOccurrences
      ),

    averageCompletionEvidenceCount:
      counts.completedCount > 0
        ? normalizeAverage(
            counts.completionEvidenceCount /
            counts.completedCount
          )
        : 0,
  };
}

/* ------------------------------------------------------------------ */
/* Temporal Features */
/* ------------------------------------------------------------------ */

type CreateRecommendationHistoryTemporalFeaturesParams = {
  entries:
    RuntimeActionHistoryEntry[];

  evaluatedAt:
    string;
};

function createRecommendationHistoryTemporalFeatures({
  entries,
  evaluatedAt,
}: CreateRecommendationHistoryTemporalFeaturesParams):
  RuntimeRecommendationHistoryTemporalFeatures {
  const validFirstObservedTimestamps =
    entries
      .map(
        (entry) =>
          parseTimestamp(
            entry.firstObservedAt
          )
      )
      .filter(
        isNumber
      );

  const validLastObservedTimestamps =
    entries
      .map(
        (entry) =>
          parseTimestamp(
            entry.lastObservedAt
          )
      )
      .filter(
        isNumber
      );

  const validCompletedTimestamps =
    entries
      .map(
        (entry) =>
          parseTimestamp(
            entry.completedAt
          )
      )
      .filter(
        isNumber
      );

  const validSupersededTimestamps =
    entries
      .map(
        (entry) =>
          parseTimestamp(
            entry.supersededAt
          )
      )
      .filter(
        isNumber
      );

  const completionDurations =
    entries
      .map(
        createCompletionDuration
      )
      .filter(
        isNumber
      );

  const latestEntry =
    getLatestEntry(
      entries
    );

  const latestFirstObservedAt =
    parseTimestamp(
      latestEntry.firstObservedAt
    );

  const evaluatedTimestamp =
    parseTimestamp(
      evaluatedAt
    );

  const latestOccurrenceAgeMilliseconds =
    latestFirstObservedAt !== null &&
    evaluatedTimestamp !== null
      ? Math.max(
          0,
          evaluatedTimestamp -
          latestFirstObservedAt
        )
      : null;

  return {
    firstObservedAt:
      toIsoStringOrNull(
        getMinimumTimestamp(
          validFirstObservedTimestamps
        )
      ),

    lastObservedAt:
      toIsoStringOrNull(
        getMaximumTimestamp(
          validLastObservedTimestamps
        )
      ),

    lastCompletedAt:
      toIsoStringOrNull(
        getMaximumTimestamp(
          validCompletedTimestamps
        )
      ),

    lastSupersededAt:
      toIsoStringOrNull(
        getMaximumTimestamp(
          validSupersededTimestamps
        )
      ),

    averageCompletionDurationMilliseconds:
      completionDurations.length > 0
        ? Math.round(
            completionDurations.reduce(
              (
                total,
                duration
              ) =>
                total +
                duration,
              0
            ) /
            completionDurations.length
          )
        : null,

    latestOccurrenceAgeMilliseconds,
  };
}

function createCompletionDuration(
  entry:
    RuntimeActionHistoryEntry
): number | null {
  if (
    entry.status !==
    "completed"
  ) {
    return null;
  }

  const firstObservedAt =
    parseTimestamp(
      entry.firstObservedAt
    );

  const completedAt =
    parseTimestamp(
      entry.completedAt
    );

  if (
    firstObservedAt === null ||
    completedAt === null ||
    completedAt <
      firstObservedAt
  ) {
    return null;
  }

  return (
    completedAt -
    firstObservedAt
  );
}

/* ------------------------------------------------------------------ */
/* Latest State */
/* ------------------------------------------------------------------ */

function createLatestRecommendationState(
  entries:
    RuntimeActionHistoryEntry[]
): RuntimeRecommendationLatestState {
  const latestEntry =
    getLatestEntry(
      entries
    );

  return {
    status:
      latestEntry.status,

    resolutionState:
      latestEntry.resolutionState,

    firstObservedAt:
      normalizeTimestampOrNull(
        latestEntry.firstObservedAt
      ),

    lastObservedAt:
      normalizeTimestampOrNull(
        latestEntry.lastObservedAt
      ),

    completedAt:
      normalizeTimestampOrNull(
        latestEntry.completedAt
      ),

    supersededAt:
      normalizeTimestampOrNull(
        latestEntry.supersededAt
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Entry Ordering */
/* ------------------------------------------------------------------ */

/**
 * 오래된 Entry에서 최신 Entry 순으로 정렬합니다.
 */
function compareEntriesByFirstObservedAt(
  left:
    RuntimeActionHistoryEntry,
  right:
    RuntimeActionHistoryEntry
): number {
  const leftTimestamp =
    parseTimestamp(
      left.firstObservedAt
    );

  const rightTimestamp =
    parseTimestamp(
      right.firstObservedAt
    );

  if (
    leftTimestamp === null &&
    rightTimestamp === null
  ) {
    return left.id.localeCompare(
      right.id
    );
  }

  if (
    leftTimestamp === null
  ) {
    return 1;
  }

  if (
    rightTimestamp === null
  ) {
    return -1;
  }

  if (
    leftTimestamp ===
    rightTimestamp
  ) {
    return left.id.localeCompare(
      right.id
    );
  }

  return (
    leftTimestamp -
    rightTimestamp
  );
}

/**
 * 가장 최근에 관찰된 Entry를 반환합니다.
 *
 * lastObservedAt을 우선 사용하고,
 * 값이 유효하지 않으면 firstObservedAt을 사용합니다.
 */
function getLatestEntry(
  entries:
    RuntimeActionHistoryEntry[]
): RuntimeActionHistoryEntry {
  if (
    entries.length === 0
  ) {
    throw new Error(
      "Runtime Recommendation History Features require at least one matching entry."
    );
  }

  return [...entries].sort(
    (
      left,
      right
    ) => {
      const leftTimestamp =
        resolveEntryRecencyTimestamp(
          left
        );

      const rightTimestamp =
        resolveEntryRecencyTimestamp(
          right
        );

      if (
        leftTimestamp === null &&
        rightTimestamp === null
      ) {
        return right.id.localeCompare(
          left.id
        );
      }

      if (
        leftTimestamp === null
      ) {
        return 1;
      }

      if (
        rightTimestamp === null
      ) {
        return -1;
      }

      if (
        leftTimestamp ===
        rightTimestamp
      ) {
        return right.id.localeCompare(
          left.id
        );
      }

      return (
        rightTimestamp -
        leftTimestamp
      );
    }
  )[0];
}

function resolveEntryRecencyTimestamp(
  entry:
    RuntimeActionHistoryEntry
): number | null {
  return (
    parseTimestamp(
      entry.lastObservedAt
    ) ??
    parseTimestamp(
      entry.firstObservedAt
    )
  );
}

/* ------------------------------------------------------------------ */
/* Timestamp Helpers */
/* ------------------------------------------------------------------ */

function parseTimestamp(
  value:
    string | null
): number | null {
  if (
    value === null
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
    )
  ) {
    return null;
  }

  return timestamp;
}

function normalizeTimestampOrNull(
  value:
    string | null
): string | null {
  return toIsoStringOrNull(
    parseTimestamp(
      value
    )
  );
}

function toIsoStringOrNull(
  timestamp:
    number | null
): string | null {
  if (
    timestamp === null ||
    !Number.isFinite(
      timestamp
    )
  ) {
    return null;
  }

  return new Date(
    timestamp
  ).toISOString();
}

function getMinimumTimestamp(
  timestamps:
    number[]
): number | null {
  if (
    timestamps.length === 0
  ) {
    return null;
  }

  return Math.min(
    ...timestamps
  );
}

function getMaximumTimestamp(
  timestamps:
    number[]
): number | null {
  if (
    timestamps.length === 0
  ) {
    return null;
  }

  return Math.max(
    ...timestamps
  );
}

function isNumber(
  value:
    number | null
): value is number {
  return (
    value !== null &&
    Number.isFinite(
      value
    )
  );
}

/* ------------------------------------------------------------------ */
/* Number Normalization */
/* ------------------------------------------------------------------ */

function normalizeCount(
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

/**
 * 비율을 0~1 범위로 제한하고 부동소수점 노이즈를 줄입니다.
 */
function normalizeRate(
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

  const clamped =
    Math.min(
      1,
      Math.max(
        0,
        value
      )
    );

  return roundNumber(
    clamped,
    4
  );
}

function normalizeAverage(
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

  return roundNumber(
    Math.max(
      0,
      value
    ),
    4
  );
}

function roundNumber(
  value:
    number,
  decimalPlaces:
    number
): number {
  const multiplier =
    10 **
    decimalPlaces;

  return (
    Math.round(
      value *
      multiplier
    ) /
    multiplier
  );
}

/* ------------------------------------------------------------------ */
/* Text Normalization */
/* ------------------------------------------------------------------ */

function normalizeRequiredText(
  value:
    string
): string | null {
  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

function normalizeDisplayText(
  value:
    string,
  fallback:
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
    : fallback;
}