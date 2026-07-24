import type {
  RuntimeRecommendationScoredCandidate,
} from "./createRuntimeRecommendationCandidateScore";

import type {
  RuntimeRecommendationAdaptiveScoreResult,
} from "./createAdaptiveRecommendationScore";

import type {
  ResolveAdaptiveRuntimeRecommendationCandidateResult,
  RuntimeRecommendationAdaptiveRankedCandidate,
} from "./resolveAdaptiveRuntimeRecommendationCandidate";

import {
  normalizeCandidateId,
  normalizeGeneratedAt,
  roundNumber,
  uniqueStrings,
} from "./runtimeRecommendationMath";

/* ------------------------------------------------------------------ */
/* Comparison Status */
/* ------------------------------------------------------------------ */

/**
 * Base Winner와 Adaptive Winner의 비교 상태입니다.
 *
 * PR-046C에서는 Adaptive Winner가 Shadow 결과이므로
 * "changed"는 실제 RuntimeNextAction이 변경되었다는 의미가 아닙니다.
 */
export type RuntimeRecommendationShadowComparisonStatus =
  | "unchanged"
  | "changed"
  | "base-winner-only"
  | "adaptive-winner-only"
  | "no-winner";

/**
 * Base Winner와 Adaptive Winner의 관계를 설명합니다.
 */
export type RuntimeRecommendationShadowComparisonReason =
  | "same-candidate-remained-winner"
  | "adaptive-scoring-selected-different-candidate"
  | "adaptive-resolution-did-not-produce-winner"
  | "base-resolution-did-not-produce-winner"
  | "neither-resolution-produced-winner";

/* ------------------------------------------------------------------ */
/* Winner Snapshot */
/* ------------------------------------------------------------------ */

/**
 * Comparison Layer에서 사용하는 Base Winner의 읽기 전용 요약입니다.
 */
export type RuntimeRecommendationBaseWinnerSnapshot = {
  candidateId:
    string;

  baseScore:
    number;

  isBlocking:
    boolean;
};

/**
 * Comparison Layer에서 사용하는 Adaptive Winner의 읽기 전용 요약입니다.
 */
export type RuntimeRecommendationAdaptiveWinnerSnapshot = {
  candidateId:
    string;

  baseScore:
    number;

  adaptiveModifier:
    number;

  adaptiveScore:
    number;

  scoreDelta:
    number;

  adaptiveRank:
    number;

  isBlocking:
    boolean;
};

/* ------------------------------------------------------------------ */
/* Score Comparison */
/* ------------------------------------------------------------------ */

/**
 * Base Winner와 Adaptive Winner 사이의 점수 차이를 기록합니다.
 *
 * 서로 다른 Candidate가 Winner인 경우:
 *
 * - baseScoreDifference:
 *   Base Winner의 Base Score - Adaptive Winner의 Base Score
 *
 * - adaptiveScoreDifference:
 *   Adaptive Winner의 Adaptive Score -
 *   Base Winner Candidate의 Adaptive Score
 */
export type RuntimeRecommendationShadowScoreComparison = {
  baseWinnerBaseScore:
    number | null;

  /**
   * Base Winner Candidate가 Adaptive Scoring을 거친 점수입니다.
   */
  baseWinnerAdaptiveScore:
    number | null;

  baseWinnerAdaptiveModifier:
    number | null;

  adaptiveWinnerBaseScore:
    number | null;

  adaptiveWinnerAdaptiveScore:
    number | null;

  adaptiveWinnerAdaptiveModifier:
    number | null;

  /**
   * Base Winner가 Base Scoring에서 Adaptive Winner보다
   * 얼마나 앞섰는지를 나타냅니다.
   */
  baseScoreDifference:
    number | null;

  /**
   * Adaptive Winner가 Adaptive Scoring에서 Base Winner보다
   * 얼마나 앞섰는지를 나타냅니다.
   */
  adaptiveScoreDifference:
    number | null;
};

/* ------------------------------------------------------------------ */
/* Comparison Diagnostics */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationShadowComparisonDiagnostics = {
  generatedAt:
    string;

  status:
    RuntimeRecommendationShadowComparisonStatus;

  reason:
    RuntimeRecommendationShadowComparisonReason;

  baseCandidateId:
    string | null;

  adaptiveCandidateId:
    string | null;

  sameCandidate:
    boolean;

  winnerChanged:
    boolean;

  blockingStatusChanged:
    boolean;

  baseWinnerAdaptiveRank:
    number | null;

  adaptiveWinnerRank:
    number | null;

  adaptiveCandidateCount:
    number;

  warnings:
    string[];
};

