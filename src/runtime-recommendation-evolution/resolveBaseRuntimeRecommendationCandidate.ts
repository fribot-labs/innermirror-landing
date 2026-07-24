import type {
    RuntimeNextAction,
} from "../runtime-next-action/runtimeNextActionTypes";

import type {
    RuntimeRecommendationCandidate,
    RuntimeRecommendationCandidateScoringDiagnostics,
    RuntimeRecommendationScoredCandidate,
} from "./createRuntimeRecommendationCandidateScore";

/* ------------------------------------------------------------------ */
/* Resolution Types */
/* ------------------------------------------------------------------ */

/**
 * Base Candidate를 선택할 때 사용한 최종 판정 이유입니다.
 */
export type RuntimeRecommendationBaseResolutionReason =
  | "no-candidates"
  | "single-candidate"
  | "blocking-priority"
  | "higher-base-score"
  | "higher-structural-priority"
  | "earlier-generation-order"
  | "stable-candidate-id";

/**
 * Winner와 Runner-up 사이의 Base Score 차이를 나타냅니다.
 */
export type RuntimeRecommendationBaseScoreMargin = {
  winnerScore:
    number;

  runnerUpScore:
    number;

  absolute:
    number;

  normalized:
    number;
};

/**
 * Candidate 하나의 Base Rank 진단 정보입니다.
 */
export type RuntimeRecommendationBaseRankDiagnostic = {
  candidateId:
    string;

  rank:
    number;

  baseScore:
    number;

  isBlocking:
    boolean;

  basePriority:
    number;

  generationOrder:
    number;

  kind:
    RuntimeNextAction["kind"];

  target:
    RuntimeNextAction["target"];

  source:
    RuntimeNextAction["source"];

  isWinner:
    boolean;

  isRunnerUp:
    boolean;
};

/**
 * Base Candidate 선택 과정의 Diagnostics입니다.
 */
export type RuntimeRecommendationBaseResolutionDiagnostics = {
  generatedAt:
    string;

  candidateCount:
    number;

  blockingCandidateCount:
    number;

  winnerCandidateId:
    string | null;

  runnerUpCandidateId:
    string | null;

  resolutionReason:
    RuntimeRecommendationBaseResolutionReason;

  scoreMargin:
    RuntimeRecommendationBaseScoreMargin | null;

  rankings:
    RuntimeRecommendationBaseRankDiagnostic[];

  warnings:
    string[];

  scoringDiagnostics:
    RuntimeRecommendationCandidateScoringDiagnostics | null;
};

/**
 * Base Candidate Resolver의 전체 결과입니다.
 */
export type RuntimeRecommendationBaseResolutionResult = {
  /**
   * Base Score 기준으로 선택된 Candidate입니다.
   */
  winner:
    RuntimeRecommendationScoredCandidate | null;

  /**
   * 두 번째 순위 Candidate입니다.
   */
  runnerUp:
    RuntimeRecommendationScoredCandidate | null;

  /**
   * Winner의 RuntimeNextAction 편의 접근값입니다.
   */
  action:
    RuntimeNextAction | null;

  /**
   * Base Score가 높은 순서로 정렬된 Candidate 배열입니다.
   *
   * 입력 배열은 변경하지 않습니다.
   */
  rankedCandidates:
    RuntimeRecommendationScoredCandidate[];

  resolutionReason:
    RuntimeRecommendationBaseResolutionReason;

  scoreMargin:
    RuntimeRecommendationBaseScoreMargin | null;

  diagnostics:
    RuntimeRecommendationBaseResolutionDiagnostics;
};

/* ------------------------------------------------------------------ */
/* Public Input */
/* ------------------------------------------------------------------ */

export type ResolveBaseRuntimeRecommendationCandidateParams = {
  scoredCandidates:
    RuntimeRecommendationScoredCandidate[];

  /**
   * createRuntimeRecommendationCandidateScores()에서 생성된
   * Diagnostics를 전달할 수 있습니다.
   */
  scoringDiagnostics?:
    RuntimeRecommendationCandidateScoringDiagnostics | null;

  /**
   * 테스트에서 결정적인 generatedAt 값이 필요한 경우 사용합니다.
   */
  generatedAt?:
    string;
};

/* ------------------------------------------------------------------ */
/* Public Resolver */
/* ------------------------------------------------------------------ */

