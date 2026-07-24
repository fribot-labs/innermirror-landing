import type {
    RuntimeRecommendationAdaptiveScoreResult,
} from "./createAdaptiveRecommendationScore";

import {
    normalizeCandidateId,
    normalizeGeneratedAt,
    uniqueStrings,
} from "./runtimeRecommendationMath";

/* ------------------------------------------------------------------ */
/* Adaptive Recommendation Resolution Policy */
/* ------------------------------------------------------------------ */

/**
 * Adaptive Winner를 결정할 때 사용하는 정렬 방향입니다.
 */
export type RuntimeRecommendationAdaptiveResolutionOrder =
  | "ascending"
  | "descending";

/**
 * Adaptive Winner 선택 정책입니다.
 *
 * PR-046C에서는 Shadow Mode 전용으로 사용됩니다.
 * 이 정책은 Base Recommendation을 변경하지 않습니다.
 */
export type RuntimeRecommendationAdaptiveResolutionPolicy = {
  /**
   * Blocking Candidate를 일반 Candidate보다 우선할지 결정합니다.
   *
   * 기본값은 true입니다.
   */
  prioritizeBlockingCandidates:
    boolean;

  /**
   * Adaptive Score 정렬 방향입니다.
   *
   * 기본값은 높은 점수를 우선하는 descending입니다.
   */
  adaptiveScoreOrder:
    RuntimeRecommendationAdaptiveResolutionOrder;

  /**
   * Adaptive Score가 같을 때 Base Score를 비교할지 결정합니다.
   */
  useBaseScoreTieBreaker:
    boolean;

  /**
   * Adaptive Score와 Base Score가 모두 같을 때
   * Candidate의 원래 배열 순서를 사용할지 결정합니다.
   */
  useSourceOrderTieBreaker:
    boolean;

  /**
   * 모든 비교 기준이 동일할 때 Candidate ID를
   * 마지막 결정 기준으로 사용할지 결정합니다.
   */
  useCandidateIdTieBreaker:
    boolean;
};

/**
 * Adaptive Resolution 정책 일부만 덮어쓸 수 있는 입력 타입입니다.
 */
export type PartialRuntimeRecommendationAdaptiveResolutionPolicy = {
  prioritizeBlockingCandidates?:
    boolean;

  adaptiveScoreOrder?:
    RuntimeRecommendationAdaptiveResolutionOrder;

  useBaseScoreTieBreaker?:
    boolean;

  useSourceOrderTieBreaker?:
    boolean;

  useCandidateIdTieBreaker?:
    boolean;
};

/* ------------------------------------------------------------------ */
/* Default Policy */
/* ------------------------------------------------------------------ */

/**
 * PR-046C Shadow Mode용 기본 Adaptive Winner 선택 정책입니다.
 *
 * 비교 순서:
 *
 * 1. Blocking Candidate
 * 2. Adaptive Score
 * 3. Base Score
 * 4. 원래 Candidate 배열 순서
 * 5. Candidate ID
 */
export const DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_RESOLUTION_POLICY:
  RuntimeRecommendationAdaptiveResolutionPolicy = {
  prioritizeBlockingCandidates:
    true,

  adaptiveScoreOrder:
    "descending",

  useBaseScoreTieBreaker:
    true,

  useSourceOrderTieBreaker:
    true,

  useCandidateIdTieBreaker:
    true,
};

/* ------------------------------------------------------------------ */
/* Resolution Status */
/* ------------------------------------------------------------------ */

/**
 * Adaptive Winner Resolution 결과의 상태입니다.
 */
export type RuntimeRecommendationAdaptiveResolutionStatus =
  | "resolved"
  | "single-candidate"
  | "no-candidate";

/**
 * Adaptive Winner가 결정된 핵심 기준입니다.
 */