/* ------------------------------------------------------------------ */
/* Public Input */
/* ------------------------------------------------------------------ */

export type CompareBaseAndAdaptiveRuntimeRecommendationsParams = {
  /**
   * 기존 Base Recommendation Resolver가 선택한 Winner입니다.
   *
   * PR-046C에서는 이 Winner가 실제 Runtime Recommendation으로
   * 계속 유지됩니다.
   */
  baseWinner:
    RuntimeRecommendationScoredCandidate | null;

  /**
   * Shadow Mode에서 계산된 Adaptive Resolution 전체 결과입니다.
   */
  adaptiveResolution:
    ResolveAdaptiveRuntimeRecommendationCandidateResult;

  /**
   * 테스트 또는 회귀 검증에서 결정적인 시각을 사용할 때 전달합니다.
   */
  generatedAt?:
    string;

  /**
   * 점수 차이를 반올림할 소수점 자리 수입니다.
   *
   * 기본값은 4입니다.
   */
  decimalPlaces?:
    number;
};

/* ------------------------------------------------------------------ */
/* Public Result */
/* ------------------------------------------------------------------ */

export type CompareBaseAndAdaptiveRuntimeRecommendationsResult = {
  /**
   * 기존 Base Winner를 그대로 보존합니다.
   */
  baseWinner:
    RuntimeRecommendationScoredCandidate | null;

  /**
   * Adaptive Shadow Winner입니다.
   *
   * 실제 RuntimeNextAction에는 적용되지 않습니다.
   */
  adaptiveWinner:
    RuntimeRecommendationAdaptiveScoreResult | null;

  baseWinnerSnapshot:
    RuntimeRecommendationBaseWinnerSnapshot | null;

  adaptiveWinnerSnapshot:
    RuntimeRecommendationAdaptiveWinnerSnapshot | null;

  /**
   * Adaptive Result 목록에서 찾은 Base Winner Candidate의 결과입니다.
   */
  baseWinnerAdaptiveResult:
    RuntimeRecommendationAdaptiveScoreResult | null;

  scoreComparison:
    RuntimeRecommendationShadowScoreComparison;

  diagnostics:
    RuntimeRecommendationShadowComparisonDiagnostics;
};

/* ------------------------------------------------------------------ */
/* Public API */
/* ------------------------------------------------------------------ */

/**
 * 기존 Base Winner와 Shadow Adaptive Winner를 비교합니다.
 *
 * 이 함수는 다음을 수행하지 않습니다.
 *
 * - Base Winner 변경
 * - Adaptive Winner 재계산
 * - RuntimeNextAction 변경
 * - Candidate Score 재계산
 * - Adaptive Modifier 재계산
 * - History 또는 Memory 기록
 * - UI 상태 변경
 *
 * PR-046C에서는 오직 두 Resolution 결과 사이의 차이를
 * 관찰하고 Diagnostics로 반환합니다.
 */