/**
 * Base Score만 사용하여 실제 Recommendation Candidate를 선택합니다.
 *
 * 정렬 순서:
 *
 * 1. Blocking Candidate 우선
 * 2. 높은 Base Score
 * 3. 높은 원래 Base Priority
 * 4. 빠른 Generation Order
 * 5. 안정적인 Candidate ID
 *
 * Adaptive Modifier는 이 함수에서 사용하지 않습니다.
 */
export function resolveBaseRuntimeRecommendationCandidate({
  scoredCandidates,
  scoringDiagnostics =
    null,
  generatedAt,
}: ResolveBaseRuntimeRecommendationCandidateParams):
  RuntimeRecommendationBaseResolutionResult {
  const normalizedCandidates =
    normalizeScoredCandidates(
      scoredCandidates
    );

  const rankedCandidates =
    [...normalizedCandidates].sort(
      compareBaseRuntimeRecommendationCandidates
    );

  const winner =
    rankedCandidates[0] ??
    null;

  const runnerUp =
    rankedCandidates[1] ??
    null;

  const resolutionReason =
    resolveBaseResolutionReason({
      winner,
      runnerUp,
    });

  const scoreMargin =
    createBaseScoreMargin({
      winner,
      runnerUp,
    });

  const normalizedGeneratedAt =
    normalizeGeneratedAt(
      generatedAt ??
      scoringDiagnostics?.generatedAt
    );

  const diagnostics =
    createBaseResolutionDiagnostics({
      rankedCandidates,
      winner,
      runnerUp,
      resolutionReason,
      scoreMargin,
      scoringDiagnostics,
      generatedAt:
        normalizedGeneratedAt,
    });

  return {
    winner,

    runnerUp,

    action:
      winner?.candidate.action ??
      null,

    rankedCandidates,

    resolutionReason,

    scoreMargin,

    diagnostics,
  };
}

/**
 * Candidate 배열만 전달하여 Winner를 직접 반환하는 편의 함수입니다.
 */
export function resolveBaseRuntimeRecommendationWinner(
  scoredCandidates:
    RuntimeRecommendationScoredCandidate[]
): RuntimeRecommendationScoredCandidate | null {
  return resolveBaseRuntimeRecommendationCandidate({
    scoredCandidates,
  }).winner;
}

/**
 * Candidate 배열만 전달하여 최종 RuntimeNextAction을 반환합니다.
 *
 * 이후 createRuntimeNextAction()을 Candidate 기반 구조로 변경할 때
 * 사용할 수 있습니다.
 */
export function resolveBaseRuntimeRecommendationAction(
  scoredCandidates:
    RuntimeRecommendationScoredCandidate[]
): RuntimeNextAction | null {
  return resolveBaseRuntimeRecommendationCandidate({
    scoredCandidates,
  }).action;
}

/* ------------------------------------------------------------------ */
/* Candidate Comparator */
/* ------------------------------------------------------------------ */

/**
 * Base Candidate의 결정적인 정렬 함수입니다.
 *
 * Array.prototype.sort()에 직접 전달할 수 있습니다.
 */
export function compareBaseRuntimeRecommendationCandidates(
  left:
    RuntimeRecommendationScoredCandidate,
  right:
    RuntimeRecommendationScoredCandidate
): number {
  const blockingComparison =
    compareBooleanDescending(
      left.candidate.isBlocking,
      right.candidate.isBlocking
    );

  if (
    blockingComparison !== 0
  ) {
    return blockingComparison;
  }

  const scoreComparison =
    compareNumberDescending(
      left.baseScore,
      right.baseScore
    );

  if (
    scoreComparison !== 0
  ) {
    return scoreComparison;
  }

  const basePriorityComparison =
    compareNumberDescending(
      left.candidate.basePriority,
      right.candidate.basePriority
    );

  if (
    basePriorityComparison !== 0
  ) {
    return basePriorityComparison;
  }

  const generationOrderComparison =
    compareNumberAscending(
      left.candidate.generationOrder,
      right.candidate.generationOrder
    );

  if (
    generationOrderComparison !== 0
  ) {
    return generationOrderComparison;
  }

  return compareTextAscending(
    left.candidateId,
    right.candidateId
  );
}

/**
 * 두 Candidate 중 Base 기준 우선 Candidate를 반환합니다.
 *
 * 완전히 같은 객체가 아니어도 Comparator 기준으로 판정합니다.
 */
export function selectPreferredBaseRuntimeRecommendationCandidate(
  left:
    RuntimeRecommendationScoredCandidate,
  right:
    RuntimeRecommendationScoredCandidate
): RuntimeRecommendationScoredCandidate {
  return compareBaseRuntimeRecommendationCandidates(
    left,
    right
  ) <= 0
    ? left
    : right;
}