export type RuntimeRecommendationAdaptiveResolutionReason =
  | "highest-adaptive-score"
  | "blocking-candidate-priority"
  | "base-score-tie-break"
  | "source-order-tie-break"
  | "candidate-id-tie-break"
  | "equal-candidates"
  | "single-candidate"
  | "no-candidate";

/**
 * 두 Candidate를 비교할 때 실제로 차이를 만든 기준입니다.
 */
export type RuntimeRecommendationAdaptiveComparisonCriterion =
  | "blocking-priority"
  | "adaptive-score"
  | "base-score"
  | "source-order"
  | "candidate-id"
  | "equal";

/* ------------------------------------------------------------------ */
/* Ranked Candidate */
/* ------------------------------------------------------------------ */

/**
 * Adaptive Score Result에 Resolution 단계의 순위 정보를 추가한 구조입니다.
 *
 * 원래 Adaptive Score Result는 변경하지 않습니다.
 */
export type RuntimeRecommendationAdaptiveRankedCandidate = {
  candidateId:
    string;

  result:
    RuntimeRecommendationAdaptiveScoreResult;

  /**
   * 입력 배열에서의 원래 위치입니다.
   */
  sourceIndex:
    number;

  /**
   * Adaptive Resolution 이후 순위입니다.
   *
   * 첫 번째 Candidate는 1입니다.
   */
  rank:
    number;
};

/* ------------------------------------------------------------------ */
/* Comparison Trace */
/* ------------------------------------------------------------------ */

/**
 * Winner와 다른 Candidate 사이에서 어떤 기준으로
 * 순위가 갈렸는지 기록합니다.
 */
export type RuntimeRecommendationAdaptiveComparisonTrace = {
  winnerCandidateId:
    string;

  comparedCandidateId:
    string;

  criterion:
    RuntimeRecommendationAdaptiveComparisonCriterion;

  winnerAdaptiveScore:
    number;

  comparedAdaptiveScore:
    number;

  winnerBaseScore:
    number;

  comparedBaseScore:
    number;

  winnerSourceIndex:
    number;

  comparedSourceIndex:
    number;
};

/* ------------------------------------------------------------------ */
/* Resolution Diagnostics */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationAdaptiveResolutionDiagnostics = {
  generatedAt:
    string;

  candidateCount:
    number;

  comparedCandidateIds:
    string[];

  rankedCandidateIds:
    string[];

  winnerCandidateId:
    string | null;

  winnerAdaptiveScore:
    number | null;

  winnerBaseScore:
    number | null;

  winnerIsBlocking:
    boolean | null;

  status:
    RuntimeRecommendationAdaptiveResolutionStatus;

  reason:
    RuntimeRecommendationAdaptiveResolutionReason;

  comparisonTraces:
    RuntimeRecommendationAdaptiveComparisonTrace[];

  warnings:
    string[];
};

/* ------------------------------------------------------------------ */
/* Public Input */
/* ------------------------------------------------------------------ */

export type ResolveAdaptiveRuntimeRecommendationCandidateParams = {
  /**
   * createAdaptiveRecommendationScores()에서 생성된 결과 배열입니다.
   *
   * 입력 배열의 순서는 Source Order Tie-breaker로 사용될 수 있습니다.
   */
  adaptiveScoreResults:
    RuntimeRecommendationAdaptiveScoreResult[];

  policy?:
    PartialRuntimeRecommendationAdaptiveResolutionPolicy;

  /**
   * 테스트 또는 회귀 검증에서 결정적인 시각을 사용할 때 전달합니다.
   */
  generatedAt?:
    string;
};

/* ------------------------------------------------------------------ */
/* Public Result */
/* ------------------------------------------------------------------ */

/**
 * Adaptive Winner Resolution 결과입니다.
 *
 * winner는 Shadow Mode에서 관찰되는 Adaptive Winner이며,
 * Base Recommendation 또는 RuntimeNextAction을 직접 변경하지 않습니다.
 */
