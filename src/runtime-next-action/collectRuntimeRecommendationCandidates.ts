import type {
  RuntimeRecommendationCandidate as LegacyRuntimeRecommendationCandidate,
} from "./runtimeRecommendationCandidateTypes";

import type {
  RuntimeNextAction,
} from "./runtimeNextActionTypes";

import type {
  RuntimeNextActionRuleParams,
} from "./runtimeNextActionRules";

import {
  createAdaptiveCoachingCandidate,
  createContinuityCandidate,
  createCurrentFocusFallbackCandidate,
  createDecisionReviewCandidate,
  createInsufficientContextCandidate,
  createMissingGitHubContextCandidate,
  createMissingGitHubSnapshotCandidate,
  createMissingReflectionCandidate,
  createNextInterpretationCandidate,
  createNextQuestionCandidate,
  createRecommendedFocusCandidate,
  createReflectionDraftOnlyCandidate,
  createReflectionDraftWithGitHubCandidate,
} from "./runtimeNextActionRules";

import type {
  RuntimeRecommendationCandidate,
  RuntimeRecommendationCandidateContext,
  RuntimeRecommendationCandidateRule,
} from "../runtime-recommendation-evolution/createRuntimeRecommendationCandidateScore";

/* ------------------------------------------------------------------ */
/* Public Result */
/* ------------------------------------------------------------------ */

export type CollectRuntimeRecommendationCandidatesResult = {
  candidates:
    RuntimeRecommendationCandidate[];

  context:
    RuntimeRecommendationCandidateContext;

  candidateCount:
    number;

  meaningfulCandidateCount:
    number;

  fallbackUsed:
    boolean;

  hasBlockingCandidate:
    boolean;
};

/* ------------------------------------------------------------------ */
/* Internal Candidate Factory */
/* ------------------------------------------------------------------ */

type RuntimeRecommendationCandidateFactory = (
  params:
    RuntimeNextActionRuleParams
) =>
  LegacyRuntimeRecommendationCandidate | null;

type RuntimeRecommendationCandidateFactoryDefinition = {
  factory:
    RuntimeRecommendationCandidateFactory;

  fallback:
    boolean;
};

/**
 * Candidate 생성 순서는 기존 Recommendation Engine의 규칙 순서를
 * 그대로 보존합니다.
 *
 * generationOrder는 완전 동점일 때만 사용하는 결정적 tie-breaker입니다.
 */
const MEANINGFUL_CANDIDATE_FACTORIES:
  readonly RuntimeRecommendationCandidateFactoryDefinition[] = [
  {
    factory:
      createMissingGitHubSnapshotCandidate,

    fallback:
      false,
  },

  {
    factory:
      createMissingReflectionCandidate,

    fallback:
      false,
  },

  {
    factory:
      createMissingGitHubContextCandidate,

    fallback:
      false,
  },

  {
    factory:
      createReflectionDraftWithGitHubCandidate,

    fallback:
      false,
  },

  {
    factory:
      createReflectionDraftOnlyCandidate,

    fallback:
      false,
  },

  {
    factory:
      createRecommendedFocusCandidate,

    fallback:
      false,
  },

  {
    factory:
      createAdaptiveCoachingCandidate,

    fallback:
      false,
  },

  {
    factory:
      createNextQuestionCandidate,

    fallback:
      false,
  },

  {
    factory:
      createDecisionReviewCandidate,

    fallback:
      false,
  },

  {
    factory:
      createNextInterpretationCandidate,

    fallback:
      false,
  },

  {
    factory:
      createContinuityCandidate,

    fallback:
      false,
  },
];

/* ------------------------------------------------------------------ */
/* Public Collector */
/* ------------------------------------------------------------------ */

/**
 * 현재 Runtime Context에서 유효한 Recommendation Candidate들을
 * PR-046C Scoring 구조로 변환하여 반환합니다.
 *
 * Runtime Rule Factories
 * ↓
 * Legacy Flat Candidates
 * ↓
 * PR-046C Candidate Adapter
 * ↓
 * RuntimeRecommendationCandidate[]
 *
 * 이 함수는 다음 작업을 수행하지 않습니다.
 *
 * - Base Score 계산
 * - Base Winner 선택
 * - Adaptive Modifier 계산
 * - Adaptive Winner 선택
 * - Stability 적용
 */