/* ------------------------------------------------------------------ */
/* Resolution Reason */
/* ------------------------------------------------------------------ */

type ResolveBaseResolutionReasonParams = {
  winner:
    RuntimeRecommendationScoredCandidate | null;

  runnerUp:
    RuntimeRecommendationScoredCandidate | null;
};

function resolveBaseResolutionReason({
  winner,
  runnerUp,
}: ResolveBaseResolutionReasonParams):
  RuntimeRecommendationBaseResolutionReason {
  if (
    winner === null
  ) {
    return "no-candidates";
  }

  if (
    runnerUp === null
  ) {
    return "single-candidate";
  }

  if (
    winner.candidate.isBlocking !==
    runnerUp.candidate.isBlocking
  ) {
    return "blocking-priority";
  }

  if (
    winner.baseScore !==
    runnerUp.baseScore
  ) {
    return "higher-base-score";
  }

  if (
    winner.candidate.basePriority !==
    runnerUp.candidate.basePriority
  ) {
    return "higher-structural-priority";
  }

  if (
    winner.candidate.generationOrder !==
    runnerUp.candidate.generationOrder
  ) {
    return "earlier-generation-order";
  }

  return "stable-candidate-id";
}

/* ------------------------------------------------------------------ */
/* Score Margin */
/* ------------------------------------------------------------------ */

type CreateBaseScoreMarginParams = {
  winner:
    RuntimeRecommendationScoredCandidate | null;

  runnerUp:
    RuntimeRecommendationScoredCandidate | null;
};