export type ResolveAdaptiveRuntimeRecommendationCandidateResult = {
  winner:
    RuntimeRecommendationAdaptiveScoreResult | null;

  rankedCandidates:
    RuntimeRecommendationAdaptiveRankedCandidate[];

  diagnostics:
    RuntimeRecommendationAdaptiveResolutionDiagnostics;

  policy:
    RuntimeRecommendationAdaptiveResolutionPolicy;
};

/* ------------------------------------------------------------------ */
/* Public API */
/* ------------------------------------------------------------------ */

/**
 * Adaptive Score Result 배열에서 Adaptive Winner를 선택합니다.
 *
 * 기본 비교 순서:
 *
 * Blocking Candidate
 * ↓
 * Adaptive Score
 * ↓
 * Base Score
 * ↓
 * Source Order
 * ↓
 * Candidate ID
 *
 * 이 함수는 다음을 수행하지 않습니다.
 *
 * - Base Recommendation 변경
 * - RuntimeNextAction 변경
 * - Adaptive Score 재계산
 * - Adaptive Modifier 재계산
 * - History 또는 Memory 기록
 * - UI 상태 변경
 */
export function resolveAdaptiveRuntimeRecommendationCandidate({
  adaptiveScoreResults,
  policy,
  generatedAt,
}: ResolveAdaptiveRuntimeRecommendationCandidateParams):
  ResolveAdaptiveRuntimeRecommendationCandidateResult {
  const normalizedPolicy =
    normalizeRuntimeRecommendationAdaptiveResolutionPolicy(
      policy
    );

  return resolveAdaptiveRuntimeRecommendationCandidateWithPolicy({
    adaptiveScoreResults,
    policy:
      normalizedPolicy,
    generatedAt:
      normalizeGeneratedAt(
        generatedAt
      ),
  });
}

/* ------------------------------------------------------------------ */
/* Policy Normalization */
/* ------------------------------------------------------------------ */

/**
 * 부분적으로 전달된 Adaptive Resolution 정책을
 * 완전한 정책 객체로 정규화합니다.
 */
export function normalizeRuntimeRecommendationAdaptiveResolutionPolicy(
  policy?:
    PartialRuntimeRecommendationAdaptiveResolutionPolicy
): RuntimeRecommendationAdaptiveResolutionPolicy {
  const fallback =
    DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_RESOLUTION_POLICY;

  const adaptiveScoreOrder =
    policy?.adaptiveScoreOrder === "ascending" ||
    policy?.adaptiveScoreOrder === "descending"
      ? policy.adaptiveScoreOrder
      : fallback.adaptiveScoreOrder;

  return {
    prioritizeBlockingCandidates:
      typeof policy
        ?.prioritizeBlockingCandidates ===
        "boolean"
        ? policy
            .prioritizeBlockingCandidates
        : fallback
            .prioritizeBlockingCandidates,

    adaptiveScoreOrder,

    useBaseScoreTieBreaker:
      typeof policy
        ?.useBaseScoreTieBreaker ===
        "boolean"
        ? policy
            .useBaseScoreTieBreaker
        : fallback
            .useBaseScoreTieBreaker,

    useSourceOrderTieBreaker:
      typeof policy
        ?.useSourceOrderTieBreaker ===
        "boolean"
        ? policy
            .useSourceOrderTieBreaker
        : fallback
            .useSourceOrderTieBreaker,

    useCandidateIdTieBreaker:
      typeof policy
        ?.useCandidateIdTieBreaker ===
        "boolean"
        ? policy
            .useCandidateIdTieBreaker
        : fallback
            .useCandidateIdTieBreaker,
  };
}

/**
 * Adaptive Resolution 정책의 독립적인 복사본을 만듭니다.
 */