export function collectRuntimeRecommendationCandidates(
  params:
    RuntimeNextActionRuleParams
): RuntimeRecommendationCandidate[] {
  return collectRuntimeRecommendationCandidatesWithDiagnostics(
    params
  ).candidates;
}

/**
 * Candidate 배열과 생성 Context 및 fallback 사용 여부를 함께
 * 반환합니다.
 */
export function collectRuntimeRecommendationCandidatesWithDiagnostics(
  params:
    RuntimeNextActionRuleParams
): CollectRuntimeRecommendationCandidatesResult {
  const normalizedParams =
    normalizeRuntimeNextActionRuleParams(
      params
    );

  const context =
    createRuntimeRecommendationCandidateContext(
      normalizedParams
    );

  const meaningfulLegacyCandidates =
    collectMeaningfulLegacyCandidates(
      normalizedParams
    );

  if (
    meaningfulLegacyCandidates.length >
    0
  ) {
    const candidates =
      adaptLegacyCandidates({
        candidates:
          meaningfulLegacyCandidates,

        context,

        startingGenerationOrder:
          0,
      });

    const deduplicatedCandidates =
      deduplicateRuntimeRecommendationCandidates(
        candidates
      );

    return {
      candidates:
        deduplicatedCandidates,

      context,

      candidateCount:
        deduplicatedCandidates.length,

      meaningfulCandidateCount:
        deduplicatedCandidates.length,

      fallbackUsed:
        false,

      hasBlockingCandidate:
        deduplicatedCandidates.some(
          (candidate) =>
            candidate.isBlocking
        ),
    };
  }

  const fallbackLegacyCandidate =
    createFallbackLegacyCandidate(
      normalizedParams
    );

  const fallbackCandidate =
    adaptLegacyCandidate({
      candidate:
        fallbackLegacyCandidate,

      context,

      generationOrder:
        0,
    });

  return {
    candidates: [
      fallbackCandidate,
    ],

    context,

    candidateCount:
      1,

    meaningfulCandidateCount:
      0,

    fallbackUsed:
      true,

    hasBlockingCandidate:
      fallbackCandidate.isBlocking,
  };
}

/* ------------------------------------------------------------------ */
/* Meaningful Candidate Collection */
/* ------------------------------------------------------------------ */

function collectMeaningfulLegacyCandidates(
  params:
    RuntimeNextActionRuleParams
): LegacyRuntimeRecommendationCandidate[] {
  const candidates:
    LegacyRuntimeRecommendationCandidate[] = [];

  for (
    const definition of
    MEANINGFUL_CANDIDATE_FACTORIES
  ) {
    const candidate =
      definition.factory(
        params
      );

    if (
      candidate === null
    ) {
      continue;
    }

    candidates.push(
      candidate
    );
  }

  return candidates;
}

/* ------------------------------------------------------------------ */
/* Fallback Collection */
/* ------------------------------------------------------------------ */

/**
 * 의미 있는 Candidate가 없을 때에만 fallback을 생성합니다.
 *
 * 기존 동작:
 *
 * currentFocus 존재
 * → Current Focus fallback
 *
 * 그 외
 * → Insufficient Context
 */
function createFallbackLegacyCandidate(
  params:
    RuntimeNextActionRuleParams
): LegacyRuntimeRecommendationCandidate {
  const currentFocusFallback =
    createCurrentFocusFallbackCandidate(
      params
    );

  if (
    currentFocusFallback !== null
  ) {
    return currentFocusFallback;
  }

  return createInsufficientContextCandidate(
    params
  );
}

/* ------------------------------------------------------------------ */
/* Candidate Adapter */
/* ------------------------------------------------------------------ */