function createBaseScoreMargin({
  winner,
  runnerUp,
}: CreateBaseScoreMarginParams):
  RuntimeRecommendationBaseScoreMargin | null {
  if (
    winner === null ||
    runnerUp === null
  ) {
    return null;
  }

  const winnerScore =
    normalizeFiniteNumber(
      winner.baseScore,
      0
    );

  const runnerUpScore =
    normalizeFiniteNumber(
      runnerUp.baseScore,
      0
    );

  const absolute =
    Math.max(
      0,
      winnerScore -
      runnerUpScore
    );

  const normalized =
    winnerScore > 0
      ? absolute /
        winnerScore
      : 0;

  return {
    winnerScore:
      roundNumber(
        winnerScore,
        4
      ),

    runnerUpScore:
      roundNumber(
        runnerUpScore,
        4
      ),

    absolute:
      roundNumber(
        absolute,
        4
      ),

    normalized:
      roundNumber(
        normalized,
        6
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Diagnostics */
/* ------------------------------------------------------------------ */

type CreateBaseResolutionDiagnosticsParams = {
  rankedCandidates:
    RuntimeRecommendationScoredCandidate[];

  winner:
    RuntimeRecommendationScoredCandidate | null;

  runnerUp:
    RuntimeRecommendationScoredCandidate | null;

  resolutionReason:
    RuntimeRecommendationBaseResolutionReason;

  scoreMargin:
    RuntimeRecommendationBaseScoreMargin | null;

  scoringDiagnostics:
    RuntimeRecommendationCandidateScoringDiagnostics | null;

  generatedAt:
    string;
};

function createBaseResolutionDiagnostics({
  rankedCandidates,
  winner,
  runnerUp,
  resolutionReason,
  scoreMargin,
  scoringDiagnostics,
  generatedAt,
}: CreateBaseResolutionDiagnosticsParams):
  RuntimeRecommendationBaseResolutionDiagnostics {
  const warnings:
    string[] = [];

  if (
    rankedCandidates.length === 0
  ) {
    warnings.push(
      "No scored recommendation candidates were available for base resolution."
    );
  }

  if (
    hasDuplicateCandidateIds(
      rankedCandidates
    )
  ) {
    warnings.push(
      "Duplicate candidate IDs were detected during base resolution."
    );
  }

  if (
    hasNonFiniteBaseScore(
      rankedCandidates
    )
  ) {
    warnings.push(
      "One or more candidates contained a non-finite base score and were normalized during resolution."
    );
  }

  if (
    winner !== null &&
    runnerUp !== null &&
    winner.candidate.isBlocking &&
    runnerUp.candidate.isBlocking &&
    winner.baseScore ===
      runnerUp.baseScore
  ) {
    warnings.push(
      "Multiple blocking candidates shared the same base score. Structural tie-breakers selected the winner."
    );
  }

  if (
    scoringDiagnostics !== null &&
    scoringDiagnostics.candidateCount !==
      rankedCandidates.length
  ) {
    warnings.push(
      "Scoring diagnostics candidate count does not match the base resolution candidate count."
    );
  }

  return {
    generatedAt,

    candidateCount:
      rankedCandidates.length,

    blockingCandidateCount:
      rankedCandidates.filter(
        ({ candidate }) =>
          candidate.isBlocking
      ).length,

    winnerCandidateId:
      winner?.candidateId ??
      null,

    runnerUpCandidateId:
      runnerUp?.candidateId ??
      null,

    resolutionReason,

    scoreMargin,

    rankings:
      rankedCandidates.map(
        (
          scoredCandidate,
          index
        ) =>
          createBaseRankDiagnostic({
            scoredCandidate,

            rank:
              index +
              1,

            winnerCandidateId:
              winner?.candidateId ??
              null,

            runnerUpCandidateId:
              runnerUp?.candidateId ??
              null,
          })
      ),

    warnings,

    scoringDiagnostics,
  };
}

type CreateBaseRankDiagnosticParams = {
  scoredCandidate:
    RuntimeRecommendationScoredCandidate;

  rank:
    number;

  winnerCandidateId:
    string | null;

  runnerUpCandidateId:
    string | null;
};

function createBaseRankDiagnostic({
  scoredCandidate,
  rank,
  winnerCandidateId,
  runnerUpCandidateId,
}: CreateBaseRankDiagnosticParams):
  RuntimeRecommendationBaseRankDiagnostic {
  const {
    candidate,
    candidateId,
    baseScore,
  } =
    scoredCandidate;

  return {
    candidateId,

    rank,

    baseScore:
      normalizeFiniteNumber(
        baseScore,
        0
      ),

    isBlocking:
      candidate.isBlocking,

    basePriority:
      normalizeFiniteNumber(
        candidate.basePriority,
        0
      ),

    generationOrder:
      normalizeNonNegativeInteger(
        candidate.generationOrder
      ),

    kind:
      candidate.action.kind,

    target:
      candidate.action.target,

    source:
      candidate.action.source,

    isWinner:
      candidateId ===
      winnerCandidateId,

    isRunnerUp:
      candidateId ===
      runnerUpCandidateId,
  };
}

/* ------------------------------------------------------------------ */
/* Candidate Normalization */
/* ------------------------------------------------------------------ */

/**
 * 입력 배열을 변경하지 않고, Resolver에서 필요한 숫자값만
 * 안전하게 정규화한 복사본을 생성합니다.
 *
 * 원래 Candidate와 Score Breakdown은 유지합니다.
 */
function normalizeScoredCandidates(
  scoredCandidates:
    RuntimeRecommendationScoredCandidate[]
): RuntimeRecommendationScoredCandidate[] {
  return scoredCandidates.map(
    (
      scoredCandidate,
      index
    ) => {
      const normalizedCandidate:
        RuntimeRecommendationCandidate = {
        ...scoredCandidate.candidate,

        id:
          normalizeCandidateId(
            scoredCandidate.candidate.id,
            index
          ),

        generationOrder:
          normalizeNonNegativeInteger(
            scoredCandidate.candidate
              .generationOrder
          ),

        basePriority:
          normalizeFiniteNumber(
            scoredCandidate.candidate
              .basePriority,
            0
          ),
      };

      const normalizedBaseScore =
        normalizeFiniteNumber(
          scoredCandidate.baseScore,
          0
        );

      return {
        ...scoredCandidate,

        candidate:
          normalizedCandidate,

        candidateId:
          normalizeCandidateId(
            scoredCandidate.candidateId ||
              normalizedCandidate.id,
            index
          ),

        baseScore:
          normalizedBaseScore,
      };
    }
  );
}

/* ------------------------------------------------------------------ */
/* Equivalence Utilities */
/* ------------------------------------------------------------------ */

/**
 * 두 Scored Candidate가 같은 구조적 Recommendation을 의미하는지
 * 비교합니다.
 *
 * title이나 description은 비교하지 않습니다.
 */
export function areBaseRuntimeRecommendationCandidatesEquivalent(
  left:
    RuntimeRecommendationScoredCandidate | null,
  right:
    RuntimeRecommendationScoredCandidate | null
): boolean {
  if (
    left === null &&
    right === null
  ) {
    return true;
  }

  if (
    left === null ||
    right === null
  ) {
    return false;
  }

  return (
    normalizeText(
      left.candidate.action.kind
    ) ===
      normalizeText(
        right.candidate.action.kind
      ) &&
    normalizeNullableText(
      left.candidate.action.target
    ) ===
      normalizeNullableText(
        right.candidate.action.target
      ) &&
    normalizeText(
      left.candidate.action.source
    ) ===
      normalizeText(
        right.candidate.action.source
      )
  );
}

/**
 * Resolver 결과가 특정 RuntimeNextAction과 동일한 구조인지 비교합니다.
 */
export function doesBaseRuntimeRecommendationMatchAction(
  result:
    RuntimeRecommendationBaseResolutionResult,
  action:
    RuntimeNextAction | null
): boolean {
  if (
    result.action === null &&
    action === null
  ) {
    return true;
  }

  if (
    result.action === null ||
    action === null
  ) {
    return false;
  }

  return (
    normalizeText(
      result.action.kind
    ) ===
      normalizeText(
        action.kind
      ) &&
    normalizeNullableText(
      result.action.target
    ) ===
      normalizeNullableText(
        action.target
      ) &&
    normalizeText(
      result.action.source
    ) ===
      normalizeText(
        action.source
      )
  );
}

/* ------------------------------------------------------------------ */
/* Collection Validation */
/* ------------------------------------------------------------------ */

function hasDuplicateCandidateIds(
  scoredCandidates:
    RuntimeRecommendationScoredCandidate[]
): boolean {
  const ids =
    scoredCandidates.map(
      ({ candidateId }) =>
        normalizeText(
          candidateId
        )
    );

  return (
    new Set(
      ids
    ).size !==
    ids.length
  );
}

function hasNonFiniteBaseScore(
  scoredCandidates:
    RuntimeRecommendationScoredCandidate[]
): boolean {
  return scoredCandidates.some(
    ({ baseScore }) =>
      !Number.isFinite(
        baseScore
      )
  );
}

/* ------------------------------------------------------------------ */
/* Comparison Helpers */
/* ------------------------------------------------------------------ */

function compareBooleanDescending(
  left:
    boolean,
  right:
    boolean
): number {
  if (
    left === right
  ) {
    return 0;
  }

  return left
    ? -1
    : 1;
}

function compareNumberDescending(
  left:
    number,
  right:
    number
): number {
  const normalizedLeft =
    normalizeFiniteNumber(
      left,
      0
    );

  const normalizedRight =
    normalizeFiniteNumber(
      right,
      0
    );

  return (
    normalizedRight -
    normalizedLeft
  );
}

function compareNumberAscending(
  left:
    number,
  right:
    number
): number {
  const normalizedLeft =
    normalizeFiniteNumber(
      left,
      0
    );

  const normalizedRight =
    normalizeFiniteNumber(
      right,
      0
    );

  return (
    normalizedLeft -
    normalizedRight
  );
}

function compareTextAscending(
  left:
    string,
  right:
    string
): number {
  return normalizeText(
    left
  ).localeCompare(
    normalizeText(
      right
    )
  );
}

/* ------------------------------------------------------------------ */
/* Primitive Helpers */
/* ------------------------------------------------------------------ */

function normalizeCandidateId(
  value:
    string | null | undefined,
  fallbackIndex:
    number
): string {
  if (
    typeof value !==
    "string"
  ) {
    return `runtime-recommendation-candidate-${fallbackIndex}`;
  }

  const normalized =
    value
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  return normalized.length > 0
    ? normalized
    : `runtime-recommendation-candidate-${fallbackIndex}`;
}

function normalizeGeneratedAt(
  value:
    string | null | undefined
): string {
  if (
    typeof value ===
      "string" &&
    !Number.isNaN(
      Date.parse(
        value
      )
    )
  ) {
    return new Date(
      value
    ).toISOString();
  }

  return new Date().toISOString();
}

function normalizeFiniteNumber(
  value:
    number | null | undefined,
  fallback:
    number
): number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value
    )
  )
    ? value
    : fallback;
}

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

function normalizeText(
  value:
    string
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /\s+/g,
      "-"
    );
}

function normalizeNullableText(
  value:
    string | null
): string | null {
  if (
    value === null
  ) {
    return null;
  }

  const normalized =
    normalizeText(
      value
    );

  return normalized.length > 0
    ? normalized
    : null;
}

function roundNumber(
  value:
    number,
  decimalPlaces:
    number
): number {
  const safeDecimalPlaces =
    Math.max(
      0,
      Math.min(
        8,
        Math.floor(
          decimalPlaces
        )
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