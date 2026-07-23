import type {
    RuntimeNextAction,
} from "../runtime-next-action/runtimeNextActionTypes";

import type {
    RuntimeRecommendationPriorityClass,
    RuntimeRecommendationStabilityCandidate,
} from "./runtimeRecommendationStabilityTypes";

/* ------------------------------------------------------------------ */
/* Public Input */
/* ------------------------------------------------------------------ */

/**
 * 이미 Base Recommendation Resolver에서 선택된 RuntimeNextAction을
 * Stability Candidate로 변환하기 위한 입력입니다.
 *
 * PR-046B에서는 History 기반 Adaptive Score를 사용하지 않습니다.
 */
export type ResolveRuntimeRecommendationCandidateParams = {
  /**
   * createRuntimeNextAction()에서 선택된 현재 Recommendation입니다.
   *
   * null이면 Stability Candidate도 null을 반환합니다.
   */
  action:
    RuntimeNextAction | null;

  /**
   * 실제 Runtime Context가 변경되었는지를 식별하는 Revision입니다.
   *
   * React rerender마다 변경되는 시간값을 사용하면 안 됩니다.
   */
  contextRevision:
    string;

  /**
   * 외부에서 Base Score를 명시적으로 전달해야 하는 경우 사용합니다.
   *
   * 생략하면 confidence, source, isActionable을 기준으로
   * 안정적인 기본 점수를 생성합니다.
   */
  scoreOverride?:
    number;

  /**
   * 외부에서 blocking 여부를 명시적으로 결정해야 하는 경우
   * 기본 Priority 판정을 덮어씁니다.
   */
  priorityClassOverride?:
    RuntimeRecommendationPriorityClass;
};

/* ------------------------------------------------------------------ */
/* Score Breakdown */
/* ------------------------------------------------------------------ */

/**
 * PR-046B 내부 Diagnostics와 테스트에서 Base Score가 어떻게
 * 생성되었는지 확인하기 위한 구조입니다.
 *
 * Stability Candidate에는 최종 score만 저장됩니다.
 */
export type RuntimeRecommendationBaseScoreBreakdown = {
  confidenceScore:
    number;

  actionabilityModifier:
    number;

  sourceModifier:
    number;

  priorityModifier:
    number;

  rawScore:
    number;

  finalScore:
    number;
};

/* ------------------------------------------------------------------ */
/* Resolution Result */
/* ------------------------------------------------------------------ */

/**
 * App 통합에서는 candidate만 사용해도 됩니다.
 *
 * scoreBreakdown은 개발 Diagnostics와 테스트를 위해 함께 제공합니다.
 */
export type ResolveRuntimeRecommendationCandidateResult = {
  candidate:
    RuntimeRecommendationStabilityCandidate | null;

  scoreBreakdown:
    RuntimeRecommendationBaseScoreBreakdown | null;
};

/* ------------------------------------------------------------------ */
/* Public Resolver */
/* ------------------------------------------------------------------ */

/**
 * 최종 RuntimeNextAction을 Recommendation Stability Candidate로
 * 변환합니다.
 *
 * 현재 파이프라인:
 *
 * createRuntimeNextAction()
 * ↓
 * resolveRuntimeRecommendationCandidate()
 * ↓
 * useStableRuntimeRecommendation()
 * ↓
 * Stable RuntimeNextAction
 */
export function resolveRuntimeRecommendationCandidate({
  action,
  contextRevision,
  scoreOverride,
  priorityClassOverride,
}: ResolveRuntimeRecommendationCandidateParams):
  RuntimeRecommendationStabilityCandidate | null {
  return resolveRuntimeRecommendationCandidateWithDiagnostics({
    action,

    contextRevision,

    scoreOverride,

    priorityClassOverride,
  }).candidate;
}

/* ------------------------------------------------------------------ */
/* Resolver with Diagnostics */
/* ------------------------------------------------------------------ */

export function resolveRuntimeRecommendationCandidateWithDiagnostics({
  action,
  contextRevision,
  scoreOverride,
  priorityClassOverride,
}: ResolveRuntimeRecommendationCandidateParams):
  ResolveRuntimeRecommendationCandidateResult {
  if (
    action === null
  ) {
    return {
      candidate:
        null,

      scoreBreakdown:
        null,
    };
  }

  const priorityClass =
    priorityClassOverride ??
    resolveRuntimeRecommendationPriorityClass(
      action
    );

  const scoreBreakdown =
    createRuntimeRecommendationBaseScore({
      action,

      priorityClass,

      scoreOverride,
    });

  return {
    candidate: {
      action,

      score:
        scoreBreakdown.finalScore,

      priorityClass,

      contextRevision:
        normalizeContextRevision(
          contextRevision
        ),
    },

    scoreBreakdown,
  };
}

/* ------------------------------------------------------------------ */
/* Priority Resolution */
/* ------------------------------------------------------------------ */