export function compareBaseAndAdaptiveRuntimeRecommendations({
  baseWinner,
  adaptiveResolution,
  generatedAt,
  decimalPlaces,
}: CompareBaseAndAdaptiveRuntimeRecommendationsParams):
  CompareBaseAndAdaptiveRuntimeRecommendationsResult {
  const safeDecimalPlaces =
    normalizeComparisonDecimalPlaces(
      decimalPlaces
    );

  const adaptiveWinner =
    adaptiveResolution.winner;

  validateComparisonScores({
    baseWinner,
    adaptiveResolution,
  });

  const baseCandidateId =
    baseWinner === null
      ? null
      : normalizeCandidateId(
          baseWinner.candidateId
        );

  const adaptiveCandidateId =
    adaptiveWinner === null
      ? null
      : normalizeCandidateId(
          adaptiveWinner.candidateId
        );

  const baseWinnerRankedCandidate =
    findRankedCandidateByCandidateId({
      rankedCandidates:
        adaptiveResolution.rankedCandidates,

      candidateId:
        baseCandidateId,
    });

  const adaptiveWinnerRankedCandidate =
    findRankedCandidateByCandidateId({
      rankedCandidates:
        adaptiveResolution.rankedCandidates,

      candidateId:
        adaptiveCandidateId,
    });

  const baseWinnerAdaptiveResult =
    baseWinnerRankedCandidate?.result ??
    null;

  const sameCandidate =
    baseCandidateId !== null &&
    adaptiveCandidateId !== null &&
    baseCandidateId ===
      adaptiveCandidateId;

  const status =
    resolveRuntimeRecommendationShadowComparisonStatus({
      baseWinner,
      adaptiveWinner,
      sameCandidate,
    });

  const reason =
    resolveRuntimeRecommendationShadowComparisonReason({
      status,
    });

  const blockingStatusChanged =
    baseWinner !== null &&
    adaptiveWinner !== null
      ? baseWinner
          .candidate
          .isBlocking !==
        adaptiveWinner
          .scoredCandidate
          .candidate
          .isBlocking
      : false;

  const warnings =
    createRuntimeRecommendationShadowComparisonWarnings({
      baseWinner,
      adaptiveWinner,
      baseWinnerAdaptiveResult,
      adaptiveResolution,
    });

  const result:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult = {
    baseWinner,

    adaptiveWinner,

    baseWinnerSnapshot:
      createBaseWinnerSnapshot(
        baseWinner
      ),

    adaptiveWinnerSnapshot:
      createAdaptiveWinnerSnapshot({
        adaptiveWinner,
        rankedCandidate:
          adaptiveWinnerRankedCandidate,
      }),

    baseWinnerAdaptiveResult,

    scoreComparison:
      createRuntimeRecommendationShadowScoreComparison({
        baseWinner,
        adaptiveWinner,
        baseWinnerAdaptiveResult,
        decimalPlaces:
          safeDecimalPlaces,
      }),

    diagnostics: {
      generatedAt:
        normalizeGeneratedAt(
          generatedAt
        ),

      status,

      reason,

      baseCandidateId,

      adaptiveCandidateId,

      sameCandidate,

      winnerChanged:
        status === "changed",

      blockingStatusChanged,

      baseWinnerAdaptiveRank:
        baseWinnerRankedCandidate
          ?.rank ??
        null,

      adaptiveWinnerRank:
        adaptiveWinnerRankedCandidate
          ?.rank ??
        null,

      adaptiveCandidateCount:
        adaptiveResolution
          .rankedCandidates
          .length,

      warnings:
        uniqueStrings(
          warnings
        ),
    },
  };

  return result;
}

/* ------------------------------------------------------------------ */
/* Comparison Status */
/* ------------------------------------------------------------------ */

type ResolveRuntimeRecommendationShadowComparisonStatusParams = {
  baseWinner:
    RuntimeRecommendationScoredCandidate | null;

  adaptiveWinner:
    RuntimeRecommendationAdaptiveScoreResult | null;

  sameCandidate:
    boolean;
};

function resolveRuntimeRecommendationShadowComparisonStatus({
  baseWinner,
  adaptiveWinner,
  sameCandidate,
}: ResolveRuntimeRecommendationShadowComparisonStatusParams):
  RuntimeRecommendationShadowComparisonStatus {
  if (
    baseWinner === null &&
    adaptiveWinner === null
  ) {
    return "no-winner";
  }

  if (
    baseWinner !== null &&
    adaptiveWinner === null
  ) {
    return "base-winner-only";
  }

  if (
    baseWinner === null &&
    adaptiveWinner !== null
  ) {
    return "adaptive-winner-only";
  }

  return sameCandidate
    ? "unchanged"
    : "changed";
}

/* ------------------------------------------------------------------ */
/* Comparison Reason */
/* ------------------------------------------------------------------ */

type ResolveRuntimeRecommendationShadowComparisonReasonParams = {
  status:
    RuntimeRecommendationShadowComparisonStatus;
};

function resolveRuntimeRecommendationShadowComparisonReason({
  status,
}: ResolveRuntimeRecommendationShadowComparisonReasonParams):
  RuntimeRecommendationShadowComparisonReason {
  switch (status) {
    case "unchanged":
      return "same-candidate-remained-winner";

    case "changed":
      return "adaptive-scoring-selected-different-candidate";

    case "base-winner-only":
      return "adaptive-resolution-did-not-produce-winner";

    case "adaptive-winner-only":
      return "base-resolution-did-not-produce-winner";

    case "no-winner":
    default:
      return "neither-resolution-produced-winner";
  }
}

/* ------------------------------------------------------------------ */
/* Winner Snapshots */
/* ------------------------------------------------------------------ */