export function cloneRuntimeRecommendationAdaptiveResolutionPolicy(
  policy:
    RuntimeRecommendationAdaptiveResolutionPolicy
): RuntimeRecommendationAdaptiveResolutionPolicy {
  return {
    prioritizeBlockingCandidates:
      policy
        .prioritizeBlockingCandidates,

    adaptiveScoreOrder:
      policy
        .adaptiveScoreOrder,

    useBaseScoreTieBreaker:
      policy
        .useBaseScoreTieBreaker,

    useSourceOrderTieBreaker:
      policy
        .useSourceOrderTieBreaker,

    useCandidateIdTieBreaker:
      policy
        .useCandidateIdTieBreaker,
  };
}

/* ------------------------------------------------------------------ */
/* Internal Function Contracts */
/* ------------------------------------------------------------------ */

/**
 * Part 2에서 실제 Comparator와 Resolver 구현을 이어서 작성합니다.
 */
type ResolveAdaptiveRuntimeRecommendationCandidateWithPolicyParams = {
  adaptiveScoreResults:
    RuntimeRecommendationAdaptiveScoreResult[];

  policy:
    RuntimeRecommendationAdaptiveResolutionPolicy;

  generatedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Resolver */
/* ------------------------------------------------------------------ */

function resolveAdaptiveRuntimeRecommendationCandidateWithPolicy({
  adaptiveScoreResults,
  policy,
  generatedAt,
}: ResolveAdaptiveRuntimeRecommendationCandidateWithPolicyParams):
  ResolveAdaptiveRuntimeRecommendationCandidateResult {
  const warnings: string[] = [];

  if (adaptiveScoreResults.length === 0) {
    return {
      winner: null,

      rankedCandidates: [],

      diagnostics:
        createAdaptiveRecommendationResolutionDiagnostics({
          rankedCandidates: [],
          generatedAt,
          status: "no-candidate",
          reason: "no-candidate",
          warnings: [
            "No Adaptive Score candidates were available for resolution.",
          ],
          policy,
        }),

      policy:
        cloneRuntimeRecommendationAdaptiveResolutionPolicy(
          policy
        ),
    };
  }

  const duplicateCandidateIds =
    findDuplicateAdaptiveCandidateIds(
      adaptiveScoreResults
    );

  if (duplicateCandidateIds.length > 0) {
    warnings.push(
      [
        "Duplicate Adaptive Score candidate IDs were detected:",
        duplicateCandidateIds.join(", "),
      ].join(" ")
    );
  }

  const invalidBaseScoreCandidateIds =
    adaptiveScoreResults
      .filter(
        (result) =>
          !Number.isFinite(
            result.baseScore
          )
        )
        .map(
          (result) =>
            result.candidateId
        );

    if (
      invalidBaseScoreCandidateIds.length >
      0
    ) {
      throw new Error(
        [
          "Adaptive Resolution received non-finite Base Scores.",
          `candidateIds="${invalidBaseScoreCandidateIds.join(", ")}"`,
        ].join(" ")
      );
    }

  const invalidAdaptiveScoreCandidateIds =
    adaptiveScoreResults
      .filter(
        (result) =>
          !Number.isFinite(
            result.adaptiveScore
          )
      )
      .map(
        (result) =>
          result.candidateId
      );

  if (
    invalidAdaptiveScoreCandidateIds.length >
    0
  ) {
    throw new Error(
      [
        "Adaptive Resolution received non-finite Adaptive Scores.",
        `candidateIds="${invalidAdaptiveScoreCandidateIds.join(", ")}"`,
      ].join(" ")
    );
  }

  const rankedCandidates =
    rankAdaptiveRecommendationCandidates({
      adaptiveScoreResults,
      policy,
    });

  const winnerRankedCandidate =
    rankedCandidates[0] ?? null;

  const winner =
    winnerRankedCandidate?.result ??
    null;

  const status:
    RuntimeRecommendationAdaptiveResolutionStatus =
      rankedCandidates.length === 1
        ? "single-candidate"
        : "resolved";

  const reason =
    resolveAdaptiveRecommendationResolutionReason({
      rankedCandidates,
      policy,
    });

  return {
    winner,

    rankedCandidates,

    diagnostics:
      createAdaptiveRecommendationResolutionDiagnostics({
        rankedCandidates,
        generatedAt,
        status,
        reason,
        warnings,
        policy,
      }),

    policy:
      cloneRuntimeRecommendationAdaptiveResolutionPolicy(
        policy
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Comparator */
/* ------------------------------------------------------------------ */

type CompareAdaptiveRecommendationCandidatesParams = {
  left:
    RuntimeRecommendationAdaptiveRankedCandidate;

  right:
    RuntimeRecommendationAdaptiveRankedCandidate;

  policy:
    RuntimeRecommendationAdaptiveResolutionPolicy;
};

type CompareAdaptiveRecommendationCandidatesResult = {
  comparison:
    number;

  criterion:
    RuntimeRecommendationAdaptiveComparisonCriterion;
};

/**
 * Adaptive Candidate 두 개를 비교합니다.
 *
 * 우선순위
 *
 * 1. Blocking Candidate
 * 2. Adaptive Score
 * 3. Base Score
 * 4. Source Order
 * 5. Candidate ID
 */
function compareAdaptiveRecommendationCandidates({
  left,
  right,
  policy,
}: CompareAdaptiveRecommendationCandidatesParams):
  CompareAdaptiveRecommendationCandidatesResult {

  /*
   * ------------------------------------------------------------
   * Blocking Candidate
   * ------------------------------------------------------------
   */

  if (
    policy.prioritizeBlockingCandidates
  ) {
    const leftBlocking =
      left.result
        .scoredCandidate
        .candidate
        .isBlocking;

    const rightBlocking =
      right.result
        .scoredCandidate
        .candidate
        .isBlocking;

    if (
      leftBlocking !==
      rightBlocking
    ) {
      return {
        comparison:
          leftBlocking
            ? -1
            : 1,

        criterion:
          "blocking-priority",
      };
    }
  }

  /*
   * ------------------------------------------------------------
   * Adaptive Score
   * ------------------------------------------------------------
   */

  if (
    left.result.adaptiveScore !==
    right.result.adaptiveScore
  ) {
    const descending =
      policy.adaptiveScoreOrder ===
      "descending";

    return {
      comparison:
        descending
          ? right.result.adaptiveScore -
            left.result.adaptiveScore
          : left.result.adaptiveScore -
            right.result.adaptiveScore,

      criterion:
        "adaptive-score",
    };
  }

  /*
   * ------------------------------------------------------------
   * Base Score
   * ------------------------------------------------------------
   */

  if (
    policy.useBaseScoreTieBreaker &&
    left.result.baseScore !==
      right.result.baseScore
  ) {
    return {
      comparison:
        right.result.baseScore -
        left.result.baseScore,

      criterion:
        "base-score",
    };
  }

  /*
   * ------------------------------------------------------------
   * Source Order
   * ------------------------------------------------------------
   */

  if (
    policy.useSourceOrderTieBreaker &&
    left.sourceIndex !==
      right.sourceIndex
  ) {
    return {
      comparison:
        left.sourceIndex -
        right.sourceIndex,

      criterion:
        "source-order",
    };
  }

  /*
   * ------------------------------------------------------------
   * Candidate ID
   * ------------------------------------------------------------
   */

  if (
    policy.useCandidateIdTieBreaker
  ) {
    const comparison =
      left.candidateId.localeCompare(
        right.candidateId
      );

    if (
      comparison !== 0
    ) {
      return {
        comparison,

        criterion:
          "candidate-id",
      };
    }
  }

  return {
    comparison: 0,
    criterion: "equal",
  };
}

/* ------------------------------------------------------------------ */
/* Ranking */
/* ------------------------------------------------------------------ */

type RankAdaptiveRecommendationCandidatesParams = {
  adaptiveScoreResults:
    RuntimeRecommendationAdaptiveScoreResult[];

  policy:
    RuntimeRecommendationAdaptiveResolutionPolicy;
};

function rankAdaptiveRecommendationCandidates({
  adaptiveScoreResults,
  policy,
}: RankAdaptiveRecommendationCandidatesParams):
  RuntimeRecommendationAdaptiveRankedCandidate[] {

  const ranked:
    RuntimeRecommendationAdaptiveRankedCandidate[] =
      adaptiveScoreResults.map(
        (
          result,
          sourceIndex
        ) => ({
          candidateId:
            normalizeCandidateId(
              result.candidateId
            ),

          result,

          sourceIndex,

          rank:
            0,
        })
      );

  ranked.sort(
    (
      left,
      right
    ) =>
      compareAdaptiveRecommendationCandidates({
        left,
        right,
        policy,
      }).comparison
  );

  ranked.forEach(
    (
      candidate,
      index
    ) => {
      candidate.rank =
        index + 1;
    }
  );

  return ranked;
}

/* ------------------------------------------------------------------ */
/* Resolution Reason */
/* ------------------------------------------------------------------ */

type ResolveAdaptiveRecommendationResolutionReasonParams = {
  rankedCandidates:
    RuntimeRecommendationAdaptiveRankedCandidate[];

  policy:
    RuntimeRecommendationAdaptiveResolutionPolicy;
};

function resolveAdaptiveRecommendationResolutionReason({
  rankedCandidates,
  policy,
}: ResolveAdaptiveRecommendationResolutionReasonParams):
  RuntimeRecommendationAdaptiveResolutionReason {
  if (
    rankedCandidates.length === 0
  ) {
    return "no-candidate";
  }

  if (
    rankedCandidates.length === 1
  ) {
    return "single-candidate";
  }

  const winner =
    rankedCandidates[0];

  const runnerUp =
    rankedCandidates[1];

  const comparison =
    compareAdaptiveRecommendationCandidates({
      left:
        winner,

      right:
        runnerUp,

      policy,
    });

  switch (
    comparison.criterion
  ) {
    case "blocking-priority":
      return "blocking-candidate-priority";

    case "adaptive-score":
      return "highest-adaptive-score";

    case "base-score":
      return "base-score-tie-break";

    case "source-order":
      return "source-order-tie-break";

    case "candidate-id":
      return "candidate-id-tie-break";

    case "equal":
      return "equal-candidates";

    default:
      return "equal-candidates";
  }
}

/* ------------------------------------------------------------------ */
/* Diagnostics */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationResolutionDiagnosticsParams = {
  rankedCandidates:
    RuntimeRecommendationAdaptiveRankedCandidate[];

  generatedAt:
    string;

  status:
    RuntimeRecommendationAdaptiveResolutionStatus;

  reason:
    RuntimeRecommendationAdaptiveResolutionReason;

  warnings:
    string[];

  policy:
    RuntimeRecommendationAdaptiveResolutionPolicy;
};

function createAdaptiveRecommendationResolutionDiagnostics({
  rankedCandidates,
  generatedAt,
  status,
  reason,
  warnings,
  policy,
}: CreateAdaptiveRecommendationResolutionDiagnosticsParams):
  RuntimeRecommendationAdaptiveResolutionDiagnostics {
  const winner =
    rankedCandidates[0] ??
    null;

  const comparisonTraces =
    createAdaptiveRecommendationComparisonTraces({
      rankedCandidates,
      policy,
    });

  const diagnosticsWarnings =
    [...warnings];

  if (
    winner === null &&
    status !== "no-candidate"
  ) {
    diagnosticsWarnings.push(
      "Adaptive Resolution completed without a winner."
    );
  }

  if (
    winner !== null &&
    !Number.isFinite(
      winner.result.adaptiveScore
    )
  ) {
    diagnosticsWarnings.push(
      `Winner candidate "${winner.candidateId}" has a non-finite Adaptive Score.`
    );
  }

  if (
    winner !== null &&
    winner.result.candidateId !==
      winner.result.scoredCandidate.candidateId
  ) {
    diagnosticsWarnings.push(
      [
        `Winner Adaptive Score candidate ID "${winner.result.candidateId}"`,
        "does not match its Base Scored Candidate ID",
        `"${winner.result.scoredCandidate.candidateId}".`,
      ].join(" ")
    );
  }

  const candidateWarnings =
    rankedCandidates.flatMap(
      (rankedCandidate) =>
        rankedCandidate
          .result
          .diagnostics
          .warnings
          .map(
            (warning) =>
              [
                `Candidate "${rankedCandidate.candidateId}":`,
                warning,
              ].join(" ")
          )
    );

  diagnosticsWarnings.push(
    ...candidateWarnings
  );

  return {
    generatedAt,

    candidateCount:
      rankedCandidates.length,

    comparedCandidateIds:
      rankedCandidates
        .slice(1)
        .map(
          (candidate) =>
            candidate.candidateId
        ),

    rankedCandidateIds:
      rankedCandidates.map(
        (candidate) =>
          candidate.candidateId
      ),

    winnerCandidateId:
      winner?.candidateId ??
      null,

    winnerAdaptiveScore:
      winner?.result.adaptiveScore ??
      null,

    winnerBaseScore:
      winner?.result.baseScore ??
      null,

    winnerIsBlocking:
      winner
        ? winner
            .result
            .scoredCandidate
            .candidate
            .isBlocking
        : null,

    status,

    reason,

    comparisonTraces,

    warnings:
      uniqueStrings(
        diagnosticsWarnings
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Comparison Traces */
/* ------------------------------------------------------------------ */

type CreateAdaptiveRecommendationComparisonTracesParams = {
  rankedCandidates:
    RuntimeRecommendationAdaptiveRankedCandidate[];

  policy:
    RuntimeRecommendationAdaptiveResolutionPolicy;
};

function createAdaptiveRecommendationComparisonTraces({
  rankedCandidates,
  policy,
}: CreateAdaptiveRecommendationComparisonTracesParams):
  RuntimeRecommendationAdaptiveComparisonTrace[] {
  const winner =
    rankedCandidates[0];

  if (
    winner === undefined
  ) {
    return [];
  }

  return rankedCandidates
    .slice(1)
    .map(
      (
        comparedCandidate
      ):
        RuntimeRecommendationAdaptiveComparisonTrace => {
        const comparison =
          compareAdaptiveRecommendationCandidates({
            left:
              winner,

            right:
              comparedCandidate,

            policy,
          });

        return {
          winnerCandidateId:
            winner.candidateId,

          comparedCandidateId:
            comparedCandidate.candidateId,

          criterion:
            comparison.criterion,

          winnerAdaptiveScore:
            winner.result.adaptiveScore,

          comparedAdaptiveScore:
            comparedCandidate
              .result
              .adaptiveScore,

          winnerBaseScore:
            winner.result.baseScore,

          comparedBaseScore:
            comparedCandidate
              .result
              .baseScore,

          winnerSourceIndex:
            winner.sourceIndex,

          comparedSourceIndex:
            comparedCandidate
              .sourceIndex,
        };
      }
    );
}

/* ------------------------------------------------------------------ */
/* Validation Helpers */
/* ------------------------------------------------------------------ */

function findDuplicateAdaptiveCandidateIds(
  adaptiveScoreResults:
    RuntimeRecommendationAdaptiveScoreResult[]
): string[] {
  const counts =
    new Map<
      string,
      number
    >();

  for (
    const result of
    adaptiveScoreResults
  ) {
    const candidateId =
      normalizeCandidateId(
        result.candidateId
      );

    counts.set(
      candidateId,
      (
        counts.get(
          candidateId
        ) ??
        0
      ) +
      1
    );
  }

  return Array.from(
    counts.entries()
  )
    .filter(
      (
        [, count]
      ) =>
        count > 1
    )
    .map(
      (
        [candidateId]
      ) =>
        candidateId
    );
}