type AdaptLegacyCandidatesParams = {
  candidates:
    LegacyRuntimeRecommendationCandidate[];

  context:
    RuntimeRecommendationCandidateContext;

  startingGenerationOrder:
    number;
};

function adaptLegacyCandidates({
  candidates,
  context,
  startingGenerationOrder,
}: AdaptLegacyCandidatesParams):
  RuntimeRecommendationCandidate[] {
  return candidates.map(
    (
      candidate,
      index
    ) =>
      adaptLegacyCandidate({
        candidate,

        context,

        generationOrder:
          startingGenerationOrder +
          index,
      })
  );
}

type AdaptLegacyCandidateParams = {
  candidate:
    LegacyRuntimeRecommendationCandidate;

  context:
    RuntimeRecommendationCandidateContext;

  generationOrder:
    number;
};

/**
 * 기존 평면형 Candidate를 PR-046C Scoring Candidate로 변환합니다.
 *
 * 기존 Candidate:
 *
 * {
 *   id,
 *   kind,
 *   title,
 *   ...
 *   basePriority,
 *   isBlocking
 * }
 *
 * PR-046C Candidate:
 *
 * {
 *   id,
 *   generationOrder,
 *   rule,
 *   category,
 *   action: { ...RuntimeNextAction },
 *   basePriority,
 *   isBlocking,
 *   specificity,
 *   context
 * }
 */
function adaptLegacyCandidate({
  candidate,
  context,
  generationOrder,
}: AdaptLegacyCandidateParams):
  RuntimeRecommendationCandidate {
  return {
    id:
      normalizeCandidateId(
        candidate.id,
        generationOrder
      ),

    generationOrder:
      normalizeNonNegativeInteger(
        generationOrder
      ),

    rule:
      resolveRuntimeRecommendationCandidateRule(
        candidate
      ),

    category:
      candidate.category,

    action:
      createRuntimeNextActionFromCandidate(
        candidate
      ),

    basePriority:
      normalizeNonNegativeNumber(
        candidate.basePriority
      ),

    isBlocking:
      Boolean(
        candidate.isBlocking
      ),

    specificity:
      candidate.specificity,

    context,
  };
}

/* ------------------------------------------------------------------ */
/* RuntimeNextAction Adapter */
/* ------------------------------------------------------------------ */