function createBaseWinnerSnapshot(
  baseWinner:
    RuntimeRecommendationScoredCandidate | null
): RuntimeRecommendationBaseWinnerSnapshot | null {
  if (baseWinner === null) {
    return null;
  }

  return {
    candidateId:
      normalizeCandidateId(
        baseWinner.candidateId
      ),

    baseScore:
      baseWinner.baseScore,

    isBlocking:
      baseWinner
        .candidate
        .isBlocking,
  };
}

type CreateAdaptiveWinnerSnapshotParams = {
  adaptiveWinner:
    RuntimeRecommendationAdaptiveScoreResult | null;

  rankedCandidate:
    RuntimeRecommendationAdaptiveRankedCandidate | null;
};

function createAdaptiveWinnerSnapshot({
  adaptiveWinner,
  rankedCandidate,
}: CreateAdaptiveWinnerSnapshotParams):
  RuntimeRecommendationAdaptiveWinnerSnapshot | null {
  if (adaptiveWinner === null) {
    return null;
  }

  return {
    candidateId:
      normalizeCandidateId(
        adaptiveWinner.candidateId
      ),

    baseScore:
      adaptiveWinner.baseScore,

    adaptiveModifier:
      adaptiveWinner.adaptiveModifier,

    adaptiveScore:
      adaptiveWinner.adaptiveScore,

    scoreDelta:
      adaptiveWinner.scoreDelta,

    adaptiveRank:
      rankedCandidate?.rank ??
      1,

    isBlocking:
      adaptiveWinner
        .scoredCandidate
        .candidate
        .isBlocking,
  };
}

/* ------------------------------------------------------------------ */
/* Score Comparison */
/* ------------------------------------------------------------------ */

type CreateRuntimeRecommendationShadowScoreComparisonParams = {
  baseWinner:
    RuntimeRecommendationScoredCandidate | null;

  adaptiveWinner:
    RuntimeRecommendationAdaptiveScoreResult | null;

  baseWinnerAdaptiveResult:
    RuntimeRecommendationAdaptiveScoreResult | null;

  decimalPlaces:
    number;
};

function createRuntimeRecommendationShadowScoreComparison({
  baseWinner,
  adaptiveWinner,
  baseWinnerAdaptiveResult,
  decimalPlaces,
}: CreateRuntimeRecommendationShadowScoreComparisonParams):
  RuntimeRecommendationShadowScoreComparison {
  const baseWinnerBaseScore =
    baseWinner?.baseScore ??
    null;

  const baseWinnerAdaptiveScore =
    baseWinnerAdaptiveResult
      ?.adaptiveScore ??
    null;

  const baseWinnerAdaptiveModifier =
    baseWinnerAdaptiveResult
      ?.adaptiveModifier ??
    null;

  const adaptiveWinnerBaseScore =
    adaptiveWinner?.baseScore ??
    null;

  const adaptiveWinnerAdaptiveScore =
    adaptiveWinner?.adaptiveScore ??
    null;

  const adaptiveWinnerAdaptiveModifier =
    adaptiveWinner
      ?.adaptiveModifier ??
    null;

  return {
    baseWinnerBaseScore,

    baseWinnerAdaptiveScore,

    baseWinnerAdaptiveModifier,

    adaptiveWinnerBaseScore,

    adaptiveWinnerAdaptiveScore,

    adaptiveWinnerAdaptiveModifier,

    baseScoreDifference:
      baseWinnerBaseScore !== null &&
      adaptiveWinnerBaseScore !== null
        ? roundNumber(
            baseWinnerBaseScore -
              adaptiveWinnerBaseScore,
            decimalPlaces
          )
        : null,

    adaptiveScoreDifference:
      adaptiveWinnerAdaptiveScore !== null &&
      baseWinnerAdaptiveScore !== null
        ? roundNumber(
            adaptiveWinnerAdaptiveScore -
              baseWinnerAdaptiveScore,
            decimalPlaces
          )
        : null,
  };
}

/* ------------------------------------------------------------------ */
/* Ranked Candidate Lookup */
/* ------------------------------------------------------------------ */

type FindRankedCandidateByCandidateIdParams = {
  rankedCandidates:
    RuntimeRecommendationAdaptiveRankedCandidate[];

  candidateId:
    string | null;
};