/**
 * Recommendation이 일반 Stability 조건을 따라야 하는지,
 * 즉시 반영할 수 있는 blocking Recommendation인지 판정합니다.
 *
 * title이나 description 문자열은 사용하지 않습니다.
 * Recommendation의 구조적 kind와 실행 가능 여부만 사용합니다.
 */
export function resolveRuntimeRecommendationPriorityClass(
  action:
    RuntimeNextAction
): RuntimeRecommendationPriorityClass {
  const normalizedKind =
    normalizeOptionalText(
      action.kind
    );

  /*
   * 실행할 수 없는 Recommendation은 현재 Context의 선행 조건이
   * 충족되지 않은 상태일 가능성이 높으므로 blocking으로 처리합니다.
   */
  if (
    action.isActionable === false
  ) {
    return "blocking";
  }

  if (
    normalizedKind === null
  ) {
    return "normal";
  }

  if (
    isBlockingRecommendationKind(
      normalizedKind
    )
  ) {
    return "blocking";
  }

  return "normal";
}

/**
 * 현재 RuntimeNextActionKind에 존재할 수 있는 선행 조건 계열을
 * 문자열 기반으로 안전하게 판정합니다.
 *
 * RuntimeNextActionKind union이 확장되어도 이 파일이 바로 깨지지 않도록
 * exhaustive switch 대신 정규화된 문자열 집합을 사용합니다.
 */
function isBlockingRecommendationKind(
  kind:
    string
): boolean {
  return BLOCKING_RECOMMENDATION_KINDS.has(
    kind
  );
}

const BLOCKING_RECOMMENDATION_KINDS =
  new Set<string>([
    "select-project",
    "connect-github",
    "analyze-github",
    "insufficient-context",
    "provide-context",
  ]);

/* ------------------------------------------------------------------ */
/* Base Score */
/* ------------------------------------------------------------------ */

type CreateRuntimeRecommendationBaseScoreParams = {
  action:
    RuntimeNextAction;

  priorityClass:
    RuntimeRecommendationPriorityClass;

  scoreOverride:
    number | undefined;
};

/**
 * Stability 비교에 사용할 Base Score를 생성합니다.
 *
 * 이 점수는 Recommendation 품질 점수가 아닙니다.
 *
 * 목적:
 *
 * - 이미 선택된 Recommendation의 현재 우선도를 근사
 * - Challenger와 Stable 사이의 의미 있는 차이를 표현
 * - PR-046C Adaptive Modifier가 추가될 자리를 보존
 */