function createRuntimeNextActionFromCandidate(
  candidate:
    LegacyRuntimeRecommendationCandidate
): RuntimeNextAction {
  return {
    kind:
      candidate.kind,

    title:
      normalizeRequiredText(
        candidate.title,
        "Runtime recommendation"
      ),

    description:
      normalizeRequiredText(
        candidate.description,
        "No recommendation description is available."
      ),

    reason:
      normalizeRequiredText(
        candidate.reason,
        "Runtime selected this recommendation from the current project context."
      ),

    why:
        undefined,

    evidence:
        undefined,

    target:
      candidate.target,

    confidence:
      candidate.confidence,

    source:
      candidate.source,

    sourceLabel:
      normalizeRequiredText(
        candidate.sourceLabel,
        "Runtime Recommendation"
      ),

    isActionable:
      Boolean(
        candidate.isActionable
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Rule Resolution */
/* ------------------------------------------------------------------ */

/**
 * Candidate ID를 안정적인 Rule 타입으로 변환합니다.
 *
 * title이나 description 문자열은 사용하지 않습니다.
 */
function resolveRuntimeRecommendationCandidateRule(
  candidate:
    LegacyRuntimeRecommendationCandidate
): RuntimeRecommendationCandidateRule {
  switch (
    candidate.id
  ) {
    case "missing-project":
      return "missing-project";

    case "missing-repository":
      return "missing-repository";

    case "missing-reflection":
      return "missing-reflection";

    case "missing-github-snapshot":
    case "missing-github-context":
      return "missing-github-context";

    case "reflection-draft-with-github":
      return "combined-analysis";

    case "reflection-draft-only":
      return "reflection-draft";

    case "recommended-focus-stabilization":
    case "recommended-focus-clarification":
    case "recommended-focus-review":
    case "recommended-focus-reflection":
    case "recommended-focus-general":
      return "recommended-focus";

    case "adaptive-coaching":
      return "adaptive-coaching";

    case "decision-review":
      return "decision-review";

    case "next-question":
      return "next-question";

    case "next-interpretation":
      return "next-interpretation";

    case "early-project-continuity":
      return "continuity";

    case "current-focus-fallback":
      return "current-focus";

    case "insufficient-context":
      return "fallback";

    default:
      return resolveFallbackCandidateRule(
        candidate
      );
  }
}

function resolveFallbackCandidateRule(
  candidate:
    LegacyRuntimeRecommendationCandidate
): RuntimeRecommendationCandidateRule {
  if (
    candidate.source ===
    "recommended-focus"
  ) {
    return "recommended-focus";
  }

  if (
    candidate.source ===
    "adaptive-coaching"
  ) {
    return "adaptive-coaching";
  }

  if (
    candidate.source ===
    "decision-review"
  ) {
    return "decision-review";
  }

  if (
    candidate.source ===
    "next-question"
  ) {
    return "next-question";
  }

  if (
    candidate.source ===
    "next-interpretation"
  ) {
    return "next-interpretation";
  }

  if (
    candidate.kind ===
    "analyze-reflection-with-github"
  ) {
    return "combined-analysis";
  }

  if (
    candidate.kind ===
    "write-reflection"
  ) {
    return "reflection-draft";
  }

  if (
    candidate.kind ===
    "continue-project-work"
  ) {
    return "current-focus";
  }

  return "fallback";
}

/* ------------------------------------------------------------------ */
/* Context Builder */
/* ------------------------------------------------------------------ */

function createRuntimeRecommendationCandidateContext(
  params:
    RuntimeNextActionRuleParams
): RuntimeRecommendationCandidateContext {
  return {
    /**
     * collectRuntimeRecommendationCandidates()는
     * createRuntimeNextAction()의 hasProject guard 이후 호출됩니다.
     */
    hasProject:
      true,

    hasRepository:
      params.hasRepository,

    hasReflectionDraft:
      params.hasReflectionDraft,

    hasGitHubSnapshot:
      params.hasGitHubSnapshot,

    hasCurrentFocus:
      params.currentFocus !== null,

    hasRecommendedFocus:
      params.recommendedFocus !== null,

    hasNextInterpretation:
      params.nextInterpretation !== null,

    hasAdaptiveCoaching:
      params.adaptiveCoaching !== null,

    hasDecisionReviewQuestion:
      params.decisionReviewQuestion !== null,

    hasNextQuestion:
      params.nextQuestion !== null,

    recentCommitCount:
      params.recentCommitCount,

    recentPullRequestCount:
      params.recentPullRequestCount,

    reflectionCount:
      params.reflectionCount,

    connectedEventCount:
      params.connectedEventCount,
  };
}

/* ------------------------------------------------------------------ */
/* Candidate Deduplication */
/* ------------------------------------------------------------------ */

/**
 * 같은 구조적 Recommendation이 서로 다른 Rule에서 생성된 경우
 * 우선순위가 높은 Candidate 하나만 유지합니다.
 *
 * Identity:
 *
 * kind + target + source
 *
 * title은 문구 수정만으로 Candidate identity가 달라지는 것을
 * 방지하기 위해 포함하지 않습니다.
 */
export function deduplicateRuntimeRecommendationCandidates(
  candidates:
    RuntimeRecommendationCandidate[]
): RuntimeRecommendationCandidate[] {
  const candidatesByIdentity =
    new Map<
      string,
      RuntimeRecommendationCandidate
    >();

  for (
    const candidate of
    candidates
  ) {
    const identity =
      createRuntimeRecommendationCandidateIdentityKey(
        candidate
      );

    const existingCandidate =
      candidatesByIdentity.get(
        identity
      );

    if (
      existingCandidate === undefined
    ) {
      candidatesByIdentity.set(
        identity,
        candidate
      );

      continue;
    }

    const preferredCandidate =
      selectPreferredGeneratedCandidate(
        existingCandidate,
        candidate
      );

    candidatesByIdentity.set(
      identity,
      preferredCandidate
    );
  }

  return Array.from(
    candidatesByIdentity.values()
  ).sort(
    compareCandidateGenerationOrder
  );
}

export function createRuntimeRecommendationCandidateIdentityKey(
  candidate:
    Pick<
      RuntimeRecommendationCandidate,
      "action"
    >
): string {
  return [
    "runtime-recommendation-candidate-v1",

    normalizeKeyPart(
      candidate.action.kind
    ),

    normalizeKeyPart(
      candidate.action.target
    ),

    normalizeKeyPart(
      candidate.action.source
    ),
  ].join("::");
}

function selectPreferredGeneratedCandidate(
  left:
    RuntimeRecommendationCandidate,
  right:
    RuntimeRecommendationCandidate
): RuntimeRecommendationCandidate {
  if (
    left.isBlocking !==
    right.isBlocking
  ) {
    return left.isBlocking
      ? left
      : right;
  }

  if (
    left.basePriority !==
    right.basePriority
  ) {
    return left.basePriority >
      right.basePriority
      ? left
      : right;
  }

  if (
    left.generationOrder !==
    right.generationOrder
  ) {
    return left.generationOrder <
      right.generationOrder
      ? left
      : right;
  }

  return left.id.localeCompare(
    right.id
  ) <= 0
    ? left
    : right;
}

function compareCandidateGenerationOrder(
  left:
    RuntimeRecommendationCandidate,
  right:
    RuntimeRecommendationCandidate
): number {
  if (
    left.generationOrder !==
    right.generationOrder
  ) {
    return (
      left.generationOrder -
      right.generationOrder
    );
  }

  return left.id.localeCompare(
    right.id
  );
}

/* ------------------------------------------------------------------ */
/* Input Normalization */
/* ------------------------------------------------------------------ */

function normalizeRuntimeNextActionRuleParams(
  params:
    RuntimeNextActionRuleParams
): RuntimeNextActionRuleParams {
  return {
    hasRepository:
      Boolean(
        params.hasRepository
      ),

    hasReflectionDraft:
      Boolean(
        params.hasReflectionDraft
      ),

    hasGitHubSnapshot:
      Boolean(
        params.hasGitHubSnapshot
      ),

    currentFocus:
      normalizeOptionalText(
        params.currentFocus
      ),

    recommendedFocus:
      normalizeOptionalText(
        params.recommendedFocus
      ),

    nextInterpretation:
      normalizeOptionalText(
        params.nextInterpretation
      ),

    adaptiveCoaching:
      normalizeOptionalText(
        params.adaptiveCoaching
      ),

    decisionReviewQuestion:
      normalizeOptionalText(
        params.decisionReviewQuestion
      ),

    nextQuestion:
      normalizeOptionalText(
        params.nextQuestion
      ),

    recentCommitCount:
      normalizeNonNegativeInteger(
        params.recentCommitCount
      ),

    recentPullRequestCount:
      normalizeNonNegativeInteger(
        params.recentPullRequestCount
      ),

    reflectionCount:
      normalizeNonNegativeInteger(
        params.reflectionCount
      ),

    connectedEventCount:
      normalizeNonNegativeInteger(
        params.connectedEventCount
      ),
  };
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

function normalizeOptionalText(
  value:
    string | null | undefined
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const normalized =
    value
      .trim()
      .replace(
        /\s+/g,
        " "
      );

  return normalized.length > 0
    ? normalized
    : null;
}

function normalizeRequiredText(
  value:
    string | null | undefined,
  fallback:
    string
): string {
  return (
    normalizeOptionalText(
      value
    ) ??
    fallback
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

function normalizeNonNegativeNumber(
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
    value
  );
}

function normalizeKeyPart(
  value:
    string | null | undefined
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "none";
  }

  const normalized =
    value
      .trim()
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      );

  return normalized.length > 0
    ? normalized
    : "none";
}