function findRankedCandidateByCandidateId({
  rankedCandidates,
  candidateId,
}: FindRankedCandidateByCandidateIdParams):
  RuntimeRecommendationAdaptiveRankedCandidate | null {
  if (candidateId === null) {
    return null;
  }

  return (
    rankedCandidates.find(
      (rankedCandidate) =>
        normalizeCandidateId(
          rankedCandidate.candidateId
        ) ===
        candidateId
    ) ??
    null
  );
}

/* ------------------------------------------------------------------ */
/* Validation */
/* ------------------------------------------------------------------ */

type ValidateComparisonScoresParams = {
  baseWinner:
    RuntimeRecommendationScoredCandidate | null;

  adaptiveResolution:
    ResolveAdaptiveRuntimeRecommendationCandidateResult;
};

function validateComparisonScores({
  baseWinner,
  adaptiveResolution,
}: ValidateComparisonScoresParams):
  void {
  if (
    baseWinner !== null &&
    !Number.isFinite(
      baseWinner.baseScore
    )
  ) {
    throw new Error(
      [
        "Shadow Comparison received a non-finite Base Winner score.",
        `candidateId="${baseWinner.candidateId}"`,
      ].join(" ")
    );
  }

  for (
    const rankedCandidate of
    adaptiveResolution.rankedCandidates
  ) {
    if (
      !Number.isFinite(
        rankedCandidate
          .result
          .baseScore
      )
    ) {
      throw new Error(
        [
          "Shadow Comparison received a non-finite Base Score.",
          `candidateId="${rankedCandidate.candidateId}"`,
        ].join(" ")
      );
    }

    if (
      !Number.isFinite(
        rankedCandidate
          .result
          .adaptiveScore
      )
    ) {
      throw new Error(
        [
          "Shadow Comparison received a non-finite Adaptive Score.",
          `candidateId="${rankedCandidate.candidateId}"`,
        ].join(" ")
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Diagnostics Warnings */
/* ------------------------------------------------------------------ */

type CreateRuntimeRecommendationShadowComparisonWarningsParams = {
  baseWinner:
    RuntimeRecommendationScoredCandidate | null;

  adaptiveWinner:
    RuntimeRecommendationAdaptiveScoreResult | null;

  baseWinnerAdaptiveResult:
    RuntimeRecommendationAdaptiveScoreResult | null;

  adaptiveResolution:
    ResolveAdaptiveRuntimeRecommendationCandidateResult;
};

function createRuntimeRecommendationShadowComparisonWarnings({
  baseWinner,
  adaptiveWinner,
  baseWinnerAdaptiveResult,
  adaptiveResolution,
}: CreateRuntimeRecommendationShadowComparisonWarningsParams):
  string[] {
  const warnings: string[] = [];

  if (
    baseWinner !== null &&
    baseWinnerAdaptiveResult === null
  ) {
    warnings.push(
      [
        "The Base Winner was not found in the Adaptive Resolution candidates.",
        `candidateId="${baseWinner.candidateId}"`,
      ].join(" ")
    );
  }

  if (
    adaptiveWinner !== null &&
    adaptiveResolution
      .rankedCandidates
      .length === 0
  ) {
    warnings.push(
      "Adaptive Resolution returned a winner without ranked candidates."
    );
  }

  if (
    adaptiveWinner === null &&
    adaptiveResolution
      .rankedCandidates
      .length > 0
  ) {
    warnings.push(
      "Adaptive Resolution contains ranked candidates but no winner."
    );
  }

  if (
    adaptiveWinner !== null
  ) {
    const rankedWinner =
      adaptiveResolution
        .rankedCandidates[0]
        ?.result ??
      null;

    if (
      rankedWinner === null ||
      normalizeCandidateId(
        rankedWinner.candidateId
      ) !==
        normalizeCandidateId(
          adaptiveWinner.candidateId
        )
    ) {
      warnings.push(
        "Adaptive Winner does not match the first ranked Adaptive Candidate."
      );
    }
  }

  warnings.push(
    ...adaptiveResolution
      .diagnostics
      .warnings
      .map(
        (warning) =>
          `Adaptive resolution diagnostics: ${warning}`
      )
  );

  return warnings;
}

/* ------------------------------------------------------------------ */
/* Primitive Helpers */
/* ------------------------------------------------------------------ */

function normalizeComparisonDecimalPlaces(
  value:
    number | undefined
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 4;
  }

  return Math.max(
    0,
    Math.min(
      8,
      Math.floor(value)
    )
  );
}