export function createRuntimeRecommendationBaseScore({
  action,
  priorityClass,
  scoreOverride,
}: CreateRuntimeRecommendationBaseScoreParams):
  RuntimeRecommendationBaseScoreBreakdown {
  if (
    typeof scoreOverride === "number" &&
    Number.isFinite(
      scoreOverride
    )
  ) {
    const normalizedOverride =
      normalizeRecommendationScore(
        scoreOverride
      );

    return {
      confidenceScore:
        normalizedOverride,

      actionabilityModifier:
        0,

      sourceModifier:
        0,

      priorityModifier:
        0,

      rawScore:
        normalizedOverride,

      finalScore:
        normalizedOverride,
    };
  }

  const confidenceScore =
    resolveConfidenceBaseScore(
      action.confidence
    );

  const actionabilityModifier =
    resolveActionabilityModifier(
      action
    );

  const sourceModifier =
    resolveSourceModifier(
      action.source
    );

  const priorityModifier =
    priorityClass === "blocking"
      ? 15
      : 0;

  const rawScore =
    confidenceScore +
    actionabilityModifier +
    sourceModifier +
    priorityModifier;

  return {
    confidenceScore,

    actionabilityModifier,

    sourceModifier,

    priorityModifier,

    rawScore,

    finalScore:
      normalizeRecommendationScore(
        rawScore
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Confidence Score */
/* ------------------------------------------------------------------ */

/**
 * RuntimeNextAction confidence를 Stability용 Base Score로 변환합니다.
 *
 * 점수 간격을 충분히 두어 minimumScoreMargin 정책이
 * 의미 있게 작동하도록 합니다.
 */
function resolveConfidenceBaseScore(
  confidence:
    RuntimeNextAction["confidence"]
): number {
  switch (
    normalizeOptionalText(
      confidence
    )
  ) {
    case "high":
      return 80;

    case "medium":
      return 65;

    case "low":
      return 50;

    default:
      return 55;
  }
}

/* ------------------------------------------------------------------ */
/* Actionability Modifier */
/* ------------------------------------------------------------------ */

/**
 * 사용자가 즉시 실행할 수 있는 Recommendation에는 작은 가산점을 줍니다.
 *
 * 실행 불가능한 Action은 Priority Class에서 blocking으로 처리되므로
 * 여기서는 과도한 감점을 적용하지 않습니다.
 */
function resolveActionabilityModifier(
  action:
    RuntimeNextAction
): number {
  if (
    action.isActionable === true
  ) {
    return 5;
  }

  if (
    action.isActionable === false
  ) {
    return 0;
  }

  return 2;
}

/* ------------------------------------------------------------------ */
/* Source Modifier */
/* ------------------------------------------------------------------ */

/**
 * 현재 프로젝트 상태에서 직접 도출된 Recommendation에
 * 아주 작은 우선도 차이를 부여합니다.
 *
 * Source Modifier는 Confidence보다 강해지면 안 됩니다.
 */
function resolveSourceModifier(
  source:
    RuntimeNextAction["source"]
): number {
  switch (
    normalizeOptionalText(
      source
    )
  ) {
    case "project-state":
      return 4;

    case "recommended-focus":
      return 3;

    case "decision-review":
      return 3;

    case "adaptive-coaching":
      return 2;

    case "next-question":
      return 2;

    case "next-interpretation":
      return 1;

    case "fallback":
      return 0;

    default:
      return 0;
  }
}

/* ------------------------------------------------------------------ */
/* Context Revision Builder */
/* ------------------------------------------------------------------ */

/**
 * App에서 안정적인 contextRevision을 만들 때 사용할 수 있는
 * 편의 Builder입니다.
 *
 * 각 값은 실제 Runtime Context가 바뀔 때만 변경되어야 합니다.
 */
export type CreateRuntimeRecommendationContextRevisionParams = {
  reflectionCount:
    number;

  githubSnapshotRevision:
    string | null;

  currentFocus:
    string | null;

  connectedEventCount:
    number;

  runtimeAnalysisRevision:
    string | null;

  hasReflectionDraft?:
    boolean;
};

/**
 * Stability Observation 중복 방지를 위한 Context Revision을 만듭니다.
 *
 * 현재 시각은 포함하지 않습니다.
 */
export function createRuntimeRecommendationContextRevision({
  reflectionCount,
  githubSnapshotRevision,
  currentFocus,
  connectedEventCount,
  runtimeAnalysisRevision,
  hasReflectionDraft =
    false,
}: CreateRuntimeRecommendationContextRevisionParams):
  string {
  return [
    "runtime-recommendation-context-v1",

    `reflection-count:${normalizeNonNegativeInteger(
      reflectionCount
    )}`,

    `github:${normalizeRevisionPart(
      githubSnapshotRevision,
      "no-github-snapshot"
    )}`,

    `focus:${normalizeRevisionPart(
      currentFocus,
      "no-current-focus"
    )}`,

    `connected-events:${normalizeNonNegativeInteger(
      connectedEventCount
    )}`,

    `runtime:${normalizeRevisionPart(
      runtimeAnalysisRevision,
      "no-runtime-analysis"
    )}`,

    hasReflectionDraft
      ? "reflection-draft:present"
      : "reflection-draft:absent",
  ].join("::");
}

/* ------------------------------------------------------------------ */
/* Candidate Comparison */
/* ------------------------------------------------------------------ */

/**
 * 두 Stability Candidate의 구조적 값이 동일한지 확인합니다.
 *
 * React 객체 참조 동일성은 사용하지 않습니다.
 */
export function areRuntimeRecommendationCandidatesEqual(
  left:
    RuntimeRecommendationStabilityCandidate | null,
  right:
    RuntimeRecommendationStabilityCandidate | null
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
    normalizeOptionalText(
      left.action.kind
    ) ===
      normalizeOptionalText(
        right.action.kind
      ) &&
    normalizeOptionalText(
      left.action.target
    ) ===
      normalizeOptionalText(
        right.action.target
      ) &&
    normalizeOptionalText(
      left.action.source
    ) ===
      normalizeOptionalText(
        right.action.source
      ) &&
    left.score ===
      right.score &&
    left.priorityClass ===
      right.priorityClass &&
    left.contextRevision ===
      right.contextRevision
  );
}

/* ------------------------------------------------------------------ */
/* Score Helpers */
/* ------------------------------------------------------------------ */

/**
 * Stability Base Score를 0~100 범위로 제한합니다.
 */
function normalizeRecommendationScore(
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
      100,
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

function roundNumber(
  value:
    number,
  decimalPlaces:
    number
): number {
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
/* Text Helpers */
/* ------------------------------------------------------------------ */

function normalizeContextRevision(
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
    : "unknown-context";
}

function normalizeRevisionPart(
  value:
    string | null | undefined,
  fallback:
    string
): string {
  if (
    typeof value !== "string"
  ) {
    return fallback;
  }

  const normalized =
    value
      .trim()
      .replace(
        /\s+/g,
        " "
      )
      .replace(
        /:+/g,
        "-"
      );

  return normalized.length > 0
    ? normalized
    : fallback;
}

function normalizeOptionalText(
  value:
    string | null | undefined
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value
      .trim()
      .toLowerCase();

  return normalized.length > 0
    ? normalized
    : null;
}